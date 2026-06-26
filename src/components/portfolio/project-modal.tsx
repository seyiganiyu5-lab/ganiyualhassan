"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useT } from "@/lib/i18n/context";
import { X, ExternalLink, Github, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import type { Project } from "@/lib/types";
import { isPdfUrl } from "@/components/admin/project-image-uploader";

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
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-[#FFC300] hover:text-[#000814]"
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
  const stripRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

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

  // Keep the active thumbnail scrolled into view inside the strip so the
  // user always knows where they are when navigating a large folder upload.
  useEffect(() => {
    const el = thumbRefs.current[activeImage];
    if (el && stripRef.current) {
      el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [activeImage]);

  const goTo = useCallback(
    (i: number) => {
      if (i >= 0 && i < project.images.length) setActiveImage(i);
    },
    [project.images.length]
  );

  return (
    <div className="max-h-[90vh] overflow-y-auto">
      {/* Gallery — FIXED-HEIGHT stage so navigating between files of different
          aspect ratios (square / portrait / landscape artwork in a brand kit)
          never makes the modal jump. PDFs render in an embedded viewer so all
          files from an uploaded folder can be viewed. */}
      {project.images.length > 0 && (
        <div className="flex w-full flex-col bg-muted/40">
          {/* Fixed-height image stage */}
          <div className="relative flex h-[58vh] min-h-[300px] w-full items-center justify-center p-3 sm:p-6">
            <AnimatePresence mode="wait">
              {isPdfUrl(project.images[activeImage]) ? (
                <motion.iframe
                  key={activeImage}
                  src={project.images[activeImage]}
                  title={project.title}
                  className="h-full w-full max-w-3xl rounded-lg border border-border bg-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                />
              ) : (
                <motion.img
                  key={activeImage}
                  src={project.images[activeImage]}
                  alt={project.title}
                  className="max-h-full max-w-full object-contain"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                />
              )}
            </AnimatePresence>

            {project.images.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-lg backdrop-blur transition-colors hover:bg-[#FFC300] hover:text-[#000814]"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-lg backdrop-blur transition-colors hover:bg-[#FFC300] hover:text-[#000814]"
                  aria-label="Next"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* Info bar: counter + filename + download */}
          <div className="flex items-center justify-between gap-3 border-t border-border bg-background/60 px-4 py-2.5 sm:px-6">
            {project.images.length > 1 ? (
              <span className="shrink-0 rounded-full bg-[#FFC300]/10 px-2.5 py-1 text-[11px] font-bold text-[#FFC300]">
                {activeImage + 1} / {project.images.length}
              </span>
            ) : (
              <span className="w-8" />
            )}
            <span className="min-w-0 flex-1 truncate text-center text-xs font-medium text-muted-foreground">
              {project.images[activeImage].split("/").pop()}
            </span>
            <a
              href={project.images[activeImage]}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-[11px] font-semibold text-foreground transition-colors hover:border-[#FFC300]/40 hover:text-[#FFC300]"
            >
              <Download className="h-3 w-3" />
              Download
            </a>
          </div>

          {/* Scrollable thumbnail strip — replaces the dot row. Handles folder
              uploads with many files gracefully and shows exact position. */}
          {project.images.length > 1 && (
            <div
              ref={stripRef}
              className="flex gap-2 overflow-x-auto scroll-smooth border-t border-border bg-background/40 px-3 py-2.5 [scrollbar-width:thin] sm:px-6"
              style={{ scrollbarWidth: "thin" }}
            >
              {project.images.map((img, i) => (
                <button
                  key={i}
                  ref={(el) => {
                    thumbRefs.current[i] = el;
                  }}
                  onClick={() => goTo(i)}
                  aria-label={`Image ${i + 1}`}
                  aria-current={i === activeImage}
                  className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                    i === activeImage
                      ? "border-[#FFC300] ring-2 ring-[#FFC300]/30"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  {isPdfUrl(img) ? (
                    <span className="flex h-full w-full items-center justify-center bg-red-500/15 text-[8px] font-bold uppercase text-red-500">
                      PDF
                    </span>
                  ) : (
                    <img
                      src={img}
                      alt={`Thumbnail ${i + 1}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-6 sm:p-8">
        <span className="inline-block rounded-full bg-[#FFC300]/10 px-3 py-1 text-xs font-semibold text-[#FFC300]">
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
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[#FFC300] px-6 text-sm font-semibold text-[#000814] transition-transform hover:scale-105"
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
              className="inline-flex h-11 items-center gap-2 rounded-full glass border border-border px-6 text-sm font-semibold transition-colors hover:border-[#FFC300]/40 hover:text-[#FFC300]"
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
