import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats } from '../api/client';
import type { AdminStats } from '../types';
import { Icon } from '../components/Icon';
import { InlineError, SkeletonRow } from '../components/EmptyState';

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
        <div className="flex items-center gap-3">
          <span className="sr-micro">Updated just now</span>
        </div>
      </header>

      {error && <InlineError message={error} onRetry={load} />}
      {!stats && !error && <div className="sr-card p-6"><SkeletonRow lines={6} /></div>}

      {stats && (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 mb-7">
            <HeroStat label="Revenue, all-time" value={`$${stats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} span={5} href="/admin/trips" />
            <HeroStat label="Pending trips" value={String(stats.pendingTrips)} accent span={3} href="/admin/trips" live />
            <HeroStat label="Completed trips" value={String(stats.completedTrips)} span={4} href="/admin/trips" />
          </section>

          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            <StatTile label="Passengers" value={stats.passengers} href="/admin/users" />
            <StatTile label="Drivers" value={stats.drivers} href="/admin/users" />
            <StatTile label="Approved drivers" value={stats.approvedDrivers} href="/admin/users" />
            <StatTile label="Trips, all-time" value={stats.trips} href="/admin/trips" />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Link to="/admin/users" className="sr-card p-5 block no-underline text-inherit hover:shadow-[var(--sr-shadow-1)] transition">
              <div className="sr-eyebrow mb-1">Driver onboarding</div>
              <div className="font-serif text-[22px] tracking-tight mb-2">Review pending approvals</div>
              <div className="sr-small">Filter by Drivers, then Approve or Suspend any row in a single click.</div>
              <div className="mt-3 inline-flex items-center gap-1 text-accent-hover">Open users <Icon name="arrow-right" size={14} /></div>
            </Link>
            <Link to="/admin/trips" className="sr-card p-5 block no-underline text-inherit hover:shadow-[var(--sr-shadow-1)] transition">
              <div className="sr-eyebrow mb-1">Trip audit</div>
              <div className="font-serif text-[22px] tracking-tight mb-2">Every trip, every status</div>
              <div className="sr-small">Filter by status, inspect any ride end-to-end, export if you must.</div>
              <div className="mt-3 inline-flex items-center gap-1 text-accent-hover">Open trips <Icon name="arrow-right" size={14} /></div>
            </Link>
          </section>
        </>
      )}
    </div>
  );
}

function HeroStat({ label, value, span, accent, live, href }: { label: string; value: string; span: number; accent?: boolean; live?: boolean; href: string }) {
  return (
    <Link
      to={href}
      className="sr-card p-5 no-underline text-inherit transition hover:shadow-[var(--sr-shadow-1)] block lg:col-span-[var(--span)]"
      style={{
        gridColumn: `span ${span}`,
        background: accent ? 'var(--sr-accent-soft)' : 'var(--sr-surface)',
        borderColor: accent ? 'var(--sr-accent-edge)' : 'var(--sr-line)',
      }}
    >
      <div className="flex items-baseline justify-between mb-3">
        <span className="sr-eyebrow" style={{ color: accent ? 'var(--sr-accent-hover)' : undefined }}>{label}</span>
        {live && (
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase text-accent-hover">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" /> Live
          </span>
        )}
      </div>
      <div className="sr-num text-[40px] sm:text-[44px] leading-none tracking-tight">{value}</div>
    </Link>
  );
}

function StatTile({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link to={href} className="sr-card p-4 no-underline text-inherit block">
      <div className="sr-eyebrow mb-2">{label}</div>
      <div className="sr-num text-[26px] leading-none">{value.toLocaleString('en-US')}</div>
    </Link>
  );
}
