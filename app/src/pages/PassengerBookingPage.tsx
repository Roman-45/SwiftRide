import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map } from '../components/Map';
import { PageHead } from '../components/PageHead';
import { Icon } from '../components/Icon';
import { useAuth } from '../auth/AuthContext';
import { ApiError, bookTrip, estimateFare, getActiveTripForPassenger, getSuggestions, searchPlaces } from '../api/client';
import type { Place, Suggestion, LatLng } from '../types';
import { useToast } from '../components/Toast';
import { InlineError } from '../components/EmptyState';

const DEFAULT_CENTER: LatLng = { lat: 37.7749, lng: -122.4194 };

export function PassengerBookingPage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const { toast } = useToast();

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [pickup, setPickup] = useState<Place | null>(null);
  const [dropoff, setDropoff] = useState<Place | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Suggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [quote, setQuote] = useState<{ distanceMi: number; fare: number; minutes: number } | null>(null);
  const [bookError, setBookError] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);

  // DoR: if an active trip exists, redirect there.
  useEffect(() => {
    if (!user) return;
    getActiveTripForPassenger(user.id).then((t) => {
      if (t) nav(`/passenger/trip/${t.id}`, { replace: true });
    }).catch(() => { /* ignore */ });
  }, [user, nav]);

  useEffect(() => { getSuggestions().then(setSuggestions).catch(() => {}); }, []);

  useEffect(() => {
    if (query.trim().length < 3) { setResults([]); return; }
    let cancelled = false;
    setSearching(true);
    const id = setTimeout(() => {
      searchPlaces(query)
        .then((r) => { if (!cancelled) setResults(r); })
        .finally(() => { if (!cancelled) setSearching(false); });
    }, 250);
    return () => { cancelled = true; clearTimeout(id); };
  }, [query]);

  useEffect(() => {
    if (!pickup || !dropoff) { setQuote(null); return; }
    let cancelled = false;
    estimateFare(pickup.coords, dropoff.coords).then((q) => { if (!cancelled) setQuote(q); }).catch(() => {});
    return () => { cancelled = true; };
  }, [pickup, dropoff]);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast('err', 'Geolocation not available on this device.');
      setPickup({ label: 'Cedar Park Station', sub: 'Estimated pickup', coords: DEFAULT_CENTER });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setPickup({ label: 'My current location', sub: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`, coords: { lat: pos.coords.latitude, lng: pos.coords.longitude } });
        toast('info', 'Pickup pinned to your location.');
      },
      () => {
        setLocating(false);
        setPickup({ label: 'Cedar Park Station', sub: 'Estimated pickup', coords: DEFAULT_CENTER });
        toast('info', 'Using an estimated pickup — permission denied.');
      },
      { timeout: 6000 },
    );
  };

  const handleBook = async () => {
    if (!user || !pickup || !dropoff || !quote) return;
    setBookError(null); setBooking(true);
    try {
      const trip = await bookTrip({ passengerId: user.id, pickup, dropoff, distanceMi: quote.distanceMi, fare: quote.fare });
      toast('ok', 'Booked. Looking for a nearby driver.');
      nav(`/passenger/trip/${trip.id}`);
    } catch (err) {
      setBookError(err instanceof ApiError ? err.message : 'Could not book your ride.');
    } finally {
      setBooking(false);
    }
  };

  const canQuote = pickup && dropoff;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <PageHead
        eyebrow="Passenger · Book"
        title={<>Where are you <span className="sr-italic">going</span>?</>}
        lede="Pin a pickup, search for a dropoff, and we'll quote the fare before you commit."
      />

      <div className="grid lg:grid-cols-[1fr_420px] gap-6">
        <div>
          <Map pickup={pickup?.coords} dropoff={dropoff?.coords} height={520} />
          <div className="mt-3 text-[12px] text-ink-3 font-mono">
            Tiles © OpenStreetMap contributors · Leaflet
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="sr-card p-4">
            <div className="sr-eyebrow mb-3">Pickup</div>
            {pickup ? (
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[15px] font-medium">{pickup.label}</div>
                  {pickup.sub && <div className="sr-small mt-0.5">{pickup.sub}</div>}
                </div>
                <button className="sr-btn sr-btn--ghost sr-btn--sm" onClick={() => setPickup(null)}>Change</button>
              </div>
            ) : (
              <button className="sr-btn sr-btn--secondary sr-btn--block" onClick={useMyLocation} disabled={locating}>
                <Icon name="locate" size={16} />
                {locating ? 'Locating…' : 'Use my current location'}
              </button>
            )}
          </div>

          <div className="sr-card p-4">
            <div className="sr-eyebrow mb-3">Dropoff</div>
            {dropoff ? (
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[15px] font-medium">{dropoff.label}</div>
                  {dropoff.sub && <div className="sr-small mt-0.5">{dropoff.sub}</div>}
                </div>
                <button className="sr-btn sr-btn--ghost sr-btn--sm" onClick={() => { setDropoff(null); setQuery(''); }}>Change</button>
              </div>
            ) : (
              <>
                <div className="relative mb-3">
                  <Icon name="search" size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--sr-ink-3)' }} />
                  <input
                    className="sr-input"
                    style={{ paddingLeft: 38 }}
                    placeholder="Search a dropoff (3+ characters)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>

                {searching && <div className="sr-small">Searching…</div>}
                {!searching && query.length >= 3 && results.length === 0 && (
                  <div className="sr-small">No places matching <strong>{query}</strong>.</div>
                )}
                {results.length > 0 && (
                  <ul className="flex flex-col divide-y divide-line -mx-1">
                    {results.map((r) => (
                      <li key={r.id}>
                        <button
                          className="w-full text-left px-3 py-2.5 hover:bg-surface-2 rounded transition"
                          onClick={() => { setDropoff(r.place); setQuery(''); }}
                        >
                          <div className="text-[14px]">{r.label}</div>
                          {r.place.sub && <div className="sr-small">{r.place.sub}</div>}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {suggestions.length > 0 && results.length === 0 && query.length < 3 && (
                  <div className="mt-1">
                    <div className="sr-eyebrow mb-2">Quick picks</div>
                    <div className="flex gap-2 flex-wrap">
                      {suggestions.map((s) => (
                        <button
                          key={s.id}
                          className="sr-sugchip"
                          onClick={() => setDropoff(s.place)}
                        >
                          <span className="sr-sugchip__icon"><Icon name={s.icon as Parameters<typeof Icon>[0]['name']} size={12} /></span>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="sr-card p-4">
            <div className="sr-eyebrow mb-3">Fare estimate</div>
            {!canQuote && <div className="sr-small">Set a pickup and dropoff to see distance and fare.</div>}
            {canQuote && !quote && (
              <div className="flex flex-col gap-2">
                <div className="sr-skel h-4 w-1/2" />
                <div className="sr-skel h-8 w-1/3" />
              </div>
            )}
            {quote && (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="sr-num text-[14px] text-ink-3">$</span>
                  <span className="sr-num text-[40px] leading-none tracking-tight">{quote.fare.toFixed(2)}</span>
                </div>
                <div className="sr-small mt-2">{quote.distanceMi} mi · ~{quote.minutes} min</div>
              </>
            )}
          </div>

          {bookError && <InlineError message={bookError} onRetry={() => setBookError(null)} />}

          <button
            className="sr-btn sr-btn--primary sr-btn--lg sr-btn--block"
            disabled={!quote || booking}
            onClick={handleBook}
          >
            {booking ? 'Booking…' : <>Book ride <Icon name="arrow-right" size={14} /></>}
          </button>
        </aside>
      </div>
    </div>
  );
}
