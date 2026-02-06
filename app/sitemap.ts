import type { MetadataRoute } from "next";
import { createClient } from "@/utils/supabase/server";
import { getSiteUrl } from "@/utils/site";

export const dynamic = "force-dynamic";

const CATEGORY_PATHS = [
    "/politics",
    "/economy",
    "/society",
    "/culture",
    "/opinion",
    "/sports",
];

const INFO_PATHS = [
    "/about",
    "/advertise",
    "/privacy",
    "/editorial",
    "/corrections",
    "/subscribe",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = await createClient();
    const siteUrl = await getSiteUrl();

    const { data: articles } = await supabase
        .from("articles")
        .select("id, created_at, published_at, updated_at")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(1000);

    const now = new Date();

    const staticUrls: MetadataRoute.Sitemap = [
        { url: siteUrl, lastModified: now },
        ...CATEGORY_PATHS.map((path) => ({ url: `${siteUrl}${path}`, lastModified: now })),
        ...INFO_PATHS.map((path) => ({ url: `${siteUrl}${path}`, lastModified: now })),
    ];

    const articleUrls: MetadataRoute.Sitemap = (articles || []).map((article) => ({
        url: `${siteUrl}/article/${article.id}`,
        lastModified: new Date(article.updated_at || article.published_at || article.created_at),
    }));

    return [...staticUrls, ...articleUrls];
}
