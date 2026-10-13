import Link from 'next/link';
import { CMS_PAGES } from '@/lib/cmsRegistry';
import { listSavedPageStatus } from '@/lib/cms';

export const dynamic = 'force-dynamic';

export default async function AdminPagesListPage({ searchParams }) {
  searchParams = await searchParams;
  const statusMap = await listSavedPageStatus();
  const activeGroup = searchParams?.group;

  const groups = CMS_PAGES.reduce((acc, p) => {
    (acc[p.group] ||= []).push(p);
    return acc;
  }, {});

  const groupEntries = Object.entries(groups).filter(
    ([group]) => !activeGroup || group === activeGroup
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-1">
        {activeGroup ? `Website — ${activeGroup}` : 'Pages & Sections'}
      </h1>
      <p className="text-sm text-inkgray mb-2">
        Edit text, buttons, and images on any page. Changes only go live once you publish them.
      </p>
      {activeGroup && (
        <Link href="/admin/pages" className="text-xs text-brandblue font-semibold">
          ← View all website pages
        </Link>
      )}

      <div className="space-y-8 mt-6">
        {groupEntries.map(([group, pages]) => (
          <div key={group}>
            <h2 className="text-sm font-bold text-navy uppercase tracking-wide mb-3">{group}</h2>
            <div className="bg-white rounded-xl2 border border-gray-100 shadow-card divide-y divide-gray-100">
              {pages.map((p) => {
                const status = statusMap[p.key];
                return (
                  <Link
                    key={p.key}
                    href={`/admin/pages/${p.key}`}
                    className="flex items-center justify-between px-5 py-4 hover:bg-bglight transition"
                  >
                    <div>
                      <p className="text-sm font-medium text-navy">{p.label}</p>
                      <p className="text-xs text-inkgray">{p.route}</p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        status?.isPublished
                          ? 'bg-green-100 text-green-700'
                          : status
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {status?.isPublished ? 'Published' : status ? 'Draft' : 'Default'}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
