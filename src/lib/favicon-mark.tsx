/** Versión simple del ícono para tamaños chicos (16–48 px): telón + play + barra. */
export function FaviconMark() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 32 32">
      <rect width="32" height="32" rx="7" fill="#0a0a0a" />
      <path d="M0 7 Q0 0 7 0 H25 Q32 0 32 7 V5 H0 Z" fill="#b91c1c" />
      <path d="M0 4 H11 C9 12 8 18 9 25 H0 Z" fill="#dc2626" />
      <path d="M32 4 H21 C23 12 24 18 23 25 H32 Z" fill="#dc2626" />
      <circle cx="16" cy="15" r="6" fill="#ffffff" />
      <path d="M14 12 L19.5 15 L14 18 Z" fill="#0a0a0a" />
      <rect x="4" y="26" width="7" height="3" rx="1.5" fill="#34d399" />
      <rect x="12.5" y="26" width="7" height="3" rx="1.5" fill="#ffffff" />
      <rect x="21" y="26" width="7" height="3" rx="1.5" fill="#fbbf24" />
    </svg>
  );
}
