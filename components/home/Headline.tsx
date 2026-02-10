"use client";

import { Stack, Title, Text, Image, Grid, GridCol, Divider, Box } from "@mantine/core";
import Link from "next/link";
import { Article } from "@/types";

export function Headline({ articles }: { articles: Article[] }) {
    const mainArticle = articles[0];
    const subArticles = articles.slice(1, 3);

    if (!mainArticle) {
        return (
            <Stack gap="md" align="center" py="xl">
                <Text c="dimmed">헤드라인 기사가 없습니다.</Text>
            </Stack>
        );
    }

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
                <Link
                    href={`/article/${mainArticle.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                >
                    <Title
                        order={2}
                        style={{ fontSize: "28px", fontWeight: 800 }}
                    >
                        {mainArticle.title}
                    </Title>
                </Link>
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
                            <Link
                                href={`/article/${article.id}`}
                                style={{ textDecoration: "none", color: "inherit" }}
                            >
                                <Title order={5}>
                                    {article.title}
                                </Title>
                            </Link>
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
