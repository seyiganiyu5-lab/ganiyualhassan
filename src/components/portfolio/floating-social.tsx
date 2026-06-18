"use client";

import { motion } from "framer-motion";
import { MessageCircle, Mail, Linkedin } from "lucide-react";

export function FloatingSocial() {
  const items = [
    {
      icon: MessageCircle,
      label: "WhatsApp",
      href: "https://wa.me/2250503671480",
      color: "#25D366",
    },
    {
      icon: Mail,
      label: "Email",
      href: "mailto:seyiganiyu5@gmail.com",
      color: "#FFC300",
    },
    {
      icon: Linkedin,
      label: "LinkedIn",
      href: "https://linkedin.com/in/al-hassan-ganiyu-9910b3410",
      color: "#0A66C2",
    },
  ];

  return (
    <div className="fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 md:flex">
      {items.map((item, i) => (
        <motion.a
          key={item.label}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex h-11 w-11 items-center justify-center rounded-full glass border border-border text-muted-foreground transition-colors hover:text-foreground"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.5 + i * 0.15 }}
          whileHover={{ scale: 1.1 }}
          aria-label={item.label}
        >
          <span
            className="absolute inset-0 rounded-full opacity-0 transition-opacity group-hover:opacity-20"
            style={{ backgroundColor: item.color }}
          />
          <item.icon className="relative h-5 w-5" />
          <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 transition-opacity group-hover:opacity-100">
            {item.label}
          </span>
        </motion.a>
      ))}
      <div className="mx-auto h-16 w-px bg-gradient-to-b from-[#FFC300] to-transparent" />
    </div>
  );
}
