'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const TYPE_LABEL = {
  blog: 'Blog & Article',
  whitepaper: 'Whitepaper',
  case_study: 'Case Study',
  report: 'Report',
  webinar: 'Webinar & Event'
};

export default function AdminInsightsListPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    fetch('/api/admin/insights')
      .then((res) => res.json())
      .then((data) => setArticles(data.articles || []))
      .finally(() => setLoading(false));
  }

  // Fetching this admin data is synchronizing with an external system (the API) on mount — an accepted use of the pattern.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, []);

  async function handleDelete(id) {
    if (!confirm('Delete this article? This cannot be undone.')) return;
    const res = await fetch(`/api/admin/insights/${id}`, { method: 'DELETE' });
    if (res.ok) setArticles((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-navy">Insights Articles</h1>
        <Link
          href="/admin/insights/new"
          className="rounded-full bg-brandorange px-5 py-2.5 text-sm font-semibold text-white hover:bg-brandorange-dark transition"
        >
          + New article
        </Link>
      </div>
      <p className="text-sm text-inkgray mb-6">Blogs, whitepapers, case studies, reports, and webinars.</p>

      {loading ? (
        <p className="text-sm text-inkgray">Loading…</p>
      ) : articles.length === 0 ? (
        <p className="text-sm text-inkgray">No articles yet.</p>
      ) : (
        <div className="bg-white rounded-xl2 border border-gray-100 shadow-card divide-y divide-gray-100">
          {articles.map((a) => (
            <div key={a.id} className="flex items-center justify-between px-5 py-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-navy truncate">{a.title}</p>
                <p className="text-xs text-inkgray">
                  {TYPE_LABEL[a.type] || a.type} · {a.tag} · {new Date(a.published_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    a.is_published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {a.is_published ? 'Published' : 'Draft'}
                </span>
                <Link href={`/admin/insights/${a.id}`} className="text-sm font-semibold text-brandblue hover:text-brandblue-dark">
                  Edit
                </Link>
                <button onClick={() => handleDelete(a.id)} className="text-sm font-semibold text-red-600 hover:text-red-700">
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
