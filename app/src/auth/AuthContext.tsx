import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Role, User } from '../types';
import * as api from '../api/client';

interface AuthState {
  user: User | null;
  token: string | null;
  ready: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<User>;
  register: (params: { name: string; email: string; phone: string; password: string; role: Exclude<Role, 'admin'> }) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'sr-auth';  // sessionStorage only — per SECURITY.md rule in brief.

function readSession(): AuthState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, token: null, ready: true };
    const parsed = JSON.parse(raw) as { user: User; token: string };
    return { user: parsed.user, token: parsed.token, ready: true };
  } catch {
    return { user: null, token: null, ready: true };
  }
}

function writeSession(state: { user: User; token: string } | null) {
  if (!state) sessionStorage.removeItem(STORAGE_KEY);
  else sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, token: null, ready: false });

  useEffect(() => { setState(readSession()); }, []);

  const handleLogin = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password);
    writeSession({ user: res.user, token: res.token });
    setState({ user: res.user, token: res.token, ready: true });
    return res.user;
  }, []);

  const handleRegister = useCallback<AuthContextValue['register']>(async (params) => {
    const res = await api.register(params);
    writeSession({ user: res.user, token: res.token });
    setState({ user: res.user, token: res.token, ready: true });
    return res.user;
  }, []);

  const handleLogout = useCallback(() => {
    writeSession(null);
    setState({ user: null, token: null, ready: true });
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    ...state,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  }), [state, handleLogin, handleRegister, handleLogout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export function homeForRole(role: Role): string {
  if (role === 'passenger') return '/passenger/book';
  if (role === 'driver') return '/driver';
  return '/admin';
}
