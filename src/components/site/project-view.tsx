"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronRight, FileText } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { isPdfUrl } from "@/lib/media";
import type { Project } from "@/lib/types";
import { EASE, Reveal } from "./motion";

export function ProjectView({
  project,
  next,
  prev,
}: {
  project: Project;
  next: Project | null;
  prev: Project | null;
}) {
  const t = useT();
  // With only two projects, prev and next are the same one — show it once.
  const prevLink = prev && prev.id !== next?.id ? prev : null;
  const router = useRouter();
  const tools = project.technologies
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const year = new Date(project.createdAt).getFullYear();
  const story = (
    [
      [t.site.project.challenge, project.challenge],
      [t.site.project.approach, project.approach],
      [t.site.project.outcome, project.outcome],
    ] as const
  ).filter(([, text]) => text?.trim());

  // Thin progress line along the top — handy on long galleries.
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40 });

  // ← / → browse projects, Esc goes back to the list. Ignored while typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target instanceof Element ? e.target : null;
      if (el?.closest("input, textarea, select, [contenteditable]") || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight" && next) router.push(`/work/${next.id}`);
      else if (e.key === "ArrowLeft" && prev) router.push(`/work/${prev.id}`);
      else if (e.key === "Escape") router.push("/work");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, router]);

  const intro = (delay: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: EASE, delay },
  });

  return (
    <article className="container-site pt-10 sm:pt-14">
      <motion.div
        className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-primary"
        style={{ scaleX: progress }}
        aria-hidden
      />

      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/work" className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          {t.site.nav.work}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 opacity-50" />
        <Link href={`/work?category=${project.category}`} className="transition-colors hover:text-foreground">
          {t.projects.categories[project.category]}
        </Link>
      </nav>

      <header className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_16rem]">
        <div>
          <motion.h1 {...intro(0)} className="text-3xl font-semibold tracking-tight sm:text-5xl">
            {project.title}
          </motion.h1>
          <motion.p
            {...intro(0.1)}
            className="mt-6 max-w-2xl whitespace-pre-line text-lg leading-relaxed text-muted-foreground"
          >
            {project.description}
          </motion.p>
          {(project.liveDemo || project.githubLink) && (
            <motion.div {...intro(0.2)} className="mt-8 flex flex-wrap gap-3">
              {project.liveDemo && (
                <a
                  href={project.liveDemo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  {t.site.project.visit}
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              )}
              {project.githubLink && (
                <a
                  href={project.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex h-10 items-center gap-2 rounded-full border border-border px-5 text-sm font-medium transition-colors hover:border-foreground/40"
                >
                  {t.site.project.code}
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              )}
            </motion.div>
          )}
        </div>

        <motion.dl
          {...intro(0.15)}
          className="grid grid-cols-2 gap-6 text-sm lg:grid-cols-1 lg:content-start lg:border-l lg:border-border lg:pl-8"
        >
          {project.role && <Meta label={t.site.project.role}>{project.role}</Meta>}
          {project.client && <Meta label={t.site.project.client}>{project.client}</Meta>}
          <Meta label={t.site.project.category}>{t.projects.categories[project.category]}</Meta>
          <Meta label={project.duration ? t.site.project.duration : t.site.project.year}>
            {project.duration || year}
          </Meta>
          {tools.length > 0 && (
            <div className="col-span-2 lg:col-span-1">
              <Meta label={t.site.project.tools}>{tools.join(", ")}</Meta>
            </div>
          )}
        </motion.dl>
      </header>

      {/* Case study — challenge, approach, outcome */}
      {story.length > 0 && (
        <section aria-labelledby="case-study" className="mt-16 sm:mt-20">
          <h2 id="case-study" className="eyebrow">
            {t.site.project.caseStudy}
          </h2>
          <div className="mt-6">
            {story.map(([label, text], i) => (
              <Reveal
                key={label}
                className="grid grid-cols-1 gap-3 border-t border-border py-8 sm:grid-cols-[14rem_1fr] sm:gap-10"
              >
                <h3 className="flex items-baseline gap-3 text-lg font-semibold tracking-tight">
                  <span className="font-mono text-xs font-normal text-brand-ink">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {label}
                </h3>
                <Prose text={text} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Media — shown in full, one after another */}
      {project.images.length > 0 && (
        <div className="mt-14 space-y-6">
          {project.images.map((src, i) =>
            isPdfUrl(src) ? (
              <Reveal key={i} className="overflow-hidden rounded-lg border border-border">
                <iframe src={src} title={`${project.title} — PDF`} className="h-[80vh] w-full bg-white" />
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 border-t border-border px-4 py-3 text-sm text-muted-foreground hover:text-foreground"
                >
                  <FileText className="h-4 w-4" />
                  {t.site.project.openPdf}
                  <ArrowUpRight className="ml-auto h-4 w-4" />
                </a>
              </Reveal>
            ) : (
              <Reveal key={i} y={24}>
                <figure className="flex justify-center overflow-hidden rounded-lg bg-muted">
                  <img
                    src={src}
                    alt={`${project.title} — ${i + 1}`}
                    loading={i < 2 ? "eager" : "lazy"}
                    className="max-h-[90vh] w-auto max-w-full object-contain"
                  />
                </figure>
              </Reveal>
            )
          )}
        </div>
      )}

      {/* Prev / next */}
      {(prevLink || next) && (
        <nav aria-label="Projects" className="mt-20 border-t border-border pt-8">
          <div className="grid grid-cols-2 gap-6">
            {prevLink ? (
              <Link href={`/work/${prevLink.id}`} className="group min-w-0">
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  {t.site.nav2.prev}
                </p>
                <p className="mt-1 truncate text-lg font-semibold tracking-tight sm:text-2xl">
                  <span className="link-underline">{prevLink.title}</span>
                </p>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link href={`/work/${next.id}`} className="group min-w-0 text-right">
                <p className="flex items-center justify-end gap-1.5 text-sm text-muted-foreground">
                  {t.site.nav2.next}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </p>
                <p className="mt-1 truncate text-lg font-semibold tracking-tight sm:text-2xl">
                  <span className="link-underline">{next.title}</span>
                </p>
              </Link>
            )}
          </div>
          <p className="mt-8 hidden text-center text-xs text-muted-foreground sm:block">{t.site.nav2.keys}</p>
        </nav>
      )}
    </article>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{children}</dd>
    </div>
  );
}

/**
 * Case study text: blank lines start a new paragraph, and lines that begin
 * with "-", "*" or "•" become a bullet list.
 */
function Prose({ text }: { text: string }) {
  const blocks = text.trim().split(/\n\s*\n/);
  return (
    <div className="max-w-2xl space-y-4 leading-relaxed text-muted-foreground">
      {blocks.map((block, i) => {
        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
        const isList = lines.length > 0 && lines.every((l) => /^[-*•]\s+/.test(l));
        return isList ? (
          <ul key={i} className="space-y-2">
            {lines.map((l, j) => (
              <li key={j} className="flex gap-3">
                <span aria-hidden className="mt-[0.6em] h-1.5 w-1.5 shrink-0 bg-primary" />
                <span>{l.replace(/^[-*•]\s+/, "")}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p key={i} className="whitespace-pre-line">
            {block.trim()}
          </p>
        );
      })}
    </div>
  );
}
