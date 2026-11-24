import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { clientIp, isSameOrigin } from "@/lib/security";

/**
 * Admin session: a signed, HttpOnly cookie. The server is the only thing
 * that can create one (it needs the secret), and every admin API route
 * checks it — hiding the admin screens in the browser is not the security.
 */

export const SESSION_COOKIE = "admin_session";
const SESSION_TTL_S = 60 * 60 * 12; // 12 hours

const USERNAME = process.env.ADMIN_USERNAME || "";
const PASSWORD = process.env.ADMIN_PASSWORD || "";
// AUTH_SECRET is preferred. Falling back to the credentials means changing
// the password also signs everyone out.
const SECRET = process.env.AUTH_SECRET || (USERNAME && PASSWORD ? `${USERNAME}\u0000${PASSWORD}` : "");

/** Admin login is disabled entirely until credentials are set in the environment. */
export const adminConfigured = () => Boolean(USERNAME && PASSWORD && SECRET);

const enc = new TextEncoder();

function b64url(bytes: ArrayBuffer | Uint8Array) {
  return Buffer.from(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)).toString("base64url");
}

async function hmac(data: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(SECRET), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

/** Compares without leaking where the strings differ. */
export function safeEqual(a: string, b: string) {
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  let diff = ab.length ^ bb.length;
  for (let i = 0; i < Math.max(ab.length, bb.length); i++) diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0);
  return diff === 0;
}

export function checkCredentials(username: string, password: string) {
  if (!adminConfigured()) return false;
  // Evaluate both so timing doesn't reveal which one was wrong.
  const u = safeEqual(username, USERNAME);
  const p = safeEqual(password, PASSWORD);
  return u && p;
}

export async function createSessionToken() {
  const payload = b64url(enc.encode(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + SESSION_TTL_S })));
  return `${payload}.${await hmac(payload)}`;
}

export async function verifySessionToken(token: string | undefined) {
  if (!token || !adminConfigured()) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig || !safeEqual(sig, await hmac(payload))) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof exp === "number" && exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

export async function isAdmin(request: NextRequest) {
  return verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
}

/**
 * Returns a response to send back (401/403), or null if the caller is signed
 * in. Changes (anything but GET) must also come from this site's own pages.
 */
export async function requireAdmin(request: NextRequest) {
  if (request.method !== "GET" && request.method !== "HEAD" && !isSameOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (await isAdmin(request)) return null;
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_S,
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

// ── Login throttling: 5 wrong attempts locks that address out for 10 minutes.
// In-memory, so it's per server instance — a speed bump, not a wall.
const attempts = new Map<string, { fails: number; lockedUntil: number }>();
const MAX_FAILS = 5;
const LOCK_MS = 10 * 60 * 1000;

export const clientKey = clientIp;

export function lockedFor(key: string) {
  const a = attempts.get(key);
  return a && a.lockedUntil > Date.now() ? Math.ceil((a.lockedUntil - Date.now()) / 1000) : 0;
}

export function recordFailure(key: string) {
  const a = attempts.get(key) ?? { fails: 0, lockedUntil: 0 };
  a.fails += 1;
  if (a.fails >= MAX_FAILS) {
    a.fails = 0;
    a.lockedUntil = Date.now() + LOCK_MS;
  }
  attempts.set(key, a);
}

export function recordSuccess(key: string) {
  attempts.delete(key);
}
