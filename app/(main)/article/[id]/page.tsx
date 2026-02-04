import { createClient } from "@/utils/supabase/server";
import { getDeviceType } from "@/utils/device";
import { DesktopArticleDetail } from "@/components/desktop/DesktopArticleDetail";
import { MobileArticleDetail } from "@/components/mobile/MobileArticleDetail";
import { notFound } from "next/navigation";

export default async function ArticlePage({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    const device = await getDeviceType();
    const { id } = await params;

    // Increment view count (fire and forget)
    // Ideally this should be done via RPC or separate API to avoid direct mutation permissions mismatch if RLS is strict
    // But for now, we'll try direct update if RLS allows, or just fetch.
    // Actually, to increment views safely, we usually need an RPC function.
    // For now, let's just fetch the article.

    const { data: article, error } = await supabase
        .from("articles")
        .select(`
      id, title, sub_title, content, summary, thumbnail_url, created_at, views,
      categories (name, slug),
      author_id
    `)
        .eq("id", id)
        .single();

    if (error || !article) {
        notFound();
    }

    // Increment views (Server-side side effect)
    await supabase.from("articles").update({ views: (article.views || 0) + 1 }).eq("id", id);

    if (device === "mobile") {
        return <MobileArticleDetail article={article} />;
    }

    return <DesktopArticleDetail article={article} />;
}
