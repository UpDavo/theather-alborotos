"use client";

import { useCallback, useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

/**
 * Estado guardado en localStorage (sobrevive a recargas del iPad).
 * En el servidor devuelve `fallback`, así no hay desajuste de hidratación.
 */
export function usePersisted<T extends string | number>(key: string, fallback: T) {
  const read = useCallback((): T => {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return (typeof fallback === "number" ? Number(raw) : raw) as T;
  }, [key, fallback]);

  const value = useSyncExternalStore(subscribe, read, () => fallback);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved = typeof next === "function" ? next(read()) : next;
      window.localStorage.setItem(key, String(resolved));
      listeners.forEach((l) => l());
    },
    [key, read],
  );

  return [value, set] as const;
}
