"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { CUES, DEPTS, SCENES, deptState } from "@/lib/libreto";
import { CloseIcon } from "./icons";

interface SceneDrawerProps {
  open: boolean;
  index: number;
  onClose: () => void;
  onJump: (cueIndex: number) => void;
}

/** Libreto completo agrupado por escena; tocar un pie salta a él. */
export function SceneDrawer({ open, index, onClose, onJump }: SceneDrawerProps) {
  const currentRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) currentRef.current?.scrollIntoView({ block: "center" });
  }, [open]);

  return (
    <div className={cn("fixed inset-0 z-40 transition-opacity", open ? "opacity-100" : "pointer-events-none opacity-0")}>
      <button type="button" aria-label="Cerrar" onClick={onClose} className="absolute inset-0 bg-black/60" />
      <aside
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-xl flex-col border-l border-white/10 bg-[#1c1c1f] transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-bold">Libreto completo</h2>
          <span className="text-sm text-white/50">
            {SCENES.length} escenas · {CUES.length} pies
          </span>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="ml-auto rounded-full p-2 hover:bg-white/10">
            <CloseIcon className="size-6" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain px-3 pb-10">
          {SCENES.map((s) => (
            <section key={s.index} className="mt-4">
              <h3 className="sticky top-0 z-10 bg-[#1c1c1f] px-2 py-2 text-xs font-bold tracking-widest text-white/50 uppercase">
                {s.kicker} <span className="text-white">· {s.name}</span>
              </h3>
              <ul className="flex flex-col gap-1">
                {CUES.slice(s.start, s.end + 1).map((c, i) => {
                  const cueIndex = s.start + i;
                  const active = cueIndex === index;
                  const done = cueIndex < index;
                  return (
                    <li key={c.id}>
                      <button
                        ref={active ? currentRef : undefined}
                        type="button"
                        onClick={() => {
                          onJump(cueIndex);
                          onClose();
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left",
                          active ? "bg-white text-neutral-900" : "hover:bg-white/5",
                          done && !active && "text-white/40",
                        )}
                      >
                        <span className="w-9 shrink-0 font-mono text-sm tabular-nums opacity-60">{c.num}</span>
                        <span className="flex-1 text-[15px] leading-snug">{c.cue}</span>
                        <span className="flex shrink-0 gap-1">
                          {DEPTS.map((d) => (
                            <span
                              key={d.key}
                              title={d.short}
                              className={cn("size-2 rounded-full", deptState(cueIndex, d.key).kind === "action" ? d.dot : "bg-white/10")}
                            />
                          ))}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </aside>
    </div>
  );
}
