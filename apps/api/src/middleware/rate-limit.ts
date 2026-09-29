import type { Context, Next } from "hono";
import { RateLimitError } from "../lib/errors.js";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

function sweep(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

function clientKey(c: Context): string {
  const forwarded = c.req.header("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return c.req.header("x-real-ip") ?? "unknown";
}

export function rateLimit(options: { limit: number; windowMs: number; name: string }) {
  return async (c: Context, next: Next) => {
    const now = Date.now();
    if (buckets.size > 5000) sweep(now);

    const key = `${options.name}:${clientKey(c)}`;
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + options.windowMs });
      return next();
    }

    if (bucket.count >= options.limit) {
      throw new RateLimitError();
    }

    bucket.count += 1;
    return next();
  };
}
