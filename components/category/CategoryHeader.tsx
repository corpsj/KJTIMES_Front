"use client";

import { Breadcrumbs, Anchor, Title, Text, Stack, Badge, Group } from "@mantine/core";
import Link from "next/link";

interface CategoryHeaderProps {
  categoryName: string;
  categorySlug: string;
  articleCount: number;
  description?: string | null;
}

export function CategoryHeader({
  categoryName,
  categorySlug,
  articleCount,
  description,
}: CategoryHeaderProps) {
  return (
    <Stack gap="md">
      <Breadcrumbs separator="›">
        <Anchor component={Link} href="/" c="dimmed">
          홈
        </Anchor>
        <Text c="dimmed">{categoryName}</Text>
      </Breadcrumbs>

      <Group gap="sm" align="center">
        <Title order={1} size="h1">
          {categoryName}
        </Title>
        <Badge variant="light" color="blue" size="lg">
          {articleCount}
        </Badge>
      </Group>

      {description && (
        <Text c="dimmed" size="md">
          {description}
        </Text>
      )}
    </Stack>
  );
}
