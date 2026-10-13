'use client';

import { useEffect, useState } from 'react';
import MediaPickerButton from '@/components/admin/MediaPickerButton';

const BLANK = {
  name: '',
  subtitle: '',
  logoUrl: '',
  website: '',
  isPublished: true,
};

function toFormState(row) {
  return {
    name: row.name || '',
    subtitle: row.subtitle || '',
    logoUrl: row.logo_url || row.logoUrl || '',
    website: row.website || '',
    isPublished: !!row.is_published,
  };
}

export default function ClientsAdminPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null); // null = none, 'new' = creating, number = editing
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  function load() {
    setLoading(true);
    fetch('/api/admin/clients')
      .then((res) => res.json())
      .then((json) => setItems(json.clients || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(row) {
    setEditingId(row.id);
    setForm(toFormState(row));
    setMessage('');
  }

  function startNew() {
    setEditingId('new');
    setForm(BLANK);
    setMessage('');
  }

  function cancel() {
    setEditingId(null);
    setForm(BLANK);
    setMessage('');
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setMessage('Company name is required.');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const isNew = editingId === 'new';
      const res = await fetch(isNew ? '/api/admin/clients' : `/api/admin/clients/${editingId}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (!res.ok) {
        setMessage(json.error || 'Save failed.');
        return;
      }

      setEditingId(null);
      load();
    } catch {
      setMessage('Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this client logo? This cannot be undone.')) return;
    await fetch(`/api/admin/clients/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Logos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage partner & client brand logos displayed directly below the homepage Hero banner.
          </p>
        </div>
        {editingId === null && (
          <button
            type="button"
            onClick={startNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brandblue hover:bg-brandblue-dark text-white rounded-lg text-sm font-medium transition shadow-sm"
          >
            <span>+</span> Add Client Logo
          </button>
        )}
      </div>

      {message && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {message}
        </div>
      )}

      {/* Editor Modal / Card */}
      {editingId !== null && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-base font-semibold text-gray-900">
              {editingId === 'new' ? 'New Client Logo' : 'Edit Client Logo'}
            </h2>
            <button
              type="button"
              onClick={cancel}
              className="text-gray-400 hover:text-gray-600 text-sm font-medium"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Client / Company Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Apex Healthcare Global"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandblue/30 focus:border-brandblue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Industry / Subtitle (Optional)
              </label>
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                placeholder="e.g. Clinical & Diagnostics"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandblue/30 focus:border-brandblue"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Logo Image
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <input
                  type="text"
                  value={form.logoUrl}
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                  placeholder="/clients/logo.svg or https://..."
                  className="flex-1 px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandblue/30 focus:border-brandblue font-mono text-xs"
                />
                <MediaPickerButton onSelect={(url) => setForm({ ...form, logoUrl: url })} />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Upload a transparent SVG or PNG logo, or paste an image URL. If left empty, a sleek corporate monogram badge will be displayed automatically.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Client Website (Optional)
              </label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandblue/30 focus:border-brandblue"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-800">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-brandblue focus:ring-brandblue"
                />
                Published on Homepage
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={cancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="px-5 py-2 bg-brandblue hover:bg-brandblue-dark text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Client Logo'}
            </button>
          </div>
        </div>
      )}

      {/* List of Client Logos */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading client logos...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No client logos added yet. Click &quot;+ Add Client Logo&quot; above to create your first client entry.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((c) => (
              <div
                key={c.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition"
              >
                <div className="flex items-center gap-4">
                  {/* Logo Preview */}
                  <div className="h-12 w-28 shrink-0 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center p-2 overflow-hidden">
                    {c.logo_url ? (
                      <img
                        src={c.logo_url}
                        alt={c.name}
                        className="max-h-full max-w-full object-contain filter grayscale"
                      />
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                        <span className="h-2 w-2 rounded-full bg-brandblue" />
                        <span className="truncate">{c.name.slice(0, 10)}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900">{c.name}</h3>
                      {c.is_published ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-green-50 text-green-700 border border-green-200">
                          Live
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600">
                          Draft
                        </span>
                      )}
                    </div>
                    {c.subtitle && <p className="text-xs text-gray-500 mt-0.5">{c.subtitle}</p>}
                    {c.website && (
                      <a
                        href={c.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-brandblue hover:underline mt-0.5 block truncate max-w-xs"
                      >
                        {c.website}
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => startEdit(c)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
