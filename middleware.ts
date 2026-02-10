import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { UAParser } from "ua-parser-js";

const SPECIAL_ISSUE_LOCK_COOKIE = "kj_special_issue_lock";
const SHARE_PATH_REGEX = /^\/share\/([^/]+)$/;

// 🔧 프리뷰 모드 설정
// PREVIEW_MODE=true 이면:
// - 메인 페이지 접속 시 /special-edition으로 리다이렉트
// - 창간특별호 외 다른 페이지 접근 차단
// 해제하려면 아래 값을 false로 변경
const PREVIEW_MODE = false;
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

export function middleware(request: NextRequest) {
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
    const pathname = request.nextUrl.pathname;
    
    // 🔧 프리뷰 모드: 메인 페이지 → 창간특별호로 리다이렉트
    if (pathname === "/" && PREVIEW_MODE) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/special-edition";
        return NextResponse.redirect(redirectUrl);
    }
    
    // 🔧 프리뷰 모드: 허용된 경로 외 접근 차단
    if (PREVIEW_MODE) {
        const isAllowed = ALLOWED_PATHS_IN_PREVIEW.some(path => 
            pathname === path || pathname.startsWith(path + "/") || pathname.startsWith(path)
        );
        if (!isAllowed && pathname !== "/") {
            const redirectUrl = request.nextUrl.clone();
            redirectUrl.pathname = "/special-edition";
            return NextResponse.redirect(redirectUrl);
        }
    }
    
    const sharePathMatch = pathname.match(SHARE_PATH_REGEX);

    if (sharePathMatch?.[1]) {
        const response = NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
        response.cookies.set(SPECIAL_ISSUE_LOCK_COOKIE, sharePathMatch[1], {
            path: "/",
            sameSite: "lax",
            httpOnly: true,
            secure: request.nextUrl.protocol === "https:",
            maxAge: 60 * 60 * 12,
        });
        return response;
    }

    const lockedSpecialIssueSlug = request.cookies.get(SPECIAL_ISSUE_LOCK_COOKIE)?.value;
    const isAdminPath = pathname.startsWith("/admin");
    const isAuthPath = pathname === "/login" || pathname === "/signup";

    if (lockedSpecialIssueSlug && !isAdminPath && !isAuthPath) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = `/share/${lockedSpecialIssueSlug}`;
        redirectUrl.search = "";
        return NextResponse.redirect(redirectUrl);
    }

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
