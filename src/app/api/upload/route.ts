import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * File upload route — DUAL MODE.
 *
 * - Production (Vercel): if BLOB_READ_WRITE_TOKEN is set, files are stored in
 *   Vercel Blob (cloud, persistent across serverless invocations).
 * - Local dev / sandbox: falls back to writing to public/uploads/ on disk.
 *
 * The API contract is identical in both modes so the admin components don't
 * need to know which mode is active:
 *   POST   { dataUrl, name, type }  -> { id, url, name, type }
 *   GET    ()                       -> MediaAsset[]
 *   DELETE ?id=<cuid>               -> { success: true }
 */

const isBlobMode = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

// ─── helpers ──────────────────────────────────────────────────────────────

/** Slugify a filename: lowercase, drop accents, replace non-alphanumerics with -. */
function slugify(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Parse a base64 data URL into { buffer, mime, ext }. */
function parseDataUrl(dataUrl: string): {
  buffer: Buffer;
  mime: string;
  ext: string;
} {
  const match = /^data:([^;]+);base64,(.*)$/s.exec(dataUrl);
  if (!match) throw new Error("Invalid data URL");
  const mime = match[1];
  const buffer = Buffer.from(match[2], "base64");
  const ext = mime.split("/")[1]?.split("+")[0] || "bin";
  return { buffer, mime, ext };
}

/** Build a unique filename: <timestamp>-<rand>-<slug>.<ext> */
function buildFilename(originalName: string, ext: string): string {
  const base = slugify(originalName.replace(/\.[^.]+$/, ""));
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `${ts}-${rand}-${base || "file"}.${ext}`;
}

// ─── GET — list all media assets ───────────────────────────────────────────

export async function GET() {
  try {
    const assets = await db.mediaAsset.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(assets);
  } catch (error) {
    console.error("GET upload error:", error);
    return NextResponse.json([]);
  }
}

// ─── POST — upload a file (base64 data URL) ────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const dataUrl: string = body.dataUrl;
    const originalName: string = body.name || "upload";
    const type: string = body.type || "image";

    if (!dataUrl || !dataUrl.startsWith("data:")) {
      return NextResponse.json(
        { error: "Missing or invalid dataUrl" },
        { status: 400 }
      );
    }

    const { buffer, mime, ext } = parseDataUrl(dataUrl);
    const filename = buildFilename(originalName, ext);

    let url: string;

    if (isBlobMode()) {
      // ── Vercel Blob (production) ──
      const { put } = await import("@vercel/blob");
      const blob = await put(filename, buffer, {
        access: "public",
        contentType: mime || undefined,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      url = blob.url;
    } else {
      // ── Local disk (dev / sandbox) ──
      const fs = await import("fs/promises");
      const path = await import("path");
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(path.join(uploadDir, filename), buffer);
      url = `/uploads/${filename}`;
    }

    // Record in DB (works for both modes)
    const asset = await db.mediaAsset.create({
      data: { name: originalName, url, type },
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
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}

// ─── DELETE — remove a media asset ─────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const asset = await db.mediaAsset.findUnique({ where: { id } });
    if (!asset) {
      return NextResponse.json({ success: true }); // already gone
    }

    if (isBlobMode() && asset.url.startsWith("http")) {
      // ── Vercel Blob ──
      const { del } = await import("@vercel/blob");
      await del([asset.url], {
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
    } else if (asset.url.startsWith("/uploads/")) {
      // ── Local disk — guard against path traversal ──
      const fs = await import("fs/promises");
      const path = await import("path");
      const filename = path.basename(asset.url);
      const filePath = path.join(process.cwd(), "public", "uploads", filename);
      // basename + join already neutralises ../, but double-check:
      if (filePath.startsWith(path.join(process.cwd(), "public", "uploads"))) {
        await fs.unlink(filePath).catch(() => {}); // ignore missing file
      }
    }

    await db.mediaAsset.delete({ where: { id: asset.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE upload error:", error);
    return NextResponse.json(
      { error: "Failed to delete asset" },
      { status: 500 }
    );
  }
}