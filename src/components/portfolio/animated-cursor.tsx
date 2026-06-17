"use client";

import { useEffect } from "react";
import { useMounted } from "@/hooks/use-mounted";

export function AnimatedCursor() {
  const mounted = useMounted();
  const enabled =
    mounted &&
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: fine)").matches;

  useEffect(() => {
    if (!enabled) return;
    const mq = window.matchMedia("(pointer: fine)");
    if (!mq.matches) return;

    const dot = document.createElement("div");
    dot.className = "cursor-dot";
    const outline = document.createElement("div");
    outline.className = "cursor-outline";
    document.body.appendChild(dot);
    document.body.appendChild(outline);
    document.body.classList.add("custom-cursor-active");

    let mouseX = 0;
    let mouseY = 0;
    let outlineX = 0;
    let outlineY = 0;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
    };

    const onDown = () => {
      outline.style.transform = "translate(-50%, -50%) scale(0.7)";
    };
    const onUp = () => {
      outline.style.transform = "translate(-50%, -50%) scale(1)";
    };

    const onHoverEnter = (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("a, button, input, textarea, select, [role='button'], [data-cursor='hover']")
      ) {
        outline.style.width = "56px";
        outline.style.height = "56px";
        outline.style.background = "rgba(255, 90, 31, 0.15)";
      }
    };
    const onHoverLeave = (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("a, button, input, textarea, select, [role='button'], [data-cursor='hover']")
      ) {
        outline.style.width = "36px";
        outline.style.height = "36px";
        outline.style.background = "transparent";
      }
    };

    const animate = () => {
      outlineX += (mouseX - outlineX) * 0.18;
      outlineY += (mouseY - outlineY) * 0.18;
      outline.style.left = `${outlineX}px`;
      outline.style.top = `${outlineY}px`;
      raf = requestAnimationFrame(animate);
    };
    animate();

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseover", onHoverEnter);
    document.addEventListener("mouseout", onHoverLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseover", onHoverEnter);
      document.removeEventListener("mouseout", onHoverLeave);
      dot.remove();
      outline.remove();
      document.body.classList.remove("custom-cursor-active");
    };
  }, [enabled]);

  return null;
}
