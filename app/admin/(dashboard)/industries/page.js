'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DynamicPagesManager from '@/components/admin/DynamicPagesManager';

const CORE_INDUSTRIES = [
  { key: 'healthcare', title: 'Healthcare', route: '/industries/healthcare' },
  { key: 'automotiveTransportation', title: 'Automotive & Transportation', route: '/industries/automotive-transportation' },
  { key: 'foodBeverages', title: 'Food & Beverages', route: '/industries/food-beverages' },
  { key: 'telecomIt', title: 'Telecom & IT', route: '/industries/telecom-it' },
  { key: 'aerospaceDefense', title: 'Aerospace & Defense', route: '/industries/aerospace-defense' },
  { key: 'semiconductorsElectronics', title: 'Semiconductors & Electronics', route: '/industries/semiconductors-electronics' },
  { key: 'energyPower', title: 'Energy & Power', route: '/industries/energy-power' },
  { key: 'chemicalsMaterials', title: 'Chemicals & Materials', route: '/industries/chemicals-materials' },
  { key: 'beyondTheseEight', title: 'Beyond These Eight', route: '/industries/beyond-these-eight' },
];

export default function AdminIndustriesPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [statusMap, setStatusMap] = useState({});

  // --- Industries section visibility toggle ---
  const [industriesEnabled, setIndustriesEnabled] = useState(true);
  const [loadingVisibility, setLoadingVisibility] = useState(true);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [visibilityMsg, setVisibilityMsg] = useState('');
  const [visibilityError, setVisibilityError] = useState(false);

  useEffect(() => {
    // Load section visibility
    fetch('/api/admin/section-visibility')
      .then((res) => res.json())
      .then((json) => {
        if (typeof json?.industriesEnabled === 'boolean') {
          setIndustriesEnabled(json.industriesEnabled);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingVisibility(false));

    // Load page status map
    fetch('/api/admin/system-status')
      .then((res) => res.json())
      .then((json) => {
        if (json?.statusMap) setStatusMap(json.statusMap);
      })
      .catch(() => {});
  }, []);

  async function handleToggleVisibility(newValue) {
    setSavingVisibility(true);
    setVisibilityMsg('');
    // Optimistic update
    setIndustriesEnabled(newValue);
    try {
      const res = await fetch('/api/admin/section-visibility', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industriesEnabled: newValue }),
      });
      const json = await res.json();
      if (!res.ok) {
        // Revert on error
        setIndustriesEnabled(!newValue);
        setVisibilityError(true);
        setVisibilityMsg(json.error || 'Failed to save. Please try again.');
      } else {
        setVisibilityError(false);
        setVisibilityMsg(newValue ? 'Industries section is now visible on the website.' : 'Industries section is now hidden from the website.');
        setTimeout(() => setVisibilityMsg(''), 4000);
      }
    } catch {
      setIndustriesEnabled(!newValue);
      setVisibilityError(true);
      setVisibilityMsg('Network error. Please try again.');
    } finally {
      setSavingVisibility(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Industries Management</h1>
          <p className="text-sm text-inkgray mt-1">
            Manage industry verticals, overview page, cards, and specialized industry content.
          </p>
        </div>
        <Link
          href="/industries"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-brandblue hover:underline self-start sm:self-center"
        >
          View live /industries page ↗
        </Link>
      </div>

      {/* ── Section Visibility Toggle ─────────────────────────────── */}
      <div className={`rounded-xl border-2 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
        industriesEnabled
          ? 'border-green-200 bg-green-50'
          : 'border-amber-200 bg-amber-50'
      }`}>
        <div className="flex items-start gap-3">
          {/* Status dot */}
          <span className={`mt-1 flex h-2.5 w-2.5 rounded-full shrink-0 ${industriesEnabled ? 'bg-green-500' : 'bg-amber-400'}`} />
          <div>
            <p className="text-sm font-bold text-navy">
              Industries Section Visibility
            </p>
            <p className="text-xs text-inkgray mt-0.5">
              {loadingVisibility
                ? 'Loading…'
                : industriesEnabled
                ? 'Currently visible on the website. Toggle off to hide /industries and all sub-pages from visitors and the navigation.'
                : 'Currently hidden from the website. The /industries route returns 404 and the nav link is removed for all visitors.'}
            </p>
            {visibilityMsg && (
              <p className={`text-xs mt-1.5 font-medium ${visibilityError ? 'text-red-600' : 'text-green-700'}`}>
                {visibilityMsg}
              </p>
            )}
          </div>
        </div>

        {/* Toggle switch */}
        <button
          id="industries-visibility-toggle"
          role="switch"
          aria-checked={industriesEnabled}
          disabled={loadingVisibility || savingVisibility}
          onClick={() => handleToggleVisibility(!industriesEnabled)}
          className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brandblue disabled:opacity-60 disabled:cursor-not-allowed ${
            industriesEnabled ? 'bg-green-500' : 'bg-gray-300'
          }`}
        >
          <span className="sr-only">{industriesEnabled ? 'Disable industries section' : 'Enable industries section'}</span>
          <span
            className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out ${
              industriesEnabled ? 'translate-x-7' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Overview Hub Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-brandblue block mb-1">
            Main Hub Page
          </span>
          <h2 className="text-base font-bold text-navy">Industries Overview Page</h2>
          <p className="text-xs text-inkgray mt-1">
            Edit the headline, eyebrow, intro paragraph, and card cards shown on /industries.
          </p>
        </div>
        <Link
          href="/admin/pages/industriesOverview"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy hover:bg-navy-light text-white rounded-lg text-xs font-semibold shadow-2xs transition shrink-0"
        >
          <span>Edit Overview Page</span>
          <span>→</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-xs font-bold transition border-b-2 ${
            activeTab === 'all'
              ? 'border-brandorange text-navy font-semibold'
              : 'border-transparent text-inkgray hover:text-navy'
          }`}
        >
          Core Industry Verticals ({CORE_INDUSTRIES.length})
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`px-4 py-2 text-xs font-bold transition border-b-2 ${
            activeTab === 'custom'
              ? 'border-brandorange text-navy font-semibold'
              : 'border-transparent text-inkgray hover:text-navy'
          }`}
        >
          Custom Dynamic Industries
        </button>
      </div>

      {activeTab === 'all' && (
        <div className="space-y-4">
          <p className="text-xs text-inkgray">
            Click any core industry to customize its headline, description, research methodologies, and content.
          </p>
          <div className="bg-white rounded-xl border border-gray-100 shadow-card divide-y divide-gray-100 overflow-hidden">
            {CORE_INDUSTRIES.map((ind) => {
              const status = statusMap[ind.key];
              return (
                <div
                  key={ind.key}
                  className="p-4 sm:px-5 sm:py-4 flex items-center justify-between gap-4 hover:bg-bglight transition"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-navy truncate">{ind.title}</p>
                    <p className="text-xs text-inkgray mt-0.5">{ind.route}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        status?.isPublished
                          ? 'bg-green-100 text-green-700'
                          : status
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {status?.isPublished ? 'Published' : status ? 'Draft' : 'Default'}
                    </span>
                    <Link
                      href={`/admin/pages/${ind.key}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-brandblue hover:text-white text-navy transition"
                    >
                      Edit Content
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'custom' && (
        <DynamicPagesManager
          pageType="industry"
          title="Custom Industry Pages"
          description="Build entirely new industry landing pages with custom sections. Published industry pages appear in the live navigation and overview grid."
          publicPrefix="/industries"
          createLabel="+ New custom industry"
        />
      )}
    </div>
  );
}

