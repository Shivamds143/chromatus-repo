import Link from "next/link";
import Container from "./Container";

type CTABannerProps = {
  content?: {
    title?: string;
    lead?: string;
    cta?: { label?: string; href?: string };
  };
};

export default function CTABanner({ content }: CTABannerProps) {
  const title = content?.title || "Have a market question you need answered properly?";
  const lead =
    content?.lead ||
    "Tell us the decision you're trying to make — we'll tell you the fastest credible way to get there.";
  const ctaLabel = content?.cta?.label || "Chromatus Pro";
  const ctaHref = content?.cta?.href || "/contact#contact-form";

  return (
    <section className="bg-signal">
      <Container className="flex flex-col items-start justify-between gap-8 py-16 sm:flex-row sm:items-center">
        <div>
          <h2 className="max-w-md font-display text-3xl font-semibold leading-tight tracking-tight text-ink">
            {title}
          </h2>
          <p className="mt-3 max-w-sm text-sm text-ink/70">
            {lead}
          </p>
        </div>
        <div className="flex flex-shrink-0 flex-wrap gap-4">
          <Link
            href={ctaHref}
            className="group flex items-center gap-2 rounded-lg bg-ink px-7 py-3.5 text-sm font-semibold text-paper transition hover:bg-ink-soft"
          >
            {ctaLabel}
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="transition group-hover:translate-x-0.5">
              <path d="M4 12L12 4M12 4H5M12 4V11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <a
            href="tel:+917498465144"
            className="rounded-lg border border-ink/30 px-7 py-3.5 text-sm font-medium text-ink transition hover:border-ink"
          >
            +91 74984 65144
          </a>
        </div>
      </Container>
    </section>
  );
}
