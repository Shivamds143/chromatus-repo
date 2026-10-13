import { getAdminSession } from '@/lib/requireAdmin';
import { isPreviewActive } from '@/lib/preview';
import ExitPreviewButton from './ExitPreviewButton';

export default async function PreviewBanner() {
  const session = await getAdminSession();
  if (!session || !(await isPreviewActive())) return null;

  return (
    <div className="sticky top-0 z-[60] bg-brandorange text-white text-sm font-semibold px-4 py-2 flex items-center justify-center gap-4">
      <span>Draft preview mode — you&rsquo;re viewing unpublished changes.</span>
      <ExitPreviewButton />
    </div>
  );
}
