"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, FileText } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { isPdfUrl } from "@/lib/media";
import type { Project } from "@/lib/types";

export function ProjectView({ project, next }: { project: Project; next: Project | null }) {
  const t = useT();
  const tools = project.technologies
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const year = new Date(project.createdAt).getFullYear();

  return (
    <article className="container-site pt-10 sm:pt-14">
      <Link
        href="/work"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.site.project.back}
      </Link>

      <header className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_16rem]">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">{project.title}</h1>
          <p className="mt-6 max-w-2xl whitespace-pre-line text-lg leading-relaxed text-muted-foreground">
            {project.description}
          </p>
          {(project.liveDemo || project.githubLink) && (
            <div className="mt-8 flex flex-wrap gap-3">
              {project.liveDemo && (
                <a
                  href={project.liveDemo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  {t.site.project.visit}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              )}
              {project.githubLink && (
                <a
                  href={project.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-5 text-sm font-medium transition-colors hover:border-foreground/40"
                >
                  {t.site.project.code}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              )}
            </div>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-6 text-sm lg:grid-cols-1 lg:content-start lg:border-l lg:border-border lg:pl-8">
          <Meta label={t.site.project.category}>{t.projects.categories[project.category]}</Meta>
          <Meta label={t.site.project.year}>{year}</Meta>
          {tools.length > 0 && (
            <div className="col-span-2 lg:col-span-1">
              <Meta label={t.site.project.tools}>{tools.join(", ")}</Meta>
            </div>
          )}
        </dl>
      </header>

      {/* Media — shown in full, one after another */}
      {project.images.length > 0 && (
        <div className="mt-14 space-y-6">
          {project.images.map((src, i) =>
            isPdfUrl(src) ? (
              <div key={i} className="overflow-hidden rounded-lg border border-border">
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
              </div>
            ) : (
              <figure key={i} className="flex justify-center overflow-hidden rounded-lg bg-muted">
                <img
                  src={src}
                  alt={`${project.title} — ${i + 1}`}
                  loading={i < 2 ? "eager" : "lazy"}
                  className="max-h-[90vh] w-auto max-w-full object-contain"
                />
              </figure>
            )
          )}
        </div>
      )}

      {next && (
        <Link
          href={`/work/${next.id}`}
          className="group mt-20 flex items-center justify-between gap-6 border-t border-border pt-8"
        >
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{t.site.project.next}</p>
            <p className="mt-1 truncate text-2xl font-semibold tracking-tight sm:text-3xl">{next.title}</p>
          </div>
          <ArrowRight className="h-6 w-6 shrink-0 transition-transform group-hover:translate-x-1" />
        </Link>
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
