"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useT } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import { EASE } from "./motion";
import { Search } from "lucide-react";
import { useOpenCommandMenu } from "./command-menu";
import { Logomark } from "./logo";

const links = [
  { href: "/work", key: "work" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
] as const;

/** Brand wordmark detail: the hyphen in "Al-Hassan" is gold. */
function withGoldHyphen(word: string) {
  const i = word.indexOf("-");
  if (i < 0) return word;
  return (
    <>
      {word.slice(0, i)}
      <span className="text-brand-ink">-</span>
      {word.slice(i + 1)}
    </>
  );
}

/** Hides while scrolling down past the top, reappears on any scroll up. */
function useHideOnScroll() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const last = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      if (Math.abs(y - last.current) > 6) {
        setHidden(y > last.current && y > 120);
        last.current = y;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return { hidden, scrolled };
}

function SearchButton() {
  const t = useT();
  const open = useOpenCommandMenu();
  const [mod, setMod] = useState("Ctrl");
  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) setMod("⌘");
  }, []);
  return (
    <button
      type="button"
      onClick={open}
      aria-label={t.site.palette.open}
      title={`${t.site.palette.open} (${mod} K)`}
      className="flex h-8 items-center gap-2 rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground max-sm:w-8 max-sm:justify-center sm:border sm:border-border sm:pl-3 sm:pr-1.5"
    >
      <Search className="h-4 w-4" />
      <span className="hidden text-xs lg:inline">{t.site.palette.open}</span>
      <kbd className="hidden rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
        {mod} K
      </kbd>
    </button>
  );
}

export function Header({ name }: { name: string }) {
  const t = useT();
  const pathname = usePathname();
  const { hidden, scrolled } = useHideOnScroll();
  const [first, ...rest] = name.split(" ");

  return (
    <motion.header
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.35, ease: EASE }}
      className={cn(
        "sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md transition-colors",
        scrolled ? "border-border/60" : "border-transparent"
      )}
    >
      <div className="container-site flex h-16 items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-2.5 text-sm font-semibold tracking-tight">
          <Logomark className="h-7 w-7 transition-transform duration-300 ease-out group-hover:-translate-y-0.5" />
          <span className="font-display text-[15px] font-semibold tracking-[-0.03em]">
            {first}
            <span className="hidden sm:inline"> {withGoldHyphen(rest[0] ?? "")}</span>
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-3">
          <nav className="flex items-center gap-0.5 sm:gap-1" aria-label={t.site.nav.label}>
            {links.map((l) => {
              const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative rounded-full px-2.5 py-1.5 text-sm transition-colors sm:px-3",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-muted"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative">{t.site.nav[l.key]}</span>
                </Link>
              );
            })}
          </nav>
          <SearchButton />
          <div className="hidden items-center sm:flex">
            <span className="mx-1 h-4 w-px bg-border" />
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
