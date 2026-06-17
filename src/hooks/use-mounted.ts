"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Returns false on the server and during hydration, true after mount.
 * Uses useSyncExternalStore to avoid hydration mismatches without
 * calling setState inside an effect.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
