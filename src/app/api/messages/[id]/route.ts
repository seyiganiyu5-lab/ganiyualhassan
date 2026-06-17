import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const message = await db.message.update({
      where: { id },
      data: {
        ...(body.read !== undefined && { read: Boolean(body.read) }),
        ...(body.replied !== undefined && { replied: Boolean(body.replied) }),
      },
    });
    return NextResponse.json(message);
  } catch (error) {
    console.error("PATCH message error:", error);
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.message.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE message error:", error);
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }
}
