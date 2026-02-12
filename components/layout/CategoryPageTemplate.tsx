"use client";

import { useState } from "react";
import { Container, Grid, GridCol, Text, Stack, Center, Button } from "@mantine/core";
import { Article } from "@/types";
import { ArticleCard } from "@/components/shared/ArticleCard";
import { CategoryHeader } from "@/components/category/CategoryHeader";
import { CategorySidebar } from "@/components/category/CategorySidebar";
import { FilterSort } from "@/components/category/FilterSort";

interface CategoryPageTemplateProps {
  title: string;
  categorySlug: string;
  articles: Article[];
  description?: string | null;
  relatedCategories?: Array<{ label: string; href: string }>;
  popularArticles?: Article[];
}

export function CategoryPageTemplate({
  title,
  categorySlug,
  articles,
  description,
  relatedCategories = [],
  popularArticles = [],
}: CategoryPageTemplateProps) {
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");
  const [displayCount, setDisplayCount] = useState(12);

  const sortedArticles = [...articles].sort((a, b) => {
    if (sortBy === "popular") {
      return (b.views || 0) - (a.views || 0);
    }
    return new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime();
  });

  const displayedArticles = sortedArticles.slice(0, displayCount);
  const hasMore = sortedArticles.length > displayCount;

  return (
    <Container size="xl" py="xl" px={{ base: "md", sm: "xl" }}>
      <Grid gutter="xl">
        <GridCol span={12}>
          <CategoryHeader
            categoryName={title}
            categorySlug={categorySlug}
            articleCount={articles.length}
            description={description}
          />
        </GridCol>

        <GridCol span={{ base: 12, md: 8 }}>
          <Stack gap="xl">
            <FilterSort sortBy={sortBy} onSortChange={setSortBy} />

            {articles.length === 0 && (
              <Text c="dimmed" ta="center" py="xl">
                등록된 기사가 없습니다.
              </Text>
            )}

            <Grid gutter="md">
              {displayedArticles.map((article) => (
                <GridCol key={article.id} span={{ base: 12, sm: 6, lg: 4 }}>
                  <ArticleCard
                    article={article}
                    variant="compact"
                    showThumbnail={true}
                    showExcerpt={true}
                  />
                </GridCol>
              ))}
            </Grid>

            {hasMore && (
              <Center>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setDisplayCount((prev) => prev + 12)}
                >
                  더보기
                </Button>
              </Center>
            )}
          </Stack>
        </GridCol>

        <GridCol span={4} visibleFrom="md">
          <CategorySidebar
            relatedCategories={relatedCategories}
            popularArticles={popularArticles}
          />
        </GridCol>
      </Grid>
    </Container>
  );
}
