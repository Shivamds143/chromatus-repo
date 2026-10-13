import { safeRead, safeWrite } from './mongodb';

export const DEFAULT_GLOBAL_ELEMENTS = {
  headerCtaLabel: 'CHROMATUS PRO',
  headerCtaHref: '/chromatus-pro',
  ctaBandHeading: "Schedule a consultation and let's solve something extraordinary together.",
  ctaBandPrimaryLabel: 'Talk to an expert',
  ctaBandPrimaryHref: '/contact-us',
  ctaBandSecondaryLabel: 'CHROMATUS PRO',
  ctaBandSecondaryHref: '/chromatus-pro',
  footerTagline: 'We turn data into decisions.',
  footerNote: '',
  socialLinks: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/chromatusconsulting', icon: 'linkedin' },
    { label: 'Twitter', href: 'https://twitter.com/Chromatus12', icon: 'twitter' },
    { label: 'Facebook', href: 'https://www.facebook.com/Chromatus-Consulting-100467295012830', icon: 'facebook' }
  ],
  fontHeading: 'inherit',
  fontBody: 'inherit'
};

function rowToElements(row) {
  if (!row) return { ...DEFAULT_GLOBAL_ELEMENTS };
  let socialLinks = DEFAULT_GLOBAL_ELEMENTS.socialLinks;
  try {
    if (row.social_links) {
      const parsed = typeof row.social_links === 'string' ? JSON.parse(row.social_links) : row.social_links;
      if (Array.isArray(parsed) && parsed.length > 0) socialLinks = parsed;
    }
  } catch {
    // keep default
  }
  return {
    headerCtaLabel: row.header_cta_label || DEFAULT_GLOBAL_ELEMENTS.headerCtaLabel,
    headerCtaHref: row.header_cta_href || DEFAULT_GLOBAL_ELEMENTS.headerCtaHref,
    ctaBandHeading: row.cta_band_heading || DEFAULT_GLOBAL_ELEMENTS.ctaBandHeading,
    ctaBandPrimaryLabel: row.cta_band_primary_label || DEFAULT_GLOBAL_ELEMENTS.ctaBandPrimaryLabel,
    ctaBandPrimaryHref: row.cta_band_primary_href || DEFAULT_GLOBAL_ELEMENTS.ctaBandPrimaryHref,
    ctaBandSecondaryLabel: row.cta_band_secondary_label || DEFAULT_GLOBAL_ELEMENTS.ctaBandSecondaryLabel,
    ctaBandSecondaryHref: row.cta_band_secondary_href || DEFAULT_GLOBAL_ELEMENTS.ctaBandSecondaryHref,
    footerTagline: row.footer_tagline || DEFAULT_GLOBAL_ELEMENTS.footerTagline,
    footerNote: row.footer_note || '',
    socialLinks,
    fontHeading: row.font_heading || DEFAULT_GLOBAL_ELEMENTS.fontHeading,
    fontBody: row.font_body || DEFAULT_GLOBAL_ELEMENTS.fontBody
  };
}

/** Public/frontend read — always resolves, never throws. */
export async function getGlobalElements() {
  const row = await safeRead(
    (db) => db.collection('global_elements').findOne({ _id: 1 }),
    null
  );
  return rowToElements(row);
}

export async function saveGlobalElements(input) {
  const g = { ...DEFAULT_GLOBAL_ELEMENTS, ...input };
  return safeWrite((db) =>
    db.collection('global_elements').updateOne(
      { _id: 1 },
      {
        $set: {
          header_cta_label: g.headerCtaLabel,
          header_cta_href: g.headerCtaHref,
          cta_band_heading: g.ctaBandHeading,
          cta_band_primary_label: g.ctaBandPrimaryLabel,
          cta_band_primary_href: g.ctaBandPrimaryHref,
          cta_band_secondary_label: g.ctaBandSecondaryLabel,
          cta_band_secondary_href: g.ctaBandSecondaryHref,
          footer_tagline: g.footerTagline,
          footer_note: g.footerNote,
          social_links: JSON.stringify(g.socialLinks || []),
          font_heading: g.fontHeading,
          font_body: g.fontBody
        }
      },
      { upsert: true }
    )
  );
}
