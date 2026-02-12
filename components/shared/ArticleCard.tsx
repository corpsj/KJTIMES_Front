"use client";

import { Stack, Group, Text, Box, Title } from "@mantine/core";
import Link from "next/link";
import Image from "next/image";
import { Article } from "@/types";

export interface ArticleCardProps {
  article: Article;
  variant: "featured" | "compact" | "list" | "headline";
  showThumbnail?: boolean;
  showExcerpt?: boolean;
  rank?: number; // For "list" variant with ranking numbers
}

/**
 * Unified ArticleCard component that replaces 4 different article rendering patterns.
 * 
 * Variants:
 * - "featured": Large headline style (used in Headline component main article)
 * - "compact": Medium size with thumbnail on right (used in MainNews, CategoryPageTemplate)
 * - "list": Title-only with optional ranking number (used in PopularNews)
 * - "headline": Sub-headline style with thumbnail on top (used in Headline sub-articles)
 */
export function ArticleCard({
  article,
  variant,
  showThumbnail = true,
  showExcerpt = true,
  rank,
}: ArticleCardProps) {
  const excerpt = article.summary || article.excerpt;

  // Featured variant: Large headline with big image on top
  if (variant === "featured") {
    return (
      <Stack gap="md">
        {showThumbnail && article.thumbnail_url && (
          <Box component={Link} href={`/article/${article.id}`} style={{ position: "relative", width: "100%", height: 300, borderRadius: "var(--mantine-radius-md)", overflow: "hidden" }}>
            <Image
              src={article.thumbnail_url}
              alt={`${article.title} 대표 이미지`}
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
          </Box>
        )}
        <Link
          href={`/article/${article.id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Title order={2} style={{ fontSize: "28px", fontWeight: 800 }}>
            {article.title}
          </Title>
        </Link>
        {showExcerpt && excerpt && (
          <Text c="dimmed" lineClamp={3}>
            {excerpt}
          </Text>
        )}
      </Stack>
    );
  }

  // Headline variant: Sub-headline with thumbnail on top
  if (variant === "headline") {
    return (
      <Stack gap="xs">
        {showThumbnail && article.thumbnail_url && (
          <Box component={Link} href={`/article/${article.id}`} style={{ position: "relative", width: "100%", height: 120, borderRadius: "var(--mantine-radius-sm)", overflow: "hidden" }}>
            <Image
              src={article.thumbnail_url}
              alt={`${article.title} 이미지`}
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
            />
          </Box>
        )}
        <Link
          href={`/article/${article.id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Title order={5}>{article.title}</Title>
        </Link>
        {showExcerpt && excerpt && (
          <Text size="sm" c="dimmed" lineClamp={2}>
            {excerpt}
          </Text>
        )}
      </Stack>
    );
  }

  // List variant: Title-only with optional ranking number
  if (variant === "list") {
    return (
      <Group align="center" wrap="nowrap" style={{ cursor: "pointer" }}>
        {rank !== undefined && (
          <Text fw={700} c="red" w={20}>
            {rank}
          </Text>
        )}
        <Text
          component={Link}
          href={`/article/${article.id}`}
          size="sm"
          lineClamp={1}
          style={{ flex: 1, textDecoration: "none" }}
          c="dark.9"
        >
          {article.title}
        </Text>
      </Group>
    );
  }

  // Compact variant (default): Horizontal layout with thumbnail on right
  return (
    <Group align="flex-start" wrap="nowrap">
      <Stack gap={4} style={{ flex: 1 }}>
        <Text
          component={Link}
          href={`/article/${article.id}`}
          fw={700}
          lineClamp={2}
          style={{ cursor: "pointer", textDecoration: "none" }}
          c="dark.9"
        >
          {article.title}
        </Text>
        {showExcerpt && excerpt && (
          <Text size="xs" c="dimmed" lineClamp={2}>
            {excerpt}
          </Text>
        )}
      </Stack>
      {showThumbnail && article.thumbnail_url && (
        <Box component={Link} href={`/article/${article.id}`} style={{ position: "relative", width: 80, height: 60, flexShrink: 0, borderRadius: "var(--mantine-radius-sm)", overflow: "hidden" }}>
          <Image
            src={article.thumbnail_url}
            alt={`${article.title} 썸네일`}
            fill
            style={{ objectFit: "cover" }}
            sizes="80px"
          />
        </Box>
      )}
    </Group>
  );
}
