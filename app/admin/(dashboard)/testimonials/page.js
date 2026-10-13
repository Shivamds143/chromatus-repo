'use client';

import { useEffect, useState } from 'react';
import MediaPickerButton from '@/components/admin/MediaPickerButton';

const BLANK = { quote: '', authorName: '', authorRole: '', company: '', avatarUrl: '', isPublished: false };

function toFormState(row) {
  return {
    quote: row.quote || '',
    authorName: row.author_name || '',
    authorRole: row.author_role || '',
    company: row.company || '',
    avatarUrl: row.avatar_url || '',
    isPublished: !!row.is_published
  };
}

export default function TestimonialsAdminPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null); // null = none, 'new' = creating
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  function load() {
    setLoading(true);
    fetch('/api/admin/testimonials')
      .then((res) => res.json())
      .then((json) => setItems(json.testimonials || []))
      .finally(() => setLoading(false));
  }

  // Fetching this admin data is synchronizing with an external system (the API) on mount — an accepted use of the pattern.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, []);

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

  async function handleSave() {
    setSaving(true);
    setMessage('');
    try {
      const isNew = editingId === 'new';
      const res = await fetch(isNew ? '/api/admin/testimonials' : `/api/admin/testimonials/${editingId}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
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
    if (!confirm('Delete this testimonial? This cannot be undone.')) return;
    await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
    load();
  }

  async function move(index, dir) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    await fetch('/api/admin/testimonials', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: next.map((i) => i.id) })
    });
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-navy">Testimonials</h1>
        <button
          onClick={startNew}
          className="rounded-full bg-brandorange px-4 py-2 text-sm font-semibold text-white hover:bg-brandorange-dark transition"
        >
          + Add testimonial
        </button>
      </div>
      <p className="text-sm text-inkgray mb-6">
        Published testimonials appear on the homepage in the order set here.
      </p>

      {editingId && (
        <div className="bg-white rounded-xl2 border border-gray-100 shadow-card p-6 mb-6 space-y-4">
          <textarea
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            rows={3}
            placeholder="Quote"
            value={form.quote}
            onChange={(e) => setForm({ ...form, quote: e.target.value })}
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="Author name"
              value={form.authorName}
              onChange={(e) => setForm({ ...form, authorName: e.target.value })}
            />
            <input
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="Role / title"
              value={form.authorRole}
              onChange={(e) => setForm({ ...form, authorRole: e.target.value })}
            />
            <input
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="Company"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
            <div className="flex items-center gap-2">
              <input
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="Avatar image URL"
                value={form.avatarUrl}
                onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
              />
              <MediaPickerButton onSelect={(url) => setForm({ ...form, avatarUrl: url })} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-navy">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
            />
            Published (visible on the site)
          </label>
          {message && <p className="text-sm text-red-600">{message}</p>}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => setEditingId(null)} className="text-sm text-inkgray">
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-inkgray">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-inkgray">No testimonials yet.</p>
      ) : (
        <div className="bg-white rounded-xl2 border border-gray-100 shadow-card divide-y divide-gray-100">
          {items.map((t, i) => (
            <div key={t.id} className="flex items-start justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <p className="text-sm text-navy line-clamp-2">&ldquo;{t.quote}&rdquo;</p>
                <p className="text-xs text-inkgray mt-1">
                  {t.author_name}
                  {t.company ? ` · ${t.company}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    t.is_published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {t.is_published ? 'Published' : 'Draft'}
                </span>
                <button onClick={() => move(i, -1)} className="text-inkgray hover:text-navy" title="Move up">
                  ↑
                </button>
                <button onClick={() => move(i, 1)} className="text-inkgray hover:text-navy" title="Move down">
                  ↓
                </button>
                <button onClick={() => startEdit(t)} className="text-xs font-semibold text-brandblue">
                  Edit
                </button>
                <button onClick={() => handleDelete(t.id)} className="text-xs font-semibold text-red-600">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
