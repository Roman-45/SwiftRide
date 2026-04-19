import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getTripReceipt, getUser } from '../api/client';
import type { Trip, User } from '../types';
import { SwiftRideMark } from '../components/Logo';
import { Icon } from '../components/Icon';
import { InlineError, SkeletonRow } from '../components/EmptyState';
import { Card } from '../components/Card';

function fmt(v: string | null | undefined, fallback = '—') {
  return v ? new Date(v).toLocaleString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : fallback;
}
function dashNull<T>(v: T | null | undefined, fmtV?: (v: T) => string): string {
  if (v == null) return '—';
  return fmtV ? fmtV(v) : String(v);
}

export function PassengerReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [driver, setDriver] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !user) return;
    getTripReceipt(id, user.id).then(setTrip).catch((e) => setError(e instanceof Error ? e.message : 'Could not load receipt.'));
  }, [id, user]);

  useEffect(() => {
    if (!trip?.driverId) return;
    getUser(trip.driverId).then(setDriver).catch(() => {});
  }, [trip?.driverId]);

  if (error) return <div className="max-w-xl mx-auto p-6"><InlineError message={error} /></div>;
  if (!trip) return <div className="max-w-xl mx-auto p-6"><Card padding="lg"><SkeletonRow lines={6} /></Card></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 lg:py-10">
      <div className="flex items-center justify-between mb-5 no-print">
        <Link to="/passenger/history" className="sr-btn sr-btn--ghost sr-btn--sm"><Icon name="arrow-left" size={13} /> Back to history</Link>
        <button className="sr-btn sr-btn--primary" onClick={() => window.print()}>
          <Icon name="printer" size={14} /> Print
        </button>
      </div>

      <Card padding="none">
        <div className="p-6 sm:p-10 border-b border-line flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="sr-eyebrow mb-2">SwiftRide Receipt</div>
            <h1 className="sr-h2 m-0">№&nbsp;{trip.id}</h1>
            <div className="sr-small mt-1">Issued {fmt(trip.completedAt)}</div>
          </div>
          <SwiftRideMark size={44} />
        </div>

        <div className="p-6 sm:p-10 grid sm:grid-cols-2 gap-6 border-b border-line">
          <div>
            <div className="sr-eyebrow mb-1">Pickup</div>
            <div className="text-[15px] font-medium">{dashNull(trip.pickup.label)}</div>
            <div className="sr-small">{dashNull(trip.pickup.sub)}</div>
            <div className="sr-micro mt-2">{fmt(trip.startedAt)}</div>
          </div>
          <div>
            <div className="sr-eyebrow mb-1">Dropoff</div>
            <div className="text-[15px] font-medium">{dashNull(trip.dropoff.label)}</div>
            <div className="sr-small">{dashNull(trip.dropoff.sub)}</div>
            <div className="sr-micro mt-2">{fmt(trip.completedAt)}</div>
          </div>
        </div>

        <div className="p-6 sm:p-10 grid sm:grid-cols-3 gap-6 border-b border-line">
          <Detail label="Distance" value={dashNull(trip.distanceMi, (v) => `${v} mi`)} />
          <Detail label="Driver"   value={driver?.name ?? (trip.driverId ? 'Loading…' : '—')} />
          <Detail label="Status"   value={dashNull(trip.status)} />
        </div>

        <div className="p-6 sm:p-10 flex items-end justify-between">
          <div>
            <div className="sr-eyebrow mb-1">{trip.status === 'Completed' ? 'Paid' : 'Fare'}</div>
            <div className="sr-small">Fare includes platform share and local taxes.</div>
          </div>
          <div className="text-right">
            <div className="sr-num text-[48px] leading-none tracking-tight">
              {trip.fare != null ? `$${trip.fare.toFixed(2)}` : <span className="text-ink-4">—</span>}
            </div>
            {trip.status === 'Completed' && <div className="sr-micro mt-1">Captured on card ending 4242</div>}
          </div>
        </div>
      </Card>

      <p className="sr-small mt-4 text-center no-print">Need help? Reply to the confirmation email — we reply within a business day.</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="sr-eyebrow mb-1">{label}</div>
      <div className="text-[15px] font-medium">{value}</div>
    </div>
  );
}
