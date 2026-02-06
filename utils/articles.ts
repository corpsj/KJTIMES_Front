import { createClient } from "@/utils/supabase/server";
import { Article } from "@/types";

export async function fetchCategoryArticles(categorySlug: string, limit = 30): Promise<Article[]> {
    const supabase = await createClient();
    const { data } = await supabase
        .from("articles")
        .select(`
      id, title, summary, excerpt, thumbnail_url, created_at, published_at, views,
      categories!inner (name, slug)
    `)
        .eq("status", "published")
        .eq("categories.slug", categorySlug)
        .order("published_at", { ascending: false })
        .limit(limit);

    return data || [];
}
