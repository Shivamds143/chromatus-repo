'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const TYPES = [
  { value: 'blog', label: 'Blog & Article' },
  { value: 'whitepaper', label: 'Whitepaper' },
  { value: 'case_study', label: 'Case Study' },
  { value: 'report', label: 'Report' },
  { value: 'webinar', label: 'Webinar & Event' }
];

export default function ArticleForm({ initial, articleId }) {
  const router = useRouter();
  const [form, setForm] = useState(
    initial || {
      type: 'blog',
      tag: '',
      title: '',
      slug: '',
      summary: '',
      body: '',
      author: 'Chromatus Consulting',
      published_at: new Date().toISOString().slice(0, 10),
      is_published: false
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const url = articleId ? `/api/admin/insights/${articleId}` : '/api/admin/insights';
      const method = articleId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Save failed.');
        setSaving(false);
        return;
      }
      router.push('/admin/insights');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 bg-white rounded-xl2 border border-gray-100 shadow-card p-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-inkgray mb-1">Type</label>
          <select
            value={form.type}
            onChange={(e) => set('type', e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-inkgray mb-1">Tag</label>
          <input
            type="text"
            value={form.tag}
            onChange={(e) => set('tag', e.target.value)}
            placeholder="e.g. PERSPECTIVE"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-inkgray mb-1">Title</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-inkgray mb-1">Slug (optional — derived from title)</label>
        <input
          type="text"
          value={form.slug}
          onChange={(e) => set('slug', e.target.value)}
          placeholder="auto-generated-from-title"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-inkgray mb-1">Summary</label>
        <textarea
          value={form.summary}
          onChange={(e) => set('summary', e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-inkgray mb-1">Body</label>
        <textarea
          value={form.body}
          onChange={(e) => set('body', e.target.value)}
          rows={8}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-inkgray mb-1">Author</label>
          <input
            type="text"
            value={form.author}
            onChange={(e) => set('author', e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-inkgray mb-1">Published date</label>
          <input
            type="date"
            value={form.published_at?.slice ? form.published_at.slice(0, 10) : form.published_at}
            onChange={(e) => set('published_at', e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            required
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-navy">
        <input type="checkbox" checked={!!form.is_published} onChange={(e) => set('is_published', e.target.checked)} />
        Published (visible on the site)
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-brandorange px-5 py-2.5 text-sm font-semibold text-white hover:bg-brandorange-dark transition disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save article'}
        </button>
      </div>
    </form>
  );
}
