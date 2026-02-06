import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getSiteUrl } from "@/utils/site";

const PUBLISHER_NAME = "광전타임즈";
const PUBLISHER_LANGUAGE = "ko";

function escapeXml(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

export const dynamic = "force-dynamic";

export async function GET() {
    const supabase = await createClient();
    const siteUrl = await getSiteUrl();

    const sinceDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();

    const { data: articles } = await supabase
        .from("articles")
        .select("id, title, published_at, created_at")
        .eq("status", "published")
        .gte("published_at", sinceDate)
        .order("published_at", { ascending: false })
        .limit(1000);

    const items = (articles || []).map((article) => {
        const publishedDate = article.published_at || article.created_at;
        const loc = `${siteUrl}/article/${article.id}`;
        const title = escapeXml(article.title || "");

        return `\n  <url>\n    <loc>${loc}</loc>\n    <news:news>\n      <news:publication>\n        <news:name>${PUBLISHER_NAME}</news:name>\n        <news:language>${PUBLISHER_LANGUAGE}</news:language>\n      </news:publication>\n      <news:publication_date>${publishedDate}</news:publication_date>\n      <news:title>${title}</news:title>\n    </news:news>\n  </url>`;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${items.join("")}\n</urlset>`;

    return new NextResponse(xml, {
        headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=300",
        },
    });
}
