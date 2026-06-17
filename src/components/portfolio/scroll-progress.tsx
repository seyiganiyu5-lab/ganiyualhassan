"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed left-0 right-0 top-0 z-[60] h-1 origin-left bg-gradient-to-r from-[#FF5A1F] via-[#ff8a5f] to-[#FF5A1F]"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}
