// Simple in-memory limiter (per server instance). Fine for a course project; use Redis/Upstash for production.
const hits = new Map<string, number[]>();

export function rateLimit(key: string, max = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) { hits.set(key, recent); return false; }
  recent.push(now);
  hits.set(key, recent);
  return true;
}
