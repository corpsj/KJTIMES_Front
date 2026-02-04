"use client";

import { Stack, Title, Group, Text, Image } from "@mantine/core";
import { Article } from "@/types";

export function MainNews({ articles }: { articles: Article[] }) {
    if (!articles || articles.length === 0) return null;

    return (
        <Stack gap="lg">
            <Title order={4} style={{ borderBottom: "2px solid #000", paddingBottom: "8px" }}>
                주요뉴스
            </Title>
            {articles.map((article) => (
                <Group key={article.id} align="flex-start" wrap="nowrap">
                    <Stack gap={4} style={{ flex: 1 }}>
                        <Text fw={700} lineClamp={2} style={{ cursor: 'pointer' }}>
                            {article.title}
                        </Text>
                        <Text size="xs" c="dimmed" lineClamp={2}>
                            {article.summary}
                        </Text>
                    </Stack>
                    {article.thumbnail_url && (
                        <Image
                            src={article.thumbnail_url}
                            w={80}
                            h={60}
                            radius="sm"
                            alt="thumb"
                        />
                    )}
                </Group>
            ))}
        </Stack>
    );
}
