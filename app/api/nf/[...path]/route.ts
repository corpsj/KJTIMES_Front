import { NextResponse } from "next/server";
import { requireAuth } from "@/utils/supabase/auth-check";

const NF_URL = process.env.NEWS_FACTORY_URL;
const NF_KEY = process.env.NEWS_FACTORY_API_KEY;
const ALLOWED_PATHS = ["articles", "regions", "categories", "subscriptions", "deliveries"];
const MAX_BODY_SIZE = 1 * 1024 * 1024; // 1MB
const TIMEOUT_MS = 30_000; // 30s

async function proxyToNf(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  if (!NF_URL || !NF_KEY) {
    return NextResponse.json(
      { error: "뉴스 팩토리 서버 환경변수가 설정되지 않았습니다." },
      { status: 503 }
    );
  }

  const { path } = await params;

  const rootPath = path[0];
  if (!ALLOWED_PATHS.includes(rootPath)) {
    return NextResponse.json(
      { error: "허용되지 않은 경로입니다." },
      { status: 403 }
    );
  }

  const contentLength = parseInt(request.headers.get("content-length") || "0", 10);
  if (contentLength > MAX_BODY_SIZE) {
    return NextResponse.json(
      { error: "요청 본문이 너무 큽니다." },
      { status: 413 }
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

  const fetchOptions: RequestInit = {
    method: request.method,
    headers,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    fetchOptions.body = await request.text();
  }

  try {
    const res = await fetch(targetUrl, fetchOptions);
    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" },
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "TimeoutError") {
      return NextResponse.json({ error: "프록시 요청 시간 초과" }, { status: 504 });
    }
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `프록시 요청 실패: ${message}` },
      { status: 502 }
    );
  }
}

export const GET = proxyToNf;
export const POST = proxyToNf;
export const PATCH = proxyToNf;
export const DELETE = proxyToNf;
