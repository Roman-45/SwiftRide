import { useCallback, useEffect, useMemo, useState } from 'react';
import { approveDriver, getAdminDrivers, getAdminPassengers, suspendDriver } from '../api/client';
import type { User } from '../types';
import { Icon } from '../components/Icon';
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
  const [drivers, setDrivers] = useState<User[] | null>(null);
  const [passengers, setPassengers] = useState<User[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');

  const load = useCallback(() => {
    setError(null);
    getAdminDrivers().then(setDrivers).catch((e) => setError(e.message));
    getAdminPassengers().then(setPassengers).catch((e) => setError(e.message));
  }, []);

  useEffect(load, [load]);

  const current: User[] | null = tab === 'drivers' ? drivers : passengers;

  const rows = useMemo(() => {
    if (!current) return null;
    return current.filter(
      (u) => q.trim().length === 0 || [u.name, u.email, u.phone].some((f) => f.toLowerCase().includes(q.toLowerCase())),
    );
  }, [current, q]);

  const counts = {
    drivers: drivers?.length ?? 0,
    passengers: passengers?.length ?? 0,
  };

  const { pageItems, pagination } = usePagination({ items: rows, resetKey: `${tab}|${q}` });

  const patchDriver = (id: string, patch: Partial<User>) =>
    setDrivers((list) => list?.map((x) => x.id === id ? { ...x, ...patch } : x) ?? null);

  const handleApprove = async (u: User) => {
    patchDriver(u.id, { isApproved: true });
    try {
      await approveDriver(u.id);
      toast('ok', `${u.name} approved.`);
    } catch (e) {
      patchDriver(u.id, { isApproved: false });
      toast('err', e instanceof Error ? e.message : 'Could not approve.');
    }
  };

  const handleSuspend = async (u: User) => {
    patchDriver(u.id, { isApproved: false });
    try {
      await suspendDriver(u.id);
      toast('info', `${u.name} suspended.`);
    } catch (e) {
      patchDriver(u.id, { isApproved: true });
      toast('err', e instanceof Error ? e.message : 'Could not suspend.');
    }
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
                  {tab === 'drivers' && <th>Vehicle</th>}
                  {tab === 'drivers' && <th>Status</th>}
                  {tab === 'drivers' && <th style={{ width: 220, textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {pageItems.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong></td>
                    <td><span className="sr-table__num">{u.email}</span></td>
                    <td>{u.phone || <span className="text-ink-4">—</span>}</td>
                    {tab === 'drivers' && (
                      <td>
                        {u.vehicleModel ? (
                          <>
                            <div className="text-[14px]">{u.vehicleModel}</div>
                            <div className="sr-micro">{u.licensePlate ?? '—'}</div>
                          </>
                        ) : (<span className="text-ink-4">—</span>)}
                      </td>
                    )}
                    {tab === 'drivers' && <td><DriverStatusChip approved={u.isApproved ?? false} /></td>}
                    {tab === 'drivers' && (
                      <td style={{ textAlign: 'right' }}>
                        <div className="inline-flex gap-2">
                          {!u.isApproved && (
                            <Button size="sm" variant="ghost" onClick={() => handleApprove(u)} iconLeft={<Icon name="check" size={13} />}>Approve</Button>
                          )}
                          {u.isApproved && (
                            <Button size="sm" variant="danger" onClick={() => handleSuspend(u)} iconLeft={<Icon name="x" size={13} />}>Suspend</Button>
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
                  {tab === 'drivers' && <DriverStatusChip approved={u.isApproved ?? false} />}
                </div>
                <div className="sr-table__num mb-1">{u.email}</div>
                <div className="sr-small">{u.phone || '—'}</div>
                {tab === 'drivers' && u.vehicleModel && (
                  <div className="sr-small mt-2">{u.vehicleModel} · {u.licensePlate ?? '—'}</div>
                )}
                {tab === 'drivers' && (
                  <div className="flex gap-2 mt-3">
                    {!u.isApproved && (
                      <Button size="sm" variant="primary" block onClick={() => handleApprove(u)}>Approve</Button>
                    )}
                    {u.isApproved && (
                      <Button size="sm" variant="danger" block onClick={() => handleSuspend(u)}>Suspend</Button>
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

function DriverStatusChip({ approved }: { approved: boolean }) {
  const tone = approved ? 'completed' : 'pending';
  return <span className={`sr-chip sr-chip--${tone}`}><span className="sr-chip__dot" />{approved ? 'approved' : 'pending'}</span>;
}
