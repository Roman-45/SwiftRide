import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { SwiftRideLogo } from '../components/Logo';
import { Icon } from '../components/Icon';
import { useAuth } from '../auth/AuthContext';

const NAV = [
  { to: '/driver',       label: 'Dashboard',  icon: 'home' as const, end: true },
  { to: '/driver/trip',  label: 'Active trip', icon: 'route' as const },
];

export function DriverLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const initials = user?.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() ?? '?';

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 bg-ink text-paper">
        <div className="flex items-center gap-4">
          <button
            className="md:hidden p-2 -ml-2 rounded hover:bg-white/10"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle nav"
          >
            <Icon name={open ? 'x' : 'menu'} size={20} />
          </button>
          <SwiftRideLogo />
          <span className="hidden md:inline-flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase text-white/60">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7FD49B]" /> Driver
          </span>
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {NAV.map((n) => (
              <NavLink
                key={n.to} to={n.to} end={n.end}
                className={({ isActive }) =>
                  `inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition
                  ${isActive ? 'text-paper bg-white/10' : 'text-white/70 hover:text-paper hover:bg-white/5'}`
                }
              >
                <Icon name={n.icon} size={14} /> {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline font-mono text-[11px] tracking-wider uppercase text-white/60">
            Driver
          </span>
          <div className="flex items-center gap-2.5 pl-3 border-l border-white/10">
            <div className="sr-avatar sr-avatar--sm" style={{ background: '#1B4C9A', color: 'white' }}>{initials}</div>
            <span className="hidden sm:inline text-[13px]">{user?.name}</span>
            <button
              className="p-1.5 rounded hover:bg-white/10"
              onClick={() => { logout(); nav('/login', { replace: true }); }}
              aria-label="Log out"
              title="Log out"
            ><Icon name="log-out" size={16} /></button>
          </div>
        </div>
      </header>

      {open && (
        <nav className="md:hidden border-b border-line bg-surface">
          {NAV.map((n) => (
            <NavLink
              key={n.to} to={n.to} end={n.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm border-b border-line last:border-0 ${isActive ? 'bg-accent-soft text-accent-hover' : 'text-ink-2'}`
              }
            >
              <Icon name={n.icon} size={16} /> {n.label}
            </NavLink>
          ))}
        </nav>
      )}

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
