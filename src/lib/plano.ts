import { CUES } from "./libreto";

/**
 * Plano del escenario visto desde arriba (público abajo).
 * Coordenadas en el viewBox de <StagePlan>: x 0–1000, y 0–720.
 *   E2 (fondo)  y  60–270
 *   E1          y 270–470
 *   P (proscenio, borde curvo) y 470–680
 * Izquierda/derecha = como lo ve el público.
 */
type LabelAt = "above" | "below" | "left" | "right";
interface Base {
  label?: string;
  /** Dónde va la etiqueta respecto al objeto (por defecto arriba). */
  labelAt?: LabelAt;
}

export type PlanItem = Base &
  (
    /** Objeto puntual centrado en (x,y). */
    | { kind: "podio" | "pupitre" | "silla" | "colgador" | "trofeo"; x: number; y: number }
    /** Objeto rectangular con esquina superior izquierda (x,y). */
    | { kind: "mesa" | "plancha" | "colchon" | "sofa" | "cama"; x: number; y: number; w: number; h: number }
    /** Objeto lineal de (x1,y1) a (x2,y2). En la lámpara, (x1,y1) es el foco. */
    | { kind: "cortina" | "barra" | "lampara"; x1: number; y1: number; x2: number; y2: number }
  );

/* Escuela de ballet (E1): cortina inclinada a la izquierda y barra de ballet al centro. */
const CORTINA: PlanItem = { kind: "cortina", x1: 170, y1: 358, x2: 264, y2: 305, label: "Cortina" };
const BARRA: PlanItem = { kind: "barra", x1: 361, y1: 329, x2: 665, y2: 329, label: "Barra de ballet" };
const BALLET: PlanItem[] = [CORTINA, BARRA];

/* Escuela directora (E1): mesa de la directora a la izquierda, pupitre a la derecha. */
const MESA: PlanItem = { kind: "mesa", x: 151, y: 346, w: 136, h: 67, label: "Mesa directora" };
const PUPITRE: PlanItem = { kind: "pupitre", x: 792, y: 364, label: "Pupitre" };
const ESCUELA_DIRECTORA: PlanItem[] = [MESA, PUPITRE];

/* Recámara (E2), pies 30–49. */
const RECAMARA: PlanItem[] = [
  { kind: "plancha", x: 360, y: 168, w: 188, h: 31, label: "Mesa de plancha" },
  { kind: "colgador", x: 573, y: 245, label: "Colgador", labelAt: "left" },
  { kind: "cortina", x1: 679, y1: 95, x2: 836, y2: 117, label: "Cortina" },
  { kind: "cama", x: 640, y: 165, w: 105, h: 55, label: "Cama", labelAt: "left" },
  // Lámpara a la derecha de la cama, entre la cama y el colchón.
  { kind: "lampara", x1: 770, y1: 150, x2: 770, y2: 215, label: "Lámpara" },
  { kind: "colchon", x: 795, y: 170, w: 80, h: 43, label: "Colchón" },
];

/* Mesa con el trofeo en la esquina izquierda del proscenio, pies 61–69. */
const MESA_TROFEO: PlanItem[] = [
  { kind: "mesa", x: 122, y: 488, w: 110, h: 50, label: "Mesa con trofeo", labelAt: "below" },
  { kind: "trofeo", x: 177, y: 513 },
];

/* Aula del robo (E1), pies 71–91: lámpara izquierda, silla y mesa al centro, cortina derecha. */
const AULA_ROBO: PlanItem[] = [
  { kind: "lampara", x1: 180, y1: 300, x2: 180, y2: 370, label: "Lámpara", labelAt: "right" },
  { kind: "silla", x: 440, y: 311, label: "Silla", labelAt: "right" },
  { kind: "mesa", x: 340, y: 362, w: 160, h: 56, label: "Mesa", labelAt: "right" },
  { kind: "cortina", x1: 672, y1: 299, x2: 858, y2: 328, label: "Cortina" },
];

/* Parque en el proscenio, pies 71–77: sofá a la izquierda, porta sombrero a la derecha. */
const SOFA: PlanItem = { kind: "sofa", x: 114, y: 492, w: 156, h: 56, label: "Sofá", labelAt: "below" };
const PARQUE: PlanItem[] = [SOFA, { kind: "colgador", x: 817, y: 542, label: "Porta sombrero", labelAt: "below" }];

/* E1, pies 92–106: cortina inclinada a la izquierda, silla y mesa a la derecha. */
const E1_CAPTURA: PlanItem[] = [
  { kind: "cortina", x1: 120, y1: 360, x2: 260, y2: 314, label: "Cortina", labelAt: "right" },
  { kind: "silla", x: 739, y: 300, label: "Silla", labelAt: "left" },
  { kind: "mesa", x: 657, y: 330, w: 159, h: 78, label: "Mesa", labelAt: "below" },
];

export type Telon = "abierto" | "cerrado";
/** Frente de E1: telón abierto/cerrado, o ciclorama bajado con proyección. */
export type Frente = Telon | "ciclorama";

/** Estado del escenario en un pie: telón (línea roja entre E1 y P) y elementos. */
export interface Plan {
  telon: Frente;
  /** Separación entre E1 y E2 (línea punteada). Por defecto cerrada: E2 no se ve. */
  e2?: Telon;
  items: PlanItem[];
}

/**
 * Cada clave es el pie donde el escenario cambia. Un pie sin clave
 * hereda el plano del último pie definido antes de él.
 */
const KEYFRAMES: Record<string, Plan> = {
  "1": { telon: "cerrado", items: [...BALLET, { kind: "podio", x: 760, y: 530, label: "Podio" }] },
  "3": { telon: "cerrado", items: BALLET },
  "9": { telon: "abierto", items: BALLET },
  // Escenario despejado: se va la cortina, queda la barra.
  "19": { telon: "abierto", items: [BARRA] },
  // Se cierra el telón (escena en proscenio) y se retira la barra.
  "26": { telon: "cerrado", items: [] },
  "27": { telon: "cerrado", items: ESCUELA_DIRECTORA },
  "29": { telon: "abierto", items: ESCUELA_DIRECTORA },
  "30": { telon: "abierto", items: [...ESCUELA_DIRECTORA, ...RECAMARA] },
  "36": { telon: "cerrado", items: [...ESCUELA_DIRECTORA, ...RECAMARA] },
  // Ciclorama con proyección del hospital (no telón).
  "37": { telon: "ciclorama", items: [...ESCUELA_DIRECTORA, ...RECAMARA] },
  "38": { telon: "ciclorama", items: RECAMARA },
  // Se levanta el ciclorama y al mismo tiempo se abre E2 (Recámara).
  "41": { telon: "abierto", e2: "abierto", items: RECAMARA },
  "49": { telon: "cerrado", e2: "abierto", items: RECAMARA },
  "50": { telon: "cerrado", items: [] },
  "59": { telon: "abierto", items: [] },
  "61": { telon: "abierto", items: MESA_TROFEO },
  // Se saca la mesa con el trofeo.
  "70": { telon: "cerrado", items: [] },
  // Aula del robo armada detrás.
  "71": { telon: "cerrado", items: [...AULA_ROBO, ...PARQUE] },
  // Se retira el porta sombrero; el sofá sigue hasta el 83.
  "78": { telon: "cerrado", items: [...AULA_ROBO, SOFA] },
  // «Levantar ciclorama; revelar Escenario 2».
  "83": { telon: "abierto", items: [...AULA_ROBO, SOFA] },
  // Se retira el sofá y recién aquí se pone el trofeo en su mesa del proscenio.
  "84": { telon: "abierto", items: [...AULA_ROBO, ...MESA_TROFEO] },
  // Los ladrones se llevan el trofeo.
  "91": { telon: "abierto", items: AULA_ROBO },
  "92": { telon: "cerrado", items: E1_CAPTURA },
  "105": { telon: "abierto", items: E1_CAPTURA },
  // Pendiente de dibujar desde aquí.
  "107": { telon: "cerrado", items: [] },
  // Se abre el telón con el escenario despejado (no en proscenio).
  "120": { telon: "abierto", items: [] },
  "135": { telon: "cerrado", items: [] },
};

const EMPTY: Plan = { telon: "cerrado", items: [] };

const PLANS: Plan[] = CUES.reduce<Plan[]>((acc, cue) => {
  acc.push(KEYFRAMES[cue.num] ?? acc.at(-1) ?? EMPTY);
  return acc;
}, []);

export function planOf(index: number): Plan {
  return PLANS[index] ?? EMPTY;
}
