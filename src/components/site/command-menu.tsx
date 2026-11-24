"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { ArrowRight, Copy, FileDown, Folder, Home, Languages, Mail, SunMoon, User } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useI18n } from "@/lib/i18n/context";

export type MenuProject = { id: string; title: string; category: string };

const OpenContext = createContext<() => void>(() => {});
/** Opens the quick-search menu from anywhere (e.g. the header button). */
export const useOpenCommandMenu = () => useContext(OpenContext);

/**
 * Quick-search menu: Ctrl/⌘ K or "/" anywhere on the site. Jumps to any
 * page or project and runs the common actions without hunting for them.
 */
export function CommandMenu({
  projects,
  email,
  cvUrl,
  children,
}: {
  projects: MenuProject[];
  email: string;
  cvUrl: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const { t, locale, setLocale } = useI18n();
  const p = t.site.palette;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target instanceof Element ? e.target : null;
      const typing = !!target?.closest("input, textarea, select, [contenteditable='true']");
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const run = useCallback((fn: () => void) => {
    setOpen(false);
    fn();
  }, []);
  const go = (href: string) => run(() => router.push(href));

  return (
    <OpenContext.Provider value={() => setOpen(true)}>
      {children}
      {/* Client-only: avoids server/client id mismatches in the hidden dialog */}
      {mounted && (
      <CommandDialog open={open} onOpenChange={setOpen} title={p.open} description={p.placeholder} className="sm:max-w-lg">
        <CommandInput placeholder={p.placeholder} />
        <CommandList className="max-h-[min(60vh,420px)]">
          <CommandEmpty>{p.empty}</CommandEmpty>
          <CommandGroup heading={p.pages}>
            <CommandItem value={`${p.home} home accueil`} onSelect={() => go("/")}>
              <Home /> {p.home}
            </CommandItem>
            <CommandItem value={`${t.site.nav.work} work projets`} onSelect={() => go("/work")}>
              <Folder /> {t.site.nav.work}
            </CommandItem>
            <CommandItem value={`${t.site.nav.about} about cv skills`} onSelect={() => go("/about")}>
              <User /> {t.site.nav.about}
            </CommandItem>
            <CommandItem value={`${t.site.nav.contact} contact message`} onSelect={() => go("/contact")}>
              <Mail /> {t.site.nav.contact}
            </CommandItem>
          </CommandGroup>
          {projects.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading={p.projects}>
                {projects.map((pr) => (
                  <CommandItem key={pr.id} value={`${pr.title} ${pr.category} ${pr.id}`} onSelect={() => go(`/work/${pr.id}`)}>
                    <ArrowRight />
                    <span className="truncate">{pr.title}</span>
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                      {t.projects.categories[pr.category as keyof typeof t.projects.categories] ?? pr.category}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
          <CommandSeparator />
          <CommandGroup heading={p.actions}>
            {email && (
              <CommandItem
                value={`${p.copyEmail} email`}
                onSelect={() =>
                  run(() =>
                    navigator.clipboard
                      ?.writeText(email)
                      .then(() => toast.success(p.copied))
                      .catch(() => (window.location.href = `mailto:${email}`))
                  )
                }
              >
                <Copy /> {p.copyEmail}
              </CommandItem>
            )}
            {cvUrl && (
              <CommandItem value={`${p.downloadCv} cv resume`} onSelect={() => run(() => window.open(cvUrl, "_blank", "noopener"))}>
                <FileDown /> {p.downloadCv}
              </CommandItem>
            )}
            <CommandItem
              value={`${p.theme} theme dark light`}
              onSelect={() => run(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"))}
            >
              <SunMoon /> {p.theme}
            </CommandItem>
            <CommandItem
              value={`${p.language} language langue`}
              onSelect={() => run(() => setLocale(locale === "en" ? "fr" : "en"))}
            >
              <Languages /> {p.language}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
      )}
    </OpenContext.Provider>
  );
}
