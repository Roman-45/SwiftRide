import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { completeTrip, getDriverTrip, pushDriverLocation, startTrip } from '../api/client';
import type { Trip } from '../types';
import { Map } from '../components/Map';
import { StatusChip } from '../components/StatusChip';
import { Icon } from '../components/Icon';
import { InlineError, SkeletonRow } from '../components/EmptyState';
import { useToast } from '../components/Toast';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { RouteLine } from '../components/RouteLine';
import { formatKm, formatRwf } from '../lib/format';

// Backend expects Kigali coords (-3..-1, 28.8..30.9). If the browser is
// elsewhere we still post *something* near the pickup so the driver-side
// location updates surface on the passenger map during the demo.
const FALLBACK_CENTER = { lat: -1.9441, lng: 30.0619 };

export function DriverActiveTripPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { toast } = useToast();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [locationWarned, setLocationWarned] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setTrip(await getDriverTrip(id));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load trip.');
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  // Push the driver's current location every 10 s while InProgress — real
  // backend requirement. We fall back to Kigali coords on geolocation errors
  // rather than blocking the trip flow.
  const warnedRef = useRef(locationWarned);
  warnedRef.current = locationWarned;
  useEffect(() => {
    if (!trip || trip.status !== 'InProgress') return;

    const send = () => {
      if (!navigator.geolocation) {
        void pushDriverLocation(FALLBACK_CENTER);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const inRwanda = pos.coords.latitude >= -3 && pos.coords.latitude <= -1
                        && pos.coords.longitude >= 28.8 && pos.coords.longitude <= 30.9;
          const coords = inRwanda
            ? { lat: pos.coords.latitude, lng: pos.coords.longitude }
            : FALLBACK_CENTER;
          void pushDriverLocation(coords);
        },
        () => {
          if (!warnedRef.current) {
            toast('info', 'Location permission denied — sharing fallback coordinates.');
            setLocationWarned(true);
          }
          void pushDriverLocation(FALLBACK_CENTER);
        },
        { timeout: 6000 },
      );
    };

    send();
    const handle = setInterval(send, 10000);
    return () => clearInterval(handle);
  }, [trip, toast]);

  const handleStart = async () => {
    if (!trip) return;
    setBusy(true);
    try {
      await startTrip(trip.id);
      await load();
      toast('info', 'Trip started · location sharing is live.');
    } catch (e) {
      toast('err', e instanceof Error ? e.message : 'Could not start trip.');
    } finally { setBusy(false); }
  };

  const handleComplete = async () => {
    if (!trip) return;
    setBusy(true);
    try {
      await completeTrip(trip.id);
      toast('ok', 'Trip complete · earnings updated.');
      setTimeout(() => nav('/driver', { replace: true }), 800);
    } catch (e) {
      toast('err', e instanceof Error ? e.message : 'Could not complete trip.');
    } finally { setBusy(false); }
  };

  if (error) return <div className="max-w-2xl mx-auto p-6"><InlineError message={error} onRetry={load} /></div>;
  if (!trip) return <div className="max-w-2xl mx-auto p-6"><Card><SkeletonRow lines={4} /></Card></div>;

  const canStart = trip.status === 'Accepted';
  const canComplete = trip.status === 'InProgress';

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="sr-eyebrow">Trip №&nbsp;{trip.id}</div>
          <span className="text-ink-4">·</span>
          <StatusChip status={trip.status} live={['Accepted', 'InProgress'].includes(trip.status)} />
        </div>
        <LocationShareIndicator sharing={trip.status === 'InProgress'} />
      </div>

      <div className="grid lg:grid-cols-[1fr_420px] gap-6 items-start">
        <Map pickup={trip.pickup.coords} dropoff={trip.dropoff.coords} height={520} />

        <div className="flex flex-col gap-4">
          <Card>
            <div className="sr-eyebrow mb-3">Passenger</div>
            <p className="sr-small">
              Passenger contact isn't returned by this endpoint — reach them through support if needed.
            </p>
          </Card>

          <Card>
            <div className="sr-eyebrow mb-3">Route</div>
            <RouteLine pickup={trip.pickup} dropoff={trip.dropoff} />
            <div className="mt-3 pt-3 border-t border-line flex justify-between font-mono text-[11px] tracking-wider uppercase text-ink-3">
              <span>{formatKm(trip.distanceKm)}</span>
              {trip.fareRwf != null && <span>{formatRwf(trip.fareRwf)}</span>}
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary" size="lg"
              disabled={!canStart || busy}
              onClick={handleStart}
              iconLeft={<Icon name="car" size={16} />}
            >Start trip</Button>
            <Button
              variant="primary" size="lg"
              disabled={!canComplete || busy}
              onClick={handleComplete}
              iconLeft={<Icon name="check" size={16} />}
            >Complete</Button>
            <div className="col-span-2 sr-small mt-1">
              {trip.status === 'Accepted' && <>Tap <strong>Start</strong> once the passenger is in the car.</>}
              {trip.status === 'InProgress' && <>Tap <strong>Complete</strong> when you arrive at the dropoff.</>}
              {trip.status === 'Completed' && <>Trip complete — returning to the dashboard.</>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LocationShareIndicator({ sharing }: { sharing: boolean }) {
  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 border border-line rounded-full font-mono text-[11px] tracking-wider uppercase"
      style={{
        background: sharing ? 'var(--sr-accent-soft)' : 'var(--sr-surface)',
        color: sharing ? 'var(--sr-accent-hover)' : 'var(--sr-ink-4)',
      }}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{
          background: sharing ? 'var(--sr-accent)' : 'var(--sr-ink-4)',
          animation: sharing ? 'sr-driver-ping 1.4s infinite' : 'none',
          boxShadow: sharing ? '0 0 0 4px rgba(224,83,26,0.18)' : 'none',
        }}
      />
      {sharing ? 'Sharing location · 10s' : 'Location paused'}
      <style>{`@keyframes sr-driver-ping { 0%{box-shadow:0 0 0 0 rgba(224,83,26,0.45);} 70%{box-shadow:0 0 0 8px rgba(224,83,26,0);} 100%{box-shadow:0 0 0 0 rgba(224,83,26,0);} }`}</style>
    </div>
  );
}
