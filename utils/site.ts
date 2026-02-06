import { headers } from "next/headers";

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

    return "http://localhost:3000";
}
