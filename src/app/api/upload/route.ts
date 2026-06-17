import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dataUrl, name, type = "image" } = body as {
      dataUrl: string;
      name: string;
      type?: string;
    };

    if (!dataUrl || !dataUrl.startsWith("data:")) {
      return NextResponse.json({ error: "Invalid file data" }, { status: 400 });
    }

    // Parse base64 data URL
    const matches = dataUrl.match(/^data:(.+?);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json({ error: "Invalid data URL" }, { status: 400 });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const ext = mimeType.split("/")[1]?.split("+")[0] || "bin";
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));

    const url = `/uploads/${fileName}`;

    // Save to media library
    const media = await db.mediaAsset.create({
      data: {
        name: name || fileName,
        url,
        type,
      },
    });

    return NextResponse.json({ success: true, url, media });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const media = await db.mediaAsset.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(media);
  } catch (error) {
    console.error("GET media error:", error);
    return NextResponse.json([]);
  }
}
