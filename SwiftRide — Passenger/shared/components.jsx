/* global React */
// SwiftRide — shared components
// Uses CSS classes from shared/tokens.css

const { useState, useEffect, useRef, useMemo } = React;

// ============================================================
// LOGO / WORDMARK
// ============================================================
const SwiftRideMark = ({ size = 22, mono = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    {/* a fast-forward chevron stack — reads as motion + s/r initials */}
    <path d="M3 6.5 L11 12 L3 17.5 Z" fill={mono ? 'currentColor' : 'var(--sr-accent)'} />
    <path d="M11 6.5 L19 12 L11 17.5 Z" fill="currentColor" opacity={mono ? 0.5 : 1} />
  </svg>
);

const SwiftRideLogo = ({ mono = false }) => (
  <span className="sr-topbar__logo" style={{ color: 'inherit' }}>
    <SwiftRideMark size={22} mono={mono} />
    <span style={{ fontFeatureSettings: '"ss01"' }}>
      Swift<span style={{ fontStyle: 'italic', fontFamily: 'Instrument Serif, serif', fontWeight: 400, letterSpacing: '-0.02em' }}>Ride</span>
    </span>
  </span>
);

// ============================================================
// ICONS (lucide-style, inline)
// ============================================================
const Icon = ({ name, size = 16, stroke = 1.75, style }) => {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round', style };
  const paths = {
    'map-pin':    <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>,
    'locate':     <><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M22 12h-3M5 12H2"/></>,
    'search':     <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
    'arrow-right':<><path d="M5 12h14M13 5l7 7-7 7"/></>,
    'arrow-left': <><path d="M19 12H5M11 5l-7 7 7 7"/></>,
    'clock':      <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    'phone':      <><path d="M22 16.92V21a1 1 0 0 1-1.09 1 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 3.18 4.09 1 1 0 0 1 4.17 3h4.09a1 1 0 0 1 1 .75l1 3.5a1 1 0 0 1-.29 1l-1.72 1.72a16 16 0 0 0 6 6l1.72-1.72a1 1 0 0 1 1-.29l3.5 1a1 1 0 0 1 .75 1Z"/></>,
    'star':       <><path d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2Z"/></>,
    'star-fill':  <path d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2Z" fill="currentColor"/>,
    'check':      <><path d="m5 12 5 5L20 7"/></>,
    'x':          <><path d="M18 6 6 18M6 6l12 12"/></>,
    'printer':    <><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></>,
    'receipt':    <><path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 1 2V2z"/><path d="M8 7h8M8 11h8M8 15h5"/></>,
    'history':    <><path d="M3 3v5h5"/><path d="M3.05 13a9 9 0 1 0 2.13-6.36L3 8"/><path d="M12 7v5l3 2"/></>,
    'user':       <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    'log-out':    <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/></>,
    'plus':       <><path d="M12 5v14M5 12h14"/></>,
    'chevron-right': <><path d="m9 6 6 6-6 6"/></>,
    'chevron-down':  <><path d="m6 9 6 6 6-6"/></>,
    'home':       <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/></>,
    'briefcase':  <><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>,
    'coffee':     <><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><path d="M6 2v3M10 2v3M14 2v3"/></>,
    'plane':      <><path d="M17.8 19.2 16 11l3.5-3.5a2.12 2.12 0 0 0-3-3L13 8 4.8 6.2a.5.5 0 0 0-.5.8l5 5.5-3.3 3.3a.5.5 0 0 0 0 .7l1.5 1.5a.5.5 0 0 0 .7 0L11.5 15l5.5 5a.5.5 0 0 0 .8-.5Z"/></>,
    'menu':       <><path d="M3 6h18M3 12h18M3 18h18"/></>,
    'info':       <><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/></>,
    'alert':      <><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/></>,
    'shield':     <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></>,
    'credit-card':<><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></>,
    'route':      <><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M12 19h4a3 3 0 0 0 0-6H8a3 3 0 0 1 0-6h4"/></>,
    'car':        <><path d="M3 17h18v-4l-2-5H5l-2 5Z"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
};

// ============================================================
// TOPBAR
// ============================================================
const Topbar = ({ active = 'book', passengerName = 'Mira Whitfield' }) => {
  const nav = [
    { id: 'book',    href: '#book',    label: 'Book a ride', icon: 'plus' },
    { id: 'trip',    href: '#trip',    label: 'Active trip', icon: 'route' },
    { id: 'history', href: '#history', label: 'History',     icon: 'history' },
    { id: 'states',  href: '#states',  label: 'States',      icon: 'info' },
  ];
  return (
    <header className="sr-topbar">
      <div className="sr-topbar__left">
        <SwiftRideLogo />
        <span style={{ opacity: 0.25, fontFamily: 'var(--sr-mono)', fontSize: 11, letterSpacing: '0.15em' }}>/</span>
        <span className="sr-topbar__status">
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7FD49B', boxShadow: '0 0 8px #7FD49B' }} />
          Passenger
        </span>
        <nav className="sr-topbar__nav" style={{ marginLeft: 16 }}>
          {nav.map(n => (
            <a key={n.id} href={n.href} className={active === n.id ? 'is-active' : ''}>
              <Icon name={n.icon} size={14} /> {n.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="sr-topbar__right">
        <span className="sr-topbar__status">
          {new Date().toLocaleString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 16, borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="sr-avatar sr-avatar--sm" style={{ background: 'var(--sr-accent)', color: 'white' }}>
            {passengerName.split(' ').map(n => n[0]).slice(0,2).join('')}
          </div>
          <span style={{ fontSize: 13 }}>{passengerName}</span>
        </div>
      </div>
    </header>
  );
};

// ============================================================
// STATUS CHIP
// ============================================================
const StatusChip = ({ status, live = false }) => {
  const map = {
    Pending:    { cls: 'sr-chip--pending',   label: 'Pending' },
    Accepted:   { cls: 'sr-chip--accepted',  label: 'Accepted' },
    InProgress: { cls: 'sr-chip--progress',  label: 'In progress' },
    Completed:  { cls: 'sr-chip--completed', label: 'Completed' },
    Cancelled:  { cls: 'sr-chip--cancelled', label: 'Cancelled' },
  };
  const s = map[status] || map.Pending;
  return (
    <span className={`sr-chip ${s.cls}`}>
      <span className={`sr-chip__dot ${live ? 'sr-chip__dot--live' : ''}`} />
      {s.label}
    </span>
  );
};

// ============================================================
// STYLIZED SVG MAP — fake tile surface, recognizable geography
// ============================================================
const StylizedMap = ({
  height = 500,
  pickup = { x: 28, y: 62 },        // percent
  dropoff = { x: 74, y: 34 },
  driver = null,                     // { x, y } or null
  showRoute = true,
  showDriverPath = false,
  interactive = false,
  attribution = true,
}) => {
  // Build a wobbly route between pickup & dropoff
  const routePath = useMemo(() => {
    const p1 = { x: pickup.x, y: pickup.y };
    const p2 = { x: dropoff.x, y: dropoff.y };
    const mx = (p1.x + p2.x) / 2;
    const my = (p1.y + p2.y) / 2;
    // two via points for a plausible road path
    const v1 = { x: mx - 8, y: p1.y - 6 };
    const v2 = { x: mx + 6, y: p2.y + 4 };
    return `M ${p1.x} ${p1.y} C ${v1.x} ${v1.y}, ${mx - 3} ${my}, ${mx} ${my} S ${v2.x} ${v2.y}, ${p2.x} ${p2.y}`;
  }, [pickup.x, pickup.y, dropoff.x, dropoff.y]);

  return (
    <div style={{
      position: 'relative', width: '100%', height,
      background: '#EEE9DE',
      borderRadius: 'var(--sr-r-3)',
      overflow: 'hidden',
      border: '1px solid var(--sr-line)',
    }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#E0D9C8" strokeWidth="0.2"/>
          </pattern>
          <pattern id="buildings" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="3" height="3" fill="#E5DFD0"/>
            <rect x="4" y="4" width="2" height="2" fill="#E5DFD0"/>
            <rect x="5" y="0" width="2" height="2" fill="#E5DFD0"/>
            <rect x="0" y="5" width="2" height="2" fill="#E5DFD0"/>
          </pattern>
        </defs>

        {/* parks / green blobs */}
        <path d="M 8 8 Q 18 4 28 12 Q 22 22 10 20 Z" fill="#D7DEC5" />
        <path d="M 60 72 Q 78 68 88 78 Q 80 92 62 88 Z" fill="#D7DEC5" />
        <path d="M 40 4 Q 52 2 58 10 Q 52 18 42 16 Z" fill="#D7DEC5" />

        {/* water */}
        <path d="M 0 78 Q 20 74 40 82 Q 60 90 80 84 Q 95 80 100 86 L 100 100 L 0 100 Z" fill="#CDD9DE" />
        <path d="M 78 0 L 100 0 L 100 22 Q 88 18 82 10 Z" fill="#CDD9DE" />

        {/* building fills for blocks */}
        <rect x="32" y="26" width="24" height="22" fill="url(#buildings)" opacity="0.5" />
        <rect x="6" y="42" width="18" height="26" fill="url(#buildings)" opacity="0.4" />
        <rect x="60" y="14" width="22" height="18" fill="url(#buildings)" opacity="0.5" />

        {/* grid */}
        <rect width="100" height="100" fill="url(#grid)" />

        {/* major roads (horizontal) */}
        {[20, 38, 56, 72].map(y => (
          <line key={`h${y}`} x1="0" y1={y} x2="100" y2={y} stroke="#F7F5F1" strokeWidth="1.4" />
        ))}
        {[18, 40, 62, 84].map(x => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="100" stroke="#F7F5F1" strokeWidth="1.4" />
        ))}
        {/* minor roads */}
        {[10, 28, 48, 66, 80, 92].map(y => (
          <line key={`hm${y}`} x1="0" y1={y} x2="100" y2={y} stroke="#F7F5F1" strokeWidth="0.5" opacity="0.7" />
        ))}
        {[8, 30, 50, 72, 92].map(x => (
          <line key={`vm${x}`} x1={x} y1="0" x2={x} y2="100" stroke="#F7F5F1" strokeWidth="0.5" opacity="0.7" />
        ))}
        {/* a diagonal boulevard for personality */}
        <line x1="0" y1="90" x2="100" y2="10" stroke="#F7F5F1" strokeWidth="1.1" opacity="0.9" />

        {/* labels */}
        <text x="12" y="12" fill="#9A9386" fontSize="2.2" fontFamily="Geist Mono, monospace" letterSpacing="0.2">CEDAR PARK</text>
        <text x="64" y="82" fill="#9A9386" fontSize="2.2" fontFamily="Geist Mono, monospace" letterSpacing="0.2">HARBOR GREEN</text>
        <text x="86" y="76" fill="#8FA4AF" fontSize="2.4" fontFamily="Fraunces, serif" fontStyle="italic">Bay</text>
        <text x="46" y="38" fill="#9A9386" fontSize="2" fontFamily="Geist Mono, monospace" letterSpacing="0.2">MIDTOWN</text>

        {/* route */}
        {showRoute && (
          <>
            <path d={routePath} stroke="#171512" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeDasharray="0.6 1.2" opacity="0.3" />
            <path d={routePath} stroke="var(--sr-accent)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          </>
        )}

        {/* driver path (accepted→pickup dashed trail) */}
        {driver && showDriverPath && (
          <path
            d={`M ${driver.x} ${driver.y} Q ${(driver.x + pickup.x) / 2 + 4} ${(driver.y + pickup.y) / 2 - 6}, ${pickup.x} ${pickup.y}`}
            stroke="var(--sr-ink-3)" strokeWidth="0.8" fill="none" strokeDasharray="1 1.5" opacity="0.8"
          />
        )}
      </svg>

      {/* Markers (HTML overlay so we can use real typography) */}
      <MapMarker type="pickup"  pos={pickup} label="Pickup" />
      <MapMarker type="dropoff" pos={dropoff} label="Dropoff" />
      {driver && <MapMarker type="driver" pos={driver} label="Driver" />}

      {/* compass + scale + attribution */}
      {attribution && (
        <>
          <div style={{
            position: 'absolute', top: 12, right: 12,
            background: 'rgba(255,255,255,0.9)',
            border: '1px solid var(--sr-line)',
            borderRadius: 4, padding: '6px 8px',
            fontFamily: 'var(--sr-mono)', fontSize: 10,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--sr-ink-3)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <svg width="10" height="10" viewBox="0 0 10 10"><path d="M5 0 L7 5 L5 4 L3 5 Z" fill="currentColor" /></svg>
            N
          </div>
          <div style={{
            position: 'absolute', bottom: 12, left: 12,
            fontFamily: 'var(--sr-mono)', fontSize: 10,
            color: 'var(--sr-ink-3)',
            background: 'rgba(255,255,255,0.85)',
            padding: '3px 6px', borderRadius: 2,
          }}>
            0 ─── 500m
          </div>
          <div style={{
            position: 'absolute', bottom: 12, right: 12,
            fontFamily: 'var(--sr-mono)', fontSize: 9,
            color: 'var(--sr-ink-4)',
            background: 'rgba(255,255,255,0.85)',
            padding: '3px 6px', borderRadius: 2,
          }}>
            © OpenStreetMap · Leaflet
          </div>
        </>
      )}
    </div>
  );
};

const MapMarker = ({ type, pos, label }) => {
  const colors = {
    pickup:  { bg: '#171512', ring: '#F7F5F1', icon: <Icon name="locate" size={10} /> },
    dropoff: { bg: 'var(--sr-accent)', ring: '#F7F5F1', icon: <Icon name="map-pin" size={10} /> },
    driver:  { bg: '#1B4C9A', ring: '#F7F5F1', icon: <Icon name="car" size={10} /> },
  }[type];
  return (
    <div style={{
      position: 'absolute',
      left: `${pos.x}%`, top: `${pos.y}%`,
      transform: 'translate(-50%, -100%)',
      pointerEvents: 'none',
    }}>
      <div style={{
        width: 28, height: 28,
        background: colors.bg,
        border: `2px solid ${colors.ring}`,
        borderRadius: '50% 50% 50% 0',
        transform: 'rotate(-45deg)',
        display: 'grid', placeItems: 'center',
        color: 'white',
        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
      }}>
        <div style={{ transform: 'rotate(45deg)' }}>{colors.icon}</div>
      </div>
      {type === 'driver' && (
        <div style={{
          position: 'absolute', inset: -6,
          borderRadius: '50%',
          border: '2px solid rgba(27,76,154,0.3)',
          animation: 'sr-pulse 1.8s ease-out infinite',
          transformOrigin: 'center 70%',
        }} />
      )}
      <div style={{
        position: 'absolute', top: 32, left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'var(--sr-mono)', fontSize: 10,
        background: 'var(--sr-ink)', color: 'var(--sr-bg)',
        padding: '2px 6px', borderRadius: 2,
        letterSpacing: '0.06em', textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}>
        {label}
      </div>
    </div>
  );
};

// ============================================================
// STAR RATING
// ============================================================
const StarRating = ({ value = 4.5, size = 14, interactive = false, onChange }) => {
  const [hover, setHover] = useState(null);
  const shown = hover ?? value;
  return (
    <span style={{ display: 'inline-flex', gap: 2, color: 'var(--sr-accent)' }}>
      {[1,2,3,4,5].map(i => (
        <span
          key={i}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(null)}
          onClick={() => interactive && onChange?.(i)}
          style={{ cursor: interactive ? 'pointer' : 'default', display: 'inline-flex' }}
        >
          <Icon name={i <= Math.round(shown) ? 'star-fill' : 'star'} size={size} stroke={1.5} />
        </span>
      ))}
    </span>
  );
};

// ============================================================
// BREADCRUMB / PAGE HEAD
// ============================================================
const PageHead = ({ eyebrow, title, lede, actions }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 28, flexWrap: 'wrap' }}>
    <div style={{ maxWidth: 680 }}>
      {eyebrow && <div className="sr-eyebrow" style={{ marginBottom: 10 }}>{eyebrow}</div>}
      <h1 className="sr-h1" style={{ margin: 0 }}>{title}</h1>
      {lede && <p className="sr-body" style={{ marginTop: 10, maxWidth: 560, color: 'var(--sr-ink-2)' }}>{lede}</p>}
    </div>
    {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
  </div>
);

// Expose
Object.assign(window, {
  SwiftRideMark, SwiftRideLogo,
  Icon, Topbar, StatusChip,
  StylizedMap, MapMarker,
  StarRating, PageHead,
});
