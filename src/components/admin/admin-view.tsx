"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useT } from "@/lib/i18n/context";
import {
  ArrowUpRight,
  Eye,
  EyeOff,
  FileText,
  FolderGit2,
  Image as ImageIcon,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  Menu,
  Search as SeoIcon,
  Settings,
  UserCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminDashboard } from "./dashboard";
import { AdminHeroImage } from "./admin-hero-image";
import { AdminProjects } from "./projects";
import { AdminMessages } from "./messages";
import { AdminCv } from "./admin-cv";
import { AdminMedia } from "./admin-media";
import { AdminSettings } from "./admin-settings";
import { AdminSeo } from "./admin-seo";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { EASE } from "@/components/site/motion";
import { Logomark, Wordmark } from "@/components/site/logo";
import { toast } from "sonner";

export type AdminTab =
  | "dashboard"
  | "projects"
  | "hero-image"
  | "cv"
  | "media"
  | "messages"
  | "settings"
  | "seo";

const TAB_IDS: AdminTab[] = ["dashboard", "projects", "hero-image", "cv", "media", "messages", "settings", "seo"];

/** The active section lives in the URL hash, so refresh and Back both work. */
function useHashTab(): [AdminTab, (t: AdminTab) => void] {
  const read = () => {
    const h = (typeof window !== "undefined" ? window.location.hash.slice(1) : "") as AdminTab;
    return TAB_IDS.includes(h) ? h : "dashboard";
  };
  const [tab, setTab] = useState<AdminTab>("dashboard");
  useEffect(() => {
    setTab(read());
    const onHash = () => setTab(read());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const go = useCallback((t: AdminTab) => {
    if (window.location.hash.slice(1) !== t) window.location.hash = t;
    setTab(t);
  }, []);
  return [tab, go];
}

export function AdminView() {
  const t = useT();
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [loggingIn, setLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useHashTab();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  // Ask the server whether this browser has a valid session cookie.
  useEffect(() => {
    sessionStorage.removeItem("admin_session"); // legacy client-only flag, no longer trusted
    fetch("/api/auth")
      .then((r) => r.json())
      .then((d: { authed?: boolean }) => setAuthed(Boolean(d.authed)))
      .catch(() => setAuthed(false))
      .finally(() => setChecking(false));
  }, []);

  // Keep the unread badge current as you move around. A 401 here means the
  // session expired, so drop back to the sign-in screen.
  useEffect(() => {
    if (!authed) return;
    fetch("/api/messages")
      .then((r) => {
        if (r.status === 401) {
          setAuthed(false);
          return [];
        }
        return r.json();
      })
      .then((list: { read: boolean }[]) => Array.isArray(list) && setUnread(list.filter((m) => !m.read).length))
      .catch(() => {});
  }, [authed, activeTab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setAuthed(true);
        setCredentials({ username: "", password: "" });
        toast.success(t.admin.welcomeBack);
      } else if (res.status === 429) {
        toast.error(t.admin.ui.tooManyAttempts);
      } else if (res.status === 503) {
        toast.error(t.admin.ui.notConfigured);
      } else {
        toast.error(t.admin.invalidCredentials);
      }
    } catch {
      toast.error(t.admin.invalidCredentials);
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" }).catch(() => {});
    setAuthed(false);
    setCredentials({ username: "", password: "" });
  };

  const groups: { label?: string; items: { id: AdminTab; label: string; icon: typeof Mail; badge?: number }[] }[] = [
    { items: [{ id: "dashboard", label: t.admin.ui.overview, icon: LayoutDashboard }] },
    {
      label: t.admin.ui.groupContent,
      items: [
        { id: "projects", label: t.admin.projects, icon: FolderGit2 },
        { id: "hero-image", label: t.admin.ui.profilePhoto, icon: UserCircle },
        { id: "cv", label: t.admin.cv, icon: FileText },
        { id: "media", label: t.admin.media, icon: ImageIcon },
      ],
    },
    {
      label: t.admin.ui.groupInbox,
      items: [{ id: "messages", label: t.admin.messages, icon: Mail, badge: unread }],
    },
    {
      label: t.admin.ui.groupSite,
      items: [
        { id: "settings", label: t.admin.settings, icon: Settings },
        { id: "seo", label: t.admin.seo, icon: SeoIcon },
      ],
    },
  ];
  const activeLabel = groups.flatMap((g) => g.items).find((i) => i.id === activeTab)?.label;

  // ---------- Loading ----------
  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ---------- Login ----------
  if (!authed) {
    const field =
      "h-11 w-full rounded-lg border border-border bg-background px-3.5 text-sm outline-none transition-colors focus:border-foreground/40";
    return (
      <div className="flex min-h-screen flex-col bg-background px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 text-sm">
            <Logomark className="h-6 w-6" />
            <Wordmark name="Ganiyu Al-Hassan" />
          </Link>
          <div className="flex items-center">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="w-full max-w-sm"
        >
          <Logomark animated className="mb-6 h-16 w-16" />
          <p className="eyebrow mb-2">Admin</p>
          <h1 className="text-3xl font-semibold tracking-tight">{t.admin.login}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{t.admin.ui.signInHint}</p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm text-muted-foreground">{t.admin.username}</span>
              <input
                required
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                autoCapitalize="none"
                autoComplete="username"
                className={field}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm text-muted-foreground">{t.admin.password}</span>
              <span className="relative block">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  autoComplete="current-password"
                  className={cn(field, "pr-11")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? t.admin.ui.hidePassword : t.admin.ui.showPassword}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
            </label>
            <button
              type="submit"
              disabled={loggingIn}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loggingIn && <Loader2 className="h-4 w-4 animate-spin" />}
              {t.admin.signIn}
            </button>
          </form>
        </motion.div>
        </div>
      </div>
    );
  }

  // ---------- Dashboard ----------
  const nav = (onPick?: () => void, layoutId = "admin-nav") => (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
      {groups.map((g, gi) => (
        <div key={gi}>
          {g.label && (
            <p className="eyebrow mb-1.5 px-3 !text-[11px]">
              {g.label}
            </p>
          )}
          <div className="space-y-0.5">
            {g.items.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onPick?.();
                  }}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId={layoutId}
                      className="absolute inset-0 rounded-lg bg-muted"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <item.icon className="relative h-4 w-4" />
                  <span className="relative flex-1 text-left">{item.label}</span>
                  {!!item.badge && (
                    <span className="relative min-w-5 rounded-full bg-primary px-1.5 text-center text-[11px] font-semibold leading-5 text-primary-foreground">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  const brand = (
    <Link href="/" className="flex items-center gap-2.5 text-sm">
      <Logomark className="h-6 w-6" />
      <Wordmark name="Ganiyu Al-Hassan" />
      <span className="rounded-full border border-border px-1.5 py-px font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        Admin
      </span>
    </Link>
  );

  const footer = (
    <div className="border-t border-border p-3">
      <button
        onClick={handleLogout}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
      >
        <LogOut className="h-4 w-4" />
        {t.admin.logout}
      </button>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — desktop */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border md:flex">
        <div className="flex h-16 items-center px-6">{brand}</div>
        {nav()}
        {footer}
      </aside>

      {/* Sidebar — mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.div
              className="absolute inset-0 bg-background/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: EASE }}
              className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-border bg-background"
            >
              <div className="flex h-16 items-center justify-between px-6">
                {brand}
                <button
                  onClick={() => setMenuOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
                  aria-label={t.admin.ui.closeMenu}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {nav(() => setMenuOpen(false), "admin-nav-mobile")}
              {footer}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border px-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground md:hidden"
              aria-label={t.admin.ui.menu}
            >
              <Menu className="h-4 w-4" />
            </button>
            <AnimatePresence mode="wait" initial={false}>
              <motion.h1
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="truncate text-base font-semibold tracking-tight sm:text-lg"
              >
                {activeLabel}
              </motion.h1>
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href="/"
              target="_blank"
              className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
            >
              {t.admin.ui.viewSite}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <span className="mx-1 hidden h-4 w-px bg-border sm:block" />
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="mx-auto w-full max-w-5xl p-4 sm:p-8"
            >
              {activeTab === "dashboard" && <AdminDashboard onNavigate={setActiveTab} />}
              {activeTab === "hero-image" && (
                <div className="space-y-12">
                  <AdminHeroImage />
                  <AdminHeroImage
                    settingKey="aboutImageUrl"
                    title={t.admin.aboutImageTitle}
                    subtitle={t.admin.aboutImageSubtitle}
                    liveHint={t.admin.aboutImageLiveHint}
                  />
                </div>
              )}
              {activeTab === "projects" && <AdminProjects />}
              {activeTab === "messages" && <AdminMessages />}
              {activeTab === "cv" && <AdminCv />}
              {activeTab === "media" && <AdminMedia />}
              {activeTab === "settings" && <AdminSettings />}
              {activeTab === "seo" && <AdminSeo />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
