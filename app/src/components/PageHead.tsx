import type { ReactNode } from 'react';

export function PageHead({
  eyebrow, title, lede, actions,
}: { eyebrow?: ReactNode; title: ReactNode; lede?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6 mb-7">
      <div className="max-w-2xl">
        {eyebrow && <div className="sr-eyebrow mb-2">{eyebrow}</div>}
        <h1 className="sr-h1 m-0">{title}</h1>
        {lede && <p className="sr-body mt-2 max-w-xl text-ink-2">{lede}</p>}
      </div>
      {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}
