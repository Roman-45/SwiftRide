/* global React, DriverTopbar, StatusChip, StylizedMap, Icon */

// ============================================================
// DRIVER · ACTIVE TRIP
// Brief §1 row 8: passenger name + phone, pickup/dropoff, map,
// Start/Complete (state-gated), status chip, location-sharing indicator.
// DoR (§2):
//   - Accepted → only Start is enabled.
//   - InProgress → only Complete is enabled.
//   - Complete → success toast, return to dashboard.
//   - InProgress → visible cue that location is shared.
// ============================================================
const DriverActiveTripScreen = ({ onComplete }) => {
  const [phase, setPhase] = React.useState('Accepted'); // Accepted | InProgress | Completed
  const [toast, setToast] = React.useState(null);

  // Driver slowly approaches pickup while Accepted, then snaps to mid-route during InProgress.
  const [driverPos, setDriverPos] = React.useState({ x: 14, y: 80 });
  React.useEffect(() => {
    if (phase !== 'Accepted') return;
    const id = setInterval(() => {
      setDriverPos(p => {
        const tx = 28, ty = 62;
        const dx = (tx - p.x) * 0.08;
        const dy = (ty - p.y) * 0.08;
        return { x: p.x + dx, y: p.y + dy };
      });
    }, 800);
    return () => clearInterval(id);
  }, [phase]);

  const trip = {
    id: '8f2d91a3',
    passenger: { name: 'Mira Whitfield', phone: '+1 (415) 555-0142', rating: 4.9, trips: 142 },
    pickup:  { label: '1209 Alder St',   sub: 'Cedar Park · Apt 3B' },
    dropoff: { label: 'Harbor Green Terminal', sub: 'Pier 9 · South Entrance' },
    distance: 3.4,
    estFare:  14.80,
    estMinutes: 12,
  };

  const handleStart = () => {
    setPhase('InProgress');
    setToast({ kind: 'info', text: 'Trip started · location sharing is live.' });
  };
  const handleComplete = () => {
    setPhase('Completed');
    setToast({ kind: 'ok', text: 'Trip complete · earnings added.' });
    // DoR: "When I tap Complete, I see a success toast and return to the dashboard."
    setTimeout(() => { onComplete?.(trip.id); }, 1400);
  };

  // Auto-dismiss toast.
  React.useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(id);
  }, [toast]);

  return (
    <>
      <DriverTopbar active="trip" available={true} />
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 24px 48px' }}>
        {/* Header strip */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="sr-eyebrow">Trip №&nbsp;t_{trip.id}</div>
            <span style={{ color: 'var(--sr-line-2, var(--sr-line))' }}>·</span>
            <StatusChip status={phase} live={phase === 'Accepted' || phase === 'InProgress'} />
          </div>
          <LocationShareIndicator sharing={phase === 'InProgress'} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 24, alignItems: 'start' }}>
          {/* LEFT: map */}
          <div style={{ position: 'relative' }}>
            <StylizedMap
              height={620}
              pickup={{ x: 28, y: 62 }}
              dropoff={{ x: 74, y: 34 }}
              driver={phase === 'InProgress' ? { x: 50, y: 48 } : driverPos}
              showRoute={true}
              showDriverPath={phase === 'Accepted'}
            />

            {/* Demo phase selector */}
            <div style={{
              position: 'absolute', bottom: 16, left: 16,
              background: 'var(--sr-surface)', border: '1px solid var(--sr-line)',
              borderRadius: 'var(--sr-r-3)', padding: 6, display: 'flex', gap: 2,
              boxShadow: 'var(--sr-shadow-1)',
            }}>
              <span className="sr-micro" style={{ padding: '6px 10px', color: 'var(--sr-ink-4)' }}>Demo phase:</span>
              {['Accepted','InProgress','Completed'].map(p => (
                <button
                  key={p}
                  onClick={() => setPhase(p)}
                  className={`sr-btn sr-btn--sm ${phase === p ? 'sr-btn--primary' : 'sr-btn--ghost'}`}
                  style={{ fontFamily: 'var(--sr-mono)', fontSize: 11, letterSpacing: '0.04em', padding: '4px 10px' }}
                >{p}</button>
              ))}
            </div>
          </div>

          {/* RIGHT: driver panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <PassengerCard passenger={trip.passenger} />
            <RouteCard pickup={trip.pickup} dropoff={trip.dropoff} distance={trip.distance} minutes={trip.estMinutes} />
            <FareCard fare={trip.estFare} phase={phase} />
            <ActionBar phase={phase} onStart={handleStart} onComplete={handleComplete} />
          </div>
        </div>

        {/* Toast */}
        {toast && <Toast kind={toast.kind} text={toast.text} />}
      </main>
    </>
  );
};

// ------------------------------------------------------------
// LOCATION SHARE INDICATOR — visible cue that location is live
// ------------------------------------------------------------
const LocationShareIndicator = ({ sharing }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '6px 12px',
    border: '1px solid var(--sr-line)',
    borderRadius: 999,
    background: sharing ? 'var(--sr-accent-soft)' : 'var(--sr-surface)',
    fontFamily: 'var(--sr-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
    color: sharing ? 'var(--sr-accent-hover)' : 'var(--sr-ink-4)',
  }}>
    <span style={{
      width: 8, height: 8, borderRadius: '50%',
      background: sharing ? 'var(--sr-accent)' : 'var(--sr-ink-4)',
      boxShadow: sharing ? '0 0 0 4px rgba(224,83,26,0.18)' : 'none',
      animation: sharing ? 'sr-driver-ping 1.4s infinite' : 'none',
    }} />
    {sharing ? 'Sharing location · 10s' : 'Location paused'}
    <style>{`
      @keyframes sr-driver-ping {
        0%   { box-shadow: 0 0 0 0 rgba(224,83,26,0.45); }
        70%  { box-shadow: 0 0 0 8px rgba(224,83,26,0); }
        100% { box-shadow: 0 0 0 0 rgba(224,83,26,0); }
      }
    `}</style>
  </div>
);

// ------------------------------------------------------------
// PASSENGER CARD — name, phone (tap-to-call), rating
// ------------------------------------------------------------
const PassengerCard = ({ passenger }) => (
  <div className="sr-card" style={{ padding: 18 }}>
    <div className="sr-eyebrow" style={{ marginBottom: 12 }}>Passenger</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div className="sr-avatar" style={{ background: 'var(--sr-accent)', color: 'white', width: 48, height: 48, fontSize: 16 }}>
        {passenger.name.split(' ').map(n => n[0]).slice(0,2).join('')}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--sr-serif)', fontSize: 20, letterSpacing: '-0.01em' }}>{passenger.name}</div>
        <div className="sr-small" style={{ marginTop: 2 }}>
          ★ {passenger.rating.toFixed(1)} · {passenger.trips} trips
        </div>
      </div>
    </div>
    <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
      <a href={`tel:${passenger.phone.replace(/\s/g,'')}`} className="sr-btn sr-btn--secondary sr-btn--sm" style={{ flex: 1 }}>
        <Icon name="phone" size={14} /> {passenger.phone}
      </a>
    </div>
  </div>
);

// ------------------------------------------------------------
// ROUTE CARD — pickup → dropoff with distance + est. time
// ------------------------------------------------------------
const RouteCard = ({ pickup, dropoff, distance, minutes }) => (
  <div className="sr-card" style={{ padding: 18 }}>
    <div className="sr-eyebrow" style={{ marginBottom: 12 }}>Route</div>
    <div style={{ display: 'grid', gridTemplateColumns: '18px 1fr', gap: 10 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, paddingTop: 5 }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--sr-ink)' }} />
        <span style={{ width: 1, flex: 1, minHeight: 28, background: 'var(--sr-line)' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--sr-accent)' }} />
      </div>
      <div style={{ display: 'grid', gap: 16 }}>
        <div>
          <div className="sr-micro">Pickup</div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{pickup.label}</div>
          <div className="sr-small" style={{ marginTop: 2 }}>{pickup.sub}</div>
        </div>
        <div>
          <div className="sr-micro">Dropoff</div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{dropoff.label}</div>
          <div className="sr-small" style={{ marginTop: 2 }}>{dropoff.sub}</div>
        </div>
      </div>
    </div>
    <div style={{
      marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--sr-line)',
      display: 'flex', justifyContent: 'space-between',
      fontFamily: 'var(--sr-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
      color: 'var(--sr-ink-3)',
    }}>
      <span>{distance} mi</span>
      <span>~ {minutes} min</span>
    </div>
  </div>
);

// ------------------------------------------------------------
// FARE CARD
// ------------------------------------------------------------
const FareCard = ({ fare, phase }) => (
  <div className="sr-card" style={{ padding: 18, background: 'var(--sr-surface)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <div className="sr-eyebrow">{phase === 'Completed' ? 'Paid' : 'Estimated fare'}</div>
      <div className="sr-num" style={{ fontSize: 28, letterSpacing: '-0.02em' }}>${fare.toFixed(2)}</div>
    </div>
    <div className="sr-small" style={{ marginTop: 6 }}>
      Breakdown settles once you tap Complete — fare, tip, and platform share.
    </div>
  </div>
);

// ------------------------------------------------------------
// ACTION BAR — Start / Complete, state-gated
// ------------------------------------------------------------
const ActionBar = ({ phase, onStart, onComplete }) => {
  const startEnabled = phase === 'Accepted';
  const completeEnabled = phase === 'InProgress';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <button
        className="sr-btn sr-btn--secondary sr-btn--lg"
        disabled={!startEnabled}
        onClick={onStart}
      >
        <Icon name="car" size={16} /> Start trip
      </button>
      <button
        className="sr-btn sr-btn--primary sr-btn--lg"
        disabled={!completeEnabled}
        onClick={onComplete}
      >
        <Icon name="check" size={16} /> Complete
      </button>
      {/* Gentle explainer so the disabled state never feels silent */}
      <div className="sr-small" style={{ gridColumn: '1 / -1', color: 'var(--sr-ink-3)', marginTop: 2 }}>
        {phase === 'Accepted' && <>Tap <strong>Start</strong> once the passenger is in the car.</>}
        {phase === 'InProgress' && <>Tap <strong>Complete</strong> when you arrive at the dropoff.</>}
        {phase === 'Completed' && <>Trip complete — returning to the dashboard.</>}
      </div>
    </div>
  );
};

// ------------------------------------------------------------
// TOAST
// ------------------------------------------------------------
const Toast = ({ kind, text }) => (
  <div style={{
    position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
    background: 'var(--sr-ink)', color: 'var(--sr-bg)',
    padding: '12px 18px', borderRadius: 'var(--sr-r-2)',
    boxShadow: 'var(--sr-shadow-pop)',
    display: 'inline-flex', alignItems: 'center', gap: 10,
    fontSize: 13, zIndex: 300,
  }}>
    <span style={{
      width: 8, height: 8, borderRadius: '50%',
      background: kind === 'ok' ? '#7FD49B' : 'var(--sr-accent)',
    }} />
    {text}
  </div>
);

window.DriverActiveTripScreen = DriverActiveTripScreen;
