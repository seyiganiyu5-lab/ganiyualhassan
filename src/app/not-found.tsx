"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Shield, ArrowLeft, Compass } from "lucide-react";
import { ParticleBackground } from "@/components/portfolio/particle-background";
import { ThemeToggle } from "@/components/portfolio/theme-toggle";
import { LanguageSwitcher } from "@/components/portfolio/language-switcher";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4">
      <ParticleBackground />

      {/* Top-right controls */}
      <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg text-center"
      >
        {/* 404 big number */}
        <div className="relative mb-6">
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="block bg-gradient-to-br from-[#FFC300] to-[#FFD60A] bg-clip-text text-8xl font-black text-transparent sm:text-9xl"
          >
            404
          </motion.span>
          <div className="pointer-events-none absolute inset-0 -z-10 mx-auto h-40 w-40 rounded-full bg-[#FFC300]/20 blur-3xl" />
        </div>

        {/* Compass icon */}
        <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl glass border border-border text-[#FFC300] shadow-lg">
          <Compass className="h-7 w-7" />
        </span>

        <h1 className="text-2xl font-black sm:text-3xl">Page Not Found</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground sm:text-base">
          The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
          Let&rsquo;s get you back on track.
        </p>

        {/* Action buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#FFC300] px-6 text-sm font-semibold text-[#000814] shadow-lg transition-transform hover:scale-[1.02] sm:w-auto"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
          <Link
            href="/admin"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card/50 px-6 text-sm font-semibold text-foreground shadow-sm backdrop-blur transition-colors hover:border-[#FFC300]/50 hover:text-[#FFC300] sm:w-auto"
          >
            <Shield className="h-4 w-4" />
            Admin Dashboard
          </Link>
        </div>

        {/* Hint about admin URL */}
        <div className="mt-8 inline-flex items-center gap-2 rounded-full glass border border-border px-4 py-2 text-xs text-muted-foreground">
          <span>Tip: the admin URL is</span>
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono font-semibold text-[#FFC300]">
            /admin
          </code>
        </div>
      </motion.div>

      {/* Back arrow bottom-left */}
      <Link
        href="/"
        className="absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-full glass border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Home
      </Link>
    </div>
  );
}
