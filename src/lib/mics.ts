"use client";

import { useCallback, useMemo } from "react";
import { usePersisted } from "./persisted";

export type StrMap = Record<string, string>;

function parse(raw: string): StrMap {
  try {
    const v = JSON.parse(raw);
    return v && typeof v === "object" ? (v as StrMap) : {};
  } catch {
    return {};
  }
}

/** Mapa texto→texto guardado en localStorage (este dispositivo). */
export function usePersistedMap(key: string) {
  const [raw, setRaw] = usePersisted<string>(key, "{}");
  const map = useMemo(() => parse(raw), [raw]);

  const set = useCallback(
    (name: string, value: string) => {
      setRaw((prev) => {
        const m = parse(prev);
        const v = value.trim();
        if (v) m[name] = v;
        else delete m[name];
        return JSON.stringify(m);
      });
    },
    [setRaw],
  );

  const replaceAll = useCallback((m: StrMap) => setRaw(JSON.stringify(m)), [setRaw]);

  return { map, set, replaceAll };
}

/** Números de micrófono por persona. */
export function useMics() {
  const { map, set, replaceAll } = usePersistedMap("tp:mics");
  return { mics: map, setMic: set, replaceAll };
}

/** Notas libres por pie (clave = número de pie). */
export function useNotes() {
  const { map, set, replaceAll } = usePersistedMap("tp:notes");
  return { notes: map, setNote: set, replaceNotes: replaceAll };
}
