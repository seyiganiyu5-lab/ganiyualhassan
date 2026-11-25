import "server-only";
import { db } from "@/lib/db";
import type { Project } from "@/lib/types";

/** Public site settings, editable from the admin panel. */
export interface SiteSettings {
  heroName: string;
  email: string;
  phone: string;
  linkedin: string;
  whatsapp: string;
  avatarUrl: string;
  cvUrl: string;
  [key: string]: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  heroName: "Ganiyu Al-Hassan Oluwaseyi",
  email: "seyiganiyu5@gmail.com",
  phone: "(+225) 05 03 67 14 80",
  linkedin: "https://linkedin.com/in/al-hassan-ganiyu-9910b3410",
  whatsapp: "https://wa.me/2250503671480",
  avatarUrl: "",
  cvUrl: "",
};

export async function getSettings(): Promise<SiteSettings> {
  const map: SiteSettings = { ...DEFAULT_SETTINGS };
  try {
    const rows = await db.setting.findMany();
    for (const r of rows) if (r.value) map[r.key] = r.value;
  } catch (error) {
    console.error("getSettings error:", error);
  }
  return map;
}

type ProjectRow = Awaited<ReturnType<typeof db.project.findMany>>[number];

function toProject(p: ProjectRow): Project {
  let images: string[] = [];
  try {
    images = JSON.parse(p.images || "[]");
  } catch {
    images = [];
  }
  return {
    ...p,
    category: p.category as Project["category"],
    images,
    createdAt: p.createdAt.toISOString(),
  };
}

export async function getProjects(): Promise<Project[]> {
  try {
    const rows = await db.project.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return rows.map(toProject);
  } catch (error) {
    console.error("getProjects error:", error);
    return [];
  }
}

/** Featured projects first; falls back to the most recent ones. */
export async function getSelectedProjects(limit = 6): Promise<Project[]> {
  const all = await getProjects();
  const featured = all.filter((p) => p.featured);
  return (featured.length > 0 ? featured : all).slice(0, limit);
}
