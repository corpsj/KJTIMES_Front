import { NextResponse } from "next/server";
import { requireAuth } from "@/utils/supabase/auth-check";

const NF_URL = process.env.NEWS_FACTORY_URL;
const NF_KEY = process.env.NEWS_FACTORY_API_KEY;

/** 허용된 프록시 경로 패턴 */
const ALLOWED_PATHS = [
  /^articles(\/.*)?$/,
  /^regions$/,
  /^categories$/,
  /^subscriptions(\/.*)?$/,
  /^deliveries(\/.*)?$/,
];

const MAX_BODY_SIZE = 1024 * 1024; // 1MB
const FETCH_TIMEOUT_MS = 30_000; // 30초

function isPathAllowed(pathSegments: string[]): boolean {
  const joined = pathSegments.join("/");
  return ALLOWED_PATHS.some((pattern) => pattern.test(joined));
}

async function proxyToNf(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  // 인증 확인
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  if (!NF_URL || !NF_KEY) {
    return NextResponse.json(
      { error: "뉴스 팩토리 서버 환경변수가 설정되지 않았습니다." },
      { status: 503 }
    );
  }

  const { path } = await params;

  // 경로 화이트리스트 검증
  if (!isPathAllowed(path)) {
    return NextResponse.json(
      { error: "허용되지 않은 API 경로입니다." },
      { status: 403 }
    );
  }

  const targetPath = `/api/v1/${path.join("/")}`;
  const url = new URL(request.url);
  const queryString = url.search;

  const targetUrl = `${NF_URL}${targetPath}${queryString}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${NF_KEY}`,
  };

  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  const fetchOptions: RequestInit = {
    method: request.method,
    headers,
    signal: controller.signal,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    const body = await request.text();
    if (body.length > MAX_BODY_SIZE) {
      clearTimeout(timeout);
      return NextResponse.json(
        { error: "요청 본문이 너무 큽니다." },
        { status: 413 }
      );
    }
    fetchOptions.body = body;
  }

  try {
    const res = await fetch(targetUrl, fetchOptions);
    clearTimeout(timeout);
    const data = await res.text();

    return new NextResponse(data, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" },
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof DOMException && err.name === "AbortError") {
      return NextResponse.json(
        { error: "외부 서버 응답 시간 초과" },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: "프록시 요청 실패" },
      { status: 502 }
    );
  }
}

export const GET = proxyToNf;
export const POST = proxyToNf;
export const PATCH = proxyToNf;
export const DELETE = proxyToNf;
