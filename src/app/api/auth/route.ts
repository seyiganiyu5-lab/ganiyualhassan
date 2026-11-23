import { NextRequest, NextResponse } from "next/server";
import {
  adminConfigured,
  checkCredentials,
  clearSessionCookie,
  clientKey,
  createSessionToken,
  isAdmin,
  lockedFor,
  recordFailure,
  recordSuccess,
  setSessionCookie,
} from "@/lib/auth";

// Credentials come only from ADMIN_USERNAME / ADMIN_PASSWORD in the
// environment. There are deliberately no defaults in code.

/** Is this browser signed in? */
export async function GET(request: NextRequest) {
  return NextResponse.json({ authed: await isAdmin(request), configured: adminConfigured() });
}

/** Sign in. */
export async function POST(request: NextRequest) {
  if (!adminConfigured()) {
    return NextResponse.json(
      { success: false, error: "Admin login is not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD." },
      { status: 503 }
    );
  }

  const key = clientKey(request);
  const wait = lockedFor(key);
  if (wait) {
    return NextResponse.json(
      { success: false, error: "Too many attempts. Try again later.", retryAfter: wait },
      { status: 429, headers: { "Retry-After": String(wait) } }
    );
  }

  try {
    const { username, password } = await request.json();
    if (typeof username === "string" && typeof password === "string" && checkCredentials(username, password)) {
      recordSuccess(key);
      const res = NextResponse.json({ success: true });
      setSessionCookie(res, await createSessionToken());
      return res;
    }
    recordFailure(key);
    return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ success: false, error: "Auth failed" }, { status: 500 });
  }
}

/** Sign out. */
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  clearSessionCookie(res);
  return res;
}
