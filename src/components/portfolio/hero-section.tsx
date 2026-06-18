"use client";

import { motion } from "framer-motion";
import { ArrowDown, Download, FolderGit2, Send, Sparkles } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { useTypingEffect } from "@/hooks/use-typing-effect";
import { ParticleBackground } from "./particle-background";
import { AnimatedAvatar } from "./animated-avatar";
import { useEffect, useState } from "react";

const stats = [
  { value: 40, suffix: "+", key: "projects" },
  { value: 25, suffix: "+", key: "clients" },
  { value: 4, suffix: "", key: "experience" },
  { value: 10, suffix: "+", key: "awards" },
] as const;

function CountUp({ to, suffix }: { to: number; suffix: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let frame: number;
    const duration = 1500;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * to));
      if (progress < 1) frame = requestAnimationFrame(tick);
      else setCount(to);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [to]);
  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

export function HeroSection({ avatarUrl }: { avatarUrl?: string | null }) {
  const t = useT();
  const { text } = useTypingEffect([...t.hero.titles]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden pt-24 pb-12"
    >
      {/* Particle background */}
      <div className="absolute inset-0">
        <ParticleBackground density={30} />
      </div>

      {/* Floating geometric shapes (CSS-driven for performance) */}
      <div
        className="absolute left-[8%] top-[20%] h-20 w-20 rounded-2xl border border-[#FFC300]/30"
        style={{ animation: "float-rotate 12s ease-in-out infinite" }}
      />
      <div
        className="absolute right-[12%] top-[15%] h-14 w-14 rounded-full border-2 border-[#FFC300]/20"
        style={{ animation: "float-circle 9s ease-in-out infinite" }}
      />
      <div
        className="absolute bottom-[18%] left-[15%] h-10 w-10 bg-[#FFC300]/10"
        style={{ animation: "float-diamond 10s ease-in-out infinite" }}
      />
      <div
        className="absolute bottom-[25%] right-[8%] h-16 w-16 rounded-full bg-gradient-to-br from-[#FFC300]/20 to-transparent"
        style={{ animation: "float-orb 7s ease-in-out infinite" }}
      />

      {/* Gradient orbs */}
      <div className="pointer-events-none absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-[#FFC300]/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-1/4 h-96 w-96 rounded-full bg-[#FFD60A]/10 blur-[120px]" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        {/* Left content */}
        <div className="order-2 text-center lg:order-1 lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full glass border border-border px-4 py-1.5 text-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="font-medium text-muted-foreground">{t.hero.available}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-lg font-medium text-muted-foreground sm:text-xl"
          >
            {t.hero.greeting}
          </motion.h2>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-2 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl"
          >
            <span className="brand-gradient-text">{t.hero.name}</span>
          </motion.h1>

          {/* Typing title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-4 flex min-h-[2.5rem] items-center justify-center gap-2 text-xl font-bold sm:text-2xl lg:justify-start"
          >
            <Sparkles className="h-5 w-5 text-[#FFC300]" />
            <span className="text-foreground">{text}</span>
            <span className="animate-blink text-[#FFC300]">|</span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground lg:mx-0"
          >
            {t.hero.tagline}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
          >
            <button
              onClick={() => scrollTo("projects")}
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-[#FFC300] px-6 text-sm font-semibold text-[#000814] shadow-lg glow-orange-sm transition-all hover:scale-105 hover:glow-orange"
            >
              <FolderGit2 className="h-4 w-4" />
              {t.hero.viewProjects}
            </button>
            <button
              onClick={() => scrollTo("cv")}
              className="inline-flex h-12 items-center gap-2 rounded-full glass border border-border px-6 text-sm font-semibold text-foreground transition-all hover:border-[#FFC300]/40 hover:text-[#FFC300]"
            >
              <Download className="h-4 w-4" />
              {t.hero.downloadCv}
            </button>
            <button
              onClick={() => scrollTo("contact")}
              className="inline-flex h-12 items-center gap-2 rounded-full border border-[#FFC300] bg-[#FFC300]/5 px-6 text-sm font-semibold text-[#FFC300] transition-all hover:bg-[#FFC300]/10"
            >
              <Send className="h-4 w-4" />
              {t.hero.contactMe}
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {stats.map((stat) => (
              <div key={stat.key} className="text-center lg:text-left">
                <div className="text-2xl font-black brand-gradient-text sm:text-3xl">
                  <CountUp to={stat.value} suffix={stat.suffix} />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {t.hero.stats[stat.key]}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right - avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="order-1 lg:order-2"
        >
          <AnimatedAvatar imageUrl={avatarUrl} name={t.hero.name} />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        onClick={() => scrollTo("about")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground transition-colors hover:text-[#FFC300] sm:flex"
        aria-label="Scroll down"
      >
        <span className="text-xs font-medium uppercase tracking-widest">
          {t.hero.scrollDown}
        </span>
        <div
          className="flex h-9 w-5 items-start justify-center rounded-full border-2 border-current p-1"
          style={{ animation: "float-badge-up 1.5s ease-in-out infinite" }}
        >
          <span className="h-2 w-1 rounded-full bg-current" />
        </div>
        <ArrowDown className="h-4 w-4" />
      </motion.button>
    </section>
  );
}
