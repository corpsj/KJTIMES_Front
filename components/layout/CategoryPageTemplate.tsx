"use client";

import { Container, Title, Text, Stack, Divider } from "@mantine/core";
import { Article } from "@/types";
import { ArticleCard } from "@/components/shared/ArticleCard";

export function CategoryPageTemplate({ title, articles }: { title: string; articles: Article[] }) {
    return (
        <Container size="xl" py="xl" px={{ base: "md", sm: "xl" }}>
            <Stack gap="xl">
                <Title order={1}>{title}</Title>

                {articles.length === 0 && (
                    <Text c="dimmed">등록된 기사가 없습니다.</Text>
                )}

                {articles.map((article) => (
                    <Stack key={article.id} gap="md">
                        <ArticleCard
                            article={article}
                            variant="compact"
                            showThumbnail={true}
                            showExcerpt={true}
                        />
                        <Divider />
                    </Stack>
                ))}
            </Stack>
        </Container>
    );
}
