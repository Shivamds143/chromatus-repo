'use client';

import Link from 'next/link';
import DynamicPagesManager from '@/components/admin/DynamicPagesManager';

export default function AdminServicesPage() {
  return (
    <div>
      <DynamicPagesManager
        pageType="service"
        title="Services"
        description="Add brand-new service pages that go live at /services/<url>. Published service pages automatically appear on the main website Services overview, navigation dropdown, and homepage grid."
        publicPrefix="/services"
        createLabel="+ New service page"
      />
      <p className="text-xs text-inkgray mt-6 max-w-3xl">
        Published services automatically appear across the website. You can also customize card icons, colors, or order from{' '}
        <Link href="/admin/pages/servicesOverview" className="text-brandblue font-semibold">
          Website → Services (Overview)
        </Link>.
      </p>
    </div>
  );
}
