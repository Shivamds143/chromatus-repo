import Link from "next/link";
import Container from "./Container";
import LogoMark from "./LogoMark";
import NewsletterSignup from "./NewsletterSignup";

const exploreLinks = [
  { label: "About Us", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Industries", href: "/industries" },
  { label: "Insights", href: "/insights" },
];

const connectLinks = [
  { label: "Careers", href: "/careers" },
  { label: "Contact Us", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-paper/70">
      <Container className="grid gap-12 py-16 lg:grid-cols-[1.3fr_0.7fr_0.7fr_1.2fr]">
        <div>
          <div className="flex items-center gap-3">
            <LogoMark className="h-11 w-auto" />
            <span className="leading-none">
              <span className="font-display text-base font-bold uppercase tracking-tight text-indigo-light">
                Chromatus{" "}
              </span>
              <span className="font-display text-base font-normal uppercase tracking-tight text-signal">
                Consulting
              </span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-paper/55">
            Research and consulting firm helping organizations make better
            business decisions through data — headquartered in Pune, working
            across industries.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <a
              href="https://www.linkedin.com/company/chromatusconsulting"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              title="LinkedIn"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line-dark text-paper/70 transition duration-200 hover:border-signal hover:bg-signal/10 hover:text-signal hover:scale-110 active:scale-95"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.6 1.6 0 0 0 0-3.2 1.6 1.6 0 0 0 0 3.2m1.4 9.74v-8.37H5.06v8.37h2.8z" />
              </svg>
            </a>
            <a
              href="https://twitter.com/Chromatus12"
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter / X"
              title="Twitter / X"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line-dark text-paper/70 transition duration-200 hover:border-signal hover:bg-signal/10 hover:text-signal hover:scale-110 active:scale-95"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/Chromatus-Consulting-100467295012830"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              title="Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line-dark text-paper/70 transition duration-200 hover:border-signal hover:bg-signal/10 hover:text-signal hover:scale-110 active:scale-95"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
          </div>
        </div>

        <div>
          <p className="eyebrow text-paper/40">Explore</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {exploreLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-paper/60 transition hover:text-paper">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow text-paper/40">Connect</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {connectLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-paper/60 transition hover:text-paper">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <a href="mailto:info@chromatus.com" className="text-paper/60 transition hover:text-paper">
                Email us
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-paper/40">Stay in the loop</p>
          <p className="mt-4 text-sm leading-relaxed text-paper/55">
            Occasional notes on research method and category trends — no spam.
          </p>
          <div className="mt-4">
            <NewsletterSignup />
          </div>
          <div className="mt-8 border-t border-line-dark pt-6 text-sm text-paper/55">
            <p>Sai Shilp, Near Universal, Warje, Pune 411052</p>
            <a href="tel:+917498465144" className="mt-1 block hover:text-paper">+91 74984 65144</a>
            <a href="mailto:info@chromatus.com" className="block hover:text-paper">info@chromatus.com</a>
          </div>
        </div>
      </Container>

      <div className="hairline-dark">
        <Container className="flex flex-col items-center justify-between gap-3 py-6 text-xs text-paper/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Chromatus Consulting. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/faq" className="hover:text-paper/70">FAQ</Link>
            <Link href="/privacy-policy" className="hover:text-paper/70">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-paper/70">Terms of Use</Link>
            <Link href="/cookie-policy" className="hover:text-paper/70">Cookie Policy</Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}
