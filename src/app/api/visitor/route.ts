import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST() {
  try {
    // Increment visitor count
    let visitor = await db.visitor.findFirst();
    if (!visitor) {
      visitor = await db.visitor.create({ data: { count: 1 } });
    } else {
      visitor = await db.visitor.update({
        where: { id: visitor.id },
        data: { count: { increment: 1 } },
      });
    }
    return NextResponse.json({ count: visitor.count });
  } catch (error) {
    console.error("Visitor POST error:", error);
    return NextResponse.json({ count: 0 });
  }
}

export async function GET() {
  try {
    const visitor = await db.visitor.findFirst();
    return NextResponse.json({ count: visitor?.count ?? 0 });
  } catch (error) {
    console.error("Visitor GET error:", error);
    return NextResponse.json({ count: 0 });
  }
}
