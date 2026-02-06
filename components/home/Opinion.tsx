import { Stack, Title, Paper, Text } from "@mantine/core";
import Link from "next/link";
import { Article } from "@/types";
import { formatKoreanDate } from "@/utils/date";

function isOpinionArticle(article: Article) {
    if (Array.isArray(article.categories)) {
        return article.categories.some((category) => category.slug === "opinion");
    }
    return article.categories?.slug === "opinion";
}

export function Opinion({ articles }: { articles: Article[] }) {
    const opinionArticles = (articles || []).filter(isOpinionArticle).slice(0, 2);

    if (opinionArticles.length === 0) return null;

    return (
        <Stack gap="xl">
            <Title order={4} style={{ borderBottom: "2px solid black", paddingBottom: "8px" }}>
                오피니언
            </Title>
            {opinionArticles.map((article) => (
                <Paper key={article.id} p="md" bg="gray.0">
                    <Text size="xs" c="blue" fw={700} mb="xs">[오피니언]</Text>
                    <Text
                        component={Link}
                        href={`/article/${article.id}`}
                        fw={700}
                        size="md"
                        mb="xs"
                        c="dark.9"
                        style={{ textDecoration: "none" }}
                    >
                        {article.title}
                    </Text>
                    {(article.summary || article.excerpt) && (
                        <Text size="sm" c="dimmed" lineClamp={3}>
                            {article.summary || article.excerpt}
                        </Text>
                    )}
                    <Text size="xs" c="dimmed" mt="xs">
                        {formatKoreanDate(article.published_at || article.created_at)}
                    </Text>
                </Paper>
            ))}
        </Stack>
    );
}
