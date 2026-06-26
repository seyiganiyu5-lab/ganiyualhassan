"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useT } from "@/lib/i18n/context";
import {
  Trash2,
  Search,
  Download,
  Users,
  Mail,
  Loader2,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
}

export function AdminSubscribers() {
  const t = useT();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const q = search.trim();
    const url = q ? `/api/newsletter?q=${encodeURIComponent(q)}` : "/api/newsletter";
    fetch(url)
      .then((r) => r.json())
      .then((data: Subscriber[]) => {
        setSubscribers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search]);

  // Debounce search
  useEffect(() => {
    const id = setTimeout(load, 250);
    return () => clearTimeout(id);
  }, [load]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected((prev) =>
      prev.size === subscribers.length ? new Set() : new Set(subscribers.map((s) => s.id))
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.admin.confirmDelete)) return;
    try {
      const res = await fetch(`/api/newsletter/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Subscriber removed");
        selected.delete(id);
        setSelected(new Set(selected));
        load();
      } else {
        toast.error("Delete failed");
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(t.admin.confirmDelete)) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`${data.deleted} subscriber(s) removed`);
        setSelected(new Set());
        load();
      } else {
        toast.error("Delete failed");
      }
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = () => {
    // Triggers a CSV download served by the API
    window.location.href = "/api/newsletter/export";
    toast.success("Exporting subscribers as CSV…");
  };

  const allSelected = subscribers.length > 0 && selected.size === subscribers.length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFC300]/10 px-3 py-1.5 text-xs font-bold text-[#FFC300]">
            <Users className="h-3.5 w-3.5" />
            {subscribers.length} {subscribers.length === 1 ? t.admin.subscriber : t.admin.subscribers}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.admin.searchSubscribers}
              className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-[#FFC300]/50"
            />
          </div>
          <button
            onClick={handleExport}
            disabled={subscribers.length === 0}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between rounded-xl border border-[#FFC300]/30 bg-[#FFC300]/5 px-4 py-2.5"
        >
          <span className="text-xs font-semibold text-foreground">
            {selected.size} {selected.size === 1 ? t.admin.subscriber : t.admin.subscribers}{" "}
            {t.admin.selected}
          </span>
          <button
            onClick={handleBulkDelete}
            disabled={deleting}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-destructive px-3 text-xs font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-60"
          >
            {deleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            {t.admin.deleteSelected}
          </button>
        </motion.div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : subscribers.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Inbox className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            {search ? t.admin.noSubscribersFound : t.admin.noSubscribers}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left text-xs text-muted-foreground">
                <th className="w-10 px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 accent-[#FFC300]"
                    aria-label="Select all"
                  />
                </th>
                <th className="px-3 py-2.5 font-semibold">{t.admin.email}</th>
                <th className="hidden px-3 py-2.5 font-semibold sm:table-cell">
                  {t.admin.subscribedOn}
                </th>
                <th className="w-10 px-3 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr
                  key={s.id}
                  className={cn(
                    "border-t border-border transition-colors hover:bg-muted/30",
                    selected.has(s.id) && "bg-[#FFC300]/5"
                  )}
                >
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={selected.has(s.id)}
                      onChange={() => toggleSelect(s.id)}
                      className="h-4 w-4 accent-[#FFC300]"
                      aria-label={`Select ${s.email}`}
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate font-medium">{s.email}</span>
                    </div>
                    <span className="mt-0.5 block text-[11px] text-muted-foreground sm:hidden">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="hidden px-3 py-2.5 text-muted-foreground sm:table-cell">
                    {new Date(s.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-destructive/30 text-destructive transition-colors hover:bg-destructive/10"
                      aria-label={t.admin.deleteSubscriber}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
