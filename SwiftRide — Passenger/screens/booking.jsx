/* global React, Topbar, StatusChip, StylizedMap, Icon, StarRating, PageHead */

const BookingScreen = ({ onBook }) => {
  const [pickup, setPickup] = React.useState('Home · 312 Juniper St, Cedar Park');
  const [dropoff, setDropoff] = React.useState('');
  const [searching, setSearching] = React.useState(false);
  const [picked, setPicked] = React.useState(null);
  const [showResults, setShowResults] = React.useState(false);

  const suggestions = [
    { icon: 'briefcase', label: 'Work', sub: 'Ashland Tower, 410 Market St', freq: 12 },
    { icon: 'coffee',    label: 'Monograph Coffee', sub: 'Harbor Green · 0.8 mi', freq: 5 },
    { icon: 'plane',     label: 'Airport — Terminal B', sub: 'Usually Friday evenings', freq: 3 },
    { icon: 'home',      label: "Aisha's place", sub: '22 Ledger Lane, Midtown', freq: 4 },
  ];

  const results = [
    { name: 'Ashland Tower', addr: '410 Market St, Midtown', dist: '2.4 mi', tag: 'Work' },
    { name: 'Ashland Plaza',  addr: '418 Market St, Midtown', dist: '2.4 mi' },
    { name: 'Ash Street Café', addr: '88 Ash St, Cedar Park',  dist: '0.6 mi' },
    { name: 'The Ashery',      addr: '201 Commerce Ln, Harbor Green', dist: '3.1 mi' },
  ];

  const hasBoth = pickup && (picked || dropoff.length > 2);
  const activePicked = picked || (dropoff ? { name: dropoff, addr: '—' } : null);

  return (
    <>
      <Topbar active="book" />
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
        <PageHead
          eyebrow="Booking · 19 Apr, 4:12 PM"
          title={<>Where are you <span className="sr-italic">going</span>?</>}
          lede="Set a pickup and dropoff, review the fare, and we'll dispatch the nearest driver. Your most-used places appear below — tap one to prefill."
        />

        <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 24, alignItems: 'start' }}>
          {/* LEFT: controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Pickup/Dropoff composer */}
            <div className="sr-card sr-card--raised" style={{ padding: 20, position: 'relative' }}>
              <div className="sr-eyebrow" style={{ marginBottom: 12 }}>Route</div>

              {/* Vertical connector */}
              <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '28px 1fr', gap: 10 }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--sr-ink)', margin: '14px auto 0', border: '2px solid var(--sr-bg)', outline: '1px solid var(--sr-ink)' }} />
                  <div style={{ position: 'absolute', top: 30, bottom: 12, left: '50%', transform: 'translateX(-50%)', borderLeft: '2px dotted var(--sr-ink-4)' }} />
                  <div style={{ width: 10, height: 10, background: 'var(--sr-accent)', margin: '42px auto 0', transform: 'rotate(45deg)' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <label className="sr-label">Pickup</label>
                    <div className="sr-input-icon" style={{ marginTop: 4 }}>
                      <Icon name="locate" size={14} />
                      <input className="sr-input" value={pickup} onChange={e => setPickup(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="sr-label">Dropoff</label>
                    <div className="sr-input-icon" style={{ marginTop: 4 }}>
                      <Icon name="search" size={14} />
                      <input
                        className="sr-input"
                        placeholder="Search a street, place, or saved spot"
                        value={picked ? picked.name : dropoff}
                        onChange={e => { setPicked(null); setDropoff(e.target.value); setShowResults(e.target.value.length >= 3); }}
                        onFocus={() => setShowResults(dropoff.length >= 3)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button className="sr-btn sr-btn--ghost sr-btn--sm" style={{ marginTop: 12, paddingLeft: 0 }}>
                <Icon name="locate" size={13} /> Use my current location
              </button>

              {/* live results dropdown */}
              {showResults && !picked && (
                <div className="sr-card" style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, padding: 6, boxShadow: 'var(--sr-shadow-pop)', zIndex: 5 }}>
                  {results.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => { setPicked(r); setDropoff(r.name); setShowResults(false); }}
                      style={{
                        display: 'grid', gridTemplateColumns: '28px 1fr auto', gap: 10, alignItems: 'center',
                        width: '100%', padding: '10px 12px', background: 'transparent', border: 'none',
                        borderRadius: 'var(--sr-r-2)', cursor: 'pointer', textAlign: 'left',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--sr-surface-2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Icon name="map-pin" size={14} style={{ color: 'var(--sr-ink-3)' }} />
                      <div>
                        <div style={{ fontSize: 14, color: 'var(--sr-ink)', fontWeight: 500 }}>
                          {r.name} {r.tag && <span className="sr-micro" style={{ marginLeft: 6, padding: '1px 6px', background: 'var(--sr-accent-soft)', color: 'var(--sr-accent-hover)', borderRadius: 2 }}>{r.tag}</span>}
                        </div>
                        <div className="sr-small">{r.addr}</div>
                      </div>
                      <span className="sr-micro">{r.dist}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Suggestions */}
            <div>
              <div className="sr-eyebrow" style={{ marginBottom: 10 }}>Frequent & contextual</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {suggestions.map((s, i) => (
                  <button key={i} className="sr-sugchip" onClick={() => setPicked({ name: s.label, addr: s.sub })}>
                    <span className="sr-sugchip__icon"><Icon name={s.icon} size={12} /></span>
                    <span>{s.label}</span>
                    <span className="sr-micro" style={{ color: 'var(--sr-ink-4)', marginLeft: 4 }}>·  {s.freq}×</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fare card */}
            <FareCard ready={!!hasBoth} destination={activePicked} />

            {/* Book button */}
            <button
              className={`sr-btn sr-btn--primary sr-btn--lg sr-btn--block`}
              disabled={!hasBoth}
              onClick={onBook}
            >
              {hasBoth ? <>Book ride · $14.80 <Icon name="arrow-right" size={14} /></> : 'Set a dropoff to continue'}
            </button>
            <div className="sr-small" style={{ textAlign: 'center', marginTop: -4 }}>
              <Icon name="shield" size={11} style={{ verticalAlign: -1, marginRight: 4 }}/>
              Fare is locked at book. Cancel free for 60 seconds.
            </div>
          </div>

          {/* RIGHT: map */}
          <div style={{ position: 'sticky', top: 24 }}>
            <StylizedMap
              height={620}
              pickup={{ x: 28, y: 62 }}
              dropoff={{ x: 74, y: 34 }}
              showRoute={!!hasBoth}
            />
          </div>
        </div>
      </main>
    </>
  );
};

const FareCard = ({ ready, destination }) => {
  return (
    <div className="sr-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--sr-line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="sr-eyebrow">Fare estimate</span>
        <span className="sr-micro">Fixed · USD</span>
      </div>

      {!ready ? (
        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center' }}>
          <div>
            <div className="sr-skel" style={{ height: 14, width: 140, marginBottom: 8 }} />
            <div className="sr-skel" style={{ height: 10, width: 200 }} />
          </div>
          <div className="sr-skel" style={{ height: 36, width: 90 }} />
        </div>
      ) : (
        <>
          <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'end', gap: 12 }}>
            <div>
              <div className="sr-small" style={{ marginBottom: 4 }}>Estimated fare to</div>
              <div style={{ fontFamily: 'var(--sr-serif)', fontSize: 18, lineHeight: 1.2 }}>
                {destination?.name || '—'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="sr-num" style={{ fontSize: 40, lineHeight: 1, letterSpacing: '-0.02em' }}>
                $14.<span style={{ fontSize: 26 }}>80</span>
              </div>
            </div>
          </div>
          <div className="sr-divider" />
          <div style={{ padding: '14px 20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            <FareStat label="Distance" value="3.4 mi" />
            <FareStat label="Duration" value="≈ 12 min" />
            <FareStat label="Arriving" value="4:26 PM" />
          </div>
        </>
      )}
    </div>
  );
};
const FareStat = ({ label, value }) => (
  <div>
    <div className="sr-micro" style={{ marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
    <div style={{ fontFamily: 'var(--sr-serif)', fontSize: 16 }}>{value}</div>
  </div>
);

window.BookingScreen = BookingScreen;
