"use client";

import { Grid, GridCol } from "@mantine/core";
import { Article } from "@/types";
import { ArticleCard } from "@/components/shared/ArticleCard";

export function Headline({ articles }: { articles: Article[] }) {
    const mainArticle = articles[0];
    const subArticles = articles.slice(1, 3);

    if (!mainArticle) {
        return null;
    }

    return (
        <Grid gutter={{ base: "md", md: "xl" }}>
            <GridCol span={{ base: 12, md: 8 }}>
                <ArticleCard
                    article={mainArticle}
                    variant="featured"
                    showThumbnail={true}
                    showExcerpt={true}
                />
            </GridCol>
            {subArticles.length > 0 && (
                <GridCol span={{ base: 12, md: 4 }}>
                    <Grid gutter="md">
                        {subArticles.map((article) => (
                            <GridCol key={article.id} span={{ base: 6, md: 12 }}>
                                <ArticleCard
                                    article={article}
                                    variant="headline"
                                    showThumbnail={true}
                                    showExcerpt={true}
                                />
                            </GridCol>
                        ))}
                    </Grid>
                </GridCol>
            )}
        </Grid>
    );
}
