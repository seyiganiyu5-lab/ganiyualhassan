import "server-only";
import { NextRequest, NextResponse } from "next/server";

/** The caller's address, as reported by the hosting proxy. */
export function clientIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "local";
}

/**
 * Fixed-window rate limiter. In-memory, so it is per server instance:
 * it slows down floods and scripts, it is not a hard global quota.
 */
export function rateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return (key: string) => {
    const now = Date.now();
    if (hits.size > 5000) {
      for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
    }
    const h = hits.get(key);
    if (!h || h.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return { ok: true, retryAfter: 0 };
    }
    h.count += 1;
    return h.count <= limit ? { ok: true, retryAfter: 0 } : { ok: false, retryAfter: Math.ceil((h.resetAt - now) / 1000) };
  };
}

export function tooMany(retryAfter: number) {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}

/**
 * True when the request was sent by this site's own pages. Browsers always
 * send Origin (or Sec-Fetch-Site) on cross-site POST/PUT/DELETE, so this
 * blocks other websites from submitting requests with a visitor's cookies.
 */
export function isSameOrigin(request: NextRequest) {
  const site = request.headers.get("sec-fetch-site");
  if (site) return site === "same-origin" || site === "none";
  const origin = request.headers.get("origin");
  if (!origin) return true; // non-browser clients (curl, server-to-server) don't carry cookies by default
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/** Rejects bodies larger than `max` bytes before they are read. */
export function bodyTooLarge(request: NextRequest, max: number) {
  const len = Number(request.headers.get("content-length") || 0);
  return len > max;
}
