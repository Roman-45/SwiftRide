import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type ToastKind = 'info' | 'ok' | 'err';
interface ToastMsg { id: number; kind: ToastKind; text: string }

interface ToastCtx {
  toast: (kind: ToastKind, text: string) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<ToastMsg[]>([]);
  const toast = useCallback((kind: ToastKind, text: string) => {
    const id = Date.now() + Math.random();
    setList((l) => [...l, { id, kind, text }]);
    setTimeout(() => setList((l) => l.filter((t) => t.id !== id)), 3200);
  }, []);
  const value = useMemo(() => ({ toast }), [toast]);
  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[300] flex flex-col gap-2 pointer-events-none">
        {list.map((t) => <ToastItem key={t.id} kind={t.kind} text={t.text} />)}
      </div>
    </Ctx.Provider>
  );
}

function ToastItem({ kind, text }: { kind: ToastKind; text: string }) {
  const color = kind === 'ok' ? '#7FD49B' : kind === 'err' ? '#F08080' : 'var(--sr-accent)';
  const [shown, setShown] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShown(true), 10); return () => clearTimeout(t); }, []);
  return (
    <div
      className="pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded text-[13px] text-paper"
      style={{
        background: 'var(--sr-ink)',
        boxShadow: 'var(--sr-shadow-pop)',
        transform: shown ? 'translateY(0)' : 'translateY(8px)',
        opacity: shown ? 1 : 0,
        transition: 'all 160ms ease',
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: 999, background: color }} />
      {text}
    </div>
  );
}

export function useToast(): ToastCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
