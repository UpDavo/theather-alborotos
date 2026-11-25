import { cn } from "@/lib/cn";
import type { ActorLine, MicMap, Presence } from "@/lib/libreto";

function Mic({ n }: { n?: string }) {
  return (
    <span className={cn("rounded-md px-1.5 font-mono text-[13px] font-bold tabular-nums", n ? "bg-white text-neutral-900" : "bg-white/10 text-white/40")}>
      {n ?? "–"}
    </span>
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

const STATUS = {
  enter: { label: "Entra", cls: "bg-emerald-400 text-neutral-900", ring: "border-emerald-400/60" },
  leave: { label: "Sale", cls: "bg-red-400 text-neutral-900", ring: "border-red-400/50" },
  on: { label: "En escena", cls: "bg-white/10 text-white/60", ring: "border-white/10" },
} as const;

/** Tarjeta fija del lateral: cada actor con su micrófono y lo que hace en este pie. */
export function ActorsCard({
  lines,
  general,
  mics,
  onEditMic,
}: {
  lines: ActorLine[];
  general: string[];
  mics: MicMap;
  onEditMic?: (name: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5 rounded-[24px] border border-rose-400/40 bg-rose-500/10 p-4">
      <p className="text-xs font-bold tracking-[0.2em] text-rose-300 uppercase">Actores</p>
      {general.map((g) => (
        <p key={g} className="text-sm leading-snug text-white/75">
          {g}
        </p>
      ))}
      {lines.length === 0 ? (
        <p className="text-sm text-white/40">Escenario vacío</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {lines.map(({ name, status, does }) => {
            const s = STATUS[status];
            return (
              <li key={name} className={cn("flex flex-col gap-1 rounded-2xl border px-3 py-2", s.ring, status === "leave" && "opacity-70")}>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => onEditMic?.(name)} className="active:scale-95" aria-label={`Micrófono de ${name}`}>
                    <Mic n={mics[name]} />
                  </button>
                  <span className={cn("text-[15px] font-semibold", status === "leave" && "line-through")}>{name}</span>
                  <span className={cn("ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", s.cls)}>{s.label}</span>
                </div>
                {does.map((d) => (
                  <p key={d} className="text-sm leading-snug text-white/70">
                    {d}
                  </p>
                ))}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
