"use client";

import { Stack, Text, Grid, GridCol, Divider } from "@mantine/core";
import { Article } from "@/types";
import { ArticleCard } from "@/components/shared/ArticleCard";

export function Headline({ articles }: { articles: Article[] }) {
    const mainArticle = articles[0];
    const subArticles = articles.slice(1, 3);

    if (!mainArticle) {
        return (
            <Stack gap="md" align="center" py="xl">
                <Text c="dimmed">헤드라인 기사가 없습니다.</Text>
            </Stack>
        );
    }

    return (
        <Stack gap="xl">
            <ArticleCard
                article={mainArticle}
                variant="featured"
                showThumbnail={true}
                showExcerpt={true}
            />

            <Divider />

            <Grid>
                {subArticles.map((article) => (
                    <GridCol key={article.id} span={6}>
                        <ArticleCard
                            article={article}
                            variant="headline"
                            showThumbnail={true}
                            showExcerpt={true}
                        />
                    </GridCol>
                ))}
            </Grid>
        </Stack>
    );
}
