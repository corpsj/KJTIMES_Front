import { createClient } from "@/utils/supabase/server";
import { Article } from "@/types";

/* ──────────────────────────── Types ──────────────────────────── */

export type ApiResult<T> = { data: T | null; error: Error | null };

export type ArticleDetail = Article & {
  content: string;
  status: string;
  author_id?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  keywords?: string | null;
};

export type ArticleTag = {
  id: string;
  name: string;
};

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

/* ──────────── Common select fragments ──────────── */

const ARTICLE_LIST_SELECT = `
  id, title, summary, excerpt, thumbnail_url, created_at, published_at, views,
  categories (name, slug)
`;

const ARTICLE_DETAIL_SELECT = `
  id, title, sub_title, content, summary, excerpt, thumbnail_url, status, author_id,
  created_at, published_at, updated_at, views, slug,
  seo_title, seo_description, keywords,
  categories (name, slug),
  author:profiles (full_name)
`;

/* ──────────── Visibility helper ──────────── */

function applyVisibilityFilter<T>(query: T, includeShared: boolean) {
  if (includeShared) {
    return (query as { in: (column: string, values: string[]) => T }).in(
      "status",
      ["published", "shared"]
    );
  }
  return (query as { eq: (column: string, value: string) => T }).eq(
    "status",
    "published"
  );
}

/* ══════════════════════════════════════════════════════════════ */
/*  Server-side functions (use createClient from server.ts)      */
/* ══════════════════════════════════════════════════════════════ */

/**
 * Fetch published articles for the homepage.
 */
export async function fetchArticles(
  limit = 20
): Promise<ApiResult<Article[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("articles")
      .select(ARTICLE_LIST_SELECT)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) return { data: null, error: new Error(error.message) };
    return { data: (data as unknown as Article[]) || [], error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Fetch a single article by ID (published or shared).
 */
export async function fetchArticleById(
  id: string,
  supabase?: SupabaseClient
): Promise<ApiResult<ArticleDetail>> {
  try {
    const client = supabase || (await createClient());
    const { data, error } = await client
      .from("articles")
      .select(ARTICLE_DETAIL_SELECT)
      .in("status", ["published", "shared"])
      .eq("id", id)
      .single();

    if (error || !data) return { data: null, error: error ? new Error(error.message) : null };
    return { data: data as unknown as ArticleDetail, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Fetch articles by category slug (server-side).
 */
export async function fetchCategoryArticles(
  categorySlug: string,
  limit = 30,
  includeShared = false
): Promise<ApiResult<Article[]>> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("articles")
      .select(`
        id, title, summary, excerpt, thumbnail_url, created_at, published_at, views,
        categories!inner (name, slug)
      `)
      .eq("categories.slug", categorySlug);

    query = applyVisibilityFilter(query, includeShared);

    const { data, error } = await query
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) return { data: null, error: new Error(error.message) };
    return { data: (data as unknown as Article[]) || [], error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Fetch related articles by same category (excluding current article).
 */
export async function fetchRelatedArticles(
  categorySlug: string | null,
  articleId: string,
  supabase: SupabaseClient,
  includeShared = false
): Promise<Article[]> {
  if (!categorySlug) return [];

  let query = supabase
    .from("articles")
    .select(`
      id, title, summary, excerpt, thumbnail_url, created_at, published_at, views,
      categories!inner (name, slug)
    `)
    .neq("id", articleId)
    .eq("categories.slug", categorySlug);

  query = applyVisibilityFilter(query, includeShared);

  const { data } = await query
    .order("published_at", { ascending: false })
    .limit(5);

  return (data || []) as unknown as Article[];
}

/**
 * Fetch tags for a given article.
 */
export async function fetchArticleTags(
  articleId: string,
  supabase: SupabaseClient
): Promise<ArticleTag[]> {
  const { data } = await supabase
    .from("article_tags")
    .select("tag_id, tags(name)")
    .eq("article_id", articleId)
    .limit(8);

  type ArticleTagRow = {
    tag_id?: string | null;
    tags?: { name?: string | null } | { name?: string | null }[] | null;
  };

  return ((data as ArticleTagRow[] | null) || [])
    .map((row) => {
      const normalizedTag = Array.isArray(row.tags) ? row.tags[0] : row.tags;
      if (!row.tag_id || !normalizedTag?.name) return null;
      return { id: row.tag_id, name: normalizedTag.name };
    })
    .filter((row): row is ArticleTag => Boolean(row));
}

/**
 * Fetch articles sharing the same tag (series).
 */
export async function fetchSeriesArticlesByTag(
  tagId: string,
  articleId: string,
  supabase: SupabaseClient,
  includeShared = false
): Promise<Article[]> {
  let query = supabase
    .from("articles")
    .select(`
      id, title, summary, excerpt, thumbnail_url, created_at, published_at, views,
      categories (name, slug),
      article_tags!inner (tag_id)
    `)
    .eq("article_tags.tag_id", tagId)
    .neq("id", articleId);

  query = applyVisibilityFilter(query, includeShared);

  const { data } = await query
    .order("published_at", { ascending: false })
    .limit(6);

  return (data || []) as unknown as Article[];
}

/**
 * Increment article views via RPC.
 */
export async function incrementArticleViews(
  articleId: string,
  supabase: SupabaseClient
): Promise<void> {
  await supabase.rpc("increment_article_views", { article_id: articleId });
}

/**
 * Deduplicate articles by ID, excluding a set of known IDs.
 */
export function uniqueArticlesById(
  articles: Article[],
  excludeIds: Set<string>
): Article[] {
  const result: Article[] = [];
  for (const article of articles) {
    if (!article?.id || excludeIds.has(article.id)) continue;
    excludeIds.add(article.id);
    result.push(article);
  }
  return result;
}

