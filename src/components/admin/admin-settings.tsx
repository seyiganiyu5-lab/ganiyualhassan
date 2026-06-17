"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useT } from "@/lib/i18n/context";
import { Save, User, Link2, Phone } from "lucide-react";
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
      {/* Hero */}
      <section className="rounded-2xl glass border border-border p-5">
        <h3 className="mb-4 flex items-center gap-2 font-bold">
          <User className="h-4 w-4 text-[#FF5A1F]" />
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
          <Field
            label="Avatar Image URL (leave empty for animated placeholder)"
            value={settings.avatarUrl || ""}
            onChange={(v) => update("avatarUrl", v)}
            placeholder="Upload an image in Media Library and paste URL here"
          />
        </div>
      </section>

      {/* Social links */}
      <section className="rounded-2xl glass border border-border p-5">
        <h3 className="mb-4 flex items-center gap-2 font-bold">
          <Link2 className="h-4 w-4 text-[#FF5A1F]" />
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
          <Phone className="h-4 w-4 text-[#FF5A1F]" />
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

      <button
        type="submit"
        disabled={saving}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#FF5A1F] px-8 text-sm font-semibold text-white disabled:opacity-60"
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
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[#FF5A1F]/50"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-[#FF5A1F]/50"
        />
      )}
    </div>
  );
}
