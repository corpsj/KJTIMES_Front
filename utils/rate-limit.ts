interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

export function createRateLimiter(maxRequests: number, windowMs: number) {
  const hits = new Map<string, { count: number; resetTime: number }>();

  return function checkRateLimit(identifier: string): RateLimitResult {
    const now = Date.now();
    const record = hits.get(identifier);

    if (!record || now >= record.resetTime) {
      hits.set(identifier, { count: 1, resetTime: now + windowMs });
      return { success: true, remaining: maxRequests - 1, reset: now + windowMs };
    }

    if (record.count >= maxRequests) {
      return { success: false, remaining: 0, reset: record.resetTime };
    }

    record.count++;
    return { success: true, remaining: maxRequests - record.count, reset: record.resetTime };
  };
}
