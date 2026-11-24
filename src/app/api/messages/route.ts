import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";
import { bodyTooLarge, clientIp, forbidden, isSameOrigin, rateLimiter, tooMany } from "@/lib/security";

export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
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

// Strip control characters (keeps newlines and tabs) and trim.
const clean = (max: number) =>
  z
    .string()
    .transform((s) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim())
    .pipe(z.string().max(max));

const MessageSchema = z.object({
  name: clean(100).pipe(z.string().min(1)),
  email: clean(200).pipe(z.email()),
  subject: clean(200).optional().default(""),
  message: clean(5000).pipe(z.string().min(5)),
  phone: clean(40).optional(),
  website: z.string().optional(), // honeypot: hidden from people, bots fill it in
});

// 5 messages per address every 10 minutes.
const limit = rateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return forbidden();
  if (bodyTooLarge(request, 20_000)) {
    return NextResponse.json({ error: "Message too large" }, { status: 413 });
  }
  const rl = limit(clientIp(request));
  if (!rl.ok) return tooMany(rl.retryAfter);

  try {
    const parsed = MessageSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Please check the form and try again." }, { status: 400 });
    }
    const { website, phone, ...data } = parsed.data;
    // A filled honeypot means a bot: pretend it worked, store nothing.
    if (website) return NextResponse.json({ success: true }, { status: 201 });

    await db.message.create({ data: { ...data, phone: phone || null } });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("POST message error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
