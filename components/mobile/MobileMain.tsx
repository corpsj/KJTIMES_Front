"use client";

import { Stack, Container, Title, Text, Image, Card, Badge, Group, Divider } from "@mantine/core";

import { Article } from "@/types";

export function MobileMain({ articles }: { articles: Article[] }) {
    const mainHeadline = articles[0];
    const listItems = articles.slice(1, 10);

    return (
        <Container size="md" py="md">
            <Stack gap="xl">
                {/* Main Headline */}
                {mainHeadline && (
                    <Card padding="0" radius="md">
                        <Card.Section>
                            <Image
                                src={mainHeadline.thumbnail_url || "https://placehold.co/600x400?text=No+Image"}
                                height={200}
                                alt="Headline"
                            />
                        </Card.Section>
                        <Stack mt="sm" gap="xs">
                            <Badge color="red" variant="light">HOT</Badge>
                            <Title order={3} size="h3">
                                {mainHeadline.title}
                            </Title>
                            <Text size="sm" c="dimmed" lineClamp={2}>
                                {mainHeadline.summary}
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
                                <Text fw={700} lineClamp={2} size="md">
                                    {article.title}
                                </Text>
                                <Text size="xs" c="dimmed">
                                    {new Date(article.created_at).toLocaleDateString()}
                                </Text>
                            </Stack>
                            {article.thumbnail_url && (
                                <Image
                                    src={article.thumbnail_url}
                                    h={70}
                                    w={70}
                                    radius="sm"
                                    alt="thumb"
                                />
                            )}
                        </Group>
                    ))}
                </Stack>
            </Stack>
        </Container>
    );
}
