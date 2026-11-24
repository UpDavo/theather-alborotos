import { cn } from "@/lib/cn";
import type { MicMap, Presence } from "@/lib/libreto";

function Mic({ n }: { n?: string }) {
  return (
    <span className={cn("rounded-md px-1.5 font-mono text-[13px] font-bold tabular-nums", n ? "bg-white text-neutral-900" : "bg-white/10 text-white/40")}>
      {n ?? "–"}
    </span>
  );
}

/** Actores: quiénes están en escena, con su micrófono. */
export function CastLine({ p, mics }: { p: Presence; mics: MicMap }) {
  if (p.on.length === 0 && p.leave.length === 0) {
    return <p className="text-sm text-white/40">Escenario vacío</p>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {p.on.map((name) => {
        const enters = p.enter.includes(name);
        return (
          <span
            key={name}
            className={cn(
              "flex items-center gap-1.5 rounded-full border py-1 pr-3 pl-1.5 text-sm",
              enters ? "border-emerald-400 bg-emerald-400/15 text-white" : "border-white/15 text-white/80",
            )}
          >
            <Mic n={mics[name]} />
            {name}
            {enters && <span className="text-[10px] font-bold text-emerald-300 uppercase">entra</span>}
          </span>
        );
      })}
      {p.leave.map((name) => (
        <span key={name} className="flex items-center gap-1.5 rounded-full border border-red-400/60 py-1 pr-3 pl-1.5 text-sm text-white/50">
          <Mic n={mics[name]} />
          <span className="line-through">{name}</span>
          <span className="text-[10px] font-bold text-red-300 uppercase">sale</span>
        </span>
      ))}
    </div>
  );
}

/** Sonido: qué micrófonos encender y apagar en este pie. */
export function MicLine({ p, mics }: { p: Presence; mics: MicMap }) {
  if (p.enter.length === 0 && p.leave.length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5">
      {p.enter.length > 0 && <MicRow label="Encender" tone="text-emerald-300" names={p.enter} mics={mics} />}
      {p.leave.length > 0 && <MicRow label="Apagar" tone="text-red-300" names={p.leave} mics={mics} />}
    </div>
  );
}

function MicRow({ label, tone, names, mics }: { label: string; tone: string; names: string[]; mics: MicMap }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className={cn("mr-1 text-xs font-bold tracking-widest whitespace-nowrap uppercase", tone)}>🎤 {label}</span>
      {names.map((name) => (
        <span key={name} className="flex items-center gap-1.5 rounded-full border border-white/15 py-1 pr-3 pl-1.5 text-sm">
          <Mic n={mics[name]} />
          {name}
        </span>
      ))}
    </div>
  );
}

/** Texto corto para la vista "Siguiente". */
export function micSummary(p: Presence, mics: MicMap): string {
  const fmt = (n: string) => (mics[n] ? `${mics[n]} ${n}` : n);
  const parts: string[] = [];
  if (p.enter.length) parts.push(`Encender: ${p.enter.map(fmt).join(", ")}`);
  if (p.leave.length) parts.push(`Apagar: ${p.leave.map(fmt).join(", ")}`);
  return parts.join(" · ");
}
