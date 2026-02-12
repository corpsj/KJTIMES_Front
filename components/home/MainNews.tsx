"use client";

import { Stack, Title, Text } from "@mantine/core";
import { Article } from "@/types";
import { ArticleCard } from "@/components/shared/ArticleCard";

export function MainNews({ articles }: { articles: Article[] }) {
    return (
        <Stack gap="lg">
            <Title order={4} style={{ borderBottom: "2px solid var(--mantine-color-newsHeadline-9)", paddingBottom: "8px" }}>
                주요뉴스
            </Title>
            {(!articles || articles.length === 0) && (
                <Text c="dimmed" size="sm">주요 뉴스가 없습니다.</Text>
            )}
            {articles.map((article) => (
                <ArticleCard
                    key={article.id}
                    article={article}
                    variant="compact"
                    showThumbnail={true}
                    showExcerpt={true}
                />
            ))}
        </Stack>
    );
}
