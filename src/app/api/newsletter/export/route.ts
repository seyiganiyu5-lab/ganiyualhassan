import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Export all subscribers as a CSV file download.
export async function GET() {
  try {
    const subscribers = await db.newsletter.findMany({
      orderBy: { createdAt: "desc" },
    });

    const header = "email,subscribed_at\n";
    const rows = subscribers
      .map((s) => {
        // RFC 4180 — wrap email in quotes and escape any inner quotes.
        const safeEmail = `"${s.email.replace(/"/g, '""')}"`;
        const date = s.createdAt.toISOString();
        return `${safeEmail},${date}`;
      })
      .join("\n");

    const csv = header + rows;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="subscribers-${Date.now()}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Export newsletter error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
