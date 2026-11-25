"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, EyeOff, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@/lib/types";
import { BlockLoader, Skeleton } from "@/components/ui/skeleton";

type Form = Omit<Testimonial, "id" | "order"> & { id?: string };

const empty: Form = { quote: "", name: "", role: "", company: "", photoUrl: "", link: "", visible: true };

const field =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-foreground/30";
const labelCls = "mb-1 block text-xs font-semibold text-muted-foreground";

export function AdminTestimonials() {
  const t = useT();
  const ui = t.admin.testimonialsUi;
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Form | null>(null);

  const load = () =>
    fetch("/api/testimonials")
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => setItems(Array.isArray(list) ? list : []))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const save = async (form: Form) => {
    const res = await fetch(form.id ? `/api/testimonials/${form.id}` : "/api/testimonials", {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).catch(() => null);
    if (!res?.ok) {
      toast.error(ui.failed);
      return false;
    }
    toast.success(ui.saved);
    setEditing(null);
    load();
    return true;
  };

  const remove = async (id: string) => {
    if (!confirm(t.admin.confirmDelete)) return;
    const res = await fetch(`/api/testimonials/${id}`, { method: "DELETE" }).catch(() => null);
    if (!res?.ok) return toast.error(ui.failed);
    toast.success(ui.deleted);
    setItems((list) => list.filter((i) => i.id !== id));
  };

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(index + dir, 0, moved);
    setItems(next);
    const res = await fetch("/api/testimonials", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((i) => i.id) }),
    }).catch(() => null);
    if (!res?.ok) {
      toast.error(ui.failed);
      load();
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-md text-sm text-muted-foreground">{ui.intro}</p>
        <button
          onClick={() => setEditing({ ...empty })}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          {ui.add}
        </button>
      </div>

      {loading ? (
        <div className="space-y-3" role="status">
          <span className="sr-only">Loading…</span>
          {[0, 1].map((i) => (
            <div key={i} className="rounded-2xl border border-border p-5">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="mt-2 h-3.5 w-3/4" />
              <div className="mt-5 flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-3.5 w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          {ui.empty}
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item, i) => (
            <li
              key={item.id}
              className={cn("rounded-2xl border border-border bg-card p-5", !item.visible && "opacity-60")}
            >
              <p className="line-clamp-3 whitespace-pre-line text-sm leading-relaxed">“{item.quote}”</p>
              <div className="mt-4 flex items-center gap-3">
                {item.photoUrl ? (
                  <img src={item.photoUrl} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
                ) : (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs text-brand-ink">
                    {item.name.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 truncate text-sm font-semibold">
                    {item.name}
                    {!item.visible && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-border px-1.5 py-px text-[10px] font-normal uppercase tracking-wider text-muted-foreground">
                        <EyeOff className="h-3 w-3" />
                        {ui.hidden}
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[item.role, item.company].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <IconButton label={ui.moveUp} disabled={i === 0} onClick={() => move(i, -1)}>
                    <ArrowUp className="h-3.5 w-3.5" />
                  </IconButton>
                  <IconButton label={ui.moveDown} disabled={i === items.length - 1} onClick={() => move(i, 1)}>
                    <ArrowDown className="h-3.5 w-3.5" />
                  </IconButton>
                  <IconButton label={ui.edit} onClick={() => setEditing({ ...item })}>
                    <Pencil className="h-3.5 w-3.5" />
                  </IconButton>
                  <IconButton label={t.admin.delete} danger onClick={() => remove(item.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </IconButton>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AnimatePresence>
        {editing && <TestimonialForm form={editing} onClose={() => setEditing(null)} onSave={save} />}
      </AnimatePresence>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted disabled:opacity-30",
        danger && "border-destructive/30 text-destructive hover:bg-destructive/10"
      )}
    >
      {children}
    </button>
  );
}

function TestimonialForm({
  form,
  onClose,
  onSave,
}: {
  form: Form;
  onClose: () => void;
  onSave: (f: Form) => Promise<boolean>;
}) {
  const t = useT();
  const ui = t.admin.testimonialsUi;
  const [data, setData] = useState<Form>(form);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = (patch: Partial<Form>) => setData((d) => ({ ...d, ...patch }));

  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error(ui.failed);
    setUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = () => reject(new Error("read failed"));
        r.readAsDataURL(file);
      });
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl, name: file.name, type: "image" }),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || !out.url) throw new Error(out.error || ui.failed);
      set({ photoUrl: out.url });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : ui.failed);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || uploading) return;
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
      <div className="absolute inset-0 bg-background/80 backdrop-blur" onClick={saving ? undefined : onClose} />
      <motion.form
        onSubmit={submit}
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        className="relative z-10 max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-border bg-card p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">{form.id ? ui.edit : ui.add}</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label={t.admin.ui.closeMenu}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="t-quote" className={labelCls}>
              {ui.quote}
            </label>
            <textarea
              id="t-quote"
              required
              rows={5}
              maxLength={1200}
              value={data.quote}
              onChange={(e) => set({ quote: e.target.value })}
              className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
            />
            <p className="mt-1 text-xs text-muted-foreground">{ui.quoteHint}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="t-name" className={labelCls}>
                {ui.name}
              </label>
              <input id="t-name" required maxLength={120} value={data.name} onChange={(e) => set({ name: e.target.value })} className={field} />
            </div>
            <div>
              <label htmlFor="t-role" className={labelCls}>
                {ui.role}
              </label>
              <input id="t-role" maxLength={120} value={data.role} onChange={(e) => set({ role: e.target.value })} placeholder="Founder" className={field} />
            </div>
            <div>
              <label htmlFor="t-company" className={labelCls}>
                {ui.company}
              </label>
              <input id="t-company" maxLength={120} value={data.company} onChange={(e) => set({ company: e.target.value })} className={field} />
            </div>
          </div>

          <div>
            <label htmlFor="t-link" className={labelCls}>
              {ui.link}
            </label>
            <input
              id="t-link"
              type="url"
              value={data.link}
              onChange={(e) => set({ link: e.target.value })}
              placeholder="https://linkedin.com/in/…"
              className={field}
            />
          </div>

          <div>
            <span className={labelCls}>{ui.photo}</span>
            <div className="flex items-center gap-3">
              {data.photoUrl ? (
                <img src={data.photoUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted font-mono text-sm text-brand-ink">
                  {data.name.slice(0, 1).toUpperCase() || "?"}
                </span>
              )}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm transition-colors hover:bg-muted disabled:opacity-60"
              >
                {uploading ? <BlockLoader className="text-sm text-brand-ink" /> : <Upload className="h-3.5 w-3.5" />}
                {ui.uploadPhoto}
              </button>
              {data.photoUrl && !uploading && (
                <button
                  type="button"
                  onClick={() => set({ photoUrl: "" })}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {ui.removePhoto}
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => upload(e.target.files?.[0])}
              />
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.visible}
              onChange={(e) => set({ visible: e.target.checked })}
              className="h-4 w-4 accent-primary"
            />
            <span className="text-sm">{ui.visible}</span>
          </label>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={saving || uploading}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {saving && <BlockLoader className="text-base" />}
            {t.admin.save}
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
