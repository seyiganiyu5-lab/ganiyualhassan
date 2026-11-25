"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { EASE, Reveal, WordReveal, useIntroDone } from "./motion";
import { HeroCard } from "./hero-card";
import type { Project, Testimonial } from "@/lib/types";
import { Testimonials } from "./testimonials";
import { ProjectGrid } from "./project-card";

export function HomeView({
  name,
  avatarUrl,
  projects,
  testimonials = [],
}: {
  name: string;
  avatarUrl: string;
  projects: Project[];
  testimonials?: Testimonial[];
}) {
  const t = useT();
  const ready = useIntroDone();
  const tools = [...t.about.skillsData.development, ...t.about.skillsData.design].map((s) => s.name);
  const fadeIn = (delay: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: ready ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.7, ease: EASE, delay },
  });

  return (
    <>
      {/* Hero */}
      <section
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty("--spot-x", `${e.clientX - r.left}px`);
          e.currentTarget.style.setProperty("--spot-y", `${e.clientY - r.top}px`);
        }}
        className="relative isolate"
      >
        <div aria-hidden className="hero-grid-bg pointer-events-none absolute inset-0 -z-10" />
        <div aria-hidden className="hero-spot pointer-events-none absolute inset-0 -z-10" />
      <div className="container-site grid grid-cols-1 items-center gap-14 pt-12 pb-20 sm:pt-20 sm:pb-28 lg:grid-cols-[1fr_auto] lg:gap-10">
        {/* 3D card — first on phones, right-hand column on desktop */}
        <motion.div
          className="lg:order-2"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={ready ? { opacity: 1, y: 0, scale: 1 } : undefined}
          transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
        >
          <HeroCard name={name} avatarUrl={avatarUrl} />
        </motion.div>
        <div className="lg:order-1">
        <h1 className="max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
          <WordReveal text={name} play={ready} delay={0.05} className="block" />
          <WordReveal text={`${t.site.role}.`} play={ready} delay={0.25} className="block text-muted-foreground" />
        </h1>
        <motion.p {...fadeIn(0.55)} className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
          {t.site.home.intro}
        </motion.p>
        <motion.p {...fadeIn(0.45)} className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60 [animation-duration:2.4s]" />
            <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          {t.hero.available}
        </motion.p>
        <motion.div {...fadeIn(0.7)} className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <Link
            href="/work"
            className="group inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 font-medium text-primary-foreground shadow-[0_8px_30px_-8px] shadow-primary/60 transition-transform hover:-translate-y-0.5"
          >
            {t.site.home.seeWork}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="/contact" className="group inline-flex items-center gap-1.5 font-medium">
            <span className="link-underline">{t.site.home.getInTouch}</span>
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
        </div>
      </div>
      </section>

      <Toolbox label={t.site.toolbox} items={tools} />

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

      <Testimonials items={testimonials} />

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
      <h2 className="eyebrow">{title}</h2>
      {href && link && (
        <Link href={href} className="group inline-flex items-center gap-1 text-sm font-medium">
          <span className="link-underline">{link}</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

/** A slowly scrolling strip of tools; pauses on hover, still for reduced motion. */
function Toolbox({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  const row = items.map((name) => (
    <li key={name} className="flex shrink-0 items-center gap-3 px-5 text-sm text-muted-foreground">
      <span className="h-1 w-1 rounded-full bg-primary" />
      {name}
    </li>
  ));
  return (
    <section aria-label={label} className="mb-24 border-y border-border/60 py-4">
      <div className="marquee group flex overflow-hidden">
        <ul className="marquee-track flex shrink-0">{row}</ul>
        <ul aria-hidden className="marquee-track flex shrink-0">{row}</ul>
      </div>
    </section>
  );
}
