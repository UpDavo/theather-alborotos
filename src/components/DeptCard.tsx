import { cn } from "@/lib/cn";
import type { DeptInfo, DeptState } from "@/lib/libreto";
import { DEPT_ICON } from "./icons";

interface DeptCardProps {
  dept: DeptInfo;
  state: DeptState;
  /** Vista de un solo rol: texto más grande. */
  focus?: boolean;
  /** Contenido extra (micrófonos, personas en escena). */
  children?: React.ReactNode;
}

export function DeptCard({ dept, state, focus, children }: DeptCardProps) {
  const Icon = DEPT_ICON[dept.key];
  const action = state.kind === "action";

  return (
    <div className={cn("flex flex-col gap-2 rounded-[22px] border px-4 py-3.5", action ? cn(dept.soft, dept.ring) : "border-white/10 bg-neutral-800/50")}>
      <div className="flex items-center gap-2">
        <Icon className={cn("size-5 shrink-0", action ? dept.accent : "text-white/40")} />
        <span className={cn("text-sm font-semibold tracking-wide uppercase", action ? dept.accent : "text-white/50")}>{dept.label}</span>
        <span className="ml-auto flex gap-1.5">
          {state.pending && <Tag className="bg-yellow-400 text-neutral-900">Por confirmar</Tag>}
          {state.optional && <Tag className="border border-white/30 text-white/70">Opcional</Tag>}
          {!action && !/^(mantener|sin cambio)/i.test(state.text) && <Tag className="bg-white/10 text-white/50">Mantener</Tag>}
        </span>
      </div>
      {(state.text || !children) && (
      <p
          className={cn(
            "leading-snug text-balance",
            focus ? "text-3xl lg:text-4xl" : "text-xl lg:text-2xl",
            action ? "font-semibold text-white" : "text-white/45",
          )}
        >
          {state.text || "Nada que hacer en este pie"}
        </p>
      )}
      {children}
    </div>
  );
}

function Tag({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide whitespace-nowrap uppercase", className)}>
      {children}
    </span>
  );
}
