"use client";

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
import { cn } from "@/lib/utils";

export function CvSection({ cvUrl }: { cvUrl?: string | null }) {
  const t = useT();

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

  const handleDownload = () => {
    if (cvUrl) {
      window.open(cvUrl, "_blank");
    } else {
      // Generate a simple text-based CV as fallback
      const cvText = `Ganiyu Al-Hassan Oluwaseyi
Software Engineering Student & Creative Digital Professional

CONTACT
Phone: (+225) 05 03 67 14 80
Email: seyiganiyu5@gmail.com
LinkedIn: linkedin.com/in/al-hassan-ganiyu-9910b3410

EDUCATION
${t.cv.educationData.map((e) => `- ${e.title} | ${e.org} | ${e.period}\n  ${e.desc}`).join("\n\n")}

EXPERIENCE
${t.cv.experienceData.map((e) => `- ${e.title} | ${e.org} | ${e.period}\n  ${e.desc}`).join("\n\n")}

CERTIFICATIONS
${t.cv.certificationsData.map((e) => `- ${e.title} | ${e.org} | ${e.period}\n  ${e.desc}`).join("\n\n")}

SKILLS
Development: HTML, CSS, JavaScript, GitHub, Website Development
Design: Adobe Photoshop, Adobe Illustrator, Graphic Design, Branding, UI Design, UX Design
Technology: Cloud Computing, AI Tools, Software Engineering
Creative: Drawing, Digital Illustration, Creative Thinking
`;
      const blob = new Blob([cvText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Ganiyu_Al-Hassan_Oluwaseyi_CV.txt";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <section id="cv" className="relative py-24 sm:py-32">
      <div className="pointer-events-none absolute left-0 top-1/3 h-96 w-96 rounded-full bg-[#FF5A1F]/5 blur-[120px]" />

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
            className="inline-flex h-12 items-center gap-2 rounded-full bg-[#FF5A1F] px-6 text-sm font-semibold text-white shadow-lg glow-orange-sm transition-all hover:scale-105 hover:glow-orange"
          >
            <Download className="h-4 w-4" />
            {t.cv.download}
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
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF5A1F]/10 text-[#FF5A1F]">
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
                    className="relative border-l-2 border-[#FF5A1F]/20 pl-4"
                  >
                    <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-[#FF5A1F]" />
                    <span className="text-xs font-semibold text-[#FF5A1F]">
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
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF5A1F]/10 text-[#FF5A1F]">
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
