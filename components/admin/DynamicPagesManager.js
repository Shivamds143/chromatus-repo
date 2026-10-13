'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

/**
 * Shared list + create UI for any page-builder-backed content type
 * (Custom Pages, Services, Industries). Every type reuses the exact same
 * section-based editor at /admin/custom-pages/[id] — only the listing,
 * public URL prefix, and page_type differ.
 */
export default function DynamicPagesManager({ pageType, title, description, publicPrefix, createLabel = '+ New page' }) {
  const router = useRouter();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [pageTitle, setPageTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [message, setMessage] = useState('');

  function load() {
    setLoading(true);
    fetch(`/api/admin/custom-pages?type=${pageType}`)
      .then((res) => res.json())
      .then((json) => setPages(json.pages || []))
      .finally(() => setLoading(false));
  }

  // Fetching this list is synchronizing with an external system (the API)
  // on mount/pageType change — an accepted use of the pattern, not a
  // derivable-during-render value.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, [pageType]);

  async function handleCreate() {
    if (!pageTitle.trim()) return;
    setMessage('');
    const res = await fetch('/api/admin/custom-pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: pageTitle, slug, pageType })
    });
    const json = await res.json();
    if (!res.ok) {
      setMessage(json.error || 'Could not create page.');
      return;
    }
    router.push(`/admin/custom-pages/${json.id}`);
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

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-navy">{title}</h1>
        <button
          onClick={() => setCreating((c) => !c)}
          className="rounded-full bg-brandorange px-4 py-2 text-sm font-semibold text-white hover:bg-brandorange-dark transition"
        >
          {createLabel}
        </button>
      </div>
      <p className="text-sm text-inkgray mb-6">{description}</p>

      {creating && (
        <div className="bg-white rounded-xl2 border border-gray-100 shadow-card p-6 mb-6 space-y-3">
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            placeholder="Page title"
            value={pageTitle}
            onChange={(e) => setPageTitle(e.target.value)}
          />
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            placeholder="URL slug (optional — auto-generated from title if left blank)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          {message && <p className="text-sm text-red-600">{message}</p>}
          <button
            onClick={handleCreate}
            className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white"
          >
            Create &amp; edit
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-inkgray">Loading…</p>
      ) : pages.length === 0 ? (
        <p className="text-sm text-inkgray">Nothing here yet — add one above to get started.</p>
      ) : (
        <div className="bg-white rounded-xl2 border border-gray-100 shadow-card divide-y divide-gray-100">
          {pages.map((p, i) => (
            <div key={p.id} className="flex items-center justify-between px-5 py-4 hover:bg-bglight transition">
              <Link href={`/admin/custom-pages/${p.id}`} className="min-w-0">
                <p className="text-sm font-medium text-navy truncate">{p.title}</p>
                <p className="text-xs text-inkgray">
                  {publicPrefix}/{p.slug} · {p.section_count} section{p.section_count === 1 ? '' : 's'}
                </p>
              </Link>
              <div className="flex items-center gap-3 shrink-0">
                <button onClick={() => moveRow(i, -1)} disabled={i === 0} className="text-inkgray hover:text-navy disabled:opacity-30" title="Move up">↑</button>
                <button onClick={() => moveRow(i, 1)} disabled={i === pages.length - 1} className="text-inkgray hover:text-navy disabled:opacity-30" title="Move down">↓</button>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    p.is_published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {p.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
