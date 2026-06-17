import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET current CV URL
export async function GET() {
  try {
    const setting = await db.setting.findUnique({ where: { key: "cvUrl" } });
    return NextResponse.json({ cvUrl: setting?.value || "" });
  } catch (error) {
    console.error("GET cv error:", error);
    return NextResponse.json({ cvUrl: "" });
  }
}

// POST to set CV URL (admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cvUrl = String(body.cvUrl || "");

    const existing = await db.setting.findUnique({ where: { key: "cvUrl" } });
    if (existing) {
      await db.setting.update({ where: { key: "cvUrl" }, data: { value: cvUrl } });
    } else {
      await db.setting.create({ data: { key: "cvUrl", value: cvUrl } });
    }

    return NextResponse.json({ success: true, cvUrl });
  } catch (error) {
    console.error("POST cv error:", error);
    return NextResponse.json({ error: "Failed to save CV" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await db.setting.deleteMany({ where: { key: "cvUrl" } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE cv error:", error);
    return NextResponse.json({ error: "Failed to delete CV" }, { status: 500 });
  }
}
