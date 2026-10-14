import Link from "next/link";
import Container from "./Container";

const avatars = [
  { initials: "AR", bg: "#2F7FC1" },
  { initials: "JM", bg: "#7C6FD6" },
  { initials: "SK", bg: "#F08A3C" },
];

type HeroProps = {
  content?: {
    eyebrow?: string;
    subtitle?: string;
    primaryCta?: { label: string; href: string };
    secondaryCta?: { label: string; href: string };
  };
};

export default function Hero({ content }: HeroProps) {
  const eyebrow = content?.eyebrow || "INDEPENDENT THINKING. EXTRAORDINARY TOGETHER.";
  const subtitle =
    content?.subtitle ||
    "We help ambitious organizations turn complexity into clarity, and ideas into progress that lasts.";
  const primaryHref = content?.primaryCta?.href || "/contact#contact-form";
  const primaryLabel = content?.primaryCta?.label || "Chromatus Pro";
  const secondaryHref = "/services";
  const secondaryLabel = content?.secondaryCta?.label || "Explore what we do";

  return (
    <section className="relative flex min-h-[calc(100vh-82px)] overflow-hidden bg-[linear-gradient(100deg,#05203d_0%,#082c4f_40%,#0c5073_75%,#1587a8_100%)] text-white">
      {/* Soft light glow on the right side */}
      {/* Soft light glow on the right side */}
      <div
        className="pointer-events-none absolute right-[-8%] top-[22%] hidden h-[480px] w-[480px] rounded-full opacity-60 blur-3xl md:block"
        style={{ background: "radial-gradient(circle, #2aa7c4 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      {/* Smaller tilted circles on the right side */}
      <svg
        viewBox="0 0 700 700"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none absolute right-[-12%] top-1/2 hidden h-[620px] w-[620px] -translate-y-1/2 select-none md:block lg:right-[-6%]"
        aria-hidden="true"
      >
        <g transform="rotate(35 350 350)">
          <ellipse cx="350" cy="350" rx="110" ry="190" stroke="#7dd3fc" strokeWidth="1" strokeOpacity="0.4" />
          <ellipse cx="335" cy="350" rx="150" ry="235" stroke="#7dd3fc" strokeWidth="1" strokeOpacity="0.32" />
          <ellipse cx="320" cy="350" rx="190" ry="280" stroke="#7dd3fc" strokeWidth="1" strokeOpacity="0.24" />
          <ellipse cx="305" cy="350" rx="230" ry="325" stroke="#7dd3fc" strokeWidth="1" strokeOpacity="0.16" />
        </g>
      </svg>

      <Container className="relative flex w-full flex-col pt-16 pb-8 sm:pt-20 lg:pt-24 sm:pb-10">
        {/* Main content */}
        <div className="max-w-3xl">
          {/* Small top text */}
          <div className="flex items-center gap-3">
            <span className="h-[2px] w-6 bg-[#2dd4bf]" aria-hidden="true" />
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4fd1e0]">
              {eyebrow}
            </p>
          </div>

          {/* Big heading */}
          <h1 className="mt-10 font-display text-[3rem] font-bold leading-[0.95] tracking-[-0.06em] sm:text-7xl lg:text-[5.6rem]">
            <span className="block text-white">Make your next</span>
            <span className="block text-[#4fd1c5]">move</span>
            <span className="block text-[#4fd1c5]">meaningful.</span>
          </h1>

          {/* Small text under heading */}
          <p className="mt-8 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
            {subtitle}
          </p>

          {/* Buttons */}
          <div className="mt-10 flex flex-wrap items-center gap-6 sm:gap-8">
            <Link
              href={primaryHref}
              className="group inline-flex items-center gap-3 rounded-[3px] bg-white px-5 py-4 font-mono text-xs font-bold text-[#051322] transition hover:bg-slate-100 active:scale-[0.98]"
            >
              <span>{primaryLabel}</span>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <path d="M4 12L12 4M12 4H5M12 4V11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>

            <Link
              href={secondaryHref}
              className="group inline-flex items-center gap-2 text-xs font-bold text-white transition hover:text-[#4fd1c5]"
            >
              <span>{secondaryLabel}</span>
              <span className="text-sm transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>

        {/* Bottom row (no line above it) */}
        <div className="mt-auto flex flex-col gap-6 pt-20 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {avatars.map((a) => (
                <span
                  key={a.initials}
                  style={{ backgroundColor: a.bg }}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#0a3558] text-[9px] font-bold text-white"
                >
                  {a.initials}
                </span>
              ))}
              <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#0a3558] bg-[#0c2f4f] text-[10px] font-bold text-white">
                +
              </span>
            </div>

            <div>
              <p className="text-xs font-bold leading-tight text-white">
                Trusted by teams who are ready to move forward.
              </p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-widest text-[#4fa8e0]">
                Strategy · Technology · Data
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 sm:mr-[22%]">
            <span className="font-mono text-[11px] font-bold text-[#4fd1c5]">01</span>
            <div className="text-[11px] leading-snug text-[#7dc3f0]">
              <p>Clarity in a</p>
              <p>complex world</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}