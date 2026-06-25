"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useT } from "@/lib/i18n/context";

/**
 * Kinetic Reveal loading screen.
 *
 * Replaces the old ring spinner with:
 *  - A thin progress bar that fills 0 → 100% over ~1.4s
 *  - A live percentage counter that ticks up in sync
 *  - The brand letter "G" with a subtle scale + glow pulse
 *  - On exit: the whole panel slides UP and away (curtain reveal)
 *    instead of just fading out — gives a cinematic "the show is starting" feel.
 */
export function LoadingScreen() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const t = useT();

  // Tick the percentage counter up to 100 over ~1.4s
  useEffect(() => {
    const duration = 1400;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      // ease-out so it decelerates near the end
      const eased = 1 - Math.pow(1 - p, 2);
      setProgress(Math.round(eased * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        // tiny pause at 100% before the curtain lifts
        setTimeout(() => setLoading(false), 250);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-background"
          initial={{ y: 0 }}
          // Curtain reveal: slide the entire panel up and off-screen
          exit={{ y: "-100%", transition: { duration: 0.8, ease: [0.65, 0, 0.35, 1] } }}
        >
          <div className="grid-bg absolute inset-0 opacity-40" />

          {/* Ambient glow behind the brand letter */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFC300]/15 blur-[100px]" />

          <div className="relative flex w-full max-w-md flex-col items-center gap-8 px-8">
            {/* Brand letter with pulsing glow */}
            <div
              className="brand-gradient-text text-6xl font-black sm:text-7xl"
              style={{ animation: "letter-pulse 1.6s ease-in-out infinite" }}
            >
              G
            </div>

            {/* Name */}
            <motion.p
              className="brand-gradient-text text-center text-base font-bold sm:text-lg"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Ganiyu Al-Hassan Oluwaseyi
            </motion.p>

            {/* Progress bar track */}
            <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-muted">
              <div
                className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-gradient-to-r from-[#FFC300] to-[#FFD60A]"
                style={{
                  transform: `scaleX(${progress / 100})`,
                  transition: "transform 80ms linear",
                }}
              />
            </div>

            {/* Percentage + label row */}
            <div className="flex w-full items-center justify-between text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              <span>{t.loading.text}</span>
              <span className="tabular-nums text-[#FFC300]">{progress}%</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
