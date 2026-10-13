'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const EMPTY_JOB = {
  title: '',
  department: '',
  location: '',
  type: 'Full-time',
  description: '',
  isActive: true,
  postedAt: new Date().toISOString().slice(0, 10)
};

export default function AdminCareersPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // job object being edited, or EMPTY_JOB for "new"
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  function load() {
    setLoading(true);
    fetch('/api/admin/jobs')
      .then((res) => res.json())
      .then((json) => setJobs(json.jobs || []))
      .finally(() => setLoading(false));
  }

  // Fetching this admin data is synchronizing with an external system (the API) on mount — an accepted use of the pattern.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, []);

  function startEdit(job) {
    setMessage('');
    setEditing(
      job
        ? {
            id: job.id,
            title: job.title,
            department: job.department,
            location: job.location,
            type: job.type,
            description: job.description || '',
            isActive: !!job.is_active,
            postedAt: job.posted_at
          }
        : { ...EMPTY_JOB }
    );
  }

  async function handleSave() {
    setSaving(true);
    setMessage('');
    const isNew = !editing.id;
    const res = await fetch(isNew ? '/api/admin/jobs' : `/api/admin/jobs/${editing.id}`, {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing)
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) {
      setMessage(json.error || 'Save failed.');
      return;
    }
    setEditing(null);
    load();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this job posting? This cannot be undone.')) return;
    const res = await fetch(`/api/admin/jobs/${id}`, { method: 'DELETE' });
    if (res.ok) setJobs((prev) => prev.filter((j) => j.id !== id));
  }

  async function toggleActive(job) {
    await fetch(`/api/admin/jobs/${job.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: job.title,
        department: job.department,
        location: job.location,
        type: job.type,
        description: job.description,
        postedAt: job.posted_at,
        isActive: !job.is_active
      })
    });
    load();
  }

  async function moveRow(index, dir) {
    const target = index + dir;
    if (target < 0 || target >= jobs.length) return;
    const next = [...jobs];
    [next[index], next[target]] = [next[target], next[index]];
    setJobs(next);
    await fetch('/api/admin/jobs/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: next.map((j) => j.id) })
    });
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-navy">Careers</h1>
        <button
          onClick={() => startEdit(null)}
          className="rounded-full bg-brandorange px-4 py-2 text-sm font-semibold text-white hover:bg-brandorange-dark transition"
        >
          + New job posting
        </button>
      </div>
      <p className="text-sm text-inkgray mb-2">
        Manage open roles shown on the public Careers page.
      </p>
      <p className="text-sm mb-2">
        <Link href="/admin/pages?group=Careers" className="text-brandblue font-semibold">
          Edit Careers page content (Overview, Life at Chromatus, Benefits, DEI, Early Careers) →
        </Link>
      </p>
      <p className="text-sm mb-6">
        <Link href="/admin/careers/applications" className="text-brandblue font-semibold">
          View submitted applications →
        </Link>
      </p>

      {editing && (
        <div className="bg-white rounded-xl2 border border-gray-100 shadow-card p-6 mb-6 space-y-4">
          <p className="text-xs font-semibold text-inkgray uppercase tracking-wide">
            {editing.id ? 'Edit job' : 'New job'}
          </p>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            placeholder="Job title"
            value={editing.title}
            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
          />
          <div className="grid sm:grid-cols-3 gap-3">
            <input
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="Department"
              value={editing.department}
              onChange={(e) => setEditing({ ...editing, department: e.target.value })}
            />
            <input
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="Location"
              value={editing.location}
              onChange={(e) => setEditing({ ...editing, location: e.target.value })}
            />
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={editing.type}
              onChange={(e) => setEditing({ ...editing, type: e.target.value })}
            >
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Internship</option>
            </select>
          </div>
          <textarea
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            rows={4}
            placeholder="Job description"
            value={editing.description}
            onChange={(e) => setEditing({ ...editing, description: e.target.value })}
          />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-navy">
              <input
                type="date"
                className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                value={editing.postedAt}
                onChange={(e) => setEditing({ ...editing, postedAt: e.target.value })}
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-navy">
              <input
                type="checkbox"
                checked={editing.isActive}
                onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })}
              />
              Published (visible on the site)
            </label>
          </div>
          {message && <p className="text-sm text-red-600">{message}</p>}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save job'}
            </button>
            <button onClick={() => setEditing(null)} className="text-sm font-semibold text-inkgray">
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-inkgray">Loading…</p>
      ) : jobs.length === 0 ? (
        <p className="text-sm text-inkgray">No job postings yet.</p>
      ) : (
        <div className="bg-white rounded-xl2 border border-gray-100 shadow-card divide-y divide-gray-100">
          {jobs.map((job, i) => (
            <div key={job.id} className="flex items-center justify-between px-5 py-4 hover:bg-bglight transition">
              <button onClick={() => startEdit(job)} className="text-left min-w-0">
                <p className="text-sm font-medium text-navy truncate">{job.title}</p>
                <p className="text-xs text-inkgray">
                  {job.department} · {job.location} · {job.type}
                </p>
              </button>
              <div className="flex items-center gap-3 shrink-0">
                <button onClick={() => moveRow(i, -1)} disabled={i === 0} className="text-inkgray hover:text-navy disabled:opacity-30" title="Move up">↑</button>
                <button onClick={() => moveRow(i, 1)} disabled={i === jobs.length - 1} className="text-inkgray hover:text-navy disabled:opacity-30" title="Move down">↓</button>
                <button
                  onClick={() => toggleActive(job)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    job.is_active ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {job.is_active ? 'Published' : 'Unpublished'}
                </button>
                <button onClick={() => handleDelete(job.id)} className="text-xs font-semibold text-red-600">
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
