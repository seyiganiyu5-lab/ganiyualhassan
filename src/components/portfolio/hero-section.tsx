"use client";

import { motion } from "framer-motion";
import { ArrowDown, Download, FolderGit2, MapPin, Send, Sparkles, ChevronDown } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { useTypingEffect } from "@/hooks/use-typing-effect";
import { ParticleBackground } from "./particle-background";
import { useEffect, useState } from "react";

const stats = [
  { value: 25, suffix: "+", key: "projects" },
  { value: 2, suffix: "", key: "experience" },
  { value: 5, suffix: "+", key: "awards" },
] as const;

/**
 * Count-up with an elastic overshoot bounce.
 * Replaces the old cubic ease-out — now the number briefly overshoots the
 * target then settles back, giving a satisfying "pop" finish.
 */
function CountUp({ to, suffix }: { to: number; suffix: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let frame: number;
    const duration = 1300;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // Elastic-out: overshoots ~13% then settles
      const p = progress;
      const eased =
        p === 0 || p === 1
          ? p
          : Math.pow(2, -10 * p) * Math.sin(((p * 10 - 0.75) * (2 * Math.PI)) / 3) + 1;
      setCount(Math.round(eased * to));
      if (progress < 1) frame = requestAnimationFrame(tick);
      else setCount(to); // clamp to exact target on finish
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

/**
 * Shared "blur-to-focus" entrance variant.
 * Replaces the old uniform { opacity:0, y:20 } → { opacity:1, y:0 }.
 * Now each element also blurs in from 12px → 0 and slides up 30px → 0,
 * which reads as more cinematic / "focusing into view".
 */
const blurUp = {
  hidden: { opacity: 0, y: 30, filter: "blur(12px)" },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, delay: 0.15 + i * 0.1, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

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
      {/* Bokeh-orb background */}
      <div className="absolute inset-0">
        <ParticleBackground density={24} />
      </div>

      {/* Editorial grid backdrop */}
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-60" />

      {/* Floating morphing blobs (organic, replaces geometric shapes) */}
      <div
        className="pointer-events-none absolute left-[6%] top-[16%] h-20 w-20 border border-[#FFC300]/30"
        style={{ animation: "morph-blob 16s ease-in-out infinite" }}
      />
      <div
        className="pointer-events-none absolute right-[9%] top-[14%] h-14 w-14 border-2 border-[#FFD60A]/25"
        style={{ animation: "morph-blob 13s ease-in-out infinite reverse" }}
      />
      <div
        className="pointer-events-none absolute bottom-[16%] left-[11%] h-10 w-10 bg-[#FFC300]/10"
        style={{ animation: "morph-blob 11s ease-in-out infinite" }}
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
          {/* Status chips — slide in from the left */}
          <motion.div
            custom={0}
            variants={blurUp}
            initial="hidden"
            animate="show"
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
            custom={1}
            variants={blurUp}
            initial="hidden"
            animate="show"
            className="mt-6 text-xs font-bold uppercase tracking-[0.35em] text-[#FFC300]"
          >
            {t.hero.greeting}
          </motion.p>

          {/* NAME — clip-path wipe reveal (the headline effect) */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-3 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl"
          >
            <span
              className="brand-gradient-text reveal-name inline-block"
              style={{ animationDelay: "0.35s", animationFillMode: "both" }}
            >
              {t.hero.name}
            </span>
          </motion.h1>

          {/* Typing title — highlighted pill */}
          <motion.div
            custom={2}
            variants={blurUp}
            initial="hidden"
            animate="show"
            className="mt-6 flex min-h-[2.75rem] items-center gap-2.5"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFC300]/10 text-[#FFC300]">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-xl font-bold text-foreground sm:text-2xl">{text}</span>
            <span className="animate-blink text-2xl font-bold text-[#FFC300]">|</span>
          </motion.div>

          <motion.p
            custom={3}
            variants={blurUp}
            initial="hidden"
            animate="show"
            className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground"
          >
            {t.hero.tagline}
          </motion.p>

          {/* CTAs */}
          <motion.div
            custom={4}
            variants={blurUp}
            initial="hidden"
            animate="show"
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
            custom={5}
            variants={blurUp}
            initial="hidden"
            animate="show"
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

        {/* Right — portrait card, slides in from the right with slight rotate */}
        <motion.div
          initial={{ opacity: 0, x: 80, rotate: 3 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="order-1 flex justify-center lg:order-2 lg:col-span-5"
        >
          <PortraitCard src={profileSrc} name={t.hero.name} role={t.hero.roleValue} available={t.hero.available} />
        </motion.div>
      </div>

      {/* Scroll indicator — pulsing vertical line + sequential chevrons */}
      <motion.button
        onClick={() => scrollTo("about")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground transition-colors hover:text-[#FFC300] sm:flex"
        aria-label="Scroll down"
      >
        <span className="text-xs font-medium uppercase tracking-widest">
          {t.hero.scrollDown}
        </span>
        <div className="relative flex h-10 w-5 flex-col items-center">
          {/* Pulsing vertical line */}
          <span
            className="absolute bottom-0 h-full w-[2px] origin-bottom rounded-full bg-[#FFC300]"
            style={{ animation: "pulse-line 1.6s ease-in-out infinite" }}
          />
          {/* Two sequential chevrons */}
          <ChevronDown
            className="absolute top-0 h-3.5 w-3.5 text-[#FFC300]"
            style={{ animation: "chevron-drop 1.6s ease-in-out infinite", animationDelay: "0s" }}
          />
          <ChevronDown
            className="absolute top-2 h-3.5 w-3.5 text-[#FFC300]/60"
            style={{ animation: "chevron-drop 1.6s ease-in-out infinite", animationDelay: "0.2s" }}
          />
        </div>
        <ArrowDown className="h-3 w-3 opacity-0" />
      </motion.button>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   Editorial portrait card — magazine-style framed photo
   with a periodic scanning light sheen across the image
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
      {/* Ambient glow — now breathes (scale + opacity) instead of static blur */}
      <div
        className="absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-[#FFC300]/30 via-[#FFD60A]/20 to-[#003566]/30 blur-3xl"
        style={{ animation: "glow-breathe 7s ease-in-out infinite" }}
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

          {/* Scanning light sheen — sweeps across periodically */}
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden="true"
          >
            <div
              className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent"
              style={{ animation: "scan-sheen 5s ease-in-out infinite", animationDelay: "1.2s" }}
            />
          </div>

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
