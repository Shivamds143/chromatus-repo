'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import MediaPickerButton from '@/components/admin/MediaPickerButton';

function TextareaWithToolbar({ value = '', onChange, label, rows = 4, placeholder = '', required = false, fontMono = false }) {
  const textareaRef = useRef(null);

  function wrapSelection(prefix, suffix = prefix, defaultPlaceholder = 'text') {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const selected = value.substring(start, end) || defaultPlaceholder;
    const next = value.substring(0, start) + prefix + selected + suffix + value.substring(end);
    onChange(next);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 10);
  }

  function insertBoldHeadline() {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const selected = value.substring(start, end) || 'Headline';
    const prefix = start > 0 && !value.substring(0, start).endsWith('\n') ? '\n\n**' : '**';
    const suffix = ':** ';
    const next = value.substring(0, start) + prefix + selected + suffix + value.substring(end);
    onChange(next);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 10);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        {label && <label className="block text-xs font-medium text-inkgray">{label}</label>}
        <div className="flex items-center gap-1 bg-gray-100 rounded-md p-0.5 border border-gray-200">
          <button
            type="button"
            title="Make Bold (**text**)"
            onClick={() => wrapSelection('**', '**', 'bold text')}
            className="px-2 py-0.5 text-xs font-bold text-navy hover:bg-white rounded transition shadow-2xs"
          >
            B
          </button>
          <button
            type="button"
            title="Insert Bold Headline (**Headline:**)"
            onClick={insertBoldHeadline}
            className="px-2 py-0.5 text-xs font-bold text-brandblue hover:bg-white rounded transition shadow-2xs flex items-center gap-0.5"
          >
            <span>H</span>
            <span className="text-[10px] text-gray-500 font-normal">Bold</span>
          </button>
          <button
            type="button"
            title="Make Italic (*text*)"
            onClick={() => wrapSelection('*', '*', 'italic text')}
            className="px-2 py-0.5 text-xs italic font-serif text-navy hover:bg-white rounded transition shadow-2xs"
          >
            I
          </button>
          <button
            type="button"
            title="Add Bullet Point"
            onClick={() => wrapSelection('\n• ', '', 'Point')}
            className="px-2 py-0.5 text-xs text-navy hover:bg-white rounded transition shadow-2xs"
          >
            •
          </button>
        </div>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        required={required}
        className={`w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brandblue focus:ring-1 focus:ring-brandblue outline-hidden ${
          fontMono ? 'font-mono' : ''
        }`}
      />
    </div>
  );
}

const TYPES = [
  { value: 'industry-reports', label: 'Industry Report' },
  { value: 'whitepapers', label: 'Whitepaper' },
  { value: 'case-studies', label: 'Case Study' },
  { value: 'news-updates', label: 'News & Update' },
  { value: 'webinars-events', label: 'Webinar & Event' },
  { value: 'blog', label: 'Blog & Article' }
];

function normalizeFormType(t) {
  if (!t) return 'industry-reports';
  if (t === 'report' || t === 'reports') return 'industry-reports';
  if (t === 'whitepaper') return 'whitepapers';
  if (t === 'case_study' || t === 'case-study') return 'case-studies';
  if (t === 'news') return 'news-updates';
  if (t === 'webinar') return 'webinars-events';
  return t;
}

export default function ArticleForm({ initial, articleId }) {
  const router = useRouter();
  const [form, setForm] = useState(
    initial ? {
      ...initial,
      type: normalizeFormType(initial.type)
    } : {
      type: 'industry-reports',
      tag: '',
      title: '',
      slug: '',
      summary: '',
      body: '',
      cover_image: '',
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
        <label className="block text-xs font-medium text-inkgray mb-1">Cover Image (optional)</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={form.cover_image || ''}
            onChange={(e) => set('cover_image', e.target.value)}
            placeholder="https://... or /media/image.jpg"
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
          <MediaPickerButton
            onSelect={(url) => set('cover_image', url)}
            buttonLabel="Choose Image"
            buttonClassName="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-navy hover:bg-gray-50 transition"
          />
        </div>
        {form.cover_image && (
          <div className="mt-2 relative w-32 h-20 rounded-md overflow-hidden border border-gray-200 bg-gray-50">
            <img src={form.cover_image} alt="Cover preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => set('cover_image', '')}
              className="absolute top-1 right-1 rounded-full bg-black/60 text-white p-0.5 text-xs hover:bg-black"
              title="Remove image"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <TextareaWithToolbar
        label="Summary"
        value={form.summary}
        onChange={(val) => set('summary', val)}
        rows={2}
        required
      />

      <TextareaWithToolbar
        label="Body"
        value={form.body}
        onChange={(val) => set('body', val)}
        rows={8}
        fontMono
      />

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

      <div className="flex items-center justify-between pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-brandorange px-5 py-2.5 text-sm font-semibold text-white hover:bg-brandorange-dark transition disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save article'}
        </button>

        {articleId && (
          <button
            type="button"
            onClick={async () => {
              if (!confirm('Are you sure you want to delete this publication? This cannot be undone.')) return;
              try {
                const res = await fetch(`/api/admin/insights/${articleId}`, { method: 'DELETE' });
                if (res.ok) {
                  router.push('/admin/insights');
                } else {
                  alert('Failed to delete article');
                }
              } catch {
                alert('Network error while deleting article');
              }
            }}
            className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
          >
            Delete Publication
          </button>
        )}
      </div>
    </form>
  );
}
