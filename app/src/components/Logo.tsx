export function SwiftRideMark({ size = 22, mono = false }: { size?: number; mono?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6.5 L11 12 L3 17.5 Z" fill={mono ? 'currentColor' : 'var(--sr-accent)'} />
      <path d="M11 6.5 L19 12 L11 17.5 Z" fill="currentColor" opacity={mono ? 0.5 : 1} />
    </svg>
  );
}

export function SwiftRideLogo({ mono = false }: { mono?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5 font-serif text-[20px] tracking-tight" style={{ color: 'inherit' }}>
      <SwiftRideMark size={22} mono={mono} />
      <span style={{ fontFeatureSettings: '"ss01"' }}>
        Swift<span style={{ fontStyle: 'italic', fontFamily: 'Instrument Serif, serif', fontWeight: 400, letterSpacing: '-0.02em' }}>Ride</span>
      </span>
    </span>
  );
}
