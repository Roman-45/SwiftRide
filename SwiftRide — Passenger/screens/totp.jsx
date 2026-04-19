/* global React, Icon, SwiftRideLogo */

// ============================================================
// Screen: TOTP — two-factor challenge after password login
// ============================================================
const TotpScreen = ({ onVerify, onBack }) => {
  const [digits, setDigits] = React.useState(['','','','','','']);
  const [err, setErr] = React.useState(false);
  const [seconds, setSeconds] = React.useState(23); // mock countdown to next code
  const [trusted, setTrusted] = React.useState(true);
  const refs = React.useRef([]);

  React.useEffect(() => {
    const id = setInterval(() => setSeconds(s => s <= 0 ? 30 : s - 1), 1000);
    return () => clearInterval(id);
  }, []);

  React.useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const setAt = (i, v) => {
    const clean = v.replace(/\D/g, '').slice(-1);
    setErr(false);
    setDigits(d => {
      const next = [...d];
      next[i] = clean;
      return next;
    });
    if (clean && i < 5) refs.current[i + 1]?.focus();
  };

  const onKey = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 5) refs.current[i + 1]?.focus();
  };

  const onPaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    const arr = ['','','','','',''];
    for (let i = 0; i < text.length; i++) arr[i] = text[i];
    setDigits(arr);
    const idx = Math.min(text.length, 5);
    refs.current[idx]?.focus();
  };

  const code = digits.join('');
  const full = code.length === 6;

  const submit = (e) => {
    e?.preventDefault();
    if (!full) return;
    if (code === '000000') { setErr(true); return; }
    onVerify?.();
  };

  // Arc progress for the countdown ring
  const pct = seconds / 30;
  const circumference = 2 * Math.PI * 18;

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1.1fr', background: 'var(--sr-bg)' }}>
      {/* Left: editorial hero */}
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

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 480 }}>
          <div style={{ fontFamily: 'var(--sr-mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.5, marginBottom: 20 }}>
            Step 2 of 2 · Verification
          </div>
          <div style={{ fontFamily: 'var(--sr-serif)', fontSize: 52, lineHeight: 1.02, letterSpacing: '-0.02em', fontWeight: 400 }}>
            One more <span className="sr-italic" style={{ color: 'var(--sr-accent)' }}>key</span>.
          </div>
          <p style={{ marginTop: 24, fontSize: 15, lineHeight: 1.55, color: 'rgba(247,245,241,0.7)', maxWidth: 420 }}>
            Open your authenticator app and enter the 6-digit code for <span style={{ color: 'white' }}>mira@example.com</span>. Codes rotate every 30 seconds.
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: 28, fontFamily: 'var(--sr-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(247,245,241,0.55)' }}>
          <span>TOTP · RFC 6238</span>
          <span>SHA-1 · 6 digits</span>
          <span style={{ marginLeft: 'auto' }}>Encrypted at rest</span>
        </div>

        <svg style={{ position: 'absolute', inset: 0, opacity: 0.06 }} width="100%" height="100%">
          <defs>
            <pattern id="lg2" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#lg2)"/>
        </svg>
      </div>

      {/* Right: code entry */}
      <div style={{ display: 'grid', placeItems: 'center', padding: 48 }}>
        <div style={{ width: '100%', maxWidth: 460 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span className="sr-eyebrow">Two-factor</span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontFamily: 'var(--sr-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: 'var(--sr-ink-3)',
            }}>
              <svg width="44" height="44" viewBox="0 0 44 44" style={{ display: 'block' }}>
                <circle cx="22" cy="22" r="18" fill="none" stroke="var(--sr-line-2)" strokeWidth="2.5"/>
                <circle
                  cx="22" cy="22" r="18" fill="none"
                  stroke={seconds < 6 ? 'var(--sr-err)' : 'var(--sr-accent)'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - pct)}
                  transform="rotate(-90 22 22)"
                  style={{ transition: 'stroke-dashoffset 1s linear, stroke 200ms' }}
                />
                <text
                  x="22" y="26" textAnchor="middle"
                  fontFamily="Geist Mono, monospace" fontSize="12"
                  fill={seconds < 6 ? 'var(--sr-err)' : 'var(--sr-ink)'}
                  fontWeight="500"
                >{seconds}</text>
              </svg>
              <span>code refreshes</span>
            </span>
          </div>

          <h2 className="sr-h1" style={{ margin: 0, marginBottom: 8 }}>
            Enter your <span className="sr-italic">code</span>.
          </h2>
          <p className="sr-body" style={{ marginTop: 0, marginBottom: 28 }}>
            From SwiftRide in your authenticator app (1Password, Authy, Google Authenticator).
          </p>

          <form onSubmit={submit} onPaste={onPaste} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label className="sr-label" style={{ marginBottom: 10, display: 'block' }}>6-digit code</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr) 18px repeat(3, 1fr)', gap: 8, alignItems: 'center' }}>
                {digits.map((d, i) => (
                  <React.Fragment key={i}>
                    <input
                      ref={el => refs.current[i] = el}
                      value={d}
                      onChange={e => setAt(i, e.target.value)}
                      onKeyDown={e => onKey(i, e)}
                      inputMode="numeric"
                      pattern="\d*"
                      maxLength={1}
                      aria-label={`Digit ${i + 1} of 6`}
                      aria-invalid={err}
                      className="sr-input"
                      style={{
                        textAlign: 'center',
                        fontFamily: 'var(--sr-mono)',
                        fontSize: 28,
                        padding: '16px 0',
                        letterSpacing: 0,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    />
                    {i === 2 && (
                      <span style={{ color: 'var(--sr-ink-4)', textAlign: 'center', fontSize: 20, fontFamily: 'var(--sr-mono)' }}>–</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
              {err && (
                <div style={{ color: 'var(--sr-err)', fontSize: 12, marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon name="alert" size={12} /> That code didn't match. Check your authenticator and try again.
                </div>
              )}
              {!err && (
                <div className="sr-small" style={{ marginTop: 10 }}>
                  Tip: paste the full code — we'll fill the boxes for you. <span style={{ color: 'var(--sr-ink-4)' }}>Enter 000000 to preview the error state.</span>
                </div>
              )}
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: 'var(--sr-surface-2)', border: '1px solid var(--sr-line)', borderRadius: 'var(--sr-r-3)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={trusted}
                onChange={e => setTrusted(e.target.checked)}
                style={{ marginTop: 2, accentColor: 'var(--sr-accent)' }}
              />
              <div>
                <div style={{ fontSize: 14, color: 'var(--sr-ink)' }}>Trust this browser for 30 days</div>
                <div className="sr-small" style={{ marginTop: 2 }}>Skip this step on MacBook Air · Safari. You can revoke trusted devices in Settings.</div>
              </div>
            </label>

            <button
              type="submit"
              className={`sr-btn sr-btn--primary sr-btn--lg sr-btn--block`}
              disabled={!full}
            >
              {full ? <>Verify and continue <Icon name="arrow-right" size={14} /></> : `Enter all 6 digits`}
            </button>
          </form>

          {/* Recovery */}
          <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--sr-line)', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="sr-eyebrow" style={{ marginBottom: 4 }}>Trouble signing in?</div>
            <a href="#" style={{ fontSize: 13, color: 'var(--sr-ink-2)', textDecoration: 'none' }}
               onMouseEnter={e => e.currentTarget.style.color = 'var(--sr-accent)'}
               onMouseLeave={e => e.currentTarget.style.color = 'var(--sr-ink-2)'}>
              → Use a <strong style={{ fontWeight: 500 }}>recovery code</strong> instead
            </a>
            <a href="#" style={{ fontSize: 13, color: 'var(--sr-ink-2)', textDecoration: 'none' }}
               onMouseEnter={e => e.currentTarget.style.color = 'var(--sr-accent)'}
               onMouseLeave={e => e.currentTarget.style.color = 'var(--sr-ink-2)'}>
              → Text the code to phone ending 0144
            </a>
            <a href="#" onClick={e => { e.preventDefault(); onBack?.(); }}
               style={{ fontSize: 13, color: 'var(--sr-ink-3)', textDecoration: 'none', marginTop: 6 }}>
              ← Back to sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

window.TotpScreen = TotpScreen;
