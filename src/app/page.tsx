"use client";

import { useEffect, useState } from "react";
import { BackToTop } from "@/components/portfolio/back-to-top";
import { FloatingSocial } from "@/components/portfolio/floating-social";
import { Navbar } from "@/components/portfolio/navbar";
import { Footer } from "@/components/portfolio/footer";
import { HeroSection } from "@/components/portfolio/hero-section";
import { AboutSection } from "@/components/portfolio/about-section";
import { ProjectsSection } from "@/components/portfolio/projects-section";
import { CvSection } from "@/components/portfolio/cv-section";
import { ServicesSection } from "@/components/portfolio/services-section";
import { ContactSection } from "@/components/portfolio/contact-section";

export default function Home() {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => {});
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <FloatingSocial />

      <main className="flex-1">
        <HeroSection avatarUrl={settings.avatarUrl || null} />
        <AboutSection />
        <ProjectsSection />
        <CvSection cvUrl={settings.cvUrl || null} />
        <ServicesSection />
        <ContactSection />
      </main>

      <Footer />

      <BackToTop />
    </div>
  );
}
