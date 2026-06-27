"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useT } from "@/lib/i18n/context";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Star,
  FolderGit2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import type { Project, ProjectCategory } from "@/lib/types";
import { ProjectImageUploader } from "./project-image-uploader";

const categories: ProjectCategory[] = ["website", "graphic", "branding", "drawing"];

interface ProjectForm {
  id?: string;
  title: string;
  description: string;
  category: ProjectCategory;
  technologies: string;
  liveDemo: string;
  githubLink: string;
  images: string[];
  featured: boolean;
}

const emptyForm: ProjectForm = {
  title: "",
  description: "",
  category: "website",
  technologies: "",
  liveDemo: "",
  githubLink: "",
  images: [],
  featured: false,
};

export function AdminProjects() {
  const t = useT();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ProjectForm | null>(null);

  const load = () => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  // Save is now fully async — the form awaits this and shows a real spinner.
  const handleSave = async (form: ProjectForm): Promise<boolean> => {
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      technologies: form.technologies.trim(),
      liveDemo: form.liveDemo.trim() || null,
      githubLink: form.githubLink.trim() || null,
      images: form.images,
      featured: form.featured,
    };

    try {
      const res = await fetch(
        form.id ? `/api/projects/${form.id}` : "/api/projects",
        {
          method: form.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (res.ok) {
        toast.success(form.id ? "Project updated" : "Project created");
        setEditing(null);
        load();
        return true;
      }
      toast.error("Failed to save project");
      return false;
    } catch {
      toast.error("Failed to save project");
      return false;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.admin.confirmDelete)) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Project deleted");
        load();
      } else {
        toast.error("Failed to delete");
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  const startEdit = (p: Project) => {
    setEditing({
      id: p.id,
      title: p.title,
      description: p.description,
      category: p.category,
      technologies: p.technologies,
      liveDemo: p.liveDemo || "",
      githubLink: p.githubLink || "",
      images: [...p.images],
      featured: p.featured,
    });
  };

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {projects.length} {t.admin.projects.toLowerCase()}
          {projects.filter((p) => p.featured).length > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-[#FFC300]/10 px-2 py-0.5 text-xs font-semibold text-[#FFC300]">
              <Star className="h-3 w-3 fill-current" />
              {projects.filter((p) => p.featured).length} featured
            </span>
          )}
        </p>
        <button
          onClick={() => setEditing({ ...emptyForm })}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#FFC300] px-4 text-sm font-semibold text-[#000814] transition-transform hover:scale-105"
        >
          <Plus className="h-4 w-4" />
          {t.admin.addProject}
        </button>
      </div>

      {/* Project list */}
      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <FolderGit2 className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">{t.admin.projectEmpty}</p>
          <button
            onClick={() => setEditing({ ...emptyForm })}
            className="mt-1 inline-flex h-9 items-center gap-2 rounded-lg bg-[#FFC300] px-4 text-sm font-semibold text-[#000814] transition-transform hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            {t.admin.addProject}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectAdminCard
              key={p.id}
              project={p}
              onEdit={() => startEdit(p)}
              onDelete={() => handleDelete(p.id)}
            />
          ))}
        </div>
      )}

      {/* Edit/Create modal */}
      <AnimatePresence>
        {editing && (
          <ProjectFormModal
            form={editing}
            onClose={() => setEditing(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Admin project card — with edit / delete / view-on-site
   ────────────────────────────────────────────────────────── */
function ProjectAdminCard({
  project,
  onEdit,
  onDelete,
}: {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const t = useT();
  const cover = project.images[0];

  return (
    <div className="group overflow-hidden rounded-xl glass border border-border">
      <div className="relative aspect-video bg-muted">
        {cover ? (
          <img
            src={cover}
            alt={project.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#FFC300]/15 to-muted">
            <FolderGit2 className="h-8 w-8 text-[#FFC300]/40" />
          </div>
        )}
        {project.featured && (
          <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#FFC300] text-[#000814] shadow">
            <Star className="h-3 w-3 fill-white" />
          </span>
        )}
        {project.images.length > 1 && (
          <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
            {project.images.length} images
          </span>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-bold leading-tight">{project.title}</h4>
          <span className="shrink-0 rounded bg-[#FFC300]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#FFC300]">
            {t.projects.categories[project.category]}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {project.description}
        </p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={onEdit}
            className="flex h-8 flex-1 items-center justify-center gap-1 rounded-lg border border-border text-xs font-medium transition-colors hover:bg-muted"
          >
            <Pencil className="h-3 w-3" />
            {t.admin.editProject}
          </button>
          <button
            onClick={onDelete}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-destructive/30 text-destructive transition-colors hover:bg-destructive/10"
            aria-label="Delete project"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Project form modal — with inline image uploader + real async save
   ────────────────────────────────────────────────────────── */
function ProjectFormModal({
  form,
  onClose,
  onSave,
}: {
  form: ProjectForm;
  onClose: () => void;
  onSave: (form: ProjectForm) => Promise<boolean>;
}) {
  const t = useT();
  const [data, setData] = useState<ProjectForm>(form);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    await onSave(data);
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[95] flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur"
        onClick={saving ? undefined : onClose}
      />
      <motion.form
        onSubmit={submit}
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl glass-strong border border-border p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">
            {form.id ? t.admin.editProject : t.admin.addProject}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              {t.admin.projectTitle}
            </label>
            <input
              required
              minLength={2}
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-[#FFC300]/50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              {t.admin.projectDescription}
            </label>
            <textarea
              required
              minLength={10}
              rows={3}
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[#FFC300]/50"
            />
          </div>

          {/* Category + Technologies */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                {t.admin.projectCategory}
              </label>
              <select
                value={data.category}
                onChange={(e) =>
                  setData({ ...data, category: e.target.value as ProjectCategory })
                }
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-[#FFC300]/50"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {t.projects.categories[c]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                {t.admin.projectTechnologies}
              </label>
              <input
                value={data.technologies}
                onChange={(e) => setData({ ...data, technologies: e.target.value })}
                placeholder="React, Next.js, ..."
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-[#FFC300]/50"
              />
            </div>
          </div>

          {/* Live demo + GitHub */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                {t.admin.projectLiveDemo}
              </label>
              <input
                type="url"
                value={data.liveDemo}
                onChange={(e) => setData({ ...data, liveDemo: e.target.value })}
                placeholder="https://..."
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-[#FFC300]/50"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                {t.admin.projectGithub}
              </label>
              <input
                type="url"
                value={data.githubLink}
                onChange={(e) => setData({ ...data, githubLink: e.target.value })}
                placeholder="https://github.com/..."
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-[#FFC300]/50"
              />
            </div>
          </div>

          {/* Inline image uploader — replaces the old plain-text URL textarea */}
          <ProjectImageUploader
            images={data.images}
            onChange={(next) => setData({ ...data, images: next })}
          />

          {/* Featured checkbox */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.featured}
              onChange={(e) => setData({ ...data, featured: e.target.checked })}
              className="h-4 w-4 accent-[#FFC300]"
            />
            <span className="text-sm">{t.admin.projectFeatured}</span>
          </label>
        </div>

        {/* Action footer */}
        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-[#FFC300] text-sm font-semibold text-[#000814] transition-transform hover:scale-[1.01] disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.admin.projectSaving}
              </>
            ) : (
              t.admin.save
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-6 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
          >
            {t.admin.cancel}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}
