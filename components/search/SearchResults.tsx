"use client";

import { Stack, Grid, GridCol, Highlight, Text, Group, Badge, Anchor } from "@mantine/core";
import { IconClock, IconEye } from "@tabler/icons-react";
import { Article } from "@/types";
import Image from "next/image";
import Link from "next/link";

interface SearchResultsProps {
  results: Article[];
  query: string;
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function SearchResultCard({ article, query }: { article: Article; query: string }) {
  const category = Array.isArray(article.categories)
    ? article.categories[0]
    : article.categories;

  return (
    <Anchor
      component={Link}
      href={`/article/${article.id}`}
      underline="never"
      c="inherit"
      style={{ display: "block" }}
    >
      <Grid gutter="md" align="flex-start">
        {article.thumbnail_url && (
          <GridCol span={{ base: 12, xs: 4, sm: 3 }}>
            <div style={{ position: "relative", width: "100%", paddingBottom: "66.67%", overflow: "hidden", borderRadius: 8 }}>
              <Image
                src={article.thumbnail_url}
                alt={article.title || ""}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                style={{ objectFit: "cover" }}
              />
            </div>
          </GridCol>
        )}

        <GridCol span={{ base: 12, xs: article.thumbnail_url ? 8 : 12, sm: article.thumbnail_url ? 9 : 12 }}>
          <Stack gap="xs">
            {category && (
              <Badge variant="light" size="sm" color="blue">
                {category.name}
              </Badge>
            )}

            <Highlight
              highlight={query}
              component="h3"
              fw={600}
              size="lg"
              lh={1.4}
              style={{
                margin: 0,
                color: "var(--mantine-color-newsHeadline-9)",
              }}
              highlightStyles={{
                backgroundColor: "var(--mantine-color-yellow-2)",
                color: "var(--mantine-color-newsHeadline-9)",
                fontWeight: 700,
              }}
            >
              {article.title || ""}
            </Highlight>

            {(article.summary || article.excerpt) && (
              <Highlight
                highlight={query}
                component="p"
                size="sm"
                c="dimmed"
                lh={1.6}
                lineClamp={2}
                style={{ margin: 0 }}
                highlightStyles={{
                  backgroundColor: "var(--mantine-color-yellow-2)",
                  color: "var(--mantine-color-dark-7)",
                  fontWeight: 600,
                }}
              >
                {article.summary || article.excerpt || ""}
              </Highlight>
            )}

            <Group gap="md" c="dimmed">
              <Group gap={4}>
                <IconClock size={14} />
                <Text size="xs">{formatDate(article.published_at || article.created_at)}</Text>
              </Group>
              {article.views !== undefined && article.views !== null && article.views > 0 && (
                <Group gap={4}>
                  <IconEye size={14} />
                  <Text size="xs">{article.views.toLocaleString()}</Text>
                </Group>
              )}
            </Group>
          </Stack>
        </GridCol>
      </Grid>
    </Anchor>
  );
}

export function SearchResults({ results, query }: SearchResultsProps) {
  return (
    <Stack gap="lg">
      {results.map((article) => (
        <SearchResultCard key={article.id} article={article} query={query} />
      ))}
    </Stack>
  );
}
