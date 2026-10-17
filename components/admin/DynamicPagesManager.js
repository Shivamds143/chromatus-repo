'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DynamicPagesManager({
  pageType,
  title,
  description,
  publicPrefix,
  createLabel = '+ New page'
}) {
  const router = useRouter();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [pageTitle, setPageTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  function load() {
    setLoading(true);
    fetch(`/api/admin/custom-pages?type=${pageType}`)
      .then((res) => res.json())
      .then((json) => setPages(json.pages || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(load, [pageType]);

  // Auto-generate clean slug as title is typed
  function handleTitleChange(val) {
    setPageTitle(val);
    const generated = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(generated);
  }

  async function handleCreate(e) {
    e?.preventDefault();
    if (!pageTitle.trim()) {
      setMessage('Please enter a page title.');
      return;
    }
    setMessage('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/custom-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: pageTitle.trim(),
          slug: slug.trim(),
          metaDescription: metaDescription.trim(),
          pageType
        })
      });
      const json = await res.json();
      if (!res.ok) {
        setMessage(json.error || 'Could not create page.');
        setSubmitting(false);
        return;
      }
      router.push(`/admin/custom-pages/${json.id}`);
    } catch {
      setMessage('Failed to create page. Please try again.');
      setSubmitting(false);
    }
  }

  async function handleDelete(id, title) {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;
    try {
      await fetch(`/api/admin/custom-pages/${id}`, { method: 'DELETE' });
      load();
    } catch {
      alert('Failed to delete page.');
    }
  }

  async function moveRow(index, dir) {
    const target = index + dir;
    if (target < 0 || target >= pages.length) return;
    const next = [...pages];
    [next[index], next[target]] = [next[target], next[index]];
    setPages(next);
    await fetch('/api/admin/custom-pages/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: next.map((p) => p.id) })
    });
  }

  function copyLink(p) {
    const fullUrl = `${window.location.origin}${publicPrefix}/${p.slug}`;
    navigator.clipboard?.writeText(fullUrl);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">{title}</h1>
          <p className="text-sm text-inkgray mt-1">{description}</p>
        </div>
        <button
          onClick={() => {
            setCreating((c) => !c);
            setMessage('');
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-brandblue hover:bg-brandblue-dark px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition shrink-0"
        >
          <span>{creating ? '✕ Close Form' : createLabel}</span>
        </button>
      </div>

      {/* Website Placement Guidance Banner */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-xs text-navy/90 flex flex-col sm:flex-row gap-3">
        <span className="text-xl shrink-0">💡</span>
        <div className="space-y-1">
          <p className="font-semibold text-brandblue">
            Where do these pages show up on the public website?
          </p>
          {pageType === 'custom' && (
            <p className="text-inkgray leading-relaxed">
              Custom pages go live at <span className="font-mono font-semibold text-navy">/pages/[slug]</span>.
              Once published, you can share the link, or enable <span className="font-semibold text-navy">"Show link in website footer"</span> inside the page editor to have it appear automatically in the footer!
            </p>
          )}
          {pageType === 'service' && (
            <p className="text-inkgray leading-relaxed">
              Custom services go live at <span className="font-mono font-semibold text-navy">/services/[slug]</span> and automatically appear in the <span className="font-semibold text-navy">Services navigation menu</span> and on the <span className="font-semibold text-navy">/services</span> overview grid.
            </p>
          )}
          {pageType === 'industry' && (
            <p className="text-inkgray leading-relaxed">
              Custom industries go live at <span className="font-mono font-semibold text-navy">/industries/[slug]</span> and automatically appear in the <span className="font-semibold text-navy">Industries navigation dropdown</span>.
            </p>
          )}
        </div>
      </div>

      {/* Easy Creation Card */}
      {creating && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-sm font-bold text-navy uppercase tracking-wide">
              Create New {pageType === 'service' ? 'Service Page' : pageType === 'industry' ? 'Industry Page' : 'Page'}
            </h2>
            <span className="text-xs text-inkgray">Step 1 of 2</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy mb-1">
              Page Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brandblue"
              placeholder="e.g. Privacy Policy, Global Operations, Market Tracker"
              value={pageTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy mb-1">
              URL Link (Slug)
            </label>
            <div className="flex items-center rounded-lg border border-gray-200 px-3 py-2 bg-gray-50 focus-within:ring-2 focus-within:ring-brandblue focus-within:bg-white text-sm">
              <span className="text-inkgray font-mono text-xs shrink-0">{publicPrefix}/</span>
              <input
                type="text"
                className="flex-1 bg-transparent border-0 focus:outline-none text-xs font-mono font-semibold text-navy pl-1"
                placeholder="my-new-page"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>
            <p className="text-[11px] text-inkgray mt-1">
              Live link will be: <span className="font-mono text-brandblue font-semibold">{publicPrefix}/{slug || 'your-url'}</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy mb-1">
              Short Description / Subtitle (Optional)
            </label>
            <textarea
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brandblue"
              rows={2}
              placeholder="A brief summary shown at the top of the page under the title."
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
            />
          </div>

          {message && <p className="text-xs font-semibold text-red-600">{message}</p>}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting || !pageTitle.trim()}
              className="rounded-lg bg-navy hover:bg-navy-light px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition disabled:opacity-50"
            >
              {submitting ? 'Creating Page…' : 'Create & Start Editing →'}
            </button>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="text-xs text-inkgray hover:text-navy px-3 py-2"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Pages List */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-inkgray">
          Loading pages…
        </div>
      ) : pages.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center space-y-3">
          <span className="text-3xl block">📄</span>
          <p className="text-sm font-semibold text-navy">No pages created yet</p>
          <p className="text-xs text-inkgray max-w-sm mx-auto">
            Click "+ New page" above to create your first page in seconds. It includes a ready-to-edit starter layout!
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-card divide-y divide-gray-100 overflow-hidden">
          {pages.map((p, i) => {
            const liveUrl = `${publicPrefix}/${p.slug}`;
            return (
              <div
                key={p.id}
                className="p-4 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/70 transition"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <p className="text-sm font-bold text-navy truncate">{p.title}</p>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        p.is_published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {p.is_published ? 'Published' : 'Draft'}
                    </span>
                    {p.show_in_footer ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-brandblue border border-blue-200">
                        In Footer
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="text-xs font-mono text-inkgray">{liveUrl}</span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-inkgray">
                      {p.section_count || 0} section{(p.section_count || 0) === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => copyLink(p)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 text-navy transition"
                    title="Copy direct link"
                  >
                    {copiedId === p.id ? '✓ Copied' : '🔗 Link'}
                  </button>

                  <a
                    href={liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-brandblue hover:text-white text-navy transition"
                    title="Open live page in new tab"
                  >
                    View ↗
                  </a>

                  <Link
                    href={`/admin/custom-pages/${p.id}`}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-navy hover:bg-navy-light text-white transition shadow-2xs"
                  >
                    Edit Page
                  </Link>

                  {/* Ordering arrows */}
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden ml-1">
                    <button
                      onClick={() => moveRow(i, -1)}
                      disabled={i === 0}
                      className="px-2 py-1 text-xs text-inkgray hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveRow(i, 1)}
                      disabled={i === pages.length - 1}
                      className="px-2 py-1 text-xs text-inkgray hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent border-l border-gray-200"
                      title="Move down"
                    >
                      ↓
                    </button>
                  </div>

                  <button
                    onClick={() => handleDelete(p.id, p.title)}
                    className="p-1.5 text-xs text-gray-400 hover:text-red-600 transition"
                    title="Delete page"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
