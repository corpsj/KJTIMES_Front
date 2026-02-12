"use client";

import { Stack, Title, Grid, GridCol } from "@mantine/core";
import { Article } from "@/types";
import { ArticleCard } from "@/components/shared/ArticleCard";

export function MainNews({ articles }: { articles: Article[] }) {
    if (!articles || articles.length === 0) {
        return null;
    }

    return (
        <Stack gap="lg">
            <Title order={2} style={{ borderBottom: "2px solid var(--mantine-color-newsHeadline-9)", paddingBottom: "8px" }}>
                주요뉴스
            </Title>
            <Grid gutter="md">
                {articles.map((article) => (
                    <GridCol key={article.id} span={{ base: 12, sm: 6, md: 12 }}>
                        <ArticleCard
                            article={article}
                            variant="compact"
                            showThumbnail={true}
                            showExcerpt={true}
                        />
                    </GridCol>
                ))}
            </Grid>
        </Stack>
    );
}
