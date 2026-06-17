"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useT } from "@/lib/i18n/context";
import {
  X,
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminDashboard } from "./dashboard";
import { AdminProjects } from "./projects";
import { AdminMessages } from "./messages";
import { AdminCv } from "./admin-cv";
import { AdminMedia } from "./admin-media";
import { AdminSettings } from "./admin-settings";
import { AdminSeo } from "./admin-seo";
import { toast } from "sonner";

export function AdminPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useT();
  const [authed, setAuthed] = useState(false);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [loggingIn, setLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const session = sessionStorage.getItem("admin_session");
      if (session === "true") setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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
        toast.success("Welcome back, Admin!");
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
    onClose();
  };

  const tabs = [
    { id: "dashboard", label: t.admin.dashboard, icon: LayoutDashboard },
    { id: "projects", label: t.admin.projects, icon: FolderGit2 },
    { id: "messages", label: t.admin.messages, icon: Mail },
    { id: "cv", label: t.admin.cv, icon: FileText },
    { id: "media", label: t.admin.media, icon: ImageIcon },
    { id: "settings", label: t.admin.settings, icon: Settings },
    { id: "seo", label: t.admin.seo, icon: SeoIcon },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex"
        >
          <div className="absolute inset-0 bg-background/95 backdrop-blur-xl" />

          {!authed ? (
            // Login screen
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10 m-auto w-full max-w-md p-4"
            >
              <div className="relative overflow-hidden rounded-3xl glass-strong border border-border p-8 shadow-2xl">
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#FF5A1F]/10 blur-3xl" />
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full glass border border-border text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="relative text-center">
                  <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF5A1F] to-[#ff8a5f] text-white shadow-lg glow-orange">
                    <Shield className="h-8 w-8" />
                  </span>
                  <h2 className="mt-4 text-2xl font-black">{t.admin.login}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t.admin.title}
                  </p>
                </div>

                <form onSubmit={handleLogin} className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="admin-username" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
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
                        className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-[#FF5A1F]/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="admin-password" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
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
                        className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-[#FF5A1F]/50"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loggingIn}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#FF5A1F] px-6 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-60"
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
                  Demo credentials: <span className="font-mono font-semibold text-[#FF5A1F]">admin / ganiyu2024</span>
                </div>
              </div>
            </motion.div>
          ) : (
            // Dashboard
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative z-10 flex w-full"
            >
              {/* Sidebar */}
              <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card/50 p-4 md:flex">
                <div className="mb-6 flex items-center gap-2.5 px-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF5A1F] text-white font-black">
                    G
                  </span>
                  <div>
                    <div className="text-sm font-bold">{t.admin.title}</div>
                    <div className="text-[10px] text-muted-foreground">Ganiyu Al-Hassan</div>
                  </div>
                </div>

                <nav className="flex-1 space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        activeTab === tab.id
                          ? "bg-[#FF5A1F] text-white shadow-md"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  ))}
                </nav>

                <button
                  onClick={handleLogout}
                  className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  {t.admin.logout}
                </button>
              </aside>

              {/* Main content */}
              <main className="flex-1 overflow-hidden">
                {/* Top bar (mobile) */}
                <div className="flex items-center justify-between border-b border-border p-4 md:hidden">
                  <select
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value)}
                    className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
                  >
                    {tabs.map((tab) => (
                      <option key={tab.id} value={tab.id}>
                        {tab.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={handleLogout}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                    <button
                      onClick={onClose}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Desktop close */}
                <div className="hidden items-center justify-between border-b border-border px-6 py-3 md:flex">
                  <h2 className="text-lg font-bold">
                    {tabs.find((tab) => tab.id === activeTab)?.label}
                  </h2>
                  <button
                    onClick={onClose}
                    className="flex h-9 w-9 items-center justify-center rounded-full glass border border-border text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="h-[calc(100vh-120px)] overflow-y-auto p-4 sm:p-6">
                  {activeTab === "dashboard" && <AdminDashboard />}
                  {activeTab === "projects" && <AdminProjects />}
                  {activeTab === "messages" && <AdminMessages />}
                  {activeTab === "cv" && <AdminCv />}
                  {activeTab === "media" && <AdminMedia />}
                  {activeTab === "settings" && <AdminSettings />}
                  {activeTab === "seo" && <AdminSeo />}
                </div>
              </main>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
