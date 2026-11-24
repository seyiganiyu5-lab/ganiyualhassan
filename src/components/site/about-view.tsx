"use client";

import { useState } from "react";
import { ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/lib/i18n/context";
import { generateCvPdf } from "@/lib/cv-pdf";
import { motion } from "framer-motion";
import { EASE, Reveal } from "./motion";

interface Contact {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
}

export function AboutView({
  avatarUrl,
  cvUrl,
  contact,
}: {
  avatarUrl: string;
  cvUrl: string;
  contact: Contact;
}) {
  const t = useT();
  const [downloading, setDownloading] = useState(false);

  const skillGroups = [
    { label: t.about.skills.development, items: t.about.skillsData.development },
    { label: t.about.skills.design, items: t.about.skillsData.design },
    { label: t.about.skills.technology, items: t.about.skillsData.technology },
    { label: t.about.skills.creative, items: t.about.skillsData.creative },
  ];

  const downloadCv = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      // Prefer the uploaded CV; fall back to a generated PDF if it's missing.
      if (cvUrl) {
        const res = await fetch(cvUrl).catch(() => null);
        if (res?.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = cvUrl.split("/").pop() || "CV.pdf";
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 1500);
          return;
        }
      }
      generateCvPdf({
        name: contact.name,
        role: t.hero.roleValue,
        phone: contact.phone,
        email: contact.email,
        linkedin: contact.linkedin.replace(/^https?:\/\//, ""),
        location: t.contact.locationBased,
        educationLabel: t.cv.education,
        experienceLabel: t.cv.experience,
        certificationsLabel: t.cv.certifications,
        skillsLabel: t.cv.skills,
        education: [...t.cv.educationData],
        experience: [...t.cv.experienceData],
        certifications: [...t.cv.certificationsData],
        skills: skillGroups.map((g) => ({ category: g.label, items: g.items.map((s) => s.name) })),
      });
    } catch (e) {
      console.error("CV download error:", e);
      toast.error(t.contact.error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="container-site pt-16 sm:pt-24">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_18rem]">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{t.site.about.title}</h1>
          <div className="mt-8 max-w-2xl space-y-5 text-lg leading-relaxed text-muted-foreground">
            <p>{t.about.bio}</p>
            <p>{t.about.bio2}</p>
          </div>
          <button
            type="button"
            onClick={downloadCv}
            disabled={downloading}
            className="mt-10 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
          >
            <ArrowDown className="h-4 w-4" />
            {downloading ? t.site.about.preparing : t.site.about.downloadCv}
          </button>
        </div>
        {avatarUrl && (
          <motion.div
            className="w-full max-w-xs overflow-hidden rounded-2xl"
            initial={{ opacity: 0, clipPath: "inset(12% 12% 12% 12% round 16px)" }}
            animate={{ opacity: 1, clipPath: "inset(0% 0% 0% 0% round 16px)" }}
            transition={{ duration: 1, ease: EASE, delay: 0.15 }}
          >
            <img
              src={avatarUrl}
              alt={contact.name}
              className="aspect-[4/5] w-full object-cover"
              style={{ objectPosition: "50% 22%" }}
            />
          </motion.div>
        )}
      </div>

      <Block title={t.site.about.venture}>
        <div className="rounded-2xl border border-border p-6 sm:p-8">
          <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t.site.about.hassifyRole}</h3>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">{t.site.about.hassifyIntro}</p>
          <ul className="mt-8 grid grid-cols-1 gap-x-10 sm:grid-cols-2">
            {t.site.about.hassifyItems.map((s) => (
              <li key={s.title} className="border-t border-border py-5">
                <p className="font-medium">{s.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </Block>

      <Block title={t.site.about.experience}>
        <Timeline items={t.cv.experienceData} />
      </Block>

      <Block title={t.site.about.education}>
        <Timeline items={t.cv.educationData} />
      </Block>

      <Block title={t.site.about.skills}>
        <dl className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
          {skillGroups.map((g) => (
            <div key={g.label} className="border-t border-border py-5">
              <dt className="font-medium">{g.label}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {g.items.map((s) => s.name).join(" · ")}
              </dd>
            </div>
          ))}
        </dl>
      </Block>

      <Block title={t.site.about.services}>
        <ul className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
          {t.services.list.map((s) => (
            <li key={s.title} className="border-t border-border py-5">
              <h3 className="font-medium">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </li>
          ))}
        </ul>
      </Block>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-24">
      <Reveal>
        <h2 className="mb-6 eyebrow">{title}</h2>
      </Reveal>
      <Reveal delay={0.08}>{children}</Reveal>
    </section>
  );
}

function Timeline({
  items,
}: {
  items: ReadonlyArray<{ title: string; org: string; period: string; desc: string }>;
}) {
  return (
    <ol>
      {items.map((item, i) => (
        <li
          key={i}
          className="grid grid-cols-1 gap-1 border-t border-border py-6 sm:grid-cols-[12rem_1fr] sm:gap-8"
        >
          <span className="text-sm text-muted-foreground">{item.period}</span>
          <div>
            <h3 className="font-medium">
              {item.title}
              <span className="text-muted-foreground"> · {item.org}</span>
            </h3>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
