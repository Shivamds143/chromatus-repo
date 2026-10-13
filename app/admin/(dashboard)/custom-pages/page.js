'use client';

import DynamicPagesManager from '@/components/admin/DynamicPagesManager';

export default function CustomPagesListPage() {
  return (
    <DynamicPagesManager
      pageType="custom"
      title="Custom Pages"
      description="Fully custom pages built from sections — go live at /pages/<url> once published, no code changes needed."
      publicPrefix="/pages"
      createLabel="+ New page"
    />
  );
}
