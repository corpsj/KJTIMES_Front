"use client";

import { Stack, Title, Text, Image, Grid, GridCol, Divider, Box } from "@mantine/core";
import Link from "next/link";
import { Article } from "@/types";

export function Headline({ articles }: { articles: Article[] }) {
    const mainArticle = articles[0];
    const subArticles = articles.slice(1, 3);

    if (!mainArticle) return null;

    return (
        <Stack gap="xl">
            {/* Main Headline */}
            <Stack gap="md">
                {mainArticle.thumbnail_url && (
                    <Box component={Link} href={`/article/${mainArticle.id}`}>
                        <Image
                            src={mainArticle.thumbnail_url}
                            height={300}
                            radius="md"
                            alt={`${mainArticle.title} 대표 이미지`}
                        />
                    </Box>
                )}
                <Title
                    order={2}
                    style={{ fontSize: "28px", fontWeight: 800, textDecoration: "none", color: "inherit" }}
                    component={Link}
                    href={`/article/${mainArticle.id}`}
                >
                    {mainArticle.title}
                </Title>
                {(mainArticle.summary || mainArticle.excerpt) && (
                    <Text c="dimmed" lineClamp={3}>
                        {mainArticle.summary || mainArticle.excerpt}
                    </Text>
                )}
            </Stack>

            <Divider />

            {/* Sub Headlines */}
            <Grid>
                {subArticles.map((article) => (
                    <GridCol key={article.id} span={6}>
                        <Stack gap="xs">
                            {article.thumbnail_url && (
                                <Box component={Link} href={`/article/${article.id}`}>
                                    <Image
                                        src={article.thumbnail_url}
                                        height={120}
                                        radius="sm"
                                        alt={`${article.title} 이미지`}
                                    />
                                </Box>
                            )}
                            <Title
                                order={5}
                                component={Link}
                                href={`/article/${article.id}`}
                                style={{ textDecoration: "none", color: "inherit" }}
                            >
                                {article.title}
                            </Title>
                            {(article.summary || article.excerpt) && (
                                <Text size="sm" c="dimmed" lineClamp={2}>
                                    {article.summary || article.excerpt}
                                </Text>
                            )}
                        </Stack>
                    </GridCol>
                ))}
            </Grid>
        </Stack>
    );
}
