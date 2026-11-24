import { cn } from "@/lib/cn";
import { ACTS, ACT_KINDS, actOf } from "@/lib/libreto";

interface TimelineProps {
  index: number;
  onJump: (cueIndex: number) => void;
}

const KIND = Object.fromEntries(ACT_KINDS.map((k) => [k.kind, k]));

/** Barra por actos: ancho según cantidad de pies, color según tipo de acto. */
export function Timeline({ index, onJump }: TimelineProps) {
  const current = actOf(index);

  return (
    <div>
      <div className="flex w-full gap-[3px]" role="navigation" aria-label="Línea de tiempo por actos">
        {ACTS.map((a) => {
          const size = a.end - a.start + 1;
          const k = KIND[a.kind];
          const past = a.index < current.index;
          const isCurrent = a.index === current.index;
          const pct = isCurrent ? ((index - a.start + 1) / size) * 100 : 0;
          return (
            <button
              key={a.index}
              type="button"
              title={a.name}
              aria-label={`Ir a ${a.name}`}
              aria-current={isCurrent ? "step" : undefined}
              onClick={() => onJump(a.start)}
              style={{ flexGrow: size }}
              className={cn(
                "@container relative h-9 min-w-2 basis-0 overflow-hidden rounded-lg transition-opacity",
                isCurrent ? "ring-2 ring-white ring-offset-2 ring-offset-black" : past ? "opacity-55" : "opacity-30",
              )}
            >
              <span className={cn("absolute inset-0", k.bar, isCurrent && "opacity-30")} />
              {isCurrent && (
                <span className={cn("absolute inset-y-0 left-0 transition-[width] duration-300", k.fill)} style={{ width: `${pct}%` }} />
              )}
              <span
                className={cn(
                  "relative hidden truncate text-[10px] font-black tracking-tight text-neutral-900 @[1.25rem]:block",
                  isCurrent && "mix-blend-difference text-white",
                )}
              >
                {a.short}
              </span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
