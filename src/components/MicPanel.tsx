"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { CAST, type MicMap } from "@/lib/libreto";
import { CloseIcon } from "./icons";

interface MicPanelProps {
  open: boolean;
  mics: MicMap;
  onChange: (name: string, value: string) => void;
  onReplace: (map: MicMap) => void;
  notes: MicMap;
  onReplaceNotes: (map: MicMap) => void;
  onClose: () => void;
}

/** Lista del elenco para anotar el número de micrófono de cada uno. */
export function MicPanel({ open, mics, onChange, onReplace, notes, onReplaceNotes, onClose }: MicPanelProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(JSON.stringify({ mics, notes }, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const paste = () => {
    const text = window.prompt("Pega aquí los micrófonos y notas copiados desde otro dispositivo:");
    if (!text) return;
    try {
      const data = JSON.parse(text) as { mics?: MicMap; notes?: MicMap } & MicMap;
      if (data.mics || data.notes) {
        if (data.mics) onReplace(data.mics);
        if (data.notes) onReplaceNotes(data.notes);
      } else {
        onReplace(data);
      }
    } catch {
      window.alert("El texto no es una lista válida.");
    }
  };

  return (
    <div className={cn("fixed inset-0 z-40 transition-opacity", open ? "opacity-100" : "pointer-events-none opacity-0")}>
      <button type="button" aria-label="Cerrar" onClick={onClose} className="absolute inset-0 bg-black/60" />
      <aside
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-white/10 bg-[#1c1c1f] transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-bold">🎤 Micrófonos</h2>
          <span className="text-sm text-white/50">{Object.keys(mics).length} asignados</span>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="ml-auto rounded-full p-2 hover:bg-white/10">
            <CloseIcon className="size-6" />
          </button>
        </header>

        <ul className="flex-1 overflow-y-auto overscroll-contain px-3 py-3 select-text">
          {CAST.map((name) => (
            <li key={name} className="flex items-center gap-3 rounded-2xl px-2 py-1.5">
              <span className="flex-1 text-[16px]">{name}</span>
              <input
                type="text"
                inputMode="numeric"
                enterKeyHint="next"
                placeholder="–"
                aria-label={`Micrófono de ${name}`}
                value={mics[name] ?? ""}
                onChange={(e) => onChange(name, e.target.value)}
                className="h-11 w-20 rounded-xl border border-white/15 bg-black/40 text-center font-mono text-lg font-bold outline-none focus:border-white"
              />
            </li>
          ))}
        </ul>

        <footer className="flex gap-2 border-t border-white/10 px-5 py-4 text-sm">
          <p className="flex-1 text-white/40">Se guarda en este dispositivo. Copiar incluye las notas.</p>
          <button type="button" onClick={paste} className="rounded-full border border-white/15 px-4 py-2 hover:bg-white/10">
            Pegar
          </button>
          <button type="button" onClick={copy} className="rounded-full bg-white px-4 py-2 font-semibold text-neutral-900">
            {copied ? "¡Copiado!" : "Copiar"}
          </button>
        </footer>
      </aside>
    </div>
  );
}
