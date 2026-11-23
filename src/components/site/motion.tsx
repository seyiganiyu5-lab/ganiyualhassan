"use client";

import { useEffect, useState } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

/** One easing curve for the whole site: fast start, soft landing. */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** Fades and lifts its children in the first time they scroll into view. */
export function Reveal({
  delay = 0,
  y = 16,
  ...props
}: HTMLMotionProps<"div"> & { delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.6, ease: EASE, delay }}
      {...props}
    />
  );
}

/**
 * False while the intro overlay is playing, true once it's done (or
 * immediately if there's no intro). Lets the hero wait for the intro.
 */
export function useIntroDone() {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const onDone = () => setDone(true);
    window.addEventListener("intro:done", onDone);
    // No intro this visit (or it already ended before we got here).
    if (!document.documentElement.dataset.intro) onDone();
    return () => window.removeEventListener("intro:done", onDone);
  }, []);
  return done;
}

/** Splits text into words that slide up from behind a mask, one after another. */
export function WordReveal({
  text,
  play,
  delay = 0,
  className,
}: {
  text: string;
  play: boolean;
  delay?: number;
  className?: string;
}) {
  const words = text.split(" ");
  return (
    <span className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            animate={play ? { y: 0 } : { y: "110%" }}
            transition={{ duration: 0.8, ease: EASE, delay: delay + i * 0.06 }}
          >
            {w}
            {i < words.length - 1 && " "}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
