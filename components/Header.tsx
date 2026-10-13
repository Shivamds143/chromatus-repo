"use client";

import Link from "next/link";
import { useState } from "react";
import Container from "./Container";
import LogoMark from "./LogoMark";
import SearchToggle from "./SearchToggle";
import { servicesSection, industriesSection, insightsSection } from "@/lib/content";

const dropdowns = [
  { label: "Services", section: servicesSection },
  { label: "Industries", section: industriesSection },
  { label: "Insights", section: insightsSection },
];

const plainLinks = [
  { label: "About Us", href: "/about" },
];

const navLinkClass =
  "relative text-sm font-medium text-paper/75 transition hover:text-paper after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-signal after:transition-all after:duration-300 hover:after:w-full";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileSection, setMobileSection] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 border-b border-paper/10 bg-ink/95 backdrop-blur">
      <Container className="flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <LogoMark className="h-11 w-auto" />
          <span className="font-display text-xl font-bold uppercase tracking-tight text-white">
            Chromatus
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          <Link href="/about" className={navLinkClass}>
            About Us
          </Link>

          {dropdowns.map((d) => (
            <div
              key={d.label}
              className="group relative"
              onMouseEnter={() => setOpenDropdown(d.label)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <Link
                href={d.section.path}
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
                  {d.section.items.map((item) => (
                    <Link
                      key={item.slug}
                      href={`${d.section.path}/${item.slug}`}
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
            href="/contact#contact-form"
            className="group flex items-center gap-1.5 rounded-lg bg-indigo px-5 py-2.5 text-sm font-medium text-paper transition hover:scale-[1.03] hover:bg-indigo-light active:scale-[0.98]"
          >
            Chromatus Pro
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="transition group-hover:translate-x-0.5">
              <path d="M4 12L12 4M12 4H5M12 4V11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-paper/20 text-paper lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
            <path d="M0 1H18" stroke="currentColor" strokeWidth="1.5" />
            <path d="M0 7H18" stroke="currentColor" strokeWidth="1.5" />
            <path d="M0 13H18" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </Container>

      {open && (
        <div className="border-t border-paper/10 bg-ink lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            <Link
              href="/about"
              className="rounded-lg px-2 py-2.5 text-sm font-medium text-paper"
              onClick={() => setOpen(false)}
            >
              About Us
            </Link>

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
                    {d.section.items.map((item) => (
                      <Link
                        key={item.slug}
                        href={`${d.section.path}/${item.slug}`}
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
              href="/contact#contact-form"
              className="mt-3 rounded-lg bg-indigo px-5 py-3 text-center text-sm font-medium text-paper"
              onClick={() => setOpen(false)}
            >
              Chromatus Pro
            </Link>
          </Container>
        </div>
      )}
    </header>
  );
}
