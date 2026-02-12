"use client";

import { Container, Title, Text, Stack, TextInput, Button, Group, Loader, Center } from "@mantine/core";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/utils/supabase/client";
import { CategoryPageTemplate } from "@/components/layout/CategoryPageTemplate";
import { Article } from "@/types";

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const q = searchParams.get("q") || "";
    const [query, setQuery] = useState(q);
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!q.trim()) {
            setArticles([]);
            return;
        }

        const fetchArticles = async () => {
            setLoading(true);
            try {
                const supabase = createClient();
                const escapedQuery = q.replace(/%/g, "\\%").replace(/_/g, "\\_");
                const like = `%${escapedQuery}%`;

                const { data } = await supabase
                    .from("articles")
                    .select(`
                        id, title, summary, excerpt, thumbnail_url, created_at, published_at, views,
                        categories (name, slug)
                    `)
                    .in("status", ["published", "shared"])
                    .or(`title.ilike.${like},summary.ilike.${like},excerpt.ilike.${like}`)
                    .order("published_at", { ascending: false })
                    .limit(50);

                setArticles(data || []);
            } catch (error) {
                console.error("Search error:", error);
                setArticles([]);
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, [q]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <Container size="md" py="xl" px={{ base: "md", sm: "xl" }}>
            <Stack gap="md">
                <Title order={1} size="h2">검색</Title>
                <form onSubmit={handleSearch}>
                    <Group gap="sm">
                        <TextInput
                            placeholder="검색어를 입력해 주세요"
                            value={query}
                            onChange={(e) => setQuery(e.currentTarget.value)}
                            style={{ flex: 1 }}
                        />
                        <Button type="submit" loading={loading}>
                            검색
                        </Button>
                    </Group>
                </form>

                {!q.trim() && (
                    <Text c="dimmed">검색어를 입력해 주세요.</Text>
                )}

                {q.trim() && loading && (
                    <Center py="xl">
                        <Loader />
                    </Center>
                )}

                {q.trim() && articles.length === 0 && !loading && (
                    <Text c="dimmed">검색 결과가 없습니다.</Text>
                )}

                {articles.length > 0 && (
                    <CategoryPageTemplate
                        title={`검색 결과: ${q}`}
                        articles={articles}
                    />
                )}
            </Stack>
        </Container>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<Center py="xl"><Loader /></Center>}>
            <SearchContent />
        </Suspense>
    );
}
