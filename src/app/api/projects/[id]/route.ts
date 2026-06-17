import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await db.project.findUnique({ where: { id } });
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      ...project,
      images: JSON.parse(project.images || "[]") as string[],
    });
  } catch (error) {
    console.error("GET project error:", error);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const project = await db.project.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        technologies: body.technologies || "",
        liveDemo: body.liveDemo || null,
        githubLink: body.githubLink || null,
        images: JSON.stringify(body.images || []),
        featured: body.featured ?? false,
        order: body.order ?? 0,
      },
    });
    return NextResponse.json({ ...project, images: JSON.parse(project.images || "[]") });
  } catch (error) {
    console.error("PUT project error:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.project.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE project error:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
