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

export default async function robots(): Promise<MetadataRoute.Robots> {
  let siteUrl = DEFAULT_SITE_URL;

  try {
    const setting = await db.setting.findUnique({ where: { key: "siteUrl" } });
    if (setting?.value) siteUrl = normalizeOrigin(setting.value);
  } catch {
    // fall back to default
  }

  const base = normalizeOrigin(siteUrl);

  return {
    rules: [
      // Allow all major crawlers full access
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
