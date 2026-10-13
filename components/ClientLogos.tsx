"use client";

import Image from "next/image";
import Container from "./Container";
import { clientLogos, ClientLogo } from "@/data/content/clients";

function LogoItem({ logo }: { logo: ClientLogo }) {
  const content = (
    <div className="group relative flex h-14 min-w-[140px] items-center justify-center rounded-lg border border-paper/10 bg-paper/[0.04] px-6 py-2 transition duration-300 hover:border-signal/50 hover:bg-paper/[0.08]">
      <Image
        src={logo.logoUrl}
        alt={logo.name}
        width={logo.width || 140}
        height={logo.height || 40}
        className="max-h-8 w-auto object-contain opacity-70 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0"
      />
    </div>
  );

  if (logo.website) {
    return (
      <a
        href={logo.website}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 outline-none"
        aria-label={logo.name}
      >
        {content}
      </a>
    );
  }

  return <div className="shrink-0">{content}</div>;
}

function LogoMarqueeList({
  logos,
  duplicate = false,
}: {
  logos: ClientLogo[];
  duplicate?: boolean;
}) {
  return (
    <div
      className={`flex shrink-0 items-center gap-6 ${duplicate ? "motion-reduce:hidden" : ""}`}
      aria-hidden={duplicate || undefined}
    >
      {logos.map((logo, idx) => (
        <LogoItem key={duplicate ? `dup-${logo.id || idx}` : logo.id || idx} logo={logo} />
      ))}
    </div>
  );
}

export default function ClientLogos() {
  const hasLogos = clientLogos && clientLogos.length > 0;

  return (
    <section
      aria-label="Client Partners"
      className="relative border-b border-paper/10 bg-gradient-to-r from-ink via-ink-soft to-ink py-7 text-paper sm:py-8"
    >
      <Container>
        <p className="text-center font-display text-xs font-semibold uppercase tracking-widest text-paper/50 sm:text-xs">
          Trusted by Industry Leaders & Client Partners
        </p>

        {hasLogos ? (
          <div className="mt-5 overflow-hidden py-2 motion-reduce:overflow-x-auto">
            <div className="flex w-max items-center gap-6 animate-marquee hover:[animation-play-state:paused] focus-within:[animation-play-state:paused] motion-reduce:animate-none">
              <LogoMarqueeList logos={clientLogos} />
              <LogoMarqueeList logos={clientLogos} duplicate />
            </div>
          </div>
        ) : (
          /* Ready structure awaiting client logo files (no fake brand names or placeholder brands) */
          <div className="mt-5 flex items-center justify-center overflow-hidden py-2">
            <div className="flex w-full max-w-4xl flex-wrap items-center justify-center gap-4 sm:gap-6">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex h-12 w-28 items-center justify-center rounded-lg border border-dashed border-paper/15 bg-paper/[0.02] sm:w-36"
                  aria-hidden="true"
                >
                  <span className="h-1.5 w-12 rounded-full bg-paper/15" />
                </div>
              ))}
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
