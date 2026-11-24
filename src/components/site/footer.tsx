"use client";

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

  const links = [
    email && { label: "Email", href: `mailto:${email}` },
    linkedin && { label: "LinkedIn", href: linkedin },
    whatsapp && { label: "WhatsApp", href: whatsappHref(whatsapp) },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <footer className="mt-24 border-t border-border/60">
      <div className="container-site flex flex-col gap-6 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year} {name}. {t.site.footer.rights}
        </p>
        <div className="flex items-center justify-between gap-6">
          <ul className="flex items-center gap-5">
            {links.map((l) => (
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
          <div className="flex items-center sm:hidden">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
