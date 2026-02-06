"use client";

import { Container, Title, Text, Group, Badge, Divider, Stack } from "@mantine/core";
import Link from "next/link";
import { Article } from "@/types";
import { formatKoreanDate } from "@/utils/date";
import { ShareActions } from "@/components/shared/ShareActions";

export function MobileArticleDetail({
    article,
    relatedArticles = [],
    shareUrl = "",
}: {
    article: Article & { content: string };
    relatedArticles?: Article[];
    shareUrl?: string;
}) {
    if (!article) return <div>Article not found</div>;
    const publishedDate = article.published_at || article.created_at;
    const updatedDate = article.updated_at;
    const authorName = article.author?.full_name || "편집국";
    const showUpdated = Boolean(updatedDate && updatedDate !== publishedDate);

    return (
        <Container size="md" py="md">
            <Stack gap="md">
                <Group justify="space-between">
                    {Array.isArray(article.categories) ? (
                        article.categories.map((c) => (
                            <Badge
                                key={c.slug}
                                component={Link}
                                href={`/${c.slug}`}
                                style={{ cursor: "pointer" }}
                            >
                                {c.name}
                            </Badge>
                        ))
                    ) : (
                        article.categories && (
                            <Badge
                                component={Link}
                                href={`/${article.categories.slug}`}
                                style={{ cursor: "pointer" }}
                            >
                                {article.categories.name}
                            </Badge>
                        )
                    )}
                    <Text size="xs" c="dimmed">{formatKoreanDate(publishedDate)}</Text>
                </Group>

                <Text size="xs" c="dimmed">
                    {authorName}
                    {showUpdated && ` · 수정 ${formatKoreanDate(updatedDate)}`}
                </Text>

                <Title order={2} size="h3">{article.title}</Title>

                {article.sub_title && (
                    <Text size="md" fw={600}>
                        {article.sub_title}
                    </Text>
                )}

                {article.summary && (
                    <Text size="md" c="dimmed" style={{ fontStyle: 'italic' }}>
                        {article.summary}
                    </Text>
                )}

                {shareUrl && <ShareActions title={article.title} url={shareUrl} />}

                <Divider />

                <div
                    className="tiptap-content"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                    style={{ fontSize: '1rem', lineHeight: '1.6' }}
                />

                {relatedArticles.length > 0 && (
                    <>
                        <Divider />
                        <Stack gap="sm">
                            <Title order={4}>관련 기사</Title>
                            {relatedArticles.map((related) => (
                                <Stack key={related.id} gap={2}>
                                    <Text
                                        component={Link}
                                        href={`/article/${related.id}`}
                                        fw={600}
                                        c="dark.9"
                                        style={{ textDecoration: "none" }}
                                    >
                                        {related.title}
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                        {formatKoreanDate(related.published_at || related.created_at)}
                                    </Text>
                                </Stack>
                            ))}
                        </Stack>
                    </>
                )}
            </Stack>
        </Container>
    );
}
