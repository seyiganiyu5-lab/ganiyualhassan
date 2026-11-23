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

const links = [
  { href: "/work", key: "work" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
] as const;

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
          <span className="h-2 w-2 rounded-full bg-primary transition-transform duration-300 group-hover:scale-150" />
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
