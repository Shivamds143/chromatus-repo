import { safeRead, safeWrite } from './mongodb';

export const DEFAULT_GLOBAL_ELEMENTS = {
  headerCtaLabel: 'CHROMATUS PRO',
  headerCtaHref: '/contact#contact-form',
  ctaBandHeading: "Schedule a consultation and let's solve something extraordinary together.",
  ctaBandPrimaryLabel: 'Talk to an expert',
  ctaBandPrimaryHref: '/contact#contact-form',
  ctaBandSecondaryLabel: 'CHROMATUS PRO',
  ctaBandSecondaryHref: '/contact#contact-form',
  footerTagline: 'We turn data into decisions.',
  footerNote: 'Research and consulting firm helping organizations make better business decisions through data — headquartered in Pune, working across industries.',
  contactAddress: 'Sai Shilp, Near Universal, Warje, Pune 411052',
  contactPhone: '+91 74984 65144',
  contactEmail: 'info@chromatus.com',
  contactHours: 'Monday – Friday, 9AM – 8PM IST',
  footerCopyright: 'Chromatus Consulting. All rights reserved.',
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
    footerNote: row.footer_note || DEFAULT_GLOBAL_ELEMENTS.footerNote,
    contactAddress: row.contact_address || DEFAULT_GLOBAL_ELEMENTS.contactAddress,
    contactPhone: row.contact_phone || DEFAULT_GLOBAL_ELEMENTS.contactPhone,
    contactEmail: row.contact_email || DEFAULT_GLOBAL_ELEMENTS.contactEmail,
    contactHours: row.contact_hours || DEFAULT_GLOBAL_ELEMENTS.contactHours,
    footerCopyright: row.footer_copyright || DEFAULT_GLOBAL_ELEMENTS.footerCopyright,
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
          contact_address: g.contactAddress,
          contact_phone: g.contactPhone,
          contact_email: g.contactEmail,
          contact_hours: g.contactHours,
          footer_copyright: g.footerCopyright,
          social_links: JSON.stringify(g.socialLinks || []),
          font_heading: g.fontHeading,
          font_body: g.fontBody,
          updated_at: new Date()
        }
      },
      { upsert: true }
    )
  );
}
