import { useCallback, useEffect, useMemo, useState } from 'react';
import { approveDriver, getAdminUsers, suspendDriver } from '../api/client';
import type { User } from '../types';
import { Icon } from '../components/Icon';
import { StarRating } from '../components/StarRating';
import { EmptyState, InlineError, SkeletonRow } from '../components/EmptyState';
import { useToast } from '../components/Toast';

type Tab = 'drivers' | 'passengers';

export function AdminUsersPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('drivers');
  const [users, setUsers] = useState<User[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');

  const load = useCallback(() => {
    setError(null);
    getAdminUsers().then(setUsers).catch((e) => setError(e.message));
  }, []);

  useEffect(load, [load]);

  const rows = useMemo(() => {
    if (!users) return null;
    const target = tab === 'drivers' ? 'driver' : 'passenger';
    return users
      .filter((u) => u.role === target)
      .filter((u) => q.trim().length === 0 || [u.name, u.email, u.phone].some((f) => f.toLowerCase().includes(q.toLowerCase())));
  }, [users, tab, q]);

  const handleApprove = async (id: string) => {
    try {
      const updated = await approveDriver(id);
      setUsers((u) => u?.map((x) => x.id === id ? updated : x) ?? null);
      toast('ok', `${updated.name} approved.`);
    } catch (e) { toast('err', e instanceof Error ? e.message : 'Could not approve.'); }
  };

  const handleSuspend = async (id: string) => {
    try {
      const updated = await suspendDriver(id);
      setUsers((u) => u?.map((x) => x.id === id ? updated : x) ?? null);
      toast('info', `${updated.name} suspended.`);
    } catch (e) { toast('err', e instanceof Error ? e.message : 'Could not suspend.'); }
  };

  return (
    <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8">
      <header className="pb-5 mb-5 border-b border-line">
        <div className="sr-eyebrow mb-1">Users</div>
        <h1 className="font-serif text-[28px] font-normal tracking-tight m-0">Approve, suspend, and browse.</h1>
      </header>

      <div className="flex items-center gap-2 flex-wrap mb-4 justify-between">
        <div className="inline-flex rounded border border-line p-1 bg-surface" role="tablist">
          {(['drivers', 'passengers'] as Tab[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded text-[13px] font-medium transition capitalize
                ${tab === t ? 'bg-ink text-paper' : 'text-ink-3 hover:text-ink'}`}
            >{t}</button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Icon name="search" size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--sr-ink-3)' }} />
          <input
            className="sr-input"
            style={{ paddingLeft: 32, padding: '8px 10px 8px 32px' }}
            placeholder="Search name, email, phone"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {error && <InlineError message={error} onRetry={load} />}
      {!rows && !error && <div className="sr-card p-6"><SkeletonRow lines={5} /></div>}

      {rows && rows.length === 0 && (
        <div className="sr-card"><EmptyState icon="user" title="No results" body="Adjust your filter or clear the search." /></div>
      )}

      {rows && rows.length > 0 && (
        <>
          {/* Desktop */}
          <div className="sr-card overflow-hidden hidden md:block">
            <table className="sr-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  {tab === 'drivers' && <th>Rating</th>}
                  {tab === 'drivers' && <th>Status</th>}
                  {tab === 'drivers' && <th style={{ width: 220, textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong></td>
                    <td><span className="sr-table__num">{u.email}</span></td>
                    <td>{u.phone}</td>
                    {tab === 'drivers' && (
                      <td>
                        {u.ratingCount && u.ratingCount > 0 ? (
                          <div className="flex items-center gap-2"><StarRating value={u.rating ?? 0} size={13} /><span className="sr-small">{u.rating?.toFixed(1)}</span></div>
                        ) : (<span className="text-ink-4">No ratings</span>)}
                      </td>
                    )}
                    {tab === 'drivers' && <td><DriverStatusChip status={u.driverStatus ?? 'pending'} /></td>}
                    {tab === 'drivers' && (
                      <td style={{ textAlign: 'right' }}>
                        <div className="inline-flex gap-2">
                          {u.driverStatus !== 'approved' && (
                            <button className="sr-btn sr-btn--ghost sr-btn--sm" onClick={() => handleApprove(u.id)}><Icon name="check" size={13} /> Approve</button>
                          )}
                          {u.driverStatus !== 'suspended' && (
                            <button className="sr-btn sr-btn--danger sr-btn--sm" onClick={() => handleSuspend(u.id)}><Icon name="x" size={13} /> Suspend</button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex flex-col gap-3">
            {rows.map((u) => (
              <div key={u.id} className="sr-card p-4">
                <div className="flex justify-between items-start mb-1.5">
                  <strong>{u.name}</strong>
                  {tab === 'drivers' && <DriverStatusChip status={u.driverStatus ?? 'pending'} />}
                </div>
                <div className="sr-table__num mb-1">{u.email}</div>
                <div className="sr-small">{u.phone}</div>
                {tab === 'drivers' && u.ratingCount && u.ratingCount > 0 && (
                  <div className="flex items-center gap-2 mt-2"><StarRating value={u.rating ?? 0} size={13} /><span className="sr-small">{u.rating?.toFixed(1)}</span></div>
                )}
                {tab === 'drivers' && (
                  <div className="flex gap-2 mt-3">
                    {u.driverStatus !== 'approved' && (
                      <button className="sr-btn sr-btn--primary sr-btn--sm flex-1" onClick={() => handleApprove(u.id)}>Approve</button>
                    )}
                    {u.driverStatus !== 'suspended' && (
                      <button className="sr-btn sr-btn--danger sr-btn--sm flex-1" onClick={() => handleSuspend(u.id)}>Suspend</button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function DriverStatusChip({ status }: { status: 'pending' | 'approved' | 'suspended' }) {
  const tone = status === 'approved' ? 'completed' : status === 'suspended' ? 'cancelled' : 'pending';
  return <span className={`sr-chip sr-chip--${tone}`}><span className="sr-chip__dot" />{status}</span>;
}
