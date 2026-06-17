"use client";

import { useEffect, useRef, useState } from "react";

export function useTypingEffect(
  words: string[],
  options?: { typeSpeed?: number; deleteSpeed?: number; delay?: number }
) {
  const { typeSpeed = 80, deleteSpeed = 40, delay = 1800 } = options ?? {};
  const [display, setDisplay] = useState("");
  const indexRef = useRef(0);
  const subRef = useRef(0);
  const deletingRef = useRef(false);

  useEffect(() => {
    if (words.length === 0) return;
    let timeout: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      const current = words[indexRef.current % words.length] ?? "";

      // Finished typing whole word
      if (!deletingRef.current && subRef.current === current.length) {
        timeout = setTimeout(() => {
          deletingRef.current = true;
          tick();
        }, delay);
        return;
      }

      // Finished deleting
      if (deletingRef.current && subRef.current === 0) {
        deletingRef.current = false;
        indexRef.current = (indexRef.current + 1) % words.length;
        timeout = setTimeout(tick, typeSpeed);
        return;
      }

      // Step
      if (deletingRef.current) {
        subRef.current = Math.max(0, subRef.current - 1);
      } else {
        subRef.current = Math.min(current.length, subRef.current + 1);
      }
      setDisplay(current.substring(0, subRef.current));
      timeout = setTimeout(tick, deletingRef.current ? deleteSpeed : typeSpeed);
    };

    timeout = setTimeout(tick, typeSpeed);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [words, typeSpeed, deleteSpeed, delay]);

  return { text: display };
}
