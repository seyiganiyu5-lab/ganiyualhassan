"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/context";
import { whatsappHref } from "@/lib/media";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";

export function Footer({
  name,
  email,
  linkedin,
  whatsapp,
}: {
  name: string;
  email: string;
  linkedin: string;
  whatsapp: string;
}) {
  const t = useT();
  const year = new Date().getFullYear();

  const pages = [
    { label: t.site.nav.work, href: "/work" },
    { label: t.site.nav.about, href: "/about" },
    { label: t.site.nav.contact, href: "/contact" },
  ];
  const social = [
    email && { label: "Email", href: `mailto:${email}` },
    linkedin && { label: "LinkedIn", href: linkedin },
    whatsapp && { label: "WhatsApp", href: whatsappHref(whatsapp) },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <footer className="mt-24 border-t border-border/60">
      <div className="container-site py-10 text-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {pages.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link-underline font-medium">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-muted-foreground">
            {social.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  target={l.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="link-underline hover:text-foreground"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-8 flex items-center justify-between gap-4 text-muted-foreground">
          <p>
            © {year} {name}. {t.site.footer.rights}
          </p>
          <div className="flex items-center sm:hidden">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
