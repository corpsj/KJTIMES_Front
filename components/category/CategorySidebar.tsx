"use client";

import { Stack, Title, Paper, NavLink } from "@mantine/core";
import Link from "next/link";
import { Article } from "@/types";
import { ArticleCard } from "@/components/shared/ArticleCard";

interface CategorySidebarProps {
  relatedCategories: Array<{ label: string; href: string }>;
  popularArticles: Article[];
}

export function CategorySidebar({
  relatedCategories,
  popularArticles,
}: CategorySidebarProps) {
  // Hide sidebar if no content
  if (relatedCategories.length === 0 && popularArticles.length === 0) {
    return null;
  }

  return (
    <Stack gap="xl">
      {/* Related Categories */}
      {relatedCategories.length > 0 && (
        <Paper p="md" withBorder>
          <Title order={4} size="h5" mb="md">
            관련 카테고리
          </Title>
          <Stack gap="xs">
            {relatedCategories.map((category) => (
              <NavLink
                key={category.href}
                component={Link}
                href={category.href}
                label={category.label}
                variant="subtle"
              />
            ))}
          </Stack>
        </Paper>
      )}

      {/* Popular Articles */}
      {popularArticles.length > 0 && (
        <Paper p="md" withBorder>
          <Title order={4} size="h5" mb="md">
            인기 기사
          </Title>
          <Stack gap="md">
            {popularArticles.map((article, index) => (
              <ArticleCard
                key={article.id}
                article={article}
                variant="list"
                rank={index + 1}
              />
            ))}
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
