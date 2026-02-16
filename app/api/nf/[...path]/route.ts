import { NextResponse } from "next/server";

const NF_URL = process.env.NEWS_FACTORY_URL;
const NF_KEY = process.env.NEWS_FACTORY_API_KEY;

async function proxyToNf(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  if (!NF_URL || !NF_KEY) {
    return NextResponse.json(
      { error: "뉴스 팩토리 서버 환경변수가 설정되지 않았습니다." },
      { status: 503 }
    );
  }

  const { path } = await params;
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
