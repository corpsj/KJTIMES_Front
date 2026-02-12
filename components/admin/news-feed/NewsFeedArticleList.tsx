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
} from "@mantine/core";
import type { NfArticle } from "@/hooks/useNewsFeed";

interface NewsFeedArticleListProps {
  articles: NfArticle[];
  loading: boolean;
  error: string;
  importingIds: Set<string>;
  onImport: (art: NfArticle) => void;
  page: number;
  totalArticles: number;
  totalPages: number;
  limit: number;
  onPageChange: (p: number) => void;
}

export default function NewsFeedArticleList({
  articles,
  loading,
  error,
  importingIds,
  onImport,
  page,
  totalArticles,
  totalPages,
  limit,
  onPageChange,
}: NewsFeedArticleListProps) {
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
            기사를 불러오는 중…
          </Text>
        </Stack>
      </Center>
    );
  }

  if (articles.length === 0) {
    return (
      <Paper withBorder radius="md" p="xl">
        <Text c="dimmed" ta="center">
          표시할 기사가 없습니다.
        </Text>
      </Paper>
    );
  }

  return (
    <>
      <Stack gap="sm">
        {articles.map((art) => (
          <Paper key={art.id} withBorder radius="md" p="md">
            <Group
              justify="space-between"
              align="flex-start"
              wrap="nowrap"
            >
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Text size="sm" fw={600} mb={4}>
                  {art.title}
                </Text>
                {art.summary && (
                  <Text size="xs" c="dimmed" lineClamp={2} mb={8}>
                    {art.summary}
                  </Text>
                )}
                <Group gap="xs">
                  {art.category && (
                    <Badge variant="light" color="gray" size="xs">
                      {art.category}
                    </Badge>
                  )}
                  {art.source && (
                    <Badge variant="light" color="blue" size="xs">
                      {art.source}
                    </Badge>
                  )}
                  {art.published_at && (
                    <Text size="xs" c="dimmed">
                      {new Date(art.published_at).toLocaleDateString("ko-KR")}
                    </Text>
                  )}
                </Group>
              </Box>
              <Button
                variant="filled"
                color="red"
                size="xs"
                loading={importingIds.has(art.id)}
                onClick={() => onImport(art)}
              >
                가져오기
              </Button>
            </Group>
          </Paper>
        ))}
      </Stack>

      {/* Pagination */}
      {totalArticles > limit && (
        <Center>
          <Group gap="md">
            <Button
              variant="default"
              size="xs"
              disabled={page === 0}
              onClick={() => onPageChange(page - 1)}
            >
              ← 이전
            </Button>
            <Text size="sm" fw={600}>
              {page + 1} / {totalPages}
            </Text>
            <Button
              variant="default"
              size="xs"
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange(page + 1)}
            >
              다음 →
            </Button>
          </Group>
        </Center>
      )}
    </>
  );
}
