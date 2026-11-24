"use client";

import { useI18n } from "@/lib/i18n/context";

/** One-tap EN / FR toggle. */
export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const next = locale === "en" ? "fr" : "en";

  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      className="flex h-8 items-center rounded-full px-2.5 font-mono text-xs uppercase tracking-wide text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label={t.site.language}
      title={t.site.language}
    >
      <span className={locale === "en" ? "text-foreground" : undefined}>en</span>
      <span className="mx-1 opacity-40">/</span>
      <span className={locale === "fr" ? "text-foreground" : undefined}>fr</span>
    </button>
  );
}
