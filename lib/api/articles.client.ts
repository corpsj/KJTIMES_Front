import { createClient as createBrowserClient } from "@/utils/supabase/client";
import { Article } from "@/types";

export type ApiResult<T> = { data: T | null; error: Error | null };

type BrowserClient = ReturnType<typeof createBrowserClient>;

const ARTICLE_LIST_SELECT = `
  id, title, summary, excerpt, thumbnail_url, created_at, published_at, views,
  categories (name, slug)
`;

/**
 * Search articles by query string (client-side, uses browser client).
 */
export async function searchArticlesClient(
  query: string,
  limit = 50
): Promise<ApiResult<Article[]>> {
  try {
    const supabase = createBrowserClient();
    const escapedQuery = query.replace(/%/g, "\\%").replace(/_/g, "\\_");
    const like = `%${escapedQuery}%`;

    const { data, error } = await supabase
      .from("articles")
      .select(ARTICLE_LIST_SELECT)
      .in("status", ["published", "shared"])
      .or(`title.ilike.${like},summary.ilike.${like},excerpt.ilike.${like}`)
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) return { data: null, error: new Error(error.message) };
    return { data: (data as unknown as Article[]) || [], error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Fetch article stats for admin dashboard. Accepts pre-created browser client.
 */
export async function fetchArticleStats(supabase: BrowserClient) {
  const [totalRes, publishedRes, draftRes, pendingRes] = await Promise.all([
    supabase.from("articles").select("id", { count: "exact", head: true }),
    supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "pending_review"),
  ]);

  return {
    total: totalRes.count ?? 0,
    published: publishedRes.count ?? 0,
    draft: draftRes.count ?? 0,
    pending: pendingRes.count ?? 0,
  };
}

/**
 * Fetch paginated admin article list with filters. Accepts pre-created browser client.
 */
export async function fetchAdminArticles(
  supabase: BrowserClient,
  options: {
    statusFilter: string;
    searchTerm: string;
    sortFilter: string;
    page: number;
    pageSize: number;
  }
) {
  const { statusFilter, searchTerm, sortFilter, page, pageSize } = options;
  const term = searchTerm.trim().replace(/[%]/g, "");

  let countQuery = supabase
    .from("articles")
    .select("id", { count: "exact", head: true });
  if (statusFilter !== "all") countQuery = countQuery.eq("status", statusFilter);
  if (term) countQuery = countQuery.or(`title.ilike.%${term}%,slug.ilike.%${term}%`);
  const { count } = await countQuery;
  const total = count ?? 0;

  const maxPage = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, maxPage);
  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("articles")
    .select(
      "id, title, slug, status, created_at, updated_at, published_at, views, categories(name, slug)"
    );

  if (statusFilter !== "all") query = query.eq("status", statusFilter);
  if (term) query = query.or(`title.ilike.%${term}%,slug.ilike.%${term}%`);

  switch (sortFilter) {
    case "oldest":
      query = query.order("updated_at", { ascending: true });
      break;
    default:
      query = query.order("updated_at", { ascending: false });
      break;
  }

  query = query.range(from, to);
  const { data } = await query;

  return { articles: data || [], total, safePage };
}
