import type { ReactNode } from 'react';
import { Icon } from './Icon';

export function EmptyState({
  icon = 'info',
  title,
  body,
  action,
}: { icon?: Parameters<typeof Icon>[0]['name']; title: string; body?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center gap-3 py-12 px-6">
      <div className="w-14 h-14 rounded-full bg-surface-2 text-ink-3 grid place-items-center">
        <Icon name={icon} size={22} />
      </div>
      <div className="sr-h3 text-ink">{title}</div>
      {body && <div className="sr-small max-w-sm">{body}</div>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function InlineError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="sr-card p-4 flex items-start gap-3" style={{ borderColor: 'rgba(168,30,30,0.35)', background: 'var(--sr-err-soft)' }}>
      <Icon name="alert" size={18} style={{ color: 'var(--sr-err)', marginTop: 2 }} />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-err">Something went wrong</div>
        <div className="sr-small" style={{ color: 'var(--sr-err)' }}>{message}</div>
      </div>
      {onRetry && (
        <button className="sr-btn sr-btn--sm sr-btn--danger" onClick={onRetry}>Try again</button>
      )}
    </div>
  );
}

export function SkeletonRow({ lines = 3 }: { lines?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="sr-skel" style={{ height: 12, width: `${60 + (i % 3) * 15}%` }} />
      ))}
    </div>
  );
}
