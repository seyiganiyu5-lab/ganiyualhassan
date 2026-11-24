import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { bodyTooLarge } from "@/lib/security";

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

const MAX_BYTES = 15 * 1024 * 1024; // 15 MB

/**
 * Only these file types are accepted, identified by their first bytes, not
 * by what the browser claims. SVG and HTML are deliberately excluded: they
 * can carry scripts that would run on this site's domain.
 */
const SIGNATURES: { mime: string; ext: string; test: (b: Buffer) => boolean }[] = [
  { mime: "image/jpeg", ext: "jpg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: "image/png", ext: "png", test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { mime: "image/gif", ext: "gif", test: (b) => b.subarray(0, 4).toString("latin1") === "GIF8" },
  {
    mime: "image/webp",
    ext: "webp",
    test: (b) => b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP",
  },
  {
    mime: "image/avif",
    ext: "avif",
    test: (b) => b.subarray(4, 8).toString("latin1") === "ftyp" && /avi[fs]/.test(b.subarray(8, 12).toString("latin1")),
  },
  { mime: "application/pdf", ext: "pdf", test: (b) => b.subarray(0, 5).toString("latin1") === "%PDF-" },
  // Word files, for the CV uploader
  {
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ext: "docx",
    test: (b) => b.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04])) && b.includes("word/", 0, "latin1"),
  },
  {
    mime: "application/msword",
    ext: "doc",
    test: (b) => b.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])),
  },
];

/** Parse a base64 data URL and identify the real file type. */
function parseDataUrl(dataUrl: string): { buffer: Buffer; mime: string; ext: string } {
  const match = /^data:([^;,]+)?(?:;[^,]*)?;base64,([\s\S]*)$/.exec(dataUrl);
  if (!match) throw new UploadError("Invalid file data");
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length === 0) throw new UploadError("Empty file");
  if (buffer.length > MAX_BYTES) throw new UploadError("File is larger than 15 MB");
  const kind = SIGNATURES.find((s) => s.test(buffer));
  if (!kind) throw new UploadError("Only JPG, PNG, WebP, GIF, AVIF, PDF and Word files are allowed");
  return { buffer, mime: kind.mime, ext: kind.ext };
}

class UploadError extends Error {}

/** Build a unique filename: <timestamp>-<rand>-<slug>.<ext> */
function buildFilename(originalName: string, ext: string): string {
  const base = slugify(originalName.replace(/\.[^.]+$/, ""));
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `${ts}-${rand}-${base || "file"}.${ext}`;
}

// ─── GET — list all media assets ───────────────────────────────────────────

export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
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
  const denied = await requireAdmin(request);
  if (denied) return denied;
  // base64 inflates by ~4/3; allow a little room for the JSON around it
  if (bodyTooLarge(request, Math.ceil(MAX_BYTES * 1.4))) {
    return NextResponse.json({ error: "File is larger than 15 MB" }, { status: 413 });
  }
  try {
    const body = await request.json();
    const dataUrl: string = typeof body.dataUrl === "string" ? body.dataUrl : "";
    const originalName = String(body.name || "upload").slice(0, 200);
    const type = String(body.type || "image").slice(0, 40);

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
    if (error instanceof UploadError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("POST upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

// ─── DELETE — remove a media asset ─────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
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