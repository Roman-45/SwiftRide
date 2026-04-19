import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { SwiftRideMark } from '../components/Logo';
import { Icon } from '../components/Icon';
import { useAuth } from '../auth/AuthContext';

const NAV = [
  { to: '/admin',       label: 'Overview', icon: 'home' as const, end: true },
  { to: '/admin/users', label: 'Users',    icon: 'user' as const },
  { to: '/admin/trips', label: 'Trips',    icon: 'route' as const },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const initials = user?.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() ?? '?';

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr] bg-paper">
      {/* Mobile top bar */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0E0D0B] text-[#e6e4df] border-b border-[#1d1c19]">
        <button
          className="p-2 -ml-2 rounded hover:bg-white/10"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle nav"
        ><Icon name={open ? 'x' : 'menu'} size={20} /></button>
        <div className="flex items-center gap-2">
          <SwiftRideMark size={18} mono />
          <span className="font-serif text-[15px]">SwiftRide</span>
          <span className="font-mono text-[9px] tracking-widest uppercase text-[#9aa0a4] ml-1">Operations</span>
        </div>
        <button
          className="p-1.5 rounded hover:bg-white/10"
          onClick={() => { logout(); nav('/login', { replace: true }); }}
          aria-label="Log out"
        ><Icon name="log-out" size={16} /></button>
      </header>

      {/* Sidebar */}
      <aside
        className={`${open ? 'block' : 'hidden'} lg:flex lg:sticky lg:top-0 lg:h-screen bg-[#0E0D0B] text-[#e6e4df] flex-col p-3.5 border-r border-[#1d1c19]`}
      >
        <a href="/admin" className="hidden lg:flex items-center gap-2.5 px-2 py-1.5 pb-5 border-b border-[#1d1c19] mb-4 no-underline" style={{ color: '#e6e4df' }}>
          <SwiftRideMark size={20} mono />
          <div className="flex flex-col leading-tight">
            <span className="font-serif text-[16px] tracking-tight">SwiftRide</span>
            <span className="font-mono text-[9px] tracking-widest uppercase text-[#9aa0a4]">Operations</span>
          </div>
        </a>

        <div className="mb-5">
          <div className="font-mono text-[10px] tracking-widest uppercase text-[#6a6f74] px-2 pb-2">Primary</div>
          {NAV.map((n) => (
            <NavLink
              key={n.to} to={n.to} end={n.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `flex items-center gap-2.5 px-2.5 py-2 rounded text-[13px] mb-0.5 transition
                ${isActive ? 'bg-[rgba(224,83,26,0.14)] text-white shadow-[inset_2px_0_0_#E0531A]' : 'text-[#c8c6c1] hover:bg-white/5 hover:text-white'}`}
            >
              <Icon name={n.icon} size={14} />
              <span className="flex-1">{n.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="flex-1" />

        <div className="p-2 border-t border-[#1d1c19] pt-3 hidden lg:block">
          <div className="flex items-center gap-2.5">
            <div className="sr-avatar sr-avatar--sm" style={{ background: '#E0531A', color: 'white' }}>{initials}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] text-[#e6e4df] font-medium truncate">{user?.name}</div>
              <div className="font-mono text-[9px] text-[#9aa0a4] tracking-widest uppercase">Admin</div>
            </div>
            <button
              className="p-1 rounded hover:bg-white/10"
              onClick={() => { logout(); nav('/login', { replace: true }); }}
              aria-label="Log out"
            ><Icon name="log-out" size={14} style={{ color: '#9aa0a4' }} /></button>
          </div>
        </div>
      </aside>

      <div className="flex flex-col min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
