"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { coverOf, isArtwork } from "@/lib/media";
import type { Project } from "@/lib/types";

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
              "h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.03]",
              isArtwork(project.category) ? "object-contain p-6" : "object-cover"
            )}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <FileText className="h-8 w-8" strokeWidth={1.25} />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-4">
        <h3 className="truncate font-medium decoration-primary decoration-2 underline-offset-4 group-hover:underline">
          {project.title}
        </h3>
        <span className="shrink-0 text-sm text-muted-foreground">{year}</span>
      </div>
      <p className="mt-0.5 text-sm text-muted-foreground">
        {t.projects.categories[project.category]}
      </p>
    </Link>
  );
}

export function ProjectGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2">
      {projects.map((p, i) => (
        <ProjectCard key={p.id} project={p} priority={i < 2} />
      ))}
    </div>
  );
}
