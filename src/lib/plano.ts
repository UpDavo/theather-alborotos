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

/* Mesa con el trofeo en la esquina izquierda del proscenio, a la vista del público. */
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

/* Parque en el proscenio, pies 70–82: banco (Cynthia) a la izquierda, mesita con sombrerito (salsa) a la derecha. */
const BANCO: PlanItem = { kind: "sofa", x: 114, y: 492, w: 156, h: 56, label: "Banco", labelAt: "below" };
const MESITA: PlanItem = { kind: "colgador", x: 817, y: 542, label: "Mesita con sombrerito", labelAt: "below" };
const PARQUE: PlanItem[] = [BANCO, MESITA];
/* Silla de Lucho a la derecha del proscenio (chiste del BONG), pies 78–82. */
const SILLA_LUCHO: PlanItem = { kind: "silla", x: 660, y: 545, label: "Silla Lucho", labelAt: "below" };

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
  // Baja el ciclorama con la imagen del hospital (no telón).
  "36": { telon: "ciclorama", items: [...ESCUELA_DIRECTORA, ...RECAMARA] },
  // Ciclorama con proyección del hospital (no telón).
  "37": { telon: "ciclorama", items: [...ESCUELA_DIRECTORA, ...RECAMARA] },
  "38": { telon: "ciclorama", items: RECAMARA },
  // Se levanta el ciclorama y al mismo tiempo se abre E2 (Recámara).
  "41": { telon: "abierto", e2: "abierto", items: RECAMARA },
  "49": { telon: "cerrado", e2: "abierto", items: RECAMARA },
  // Blackout: baja el ciclorama (voces en off, noticiero, foto de comisaría).
  "50": { telon: "ciclorama", items: [] },
  // En el blackout del 58 sale el trofeo; la escuela abre con el trofeo cerca del público.
  "59": { telon: "abierto", items: MESA_TROFEO },
  // Antes de bajar el ciclorama: banco y mesita al proscenio, se quita el trofeo.
  "70": { telon: "ciclorama", items: PARQUE },
  // Parque de día / noche proyectado; el aula del robo se arma detrás.
  "71": { telon: "ciclorama", items: [...AULA_ROBO, ...PARQUE] },
  // Garaje de ladrones: sale la mesita con sombrerito; la silla de Lucho ya está a la derecha.
  "78": { telon: "ciclorama", items: [...AULA_ROBO, BANCO, SILLA_LUCHO] },
  // Blackout: vuelve el trofeo, salen banco y silla; sube el ciclorama con el flashback.
  "83": { telon: "abierto", items: [...AULA_ROBO, ...MESA_TROFEO] },
  // Blackout: se van con el trofeo y baja el ciclorama (llamada, piscina, policía).
  "91": { telon: "ciclorama", items: AULA_ROBO },
  "92": { telon: "ciclorama", items: E1_CAPTURA },
  "97": { telon: "cerrado", items: E1_CAPTURA },
  // Se abre el telón: Escenario 2, escena de Karin y Padre Jorge.
  "105": { telon: "abierto", items: E1_CAPTURA },
  // Ciclorama: video de la cárcel, fondo del patio con la iglesia (109–115), video del Padre (116).
  "107": { telon: "ciclorama", items: [] },
  // Proscenio con telón de boca cerrado: Paula y Karin presentan a Los Padrecitos.
  "120": { telon: "cerrado", items: [] },
  // Se abre el telón al Escenario 2 despejado; queda abierto hasta la despedida.
  "121": { telon: "abierto", items: [] },
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
