import { Container, Title, Text, Stack, Group, Image, Divider, Box } from "@mantine/core";
import Link from "next/link";
import { Article } from "@/types";
import { formatKoreanDate } from "@/utils/date";

export function CategoryPageTemplate({ title, articles }: { title: string; articles: Article[] }) {
    return (
        <Container size="xl" py="xl">
            <Stack gap="xl">
                <Title order={1}>{title}</Title>

                {articles.length === 0 && (
                    <Text c="dimmed">등록된 기사가 없습니다.</Text>
                )}

                {articles.map((article) => (
                    <Stack key={article.id} gap="md">
                        <Group align="flex-start" wrap="nowrap">
                            <Stack gap={6} style={{ flex: 1 }}>
                                <Text
                                    component={Link}
                                    href={`/article/${article.id}`}
                                    fw={700}
                                    size="lg"
                                    lineClamp={2}
                                    c="dark.9"
                                    style={{ textDecoration: "none" }}
                                >
                                    {article.title}
                                </Text>
                                {(article.summary || article.excerpt) && (
                                    <Text size="sm" c="dimmed" lineClamp={2}>
                                        {article.summary || article.excerpt}
                                    </Text>
                                )}
                                <Text size="xs" c="dimmed">
                                    {formatKoreanDate(article.published_at || article.created_at)}
                                </Text>
                            </Stack>
                            {article.thumbnail_url && (
                                <Box component={Link} href={`/article/${article.id}`} style={{ flexShrink: 0 }}>
                                    <Image
                                        src={article.thumbnail_url}
                                        h={90}
                                        w={120}
                                        radius="sm"
                                        alt={`${article.title} 썸네일`}
                                    />
                                </Box>
                            )}
                        </Group>
                        <Divider />
                    </Stack>
                ))}
            </Stack>
        </Container>
    );
}
