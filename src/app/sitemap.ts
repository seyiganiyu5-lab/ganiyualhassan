import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const DEFAULT_SITE_URL = "https://ganiyu-alhassan-portfolio.com";

// Regenerate at most once an hour so projects added in admin appear without a redeploy.
export const revalidate = 3600;

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

  let projects: { id: string; updatedAt: Date }[] = [];
  try {
    projects = await db.project.findMany({ select: { id: true, updatedAt: true } });
  } catch {
    // no projects in sitemap if the DB is unavailable
  }

  const pages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/work`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/about`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/contact`, lastModified, changeFrequency: "yearly", priority: 0.5 },
  ];

  return [
    ...pages,
    ...projects.map((p) => ({
      url: `${base}/work/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
