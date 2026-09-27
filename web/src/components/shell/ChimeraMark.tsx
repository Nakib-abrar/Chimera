interface Props {
  size?: number;
  className?: string;
}

/** Chimera mark — a chimeric split shield. Fill tracks the active profile accent
 *  (offensive-lime / defensive-cyan / neutral) via currentColor = var(--accent). */
export function ChimeraMark({ size = 26, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M16 2 L28 7 V16 C28 23 22.5 28.5 16 31 C9.5 28.5 4 23 4 16 V7 Z"
        fill="var(--surface-raised)"
        stroke="var(--accent)"
        strokeWidth="2"
      />
      <path d="M16 2 L28 7 V16 C28 23 22.5 28.5 16 31 Z" fill="var(--accent)" opacity="0.18" />
      <path
        d="M16 8 L16 24 M11 12 L16 16 L21 12 M11 20 L16 16 L21 20"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
