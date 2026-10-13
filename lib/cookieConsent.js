import { safeRead, safeWrite } from './mongodb';

// Fixed category keys. Admins can rename/describe/enable-disable each one
// and (for the non-necessary ones) attach a tracking-script snippet, but
// the keys themselves stay stable so the public banner/modal, the consent
// cookie, and ConsentScripts all agree on what "analytics" etc. means.
export const CATEGORY_KEYS = ['necessary', 'analytics', 'functional', 'marketing'];

export const DEFAULT_CATEGORIES = [
  {
    key: 'necessary',
    name: 'Necessary',
    description:
      'Required for the site to function — things like page navigation, secure areas, and remembering your cookie choice. These cannot be switched off.',
    required: true,
    enabled: true
  },
  {
    key: 'analytics',
    name: 'Analytics',
    description:
      'Help us understand how visitors use the site (pages viewed, time on site) so we can improve it. No data is sold.',
    required: false,
    enabled: true
  },
  {
    key: 'functional',
    name: 'Functional',
    description:
      'Remember choices you make (like region or language) to provide a more personalized experience.',
    required: false,
    enabled: true
  },
  {
    key: 'marketing',
    name: 'Marketing',
    description:
      'Used to deliver relevant advertising and measure the effectiveness of our campaigns across other sites.',
    required: false,
    enabled: true
  }
];

// These values match what the site should look/behave like even if the DB
// is unreachable or hasn't been migrated yet — the banner still renders,
// and (safely) nothing non-essential loads until a visitor actively
// consents.
export const DEFAULT_COOKIE_SETTINGS = {
  bannerEnabled: true,
  bannerTitle: 'We value your privacy',
  bannerMessage:
    'We use cookies to run essential site features, understand how Chromatus.com is used, and — with your permission — personalize content and marketing. You can accept everything, reject non-essential cookies, or choose exactly what to allow.',
  acceptAllLabel: 'Accept All Cookies',
  rejectAllLabel: 'Reject All',
  settingsLabel: 'Cookie Settings',
  savePreferencesLabel: 'Save Preferences',
  policyLinkLabel: 'Cookie Policy',
  policyLinkUrl: '/cookie-policy',
  categories: DEFAULT_CATEGORIES,
  scripts: { analytics: '', functional: '', marketing: '' }
};

function safeParseJson(raw, fallback) {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

/** Merges saved categories with the default set so new/renamed keys never break old data. */
function normalizeCategories(rawCategories) {
  const saved = Array.isArray(rawCategories) ? rawCategories : [];
  return DEFAULT_CATEGORIES.map((def) => {
    const match = saved.find((c) => c?.key === def.key);
    if (!match) return { ...def };
    return {
      key: def.key,
      name: typeof match.name === 'string' && match.name.trim() ? match.name : def.name,
      description: typeof match.description === 'string' ? match.description : def.description,
      // "necessary" can never be turned off or made optional, regardless of what was saved.
      required: def.key === 'necessary' ? true : false,
      enabled: def.key === 'necessary' ? true : match.enabled !== false
    };
  });
}

function normalizeScripts(rawScripts) {
  const saved = rawScripts && typeof rawScripts === 'object' ? rawScripts : {};
  return {
    analytics: typeof saved.analytics === 'string' ? saved.analytics : '',
    functional: typeof saved.functional === 'string' ? saved.functional : '',
    marketing: typeof saved.marketing === 'string' ? saved.marketing : ''
  };
}

function rowToSettings(row) {
  if (!row) return { ...DEFAULT_COOKIE_SETTINGS };
  return {
    bannerEnabled: row.banner_enabled === 0 ? false : true,
    bannerTitle: row.banner_title || DEFAULT_COOKIE_SETTINGS.bannerTitle,
    bannerMessage: row.banner_message || DEFAULT_COOKIE_SETTINGS.bannerMessage,
    acceptAllLabel: row.accept_all_label || DEFAULT_COOKIE_SETTINGS.acceptAllLabel,
    rejectAllLabel: row.reject_all_label || DEFAULT_COOKIE_SETTINGS.rejectAllLabel,
    settingsLabel: row.settings_label || DEFAULT_COOKIE_SETTINGS.settingsLabel,
    savePreferencesLabel: row.save_preferences_label || DEFAULT_COOKIE_SETTINGS.savePreferencesLabel,
    policyLinkLabel: row.policy_link_label || DEFAULT_COOKIE_SETTINGS.policyLinkLabel,
    policyLinkUrl: row.policy_link_url || DEFAULT_COOKIE_SETTINGS.policyLinkUrl,
    categories: normalizeCategories(safeParseJson(row.categories, DEFAULT_CATEGORIES)),
    scripts: normalizeScripts(safeParseJson(row.scripts, DEFAULT_COOKIE_SETTINGS.scripts))
  };
}

/** Public/frontend read — always resolves, never throws. */
export async function getCookieConsentSettings() {
  const row = await safeRead(
    (db) => db.collection('cookie_consent_settings').findOne({ _id: 1 }),
    null
  );
  return rowToSettings(row);
}

export async function saveCookieConsentSettings(input) {
  const s = { ...DEFAULT_COOKIE_SETTINGS, ...input };
  const categories = normalizeCategories(s.categories);
  const scripts = normalizeScripts(s.scripts);

  return safeWrite((db) =>
    db.collection('cookie_consent_settings').updateOne(
      { _id: 1 },
      {
        $set: {
          banner_enabled: s.bannerEnabled ? 1 : 0,
          banner_title: s.bannerTitle,
          banner_message: s.bannerMessage,
          accept_all_label: s.acceptAllLabel,
          reject_all_label: s.rejectAllLabel,
          settings_label: s.settingsLabel,
          save_preferences_label: s.savePreferencesLabel,
          policy_link_label: s.policyLinkLabel,
          policy_link_url: s.policyLinkUrl,
          categories: JSON.stringify(categories),
          scripts: JSON.stringify(scripts)
        }
      },
      { upsert: true }
    )
  );
}
