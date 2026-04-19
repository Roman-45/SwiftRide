/* global React, SwiftRideMark, Icon */

// ============================================================
// ADMIN SHELL — sidebar nav; visually distinct from the
// passenger topbar (dark side rail, mono-heavy, operator feel)
// ============================================================
const AdminShell = ({ active = 'dashboard', children, title, subtitle, rightSlot }) => {
  const nav = [
    { id: 'dashboard', href: '#dashboard', label: 'Overview', icon: 'home',      kbd: 'G O' },
    { id: 'users',     href: '#users',     label: 'Users',    icon: 'user',      kbd: 'G U' },
    { id: 'trips',     href: '#trips',     label: 'Trips',    icon: 'route',     kbd: 'G T' },
  ];
  const secondary = [
    { id: 'audit',     href: '#audit',     label: 'Audit log', icon: 'history' },
    { id: 'billing',   href: '#billing',   label: 'Billing',   icon: 'credit-card' },
    { id: 'settings',  href: '#settings',  label: 'Settings',  icon: 'info' },
  ];

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <a href="/" className="admin-sidebar__brand">
          <SwiftRideMark size={20} mono={true} />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span style={{ fontFamily: 'var(--sr-serif)', fontSize: 16, letterSpacing: '-0.01em' }}>SwiftRide</span>
            <span style={{ fontFamily: 'var(--sr-mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9aa0a4' }}>Operations</span>
          </div>
        </a>

        <div className="admin-sidebar__group">
          <div className="admin-sidebar__label">Primary</div>
          {nav.map(n => (
            <a key={n.id} href={n.href} className={`admin-nav ${active === n.id ? 'is-active' : ''}`}>
              <Icon name={n.icon} size={14} />
              <span style={{ flex: 1 }}>{n.label}</span>
              <span className="admin-nav__kbd">{n.kbd}</span>
            </a>
          ))}
        </div>

        <div className="admin-sidebar__group">
          <div className="admin-sidebar__label">Secondary</div>
          {secondary.map(n => (
            <a key={n.id} href={n.href} className="admin-nav admin-nav--muted">
              <Icon name={n.icon} size={14} />
              <span style={{ flex: 1 }}>{n.label}</span>
              <span className="admin-nav__soon">Soon</span>
            </a>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Environment badge */}
        <div className="admin-env">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7FD49B' }} />
            <span style={{ fontFamily: 'var(--sr-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9aa0a4' }}>Production</span>
          </div>
          <div style={{ fontFamily: 'var(--sr-mono)', fontSize: 11, color: '#e6e4df', lineHeight: 1.4 }}>
            api.swiftride.co<br/>
            <span style={{ color: '#9aa0a4' }}>us-east-1 · R9</span>
          </div>
        </div>

        {/* Back-to-passenger link */}
        <a href="SwiftRide Passenger Prototype.html" className="admin-nav admin-nav--footer" style={{ marginTop: 12 }}>
          <Icon name="arrow-left" size={14} />
          <span style={{ flex: 1 }}>Passenger view</span>
        </a>

        {/* Current admin */}
        <div className="admin-user">
          <div className="sr-avatar sr-avatar--sm" style={{ background: '#E0531A', color: 'white', fontFamily: 'var(--sr-mono)', fontSize: 10 }}>EV</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: '#e6e4df', fontWeight: 500 }}>Elena Vargas</div>
            <div style={{ fontFamily: 'var(--sr-mono)', fontSize: 9, color: '#9aa0a4', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Admin · SSO</div>
          </div>
          <Icon name="log-out" size={14} style={{ color: '#9aa0a4' }} />
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        {/* Contextual header */}
        <header className="admin-header">
          <div style={{ flex: 1, minWidth: 0 }}>
            {subtitle && <div className="sr-eyebrow" style={{ marginBottom: 4 }}>{subtitle}</div>}
            {title && <h1 style={{ margin: 0, fontFamily: 'var(--sr-serif)', fontWeight: 400, fontSize: 28, letterSpacing: '-0.015em' }}>{title}</h1>}
          </div>
          {rightSlot}
        </header>
        <div className="admin-content">
          {children}
        </div>
      </div>

      <style>{`
        .admin-shell { display: grid; grid-template-columns: 248px 1fr; min-height: 100vh; background: var(--sr-bg); }

        .admin-sidebar {
          background: #0E0D0B;
          color: #e6e4df;
          display: flex; flex-direction: column;
          padding: 20px 14px;
          border-right: 1px solid #1d1c19;
          position: sticky; top: 0; height: 100vh;
        }
        .admin-sidebar__brand {
          display: flex; align-items: center; gap: 10px;
          color: #e6e4df; text-decoration: none;
          padding: 6px 8px 20px; border-bottom: 1px solid #1d1c19; margin-bottom: 16px;
        }
        .admin-sidebar__group { margin-bottom: 20px; }
        .admin-sidebar__label {
          font-family: var(--sr-mono); font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase;
          color: #6a6f74; padding: 0 8px 8px;
        }
        .admin-nav {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 10px;
          color: #c8c6c1; text-decoration: none;
          border-radius: 4px; font-size: 13px;
          transition: all 120ms cubic-bezier(0.2, 0, 0, 1);
          margin-bottom: 1px;
        }
        .admin-nav:hover { background: rgba(255,255,255,0.04); color: #fff; }
        .admin-nav.is-active {
          background: rgba(224, 83, 26, 0.14);
          color: #fff;
          box-shadow: inset 2px 0 0 var(--sr-accent);
        }
        .admin-nav--muted { color: #8a8d92; }
        .admin-nav--muted:hover { color: #c8c6c1; }
        .admin-nav__kbd {
          font-family: var(--sr-mono); font-size: 10px; letter-spacing: 0.05em;
          color: #6a6f74;
          padding: 2px 6px; border: 1px solid #2a2826; border-radius: 3px;
          background: rgba(255,255,255,0.02);
        }
        .admin-nav__soon {
          font-family: var(--sr-mono); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase;
          color: #6a6f74;
        }
        .admin-nav--footer { color: #9aa0a4; border-top: 1px solid #1d1c19; padding-top: 12px; margin-top: auto; }
        .admin-env {
          padding: 10px 12px; border: 1px solid #1d1c19; border-radius: 6px;
          background: rgba(255,255,255,0.015);
          margin-bottom: 8px;
        }
        .admin-user {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 8px 4px; border-top: 1px solid #1d1c19; margin-top: 8px;
        }

        .admin-main { display: flex; flex-direction: column; min-width: 0; }
        .admin-header {
          display: flex; align-items: flex-end; gap: 20px;
          padding: 28px 40px 20px;
          border-bottom: 1px solid var(--sr-line);
          background: var(--sr-bg);
          position: sticky; top: 0; z-index: 5;
        }
        .admin-content { padding: 28px 40px 80px; }

        @media (max-width: 900px) {
          .admin-shell { grid-template-columns: 1fr; }
          .admin-sidebar { position: relative; height: auto; flex-direction: row; align-items: center; gap: 14px; padding: 14px 20px; overflow-x: auto; }
          .admin-sidebar__brand { border: 0; padding: 0; margin: 0; flex-shrink: 0; }
          .admin-sidebar__group:not(:first-of-type) { display: none; }
          .admin-sidebar__label, .admin-env, .admin-user, .admin-nav--footer { display: none; }
          .admin-sidebar__group { margin: 0; display: flex; gap: 4px; }
          .admin-nav__kbd, .admin-nav__soon { display: none; }
          .admin-header { padding: 20px; position: relative; }
          .admin-content { padding: 20px; }
        }
      `}</style>
    </div>
  );
};

window.AdminShell = AdminShell;
