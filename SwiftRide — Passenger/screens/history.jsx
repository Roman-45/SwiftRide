/* global React, Topbar, StatusChip, Icon, PageHead */

const HistoryScreen = () => {
  const [filter, setFilter] = React.useState('All');

  const trips = [
    { id: 't_8f2d91a3', date: 'Today',        time: '4:12 PM', from: '312 Juniper St',       to: 'Ashland Tower',         fare: 14.80, status: 'InProgress', driver: 'Dan Rivera',  mi: 3.4 },
    { id: 't_7a1fe02c', date: 'Yesterday',    time: '8:40 AM', from: '312 Juniper St',       to: 'Ashland Tower',         fare: 14.80, status: 'Completed',  driver: 'Priya Okafor', mi: 3.4 },
    { id: 't_6b9c04de', date: 'Mon, Apr 15',  time: '6:22 PM', from: 'Ashland Tower',        to: 'Monograph Coffee',      fare:  7.20, status: 'Completed',  driver: 'Theo Janssen',mi: 0.9 },
    { id: 't_5d334e19', date: 'Sun, Apr 14',  time: '11:02 AM',from: '312 Juniper St',       to: 'Ledger Lane, Midtown',  fare: 11.60, status: 'Completed',  driver: 'Nova Chen',   mi: 2.6 },
    { id: 't_5a120fb8', date: 'Fri, Apr 12',  time: '5:48 PM', from: 'Ashland Tower',        to: 'Airport, Terminal B',   fare: 32.10, status: 'Completed',  driver: 'Mikel Forge', mi: 9.1 },
    { id: 't_49aa8812', date: 'Thu, Apr 11',  time: '9:06 AM', from: '312 Juniper St',       to: 'Cedar Park Library',    fare:  0.00, status: 'Cancelled',  driver: '—',           mi: 0   },
    { id: 't_3ef71100', date: 'Sat, Apr 06',  time: '2:15 PM', from: 'Harbor Green Market',  to: '312 Juniper St',        fare:  9.40, status: 'Completed',  driver: 'Olu Oni',     mi: 1.8 },
  ];

  const filtered = filter === 'All' ? trips : trips.filter(t => t.status === filter);
  const total = trips.filter(t => t.status === 'Completed').reduce((a, b) => a + b.fare, 0);

  return (
    <>
      <Topbar active="history" />
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 48px' }}>
        <PageHead
          eyebrow="Ledger"
          title={<>Every trip, <span className="sr-italic">kept</span>.</>}
          lede="Your complete ride history. Tap any completed trip to open its receipt."
        />

        {/* Summary strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, marginBottom: 24, border: '1px solid var(--sr-line)', borderRadius: 'var(--sr-r-3)', background: 'var(--sr-surface)', overflow: 'hidden' }}>
          <Stat label="Trips (30 days)" value="14" />
          <Stat label="Spent (30 days)" value={`$${(total).toFixed(2)}`} border />
          <Stat label="Average fare" value="$12.40" border />
          <Stat label="Favorite route" value="Juniper ↔ Ashland" border small />
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
          <span className="sr-eyebrow">Filter</span>
          {['All','Completed','Cancelled','InProgress'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`sr-btn sr-btn--sm ${filter === f ? 'sr-btn--primary' : 'sr-btn--ghost'}`}
            >{f === 'InProgress' ? 'In progress' : f}</button>
          ))}
          <div style={{ flex: 1 }} />
          <div className="sr-input-icon" style={{ width: 240 }}>
            <Icon name="search" size={14} />
            <input className="sr-input" placeholder="Search by place, driver…" style={{ padding: '8px 14px 8px 36px', fontSize: 13 }} />
          </div>
        </div>

        {/* Table */}
        <div className="sr-card" style={{ overflow: 'hidden' }}>
          <table className="sr-table">
            <thead>
              <tr>
                <th style={{ width: 160 }}>Date</th>
                <th>Route</th>
                <th style={{ width: 140 }}>Driver</th>
                <th style={{ width: 80, textAlign: 'right' }}>Miles</th>
                <th style={{ width: 110, textAlign: 'right' }}>Fare</th>
                <th style={{ width: 120 }}>Status</th>
                <th style={{ width: 120, textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={t.id}>
                  <td>
                    <div style={{ fontSize: 14 }}>{t.date}</div>
                    <div className="sr-table__num">{t.time}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                      <span style={{ color: 'var(--sr-ink-3)' }}>{t.from}</span>
                      <Icon name="arrow-right" size={12} style={{ color: 'var(--sr-ink-4)' }} />
                      <span style={{ fontWeight: 500 }}>{t.to}</span>
                    </div>
                    <div className="sr-table__num" style={{ marginTop: 2 }}>{t.id}</div>
                  </td>
                  <td style={{ fontSize: 14, color: 'var(--sr-ink-2)' }}>{t.driver}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--sr-mono)', fontSize: 13, color: 'var(--sr-ink-3)' }}>{t.mi > 0 ? t.mi.toFixed(1) : '—'}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--sr-serif)', fontSize: 17, color: t.fare === 0 ? 'var(--sr-ink-4)' : 'var(--sr-ink)' }}>
                    {t.fare === 0 ? '—' : `$${t.fare.toFixed(2)}`}
                  </td>
                  <td><StatusChip status={t.status} /></td>
                  <td style={{ textAlign: 'right' }}>
                    {t.status === 'Completed' ? (
                      <a href="#receipt" className="sr-btn sr-btn--ghost sr-btn--sm">
                        <Icon name="receipt" size={12} /> Receipt
                      </a>
                    ) : t.status === 'InProgress' ? (
                      <a href="#trip" className="sr-btn sr-btn--secondary sr-btn--sm">Open <Icon name="arrow-right" size={12} /></a>
                    ) : (
                      <span className="sr-micro" style={{ color: 'var(--sr-ink-4)' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: 64, textAlign: 'center', color: 'var(--sr-ink-3)' }}>
              <Icon name="receipt" size={32} style={{ color: 'var(--sr-ink-4)', marginBottom: 12 }} />
              <div style={{ fontFamily: 'var(--sr-serif)', fontSize: 20, color: 'var(--sr-ink)', marginBottom: 4 }}>Nothing to show here.</div>
              <div className="sr-small" style={{ marginBottom: 16 }}>No trips match the "{filter}" filter.</div>
              <button className="sr-btn sr-btn--secondary sr-btn--sm" onClick={() => setFilter('All')}>Clear filter</button>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

const Stat = ({ label, value, border, small }) => (
  <div style={{ padding: '18px 22px', borderLeft: border ? '1px solid var(--sr-line)' : 'none' }}>
    <div className="sr-eyebrow" style={{ marginBottom: 6 }}>{label}</div>
    <div className="sr-num" style={{ fontSize: small ? 18 : 28, lineHeight: 1.1, letterSpacing: '-0.015em' }}>{value}</div>
  </div>
);

window.HistoryScreen = HistoryScreen;
