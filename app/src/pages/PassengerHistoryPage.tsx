import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getMyTrips } from '../api/client';
import type { Trip } from '../types';
import { PageHead } from '../components/PageHead';
import { StatusChip } from '../components/StatusChip';
import { Icon } from '../components/Icon';
import { EmptyState, InlineError, SkeletonRow } from '../components/EmptyState';
import { Card } from '../components/Card';
import { PaginationBar, usePagination } from '../components/Pagination';
import { formatKm, formatRwf } from '../lib/format';

export function PassengerHistoryPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    if (!user) return;
    setError(null);
    getMyTrips().then(setTrips).catch((e) => setError(e instanceof Error ? e.message : 'Could not load trips.'));
  };
  useEffect(load, [user]);

  const { pageItems, pagination } = usePagination({ items: trips });

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <PageHead
        eyebrow="Passenger · History"
        title={<>Your <span className="sr-italic">ledger</span>.</>}
        lede="Every trip, every fare, every receipt. Nothing lost."
      />

      {error && <InlineError message={error} onRetry={load} />}
      {!pageItems && !error && <Card><SkeletonRow lines={4} /></Card>}

      {pageItems && pageItems.length === 0 && (
        <Card padding="none">
          <EmptyState
            icon="history"
            title="No trips yet"
            body="When you book your first ride, it'll show up here with a receipt."
            action={<Link to="/passenger/book" className="sr-btn sr-btn--primary sr-btn--sm"><Icon name="plus" size={13} /> Book a ride</Link>}
          />
        </Card>
      )}

      {pageItems && pageItems.length > 0 && (
        <>
          {/* Desktop table */}
          <Card padding="none" className="overflow-hidden hidden md:block">
            <table className="sr-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Route</th>
                  <th style={{ width: 120 }}>Status</th>
                  <th style={{ width: 140, textAlign: 'right' }}>Fare</th>
                  <th style={{ width: 160, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((t) => (
                  <tr key={t.id}>
                    <td className="sr-table__num">{new Date(t.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                    <td>
                      <div className="text-[14px]">{t.pickup.label} <span className="text-ink-4">→</span> {t.dropoff.label}</div>
                      {t.distanceKm != null && <div className="sr-small">{formatKm(t.distanceKm)}</div>}
                    </td>
                    <td><StatusChip status={t.status} /></td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--sr-mono)' }}>
                      {t.fareRwf != null ? formatRwf(t.fareRwf) : <span className="text-ink-4">—</span>}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {t.status === 'Completed' ? (
                        <Link to={`/passenger/trip/${t.id}/receipt`} className="sr-btn sr-btn--ghost sr-btn--sm">
                          View receipt <Icon name="chevron-right" size={13} />
                        </Link>
                      ) : ['Pending', 'Accepted', 'InProgress'].includes(t.status) ? (
                        <Link to={`/passenger/trip/${t.id}`} className="sr-btn sr-btn--ghost sr-btn--sm">
                          Track <Icon name="chevron-right" size={13} />
                        </Link>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-3">
            {pageItems.map((t) => (
              <Card key={t.id} padding="sm">
                <div className="flex justify-between items-start mb-2">
                  <div className="sr-table__num">{new Date(t.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                  <StatusChip status={t.status} />
                </div>
                <div className="text-[14px] mb-1"><strong>{t.pickup.label}</strong> <span className="text-ink-4">→</span> {t.dropoff.label}</div>
                <div className="flex justify-between items-center mt-3">
                  <div className="sr-small">{formatRwf(t.fareRwf)}</div>
                  {t.status === 'Completed' && (
                    <Link to={`/passenger/trip/${t.id}/receipt`} className="sr-btn sr-btn--ghost sr-btn--sm">
                      Receipt <Icon name="chevron-right" size={13} />
                    </Link>
                  )}
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
