import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    const [projectCount, messageCount] = await Promise.all([
      db.project.count(),
      db.message.count(),
    ]);

    return NextResponse.json({
      totalProjects: projectCount,
      totalMessages: messageCount,
      downloads: 0,
    });
  } catch (error) {
    console.error("GET stats error:", error);
    return NextResponse.json({
      totalProjects: 0,
      totalMessages: 0,
      downloads: 0,
    });
  }
}
