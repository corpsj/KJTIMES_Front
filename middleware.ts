import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { UAParser } from "ua-parser-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const SPECIAL_ISSUE_LOCK_COOKIE = "kj_special_issue_lock";
const SHARE_PATH_REGEX = /^\/share\/([^/]+)$/;

// 🔧 프리뷰 모드: 환경변수 사용 (단일 소스)
// NEXT_PUBLIC_PREVIEW_MODE=true 이면:
// - 메인 페이지 접속 시 /special-edition으로 리다이렉트
// - 창간특별호 외 다른 페이지 접근 차단
const PREVIEW_MODE = process.env.NEXT_PUBLIC_PREVIEW_MODE === "true";
const ALLOWED_PATHS_IN_PREVIEW = [
    "/special-edition",
    "/article",
    "/share",
    "/admin",
    "/login",
    "/signup",
    "/api",
    "/_next",
    "/favicon.ico",
    "/brand",
];

/**
 * Check if user is authenticated via Supabase session cookie
 */
async function isUserAuthenticated(request: NextRequest): Promise<boolean> {
    try {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key",
            {
                cookies: {
                    get(name: string) {
                        return request.cookies.get(name)?.value;
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        // Middleware cannot set cookies, so this is a no-op
                    },
                    remove(name: string, options: CookieOptions) {
                        // Middleware cannot remove cookies, so this is a no-op
                    },
                },
            }
        );

        const {
            data: { user },
        } = await supabase.auth.getUser();

        return !!user;
    } catch (error) {
        // If there's an error checking auth, treat as unauthenticated
        return false;
    }
}

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // 🔐 Admin authentication check (before device detection)
    // Protect /admin/* routes except /admin/login
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
        const isAuthenticated = await isUserAuthenticated(request);
        if (!isAuthenticated) {
            const redirectUrl = request.nextUrl.clone();
            redirectUrl.pathname = "/admin/login";
            return NextResponse.redirect(redirectUrl, { status: 307 });
        }
    }

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
    
    // 🔧 SPECIAL_ISSUE_LOCK_COOKIE disabled (Task 3)
    // const sharePathMatch = pathname.match(SHARE_PATH_REGEX);
    // if (sharePathMatch?.[1]) {
    //     const response = NextResponse.next({
    //         request: {
    //             headers: requestHeaders,
    //         },
    //     });
    //     response.cookies.set(SPECIAL_ISSUE_LOCK_COOKIE, sharePathMatch[1], {
    //         path: "/",
    //         sameSite: "lax",
    //         httpOnly: true,
    //         secure: request.nextUrl.protocol === "https:",
    //         maxAge: 60 * 60 * 12,
    //     });
    //     return response;
    // }
    // const lockedSpecialIssueSlug = request.cookies.get(SPECIAL_ISSUE_LOCK_COOKIE)?.value;
    // const isAdminPath = pathname.startsWith("/admin");
    // const isAuthPath = pathname === "/login" || pathname === "/signup";
    // if (lockedSpecialIssueSlug && !isAdminPath && !isAuthPath) {
    //     const redirectUrl = request.nextUrl.clone();
    //     redirectUrl.pathname = `/share/${lockedSpecialIssueSlug}`;
    //     redirectUrl.search = "";
    //     return NextResponse.redirect(redirectUrl);
    // }

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
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
