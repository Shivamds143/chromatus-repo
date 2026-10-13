'use client';

import Link from 'next/link';
import DynamicPagesManager from '@/components/admin/DynamicPagesManager';

export default function AdminServicesPage() {
  return (
    <div>
      <DynamicPagesManager
        pageType="service"
        title="Services"
        description="Add brand-new service pages that go live at /services/<url>. The six core service pages (Market Assessment, New Product Launch, etc.) are edited from Website → Services."
        publicPrefix="/services"
        createLabel="+ New service page"
      />
      <p className="text-xs text-inkgray mt-6 max-w-3xl">
        To feature a new service on the main Services grid, add a card for it from{' '}
        <Link href="/admin/pages/servicesOverview" className="text-brandblue font-semibold">
          Website → Services (Overview)
        </Link>{' '}
        pointing to its <code className="bg-gray-100 px-1 rounded">/services/&lt;slug&gt;</code> URL.
      </p>
    </div>
  );
}
