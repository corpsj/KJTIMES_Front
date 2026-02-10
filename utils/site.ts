import { headers } from "next/headers";

const FALLBACK_SITE_URL = "https://kjtimes.co.kr";

export async function getSiteUrl() {
    const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_VERCEL_URL;
    if (envUrl) {
        if (envUrl.startsWith("http://") || envUrl.startsWith("https://")) {
            return envUrl;
        }
        return `https://${envUrl}`;
    }

    const headersList = await headers();
    const host = headersList.get("x-forwarded-host") || headersList.get("host");
    const proto = headersList.get("x-forwarded-proto") || "https";

    if (host) {
        return `${proto}://${host}`;
    }

    return FALLBACK_SITE_URL;
}
