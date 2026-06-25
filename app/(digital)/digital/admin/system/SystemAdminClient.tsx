'use client';

import { useState } from 'react';
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

export function SystemAdminClient({ users }: { users: User[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<string | null>(null);

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

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold text-brand'>System Admin</h1>

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
