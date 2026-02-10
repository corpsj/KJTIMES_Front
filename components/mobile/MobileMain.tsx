"use client";

import { Stack, Container, Title, Text, Image, Card, Badge, Group, Divider, Box, Center } from "@mantine/core";
import { IconNews } from "@tabler/icons-react";
import Link from "next/link";

import { Article } from "@/types";
import { formatKoreanDate } from "@/utils/date";

function getCategoryName(article: Article): string | null {
    if (!article.categories) return null;
    if (Array.isArray(article.categories)) {
        return article.categories[0]?.name || null;
    }
    return article.categories.name || null;
}

function getCategorySlug(article: Article): string | null {
    if (!article.categories) return null;
    if (Array.isArray(article.categories)) {
        return article.categories[0]?.slug || null;
    }
    return article.categories.slug || null;
}

export function MobileMain({ articles }: { articles: Article[] }) {
    if (!articles || articles.length === 0) {
        return (
            <Container size="md" py="xl">
                <Center py={60}>
                    <Stack align="center" gap="md">
                        <Box
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: "50%",
                                background: "#f1f5f9",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <IconNews size={28} color="#94a3b8" />
                        </Box>
                        <Title order={4} c="dimmed" ta="center">
                            게시된 기사가 없습니다
                        </Title>
                        <Text size="sm" c="dimmed" ta="center" maw={280}>
                            새로운 기사가 곧 업데이트됩니다.
                        </Text>
                    </Stack>
                </Center>
            </Container>
        );
    }

    const mainHeadline = articles[0];
    const listItems = articles.slice(1, 10);

    return (
        <Container size="md" py="md">
            <Stack gap="lg">
                {/* Main Headline Card */}
                {mainHeadline && (
                    <Card
                        component={Link}
                        href={`/article/${mainHeadline.id}`}
                        padding={0}
                        radius="md"
                        withBorder
                        style={{
                            textDecoration: "none",
                            color: "inherit",
                            overflow: "hidden",
                            borderColor: "#e2e8f0",
                        }}
                    >
                        <Card.Section>
                            <Image
                                src={mainHeadline.thumbnail_url || "https://placehold.co/600x340?text=광전타임즈"}
                                height={220}
                                alt={`${mainHeadline.title} 대표 이미지`}
                                style={{ objectFit: "cover" }}
                            />
                        </Card.Section>
                        <Stack p="md" gap="xs">
                            <Group gap={6}>
                                {getCategoryName(mainHeadline) && (
                                    <Badge
                                        size="xs"
                                        variant="light"
                                        color="red"
                                        radius="sm"
                                    >
                                        {getCategoryName(mainHeadline)}
                                    </Badge>
                                )}
                                <Text size="xs" c="dimmed">
                                    {formatKoreanDate(mainHeadline.published_at || mainHeadline.created_at)}
                                </Text>
                            </Group>
                            <Title order={3} size="h3" lineClamp={2} style={{ lineHeight: 1.35 }}>
                                {mainHeadline.title}
                            </Title>
                            {(mainHeadline.summary || mainHeadline.excerpt) && (
                                <Text size="sm" c="dimmed" lineClamp={2} style={{ lineHeight: 1.55 }}>
                                    {mainHeadline.summary || mainHeadline.excerpt}
                                </Text>
                            )}
                        </Stack>
                    </Card>
                )}

                <Divider color="#e2e8f0" />

                {/* Article List */}
                <Stack gap="md">
                    {listItems.map((article, index) => (
                        <Box key={article.id}>
                            <Link
                                href={`/article/${article.id}`}
                                style={{ textDecoration: "none", color: "inherit", display: "block" }}
                            >
                                <Group align="flex-start" wrap="nowrap" gap="sm">
                                    <Stack gap={4} style={{ flex: 1 }}>
                                        {getCategoryName(article) && (
                                            <Badge
                                                size="xs"
                                                variant="light"
                                                color="gray"
                                                radius="sm"
                                                style={{ alignSelf: "flex-start" }}
                                            >
                                                {getCategoryName(article)}
                                            </Badge>
                                        )}
                                        <Text
                                            fw={700}
                                            lineClamp={2}
                                            size="md"
                                            c="dark.9"
                                            style={{ lineHeight: 1.4 }}
                                        >
                                            {article.title}
                                        </Text>
                                        {(article.summary || article.excerpt) && (
                                            <Text size="xs" c="dimmed" lineClamp={1}>
                                                {article.summary || article.excerpt}
                                            </Text>
                                        )}
                                        <Text size="xs" c="dimmed">
                                            {formatKoreanDate(article.published_at || article.created_at)}
                                        </Text>
                                    </Stack>
                                    {article.thumbnail_url && (
                                        <Image
                                            src={article.thumbnail_url}
                                            h={78}
                                            w={104}
                                            radius="sm"
                                            alt={`${article.title} 썸네일`}
                                            style={{ objectFit: "cover", flexShrink: 0, border: "1px solid #e2e8f0" }}
                                        />
                                    )}
                                </Group>
                            </Link>
                            {index < listItems.length - 1 && <Divider mt="md" color="#f1f5f9" />}
                        </Box>
                    ))}
                </Stack>
            </Stack>
        </Container>
    );
}
