/* global React, Topbar, Icon, SwiftRideMark, StarRating */

const ReceiptScreen = () => {
  const trip = {
    id: 't_7a1fe02c',
    issued: 'Apr 18, 2026 · 9:04 AM',
    paid: 'Apr 18, 2026 · 9:04 AM',
    passenger: 'Mira Whitfield',
    driver: 'Priya Okafor',
    plate: '3KV·P102',
    vehicle: 'Honda Accord · Silver',
    pickup: { place: '312 Juniper St', area: 'Cedar Park', time: '8:40 AM' },
    dropoff:{ place: 'Ashland Tower, 410 Market St', area: 'Midtown', time: '8:52 AM' },
    miles: 3.4,
    duration: '12 min',
    base: 3.50,
    distance: 8.50,
    time: 2.80,
    tip: 0.00,
    total: 14.80,
    payment: 'Visa ending 4417',
  };

  return (
    <>
      <div className="no-print"><Topbar active="history" /></div>
      <main style={{ maxWidth: 780, margin: '0 auto', padding: '32px 24px 64px' }}>
        {/* Action bar (hidden in print) */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <a href="#history" className="sr-btn sr-btn--ghost sr-btn--sm" style={{ paddingLeft: 0 }}>
            <Icon name="arrow-left" size={14} /> Back to history
          </a>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="sr-btn sr-btn--secondary sr-btn--sm" onClick={() => window.print()}>
              <Icon name="printer" size={14} /> Print
            </button>
            <button className="sr-btn sr-btn--secondary sr-btn--sm">
              <Icon name="receipt" size={14} /> Download PDF
            </button>
          </div>
        </div>

        {/* Receipt page */}
        <article style={{ background: 'white', border: '1px solid var(--sr-line)', padding: 56, position: 'relative', fontFamily: 'var(--sr-serif)' }}>
          {/* Header */}
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40, paddingBottom: 24, borderBottom: '1px solid var(--sr-ink)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <SwiftRideMark size={20} mono />
                <span style={{ fontFamily: 'var(--sr-serif)', fontSize: 20 }}>
                  Swift<span className="sr-italic">Ride</span>
                </span>
              </div>
              <div className="sr-micro" style={{ marginTop: 8 }}>A transportation ledger</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="sr-eyebrow" style={{ marginBottom: 4 }}>Receipt</div>
              <div style={{ fontFamily: 'var(--sr-mono)', fontSize: 13, color: 'var(--sr-ink)' }}>{trip.id}</div>
              <div className="sr-micro" style={{ marginTop: 4 }}>Issued {trip.issued}</div>
            </div>
          </header>

          {/* Title */}
          <div style={{ marginBottom: 36 }}>
            <div className="sr-eyebrow" style={{ marginBottom: 10 }}>Trip №&nbsp;7a1fe02c</div>
            <h1 style={{ fontFamily: 'var(--sr-serif)', fontSize: 44, lineHeight: 1.05, letterSpacing: '-0.02em', margin: 0, fontWeight: 400 }}>
              From <span className="sr-italic">Cedar Park</span> to <br/>
              <span className="sr-italic">Midtown</span>, on a Friday morning.
            </h1>
            <div style={{ marginTop: 14, fontFamily: 'var(--sr-sans)', fontSize: 14, color: 'var(--sr-ink-3)' }}>
              {trip.miles} miles · {trip.duration} · arrived {trip.dropoff.time}
            </div>
          </div>

          {/* Parties */}
          <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 36, paddingBottom: 24, borderBottom: '1px dashed var(--sr-line-2)' }}>
            <div>
              <div className="sr-eyebrow" style={{ marginBottom: 8 }}>Passenger</div>
              <div style={{ fontSize: 18 }}>{trip.passenger}</div>
              <div style={{ fontFamily: 'var(--sr-sans)', fontSize: 13, color: 'var(--sr-ink-3)', marginTop: 2 }}>
                mira@example.com
              </div>
            </div>
            <div>
              <div className="sr-eyebrow" style={{ marginBottom: 8 }}>Driver</div>
              <div style={{ fontSize: 18 }}>{trip.driver}</div>
              <div style={{ fontFamily: 'var(--sr-sans)', fontSize: 13, color: 'var(--sr-ink-3)', marginTop: 2 }}>
                {trip.vehicle} · <span style={{ fontFamily: 'var(--sr-mono)' }}>{trip.plate}</span>
              </div>
            </div>
          </section>

          {/* Route */}
          <section style={{ marginBottom: 40 }}>
            <div className="sr-eyebrow" style={{ marginBottom: 14 }}>Route</div>
            <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr auto', gap: 14, alignItems: 'start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gridRow: '1 / 3', paddingTop: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--sr-ink)' }} />
                <div style={{ flex: 1, borderLeft: '2px dotted var(--sr-ink-4)', minHeight: 32, width: 0, margin: '4px 0' }} />
                <div style={{ width: 12, height: 12, background: 'var(--sr-accent)', transform: 'rotate(45deg)' }} />
              </div>
              <div>
                <div style={{ fontSize: 18 }}>{trip.pickup.place}</div>
                <div style={{ fontFamily: 'var(--sr-sans)', fontSize: 13, color: 'var(--sr-ink-3)' }}>{trip.pickup.area}</div>
              </div>
              <div className="sr-num" style={{ fontSize: 15, color: 'var(--sr-ink-3)' }}>{trip.pickup.time}</div>
              <div>
                <div style={{ fontSize: 18 }}>{trip.dropoff.place}</div>
                <div style={{ fontFamily: 'var(--sr-sans)', fontSize: 13, color: 'var(--sr-ink-3)' }}>{trip.dropoff.area}</div>
              </div>
              <div className="sr-num" style={{ fontSize: 15, color: 'var(--sr-ink-3)' }}>{trip.dropoff.time}</div>
            </div>
          </section>

          {/* Fare breakdown */}
          <section style={{ marginBottom: 36 }}>
            <div className="sr-eyebrow" style={{ marginBottom: 14 }}>Fare breakdown</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--sr-sans)' }}>
              <tbody>
                {[
                  ['Base fare',                                 `$${trip.base.toFixed(2)}`],
                  [`Distance · ${trip.miles} mi × $2.50/mi`,   `$${trip.distance.toFixed(2)}`],
                  [`Time · ${trip.duration} × $0.23/min`,      `$${trip.time.toFixed(2)}`],
                  ['Tip',                                       trip.tip === 0 ? '—' : `$${trip.tip.toFixed(2)}`],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ padding: '10px 0', borderBottom: '1px solid var(--sr-line)', fontSize: 14 }}>{k}</td>
                    <td style={{ padding: '10px 0', borderBottom: '1px solid var(--sr-line)', fontFamily: 'var(--sr-mono)', fontSize: 14, textAlign: 'right', color: 'var(--sr-ink)' }}>{v}</td>
                  </tr>
                ))}
                <tr>
                  <td style={{ padding: '18px 0 0', fontFamily: 'var(--sr-serif)', fontSize: 22 }}>Total</td>
                  <td className="sr-num" style={{ padding: '18px 0 0', textAlign: 'right', fontSize: 32, letterSpacing: '-0.02em' }}>${trip.total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Payment */}
          <section style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: 'var(--sr-surface-2)', border: '1px solid var(--sr-line)', marginBottom: 36 }}>
            <Icon name="credit-card" size={16} style={{ color: 'var(--sr-ink-3)' }} />
            <div style={{ flex: 1, fontFamily: 'var(--sr-sans)' }}>
              <div style={{ fontSize: 14, color: 'var(--sr-ink)' }}>Paid · {trip.payment}</div>
              <div className="sr-micro">{trip.paid}</div>
            </div>
            <span className="sr-chip sr-chip--completed">
              <span className="sr-chip__dot" /> Settled
            </span>
          </section>

          {/* Footer */}
          <footer style={{ borderTop: '1px solid var(--sr-ink)', paddingTop: 20, fontFamily: 'var(--sr-sans)', fontSize: 12, color: 'var(--sr-ink-3)', display: 'flex', justifyContent: 'space-between' }}>
            <span>SwiftRide Inc. · 114 Broad St, San Francisco CA 94104</span>
            <span>Questions? receipts@swiftride.com</span>
          </footer>
        </article>
      </main>
    </>
  );
};

window.ReceiptScreen = ReceiptScreen;
