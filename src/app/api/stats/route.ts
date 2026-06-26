import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
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
