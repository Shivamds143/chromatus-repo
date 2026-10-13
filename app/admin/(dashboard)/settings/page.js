'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  async function handleChangePassword() {
    setMessage('');
    if (newPassword !== confirmPassword) {
      setIsError(true);
      setMessage('New password and confirmation do not match.');
      return;
    }
    setSaving(true);
    const res = await fetch('/api/admin/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const json = await res.json();
    setSaving(false);
    setIsError(!res.ok);
    if (!res.ok) {
      setMessage(json.error || 'Could not change password.');
      return;
    }
    setMessage('Password updated.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold text-navy mb-1">Settings</h1>
      <p className="text-sm text-inkgray mb-6">
        Your admin account. For site branding see Theme &amp; Branding, and for the cookie banner
        see Cookie &amp; Privacy.
      </p>

      <div className="bg-white rounded-xl2 border border-gray-100 shadow-card p-6 space-y-4">
        <p className="text-xs font-semibold text-inkgray uppercase tracking-wide">Change password</p>
        <div>
          <label className="block text-xs text-inkgray mb-1">Current password</label>
          <input
            type="password"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-inkgray mb-1">New password</label>
          <input
            type="password"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-inkgray mb-1">Confirm new password</label>
          <input
            type="password"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        {message && (
          <p className={`text-sm ${isError ? 'text-red-600' : 'text-green-700'}`}>{message}</p>
        )}
        <button
          onClick={handleChangePassword}
          disabled={saving || !currentPassword || !newPassword}
          className="rounded-full bg-brandorange px-5 py-2.5 text-sm font-semibold text-white hover:bg-brandorange-dark transition disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Update password'}
        </button>
      </div>
    </div>
  );
}
