import { cn } from "@/lib/cn";
import type { Plan, PlanItem } from "@/lib/plano";

const L = 100;
const R = 900;
const Y_E2 = 60;
const Y_E1 = 270;
const Y_P = 470;
const Y_EDGE = 680;

/** Plano del escenario (vista superior). Reutilizable: recibe los elementos a dibujar. */
export function StagePlan({ plan, className }: { plan: Plan; className?: string }) {
  const open = plan.telon === "abierto";
  const e2Open = plan.e2 === "abierto";
  return (
    <svg viewBox="0 0 1000 720" className={className} role="img" aria-label="Plano del escenario">
      <g fill="none" stroke="currentColor" strokeWidth={3} className="text-white/35">
        {/* E2 y E1 */}
        <rect x={L} y={Y_E2} width={R - L} height={Y_P - Y_E2} rx={6} className="fill-white/[0.03]" />
        {/* Proscenio con borde curvo hacia el público */}
        <path d={`M${L} ${Y_P} L${L} ${Y_P + 40} Q${L + 20} ${Y_EDGE} 500 ${Y_EDGE} Q${R - 20} ${Y_EDGE} ${R} ${Y_P + 40} L${R} ${Y_P}`} className="fill-white/[0.06]" />
      </g>

      {/* Separación E1/E2: cerrada = línea completa y E2 atenuado; abierta = recogida a los lados. */}
      <g className="stroke-white/70" strokeLinecap="round">
        {e2Open ? (
          <>
            <line x1={L} y1={Y_E1} x2={R} y2={Y_E1} strokeWidth={3} strokeDasharray="6 12" className="stroke-white/30" />
            <line x1={L} y1={Y_E1} x2={L + 60} y2={Y_E1} strokeWidth={10} />
            <line x1={R - 60} y1={Y_E1} x2={R} y2={Y_E1} strokeWidth={10} />
          </>
        ) : (
          <line x1={L} y1={Y_E1} x2={R} y2={Y_E1} strokeWidth={4} strokeDasharray="10 8" className="stroke-white/45" />
        )}
      </g>
      <text x={R - 10} y={Y_E1 - 12} textAnchor="end" className="fill-white/50 text-[18px] font-bold tracking-widest">
        {e2Open ? "E2 ABIERTO" : "E2 CERRADO"}
      </text>

      {/* Frente de E1: telón (rojo) o ciclorama con proyección (violeta). */}
      {plan.telon === "ciclorama" ? (
        <>
          <line x1={L} y1={Y_P} x2={R} y2={Y_P} strokeWidth={10} strokeLinecap="round" className="stroke-violet-400" />
          <line x1={L} y1={Y_P} x2={R} y2={Y_P} strokeWidth={3} strokeDasharray="4 10" className="stroke-violet-100" />
          <text x={R - 10} y={Y_P + 34} textAnchor="end" className="fill-violet-300 text-[20px] font-bold tracking-widest">
            CICLORAMA · PROYECCIÓN
          </text>
        </>
      ) : (
        <>
          <g className="stroke-red-400" strokeLinecap="round">
            {open ? (
              <>
                <line x1={L} y1={Y_P} x2={R} y2={Y_P} strokeWidth={3} strokeDasharray="6 12" className="stroke-red-400/40" />
                <line x1={L} y1={Y_P} x2={L + 70} y2={Y_P} strokeWidth={12} />
                <line x1={R - 70} y1={Y_P} x2={R} y2={Y_P} strokeWidth={12} />
              </>
            ) : (
              <line x1={L} y1={Y_P} x2={R} y2={Y_P} strokeWidth={8} />
            )}
          </g>
          <text x={R - 10} y={Y_P + 34} textAnchor="end" className="fill-red-300 text-[20px] font-bold tracking-widest">
            {open ? "TELÓN ABIERTO" : "TELÓN CERRADO"}
          </text>
        </>
      )}

      <g className="fill-white/35 text-[30px] font-black">
        <text x={L + 16} y={Y_E2 + 38}>E2</text>
        <text x={L + 16} y={Y_E1 + 38}>E1</text>
        <text x={500} y={Y_P + 120} textAnchor="middle">P</text>
      </g>
      <g className="fill-white/30 text-[20px] font-semibold tracking-widest" textAnchor="middle">
        <text x={50} y={380} transform="rotate(-90 50 380)">IZQUIERDA</text>
        <text x={950} y={380} transform="rotate(90 950 380)">DERECHA</text>
        <text x={500} y={712}>PÚBLICO</text>
      </g>

      {/* Con E2 cerrado, lo que está en E2 queda atenuado: preparado pero no visible al público. */}
      {plan.items.map((it, i) => (
        <g key={`${it.kind}-${i}`} opacity={!e2Open && bounds(it).y2 <= Y_E1 ? 0.35 : 1}>
          <Item it={it} />
        </g>
      ))}
    </svg>
  );
}

/** Color de cada tipo de objeto: trazo, relleno y texto de la etiqueta. */
const STYLE: Record<PlanItem["kind"], { stroke: string; fill: string; text: string }> = {
  podio: { stroke: "stroke-sky-300", fill: "fill-sky-400/30", text: "fill-sky-200" },
  pupitre: { stroke: "stroke-orange-300", fill: "fill-orange-400/30", text: "fill-orange-200" },
  silla: { stroke: "stroke-teal-300", fill: "fill-teal-400/30", text: "fill-teal-200" },
  colgador: { stroke: "stroke-yellow-300", fill: "fill-yellow-400/40", text: "fill-yellow-200" },
  mesa: { stroke: "stroke-amber-300", fill: "fill-amber-400/25", text: "fill-amber-200" },
  plancha: { stroke: "stroke-rose-300", fill: "fill-rose-400/25", text: "fill-rose-200" },
  cama: { stroke: "stroke-violet-300", fill: "fill-violet-400/30", text: "fill-violet-200" },
  sofa: { stroke: "stroke-emerald-300", fill: "fill-emerald-400/25", text: "fill-emerald-200" },
  colchon: { stroke: "stroke-indigo-300", fill: "fill-indigo-400/30", text: "fill-indigo-200" },
  cortina: { stroke: "stroke-fuchsia-400", fill: "fill-fuchsia-400", text: "fill-fuchsia-200" },
  barra: { stroke: "stroke-lime-400", fill: "fill-lime-400", text: "fill-lime-200" },
  trofeo: { stroke: "stroke-yellow-200", fill: "fill-yellow-400", text: "fill-yellow-200" },
  lampara: { stroke: "stroke-yellow-200", fill: "fill-yellow-300", text: "fill-yellow-100" },
};

/** Caja que ocupa cada objeto, para ubicar su etiqueta. */
function bounds(it: PlanItem) {
  switch (it.kind) {
    case "mesa":
    case "plancha":
    case "colchon":
    case "sofa":
    case "cama":
      return { x1: it.x, y1: it.y, x2: it.x + it.w, y2: it.y + it.h };
    case "cortina":
    case "barra":
    case "lampara":
      return { x1: Math.min(it.x1, it.x2), y1: Math.min(it.y1, it.y2), x2: Math.max(it.x1, it.x2), y2: Math.max(it.y1, it.y2) };
    default: {
      const r = it.kind === "colgador" ? 14 : it.kind === "trofeo" ? 20 : 30;
      return { x1: it.x - r, y1: it.y - r, x2: it.x + r, y2: it.y + r };
    }
  }
}

function Label({ it }: { it: PlanItem }) {
  if (!it.label) return null;
  const b = bounds(it);
  const cx = (b.x1 + b.x2) / 2;
  const cy = (b.y1 + b.y2) / 2;
  const at = it.labelAt ?? "above";
  const pos = {
    above: { x: cx, y: b.y1 - 12, anchor: "middle" },
    below: { x: cx, y: b.y2 + 28, anchor: "middle" },
    left: { x: b.x1 - 12, y: cy + 8, anchor: "end" },
    right: { x: b.x2 + 12, y: cy + 8, anchor: "start" },
  }[at] as { x: number; y: number; anchor: "middle" | "start" | "end" };
  return (
    <text x={pos.x} y={pos.y} textAnchor={pos.anchor} className={cn(STYLE[it.kind].text, "text-[22px] font-bold")}>
      {it.label}
    </text>
  );
}

function Shape({ it }: { it: PlanItem }) {
  const st = STYLE[it.kind];
  switch (it.kind) {
    case "podio":
      return <circle cx={it.x} cy={it.y} r={26} className={cn(st.fill, st.stroke)} strokeWidth={4} />;
    case "pupitre":
      return <rect x={it.x - 28} y={it.y - 30} width={56} height={60} rx={14} className={cn(st.fill, st.stroke)} strokeWidth={4} />;
    case "silla":
      return <ellipse cx={it.x} cy={it.y} rx={38} ry={26} className={cn(st.fill, st.stroke)} strokeWidth={4} />;
    case "colgador":
      return <circle cx={it.x} cy={it.y} r={14} className={cn(st.fill, st.stroke)} strokeWidth={4} />;
    case "trofeo": {
      // Estrella de 5 puntas.
      const pts = Array.from({ length: 10 }, (_, k) => {
        const rad = k % 2 ? 9 : 22;
        const a = (Math.PI / 5) * k - Math.PI / 2;
        return `${it.x + rad * Math.cos(a)},${it.y + rad * Math.sin(a)}`;
      }).join(" ");
      return <polygon points={pts} className={cn(st.fill, st.stroke)} strokeWidth={2} strokeLinejoin="round" />;
    }
    case "mesa":
    case "plancha":
    case "colchon":
    case "sofa":
    case "cama":
      return <rect x={it.x} y={it.y} width={it.w} height={it.h} rx={it.kind === "sofa" ? 18 : 4} className={cn(st.fill, st.stroke)} strokeWidth={5} />;
    case "cortina":
    case "barra":
      return <line x1={it.x1} y1={it.y1} x2={it.x2} y2={it.y2} className={st.stroke} strokeWidth={10} strokeLinecap="round" />;
    case "lampara":
      // Lámpara de pie: poste con foco en (x1,y1).
      return (
        <g>
          <line x1={it.x1} y1={it.y1} x2={it.x2} y2={it.y2} className={st.stroke} strokeWidth={6} strokeLinecap="round" />
          <circle cx={it.x1} cy={it.y1} r={14} className={st.fill} />
        </g>
      );
  }
}

function Item({ it }: { it: PlanItem }) {
  return (
    <g>
      <Shape it={it} />
      <Label it={it} />
    </g>
  );
}
