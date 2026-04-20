import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, homeForRole } from '../auth/AuthContext';
import { SwiftRideLogo } from '../components/Logo';
import { Icon } from '../components/Icon';
import { ApiError } from '../api/client';
import { Button } from '../components/Button';
import { Field, Input } from '../components/Field';

export function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('passenger1@swiftride.rw');
  const [password, setPassword] = useState('Pass@123');
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

          <Field label="Email">
            {({ inputId, invalid }) => (
              <Input id={inputId} type="email" value={email} onChange={(e) => setEmail(e.target.value)} invalid={invalid || !!error} required />
            )}
          </Field>
          <Field label="Password">
            {({ inputId, invalid }) => (
              <Input id={inputId} type="password" value={password} onChange={(e) => setPassword(e.target.value)} invalid={invalid || !!error} required />
            )}
          </Field>

          {error && (
            <div className="flex items-start gap-2 mb-4 p-3 rounded border" style={{ background: 'var(--sr-err-soft)', borderColor: 'rgba(168,30,30,0.35)', color: 'var(--sr-err)' }}>
              <Icon name="alert" size={16} />
              <span className="text-[13px]">{error}</span>
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" block disabled={busy} iconRight={!busy ? <Icon name="arrow-right" size={14} /> : undefined}>
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>

          <div className="mt-5 text-[13px] text-ink-3">
            New to SwiftRide? <Link to="/register" className="text-accent-hover underline">Create an account</Link>
          </div>

          <details className="mt-6">
            <summary className="sr-eyebrow cursor-pointer select-none">Demo accounts</summary>
            <div className="mt-3 grid gap-2 text-[13px]">
              {[
                { email: 'passenger1@swiftride.rw', password: 'Pass@123',   role: 'Passenger' },
                { email: 'driver1@swiftride.rw',    password: 'Driver@123', role: 'Driver (approved)' },
                { email: 'driver2@swiftride.rw',    password: 'Driver@123', role: 'Driver (pending approval)' },
                { email: 'admin@swiftride.rw',      password: 'Admin@123',  role: 'Admin' },
              ].map((a) => (
                <button type="button" key={a.email} onClick={() => { setEmail(a.email); setPassword(a.password); }} className="sr-card text-left px-3 py-2 hover:bg-surface-2 transition">
                  <div className="font-mono text-[12px]">{a.email}</div>
                  <div className="sr-small">{a.role} · <code>{a.password}</code></div>
                </button>
              ))}
            </div>
          </details>
        </form>
      </div>
    </div>
  );
}
