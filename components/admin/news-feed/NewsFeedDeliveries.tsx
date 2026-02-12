"use client";

import {
  Badge,
  Center,
  Loader,
  Paper,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import type { NfDelivery } from "@/hooks/useNewsFeed";

interface NewsFeedDeliveriesProps {
  deliveries: NfDelivery[];
  loading: boolean;
  error: string;
}

export default function NewsFeedDeliveries({
  deliveries,
  loading,
  error,
}: NewsFeedDeliveriesProps) {
  if (error) {
    return (
      <Paper withBorder radius="md" p="xl">
        <Text c="red">{error}</Text>
      </Paper>
    );
  }

  if (loading) {
    return (
      <Center py={64}>
        <Stack align="center" gap="sm">
          <Loader size="sm" />
          <Text size="sm" c="dimmed">
            전송 이력을 불러오는 중…
          </Text>
        </Stack>
      </Center>
    );
  }

  if (deliveries.length === 0) {
    return (
      <Paper withBorder radius="md" p="xl">
        <Text c="dimmed" ta="center">
          전송 이력이 없습니다.
        </Text>
      </Paper>
    );
  }

  return (
    <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>날짜</Table.Th>
            <Table.Th>구독명</Table.Th>
            <Table.Th>전송 기사 수</Table.Th>
            <Table.Th>상태</Table.Th>
            <Table.Th>에러 메시지</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {deliveries.map((d) => (
            <Table.Tr key={d.id}>
              <Table.Td>
                {d.delivered_at
                  ? new Date(d.delivered_at).toLocaleString("ko-KR")
                  : "—"}
              </Table.Td>
              <Table.Td>
                {d.subscription_id || "—"}
              </Table.Td>
              <Table.Td>{d.article_count ?? "—"}</Table.Td>
              <Table.Td>
                <Badge
                  variant="light"
                  color={
                    d.status === "success"
                      ? "green"
                      : d.status === "failed"
                        ? "red"
                        : "gray"
                  }
                  size="xs"
                >
                  {d.status === "success"
                    ? "성공"
                    : d.status === "failed"
                      ? "실패"
                      : d.status || "—"}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Text size="xs" c="dimmed">
                  {d.error_message || "—"}
                </Text>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Paper>
  );
}
