import { safeRead, safeWrite } from './mongodb';

// These values match the hard-coded defaults that already ship in
// tailwind.config.js / globals.css, so if the DB is unreachable (or the
// table hasn't been migrated yet) the site renders pixel-identical to
// before this feature existed.
export const DEFAULT_SETTINGS = {
  siteName: 'Chromatus Consulting',
  tagline: '',
  logoUrl: '/images/logo.png',
  colorNavy: '#0E4A6B',
  colorNavyLight: '#15619B',
  colorNavyDark: '#0A3350',
  colorBrandblue: '#1F82C5',
  colorBrandblueDark: '#15619B',
  colorBrandorange: '#EA7A00',
  colorBrandorangeDark: '#C46600',
  colorEyebrow: '#1F82C5',
  colorEyebrowDark: '#EA9322',
  // SEO sitewide defaults / fallbacks (Admin -> SEO -> Global Defaults).
  // Used whenever a page has no per-route override saved.
  siteUrl: '',
  defaultMetaTitle: 'Chromatus Consulting — We turn data into decisions.',
  defaultMetaDescription:
    'Chromatus Consulting helps businesses understand their markets, their customers, and their competition — so every decision is backed by evidence, not guesswork.',
  defaultOgImage: '/images/logo.png',
  twitterHandle: '',
  organizationName: 'Chromatus Consulting',
  organizationLogo: '/images/logo.png',
  organizationDescription: '',
  // Section visibility toggles
  industriesEnabled: true
};

function rowToSettings(row) {
  if (!row) return { ...DEFAULT_SETTINGS };
  return {
    siteName: row.site_name || DEFAULT_SETTINGS.siteName,
    tagline: row.tagline || '',
    logoUrl: row.logo_url || DEFAULT_SETTINGS.logoUrl,
    colorNavy: row.color_navy || DEFAULT_SETTINGS.colorNavy,
    colorNavyLight: row.color_navy_light || DEFAULT_SETTINGS.colorNavyLight,
    colorNavyDark: row.color_navy_dark || DEFAULT_SETTINGS.colorNavyDark,
    colorBrandblue: row.color_brandblue || DEFAULT_SETTINGS.colorBrandblue,
    colorBrandblueDark: row.color_brandblue_dark || DEFAULT_SETTINGS.colorBrandblueDark,
    colorBrandorange: row.color_brandorange || DEFAULT_SETTINGS.colorBrandorange,
    colorBrandorangeDark: row.color_brandorange_dark || DEFAULT_SETTINGS.colorBrandorangeDark,
    colorEyebrow: row.color_eyebrow || DEFAULT_SETTINGS.colorEyebrow,
    colorEyebrowDark: row.color_eyebrow_dark || DEFAULT_SETTINGS.colorEyebrowDark,
    siteUrl: row.site_url || DEFAULT_SETTINGS.siteUrl,
    defaultMetaTitle: row.default_meta_title || DEFAULT_SETTINGS.defaultMetaTitle,
    defaultMetaDescription: row.default_meta_description || DEFAULT_SETTINGS.defaultMetaDescription,
    defaultOgImage: row.default_og_image || DEFAULT_SETTINGS.defaultOgImage,
    twitterHandle: row.twitter_handle || DEFAULT_SETTINGS.twitterHandle,
    organizationName: row.organization_name || DEFAULT_SETTINGS.organizationName,
    organizationLogo: row.organization_logo || DEFAULT_SETTINGS.organizationLogo,
    organizationDescription: row.organization_description || DEFAULT_SETTINGS.organizationDescription,
    // Section visibility (default true = visible, so existing sites are unaffected)
    industriesEnabled: row.industries_enabled !== undefined ? !!row.industries_enabled : DEFAULT_SETTINGS.industriesEnabled
  };
}

export { hexToRgbTriple, settingsToCssVars } from './themeUtils';

/** Public/frontend read — always resolves, never throws. */
export async function getSiteSettings() {
  const row = await safeRead((db) => db.collection('site_settings').findOne({ _id: 1 }), null);
  return rowToSettings(row);
}

export async function saveSiteSettings(input) {
  const s = { ...DEFAULT_SETTINGS, ...input };
  return safeWrite((db) =>
    db.collection('site_settings').updateOne(
      { _id: 1 },
      {
        $set: {
          site_name: s.siteName,
          tagline: s.tagline,
          logo_url: s.logoUrl,
          color_navy: s.colorNavy,
          color_navy_light: s.colorNavyLight,
          color_navy_dark: s.colorNavyDark,
          color_brandblue: s.colorBrandblue,
          color_brandblue_dark: s.colorBrandblueDark,
          color_brandorange: s.colorBrandorange,
          color_brandorange_dark: s.colorBrandorangeDark,
          color_eyebrow: s.colorEyebrow,
          color_eyebrow_dark: s.colorEyebrowDark,
          site_url: s.siteUrl,
          default_meta_title: s.defaultMetaTitle,
          default_meta_description: s.defaultMetaDescription,
          default_og_image: s.defaultOgImage,
          twitter_handle: s.twitterHandle,
          organization_name: s.organizationName,
          organization_logo: s.organizationLogo,
          organization_description: s.organizationDescription,
          industries_enabled: s.industriesEnabled !== false
        }
      },
      { upsert: true }
    )
  );
}

/** Read-only shortcut for checking if the industries section is enabled. */
export async function getIndustriesEnabled() {
  const settings = await getSiteSettings();
  return settings.industriesEnabled !== false;
}
