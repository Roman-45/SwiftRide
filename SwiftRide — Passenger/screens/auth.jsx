/* global React, Topbar, StatusChip, StylizedMap, Icon, StarRating, PageHead, SwiftRideLogo, SwiftRideMark */

// ============================================================
// Screen: LOGIN
// ============================================================
const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = React.useState('mira@example.com');
  const [pwd, setPwd] = React.useState('••••••••');
  const [err, setErr] = React.useState(false);

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1.1fr', background: 'var(--sr-bg)' }}>
      {/* Left: hero */}
      <div style={{
        background: 'var(--sr-ink)',
        color: 'var(--sr-bg)',
        padding: '48px 56px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <SwiftRideLogo mono />
        </div>

        {/* editorial pull quote */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 480 }}>
          <div style={{ fontFamily: 'var(--sr-mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.5, marginBottom: 20 }}>
            №&nbsp;04 · The passenger console
          </div>
          <div style={{ fontFamily: 'var(--sr-serif)', fontSize: 56, lineHeight: 1.02, letterSpacing: '-0.02em', fontWeight: 400 }}>
            A quiet way to <span className="sr-italic" style={{ color: 'var(--sr-accent)' }}>move</span> through the city.
          </div>
          <p style={{ marginTop: 24, fontSize: 15, lineHeight: 1.55, color: 'rgba(247,245,241,0.7)', maxWidth: 420 }}>
            Book a ride, watch your driver approach in real time, and keep a ledger of everywhere you've been — no chrome, no noise.
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: 40, fontFamily: 'var(--sr-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(247,245,241,0.55)' }}>
          <span>Est. 2026</span>
          <span>v1.0 · passenger</span>
          <span style={{ marginLeft: 'auto' }}>Cedar Park → Harbor Green</span>
        </div>

        {/* subtle grid bg */}
        <svg style={{ position: 'absolute', inset: 0, opacity: 0.06 }} width="100%" height="100%">
          <defs>
            <pattern id="lg" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#lg)"/>
        </svg>
      </div>

      {/* Right: form */}
      <div style={{ display: 'grid', placeItems: 'center', padding: 48 }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div className="sr-eyebrow" style={{ marginBottom: 14 }}>Sign in</div>
          <h2 className="sr-h1" style={{ margin: 0, marginBottom: 8 }}>
            Welcome back.
          </h2>
          <p className="sr-body" style={{ marginTop: 0, marginBottom: 32 }}>
            Continue to your passenger account.
          </p>

          <form onSubmit={(e) => { e.preventDefault(); onLogin?.(); }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="sr-field">
              <label className="sr-label" htmlFor="email">Email</label>
              <input id="email" className="sr-input" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="sr-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="sr-label" htmlFor="pwd">Password</label>
              </div>
              <input id="pwd" type="password" className="sr-input" aria-invalid={err} value={pwd} onChange={e => setPwd(e.target.value)} />
              {err && (
                <div style={{ color: 'var(--sr-err)', fontSize: 12, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon name="alert" size={12} /> Email or password doesn't match our records.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="submit" className="sr-btn sr-btn--primary sr-btn--lg sr-btn--block" onClick={() => onLogin?.()}>
                Sign in <Icon name="arrow-right" size={14} />
              </button>
            </div>
            <button type="button" className="sr-btn sr-btn--ghost sr-btn--sm" onClick={() => setErr(!err)} style={{ alignSelf: 'center', marginTop: 4, opacity: 0.5 }}>
              {err ? 'clear error state' : 'preview error state'}
            </button>
          </form>

          <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--sr-line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="sr-small">New to SwiftRide?</span>
            <a href="#register" className="sr-btn sr-btn--secondary sr-btn--sm">Create an account <Icon name="arrow-right" size={12} /></a>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Screen: REGISTER
// ============================================================
const RegisterScreen = ({ onBack }) => {
  const [role, setRole] = React.useState('Passenger');

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 48, background: 'var(--sr-bg)' }}>
      <div style={{ width: '100%', maxWidth: 920, display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 48, alignItems: 'center' }}>
        <div>
          <SwiftRideLogo mono={false} />
          <div className="sr-eyebrow" style={{ marginTop: 28, marginBottom: 12 }}>Create account</div>
          <h2 className="sr-h1" style={{ margin: 0 }}>
            Let's get you <span className="sr-italic">moving</span>.
          </h2>
          <p className="sr-body" style={{ marginTop: 16, maxWidth: 320 }}>
            Ride as a passenger, or sign up to drive — pick your role below. Drivers are approved by an admin before their first trip.
          </p>
          <button className="sr-btn sr-btn--ghost" onClick={onBack} style={{ marginTop: 16, paddingLeft: 0 }}>
            <Icon name="arrow-left" size={14} /> Back to sign in
          </button>
        </div>

        <div className="sr-card sr-card--raised" style={{ padding: 32 }}>
          {/* Role tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24, padding: 4, background: 'var(--sr-bg)', borderRadius: 'var(--sr-r-3)', border: '1px solid var(--sr-line)' }}>
            {['Passenger', 'Driver'].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                style={{
                  padding: '14px 16px',
                  background: role === r ? 'var(--sr-surface)' : 'transparent',
                  border: role === r ? '1px solid var(--sr-line-2)' : '1px solid transparent',
                  borderRadius: 'var(--sr-r-2)',
                  fontFamily: 'var(--sr-sans)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  boxShadow: role === r ? 'var(--sr-shadow-1)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <Icon name={r === 'Passenger' ? 'user' : 'car'} size={16} />
                  <span style={{ fontFamily: 'var(--sr-serif)', fontSize: 18 }}>{r}</span>
                </div>
                <div className="sr-small" style={{ marginLeft: 26 }}>
                  {r === 'Passenger' ? 'Book and pay for rides.' : 'Drive and collect fares. Needs approval.'}
                </div>
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="sr-field" style={{ gridColumn: '1 / -1' }}>
              <label className="sr-label">Full name</label>
              <input className="sr-input" defaultValue="Mira Whitfield" />
            </div>
            <div className="sr-field">
              <label className="sr-label">Email</label>
              <input className="sr-input" defaultValue="mira@example.com" />
            </div>
            <div className="sr-field">
              <label className="sr-label">Phone</label>
              <input className="sr-input" defaultValue="+1 (415) 555-0144" />
            </div>
            <div className="sr-field" style={{ gridColumn: '1 / -1' }}>
              <label className="sr-label">Password</label>
              <input className="sr-input" type="password" defaultValue="••••••••" />
              <div className="sr-small" style={{ marginTop: 2 }}>At least 8 characters. Mix of letters and numbers.</div>
            </div>
          </div>

          <button className="sr-btn sr-btn--primary sr-btn--lg sr-btn--block" style={{ marginTop: 24 }}>
            Create account <Icon name="arrow-right" size={14} />
          </button>
          <div className="sr-small" style={{ marginTop: 14, textAlign: 'center' }}>
            By continuing you agree to SwiftRide's Terms and Privacy Policy.
          </div>
        </div>
      </div>
    </div>
  );
};

window.LoginScreen = LoginScreen;
window.RegisterScreen = RegisterScreen;
