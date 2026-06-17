"use client";

import React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { I18nProvider } from "@/lib/i18n/context";
import { AdminProvider } from "@/lib/admin-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      <I18nProvider>
        <AdminProvider>{children}</AdminProvider>
      </I18nProvider>
    </NextThemesProvider>
  );
}
