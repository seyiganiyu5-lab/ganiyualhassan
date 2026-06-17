"use client";

import { motion } from "framer-motion";

interface AnimatedAvatarProps {
  imageUrl?: string | null;
  name?: string;
}

export function AnimatedAvatar({ imageUrl, name = "G" }: AnimatedAvatarProps) {
  if (imageUrl) {
    return (
      <div className="relative mx-auto aspect-square w-full max-w-sm">
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FF5A1F] via-[#ff8a5f] to-[#FF5A1F] blur-2xl opacity-50"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative h-full w-full overflow-hidden rounded-full border-4 border-[#FF5A1F]/30 glass-strong p-1">
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full rounded-full object-cover"
          />
        </div>
      </div>
    );
  }

  // Animated silhouette/avatar placeholder
  return (
    <div className="relative mx-auto aspect-square w-full max-w-sm">
      {/* Glow orbs */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FF5A1F] via-[#ff8a5f] to-[#FF5A1F] blur-3xl opacity-40"
        animate={{ scale: [1, 1.15, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Rotating ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-dashed border-[#FF5A1F]/40"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-4 rounded-full border border-[#FF5A1F]/20"
        animate={{ rotate: -360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />

      {/* Inner avatar */}
      <div className="absolute inset-8 overflow-hidden rounded-full glass-strong border border-[#FF5A1F]/30">
        <div className="grid-bg absolute inset-0 opacity-30" />
        <svg
          viewBox="0 0 200 200"
          className="relative h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="avatarGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FF5A1F" />
              <stop offset="100%" stopColor="#ff8a5f" />
            </linearGradient>
            <linearGradient id="avatarGrad2" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#121212" />
              <stop offset="100%" stopColor="#FF5A1F" />
            </linearGradient>
          </defs>
          {/* Silhouette */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {/* Head */}
            <motion.circle
              cx="100"
              cy="75"
              r="32"
              fill="url(#avatarGrad)"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            />
            {/* Shoulders/body */}
            <motion.path
              d="M 40 180 Q 40 130 100 130 Q 160 130 160 180 Z"
              fill="url(#avatarGrad2)"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              style={{ transformOrigin: "100px 180px" }}
            />
            {/* Initial */}
            <motion.text
              x="100"
              y="88"
              textAnchor="middle"
              className="font-black"
              fontSize="36"
              fill="#fff"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              G
            </motion.text>
          </motion.g>
        </svg>
      </div>

      {/* Floating badges */}
      <motion.div
        className="absolute -right-2 top-8 flex items-center gap-1.5 rounded-full glass-strong border border-border px-3 py-1.5 text-xs font-semibold shadow-lg"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="h-2 w-2 rounded-full bg-[#FF5A1F]" />
        Creative
      </motion.div>
      <motion.div
        className="absolute -left-2 bottom-16 flex items-center gap-1.5 rounded-full glass-strong border border-border px-3 py-1.5 text-xs font-semibold shadow-lg"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        Available
      </motion.div>
    </div>
  );
}
