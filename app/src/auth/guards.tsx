import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { Role } from '../types';
import { homeForRole, useAuth } from './AuthContext';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  const loc = useLocation();
  if (!ready) return null;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname + loc.search)}`} replace />;
  return <>{children}</>;
}

export function RequireRole({ role, children }: { role: Role | Role[]; children: ReactNode }) {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace />;
  const allowed = Array.isArray(role) ? role.includes(user.role) : user.role === role;
  if (!allowed) return <Navigate to={homeForRole(user.role)} replace />;
  return <>{children}</>;
}

export function RedirectAuthed() {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (user) return <Navigate to={homeForRole(user.role)} replace />;
  return null;
}
