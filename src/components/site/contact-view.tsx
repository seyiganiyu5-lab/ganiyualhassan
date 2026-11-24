"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useT } from "@/lib/i18n/context";
import { EASE } from "./motion";
import { telHref, whatsappHref } from "@/lib/media";

const field =
  "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground/40";

export function ContactView({
  email,
  phone,
  linkedin,
  whatsapp,
}: {
  email: string;
  phone: string;
  linkedin: string;
  whatsapp: string;
}) {
  const t = useT();
  const empty = { name: "", email: "", subject: "", message: "", website: "" };
  const [form, setForm] = useState(empty);
  const [sending, setSending] = useState(false);

  const channels = [
    email && { label: t.contact.email, value: email, href: `mailto:${email}` },
    whatsapp && { label: t.contact.whatsapp, value: phone || "WhatsApp", href: whatsappHref(whatsapp) },
    phone && { label: t.contact.phone, value: phone, href: telHref(phone) },
    linkedin && {
      label: t.contact.linkedin,
      value: linkedin.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""),
      href: linkedin,
    },
  ].filter(Boolean) as { label: string; value: string; href: string }[];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.status === 429) {
        toast.error(t.site.contact.tooMany);
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      toast.success(t.contact.success);
      setForm(empty);
    } catch {
      toast.error(t.contact.error);
    } finally {
      setSending(false);
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="container-site pt-16 sm:pt-24">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{t.site.contact.title}</h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">{t.site.contact.intro}</p>

      <div className="mt-14 grid grid-cols-1 gap-16 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {t.site.contact.direct}
          </h2>
          <ul>
            {channels.map((c, i) => (
              <motion.li
                key={c.label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.1 + i * 0.06 }}
              >
                <a
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-4 border-t border-border py-4"
                >
                  <span className="text-sm text-muted-foreground">{c.label}</span>
                  <span className="flex min-w-0 items-center gap-2 font-medium">
                    <span className="truncate">{c.value}</span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </span>
                </a>
              </motion.li>
            ))}
            <li className="flex items-center justify-between gap-4 border-y border-border py-4">
              <span className="text-sm text-muted-foreground">{t.site.contact.basedIn}</span>
              <span className="font-medium">{t.contact.locationBased}</span>
            </li>
          </ul>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
        >
          <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {t.site.contact.form}
          </h2>
          <form onSubmit={submit} className="relative space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Label text={t.contact.name}>
                <input required maxLength={100} name="name" autoComplete="name" value={form.name} onChange={set("name")} className={field} />
              </Label>
              <Label text={t.contact.emailLabel}>
                <input required maxLength={200} type="email" name="email" autoComplete="email" value={form.email} onChange={set("email")} className={field} />
              </Label>
            </div>
            <Label text={t.contact.subject}>
              <input maxLength={200} name="subject" value={form.subject} onChange={set("subject")} placeholder={t.contact.subjectPlaceholder} className={field} />
            </Label>
            <Label text={t.contact.message}>
              <textarea
                required
                minLength={5}
                maxLength={5000}
                rows={6}
                name="message"
                value={form.message}
                onChange={set("message")}
                placeholder={t.contact.messagePlaceholder}
                className={`${field} resize-y`}
              />
            </Label>
            {/* Honeypot: invisible to people; bots fill it in and get silently ignored */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label>
                Website
                <input tabIndex={-1} autoComplete="off" name="website" value={form.website} onChange={set("website")} />
              </label>
            </div>
            <button
              type="submit"
              disabled={sending}
              className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {sending ? t.contact.sending : t.contact.send}
            </button>
          </form>
        </motion.section>
      </div>
    </div>
  );
}

function Label({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-muted-foreground">{text}</span>
      {children}
    </label>
  );
}
