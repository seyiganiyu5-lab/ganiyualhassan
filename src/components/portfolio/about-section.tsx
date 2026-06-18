"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { useT } from "@/lib/i18n/context";
import { SectionHeading } from "./section-heading";
import {
  Code2,
  Palette,
  Cpu,
  PenTool,
  GraduationCap,
  Briefcase,
  Rocket,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

const skillIcons = {
  development: Code2,
  design: Palette,
  technology: Cpu,
  creative: PenTool,
} as const;

function SkillBar({ name, level, delay }: { name: string; level: number; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{name}</span>
        <span className="text-xs font-semibold text-[#FFC300]">{level}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#FFC300] to-[#FFD60A]"
          initial={{ width: 0 }}
          animate={inView ? { width: `${level}%` } : { width: 0 }}
          transition={{ duration: 1.2, delay, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

const timelineIcons = [GraduationCap, Briefcase, Rocket, PenTool];

export function AboutSection() {
  const t = useT();
  const skills = t.about.skillsData;
  const skillCategories = Object.keys(skills) as Array<keyof typeof skills>;

  return (
    <section id="about" className="relative py-24 sm:py-32">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#FFC300]/40 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading subtitle={t.about.subtitle} title={t.about.title} />

        {/* Bio */}
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl gradient-border p-6 sm:p-8"
          >
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#FFC300]/10 blur-3xl" />
            <div className="relative">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFC300]/10 text-[#FFC300]">
                  <PenTool className="h-4 w-4" />
                </span>
                Who I Am
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                {t.about.bio}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {t.about.bio2}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative grid grid-cols-2 gap-4"
          >
            {[
              { icon: Code2, label: t.about.skills.development, count: 5 },
              { icon: Palette, label: t.about.skills.design, count: 6 },
              { icon: Cpu, label: t.about.skills.technology, count: 3 },
              { icon: PenTool, label: t.about.skills.creative, count: 3 },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group flex flex-col items-start gap-3 rounded-2xl glass border border-border p-5 transition-all hover:border-[#FFC300]/40 hover:shadow-lg"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFC300]/10 text-[#FFC300] transition-transform group-hover:scale-110">
                  <item.icon className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-2xl font-black brand-gradient-text">
                    {item.count}+
                  </div>
                  <div className="text-xs font-medium text-muted-foreground">
                    {item.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Skills */}
        <div className="mt-16">
          <motion.h3
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 text-center text-2xl font-bold"
          >
            {t.about.skillsTitle}
          </motion.h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {skillCategories.map((cat, i) => {
              const Icon = skillIcons[cat];
              return (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl glass border border-border p-6"
                >
                  <div className="mb-5 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFC300]/10 text-[#FFC300]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h4 className="font-bold">{t.about.skills[cat]}</h4>
                  </div>
                  <div className="space-y-3">
                    {skills[cat].map((skill, j) => (
                      <SkillBar
                        key={skill.name}
                        name={skill.name}
                        level={skill.level}
                        delay={j * 0.1}
                      />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-20">
          <motion.h3
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center text-2xl font-bold"
          >
            {t.about.timelineTitle}
          </motion.h3>
          <div className="relative mx-auto max-w-3xl">
            {/* Vertical line */}
            <div className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-[#FFC300] via-[#FFC300]/30 to-transparent sm:left-1/2 sm:-translate-x-1/2" />

            <div className="space-y-8">
              {t.about.timeline.map((item, i) => {
                const Icon = timelineIcons[i % timelineIcons.length];
                const isLeft = i % 2 === 0;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={cn(
                      "relative flex items-start gap-6 pl-12 sm:pl-0",
                      isLeft ? "sm:flex-row" : "sm:flex-row-reverse"
                    )}
                  >
                    {/* Node */}
                    <div className="absolute left-4 top-1 z-10 -translate-x-1/2 sm:left-1/2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFC300] text-[#000814] shadow-lg glow-orange-sm ring-4 ring-background">
                        <Icon className="h-4 w-4" />
                      </span>
                    </div>

                    <div className="hidden flex-1 sm:block" />

                    <div className="flex-1">
                      <div
                        className={cn(
                          "rounded-2xl glass border border-border p-5 transition-all hover:border-[#FFC300]/40 hover:shadow-lg",
                          isLeft ? "sm:mr-8" : "sm:ml-8"
                        )}
                      >
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#FFC300]">
                          {item.year}
                        </span>
                        <h4 className="mt-1 font-bold">{item.title}</h4>
                        <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
