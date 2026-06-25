"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useT } from "@/lib/i18n/context";
import { SectionHeading } from "./section-heading";
import {
  GraduationCap,
  Briefcase,
  Award,
  Download,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { generateCvPdf } from "@/lib/cv-pdf";

export function CvSection({ cvUrl }: { cvUrl?: string | null }) {
  const t = useT();
  const [downloading, setDownloading] = useState(false);

  const sections = [
    {
      key: "education",
      icon: GraduationCap,
      data: t.cv.educationData,
    },
    {
      key: "experience",
      icon: Briefcase,
      data: t.cv.experienceData,
    },
    {
      key: "certifications",
      icon: Award,
      data: t.cv.certificationsData,
    },
  ] as const;

  /** Build the structured data the PDF generator expects, from i18n. */
  const buildCvData = () => ({
    name: t.hero.name,
    role: t.hero.roleValue,
    phone: "(+225) 05 03 67 14 80",
    email: "seyiganiyu5@gmail.com",
    linkedin: "linkedin.com/in/al-hassan-ganiyu-9910b3410",
    location: t.contact.locationBased,
    educationLabel: t.cv.education,
    experienceLabel: t.cv.experience,
    certificationsLabel: t.cv.certifications,
    skillsLabel: t.cv.skills,
    education: t.cv.educationData,
    experience: t.cv.experienceData,
    certifications: t.cv.certificationsData,
    skills: [
      { category: t.about.skills.development, items: t.about.skillsData.development.map((s) => s.name) },
      { category: t.about.skills.design, items: t.about.skillsData.design.map((s) => s.name) },
      { category: t.about.skills.technology, items: t.about.skillsData.technology.map((s) => s.name) },
      { category: t.about.skills.creative, items: t.about.skillsData.creative.map((s) => s.name) },
    ],
  });

  /** Trigger a real file download from a Blob (instead of opening in a tab). */
  const triggerBlobDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Revoke after a short delay so the download has time to start.
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      // If a real CV file is configured, verify it actually exists before
      // trying to hand it to the user. A stale DB pointer to a deleted file
      // should silently fall back to a generated PDF instead of 404'ing.
      if (cvUrl) {
        try {
          const res = await fetch(cvUrl);
          if (res.ok) {
            const blob = await res.blob();
            const filename = cvUrl.split("/").pop() || "CV.pdf";
            triggerBlobDownload(blob, filename);
            toast.success(t.cv.download);
            return;
          }
        } catch {
          // network/parse error — fall through to generated PDF below
        }
      }
      // Fallback: generate a clean, professional PDF CV on the fly.
      generateCvPdf(buildCvData());
      toast.success(t.cv.download);
    } catch (e) {
      console.error("CV download error:", e);
      toast.error(t.contact.error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section id="cv" className="relative py-24 sm:py-32">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading subtitle={t.cv.subtitle} title={t.cv.title} />

        {/* Download button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 flex justify-center"
        >
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-[#FFC300] px-6 text-sm font-semibold text-[#000814] shadow-lg transition-transform hover:scale-105 disabled:cursor-wait disabled:opacity-70"
          >
            <Download className={downloading ? "h-4 w-4 animate-pulse" : "h-4 w-4"} />
            {downloading ? t.contact.sending : t.cv.download}
          </button>
        </motion.div>

        {/* CV content */}
        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {sections.map((section, sIdx) => (
            <motion.div
              key={section.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: sIdx * 0.1 }}
              className="rounded-2xl glass border border-border p-6"
            >
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFC300]/10 text-[#FFC300]">
                  <section.icon className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-bold">{t.cv[section.key]}</h3>
              </div>

              <div className="space-y-5">
                {section.data.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="relative border-l-2 border-[#FFC300]/20 pl-4"
                  >
                    <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-[#FFC300]" />
                    <span className="text-xs font-semibold text-[#FFC300]">
                      {item.period}
                    </span>
                    <h4 className="mt-1 font-bold leading-tight">{item.title}</h4>
                    <p className="text-sm font-medium text-muted-foreground">{item.org}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact summary card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 rounded-2xl gradient-border p-6 sm:p-8"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { icon: Phone, label: t.contact.phone, value: "(+225) 05 03 67 14 80" },
              { icon: Mail, label: t.contact.email, value: "seyiganiyu5@gmail.com" },
              { icon: MapPin, label: "Location", value: "Côte d'Ivoire" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFC300]/10 text-[#FFC300]">
                  <item.icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">{item.label}</div>
                  <div className="truncate text-sm font-semibold">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
