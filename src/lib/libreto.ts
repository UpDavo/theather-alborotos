import data from "@/data/libreto.json";
import escena from "@/data/escena.json";
import actos from "@/data/actos.json";

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

const HOLD = /^(mantener|se mantiene|sin cambio)/i;

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

/** Trama de cada acto: define emoji y color en la línea de tiempo. */
export type Trama = "marco" | "escuela" | "robo" | "tigresa" | "conciencia" | "policia" | "iglesia" | "video";

export const TRAMAS: Record<Trama, { label: string; emoji: string; bar: string; fill: string }> = {
  marco: { label: "Inicio / Final", emoji: "🎭", bar: "bg-sky-500", fill: "bg-sky-300" },
  escuela: { label: "Escuela", emoji: "🏫", bar: "bg-emerald-600", fill: "bg-emerald-300" },
  robo: { label: "Robo", emoji: "💰", bar: "bg-red-600", fill: "bg-red-300" },
  tigresa: { label: "Tigresa", emoji: "🐯", bar: "bg-orange-500", fill: "bg-orange-300" },
  conciencia: { label: "Conciencia", emoji: "😇", bar: "bg-indigo-500", fill: "bg-indigo-300" },
  policia: { label: "Policía", emoji: "🚓", bar: "bg-blue-600", fill: "bg-blue-300" },
  iglesia: { label: "Iglesia", emoji: "⛪", bar: "bg-amber-500", fill: "bg-amber-200" },
  video: { label: "Video", emoji: "📺", bar: "bg-violet-600", fill: "bg-violet-300" },
};

export interface Act {
  index: number;
  /** "ESCENA 8", "PRESENTACIÓN", "VIDEO"… */
  name: string;
  /** Nombre legible: "Robo del trofeo". */
  label: string;
  trama: Trama;
  start: number;
  end: number; // inclusivo
}

const ACT_INFO = actos as Record<string, { trama: Trama; label: string }>;

/** Bloques consecutivos con el mismo acto (ESCENA 8 · …, ESCENA 8 · …) se unen. */
export const ACTS: Act[] = CUES.reduce<Act[]>((acc, cue, i) => {
  const name = cue.block.split(" · ")[0];
  const last = acc.at(-1);
  if (last && last.name === name) {
    last.end = i;
  } else {
    // Nombres repetidos (VIDEO) se distinguen como VIDEO@1, VIDEO@2…
    const n = acc.filter((a) => a.name === name).length + 1;
    const info = ACT_INFO[`${name}@${n}`] ?? ACT_INFO[name] ?? { trama: "marco", label: name };
    acc.push({ index: acc.length, name, label: info.label, trama: info.trama, start: i, end: i });
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

/* ---------- Vistas: Sonido + Luces / Escenario ---------- */

export type ViewKey = "show" | "stage";

export interface ViewInfo {
  key: ViewKey;
  label: string;
  depts: DeptKey[];
}

export const VIEWS: ViewInfo[] = [
  { key: "show", label: "Sonido + Luces", depts: ["sound", "lights"] },
  { key: "stage", label: "Escenario", depts: ["stage"] },
];

/* ---------- Qué hace cada actor ---------- */

export type ActorStatus = "enter" | "leave" | "on";

export interface ActorLine {
  name: string;
  status: ActorStatus;
  /** Fragmentos de la columna ACTORES que lo nombran. */
  does: string[];
}

const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Reparte el texto de ACTORES / UTILERÍA entre las personas en escena. */
export function actorLines(index: number): { people: ActorLine[]; general: string[] } {
  const p = presence(index);
  const parts = CUES[index].actors
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
  const used = new Set<string>();
  const line = (name: string, status: ActorStatus): ActorLine => {
    const key = fold(name);
    const does = parts.filter((s) => fold(s).includes(key));
    does.forEach((s) => used.add(s));
    return { name, status, does };
  };
  const people = [
    ...p.on.map((n) => line(n, p.enter.includes(n) ? "enter" : "on")),
    ...p.leave.map((n) => line(n, "leave")),
  ];
  return { people, general: parts.filter((s) => !used.has(s)) };
}
