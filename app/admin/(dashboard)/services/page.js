'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DynamicPagesManager from '@/components/admin/DynamicPagesManager';

const CORE_SERVICES = [
  { key: 'consumerBehaviour', title: 'Consumer Behaviour', route: '/services/consumer-behaviour' },
  { key: 'brandManagement', title: 'Brand Management', route: '/services/brand-management' },
  { key: 'newProductLaunch', title: 'New Product Launch', route: '/services/new-product-launch' },
  { key: 'satisfactionStudies', title: 'Satisfaction Studies', route: '/services/satisfaction-studies' },
  { key: 'priceBenchmarking', title: 'Price Benchmarking', route: '/services/price-benchmarking' },
  { key: 'locationFeasibilityStudy', title: 'Location Feasibility Study', route: '/services/location-feasibility-study' },
  { key: 'baselineEndlineStudy', title: 'Baseline & Endline Study', route: '/services/baseline-endline-study' },
  { key: 'marketAssessment', title: 'Market Assessment', route: '/services/market-assessment' },
  { key: 'governmentSurveys', title: 'Government Surveys', route: '/services/government-surveys' },
];

export default function AdminServicesPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [statusMap, setStatusMap] = useState({});

  useEffect(() => {
    fetch('/api/admin/system-status')
      .then((res) => res.json())
      .then((json) => {
        if (json?.statusMap) setStatusMap(json.statusMap);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-4xl space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Services Management</h1>
          <p className="text-sm text-inkgray mt-1">
            Manage your service portfolio, overview page, cards, and individual service offerings.
          </p>
        </div>
        <Link
          href="/services"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-brandblue hover:underline self-start sm:self-center"
        >
          View live /services page ↗
        </Link>
      </div>

      {/* Overview Hub Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-brandblue block mb-1">
            Main Hub Page
          </span>
          <h2 className="text-base font-bold text-navy">Services Overview Page</h2>
          <p className="text-xs text-inkgray mt-1">
            Edit the headline, eyebrow, intro paragraph, and card icons/colors shown on /services.
          </p>
        </div>
        <Link
          href="/admin/pages/servicesOverview"
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
          Core Service Offerings ({CORE_SERVICES.length})
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`px-4 py-2 text-xs font-bold transition border-b-2 ${
            activeTab === 'custom'
              ? 'border-brandorange text-navy font-semibold'
              : 'border-transparent text-inkgray hover:text-navy'
          }`}
        >
          Custom Dynamic Services
        </button>
      </div>

      {activeTab === 'all' && (
        <div className="space-y-4">
          <p className="text-xs text-inkgray">
            Click any core service to customize its headline, description, research methodologies, and content.
          </p>
          <div className="bg-white rounded-xl border border-gray-100 shadow-card divide-y divide-gray-100 overflow-hidden">
            {CORE_SERVICES.map((svc) => {
              const status = statusMap[svc.key];
              return (
                <div
                  key={svc.key}
                  className="p-4 sm:px-5 sm:py-4 flex items-center justify-between gap-4 hover:bg-bglight transition"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-navy truncate">{svc.title}</p>
                    <p className="text-xs text-inkgray mt-0.5">{svc.route}</p>
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
                      href={`/admin/pages/${svc.key}`}
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
          pageType="service"
          title="Custom Service Pages"
          description="Build entirely new service landing pages with custom sections. Published service pages appear in the live navigation and overview grid."
          publicPrefix="/services"
          createLabel="+ New custom service"
        />
      )}
    </div>
  );
}
