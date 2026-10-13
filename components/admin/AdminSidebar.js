'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const WEBSITE_CHILDREN = [
  { href: '/admin/pages/home', label: 'Home' },
  { href: { pathname: '/admin/pages', query: { group: 'About Us' } }, label: 'About Us' },
  { href: '/admin/pages/servicesOverview', label: 'Services' },
  { href: '/admin/pages/industriesOverview', label: 'Industries' },
  { href: '/admin/pages/insightsOverview', label: 'Insights' },
  { href: { pathname: '/admin/pages', query: { group: 'Careers' } }, label: 'Careers' },
  { href: { pathname: '/admin/pages', query: { group: 'Contact Us' } }, label: 'Contact Us' }
];

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: '🏠' },
  { href: '/admin/pages', label: 'Website', icon: '🌐', children: WEBSITE_CHILDREN },
  { href: '/admin/services', label: 'Services', icon: '🧩' },
  { href: '/admin/industries', label: 'Industries', icon: '🏭' },
  { href: '/admin/insights', label: 'Insights', icon: '📰' },
  { href: '/admin/careers', label: 'Careers', icon: '💼' },
  { href: '/admin/testimonials', label: 'Testimonials', icon: '💬' },
  { href: '/admin/faqs', label: 'FAQs', icon: '❓' },
  { href: '/admin/media', label: 'Media Library', icon: '🖼️' },
  { href: '/admin/enquiries', label: 'Enquiries', icon: '✉️' },
  { href: '/admin/theme-branding', label: 'Theme & Branding', icon: '🎨' },
  { href: '/admin/seo', label: 'SEO', icon: '🔍' },
  { href: '/admin/redirects', label: 'Redirects', icon: '↪️' },
  { href: '/admin/cookie-privacy', label: 'Cookie & Privacy', icon: '🍪' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' }
];

const WEBSITE_EXTRA_CHILD = { href: '/admin/custom-pages', label: 'Custom Pages' };

export default function AdminSidebar({ username }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(
    pathname.startsWith('/admin/pages') || pathname.startsWith('/admin/custom-pages')
  );

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

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  function isActive(href) {
    if (href === '/admin') return pathname === '/admin';
    const path = typeof href === 'object' ? href.pathname : href.split('?')[0];
    return pathname === path || pathname.startsWith(`${path}/`);
  }

  const sidebarNavContent = (
    <>
      <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-brandorange">CHROMATUS</p>
          <p className="text-sm font-semibold text-white/90">Admin CMS</p>
        </div>
        {/* Mobile close button */}
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition"
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map((item) => {
          if (!item.children) {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active ? 'bg-white/15 text-white font-semibold shadow-xs' : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-base" aria-hidden>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          }

          const parentActive = isActive(item.href) || pathname.startsWith('/admin/custom-pages');
          const children = [...item.children, WEBSITE_EXTRA_CHILD];

          return (
            <div key={item.href} className="space-y-0.5">
              <button
                type="button"
                onClick={() => setOpenMenu((v) => !v)}
                className={`w-full flex items-center justify-between gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  parentActive ? 'bg-white/15 text-white font-semibold' : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-base" aria-hidden>{item.icon}</span>
                  <span>{item.label}</span>
                </span>
                <span
                  aria-hidden
                  className={`text-xs font-bold transition-transform duration-200 ${openMenu ? 'rotate-90' : ''}`}
                >
                  ›
                </span>
              </button>

              {openMenu && (
                <div className="mt-1 ml-4 pl-3 border-l border-white/15 space-y-1">
                  {children.map((child) => {
                    const isObjHref = typeof child.href === 'object';
                    const childPath = isObjHref ? child.href.pathname : child.href;
                    const childGroup = isObjHref ? child.href.query?.group : undefined;
                    const childActive =
                      pathname === childPath && (childGroup === undefined || searchParams.get('group') === childGroup);
                    return (
                      <Link
                        key={isObjHref ? `${childPath}-${childGroup}` : childPath}
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        className={`block rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                          childActive
                            ? 'bg-white/20 text-white font-semibold'
                            : 'text-white/65 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-white/10 bg-navy/50">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-white/60 truncate font-mono">User: {username}</p>
          <span className="w-2 h-2 rounded-full bg-emerald-400" title="Online" />
        </div>
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={handleLogout}
            className="text-xs font-semibold text-brandorange hover:text-white transition"
          >
            Sign out
          </button>
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="text-xs text-white/60 hover:text-white transition"
          >
            ← View Site
          </Link>
        </div>
      </div>
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
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden animate-fade-in"
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
        {sidebarNavContent}
      </aside>

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 bg-navy text-white flex-col h-screen sticky top-0 border-r border-white/10 shadow-sm">
        {sidebarNavContent}
      </aside>
    </>
  );
}
