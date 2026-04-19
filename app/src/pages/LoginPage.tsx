import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, homeForRole } from '../auth/AuthContext';
import { SwiftRideLogo } from '../components/Logo';
import { Icon } from '../components/Icon';
import { ApiError } from '../api/client';

export function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('mira@example.com');
  const [password, setPassword] = useState('demo1234');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const user = await login(email, password);
      const next = params.get('next');
      nav(next && next.startsWith('/') ? next : homeForRole(user.role), { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_1.1fr] bg-paper">
      <div className="bg-ink text-paper px-6 sm:px-12 lg:px-14 py-10 lg:py-12 flex flex-col justify-between relative overflow-hidden">
        <SwiftRideLogo mono />
        <div className="relative z-10 max-w-lg mt-8 lg:mt-0">
          <div className="font-mono text-[11px] tracking-[0.14em] uppercase opacity-60 mb-4">№&nbsp;04 · The passenger console</div>
          <h1 className="sr-display" style={{ fontSize: 'clamp(36px, 6vw, 56px)', color: 'inherit' }}>
            A quiet way to <span className="sr-italic" style={{ color: 'var(--sr-accent)' }}>move</span> through the city.
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/70">
            Book a ride, watch your driver approach, keep a ledger of every trip. No chrome, no noise.
          </p>
        </div>
        <div className="hidden sm:flex gap-10 font-mono text-[11px] tracking-wider uppercase text-white/55 mt-6">
          <span>Est. 2026</span><span>v1.0</span>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 sm:px-10 py-10 lg:py-12">
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <div className="sr-eyebrow mb-2">Sign in</div>
          <h2 className="sr-h1 mb-2">Welcome back.</h2>
          <p className="sr-small mb-6">Use one of the demo accounts or register a new passenger / driver.</p>

          <div className="sr-field mb-4">
            <label htmlFor="email" className="sr-label">Email</label>
            <input id="email" type="email" className="sr-input" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!error || undefined} required />
          </div>
          <div className="sr-field mb-4">
            <label htmlFor="password" className="sr-label">Password</label>
            <input id="password" type="password" className="sr-input" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!error || undefined} required />
          </div>

          {error && (
            <div className="flex items-start gap-2 mb-4 p-3 rounded border" style={{ background: 'var(--sr-err-soft)', borderColor: 'rgba(168,30,30,0.35)', color: 'var(--sr-err)' }}>
              <Icon name="alert" size={16} />
              <span className="text-[13px]">{error}</span>
            </div>
          )}

          <button type="submit" className="sr-btn sr-btn--primary sr-btn--lg sr-btn--block" disabled={busy}>
            {busy ? 'Signing in…' : <>Sign in <Icon name="arrow-right" size={14} /></>}
          </button>

          <div className="mt-5 text-[13px] text-ink-3">
            New to SwiftRide? <Link to="/register" className="text-accent-hover underline">Create an account</Link>
          </div>

          <details className="mt-6">
            <summary className="sr-eyebrow cursor-pointer select-none">Demo accounts</summary>
            <div className="mt-3 grid gap-2 text-[13px]">
              {[
                { email: 'mira@example.com',  role: 'Passenger' },
                { email: 'dom@example.com',   role: 'Driver (approved)' },
                { email: 'nadia@example.com', role: 'Driver (pending approval)' },
                { email: 'elena@example.com', role: 'Admin' },
              ].map((a) => (
                <button type="button" key={a.email} onClick={() => setEmail(a.email)} className="sr-card text-left px-3 py-2 hover:bg-surface-2 transition">
                  <div className="font-mono text-[12px]">{a.email}</div>
                  <div className="sr-small">{a.role}</div>
                </button>
              ))}
              <div className="sr-small">Password: any ≥ 4 chars, e.g. <code>demo1234</code></div>
            </div>
          </details>
        </form>
      </div>
    </div>
  );
}
