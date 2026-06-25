"use client";

import { useEffect, useRef } from "react";

interface Orb {
  x: number;
  y: number;
  size: number;
  speed: number;     // upward drift speed (px/frame)
  drift: number;     // horizontal sine drift amplitude
  driftPhase: number;
  alpha: number;
  alphaSpeed: number;
  hueShift: number;  // 0 = warm orange, 1 = golden yellow
}

/**
 * Floating bokeh-orb background.
 *
 * Replaces the old connected-dot particle network with soft glowing orbs
 * that rise slowly upward and gently fade — like dust motes in sunlight or
 * floating fireflies. Feels more premium/editorial than a tech-y mesh.
 *
 * Each orb is drawn as a radial gradient (bright center → transparent edge)
 * so the glow is soft, with a slight color variation between warm orange
 * and golden yellow to match the brand palette.
 */
export function ParticleBackground({ density = 26 }: { density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let animationId = 0;
    let orbs: Orb[] = [];
    let width = 0;
    let height = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      width = parent.offsetWidth;
      height = parent.offsetHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initOrbs();
    };

    const initOrbs = () => {
      orbs = [];
      const count = Math.min(density, Math.floor((width * height) / 24000));
      for (let i = 0; i < count; i++) {
        orbs.push(makeOrb(true));
      }
    };

    // Create a new orb. seeded=true scatters it anywhere on screen (initial
    // population); seeded=false spawns it at the bottom (ongoing drift-up).
    const makeOrb = (seeded: boolean): Orb => {
      const size = Math.random() * 18 + 6; // 6–24px radius
      return {
        x: Math.random() * width,
        y: seeded ? Math.random() * height : height + size + Math.random() * 40,
        size,
        speed: Math.random() * 0.35 + 0.12, // slow rise
        drift: Math.random() * 18 + 4,
        driftPhase: Math.random() * Math.PI * 2,
        alpha: Math.random() * 0.35 + 0.12,
        alphaSpeed: (Math.random() - 0.5) * 0.006,
        hueShift: Math.random(),
      };
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter"; // additive glow

      for (let i = 0; i < orbs.length; i++) {
        const o = orbs[i];

        // Rise upward
        o.y -= o.speed;
        // Gentle horizontal sine drift
        o.driftPhase += 0.008;
        const drawX = o.x + Math.sin(o.driftPhase) * o.drift;
        // Twinkle alpha
        o.alpha += o.alphaSpeed;
        if (o.alpha < 0.08 || o.alpha > 0.45) o.alphaSpeed *= -1;

        // Recycle when fully above the top edge
        if (o.y < -o.size * 2) {
          orbs[i] = makeOrb(false);
          continue;
        }

        // Radial gradient orb — warm orange → golden yellow
        const grad = ctx.createRadialGradient(
          drawX,
          o.y,
          0,
          drawX,
          o.y,
          o.size
        );
        // Blend between brand orange (#FF5A1F-ish, here #FF8A3D for warmth)
        // and golden yellow (#FFD60A) per-orb.
        const inner =
          o.hueShift < 0.5
            ? `rgba(255, 170, 70, ${o.alpha})`     // warm
            : `rgba(255, 214, 10, ${o.alpha})`;    // golden
        grad.addColorStop(0, inner);
        grad.addColorStop(0.4, `rgba(255, 195, 0, ${o.alpha * 0.4})`);
        grad.addColorStop(1, "rgba(255, 195, 0, 0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(drawX, o.y, o.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      animationId = requestAnimationFrame(draw);
    };

    resize();

    if (!prefersReduced) {
      draw();
    } else {
      draw(); // render one static frame
      cancelAnimationFrame(animationId);
    }

    let resizeTimer: ReturnType<typeof setTimeout>;
    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    };
    window.addEventListener("resize", debouncedResize);

    return () => {
      cancelAnimationFrame(animationId);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", debouncedResize);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
