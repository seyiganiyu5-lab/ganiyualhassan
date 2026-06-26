"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useT } from "@/lib/i18n/context";
import {
  Send,
  Loader2,
  Megaphone,
  CheckCircle2,
  FileEdit,
  AlertCircle,
  Inbox,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Broadcast {
  id: string;
  subject: string;
  body: string;
  status: string; // sent | draft | failed
  recipientCount: number;
  sentAt: string;
}

export function AdminBroadcast() {
  const t = useT();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriberCount, setSubscriberCount] = useState(0);

  const load = useCallback(() => {
    Promise.all([
      fetch("/api/broadcasts").then((r) => r.json()),
      fetch("/api/newsletter").then((r) => r.json()),
    ])
      .then(([b, subs]: [Broadcast[], { id: string }[]]) => {
        setBroadcasts(b);
        setSubscriberCount(subs.length);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/broadcasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body }),
      });
      const data = await res.json();
      if (res.ok && data.status === "sent") {
        toast.success(
          t.admin.broadcastSentTo.replace("{count}", String(data.recipientCount))
        );
        setSubject("");
        setBody("");
        load();
      } else if (data.status === "draft") {
        toast.info(data.message || t.admin.broadcastSavedDraft);
        setSubject("");
        setBody("");
        load();
      } else {
        toast.error(data.message || data.error || t.admin.broadcastFailed);
      }
    } catch {
      toast.error(t.admin.broadcastFailed);
    } finally {
      setSending(false);
    }
  };

  const canSend = subject.trim().length > 0 && body.trim().length > 0 && !sending;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Compose */}
      <form
        onSubmit={handleSend}
        className="space-y-4 rounded-2xl glass border border-border p-5"
      >
        <div className="flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-[#FFC300]" />
          <h3 className="font-bold">{t.admin.composeBroadcast}</h3>
        </div>

        {/* Audience hint */}
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <Mail className="h-3.5 w-3.5 shrink-0 text-[#FFC300]" />
          <span>
            {t.admin.audience}:{" "}
            <strong className="text-foreground">{subscriberCount}</strong>{" "}
            {subscriberCount === 1 ? t.admin.subscriber : t.admin.subscribers}
          </span>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-muted-foreground">
            {t.admin.subject}
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={t.admin.subjectPlaceholder}
            maxLength={120}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-[#FFC300]/50"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-muted-foreground">
            {t.admin.message}
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t.admin.messagePlaceholder}
            rows={8}
            className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[#FFC300]/50"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            {body.length} {t.admin.characters}
          </p>
        </div>

        <button
          type="submit"
          disabled={!canSend}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#FFC300] px-6 text-sm font-semibold text-[#000814] transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t.admin.sending}
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              {t.admin.sendBroadcast}
            </>
          )}
        </button>
      </form>

      {/* History */}
      <div className="space-y-3 rounded-2xl glass border border-border p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">{t.admin.broadcastHistory}</h3>
          <span className="text-xs text-muted-foreground">
            {broadcasts.length} {broadcasts.length === 1 ? t.admin.broadcast : t.admin.broadcasts}
          </span>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : broadcasts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <Inbox className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{t.admin.noBroadcasts}</p>
          </div>
        ) : (
          <div className="max-h-[28rem] space-y-2 overflow-y-auto pr-1 [scrollbar-width:thin]">
            {broadcasts.map((b) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-border bg-background/40 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="line-clamp-1 text-sm font-semibold">{b.subject}</span>
                  <StatusBadge status={b.status} t={t} />
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{b.body}</p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{new Date(b.sentAt).toLocaleString()}</span>
                  {b.status === "sent" && (
                    <span>
                      {t.admin.recipients}: {b.recipientCount}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({
  status,
  t,
}: {
  status: string;
  t: ReturnType<typeof useT>;
}) {
  const map: Record<string, { icon: typeof CheckCircle2; cls: string; label: string }> = {
    sent: {
      icon: CheckCircle2,
      cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
      label: t.admin.statusSent,
    },
    draft: {
      icon: FileEdit,
      cls: "border-amber-500/30 bg-amber-500/10 text-amber-600",
      label: t.admin.statusDraft,
    },
    failed: {
      icon: AlertCircle,
      cls: "border-red-500/30 bg-red-500/10 text-red-600",
      label: t.admin.statusFailed,
    },
  };
  const cfg = map[status] || map.draft;
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        cfg.cls
      )}
    >
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}
