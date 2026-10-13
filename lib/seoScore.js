// Pure, client-safe scoring logic for the Admin -> SEO editor. Every check
// is informational (never blocks saving) — it just helps an admin catch
// common on-page SEO mistakes before publishing.

const CHECKS = [
  {
    id: 'title-present',
    label: 'Meta title is set',
    weight: 15,
    test: (f) => Boolean(f.metaTitle?.trim())
  },
  {
    id: 'title-length',
    label: 'Meta title is 30–60 characters',
    weight: 10,
    test: (f) => {
      const len = (f.metaTitle || '').trim().length;
      return len >= 30 && len <= 60;
    }
  },
  {
    id: 'description-present',
    label: 'Meta description is set',
    weight: 15,
    test: (f) => Boolean(f.metaDescription?.trim())
  },
  {
    id: 'description-length',
    label: 'Meta description is 70–160 characters',
    weight: 10,
    test: (f) => {
      const len = (f.metaDescription || '').trim().length;
      return len >= 70 && len <= 160;
    }
  },
  {
    id: 'keyword-in-title',
    label: 'Focus keyword appears in the meta title',
    weight: 10,
    test: (f) =>
      !f.focusKeyword?.trim() ||
      (f.metaTitle || '').toLowerCase().includes(f.focusKeyword.trim().toLowerCase())
  },
  {
    id: 'keyword-in-description',
    label: 'Focus keyword appears in the meta description',
    weight: 10,
    test: (f) =>
      !f.focusKeyword?.trim() ||
      (f.metaDescription || '').toLowerCase().includes(f.focusKeyword.trim().toLowerCase())
  },
  {
    id: 'canonical-or-default',
    label: 'Canonical URL is set (or will default to this page\u2019s own URL)',
    weight: 5,
    test: () => true
  },
  {
    id: 'og-image',
    label: 'Open Graph image is set',
    weight: 10,
    test: (f) => Boolean(f.ogImage?.trim())
  },
  {
    id: 'twitter-image',
    label: 'Twitter Card image is set (or falls back to the OG image)',
    weight: 5,
    test: (f) => Boolean(f.twitterImage?.trim() || f.ogImage?.trim())
  },
  {
    id: 'indexable',
    label: 'Page is indexable (or intentionally set to noindex)',
    weight: 5,
    test: () => true
  },
  {
    id: 'keywords-not-spammy',
    label: 'Meta keywords list is reasonably short (10 or fewer)',
    weight: 5,
    test: (f) => {
      if (!f.metaKeywords?.trim()) return true;
      return f.metaKeywords.split(',').filter((k) => k.trim()).length <= 10;
    }
  },
  {
    id: 'schema-present',
    label: 'Structured data (Schema.org/JSON-LD) is included',
    weight: 10,
    // Always true: every page automatically gets WebPage + BreadcrumbList
    // JSON-LD, with an optional custom override — see Schema & Advanced tab.
    test: () => true
  }
];

const TOTAL_WEIGHT = CHECKS.reduce((sum, c) => sum + c.weight, 0);

/**
 * Scores a form/entry object (same shape as the Admin -> SEO editor's
 * `editing` state) from 0-100, plus the individual pass/fail checks.
 */
export function scoreSeoEntry(fields = {}) {
  const results = CHECKS.map((check) => ({
    id: check.id,
    label: check.label,
    weight: check.weight,
    pass: Boolean(check.test(fields))
  }));
  const earned = results.filter((r) => r.pass).reduce((sum, r) => sum + r.weight, 0);
  const score = Math.round((earned / TOTAL_WEIGHT) * 100);
  return { score, results };
}

export function scoreLabel(score) {
  if (score >= 90) return { text: 'Excellent', className: 'bg-green-100 text-green-700' };
  if (score >= 70) return { text: 'Good', className: 'bg-lime-100 text-lime-700' };
  if (score >= 50) return { text: 'Needs work', className: 'bg-amber-100 text-amber-700' };
  return { text: 'Poor', className: 'bg-red-100 text-red-700' };
}
