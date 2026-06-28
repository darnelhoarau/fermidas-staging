'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  created_at: string;
  enrollment_count: number;
  purchase_count: number;
}

interface OrphanedPurchase {
  id: string;
  email: string;
  course_title: string;
  amount_minor: number;
  currency: string;
  mpgs_order_id: string;
  created_at: string;
}

interface Feature {
  key: string;
  label: string;
  defaultOn: boolean;
  description: string;
  enabled: boolean;
}

export function SystemAdminClient({ users }: { users: User[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [orphaned, setOrphaned] = useState<OrphanedPurchase[]>([]);
  const [loadingOrphaned, setLoadingOrphaned] = useState(true);
  const [repairing, setRepairing] = useState<string | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);

  useEffect(() => {
    fetch('/api/admin/purchases')
      .then(r => r.json())
      .then(d => setOrphaned(d.purchases || []))
      .catch(() => {})
      .finally(() => setLoadingOrphaned(false));
  }, []);

  useEffect(() => {
    fetch('/api/admin/features')
      .then(r => r.json())
      .then(d => setFeatures(d.features || []))
      .catch(() => {});
  }, []);

  async function handleRoleChange(userId: string, newRole: string) {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Update failed');
      setEditingRole(null);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Update failed');
    }
  }

  async function handleDelete(userId: string, email: string) {
    if (!confirm(`Permanently delete ${email} and all their data?`)) return;
    setDeleting(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error || 'Delete failed');
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleting(null);
    }
  }

  async function handleRepair(purchaseId: string) {
    setRepairing(purchaseId);
    try {
      const res = await fetch(`/api/admin/purchases/${purchaseId}/repair`, { method: 'POST' });
      if (!res.ok) throw new Error((await res.json()).error || 'Repair failed');
      setOrphaned(prev => prev.filter(p => p.id !== purchaseId));
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Repair failed');
    } finally {
      setRepairing(null);
    }
  }

  async function toggleFeature(feature: string, current: boolean) {
    const next = !current;
    // optimistically update
    setFeatures(prev => prev.map(f => f.key === feature ? { ...f, enabled: next } : f));
    try {
      const res = await fetch('/api/admin/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature, enabled: next }),
      });
      if (!res.ok) {
        setFeatures(prev => prev.map(f => f.key === feature ? { ...f, enabled: current } : f));
        throw new Error((await res.json()).error || 'Toggle failed');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Toggle failed');
    }
  }

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold text-brand'>System Admin</h1>

      {orphaned.length > 0 && (
        <div className='card border-2 border-amber-300'>
          <h2 className='mb-3 text-lg font-bold text-amber-800'>
            Orphaned Purchases ({orphaned.length})
          </h2>
          <p className='mb-4 text-sm text-amber-700'>
            These purchases were marked PAID but have no enrollment — the webhook likely failed.
            Click <strong>Repair</strong> to create the enrollment and grant access.
          </p>
          <table className='w-full text-left'>
            <thead>
              <tr className='border-b border-amber-200 bg-amber-50'>
                <th className='p-3 text-sm font-semibold text-amber-800'>User</th>
                <th className='p-3 text-sm font-semibold text-amber-800'>Course</th>
                <th className='p-3 text-sm font-semibold text-amber-800'>Amount</th>
                <th className='p-3 text-sm font-semibold text-amber-800'>Date</th>
                <th className='p-3 text-sm font-semibold text-amber-800' />
              </tr>
            </thead>
            <tbody>
              {orphaned.map(p => (
                <tr key={p.id} className='border-b border-amber-100 last:border-0'>
                  <td className='p-3 text-sm font-medium text-amber-900'>{p.email}</td>
                  <td className='p-3 text-sm text-amber-800'>{p.course_title}</td>
                  <td className='p-3 text-sm text-amber-800'>{p.currency} {(p.amount_minor / 100).toFixed(2)}</td>
                  <td className='p-3 text-sm text-amber-700'>{new Date(p.created_at).toLocaleDateString('en-US')}</td>
                  <td className='p-3'>
                    <button
                      onClick={() => handleRepair(p.id)}
                      disabled={repairing === p.id}
                      className='rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50'
                    >
                      {repairing === p.id ? '...' : 'Repair'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className='card'>
        <h2 className='mb-3 text-lg font-bold text-brand'>Endpoint Access</h2>
        <p className='mb-4 text-sm text-leaf-600'>
          Toggle access to sensitive endpoints. Disabled endpoints return 403/404.
        </p>
        <div className='space-y-3'>
          {features.map(f => (
            <div key={f.key} className='flex items-start justify-between rounded-lg border border-leaf-100 bg-white p-3'>
              <div className='flex-1'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-semibold text-brand'>{f.label}</span>
                  <span className={`inline-block h-2 w-2 rounded-full ${f.enabled ? 'bg-green-500' : 'bg-red-400'}`} />
                </div>
                <p className='mt-0.5 text-xs text-leaf-500'>{f.description}</p>
              </div>
              <button
                onClick={() => toggleFeature(f.key, f.enabled)}
                className={`relative ml-4 inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${f.enabled ? 'bg-green-500' : 'bg-leaf-200'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${f.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className='card overflow-hidden'>
        <table className='w-full text-left'>
          <thead>
            <tr className='border-b border-leaf-100 bg-leaf-50'>
              <th className='p-4 text-sm font-semibold text-leaf-700'>Email</th>
              <th className='p-4 text-sm font-semibold text-leaf-700'>Name</th>
              <th className='p-4 text-sm font-semibold text-leaf-700'>Role</th>
              <th className='p-4 text-sm font-semibold text-leaf-700'>Enrollments</th>
              <th className='p-4 text-sm font-semibold text-leaf-700'>Purchases</th>
              <th className='p-4 text-sm font-semibold text-leaf-700'>Created</th>
              <th className='p-4 text-sm font-semibold text-leaf-700' />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className='border-b border-leaf-100 last:border-0 hover:bg-leaf-50/50'>
                <td className='p-4 text-sm font-medium text-brand'>{u.email}</td>
                <td className='p-4 text-sm text-leaf-700'>{u.name || '—'}</td>
                <td className='p-4'>
                  {editingRole === u.id ? (
                    <select
                      defaultValue={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      onBlur={() => setEditingRole(null)}
                      autoFocus
                      className='rounded border border-leaf-300 px-2 py-1 text-sm text-leaf-800 bg-white'
                      style={{ colorScheme: 'light' }}
                    >
                      <option value='MEMBER' className='text-leaf-800'>MEMBER</option>
                      <option value='ADMIN' className='text-leaf-800'>ADMIN</option>
                    </select>
                  ) : (
                    <button
                      onClick={() => setEditingRole(u.id)}
                      className='flex items-center gap-1.5'
                    >
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${u.role === 'ADMIN' ? 'bg-green-100 text-green-800' : 'bg-leaf-100 text-leaf-700'}`}>
                        {u.role}
                      </span>
                      <span className='text-xs text-leaf-400 hover:text-leaf-600'>(edit)</span>
                    </button>
                  )}
                </td>
                <td className='p-4 text-sm text-leaf-700'>{u.enrollment_count}</td>
                <td className='p-4 text-sm text-leaf-700'>{u.purchase_count}</td>
                <td className='p-4 text-sm text-leaf-600'>
                  {new Date(u.created_at).toLocaleDateString('en-US')}
                </td>
                <td className='p-4'>
                  <button
                    onClick={() => handleDelete(u.id, u.email)}
                    disabled={deleting === u.id}
                    className='rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50'
                  >
                    {deleting === u.id ? '...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
