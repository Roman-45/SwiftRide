/* global React, Topbar, StatusChip, StylizedMap, Icon, StarRating, PageHead */

const ActiveTripScreen = () => {
  const [phase, setPhase] = React.useState('Accepted'); // Pending | Accepted | InProgress | Completed | Timeout | DriverCancelled
  const [showRating, setShowRating] = React.useState(false);

  // Fare-lock countdown (60s) when Accepted
  const [fareLock, setFareLock] = React.useState(60);
  React.useEffect(() => {
    if (phase !== 'Accepted') { setFareLock(60); return; }
    const id = setInterval(() => setFareLock(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [phase]);

  // simulate driver motion toward pickup
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

  // step the ETA down as driver gets closer
  const eta = React.useMemo(() => {
    if (phase === 'Pending') return null;
    if (phase === 'Accepted') {
      const d = Math.hypot(28 - driverPos.x, 62 - driverPos.y);
      return Math.max(1, Math.round(d / 3));
    }
    if (phase === 'InProgress') return 9;
    return null;
  }, [phase, driverPos]);

  React.useEffect(() => {
    if (phase === 'Completed') setShowRating(true);
  }, [phase]);

  return (
    <>
      <Topbar active="trip" />
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 24px 48px' }}>
        {/* Header strip */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="sr-eyebrow">Trip №&nbsp;t_8f2d91a3</div>
            <span style={{ color: 'var(--sr-line-2)' }}>·</span>
            <StatusChip status={phase} live={phase === 'Accepted' || phase === 'InProgress'} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--sr-mono)', fontSize: 11, color: 'var(--sr-ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sr-ok)' }} />
            Live · polling every 5s
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 24, alignItems: 'start' }}>
          {/* LEFT: map */}
          <div style={{ position: 'relative' }}>
            <StylizedMap
              height={620}
              pickup={{ x: 28, y: 62 }}
              dropoff={{ x: 74, y: 34 }}
              driver={phase === 'Pending' ? null : (phase === 'InProgress' ? { x: 50, y: 48 } : driverPos)}
              showRoute={true}
              showDriverPath={phase === 'Accepted'}
            />

            {/* Phase selector (demo helper) */}
            <div style={{
              position: 'absolute', bottom: 16, left: 16,
              background: 'var(--sr-surface)', border: '1px solid var(--sr-line)',
              borderRadius: 'var(--sr-r-3)', padding: 6, display: 'flex', gap: 2,
              boxShadow: 'var(--sr-shadow-1)',
            }}>
              <span className="sr-micro" style={{ padding: '6px 10px', color: 'var(--sr-ink-4)' }}>Demo phase:</span>
              {['Pending','Accepted','InProgress','Completed','Timeout','DriverCancelled'].map(p => (
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
            <ETACard phase={phase} eta={eta} />

            {phase === 'Pending' ? (
              <PendingCard />
            ) : (phase === 'Timeout' || phase === 'DriverCancelled') ? (
              <InterruptedCard phase={phase} />
            ) : (
              <DriverCard phase={phase} />
            )}

            {phase !== 'Timeout' && phase !== 'DriverCancelled' && <RouteStrip phase={phase} />}

            {/* Fare-lock countdown — only while Accepted */}
            {phase === 'Accepted' && (
              <div className="sr-card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 10, background: fareLock > 0 ? 'var(--sr-accent-soft)' : 'var(--sr-surface-2)', borderColor: fareLock > 0 ? 'var(--sr-accent-edge)' : 'var(--sr-line)' }}>
                <Icon name="clock" size={14} style={{ color: fareLock > 0 ? 'var(--sr-accent-hover)' : 'var(--sr-ink-3)' }} />
                <div className="sr-small" style={{ flex: 1, color: 'var(--sr-ink-2)' }}>
                  {fareLock > 0 ? <>Free to cancel for <strong style={{ fontWeight: 600, fontFamily: 'var(--sr-mono)', color: 'var(--sr-accent-hover)' }}>0:{String(fareLock).padStart(2,'0')}</strong></> : <>Cancel fee <strong style={{ fontWeight: 600 }}>$3.00</strong> applies now.</>}
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8 }}>
              {(phase === 'Pending' || phase === 'Accepted') && (
                <button className="sr-btn sr-btn--danger sr-btn--block">
                  <Icon name="x" size={14} /> {phase === 'Accepted' && fareLock === 0 ? 'Cancel ride · $3.00' : 'Cancel ride'}
                </button>
              )}
              {phase === 'Completed' && (
                <a href="#receipt" className="sr-btn sr-btn--secondary sr-btn--block">
                  <Icon name="receipt" size={14} /> View receipt
                </a>
              )}
              {(phase === 'Timeout' || phase === 'DriverCancelled') && (
                <>
                  <a href="#book" className="sr-btn sr-btn--primary sr-btn--block">
                    <Icon name="arrow-right" size={14} /> Try again
                  </a>
                  <a href="#history" className="sr-btn sr-btn--secondary">History</a>
                </>
              )}
            </div>

            {/* Safety strip */}
            <div className="sr-card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12, background: 'var(--sr-surface-2)' }}>
              <Icon name="shield" size={16} style={{ color: 'var(--sr-ink-3)', flexShrink: 0 }} />
              <div className="sr-small">
                Your live location is shared with SwiftRide until the trip ends. Share trip status with a trusted contact →
              </div>
            </div>
          </div>
        </div>
      </main>

      {showRating && <RatingModal onClose={() => setShowRating(false)} />}
    </>
  );
};

// --- Interrupted card (timeout / driver cancelled) ---
const InterruptedCard = ({ phase }) => {
  const cfg = phase === 'Timeout'
    ? { title: 'No drivers available', body: 'We couldn\'t match you with a driver after 2 minutes of searching. No charge — try again or adjust pickup.', icon: 'clock' }
    : { title: 'Your driver cancelled', body: 'Dan Rivera had to cancel the ride. No charge — we\'re finding you another driver, or you can try again.', icon: 'alert' };
  return (
    <div className="sr-card" style={{ padding: 20, borderColor: 'var(--sr-err)', background: 'var(--sr-err-soft)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 32, height: 32, background: 'var(--sr-err)', borderRadius: 4, display: 'grid', placeItems: 'center', color: 'white', flexShrink: 0 }}>
          <Icon name={cfg.icon} size={16} />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--sr-serif)', fontSize: 20, lineHeight: 1.2, marginBottom: 4 }}>{cfg.title}</div>
          <div className="sr-small" style={{ color: 'var(--sr-ink-2)' }}>{cfg.body}</div>
        </div>
      </div>
    </div>
  );
};

// --- ETA card (prominent number) ---
const ETACard = ({ phase, eta }) => {
  if (phase === 'Pending') {
    return (
      <div className="sr-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--sr-warn)', borderRightColor: 'transparent', animation: 'sr-spin 1.1s linear infinite' }} />
        <div>
          <div className="sr-eyebrow" style={{ marginBottom: 2 }}>Status</div>
          <div style={{ fontFamily: 'var(--sr-serif)', fontSize: 20 }}>Looking for a driver…</div>
          <div className="sr-small">Usually under 40 seconds in Cedar Park.</div>
        </div>
        <style>{`@keyframes sr-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }
  if (phase === 'Timeout' || phase === 'DriverCancelled') {
    return (
      <div className="sr-card" style={{ padding: 20 }}>
        <div className="sr-eyebrow" style={{ marginBottom: 6 }}>Trip ended</div>
        <div style={{ fontFamily: 'var(--sr-serif)', fontSize: 28, lineHeight: 1.1, marginBottom: 4 }}>
          {phase === 'Timeout' ? <>Search <span className="sr-italic">timed out</span>.</> : <><span className="sr-italic">Cancelled</span> by driver.</>}
        </div>
        <div className="sr-small">No fare charged · see details below</div>
      </div>
    );
  }
  if (phase === 'Completed') {
    return (
      <div className="sr-card" style={{ padding: 20 }}>
        <div className="sr-eyebrow" style={{ marginBottom: 6 }}>Arrived</div>
        <div style={{ fontFamily: 'var(--sr-serif)', fontSize: 28, lineHeight: 1.1, marginBottom: 4 }}>
          You made it to <span className="sr-italic">Ashland Tower</span>.
        </div>
        <div className="sr-small">Trip complete · $14.80 charged to Visa •• 4417</div>
      </div>
    );
  }
  return (
    <div className="sr-card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <span className="sr-eyebrow">{phase === 'Accepted' ? 'Driver arriving in' : 'Arriving in'}</span>
        <span className="sr-micro">{phase === 'Accepted' ? 'to pickup' : 'to dropoff'}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span className="sr-num" style={{ fontSize: 56, lineHeight: 1, letterSpacing: '-0.02em', color: 'var(--sr-ink)' }}>
          {eta}
        </span>
        <span style={{ fontFamily: 'var(--sr-serif)', fontSize: 22, color: 'var(--sr-ink-2)' }}>min</span>
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--sr-mono)', fontSize: 11, color: 'var(--sr-ink-3)' }}>
          {phase === 'Accepted' ? '0.8 mi away' : '2.1 mi left'}
        </span>
      </div>
    </div>
  );
};

// --- Pending card (before driver accepts) ---
const PendingCard = () => (
  <div className="sr-card" style={{ padding: 20 }}>
    <div className="sr-eyebrow" style={{ marginBottom: 10 }}>Dispatching</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[
        { t: 'Reviewing drivers near Cedar Park…', on: true },
        { t: 'Matching against your preferences', on: true },
        { t: 'Sending request to best candidate', on: false },
      ].map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 16, height: 16, borderRadius: '50%',
            border: '1.5px solid var(--sr-line-2)',
            background: s.on ? 'var(--sr-accent)' : 'transparent',
            borderColor: s.on ? 'var(--sr-accent)' : 'var(--sr-line-2)',
            display: 'grid', placeItems: 'center',
          }}>
            {s.on && <Icon name="check" size={10} style={{ color: 'white' }} stroke={2.5} />}
          </div>
          <span style={{ fontSize: 14, color: s.on ? 'var(--sr-ink)' : 'var(--sr-ink-3)' }}>{s.t}</span>
        </div>
      ))}
    </div>
  </div>
);

// --- Driver card (once Accepted) ---
const DriverCard = ({ phase }) => (
  <div className="sr-card" style={{ padding: 0, overflow: 'hidden' }}>
    <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 14, alignItems: 'center' }}>
      <div className="sr-avatar sr-avatar--lg" style={{ background: '#6B645A' }}>DR</div>
      <div>
        <div style={{ fontFamily: 'var(--sr-serif)', fontSize: 20, lineHeight: 1.2 }}>Dan Rivera</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
          <StarRating value={4.9} size={12} />
          <span className="sr-micro" style={{ color: 'var(--sr-ink-3)' }}>4.9 · 1,284 trips</span>
        </div>
      </div>
      <a href="tel:+14155559988" className="sr-btn sr-btn--secondary sr-btn--sm" aria-label="Call driver">
        <Icon name="phone" size={14} /> Call
      </a>
    </div>
    <div className="sr-divider" />
    <div style={{ padding: '14px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, alignItems: 'center' }}>
      <div>
        <div className="sr-micro">Vehicle</div>
        <div style={{ fontSize: 14, marginTop: 2 }}>Toyota Camry · Graphite</div>
      </div>
      <div style={{ textAlign: 'right', borderLeft: '1px solid var(--sr-line)', paddingLeft: 14 }}>
        <div className="sr-micro">Plate</div>
        <div style={{ fontFamily: 'var(--sr-mono)', fontSize: 15, letterSpacing: '0.08em', marginTop: 2 }}>7LM·A442</div>
      </div>
    </div>
  </div>
);

// --- Route strip ---
const RouteStrip = ({ phase }) => (
  <div className="sr-card" style={{ padding: 20 }}>
    <div className="sr-eyebrow" style={{ marginBottom: 12 }}>Route</div>
    <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr', gap: 10 }}>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--sr-ink)' }} />
        <div style={{ flex: 1, borderLeft: '2px dotted var(--sr-ink-4)', width: 0, margin: '4px 0' }} />
        <div style={{ width: 10, height: 10, background: 'var(--sr-accent)', transform: 'rotate(45deg)' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div className="sr-small" style={{ color: phase === 'InProgress' || phase === 'Completed' ? 'var(--sr-ink-4)' : 'var(--sr-ink-3)' }}>Pickup</div>
          <div style={{ fontSize: 14, color: 'var(--sr-ink)', textDecoration: phase === 'InProgress' || phase === 'Completed' ? 'line-through' : 'none', textDecorationColor: 'var(--sr-ink-4)' }}>
            312 Juniper St, Cedar Park
          </div>
        </div>
        <div>
          <div className="sr-small">Dropoff</div>
          <div style={{ fontSize: 14 }}>Ashland Tower, 410 Market St</div>
        </div>
      </div>
    </div>
    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px dashed var(--sr-line-2)', display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--sr-mono)', fontSize: 11, color: 'var(--sr-ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
      <span>3.4 mi · 12 min</span>
      <span style={{ color: 'var(--sr-ink)' }}>$14.80 fixed</span>
    </div>
  </div>
);

// --- Rating modal ---
const RatingModal = ({ onClose }) => {
  const [stars, setStars] = React.useState(5);
  const [tip, setTip] = React.useState(3);
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(23,21,18,0.55)',
      display: 'grid', placeItems: 'center', zIndex: 50, padding: 24,
      animation: 'sr-fade 160ms ease-out',
    }}>
      <style>{`@keyframes sr-fade { from { opacity: 0 } to { opacity: 1 } }`}</style>
      <div className="sr-card sr-card--pop" style={{ maxWidth: 480, width: '100%', padding: 32, position: 'relative' }}>
        <button className="sr-btn sr-btn--ghost sr-btn--sm" onClick={onClose} style={{ position: 'absolute', top: 12, right: 12 }}>
          <Icon name="x" size={14} />
        </button>
        <div className="sr-eyebrow" style={{ marginBottom: 10 }}>Trip complete · $14.80</div>
        <h2 className="sr-h2" style={{ margin: 0, marginBottom: 18 }}>
          How was your ride with <span className="sr-italic">Dan</span>?
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--sr-bg)', borderRadius: 'var(--sr-r-3)', border: '1px solid var(--sr-line)', marginBottom: 18 }}>
          <div className="sr-avatar" style={{ background: '#6B645A' }}>DR</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--sr-serif)', fontSize: 16 }}>Dan Rivera</div>
            <div className="sr-small">Toyota Camry · 7LM·A442</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 34 }}>
            <StarRating value={stars} size={36} interactive onChange={setStars} />
          </div>
          <div className="sr-small" style={{ marginTop: 6 }}>
            {['','Rough','Okay','Good','Great','Excellent'][stars]}
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div className="sr-label" style={{ marginBottom: 8 }}>Add a tip</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {[0, 2, 3, 5].map(t => (
              <button
                key={t}
                onClick={() => setTip(t)}
                className={`sr-btn ${tip === t ? 'sr-btn--primary' : 'sr-btn--secondary'}`}
                style={{ justifyContent: 'center', padding: '10px' }}
              >
                {t === 0 ? 'None' : `$${t}`}
              </button>
            ))}
          </div>
        </div>

        <textarea className="sr-input" rows="2" placeholder="Leave a note for Dan (optional)" style={{ resize: 'vertical', fontFamily: 'var(--sr-sans)' }} />

        <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
          <button className="sr-btn sr-btn--ghost sr-btn--block" onClick={onClose}>Skip</button>
          <button className="sr-btn sr-btn--primary sr-btn--block" onClick={onClose}>
            Submit rating <Icon name="arrow-right" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

window.ActiveTripScreen = ActiveTripScreen;
