import Link from 'next/link';
import { CMS_PAGES } from '@/lib/cmsRegistry';
import { listSavedPageStatus } from '@/lib/cms';
import { getAllArticlesAdmin } from '@/lib/insights';
import { listMedia } from '@/lib/media';
import { getAllEnquiries } from '@/lib/leads';
import { listAllTestimonials } from '@/lib/testimonials';
import { listAllFaqs } from '@/lib/faqs';
import { listCustomPages } from '@/lib/customPages';
import { getAllJobsAdmin } from '@/lib/jobs';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [statusMap, articles, media, enquiries, testimonials, faqs, customPages, jobs] = await Promise.all([
    listSavedPageStatus(),
    getAllArticlesAdmin(),
    listMedia(),
    getAllEnquiries(),
    listAllTestimonials(),
    listAllFaqs(),
    listCustomPages(),
    getAllJobsAdmin()
  ]);

  const publishedPages = Object.values(statusMap).filter((s) => s.isPublished).length;
  const openEnquiries = enquiries.filter((e) => (e.status || 'new') !== 'closed' && (e.status || 'new') !== 'resolved').length;

  const cards = [
    { label: 'Editable pages', value: `${publishedPages} / ${CMS_PAGES.length}`, sub: 'published with custom content', href: '/admin/pages' },
    { label: 'Custom pages', value: customPages.length, sub: `${customPages.filter((p) => p.is_published).length} published`, href: '/admin/custom-pages' },
    { label: 'Insights articles', value: articles.length, sub: `${articles.filter((a) => a.is_published).length} published`, href: '/admin/insights' },
    { label: 'Job openings', value: jobs.length, sub: `${jobs.filter((j) => j.is_active).length} published`, href: '/admin/careers' },
    { label: 'Testimonials', value: testimonials.length, sub: `${testimonials.filter((t) => t.is_published).length} published`, href: '/admin/testimonials' },
    { label: 'FAQs', value: faqs.length, sub: `${faqs.filter((f) => f.is_published).length} published`, href: '/admin/faqs' },
    { label: 'Media files', value: media.length, sub: 'in the library', href: '/admin/media' },
    { label: 'Enquiries', value: enquiries.length, sub: `${openEnquiries} open`, href: '/admin/enquiries' }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-1">Dashboard</h1>
      <p className="text-sm text-inkgray mb-8">A quick overview of your site content.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="block bg-white rounded-xl2 border border-gray-100 shadow-card p-5 hover:border-brandblue transition"
          >
            <p className="text-xs font-semibold text-inkgray uppercase tracking-wide">{c.label}</p>
            <p className="text-3xl font-bold text-navy mt-2">{c.value}</p>
            <p className="text-xs text-inkgray mt-1">{c.sub}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 bg-white rounded-xl2 border border-gray-100 shadow-card p-6">
        <h2 className="text-lg font-semibold text-navy mb-3">Recent enquiries</h2>
        {enquiries.length === 0 ? (
          <p className="text-sm text-inkgray">No enquiries yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {enquiries.slice(0, 5).map((e) => (
              <li key={e.id} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-navy">{e.name} — {e.email}</p>
                  <p className="text-inkgray line-clamp-1">{e.message}</p>
                </div>
                <span className="text-xs text-inkgray whitespace-nowrap ml-4">
                  {new Date(e.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
