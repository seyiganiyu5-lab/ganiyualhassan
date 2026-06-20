"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useT } from "@/lib/i18n/context";
import { Upload, Trash2, Copy, ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface MediaAsset {
  id: string;
  name: string;
  url: string;
  type: string;
  createdAt: string;
}

export function AdminMedia() {
  const t = useT();
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);

  const load = () => {
    fetch("/api/upload")
      .then((r) => r.json())
      .then(setMedia)
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async () => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const reader = new FileReader();
        await new Promise<void>((resolve) => {
          reader.onload = async () => {
            const dataUrl = reader.result as string;
            await fetch("/api/upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ dataUrl, name: file.name, type: "image" }),
            });
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }
      toast.success("Upload complete");
      setFiles(null);
      load();
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, url: string) => {
    if (!confirm(t.admin.confirmDelete)) return;
    try {
      const res = await fetch(`/api/upload?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setMedia(media.filter((m) => m.id !== id));
        toast.success("Deleted from library");
      } else {
        toast.error("Delete failed");
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  };

  return (
    <div className="space-y-6">
      {/* Upload zone */}
      <div className="rounded-2xl gradient-border p-5">
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-6 text-center transition-colors hover:border-[#FFC300]/50">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <span className="text-sm font-medium">
            {files && files.length > 0
              ? `${files.length} file(s) selected`
              : t.admin.uploadImage}
          </span>
          <span className="text-xs text-muted-foreground">PNG, JPG, WebP up to 10MB</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => setFiles(e.target.files)}
          />
        </label>
        {files && files.length > 0 && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#FFC300] text-sm font-semibold text-[#000814] disabled:opacity-60"
          >
            {uploading ? (
              <span className="h-4 w-4 loader-ring rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Upload {files.length} file(s)
          </button>
        )}
      </div>

      {/* Media grid */}
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Media Library ({media.length})
        </h3>
        {media.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No media uploaded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {media.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative overflow-hidden rounded-xl border border-border"
              >
                <div className="aspect-square bg-muted">
                  <img
                    src={m.url}
                    alt={m.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex gap-1">
                    <button
                      onClick={() => copyUrl(m.url)}
                      className="flex h-7 flex-1 items-center justify-center gap-1 rounded bg-white/20 text-xs text-white backdrop-blur"
                    >
                      <Copy className="h-3 w-3" /> URL
                    </button>
                    <button
                      onClick={() => handleDelete(m.id, m.url)}
                      className="flex h-7 w-7 items-center justify-center rounded bg-red-500/80 text-white"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
