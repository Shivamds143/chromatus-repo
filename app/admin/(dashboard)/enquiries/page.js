'use client';

import { useEffect, useMemo, useState } from 'react';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', className: 'bg-blue-100 text-blue-700' },
  { value: 'in_progress', label: 'In Progress', className: 'bg-amber-100 text-amber-700' },
  { value: 'resolved', label: 'Resolved', className: 'bg-green-100 text-green-700' },
  { value: 'closed', label: 'Closed', className: 'bg-gray-200 text-gray-600' }
];

export default function AdminEnquiriesPage() {
  const [tab, setTab] = useState('contact');
  const [statusFilter, setStatusFilter] = useState('all');
  const [enquiries, setEnquiries] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/enquiries').then((r) => r.json()),
      fetch('/api/admin/newsletter').then((r) => r.json())
    ])
      .then(([e, n]) => {
        setEnquiries(e.enquiries || []);
        setSubscribers(n.subscribers || []);
      })
      .finally(() => setLoading(false));
  }

  // Fetching this admin data is synchronizing with an external system (the API) on mount — an accepted use of the pattern.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, []);

  const visibleEnquiries = useMemo(
    () => (statusFilter === 'all' ? enquiries : enquiries.filter((e) => (e.status || 'new') === statusFilter)),
    [enquiries, statusFilter]
  );

  async function deleteEnquiry(id) {
    if (!confirm('Delete this enquiry?')) return;
    const res = await fetch(`/api/admin/enquiries/${id}`, { method: 'DELETE' });
    if (res.ok) setEnquiries((prev) => prev.filter((e) => e.id !== id));
  }

  async function updateStatus(id, status) {
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    await fetch(`/api/admin/enquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  }

  async function deleteSubscriber(id) {
    if (!confirm('Remove this subscriber?')) return;
    const res = await fetch(`/api/admin/newsletter/${id}`, { method: 'DELETE' });
    if (res.ok) setSubscribers((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-1">Enquiries</h1>
      <p className="text-sm text-inkgray mb-6">Contact form submissions and newsletter sign-ups.</p>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('contact')}
          className={`text-sm font-semibold px-4 py-2 rounded-full ${tab === 'contact' ? 'bg-navy text-white' : 'bg-white text-navy border border-gray-200'}`}
        >
          Contact submissions ({enquiries.length})
        </button>
        <button
          onClick={() => setTab('newsletter')}
          className={`text-sm font-semibold px-4 py-2 rounded-full ${tab === 'newsletter' ? 'bg-navy text-white' : 'bg-white text-navy border border-gray-200'}`}
        >
          Newsletter ({subscribers.length})
        </button>
      </div>

      {tab === 'contact' && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setStatusFilter('all')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statusFilter === 'all' ? 'bg-navy text-white' : 'bg-white text-inkgray border border-gray-200'}`}
          >
            All
          </button>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statusFilter === s.value ? 'bg-navy text-white' : 'bg-white text-inkgray border border-gray-200'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-inkgray">Loading…</p>
      ) : tab === 'contact' ? (
        visibleEnquiries.length === 0 ? (
          <p className="text-sm text-inkgray">No enquiries yet.</p>
        ) : (
          <div className="bg-white rounded-xl2 border border-gray-100 shadow-card divide-y divide-gray-100">
            {visibleEnquiries.map((e) => (
              <div key={e.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-navy">
                      {e.name} <span className="font-normal text-inkgray">— {e.email}</span>
                    </p>
                    {e.company && <p className="text-xs text-inkgray">{e.company}</p>}
                    <p className="text-sm text-inkgray mt-2 whitespace-pre-wrap">{e.message}</p>
                    <p className="text-xs text-inkgray mt-2">
                      {e.source} · {new Date(e.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <select
                      value={e.status || 'new'}
                      onChange={(ev) => updateStatus(e.id, ev.target.value)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 ${
                        STATUS_OPTIONS.find((s) => s.value === (e.status || 'new'))?.className
                      }`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <button onClick={() => deleteEnquiry(e.id)} className="text-xs font-semibold text-red-600 hover:text-red-700">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : subscribers.length === 0 ? (
        <p className="text-sm text-inkgray">No subscribers yet.</p>
      ) : (
        <div className="bg-white rounded-xl2 border border-gray-100 shadow-card divide-y divide-gray-100">
          {subscribers.map((s) => (
            <div key={s.id} className="px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm text-navy">{s.email}</p>
                <p className="text-xs text-inkgray">{new Date(s.created_at).toLocaleDateString()}</p>
              </div>
              <button onClick={() => deleteSubscriber(s.id)} className="text-xs font-semibold text-red-600 hover:text-red-700">
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
