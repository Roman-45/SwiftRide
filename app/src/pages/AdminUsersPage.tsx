import { useCallback, useEffect, useMemo, useState } from 'react';
import { approveDriver, getAdminUsers, suspendDriver } from '../api/client';
import type { User } from '../types';
import { Icon } from '../components/Icon';
import { StarRating } from '../components/StarRating';
import { EmptyState, InlineError, SkeletonRow } from '../components/EmptyState';
import { useToast } from '../components/Toast';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Tabs } from '../components/Tabs';
import { PaginationBar, usePagination } from '../components/Pagination';

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

  const counts = useMemo(() => {
    if (!users) return { drivers: 0, passengers: 0 };
    return {
      drivers:    users.filter((u) => u.role === 'driver').length,
      passengers: users.filter((u) => u.role === 'passenger').length,
    };
  }, [users]);

  const { pageItems, pagination } = usePagination({ items: rows, resetKey: `${tab}|${q}` });

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
        <Tabs<Tab>
          ariaLabel="User role"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'drivers',    label: 'Drivers',    count: counts.drivers },
            { value: 'passengers', label: 'Passengers', count: counts.passengers },
          ]}
        />
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
      {!pageItems && !error && <Card><SkeletonRow lines={5} /></Card>}

      {pageItems && pageItems.length === 0 && (
        <Card padding="none"><EmptyState icon="user" title="No results" body="Adjust your filter or clear the search." /></Card>
      )}

      {pageItems && pageItems.length > 0 && (
        <>
          {/* Desktop */}
          <Card padding="none" className="overflow-hidden hidden md:block">
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
                {pageItems.map((u) => (
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
                            <Button size="sm" variant="ghost" onClick={() => handleApprove(u.id)} iconLeft={<Icon name="check" size={13} />}>Approve</Button>
                          )}
                          {u.driverStatus !== 'suspended' && (
                            <Button size="sm" variant="danger" onClick={() => handleSuspend(u.id)} iconLeft={<Icon name="x" size={13} />}>Suspend</Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Mobile */}
          <div className="md:hidden flex flex-col gap-3">
            {pageItems.map((u) => (
              <Card key={u.id} padding="sm">
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
                      <Button size="sm" variant="primary" block onClick={() => handleApprove(u.id)}>Approve</Button>
                    )}
                    {u.driverStatus !== 'suspended' && (
                      <Button size="sm" variant="danger" block onClick={() => handleSuspend(u.id)}>Suspend</Button>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>

          <PaginationBar pagination={pagination} label={[tab === 'drivers' ? 'driver' : 'passenger', tab]} />
        </>
      )}
    </div>
  );
}

function DriverStatusChip({ status }: { status: 'pending' | 'approved' | 'suspended' }) {
  const tone = status === 'approved' ? 'completed' : status === 'suspended' ? 'cancelled' : 'pending';
  return <span className={`sr-chip sr-chip--${tone}`}><span className="sr-chip__dot" />{status}</span>;
}
