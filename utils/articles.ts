import { fetchCategoryArticles as _fetchCategoryArticles } from "@/lib/api/articles";
import { Article } from "@/types";

/** @deprecated Use `fetchCategoryArticles` from `@/lib/api/articles` directly. */
export async function fetchCategoryArticles(categorySlug: string, limit = 30): Promise<Article[]> {
    const { data } = await _fetchCategoryArticles(categorySlug, limit);
    return data || [];
}
