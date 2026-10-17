'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import FieldEditor from '@/components/admin/ContentEditor';
import MediaPickerButton from '@/components/admin/MediaPickerButton';

const SECTION_TYPE_OPTIONS = [
  { type: 'richtext', label: 'Story / Rich Text', icon: '📝', description: 'Headings and formatted paragraphs' },
  { type: 'image_text', label: 'Image + Story', icon: '🖼️', description: 'Side-by-side picture and explanatory text' },
  { type: 'cards', label: 'Feature Cards Grid', icon: '🧩', description: 'Grid of cards with titles and descriptions' },
  { type: 'stats', label: 'Key Metrics / Stats', icon: '📊', description: 'Highlighted numbers and stat counters' },
  { type: 'cta', label: 'Call to Action Banner', icon: '📣', description: 'Banner with headline and clickable button' },
  { type: 'hero', label: 'Hero Banner', icon: '🌟', description: 'Top section with eyebrow tag, title, and lead' },
  { type: 'faq', label: 'FAQ Accordion', icon: '❓', description: 'Pulls automatically from published FAQs' },
  { type: 'testimonials', label: 'Client Testimonials', icon: '💬', description: 'Pulls automatically from published Testimonials' }
];

const PAGE_TYPE_META = {
  custom: {
    label: 'General Custom Page',
    routePrefix: '/pages',
    backLabel: '← Back to Custom Pages',
    backHref: '/admin/custom-pages',
    placementText: 'Lives at /pages/[slug]. Anyone with the link can view it, and you can display it in the website footer.'
  },
  service: {
    label: 'Services Category Offering',
    routePrefix: '/services',
    backLabel: '← Back to Services',
    backHref: '/admin/services',
    placementText: 'Lives at /services/[slug]. Automatically appears in the Services header dropdown menu and in the /services overview page grid!'
  },
  industry: {
    label: 'Industries Category Offering',
    routePrefix: '/industries',
    backLabel: '← Back to Industries',
    backHref: '/admin/industries',
    placementText: 'Lives at /industries/[slug]. Automatically appears in the Industries header dropdown menu and overview page.'
  }
};

export default function CustomPageEditor() {
  const { id } = useParams();
  const router = useRouter();

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null);
  const [sections, setSections] = useState([]);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  function load() {
    setLoading(true);
    fetch(`/api/admin/custom-pages/${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (!json?.page) {
          setMessage('Page not found.');
          return;
        }
        setPage(json.page);
        setMeta({
          title: json.page.title || '',
          slug: json.page.slug || '',
          metaDescription: json.page.meta_description || '',
          image: json.page.image || '',
          pageType: json.page.page_type || 'custom',
          showInFooter: Boolean(json.page.show_in_footer),
          isPublished: Boolean(json.page.is_published)
        });
        setSections(json.page.sections || []);
      })
      .catch(() => setMessage('Failed to load page data.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  const typeMeta = PAGE_TYPE_META[meta?.pageType] || PAGE_TYPE_META.custom;
  const liveUrl = meta ? `${typeMeta.routePrefix}/${meta.slug}` : '';

  // Single one-click save for entire page (metadata + all sections)
  async function handleSaveAll() {
    if (!meta.title.trim()) {
      alert('Please enter a page title.');
      return;
    }
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch(`/api/admin/custom-pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...meta,
          sections: sections.map((s) => ({ id: s.id, data: s.data }))
        })
      });
      const json = await res.json();
      if (!res.ok) {
        setMessage(json.error || 'Failed to save page.');
      } else {
        setMessage('✅ Page saved successfully!');
        setTimeout(() => setMessage(''), 4000);
      }
    } catch {
      setMessage('Network error. Failed to save page.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePage() {
    if (!confirm(`Are you sure you want to delete "${page?.title}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/custom-pages/${id}`, { method: 'DELETE' });
    router.push(typeMeta.backHref);
  }

  async function handleAddSection(type) {
    try {
      const res = await fetch(`/api/admin/custom-pages/${id}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      if (res.ok) {
        load();
      }
    } catch {
      alert('Failed to add section.');
    }
  }

  async function handleDeleteSection(sectionId) {
    if (!confirm('Remove this section?')) return;
    try {
      await fetch(`/api/admin/custom-pages/${id}/sections/${sectionId}`, { method: 'DELETE' });
      setSections((prev) => prev.filter((s) => s.id !== sectionId));
    } catch {
      alert('Failed to remove section.');
    }
  }

  function handleSectionDataChange(sectionId, newData) {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, data: newData } : s))
    );
  }

  async function moveSection(index, dir) {
    const target = index + dir;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    setSections(next);
    await fetch(`/api/admin/custom-pages/${id}/sections`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: next.map((s) => s.id) })
    });
  }

  function handleCopyLink() {
    if (typeof window !== 'undefined') {
      const full = `${window.location.origin}${liveUrl}`;
      navigator.clipboard?.writeText(full);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading || !page || !meta) {
    return (
      <div className="max-w-4xl py-12 text-center text-sm text-inkgray">
        Loading page editor…
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 pb-24">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <Link href={typeMeta.backHref} className="text-xs font-semibold text-brandblue hover:underline">
            {typeMeta.backLabel}
          </Link>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <h1 className="text-2xl font-bold text-navy">{meta.title || 'Untitled Page'}</h1>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                meta.isPublished ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              }`}
            >
              {meta.isPublished ? '● Published' : '○ Draft (Hidden)'}
            </span>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-brandblue hover:text-white text-navy transition shadow-2xs"
            title="Open live page in a new browser tab"
          >
            View Live Page ↗
          </a>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="px-5 py-2 rounded-lg text-xs font-bold bg-navy hover:bg-navy-light text-white transition shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <span>Saving Changes…</span>
            ) : (
              <>
                <span>💾</span>
                <span>Save Page Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-xs font-semibold ${message.startsWith('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message}
        </div>
      )}

      {/* 1. PUBLIC WEBSITE PLACEMENT & LIVE LINK CARD */}
      <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white rounded-2xl border border-blue-200/80 p-5 shadow-card space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌐</span>
            <h2 className="text-sm font-bold text-navy uppercase tracking-wide">
              Public Website Location &amp; Link
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-white border border-gray-200 hover:bg-gray-50 text-navy transition shadow-2xs"
            >
              {copied ? '✓ Link Copied' : '📋 Copy Link'}
            </button>
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-brandblue text-white hover:bg-brandblue-dark transition shadow-2xs"
            >
              Open Live Page ↗
            </a>
          </div>
        </div>

        <div className="p-3 bg-white/90 rounded-xl border border-blue-100 flex items-center gap-2 font-mono text-xs text-navy break-all">
          <span className="text-inkgray select-none">Live URL:</span>
          <span className="font-bold text-brandblue">{liveUrl}</span>
        </div>

        <p className="text-xs text-inkgray leading-relaxed">
          {typeMeta.placementText}
        </p>

        {/* Page Category Switcher */}
        <div className="pt-2 border-t border-blue-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs text-inkgray font-medium">
            Where should this page be grouped on the website?
          </label>
          <select
            value={meta.pageType}
            onChange={(e) => setMeta({ ...meta, pageType: e.target.value })}
            className="text-xs font-bold rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-navy focus:outline-none focus:ring-2 focus:ring-brandblue"
          >
            <option value="custom">📄 General Custom Page (/pages/...)</option>
            <option value="service">💼 Services Category (/services/...)</option>
            <option value="industry">🏭 Industries Category (/industries/...)</option>
          </select>
        </div>
      </div>

      {/* 2. BASIC PAGE SETTINGS */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-6 space-y-4">
        <h2 className="text-sm font-bold text-navy uppercase tracking-wide flex items-center gap-2">
          <span>⚙️</span> Page Details &amp; Visibility
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-navy mb-1">
              Page Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brandblue font-semibold text-navy"
              placeholder="e.g. Tracker Studies"
              value={meta.title}
              onChange={(e) => setMeta({ ...meta, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy mb-1">
              URL Link (Slug)
            </label>
            <div className="flex items-center rounded-lg border border-gray-200 px-3 py-2 bg-gray-50 text-sm">
              <span className="text-inkgray font-mono text-xs shrink-0">{typeMeta.routePrefix}/</span>
              <input
                type="text"
                className="flex-1 bg-transparent border-0 focus:outline-none text-xs font-mono font-semibold text-navy pl-1"
                value={meta.slug}
                onChange={(e) => setMeta({ ...meta, slug: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-navy mb-1">
            Subtitle / Summary Paragraph
          </label>
          <textarea
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brandblue leading-relaxed"
            rows={2}
            placeholder="A short introductory sentence or summary displayed directly under the title in the header banner."
            value={meta.metaDescription}
            onChange={(e) => setMeta({ ...meta, metaDescription: e.target.value })}
          />
        </div>

        {/* Page Header Illustration / Image */}
        <div>
          <label className="block text-xs font-semibold text-navy mb-1.5">
            Header Illustration / Featured Image (Optional)
          </label>
          {meta.image ? (
            <div className="flex items-center gap-4 p-3.5 bg-paper-dim/40 rounded-xl border border-line">
              <img
                src={meta.image}
                alt="Header illustration"
                className="h-16 w-24 object-contain rounded-lg border border-gray-200 bg-white"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-ink font-mono truncate">{meta.image}</p>
                <p className="text-[11px] text-inkgray mt-0.5">Displayed in the header card on the live page.</p>
              </div>
              <div className="flex items-center gap-2">
                <MediaPickerButton onSelect={(url) => setMeta({ ...meta, image: url })} />
                <button
                  type="button"
                  onClick={() => setMeta({ ...meta, image: '' })}
                  className="text-xs font-semibold text-red-600 hover:underline px-2 py-1"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <input
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brandblue"
                placeholder="Image URL or browse media library..."
                value={meta.image || ''}
                onChange={(e) => setMeta({ ...meta, image: e.target.value })}
              />
              <MediaPickerButton onSelect={(url) => setMeta({ ...meta, image: url })} />
            </div>
          )}
        </div>

        {/* Toggles */}
        <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-navy cursor-pointer">
            <input
              type="checkbox"
              checked={meta.isPublished}
              onChange={(e) => setMeta({ ...meta, isPublished: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-brandblue focus:ring-brandblue"
            />
            <span>Published (Live &amp; visible on the public site)</span>
          </label>

          {meta.pageType === 'custom' && (
            <label className="flex items-center gap-2 text-sm font-semibold text-navy cursor-pointer">
              <input
                type="checkbox"
                checked={meta.showInFooter}
                onChange={(e) => setMeta({ ...meta, showInFooter: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-brandblue focus:ring-brandblue"
              />
              <span>Show link in website footer (under Explore)</span>
            </label>
          )}
        </div>
      </div>

      {/* 3. PAGE CONTENT SECTIONS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-navy uppercase tracking-wide flex items-center gap-2">
              <span>📄</span> Page Content Blocks ({sections.length})
            </h2>
            <p className="text-xs text-inkgray mt-0.5">
              Build your page by adding text articles, picture stories, feature cards, or metrics.
            </p>
          </div>
        </div>

        {/* Quick Add Visual Section Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs space-y-2">
          <p className="text-xs font-bold text-navy uppercase tracking-wider">
            + Click to add a content block:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SECTION_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                type="button"
                onClick={() => handleAddSection(opt.type)}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 hover:border-brandblue hover:bg-blue-50/50 text-left transition text-xs group"
              >
                <span className="text-base group-hover:scale-110 transition">{opt.icon}</span>
                <div className="min-w-0">
                  <p className="font-semibold text-navy truncate">{opt.label}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Section List */}
        {sections.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-3">
            <span className="text-3xl block">✏️</span>
            <p className="text-sm font-bold text-navy">No content blocks yet</p>
            <p className="text-xs text-inkgray max-w-sm mx-auto">
              Click any of the block buttons above (like "📝 Story / Rich Text") to write your page content!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((sec, i) => {
              const opt = SECTION_TYPE_OPTIONS.find((o) => o.type === sec.type) || {
                label: sec.type,
                icon: '📄'
              };

              return (
                <div
                  key={sec.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-card p-5 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{opt.icon}</span>
                      <h3 className="text-sm font-bold text-navy">{opt.label}</h3>
                      <span className="text-[11px] text-inkgray">Block #{i + 1}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveSection(i, -1)}
                        disabled={i === 0}
                        className="px-2 py-1 text-xs text-inkgray hover:bg-gray-100 rounded disabled:opacity-30"
                        title="Move block up"
                      >
                        ↑ Move Up
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection(i, 1)}
                        disabled={i === sections.length - 1}
                        className="px-2 py-1 text-xs text-inkgray hover:bg-gray-100 rounded disabled:opacity-30"
                        title="Move block down"
                      >
                        ↓ Move Down
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSection(sec.id)}
                        className="px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded ml-1"
                        title="Remove this block"
                      >
                        ✕ Remove
                      </button>
                    </div>
                  </div>

                  {/* Section Editor */}
                  {sec.type !== 'testimonials' && sec.type !== 'faq' ? (
                    <div>
                      <FieldEditor
                        value={sec.data}
                        onChange={(newData) => handleSectionDataChange(sec.id, newData)}
                      />
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-xl text-xs text-inkgray">
                      Pulls automatically from your published {sec.type === 'testimonials' ? 'Testimonials' : 'FAQs'} library in the admin sidebar.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 px-6 py-3.5 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`h-2.5 w-2.5 rounded-full ${meta.isPublished ? 'bg-green-500' : 'bg-amber-500'}`} />
            <span className="text-xs text-navy font-semibold hidden sm:inline">
              {meta.isPublished ? 'Page is LIVE on the website' : 'Page is saved as a DRAFT'}
            </span>
            <span className="text-xs text-inkgray font-mono hidden md:inline truncate max-w-xs">
              {liveUrl}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDeletePage}
              className="text-xs text-red-600 hover:underline px-2 py-1"
            >
              Delete page
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saving}
              className="rounded-xl bg-navy hover:bg-navy-light px-6 py-2.5 text-xs font-bold text-white shadow-md transition disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? 'Saving…' : '💾 Save Page Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
