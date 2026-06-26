import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim().toLowerCase();

    const subscribers = await db.newsletter.findMany({
      where: q ? { email: { contains: q } } : undefined,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(subscribers);
  } catch (error) {
    console.error("GET newsletter error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const existing = await db.newsletter.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: true, message: "Already subscribed" });
    }

    await db.newsletter.create({ data: { email } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Newsletter error:", error);
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
  }
}

// Bulk delete by ids
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const ids: string[] = Array.isArray(body?.ids) ? body.ids : [];

    if (ids.length === 0) {
      return NextResponse.json({ error: "No ids provided" }, { status: 400 });
    }

    await db.newsletter.deleteMany({ where: { id: { in: ids } } });
    return NextResponse.json({ success: true, deleted: ids.length });
  } catch (error) {
    console.error("DELETE newsletter error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
