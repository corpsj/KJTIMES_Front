/**
 * 간단한 인메모리 Rate Limiter (Vercel Serverless 환경용)
 *
 * 주의: Serverless 환경에서는 인스턴스별로 독립적이므로 완벽하지 않지만,
 * 단일 인스턴스에서의 남용을 방지합니다.
 * 프로덕션 스케일에서는 Vercel KV 또는 Upstash Redis로 교체 권장.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// 오래된 엔트리 정리 (1000개 초과 시)
function cleanup() {
  if (store.size <= 1000) return;
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}

export interface RateLimitConfig {
  /** 윈도우 내 최대 요청 수 */
  limit: number;
  /** 윈도우 크기 (밀리초) */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

/**
 * Rate limit 체크
 * @param key 식별자 (IP, user ID 등)
 * @param config 설정
 */
export function rateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  cleanup();
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    // 새 윈도우 시작
    const resetAt = now + config.windowMs;
    store.set(key, { count: 1, resetAt });
    return { success: true, limit: config.limit, remaining: config.limit - 1, resetAt };
  }

  if (entry.count >= config.limit) {
    return { success: false, limit: config.limit, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * IP 기반 rate limit 체크를 위한 IP 추출
 */
export function getClientIp(request: Request): string {
  const headers = new Headers(request.headers);
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
