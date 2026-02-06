import { CategoryPageTemplate } from "@/components/layout/CategoryPageTemplate";
import { createClient } from "@/utils/supabase/server";

export const revalidate = 60;

export default async function SpecialEditionPage() {
    const supabase = await createClient();
    const { data } = await supabase
        .from("articles")
        .select(`
      id, title, summary, excerpt, thumbnail_url, created_at, published_at, views,
      categories!inner (name, slug)
    `)
        .in("status", ["published", "shared"])
        .eq("categories.slug", "special-edition")
        .order("published_at", { ascending: false })
        .limit(30);

    return <CategoryPageTemplate title="창간특별호" articles={data || []} />;
}
