import { cn } from "@/lib/cn";
import { ACTS, TRAMAS, actOf } from "@/lib/libreto";

interface TimelineProps {
  index: number;
  onJump: (cueIndex: number) => void;
}

/** Barra por actos: ancho según cantidad de pies, color y emoji según la trama. */
export function Timeline({ index, onJump }: TimelineProps) {
  const current = actOf(index);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex w-full gap-[3px]" role="navigation" aria-label="Línea de tiempo por actos">
        {ACTS.map((a) => {
          const size = a.end - a.start + 1;
          const t = TRAMAS[a.trama];
          const past = a.index < current.index;
          const isCurrent = a.index === current.index;
          const pct = isCurrent ? ((index - a.start + 1) / size) * 100 : 0;
          return (
            <button
              key={a.index}
              type="button"
              title={`${t.emoji} ${a.label}`}
              aria-label={`Ir a ${a.label}`}
              aria-current={isCurrent ? "step" : undefined}
              onClick={() => onJump(a.start)}
              style={{ flexGrow: isCurrent ? size + 10 : size }}
              className={cn(
                "@container relative flex h-10 min-w-7 basis-0 transition-[flex-grow] duration-300 items-center justify-center overflow-hidden rounded-lg",
                t.bar,
                isCurrent ? "ring-2 ring-white ring-offset-2 ring-offset-black" : past ? "opacity-40" : "opacity-80",
              )}
            >
              {isCurrent && (
                <span className={cn("absolute inset-y-0 left-0 transition-[width] duration-300", t.fill)} style={{ width: `${pct}%` }} />
              )}
              <span className="relative flex min-w-0 items-center gap-1 px-1 text-[11px] leading-none font-bold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
                <span className="text-[15px]">{t.emoji}</span>
                <span className={cn("truncate", isCurrent ? "block" : "hidden @[5.5rem]:block")}>{a.label}</span>
              </span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
