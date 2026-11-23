"use client";

import { useEffect, useRef } from "react";
import { useT } from "@/lib/i18n/context";

const SEEN_KEY = "intro-seen";
/** Must match the CSS: 2.1s hold + 0.9s curtain (see .intro-overlay in globals.css). */
export const INTRO_TOTAL_MS = 3000;
const SKIP_MS = 600;

/**
 * Runs inline before first paint. On a visitor's first page view this
 * session it flags <html data-intro>, which makes CSS show and animate the
 * overlay immediately. It also marks the intro as seen right away, so
 * navigating mid-intro never replays it.
 */
export const introBootScript = `try{if(!sessionStorage.getItem("${SEEN_KEY}")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.dataset.intro="1";document.documentElement.dataset.introStart=String(Date.now())}sessionStorage.setItem("${SEEN_KEY}","1")}catch(e){}`;

function finishIntro() {
  const root = document.documentElement;
  if (!root.dataset.intro) return;
  delete root.dataset.intro;
  delete root.dataset.introStart;
  window.dispatchEvent(new Event("intro:done"));
}

/** First-visit intro: the name rises in, a gold line draws, then the curtain lifts. */
export function Intro({ name }: { name: string }) {
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (!root.dataset.intro) return;
    // The CSS animation has been running since first paint; finish when it ends.
    const elapsed = Date.now() - Number(root.dataset.introStart || Date.now());
    const timer = setTimeout(finishIntro, Math.max(0, INTRO_TOTAL_MS - elapsed));
    const onKey = (e: KeyboardEvent) => {
      if (["Escape", "Enter", " "].includes(e.key)) skip();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const skip = () => {
    ref.current?.classList.add("is-skipping");
    setTimeout(finishIntro, SKIP_MS);
  };

  const [first, ...rest] = name.split(" ");
  const lines = [first, rest.join(" ")].filter(Boolean);

  return (
    <div
      ref={ref}
      onClick={skip}
      role="presentation"
      className="intro-overlay fixed inset-0 z-[100] cursor-pointer flex-col items-center justify-center bg-background px-6"
    >
      <div className="text-center">
        <p className="text-4xl font-semibold tracking-tight sm:text-6xl">
          {lines.map((line, i) => (
            <span key={i} className="block overflow-hidden pb-[0.08em]">
              <span
                className={i === 1 ? "intro-rise text-muted-foreground" : "intro-rise"}
                style={{ animationDelay: `${0.15 + i * 0.12}s` }}
              >
                {line}
              </span>
            </span>
          ))}
        </p>
        <div className="intro-line mx-auto mt-6 h-px w-40 bg-primary" />
        <p className="intro-fade mt-4 text-sm uppercase tracking-[0.2em] text-muted-foreground">{t.site.role}</p>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          skip();
        }}
        className="intro-fade absolute bottom-6 right-6 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
      >
        {t.site.intro.skip}
      </button>
    </div>
  );
}
