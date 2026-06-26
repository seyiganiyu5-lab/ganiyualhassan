import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

/** Slugify a filename: lowercase, strip accents, keep alnum/dot/dash/underscore. */
function slugify(name: string): string {
  const base = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "file";
}

async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch {
    // already exists — ignore
  }
}

/** Delete a file from disk if it lives inside our uploads dir. Silently no-ops otherwise. */
async function safeDeleteFile(urlPath: string) {
  try {
    if (!urlPath.startsWith("/uploads/")) return;
    const fileName = path.basename(urlPath);
    const fullPath = path.join(UPLOAD_DIR, fileName);
    // Prevent path traversal: resolved path must start with UPLOAD_DIR
    if (!fullPath.startsWith(UPLOAD_DIR)) return;
    await fs.unlink(fullPath);
  } catch {
    // file may already be gone — ignore
  }
}

// GET — list all media assets (newest first)
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

// POST — save a data-URL-encoded file to disk + create a MediaAsset record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const dataUrl: string = String(body.dataUrl || "");
    const originalName: string = String(body.name || "file");
    const type: string = String(body.type || "image");

    if (!dataUrl.startsWith("data:")) {
      return NextResponse.json(
        { error: "Invalid data URL" },
        { status: 400 }
      );
    }

    // Parse "data:<mime>;base64,<payload>"
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json(
        { error: "Malformed data URL" },
        { status: 400 }
      );
    }
    const mime = match[1];
    const payload = match[2];
    const buffer = Buffer.from(payload, "base64");

    // Build a unique filename: <timestamp>-<rand>-<slug>.<ext>
    const ext = path.extname(originalName) || mimeToExt(mime);
    const baseName = path.basename(originalName, ext);
    const slug = slugify(baseName);
    const stamp = Date.now();
    const rand = crypto.randomBytes(3).toString("hex");
    const fileName = `${stamp}-${rand}-${slug}${ext}`;
    const publicPath = `/uploads/${fileName}`;
    const fullPath = path.join(UPLOAD_DIR, fileName);

    await ensureUploadDir();
    await fs.writeFile(fullPath, buffer);

    const asset = await db.mediaAsset.create({
      data: {
        name: originalName,
        url: publicPath,
        type,
      },
    });

    return NextResponse.json({
      id: asset.id,
      url: asset.url,
      name: asset.name,
      type: asset.type,
    });
  } catch (error) {
    console.error("POST upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}

// DELETE — remove a media asset (and its file) by id
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
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
    await safeDeleteFile(asset.url);
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

function mimeToExt(mime: string): string {
  const map: Record<string, string> = {
    "application/pdf": ".pdf",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      ".docx",
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "text/plain": ".txt",
  };
  return map[mime] || "";
}
