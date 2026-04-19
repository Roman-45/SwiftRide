/* global React, AdminShell, Icon, StatusChip */

// ============================================================
// ADMIN · DASHBOARD
// Brief §1 row 9: stat tiles (passengers, drivers, approved drivers,
// total/completed/pending trips, revenue); quick links to Users + Trips.
// DoR: all tiles render with numbers (zero fine) — never "undefined".
// ============================================================
const AdminDashboardScreen = () => {
  const stats = [
    { id: 'passengers',    label: 'Passengers',         value: 12_487, delta: '+4.2%', group: 'users' },
    { id: 'drivers',       label: 'Drivers',            value: 842,    delta: '+1.1%', group: 'users' },
    { id: 'approved',      label: 'Approved drivers',   value: 689,    delta: '+3',    group: 'users' },
    { id: 'trips_total',   label: 'Trips, all-time',    value: 94_217, delta: null,    group: 'trips' },
    { id: 'trips_done',    label: 'Trips, completed',   value: 91_803, delta: '97.4% of total', group: 'trips' },
    { id: 'trips_pending', label: 'Trips, pending now', value: 34,     delta: 'live',  group: 'trips', live: true },
    { id: 'revenue',       label: 'Revenue, all-time',  value: 1_489_217.40, prefix: '$', delta: '+$12.4k today', group: 'trips' },
  ];

  return (
    <AdminShell
      active="dashboard"
      subtitle="Overview · last 24h"
      title={<>Good morning, Elena. <span className="sr-italic" style={{ color: 'var(--sr-ink-3)' }}>All systems green.</span></>}
      rightSlot={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="sr-micro">Updated 12 sec ago</span>
          <button className="sr-btn sr-btn--secondary sr-btn--sm">
            <Icon name="clock" size={14} /> Auto-refresh · 30s
          </button>
        </div>
      }
    >
      {/* Hero stat row — revenue gets emphasis */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16, marginBottom: 28 }}>
        <HeroStat stat={stats.find(s => s.id === 'revenue')} span={5} />
        <HeroStat stat={stats.find(s => s.id === 'trips_pending')} span={3} accent="accent" />
        <HeroStat stat={stats.find(s => s.id === 'trips_done')} span={4} />
      </section>

      {/* Secondary stat tiles */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
        {['passengers','drivers','approved','trips_total'].map(id => {
          const s = stats.find(x => x.id === id);
          return <StatTile key={id} {...s} />;
        })}
      </section>

      {/* Two-column: recent trips + pending approvals */}
      <section style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20 }}>
        <QuickLinkPanel
          href="#trips"
          eyebrow="System activity"
          title={<>Last <span className="sr-italic">10</span> trips</>}
          cta="See all trips"
        >
          <RecentTripsMini />
        </QuickLinkPanel>

        <QuickLinkPanel
          href="#users"
          eyebrow="Driver onboarding"
          title={<><span style={{ fontFamily: 'var(--sr-mono)', color: 'var(--sr-accent-hover)' }}>14</span> awaiting approval</>}
          cta="Review queue"
        >
          <PendingApprovalsMini />
        </QuickLinkPanel>
      </section>

      {/* System health footer */}
      <section style={{ marginTop: 32 }}>
        <div className="sr-eyebrow" style={{ marginBottom: 10 }}>System · Section 7 checklist</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <HealthPill label="API" value="200ms p50" ok />
          <HealthPill label="Leaflet tiles" value="OSM live" ok />
          <HealthPill label="Driver polling" value="5s · 10s" ok />
          <HealthPill label="JWT sessions" value="sessionStorage" ok />
        </div>
      </section>
    </AdminShell>
  );
};

// --- Hero stat (big number, colored lane) ---
const HeroStat = ({ stat, span, accent }) => {
  if (!stat) return null;
  const isAccent = accent === 'accent';
  return (
    <a
      href={stat.group === 'trips' ? '#trips' : '#users'}
      className="sr-card"
      style={{
        gridColumn: `span ${span}`,
        padding: '22px 22px 20px',
        textDecoration: 'none', color: 'inherit',
        display: 'flex', flexDirection: 'column',
        background: isAccent ? 'var(--sr-accent-soft)' : 'var(--sr-surface)',
        borderColor: isAccent ? 'var(--sr-accent-edge)' : 'var(--sr-line)',
        transition: 'transform 120ms, box-shadow 120ms',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--sr-shadow-1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <span className="sr-eyebrow" style={{ color: isAccent ? 'var(--sr-accent-hover)' : undefined }}>{stat.label}</span>
        {stat.live && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--sr-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--sr-accent-hover)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sr-accent)', boxShadow: '0 0 0 0 var(--sr-accent)', animation: 'sr-pulse 1.4s infinite' }} />
            Live
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        {stat.prefix && <span className="sr-num" style={{ fontSize: 28, color: 'var(--sr-ink-3)' }}>{stat.prefix}</span>}
        <span className="sr-num" style={{ fontSize: 48, lineHeight: 1, letterSpacing: '-0.02em' }}>
          {formatNumber(stat.value)}
        </span>
      </div>
      {stat.delta && (
        <div className="sr-small" style={{ marginTop: 8, color: isAccent ? 'var(--sr-accent-hover)' : 'var(--sr-ink-3)' }}>
          {stat.delta}
        </div>
      )}
      <style>{`
        @keyframes sr-pulse {
          0% { box-shadow: 0 0 0 0 var(--sr-accent); }
          70% { box-shadow: 0 0 0 6px rgba(224,83,26,0); }
          100% { box-shadow: 0 0 0 0 rgba(224,83,26,0); }
        }
      `}</style>
    </a>
  );
};

// --- Secondary stat tile ---
const StatTile = ({ label, value, delta, prefix, group }) => (
  <a href={group === 'trips' ? '#trips' : '#users'} className="sr-card" style={{ padding: 16, textDecoration: 'none', color: 'inherit', display: 'block' }}>
    <div className="sr-eyebrow" style={{ marginBottom: 8 }}>{label}</div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
      {prefix && <span className="sr-num" style={{ fontSize: 16, color: 'var(--sr-ink-3)' }}>{prefix}</span>}
      <span className="sr-num" style={{ fontSize: 28, lineHeight: 1 }}>{formatNumber(value)}</span>
    </div>
    {delta && <div className="sr-micro" style={{ marginTop: 6 }}>{delta}</div>}
  </a>
);

// --- Quick-link panel wrapping a mini list/table ---
const QuickLinkPanel = ({ href, eyebrow, title, cta, children }) => (
  <div className="sr-card" style={{ padding: 0, overflow: 'hidden' }}>
    <div style={{ padding: '18px 20px 14px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid var(--sr-line)' }}>
      <div>
        <div className="sr-eyebrow" style={{ marginBottom: 4 }}>{eyebrow}</div>
        <div style={{ fontFamily: 'var(--sr-serif)', fontSize: 22, letterSpacing: '-0.01em' }}>{title}</div>
      </div>
      <a href={href} className="sr-btn sr-btn--ghost sr-btn--sm">
        {cta} <Icon name="arrow-right" size={13} />
      </a>
    </div>
    {children}
  </div>
);

// --- Recent trips mini table ---
const RecentTripsMini = () => {
  const trips = [
    { id: 'a72f', pax: 'M. Whitfield', drv: 'D. Rivera',   status: 'InProgress', fare: 14.80, when: '2m' },
    { id: 'a72e', pax: 'K. Osei',       drv: 'S. Park',     status: 'Completed',  fare: 22.30, when: '6m' },
    { id: 'a72d', pax: 'J. Blume',      drv: 'A. Hassan',   status: 'Completed',  fare: 9.40,  when: '9m' },
    { id: 'a72c', pax: 'R. Arias',      drv: 'T. Chen',     status: 'Pending',    fare: null,  when: '11m' },
    { id: 'a72b', pax: 'L. Tan',        drv: 'M. Okafor',   status: 'Cancelled',  fare: null,  when: '14m' },
    { id: 'a72a', pax: 'F. Dubois',     drv: 'S. Park',     status: 'Completed',  fare: 17.90, when: '17m' },
    { id: 'a729', pax: 'O. Ramírez',    drv: 'D. Rivera',   status: 'Completed',  fare: 31.20, when: '22m' },
  ];
  return (
    <table className="sr-table" style={{ fontSize: 13 }}>
      <thead>
        <tr>
          <th style={{ width: 70 }}>№</th>
          <th>Passenger</th>
          <th>Driver</th>
          <th style={{ width: 110 }}>Status</th>
          <th style={{ width: 70, textAlign: 'right' }}>Fare</th>
          <th style={{ width: 50, textAlign: 'right' }}>Ago</th>
        </tr>
      </thead>
      <tbody>
        {trips.map(t => (
          <tr key={t.id}>
            <td className="sr-table__num">t_{t.id}</td>
            <td>{t.pax}</td>
            <td>{t.drv}</td>
            <td><StatusChip status={t.status} /></td>
            <td style={{ textAlign: 'right', fontFamily: 'var(--sr-mono)' }}>
              {t.fare ? <>${t.fare.toFixed(2)}</> : <span style={{ color: 'var(--sr-ink-4)' }}>—</span>}
            </td>
            <td className="sr-table__num" style={{ textAlign: 'right' }}>{t.when}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// --- Pending approvals mini list ---
const PendingApprovalsMini = () => {
  const drivers = [
    { name: 'Nadia Brekke',  docs: '4 / 4', sub: 'Cedar Park · 2h ago',  flag: null },
    { name: 'Theo Okonkwo',  docs: '4 / 4', sub: 'Midtown · 5h ago',     flag: null },
    { name: 'Priya Raman',   docs: '3 / 4', sub: 'Harbor Green · 6h ago', flag: 'Insurance pending' },
    { name: 'Jonas Ewald',   docs: '4 / 4', sub: 'Cedar Park · 11h ago', flag: null },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {drivers.map((d, i) => (
        <div key={d.name} style={{
          padding: '14px 20px',
          borderBottom: i < drivers.length - 1 ? '1px solid var(--sr-line)' : 'none',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div className="sr-avatar sr-avatar--sm" style={{ background: 'var(--sr-surface-2)', color: 'var(--sr-ink-2)', fontFamily: 'var(--sr-mono)', fontSize: 11 }}>
            {d.name.split(' ').map(n => n[0]).slice(0,2).join('')}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{d.name}</div>
            <div className="sr-small" style={{ fontSize: 12 }}>
              {d.sub}
              {d.flag && <span style={{ marginLeft: 8, color: 'var(--sr-warn)', fontFamily: 'var(--sr-mono)', fontSize: 10, letterSpacing: '0.04em' }}>· {d.flag}</span>}
            </div>
          </div>
          <div className="sr-micro" style={{ fontSize: 10 }}>{d.docs} docs</div>
          <button className="sr-btn sr-btn--ghost sr-btn--sm">
            <Icon name="check" size={13} /> Approve
          </button>
        </div>
      ))}
    </div>
  );
};

// --- Health pill ---
const HealthPill = ({ label, value, ok }) => (
  <div className="sr-card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--sr-surface-2)' }}>
    <span style={{ width: 8, height: 8, borderRadius: '50%', background: ok ? 'var(--sr-ok)' : 'var(--sr-err)', flexShrink: 0 }} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 12, fontWeight: 500 }}>{label}</div>
      <div className="sr-micro" style={{ fontSize: 10 }}>{value}</div>
    </div>
  </div>
);

// --- Helpers ---
const formatNumber = (n) => {
  if (n == null) return '—';
  if (typeof n !== 'number') return n;
  if (Number.isInteger(n)) return n.toLocaleString('en-US');
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

window.AdminDashboardScreen = AdminDashboardScreen;
