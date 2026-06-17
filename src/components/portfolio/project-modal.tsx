"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useT } from "@/lib/i18n/context";
import { X, ExternalLink, Github, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import type { Project } from "@/lib/types";

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const t = useT();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = project ? "hidden" : "";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl glass-strong border border-border shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-[#FF5A1F] hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            {/* Keyed content resets gallery state when project changes */}
            <ModalContent key={project.id} project={project} t={t} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ModalContent({
  project,
  t,
}: {
  project: Project;
  t: ReturnType<typeof useT>;
}) {
  const [activeImage, setActiveImage] = useState(0);

  const next = useCallback(() => {
    setActiveImage((p) => (p + 1) % project.images.length);
  }, [project.images.length]);
  const prev = useCallback(() => {
    setActiveImage((p) => (p - 1 + project.images.length) % project.images.length);
  }, [project.images.length]);

  useEffect(() => {
    if (project.images.length <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [project.images.length, prev, next]);

  return (
    <div className="max-h-[90vh] overflow-y-auto">
      {/* Gallery */}
      {project.images.length > 0 && (
        <div className="relative aspect-[16/9] w-full bg-muted">
          <AnimatePresence mode="wait">
            <motion.img
              key={activeImage}
              src={project.images[activeImage]}
              alt={project.title}
              className="h-full w-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          </AnimatePresence>

          {project.images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-[#FF5A1F] hover:text-white"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-[#FF5A1F] hover:text-white"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
                {project.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === activeImage ? "w-8 bg-[#FF5A1F]" : "w-2 bg-white/50"
                    }`}
                    aria-label={`Image ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-6 sm:p-8">
        <span className="inline-block rounded-full bg-[#FF5A1F]/10 px-3 py-1 text-xs font-semibold text-[#FF5A1F]">
          {t.projects.categories[project.category]}
        </span>
        <h2 className="mt-3 text-2xl font-black sm:text-3xl">{project.title}</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {project.description}
        </p>

        {project.technologies && (
          <div className="mt-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {t.projects.technologies}
            </h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {project.technologies
                .split(",")
                .map((tech, i) => (
                  <span
                    key={i}
                    className="rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium"
                  >
                    {tech.trim()}
                  </span>
                ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {project.liveDemo && (
            <a
              href={project.liveDemo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[#FF5A1F] px-6 text-sm font-semibold text-white transition-transform hover:scale-105"
            >
              <ExternalLink className="h-4 w-4" />
              {t.projects.liveDemo}
            </a>
          )}
          {project.githubLink && (
            <a
              href={project.githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-full glass border border-border px-6 text-sm font-semibold transition-colors hover:border-[#FF5A1F]/40 hover:text-[#FF5A1F]"
            >
              <Github className="h-4 w-4" />
              {t.projects.github}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
