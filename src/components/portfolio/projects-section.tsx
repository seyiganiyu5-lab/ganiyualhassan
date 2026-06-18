"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useT } from "@/lib/i18n/context";
import { SectionHeading } from "./section-heading";
import { ProjectModal } from "./project-modal";
import { Search, ExternalLink, Github, X, FolderGit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project, ProjectCategory } from "@/lib/types";

const categoryOrder: ProjectCategory[] = ["website", "graphic", "branding", "uiux", "drawing"];

export function ProjectsSection() {
  const t = useT();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<ProjectCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Project | null>(null);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = projects.filter((p) => {
    const matchCat = activeCategory === "all" || p.category === activeCategory;
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.technologies.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <section id="projects" className="relative py-24 sm:py-32">
      <div className="pointer-events-none absolute right-0 top-1/4 h-96 w-96 rounded-full bg-[#FFC300]/5 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading subtitle={t.projects.subtitle} title={t.projects.title} />

        {/* Controls */}
        <div className="mt-10 flex flex-col items-center gap-4">
          {/* Search */}
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.projects.searchPlaceholder}
              className="h-11 w-full rounded-full glass border border-border pl-11 pr-4 text-sm outline-none transition-colors focus:border-[#FFC300]/50"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <FilterButton
              active={activeCategory === "all"}
              onClick={() => setActiveCategory("all")}
            >
              {t.projects.all}
            </FilterButton>
            {categoryOrder.map((cat) => (
              <FilterButton
                key={cat}
                active={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
              >
                {t.projects.categories[cat]}
              </FilterButton>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="mt-10">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/3] animate-pulse rounded-2xl bg-muted"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <FolderGit2 className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                {projects.length === 0 ? t.projects.empty : t.projects.noResults}
              </p>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClick={() => setSelected(project)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </section>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-medium transition-all",
        active
          ? "bg-[#FFC300] text-[#000814] shadow-md glow-orange-sm"
          : "glass border border-border text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function ProjectCard({
  project,
  onClick,
}: {
  project: Project;
  onClick: () => void;
}) {
  const t = useT();
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -6 }}
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-2xl glass border border-border transition-all hover:border-[#FFC300]/40 hover:shadow-xl"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {project.images[0] ? (
          <img
            src={project.images[0]}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#FFC300]/20 to-muted">
            <FolderGit2 className="h-12 w-12 text-[#FFC300]/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        {/* Category badge */}
        <span className="absolute left-3 top-3 rounded-full bg-background/80 px-3 py-1 text-xs font-semibold text-[#FFC300] backdrop-blur">
          {t.projects.categories[project.category]}
        </span>

        {/* Featured star */}
        {project.featured && (
          <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#FFC300] text-[#000814] shadow-lg">
            ★
          </span>
        )}

        {/* Hover overlay actions */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="rounded-full bg-background/90 px-4 py-2 text-xs font-semibold text-foreground backdrop-blur">
            {t.projects.viewDetails}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold transition-colors group-hover:text-[#FFC300]">
          {project.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {project.description}
        </p>
        {/* Technologies */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.technologies
            .split(",")
            .slice(0, 3)
            .map((tech, i) => (
              <span
                key={i}
                className="rounded-md bg-[#FFC300]/10 px-2 py-0.5 text-[11px] font-medium text-[#FFC300]"
              >
                {tech.trim()}
              </span>
            ))}
        </div>
        {/* Links */}
        <div className="mt-4 flex items-center gap-3 border-t border-border pt-3">
          {project.liveDemo && (
            <a
              href={project.liveDemo}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-[#FFC300]"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {t.projects.liveDemo}
            </a>
          )}
          {project.githubLink && (
            <a
              href={project.githubLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-[#FFC300]"
            >
              <Github className="h-3.5 w-3.5" />
              {t.projects.github}
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
