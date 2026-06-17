"use client";

import { motion } from "framer-motion";
import { useT } from "@/lib/i18n/context";
import {
  Mail,
  Phone,
  Linkedin,
  MessageCircle,
  Send,
  Heart,
  ArrowUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function Footer() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [visitors, setVisitors] = useState(0);

  useEffect(() => {
    // Register visitor
    fetch("/api/visitor", { method: "POST" })
      .then((r) => r.json())
      .then((data) => setVisitors(data.count ?? 0))
      .catch(() => {});
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribing(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        toast.success("Subscribed successfully!");
        setEmail("");
      } else {
        const data = await res.json();
        toast.error(data.error || "Subscription failed");
      }
    } catch {
      toast.error("Subscription failed");
    } finally {
      setSubscribing(false);
    }
  };

  const navItems = [
    { id: "home", label: t.nav.home },
    { id: "about", label: t.nav.about },
    { id: "projects", label: t.nav.projects },
    { id: "cv", label: t.nav.cv },
    { id: "services", label: t.nav.services },
    { id: "contact", label: t.nav.contact },
  ];

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-border bg-card/50">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#FF5A1F]/10 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF5A1F] text-white font-black text-lg shadow-md">
                G
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-bold">Ganiyu Al-Hassan</span>
                <span className="text-xs text-muted-foreground">Oluwaseyi</span>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {t.footer.tagline}
            </p>
            {/* Social */}
            <div className="mt-5 flex gap-2">
              {[
                { icon: MessageCircle, href: "https://wa.me/2250503671480", label: "WhatsApp" },
                { icon: Mail, href: "mailto:seyiganiyu5@gmail.com", label: "Email" },
                { icon: Linkedin, href: "https://linkedin.com/in/al-hassan-ganiyu-9910b3410", label: "LinkedIn" },
                { icon: Phone, href: "tel:+2250503671480", label: "Phone" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full glass border border-border text-muted-foreground transition-colors hover:border-[#FF5A1F]/40 hover:text-[#FF5A1F]"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider">
              {t.footer.quickLinks}
            </h4>
            <ul className="mt-4 space-y-2">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollTo(item.id)}
                    className="text-sm text-muted-foreground transition-colors hover:text-[#FF5A1F]"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider">
              {t.footer.services}
            </h4>
            <ul className="mt-4 space-y-2">
              {t.services.list.slice(0, 5).map((s, i) => (
                <li key={i}>
                  <button
                    onClick={() => scrollTo("services")}
                    className="text-left text-sm text-muted-foreground transition-colors hover:text-[#FF5A1F]"
                  >
                    {s.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter + visitor counter */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider">
              {t.footer.newsletter}
            </h4>
            <p className="mt-4 text-sm text-muted-foreground">
              {t.footer.newsletterDesc}
            </p>
            <form onSubmit={handleSubscribe} className="mt-4 flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.footer.emailPlaceholder}
                className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-[#FF5A1F]/50"
              />
              <button
                type="submit"
                disabled={subscribing}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FF5A1F] text-white transition-transform hover:scale-105 disabled:opacity-60"
                aria-label={t.footer.subscribe}
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

            {/* Visitor counter */}
            <div className="mt-5 flex items-center gap-2 rounded-lg glass border border-border px-3 py-2.5">
              <Users className="h-4 w-4 text-[#FF5A1F]" />
              <span className="text-sm font-semibold">{visitors.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">
                {visitors === 1 ? t.common.visitor : t.common.visitors}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            © {new Date().getFullYear()} Ganiyu Al-Hassan Oluwaseyi. {t.footer.rights}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {t.footer.builtWith}
            <Heart className="h-3 w-3 fill-[#FF5A1F] text-[#FF5A1F]" />
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex h-9 w-9 items-center justify-center rounded-full glass border border-border text-muted-foreground transition-colors hover:border-[#FF5A1F]/40 hover:text-[#FF5A1F]"
            aria-label={t.common.backToTop}
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
