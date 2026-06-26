import { NextRequest, NextResponse } from "next/server";

// Admin credentials — read from env, with secure defaults.
// Override in production by setting ADMIN_USERNAME / ADMIN_PASSWORD in .env
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "ALHASSAN";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "@Hassify1010";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Case-sensitive comparison on both fields
    if (
      typeof username === "string" &&
      typeof password === "string" &&
      username === ADMIN_USERNAME &&
      password === ADMIN_PASSWORD
    ) {
      // Generate a simple session token
      const token = Buffer.from(`${username}:${Date.now()}`).toString("base64");
      return NextResponse.json({ success: true, token });
    }

    return NextResponse.json(
      { success: false, error: "Invalid credentials" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Auth failed" }, { status: 500 });
  }
}
