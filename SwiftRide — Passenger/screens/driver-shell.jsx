/* global React, SwiftRideLogo, Icon */

// ============================================================
// DRIVER TOPBAR — same silhouette as the Passenger topbar,
// retuned for driver nav (dashboard, active trip) and identity.
// ============================================================
const DriverTopbar = ({ active = 'dashboard', driverName = 'Dominic Rivera', available = true, onToggleAvailable }) => {
  const nav = [
    { id: 'dashboard', href: '#dashboard', label: 'Dashboard',  icon: 'home' },
    { id: 'trip',      href: '#trip',      label: 'Active trip', icon: 'route' },
  ];
  return (
    <header className="sr-topbar">
      <div className="sr-topbar__left">
        <SwiftRideLogo />
        <span style={{ opacity: 0.25, fontFamily: 'var(--sr-mono)', fontSize: 11, letterSpacing: '0.15em' }}>/</span>
        <span className="sr-topbar__status">
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: available ? '#7FD49B' : '#9A9386',
            boxShadow: available ? '0 0 8px #7FD49B' : 'none',
          }} />
          Driver · {available ? 'Online' : 'Offline'}
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
        {onToggleAvailable && (
          <button
            onClick={onToggleAvailable}
            className={`sr-btn sr-btn--sm ${available ? 'sr-btn--primary' : 'sr-btn--secondary'}`}
            style={{ fontFamily: 'var(--sr-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}
          >
            {available ? 'Go offline' : 'Go online'}
          </button>
        )}
        <span className="sr-topbar__status" style={{ marginLeft: 12 }}>
          {new Date().toLocaleString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 16, borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="sr-avatar sr-avatar--sm" style={{ background: '#1B4C9A', color: 'white' }}>
            {driverName.split(' ').map(n => n[0]).slice(0,2).join('')}
          </div>
          <span style={{ fontSize: 13 }}>{driverName}</span>
        </div>
      </div>
    </header>
  );
};

window.DriverTopbar = DriverTopbar;
