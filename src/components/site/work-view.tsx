"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { EASE } from "./motion";
import { useT } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/media";
import type { Project, ProjectCategory } from "@/lib/types";
import { ProjectGrid } from "./project-card";

export function WorkView({
  projects,
  active,
}: {
  projects: Project[];
  active: ProjectCategory | null;
}) {
  const t = useT();
  const shown = active ? projects.filter((p) => p.category === active) : projects;
  const count = (c: ProjectCategory | null) =>
    c ? projects.filter((p) => p.category === c).length : projects.length;
  // Only show filters for categories that actually have work in them.
  const filters = [null, ...CATEGORIES.filter((c) => count(c) > 0)];

  return (
    <div className="container-site pt-16 sm:pt-24">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{t.site.work.title}</h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">{t.site.work.intro}</p>

      {filters.length > 2 && (
        <nav
          aria-label="Filter"
          className="-mx-4 mt-10 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0"
        >
          {filters.map((c) => {
            const isActive = c === active;
            return (
              <Link
                key={c ?? "all"}
                href={c ? `/work?category=${c}` : "/work"}
                scroll={false}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition-colors",
                  isActive
                    ? "border-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="filter-pill"
                    className="absolute inset-0 rounded-full bg-foreground"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative">{c ? t.projects.categories[c] : t.projects.all}</span>
                <span className="relative text-xs opacity-60">{count(c)}</span>
              </Link>
            );
          })}
        </nav>
      )}

      {/* Keyed by filter so switching category cross-fades the grid. */}
      <motion.div
        key={active ?? "all"}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="mt-10"
      >
        {shown.length > 0 ? (
          <ProjectGrid projects={shown} />
        ) : (
          <p className="py-20 text-center text-muted-foreground">{t.site.work.empty}</p>
        )}
      </motion.div>
    </div>
  );
}
