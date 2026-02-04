"use client";

import { Container, Title, Text, Group, Badge, Image, Divider, Stack } from "@mantine/core";
import { Article } from "@/types";

export function DesktopArticleDetail({ article }: { article: Article & { content: string } }) {
    if (!article) return <div>Article not found</div>;

    return (
        <Container size="md" py="xl">
            <Stack gap="lg">
                <Group>
                    {Array.isArray(article.categories) ? (
                        article.categories.map((c) => <Badge key={c.slug} size="lg">{c.name}</Badge>)
                    ) : (
                        article.categories && <Badge size="lg">{article.categories.name}</Badge>
                    )}
                    <Text size="sm" c="dimmed">{new Date(article.created_at).toLocaleDateString()}</Text>
                </Group>

                <Title order={1} style={{ fontSize: '2.5rem' }}>{article.title}</Title>

                {article.summary && (
                    <Text size="xl" c="dimmed" style={{ fontStyle: 'italic' }}>
                        {article.summary}
                    </Text>
                )}

                <Divider />

                <div
                    className="tiptap-content"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                    style={{ fontSize: '1.1rem', lineHeight: '1.8' }}
                />
            </Stack>
        </Container>
    );
}
