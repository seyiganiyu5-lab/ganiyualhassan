"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useT } from "@/lib/i18n/context";
import { Trash2, Mail, MailOpen, CheckCircle, Circle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  phone: string | null;
  read: boolean;
  replied: boolean;
  createdAt: string;
}

export function AdminMessages() {
  const t = useT();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "replied">("all");

  const load = () => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then((data) => {
        setMessages(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const update = async (id: string, data: Partial<Message>) => {
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) load();
    } catch {
      toast.error("Update failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.admin.confirmDelete)) return;
    try {
      await fetch(`/api/messages/${id}`, { method: "DELETE" });
      toast.success("Message deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  const filtered = messages.filter((m) => {
    if (filter === "unread") return !m.read;
    if (filter === "replied") return m.replied;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all", "unread", "replied"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              filter === f
                ? "bg-[#FF5A1F] text-white"
                : "glass border border-border text-muted-foreground"
            )}
          >
            {f === "all" ? "All" : f === "unread" ? "Unread" : "Replied"}
            <span className="ml-1.5 text-xs opacity-70">
              {f === "all"
                ? messages.length
                : f === "unread"
                ? messages.filter((m) => !m.read).length
                : messages.filter((m) => m.replied).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Mail className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">{t.admin.noMessages}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "rounded-xl border p-4 transition-colors",
                msg.read ? "border-border bg-card/30" : "border-[#FF5A1F]/30 bg-[#FF5A1F]/5"
              )}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => update(msg.id, { read: !msg.read })}
                  className="mt-0.5 text-muted-foreground hover:text-[#FF5A1F]"
                >
                  {msg.read ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{msg.name}</span>
                      {msg.replied && (
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">{msg.email}</div>
                  <div className="mt-1 text-sm font-medium">
                    {msg.subject || "(no subject)"}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{msg.message}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#FF5A1F] px-3 text-xs font-semibold text-white"
                    >
                      <Mail className="h-3 w-3" /> Reply
                    </a>
                    <button
                      onClick={() => update(msg.id, { read: !msg.read })}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium"
                    >
                      {msg.read ? (
                        <>
                          <Circle className="h-3 w-3" /> Mark unread
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3 w-3" /> {t.admin.markRead}
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => update(msg.id, { replied: !msg.replied })}
                      className={cn(
                        "inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium",
                        msg.replied
                          ? "border-emerald-500/30 text-emerald-600"
                          : "border-border"
                      )}
                    >
                      <CheckCircle className="h-3 w-3" />
                      {msg.replied ? "Replied" : t.admin.markReplied}
                    </button>
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-destructive/30 text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
