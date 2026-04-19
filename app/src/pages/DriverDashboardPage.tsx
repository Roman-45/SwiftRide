import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { acceptTrip, getActiveTripForDriver, getEarnings, getPendingTrips } from '../api/client';
import type { Earnings, Trip } from '../types';
import { PageHead } from '../components/PageHead';
import { Icon } from '../components/Icon';
import { EmptyState, InlineError, SkeletonRow } from '../components/EmptyState';
import { StatusChip } from '../components/StatusChip';
import { useToast } from '../components/Toast';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { RouteLine } from '../components/RouteLine';

export function DriverDashboardPage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const { toast } = useToast();

  const [available, setAvailable] = useState(true);
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setError(null);
      const [t, e] = await Promise.all([getPendingTrips(user.id), getEarnings(user.id)]);
      setTrips(t);
      setEarnings(e);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load dashboard.');
    }
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!user) return;
    getActiveTripForDriver(user.id).then((t) => { if (t) nav(`/driver/trip/${t.id}`, { replace: true }); }).catch(() => {});
  }, [user, nav]);

  const handleAccept = async (tripId: string) => {
    if (!user) return;
    try {
      await acceptTrip(user.id, tripId);
      toast('ok', 'Trip accepted.');
      nav(`/driver/trip/${tripId}`);
    } catch (err) {
      toast('err', err instanceof Error ? err.message : 'Could not accept trip.');
    }
  };

  const unapproved = user?.driverStatus !== 'approved';

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <PageHead
        eyebrow="Driver · Dashboard"
        title={<>Good to see you, {user?.name.split(' ')[0]}. <span className="sr-italic text-ink-3">Let's roll.</span></>}
        lede="Availability, pending requests, and your earnings — one surface, no tabs."
        actions={!unapproved && (
          <Button
            size="sm"
            variant={available ? 'danger' : 'primary'}
            onClick={() => setAvailable((v) => !v)}
            iconLeft={<Icon name={available ? 'x' : 'check'} size={13} />}
          >{available ? 'Go offline' : 'Go online'}</Button>
        )}
      />

      {error && <InlineError message={error} onRetry={load} />}

      {unapproved ? (
        <AwaitingApproval status={user?.driverStatus ?? 'pending'} />
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
                  <span className="sr-micro">{t.distanceMi} mi</span>
                </div>
                <RouteLine pickup={t.pickup} dropoff={t.dropoff} compact />
              </div>
              <div className="flex items-center gap-4 justify-between sm:flex-col sm:items-end sm:gap-2">
                <div>
                  <div className="sr-micro">Est. fare</div>
                  <div className="sr-num text-[22px] tracking-tight">${(t.fare ?? 0).toFixed(2)}</div>
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
  const max = Math.max(...earnings.chart.map((d) => d.value));
  return (
    <Card padding="none" className="overflow-hidden">
      <div className="p-5 border-b border-line">
        <div className="sr-eyebrow mb-1">Earnings</div>
        <div className="flex items-baseline gap-2">
          <span className="sr-num text-[14px] text-ink-3">$</span>
          <span className="sr-num text-[40px] leading-none tracking-tight">{earnings.today.toFixed(2)}</span>
          <span className="sr-small ml-2">today</span>
        </div>
        <div className="sr-micro mt-1.5">{earnings.tripsToday} trips · {earnings.onlineToday} online</div>
      </div>

      <div className="p-5 pb-2">
        <div className="sr-eyebrow mb-2.5">Last 7 days</div>
        <div className="grid grid-cols-7 gap-2 h-28 items-end">
          {earnings.chart.map((d) => {
            const h = Math.max(4, (d.value / max) * 100);
            return (
              <div key={d.day} className="flex flex-col items-center gap-1.5 h-full">
                <div className="flex-1 flex items-end w-full">
                  <div
                    title={`${d.day}: $${d.value.toFixed(2)}`}
                    className="w-full rounded-sm"
                    style={{ height: `${h}%`, background: d.today ? 'var(--sr-accent)' : 'var(--sr-ink-4)', opacity: d.today ? 1 : 0.5 }}
                  />
                </div>
                <div className="sr-micro text-[10px]">{d.day}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-4 border-t border-line">
        <Cell label="Today"    value={earnings.today} />
        <Cell label="7 days"   value={earnings.seven}  divider />
        <Cell label="30 days"  value={earnings.thirty} divider />
        <Cell label="All-time" value={earnings.allTime} divider />
      </div>
    </Card>
  );
}

function Cell({ label, value, divider }: { label: string; value: number; divider?: boolean }) {
  return (
    <div className="p-3.5" style={{ borderLeft: divider ? '1px solid var(--sr-line)' : 'none' }}>
      <div className="sr-eyebrow text-[9px] mb-1.5">{label}</div>
      <div className="sr-num text-[17px] tracking-tight">${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
    </div>
  );
}

function AwaitingApproval({ status }: { status: string }) {
  const isSuspended = status === 'suspended';
  return (
    <Card padding="lg" className="grid sm:grid-cols-[72px_1fr] gap-6 items-start">
      <div
        className="w-16 h-16 rounded-full grid place-items-center"
        style={{ background: isSuspended ? 'var(--sr-err-soft)' : 'var(--sr-accent-soft)', color: isSuspended ? 'var(--sr-err)' : 'var(--sr-accent-hover)' }}
      >
        <Icon name="shield" size={28} />
      </div>
      <div className="max-w-xl">
        <div className="sr-eyebrow mb-2">Account status · {isSuspended ? 'Suspended' : 'Pending approval'}</div>
        <h2 className="sr-h2 m-0 mb-3">{isSuspended ? <>Account <span className="sr-italic text-err">suspended</span>.</> : <>You're <span className="sr-italic text-accent">almost on the road</span>.</>}</h2>
        <p className="sr-body text-ink-2">
          {isSuspended
            ? 'Your driver account has been suspended. Reach out to onboarding to review the reason and next steps.'
            : "An administrator is reviewing your documents. Trips are unavailable until you're approved — usually within one business day."}
        </p>
        <div className="mt-5 flex gap-2 flex-wrap">
          <Button size="sm" variant="secondary" iconLeft={<Icon name="phone" size={13} />}>Contact onboarding</Button>
          <Button size="sm" variant="ghost" iconLeft={<Icon name="info" size={13} />}>Status checklist</Button>
        </div>
      </div>
    </Card>
  );
}
