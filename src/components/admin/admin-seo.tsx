"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n/context";
import { Save, Search } from "lucide-react";
import { toast } from "sonner";

export function AdminSeo() {
  const t = useT();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) toast.success(t.admin.saved);
      else toast.error("Save failed");
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const update = (key: string, value: string) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <form onSubmit={handleSave} className="mx-auto max-w-3xl space-y-6">
      <section className="rounded-2xl glass border border-border p-5">
        <h3 className="mb-4 flex items-center gap-2 font-bold">
          <Search className="h-4 w-4 text-[#FFC300]" />
          {t.admin.seoSettings}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              {t.admin.metaTitle}
            </label>
            <input
              value={settings.metaTitle || ""}
              onChange={(e) => update("metaTitle", e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-[#FFC300]/50"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              {(settings.metaTitle || "").length}/60 characters (recommended max)
            </p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              {t.admin.metaDescription}
            </label>
            <textarea
              rows={3}
              value={settings.metaDescription || ""}
              onChange={(e) => update("metaDescription", e.target.value)}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[#FFC300]/50"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              {(settings.metaDescription || "").length}/160 characters (recommended max)
            </p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              {t.admin.keywords}
            </label>
            <input
              value={settings.keywords || ""}
              onChange={(e) => update("keywords", e.target.value)}
              placeholder="Ganiyu, Software Engineer, Designer..."
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-[#FFC300]/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              Open Graph Image URL
            </label>
            <input
              value={settings.ogImage || ""}
              onChange={(e) => update("ogImage", e.target.value)}
              placeholder="/uploads/... or https://..."
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-[#FFC300]/50"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Share image shown on WhatsApp, LinkedIn, Twitter (1200×630 recommended).
            </p>
          </div>
        </div>
      </section>

      {/* Indexing & ownership */}
      <section className="rounded-2xl glass border border-border p-5">
        <h3 className="mb-4 flex items-center gap-2 font-bold">
          <Search className="h-4 w-4 text-[#FFC300]" />
          Site URL &amp; Google Verification
        </h3>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              Site URL (public domain)
            </label>
            <input
              value={settings.siteUrl || ""}
              onChange={(e) => update("siteUrl", e.target.value)}
              placeholder="https://ganiyu-alhassan.com"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-[#FFC300]/50"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Your live public URL. Used for canonical tags, the sitemap, robots.txt, and absolute
              Open Graph links. Leave blank only while developing.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              Google Search Console verification token
            </label>
            <input
              value={settings.googleVerification || ""}
              onChange={(e) => update("googleVerification", e.target.value)}
              placeholder="e.g. abc123def456..."
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-[#FFC300]/50"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              In Google Search Console → Settings → Ownership verification → HTML tag, copy just the
              <span className="font-mono"> content</span> value and paste it here. This outputs the
              <span className="font-mono"> &lt;meta name=&quot;google-site-verification&quot;&gt;</span> tag.
            </p>
          </div>
        </div>
      </section>

      {/* Preview */}
      <section className="rounded-2xl glass border border-border p-5">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Search Engine Preview
        </h3>
        <div className="rounded-lg border border-border p-3">
          <div className="text-xs text-emerald-600">
            {settings.siteUrl || "https://ganiyu-portfolio.com"}
          </div>
          <div className="mt-0.5 text-lg font-medium text-[#1a0dab]">
            {settings.metaTitle || "Ganiyu Al-Hassan Oluwaseyi — Portfolio"}
          </div>
          <div className="mt-0.5 text-sm text-muted-foreground">
            {(settings.metaDescription || "").slice(0, 160) ||
              "Portfolio of Ganiyu Al-Hassan Oluwaseyi..."}
          </div>
        </div>
      </section>

      <button
        type="submit"
        disabled={saving}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#FFC300] px-8 text-sm font-semibold text-[#000814] disabled:opacity-60"
      >
        {saving ? (
          <span className="h-4 w-4 loader-ring rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {t.admin.save}
      </button>
    </form>
  );
}
