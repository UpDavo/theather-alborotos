"use client";

import { cn } from "@/lib/cn";
import { CUES, TRAMAS, actOf } from "@/lib/libreto";
import { CloseIcon } from "./icons";

interface NotesDrawerProps {
  open: boolean;
  index: number;
  notes: Record<string, string>;
  onClose: () => void;
  onJump: (cueIndex: number) => void;
  onEdit: (num: string) => void;
}

/** Resumen de todas las notas, agrupadas por acto; tocar una salta a su pie. */
export function NotesDrawer({ open, index, notes, onClose, onJump, onEdit }: NotesDrawerProps) {
  const items = CUES.map((c, i) => ({ c, i })).filter(({ c }) => notes[c.num]);
  // Notas de pies que ya no existen en el libreto (no se borran del dispositivo).
  const orphan = Object.keys(notes).filter((n) => !CUES.some((c) => c.num === n));

  const groups: { act: ReturnType<typeof actOf>; rows: typeof items }[] = [];
  for (const it of items) {
    const act = actOf(it.i);
    const last = groups.at(-1);
    if (last && last.act.index === act.index) last.rows.push(it);
    else groups.push({ act, rows: [it] });
  }

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
          <h2 className="text-lg font-bold">📝 Notas</h2>
          <span className="text-sm text-white/50">{items.length} en el libreto</span>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="ml-auto rounded-full p-2 hover:bg-white/10">
            <CloseIcon className="size-6" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain px-3 pb-10">
          {items.length === 0 && (
            <p className="px-3 py-10 text-center text-white/50">
              Aún no hay notas. Toca “Agregar nota” en cualquier pie para escribir una.
            </p>
          )}

          {groups.map(({ act, rows }) => (
            <section key={act.index} className="mt-4">
              <h3 className="sticky top-0 z-10 flex items-center gap-2 bg-[#1c1c1f] px-2 py-2 text-xs font-bold tracking-widest text-white/60 uppercase">
                <span className={cn("size-2.5 rounded-sm", TRAMAS[act.trama].bar)} />
                {TRAMAS[act.trama].emoji} {act.label}
                <span className="font-normal text-white/35">· {act.name}</span>
              </h3>
              <ul className="flex flex-col gap-1.5">
                {rows.map(({ c, i }) => (
                  <li key={c.id} className={cn("flex items-stretch gap-1 rounded-2xl", i === index ? "bg-white/10 ring-1 ring-white/40" : "bg-white/[0.03]")}>
                    <button
                      type="button"
                      onClick={() => {
                        onJump(i);
                        onClose();
                      }}
                      className="flex flex-1 flex-col gap-1 px-3 py-2.5 text-left hover:bg-white/5 rounded-2xl"
                    >
                      <span className="flex items-baseline gap-2 text-sm text-white/55">
                        <span className="font-mono tabular-nums">Pie {c.num}</span>
                        <span className="truncate">{c.cue}</span>
                      </span>
                      <span className="rounded-lg bg-yellow-300 px-2.5 py-1.5 text-[15px] font-medium whitespace-pre-wrap text-neutral-900">
                        {notes[c.num]}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(c.num)}
                      aria-label={`Editar nota del pie ${c.num}`}
                      className="shrink-0 rounded-2xl px-3 text-sm text-white/50 hover:bg-white/10"
                    >
                      Editar
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {orphan.length > 0 && (
            <section className="mt-6">
              <h3 className="px-2 py-2 text-xs font-bold tracking-widest text-white/40 uppercase">Pies que ya no están en el libreto</h3>
              <ul className="flex flex-col gap-1.5">
                {orphan.map((n) => (
                  <li key={n} className="flex items-center gap-2 rounded-2xl bg-white/[0.03] px-3 py-2.5">
                    <span className="font-mono text-sm text-white/50">Pie {n}</span>
                    <span className="flex-1 text-[15px] whitespace-pre-wrap text-white/70">{notes[n]}</span>
                    <button type="button" onClick={() => onEdit(n)} className="rounded-xl px-2 py-1 text-sm text-white/50 hover:bg-white/10">
                      Editar
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </aside>
    </div>
  );
}
