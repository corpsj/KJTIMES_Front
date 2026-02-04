"use client";

import { Container, Title, Text, Group, Badge, Divider, Stack } from "@mantine/core";
import { Article } from "@/types";

export function MobileArticleDetail({ article }: { article: Article & { content: string } }) {
    if (!article) return <div>Article not found</div>;

    return (
        <Container size="md" py="md">
            <Stack gap="md">
                <Group justify="space-between">
                    {Array.isArray(article.categories) ? (
                        article.categories.map((c) => <Badge key={c.slug}>{c.name}</Badge>)
                    ) : (
                        article.categories && <Badge>{article.categories.name}</Badge>
                    )}
                    <Text size="xs" c="dimmed">{new Date(article.created_at).toLocaleDateString()}</Text>
                </Group>

                <Title order={2} size="h3">{article.title}</Title>

                {article.summary && (
                    <Text size="md" c="dimmed" style={{ fontStyle: 'italic' }}>
                        {article.summary}
                    </Text>
                )}

                <Divider />

                <div
                    className="tiptap-content"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                    style={{ fontSize: '1rem', lineHeight: '1.6' }}
                />
            </Stack>
        </Container>
    );
}
