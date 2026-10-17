import Link from 'next/link';
import { CMS_PAGES } from '@/lib/cmsRegistry';
import { listSavedPageStatus } from '@/lib/cms';
import { getAllArticlesAdmin } from '@/lib/insights';
import { listMedia } from '@/lib/media';
import { getAllEnquiries } from '@/lib/leads';
import { listAllTestimonials } from '@/lib/testimonials';
import { listAllClients } from '@/lib/clients';
import { listAllFaqs } from '@/lib/faqs';
import { listCustomPages } from '@/lib/customPages';
import { getAllJobsAdmin } from '@/lib/jobs';
import { checkMongoStatus } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

const STATUS_BADGE = {
  new: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
};

export default async function AdminDashboardPage() {
  const [
    statusMap,
    articles,
    media,
    enquiries,
    testimonials,
    clients,
    faqs,
    customPages,
    jobs,
    dbStatus
  ] = await Promise.all([
    listSavedPageStatus().catch(() => ({})),
    getAllArticlesAdmin().catch(() => []),
    listMedia().catch(() => []),
    getAllEnquiries().catch(() => []),
    listAllTestimonials().catch(() => []),
    listAllClients().catch(() => []),
    listAllFaqs().catch(() => []),
    listCustomPages().catch(() => []),
    getAllJobsAdmin().catch(() => []),
    checkMongoStatus().catch(() => ({ connected: false, databaseName: 'chromatus_db' }))
  ]);

  const publishedPages = Object.values(statusMap).filter((s) => s?.isPublished).length;
  const openEnquiries = enquiries.filter((e) => (e.status || 'new') !== 'closed' && (e.status || 'new') !== 'resolved').length;
  const publishedArticles = articles.filter((a) => a.is_published).length;
  const activeJobs = jobs.filter((j) => j.is_active).length;
  const publishedClients = clients.filter((c) => c.is_published).length;
  const publishedTestimonials = testimonials.filter((t) => t.is_published).length;

  const statCards = [
    {
      label: 'Core Pages',
      value: `${publishedPages} / ${CMS_PAGES.length}`,
      sub: 'published with custom content',
      href: '/admin/pages',
      icon: '🌐',
      color: 'border-l-4 border-l-brandblue'
    },
    {
      label: 'Insights & Blog',
      value: articles.length,
      sub: `${publishedArticles} live on public site`,
      href: '/admin/insights',
      icon: '📰',
      color: 'border-l-4 border-l-brandorange'
    },
    {
      label: 'Job Openings',
      value: jobs.length,
      sub: `${activeJobs} currently accepting applications`,
      href: '/admin/careers',
      icon: '💼',
      color: 'border-l-4 border-l-emerald-500'
    },
    {
      label: 'Client Logos',
      value: clients.length,
      sub: `${publishedClients} active in homepage marquee`,
      href: '/admin/clients',
      icon: '🏢',
      color: 'border-l-4 border-l-indigo-600'
    },
    {
      label: 'Testimonials',
      value: testimonials.length,
      sub: `${publishedTestimonials} published quotes`,
      href: '/admin/testimonials',
      icon: '💬',
      color: 'border-l-4 border-l-amber-500'
    },
    {
      label: 'FAQs',
      value: faqs.length,
      sub: `${faqs.filter((f) => f.is_published).length} public answers`,
      href: '/admin/faqs',
      icon: '❓',
      color: 'border-l-4 border-l-sky-500'
    },
    {
      label: 'Media Files',
      value: media.length,
      sub: 'stored in media library',
      href: '/admin/media',
      icon: '🖼️',
      color: 'border-l-4 border-l-purple-500'
    },
    {
      label: 'Customer Enquiries',
      value: enquiries.length,
      sub: `${openEnquiries} requiring attention`,
      href: '/admin/enquiries',
      icon: '✉️',
      color: openEnquiries > 0 ? 'border-l-4 border-l-rose-500' : 'border-l-4 border-l-gray-300'
    }
  ];

  const quickActions = [
    { label: 'Edit Homepage', href: '/admin/pages/home', icon: '🏠', desc: 'Hero, stats & copy' },
    { label: 'Manage Services', href: '/admin/services', icon: '🧩', desc: 'Core & custom pages' },
    { label: 'Manage Industries', href: '/admin/industries', icon: '🏭', desc: 'Core & custom verticals' },
    { label: 'New Article', href: '/admin/insights/new', icon: '✍️', desc: 'Blog or whitepaper' },
    { label: 'Post Job Opening', href: '/admin/careers', icon: '💼', desc: 'Recruit new talent' },
    { label: 'Theme & Footer', href: '/admin/theme-branding', icon: '🎨', desc: 'Branding & contacts' },
    { label: 'Upload Images', href: '/admin/media', icon: '📤', desc: 'Add media files' },
    { label: 'SEO & Meta Tags', href: '/admin/seo', icon: '🔍', desc: 'Search optimization' }
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner & DB Status */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-navy tracking-tight">CMS Command Center</h1>
          <p className="text-sm text-inkgray mt-1">
            Manage, publish, and monitor all website content for Chromatus Consulting.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-gray-200 shadow-2xs">
            <span
              className={`w-2.5 h-2.5 rounded-full ${dbStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}
            />
            <span className="text-xs font-medium text-navy">
              {dbStatus.connected ? 'MongoDB Atlas Live' : 'Storage Active'}
            </span>
          </div>

          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-navy hover:bg-navy-light text-white text-xs font-semibold shadow-2xs transition"
          >
            <span>Preview Site</span>
            <span>↗</span>
          </Link>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-xs font-bold text-inkgray uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {quickActions.map((qa) => (
            <Link
              key={qa.label}
              href={qa.href}
              className="flex flex-col items-center text-center p-3.5 bg-white rounded-xl border border-gray-100 shadow-2xs hover:border-brandblue hover:shadow-xs transition group"
            >
              <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">{qa.icon}</span>
              <span className="text-xs font-bold text-navy group-hover:text-brandblue transition">{qa.label}</span>
              <span className="text-[10px] text-inkgray mt-0.5 line-clamp-1">{qa.desc}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Content Statistics Grid */}
      <div>
        <h2 className="text-xs font-bold text-inkgray uppercase tracking-wider mb-3">Website Content Overview</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className={`bg-white rounded-xl border border-gray-100 shadow-card p-5 hover:border-brandblue hover:shadow-md transition ${c.color}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-inkgray uppercase tracking-wider">{c.label}</p>
                <span className="text-xl" aria-hidden>{c.icon}</span>
              </div>
              <p className="text-3xl font-extrabold text-navy mt-2.5">{c.value}</p>
              <p className="text-xs text-inkgray mt-1">{c.sub}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Split Section: Recent Enquiries & Active Management */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Enquiries (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl2 border border-gray-100 shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-navy">Recent Inquiries &amp; Leads</h2>
              <p className="text-xs text-inkgray mt-0.5">Submissions from public contact &amp; project inquiry forms.</p>
            </div>
            <Link
              href="/admin/enquiries"
              className="text-xs font-semibold text-brandblue hover:text-brandblue-dark"
            >
              View all ({enquiries.length}) →
            </Link>
          </div>

          {enquiries.length === 0 ? (
            <div className="py-10 text-center text-sm text-inkgray">
              No inquiries received yet. When visitors fill out contact forms, they will show here.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {enquiries.slice(0, 5).map((e) => {
                const status = e.status || 'new';
                const badgeClass = STATUS_BADGE[status] || STATUS_BADGE.new;
                return (
                  <div key={e.id} className="py-3.5 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-navy truncate">{e.name}</p>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeClass}`}>
                          {status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 text-xs text-inkgray mt-0.5">
                        <span className="truncate">{e.email}</span>
                        {e.phone && (
                          <>
                            <span className="text-gray-300">·</span>
                            <span className="font-semibold text-brandblue whitespace-nowrap">📞 {e.phone}</span>
                          </>
                        )}
                        {e.company && (
                          <>
                            <span className="text-gray-300">·</span>
                            <span className="text-slate truncate">{e.company}</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-slate mt-1 line-clamp-1">{e.message}</p>
                    </div>
                    <span className="text-[11px] text-inkgray shrink-0 font-mono">
                      {new Date(e.created_at).toLocaleDateString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* System & Content Status Info (1 col) */}
        <div className="bg-white rounded-xl2 border border-gray-100 shadow-card p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-navy mb-1">Content Synchronization</h2>
            <p className="text-xs text-inkgray mb-4">
              All admin operations are synced to MongoDB and cached Next.js routes.
            </p>

            <ul className="space-y-3 text-xs">
              <li className="flex items-center justify-between p-2.5 rounded-lg bg-bglight border border-gray-100">
                <span className="font-medium text-navy">Connected Database</span>
                <span className="font-mono text-[11px] text-brandblue">{dbStatus.databaseName}</span>
              </li>
              <li className="flex items-center justify-between p-2.5 rounded-lg bg-bglight border border-gray-100">
                <span className="font-medium text-navy">Custom Page Builder</span>
                <span className="font-semibold text-emerald-600">{customPages.length} pages created</span>
              </li>
              <li className="flex items-center justify-between p-2.5 rounded-lg bg-bglight border border-gray-100">
                <span className="font-medium text-navy">Public Navigation</span>
                <span className="font-semibold text-emerald-600">Dynamic &amp; Synchronized</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <Link
              href="/admin/theme-branding"
              className="block w-full py-2.5 px-4 text-center text-xs font-semibold rounded-lg bg-bglight hover:bg-gray-100 text-navy border border-gray-200 transition"
            >
              Configure Global Theme, Logo &amp; Footer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
