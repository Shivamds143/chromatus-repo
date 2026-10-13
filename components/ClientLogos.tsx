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

function LogoCard({ item }: { item: ClientItem }) {
  const logoSrc = item.logo_url || item.logoUrl;

  const inner = (
    <div className="group relative flex h-14 min-w-[160px] items-center justify-center rounded-xl border border-paper/10 bg-paper/[0.04] px-5 py-2.5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-signal/50 hover:bg-paper/[0.08] hover:shadow-md">
      {logoSrc ? (
        <img
          src={logoSrc}
          alt={item.name}
          className="max-h-8 w-auto max-w-[140px] object-contain opacity-75 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0"
        />
      ) : (
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-signal/20 font-display text-xs font-bold text-signal transition group-hover:bg-signal group-hover:text-ink">
            {item.name ? item.name.charAt(0).toUpperCase() : "C"}
          </span>
          <div className="text-left">
            <span className="block font-display text-xs font-semibold tracking-tight text-paper/90 transition group-hover:text-white">
              {item.name}
            </span>
            {item.subtitle && (
              <span className="block text-[9px] font-medium tracking-wide text-paper/40">
                {item.subtitle}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (item.website) {
    return (
      <a
        href={item.website}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 outline-none"
        aria-label={item.name}
      >
        {inner}
      </a>
    );
  }

  return <div className="shrink-0">{inner}</div>;
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
      className={`flex shrink-0 items-center gap-5 ${duplicate ? "motion-reduce:hidden" : ""}`}
      aria-hidden={duplicate || undefined}
    >
      {items.map((item, idx) => (
        <LogoCard key={duplicate ? `dup-${item.id || idx}` : item.id || idx} item={item} />
      ))}
    </div>
  );
}

export default function ClientLogos({ items = [] }: { items?: ClientItem[] }) {
  if (!items || items.length === 0) return null;

  return (
    <section
      aria-label="Client Partners"
      className="relative border-b border-paper/10 bg-gradient-to-r from-ink via-ink-soft to-ink py-7 text-paper sm:py-8"
    >
      <Container>
        <p className="text-center font-display text-xs font-semibold uppercase tracking-widest text-paper/50">
          Trusted by Industry Leaders & Client Partners
        </p>

        <div className="mt-5 overflow-hidden py-2 motion-reduce:overflow-x-auto">
          <div className="flex w-max items-center gap-5 animate-marquee hover:[animation-play-state:paused] focus-within:[animation-play-state:paused] motion-reduce:animate-none">
            <LogoMarqueeList items={items} />
            <LogoMarqueeList items={items} duplicate />
          </div>
        </div>
      </Container>
    </section>
  );
}
