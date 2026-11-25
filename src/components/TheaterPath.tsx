"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { usePersisted } from "@/lib/persisted";
import {
  CUES,
  DEPTS,
  TITLE,
  VIEWS,
  actorLines,
  deptState,
  presence,
  sceneOf,
  type DeptKey,
  type MicMap,
  type ViewKey,
} from "@/lib/libreto";
import { useMics, useNotes } from "@/lib/mics";
import { ActorsCard, MicLine, micSummary } from "./Cast";
import { DeptCard } from "./DeptCard";
import { StagePlan } from "./StagePlan";
import { planOf } from "@/lib/plano";
import { MicPanel } from "./MicPanel";
import { NotesDrawer } from "./NotesDrawer";
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
const deptsOf = (view: ViewKey) => VIEWS.find((v) => v.key === view)?.depts ?? VIEWS[0].depts;

export function TheaterPath() {
  const [stored, setIndex] = usePersisted<number>("tp:index", 0);
  const [storedView, setView] = usePersisted<ViewKey>("tp:view", "show");
  const view: ViewKey = VIEWS.some((v) => v.key === storedView) ? storedView : "show";
  const viewDepts = deptsOf(view);
  const [drawer, setDrawer] = useState(false);
  const [micOpen, setMicOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const { mics, setMic, replaceAll } = useMics();
  const { notes, setNote, replaceNotes } = useNotes();
  const editMic = (name: string) => {
    const v = window.prompt(`Micrófono de ${name}:`, mics[name] ?? "");
    if (v !== null) setMic(name, v);
  };
  const editNote = (num: string = cue.num) => {
    const v = window.prompt(`Nota para el pie ${num}:`, notes[num] ?? "");
    if (v !== null) setNote(num, v);
  };
  const noteCount = Object.keys(notes).length;
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
      if (drawer || micOpen || notesOpen) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
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
  }, [goNext, goPrev, drawer, micOpen, notesOpen]);

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
  const cast = presence(index);
  const actors = actorLines(index);
  // Cada vista muestra siempre sus áreas (las que solo mantienen, atenuadas).
  const shown = DEPTS.filter((d) => viewDepts.includes(d.key)).map((d) => ({ dept: d, state: deptState(index, d.key) }));
  const cols = shown.length === 2 ? "md:grid-cols-2" : "";

  return (
    <div className="flex h-dvh flex-col gap-3 overflow-hidden px-4 pt-[max(env(safe-area-inset-top),12px)] pb-[max(env(safe-area-inset-bottom),12px)] select-none md:px-6">
      <header className="flex items-center gap-3">
        <h1 className="truncate text-base font-bold tracking-tight">{TITLE}</h1>
        <span className="text-sm whitespace-nowrap text-white/45 tabular-nums">
          Pie {index + 1}/{CUES.length} · {Math.round(progress)}%
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button type="button" onClick={() => setMicOpen(true)} className={chip(false, "h-10")}>
            🎤 Micrófonos
          </button>
          <button type="button" onClick={() => setNotesOpen(true)} className={chip(false, "h-10")}>
            📝 Notas
            {noteCount > 0 && (
              <span className="rounded-full bg-yellow-300 px-1.5 text-xs font-bold text-neutral-900 tabular-nums">{noteCount}</span>
            )}
          </button>
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
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onPointerUp={(e) => e.stopPropagation()}
                onClick={() => editNote()}
                className={cn(
                  "mt-3 flex max-w-full items-start gap-2 rounded-2xl px-3 py-2 text-left text-base",
                  notes[cue.num] ? "bg-yellow-300 text-neutral-900" : "border border-dashed border-white/20 text-white/45",
                )}
              >
                <span>📝</span>
                <span className="whitespace-pre-wrap">{notes[cue.num] ?? "Agregar nota"}</span>
              </button>
            </div>

            {view === "stage" ? (
              <div className="flex min-h-0 flex-1 gap-4">
                <StagePlan plan={planOf(index)} className="min-h-0 min-w-0 flex-1 self-stretch" />
                <div className="flex w-[34%] max-w-sm shrink-0 flex-col gap-2 overflow-y-auto">
                  {shown.map(({ dept, state }) => (
                    <StageHint key={dept.key} dept={dept} state={state} />
                  ))}
                </div>
              </div>
            ) : (
              <div className={cn("grid min-h-0 grid-cols-1 content-start gap-3 overflow-y-auto", cols)}>
                {shown.map(({ dept, state }) => (
                  <DeptCard key={dept.key} dept={dept} state={state}>
                    {dept.key === "sound" && (cast.enter.length > 0 || cast.leave.length > 0) && <MicLine p={cast} mics={mics} />}
                  </DeptCard>
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className="flex min-h-0 flex-col gap-3 overflow-y-auto">
          <UpNext index={index} view={view} mics={mics} sceneChanges={!!nextScene && nextScene.index !== scene.index} />
          <ActorsCard lines={actors.people} general={actors.general} mics={mics} onEditMic={editMic} />
        </aside>
      </main>

      {/* Abajo: rol + navegación */}
      <footer className="flex items-center gap-3">
        <div className="flex h-16 items-center gap-1 rounded-full border border-white/10 bg-neutral-800/60 p-1.5" role="group" aria-label="Vista">
          {VIEWS.map((v) => (
            <RoleChip key={v.key} active={view === v.key} onClick={() => setView(v.key)}>
              {v.depts.map((k) => {
                const Icon = DEPT_ICON[k];
                const d = DEPTS.find((x) => x.key === k)!;
                return <Icon key={k} className={cn("size-5", view === v.key ? "" : d.accent)} />;
              })}
              <span className="hidden md:inline">{v.label}</span>
            </RoleChip>
          ))}
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

      <MicPanel open={micOpen} mics={mics} onChange={setMic} onReplace={replaceAll} notes={notes} onReplaceNotes={replaceNotes} onClose={() => setMicOpen(false)} />
      <NotesDrawer
        open={notesOpen}
        index={index}
        notes={notes}
        onClose={() => setNotesOpen(false)}
        onJump={go}
        onEdit={editNote}
      />
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
  view,
  mics,
  sceneChanges,
}: {
  index: number;
  view: ViewKey;
  mics: MicMap;
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
  const keys = deptsOf(view);
  const depts = DEPTS.filter((d) => keys.includes(d.key));
  const acts = (i: number) => depts.some((d) => deptState(i, d.key).kind === "action");
  let myNext = -1;
  for (let i = index + 1; i <= LAST; i++) {
    if (acts(i)) {
      myNext = i;
      break;
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
        {depts.map((d) => {
          const s = deptState(index + 1, d.key);
          if (s.kind !== "action") return null;
          const Icon = DEPT_ICON[d.key];
          return (
            <li key={d.key} className="flex gap-2 text-sm">
              <Icon className={cn("mt-0.5 size-4 shrink-0", d.accent)} />
              <span className="line-clamp-2 text-white/75">{actionText(index + 1, d.key, mics)}</span>
            </li>
          );
        })}
      </ul>

      {/* Si la acción es en el siguiente pie ya aparece arriba; si no, se muestra cuál viene. */}
      {myNext !== index + 1 && (
        <div className="rounded-2xl border border-white/15 bg-white/5 px-3 py-2.5">
          <p className="text-[11px] font-bold tracking-widest text-white/60 uppercase">
            {myNext === -1 ? "Sin más acciones" : `Luego · pie ${CUES[myNext].num}`}
          </p>
          {myNext !== -1 && (
            <ul className="flex flex-col gap-1">
              {depts.map((d) => {
                if (deptState(myNext, d.key).kind !== "action") return null;
                const Icon = DEPT_ICON[d.key];
                return (
                  <li key={d.key} className="flex gap-2 text-base font-semibold text-white">
                    <Icon className={cn("mt-1 size-4 shrink-0", d.accent)} />
                    <span>{actionText(myNext, d.key, mics)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/** Indicación de escenario en una línea, encima del plano. */
function StageHint({ dept, state }: { dept: (typeof DEPTS)[number]; state: ReturnType<typeof deptState> }) {
  const Icon = DEPT_ICON[dept.key];
  const action = state.kind === "action";
  return (
    <div className={cn("flex items-start gap-2 rounded-2xl border px-3 py-2", action ? cn(dept.soft, dept.ring) : "border-white/10 bg-neutral-800/50")}>
      <Icon className={cn("mt-0.5 size-5 shrink-0", action ? dept.accent : "text-white/40")} />
      <p className={cn("text-lg leading-snug", action ? "font-semibold text-white" : "text-white/45")}>
        {state.text || "Sin cambio"}
        {!action && <span className="ml-2 text-xs font-bold tracking-wide text-white/40 uppercase">Mantener</span>}
      </p>
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

/** Texto de la acción de un área; en sonido suma qué micrófonos encender/apagar. */
function actionText(i: number, key: DeptKey, mics: MicMap): string {
  const text = deptState(i, key).text;
  if (key !== "sound") return text;
  return [text, micSummary(presence(i), mics)].filter(Boolean).join(" · ");
}
