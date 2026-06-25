"use client";

import { motion } from "framer-motion";
import { ArrowDown, Download, FolderGit2, MapPin, Send, Sparkles } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { useTypingEffect } from "@/hooks/use-typing-effect";
import { useEffect, useState } from "react";

const stats = [
  { value: 25, suffix: "+", key: "projects" },
  { value: 2, suffix: "", key: "experience" },
  { value: 5, suffix: "+", key: "awards" },
] as const;

/** Simple, calm count-up — ease-out, no overshoot. */
function CountUp({ to, suffix }: { to: number; suffix: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let frame: number;
    const duration = 1000;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 2); // ease-out quad
      setCount(Math.round(eased * to));
      if (p < 1) frame = requestAnimationFrame(tick);
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

/** One shared, gentle entrance — opacity + small slide up. */
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.1 + i * 0.08, ease: "easeOut" },
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
      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-8">
        {/* Left — text column */}
        <div className="order-2 lg:order-1 lg:col-span-7">
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="flex flex-wrap items-center gap-3"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-sm">
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
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-6 text-xs font-bold uppercase tracking-[0.35em] text-[#FFC300]"
          >
            {t.hero.greeting}
          </motion.p>

          <motion.h1
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-3 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl"
          >
            <span className="brand-gradient-text">{t.hero.name}</span>
          </motion.h1>

          <motion.div
            custom={3}
            variants={fadeUp}
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
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground"
          >
            {t.hero.tagline}
          </motion.p>

          <motion.div
            custom={5}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <button
              onClick={() => scrollTo("projects")}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-[#FFC300] px-7 text-sm font-semibold text-[#000814] shadow-lg transition-transform hover:scale-105"
            >
              <FolderGit2 className="h-4 w-4" />
              {t.hero.viewProjects}
            </button>
            <button
              onClick={() => scrollTo("cv")}
              className="inline-flex h-12 items-center gap-2 rounded-full border border-border px-6 text-sm font-semibold text-foreground transition-colors hover:border-[#FFC300]/40 hover:text-[#FFC300]"
            >
              <Download className="h-4 w-4" />
              {t.hero.downloadCv}
            </button>
            <button
              onClick={() => scrollTo("contact")}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#FFC300] bg-[#FFC300]/5 text-[#FFC300] transition-colors hover:bg-[#FFC300]/10"
              aria-label={t.hero.contactMe}
            >
              <Send className="h-4 w-4" />
            </button>
          </motion.div>

          <motion.div
            custom={6}
            variants={fadeUp}
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

        {/* Right — clean portrait */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="order-1 flex justify-center lg:order-2 lg:col-span-5"
        >
          <PortraitCard src={profileSrc} name={t.hero.name} role={t.hero.roleValue} available={t.hero.available} />
        </motion.div>
      </div>

      {/* Minimal scroll hint */}
      <motion.button
        onClick={() => scrollTo("about")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1.5 text-muted-foreground transition-colors hover:text-[#FFC300] sm:flex"
        aria-label="Scroll down"
      >
        <span className="text-xs font-medium uppercase tracking-widest">
          {t.hero.scrollDown}
        </span>
        <ArrowDown className="h-4 w-4 animate-bounce" />
      </motion.button>
    </section>
  );
}

/* Clean, framed portrait — no sheens, rings, or floating badges. */
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
      <div className="relative overflow-hidden rounded-[1.5rem] border border-border shadow-2xl">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem]">
          <img
            src={src}
            alt={name}
            className="h-full w-full object-cover object-top"
            loading="eager"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            {available}
          </div>

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
    </div>
  );
}
