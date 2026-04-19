/* global React, DriverTopbar, Icon, PageHead, StatusChip */

// ============================================================
// DRIVER · DASHBOARD
// Brief §1 row 7: availability toggle, pending queue (pickup/dropoff/
// distance/fare + Accept), earnings card (today/7d/30d/all-time + 7-day
// bar chart), "awaiting approval" empty state when unapproved.
// DoR (§2): unapproved => clear message, empty queue => empty state,
// Accept => route to active trip, all four totals + chart render.
// ============================================================
const DriverDashboardScreen = ({ onAccept }) => {
  const [available, setAvailable] = React.useState(true);
  // Demo toggle for the "awaiting approval" DoR bullet.
  const [approval, setApproval] = React.useState('approved'); // approved | pending
  // Demo toggle for the "empty queue" DoR bullet.
  const [queueMode, setQueueMode] = React.useState('has'); // has | empty

  const pending = queueMode === 'has' ? PENDING_TRIPS : [];

  const earnings = {
    today:    84.20,
    seven:    612.40,
    thirty:   2418.90,
    all:      18_402.55,
    trips:    6,
    online:   '4h 12m',
    chart: [
      { day: 'Mon', value: 112.40 },
      { day: 'Tue', value: 88.10 },
      { day: 'Wed', value: 141.80 },
      { day: 'Thu', value: 94.60 },
      { day: 'Fri', value: 156.20 },
      { day: 'Sat', value: 19.30 },
      { day: 'Sun', value: 84.20, today: true },
    ],
  };

  return (
    <>
      <DriverTopbar
        active="dashboard"
        available={available}
        onToggleAvailable={() => setAvailable(a => !a)}
      />
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px 80px' }}>
        <PageHead
          eyebrow="Driver · Dashboard"
          title={<>Good to see you, Dominic. <span className="sr-italic" style={{ color: 'var(--sr-ink-3)' }}>Let's roll.</span></>}
          lede="Availability, pending requests, and your earnings — one surface, no tabs."
          actions={
            <div style={{ display: 'flex', gap: 8 }}>
              <DemoToggle label="Approval" value={approval} setValue={setApproval} options={['approved','pending']} />
              <DemoToggle label="Queue"    value={queueMode} setValue={setQueueMode} options={['has','empty']} />
            </div>
          }
        />

        {/* If driver is unapproved, the entire surface below is replaced with a clear banner.
            DoR: "When I'm unapproved, I see a clear 'awaiting approval' message — not an empty queue." */}
        {approval === 'pending' ? (
          <AwaitingApproval />
        ) : (
          <>
            {/* Availability banner */}
            <AvailabilityBanner available={available} onToggle={() => setAvailable(a => !a)} />

            {/* Two-column: pending queue + earnings */}
            <section style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, marginTop: 24 }}>
              <QueuePanel
                available={available}
                trips={pending}
                onAccept={(id) => onAccept?.(id)}
              />
              <EarningsPanel earnings={earnings} />
            </section>

            {/* Recent completed trips (context for earnings) */}
            <section style={{ marginTop: 32 }}>
              <div className="sr-eyebrow" style={{ marginBottom: 10 }}>Today · completed runs</div>
              <RecentRuns />
            </section>
          </>
        )}
      </main>
    </>
  );
};

// ------------------------------------------------------------
// AVAILABILITY BANNER
// ------------------------------------------------------------
const AvailabilityBanner = ({ available, onToggle }) => (
  <div className="sr-card" style={{
    padding: '18px 22px',
    display: 'flex', alignItems: 'center', gap: 18,
    background: available ? 'var(--sr-surface)' : 'var(--sr-surface-2)',
    borderColor: available ? 'var(--sr-line)' : 'var(--sr-line-2, var(--sr-line))',
  }}>
    <div style={{
      width: 40, height: 40, borderRadius: '50%',
      background: available ? 'rgba(127,212,155,0.18)' : 'rgba(154,147,134,0.18)',
      color: available ? '#1F7A3D' : 'var(--sr-ink-3)',
      display: 'grid', placeItems: 'center', flexShrink: 0,
    }}>
      <Icon name={available ? 'check' : 'clock'} size={18} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontFamily: 'var(--sr-serif)', fontSize: 18, letterSpacing: '-0.01em' }}>
        {available ? <>You're <span className="sr-italic" style={{ color: 'var(--sr-accent)' }}>online</span> and visible to passengers.</> : <>You're <span className="sr-italic">offline</span>. No requests will reach you.</>}
      </div>
      <div className="sr-small" style={{ marginTop: 4 }}>
        {available
          ? 'Location is shared with the matching service only when a trip is in progress.'
          : 'Flip the switch below when you\'re ready to accept requests.'}
      </div>
    </div>
    <button
      onClick={onToggle}
      className={`sr-btn ${available ? 'sr-btn--danger' : 'sr-btn--primary'}`}
    >
      {available ? <><Icon name="x" size={14} /> Go offline</> : <><Icon name="check" size={14} /> Go online</>}
    </button>
  </div>
);

// ------------------------------------------------------------
// QUEUE PANEL
// ------------------------------------------------------------
const QueuePanel = ({ available, trips, onAccept }) => (
  <div className="sr-card" style={{ padding: 0, overflow: 'hidden' }}>
    <div style={{
      padding: '18px 20px 14px',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12,
      borderBottom: '1px solid var(--sr-line)',
    }}>
      <div>
        <div className="sr-eyebrow" style={{ marginBottom: 4 }}>Pending requests</div>
        <div style={{ fontFamily: 'var(--sr-serif)', fontSize: 22, letterSpacing: '-0.01em' }}>
          {trips.length > 0 ? <><span style={{ fontFamily: 'var(--sr-mono)', color: 'var(--sr-accent-hover)' }}>{trips.length}</span> nearby</> : <>All <span className="sr-italic">quiet</span>.</>}
        </div>
      </div>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontFamily: 'var(--sr-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
        color: available ? 'var(--sr-accent-hover)' : 'var(--sr-ink-4)',
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: available ? 'var(--sr-accent)' : 'var(--sr-ink-4)',
        }} />
        {available ? 'Live feed' : 'Paused'}
      </span>
    </div>

    {!available ? (
      <EmptyQueue
        title="You're offline"
        body="Requests are paused. Go online from the banner above when you're ready."
      />
    ) : trips.length === 0 ? (
      <EmptyQueue
        title="No requests right now"
        body="Stay put — new requests appear here automatically every few seconds."
      />
    ) : (
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {trips.map((t, i) => (
          <li key={t.id} style={{
            padding: '16px 20px',
            borderBottom: i < trips.length - 1 ? '1px solid var(--sr-line)' : 'none',
            display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'center',
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span className="sr-table__num" style={{ fontFamily: 'var(--sr-mono)', fontSize: 11, color: 'var(--sr-ink-3)' }}>t_{t.id}</span>
                <StatusChip status="Pending" live />
                <span className="sr-micro">{t.distance} mi · {t.etaMin} min</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '14px 1fr', gap: 8, alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, marginTop: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--sr-ink)' }} />
                  <span style={{ width: 1, height: 16, background: 'var(--sr-line)' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--sr-accent)' }} />
                </div>
                <div style={{ display: 'grid', gap: 4 }}>
                  <div style={{ fontSize: 13 }}>{t.pickup}</div>
                  <div style={{ fontSize: 13, color: 'var(--sr-ink-2)' }}>{t.dropoff}</div>
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
              <div>
                <div className="sr-micro">Est. fare</div>
                <div className="sr-num" style={{ fontSize: 22, letterSpacing: '-0.01em' }}>
                  ${t.fare.toFixed(2)}
                </div>
              </div>
              <button
                className="sr-btn sr-btn--primary sr-btn--sm"
                onClick={() => onAccept?.(t.id)}
              >
                <Icon name="check" size={13} /> Accept
              </button>
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const EmptyQueue = ({ title, body }) => (
  <div style={{
    padding: '48px 24px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
    textAlign: 'center',
  }}>
    <div style={{
      width: 52, height: 52, borderRadius: '50%',
      background: 'var(--sr-surface-2)', color: 'var(--sr-ink-3)',
      display: 'grid', placeItems: 'center',
    }}>
      <Icon name="clock" size={22} />
    </div>
    <div style={{ fontFamily: 'var(--sr-serif)', fontSize: 18 }}>{title}</div>
    <div className="sr-small" style={{ maxWidth: 320 }}>{body}</div>
  </div>
);

// ------------------------------------------------------------
// EARNINGS PANEL — totals + 7-day bar chart (R2)
// ------------------------------------------------------------
const EarningsPanel = ({ earnings }) => {
  const max = Math.max(...earnings.chart.map(d => d.value));
  return (
    <div className="sr-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{
        padding: '18px 20px 14px',
        borderBottom: '1px solid var(--sr-line)',
      }}>
        <div className="sr-eyebrow" style={{ marginBottom: 4 }}>Earnings</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span className="sr-num" style={{ fontSize: 14, color: 'var(--sr-ink-3)' }}>$</span>
          <span className="sr-num" style={{ fontSize: 40, lineHeight: 1, letterSpacing: '-0.02em' }}>
            {earnings.today.toFixed(2)}
          </span>
          <span className="sr-small" style={{ marginLeft: 8 }}>today</span>
        </div>
        <div className="sr-micro" style={{ marginTop: 6 }}>
          {earnings.trips} trips · {earnings.online} online
        </div>
      </div>

      {/* 7-day bar chart */}
      <div style={{ padding: '18px 20px 8px' }}>
        <div className="sr-eyebrow" style={{ marginBottom: 10 }}>Last 7 days</div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8,
          height: 120, alignItems: 'end',
        }}>
          {earnings.chart.map(d => {
            const h = Math.max(4, (d.value / max) * 100);
            return (
              <div key={d.day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'end', width: '100%' }}>
                  <div
                    title={`${d.day}: $${d.value.toFixed(2)}`}
                    style={{
                      width: '100%',
                      height: `${h}%`,
                      background: d.today ? 'var(--sr-accent)' : 'var(--sr-ink-4)',
                      borderRadius: 2,
                      opacity: d.today ? 1 : 0.55,
                    }}
                  />
                </div>
                <div className="sr-micro" style={{ fontSize: 10 }}>{d.day}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Totals grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        borderTop: '1px solid var(--sr-line)',
      }}>
        <TotalCell label="Today"    value={earnings.today} />
        <TotalCell label="7 days"   value={earnings.seven} divider />
        <TotalCell label="30 days"  value={earnings.thirty} divider />
        <TotalCell label="All-time" value={earnings.all}   divider />
      </div>
    </div>
  );
};

const TotalCell = ({ label, value, divider }) => (
  <div style={{
    padding: '14px 16px',
    borderLeft: divider ? '1px solid var(--sr-line)' : 'none',
  }}>
    <div className="sr-eyebrow" style={{ fontSize: 9, marginBottom: 6 }}>{label}</div>
    <div className="sr-num" style={{ fontSize: 18, letterSpacing: '-0.01em' }}>
      ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </div>
  </div>
);

// ------------------------------------------------------------
// AWAITING APPROVAL (DoR: unapproved shows a clear message)
// ------------------------------------------------------------
const AwaitingApproval = () => (
  <div className="sr-card" style={{
    padding: '48px 32px',
    display: 'grid', gridTemplateColumns: '64px 1fr', gap: 20, alignItems: 'start',
    background: 'var(--sr-surface)',
  }}>
    <div style={{
      width: 64, height: 64, borderRadius: '50%',
      background: 'var(--sr-accent-soft)', color: 'var(--sr-accent-hover)',
      display: 'grid', placeItems: 'center',
    }}>
      <Icon name="shield" size={28} />
    </div>
    <div style={{ maxWidth: 640 }}>
      <div className="sr-eyebrow" style={{ marginBottom: 8 }}>Account status · Pending approval</div>
      <h2 className="sr-h2" style={{ margin: 0, marginBottom: 12 }}>
        You're <span className="sr-italic" style={{ color: 'var(--sr-accent)' }}>almost on the road</span>.
      </h2>
      <p className="sr-body" style={{ marginTop: 0, color: 'var(--sr-ink-2)' }}>
        An administrator is reviewing your documents. You can't accept trips yet, and the pending queue stays hidden until you're approved — usually within one business day.
      </p>
      <ul style={{ margin: '16px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
        {[
          ['Driver licence',   'Received'],
          ['Vehicle registration', 'Received'],
          ['Insurance certificate', 'Received'],
          ['Profile photo',    'Received'],
        ].map(([label, state]) => (
          <li key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
            <span style={{
              width: 18, height: 18, borderRadius: '50%',
              background: 'rgba(31,122,61,0.15)', color: 'var(--sr-ok)',
              display: 'grid', placeItems: 'center', flexShrink: 0,
            }}>
              <Icon name="check" size={12} />
            </span>
            <span style={{ flex: 1 }}>{label}</span>
            <span className="sr-micro">{state}</span>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
        <button className="sr-btn sr-btn--secondary sr-btn--sm">
          <Icon name="phone" size={13} /> Contact onboarding
        </button>
        <button className="sr-btn sr-btn--ghost sr-btn--sm">
          <Icon name="info" size={13} /> What takes so long?
        </button>
      </div>
    </div>
  </div>
);

// ------------------------------------------------------------
// RECENT RUNS (today)
// ------------------------------------------------------------
const RecentRuns = () => {
  const runs = [
    { id: 'a71f', pax: 'M. Whitfield', route: 'Cedar Park → Harbor Green', fare: 14.80, tip: 2.00, at: '08:52' },
    { id: 'a71a', pax: 'J. Blume',     route: '12th & Bay → Midtown',       fare: 9.40,  tip: 1.00, at: '10:11' },
    { id: 'a715', pax: 'L. Tan',       route: 'Airport → Downtown',         fare: 31.20, tip: 4.00, at: '11:43' },
    { id: 'a711', pax: 'K. Osei',      route: 'Midtown → Cedar Park',       fare: 11.60, tip: 0.00, at: '12:30' },
    { id: 'a70d', pax: 'F. Dubois',    route: 'Harbor Green → Pier 9',      fare: 17.20, tip: 2.00, at: '13:04' },
  ];
  return (
    <table className="sr-table" style={{ fontSize: 13 }}>
      <thead>
        <tr>
          <th style={{ width: 80 }}>№</th>
          <th>Passenger</th>
          <th>Route</th>
          <th style={{ width: 80, textAlign: 'right' }}>Fare</th>
          <th style={{ width: 60, textAlign: 'right' }}>Tip</th>
          <th style={{ width: 60, textAlign: 'right' }}>At</th>
        </tr>
      </thead>
      <tbody>
        {runs.map(r => (
          <tr key={r.id}>
            <td className="sr-table__num">t_{r.id}</td>
            <td>{r.pax}</td>
            <td>{r.route}</td>
            <td style={{ textAlign: 'right', fontFamily: 'var(--sr-mono)' }}>${r.fare.toFixed(2)}</td>
            <td style={{ textAlign: 'right', fontFamily: 'var(--sr-mono)', color: r.tip > 0 ? 'var(--sr-ok)' : 'var(--sr-ink-4)' }}>
              {r.tip > 0 ? `+$${r.tip.toFixed(2)}` : '—'}
            </td>
            <td className="sr-table__num" style={{ textAlign: 'right' }}>{r.at}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// ------------------------------------------------------------
// DEMO TOGGLE — small pill switcher used in PageHead actions
// (kept inline because the dashboard is the only screen using it)
// ------------------------------------------------------------
const DemoToggle = ({ label, value, setValue, options }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    background: 'var(--sr-surface)', border: '1px solid var(--sr-line)',
    borderRadius: 'var(--sr-r-2)', padding: 3,
    fontFamily: 'var(--sr-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
  }}>
    <span style={{ padding: '4px 8px', color: 'var(--sr-ink-4)' }}>{label}</span>
    {options.map(o => (
      <button
        key={o}
        onClick={() => setValue(o)}
        className={`sr-btn sr-btn--sm ${value === o ? 'sr-btn--primary' : 'sr-btn--ghost'}`}
        style={{ padding: '3px 8px', fontSize: 10, letterSpacing: '0.06em' }}
      >{o}</button>
    ))}
  </div>
);

// ------------------------------------------------------------
// SEEDS
// ------------------------------------------------------------
const PENDING_TRIPS = [
  { id: '8f2d',  pickup: '1209 Alder St · Cedar Park',  dropoff: 'Harbor Green Terminal',     distance: 3.4, etaMin: 12, fare: 14.80 },
  { id: '8f2c',  pickup: '48 Monograph Coffee · Midtown', dropoff: 'SFO — Terminal 2',         distance: 18.6, etaMin: 42, fare: 56.40 },
  { id: '8f2b',  pickup: 'Pier 9 · Harbor Green',        dropoff: '201 Mission · Downtown',    distance: 5.1, etaMin: 18, fare: 19.20 },
];

window.DriverDashboardScreen = DriverDashboardScreen;
