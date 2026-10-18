'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const TYPE_LABEL = {
  'industry-reports': 'Industry Report',
  report: 'Industry Report',
  whitepapers: 'Whitepaper',
  whitepaper: 'Whitepaper',
  'case-studies': 'Case Study',
  case_study: 'Case Study',
  'news-updates': 'News & Update',
  'webinars-events': 'Webinar & Event',
  webinar: 'Webinar & Event',
  blog: 'Blog & Article'
};

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'industry-reports', label: 'Industry Reports' },
  { key: 'whitepapers', label: 'Whitepapers' },
  { key: 'case-studies', label: 'Case Studies' },
  { key: 'news-updates', label: 'News & Updates' },
  { key: 'webinars-events', label: 'Webinars & Events' },
  { key: 'blog', label: 'Blogs' }
];

function matchesCategory(articleType, catKey) {
  if (catKey === 'all') return true;
  const t = String(articleType || '').toLowerCase();
  if (catKey === 'industry-reports') return t === 'industry-reports' || t === 'report' || t === 'reports';
  if (catKey === 'whitepapers') return t === 'whitepapers' || t === 'whitepaper';
  if (catKey === 'case-studies') return t === 'case-studies' || t === 'case_study' || t === 'case-study';
  if (catKey === 'news-updates') return t === 'news-updates' || t === 'news';
  if (catKey === 'webinars-events') return t === 'webinars-events' || t === 'webinar';
  if (catKey === 'blog') return t === 'blog' || t === 'blogs';
  return t === catKey;
}

const CORE_INSIGHTS = [
  {
    key: 'industryReports',
    title: 'Industry Reports',
    label: 'Market Intelligence',
    desc: 'Sector-focused market perspectives and quantitative intelligence.',
    route: '/insights/industry-reports'
  },
  {
    key: 'whitepapers',
    title: 'Whitepapers',
    label: 'Strategic Frameworks',
    desc: 'Detailed analysis built around specific business questions and themes.',
    route: '/insights/whitepapers'
  },
  {
    key: 'caseStudies',
    title: 'Case Studies',
    label: 'Proven Outcomes',
    desc: 'See how research translates into measurable strategic advantage.',
    route: '/insights/case-studies'
  },
  {
    key: 'newsUpdates',
    title: 'News & Updates',
    label: 'Firm Milestones',
    desc: 'Stay informed about Chromatus research, fieldwork, and news.',
    route: '/insights/news-updates'
  },
  {
    key: 'webinarsEvents',
    title: 'Webinars & Events',
    label: 'Executive Briefings',
    desc: 'Live and recorded sessions with practice leads and specialists.',
    route: '/insights/webinars-events'
  }
];

export default function AdminInsightsListPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  function load() {
    setLoading(true);
    fetch('/api/admin/insights')
      .then((res) => res.json())
      .then((data) => setArticles(data.articles || []))
      .finally(() => setLoading(false));
  }

  // Fetching this admin data is synchronizing with an external system (the API) on mount
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, []);

  async function handleDelete(id) {
    if (!confirm('Delete this article? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/insights/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setArticles((prev) =>
          prev.filter((a) => String(a.id) !== String(id) && String(a._id) !== String(id))
        );
      } else {
        alert(data.error || 'Failed to delete article');
      }
    } catch {
      alert('Network error while deleting article');
    }
  }

  const filtered = articles.filter((a) => {
    const matchesCat = matchesCategory(a.type, activeCategory);
    if (!matchesCat) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (a.title && a.title.toLowerCase().includes(q)) ||
      (a.tag && a.tag.toLowerCase().includes(q)) ||
      (a.author && a.author.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-navy">Insights Management</h1>
          <p className="text-sm text-inkgray">
            Manage all 5 Insights landing pages, visual stat boxes, and publications.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/insights"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-navy hover:bg-gray-50 transition"
          >
            Live Insights ↗
          </Link>
          <Link
            href="/admin/insights/new"
            className="rounded-full bg-brandorange px-4 py-2 text-xs font-semibold text-white hover:bg-brandorange-dark transition shadow-xs"
          >
            + New Publication
          </Link>
        </div>
      </div>

      {/* 5 Core Insights Categories Grid */}
      <div className="mt-5 mb-8 bg-white rounded-xl2 border border-gray-100 shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-navy">
              5 Core Insights Categories
            </h2>
            <p className="text-xs text-inkgray mt-0.5">
              Edit landing content, stat boxes, and deliverables for each category.
            </p>
          </div>
          <Link
            href="/admin/pages/insightsOverview"
            className="text-xs font-semibold text-brandblue hover:underline"
          >
            Edit Main Hub Overview Page (/insights) →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {CORE_INSIGHTS.map((cat) => (
            <div
              key={cat.key}
              className="bg-bglight/60 rounded-xl border border-gray-200/70 p-3.5 flex flex-col justify-between hover:border-brandblue hover:bg-white hover:shadow-xs transition"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brandblue block mb-1">
                  {cat.label}
                </span>
                <h3 className="font-bold text-sm text-navy">{cat.title}</h3>
                <p className="text-[11px] text-inkgray mt-1 line-clamp-2 leading-relaxed">
                  {cat.desc}
                </p>
              </div>
              <div className="mt-3.5 pt-2.5 border-t border-gray-200/60 flex items-center justify-between">
                <Link
                  href={`/admin/pages/${cat.key}`}
                  className="text-xs font-semibold text-brandblue hover:text-brandblue-dark"
                >
                  Edit Page ✏️
                </Link>
                <Link
                  href={cat.route}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-inkgray hover:text-navy"
                  title="View live page"
                >
                  View ↗
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Publications Section Header */}
      <div className="flex items-center justify-between mt-8 mb-3">
        <div>
          <h2 className="text-base font-bold text-navy">Publications &amp; Articles</h2>
          <p className="text-xs text-inkgray">Filter and manage published research, reports, and articles.</p>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="mt-5 mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-2xs">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map((cat) => {
            const count = articles.filter((a) => matchesCategory(a.type, cat.key)).length;
            const active = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  active
                    ? 'bg-navy text-white shadow-xs'
                    : 'bg-gray-50 text-inkgray hover:bg-gray-100 hover:text-navy'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    active ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="w-full md:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search publications..."
            className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-navy focus:outline-none focus:ring-2 focus:ring-brandblue"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-inkgray">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center">
          <p className="text-sm text-inkgray">No publications found.</p>
          <Link
            href="/admin/insights/new"
            className="mt-3 inline-block text-xs font-semibold text-brandblue hover:underline"
          >
            + Create a publication in this category
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl2 border border-gray-100 shadow-card divide-y divide-gray-100">
          {filtered.map((a) => (
            <div key={a.id} className="flex items-center justify-between px-5 py-4 hover:bg-bglight/50 transition">
              <div className="min-w-0 pr-4">
                <p className="text-sm font-semibold text-navy truncate">{a.title}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-inkgray">
                  <span className="font-semibold text-brandblue bg-blue-50 px-2 py-0.5 rounded">
                    {TYPE_LABEL[a.type] || a.type}
                  </span>
                  {a.tag && <span>· {a.tag}</span>}
                  {a.published_at && (
                    <span>· {new Date(a.published_at).toLocaleDateString()}</span>
                  )}
                  {a.author && <span>· By {a.author}</span>}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    a.is_published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {a.is_published ? 'Published' : 'Draft'}
                </span>
                <Link
                  href={`/admin/insights/${a.id}`}
                  className="text-xs sm:text-sm font-semibold text-brandblue hover:text-brandblue-dark"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(a.id)}
                  className="text-xs sm:text-sm font-semibold text-red-600 hover:text-red-700"
                >
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
