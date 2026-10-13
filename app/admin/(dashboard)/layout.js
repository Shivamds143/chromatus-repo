import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/requireAdmin';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminDashboardLayout({ children }) {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-bglight">
      <AdminSidebar username={session.username} />
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-10 max-w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
