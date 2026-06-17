import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [projectCount, messageCount, visitor] = await Promise.all([
      db.project.count(),
      db.message.count(),
      db.visitor.findFirst(),
    ]);

    return NextResponse.json({
      totalProjects: projectCount,
      totalMessages: messageCount,
      websiteViews: visitor?.count ?? 0,
      downloads: 0,
    });
  } catch (error) {
    console.error("GET stats error:", error);
    return NextResponse.json({
      totalProjects: 0,
      totalMessages: 0,
      websiteViews: 0,
      downloads: 0,
    });
  }
}
