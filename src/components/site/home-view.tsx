"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useT } from "@/lib/i18n/context";
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

  return (
    <>
      {/* Intro */}
      <section className="container-site pt-16 pb-20 sm:pt-24 sm:pb-28">
        {avatarUrl && (
          <img
            src={avatarUrl}
            alt={name}
            className="mb-8 h-16 w-16 rounded-full object-cover"
            style={{ objectPosition: "50% 22%" }}
          />
        )}
        <h1 className="max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
          {name}
          <span className="block text-muted-foreground">{t.site.role}.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
          {t.site.home.intro}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <span className="inline-flex items-center gap-2 text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {t.hero.available}
          </span>
          <Link href="/contact" className="inline-flex items-center gap-1.5 font-medium hover:text-muted-foreground">
            {t.site.home.getInTouch}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Selected work */}
      {projects.length > 0 && (
        <section className="container-site">
          <SectionHeader title={t.site.home.selected} href="/work" link={t.site.home.allWork} />
          <ProjectGrid projects={projects} />
        </section>
      )}

      {/* Services */}
      <section className="container-site mt-28">
        <SectionHeader title={t.site.home.whatIDo} href="/about" link={t.site.home.moreAbout} />
        <ul className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
          {t.services.list.map((s) => (
            <li key={s.title} className="border-t border-border py-5">
              <h3 className="font-medium">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section className="container-site mt-28">
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
      </section>
    </>
  );
}

export function SectionHeader({ title, href, link }: { title: string; href?: string; link?: string }) {
  return (
    <div className="mb-8 flex items-baseline justify-between gap-4">
      <h2 className="text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground">{title}</h2>
      {href && link && (
        <Link href={href} className="inline-flex items-center gap-1 text-sm font-medium hover:text-muted-foreground">
          {link}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
