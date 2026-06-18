"use client";

import { motion } from "framer-motion";
import { ArrowDown, Download, FolderGit2, MapPin, Send, Sparkles } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { useTypingEffect } from "@/hooks/use-typing-effect";
import { ParticleBackground } from "./particle-background";
import { useEffect, useState } from "react";

const stats = [
  { value: 25, suffix: "+", key: "projects" },
  { value: 2, suffix: "", key: "experience" },
  { value: 5, suffix: "+", key: "awards" },
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
  const profileSrc = avatarUrl || "/uploads/profile.jpg";

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
      className="relative flex min-h-screen items-center overflow-hidden pt-28 pb-16"
    >
      {/* Particle background */}
      <div className="absolute inset-0">
        <ParticleBackground density={26} />
      </div>

      {/* Editorial grid backdrop */}
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-60" />

      {/* Floating geometric shapes (CSS-driven for performance) */}
      <div
        className="absolute left-[6%] top-[18%] h-16 w-16 rounded-2xl border border-[#FFC300]/30"
        style={{ animation: "float-rotate 14s ease-in-out infinite" }}
      />
      <div
        className="absolute right-[8%] top-[12%] h-12 w-12 rounded-full border-2 border-[#FFC300]/20"
        style={{ animation: "float-circle 10s ease-in-out infinite" }}
      />
      <div
        className="absolute bottom-[14%] left-[10%] h-8 w-8 bg-[#FFC300]/10"
        style={{ animation: "float-diamond 11s ease-in-out infinite" }}
      />

      {/* Gradient orbs */}
      <div className="pointer-events-none absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-[#FFC300]/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-1/4 h-96 w-96 rounded-full bg-[#FFD60A]/10 blur-[120px]" />

      {/* Vertical side label — desktop only */}
      <div className="pointer-events-none absolute left-4 top-1/2 hidden -translate-y-1/2 -rotate-90 lg:block">
        <span className="text-[10px] font-semibold uppercase tracking-[0.5em] text-muted-foreground/50">
          {t.hero.overline}
        </span>
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-8">
        {/* Left content — editorial text column */}
        <div className="order-2 lg:order-1 lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap items-center gap-3"
          >
            <span className="inline-flex items-center gap-2 rounded-full glass border border-border px-4 py-1.5 text-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="font-medium text-muted-foreground">{t.hero.available}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-[#FFC300]" />
              {t.hero.location}
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-6 text-xs font-bold uppercase tracking-[0.35em] text-[#FFC300]"
          >
            {t.hero.greeting}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-3 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl"
          >
            <span className="brand-gradient-text">{t.hero.name}</span>
          </motion.h1>

          {/* Typing title — highlighted pill */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-6 flex min-h-[2.75rem] items-center gap-2.5"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFC300]/10 text-[#FFC300]">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-xl font-bold text-foreground sm:text-2xl">{text}</span>
            <span className="animate-blink text-2xl font-bold text-[#FFC300]">|</span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground"
          >
            {t.hero.tagline}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <button
              onClick={() => scrollTo("projects")}
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-[#FFC300] px-7 text-sm font-semibold text-[#000814] shadow-lg glow-orange-sm transition-all hover:scale-105 hover:glow-orange"
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
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#FFC300] bg-[#FFC300]/5 text-[#FFC300] transition-all hover:bg-[#FFC300]/10"
              aria-label={t.hero.contactMe}
            >
              <Send className="h-4 w-4" />
            </button>
          </motion.div>

          {/* Stats — editorial divider strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border pt-6 sm:grid-cols-3"
          >
            {stats.map((stat, i) => (
              <div
                key={stat.key}
                className={i !== 0 ? "sm:border-l sm:border-border sm:pl-6" : ""}
              >
                <div className="text-2xl font-black brand-gradient-text sm:text-3xl">
                  <CountUp to={stat.value} suffix={stat.suffix} />
                </div>
                <div className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {t.hero.stats[stat.key]}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right — editorial portrait card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="order-1 flex justify-center lg:order-2 lg:col-span-5"
        >
          <PortraitCard src={profileSrc} name={t.hero.name} role={t.hero.roleValue} available={t.hero.available} />
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

/* ──────────────────────────────────────────────────────────
   Editorial portrait card — magazine-style framed photo
   ────────────────────────────────────────────────────────── */
function PortraitCard({
  src,
  name,
  role,
  available,
}: {
  src: string;
  name: string;
  role: string;
  available: string;
}) {
  return (
    <div className="relative w-full max-w-[340px] sm:max-w-[380px]">
      {/* Ambient glow behind card */}
      <div
        className="absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-[#FFC300]/30 via-[#FFD60A]/20 to-[#003566]/30 blur-3xl"
        style={{ animation: "float-orb 8s ease-in-out infinite" }}
      />

      {/* Rotating dashed ring accent (decorative, top-right) */}
      <div
        className="absolute -right-5 -top-5 z-20 h-16 w-16 rounded-full border-2 border-dashed border-[#FFC300]/50"
        style={{ animation: "spin-slow 24s linear infinite" }}
      >
        <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFC300]" />
      </div>

      {/* Main photo card with golden gradient border */}
      <div className="gradient-border relative overflow-hidden rounded-[1.75rem] shadow-2xl">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem]">
          <img
            src={src}
            alt={name}
            className="h-full w-full object-cover object-top"
            loading="eager"
          />
          {/* Top gradient sheen */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/30 to-transparent" />
          {/* Bottom gradient for legibility of name plate */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />

          {/* Top-left status chip on photo */}
          <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            {available}
          </div>

          {/* Bottom name plate */}
          <div className="absolute inset-x-0 bottom-0 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#FFC300]">
              {role}
            </p>
            <h3 className="mt-1 text-lg font-black leading-tight text-white drop-shadow-md">
              {name}
            </h3>
          </div>
        </div>
      </div>

      {/* Floating "Creative" badge — bottom-left */}
      <div
        className="absolute -bottom-4 -left-4 z-20 flex items-center gap-2 rounded-2xl glass-strong border border-border px-4 py-2.5 text-xs font-semibold shadow-xl"
        style={{ animation: "float-badge-up 3.5s ease-in-out infinite" }}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FFC300] text-[#000814]">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        <div className="leading-tight">
          <div className="text-foreground">Creative</div>
          <div className="text-[10px] font-medium text-muted-foreground">Developer & Designer</div>
        </div>
      </div>

      {/* Decorative corner ticks */}
      <span className="absolute -left-3 top-8 h-8 w-px bg-[#FFC300]/40" />
      <span className="absolute -left-3 top-8 h-px w-8 bg-[#FFC300]/40" />
    </div>
  );
}
