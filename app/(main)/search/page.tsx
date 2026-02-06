import { Container, Title, Text, Stack } from "@mantine/core";
import { createClient } from "@/utils/supabase/server";
import { CategoryPageTemplate } from "@/components/layout/CategoryPageTemplate";

export const revalidate = 60;

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
    const query = (searchParams.q || "").trim();

    if (!query) {
        return (
            <Container size="md" py="xl">
                <Stack gap="md">
                    <Title order={1}>검색</Title>
                    <Text c="dimmed">검색어를 입력해 주세요.</Text>
                </Stack>
            </Container>
        );
    }

    const supabase = await createClient();
    const escapedQuery = query.replace(/%/g, "\\%").replace(/_/g, "\\_");
    const like = `%${escapedQuery}%`;

    const { data: articles } = await supabase
        .from("articles")
        .select(`
      id, title, summary, excerpt, thumbnail_url, created_at, published_at, views,
      categories (name, slug)
    `)
        .eq("status", "published")
        .or(`title.ilike.${like},summary.ilike.${like},excerpt.ilike.${like}`)
        .order("published_at", { ascending: false })
        .limit(50);

    return (
        <CategoryPageTemplate
            title={`검색 결과: ${query}`}
            articles={articles || []}
        />
    );
}
