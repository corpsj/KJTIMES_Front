"use client";

import { Stack, Title, Group, Text } from "@mantine/core";
import Link from "next/link";
import { Article } from "@/types";

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
                    <Group key={article.id} align="center" wrap="nowrap" style={{ cursor: "pointer" }}>
                        <Text fw={700} c="red" w={20}>{i + 1}</Text>
                        <Text
                            component={Link}
                            href={`/article/${article.id}`}
                            size="sm"
                            lineClamp={1}
                            style={{ flex: 1, textDecoration: "none" }}
                            c="dark.9"
                        >
                            {article.title}
                        </Text>
                    </Group>
                ))}
            </Stack>
        </Stack>
    );
}
