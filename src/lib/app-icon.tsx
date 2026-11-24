/** Ícono de la app: telón rojo abierto + línea de tiempo con los colores de los actos. */
export function AppIcon({ size }: { size: number }) {
  const s = size / 180; // diseñado a 180px
  const bars = [
    { c: "#38bdf8", w: 10 },
    { c: "#d4d4d4", w: 16 },
    { c: "#34d399", w: 30 },
    { c: "#ffffff", w: 22 },
    { c: "#a78bfa", w: 10 },
    { c: "#d4d4d4", w: 24 },
    { c: "#fbbf24", w: 12 },
  ];
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
        background: "#0a0a0a",
        position: "relative",
        paddingBottom: 30 * s,
      }}
    >
      {/* Bambalina */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 26 * s, background: "#b91c1c", borderBottom: `${4 * s}px solid #7f1d1d` }} />
      {/* Telón izquierdo y derecho */}
      <svg width={size} height={size} viewBox="0 0 180 180" style={{ position: "absolute", top: 0, left: 0 }}>
        <path d="M0 24 H62 C52 70 40 110 46 150 C30 150 14 150 0 150 Z" fill="#dc2626" />
        <path d="M180 24 H118 C128 70 140 110 134 150 C150 150 166 150 180 150 Z" fill="#dc2626" />
        <path d="M18 24 C16 70 14 110 16 150 M36 24 C32 70 28 110 30 150" stroke="#991b1b" strokeWidth="4" fill="none" />
        <path d="M162 24 C164 70 166 110 164 150 M144 24 C148 70 152 110 150 150" stroke="#991b1b" strokeWidth="4" fill="none" />
        {/* Foco */}
        <path d="M90 24 L60 150 H120 Z" fill="#ffffff" fillOpacity="0.12" />
        <circle cx="90" cy="92" r="16" fill="#ffffff" />
        <path d="M84 84 L100 92 L84 100 Z" fill="#0a0a0a" />
      </svg>
      {/* Línea de tiempo */}
      <div style={{ display: "flex", gap: 3 * s, width: 140 * s, height: 12 * s }}>
        {bars.map((b, i) => (
          <div
            key={i}
            style={{
              flexGrow: b.w,
              height: "100%",
              borderRadius: 3 * s,
              background: b.c,
              opacity: i === 3 ? 1 : 0.75,
              border: i === 3 ? `${2 * s}px solid #ffffff` : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}
