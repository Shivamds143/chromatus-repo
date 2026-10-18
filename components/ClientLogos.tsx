"use client";

import Container from "./Container";

export type ClientItem = {
  id: string | number;
  name: string;
  subtitle?: string;
  logo_url?: string;
  logoUrl?: string;
  website?: string;
  is_published?: boolean | number;
};

// Minimal, monochrome vector marks for partner brands matching the reference aesthetic
function ClientBrandMark({ name }: { name: string }) {
  const normalized = (name || "").toLowerCase().trim();

  if (normalized.includes("vertex")) {
    return (
      <div className="flex items-center gap-2">
        <svg className="h-5 w-5 shrink-0 fill-current" viewBox="0 0 24 24">
          <path d="M12 2L1 21h22L12 2zm0 5.2L18.8 19H5.2L12 7.2z" />
        </svg>
        <span className="font-display text-[15px] font-bold tracking-wider">VERTEX</span>
      </div>
    );
  }

  if (normalized.includes("omni") || normalized.includes("health")) {
    return (
      <div className="flex items-center gap-2">
        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v10M7 12h10" strokeLinecap="round" />
        </svg>
        <span className="font-display text-[15px] font-semibold tracking-tight">
          omni<span className="font-bold">health</span>
        </span>
      </div>
    );
  }

  if (normalized.includes("kinetix")) {
    return (
      <div className="flex items-center gap-1.5">
        <svg className="h-4 w-4 shrink-0 fill-current" viewBox="0 0 24 24">
          <path d="M4 3l9 9-9 9h6l9-9-9-9H4z" />
        </svg>
        <span className="font-display text-[15px] font-extrabold tracking-widest">KINETIX</span>
      </div>
    );
  }

  if (normalized.includes("aura") || normalized.includes("semiconductor")) {
    return (
      <div className="flex items-center gap-2">
        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 22 8 22 16 12 22 2 16 2 8" />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
        <span className="font-display text-[14px] font-semibold tracking-[0.18em]">AURA SEMI</span>
      </div>
    );
  }

  if (normalized.includes("solaria") || normalized.includes("energy")) {
    return (
      <div className="flex items-center gap-2">
        <svg className="h-5 w-5 shrink-0 fill-none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <circle cx="12" cy="12" r="4" fill="currentColor" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" strokeLinecap="round" />
        </svg>
        <span className="font-display text-[15px] font-bold tracking-wider">SOLARIA</span>
      </div>
    );
  }

  if (normalized.includes("novus") || normalized.includes("telecom")) {
    return (
      <div className="flex items-center gap-2">
        <svg className="h-5 w-5 shrink-0 fill-none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <path d="M2 10s4-4 10-4 10 4 10 4M5 14s2.8-2.5 7-2.5 7 2.5 7 2.5" strokeLinecap="round" />
          <circle cx="12" cy="18" r="1.5" fill="currentColor" />
        </svg>
        <span className="font-display text-[15px] font-semibold tracking-wider">NOVUS</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <svg className="h-4 w-4 shrink-0 fill-current opacity-70" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8" />
      </svg>
      <span className="font-display text-[14px] font-semibold tracking-wide uppercase">
        {name}
      </span>
    </div>
  );
}

function LogoItem({ item }: { item: ClientItem }) {
  const logoSrc = item.logo_url || item.logoUrl;

  const content = logoSrc ? (
    <img
      src={logoSrc}
      alt={item.name}
      loading="lazy"
      className="h-7 sm:h-8 max-h-9 w-auto max-w-[140px] shrink-0 object-contain opacity-75 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 hover:scale-105 mix-blend-multiply"
    />
  ) : (
    <div className="shrink-0 text-slate-400 transition-colors duration-300 hover:text-ink">
      <ClientBrandMark name={item.name} />
    </div>
  );

  if (item.website) {
    return (
      <a
        href={item.website}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 outline-none transition-transform"
        aria-label={item.name}
      >
        {content}
      </a>
    );
  }

  return <div className="shrink-0">{content}</div>;
}

function LogoMarqueeList({
  items,
  duplicate = false,
}: {
  items: ClientItem[];
  duplicate?: boolean;
}) {
  return (
    <div
      className={`flex shrink-0 items-center gap-12 sm:gap-16 pr-12 sm:pr-16 ${duplicate ? "motion-reduce:hidden" : ""}`}
      aria-hidden={duplicate || undefined}
    >
      {items.map((item, idx) => (
        <LogoItem key={duplicate ? `dup-${item.id || idx}` : item.id || idx} item={item} />
      ))}
    </div>
  );
}

export default function ClientLogos({ items = [] }: { items?: ClientItem[] }) {
  if (!items || items.length === 0) return null;

  return (
    <section
      aria-label="Client Partners"
      className="relative overflow-hidden bg-white py-9 sm:py-11 border-b border-line/40"
    >
      <Container>
        <p className="text-center font-display text-[11px] font-medium uppercase tracking-[0.22em] text-slate/70">
          Trusted by Industry Leaders &amp; Client Partners
        </p>
      </Container>

      {/* Seamless horizontal scrolling carousel with clean background and edge fades */}
      <div className="relative mt-7 w-full overflow-hidden">
        {/* Left fade */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 sm:w-32 bg-gradient-to-r from-white to-transparent" />
        {/* Right fade */}
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 sm:w-32 bg-gradient-to-l from-white to-transparent" />

        <div className="flex w-max items-center animate-marquee [animation-duration:55s] hover:[animation-play-state:paused] focus-within:[animation-play-state:paused] motion-reduce:animate-none">
          <LogoMarqueeList items={items} />
          <LogoMarqueeList items={items} duplicate />
        </div>
      </div>
    </section>
  );
}
