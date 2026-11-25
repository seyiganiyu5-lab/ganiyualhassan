import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { readTestimonial } from "../shared";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    const { id } = await params;
    const data = readTestimonial(await request.json());
    if (!data.quote || !data.name) {
      return NextResponse.json({ error: "Quote and name are required" }, { status: 400 });
    }
    const updated = await db.testimonial.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT testimonial error:", error);
    return NextResponse.json({ error: "Failed to update testimonial" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    const { id } = await params;
    await db.testimonial.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE testimonial error:", error);
    return NextResponse.json({ error: "Failed to delete testimonial" }, { status: 500 });
  }
}
