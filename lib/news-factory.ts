// SECURITY: API key is server-side only. Client uses /api/nf proxy.
const NF_ENABLED = process.env.NEXT_PUBLIC_NEWS_FACTORY_ENABLED === "true";

export function isNewsFactoryConfigured(): boolean {
  return NF_ENABLED;
}

// Client-side: routes through /api/nf/[...path] proxy (key injected server-side)
export async function nfFetch<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const proxyPath = path.replace(/^\/api\/v1\//, "");

  const res = await fetch(`/api/nf/${proxyPath}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `NF API Error: ${res.status}${text ? ` — ${text.slice(0, 200)}` : ""}`
    );
  }

  return res.json() as Promise<T>;
}

export async function nfServerFetch<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const NF_URL = process.env.NEWS_FACTORY_URL;
  const NF_KEY = process.env.NEWS_FACTORY_API_KEY;

  if (!NF_URL || !NF_KEY) {
    throw new Error("뉴스 팩토리 서버 환경변수가 설정되지 않았습니다.");
  }

  const res = await fetch(`${NF_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${NF_KEY}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `NF API Error: ${res.status}${text ? ` — ${text.slice(0, 200)}` : ""}`
    );
  }

  return res.json() as Promise<T>;
}
