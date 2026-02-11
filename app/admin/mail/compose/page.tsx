"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Stack,
  Paper,
  Group,
  Button,
  TextInput,
  Textarea,
  Alert,
  Text,
} from "@mantine/core";
import { IconArrowLeft, IconSend } from "@tabler/icons-react";

function ComposeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 답장 모드
    const replyTo = searchParams.get("to");
    const replySubject = searchParams.get("subject");

    if (replyTo) setTo(replyTo);
    if (replySubject) {
      setSubject(
        replySubject.startsWith("Re:") ? replySubject : `Re: ${replySubject}`
      );
    }
  }, [searchParams]);

  const handleSend = async () => {
    if (!to.trim()) {
      setError("받는 사람을 입력해주세요");
      return;
    }
    if (!subject.trim()) {
      setError("제목을 입력해주세요");
      return;
    }
    if (!body.trim()) {
      setError("본문을 입력해주세요");
      return;
    }

    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/mail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: to.trim(),
          subject: subject.trim(),
          text: body,
          html: `<div style="white-space: pre-wrap;">${body.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>`,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("메일이 발송되었습니다!");
        router.push("/admin/mail");
      } else {
        setError(data.error || "발송 실패");
      }
    } catch {
      setError("서버 연결 실패");
    } finally {
      setSending(false);
    }
  };

  return (
    <Stack gap="lg" maw={800} mx="auto">
      {/* 헤더 */}
      <Group justify="space-between" align="center">
        <Button
          variant="default"
          leftSection={<IconArrowLeft size={18} />}
          onClick={() => router.push("/admin/mail")}
        >
          취소
        </Button>
        <Button
          leftSection={<IconSend size={18} />}
          onClick={handleSend}
          disabled={sending}
        >
          {sending ? "발송 중..." : "보내기"}
        </Button>
      </Group>

      {/* 에러 메시지 */}
      {error && (
        <Alert color="red" withCloseButton onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 작성 폼 */}
      <Paper p="lg" radius="md" withBorder>
        <Stack gap="md">
          <TextInput
            label="받는 사람"
            type="email"
            value={to}
            onChange={(e) => setTo(e.currentTarget.value)}
            placeholder="email@example.com"
          />
          <TextInput
            label="제목"
            value={subject}
            onChange={(e) => setSubject(e.currentTarget.value)}
            placeholder="메일 제목"
          />
          <Textarea
            label="본문"
            value={body}
            onChange={(e) => setBody(e.currentTarget.value)}
            placeholder="메일 내용을 입력하세요..."
            minRows={12}
            autosize
          />
        </Stack>
      </Paper>
    </Stack>
  );
}

export default function ComposePage() {
  return (
    <Suspense
      fallback={
        <Text ta="center" py="lg" c="dimmed">로딩 중...</Text>
      }
    >
      <ComposeForm />
    </Suspense>
  );
}
