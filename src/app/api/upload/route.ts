import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

// MIME → extension map for common image/file types
const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/bmp": "bmp",
  "image/svg+xml": "svg",
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

function slugify(name: string): string {
  const base = name
    .replace(/\.[^/.]+$/, "") // strip existing extension
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return base || "file";
}

// GET — list all uploaded media (newest first)
export async function GET() {
  try {
    const media = await db.mediaAsset.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(media);
  } catch (error) {
    console.error("GET upload error:", error);
    return NextResponse.json([]);
  }
}

// POST — upload a file via base64 data URL
// Body: { dataUrl: string, name: string, type?: "image" | "file" }
// Returns: { id, name, url, type, createdAt }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const dataUrl: string = body.dataUrl;
    const originalName: string = body.name || "upload";
    const assetType: string = body.type || "image";

    if (!dataUrl || !dataUrl.startsWith("data:")) {
      return NextResponse.json(
        { error: "Invalid data URL" },
        { status: 400 }
      );
    }

    // Parse the data URL: data:<mime>;base64,<payload>
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json(
        { error: "Malformed data URL" },
        { status: 400 }
      );
    }
    const mime = match[1].toLowerCase();
    const base64Payload = match[2];
    const buffer = Buffer.from(base64Payload, "base64");

    if (buffer.byteLength > MAX_BYTES) {
      return NextResponse.json(
        { error: "File too large (max 10 MB)" },
        { status: 413 }
      );
    }

    const ext = MIME_EXT[mime] || "bin";
    const timestamp = Date.now();
    const safeName = slugify(originalName);
    const filename = `${timestamp}-${safeName}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);
    const publicUrl = `/uploads/${filename}`;

    // Ensure the uploads directory exists
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    // Write the file
    await fs.writeFile(filePath, buffer);

    // Persist a MediaAsset record in the DB
    const asset = await db.mediaAsset.create({
      data: {
        name: originalName,
        url: publicUrl,
        type: assetType,
      },
    });

    return NextResponse.json({
      id: asset.id,
      name: asset.name,
      url: asset.url,
      type: asset.type,
      createdAt: asset.createdAt,
    });
  } catch (error) {
    console.error("POST upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}

// DELETE — remove a media asset by id (and delete the file from disk)
// Query: ?id=<assetId>
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Missing id" },
        { status: 400 }
      );
    }

    const asset = await db.mediaAsset.findUnique({ where: { id } });
    if (!asset) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }

    // Delete the file from disk (ignore errors if already gone)
    const filePath = path.join(UPLOAD_DIR, path.basename(asset.url));
    try {
      await fs.unlink(filePath);
    } catch {
      // file may already be deleted — ignore
    }

    // Delete the DB record
    await db.mediaAsset.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE upload error:", error);
    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }
}
