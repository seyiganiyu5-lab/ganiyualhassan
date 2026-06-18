"use client";

import { motion } from "framer-motion";
import { useT } from "@/lib/i18n/context";
import { SectionHeading } from "./section-heading";
import {
  Code2,
  Layout,
  Palette,
  Sparkles,
  Image as ImageIcon,
  PenTool,
  Cpu,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  code: Code2,
  layout: Layout,
  palette: Palette,
  sparkles: Sparkles,
  image: ImageIcon,
  pen: PenTool,
  cpu: Cpu,
};

export function ServicesSection() {
  const t = useT();
  const [form, setForm] = useState({ name: "", email: "", service: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: `Pricing inquiry: ${form.service}`,
          message: form.message,
        }),
      });
      if (res.ok) {
        toast.success(t.contact.success);
        setForm({ name: "", email: "", service: "", message: "" });
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
    <section id="services" className="relative py-24 sm:py-32">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="pointer-events-none absolute right-1/4 top-0 h-96 w-96 rounded-full bg-[#FFC300]/5 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading subtitle={t.services.subtitle} title={t.services.title} />

        {/* Services grid */}
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {t.services.list.map((service, i) => {
            const Icon = iconMap[service.icon] ?? Sparkles;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-2xl glass border border-border p-6 transition-all hover:border-[#FFC300]/40 hover:shadow-xl"
              >
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#FFC300]/5 blur-2xl transition-opacity group-hover:opacity-100 opacity-0" />
                <div className="relative">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFC300] to-[#FFD60A] text-white shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-6">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold transition-colors group-hover:text-[#FFC300]">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {service.desc}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-[#FFC300] opacity-0 transition-opacity group-hover:opacity-100">
                    {t.services.getQuote}
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Pricing inquiry */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 overflow-hidden rounded-3xl gradient-border"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left info */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#FFC300] to-[#ff7a3f] p-8 text-white sm:p-10">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="relative">
                <Sparkles className="h-10 w-10" />
                <h3 className="mt-4 text-2xl font-black sm:text-3xl">
                  {t.services.inquiryTitle}
                </h3>
                <p className="mt-3 text-sm text-white/90 sm:text-base">
                  {t.services.inquirySubtitle}
                </p>
                <div className="mt-8 space-y-3">
                  {t.services.list.slice(0, 4).map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                        ✓
                      </span>
                      {s.title}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right form */}
            <div className="p-8 sm:p-10">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                      {t.contact.name}
                    </label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder={t.contact.namePlaceholder}
                      className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition-colors focus:border-[#FFC300]/50"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                      {t.contact.emailLabel}
                    </label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder={t.contact.emailPlaceholder}
                      className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition-colors focus:border-[#FFC300]/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                    {t.contact.subject}
                  </label>
                  <select
                    required
                    value={form.service}
                    onChange={(e) => setForm({ ...form, service: e.target.value })}
                    className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition-colors focus:border-[#FFC300]/50"
                  >
                    <option value="">—</option>
                    {t.services.list.map((s, i) => (
                      <option key={i} value={s.title}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                    {t.contact.message}
                  </label>
                  <textarea
                    required
                    rows={4}
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
                  {sending ? t.contact.sending : t.services.getQuote}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
