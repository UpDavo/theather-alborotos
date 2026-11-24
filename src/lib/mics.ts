"use client";

import { useCallback, useMemo } from "react";
import type { MicMap } from "./libreto";
import { usePersisted } from "./persisted";

/** Números de micrófono guardados en este dispositivo. */
export function useMics() {
  const [raw, setRaw] = usePersisted<string>("tp:mics", "{}");
  const mics = useMemo<MicMap>(() => {
    try {
      return JSON.parse(raw) as MicMap;
    } catch {
      return {};
    }
  }, [raw]);

  const setMic = useCallback(
    (name: string, value: string) => {
      setRaw((prev) => {
        let map: MicMap = {};
        try {
          map = JSON.parse(prev) as MicMap;
        } catch {}
        const v = value.trim();
        if (v) map[name] = v;
        else delete map[name];
        return JSON.stringify(map);
      });
    },
    [setRaw],
  );

  const replaceAll = useCallback((map: MicMap) => setRaw(JSON.stringify(map)), [setRaw]);

  return { mics, setMic, replaceAll };
}
