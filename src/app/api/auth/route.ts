import { NextRequest, NextResponse } from "next/server";

// Simple admin auth - credentials stored in env or defaults
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ganiyu2024";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
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
