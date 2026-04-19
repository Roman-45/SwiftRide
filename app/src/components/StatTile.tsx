import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface StatTileProps {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  accent?: boolean;
  live?: boolean;
}

export function StatTile({ label, value, hint, href, size = 'md', accent, live }: StatTileProps) {
  const valueSize = size === 'lg' ? 'text-[40px] sm:text-[44px]' : size === 'sm' ? 'text-[22px]' : 'text-[28px]';
  const content = (
    <>
      <div className="flex items-baseline justify-between mb-2">
        <span className="sr-eyebrow" style={{ color: accent ? 'var(--sr-accent-hover)' : undefined }}>{label}</span>
        {live && (
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase text-accent-hover">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" /> Live
          </span>
        )}
      </div>
      <div className={`sr-num ${valueSize} leading-none tracking-tight`}>{value}</div>
      {hint && <div className="sr-small mt-1.5">{hint}</div>}
    </>
  );
  const className = 'sr-card p-4 no-underline text-inherit block transition hover:shadow-[var(--sr-shadow-1)]';
  const style = accent ? { background: 'var(--sr-accent-soft)', borderColor: 'var(--sr-accent-edge)' } : undefined;
  return href
    ? <Link to={href} className={className} style={style}>{content}</Link>
    : <div className={className} style={style}>{content}</div>;
}
