"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";

const links = [
  { href: "/work", key: "work" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
] as const;

export function Header({ name }: { name: string }) {
  const t = useT();
  const pathname = usePathname();
  const [first, ...rest] = name.split(" ");

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="container-site flex h-16 items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-2.5 text-sm font-semibold tracking-tight">
          <span className="h-2 w-2 rounded-full bg-primary transition-transform group-hover:scale-125" />
          <span>
            {first}
            <span className="hidden sm:inline"> {rest.slice(0, 1).join(" ")}</span>
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-3">
          <nav className="flex items-center gap-0.5 sm:gap-1" aria-label="Main">
            {links.map((l) => {
              const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-full px-2.5 py-1.5 text-sm transition-colors sm:px-3",
                    active
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.site.nav[l.key]}
                </Link>
              );
            })}
          </nav>
          <div className="hidden items-center sm:flex">
            <span className="mx-1 h-4 w-px bg-border" />
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
