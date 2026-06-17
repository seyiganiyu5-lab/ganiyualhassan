"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useT } from "@/lib/i18n/context";
import { Plus, Pencil, Trash2, X, Star } from "lucide-react";
import { toast } from "sonner";
import type { Project, ProjectCategory } from "@/lib/types";

const categories: ProjectCategory[] = ["website", "graphic", "branding", "uiux", "drawing"];

interface ProjectForm {
  id?: string;
  title: string;
  description: string;
  category: ProjectCategory;
  technologies: string;
  liveDemo: string;
  githubLink: string;
  imagesText: string;
  featured: boolean;
}

const emptyForm: ProjectForm = {
  title: "",
  description: "",
  category: "website",
  technologies: "",
  liveDemo: "",
  githubLink: "",
  imagesText: "",
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
      });
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (form: ProjectForm) => {
    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      technologies: form.technologies,
      liveDemo: form.liveDemo || null,
      githubLink: form.githubLink || null,
      images: form.imagesText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
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
      } else {
        toast.error("Failed to save project");
      }
    } catch {
      toast.error("Failed to save project");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.admin.confirmDelete)) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Project deleted");
        load();
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
      imagesText: p.images.join("\n"),
      featured: p.featured,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {projects.length} {t.admin.projects.toLowerCase()}
        </p>
        <button
          onClick={() => setEditing({ ...emptyForm })}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#FF5A1F] px-4 text-sm font-semibold text-white transition-transform hover:scale-105"
        >
          <Plus className="h-4 w-4" />
          {t.admin.addProject}
        </button>
      </div>

      {/* Project list */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? [...Array(6)].map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
            ))
          : projects.map((p) => (
              <div
                key={p.id}
                className="overflow-hidden rounded-xl glass border border-border"
              >
                <div className="relative aspect-video bg-muted">
                  {p.images[0] && (
                    <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
                  )}
                  {p.featured && (
                    <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#FF5A1F] text-white">
                      <Star className="h-3 w-3 fill-white" />
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold leading-tight">{p.title}</h4>
                    <span className="shrink-0 rounded bg-[#FF5A1F]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#FF5A1F]">
                      {p.category}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {p.description}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => startEdit(p)}
                      className="flex h-8 flex-1 items-center justify-center gap-1 rounded-lg border border-border text-xs font-medium hover:bg-muted"
                    >
                      <Pencil className="h-3 w-3" />
                      {t.admin.editProject}
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
      </div>

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

function ProjectFormModal({
  form,
  onClose,
  onSave,
}: {
  form: ProjectForm;
  onClose: () => void;
  onSave: (form: ProjectForm) => void;
}) {
  const t = useT();
  const [data, setData] = useState(form);
  const [saving, setSaving] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    onSave(data);
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[95] flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur" onClick={onClose} />
      <motion.form
        onSubmit={submit}
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl glass-strong border border-border p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">
            {form.id ? t.admin.editProject : t.admin.addProject}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              {t.admin.projectTitle}
            </label>
            <input
              required
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-[#FF5A1F]/50"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              {t.admin.projectDescription}
            </label>
            <textarea
              required
              rows={3}
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[#FF5A1F]/50"
            />
          </div>

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
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-[#FF5A1F]/50"
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
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-[#FF5A1F]/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                {t.admin.projectLiveDemo}
              </label>
              <input
                value={data.liveDemo}
                onChange={(e) => setData({ ...data, liveDemo: e.target.value })}
                placeholder="https://..."
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-[#FF5A1F]/50"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                {t.admin.projectGithub}
              </label>
              <input
                value={data.githubLink}
                onChange={(e) => setData({ ...data, githubLink: e.target.value })}
                placeholder="https://github.com/..."
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-[#FF5A1F]/50"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              {t.admin.projectImages}
            </label>
            <textarea
              rows={3}
              value={data.imagesText}
              onChange={(e) => setData({ ...data, imagesText: e.target.value })}
              placeholder="https://image1.jpg&#10;https://image2.jpg"
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[#FF5A1F]/50"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              You can upload images in the Media Library tab and paste URLs here.
            </p>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.featured}
              onChange={(e) => setData({ ...data, featured: e.target.checked })}
              className="h-4 w-4 accent-[#FF5A1F]"
            />
            <span className="text-sm">{t.admin.projectFeatured}</span>
          </label>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-[#FF5A1F] text-sm font-semibold text-white disabled:opacity-60"
          >
            {t.admin.save}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-6 text-sm font-medium"
          >
            {t.admin.cancel}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}
