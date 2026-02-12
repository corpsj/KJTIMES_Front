"use client";

import { Paper, Stack, Title, Text, List, ThemeIcon, Group } from "@mantine/core";
import { IconSearch, IconBulb } from "@tabler/icons-react";

interface EmptyStateProps {
  query: string;
}

export function EmptyState({ query }: EmptyStateProps) {
  return (
    <Paper withBorder p="xl" radius="md">
      <Stack align="center" gap="md">
        <ThemeIcon size={60} radius="xl" variant="light" color="gray">
          <IconSearch size={30} />
        </ThemeIcon>

        <Stack gap="xs" align="center">
          <Title order={3} size="h4">
            검색 결과가 없습니다
          </Title>
          <Text c="dimmed" ta="center">
            &quot;{query}&quot;에 대한 검색 결과를 찾을 수 없습니다.
          </Text>
        </Stack>

        <Stack gap="sm" w="100%" maw={500}>
          <Group gap="xs">
            <ThemeIcon size="sm" radius="xl" variant="light" color="blue">
              <IconBulb size={14} />
            </ThemeIcon>
            <Text size="sm" fw={500}>
              검색 팁
            </Text>
          </Group>

          <List size="sm" spacing="xs" c="dimmed">
            <List.Item>검색어의 철자가 정확한지 확인해주세요</List.Item>
            <List.Item>다른 검색어나 유사한 단어를 사용해보세요</List.Item>
            <List.Item>더 일반적인 검색어로 다시 검색해보세요</List.Item>
            <List.Item>필터를 초기화하고 다시 시도해보세요</List.Item>
          </List>
        </Stack>
      </Stack>
    </Paper>
  );
}
