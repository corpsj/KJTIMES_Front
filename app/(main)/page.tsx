import { getDeviceType } from "@/utils/device";
import { DesktopMain } from "@/components/desktop/DesktopMain";
import { MobileMain } from "@/components/mobile/MobileMain";
import { createClient } from "@/utils/supabase/server";

// Revalidate every 60 seconds
export const revalidate = 60;

export default async function Home() {
  const device = await getDeviceType();
  const supabase = await createClient();

  // Fetch articles
  const { data: articles } = await supabase
    .from("articles")
    .select(`
      id, title, summary, thumbnail_url, created_at,
      categories (name, slug)
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(20);

  const safeArticles = articles || [];

  if (device === "mobile") {
    return <MobileMain articles={safeArticles} />;
  }

  return <DesktopMain articles={safeArticles} />;
}
