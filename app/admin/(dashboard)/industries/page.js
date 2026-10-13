'use client';

import Link from 'next/link';
import DynamicPagesManager from '@/components/admin/DynamicPagesManager';

export default function AdminIndustriesPage() {
  return (
    <div>
      <DynamicPagesManager
        pageType="industry"
        title="Industries"
        description="Add brand-new industry pages that go live at /industries/<url>. The six core industry pages (Healthcare, Energy & Power, etc.) are edited from Website → Industries."
        publicPrefix="/industries"
        createLabel="+ New industry page"
      />
      <p className="text-xs text-inkgray mt-6 max-w-3xl">
        To feature a new industry on the main Industries grid, add a card for it from{' '}
        <Link href="/admin/pages/industriesOverview" className="text-brandblue font-semibold">
          Website → Industries (Overview)
        </Link>{' '}
        pointing to its <code className="bg-gray-100 px-1 rounded">/industries/&lt;slug&gt;</code> URL.
      </p>
    </div>
  );
}
