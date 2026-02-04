import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { UAParser } from "ua-parser-js";

export function middleware(request: NextRequest) {
    const url = request.nextUrl;
    const userAgent = request.headers.get("user-agent") || "";
    const parser = new UAParser(userAgent);
    const device = parser.getDevice();

    // Simple check: if type is mobile or tablet, consider it mobile.
    // Otherwise desktop (undefined type is usually desktop).
    const isMobile = device.type === "mobile" || device.type === "tablet";
    const deviceType = isMobile ? "mobile" : "desktop";

    // Create a new response and add the custom header
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-device-type", deviceType);

    // You can also rewrite here if you wanted separate routes like /m/..., 
    // but header-based separation with same URL is requested to keep URLs clean 
    // or strictly separated views.

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, fonts, etc - add extensions if needed)
         */
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
