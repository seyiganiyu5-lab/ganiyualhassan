"use client";

import { useEffect, useState } from "react";
import { LoadingScreen } from "@/components/portfolio/loading-screen";
import { ScrollProgress } from "@/components/portfolio/scroll-progress";
import { AnimatedCursor } from "@/components/portfolio/animated-cursor";
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
import { AdminPanel } from "@/components/admin/admin-panel";
import { useAdmin } from "@/lib/admin-context";

export default function Home() {
  const { adminOpen, setAdminOpen } = useAdmin();
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => {});
  }, []);

  return (
    <>
      <LoadingScreen />
      <AnimatedCursor />
      <ScrollProgress />

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
      </div>

      <BackToTop />
      <AdminPanel open={adminOpen} onClose={() => setAdminOpen(false)} />
    </>
  );
}
