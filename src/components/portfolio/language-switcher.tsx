"use client";

import { useI18n } from "@/lib/i18n/context";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex h-9 items-center gap-1.5 rounded-full glass border border-border px-3 text-sm font-medium text-foreground transition-colors hover:text-[#FF5A1F]"
          aria-label="Switch language"
        >
          <Globe className="h-4 w-4" />
          <span className="uppercase">{locale}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        {[
          { code: "en", label: "English", flag: "EN" },
          { code: "fr", label: "Français", flag: "FR" },
        ].map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLocale(lang.code as "en" | "fr")}
            className="cursor-pointer gap-2"
          >
            <span className="flex h-5 w-7 items-center justify-center rounded bg-muted text-[10px] font-bold">
              {lang.flag}
            </span>
            <span className="flex-1">{lang.label}</span>
            {locale === lang.code && (
              <motion.span
                layoutId="lang-active"
                className="h-2 w-2 rounded-full bg-[#FF5A1F]"
              />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
