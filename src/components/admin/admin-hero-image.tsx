"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useT } from "@/lib/i18n/context";
import {
  Upload,
  Trash2,
  ImageIcon,
  Loader2,
  Save,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

const DEFAULT_HERO = "/uploads/profile.jpg";
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export function AdminHeroImage() {
  const t = useT();

  // The hero image URL currently saved in the database (settings.avatarUrl).
  // Empty string means "use the default photo".
  const [savedUrl, setSavedUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // The file the user just picked (not yet saved).
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);

  // Upload-then-save pipeline state
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Drag state
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---------- Load the currently-saved hero image on mount ----------
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s: Record<string, string>) => {
        setSavedUrl(s.avatarUrl || "");
      })
      .catch(() => {
        /* ignore */
      })
      .finally(() => setLoading(false));
  }, []);

  // ---------- File selection (from input or drop) ----------
  const selectFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Image too large (max 10 MB)");
      return;
    }
    // Build a local object URL for the preview
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingPreview(URL.createObjectURL(file));
    setPendingFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    selectFile(e.target.files?.[0] ?? null);
    // Reset so selecting the same file again still fires onChange
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    selectFile(e.dataTransfer.files?.[0] ?? null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const clearPending = () => {
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingPreview(null);
    setPendingFile(null);
  };

  // ---------- Save: upload file → save URL to settings ----------
  const handleSave = async () => {
    if (!pendingFile) {
      toast.error(t.admin.heroImageSelectFirst);
      return;
    }
    setUploading(true);
    try {
      // 1) Read file as base64 data URL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("read failed"));
        reader.readAsDataURL(pendingFile);
      });

      // 2) POST to /api/upload — saves file to disk + creates a MediaAsset row
      const upRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataUrl,
          name: pendingFile.name,
          type: "image",
        }),
      });
      if (!upRes.ok) {
        const d = await upRes.json().catch(() => ({}));
        throw new Error(d.error || "Upload failed");
      }
      const upData = await upRes.json();
      const uploadedUrl: string = upData.url;

      setUploading(false);
      setSaving(true);

      // 3) PUT the new URL to /api/settings as avatarUrl — the home page reads this
      const setRes = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: uploadedUrl }),
      });
      if (!setRes.ok) throw new Error("Failed to save settings");

      // 4) Update local state + clear pending
      setSavedUrl(uploadedUrl);
      clearPending();
      toast.success(t.admin.heroImageSaved);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setUploading(false);
      setSaving(false);
    }
  };

  // ---------- Reset to the default photo ----------
  const handleReset = async () => {
    if (!confirm(t.admin.confirmDelete)) return;
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: "" }),
      });
      if (!res.ok) throw new Error("Failed to reset");
      setSavedUrl("");
      clearPending();
      toast.success(t.admin.heroImageResetDone);
    } catch {
      toast.error("Reset failed");
    } finally {
      setSaving(false);
    }
  };

  const isCustom = Boolean(savedUrl);
  const isBusy = uploading || saving;

  // ---------- Loading state ----------
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="h-8 w-8 loader-ring rounded-full border-2 border-[#FFC300] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl gradient-border p-5"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFC300]/10 text-[#FFC300]">
            <ImageIcon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold">{t.admin.heroImageTitle}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t.admin.heroImageSubtitle}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* LEFT — current / preview card */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="rounded-2xl glass border border-border p-5"
        >
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            <Sparkles className="h-4 w-4 text-[#FFC300]" />
            {t.admin.heroImageCurrent}
          </h3>

          <div className="flex justify-center">
            <div className="relative w-full max-w-[280px]">
              {/* Ambient glow */}
              <div className="absolute -inset-3 rounded-[1.5rem] bg-gradient-to-tr from-[#FFC300]/20 via-[#FFD60A]/15 to-transparent blur-2xl" />
              {/* Frame */}
              <div className="gradient-border relative overflow-hidden rounded-2xl shadow-xl">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
                  <img
                    src={pendingPreview || savedUrl || DEFAULT_HERO}
                    alt="Hero image preview"
                    className="h-full w-full object-cover object-top"
                  />
                  {isBusy && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 backdrop-blur-sm">
                      <Loader2 className="h-7 w-7 animate-spin text-[#FFC300]" />
                      <span className="text-xs font-medium text-white">
                        {uploading ? t.admin.heroImageUploading : t.admin.heroImageSaving}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status badge */}
              {!isBusy && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                  <span
                    className={
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold shadow-sm " +
                      (isCustom
                        ? "border-[#FFC300]/40 bg-[#FFC300]/10 text-[#FFC300]"
                        : "border-border bg-background text-muted-foreground")
                    }
                  >
                    {isCustom ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        {t.admin.heroImageCustom}
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-3 w-3" />
                        {t.admin.heroImageDefault}
                      </>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Reset action */}
          {isCustom && !pendingFile && (
            <button
              type="button"
              onClick={handleReset}
              disabled={isBusy}
              className="mt-6 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-destructive/30 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {t.admin.heroImageReset}
            </button>
          )}

          {/* Save action when a new file is pending */}
          {pendingFile && (
            <div className="mt-6 space-y-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isBusy}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#FFC300] text-sm font-semibold text-[#000814] transition-transform hover:scale-[1.01] disabled:opacity-60"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {uploading
                  ? t.admin.heroImageUploading
                  : saving
                  ? t.admin.heroImageSaving
                  : t.admin.heroImageSave}
              </button>
              <button
                type="button"
                onClick={clearPending}
                disabled={isBusy}
                className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-border text-xs font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-60"
              >
                {t.admin.cancel}
              </button>
            </div>
          )}

          {/* Helpful hint about seeing it live */}
          {!pendingFile && (
            <div className="mt-6 flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#FFC300]" />
              <span>{t.admin.heroImageLiveHint}</span>
            </div>
          )}
        </motion.section>

        {/* RIGHT — upload zone */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl glass border border-border p-5"
        >
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            <Upload className="h-4 w-4 text-[#FFC300]" />
            {t.admin.heroImageUpload}
          </h3>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !isBusy && fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !isBusy) {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            className={
              "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-all " +
              (dragOver
                ? "border-[#FFC300] bg-[#FFC300]/5"
                : "border-border hover:border-[#FFC300]/50 hover:bg-muted/30")
            }
          >
            <span
              className={
                "flex h-14 w-14 items-center justify-center rounded-2xl transition-colors " +
                (dragOver
                  ? "bg-[#FFC300] text-[#000814]"
                  : "bg-[#FFC300]/10 text-[#FFC300]")
              }
            >
              <Upload className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-semibold">{t.admin.heroImageDrop}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t.admin.heroImageFormats}
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleInputChange}
              disabled={isBusy}
            />
          </div>

          {/* Selected file chip */}
          {pendingFile && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 flex items-center gap-3 rounded-xl border border-[#FFC300]/30 bg-[#FFC300]/5 p-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FFC300]/10 text-[#FFC300]">
                <ImageIcon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{pendingFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(pendingFile.size / 1024).toFixed(1)} KB · {t.admin.heroImagePreview}
                </p>
              </div>
              <button
                type="button"
                onClick={clearPending}
                disabled={isBusy}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                aria-label="Remove selection"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}

          {/* Quick info card */}
          <div className="mt-4 rounded-xl bg-muted/40 p-4 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">How it works</p>
            <ul className="mt-2 space-y-1.5">
              <li className="flex gap-2">
                <span className="text-[#FFC300]">1.</span>
                <span>Pick an image above (or drag &amp; drop).</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#FFC300]">2.</span>
                <span>Preview it on the left in the exact 4:5 frame used on the homepage.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#FFC300]">3.</span>
                <span>Click “{t.admin.heroImageSave}” — it uploads and applies in one step.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#FFC300]">4.</span>
                <span>Open the homepage and refresh to see your new portrait.</span>
              </li>
            </ul>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
