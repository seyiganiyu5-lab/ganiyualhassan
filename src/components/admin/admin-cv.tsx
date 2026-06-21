"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useT } from "@/lib/i18n/context";
import {
  Upload,
  FileText,
  Trash2,
  CheckCircle,
  Loader2,
  ExternalLink,
  FileCheck2,
} from "lucide-react";
import { toast } from "sonner";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ACCEPTED = [".pdf", ".doc", ".docx"];
const ACCEPTED_MIMES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function AdminCv() {
  const t = useT();
  const [cvUrl, setCvUrl] = useState("");
  const [cvName, setCvName] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/cv")
      .then((r) => r.json())
      .then((data) => {
        setCvUrl(data.cvUrl || "");
        // Derive a friendly name from the URL path
        if (data.cvUrl) {
          const parts = String(data.cvUrl).split("/");
          setCvName(parts[parts.length - 1] || "CV");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ---------- File selection with validation ----------
  const selectFile = (f: File | null) => {
    if (!f) return;
    const name = f.name.toLowerCase();
    const extOk = ACCEPTED.some((ext) => name.endsWith(ext));
    const mimeOk =
      ACCEPTED_MIMES.includes(f.type) ||
      f.type === "" /* some browsers give empty mime for .docx */;
    if (!extOk && !mimeOk) {
      toast.error("Please select a PDF, DOC, or DOCX file");
      return;
    }
    if (f.size > MAX_BYTES) {
      toast.error(`File too large (${formatBytes(f.size)}). Max 10 MB.`);
      return;
    }
    setFile(f);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    selectFile(e.target.files?.[0] ?? null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    selectFile(e.dataTransfer.files?.[0] ?? null);
  };

  // ---------- Upload: promisified FileReader + proper error handling ----------
  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      // 1) Read file as base64 data URL (promisified so errors are caught)
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

      // 2) Upload the file to /api/upload
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataUrl,
          name: file.name,
          type: "file",
        }),
      });
      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}));
        throw new Error(err.error || "Upload failed");
      }
      const uploadData = await uploadRes.json();
      if (!uploadData.url) {
        throw new Error("Upload returned no URL");
      }

      // 3) Save the URL to /api/cv
      const cvRes = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvUrl: uploadData.url }),
      });
      if (!cvRes.ok) {
        throw new Error("Failed to save CV URL");
      }

      // 4) Update local state
      setCvUrl(uploadData.url);
      setCvName(file.name);
      setFile(null);
      toast.success("CV uploaded successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t.admin.confirmDelete)) return;
    try {
      const res = await fetch("/api/cv", { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setCvUrl("");
      setCvName("");
      toast.success("CV deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Current CV */}
      <div className="rounded-2xl glass border border-border p-6">
        <h3 className="mb-3 flex items-center gap-2 font-bold">
          <FileText className="h-4 w-4 text-[#FFC300]" />
          {t.admin.currentCv}
        </h3>
        {loading ? (
          <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : cvUrl ? (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card/50 p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
              <FileText className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                <span className="truncate text-sm font-medium">{cvName}</span>
              </div>
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 inline-flex items-center gap-1 text-xs text-[#FFC300] hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                View / download
              </a>
            </div>
            <button
              onClick={handleDelete}
              disabled={uploading}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-destructive/30 text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
              aria-label="Delete CV"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t.admin.noCv}</p>
        )}
      </div>

      {/* Upload */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl gradient-border p-6"
      >
        <h3 className="mb-4 flex items-center gap-2 font-bold">
          <Upload className="h-4 w-4 text-[#FFC300]" />
          {t.admin.uploadCv}
        </h3>
        <div className="space-y-4">
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
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-all " +
              (dragOver
                ? "border-[#FFC300] bg-[#FFC300]/5"
                : "border-border hover:border-[#FFC300]/50 hover:bg-muted/30")
            }
          >
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-[#FFC300]" />
                <span className="text-sm font-medium text-muted-foreground">
                  Uploading…
                </span>
              </>
            ) : file ? (
              <>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <FileCheck2 className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{file.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatBytes(file.size)} · ready to upload
                  </p>
                </div>
              </>
            ) : (
              <>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFC300]/10 text-[#FFC300]">
                  <Upload className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-sm font-semibold">
                    Click to select, or drag &amp; drop
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    PDF, DOC, DOCX — up to 10 MB
                  </p>
                </div>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={handleInputChange}
              disabled={uploading}
            />
          </div>

          {/* Actions */}
          {file && !uploading && (
            <div className="flex gap-2">
              <button
                onClick={handleUpload}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#FFC300] text-sm font-semibold text-[#000814] transition-transform hover:scale-[1.01]"
              >
                <Upload className="h-4 w-4" />
                {t.admin.uploadCv}
              </button>
              <button
                onClick={() => setFile(null)}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border px-6 text-sm font-medium transition-colors hover:bg-muted"
              >
                {t.admin.cancel}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
