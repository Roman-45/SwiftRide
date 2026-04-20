import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, homeForRole } from '../auth/AuthContext';
import { SwiftRideLogo } from '../components/Logo';
import { Icon } from '../components/Icon';
import { ApiError } from '../api/client';
import { Button } from '../components/Button';
import { Field, Input } from '../components/Field';

export function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '',
    role: 'passenger' as 'passenger' | 'driver',
    licensePlate: '', vehicleModel: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null); setBusy(true);
    try {
      const user = await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
        licensePlate: form.role === 'driver' ? form.licensePlate : undefined,
        vehicleModel: form.role === 'driver' ? form.vehicleModel : undefined,
      });
      nav(homeForRole(user.role), { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create your account.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_1.1fr] bg-paper">
      <div className="bg-ink text-paper px-6 sm:px-12 lg:px-14 py-10 lg:py-12 flex flex-col justify-between">
        <SwiftRideLogo mono />
        <div className="max-w-lg">
          <div className="font-mono text-[11px] tracking-[0.14em] uppercase opacity-60 mb-4">Create an account</div>
          <h1 className="sr-display" style={{ fontSize: 'clamp(36px, 6vw, 56px)', color: 'inherit' }}>
            Two seats at the table: <span className="sr-italic" style={{ color: 'var(--sr-accent)' }}>passenger</span> or <span className="sr-italic" style={{ color: 'var(--sr-accent)' }}>driver</span>.
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/70">
            Admin accounts aren't self-serve — approved by the team.
          </p>
        </div>
        <Link to="/login" className="font-mono text-[11px] tracking-wider uppercase text-white/60 hover:text-white/90 inline-flex items-center gap-2">
          <Icon name="arrow-left" size={14} /> Back to sign in
        </Link>
      </div>

      <div className="flex items-center justify-center px-6 sm:px-10 py-10 lg:py-12">
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <div className="sr-eyebrow mb-2">Register</div>
          <h2 className="sr-h1 mb-6">Join the ledger.</h2>

          <Field label="Full name">
            {({ inputId }) => <Input id={inputId} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />}
          </Field>
          <Field label="Email">
            {({ inputId }) => <Input id={inputId} type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />}
          </Field>
          <Field label="Phone">
            {({ inputId }) => <Input id={inputId} placeholder="+250 78 000 0000" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} required />}
          </Field>
          <Field label="Password" hint="Minimum 6 characters.">
            {({ inputId }) => <Input id={inputId} type="password" minLength={6} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required />}
          </Field>

          <div className="sr-field mb-5">
            <span className="sr-label">Role</span>
            <div className="grid grid-cols-2 gap-2">
              {(['passenger', 'driver'] as const).map((r) => (
                <button
                  type="button" key={r}
                  className={`sr-card text-left p-4 transition ${form.role === r ? 'border-accent shadow-[0_0_0_3px_var(--sr-accent-soft)]' : ''}`}
                  onClick={() => setForm((f) => ({ ...f, role: r }))}
                >
                  <div className="font-serif text-[18px] capitalize">{r}</div>
                  <div className="sr-small">{r === 'passenger' ? 'Book rides, view history.' : 'Accept trips, view earnings. Admin approval required.'}</div>
                </button>
              ))}
            </div>
          </div>

          {form.role === 'driver' && (
            <>
              <Field label="Licence plate">
                {({ inputId }) => <Input id={inputId} placeholder="RAA 123 A" value={form.licensePlate} onChange={(e) => setForm((f) => ({ ...f, licensePlate: e.target.value }))} />}
              </Field>
              <Field label="Vehicle model" hint="Optional. You can fill this in later.">
                {({ inputId }) => <Input id={inputId} placeholder="Toyota Corolla" value={form.vehicleModel} onChange={(e) => setForm((f) => ({ ...f, vehicleModel: e.target.value }))} />}
              </Field>
            </>
          )}

          {error && (
            <div className="flex items-start gap-2 mb-4 p-3 rounded border" style={{ background: 'var(--sr-err-soft)', borderColor: 'rgba(168,30,30,0.35)', color: 'var(--sr-err)' }}>
              <Icon name="alert" size={16} />
              <span className="text-[13px]">{error}</span>
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" block disabled={busy} iconRight={!busy ? <Icon name="arrow-right" size={14} /> : undefined}>
            {busy ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
      </div>
    </div>
  );
}
