"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { RotateCw } from "lucide-react";
import { useT } from "@/lib/i18n/context";

const AUTO_DEG_PER_S = 14; // idle spin speed (~26s per turn)
const DRAG_DEG_PER_PX = 0.45;
const FRICTION = 0.94; // momentum decay per frame after release
const IDLE_MS = 2200; // pause before auto-spin resumes

/**
 * A holographic ID card that turns a full 360° — drag with mouse or touch,
 * flick for momentum, arrow keys when focused. Photo on the front, a tech
 * spec sheet on the back, with floating layers at different depths.
 */
export function HeroCard({ name, avatarUrl }: { name: string; avatarUrl: string }) {
  const t = useT();
  const reduce = useReducedMotion();
  const rotY = useMotionValue(-18);
  const rotX = useMotionValue(6);

  const cardRef = useRef<HTMLDivElement>(null);
  const state = useRef({ dragging: false, lastX: 0, lastY: 0, lastT: 0, vel: 0, idleSince: 0, hovering: false });

  useAnimationFrame((time, delta) => {
    const s = state.current;
    if (s.dragging) return;
    const dt = Math.min(delta, 64) / 1000;
    if (Math.abs(s.vel) > 0.02) {
      // momentum from a flick
      rotY.set(rotY.get() + s.vel * dt * 60);
      s.vel *= FRICTION;
      s.idleSince = time;
    } else if (!reduce && !s.hovering && time - s.idleSince > IDLE_MS) {
      rotY.set(rotY.get() + AUTO_DEG_PER_S * dt);
    }
    // ease the tilt back to a gentle resting angle
    rotX.set(rotX.get() + (6 - rotX.get()) * Math.min(1, dt * 3));
  });

  const onDown = (e: React.PointerEvent) => {
    e.preventDefault(); // stops the drag from selecting text elsewhere on the page
    window.getSelection()?.removeAllRanges();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    Object.assign(state.current, { dragging: true, lastX: e.clientX, lastY: e.clientY, lastT: e.timeStamp, vel: 0 });
  };
  const onMove = (e: React.PointerEvent) => {
    const s = state.current;
    if (!s.dragging) return;
    const dx = e.clientX - s.lastX;
    const dy = e.clientY - s.lastY;
    const dt = Math.max(1, e.timeStamp - s.lastT);
    rotY.set(rotY.get() + dx * DRAG_DEG_PER_PX);
    rotX.set(Math.max(-25, Math.min(25, rotX.get() - dy * DRAG_DEG_PER_PX * 0.6)));
    s.vel = ((dx * DRAG_DEG_PER_PX) / dt) * 16; // degrees per ~frame
    Object.assign(s, { lastX: e.clientX, lastY: e.clientY, lastT: e.timeStamp });
  };
  const onUp = (e: React.PointerEvent) => {
    const s = state.current;
    if (!s.dragging) return;
    s.dragging = false;
    s.idleSince = performance.now();
    if (e.timeStamp - s.lastT > 80) s.vel = 0; // held still before releasing: no flick
  };
  const nudge = (deg: number) => {
    rotY.set(rotY.get() + deg);
    state.current.idleSince = performance.now();
  };

  // Specular glare follows the angle; flips sides as the card turns.
  const glareX = useTransform(rotY, (v) => `${50 + Math.sin((v * Math.PI) / 180) * 60}%`);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} 30%, rgba(255,255,255,0.22), transparent 55%)`;
  const transform = useMotionTemplate`rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  const degLabel = useTransform(rotY, (v) => `${String(Math.round(((v % 360) + 360) % 360)).padStart(3, "0")}°`);

  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  const stack = [
    ...t.about.skillsData.development.slice(0, 3),
    ...t.about.skillsData.design.slice(0, 3),
  ].map((s) => s.name);

  return (
    <div className="flex flex-col items-center">
      {/* The fixed outer box is the grab area, so the card can be grabbed even when edge-on. */}
      <div
        className="relative h-[340px] w-[260px] cursor-grab touch-none select-none active:cursor-grabbing sm:h-[400px] sm:w-[300px]"
        style={{ perspective: 1100 }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerEnter={() => (state.current.hovering = true)}
        onPointerLeave={() => (state.current.hovering = false)}
      >
        {/* Floor glow */}
        <div className="pointer-events-none absolute -bottom-6 left-1/2 h-8 w-3/4 -translate-x-1/2 rounded-[100%] bg-primary/25 blur-2xl" />

        <motion.div
          ref={cardRef}
          role="img"
          aria-label={`${name} — ${t.site.card.hint}`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") nudge(-20);
            if (e.key === "ArrowRight") nudge(20);
          }}
          className="pointer-events-none relative h-full w-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary"
          style={{ transformStyle: "preserve-3d", transform }}
        >
          {/* Orbit ring, behind the card */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[118%] w-[118%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/25"
            style={{ transform: "translateZ(-60px) rotateX(72deg)" }}
          >
            <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_12px_2px] shadow-primary/60" />
          </div>

          {/* ── FRONT ── */}
          <Face>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                draggable={false}
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: "50% 22%" }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-muted text-7xl font-semibold text-primary">
                {initials}
              </div>
            )}
            {/* tech overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/30" />
            <div className="hero-scanlines absolute inset-0 opacity-40 mix-blend-overlay" />
            <div className="hero-sweep absolute inset-x-0 h-1/3" />
            <motion.div className="absolute inset-0" style={{ background: glare }} />

            <div className="absolute inset-x-4 top-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-white/80">
              <span>ID://{initials}-24</span>
              <motion.span>{degLabel}</motion.span>
            </div>
            <div className="absolute inset-x-4 bottom-4 text-white">
              <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/70">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px] shadow-emerald-400" />
                {t.site.card.status}
              </p>
              <p className="mt-1.5 text-lg font-semibold leading-tight">{name}</p>
              <p className="text-sm text-white/70">{t.site.role}</p>
            </div>
          </Face>

          {/* Floating HUD brackets, in front of the photo (visible depth as it turns) */}
          <div
            className="pointer-events-none absolute inset-3"
            style={{ transform: "translateZ(36px)", backfaceVisibility: "hidden" }}
          >
            <Brackets />
          </div>

          {/* ── BACK ── */}
          <Face back>
            <div className="hero-grid absolute inset-0 bg-[#0b0b0d]" />
            <motion.div className="absolute inset-0" style={{ background: glare }} />
            <div className="relative flex h-full flex-col p-6 font-mono text-[11px] text-white/80">
              <div className="flex items-center justify-between uppercase tracking-[0.18em] text-white/50">
                <span>sys.profile</span>
                <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_2px] shadow-primary/60" />
              </div>
              <p className="mt-6 font-sans text-2xl font-semibold leading-tight text-white">{name}</p>
              <div className="mt-6 space-y-3">
                <Spec k={t.site.card.role} v={t.hero.roleValue} />
                <Spec k={t.site.card.based} v={t.contact.locationBased} />
                <div>
                  <p className="uppercase tracking-[0.18em] text-white/40">{t.site.card.stack}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {stack.map((s) => (
                      <span key={s} className="rounded border border-white/15 px-1.5 py-0.5 text-[10px] text-white/80">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-auto flex items-end justify-between">
                <DotMatrix seed={name} />
                <span className="text-right uppercase tracking-[0.18em] text-primary">
                  {initials}
                  <br />
                  <span className="text-white/40">v2.0</span>
                </span>
              </div>
            </div>
          </Face>
        </motion.div>
      </div>

      <button
        type="button"
        onClick={() => nudge(90)}
        className="mt-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <RotateCw className="h-3.5 w-3.5" />
        {t.site.card.hint}
      </button>
    </div>
  );
}

function Face({ back, children }: { back?: boolean; children: React.ReactNode }) {
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-2xl border border-white/10 bg-muted shadow-2xl"
      style={{
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transform: back ? "rotateY(180deg)" : "translateZ(1px)",
      }}
    >
      {children}
    </div>
  );
}

function Brackets() {
  const c = "absolute h-5 w-5 border-primary";
  return (
    <>
      <span className={`${c} left-0 top-0 border-l-2 border-t-2`} />
      <span className={`${c} right-0 top-0 border-r-2 border-t-2`} />
      <span className={`${c} bottom-0 left-0 border-b-2 border-l-2`} />
      <span className={`${c} bottom-0 right-0 border-b-2 border-r-2`} />
    </>
  );
}

function Spec({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <p className="uppercase tracking-[0.18em] text-white/40">{k}</p>
      <p className="mt-0.5 text-white">{v}</p>
    </div>
  );
}

/** Decorative 7×7 dot pattern derived from the name — looks like a code, encodes nothing. */
function DotMatrix({ seed }: { seed: string }) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const cells = Array.from({ length: 49 }, (_, i) => {
    h = (h * 1103515245 + 12345) >>> 0;
    const corner = (r: number, c: number) => r < 2 && c < 2;
    const r = Math.floor(i / 7);
    const c = i % 7;
    return corner(r, c) || corner(r, 6 - c) || corner(6 - r, c) || (h >> 16) % 2 === 0;
  });
  return (
    <div className="grid grid-cols-7 gap-[3px]">
      {cells.map((on, i) => (
        <span key={i} className={`h-1.5 w-1.5 rounded-[1px] ${on ? "bg-white/80" : "bg-white/10"}`} />
      ))}
    </div>
  );
}
