"use client";

import { motion } from "framer-motion";
import { useT } from "@/lib/i18n/context";
import { SectionHeading } from "./section-heading";
import {
  Phone,
  Mail,
  Linkedin,
  MessageCircle,
  MapPin,
  Send,
  User,
  Globe,
  Clock,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const contactItems = [
  {
    icon: Phone,
    label: "phone",
    value: "(+225) 05 03 67 14 80",
    href: "tel:+2250503671480",
  },
  {
    icon: MessageCircle,
    label: "whatsapp",
    value: "(+225) 05 03 67 14 80",
    href: "https://wa.me/2250503671480",
  },
  {
    icon: Mail,
    label: "email",
    value: "seyiganiyu5@gmail.com",
    href: "mailto:seyiganiyu5@gmail.com",
  },
  {
    icon: Linkedin,
    label: "linkedin",
    value: "al-hassan-ganiyu",
    href: "https://linkedin.com/in/al-hassan-ganiyu-9910b3410",
  },
];

export function ContactSection() {
  const t = useT();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success(t.contact.success);
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        toast.error(t.contact.error);
      }
    } catch {
      toast.error(t.contact.error);
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="relative py-24 sm:py-32">
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-[#FFC300]/8 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading subtitle={t.contact.subtitle} title={t.contact.title} />

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left: contact info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {contactItems.map((item, i) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="group flex flex-col gap-3 rounded-2xl glass border border-border p-5 transition-all hover:border-[#FFC300]/40 hover:shadow-lg"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFC300]/10 text-[#FFC300] transition-transform group-hover:scale-110">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      {t.contact[item.label as keyof typeof t.contact]}
                    </div>
                    <div className="mt-0.5 break-all text-sm font-semibold">
                      {item.value}
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>

            {/* WhatsApp direct chat */}
            <motion.a
              href="https://wa.me/2250503671480"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#1da851] p-5 text-white shadow-lg transition-shadow hover:shadow-xl"
            >
              <MessageCircle className="h-6 w-6" />
              <span className="font-bold">{t.contact.whatsappChat}</span>
            </motion.a>

            {/* Location card — secure, no map embed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="overflow-hidden rounded-2xl glass border border-border"
            >
              <div className="flex items-center gap-2 border-b border-border p-4">
                <MapPin className="h-4 w-4 text-[#FFC300]" />
                <span className="text-sm font-semibold">{t.contact.findMe}</span>
              </div>
              <div className="p-5">
                {/* Location */}
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFC300]/10 text-[#FFC300]">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      {t.contact.findMe}
                    </div>
                    <div className="mt-0.5 text-sm font-semibold">
                      {t.contact.locationBased}
                    </div>
                  </div>
                </div>
                {/* Timezone */}
                <div className="mt-4 flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFC300]/10 text-[#FFC300]">
                    <Clock className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      {t.contact.timezoneLabel}
                    </div>
                    <div className="mt-0.5 text-sm font-semibold">
                      {t.contact.timezone}
                    </div>
                  </div>
                </div>
                {/* Remote work */}
                <div className="mt-4 flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFC300]/10 text-[#FFC300]">
                    <Globe className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      {t.contact.remoteLabel}
                    </div>
                    <div className="mt-0.5 text-sm font-semibold">
                      {t.contact.remoteWork}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: contact form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl glass-strong border border-border p-6 sm:p-8"
          >
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFC300] text-[#000814] shadow-lg">
                <Send className="h-5 w-5" />
              </span>
              <h3 className="text-xl font-bold">{t.contact.formTitle}</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                    {t.contact.name}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder={t.contact.namePlaceholder}
                      className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none transition-colors focus:border-[#FFC300]/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                    {t.contact.emailLabel}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder={t.contact.emailPlaceholder}
                      className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none transition-colors focus:border-[#FFC300]/50"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                  {t.contact.subject}
                </label>
                <input
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder={t.contact.subjectPlaceholder}
                  className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition-colors focus:border-[#FFC300]/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                  {t.contact.message}
                </label>
                <textarea
                  required
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder={t.contact.messagePlaceholder}
                  className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-[#FFC300]/50"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#FFC300] px-6 text-sm font-semibold text-[#000814] shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-60"
              >
                {sending ? (
                  <>
                    <span className="h-4 w-4 loader-ring rounded-full border-2 border-white border-t-transparent" />
                    {t.contact.sending}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    {t.contact.send}
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
