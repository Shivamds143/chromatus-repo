'use client';

import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');
  const [profileCurrentPassword, setProfileCurrentPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [isProfileError, setIsProfileError] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    fetch('/api/admin/credentials')
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok) {
          setUsername(data.username || '');
          setEmail(data.email || '');
          if (data.updatedAt) setUpdatedAt(data.updatedAt);
        }
      })
      .catch(() => {});
  }, []);

  async function handleUpdateProfile(e) {
    e?.preventDefault?.();
    setProfileMessage('');
    if (!profileCurrentPassword) {
      setIsProfileError(true);
      setProfileMessage('Current password is required to save account changes.');
      return;
    }
    setSavingProfile(true);
    const res = await fetch('/api/admin/credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword: profileCurrentPassword,
        newUsername: username,
        newEmail: email,
      }),
    });
    const json = await res.json();
    setSavingProfile(false);
    setIsProfileError(!res.ok);
    if (!res.ok) {
      setProfileMessage(json.error || 'Could not update profile.');
      return;
    }
    setProfileMessage('Account profile updated successfully.');
    setProfileCurrentPassword('');
  }

  async function handleChangePassword(e) {
    e?.preventDefault?.();
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
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const json = await res.json();
    setSaving(false);
    setIsError(!res.ok);
    if (!res.ok) {
      setMessage(json.error || 'Could not change password.');
      return;
    }
    setMessage('Password updated successfully.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy mb-1">Account &amp; Security</h1>
        <p className="text-sm text-inkgray">
          Manage your administrator credentials and account security. For site branding see Theme &amp; Branding, and for privacy controls see Cookie &amp; Privacy.
        </p>
      </div>

      {/* Account Profile Card */}
      <div className="bg-white rounded-xl2 border border-gray-100 shadow-card p-6 space-y-4">
        <div>
          <p className="text-xs font-semibold text-inkgray uppercase tracking-wide">Account Profile</p>
          <p className="text-xs text-inkgray mt-0.5">
            Your login identity and recovery contact.
            {updatedAt && (
              <span className="ml-1 text-[11px] text-inkgray/75">
                (Last updated: {new Date(updatedAt).toLocaleDateString()})
              </span>
            )}
          </p>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs text-inkgray mb-1">Username</label>
            <input
              type="text"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
            />
          </div>

          <div>
            <label className="block text-xs text-inkgray mb-1">Email address</label>
            <input
              type="email"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@chromatus.com"
            />
          </div>

          <div>
            <label className="block text-xs text-inkgray mb-1">
              Current password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={profileCurrentPassword}
              onChange={(e) => setProfileCurrentPassword(e.target.value)}
              placeholder="Confirm current password to save profile"
            />
          </div>

          {profileMessage && (
            <p className={`text-sm ${isProfileError ? 'text-red-600' : 'text-green-700'}`}>
              {profileMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={savingProfile || !profileCurrentPassword}
            className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-dark transition disabled:opacity-60"
          >
            {savingProfile ? 'Saving…' : 'Update profile'}
          </button>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-xl2 border border-gray-100 shadow-card p-6 space-y-4">
        <div>
          <p className="text-xs font-semibold text-inkgray uppercase tracking-wide">Change Password</p>
          <p className="text-xs text-inkgray mt-0.5">
            Passwords must be at least 8 characters long.
          </p>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
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
            type="submit"
            disabled={saving || !currentPassword || !newPassword}
            className="rounded-full bg-brandorange px-5 py-2.5 text-sm font-semibold text-white hover:bg-brandorange-dark transition disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}
