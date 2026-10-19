"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Container from "./Container";
import LogoMark from "./LogoMark";
import SearchToggle from "./SearchToggle";
import { aboutSection, servicesSection, industriesSection, insightsSection } from "@/lib/content";
import { settingsToCssVars } from "@/lib/themeUtils";

const navLinkClass =
  "relative text-sm font-medium text-paper/75 transition hover:text-paper after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-signal after:transition-all after:duration-300 hover:after:w-full";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const [liveAbout, setLiveAbout] = useState<any[]>([
    { slug: "about-overview", title: "About Overview", href: "/about" },
    ...aboutSection.items
  ]);
  const [liveServices, setLiveServices] = useState<any[]>([
    { slug: "services-overview", title: "Services Overview", href: "/services" },
    ...servicesSection.items
  ]);
  const [liveIndustries, setLiveIndustries] = useState<any[]>(industriesSection.items);
  const [industriesEnabled, setIndustriesEnabled] = useState(true);
  const [headerCta, setHeaderCta] = useState({ label: "Chromatus Pro", href: "/contact#contact-form" });
  const [siteInfo, setSiteInfo] = useState({ siteName: "CHROMATUS", logoUrl: "" });

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/about").then((res) => res.json()).catch(() => null),
      fetch("/api/services").then((res) => res.json()).catch(() => null),
      fetch("/api/industries").then((res) => res.json()).catch(() => null),
      fetch("/api/global-elements").then((res) => res.json()).catch(() => null)
    ]).then(([aboutData, servicesData, industriesData, globalData]) => {
      if (cancelled) return;
      if (Array.isArray(aboutData?.items) && aboutData.items.length > 0) {
        setLiveAbout(aboutData.items);
      }
      if (Array.isArray(servicesData?.items) && servicesData.items.length > 0) {
        setLiveServices([
          { slug: "services-overview", title: "Services Overview", href: "/services" },
          ...servicesData.items.map((it: any) => ({
            slug: it.slug,
            title: it.title,
            summary: it.summary,
            href: it.href,
          }))
        ]);
      }
      if (Array.isArray(industriesData?.items) && industriesData.items.length > 0) {
        setLiveIndustries(
          industriesData.items.map((it: any) => ({
            slug: it.slug,
            title: it.title,
            summary: it.summary,
            href: it.href,
          }))
        );
      }
      // Hide the Industries nav entry when the admin has toggled it off
      if (industriesData && typeof industriesData.enabled === 'boolean') {
        setIndustriesEnabled(industriesData.enabled);
      }
      if (globalData?.settings?.siteName) {
        setSiteInfo({
          siteName: globalData.settings.siteName,
          logoUrl: globalData.settings.logoUrl || ""
        });
      }
      if (globalData?.elements?.headerCtaLabel) {
        setHeaderCta({
          label: globalData.elements.headerCtaLabel,
          href: globalData.elements.headerCtaHref || "/contact#contact-form"
        });
      }
      if ((globalData?.settings || globalData?.elements) && typeof document !== "undefined") {
        const css = settingsToCssVars(globalData.settings, globalData.elements);
        if (css) {
          let styleEl = document.getElementById("theme-vars");
          if (!styleEl) {
            styleEl = document.createElement("style");
            styleEl.id = "theme-vars";
            document.head.appendChild(styleEl);
          }
          styleEl.innerHTML = css;
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const allDropdowns = [
    { label: "About Us", path: aboutSection.path, items: liveAbout },
    { label: "Services", path: servicesSection.path, items: liveServices },
    { label: "Industries", path: industriesSection.path, items: liveIndustries },
    { label: "Insights", path: insightsSection.path, items: insightsSection.items },
  ];

  // Filter out disabled sections
  const dropdowns = allDropdowns.filter((d) => {
    if (d.label === "Industries" && !industriesEnabled) return false;
    return true;
  });

  return (
    <header className="sticky top-0 z-50 border-b border-paper/10 bg-ink/95 backdrop-blur">
      <Container className="flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          {siteInfo.logoUrl && siteInfo.logoUrl !== "/images/logo.png" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={siteInfo.logoUrl} alt={siteInfo.siteName || "Logo"} className="h-9 w-auto object-contain" />
          ) : (
            <LogoMark className="h-10 w-auto" />
          )}
          <span className="font-display text-[17px] sm:text-lg font-bold uppercase tracking-[0.14em] text-white leading-none">
            {siteInfo.siteName || "CHROMATUS"}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">

          {dropdowns.map((d) => (
            <div
              key={d.label}
              className="group relative"
              onMouseEnter={() => setOpenDropdown(d.label)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <Link
                href={d.path}
                className={`flex items-center gap-1 ${navLinkClass}`}
              >
                {d.label}
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="mt-px">
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </Link>
              <div
                className={`absolute left-1/2 top-full w-72 -translate-x-1/2 pt-3 transition ${openDropdown === d.label ? "visible opacity-100" : "invisible opacity-0"
                  }`}
              >
                <div className="rounded-xl border border-line bg-white p-2 shadow-2xl shadow-ink/20">
                  {d.items.map((item: any) => (
                    <Link
                      key={item.slug}
                      href={item.href || `${d.path}/${item.slug}`}
                      className="block rounded-lg px-4 py-2.5 text-sm text-ink/80 transition hover:bg-paper-dim hover:text-ink"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <Link href="/careers" className={navLinkClass}>
            Careers
          </Link>

          <Link href="/contact" className={navLinkClass}>
            Contact Us
          </Link>
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <SearchToggle />
          <Link
            href={headerCta.href || "/contact#contact-form"}
            className="group flex items-center gap-1.5 rounded-md border border-white/20 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition hover:border-white/40 hover:bg-white/[0.08]"
          >
            {headerCta.label}
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <path d="M4 12L12 4M12 4H5M12 4V11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <SearchToggle />
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-paper/20 text-paper"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
              <path d="M0 1H18" stroke="currentColor" strokeWidth="1.5" />
              <path d="M0 7H18" stroke="currentColor" strokeWidth="1.5" />
              <path d="M0 13H18" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
      </Container>

      {open && (
        <div className="border-t border-paper/10 bg-ink lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            <div className="mb-2 px-1">
              <SearchToggle showFullTrigger buttonLabel="Search Chromatus…" />
            </div>

            {dropdowns.map((d) => (
              <div key={d.label}>
                <button
                  className="flex w-full items-center justify-between rounded-lg px-2 py-2.5 text-left text-sm font-medium text-paper"
                  onClick={() => setMobileSection(mobileSection === d.label ? null : d.label)}
                >
                  {d.label}
                  <svg
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                    className={`transition ${mobileSection === d.label ? "rotate-180" : ""}`}
                  >
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
                {mobileSection === d.label && (
                  <div className="pb-1 pl-4">
                    {d.items.map((item: any) => (
                      <Link
                        key={item.slug}
                        href={item.href || `${d.path}/${item.slug}`}
                        className="block rounded-lg px-2 py-2 text-sm text-paper/65"
                        onClick={() => setOpen(false)}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <Link
              href="/careers"
              className="rounded-lg px-2 py-2.5 text-sm font-medium text-paper"
              onClick={() => setOpen(false)}
            >
              Careers
            </Link>

            <Link
              href="/contact"
              className="rounded-lg px-2 py-2.5 text-sm font-medium text-paper"
              onClick={() => setOpen(false)}
            >
              Contact Us
            </Link>

            <Link
              href={headerCta.href || "/contact#contact-form"}
              className="mt-3 rounded-lg bg-indigo px-5 py-3 text-center text-sm font-medium text-paper"
              onClick={() => setOpen(false)}
            >
              {headerCta.label}
            </Link>
          </Container>
        </div>
      )}
    </header>
  );
}
