"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Stack,
  Paper,
  Group,
  Title,
  Text,
  Button,
  Badge,
  Table,
  Box,
  Loader,
} from "@mantine/core";
import {
  IconMail,
  IconMailOpened,
  IconPaperclip,
  IconRefresh,
  IconPencil,
} from "@tabler/icons-react";

interface MailMessage {
  id: string;
  uid: number;
  subject: string;
  from: { name?: string; address?: string };
  date: string;
  seen: boolean;
  hasAttachments: boolean;
}

export default function MailPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<MailMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mail?limit=50&offset=0");
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
        setTotal(data.total);
      } else {
        setError(data.error || "메일을 불러올 수 없습니다");
      }
    } catch {
      setError("서버 연결 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMails();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    });
  };

  const formatSender = (from: { name?: string; address?: string }) => {
    return from.name || from.address || "알 수 없음";
  };

  return (
    <Stack gap="lg" maw={1200} mx="auto">
      {/* 헤더 */}
      <Group justify="space-between" align="center">
        <Group gap="sm">
          <Title order={3} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <IconMail size={24} />
            제보함
          </Title>
          <Badge variant="filled" color="blue" size="sm">{total}개</Badge>
        </Group>
        <Group gap="xs">
          <Button
            variant="default"
            leftSection={<IconRefresh size={18} className={loading ? "spin" : ""} />}
            onClick={fetchMails}
            disabled={loading}
          >
            새로고침
          </Button>
          <Button
            leftSection={<IconPencil size={18} />}
            onClick={() => router.push("/admin/mail/compose")}
          >
            메일 쓰기
          </Button>
        </Group>
      </Group>

      {/* 메일 목록 */}
      <Paper radius="md" withBorder style={{ overflow: "hidden" }}>
        {loading ? (
          <Box py={64} ta="center">
            <Loader size="sm" mx="auto" />
            <Text c="dimmed" mt="sm">메일 불러오는 중...</Text>
          </Box>
        ) : error ? (
          <Box py={64} ta="center">
            <Text c="dimmed">{error}</Text>
            <Button variant="default" mt="sm" onClick={fetchMails}>
              다시 시도
            </Button>
          </Box>
        ) : messages.length === 0 ? (
          <Box py={64} ta="center">
            <IconMail size={48} stroke={1} style={{ color: "var(--mantine-color-gray-5)" }} />
            <Text c="dimmed" mt="sm">받은 메일이 없습니다</Text>
          </Box>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: 40 }}></Table.Th>
                <Table.Th style={{ width: 200 }}>보낸 사람</Table.Th>
                <Table.Th>제목</Table.Th>
                <Table.Th style={{ width: 100 }}>날짜</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {messages.map((msg) => (
                <Table.Tr
                  key={msg.id}
                  style={{
                    cursor: "pointer",
                    background: !msg.seen ? "var(--mantine-color-blue-0)" : undefined,
                  }}
                  onClick={() => router.push(`/admin/mail/${msg.uid}`)}
                >
                  <Table.Td>
                    {msg.seen ? (
                      <IconMailOpened size={18} style={{ color: "var(--mantine-color-gray-5)" }} />
                    ) : (
                      <IconMail size={18} style={{ color: "var(--mantine-color-blue-6)" }} />
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={!msg.seen ? 600 : 400}>
                      {formatSender(msg.from)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={8} wrap="nowrap">
                      <Text size="sm" fw={!msg.seen ? 600 : 400} lineClamp={1}>
                        {msg.subject}
                      </Text>
                      {msg.hasAttachments && (
                        <IconPaperclip size={14} style={{ color: "var(--mantine-color-gray-5)", flexShrink: 0 }} />
                      )}
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" c="dimmed">{formatDate(msg.date)}</Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 0.8s linear infinite;
        }
      `}</style>
    </Stack>
  );
}
