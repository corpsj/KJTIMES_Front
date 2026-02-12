import { createClient } from "@/utils/supabase/server";
import { Article } from "@/types";

export type ApiResult<T> = { data: T | null; error: Error | null };

export type AuthorProfile = {
  id: string;
  full_name: string | null;
  email?: string | null;
  role?: string | null;
};

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Fetch author profile by ID (server-side).
 */
export async function fetchAuthorProfile(
  authorId: string
): Promise<ApiResult<AuthorProfile>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .eq("id", authorId)
      .single();

    if (error || !data) return { data: null, error: error ? new Error(error.message) : null };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Fetch articles by author, excluding a specific article (server-side).
 * Used in article detail page for "More by this author" section.
 */
export async function fetchAuthorArticles(
  authorId: string | null | undefined,
  excludeArticleId: string,
  supabase: SupabaseClient,
  includeShared = false
): Promise<Article[]> {
  if (!authorId) return [];

  let query = supabase
    .from("articles")
    .select(`
      id, title, summary, excerpt, thumbnail_url, created_at, published_at, views,
      categories (name, slug)
    `)
    .eq("author_id", authorId)
    .neq("id", excludeArticleId);

  if (includeShared) {
    query = query.in("status", ["published", "shared"]);
  } else {
    query = query.eq("status", "published");
  }

  const { data } = await query
    .order("published_at", { ascending: false })
    .limit(6);

  return (data || []) as unknown as Article[];
}
