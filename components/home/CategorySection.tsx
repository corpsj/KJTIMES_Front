"use client";

import { Stack, Title, Grid, GridCol, Button, Group } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";
import { Article } from "@/types";
import { ArticleCard } from "@/components/shared/ArticleCard";

export interface CategorySectionProps {
  title: string;
  categorySlug: string;
  articles: Article[];
}

export function CategorySection({ title, categorySlug, articles }: CategorySectionProps) {
  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Title
          order={3}
          style={{
            borderBottom: "3px solid var(--mantine-color-newsHeadline-9)",
            paddingBottom: "8px",
            display: "inline-block",
          }}
        >
          {title}
        </Title>
        <Button
          component={Link}
          href={`/${categorySlug}`}
          variant="subtle"
          color="newsAccent"
          rightSection={<IconChevronRight size={16} />}
          size="sm"
        >
          더보기
        </Button>
      </Group>

      <Grid gutter={{ base: "md", md: "lg" }}>
        {articles.map((article, i) => (
          <GridCol key={article.id} span={{ base: 12, sm: 6, md: 3 }}>
            <ArticleCard
              article={article}
              variant={i === 0 ? "headline" : "compact"}
              showThumbnail={true}
              showExcerpt={i === 0}
            />
          </GridCol>
        ))}
      </Grid>
    </Stack>
  );
}
