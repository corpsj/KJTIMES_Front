"use client";

import { Stack, Title, Box } from "@mantine/core";
import { Article } from "@/types";
import { ArticleCard } from "@/components/shared/ArticleCard";

export function PopularNews({ articles }: { articles: Article[] }) {
    if (!articles || articles.length === 0) {
        return null;
    }

    return (
        <Box style={{ position: "sticky", top: 80 }}>
            <Stack gap="md">
                <Title order={2} style={{ borderBottom: "2px solid var(--mantine-color-newsHeadline-9)", paddingBottom: "8px" }}>
                    많이 본 뉴스
                </Title>
                <Stack gap="sm">
                    {articles.map((article, i) => (
                        <ArticleCard
                            key={article.id}
                            article={article}
                            variant="list"
                            rank={i + 1}
                            showThumbnail={false}
                            showExcerpt={false}
                        />
                    ))}
                </Stack>
            </Stack>
        </Box>
    );
}
