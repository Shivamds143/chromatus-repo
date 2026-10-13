"use client";

import { FormEvent, useEffect, useState } from "react";

export default function AdminAccountSettings() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/credentials")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setUsername(d.username || "");
          setEmail(d.email || "");
        }
      })
      .catch(() => {});
  }, []);

  async function handleUpdate(e: FormEvent) {
    e.preventDefault();
    setStatusMsg(null);

    if (!currentPassword) {
      setStatusMsg({ type: "error", text: "Please enter your current password to authorize changes." });
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setStatusMsg({ type: "error", text: "New password must be at least 6 characters long." });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setStatusMsg({ type: "error", text: "New passwords do not match." });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newUsername: username.trim(),
          newEmail: email.trim(),
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        setStatusMsg({ type: "error", text: data?.error || "Failed to update credentials." });
        setLoading(false);
        return;
      }

      setStatusMsg({
        type: "success",
        text: "Account credentials updated successfully. New credentials are saved and active.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setStatusMsg({ type: "error", text: "Network error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-6 shadow-xs sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">Account & Security Settings</h2>
          <p className="mt-1 text-xs text-slate">
            Update your admin login username, notification email address, or change your password.
          </p>
        </div>
        <span className="mono-tag rounded-full border border-line bg-paper px-3 py-1 text-slate">
          Security Level: High
        </span>
      </div>

      {statusMsg && (
        <div
          className={`mt-6 rounded-xl p-4 text-xs font-medium ${
            statusMsg.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border border-red-200 bg-red-50 text-red-900"
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      <form onSubmit={handleUpdate} className="mt-6 space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Username */}
          <div>
            <label className="mono-tag block text-slate" htmlFor="setting-username">
              Admin Username
            </label>
            <input
              id="setting-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-2 w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm text-ink outline-none transition focus:border-indigo"
              placeholder="admin"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mono-tag block text-slate" htmlFor="setting-email">
              Admin Email Address
            </label>
            <input
              id="setting-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2 w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm text-ink outline-none transition focus:border-indigo"
              placeholder="admin@chromatus.com"
            />
          </div>
        </div>

        <div className="border-t border-line pt-6">
          <p className="mono-tag text-slate">Password Change (Leave blank to keep current password)</p>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            {/* New Password */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-ink" htmlFor="setting-new-pass">
                  New Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="text-[11px] text-indigo hover:text-indigo-light"
                >
                  {showNew ? "Hide" : "Show"}
                </button>
              </div>
              <input
                id="setting-new-pass"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className="mt-2 w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm text-ink outline-none transition focus:border-indigo"
                placeholder="Enter new password (min. 6 chars)"
              />
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="text-xs font-medium text-ink" htmlFor="setting-confirm-pass">
                Confirm New Password
              </label>
              <input
                id="setting-confirm-pass"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="mt-2 w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm text-ink outline-none transition focus:border-indigo"
                placeholder="Confirm new password"
              />
            </div>
          </div>
        </div>

        {/* Current Password Verification */}
        <div className="rounded-xl border border-indigo/20 bg-indigo/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-semibold text-ink" htmlFor="setting-current-pass">
                Current Password <span className="text-red-500">*</span>
              </label>
              <p className="mt-0.5 text-[11px] text-slate">
                Required to verify your identity before saving any changes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="text-xs text-indigo hover:text-indigo-light"
            >
              {showCurrent ? "Hide" : "Show"}
            </button>
          </div>
          <input
            id="setting-current-pass"
            type={showCurrent ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="mt-3 w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-indigo"
            placeholder="Enter your current password"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-indigo px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-light disabled:opacity-50"
          >
            {loading ? "Saving changes…" : "Save Account Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
