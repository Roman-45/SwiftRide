/* global React, AdminShell, Icon, StatusChip */

// ============================================================
// ADMIN · USERS
// Brief §1 row 10: tabbed table (Passengers / Drivers); driver rows
// show rating + Approve/Suspend; status badges.
// DoR: tabs filter correctly; Approve flips row w/o reload; "No ratings"
// when none present.
// ============================================================
const AdminUsersScreen = () => {
  const [tab, setTab] = React.useState('drivers'); // drivers | passengers
  const [query, setQuery] = React.useState('');
  const [drivers, setDrivers] = React.useState(SEED_DRIVERS);
  const [toast, setToast] = React.useState(null);

  // action: flip driver status optimistically
  const setDriverStatus = (id, nextStatus) => {
    setDrivers(list => list.map(d => d.id === id ? { ...d, status: nextStatus } : d));
    const verb = nextStatus === 'Approved' ? 'approved' : nextStatus === 'Suspended' ? 'suspended' : 'updated';
    setToast({ msg: `Driver ${id} ${verb}`, tone: nextStatus === 'Suspended' ? 'warn' : 'ok' });
    setTimeout(() => setToast(null), 2400);
  };

  const q = query.trim().toLowerCase();
  const filteredDrivers = drivers.filter(d =>
    !q || d.name.toLowerCase().includes(q) || d.id.toLowerCase().includes(q) || d.city.toLowerCase().includes(q)
  );
  const filteredPassengers = SEED_PASSENGERS.filter(p =>
    !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
  );

  const driverCounts = {
    all:       drivers.length,
    pending:   drivers.filter(d => d.status === 'Pending').length,
    approved:  drivers.filter(d => d.status === 'Approved').length,
    suspended: drivers.filter(d => d.status === 'Suspended').length,
  };

  return (
    <AdminShell
      active="users"
      subtitle="Users"
      title={<>People on the <span className="sr-italic">platform</span>.</>}
      rightSlot={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="sr-btn sr-btn--secondary sr-btn--sm">
            <Icon name="arrow-right" size={14} /> Export CSV
          </button>
        </div>
      }
    >
      {/* Segmented tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <div role="tablist" style={{
          display: 'inline-flex', gap: 2, padding: 3,
          background: 'var(--sr-surface-2)',
          border: '1px solid var(--sr-line)',
          borderRadius: 'var(--sr-r-3)',
        }}>
          <TabBtn active={tab === 'drivers'} onClick={() => setTab('drivers')}>
            Drivers <span className="admin-count">{drivers.length}</span>
          </TabBtn>
          <TabBtn active={tab === 'passengers'} onClick={() => setTab('passengers')}>
            Passengers <span className="admin-count">{SEED_PASSENGERS.length}</span>
          </TabBtn>
        </div>

        {/* Search */}
        <div className="sr-input-icon" style={{ flex: '1 1 280px', maxWidth: 440, minWidth: 220 }}>
          <Icon name="search" size={14} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--sr-ink-3)' }} />
          <input
            className="sr-input"
            placeholder={tab === 'drivers' ? 'Search drivers — name, ID, city' : 'Search passengers — name, ID, email'}
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ paddingLeft: 36, width: '100%' }}
          />
        </div>
      </div>

      {/* Filter chips for drivers only */}
      {tab === 'drivers' && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <FilterChip label="All" count={driverCounts.all} active />
          <FilterChip label="Pending approval" count={driverCounts.pending} />
          <FilterChip label="Approved" count={driverCounts.approved} />
          <FilterChip label="Suspended" count={driverCounts.suspended} />
        </div>
      )}

      {/* Tables */}
      <div className="sr-card" style={{ padding: 0, overflow: 'hidden' }}>
        {tab === 'drivers'
          ? <DriversTable rows={filteredDrivers} onAction={setDriverStatus} />
          : <PassengersTable rows={filteredPassengers} />}

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--sr-line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--sr-ink-3)', fontSize: 12 }}>
          <span className="sr-micro">
            Showing <strong style={{ color: 'var(--sr-ink)' }}>{tab === 'drivers' ? filteredDrivers.length : filteredPassengers.length}</strong> of {tab === 'drivers' ? drivers.length : SEED_PASSENGERS.length}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button className="sr-btn sr-btn--ghost sr-btn--sm" disabled>
              <Icon name="arrow-left" size={13} /> Prev
            </button>
            <span className="sr-micro" style={{ padding: '0 10px' }}>Page 1 / 3</span>
            <button className="sr-btn sr-btn--ghost sr-btn--sm">
              Next <Icon name="arrow-right" size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24,
          background: 'var(--sr-ink)', color: 'var(--sr-bg)',
          padding: '12px 16px', borderRadius: 'var(--sr-r-3)',
          boxShadow: 'var(--sr-shadow-pop)',
          display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 13,
          animation: 'sr-toast-in 200ms cubic-bezier(0.2,0,0,1)',
          zIndex: 100,
        }}>
          <span style={{
            width: 22, height: 22, borderRadius: 2,
            background: toast.tone === 'warn' ? 'var(--sr-warn)' : 'var(--sr-ok)',
            color: 'white', display: 'grid', placeItems: 'center', flexShrink: 0,
          }}>
            <Icon name="check" size={12} />
          </span>
          {toast.msg}
          <style>{`@keyframes sr-toast-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
      )}
    </AdminShell>
  );
};

// --- Tab button ---
const TabBtn = ({ active, onClick, children }) => (
  <button
    role="tab"
    aria-selected={active}
    onClick={onClick}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '7px 14px',
      background: active ? 'var(--sr-surface)' : 'transparent',
      color: active ? 'var(--sr-ink)' : 'var(--sr-ink-3)',
      border: 'none',
      borderRadius: 'calc(var(--sr-r-3) - 3px)',
      fontSize: 13, fontWeight: active ? 500 : 400,
      cursor: 'pointer',
      boxShadow: active ? 'var(--sr-shadow-1)' : 'none',
      transition: 'all 120ms',
    }}
  >
    {children}
    <style>{`.admin-count { font-family: var(--sr-mono); font-size: 11px; color: var(--sr-ink-4); background: var(--sr-surface-2); padding: 1px 6px; border-radius: 2px; }`}</style>
  </button>
);

// --- Filter chip (for driver status) ---
const FilterChip = ({ label, count, active }) => (
  <button style={{
    padding: '6px 12px',
    border: `1px solid ${active ? 'var(--sr-ink)' : 'var(--sr-line)'}`,
    background: active ? 'var(--sr-ink)' : 'var(--sr-surface)',
    color: active ? 'var(--sr-bg)' : 'var(--sr-ink-2)',
    borderRadius: 999,
    fontSize: 12, fontWeight: 500,
    cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 6,
  }}>
    {label}
    <span style={{
      fontFamily: 'var(--sr-mono)', fontSize: 10,
      color: active ? 'rgba(255,255,255,0.55)' : 'var(--sr-ink-4)',
    }}>{count}</span>
  </button>
);

// --- Drivers table ---
const DriversTable = ({ rows, onAction }) => (
  <table className="sr-table">
    <thead>
      <tr>
        <th style={{ width: 240 }}>Driver</th>
        <th style={{ width: 100 }}>ID</th>
        <th>City</th>
        <th style={{ width: 110 }}>Rating</th>
        <th style={{ width: 90, textAlign: 'right' }}>Trips</th>
        <th style={{ width: 130 }}>Status</th>
        <th style={{ width: 200 }}></th>
      </tr>
    </thead>
    <tbody>
      {rows.map(d => (
        <tr key={d.id}>
          <td>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="sr-avatar sr-avatar--sm" style={{ background: 'var(--sr-surface-2)', color: 'var(--sr-ink-2)', fontFamily: 'var(--sr-mono)', fontSize: 11 }}>
                {d.name.split(' ').map(n => n[0]).slice(0,2).join('')}
              </div>
              <div>
                <div style={{ fontWeight: 500 }}>{d.name}</div>
                <div className="sr-small" style={{ fontSize: 12 }}>{d.plate}</div>
              </div>
            </div>
          </td>
          <td className="sr-table__num">{d.id}</td>
          <td>{d.city}</td>
          <td>
            {d.tripCount === 0
              ? <span className="sr-small" style={{ color: 'var(--sr-ink-4)', fontStyle: 'italic' }}>No ratings</span>
              : <RatingCell value={d.rating} count={d.ratingCount} />}
          </td>
          <td className="sr-table__num" style={{ textAlign: 'right' }}>{d.tripCount.toLocaleString()}</td>
          <td><DriverStatusChip status={d.status} /></td>
          <td>
            <DriverActions status={d.status} onAction={next => onAction(d.id, next)} />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

// --- Rating cell w/ stars ---
const RatingCell = ({ value, count }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
    <Icon name="star-fill" size={12} style={{ color: 'var(--sr-warn)' }} />
    <span className="sr-num" style={{ fontSize: 14 }}>{value.toFixed(2)}</span>
    <span className="sr-micro" style={{ fontSize: 10 }}>{count}</span>
  </div>
);

// --- Driver status chip (uses our chip classes but w/ distinct labels) ---
const DriverStatusChip = ({ status }) => {
  const map = {
    Pending:   { cls: 'sr-chip--pending',   label: 'Pending approval' },
    Approved:  { cls: 'sr-chip--completed', label: 'Approved' },
    Suspended: { cls: 'sr-chip--cancelled', label: 'Suspended' },
  };
  const s = map[status] || map.Pending;
  return (
    <span className={`sr-chip ${s.cls}`}>
      <span className="sr-chip__dot" />
      {s.label}
    </span>
  );
};

// --- Action buttons per row, state-gated ---
const DriverActions = ({ status, onAction }) => {
  if (status === 'Pending') {
    return (
      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
        <button className="sr-btn sr-btn--ghost sr-btn--sm" onClick={() => onAction('Suspended')}>
          Reject
        </button>
        <button className="sr-btn sr-btn--primary sr-btn--sm" onClick={() => onAction('Approved')}>
          <Icon name="check" size={13} /> Approve
        </button>
      </div>
    );
  }
  if (status === 'Approved') {
    return (
      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
        <button className="sr-btn sr-btn--ghost sr-btn--sm">View</button>
        <button className="sr-btn sr-btn--danger sr-btn--sm" onClick={() => onAction('Suspended')}>
          Suspend
        </button>
      </div>
    );
  }
  if (status === 'Suspended') {
    return (
      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
        <button className="sr-btn sr-btn--ghost sr-btn--sm">View</button>
        <button className="sr-btn sr-btn--secondary sr-btn--sm" onClick={() => onAction('Approved')}>
          Reinstate
        </button>
      </div>
    );
  }
  return null;
};

// --- Passengers table ---
const PassengersTable = ({ rows }) => (
  <table className="sr-table">
    <thead>
      <tr>
        <th style={{ width: 240 }}>Passenger</th>
        <th style={{ width: 100 }}>ID</th>
        <th>Email</th>
        <th style={{ width: 90, textAlign: 'right' }}>Trips</th>
        <th style={{ width: 130 }}>Last ride</th>
        <th style={{ width: 110 }}>Status</th>
      </tr>
    </thead>
    <tbody>
      {rows.map(p => (
        <tr key={p.id}>
          <td>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="sr-avatar sr-avatar--sm" style={{ background: 'var(--sr-accent-soft)', color: 'var(--sr-accent-hover)', fontFamily: 'var(--sr-mono)', fontSize: 11 }}>
                {p.name.split(' ').map(n => n[0]).slice(0,2).join('')}
              </div>
              <div>
                <div style={{ fontWeight: 500 }}>{p.name}</div>
                <div className="sr-small" style={{ fontSize: 12 }}>{p.phone}</div>
              </div>
            </div>
          </td>
          <td className="sr-table__num">{p.id}</td>
          <td className="sr-small" style={{ fontSize: 13, color: 'var(--sr-ink-2)' }}>{p.email}</td>
          <td className="sr-table__num" style={{ textAlign: 'right' }}>{p.trips}</td>
          <td className="sr-small" style={{ fontSize: 12 }}>{p.lastRide}</td>
          <td>
            {p.status === 'Active'
              ? <span className="sr-chip sr-chip--completed"><span className="sr-chip__dot"/>Active</span>
              : <span className="sr-chip sr-chip--neutral"><span className="sr-chip__dot"/>{p.status}</span>}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

// ---------------------------------------------------------------
// SEED DATA
// ---------------------------------------------------------------
const SEED_DRIVERS = [
  { id: 'd_1a2b', name: 'Dan Rivera',      plate: 'LYP 4412 · Civic',  city: 'Cedar Park',   rating: 4.91, ratingCount: 842, tripCount: 1_204, status: 'Approved' },
  { id: 'd_3c4d', name: 'Sofia Park',      plate: 'GHX 9081 · Model 3',city: 'Midtown',      rating: 4.88, ratingCount: 711, tripCount: 984,   status: 'Approved' },
  { id: 'd_5e6f', name: 'Amir Hassan',     plate: 'KJB 2290 · Prius',  city: 'Harbor Green', rating: 4.82, ratingCount: 412, tripCount: 603,   status: 'Approved' },
  { id: 'd_7g8h', name: 'Nadia Brekke',    plate: 'MZP 4401 · Accord', city: 'Cedar Park',   rating: 0, ratingCount: 0, tripCount: 0,         status: 'Pending' },
  { id: 'd_9i0j', name: 'Theo Okonkwo',    plate: 'VRX 1188 · RAV4',   city: 'Midtown',      rating: 0, ratingCount: 0, tripCount: 0,         status: 'Pending' },
  { id: 'd_kk11', name: 'Marcus Okafor',   plate: 'ETT 3390 · Camry',  city: 'Harbor Green', rating: 4.22, ratingCount: 91, tripCount: 118,   status: 'Suspended' },
  { id: 'd_kk12', name: 'Lena Voss',       plate: 'QPR 5504 · Bolt',   city: 'Cedar Park',   rating: 4.76, ratingCount: 228, tripCount: 305,   status: 'Approved' },
  { id: 'd_kk13', name: 'Priya Raman',     plate: 'FZA 7701 · Leaf',   city: 'Harbor Green', rating: 0, ratingCount: 0, tripCount: 0,         status: 'Pending' },
  { id: 'd_kk14', name: 'Tomasz Chen',     plate: 'BWR 2244 · Sentra', city: 'Midtown',      rating: 4.69, ratingCount: 502, tripCount: 712,   status: 'Approved' },
  { id: 'd_kk15', name: 'Jonas Ewald',     plate: 'ORL 8811 · Elantra',city: 'Cedar Park',   rating: 0, ratingCount: 0, tripCount: 0,         status: 'Pending' },
];

const SEED_PASSENGERS = [
  { id: 'p_a1',  name: 'Mira Whitfield',   email: 'mira.w@swift.co',        phone: '+1 (512) 555-0144', trips: 47, lastRide: '2h ago',   status: 'Active' },
  { id: 'p_a2',  name: 'Kwame Osei',       email: 'kwame@osei.me',          phone: '+1 (737) 555-0219', trips: 19, lastRide: '6h ago',   status: 'Active' },
  { id: 'p_a3',  name: 'Juno Blume',       email: 'juno.blume@hey.com',     phone: '+1 (512) 555-2288', trips: 82, lastRide: '9m ago',   status: 'Active' },
  { id: 'p_a4',  name: 'Ravi Arias',       email: 'r.arias@aria.design',    phone: '+1 (512) 555-0677', trips: 3,  lastRide: '11m ago',  status: 'Active' },
  { id: 'p_a5',  name: 'Ling Tan',         email: 'ling.tan@outline.ai',    phone: '+1 (737) 555-4410', trips: 12, lastRide: '14m ago',  status: 'Active' },
  { id: 'p_a6',  name: 'Fleur Dubois',     email: 'fleur@fromblank.com',    phone: '+1 (512) 555-9031', trips: 60, lastRide: '17m ago',  status: 'Active' },
  { id: 'p_a7',  name: 'Osvaldo Ramírez',  email: 'osvaldo.r@cinco.mx',     phone: '+1 (737) 555-7722', trips: 28, lastRide: '22m ago',  status: 'Active' },
  { id: 'p_a8',  name: 'Astrid Lindqvist', email: 'astrid@lindqvist.se',    phone: '+1 (512) 555-3391', trips: 0,  lastRide: 'Never',    status: 'Inactive' },
];

window.AdminUsersScreen = AdminUsersScreen;
