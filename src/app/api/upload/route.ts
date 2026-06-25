import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

/**
 * Generic upload endpoint.
 *
 * Used by 4 admin features:
 *   - AdminProjects (project-image-uploader.tsx)  → type: "image"
 *   - AdminHeroImage                              → type: "image"
 *   - AdminMedia (media library)                  → type: "image"
 *   - AdminCv                                     → type: "file"
 *
 * Contract:
 *   GET    /api/upload            → MediaAsset[]   (newest first)
 *   POST   /api/upload            → { id, url, name, type, createdAt }
 *        body: { dataUrl: string, name: string, type: "image" | "file" }
 *   DELETE /api/upload?id=<cuid>  → { success: true }
 */

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const PUBLIC_PREFIX = "/uploads/";
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

// Map common MIME types → file extension. Used to give uploaded files a
// correct extension even when the client `name` is missing or unhelpful.
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "image/avif": "avif",
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "text/plain": "txt",
};

function sanitizeBase(name: string): string {
  // Strip extension, keep only filesystem-safe chars, collapse separators.
  const base = name.replace(/\.[^.]+$/, "");
  return (
    base
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^[.-]+|[.-]+$/g, "")
      .toLowerCase()
      .slice(0, 60) || "file"
  );
}

function extFromMime(mime: string): string | null {
  return MIME_TO_EXT[mime.toLowerCase()] ?? null;
}

function extFromName(name: string): string | null {
  const idx = name.lastIndexOf(".");
  if (idx === -1 || idx === name.length - 1) return null;
  const ext = name.slice(idx + 1).toLowerCase();
  return /^[a-z0-9]+$/.test(ext) ? ext : null;
}

export async function GET() {
  try {
    const assets = await db.mediaAsset.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(assets);
  } catch (error) {
    console.error("GET /api/upload error:", error);
    // Return an empty list rather than a 500 — the media library UI degrades
    // gracefully and the user still sees "no media yet" instead of an error.
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { dataUrl, name, type } = body as {
      dataUrl?: string;
      name?: string;
      type?: string;
    };

    if (!dataUrl || typeof dataUrl !== "string") {
      return NextResponse.json({ error: "Missing dataUrl" }, { status: 400 });
    }

    // Parse `data:<mime>;base64,<payload>`
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json(
        { error: "Invalid data URL (expected data:<mime>;base64,<payload>)" },
        { status: 400 }
      );
    }
    const mime = match[1].toLowerCase();
    const base64 = match[2];

    // Enforce size limit using the base64 length (≈ payload * 3/4).
    const byteLength = Math.floor((base64.length * 3) / 4);
    if (byteLength > MAX_BYTES) {
      return NextResponse.json(
        { error: "File too large (max 10 MB)" },
        { status: 413 }
      );
    }

    // Basic type gate: images must be images, files must be a known doc type.
    // We allow unknown MIME types through for the "file" path so unusual CV
    // formats still work, but reject clearly-bad payloads.
    if (mime === "application/octet-stream" && !name) {
      return NextResponse.json(
        { error: "Cannot determine file type" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(base64, "base64");

    // Decide extension: prefer MIME, fall back to the client-supplied name.
    const ext = extFromMime(mime) ?? (name ? extFromName(name) : null) ?? "bin";
    const safeBase = name ? sanitizeBase(name) : "file";
    const timestamp = Date.now();
    const filename = `${timestamp}-${safeBase}.${ext}`;

    // Make sure /public/uploads exists (first upload after a fresh clone).
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Persist to disk.
    const filepath = path.join(UPLOAD_DIR, filename);
    await writeFile(filepath, buffer);

    const url = `${PUBLIC_PREFIX}${filename}`;

    // Persist DB row.
    const assetType = type === "file" ? "file" : "image";
    const asset = await db.mediaAsset.create({
      data: {
        name: name || filename,
        url,
        type: assetType,
      },
    });

    return NextResponse.json({
      id: asset.id,
      url: asset.url,
      name: asset.name,
      type: asset.type,
      createdAt: asset.createdAt,
    });
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const asset = await db.mediaAsset.findUnique({ where: { id } });
    if (!asset) {
      // Idempotent: deleting something that's already gone is a success.
      return NextResponse.json({ success: true });
    }

    // Remove the file from disk. We intentionally swallow errors here —
    // a missing/stale file on disk shouldn't block the DB cleanup.
    try {
      const basename = path.basename(asset.url);
      // Guard against path traversal: basename strips any directory components.
      const filepath = path.join(UPLOAD_DIR, basename);
      if (existsSync(filepath)) {
        await unlink(filepath);
      }
    } catch (e) {
      console.error("Failed to delete file from disk:", e);
    }

    await db.mediaAsset.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/upload error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
