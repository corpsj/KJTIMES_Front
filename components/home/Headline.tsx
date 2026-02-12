"use client";

import { Stack, Grid, GridCol, Divider } from "@mantine/core";
import { Article } from "@/types";
import { ArticleCard } from "@/components/shared/ArticleCard";

export function Headline({ articles }: { articles: Article[] }) {
    const mainArticle = articles[0];
    const subArticles = articles.slice(1, 3);

    if (!mainArticle) {
        return null;
    }

    return (
        <Stack gap="xl">
            <ArticleCard
                article={mainArticle}
                variant="featured"
                showThumbnail={true}
                showExcerpt={true}
            />

            {subArticles.length > 0 && (
                <>
                    <Divider />
                    <Grid>
                        {subArticles.map((article) => (
                            <GridCol key={article.id} span={{ base: 12, sm: 6 }}>
                                <ArticleCard
                                    article={article}
                                    variant="headline"
                                    showThumbnail={true}
                                    showExcerpt={true}
                                />
                            </GridCol>
                        ))}
                    </Grid>
                </>
            )}
        </Stack>
    );
}
