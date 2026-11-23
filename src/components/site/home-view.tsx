"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { EASE, Reveal, WordReveal, useIntroDone } from "./motion";
import type { Project } from "@/lib/types";
import { ProjectGrid } from "./project-card";

export function HomeView({
  name,
  avatarUrl,
  projects,
}: {
  name: string;
  avatarUrl: string;
  projects: Project[];
}) {
  const t = useT();
  const ready = useIntroDone();
  const fadeIn = (delay: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: ready ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.7, ease: EASE, delay },
  });

  return (
    <>
      {/* Hero */}
      <section className="container-site pt-16 pb-20 sm:pt-24 sm:pb-28">
        {avatarUrl && (
          <motion.img
            src={avatarUrl}
            alt={name}
            className="mb-8 h-16 w-16 rounded-full object-cover"
            style={{ objectPosition: "50% 22%" }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={ready ? { opacity: 1, scale: 1 } : undefined}
            transition={{ duration: 0.6, ease: EASE }}
          />
        )}
        <h1 className="max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
          <WordReveal text={name} play={ready} delay={0.05} className="block" />
          <WordReveal text={`${t.site.role}.`} play={ready} delay={0.25} className="block text-muted-foreground" />
        </h1>
        <motion.p {...fadeIn(0.55)} className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
          {t.site.home.intro}
        </motion.p>
        <motion.div {...fadeIn(0.7)} className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <span className="inline-flex items-center gap-2 text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60 [animation-duration:2.4s]" />
              <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {t.hero.available}
          </span>
          <Link href="/contact" className="group inline-flex items-center gap-1.5 font-medium">
            <span className="link-underline">{t.site.home.getInTouch}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </section>

      {/* Selected work */}
      {projects.length > 0 && (
        <section className="container-site">
          <Reveal>
            <SectionHeader title={t.site.home.selected} href="/work" link={t.site.home.allWork} />
          </Reveal>
          <ProjectGrid projects={projects} />
        </section>
      )}

      {/* Services */}
      <section className="container-site mt-28">
        <Reveal>
          <SectionHeader title={t.site.home.whatIDo} href="/about" link={t.site.home.moreAbout} />
        </Reveal>
        <div className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
          {t.services.list.map((s, i) => (
            <Reveal key={s.title} delay={(i % 2) * 0.08} className="border-t border-border py-5">
              <h3 className="font-medium">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <Reveal className="container-site mt-28">
        <Link
          href="/contact"
          className="group flex flex-col gap-6 rounded-2xl bg-muted p-8 transition-colors hover:bg-accent sm:flex-row sm:items-end sm:justify-between sm:p-12"
        >
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t.site.home.ctaTitle}</h2>
            <p className="mt-2 text-muted-foreground">{t.site.home.ctaBody}</p>
          </div>
          <span className="inline-flex h-11 shrink-0 items-center gap-2 self-start rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground sm:self-auto">
            {t.site.home.getInTouch}
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </Link>
      </Reveal>
    </>
  );
}

export function SectionHeader({ title, href, link }: { title: string; href?: string; link?: string }) {
  return (
    <div className="mb-8 flex items-baseline justify-between gap-4">
      <h2 className="text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground">{title}</h2>
      {href && link && (
        <Link href={href} className="group inline-flex items-center gap-1 text-sm font-medium">
          <span className="link-underline">{link}</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
