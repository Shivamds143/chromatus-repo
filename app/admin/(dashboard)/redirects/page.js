'use client';

import { useEffect, useState } from 'react';

const EMPTY_FORM = { id: null, fromPath: '', toPath: '', statusCode: 301, isActive: true, notes: '' };

export default function AdminRedirectsPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  function load() {
    setLoading(true);
    fetch('/api/admin/redirects')
      .then((res) => res.json())
      .then((json) => setEntries(json.entries || []))
      .finally(() => setLoading(false));
  }

  // Fetching this admin data is synchronizing with an external system (the API) on mount — an accepted use of the pattern.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, []);

  function edit(row) {
    setMessage('');
    setIsError(false);
    setForm({
      id: row.id,
      fromPath: row.from_path,
      toPath: row.to_path,
      statusCode: row.status_code || 301,
      isActive: row.is_active !== false,
      notes: row.notes || ''
    });
  }

  async function handleSave() {
    setSaving(true);
    setMessage('');
    setIsError(false);
    const res = await fetch('/api/admin/redirects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) {
      setIsError(true);
      setMessage(json.error || 'Save failed.');
      return;
    }
    setForm(EMPTY_FORM);
    load();
  }

  async function handleDelete(row) {
    if (!confirm(`Remove the redirect from ${row.from_path}?`)) return;
    await fetch(`/api/admin/redirects/${row.id}`, { method: 'DELETE' });
    if (form.id === row.id) setForm(EMPTY_FORM);
    load();
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-navy mb-1">Redirects</h1>
      <p className="text-sm text-inkgray mb-6">
        Send visitors and search engines from an old URL to a new one. Redirects apply on the live
        site immediately — no rebuild or deploy required. Use 301 (permanent) for pages that have
        moved for good, and 302 (temporary) for short-term redirects.
      </p>

      <div className="bg-white rounded-xl2 border border-gray-100 shadow-card p-6 mb-6 space-y-4">
        <p className="text-sm font-semibold text-navy">{form.id ? 'Edit redirect' : 'Add a redirect'}</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="From path (the old URL)">
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="/old-page"
              value={form.fromPath}
              onChange={(e) => setForm({ ...form, fromPath: e.target.value })}
            />
          </Field>
          <Field label="To (new path or full URL)">
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="/new-page or https://example.com/elsewhere"
              value={form.toPath}
              onChange={(e) => setForm({ ...form, toPath: e.target.value })}
            />
          </Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Redirect type">
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={form.statusCode}
              onChange={(e) => setForm({ ...form, statusCode: Number(e.target.value) })}
            >
              <option value={301}>301 — Permanent</option>
              <option value={302}>302 — Temporary</option>
            </select>
          </Field>
          <Field label="Status">
            <label className="flex items-center gap-2 text-sm text-inkgray h-[38px]">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Active
            </label>
          </Field>
        </div>
        <Field label="Notes (optional, admin-only)">
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </Field>

        {message && <p className={`text-sm ${isError ? 'text-red-600' : 'text-green-700'}`}>{message}</p>}

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-brandorange px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? 'Saving…' : form.id ? 'Update redirect' : 'Add redirect'}
          </button>
          {form.id && (
            <button onClick={() => setForm(EMPTY_FORM)} className="text-sm font-semibold text-inkgray">
              Cancel
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-inkgray">Loading…</p>
      ) : (
        <div className="bg-white rounded-xl2 border border-gray-100 shadow-card divide-y divide-gray-100">
          {entries.map((row) => (
            <div key={row.id} className="flex items-center justify-between px-5 py-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-navy truncate">
                  {row.from_path} <span className="text-inkgray">→</span> {row.to_path}
                </p>
                <p className="text-xs text-inkgray">
                  {row.status_code} · {row.is_active ? 'Active' : 'Disabled'}
                  {row.notes ? ` · ${row.notes}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button onClick={() => edit(row)} className="text-xs font-semibold text-brandblue hover:underline">
                  Edit
                </button>
                <button onClick={() => handleDelete(row)} className="text-xs font-semibold text-red-600 hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
          {entries.length === 0 && <p className="px-5 py-4 text-sm text-inkgray">No redirects yet.</p>}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs text-inkgray mb-1">{label}</label>
      {children}
    </div>
  );
}
