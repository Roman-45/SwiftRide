import type { TripStatus } from '../types';

const MAP: Record<TripStatus, { cls: string; label: string }> = {
  Pending:    { cls: 'sr-chip--pending',   label: 'Pending' },
  Accepted:   { cls: 'sr-chip--accepted',  label: 'Accepted' },
  InProgress: { cls: 'sr-chip--progress',  label: 'In progress' },
  Completed:  { cls: 'sr-chip--completed', label: 'Completed' },
  Cancelled:  { cls: 'sr-chip--cancelled', label: 'Cancelled' },
};

export function StatusChip({ status, live }: { status: TripStatus; live?: boolean }) {
  const s = MAP[status];
  return (
    <span className={`sr-chip ${s.cls}`}>
      <span className={`sr-chip__dot ${live ? 'sr-chip__dot--live' : ''}`} />
      {s.label}
    </span>
  );
}
