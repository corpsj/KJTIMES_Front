import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/utils/site";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
    const siteUrl = await getSiteUrl();

    return {
        rules: {
            userAgent: "*",
            allow: "/",
        },
        sitemap: [
            `${siteUrl}/sitemap.xml`,
            `${siteUrl}/news-sitemap.xml`,
        ],
    };
}
