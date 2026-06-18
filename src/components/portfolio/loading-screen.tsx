"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useT } from "@/lib/i18n/context";

export function LoadingScreen() {
  const [loading, setLoading] = useState(true);
  const t = useT();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
        >
          <div className="grid-bg absolute inset-0 opacity-40" />
          <div className="relative flex flex-col items-center gap-6">
            {/* Loader ring */}
            <div className="relative h-24 w-24">
              <div className="absolute inset-0 rounded-full border-2 border-muted" />
              <div className="loader-ring absolute inset-0 rounded-full border-2 border-transparent border-t-[#FFC300] border-r-[#FFC300]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="brand-gradient-text text-3xl font-black">G</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1">
              <motion.p
                className="text-sm font-medium tracking-widest text-muted-foreground uppercase"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {t.loading.text}
                <span className="animate-blink">...</span>
              </motion.p>
              <motion.p
                className="brand-gradient-text text-lg font-bold"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Ganiyu Al-Hassan Oluwaseyi
              </motion.p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
