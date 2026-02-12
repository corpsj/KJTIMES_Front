import { createClient } from "@/utils/supabase/server";

export type ApiResult<T> = { data: T | null; error: Error | null };

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

export type CategoryWithCount = Category & {
  article_count: number;
};

/**
 * Fetch all categories (server-side).
 */
export async function fetchCategories(): Promise<ApiResult<Category[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, description")
      .order("name");

    if (error) return { data: null, error: new Error(error.message) };
    return { data: data || [], error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Fetch a single category by slug (server-side).
 */
export async function fetchCategoryBySlug(
  slug: string
): Promise<ApiResult<Category>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, description")
      .eq("slug", slug)
      .single();

    if (error || !data) return { data: null, error: error ? new Error(error.message) : null };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}
