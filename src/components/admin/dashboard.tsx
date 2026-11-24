"use client";

import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { ArrowRight, FileText, FolderPlus, Settings, UserCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { EASE } from "@/components/site/motion";
import { coverOf } from "@/lib/media";
import type { AdminTab } from "./admin-view";

interface Msg {
  id: string;
  name: string;
  email: string;
  subject: string;
  createdAt: string;
  read: boolean;
}
interface Proj {
  id: string;
  title: string;
  category: string;
  featured: boolean;
  images: string[];
  createdAt: string;
}

/** Counts up from 0 once the number arrives. */
function Count({ to }: { to: number }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v).toString());
  useEffect(() => {
    const c = animate(mv, to, { duration: 0.8, ease: EASE });
    return () => c.stop();
  }, [to, mv]);
  return <motion.span>{rounded}</motion.span>;
}

const item = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: EASE, delay: i * 0.05 },
});

export function AdminDashboard({ onNavigate }: { onNavigate: (t: AdminTab) => void }) {
  const { t, locale } = useI18n();
  const ui = t.admin.ui;
  const [messages, setMessages] = useState<Msg[]>([]);
  const [projects, setProjects] = useState<Proj[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/messages").then((r) => r.json()).catch(() => []),
      fetch("/api/projects").then((r) => r.json()).catch(() => []),
    ]).then(([m, p]) => {
      if (Array.isArray(m)) setMessages(m);
      if (Array.isArray(p)) setProjects(p);
      setLoaded(true);
    });
  }, []);

  const unread = messages.filter((m) => !m.read).length;
  const stats: { label: string; value: number; tab: AdminTab }[] = [
    { label: t.admin.projects, value: projects.length, tab: "projects" },
    { label: ui.featured, value: projects.filter((p) => p.featured).length, tab: "projects" },
    { label: t.admin.messages, value: messages.length, tab: "messages" },
    { label: ui.unread, value: unread, tab: "messages" },
  ];
  const actions: { label: string; icon: typeof FileText; tab: AdminTab }[] = [
    { label: ui.addProject, icon: FolderPlus, tab: "projects" },
    { label: ui.updatePhoto, icon: UserCircle, tab: "hero-image" },
    { label: ui.uploadCv, icon: FileText, tab: "cv" },
    { label: ui.editContact, icon: Settings, tab: "settings" },
  ];
  const date = (s: string) =>
    new Date(s).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "short" });
  const recentProjects = [...projects]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 4);

  return (
    <div className="space-y-12">
      <motion.div {...item(0)}>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{ui.greeting}</h2>
        <p className="mt-1 text-muted-foreground">{ui.greetingSub}</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.button
            key={s.label}
            {...item(i + 1)}
            onClick={() => onNavigate(s.tab)}
            className="group bg-background p-5 text-left transition-colors hover:bg-muted/50"
          >
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">
              {loaded ? <Count to={s.value} /> : <span className="text-muted-foreground/40">–</span>}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Quick actions */}
      <section>
        <SectionTitle>{ui.quickActions}</SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((a, i) => (
            <motion.button
              key={a.label}
              {...item(i + 5)}
              onClick={() => onNavigate(a.tab)}
              className="group flex items-center gap-3 rounded-xl border border-border p-4 text-left text-sm font-medium transition-colors hover:border-foreground/30"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <a.icon className="h-4 w-4" />
              </span>
              {a.label}
            </motion.button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Recent messages */}
        <section>
          <SectionTitle action={() => onNavigate("messages")} actionLabel={ui.viewAll}>
            {ui.recentMessages}
          </SectionTitle>
          {loaded && messages.length === 0 ? (
            <Empty>{t.admin.noMessages}</Empty>
          ) : (
            <ul className="divide-y divide-border border-y border-border">
              {messages.slice(0, 5).map((m, i) => (
                <motion.li key={m.id} {...item(i + 9)}>
                  <button
                    onClick={() => onNavigate("messages")}
                    className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-muted/40"
                  >
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${m.read ? "bg-transparent" : "bg-primary"}`}
                      aria-label={m.read ? undefined : ui.unread}
                    />
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-sm ${m.read ? "" : "font-semibold"}`}>
                        {m.subject || m.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {m.name} · {m.email}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">{date(m.createdAt)}</span>
                  </button>
                </motion.li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent projects */}
        <section>
          <SectionTitle action={() => onNavigate("projects")} actionLabel={ui.viewAll}>
            {ui.recentProjects}
          </SectionTitle>
          {loaded && projects.length === 0 ? (
            <Empty>{ui.noProjects}</Empty>
          ) : (
            <ul className="divide-y divide-border border-y border-border">
              {recentProjects.map((p, i) => {
                const cover = coverOf(p.images || []);
                return (
                  <motion.li key={p.id} {...item(i + 9)}>
                    <button
                      onClick={() => onNavigate("projects")}
                      className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-muted/40"
                    >
                      <span className="h-10 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                        {cover && <img src={cover} alt="" className="h-full w-full object-cover" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{p.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {t.projects.categories[p.category as keyof typeof t.projects.categories] ?? p.category}
                          {p.featured && ` · ${ui.featured}`}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">{date(p.createdAt)}</span>
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function SectionTitle({
  children,
  action,
  actionLabel,
}: {
  children: React.ReactNode;
  action?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-baseline justify-between">
      <h3 className="eyebrow !text-[11px]">{children}</h3>
      {action && (
        <button onClick={action} className="group inline-flex items-center gap-1 text-sm font-medium">
          {actionLabel}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      )}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}
