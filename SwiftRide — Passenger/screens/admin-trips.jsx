/* global React, AdminShell, Icon, StatusChip */

// ============================================================
// ADMIN · TRIPS — filterable audit table with pagination.
// Brief §1 row 11: id, passenger, driver, route, fare, status,
// created, completed + status filter; empty state.
// DoR: filter updates without reload; pagination persists; many-results OK.
// ============================================================
const AdminTripsScreen = () => {
  const [filter, setFilter] = React.useState('all');
  const [query, setQuery] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [sortKey, setSortKey] = React.useState('created');
  const [sortDir, setSortDir] = React.useState('desc');
  const PAGE = 12;

  const statusCounts = React.useMemo(() => {
    const c = { all: SEED_TRIPS.length, Pending: 0, Accepted: 0, InProgress: 0, Completed: 0, Cancelled: 0 };
    SEED_TRIPS.forEach(t => c[t.status]++);
    return c;
  }, []);

  const filtered = React.useMemo(() => {
    let list = SEED_TRIPS.filter(t => filter === 'all' || t.status === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(t =>
        t.id.toLowerCase().includes(q) ||
        t.passenger.toLowerCase().includes(q) ||
        (t.driver && t.driver.toLowerCase().includes(q)) ||
        t.from.toLowerCase().includes(q) ||
        t.to.toLowerCase().includes(q)
      );
    }
    // sort
    list.sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
      const diff = va < vb ? -1 : va > vb ? 1 : 0;
      return sortDir === 'asc' ? diff : -diff;
    });
    return list;
  }, [filter, query, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const curPage = Math.min(page, totalPages - 1);
  const rows = filtered.slice(curPage * PAGE, (curPage + 1) * PAGE);

  const totalFare = filtered.filter(t => t.fare).reduce((s, t) => s + t.fare, 0);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  return (
    <AdminShell
      active="trips"
      subtitle={`Trips · ${SEED_TRIPS.length.toLocaleString()} records`}
      title={<>Every ride, <span className="sr-italic">on the ledger</span>.</>}
      rightSlot={
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="sr-btn sr-btn--secondary sr-btn--sm">
            <Icon name="arrow-right" size={14} /> Export CSV
          </button>
          <button className="sr-btn sr-btn--ghost sr-btn--sm">
            <Icon name="info" size={14} /> API reference
          </button>
        </div>
      }
    >
      {/* Filter row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <TripFilterChip label="All" count={statusCounts.all}         active={filter === 'all'}         onClick={() => { setFilter('all'); setPage(0); }} />
          <TripFilterChip label="Pending"     count={statusCounts.Pending}    active={filter === 'Pending'}     tone="pending"   onClick={() => { setFilter('Pending'); setPage(0); }} />
          <TripFilterChip label="Accepted"    count={statusCounts.Accepted}   active={filter === 'Accepted'}    tone="accepted"  onClick={() => { setFilter('Accepted'); setPage(0); }} />
          <TripFilterChip label="In progress" count={statusCounts.InProgress} active={filter === 'InProgress'}  tone="progress"  onClick={() => { setFilter('InProgress'); setPage(0); }} />
          <TripFilterChip label="Completed"   count={statusCounts.Completed}  active={filter === 'Completed'}   tone="completed" onClick={() => { setFilter('Completed'); setPage(0); }} />
          <TripFilterChip label="Cancelled"   count={statusCounts.Cancelled}  active={filter === 'Cancelled'}   tone="cancelled" onClick={() => { setFilter('Cancelled'); setPage(0); }} />
        </div>
        <div className="sr-input-icon" style={{ flex: '1 1 260px', maxWidth: 360 }}>
          <Icon name="search" size={14} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--sr-ink-3)' }} />
          <input
            className="sr-input"
            placeholder="Search — trip ID, passenger, driver, route"
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(0); }}
            style={{ paddingLeft: 36, width: '100%' }}
          />
        </div>
      </div>

      {/* Summary strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
        marginBottom: 16,
      }}>
        <SummaryStat label="Trips in view" value={filtered.length.toLocaleString()} />
        <SummaryStat label="Total fare" value={`$${totalFare.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
        <SummaryStat label="Avg fare" value={filtered.length ? `$${(totalFare / filtered.filter(t => t.fare).length || 0).toFixed(2)}` : '—'} />
        <SummaryStat label="Completion rate" value={filtered.length ? `${Math.round(100 * filtered.filter(t => t.status === 'Completed').length / filtered.length)}%` : '—'} />
      </div>

      {/* Table */}
      <div className="sr-card" style={{ padding: 0, overflow: 'hidden' }}>
        {rows.length === 0 ? (
          <EmptyTrips onReset={() => { setFilter('all'); setQuery(''); setPage(0); }} />
        ) : (
          <>
            <table className="sr-table">
              <thead>
                <tr>
                  <SortableTh label="№"            k="id"        sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} width={110} />
                  <th style={{ width: 160 }}>Passenger</th>
                  <th style={{ width: 160 }}>Driver</th>
                  <th>Route</th>
                  <SortableTh label="Fare"    k="fare"     sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} align="right" width={90} />
                  <th style={{ width: 120 }}>Status</th>
                  <SortableTh label="Created"    k="created"  sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} width={120} />
                  <th style={{ width: 120 }}>Completed</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(t => (
                  <tr key={t.id}>
                    <td className="sr-table__num">t_{t.id}</td>
                    <td>
                      <div style={{ fontSize: 13 }}>{t.passenger}</div>
                      <div className="sr-small" style={{ fontSize: 11 }}>{t.passengerId}</div>
                    </td>
                    <td>
                      {t.driver ? (
                        <>
                          <div style={{ fontSize: 13 }}>{t.driver}</div>
                          <div className="sr-small" style={{ fontSize: 11 }}>{t.driverId}</div>
                        </>
                      ) : <span className="sr-small" style={{ color: 'var(--sr-ink-4)' }}>— unassigned —</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sr-ink)', flexShrink: 0 }} />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>{t.from}</span>
                        <span style={{ color: 'var(--sr-ink-4)' }}>→</span>
                        <span style={{ width: 6, height: 6, borderRadius: 1, background: 'var(--sr-accent)', flexShrink: 0 }} />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>{t.to}</span>
                      </div>
                      <div className="sr-small" style={{ fontSize: 11, marginTop: 2 }}>
                        {t.distance != null ? `${t.distance.toFixed(1)} mi` : <span style={{ color: 'var(--sr-ink-4)' }}>—</span>}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--sr-mono)' }}>
                      {t.fare ? <>${t.fare.toFixed(2)}</> : <span style={{ color: 'var(--sr-ink-4)' }}>—</span>}
                    </td>
                    <td><StatusChip status={t.status} /></td>
                    <td className="sr-small" style={{ fontSize: 12 }}>{t.created}</td>
                    <td className="sr-small" style={{ fontSize: 12 }}>
                      {t.completed || <span style={{ color: 'var(--sr-ink-4)' }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination footer */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--sr-line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="sr-micro">
                Showing <strong style={{ color: 'var(--sr-ink)' }}>{curPage * PAGE + 1}</strong>–<strong style={{ color: 'var(--sr-ink)' }}>{Math.min((curPage + 1) * PAGE, filtered.length)}</strong> of <strong style={{ color: 'var(--sr-ink)' }}>{filtered.length.toLocaleString()}</strong>
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button className="sr-btn sr-btn--ghost sr-btn--sm" onClick={() => setPage(0)} disabled={curPage === 0}>« First</button>
                <button className="sr-btn sr-btn--ghost sr-btn--sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={curPage === 0}>
                  <Icon name="arrow-left" size={13} /> Prev
                </button>
                <span className="sr-micro" style={{ padding: '0 10px' }}>Page <strong style={{ color: 'var(--sr-ink)' }}>{curPage + 1}</strong> / {totalPages}</span>
                <button className="sr-btn sr-btn--ghost sr-btn--sm" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={curPage === totalPages - 1}>
                  Next <Icon name="arrow-right" size={13} />
                </button>
                <button className="sr-btn sr-btn--ghost sr-btn--sm" onClick={() => setPage(totalPages - 1)} disabled={curPage === totalPages - 1}>Last »</button>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
};

// --- Summary stat tile ---
const SummaryStat = ({ label, value }) => (
  <div className="sr-card" style={{ padding: '12px 14px' }}>
    <div className="sr-eyebrow" style={{ marginBottom: 4 }}>{label}</div>
    <div className="sr-num" style={{ fontSize: 20 }}>{value}</div>
  </div>
);

// --- Sortable column header ---
const SortableTh = ({ label, k, sortKey, sortDir, onClick, align = 'left', width }) => {
  const active = sortKey === k;
  return (
    <th style={{ width, textAlign: align, cursor: 'pointer', userSelect: 'none' }} onClick={() => onClick(k)}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: active ? 'var(--sr-ink)' : undefined }}>
        {label}
        {active && (
          <svg width="10" height="10" viewBox="0 0 10 10" style={{ transform: sortDir === 'asc' ? 'rotate(180deg)' : 'none' }}>
            <path d="M5 8 L1 3 L9 3 Z" fill="currentColor" />
          </svg>
        )}
      </span>
    </th>
  );
};

// --- Trip filter chip ---
const TripFilterChip = ({ label, count, active, tone, onClick }) => {
  const toneColors = {
    pending:   { bg: 'var(--sr-warn-soft)',   color: 'var(--sr-warn)' },
    accepted:  { bg: 'var(--sr-info-soft)',   color: 'var(--sr-info)' },
    progress:  { bg: 'var(--sr-accent-soft)', color: 'var(--sr-accent-hover)' },
    completed: { bg: 'var(--sr-ok-soft)',     color: 'var(--sr-ok)' },
    cancelled: { bg: 'var(--sr-err-soft)',    color: 'var(--sr-err)' },
  };
  const t = tone && toneColors[tone];
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 12px',
        border: `1px solid ${active ? 'var(--sr-ink)' : 'var(--sr-line)'}`,
        background: active ? 'var(--sr-ink)' : (t ? t.bg : 'var(--sr-surface)'),
        color: active ? 'var(--sr-bg)' : (t ? t.color : 'var(--sr-ink-2)'),
        borderRadius: 999,
        fontSize: 12, fontWeight: 500,
        cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 6,
        transition: 'all 120ms',
      }}
    >
      {label}
      <span style={{ fontFamily: 'var(--sr-mono)', fontSize: 10, opacity: active ? 0.6 : 0.8 }}>
        {count.toLocaleString()}
      </span>
    </button>
  );
};

// --- Empty state ---
const EmptyTrips = ({ onReset }) => (
  <div style={{ padding: 64, textAlign: 'center' }}>
    <div style={{ width: 48, height: 48, margin: '0 auto 12px', display: 'grid', placeItems: 'center', background: 'var(--sr-surface-2)', color: 'var(--sr-ink-3)', borderRadius: 999 }}>
      <Icon name="route" size={20} />
    </div>
    <div style={{ fontFamily: 'var(--sr-serif)', fontSize: 22, marginBottom: 4 }}>No trips match.</div>
    <div className="sr-small" style={{ maxWidth: 360, margin: '0 auto 16px' }}>
      Try a different status filter or clear your search. The table will show everything again.
    </div>
    <button className="sr-btn sr-btn--secondary" onClick={onReset}>
      <Icon name="x" size={13} /> Clear filters
    </button>
  </div>
);

// ---------------------------------------------------------------
// SEED DATA — enough trips to demonstrate pagination (36 rows)
// ---------------------------------------------------------------
const _TRIP_CITIES = [
  ['4105 Hyde St', 'Ashland Tower'],
  ['Union Market', 'Harbor Green Stn'],
  ['Foxtail Café', 'Apt 12B · 9th Ave'],
  ['SFO T2', '612 Mission St'],
  ['The Crescent', 'Logan Circle'],
  ['Cedar Park Stn', 'Midtown Lofts'],
  ['Ashland Tower', 'Airport T1'],
  ['Holloway & 6th', 'Rosevine Hotel'],
  ['Pier 19', 'Fillmore & Bush'],
  ['Harbor Green', 'Cedar Park'],
];
const _PAX = ['Mira Whitfield','Kwame Osei','Juno Blume','Ravi Arias','Ling Tan','Fleur Dubois','Osvaldo Ramírez','Astrid Lindqvist','Marc Leitner','Zoë Caravaggio'];
const _DRV = ['Dan Rivera','Sofia Park','Amir Hassan','Lena Voss','Tomasz Chen','Marcus Okafor',null];
const _STATUS = ['Completed','Completed','Completed','Completed','Completed','InProgress','Accepted','Pending','Cancelled','Completed'];

const SEED_TRIPS = Array.from({ length: 36 }, (_, i) => {
  const status = _STATUS[i % _STATUS.length];
  const route = _TRIP_CITIES[i % _TRIP_CITIES.length];
  const driver = status === 'Pending' ? null : _DRV[i % _DRV.length];
  const fare = (status === 'Completed' || status === 'InProgress') ? (6 + (i * 1.73) % 42) : null;
  const dist = (status === 'Completed' || status === 'InProgress') ? (0.8 + (i * 0.27) % 8.1) : null;
  const ago = i * 17;
  const created = ago < 60 ? `${ago}m ago` : ago < 1440 ? `${Math.floor(ago/60)}h ago` : `${Math.floor(ago/1440)}d ago`;
  const completed = status === 'Completed' ? `${Math.max(1, ago - 12)}m ago`.replace(/^(\d{3,})m/, (m, n) => n < 1440 ? `${Math.floor(n/60)}h` : `${Math.floor(n/1440)}d`) : null;
  return {
    id: Math.random().toString(16).slice(2, 8),
    passenger: _PAX[i % _PAX.length],
    passengerId: `p_${Math.random().toString(16).slice(2, 6)}`,
    driver,
    driverId: driver ? `d_${Math.random().toString(16).slice(2, 6)}` : null,
    from: route[0],
    to: route[1],
    distance: dist,
    fare,
    status,
    created,
    completed,
  };
});

window.AdminTripsScreen = AdminTripsScreen;
