"use client";

import { Stack, Title, Text, Image, Grid, GridCol, Divider } from "@mantine/core";
import { Article } from "@/types";

export function Headline({ articles }: { articles: Article[] }) {
    const mainArticle = articles[0];
    const subArticles = articles.slice(1, 3);

    if (!mainArticle) return null;

    return (
        <Stack gap="xl">
            {/* Main Headline */}
            <Stack gap="md" style={{ cursor: "pointer" }}>
                {mainArticle.thumbnail_url && (
                    <Image
                        src={mainArticle.thumbnail_url}
                        height={300}
                        radius="md"
                        alt="Main Headline"
                    />
                )}
                <Title order={2} style={{ fontSize: "28px", fontWeight: 800 }}>
                    {mainArticle.title}
                </Title>
                <Text c="dimmed" lineClamp={3}>
                    {mainArticle.summary}
                </Text>
            </Stack>

            <Divider />

            {/* Sub Headlines */}
            <Grid>
                {subArticles.map((article) => (
                    <GridCol key={article.id} span={6}>
                        <Stack gap="xs" style={{ cursor: "pointer" }}>
                            {article.thumbnail_url && (
                                <Image
                                    src={article.thumbnail_url}
                                    height={120}
                                    radius="sm"
                                    alt="Sub"
                                />
                            )}
                            <Title order={5}>{article.title}</Title>
                            <Text size="sm" c="dimmed" lineClamp={2}>
                                {article.summary}
                            </Text>
                        </Stack>
                    </GridCol>
                ))}
            </Grid>
        </Stack>
    );
}
