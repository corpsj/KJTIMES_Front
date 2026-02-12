"use client";

import { Stack, Title, Group, Text, Image, Box } from "@mantine/core";
import Link from "next/link";
import { Article } from "@/types";

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
                <Group key={article.id} align="flex-start" wrap="nowrap">
                    <Stack gap={4} style={{ flex: 1 }}>
                        <Text
                            component={Link}
                            href={`/article/${article.id}`}
                            fw={700}
                            lineClamp={2}
                            style={{ cursor: 'pointer', textDecoration: "none" }}
                            c="dark.9"
                        >
                            {article.title}
                        </Text>
                        {(article.summary || article.excerpt) && (
                            <Text size="xs" c="dimmed" lineClamp={2}>
                                {article.summary || article.excerpt}
                            </Text>
                        )}
                    </Stack>
                    {article.thumbnail_url && (
                        <Box component={Link} href={`/article/${article.id}`} style={{ flexShrink: 0 }}>
                            <Image
                                src={article.thumbnail_url}
                                w={80}
                                h={60}
                                radius="sm"
                                alt={`${article.title} 썸네일`}
                            />
                        </Box>
                    )}
                </Group>
            ))}
        </Stack>
    );
}
