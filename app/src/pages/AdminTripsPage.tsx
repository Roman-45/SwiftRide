import { useEffect, useMemo, useState } from 'react';
import { getAdminTrips } from '../api/client';
import type { Trip, TripStatus } from '../types';
import { StatusChip } from '../components/StatusChip';
import { EmptyState, InlineError, SkeletonRow } from '../components/EmptyState';

const FILTERS: Array<TripStatus | 'All'> = ['All', 'Pending', 'Accepted', 'InProgress', 'Completed', 'Cancelled'];
const PAGE_SIZE = 10;

export function AdminTripsPage() {
  const [filter, setFilter] = useState<TripStatus | 'All'>('All');
  const [page, setPage] = useState(1);
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = (f: TripStatus | 'All') => {
    setTrips(null);
    setError(null);
    getAdminTrips(f).then(setTrips).catch((e) => setError(e.message));
  };
  useEffect(() => { load(filter); setPage(1); }, [filter]);

  const paged = useMemo(() => {
    if (!trips) return null;
    const start = (page - 1) * PAGE_SIZE;
    return trips.slice(start, start + PAGE_SIZE);
  }, [trips, page]);

  const pageCount = trips ? Math.max(1, Math.ceil(trips.length / PAGE_SIZE)) : 1;

  return (
    <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8">
      <header className="pb-5 mb-5 border-b border-line">
        <div className="sr-eyebrow mb-1">Trips</div>
        <h1 className="font-serif text-[28px] font-normal tracking-tight m-0">Every trip, every status.</h1>
      </header>

      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`sr-btn sr-btn--sm ${filter === f ? 'sr-btn--primary' : 'sr-btn--secondary'}`}
          >
            {f === 'InProgress' ? 'In progress' : f}
          </button>
        ))}
      </div>

      {error && <InlineError message={error} onRetry={() => load(filter)} />}
      {!paged && !error && <div className="sr-card p-6"><SkeletonRow lines={5} /></div>}

      {paged && paged.length === 0 && (
        <div className="sr-card"><EmptyState icon="route" title="No trips match this filter" body="Try a different status or clear the filter." /></div>
      )}

      {paged && paged.length > 0 && (
        <>
          {/* Desktop */}
          <div className="sr-card overflow-hidden hidden md:block">
            <table className="sr-table">
              <thead>
                <tr>
                  <th>№</th>
                  <th>Route</th>
                  <th style={{ width: 120 }}>Status</th>
                  <th style={{ width: 80, textAlign: 'right' }}>Miles</th>
                  <th style={{ width: 100, textAlign: 'right' }}>Fare</th>
                  <th style={{ width: 140, textAlign: 'right' }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((t) => (
                  <tr key={t.id}>
                    <td className="sr-table__num">{t.id}</td>
                    <td>
                      <div className="text-[14px]">{t.pickup.label} <span className="text-ink-4">→</span> {t.dropoff.label}</div>
                      <div className="sr-small">{t.passengerId.replace('u_pass_', 'P#')} · {(t.driverId ?? '—').replace('u_drv_', 'D#')}</div>
                    </td>
                    <td><StatusChip status={t.status} /></td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--sr-mono)' }}>{t.distanceMi}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--sr-mono)' }}>
                      {t.fare != null ? `$${t.fare.toFixed(2)}` : <span className="text-ink-4">—</span>}
                    </td>
                    <td style={{ textAlign: 'right' }} className="sr-table__num">
                      {new Date(t.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex flex-col gap-3">
            {paged.map((t) => (
              <div key={t.id} className="sr-card p-4">
                <div className="flex justify-between items-start mb-1.5">
                  <span className="sr-table__num">{t.id}</span>
                  <StatusChip status={t.status} />
                </div>
                <div className="text-[14px] mb-1">{t.pickup.label} → {t.dropoff.label}</div>
                <div className="sr-small flex justify-between">
                  <span>{t.distanceMi} mi{t.fare != null ? ` · $${t.fare.toFixed(2)}` : ''}</span>
                  <span>{new Date(t.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pageCount > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="sr-small">Page {page} of {pageCount} · {trips?.length ?? 0} trips</div>
              <div className="flex gap-2">
                <button className="sr-btn sr-btn--secondary sr-btn--sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
                <button className="sr-btn sr-btn--secondary sr-btn--sm" disabled={page >= pageCount} onClick={() => setPage((p) => p + 1)}>Next</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
