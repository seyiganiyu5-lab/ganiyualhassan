"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n/context";
import { Save, User, Link2, Phone, ImageIcon, Mail } from "lucide-react";
import { toast } from "sonner";

export function AdminSettings() {
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
      if (res.ok) {
        toast.success(t.admin.saved);
      } else {
        toast.error("Save failed");
      }
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
      {/* Hero text — name + tagline. The hero IMAGE is managed in the
          dedicated "Hero Image" tab, so here we just point users there. */}
      <section className="rounded-2xl glass border border-border p-5">
        <h3 className="mb-4 flex items-center gap-2 font-bold">
          <User className="h-4 w-4 text-[#FFC300]" />
          Homepage
        </h3>
        <div className="space-y-3">
          <Field
            label={t.admin.heroName}
            value={settings.heroName || ""}
            onChange={(v) => update("heroName", v)}
          />
          <Field
            label={t.admin.heroTagline}
            textarea
            value={settings.heroTagline || ""}
            onChange={(v) => update("heroTagline", v)}
          />

          {/* Pointer card → dedicated Hero Image tab */}
          <div className="flex items-center gap-3 rounded-xl border border-[#FFC300]/30 bg-[#FFC300]/5 p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FFC300]/10 text-[#FFC300]">
              <ImageIcon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">{t.admin.heroImageTitle}</p>
              <p className="mt-0.5">
                Upload &amp; preview your hero portrait in the dedicated{" "}
                <strong className="text-[#FFC300]">{t.admin.heroImage}</strong>{" "}
                tab.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social links */}
      <section className="rounded-2xl glass border border-border p-5">
        <h3 className="mb-4 flex items-center gap-2 font-bold">
          <Link2 className="h-4 w-4 text-[#FFC300]" />
          {t.admin.socialLinks}
        </h3>
        <div className="space-y-3">
          <Field
            label="LinkedIn URL"
            value={settings.linkedin || ""}
            onChange={(v) => update("linkedin", v)}
          />
          <Field
            label="WhatsApp URL"
            value={settings.whatsapp || ""}
            onChange={(v) => update("whatsapp", v)}
          />
        </div>
      </section>

      {/* Contact info */}
      <section className="rounded-2xl glass border border-border p-5">
        <h3 className="mb-4 flex items-center gap-2 font-bold">
          <Phone className="h-4 w-4 text-[#FFC300]" />
          {t.admin.contactInfo}
        </h3>
        <div className="space-y-3">
          <Field
            label={t.contact.phone}
            value={settings.phone || ""}
            onChange={(v) => update("phone", v)}
          />
          <Field
            label={t.contact.email}
            value={settings.email || ""}
            onChange={(v) => update("email", v)}
          />
        </div>
      </section>

      {/* Email provider (for newsletter broadcasts) */}
      <section className="rounded-2xl glass border border-border p-5">
        <h3 className="mb-2 flex items-center gap-2 font-bold">
          <Mail className="h-4 w-4 text-[#FFC300]" />
          {t.admin.emailProvider}
        </h3>
        <p className="mb-4 text-xs text-muted-foreground">{t.admin.emailProviderDesc}</p>
        <div className="space-y-3">
          <Field
            label={t.admin.fromEmail}
            value={settings.fromEmail || ""}
            placeholder={t.admin.fromEmailPlaceholder}
            onChange={(v) => update("fromEmail", v)}
          />
          <Field
            label={t.admin.resendApiKey}
            value={settings.resendApiKey || ""}
            placeholder={t.admin.resendApiKeyPlaceholder}
            onChange={(v) => update("resendApiKey", v)}
          />
          {(!settings.resendApiKey || !settings.fromEmail) && (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-[11px] font-medium text-amber-600">
              {t.admin.emailProviderNotConfigured}
            </p>
          )}
        </div>
      </section>

      <button
        type="submit"
        disabled={saving}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#FFC300] px-8 text-sm font-semibold text-[#000814] disabled:opacity-60"
      >
        {saving ? (
          <span className="h-4 w-4 loader-ring rounded-full border-2 border-[#000814] border-t-transparent" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {t.admin.save}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-muted-foreground">{label}</label>
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[#FFC300]/50"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-[#FFC300]/50"
        />
      )}
    </div>
  );
}
