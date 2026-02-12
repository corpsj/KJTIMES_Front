"use client";

import { Stack, Title, Text } from "@mantine/core";
import { Article } from "@/types";
import { ArticleCard } from "@/components/shared/ArticleCard";

export function PopularNews({ articles }: { articles: Article[] }) {
    return (
        <Stack gap="md">
            <Title order={4} style={{ borderBottom: "2px solid var(--mantine-color-newsHeadline-9)", paddingBottom: "8px" }}>
                많이 본 뉴스
            </Title>
            {(!articles || articles.length === 0) && (
                <Text c="dimmed" size="sm">아직 데이터가 없습니다.</Text>
            )}
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
    );
}
