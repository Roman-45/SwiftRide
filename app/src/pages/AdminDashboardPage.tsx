import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats } from '../api/client';
import type { AdminStats } from '../types';
import { Icon } from '../components/Icon';
import { InlineError, SkeletonRow } from '../components/EmptyState';
import { Card } from '../components/Card';
import { StatTile } from '../components/StatTile';
import { formatRwf } from '../lib/format';

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => { setError(null); getAdminStats().then(setStats).catch((e) => setError(e.message)); };
  useEffect(load, []);

  return (
    <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8">
      <header className="flex items-end gap-6 justify-between flex-wrap pb-5 mb-6 border-b border-line">
        <div>
          <div className="sr-eyebrow mb-1">Overview · last 24h</div>
          <h1 className="font-serif text-[28px] font-normal tracking-tight m-0">Good morning, admin. <span className="sr-italic text-ink-3">All systems green.</span></h1>
        </div>
        <span className="sr-micro">Updated just now</span>
      </header>

      {error && <InlineError message={error} onRetry={load} />}
      {!stats && !error && <Card><SkeletonRow lines={6} /></Card>}

      {stats && (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 mb-7">
            <div style={{ gridColumn: 'span 5' }}>
              <StatTile
                size="lg"
                href="/admin/trips"
                label="Revenue, all-time"
                value={formatRwf(stats.totalRevenue)}
              />
            </div>
            <div style={{ gridColumn: 'span 3' }}>
              <StatTile
                size="lg"
                accent live
                href="/admin/trips"
                label="Pending trips"
                value={stats.pendingTrips}
              />
            </div>
            <div style={{ gridColumn: 'span 4' }}>
              <StatTile
                size="lg"
                href="/admin/trips"
                label="Completed trips"
                value={stats.completedTrips.toLocaleString('en-US')}
              />
            </div>
          </section>

          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            <StatTile label="Passengers"       value={stats.totalPassengers.toLocaleString('en-US')}  href="/admin/users" />
            <StatTile label="Drivers"          value={stats.totalDrivers.toLocaleString('en-US')}     href="/admin/users" />
            <StatTile label="Approved drivers" value={stats.approvedDrivers.toLocaleString('en-US')}  href="/admin/users" />
            <StatTile label="Trips, all-time"  value={stats.totalTrips.toLocaleString('en-US')}       href="/admin/trips" />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card as="div" padding="md" className="hover:shadow-[var(--sr-shadow-1)] transition">
              <Link to="/admin/users" className="no-underline text-inherit block">
                <div className="sr-eyebrow mb-1">Driver onboarding</div>
                <div className="font-serif text-[22px] tracking-tight mb-2">Review pending approvals</div>
                <div className="sr-small">Filter by Drivers, then Approve or Suspend any row in a single click.</div>
                <div className="mt-3 inline-flex items-center gap-1 text-accent-hover">Open users <Icon name="arrow-right" size={14} /></div>
              </Link>
            </Card>
            <Card padding="md" className="hover:shadow-[var(--sr-shadow-1)] transition">
              <Link to="/admin/trips" className="no-underline text-inherit block">
                <div className="sr-eyebrow mb-1">Trip audit</div>
                <div className="font-serif text-[22px] tracking-tight mb-2">Every trip, every status</div>
                <div className="sr-small">Filter by status, inspect any ride end-to-end, export if you must.</div>
                <div className="mt-3 inline-flex items-center gap-1 text-accent-hover">Open trips <Icon name="arrow-right" size={14} /></div>
              </Link>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
