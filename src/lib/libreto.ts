import data from "@/data/libreto.json";
import escena from "@/data/escena.json";

export type DeptKey = "sound" | "lights" | "stage" | "actors";

export interface Cue {
  id: number;
  num: string;
  block: string;
  cue: string;
  sound: string;
  lights: string;
  stage: string;
  actors: string;
}

export interface Scene {
  index: number;
  block: string;
  /** Parte antes de " · " (ESCENA 3, PRESENTACIÓN, VIDEO…). */
  kicker: string;
  /** Parte después de " · " (ARMANDO EN LA ESCUELA…). */
  name: string;
  start: number;
  end: number; // inclusivo
}

export interface DeptInfo {
  key: DeptKey;
  label: string;
  short: string;
  /** Clases tailwind por departamento. */
  accent: string;
  soft: string;
  ring: string;
  dot: string;
}

export const DEPTS: DeptInfo[] = [
  {
    key: "sound",
    label: "Video / Sonido",
    short: "Sonido",
    accent: "text-violet-300",
    soft: "bg-violet-500/15",
    ring: "border-violet-400/70",
    dot: "bg-violet-400",
  },
  {
    key: "lights",
    label: "Luces",
    short: "Luces",
    accent: "text-amber-300",
    soft: "bg-amber-500/15",
    ring: "border-amber-400/70",
    dot: "bg-amber-400",
  },
  {
    key: "stage",
    label: "Escenario / Telón",
    short: "Escenario",
    accent: "text-sky-300",
    soft: "bg-sky-500/15",
    ring: "border-sky-400/70",
    dot: "bg-sky-400",
  },
  {
    key: "actors",
    label: "Actores / Utilería",
    short: "Actores",
    accent: "text-rose-300",
    soft: "bg-rose-500/15",
    ring: "border-rose-400/70",
    dot: "bg-rose-400",
  },
];

export const TITLE: string = data.title.replace(/\s*·\s*LIBRETO TÉCNICO\s*$/i, "");
export const CUES: Cue[] = data.cues;

export const SCENES: Scene[] = CUES.reduce<Scene[]>((acc, cue, i) => {
  const last = acc.at(-1);
  if (last && last.block === cue.block) {
    last.end = i;
  } else {
    const [head, ...rest] = cue.block.split(" · ");
    const kicker = rest.length ? head : "Bloque";
    const name = rest.length ? rest.join(" · ") : head;
    acc.push({ index: acc.length, block: cue.block, kicker, name, start: i, end: i });
  }
  return acc;
}, []);

const SCENE_OF: number[] = CUES.map((_, i) => SCENES.findIndex((s) => i >= s.start && i <= s.end));

export function sceneOf(cueIndex: number): Scene {
  return SCENES[SCENE_OF[cueIndex]];
}

export type ChangeKind = "action" | "hold";

export interface DeptState {
  kind: ChangeKind;
  text: string;
  optional: boolean;
  pending: boolean;
}

const HOLD = /^(mantener|sin cambio)/i;

/** Decide si un departamento tiene que hacer algo en este pie o solo mantener. */
export function deptState(index: number, key: DeptKey): DeptState {
  const text = CUES[index][key];
  const prev = index > 0 ? CUES[index - 1][key] : null;
  const textHold = !text || HOLD.test(text) || (prev !== null && text === prev);
  // Sonido (micrófonos) y Actores también actúan si alguien entra o sale de escena.
  const { enter, leave } = presence(index);
  const castChange = (key === "sound" || key === "actors") && enter.length + leave.length > 0;
  const hold = textHold && !castChange;
  return {
    kind: hold ? "hold" : "action",
    text,
    optional: /opcional/i.test(text),
    pending: /confirmar/i.test(text),
  };
}

export function actionCount(index: number): number {
  return DEPTS.filter((d) => deptState(index, d.key).kind === "action").length;
}

/** Tipo de acto: define el color en la línea de tiempo. */
export type ActKind = "escena" | "presentacion" | "video" | "concierto" | "marco";

export interface Act {
  index: number;
  /** "ESCENA 8", "PRESENTACIÓN", "VIDEO"… */
  name: string;
  /** Etiqueta corta para la barra: "E8", "PRES.", "VIDEO"… */
  short: string;
  kind: ActKind;
  start: number;
  end: number; // inclusivo
}

export const ACT_KINDS: { kind: ActKind; label: string; bar: string; fill: string; text: string }[] = [
  { kind: "marco", label: "Apertura / Final", bar: "bg-sky-400", fill: "bg-sky-400", text: "text-sky-300" },
  { kind: "escena", label: "Escena", bar: "bg-neutral-300", fill: "bg-white", text: "text-white" },
  { kind: "presentacion", label: "Presentación", bar: "bg-emerald-400", fill: "bg-emerald-400", text: "text-emerald-300" },
  { kind: "video", label: "Video", bar: "bg-violet-400", fill: "bg-violet-400", text: "text-violet-300" },
  { kind: "concierto", label: "Concierto", bar: "bg-amber-400", fill: "bg-amber-400", text: "text-amber-300" },
];

function actKind(name: string): ActKind {
  if (name.startsWith("PRESENTACIÓN")) return "presentacion";
  if (name.startsWith("VIDEO")) return "video";
  if (name.startsWith("CONCIERTO")) return "concierto";
  if (name.startsWith("ESCENA")) return "escena";
  return "marco";
}

function actShort(name: string): string {
  const m = name.match(/^ESCENA\s+(\S+)/);
  if (m) return `E${m[1]}`;
  if (name.startsWith("PRESENTACIÓN")) return "PRES.";
  if (name.startsWith("CONCIERTO")) return "CONC.";
  if (name.startsWith("APERTURA")) return "INICIO";
  return name;
}

/** Bloques consecutivos con el mismo acto (ESCENA 8 · …, ESCENA 8 · …) se unen. */
export const ACTS: Act[] = CUES.reduce<Act[]>((acc, cue, i) => {
  const name = cue.block.split(" · ")[0];
  const last = acc.at(-1);
  if (last && last.name === name) {
    last.end = i;
  } else {
    acc.push({ index: acc.length, name, short: actShort(name), kind: actKind(name), start: i, end: i });
  }
  return acc;
}, []);

export function actOf(cueIndex: number): Act {
  return ACTS.find((a) => cueIndex >= a.start && cueIndex <= a.end)!;
}

/* ---------- Personas en escena y micrófonos ---------- */

const PRESENCE: string[][] = CUES.map((c) => (escena as Record<string, string[]>)[c.num] ?? []);

/** Todas las personas/grupos en orden de aparición. */
export const CAST: string[] = [...new Set(PRESENCE.flat())];

export interface Presence {
  /** Quiénes están en escena durante este pie. */
  on: string[];
  /** Entran en este pie (encender mic). */
  enter: string[];
  /** Salen en este pie (apagar mic). */
  leave: string[];
}

export function presence(index: number): Presence {
  const on = PRESENCE[index];
  const before = index > 0 ? PRESENCE[index - 1] : [];
  return {
    on,
    enter: on.filter((p) => !before.includes(p)),
    leave: before.filter((p) => !on.includes(p)),
  };
}

/** Número de micrófono por persona (lo anota el equipo en la app). */
export type MicMap = Record<string, string>;
