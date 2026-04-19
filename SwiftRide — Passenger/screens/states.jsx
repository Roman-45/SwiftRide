/* global React, Topbar, StatusChip, Icon, PageHead */

// ============================================================
// Screen: STATES — a single page demonstrating every cross-cutting
// state from section 3 of the brief: Loading / Empty / Error / Unauthorized
// ============================================================
const StatesScreen = () => {
  return (
    <>
      <Topbar active="history" />
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 64px' }}>
        <PageHead
          eyebrow="DoR · Section 3"
          title={<>Every state, <span className="sr-italic">on one page</span>.</>}
          lede="Loading, empty, error, unauthorized. Four guardrails the brief asks us to handle on every screen. Here they are, side by side, so the PO can tick section 3 in one walkthrough."
        />

        {/* 1. Loading */}
        <StateBlock num="01" label="Loading" title="A skeleton or spinner for any async fetch. Never a blank screen > 300 ms.">
          <div className="sr-card" style={{ overflow: 'hidden' }}>
            <table className="sr-table">
              <thead>
                <tr>
                  <th style={{ width: 160 }}>Date</th>
                  <th>Route</th>
                  <th style={{ width: 140 }}>Driver</th>
                  <th style={{ width: 110, textAlign: 'right' }}>Fare</th>
                  <th style={{ width: 120 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {[0,1,2,3].map(i => (
                  <tr key={i}>
                    <td><div className="sr-skel" style={{ height: 12, width: '70%', marginBottom: 6 }}/><div className="sr-skel" style={{ height: 9, width: '40%' }}/></td>
                    <td><div className="sr-skel" style={{ height: 12, width: '85%' }}/></td>
                    <td><div className="sr-skel" style={{ height: 12, width: '70%' }}/></td>
                    <td style={{ textAlign: 'right' }}><div className="sr-skel" style={{ height: 14, width: 56, marginLeft: 'auto' }}/></td>
                    <td><div className="sr-skel" style={{ height: 18, width: 84, borderRadius: 999 }}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </StateBlock>

        {/* 2. Empty */}
        <StateBlock num="02" label="Empty" title="Branded icon + one sentence of guidance + CTA where useful. Never a bare 'No data'.">
          <div className="sr-card" style={{ padding: 64, textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, margin: '0 auto 16px', display: 'grid', placeItems: 'center', background: 'var(--sr-accent-soft)', color: 'var(--sr-accent)', borderRadius: 999 }}>
              <Icon name="route" size={24} />
            </div>
            <div style={{ fontFamily: 'var(--sr-serif)', fontSize: 26, letterSpacing: '-0.015em', marginBottom: 6 }}>
              No trips yet.
            </div>
            <div className="sr-small" style={{ maxWidth: 360, margin: '0 auto 20px' }}>
              Book your first ride and it'll land here. Your ledger starts with one trip.
            </div>
            <a href="#book" className="sr-btn sr-btn--primary">
              <Icon name="plus" size={14} /> Book a ride
            </a>
          </div>
        </StateBlock>

        {/* 3. Error */}
        <StateBlock num="03" label="Error" title="Toast for transient failures. Inline retry for page-level fetch errors. Never a raw stack trace.">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Toast variant */}
            <div>
              <div className="sr-eyebrow" style={{ marginBottom: 10 }}>Transient — toast</div>
              <div style={{ background: 'var(--sr-ink)', color: 'var(--sr-bg)', padding: 14, borderRadius: 'var(--sr-r-3)', display: 'flex', alignItems: 'center', gap: 12, boxShadow: 'var(--sr-shadow-pop)' }}>
                <div style={{ width: 28, height: 28, background: 'var(--sr-err)', borderRadius: 2, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Icon name="alert" size={14} />
                </div>
                <div style={{ flex: 1, fontSize: 13 }}>
                  <div style={{ fontFamily: 'var(--sr-serif)', fontSize: 15, marginBottom: 2 }}>Couldn't submit rating</div>
                  <div style={{ opacity: 0.7, fontSize: 12 }}>Network hiccup — we'll retry in the background.</div>
                </div>
                <button className="sr-btn sr-btn--ghost sr-btn--sm" style={{ color: 'var(--sr-bg)' }}>Dismiss</button>
              </div>
            </div>
            {/* Inline retry variant */}
            <div>
              <div className="sr-eyebrow" style={{ marginBottom: 10 }}>Page-level — inline retry</div>
              <div className="sr-card" style={{ padding: 32, textAlign: 'center' }}>
                <div style={{ width: 40, height: 40, margin: '0 auto 12px', display: 'grid', placeItems: 'center', background: 'var(--sr-err-soft)', color: 'var(--sr-err)', borderRadius: 4 }}>
                  <Icon name="alert" size={18} />
                </div>
                <div style={{ fontFamily: 'var(--sr-serif)', fontSize: 20, marginBottom: 4 }}>We couldn't load your trips.</div>
                <div className="sr-small" style={{ marginBottom: 16, maxWidth: 320, margin: '0 auto 16px' }}>
                  The server didn't respond. Check your connection and try again. <span className="sr-micro" style={{ color: 'var(--sr-ink-4)' }}>REF: fetch_trips · 503</span>
                </div>
                <button className="sr-btn sr-btn--secondary">
                  <Icon name="arrow-right" size={14} /> Retry
                </button>
              </div>
            </div>
          </div>
        </StateBlock>

        {/* 4. Unauthorized */}
        <StateBlock num="04" label="Unauthorized" title="Missing/expired token → bounce to login. Wrong role → bounce to that role's home. Never a 403 page.">
          <div className="sr-card" style={{ padding: 40, display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 24, alignItems: 'center', background: 'var(--sr-ink)', color: 'var(--sr-bg)' }}>
            <div style={{ width: 56, height: 56, background: 'var(--sr-warn)', color: 'var(--sr-ink)', borderRadius: 2, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Icon name="shield" size={24} />
            </div>
            <div>
              <div className="sr-eyebrow" style={{ color: 'var(--sr-warn-soft)', marginBottom: 6 }}>Session expired</div>
              <div style={{ fontFamily: 'var(--sr-serif)', fontSize: 24, letterSpacing: '-0.015em', marginBottom: 4 }}>
                Signing you back <span className="sr-italic">in</span>…
              </div>
              <div style={{ fontSize: 13, opacity: 0.7 }}>
                You'll be returned to this page once you're signed in. For your safety, we time out sessions after 24 hours.
              </div>
            </div>
            <div style={{ width: 2, height: 44, background: 'var(--sr-warn)', animation: 'sr-blink 1.2s steps(2) infinite' }} />
            <style>{`@keyframes sr-blink { 50% { opacity: 0; } }`}</style>
          </div>

          {/* Forbidden receipt variant */}
          <div style={{ marginTop: 14 }}>
            <div className="sr-eyebrow" style={{ marginBottom: 10 }}>Forbidden — wrong user's receipt</div>
            <div className="sr-card" style={{ padding: 32, textAlign: 'center' }}>
              <Icon name="shield" size={24} style={{ color: 'var(--sr-ink-3)', marginBottom: 10 }}/>
              <div style={{ fontFamily: 'var(--sr-serif)', fontSize: 20, marginBottom: 4 }}>That receipt isn't yours.</div>
              <div className="sr-small" style={{ marginBottom: 16 }}>This receipt belongs to a different account. Your history is over this way.</div>
              <a href="#history" className="sr-btn sr-btn--secondary">
                <Icon name="arrow-left" size={14} /> Back to your history
              </a>
            </div>
          </div>
        </StateBlock>
      </main>
    </>
  );
};

const StateBlock = ({ num, label, title, children }) => (
  <section style={{ marginBottom: 40 }}>
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 32, marginBottom: 16 }}>
      <div>
        <div className="sr-num" style={{ fontSize: 36, lineHeight: 1, color: 'var(--sr-accent)', marginBottom: 4 }}>{num}</div>
        <div className="sr-eyebrow">{label}</div>
      </div>
      <div style={{ paddingTop: 8 }}>
        <div className="sr-small" style={{ color: 'var(--sr-ink-2)' }}>{title}</div>
      </div>
    </div>
    {children}
  </section>
);

window.StatesScreen = StatesScreen;
