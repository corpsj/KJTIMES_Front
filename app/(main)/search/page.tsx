"use client";

import { Container, Grid, GridCol, Title, Text, Stack, TextInput, Button, Group, Loader, Center } from "@mantine/core";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { searchArticlesClient } from "@/lib/api/articles.client";
import { Article } from "@/types";
import { SearchFilters } from "@/components/search/SearchFilters";
import { SearchResults } from "@/components/search/SearchResults";
import { SearchSort } from "@/components/search/SearchSort";
import { EmptyState } from "@/components/search/EmptyState";

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    // URL params
    const q = searchParams.get("q") || "";
    const categoryParam = searchParams.get("category") || "all";
    const dateParam = searchParams.get("date") || "all";
    const sortParam = searchParams.get("sort") || "relevance";
    
    // Local state
    const [query, setQuery] = useState(q);
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Filter state (from URL)
    const [categoryFilter, setCategoryFilter] = useState(categoryParam);
    const [dateFilter, setDateFilter] = useState(dateParam);
    const [sortBy, setSortBy] = useState<"relevance" | "latest">(
        sortParam === "latest" ? "latest" : "relevance"
    );

    // Sync filter state with URL params
    useEffect(() => {
        setCategoryFilter(categoryParam);
        setDateFilter(dateParam);
        setSortBy(sortParam === "latest" ? "latest" : "relevance");
    }, [categoryParam, dateParam, sortParam]);

    // Fetch articles when query changes
    useEffect(() => {
        if (!q.trim()) {
            setArticles([]);
            return;
        }

        const fetchArticles = async () => {
            setLoading(true);
            try {
                const { data, error } = await searchArticlesClient(q, 100);
                if (error) {
                    console.error("Search error:", error);
                    setArticles([]);
                } else {
                    setArticles(data || []);
                }
            } catch (error) {
                console.error("Search error:", error);
                setArticles([]);
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, [q]);

    // Filter and sort articles
    const filteredResults = articles
        .filter((article) => {
            // Category filter
            if (categoryFilter !== "all") {
                const category = Array.isArray(article.categories)
                    ? article.categories[0]?.slug
                    : article.categories?.slug;
                if (category !== categoryFilter) return false;
            }

            // Date filter
            if (dateFilter !== "all") {
                const publishedDate = new Date(article.published_at || article.created_at);
                const now = new Date();
                const diffDays = (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);

                switch (dateFilter) {
                    case "today":
                        if (diffDays > 1) return false;
                        break;
                    case "week":
                        if (diffDays > 7) return false;
                        break;
                    case "month":
                        if (diffDays > 30) return false;
                        break;
                    case "3months":
                        if (diffDays > 90) return false;
                        break;
                    case "year":
                        if (diffDays > 365) return false;
                        break;
                }
            }

            return true;
        })
        .sort((a, b) => {
            if (sortBy === "latest") {
                return (
                    new Date(b.published_at || b.created_at).getTime() -
                    new Date(a.published_at || a.created_at).getTime()
                );
            }
            return 0; // relevance = default order from search
        });

    // Update URL with new filter values
    const updateURL = (newCategory: string, newDate: string, newSort: string) => {
        const params = new URLSearchParams();
        params.set("q", q);
        if (newCategory !== "all") params.set("category", newCategory);
        if (newDate !== "all") params.set("date", newDate);
        if (newSort !== "relevance") params.set("sort", newSort);
        router.push(`/search?${params.toString()}`);
    };

    const handleCategoryChange = (value: string) => {
        updateURL(value, dateFilter, sortBy);
    };

    const handleDateChange = (value: string) => {
        updateURL(categoryFilter, value, sortBy);
    };

    const handleSortChange = (value: "relevance" | "latest") => {
        updateURL(categoryFilter, dateFilter, value);
    };

    const handleClearFilters = () => {
        updateURL("all", "all", "relevance");
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    const hasActiveFilters = categoryFilter !== "all" || dateFilter !== "all";

    return (
        <Container size="xl" py="xl" px={{ base: "md", sm: "xl" }}>
            <Stack gap="xl">
                {/* Search header and input */}
                <Stack gap="md">
                    <Title order={1} size="h2">
                        검색
                    </Title>
                    <form onSubmit={handleSearch}>
                        <Group gap="sm">
                            <TextInput
                                type="search"
                                placeholder="검색어를 입력해 주세요"
                                value={query}
                                onChange={(e) => setQuery(e.currentTarget.value)}
                                style={{ flex: 1 }}
                                size="md"
                            />
                            <Button type="submit" loading={loading} size="md">
                                검색
                            </Button>
                        </Group>
                    </form>
                </Stack>

                {/* No query state */}
                {!q.trim() && <Text c="dimmed">검색어를 입력해 주세요.</Text>}

                {/* Search results with Grid layout */}
                {q.trim() && (
                    <Grid gutter="xl">
                        {/* Main content */}
                        <GridCol span={{ base: 12, md: 8 }}>
                            <Stack gap="md">
                                {/* Result count and sort */}
                                {!loading && articles.length > 0 && (
                                    <Group justify="space-between" align="center">
                                        <Text size="sm" c="dimmed">
                                            총 {filteredResults.length}개 검색 결과
                                        </Text>
                                        <SearchSort sortBy={sortBy} onSortChange={handleSortChange} />
                                    </Group>
                                )}

                                {/* Loading state */}
                                {loading && (
                                    <Center py="xl">
                                        <Loader />
                                    </Center>
                                )}

                                {/* Empty state */}
                                {!loading && articles.length > 0 && filteredResults.length === 0 && (
                                    <EmptyState query={q} />
                                )}

                                {/* No results from search */}
                                {!loading && articles.length === 0 && (
                                    <EmptyState query={q} />
                                )}

                                {/* Results */}
                                {!loading && filteredResults.length > 0 && (
                                    <SearchResults results={filteredResults} query={q} />
                                )}
                            </Stack>
                        </GridCol>

                        {/* Sidebar with filters */}
                        <GridCol span={4} visibleFrom="md">
                            <SearchFilters
                                categoryFilter={categoryFilter}
                                dateFilter={dateFilter}
                                onCategoryChange={handleCategoryChange}
                                onDateChange={handleDateChange}
                                onClearFilters={handleClearFilters}
                                hasActiveFilters={hasActiveFilters}
                            />
                        </GridCol>
                    </Grid>
                )}
            </Stack>
        </Container>
    );
}

export default function SearchPage() {
    return (
        <Suspense
            fallback={
                <Center py="xl">
                    <Loader />
                </Center>
            }
        >
            <SearchContent />
        </Suspense>
    );
}
