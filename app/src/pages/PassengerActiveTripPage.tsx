import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Map } from '../components/Map';
import { StatusChip } from '../components/StatusChip';
import { StarRating } from '../components/StarRating';
import { Icon } from '../components/Icon';
import { useAuth } from '../auth/AuthContext';
import { cancelTrip, getDriverCard, getDriverLocation, getTrip, reviewTrip } from '../api/client';
import type { DriverCard, LatLng, Trip } from '../types';
import { InlineError, SkeletonRow } from '../components/EmptyState';
import { useToast } from '../components/Toast';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { RouteLine } from '../components/RouteLine';
import { Textarea } from '../components/Field';

export function PassengerActiveTripPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const nav = useNavigate();
  const { toast } = useToast();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [driver, setDriver] = useState<DriverCard | null>(null);
  const [driverLoc, setDriverLoc] = useState<LatLng | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const t = await getTrip(id);
      setTrip(t);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load trip.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!id) return;
    const handle = setInterval(() => { void load(); }, 5000);
    return () => clearInterval(handle);
  }, [id, load]);

  useEffect(() => {
    if (!trip || !trip.driverId || driver) return;
    getDriverCard(trip.id).then(setDriver).catch(() => {});
  }, [trip, driver]);

  useEffect(() => {
    if (!trip || !trip.driverId || trip.status === 'Completed' || trip.status === 'Cancelled') return;
    let mounted = true;
    const tick = () => {
      getDriverLocation(trip.id).then((l) => { if (mounted) setDriverLoc(l); }).catch(() => {});
    };
    tick();
    const handle = setInterval(tick, 5000);
    return () => { mounted = false; clearInterval(handle); };
  }, [trip]);

  useEffect(() => {
    if (trip?.status === 'Completed' && !trip.rating) setRatingOpen(true);
  }, [trip]);

  const handleCancel = async () => {
    if (!trip) return;
    try {
      await cancelTrip(trip.id);
      toast('info', 'Trip cancelled.');
      nav('/passenger/history', { replace: true });
    } catch (e) {
      toast('err', e instanceof Error ? e.message : 'Could not cancel trip.');
    }
  };

  const handleSubmitReview = async () => {
    if (!trip) return;
    setSubmittingReview(true);
    try {
      await reviewTrip(trip.id, rating, review);
      toast('ok', 'Thanks for the review.');
      setRatingOpen(false);
      await load();
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading && !trip) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="max-w-md"><SkeletonRow lines={4} /></Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <InlineError message={error} onRetry={() => { setLoading(true); void load(); }} />
      </div>
    );
  }

  if (!trip || !user) return null;

  const live = trip.status === 'Accepted' || trip.status === 'InProgress';
  const canCancel = trip.status === 'Pending' || trip.status === 'Accepted';

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="sr-eyebrow">Trip №&nbsp;{trip.id}</div>
          <span className="text-ink-4">·</span>
          <StatusChip status={trip.status} live={live} />
        </div>
        {live && (
          <div className="inline-flex items-center gap-2 font-mono text-[11px] tracking-wider uppercase text-ink-3">
            <span className="w-1.5 h-1.5 rounded-full bg-ok" /> Live · polling every 5s
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_420px] gap-6 items-start">
        <Map
          pickup={trip.pickup.coords}
          dropoff={trip.dropoff.coords}
          driver={live ? driverLoc ?? undefined : undefined}
          height={520}
        />

        <div className="flex flex-col gap-4">
          {trip.status === 'Pending' && (
            <Card>
              <div className="sr-eyebrow mb-2">Looking for a driver</div>
              <div className="flex items-center gap-3">
                <div className="sr-skel w-10 h-10 rounded-full" />
                <div className="flex-1"><SkeletonRow lines={2} /></div>
              </div>
              <p className="sr-small mt-3">We're paging nearby drivers. Feel free to cancel if you change your mind.</p>
            </Card>
          )}

          {live && driver && <DriverInfoCard driver={driver} status={trip.status} />}

          <Card>
            <div className="sr-eyebrow mb-3">Route</div>
            <RouteLine pickup={trip.pickup} dropoff={trip.dropoff} />
            <div className="mt-3 pt-3 border-t border-line flex justify-between font-mono text-[11px] tracking-wider uppercase text-ink-3">
              <span>{trip.distanceMi} mi</span>
              {trip.fare != null && <span>${trip.fare.toFixed(2)}</span>}
            </div>
          </Card>

          <div className="flex gap-2 flex-wrap">
            {canCancel && (
              <Button variant="danger" className="flex-1" onClick={handleCancel} iconLeft={<Icon name="x" size={14} />}>Cancel trip</Button>
            )}
            {trip.status === 'Completed' && (
              <>
                <Button variant="secondary" className="flex-1" onClick={() => setRatingOpen(true)} iconLeft={<Icon name="star" size={14} />}>Rate driver</Button>
                <Link to={`/passenger/trip/${trip.id}/receipt`} className="sr-btn sr-btn--primary flex-1">
                  <Icon name="receipt" size={14} /> View receipt
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {ratingOpen && trip.status === 'Completed' && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm grid place-items-center z-50 p-4" role="dialog" aria-modal="true">
          <Card className="w-full max-w-md" style={{ boxShadow: 'var(--sr-shadow-pop)' }}>
            <div className="sr-eyebrow mb-2">Rate your trip</div>
            <h2 className="sr-h2 mb-1">How was {driver?.name ?? 'your driver'}?</h2>
            <p className="sr-small mb-5">Star rating and an optional note. Thank you.</p>
            <div className="mb-5"><StarRating value={rating} size={32} interactive onChange={setRating} /></div>
            <Textarea placeholder="Leave a short note (optional)" rows={3} value={review} onChange={(e) => setReview(e.target.value)} />
            <div className="mt-5 flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setRatingOpen(false)} disabled={submittingReview}>Skip</Button>
              <Button variant="primary" onClick={handleSubmitReview} disabled={submittingReview}>
                {submittingReview ? 'Sending…' : 'Submit review'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function DriverInfoCard({ driver, status }: { driver: DriverCard; status: Trip['status'] }) {
  return (
    <Card>
      <div className="sr-eyebrow mb-3">Your driver</div>
      <div className="flex items-center gap-3.5">
        <div className="sr-avatar sr-avatar--lg" style={{ background: 'var(--sr-info)' }}>
          {driver.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-serif text-[20px] tracking-tight">{driver.name}</div>
          <div className="sr-small mt-0.5 flex items-center gap-2">
            <StarRating value={driver.rating} size={14} /> <span>{driver.rating.toFixed(1)}</span>
            <span className="text-ink-4">· {driver.ratingCount} ratings</span>
          </div>
          <div className="sr-micro mt-1">{driver.plate}</div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <a href={`tel:${driver.phone.replace(/\s/g, '')}`} className="sr-btn sr-btn--secondary sr-btn--sm">
          <Icon name="phone" size={14} /> Call driver
        </a>
        <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded bg-accent-soft text-accent-hover font-mono text-[11px] tracking-wider uppercase">
          <Icon name="clock" size={13} /> {driver.etaMinutes} min · {status === 'InProgress' ? 'to dropoff' : 'to pickup'}
        </div>
      </div>
    </Card>
  );
}
