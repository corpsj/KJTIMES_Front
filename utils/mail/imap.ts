import { ImapFlow } from "imapflow";
import { mailConfig } from "./config";

export interface MailMessage {
  id: string;
  uid: number;
  subject: string;
  from: { name?: string; address?: string };
  to: { name?: string; address?: string }[];
  date: Date;
  preview: string;
  seen: boolean;
  hasAttachments: boolean;
}

export interface MailDetail extends MailMessage {
  html?: string;
  text?: string;
  attachments: {
    filename: string;
    contentType: string;
    size: number;
  }[];
}

// IMAP 클라이언트 생성
function createClient() {
  return new ImapFlow({
    host: mailConfig.imap.host,
    port: mailConfig.imap.port,
    secure: mailConfig.imap.secure,
    auth: mailConfig.imap.auth,
    logger: false,
  });
}

// 받은편지함 목록 조회
export async function fetchInbox(
  limit: number = 50,
  offset: number = 0
): Promise<{ messages: MailMessage[]; total: number }> {
  const client = createClient();

  try {
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");

    try {
      const mailbox = client.mailbox;
      const total = (mailbox && typeof mailbox === 'object' && 'exists' in mailbox) ? mailbox.exists : 0;

      if (total === 0) {
        return { messages: [], total: 0 };
      }

      // 최신 메일부터 가져오기
      const start = Math.max(1, total - offset - limit + 1);
      const end = Math.max(1, total - offset);
      const range = `${start}:${end}`;

      const messages: MailMessage[] = [];

      for await (const msg of client.fetch(range, {
        uid: true,
        envelope: true,
        flags: true,
        bodyStructure: true,
      })) {
        const envelope: any = msg.envelope || {};
        messages.push({
          id: msg.uid.toString(),
          uid: msg.uid,
          subject: envelope.subject || "(제목 없음)",
          from: {
            name: envelope.from?.[0]?.name,
            address: envelope.from?.[0]?.address,
          },
          to:
            envelope.to?.map((t: any) => ({
              name: t.name,
              address: t.address,
            })) || [],
          date: envelope.date || new Date(),
          preview: "",
          seen: msg.flags?.has("\\Seen") || false,
          hasAttachments: hasAttachments(msg.bodyStructure),
        });
      }

      // 최신순 정렬
      messages.reverse();

      return { messages, total };
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }
}

// 메일 상세 조회
export async function fetchMessage(uid: number): Promise<MailDetail | null> {
  const client = createClient();

  try {
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");

    try {
      const msg = await client.fetchOne(uid.toString(), {
        uid: true,
        envelope: true,
        flags: true,
        bodyStructure: true,
        source: true,
      });

      if (!msg) return null;

      const envelope: any = msg.envelope || {};

      // 본문 파싱 (간단한 버전)
      let html = "";
      let text = "";

      // source에서 본문 추출 시도
      if (msg.source) {
        const source = msg.source.toString();
        // HTML 본문 추출
        const htmlMatch = source.match(
          /Content-Type: text\/html[\s\S]*?\r\n\r\n([\s\S]*?)(?=\r\n--|\r\n\r\n--)/i
        );
        if (htmlMatch) {
          html = htmlMatch[1];
        }
        // 텍스트 본문 추출
        const textMatch = source.match(
          /Content-Type: text\/plain[\s\S]*?\r\n\r\n([\s\S]*?)(?=\r\n--|\r\n\r\n--)/i
        );
        if (textMatch) {
          text = textMatch[1];
        }
        // 단순 텍스트 메일
        if (!html && !text) {
          const bodyStart = source.indexOf("\r\n\r\n");
          if (bodyStart !== -1) {
            text = source.slice(bodyStart + 4);
          }
        }
      }

      // 읽음 표시
      await client.messageFlagsAdd(uid.toString(), ["\\Seen"], { uid: true });

      return {
        id: msg.uid.toString(),
        uid: msg.uid,
        subject: envelope.subject || "(제목 없음)",
        from: {
          name: envelope.from?.[0]?.name,
          address: envelope.from?.[0]?.address,
        },
        to:
          envelope.to?.map((t: any) => ({
            name: t.name,
            address: t.address,
          })) || [],
        date: envelope.date || new Date(),
        preview: text.slice(0, 200),
        seen: true,
        hasAttachments: hasAttachments(msg.bodyStructure),
        html,
        text,
        attachments: extractAttachments(msg.bodyStructure),
      };
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }
}

// 첨부파일 여부 확인
function hasAttachments(structure: unknown): boolean {
  if (!structure) return false;
  const s = structure as Record<string, unknown>;
  if (s.disposition === "attachment") return true;
  if (Array.isArray(s.childNodes)) {
    return s.childNodes.some((child) => hasAttachments(child));
  }
  return false;
}

// 첨부파일 목록 추출
function extractAttachments(
  structure: unknown
): { filename: string; contentType: string; size: number }[] {
  const attachments: { filename: string; contentType: string; size: number }[] =
    [];

  function traverse(node: Record<string, unknown>) {
    if (node.disposition === "attachment") {
      const params = node.dispositionParameters as Record<string, string>;
      attachments.push({
        filename: params?.filename || "unknown",
        contentType: `${node.type}/${node.subtype}`,
        size: (node.size as number) || 0,
      });
    }
    if (Array.isArray(node.childNodes)) {
      node.childNodes.forEach((child) =>
        traverse(child as Record<string, unknown>)
      );
    }
  }

  if (structure) {
    traverse(structure as Record<string, unknown>);
  }

  return attachments;
}
