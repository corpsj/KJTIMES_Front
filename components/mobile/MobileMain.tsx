"use client";

import { Stack, Container, Title, Text, Image, Card, Badge, Group, Divider, Box } from "@mantine/core";
import Link from "next/link";

import { Article } from "@/types";
import { formatKoreanDate } from "@/utils/date";

export function MobileMain({ articles }: { articles: Article[] }) {
    const mainHeadline = articles[0];
    const listItems = articles.slice(1, 10);

    return (
        <Container size="md" py="md">
            <Stack gap="xl">
                {/* Main Headline */}
                {mainHeadline && (
                    <Card
                        component={Link}
                        href={`/article/${mainHeadline.id}`}
                        padding="0"
                        radius="md"
                        style={{ textDecoration: "none", color: "inherit" }}
                    >
                        <Card.Section>
                            <Image
                                src={mainHeadline.thumbnail_url || "https://placehold.co/600x400?text=No+Image"}
                                height={200}
                                alt={`${mainHeadline.title} 대표 이미지`}
                            />
                        </Card.Section>
                        <Stack mt="sm" gap="xs">
                            <Badge color="red" variant="light">HOT</Badge>
                            <Title order={3} size="h3">
                                {mainHeadline.title}
                            </Title>
                            {(mainHeadline.summary || mainHeadline.excerpt) && (
                                <Text size="sm" c="dimmed" lineClamp={2}>
                                    {mainHeadline.summary || mainHeadline.excerpt}
                                </Text>
                            )}
                            <Text size="xs" c="dimmed">
                                {formatKoreanDate(mainHeadline.published_at || mainHeadline.created_at)}
                            </Text>
                        </Stack>
                    </Card>
                )}

                <Divider />

                {/* List Items */}
                <Stack gap="lg">
                    {listItems.map((article) => (
                        <Group key={article.id} align="flex-start" wrap="nowrap">
                            <Stack gap={4} style={{ flex: 1 }}>
                                <Text
                                    component={Link}
                                    href={`/article/${article.id}`}
                                    fw={700}
                                    lineClamp={2}
                                    size="md"
                                    c="dark.9"
                                    style={{ textDecoration: "none" }}
                                >
                                    {article.title}
                                </Text>
                                <Text size="xs" c="dimmed">
                                    {formatKoreanDate(article.published_at || article.created_at)}
                                </Text>
                            </Stack>
                            {article.thumbnail_url && (
                                <Box component={Link} href={`/article/${article.id}`}>
                                    <Image
                                        src={article.thumbnail_url}
                                        h={70}
                                        w={70}
                                        radius="sm"
                                        alt={`${article.title} 썸네일`}
                                    />
                                </Box>
                            )}
                        </Group>
                    ))}
                </Stack>
            </Stack>
        </Container>
    );
}
