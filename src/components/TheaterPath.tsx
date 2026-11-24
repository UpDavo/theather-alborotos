"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { usePersisted } from "@/lib/persisted";
import {
  CUES,
  DEPTS,
  TITLE,
  deptState,
  sceneOf,
  type DeptKey,
} from "@/lib/libreto";
import { DeptCard } from "./DeptCard";
import { SceneDrawer } from "./SceneDrawer";
import { Timeline } from "./Timeline";
import {
  ChevronLeft,
  ChevronRight,
  DEPT_ICON,
  ListIcon,
  RestartIcon,
} from "./icons";

const LAST = CUES.length - 1;
type Role = DeptKey | "all";

export function TheaterPath() {
  const [stored, setIndex] = usePersisted<number>("tp:index", 0);
  const [role, setRole] = usePersisted<Role>("tp:role", "all");
  const [drawer, setDrawer] = useState(false);
  const index = Math.min(
    Math.max(0, Number.isFinite(stored) ? stored : 0),
    LAST,
  );

  const cue = CUES[index];
  const scene = sceneOf(index);
  const next = index < LAST ? CUES[index + 1] : null;
  const nextScene = next ? sceneOf(index + 1) : null;

  const [dir, setDir] = useState(1);
  const go = useCallback(
    (to: number) => {
      const target = Math.min(Math.max(0, to), LAST);
      setDir(target >= index ? 1 : -1);
      setIndex(target);
    },
    [index, setIndex],
  );
  const goNext = useCallback(() => go(index + 1), [go, index]);
  const goPrev = useCallback(() => go(index - 1), [go, index]);

  // Teclado y clickers de presentación (flechas / espacio / AvPág).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (drawer) return;
      if (
        ["ArrowRight", "ArrowDown", "PageDown", " ", "Enter"].includes(e.key)
      ) {
        e.preventDefault();
        goNext();
      } else if (
        ["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].includes(e.key)
      ) {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, drawer]);

  useWakeLock();

  // Tap = siguiente · deslizar = adelante/atrás.
  const start = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    start.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    start.current = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goNext();
      else goPrev();
    } else if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      goNext();
    }
  };

  const progress = ((index + 1) / CUES.length) * 100;
  const states = DEPTS.map((d) => ({ dept: d, state: deptState(index, d.key) }));
  // Con un rol elegido solo se ve su área; con "Todos", solo las que actúan.
  const shown = role === "all" ? states.filter((x) => x.state.kind === "action") : states.filter((x) => x.dept.key === role);
  const held = role === "all" ? states.filter((x) => x.state.kind === "hold") : [];
  const cols = shown.length >= 4 ? "md:grid-cols-2" : shown.length === 3 ? "md:grid-cols-3" : shown.length === 2 ? "md:grid-cols-2" : "";

  return (
    <div className="flex h-dvh flex-col gap-3 overflow-hidden px-4 pt-[max(env(safe-area-inset-top),12px)] pb-[max(env(safe-area-inset-bottom),12px)] select-none md:px-6">
      <header className="flex items-center gap-3">
        <h1 className="truncate text-base font-bold tracking-tight">{TITLE}</h1>
        <span className="text-sm whitespace-nowrap text-white/45 tabular-nums">
          Pie {index + 1}/{CUES.length} · {Math.round(progress)}%
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button type="button" onClick={() => setDrawer(true)} className={chip(false, "h-10")}>
            <ListIcon className="size-5" /> Libreto
          </button>
          <button
            type="button"
            aria-label="Reiniciar función"
            onClick={() => {
              if (window.confirm("¿Volver al inicio de la obra?")) go(0);
            }}
            className={chip(false, "h-10 px-3")}
          >
            <RestartIcon className="size-5" />
          </button>
        </div>
      </header>

      <Timeline index={index} onJump={go} />

      <main className="grid min-h-0 flex-1 grid-rows-[1fr_auto] gap-3 lg:grid-cols-[1fr_320px] lg:grid-rows-1">
        {/* AHORA: tocar avanza, deslizar navega */}
        <section
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (start.current = null)}
          className="flex min-h-0 cursor-pointer touch-pan-y flex-col rounded-[28px] border border-white/10 bg-neutral-800/40 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
        >
          <div key={index} className={cn("flex min-h-0 flex-1 flex-col gap-4", dir > 0 ? "cue-in-next" : "cue-in-prev")}>
            <div className="flex items-center gap-4">
              <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-white text-neutral-900">
                <span className="text-[9px] font-bold tracking-widest uppercase opacity-60">Pie</span>
                <span className="text-2xl leading-none font-black tabular-nums">{cue.num}</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold tracking-[0.2em] text-white/45 uppercase">
                  {scene.kicker}
                  <span className="ml-2 tracking-normal text-white/30 normal-case">
                    {index - scene.start + 1} de {scene.end - scene.start + 1}
                  </span>
                </p>
                <h2 className="truncate text-xl font-bold tracking-tight">{scene.name}</h2>
              </div>
            </div>

            <div>
              <p className="mb-1 text-xs font-bold tracking-[0.2em] text-emerald-300 uppercase">Cuándo</p>
              <p className="text-3xl leading-tight font-bold text-balance lg:text-5xl">{cue.cue}</p>
            </div>

            {shown.length > 0 ? (
              <div className={cn("grid min-h-0 grid-cols-1 content-start gap-3 overflow-y-auto", cols)}>
                {shown.map(({ dept, state }) => (
                  <DeptCard key={dept.key} dept={dept} state={state} focus={role !== "all"} />
                ))}
              </div>
            ) : (
              <p className="rounded-[20px] border border-dashed border-white/15 px-5 py-6 text-center text-lg text-white/50">
                Nadie cambia nada en este pie. Solo seguir la escena.
              </p>
            )}

            {held.length > 0 && (
              <p className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/40">
                <span className="text-xs font-bold tracking-widest uppercase">Mantener</span>
                {held.map(({ dept }) => {
                  const Icon = DEPT_ICON[dept.key];
                  return (
                    <span key={dept.key} className="flex items-center gap-1.5">
                      <Icon className="size-4" /> {dept.short}
                    </span>
                  );
                })}
              </p>
            )}
          </div>
        </section>

        <aside className="flex min-h-0 flex-col overflow-y-auto">
          <UpNext index={index} role={role} sceneChanges={!!nextScene && nextScene.index !== scene.index} />
        </aside>
      </main>

      {/* Abajo: rol + navegación */}
      <footer className="flex items-center gap-3">
        <div className="flex h-16 items-center gap-1 rounded-full border border-white/10 bg-neutral-800/60 p-1.5" role="group" aria-label="Mi rol">
          <RoleChip active={role === "all"} onClick={() => setRole("all")}>
            Todos
          </RoleChip>
          {DEPTS.map((d) => {
            const Icon = DEPT_ICON[d.key];
            return (
              <RoleChip key={d.key} active={role === d.key} onClick={() => setRole(d.key)}>
                <Icon className={cn("size-5", role === d.key ? "" : d.accent)} />
                <span className="hidden md:inline">{d.short}</span>
              </RoleChip>
            );
          })}
        </div>

        <button
          type="button"
          onClick={goPrev}
          disabled={index === 0}
          aria-label="Pie anterior"
          className="ml-auto flex h-16 w-20 items-center justify-center rounded-full border border-white/10 bg-neutral-800/70 active:scale-95 disabled:opacity-30"
        >
          <ChevronLeft className="size-8" />
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={index === LAST}
          className="flex h-16 items-center justify-center gap-2 rounded-full bg-white px-10 text-xl font-black text-neutral-900 transition-transform active:scale-95 disabled:opacity-30 lg:w-[320px]"
        >
          {index === LAST ? "Fin de la obra" : "Siguiente"}
          {index !== LAST && <ChevronRight className="size-7" />}
        </button>
      </footer>

      <SceneDrawer
        open={drawer}
        index={index}
        onClose={() => setDrawer(false)}
        onJump={go}
      />
    </div>
  );
}

/** Vista previa de lo que viene. Con un rol elegido, avisa cuándo le toca. */
function UpNext({
  index,
  role,
  sceneChanges,
}: {
  index: number;
  role: Role;
  sceneChanges: boolean;
}) {
  if (index >= LAST) {
    return (
      <div className="rounded-[24px] border border-white/10 bg-neutral-800/40 p-5 text-center">
        <p className="text-2xl font-black">🎭 ¡Telón!</p>
        <p className="text-white/50">Último pie de la obra.</p>
      </div>
    );
  }

  const next = CUES[index + 1];
  const nextScene = sceneOf(index + 1);
  const dept = role === "all" ? null : DEPTS.find((d) => d.key === role)!;
  let myNext = -1;
  if (dept) {
    for (let i = index + 1; i <= LAST; i++) {
      if (deptState(i, dept.key).kind === "action") {
        myNext = i;
        break;
      }
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-[24px] border border-white/10 bg-neutral-800/40 p-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold tracking-[0.2em] text-white/50 uppercase">
          Siguiente · {next.num}
        </span>
        {sceneChanges && (
          <span className="ml-auto rounded-full bg-emerald-400 px-2.5 py-0.5 text-[11px] font-bold text-neutral-900 uppercase">
            Cambio de escena
          </span>
        )}
      </div>
      {sceneChanges && (
        <p className="text-sm font-semibold text-emerald-300">
          {nextScene.block}
        </p>
      )}
      <p className="text-lg leading-snug font-semibold">{next.cue}</p>

      <ul className="flex flex-col gap-1.5">
        {DEPTS.map((d) => {
          const s = deptState(index + 1, d.key);
          if (s.kind !== "action" || (dept && dept.key !== d.key)) return null;
          const Icon = DEPT_ICON[d.key];
          return (
            <li key={d.key} className="flex gap-2 text-sm">
              <Icon className={cn("mt-0.5 size-4 shrink-0", d.accent)} />
              <span className="line-clamp-2 text-white/75">{s.text}</span>
            </li>
          );
        })}
      </ul>

      {/* Si la acción es en el siguiente pie ya aparece arriba; si no, se muestra cuál viene. */}
      {dept && myNext !== index + 1 && (
        <div className={cn("rounded-2xl border px-3 py-2.5", dept.ring, dept.soft)}>
          <p className={cn("text-[11px] font-bold tracking-widest uppercase", dept.accent)}>
            {myNext === -1 ? dept.short : `Luego · pie ${CUES[myNext].num}`}
          </p>
          <p className="text-base font-semibold text-white">
            {myNext === -1 ? "Ya no hay más acciones." : deptState(myNext, dept.key).text}
          </p>
        </div>
      )}
    </div>
  );
}

function RoleChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex h-full items-center gap-2 rounded-full px-4 text-[15px] font-semibold transition-colors",
        active ? "bg-white text-neutral-900" : "text-white/70 hover:bg-white/10",
      )}
    >
      {children}
    </button>
  );
}

function chip(pressed: boolean, className?: string) {
  return cn(
    "flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-[15px] font-medium transition-colors",
    pressed
      ? "border-white bg-white text-neutral-900"
      : "border-white/10 bg-neutral-800/70 text-white/80 hover:bg-neutral-700/70",
    className,
  );
}

/** Mantiene la pantalla encendida (solo funciona en HTTPS o localhost). */
function useWakeLock() {
  useEffect(() => {
    if (!("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    const request = () => {
      if (document.visibilityState === "visible") {
        navigator.wakeLock
          .request("screen")
          .then((l) => (lock = l))
          .catch(() => {});
      }
    };
    request();
    document.addEventListener("visibilitychange", request);
    return () => {
      document.removeEventListener("visibilitychange", request);
      lock?.release().catch(() => {});
    };
  }, []);
}
