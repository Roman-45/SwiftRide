import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAdminTrips } from '../api/client';
import type { Trip, TripStatus } from '../types';
import { StatusChip } from '../components/StatusChip';
import { EmptyState, InlineError, SkeletonRow } from '../components/EmptyState';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { PaginationBar, usePagination } from '../components/Pagination';
import { formatRwf } from '../lib/format';

const FILTERS: Array<TripStatus | 'All'> = ['All', 'Pending', 'Accepted', 'InProgress', 'Completed', 'Cancelled'];

function isFilter(v: string | null): v is TripStatus | 'All' {
  return !!v && (FILTERS as string[]).includes(v);
}

export function AdminTripsPage() {
  const [params, setParams] = useSearchParams();
  const urlFilter = params.get('status');
  const urlPage = parseInt(params.get('page') ?? '1', 10) || 1;
  const initialFilter: TripStatus | 'All' = isFilter(urlFilter) ? urlFilter : 'All';

  const [filter, setFilter] = useState<TripStatus | 'All'>(initialFilter);
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = (f: TripStatus | 'All') => {
    setTrips(null);
    setError(null);
    getAdminTrips(f).then(setTrips).catch((e) => setError(e.message));
  };
  useEffect(() => { load(filter); }, [filter]);

  const { pageItems, pagination } = usePagination({ items: trips, initialPage: urlPage, resetKey: filter });

  // Keep the URL in sync with current filter + page so it persists across reloads.
  useEffect(() => {
    const next = new URLSearchParams(params);
    if (filter === 'All') next.delete('status'); else next.set('status', filter);
    if (pagination.page === 1) next.delete('page'); else next.set('page', String(pagination.page));
    // Only write if it actually changed to avoid loops.
    if (next.toString() !== params.toString()) setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, pagination.page]);

  return (
    <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8">
      <header className="pb-5 mb-5 border-b border-line">
        <div className="sr-eyebrow mb-1">Trips</div>
        <h1 className="font-serif text-[28px] font-normal tracking-tight m-0">Every trip, every status.</h1>
      </header>

      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTERS.map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? 'primary' : 'secondary'}
            onClick={() => setFilter(f)}
          >
            {f === 'InProgress' ? 'In progress' : f}
          </Button>
        ))}
      </div>

      {error && <InlineError message={error} onRetry={() => load(filter)} />}
      {!pageItems && !error && <Card><SkeletonRow lines={5} /></Card>}

      {pageItems && pageItems.length === 0 && (
        <Card padding="none"><EmptyState icon="route" title="No trips match this filter" body="Try a different status or clear the filter." /></Card>
      )}

      {pageItems && pageItems.length > 0 && (
        <>
          {/* Desktop */}
          <Card padding="none" className="overflow-hidden hidden md:block">
            <table className="sr-table">
              <thead>
                <tr>
                  <th>№</th>
                  <th>Route</th>
                  <th style={{ width: 120 }}>Status</th>
                  <th style={{ width: 140, textAlign: 'right' }}>Fare</th>
                  <th style={{ width: 140, textAlign: 'right' }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((t) => (
                  <tr key={t.id}>
                    <td className="sr-table__num">{t.id}</td>
                    <td>
                      <div className="text-[14px]">{t.pickup.label} <span className="text-ink-4">→</span> {t.dropoff.label}</div>
                      <div className="sr-small">P#{t.passengerId} · {t.driverId ? `D#${t.driverId}` : '—'}</div>
                    </td>
                    <td><StatusChip status={t.status} /></td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--sr-mono)' }}>
                      {t.fareRwf != null ? formatRwf(t.fareRwf) : <span className="text-ink-4">—</span>}
                    </td>
                    <td style={{ textAlign: 'right' }} className="sr-table__num">
                      {new Date(t.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Mobile */}
          <div className="md:hidden flex flex-col gap-3">
            {pageItems.map((t) => (
              <Card key={t.id} padding="sm">
                <div className="flex justify-between items-start mb-1.5">
                  <span className="sr-table__num">{t.id}</span>
                  <StatusChip status={t.status} />
                </div>
                <div className="text-[14px] mb-1">{t.pickup.label} → {t.dropoff.label}</div>
                <div className="sr-small flex justify-between">
                  <span>{t.fareRwf != null ? formatRwf(t.fareRwf) : '—'}</span>
                  <span>{new Date(t.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                </div>
              </Card>
            ))}
          </div>

          <PaginationBar pagination={pagination} label={['trip', 'trips']} />
        </>
      )}
    </div>
  );
}
