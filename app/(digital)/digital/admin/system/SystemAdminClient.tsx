'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EnrollmentManager } from '../enrollments/EnrollmentManager';

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  registration_status: string;
  banned_at: string | null;
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

const REDIRECT_OPTIONS = [
  { label: 'Account page', value: '/digital/account' },
  { label: 'Training page', value: '/digital/training' },
  { label: 'Custom URL', value: '__custom__' },
];

const inputClass =
  'w-full rounded-lg border border-leaf-200 bg-white px-4 py-2.5 text-sm text-leaf-800 placeholder-leaf-400 focus:border-leaf-600 focus:outline-none focus:ring-2 focus:ring-leaf-600/20';

export function SystemAdminClient({ users }: { users: User[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkBusy, setBulkBusy] = useState<string | null>(null);
  const [orphaned, setOrphaned] = useState<OrphanedPurchase[]>([]);
  const [loadingOrphaned, setLoadingOrphaned] = useState(true);
  const [repairing, setRepairing] = useState<string | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);

  const [redirectUrl, setRedirectUrl] = useState('/digital/account');
  const [redirectOption, setRedirectOption] = useState('/digital/account');
  const [customUrl, setCustomUrl] = useState('');
  const [savingRedirect, setSavingRedirect] = useState(false);

  const [notifyEmail, setNotifyEmail] = useState('');
  const [savingNotify, setSavingNotify] = useState(false);
  const [testingNotify, setTestingNotify] = useState(false);
  const [notifyTestResult, setNotifyTestResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  const [showEnrollments, setShowEnrollments] = useState(false);
  const [moderating, setModerating] = useState<string | null>(null);
  const [banning, setBanning] = useState<string | null>(null);

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

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(d => {
        const val = d.settings?.payment_success_url || '/digital/account';
        setRedirectUrl(val);
        const found = REDIRECT_OPTIONS.find(o => o.value === val);
        if (found) {
          setRedirectOption(val);
        } else {
          setRedirectOption('__custom__');
          setCustomUrl(val);
        }
        setNotifyEmail(d.settings?.registration_notify_email || '');
      })
      .catch(() => {});
  }, []);

  async function handleTestNotify() {
    if (!notifyEmail.trim()) {
      setNotifyTestResult({ ok: false, message: 'Enter an email address first' });
      return;
    }
    setTestingNotify(true);
    setNotifyTestResult(null);
    try {
      const res = await fetch('/api/admin/email-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: notifyEmail.trim() }),
      });
      const data = await res.json();
      setNotifyTestResult(
        res.ok
          ? { ok: true, message: 'Test email sent!' }
          : { ok: false, message: data.error || 'Email send failed' },
      );
    } catch (err) {
      setNotifyTestResult({
        ok: false,
        message: err instanceof Error ? err.message : 'Email send failed',
      });
    } finally {
      setTestingNotify(false);
    }
  }

  async function handleSaveNotify() {
    setSavingNotify(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'registration_notify_email', value: notifyEmail.trim() }),
      });
      if (!res.ok) throw new Error('Save failed');
      alert('Saved! Admins will be notified of new registrations.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSavingNotify(false);
    }
  }

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

  async function handleStatusChange(userId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration_status: newStatus }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Update failed');
      setEditingStatus(null);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Update failed');
    }
  }

  function toggleSelect(userId: string) {
    setSelected(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId],
    );
  }

  function toggleSelectAll() {
    setSelected(prev => (prev.length === users.length ? [] : users.map(u => u.id)));
  }

  async function handleBulk(action: 'delete' | 'ban' | 'unban') {
    const confirmMsg =
      action === 'delete'
        ? `Permanently delete ${selected.length} user(s) and ALL their data? This cannot be undone.`
        : action === 'ban'
          ? `Ban ${selected.length} user(s)? They will lose course access.`
          : `Unban ${selected.length} user(s)?`;
    if (!confirm(confirmMsg)) return;
    setBulkBusy(action);
    try {
      const res = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userIds: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');
      if (data.skipped?.length) {
        alert(`${data.affected} processed. ${data.skipped.length} skipped (includes your own account).`);
      }
      setSelected([]);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setBulkBusy(null);
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

  async function handleModerate(userId: string, status: 'approved' | 'declined') {
    setModerating(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration_status: status }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Update failed');
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setModerating(null);
    }
  }

  async function handleBanToggle(userId: string, currentlyBanned: boolean) {
    if (!currentlyBanned && !confirm('Ban this user? They will be locked out of all access until unbanned.')) return;
    setBanning(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banned: !currentlyBanned }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Update failed');
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setBanning(null);
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

  async function handleSaveRedirect() {
    setSavingRedirect(true);
    const url = redirectOption === '__custom__' ? customUrl : redirectOption;
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'payment_success_url', value: url }),
      });
      if (!res.ok) throw new Error('Save failed');
      setRedirectUrl(url);
      alert('Saved!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSavingRedirect(false);
    }
  }

  const pendingUsers = users.filter((u) => u.registration_status === 'pending');

  return (
    <div className='space-y-8'>
      {pendingUsers.length > 0 && (
        <div className='card border-l-4 border-l-amber-500 p-6'>
          <div className='mb-4 flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-amber-100'>
              <span className='text-lg font-bold text-amber-700'>{pendingUsers.length}</span>
            </div>
            <div>
              <h2 className='text-lg font-bold text-brand'>Pending Registrations</h2>
              <p className='text-sm text-leaf-600'>
                New signups awaiting approval — they cannot sign in until accepted
              </p>
            </div>
          </div>
          <div className='overflow-x-auto rounded-xl border border-leaf-100'>
            <table className='w-full text-left text-sm'>
              <thead>
                <tr className='bg-leaf-50 text-leaf-700'>
                  <th className='px-4 py-3 font-semibold'>Email</th>
                  <th className='px-4 py-3 font-semibold'>Name</th>
                  <th className='px-4 py-3 font-semibold'>Registered</th>
                  <th className='px-4 py-3 font-semibold' />
                </tr>
              </thead>
              <tbody className='divide-y divide-leaf-100'>
                {pendingUsers.map((u) => (
                  <tr key={u.id} className='hover:bg-leaf-50/50'>
                    <td className='px-4 py-3 font-medium text-brand'>{u.email}</td>
                    <td className='px-4 py-3 text-leaf-700'>{u.name || '—'}</td>
                    <td className='px-4 py-3 text-leaf-600'>
                      {new Date(u.created_at).toLocaleDateString('en-US')}
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex gap-2'>
                        <button
                          onClick={() => handleModerate(u.id, 'approved')}
                          disabled={moderating === u.id}
                          className='rounded-lg bg-success px-3 py-1.5 text-xs font-medium text-white hover:bg-leaf-700 disabled:opacity-50'
                        >
                          {moderating === u.id ? '...' : 'Accept'}
                        </button>
                        <button
                          onClick={() => handleModerate(u.id, 'declined')}
                          disabled={moderating === u.id}
                          className='rounded-lg border border-error/30 px-3 py-1.5 text-xs font-medium text-error hover:bg-error/5 disabled:opacity-50'
                        >
                          Decline
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {orphaned.length > 0 && (
        <div className='card border-l-4 border-l-amber-500 p-6'>
          <div className='mb-4 flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-amber-100'>
              <span className='text-lg font-bold text-amber-700'>{orphaned.length}</span>
            </div>
            <div>
              <h2 className='text-lg font-bold text-brand'>Orphaned Purchases</h2>
              <p className='text-sm text-leaf-600'>
                PAID purchases with no enrollment — webhook likely failed
              </p>
            </div>
          </div>
          <div className='overflow-x-auto rounded-xl border border-leaf-100'>
            <table className='w-full text-left text-sm'>
              <thead>
                <tr className='bg-leaf-50 text-leaf-700'>
                  <th className='px-4 py-3 font-semibold'>User</th>
                  <th className='px-4 py-3 font-semibold'>Course</th>
                  <th className='px-4 py-3 font-semibold'>Amount</th>
                  <th className='px-4 py-3 font-semibold'>Date</th>
                  <th className='px-4 py-3 font-semibold' />
                </tr>
              </thead>
              <tbody className='divide-y divide-leaf-100'>
                {orphaned.map(p => (
                  <tr key={p.id} className='hover:bg-leaf-50/50'>
                    <td className='px-4 py-3 font-medium text-brand'>{p.email}</td>
                    <td className='px-4 py-3 text-leaf-700'>{p.course_title}</td>
                    <td className='px-4 py-3 text-leaf-700'>{p.currency} {(p.amount_minor / 100).toFixed(2)}</td>
                    <td className='px-4 py-3 text-leaf-600'>{new Date(p.created_at).toLocaleDateString('en-US')}</td>
                    <td className='px-4 py-3'>
                      <button
                        onClick={() => handleRepair(p.id)}
                        disabled={repairing === p.id}
                        className='rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50'
                      >
                        {repairing === p.id ? 'Repairing...' : 'Repair'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className='card p-6'>
        <h2 className='mb-1 text-lg font-bold text-brand'>Endpoint Access</h2>
        <p className='mb-5 text-sm text-leaf-600'>
          Toggle access to sensitive endpoints. Disabled endpoints return 403/404.
        </p>
        <div className='space-y-3'>
          {features.map(f => (
            <div key={f.key} className='flex items-start justify-between rounded-xl border border-leaf-100 bg-white p-4'>
              <div className='flex-1'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-semibold text-brand'>{f.label}</span>
                  <span className={`inline-block h-2 w-2 rounded-full ${f.enabled ? 'bg-success' : 'bg-red-400'}`} />
                </div>
                <p className='mt-0.5 text-xs text-leaf-500'>{f.description}</p>
              </div>
              <button
                onClick={() => toggleFeature(f.key, f.enabled)}
                className={`relative ml-4 inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${f.enabled ? 'bg-success' : 'bg-leaf-200'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${f.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className='card p-6'>
        <h2 className='mb-1 text-lg font-bold text-brand'>Payment Settings</h2>
        <p className='mb-5 text-sm text-leaf-600'>
          Where to redirect users after successful payment.
        </p>
        <div className='grid gap-4 md:grid-cols-[1fr_auto] md:items-end'>
          <div>
            <label className='mb-1.5 block text-sm font-semibold text-leaf-700'>Redirect to</label>
            <select
              value={redirectOption}
              onChange={e => setRedirectOption(e.target.value)}
              className={inputClass}
            >
              {REDIRECT_OPTIONS.map(o => (
                <option key={o.value} value={o.value} className='text-leaf-800'>{o.label}</option>
              ))}
            </select>
          </div>
          {redirectOption === '__custom__' && (
            <div>
              <label className='mb-1.5 block text-sm font-semibold text-leaf-700'>Custom URL path</label>
              <input
                type='text'
                value={customUrl}
                onChange={e => setCustomUrl(e.target.value)}
                placeholder='/digital/training'
                className={inputClass}
              />
            </div>
          )}
          <button
            onClick={handleSaveRedirect}
            disabled={savingRedirect}
            className='btn btn-primary h-fit px-6'
          >
            {savingRedirect ? 'Saving...' : 'Save'}
          </button>
        </div>
        {redirectUrl && (
          <p className='mt-4 text-xs text-leaf-500'>
            Currently: <code className='rounded bg-leaf-100 px-1.5 py-0.5 text-xs text-leaf-700'>{redirectUrl}</code>
          </p>
        )}
      </div>

      <div className='card p-6'>
        <h2 className='mb-1 text-lg font-bold text-brand'>Registration Notifications</h2>
        <p className='mb-5 text-sm text-leaf-600'>
          Email address(es) notified when a new signup awaits approval. Separate multiple addresses with commas.
        </p>
        <div className='grid gap-4 md:grid-cols-[1fr_auto] md:items-end'>
          <div>
            <label className='mb-1.5 block text-sm font-semibold text-leaf-700'>Notify</label>
            <input
              type='text'
              value={notifyEmail}
              onChange={e => setNotifyEmail(e.target.value)}
              placeholder='admin@fermidas.com, manager@fermidas.com'
              className={inputClass}
            />
          </div>
          <button
            onClick={handleTestNotify}
            disabled={testingNotify}
            className='btn btn-ghost h-fit px-6'
          >
            {testingNotify ? 'Sending...' : 'Send test email'}
          </button>
          <button
            onClick={handleSaveNotify}
            disabled={savingNotify}
            className='btn btn-primary h-fit px-6'
          >
            {savingNotify ? 'Saving...' : 'Save'}
          </button>
        </div>
        {notifyTestResult && (
          <p className={`mt-4 text-xs ${notifyTestResult.ok ? 'text-success' : 'text-error'}`}>
            {notifyTestResult.message}
          </p>
        )}
      </div>

      <div className='card overflow-hidden p-0'>
        {selected.length > 0 && (
          <div className='flex flex-wrap items-center gap-3 border-b border-leaf-100 bg-leaf-50/50 px-5 py-3'>
            <span className='text-sm font-semibold text-leaf-700'>
              {selected.length} selected
            </span>
            <button
              onClick={() => handleBulk('ban')}
              disabled={!!bulkBusy}
              className='rounded-lg border border-warn/30 px-3 py-1.5 text-xs font-medium text-warn hover:bg-warn/5 disabled:opacity-50'
            >
              {bulkBusy === 'ban' ? '...' : 'Ban'}
            </button>
            <button
              onClick={() => handleBulk('unban')}
              disabled={!!bulkBusy}
              className='rounded-lg border border-success/30 px-3 py-1.5 text-xs font-medium text-success hover:bg-success/5 disabled:opacity-50'
            >
              {bulkBusy === 'unban' ? '...' : 'Unban'}
            </button>
            <button
              onClick={() => handleBulk('delete')}
              disabled={!!bulkBusy}
              className='rounded-lg border border-error/30 px-3 py-1.5 text-xs font-medium text-error hover:bg-error/5 disabled:opacity-50'
            >
              {bulkBusy === 'delete' ? '...' : 'Delete'}
            </button>
            <button
              onClick={() => setSelected([])}
              disabled={!!bulkBusy}
              className='ml-auto text-xs font-medium text-leaf-500 hover:text-leaf-700'
            >
              Clear
            </button>
          </div>
        )}
        <div className='overflow-x-auto'>
          <table className='w-full text-left text-sm'>
            <thead>
              <tr className='bg-leaf-50 text-leaf-700'>
                <th className='px-4 py-4'>
                  <input
                    type='checkbox'
                    checked={users.length > 0 && selected.length === users.length}
                    onChange={toggleSelectAll}
                    className='h-4 w-4 accent-leaf-600'
                    aria-label='Select all users'
                  />
                </th>
                <th className='px-5 py-4 font-semibold'>Email</th>
                <th className='px-5 py-4 font-semibold'>Name</th>
                <th className='px-5 py-4 font-semibold'>Role</th>
                <th className='px-5 py-4 font-semibold'>Status</th>
                <th className='px-5 py-4 font-semibold'>Enrollments</th>
                <th className='px-5 py-4 font-semibold'>Purchases</th>
                <th className='px-5 py-4 font-semibold'>Created</th>
                <th className='px-5 py-4 font-semibold' />
              </tr>
            </thead>
            <tbody className='divide-y divide-leaf-100'>
              {users.map((u) => (
                <tr key={u.id} className='hover:bg-leaf-50/30'>
                  <td className='px-4 py-4'>
                    <input
                      type='checkbox'
                      checked={selected.includes(u.id)}
                      onChange={() => toggleSelect(u.id)}
                      className='h-4 w-4 accent-leaf-600'
                      aria-label={`Select ${u.email}`}
                    />
                  </td>
                  <td className='px-5 py-4 font-medium text-brand'>{u.email}</td>
                  <td className='px-5 py-4 text-leaf-700'>{u.name || '—'}</td>
                  <td className='px-5 py-4'>
                    {editingRole === u.id ? (
                      <select
                        defaultValue={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        onBlur={() => setEditingRole(null)}
                        autoFocus
                        className='rounded-lg border border-leaf-300 bg-white px-3 py-1.5 text-sm text-leaf-800'
                      >
                        <option value='MEMBER' className='text-leaf-800'>MEMBER</option>
                        <option value='ADMIN' className='text-leaf-800'>ADMIN</option>
                      </select>
                    ) : (
                      <button
                        onClick={() => setEditingRole(u.id)}
                        className='group flex items-center gap-1.5'
                      >
                        <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${u.role === 'ADMIN' ? 'bg-success/10 text-success' : 'bg-leaf-100 text-leaf-700'}`}>
                          {u.role}
                        </span>
                        <span className='text-xs text-leaf-400 opacity-0 transition-opacity group-hover:opacity-100'>(edit)</span>
                      </button>
                    )}
                  </td>
                  <td className='px-5 py-4'>
                    {u.banned_at ? (
                      <span className='rounded-full bg-red-100 px-3 py-0.5 text-xs font-semibold text-red-700'>
                        Banned
                      </span>
                    ) : editingStatus === u.id ? (
                      <select
                        defaultValue={u.registration_status || 'approved'}
                        onChange={e => handleStatusChange(u.id, e.target.value)}
                        onBlur={() => setEditingStatus(null)}
                        autoFocus
                        className='rounded-lg border border-leaf-300 bg-white px-3 py-1.5 text-sm text-leaf-800'
                      >
                        <option value='pending' className='text-leaf-800'>Pending</option>
                        <option value='approved' className='text-leaf-800'>Approved</option>
                        <option value='declined' className='text-leaf-800'>Declined</option>
                      </select>
                    ) : (
                      (() => {
                        const status = u.registration_status || 'approved';
                        const badge =
                          status === 'pending'
                            ? 'bg-amber-100 text-amber-700'
                            : status === 'declined'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-success/10 text-success';
                        const label =
                          status === 'pending'
                            ? 'Pending'
                            : status === 'declined'
                              ? 'Declined'
                              : 'Approved';
                        return (
                          <button
                            onClick={() => setEditingStatus(u.id)}
                            className='group flex items-center gap-1.5'
                          >
                            <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${badge}`}>
                              {label}
                            </span>
                            <span className='text-xs text-leaf-400 opacity-0 transition-opacity group-hover:opacity-100'>(edit)</span>
                          </button>
                        );
                      })()
                    )}
                  </td>
                  <td className='px-5 py-4 text-leaf-700'>{u.enrollment_count}</td>
                  <td className='px-5 py-4 text-leaf-700'>{u.purchase_count}</td>
                  <td className='px-5 py-4 text-leaf-600'>
                    {new Date(u.created_at).toLocaleDateString('en-US')}
                  </td>
                  <td className='px-5 py-4'>
                    <div className='flex gap-2'>
                      <button
                        onClick={() => handleBanToggle(u.id, !!u.banned_at)}
                        disabled={banning === u.id}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${
                          u.banned_at
                            ? 'border-success/30 text-success hover:bg-success/5'
                            : 'border-warn/30 text-warn hover:bg-warn/5'
                        }`}
                      >
                        {banning === u.id ? '...' : u.banned_at ? 'Unban' : 'Ban'}
                      </button>
                      <button
                        onClick={() => handleDelete(u.id, u.email)}
                        disabled={deleting === u.id}
                        className='rounded-lg border border-error/30 px-3 py-1.5 text-xs font-medium text-error hover:bg-error/5 disabled:opacity-50'
                      >
                        {deleting === u.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className='card p-6'>
        <button
          onClick={() => setShowEnrollments(!showEnrollments)}
          className='flex w-full items-center justify-between'
        >
          <h2 className='text-lg font-bold text-brand'>Enrollment Management</h2>
          <svg
            className={`h-5 w-5 text-leaf-500 transition-transform ${showEnrollments ? 'rotate-180' : ''}`}
            fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}
          >
            <path strokeLinecap='round' strokeLinejoin='round' d='M19 9l-7 7-7-7' />
          </svg>
        </button>
        {showEnrollments && (
          <div className='mt-5 border-t border-leaf-100 pt-5'>
            <EnrollmentManager embedded />
          </div>
        )}
      </div>
    </div>
  );
}
