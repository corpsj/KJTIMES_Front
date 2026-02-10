const NF_URL = process.env.NEXT_PUBLIC_NEWS_FACTORY_URL;
const NF_KEY = process.env.NEXT_PUBLIC_NEWS_FACTORY_API_KEY;

export function isNewsFactoryConfigured(): boolean {
  return Boolean(NF_URL && NF_KEY);
}

export async function nfFetch<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<T> {
  if (!NF_URL || !NF_KEY) {
    throw new Error("뉴스 팩토리 환경변수가 설정되지 않았습니다.");
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
