"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useT } from "@/lib/i18n/context";
import { Save, User, Link2, Phone, Upload, Trash2, ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function AdminSettings() {
  const t = useT();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        toast.success(t.admin.saved);
      } else {
        toast.error("Save failed");
      }
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const update = (key: string, value: string) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <form onSubmit={handleSave} className="mx-auto max-w-3xl space-y-6">
      {/* Hero */}
      <section className="rounded-2xl glass border border-border p-5">
        <h3 className="mb-4 flex items-center gap-2 font-bold">
          <User className="h-4 w-4 text-[#FFC300]" />
          Homepage
        </h3>
        <div className="space-y-3">
          <Field
            label={t.admin.heroName}
            value={settings.heroName || ""}
            onChange={(v) => update("heroName", v)}
          />
          <Field
            label={t.admin.heroTagline}
            textarea
            value={settings.heroTagline || ""}
            onChange={(v) => update("heroTagline", v)}
          />

          {/* Hero image uploader — replaces the old plain URL field */}
          <HeroImageUploader
            avatarUrl={settings.avatarUrl || ""}
            onUploaded={(url) => update("avatarUrl", url)}
            onCleared={() => update("avatarUrl", "")}
          />
        </div>
      </section>

      {/* Social links */}
      <section className="rounded-2xl glass border border-border p-5">
        <h3 className="mb-4 flex items-center gap-2 font-bold">
          <Link2 className="h-4 w-4 text-[#FFC300]" />
          {t.admin.socialLinks}
        </h3>
        <div className="space-y-3">
          <Field
            label="LinkedIn URL"
            value={settings.linkedin || ""}
            onChange={(v) => update("linkedin", v)}
          />
          <Field
            label="WhatsApp URL"
            value={settings.whatsapp || ""}
            onChange={(v) => update("whatsapp", v)}
          />
        </div>
      </section>

      {/* Contact info */}
      <section className="rounded-2xl glass border border-border p-5">
        <h3 className="mb-4 flex items-center gap-2 font-bold">
          <Phone className="h-4 w-4 text-[#FFC300]" />
          {t.admin.contactInfo}
        </h3>
        <div className="space-y-3">
          <Field
            label={t.contact.phone}
            value={settings.phone || ""}
            onChange={(v) => update("phone", v)}
          />
          <Field
            label={t.contact.email}
            value={settings.email || ""}
            onChange={(v) => update("email", v)}
          />
        </div>
      </section>

      <button
        type="submit"
        disabled={saving}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#FFC300] px-8 text-sm font-semibold text-[#000814] disabled:opacity-60"
      >
        {saving ? (
          <span className="h-4 w-4 loader-ring rounded-full border-2 border-[#000814] border-t-transparent" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {t.admin.save}
      </button>
    </form>
  );
}

/* ──────────────────────────────────────────────────────────
   Hero image uploader — live preview + upload + remove
   ────────────────────────────────────────────────────────── */
function HeroImageUploader({
  avatarUrl,
  onUploaded,
  onCleared,
}: {
  avatarUrl: string;
  onUploaded: (url: string) => void;
  onCleared: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  // The image actually shown in the preview. Falls back to the default profile
  // photo when no custom avatar URL is set so the admin always sees what the
  // home page will display.
  const previewSrc = avatarUrl || "/uploads/profile.jpg";
  const isCustom = Boolean(avatarUrl);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      e.target.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image too large (max 10 MB)");
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      // Read as base64 data URL, then POST to /api/upload
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("read failed"));
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataUrl,
          name: file.name,
          type: "image",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed");
      }

      const data = await res.json();
      onUploaded(data.url);
      toast.success("Image uploaded. Click Save to apply it to the homepage.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      // Reset input so the same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onCleared();
    toast.success("Custom image removed. Click Save to use the default photo.");
  };

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
        Homepage Image
      </label>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* Live preview — 4:5 aspect like the hero card */}
        <div className="relative h-40 w-32 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
          <img
            src={previewSrc}
            alt="Homepage image preview"
            className="h-full w-full object-cover object-top"
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <Loader2 className="h-6 w-6 animate-spin text-[#FFC300]" />
            </div>
          )}
          {!isCustom && !uploading && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 py-0.5 text-center text-[9px] font-medium uppercase tracking-wider text-white/90">
              Default
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-2">
          <p className="text-xs text-muted-foreground">
            This image appears in the hero section of your homepage. Upload a
            portrait photo (JPG, PNG, or WebP, max 10 MB).
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#FFC300] px-4 text-xs font-semibold text-[#000814] transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              {uploading ? "Uploading…" : "Upload Image"}
            </button>
            {isCustom && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={uploading}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-destructive/30 px-3 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            )}
          </div>
          {isCustom && (
            <div className="flex items-start gap-1.5 rounded-md bg-[#FFC300]/5 px-2 py-1.5 text-[11px] text-muted-foreground">
              <ImageIcon className="mt-0.5 h-3 w-3 shrink-0 text-[#FFC300]" />
              <span className="break-all">
                {avatarUrl}
                <br />
                <span className="text-[10px]">
                  Click <strong>Save</strong> below to apply this image to the homepage.
                </span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-muted-foreground">{label}</label>
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[#FFC300]/50"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-[#FFC300]/50"
        />
      )}
    </div>
  );
}
