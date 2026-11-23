"use client";

import { motion } from "framer-motion";
import { EASE } from "@/components/site/motion";

/** Re-mounts on every navigation, giving each page a soft fade-up entrance. */
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
