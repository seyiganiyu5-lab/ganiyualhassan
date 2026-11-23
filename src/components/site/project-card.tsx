"use client";

import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { coverOf, isArtwork } from "@/lib/media";
import type { Project } from "@/lib/types";
import { Reveal } from "./motion";

export function ProjectCard({ project, priority }: { project: Project; priority?: boolean }) {
  const t = useT();
  const cover = coverOf(project.images);
  const year = new Date(project.createdAt).getFullYear();

  return (
    <Link href={`/work/${project.id}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
        {cover ? (
          <img
            src={cover}
            alt={project.title}
            loading={priority ? "eager" : "lazy"}
            className={cn(
              "h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]",
              isArtwork(project.category) ? "object-contain p-6" : "object-cover"
            )}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <FileText className="h-8 w-8" strokeWidth={1.25} />
          </div>
        )}
        <span className="absolute bottom-3 right-3 inline-flex translate-y-2 items-center gap-1 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium opacity-0 shadow-sm backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          {t.projects.viewDetails}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-4">
        <h3 className="truncate font-medium">
          <span className="link-underline">{project.title}</span>
        </h3>
        <span className="shrink-0 text-sm text-muted-foreground">{year}</span>
      </div>
      <p className="mt-0.5 text-sm text-muted-foreground">{t.projects.categories[project.category]}</p>
    </Link>
  );
}

export function ProjectGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2">
      {projects.map((p, i) => (
        <Reveal key={p.id} delay={(i % 2) * 0.1}>
          <ProjectCard project={p} priority={i < 2} />
        </Reveal>
      ))}
    </div>
  );
}
