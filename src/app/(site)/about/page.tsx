import type { Metadata } from "next";
import { getSettings } from "@/lib/data";
import { AboutView } from "@/components/site/about-view";

export const metadata: Metadata = {
  title: "About",
  description: "Background, experience, skills and services.",
};

export default async function AboutPage() {
  const s = await getSettings();
  return (
    <AboutView
      avatarUrl={s.aboutImageUrl || s.avatarUrl}
      cvUrl={s.cvUrl}
      contact={{ name: s.heroName, email: s.email, phone: s.phone, linkedin: s.linkedin }}
    />
  );
}
