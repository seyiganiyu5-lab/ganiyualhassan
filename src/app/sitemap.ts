import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const DEFAULT_SITE_URL = "https://ganiyu-alhassan-portfolio.com";

function normalizeOrigin(url: string): string {
  if (!url) return DEFAULT_SITE_URL;
  try {
    const u = new URL(url.trim());
    return `${u.protocol}//${u.host}`;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let siteUrl = DEFAULT_SITE_URL;
  let lastModified = new Date();

  try {
    const setting = await db.setting.findUnique({ where: { key: "siteUrl" } });
    if (setting?.value) siteUrl = normalizeOrigin(setting.value);
  } catch {
    // fall back to default
  }

  const base = normalizeOrigin(siteUrl);

  // Single-page portfolio — the homepage is the primary (and only) indexable URL.
  // Sections (#about, #projects, #cv, #services, #contact) are anchors, not pages,
  // so they should NOT be separate sitemap entries.
  return [
    {
      url: `${base}/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
