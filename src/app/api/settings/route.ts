import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const defaultSettings: Record<string, string> = {
  heroName: "Ganiyu Al-Hassan Oluwaseyi",
  heroTagline: "Crafting elegant digital experiences at the intersection of design, code, and creativity.",
  phone: "(+225) 05 03 67 14 80",
  email: "seyiganiyu5@gmail.com",
  linkedin: "https://linkedin.com/in/al-hassan-ganiyu-9910b3410",
  whatsapp: "https://wa.me/2250503671480",
  metaTitle: "Ganiyu Al-Hassan Oluwaseyi — Software Engineer & Creative Designer",
  metaDescription:
    "Portfolio of Ganiyu Al-Hassan Oluwaseyi — Software Engineering Student, Web Developer, UI/UX Designer, Graphic Designer & Branding Specialist.",
  keywords: "Ganiyu Al-Hassan, Software Engineer, Web Developer, UI/UX Designer, Graphic Designer, Branding, Portfolio",
  avatarUrl: "",
  cvUrl: "",
  fromEmail: "",
  resendApiKey: "",
};

export async function GET() {
  try {
    const settings = await db.setting.findMany();
    const map: Record<string, string> = { ...defaultSettings };
    for (const s of settings) {
      map[s.key] = s.value;
    }
    return NextResponse.json(map);
  } catch (error) {
    console.error("GET settings error:", error);
    return NextResponse.json(defaultSettings);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, string>;
    for (const [key, value] of Object.entries(body)) {
      const existing = await db.setting.findUnique({ where: { key } });
      if (existing) {
        await db.setting.update({ where: { key }, data: { value: String(value) } });
      } else {
        await db.setting.create({ data: { key, value: String(value) } });
      }
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT settings error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
