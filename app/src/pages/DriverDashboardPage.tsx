import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { acceptTrip, ApiError, getEarnings, getPendingTrips, setDriverAvailability } from '../api/client';
import type { Earnings, Trip } from '../types';
import { PageHead } from '../components/PageHead';
import { Icon } from '../components/Icon';
import { EmptyState, InlineError, SkeletonRow } from '../components/EmptyState';
import { StatusChip } from '../components/StatusChip';
import { useToast } from '../components/Toast';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { RouteLine } from '../components/RouteLine';
import { formatKm, formatRwf } from '../lib/format';

type ApprovalState = 'loading' | 'approved' | 'blocked';

export function DriverDashboardPage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const { toast } = useToast();

  const [available, setAvailable] = useState(true);
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [approval, setApproval] = useState<ApprovalState>('loading');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setError(null);
    // Earnings is always safe; pending-trips 403s if unapproved, which is how
    // we discover the driver's approval state without a dedicated endpoint.
    const earningsP = getEarnings().then(setEarnings).catch(() => {});
    try {
      const list = await getPendingTrips();
      setTrips(list);
      setApproval('approved');
    } catch (e) {
      if (e instanceof ApiError && (e.status === 403 || e.status === 401)) {
        setApproval('blocked');
        setTrips([]);
      } else {
        setError(e instanceof Error ? e.message : 'Could not load dashboard.');
      }
    }
    await earningsP;
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  const handleAccept = async (tripId: string) => {
    try {
      await acceptTrip(tripId);
      toast('ok', 'Trip accepted.');
      nav(`/driver/trip/${tripId}`);
    } catch (err) {
      toast('err', err instanceof Error ? err.message : 'Could not accept trip.');
    }
  };

  const toggleAvailable = async () => {
    const next = !available;
    setAvailable(next); // optimistic
    try {
      await setDriverAvailability(next);
    } catch (err) {
      setAvailable(!next);
      toast('err', err instanceof Error ? err.message : 'Could not change availability.');
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <PageHead
        eyebrow="Driver · Dashboard"
        title={<>Good to see you, {user?.name.split(' ')[0]}. <span className="sr-italic text-ink-3">Let's roll.</span></>}
        lede="Availability, pending requests, and your earnings — one surface, no tabs."
        actions={approval === 'approved' && (
          <Button
            size="sm"
            variant={available ? 'danger' : 'primary'}
            onClick={toggleAvailable}
            iconLeft={<Icon name={available ? 'x' : 'check'} size={13} />}
          >{available ? 'Go offline' : 'Go online'}</Button>
        )}
      />

      {error && <InlineError message={error} onRetry={load} />}

      {approval === 'blocked' ? (
        <AwaitingApproval />
      ) : approval === 'loading' ? (
        <Card><SkeletonRow lines={3} /></Card>
      ) : (
        <>
          <AvailabilityBanner available={available} />

          <section className="grid lg:grid-cols-[1.2fr_1fr] gap-5 mt-6">
            <QueuePanel
              trips={trips}
              available={available}
              onAccept={handleAccept}
            />
            <EarningsPanel earnings={earnings} />
          </section>
        </>
      )}
    </div>
  );
}

function AvailabilityBanner({ available }: { available: boolean }) {
  return (
    <Card className="flex items-center gap-4 flex-wrap">
      <div
        className="w-10 h-10 rounded-full grid place-items-center flex-shrink-0"
        style={{ background: available ? 'rgba(127,212,155,0.18)' : 'rgba(154,147,134,0.18)', color: available ? 'var(--sr-ok)' : 'var(--sr-ink-3)' }}
      >
        <Icon name={available ? 'check' : 'clock'} size={18} />
      </div>
      <div className="flex-1 min-w-[220px]">
        <div className="font-serif text-[18px] tracking-tight">
          {available ? <>You're <span className="sr-italic text-accent">online</span> and visible.</> : <>You're <span className="sr-italic">offline</span>.</>}
        </div>
        <div className="sr-small mt-1">
          {available ? 'Location is shared with the matching service only during trips in progress.' : 'Flip availability above when you\'re ready to accept requests.'}
        </div>
      </div>
    </Card>
  );
}

function QueuePanel({ trips, available, onAccept }: { trips: Trip[] | null; available: boolean; onAccept: (id: string) => void }) {
  return (
    <Card padding="none" className="overflow-hidden">
      <div className="p-5 border-b border-line flex items-end justify-between gap-3">
        <div>
          <div className="sr-eyebrow mb-1">Pending requests</div>
          <div className="font-serif text-[22px] tracking-tight">
            {trips == null ? 'Loading…' : trips.length > 0 ? <><span className="font-mono text-accent-hover">{trips.length}</span> nearby</> : <>All <span className="sr-italic">quiet</span>.</>}
          </div>
        </div>
        <span
          className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase"
          style={{ color: available ? 'var(--sr-accent-hover)' : 'var(--sr-ink-4)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: available ? 'var(--sr-accent)' : 'var(--sr-ink-4)' }} />
          {available ? 'Live feed' : 'Paused'}
        </span>
      </div>

      {trips == null ? (
        <div className="p-5"><SkeletonRow lines={3} /></div>
      ) : !available ? (
        <EmptyState icon="clock" title="You're offline" body="Go online to see new requests here." />
      ) : trips.length === 0 ? (
        <EmptyState icon="clock" title="No requests right now" body="Stay put — new requests appear here automatically." />
      ) : (
        <ul className="list-none m-0 p-0">
          {trips.map((t, i) => (
            <li key={t.id} className={`p-5 ${i < trips.length - 1 ? 'border-b border-line' : ''} grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center`}>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="sr-table__num">{t.id}</span>
                  <StatusChip status="Pending" live />
                  {t.distanceKm != null && <span className="sr-micro">{formatKm(t.distanceKm)}</span>}
                </div>
                <RouteLine pickup={t.pickup} dropoff={t.dropoff} compact />
              </div>
              <div className="flex items-center gap-4 justify-between sm:flex-col sm:items-end sm:gap-2">
                <div>
                  <div className="sr-micro">Est. fare</div>
                  <div className="sr-num text-[22px] tracking-tight">{formatRwf(t.fareRwf)}</div>
                </div>
                <Button size="sm" variant="primary" onClick={() => onAccept(t.id)} iconLeft={<Icon name="check" size={13} />}>Accept</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function EarningsPanel({ earnings }: { earnings: Earnings | null }) {
  if (!earnings) return <Card><SkeletonRow lines={5} /></Card>;
  const max = Math.max(1, ...earnings.daily.map((d) => d.amount));
  // Flag the most recent day in the series as "today".
  const todayIdx = earnings.daily.length - 1;
  return (
    <Card padding="none" className="overflow-hidden">
      <div className="p-5 border-b border-line">
        <div className="sr-eyebrow mb-1">Earnings</div>
        <div className="flex items-baseline gap-2">
          <span className="sr-num text-[40px] leading-none tracking-tight">{formatRwf(earnings.today)}</span>
          <span className="sr-small ml-2">today</span>
        </div>
        <div className="sr-micro mt-1.5">{earnings.completedTrips} completed trips to date</div>
      </div>

      {earnings.daily.length > 0 && (
        <div className="p-5 pb-2">
          <div className="sr-eyebrow mb-2.5">Recent days</div>
          <div className="grid gap-2 h-28 items-end" style={{ gridTemplateColumns: `repeat(${earnings.daily.length}, 1fr)` }}>
            {earnings.daily.map((d, i) => {
              const h = Math.max(4, (d.amount / max) * 100);
              const isToday = i === todayIdx;
              const label = new Date(d.day).toLocaleDateString('en-GB', { weekday: 'short' });
              return (
                <div key={d.day} className="flex flex-col items-center gap-1.5 h-full">
                  <div className="flex-1 flex items-end w-full">
                    <div
                      title={`${label}: ${formatRwf(d.amount)} · ${d.tripCount} trips`}
                      className="w-full rounded-sm"
                      style={{ height: `${h}%`, background: isToday ? 'var(--sr-accent)' : 'var(--sr-ink-4)', opacity: isToday ? 1 : 0.5 }}
                    />
                  </div>
                  <div className="sr-micro text-[10px]">{label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 border-t border-line">
        <Cell label="Today"    value={earnings.today} />
        <Cell label="Week"     value={earnings.week}  divider />
        <Cell label="Month"    value={earnings.month} divider />
        <Cell label="All-time" value={earnings.total} divider />
      </div>
    </Card>
  );
}

function Cell({ label, value, divider }: { label: string; value: number; divider?: boolean }) {
  return (
    <div className="p-3.5" style={{ borderLeft: divider ? '1px solid var(--sr-line)' : 'none' }}>
      <div className="sr-eyebrow text-[9px] mb-1.5">{label}</div>
      <div className="sr-num text-[15px] tracking-tight">{formatRwf(value)}</div>
    </div>
  );
}

function AwaitingApproval() {
  return (
    <Card padding="lg" className="grid sm:grid-cols-[72px_1fr] gap-6 items-start">
      <div
        className="w-16 h-16 rounded-full grid place-items-center"
        style={{ background: 'var(--sr-accent-soft)', color: 'var(--sr-accent-hover)' }}
      >
        <Icon name="shield" size={28} />
      </div>
      <div className="max-w-xl">
        <div className="sr-eyebrow mb-2">Account status · Pending approval</div>
        <h2 className="sr-h2 m-0 mb-3">You're <span className="sr-italic text-accent">almost on the road</span>.</h2>
        <p className="sr-body text-ink-2">
          An administrator is reviewing your documents. Trips are unavailable until you're approved — usually within one business day.
        </p>
        <div className="mt-5 flex gap-2 flex-wrap">
          <Button size="sm" variant="secondary" iconLeft={<Icon name="phone" size={13} />}>Contact onboarding</Button>
          <Button size="sm" variant="ghost" iconLeft={<Icon name="info" size={13} />}>Status checklist</Button>
        </div>
      </div>
    </Card>
  );
}
