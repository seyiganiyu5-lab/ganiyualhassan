"use client";

import React, { useEffect } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { MotionConfig } from "framer-motion";
import { I18nProvider } from "@/lib/i18n/context";

/**
 * Blocks next-themes from syncing the theme across browser tabs.
 * Each tab keeps its own dark/light mode independently.
 */
function BlockCrossTabThemeSync() {
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "theme") {
        e.stopImmediatePropagation();
      }
    };
    // Capture phase runs before next-themes' listener, so
    // stopImmediatePropagation prevents it from ever receiving the event.
    window.addEventListener("storage", handler, true);
    return () => window.removeEventListener("storage", handler, true);
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      <BlockCrossTabThemeSync />
      {/* Honour the visitor's "reduce motion" system setting everywhere. */}
      <MotionConfig reducedMotion="user">
        <I18nProvider>{children}</I18nProvider>
      </MotionConfig>
    </NextThemesProvider>
  );
}
