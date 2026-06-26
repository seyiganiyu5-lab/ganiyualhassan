"use client";

import { useT } from "@/lib/i18n/context";
import {
  Mail,
  Phone,
  Linkedin,
  MessageCircle,
  ArrowUp,
} from "lucide-react";

export function Footer() {
  const t = useT();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: "smooth" });
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
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFC300] text-[#000814] font-black text-lg shadow-md">
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
                  className="flex h-9 w-9 items-center justify-center rounded-full glass border border-border text-muted-foreground transition-colors hover:border-[#FFC300]/40 hover:text-[#FFC300]"
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
                    className="text-sm text-muted-foreground transition-colors hover:text-[#FFC300]"
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
                    className="text-left text-sm text-muted-foreground transition-colors hover:text-[#FFC300]"
                  >
                    {s.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              © {new Date().getFullYear()} Ganiyu Al-Hassan Oluwaseyi. {t.footer.rights}
            </p>
          </div>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex h-9 w-9 items-center justify-center rounded-full glass border border-border text-muted-foreground transition-colors hover:border-[#FFC300]/40 hover:text-[#FFC300]"
            aria-label={t.common.backToTop}
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
