import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { readTestimonial } from "./shared";

// Admin list: includes hidden testimonials.
export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    const list = await db.testimonial.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
    return NextResponse.json(list);
  } catch (error) {
    console.error("GET testimonials error:", error);
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    const data = readTestimonial(await request.json());
    if (!data.quote || !data.name) {
      return NextResponse.json({ error: "Quote and name are required" }, { status: 400 });
    }
    const last = await db.testimonial.findFirst({ orderBy: { order: "desc" } });
    const created = await db.testimonial.create({ data: { ...data, order: (last?.order ?? -1) + 1 } });
    return NextResponse.json(created);
  } catch (error) {
    console.error("POST testimonial error:", error);
    return NextResponse.json({ error: "Failed to create testimonial" }, { status: 500 });
  }
}

// Reorder: body is { ids: string[] } in the new order.
export async function PATCH(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids)) return NextResponse.json({ error: "ids required" }, { status: 400 });
    await db.$transaction(
      ids.map((id: string, order: number) => db.testimonial.update({ where: { id: String(id) }, data: { order } }))
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH testimonials error:", error);
    return NextResponse.json({ error: "Failed to reorder" }, { status: 500 });
  }
}
