"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useT } from "@/lib/i18n/context";
import {
  Upload,
  X,
  Link2,
  Loader2,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  Star,
  FolderUp,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

/** Files we accept inside a project / folder upload. */
const ACCEPTED_TYPES = ["image/"];
const isAcceptedFile = (f: File) =>
  f.type.startsWith("image/") || f.type === "application/pdf";

export const isPdfUrl = (url: string) => /\.pdf(\?.*)?$/i.test(url);

/** Folder-upload inputs need non-standard `webkitdirectory` / `directory` attrs. */
const folderInputProps = {
  webkitdirectory: "",
  directory: "",
  mozdirectory: "",
} as React.InputHTMLAttributes<HTMLInputElement>;

/**
 * Inline project image/file manager.
 *
 * - Drag-and-drop OR click-to-browse (multi-file: images + PDFs)
 * - OR upload a whole FOLDER (recursive) — ideal for branding kits
 * - OR paste an external image URL
 * - Live thumbnail grid with: make-cover, move-left/right, remove
 * - First image is treated as the cover (used as the project card thumbnail)
 *
 * Calls `onChange` with the new full list of file URLs whenever it changes.
 */
export function ProjectImageUploader({
  images,
  onChange,
}: {
  images: string[];
  onChange: (next: string[]) => void;
}) {
  const t = useT();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  // ---------- Upload files (multi: images + PDFs) ----------
  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter(isAcceptedFile);
    if (list.length === 0) {
      toast.error(t.admin.projectImagesNoValidFiles);
      return;
    }
    const tooBig = list.find((f) => f.size > MAX_BYTES);
    if (tooBig) {
      toast.error(`${tooBig.name} is too large (max 10 MB)`);
      return;
    }

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of list) {
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
            type: file.type === "application/pdf" ? "file" : "image",
          }),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.error || `Failed to upload ${file.name}`);
        }
        const data = await res.json();
        uploadedUrls.push(data.url as string);
      }
      onChange([...images, ...uploadedUrls]);
      toast.success(
        uploadedUrls.length === 1
          ? "File uploaded"
          : t.admin.projectImagesFilesUploaded.replace("{count}", String(uploadedUrls.length))
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (folderInputRef.current) folderInputRef.current.value = "";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) uploadFiles(e.target.files);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) uploadFiles(e.dataTransfer.files);
  };

  // ---------- URL paste ----------
  const handleAddUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    try {
      new URL(url);
    } catch {
      toast.error(t.admin.projectImagesInvalidUrl);
      return;
    }
    onChange([...images, url]);
    setUrlInput("");
    toast.success("Image URL added");
  };

  // ---------- Reorder / remove ----------
  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const remove = (index: number) => {
    const next = images.filter((_, i) => i !== index);
    onChange(next);
  };

  const makeCover = (index: number) => {
    if (index === 0) return;
    const next = [...images];
    const [item] = next.splice(index, 1);
    next.unshift(item);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-muted-foreground">
        {t.admin.projectImagesTitle}
      </label>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        onClick={() => !uploading && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !uploading) {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className={
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-5 text-center transition-all " +
          (dragOver
            ? "border-[#FFC300] bg-[#FFC300]/5"
            : "border-border hover:border-[#FFC300]/50 hover:bg-muted/30")
        }
      >
        {uploading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-[#FFC300]" />
            <span className="text-xs font-medium text-muted-foreground">
              {t.admin.projectImagesUploading}
            </span>
          </>
        ) : (
          <>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFC300]/10 text-[#FFC300]">
              <Upload className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold">{t.admin.projectImagesDrop}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {t.admin.projectImagesFormats}
              </p>
            </div>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          className="hidden"
          onChange={handleInputChange}
          disabled={uploading}
        />
        <input
          ref={folderInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleInputChange}
          disabled={uploading}
          {...folderInputProps}
        />
      </div>

      {/* Upload-folder secondary action — stop propagation so the drop-zone
          click handler doesn't fire at the same time. */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (!uploading) folderInputRef.current?.click();
        }}
        disabled={uploading}
        className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-[#FFC300]/40 bg-[#FFC300]/5 text-xs font-semibold text-[#FFC300] transition-colors hover:bg-[#FFC300]/10 disabled:opacity-50"
      >
        <FolderUp className="h-4 w-4" />
        {t.admin.projectImagesUploadFolder}
      </button>
      <p className="-mt-1.5 text-center text-[10px] text-muted-foreground">
        {t.admin.projectImagesFolderHint}
      </p>

      {/* URL paste row */}
      <div>
        <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
          {t.admin.projectImagesAddUrl}
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddUrl();
                }
              }}
              placeholder={t.admin.projectImagesAddUrlPlaceholder}
              className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs outline-none focus:border-[#FFC300]/50"
              disabled={uploading}
            />
          </div>
          <button
            type="button"
            onClick={handleAddUrl}
            disabled={uploading || !urlInput.trim()}
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            {t.admin.projectImagesAddUrlBtn}
          </button>
        </div>
      </div>

      {/* Preview grid */}
      {images.length === 0 ? (
        <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
          <ImageIcon className="h-4 w-4 shrink-0" />
          {t.admin.projectImagesEmpty}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {images.map((url, i) => (
              <motion.div
                key={url + i}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
              >
                {isPdfUrl(url) ? (
                  // PDF thumbnail — icon + badge
                  <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-red-500/10 to-muted">
                    <FileText className="h-7 w-7 text-red-500" />
                    <span className="rounded bg-red-500/90 px-1.5 py-0.5 text-[9px] font-bold text-white">
                      {t.admin.projectImagesPdf}
                    </span>
                    <span className="max-w-[90%] truncate text-[9px] text-muted-foreground">
                      {url.split("/").pop()}
                    </span>
                  </div>
                ) : (
                  <img
                    src={url}
                    alt={`Project image ${i + 1}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.opacity = "0.2";
                    }}
                  />
                )}

                {/* Cover badge */}
                {i === 0 && (
                  <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-[#FFC300] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#000814] shadow">
                    <Star className="h-2.5 w-2.5 fill-current" />
                    {t.admin.projectImagesFirst}
                  </span>
                )}

                {/* Hover controls overlay */}
                <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/80 via-black/30 to-black/40 p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      className="flex h-6 w-6 items-center justify-center rounded-md bg-red-500/90 text-white transition-colors hover:bg-red-600"
                      aria-label={t.admin.projectImagesRemove}
                      title={t.admin.projectImagesRemove}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => move(i, -1)}
                        disabled={i === 0}
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-white/20 text-white backdrop-blur transition-colors hover:bg-white/30 disabled:opacity-30"
                        aria-label={t.admin.projectImagesMoveLeft}
                        title={t.admin.projectImagesMoveLeft}
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(i, 1)}
                        disabled={i === images.length - 1}
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-white/20 text-white backdrop-blur transition-colors hover:bg-white/30 disabled:opacity-30"
                        aria-label={t.admin.projectImagesMoveRight}
                        title={t.admin.projectImagesMoveRight}
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {i !== 0 && (
                      <button
                        type="button"
                        onClick={() => makeCover(i)}
                        className="inline-flex h-6 items-center gap-1 rounded-md bg-[#FFC300] px-1.5 text-[9px] font-bold uppercase tracking-wide text-[#000814] transition-transform hover:scale-105"
                        title={t.admin.projectImagesMakeCover}
                      >
                        <Star className="h-2.5 w-2.5 fill-current" />
                        {t.admin.projectImagesMakeCover}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
