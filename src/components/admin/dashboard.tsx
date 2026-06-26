"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useT } from "@/lib/i18n/context";
import { FolderGit2, Mail, Download, TrendingUp } from "lucide-react";

interface Stats {
  totalProjects: number;
  totalMessages: number;
  downloads: number;
}

export function AdminDashboard() {
  const t = useT();
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    totalMessages: 0,
    downloads: 0,
  });
  const [recentMessages, setRecentMessages] = useState<
    Array<{ id: string; name: string; email: string; subject: string; createdAt: string; read: boolean }>
  >([]);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
    fetch("/api/messages")
      .then((r) => r.json())
      .then((data) => setRecentMessages(data.slice(0, 5)))
      .catch(() => {});
  }, []);

  const cards = [
    { label: t.admin.totalProjects, value: stats.totalProjects, icon: FolderGit2, color: "#FFC300" },
    { label: t.admin.totalMessages, value: stats.totalMessages, icon: Mail, color: "#10b981" },
    { label: t.admin.downloads, value: stats.downloads, icon: Download, color: "#a855f7" },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="relative overflow-hidden rounded-2xl glass border border-border p-5"
          >
            <div
              className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-10 blur-2xl"
              style={{ background: card.color }}
            />
            <div className="relative">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-lg"
                style={{ background: card.color }}
              >
                <card.icon className="h-5 w-5" />
              </span>
              <div className="mt-4 text-3xl font-black">{card.value}</div>
              <div className="text-xs text-muted-foreground">{card.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent messages */}
      <div className="rounded-2xl glass border border-border p-5">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[#FFC300]" />
          <h3 className="font-bold">Recent Messages</h3>
        </div>
        {recentMessages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{t.admin.noMessages}</p>
        ) : (
          <div className="space-y-2">
            {recentMessages.map((msg) => (
              <div
                key={msg.id}
                className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/50"
              >
                <span
                  className={`h-2 w-2 rounded-full ${msg.read ? "bg-muted-foreground" : "bg-[#FFC300]"}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{msg.subject || msg.name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {msg.name} · {msg.email}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(msg.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick info */}
      <div className="rounded-2xl gradient-border p-5">
        <h3 className="mb-2 font-bold">Welcome to your dashboard</h3>
        <p className="text-sm text-muted-foreground">
          Manage your projects, messages, media, and site settings from this panel. Use the
          sidebar to navigate between sections. Changes are saved to your database instantly.
        </p>
      </div>
    </div>
  );
}
