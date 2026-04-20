// Small formatting helpers used across pages. Kept in one place so the
// "RWF 2,100" convention is spelled the same way everywhere.

const RWF_FMT = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

export function formatRwf(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return '—';
  return `RWF ${RWF_FMT.format(Math.round(amount))}`;
}

export function formatKm(distance: number | null | undefined): string {
  if (distance == null || Number.isNaN(distance)) return '—';
  return `${distance.toFixed(1)} km`;
}

export function initials(name: string): string {
  return name.split(' ').filter(Boolean).map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}
