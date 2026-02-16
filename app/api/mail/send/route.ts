import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/utils/mail";
import { requireAuth } from "@/utils/supabase/auth-check";
import { createRateLimiter } from "@/utils/rate-limit";

const limiter = createRateLimiter(5, 60_000);

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  const rateCheck = limiter(ip);
  if (!rateCheck.success) {
    return NextResponse.json(
      { success: false, error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429 }
    );
  }

  try {
    const { to, subject, text, html, replyTo } = await request.json();
    const stripCRLF = (s: string | undefined) => s?.replace(/[\r\n]/g, '') ?? undefined;
    const safeTo = stripCRLF(to);
    const safeSubject = stripCRLF(subject);
    const safeReplyTo = stripCRLF(replyTo);
    if (!safeTo || !safeSubject) {
      return NextResponse.json({ success: false, error: "받는 사람과 제목은 필수입니다" }, { status: 400 });
    }
    if (!text && !html) {
      return NextResponse.json({ success: false, error: "본문 내용이 필요합니다" }, { status: 400 });
    }
    const result = await sendMail({ to: safeTo, subject: safeSubject, text, html, replyTo: safeReplyTo });
    if (result.success) {
      return NextResponse.json({ success: true, messageId: result.messageId });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error("메일 발송 실패:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "메일 발송 실패" }, { status: 500 });
  }
}
