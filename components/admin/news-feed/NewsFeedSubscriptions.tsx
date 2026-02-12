"use client";

import {
  Badge,
  Box,
  Button,
  Center,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import type { NfSubscription } from "@/hooks/useNewsFeed";
import { cronToKorean } from "@/hooks/useNewsFeed";

interface NewsFeedSubscriptionsProps {
  subscriptions: NfSubscription[];
  loading: boolean;
  error: string;
  onAdd: () => void;
  onEdit: (sub: NfSubscription) => void;
  onToggleActive: (sub: NfSubscription) => void;
  onDelete: (sub: NfSubscription) => void;
}

export default function NewsFeedSubscriptions({
  subscriptions,
  loading,
  error,
  onAdd,
  onEdit,
  onToggleActive,
  onDelete,
}: NewsFeedSubscriptionsProps) {
  return (
    <>
      <Group justify="space-between">
        <Title order={5} c="dimmed" tt="uppercase" lts={2}>
          구독 목록
        </Title>
        <Button color="dark" size="xs" onClick={onAdd}>
          + 구독 추가
        </Button>
      </Group>

      {error && (
        <Paper withBorder radius="md" p="xl">
          <Text c="red">{error}</Text>
        </Paper>
      )}

      {loading ? (
        <Center py={64}>
          <Stack align="center" gap="sm">
            <Loader size="sm" />
            <Text size="sm" c="dimmed">
              구독 목록을 불러오는 중…
            </Text>
          </Stack>
        </Center>
      ) : subscriptions.length === 0 && !error ? (
        <Paper withBorder radius="md" p="xl">
          <Text c="dimmed" ta="center">
            등록된 구독이 없습니다. 구독을 추가해 보세요.
          </Text>
        </Paper>
      ) : (
        <Stack gap="sm">
          {subscriptions.map((sub) => (
            <Paper key={sub.id} withBorder radius="md" p="md">
              <Group
                justify="space-between"
                align="flex-start"
                wrap="nowrap"
              >
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Group gap="xs" mb={4}>
                    <Text size="sm" fw={600}>
                      {sub.name}
                    </Text>
                    <Badge
                      variant="light"
                      color={sub.is_active ? "green" : "gray"}
                      size="xs"
                    >
                      {sub.is_active ? "활성" : "비활성"}
                    </Badge>
                  </Group>
                  <Text size="xs" c="dimmed">
                    {sub.filter_regions?.length
                      ? `지역: ${sub.filter_regions.join(", ")}`
                      : ""}
                    {sub.filter_regions?.length &&
                    sub.filter_categories?.length
                      ? " · "
                      : ""}
                    {sub.filter_categories?.length
                      ? `카테고리: ${sub.filter_categories.join(", ")}`
                      : ""}
                  </Text>
                  <Text size="xs" c="dimmed">
                    스케줄: {cronToKorean(sub.schedule_cron || "")}
                    {sub.max_articles
                      ? ` · 최대 ${sub.max_articles}건`
                      : ""}
                  </Text>
                </Box>
                <Group gap="xs">
                  <Button
                    variant="default"
                    size="xs"
                    onClick={() => onToggleActive(sub)}
                  >
                    {sub.is_active ? "비활성화" : "활성화"}
                  </Button>
                  <Button
                    variant="default"
                    size="xs"
                    onClick={() => onEdit(sub)}
                  >
                    수정
                  </Button>
                  <Button
                    variant="default"
                    size="xs"
                    color="red"
                    onClick={() => onDelete(sub)}
                  >
                    삭제
                  </Button>
                </Group>
              </Group>
            </Paper>
          ))}
        </Stack>
      )}
    </>
  );
}
