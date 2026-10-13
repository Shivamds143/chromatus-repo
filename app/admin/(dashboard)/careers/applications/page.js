'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

const STATUSES = ['new', 'reviewed', 'shortlisted', 'rejected', 'hired'];

const STATUS_STYLES = {
  new: 'bg-blue-100 text-blue-700',
  reviewed: 'bg-gray-100 text-gray-700',
  shortlisted: 'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-700',
  hired: 'bg-green-100 text-green-700'
};

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobFilter, setJobFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  function load() {
    setLoading(true);
    fetch('/api/admin/applications')
      .then((res) => res.json())
      .then((json) => setApplications(json.applications || []))
      .finally(() => setLoading(false));
  }

  // Fetching this admin data is synchronizing with an external system (the API) on mount — an accepted use of the pattern.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, []);

  const jobOptions = useMemo(() => {
    const map = new Map();
    applications.forEach((a) => map.set(a.job_id, a.job_title));
    return Array.from(map.entries());
  }, [applications]);

  const filtered = useMemo(() => {
    if (jobFilter === 'all') return applications;
    return applications.filter((a) => String(a.job_id) === jobFilter);
  }, [applications, jobFilter]);

  async function handleStatusChange(app, status) {
    setApplications((prev) => prev.map((a) => (a.id === app.id ? { ...a, status } : a)));
    await fetch(`/api/admin/applications/${app.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  }

  async function handleDelete(app) {
    if (!confirm(`Delete the application from ${app.name}? This cannot be undone.`)) return;
    await fetch(`/api/admin/applications/${app.id}`, { method: 'DELETE' });
    setApplications((prev) => prev.filter((a) => a.id !== app.id));
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-navy">Applications</h1>
        <Link href="/admin/careers" className="text-sm font-semibold text-brandblue">
          ← Back to Careers
        </Link>
      </div>
      <p className="text-sm text-inkgray mb-6">
        Every application submitted through a job&rsquo;s public Apply page, stored in MongoDB.
      </p>

      <div className="flex items-center gap-3 mb-6">
        <label className="text-xs text-inkgray">Filter by role:</label>
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          value={jobFilter}
          onChange={(e) => setJobFilter(e.target.value)}
        >
          <option value="all">All roles ({applications.length})</option>
          {jobOptions.map(([id, title]) => (
            <option key={id} value={id}>
              {title}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-inkgray">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-inkgray">No applications yet.</p>
      ) : (
        <div className="bg-white rounded-xl2 border border-gray-100 shadow-card divide-y divide-gray-100">
          {filtered.map((app) => (
            <div key={app.id} className="px-5 py-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <button
                  onClick={() => setExpanded(expanded === app.id ? null : app.id)}
                  className="text-left min-w-0 flex-1"
                >
                  <p className="text-sm font-medium text-navy truncate">
                    {app.name} <span className="text-inkgray font-normal">— {app.job_title}</span>
                  </p>
                  <p className="text-xs text-inkgray">
                    {app.email}
                    {app.phone ? ` · ${app.phone}` : ''} ·{' '}
                    {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : ''}
                  </p>
                </button>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    className={`text-xs font-semibold rounded-full px-2.5 py-1 border-0 ${STATUS_STYLES[app.status] || 'bg-gray-100 text-gray-700'}`}
                    value={app.status}
                    onChange={(e) => handleStatusChange(app, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleDelete(app)}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {expanded === app.id && (
                <div className="mt-3 pt-3 border-t border-gray-100 text-sm space-y-3">
                  {app.experience && (
                    <p className="text-xs text-inkgray">
                      <span className="font-semibold text-navy">Experience: </span>
                      {app.experience}
                    </p>
                  )}
                  {app.resume_url && (
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <span className="text-xs font-semibold text-inkgray">Resume / CV:</span>
                      <a
                        href={app.resume_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-navy-light transition"
                      >
                        📄 View Resume
                      </a>
                      {app.resume_url.startsWith('/api/admin/resumes/') && (
                        <a
                          href={`${app.resume_url}?download=1`}
                          download
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-navy hover:bg-gray-50 shadow-xs transition"
                        >
                          ⬇ Download File
                        </a>
                      )}
                      {app.linkedin_url && (
                        <a
                          href={app.linkedin_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-brandblue hover:underline"
                        >
                          LinkedIn Profile ↗
                        </a>
                      )}
                    </div>
                  )}
                  {app.cover_note && (
                    <div className="rounded-lg bg-bglight p-3 text-xs text-navy leading-relaxed whitespace-pre-wrap border border-gray-100">
                      <p className="font-semibold text-inkgray mb-1">Cover Note / Message:</p>
                      {app.cover_note}
                    </div>
                  )}
                  {!app.resume_url && !app.cover_note && (
                    <p className="text-xs text-inkgray italic">No resume link or note was provided.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
