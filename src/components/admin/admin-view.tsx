"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useT } from "@/lib/i18n/context";
import {
  LayoutDashboard,
  FolderGit2,
  Mail,
  FileText,
  Image as ImageIcon,
  Settings,
  Search as SeoIcon,
  LogOut,
  Lock,
  Shield,
  ArrowLeft,
  Menu,
  X,
  UserCircle,
  Users,
  Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminDashboard } from "./dashboard";
import { AdminHeroImage } from "./admin-hero-image";
import { AdminProjects } from "./projects";
import { AdminMessages } from "./messages";
import { AdminSubscribers } from "./admin-subscribers";
import { AdminBroadcast } from "./admin-broadcast";
import { AdminCv } from "./admin-cv";
import { AdminMedia } from "./admin-media";
import { AdminSettings } from "./admin-settings";
import { AdminSeo } from "./admin-seo";
import { LanguageSwitcher } from "@/components/portfolio/language-switcher";
import { ThemeToggle } from "@/components/portfolio/theme-toggle";
import { ParticleBackground } from "@/components/portfolio/particle-background";
import { toast } from "sonner";

export function AdminView() {
  const t = useT();
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [loggingIn, setLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Restore session on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const session = sessionStorage.getItem("admin_session");
      if (session === "true") setAuthed(true);
    }
    setChecking(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAuthed(true);
        sessionStorage.setItem("admin_session", "true");
        toast.success(t.admin.welcomeBack);
      } else {
        toast.error(t.admin.invalidCredentials);
      }
    } catch {
      toast.error(t.admin.invalidCredentials);
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setAuthed(false);
    sessionStorage.removeItem("admin_session");
    setCredentials({ username: "", password: "" });
  };

  const tabs = [
    { id: "dashboard", label: t.admin.dashboard, icon: LayoutDashboard },
    { id: "hero-image", label: t.admin.heroImage, icon: UserCircle },
    { id: "projects", label: t.admin.projects, icon: FolderGit2 },
    { id: "messages", label: t.admin.messages, icon: Mail },
    { id: "subscribers", label: t.admin.subscribers, icon: Users },
    { id: "broadcast", label: t.admin.broadcast, icon: Megaphone },
    { id: "cv", label: t.admin.cv, icon: FileText },
    { id: "media", label: t.admin.media, icon: ImageIcon },
    { id: "settings", label: t.admin.settings, icon: Settings },
    { id: "seo", label: t.admin.seo, icon: SeoIcon },
  ];

  // ---------- Loading state ----------
  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="h-8 w-8 loader-ring rounded-full border-2 border-[#FFC300] border-t-transparent" />
      </div>
    );
  }

  // ---------- Login screen (full page) ----------
  if (!authed) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
        <ParticleBackground />
        {/* Top-right controls */}
        <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        {/* Back to site */}
        <Link
          href="/"
          className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full glass border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.admin.backToSite}
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="relative overflow-hidden rounded-3xl glass-strong border border-border p-8 shadow-2xl">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#FFC300]/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-[#FFC300]/5 blur-3xl" />

            <div className="relative text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFC300] to-[#FFD60A] text-white shadow-lg glow-orange">
                <Shield className="h-8 w-8" />
              </span>
              <h2 className="mt-4 text-2xl font-black">{t.admin.login}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t.admin.adminAccess}
              </p>
            </div>

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="admin-username"
                  className="mb-1.5 block text-xs font-semibold text-muted-foreground"
                >
                  {t.admin.username}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="admin-username"
                    required
                    value={credentials.username}
                    onChange={(e) =>
                      setCredentials({ ...credentials, username: e.target.value })
                    }
                    placeholder="admin"
                    className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none transition-colors focus:border-[#FFC300]/50"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="admin-password"
                  className="mb-1.5 block text-xs font-semibold text-muted-foreground"
                >
                  {t.admin.password}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="admin-password"
                    required
                    type="password"
                    value={credentials.password}
                    onChange={(e) =>
                      setCredentials({ ...credentials, password: e.target.value })
                    }
                    placeholder="••••••••"
                    className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none transition-colors focus:border-[#FFC300]/50"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loggingIn}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#FFC300] px-6 text-sm font-semibold text-[#000814] shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-60"
              >
                {loggingIn ? (
                  <span className="h-4 w-4 loader-ring rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Shield className="h-4 w-4" />
                )}
                {t.admin.signIn}
              </button>
            </form>

            <div className="mt-4 rounded-lg bg-muted/50 p-3 text-center text-xs text-muted-foreground">
              Demo credentials:{" "}
              <span className="font-mono font-semibold text-[#FFC300]">
                admin / ganiyu2024
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ---------- Dashboard (full page) ----------
  const activeLabel = tabs.find((tab) => tab.id === activeTab)?.label;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card/50 md:flex">
        <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFC300] text-[#000814] font-black shadow-md glow-orange-sm transition-transform group-hover:scale-105">
              G
            </span>
            <div>
              <div className="text-sm font-bold">{t.admin.title}</div>
              <div className="text-[10px] text-muted-foreground">
                Ganiyu Al-Hassan
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-[#FFC300] text-[#000814] shadow-md"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="space-y-1 border-t border-border p-3">
          <Link
            href="/"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.admin.backToSite}
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            {t.admin.logout}
          </button>
        </div>
      </aside>

      {/* Sidebar — mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute left-0 top-0 flex h-full w-72 flex-col bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <Link href="/" className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFC300] text-[#000814] font-black">
                  G
                </span>
                <div>
                  <div className="text-sm font-bold">{t.admin.title}</div>
                  <div className="text-[10px] text-muted-foreground">
                    Ganiyu Al-Hassan
                  </div>
                </div>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    activeTab === tab.id
                      ? "bg-[#FFC300] text-[#000814] shadow-md"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
            <div className="space-y-1 border-t border-border p-3">
              <Link
                href="/"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                {t.admin.backToSite}
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                {t.admin.logout}
              </button>
            </div>
          </motion.aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold sm:text-xl">{activeLabel}</h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="hidden h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive sm:flex"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline">{t.admin.logout}</span>
            </button>
          </div>
        </header>

        {/* Tab content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === "dashboard" && <AdminDashboard />}
          {activeTab === "hero-image" && <AdminHeroImage />}
          {activeTab === "projects" && <AdminProjects />}
          {activeTab === "messages" && <AdminMessages />}
          {activeTab === "subscribers" && <AdminSubscribers />}
          {activeTab === "broadcast" && <AdminBroadcast />}
          {activeTab === "cv" && <AdminCv />}
          {activeTab === "media" && <AdminMedia />}
          {activeTab === "settings" && <AdminSettings />}
          {activeTab === "seo" && <AdminSeo />}
        </main>
      </div>
    </div>
  );
}
