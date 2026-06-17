import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const messages = await db.message.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(messages);
  } catch (error) {
    console.error("GET messages error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = await db.message.create({
      data: {
        name: String(body.name || ""),
        email: String(body.email || ""),
        subject: String(body.subject || ""),
        message: String(body.message || ""),
        phone: body.phone ? String(body.phone) : null,
      },
    });
    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("POST message error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
