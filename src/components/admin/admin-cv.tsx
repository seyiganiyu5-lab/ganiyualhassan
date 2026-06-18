"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useT } from "@/lib/i18n/context";
import { Upload, FileText, Trash2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export function AdminCv() {
  const t = useT();
  const [cvUrl, setCvUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetch("/api/cv")
      .then((r) => r.json())
      .then((data) => setCvUrl(data.cvUrl || ""));
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl, name: file.name, type: "file" }),
        });
        const uploadData = await uploadRes.json();
        if (uploadData.url) {
          const res = await fetch("/api/cv", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cvUrl: uploadData.url }),
          });
          if (res.ok) {
            setCvUrl(uploadData.url);
            toast.success("CV uploaded successfully");
            setFile(null);
          }
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Upload failed");
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t.admin.confirmDelete)) return;
    try {
      await fetch("/api/cv", { method: "DELETE" });
      setCvUrl("");
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
        {cvUrl ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card/50 p-3">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">CV file uploaded</div>
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#FFC300] hover:underline"
                >
                  {cvUrl}
                </a>
              </div>
              <button
                onClick={handleDelete}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-destructive/30 text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
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
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-8 text-center transition-colors hover:border-[#FFC300]/50">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm font-medium">
              {file ? file.name : "Click to select a PDF file"}
            </span>
            <span className="text-xs text-muted-foreground">PDF, DOC, DOCX up to 10MB</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#FFC300] text-sm font-semibold text-[#000814] disabled:opacity-60"
          >
            {uploading ? (
              <span className="h-4 w-4 loader-ring rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {t.admin.uploadCv}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
