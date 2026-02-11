"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  Stack,
  Paper,
  Group,
  Title,
  Text,
  Button,
  Box,
  Loader,
  Divider,
  Avatar,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconArrowBackUp,
  IconTrash,
  IconPaperclip,
  IconUser,
} from "@tabler/icons-react";

interface MailDetail {
  id: string;
  uid: number;
  subject: string;
  from: { name?: string; address?: string };
  to: { name?: string; address?: string }[];
  date: string;
  html?: string;
  text?: string;
  attachments: { filename: string; contentType: string; size: number }[];
}

export default function MailDetailPage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const { uid } = use(params);
  const router = useRouter();
  const [message, setMessage] = useState<MailDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/mail/${uid}`);
        const data = await res.json();
        if (data.success) {
          setMessage(data.message);
        } else {
          setError(data.error || "메일을 불러올 수 없습니다");
        }
      } catch {
        setError("서버 연결 실패");
      } finally {
        setLoading(false);
      }
    };
    fetchMail();
  }, [uid]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <Box py={64} ta="center" maw={900} mx="auto">
        <Loader size="sm" mx="auto" />
        <Text c="dimmed" mt="sm">메일 불러오는 중...</Text>
      </Box>
    );
  }

  if (error || !message) {
    return (
      <Box py={64} ta="center" maw={900} mx="auto">
        <Text c="dimmed">{error || "메일을 찾을 수 없습니다"}</Text>
        <Button
          variant="default"
          mt="sm"
          onClick={() => router.push("/admin/mail")}
        >
          목록으로
        </Button>
      </Box>
    );
  }

  return (
    <Stack gap="lg" maw={900} mx="auto">
      {/* 헤더 */}
      <Group justify="space-between" align="center">
        <Button
          variant="default"
          leftSection={<IconArrowLeft size={18} />}
          onClick={() => router.push("/admin/mail")}
        >
          목록으로
        </Button>
        <Group gap="xs">
          <Button
            leftSection={<IconArrowBackUp size={18} />}
            onClick={() =>
              router.push(
                `/admin/mail/compose?reply=${uid}&to=${encodeURIComponent(message.from.address || "")}&subject=${encodeURIComponent(message.subject)}`
              )
            }
          >
            답장
          </Button>
          <Button variant="default" color="red" leftSection={<IconTrash size={18} />}>
            삭제
          </Button>
        </Group>
      </Group>

      {/* 메일 내용 */}
      <Paper radius="md" withBorder style={{ overflow: "hidden" }}>
        {/* Header */}
        <Box p="lg" style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}>
          <Title order={3} mb="md" lh={1.4}>{message.subject}</Title>
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <Avatar radius="xl" size={40} color="gray">
                <IconUser size={20} />
              </Avatar>
              <Box>
                <Text size="sm" fw={500}>
                  {message.from.name || message.from.address}
                </Text>
                {message.from.name && (
                  <Text size="xs" c="dimmed">&lt;{message.from.address}&gt;</Text>
                )}
              </Box>
            </Group>
            <Text size="xs" c="dimmed">{formatDate(message.date)}</Text>
          </Group>
        </Box>

        {/* 첨부파일 */}
        {message.attachments.length > 0 && (
          <Box
            p="md"
            style={{
              background: "var(--mantine-color-gray-0)",
              borderBottom: "1px solid var(--mantine-color-gray-3)",
            }}
          >
            <Group gap="xs" mb="xs">
              <IconPaperclip size={16} style={{ color: "var(--mantine-color-gray-6)" }} />
              <Text size="xs" c="dimmed">첨부파일 {message.attachments.length}개</Text>
            </Group>
            <Group gap="xs" wrap="wrap">
              {message.attachments.map((att, i) => (
                <Paper key={i} p="xs" radius="sm" withBorder>
                  <Group gap="xs" wrap="nowrap">
                    <Text size="xs">{att.filename}</Text>
                    <Text size="xs" c="dimmed">{formatFileSize(att.size)}</Text>
                  </Group>
                </Paper>
              ))}
            </Group>
          </Box>
        )}

        {/* 본문 */}
        <Box p="lg" mih={200}>
          {message.html ? (
            <div
              style={{ lineHeight: 1.6 }}
              dangerouslySetInnerHTML={{ __html: message.html }}
            />
          ) : (
            <Text component="pre" style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", margin: 0, lineHeight: 1.6 }}>
              {message.text}
            </Text>
          )}
        </Box>
      </Paper>
    </Stack>
  );
}
