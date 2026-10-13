# Chromatus Consulting — website redesign

A modern, professional rebuild of the Chromatus Consulting site in Next.js
14 (App Router) + TypeScript + Tailwind CSS, structured around the site's
flow chart: Home → About Us / Services / Industries / Insights / Careers /
Contact Us, each with its own subpages.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Site structure (matches the flow chart)

- `/` — Home
- `/about` + `/about/[slug]` — Our Story, Leadership Team, Values & Culture,
  Awards & Recognitions
- `/services` + `/services/[slug]` — Strategy & Transformation, Technology
  Consulting, Data & Analytics, Cloud & Digital Solutions, Managed Services,
  Engagement Models
- `/industries` + `/industries/[slug]` — Financial Services, Healthcare,
  Manufacturing, Retail & Consumer Goods, Technology, Other Industries
- `/insights` + `/insights/[slug]` — Blogs & Articles, Whitepapers, Case
  Studies, Reports, Webinars & Events
- `/careers` + `/careers/[slug]` — Open Positions, Life at Chromatus,
  Benefits, Diversity Equity & Inclusion, Early Careers
- `/contact` — Contact Form, Office Locations, General Inquiries (as
  anchored sections: `#contact-form`, `#office-locations`,
  `#general-inquiries`)
- `/privacy-policy`, `/terms`, `/cookie-policy`, `/faq` — legal & support

All five hub sections (About, Services, Industries, Insights, Careers) are
data-driven from `lib/content.ts` — add or edit a subpage by editing that
file; the hub grid and detail pages pick it up automatically via
`generateStaticParams`.

## Global elements (present on every page, per the flow chart)

- Primary navigation with dropdowns for Services / Industries / Insights
  (`components/Header.tsx`)
- Logo mark, linked to home
- Search — a lightweight client-side search over all subpages
  (`components/SearchToggle.tsx`); swap in a real search index later if
  the content grows past what an in-memory filter can handle
- Newsletter signup in the footer (`components/NewsletterSignup.tsx`)
- Social links (LinkedIn, Twitter, Facebook)
- Footer legal links: Privacy Policy, Terms of Use, Cookie Policy
- "Let's talk" CTA in the header and before the footer on every page

## Design notes

- **Logo**: the real Chromatus mark, cropped from the supplied artwork
  into `public/logo-icon.png` (icon only, used in the header/footer) and
  `public/logo-full.png` (icon + wordmark). `app/icon.png` /
  `app/apple-icon.png` are the same mark, squared off, for the browser
  favicon and home-screen icon.
- **Palette**: colour-matched to the logo by sampling its dominant
  pixels — indigo blue family (`#105070` / `#186098` / `#2080C8`) plus
  the logo's orange (`#E89020`) as the signal/CTA accent, on a deep navy
  `ink` and a cool off-white `paper`. See `tailwind.config.ts` for exact
  values.
- **Type**: Space Grotesk (display), Inter (body), IBM Plex Mono (labels,
  stats, tags) — loaded via `next/font/google`, self-hosted at build time.
- **Signature element**: the noisy-line-resolving-into-a-smooth-trendline
  graphic in the hero — a literal expression of "signal from noise,"
  now drawn in the logo's orange.
- No stock photography or third-party logos are used — everything else
  is built from typography, colour, and custom SVG.

## Before launch

- `components/ContactForm.tsx` and `components/NewsletterSignup.tsx`
  now validate input and include a honeypot field against basic spam
  bots, but still simulate submission client-side — wire both to your
  form endpoint, CRM, or email service.
- `app/privacy-policy`, `app/terms`, and `app/cookie-policy` are
  placeholders — replace with reviewed legal copy.
- `components/SearchToggle.tsx` searches only the section subpages
  defined in `lib/content.ts` — extend it if you add a blog or job board
  with its own content source.
- Review and edit the copy in `lib/content.ts` — it was written to fit
  the flow chart's structure using details from the original site, but
  your team will know the specifics (leadership names, actual open roles,
  real case studies) better than this draft does.
- The JSON-LD organization data in `app/layout.tsx` uses the same
  placeholder contact details as the rest of the site — update alongside
  any address/phone changes.

## Recent polish pass

- Animated stat counters in the hero (`components/StatCounter.tsx`),
  card hover-lift across the hub grids and testimonials, an underline
  animation on nav links, and a subtle dot-grid texture on dark sections.
- A floating "back to top" button (`components/ScrollToTop.tsx`).
- JSON-LD Organization schema, `app/robots.ts`, and richer Open
  Graph/Twitter metadata in `app/layout.tsx`.
- Deliberately **not** included: a site-wide dark/light mode toggle —
  the design already alternates dark (`ink`) and light (`paper`) sections
  intentionally, and a toggle would fight that rather than complement it.
  Backend wiring for the two forms is also left for you, since it needs
  real credentials for whatever provider you pick (Formspree, Resend,
  HubSpot, etc.).
