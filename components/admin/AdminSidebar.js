'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const NAV_GROUPS = [
  {
    title: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard', icon: '🏠' }
    ]
  },
  {
    title: 'Website & Content',
    items: [
      { href: '/admin/pages', label: 'Pages & Sections', icon: '🌐' },
      { href: '/admin/services', label: 'Services', icon: '🧩' },
      { href: '/admin/industries', label: 'Industries', icon: '🏭' },
      { href: '/admin/insights', label: 'Insights & Blog', icon: '📰' },
      { href: '/admin/careers', label: 'Careers & Jobs', icon: '💼' },
      { href: '/admin/custom-pages', label: 'Custom Pages', icon: '📄' }
    ]
  },
  {
    title: 'Showcase & Media',
    items: [
      { href: '/admin/clients', label: 'Client Logos', icon: '🏢' },
      { href: '/admin/testimonials', label: 'Testimonials', icon: '💬' },
      { href: '/admin/faqs', label: 'FAQs', icon: '❓' },
      { href: '/admin/media', label: 'Media Library', icon: '🖼️' }
    ]
  },
  {
    title: 'Communication',
    items: [
      { href: '/admin/enquiries', label: 'Enquiries & Leads', icon: '✉️' },
      { href: '/admin/careers/applications', label: 'Job Applications', icon: '📋' }
    ]
  },
  {
    title: 'Site Configuration',
    items: [
      { href: '/admin/theme-branding', label: 'Theme, Header & Footer', icon: '🎨' },
      { href: '/admin/seo', label: 'SEO & Metadata', icon: '🔍' },
      { href: '/admin/redirects', label: 'Redirects', icon: '↪️' },
      { href: '/admin/cookie-privacy', label: 'Cookie & Privacy', icon: '🍪' },
      { href: '/admin/settings', label: 'Account & Security', icon: '⚙️' }
    ]
  }
];

function SidebarToggleIcon({ collapsed }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 transition-transform duration-200"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      {collapsed ? (
        <polyline points="13 10 16 12 13 14" />
      ) : (
        <polyline points="15 10 12 12 15 14" />
      )}
    </svg>
  );
}

export default function AdminSidebar({ username }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Restore collapsed preference from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('admin_sidebar_collapsed');
      if (saved !== null) {
        setCollapsed(saved === 'true');
      }
    } catch {}
  }, []);

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, searchParams]);

  // Lock body scroll on mobile when drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('admin_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  function isActive(href) {
    if (href === '/admin') return pathname === '/admin';
    const path = typeof href === 'object' ? href.pathname : href.split('?')[0];
    return pathname === path || (path !== '/admin' && pathname.startsWith(`${path}/`));
  }

  const renderSidebarContent = (isCollapsed) => (
    <>
      {/* Brand Header */}
      {isCollapsed ? (
        <div className="px-2 py-4 border-b border-white/10 flex items-center justify-center shrink-0 bg-navy h-16">
          <button
            type="button"
            onClick={toggleCollapsed}
            title="Expand sidebar"
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white/75 hover:text-white hover:bg-white/10 transition"
            aria-label="Expand sidebar"
          >
            <SidebarToggleIcon collapsed={true} />
          </button>
        </div>
      ) : (
        <div className="px-4 py-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-navy h-16">
          <div className="overflow-hidden">
            <span className="text-[11px] font-bold tracking-[0.22em] text-brandorange block leading-none">
              CHROMATUS
            </span>
            <p className="text-sm font-semibold text-white/95 mt-1 truncate">Management CMS</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleCollapsed}
              title="Collapse sidebar"
              className="hidden md:flex w-8 h-8 rounded-lg items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition"
              aria-label="Collapse sidebar"
            >
              <SidebarToggleIcon collapsed={false} />
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Nav Groups */}
      <nav className={`flex-1 ${isCollapsed ? 'px-2 py-3 space-y-3' : 'px-3 py-4 space-y-5'} overflow-y-auto custom-scrollbar`}>
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            {isCollapsed ? (
              <div className="my-2 border-t border-white/10 mx-1" title={group.title} />
            ) : (
              <p className="px-3 text-[10px] font-bold tracking-wider uppercase text-white/45 mb-1.5">
                {group.title}
              </p>
            )}
            <div className={isCollapsed ? 'space-y-1.5' : 'space-y-0.5'}>
              {group.items.map((item) => {
                const active = isActive(item.href);

                if (isCollapsed) {
                  return (
                    <div key={item.href} className="relative group flex items-center justify-center">
                      <Link
                        href={item.href}
                        title={item.label}
                        className={`flex items-center justify-center rounded-lg w-10 h-10 transition duration-150 ${
                          active
                            ? 'bg-brandblue text-white font-semibold shadow-xs'
                            : 'text-white/75 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span className="text-base leading-none shrink-0" aria-hidden>{item.icon}</span>
                      </Link>
                      {/* Floating tooltip */}
                      <div className="pointer-events-none absolute left-full ml-2 z-50 hidden md:group-hover:flex items-center">
                        <div className="bg-[#071d2b] text-white text-xs font-semibold px-2.5 py-1.5 rounded-md shadow-xl border border-white/15 whitespace-nowrap">
                          {item.label}
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition duration-150 ${
                      active
                        ? 'bg-brandblue text-white font-semibold shadow-xs'
                        : 'text-white/75 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="text-base shrink-0 leading-none" aria-hidden>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer User Info */}
      {isCollapsed ? (
        <div className="p-2 border-t border-white/10 bg-black/20 shrink-0 flex flex-col items-center gap-2">
          <div className="relative group flex items-center justify-center">
            <div
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white relative cursor-default"
              title={`User: ${username}`}
            >
              {username ? String(username).charAt(0).toUpperCase() : 'A'}
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute bottom-0 right-0 border border-navy" title="Connected" />
            </div>
            <div className="pointer-events-none absolute left-full ml-2 z-50 hidden md:group-hover:flex items-center">
              <div className="bg-[#071d2b] text-white text-xs font-semibold px-2.5 py-1.5 rounded-md shadow-xl border border-white/15 whitespace-nowrap">
                User: {username}
              </div>
            </div>
          </div>

          <div className="relative group flex items-center justify-center">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              title="Live Site ↗"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition text-sm"
            >
              ↗
            </Link>
            <div className="pointer-events-none absolute left-full ml-2 z-50 hidden md:group-hover:flex items-center">
              <div className="bg-[#071d2b] text-white text-xs font-semibold px-2.5 py-1.5 rounded-md shadow-xl border border-white/15 whitespace-nowrap">
                Live Site ↗
              </div>
            </div>
          </div>

          <div className="relative group flex items-center justify-center">
            <button
              type="button"
              onClick={handleLogout}
              title="Sign out"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-brandorange hover:text-brandorange-light hover:bg-white/10 transition text-sm font-semibold"
            >
              ⏻
            </button>
            <div className="pointer-events-none absolute left-full ml-2 z-50 hidden md:group-hover:flex items-center">
              <div className="bg-[#071d2b] text-white text-xs font-semibold px-2.5 py-1.5 rounded-md shadow-xl border border-white/15 whitespace-nowrap">
                Sign out
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-5 py-3.5 border-t border-white/10 bg-black/20 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-white/70 truncate font-mono">
              User: <span className="font-semibold text-white">{username}</span>
            </p>
            <span className="w-2 h-2 rounded-full bg-emerald-400" title="Connected" />
          </div>
          <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/5">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/70 hover:text-white flex items-center gap-1 transition"
            >
              <span>Live Site</span>
              <span className="text-[10px]">↗</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs font-semibold text-brandorange hover:text-brandorange-light transition"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile Top Navigation Bar */}
      <header className="md:hidden sticky top-0 z-30 bg-navy text-white px-4 py-3 flex items-center justify-between border-b border-white/10 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/10 text-white hover:bg-white/20 active:scale-95 transition"
            aria-label="Open navigation menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <span className="text-[10px] font-bold tracking-widest text-brandorange block leading-none">CHROMATUS</span>
            <span className="text-xs font-semibold text-white/90">CMS Admin</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/70 hover:text-white bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-lg transition"
          >
            Site ↗
          </Link>
          <button
            onClick={handleLogout}
            className="text-xs font-semibold text-brandorange hover:text-white px-2 py-1.5 transition"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-navy text-white flex flex-col shadow-2xl md:hidden transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* Desktop Persistent Sidebar with smooth collapse/expand transition */}
      <aside
        className={`hidden md:flex shrink-0 bg-navy text-white flex-col h-screen sticky top-0 border-r border-white/10 shadow-sm transition-[width] duration-300 ease-in-out z-20 ${
          collapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        {renderSidebarContent(collapsed)}
      </aside>
    </>
  );
}
