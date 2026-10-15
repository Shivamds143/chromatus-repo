// Single source of truth for site structure.
// Mirrors the "New Website Design – Flow Chart" exactly:
// Home -> About Us / Services / Industries / Insights / Careers / Contact Us
// Each primary page (except Careers & Contact Us) has its own set of sub-pages.

export const primaryNav = [
  {
    label: 'About Us',
    href: '/about',
    description: 'Our story, mission, values, and the Chromatus difference.',
    children: [
      { label: 'Our Story', href: '/about/our-story' },
      { label: 'Leadership Team', href: '/about/leadership-team' },
      { label: 'Values & Culture', href: '/about/values-culture' },
      { label: 'Our Approach', href: '/about/our-approach' }
    ]
  },
  {
    label: 'Services',
    href: '/services',
    description: 'Research-backed answers before you commit resources.',
    children: [
      { label: 'Service Overview', href: '/services' },
      { label: 'Market Assessment', href: '/services/market-assessment' },
      { label: 'New Product Launch', href: '/services/new-product-launch' },
      { label: 'Consumer Behaviour', href: '/services/consumer-behaviour' },
      { label: 'Price Benchmarking', href: '/services/price-benchmarking' },
      { label: 'Satisfaction Studies', href: '/services/satisfaction-studies' },
      { label: 'Brand Management', href: '/services/brand-management' },
      { label: 'Location Feasibility Study', href: '/services/location-feasibility-study' },
      { label: 'Baseline & Endline Study', href: '/services/baseline-endline-study' },
      { label: 'Government Surveys', href: '/services/government-surveys' }
    ]
  },
  {
    label: 'Insights',
    href: '/insights',
    description: 'Thought leadership, articles, guides, and resources.',
    children: [
      { label: 'Resource Center', href: '/insights' },
      { label: 'Industry Reports', href: '/insights/industry-reports' },
      { label: 'Whitepapers', href: '/insights/whitepapers' },
      { label: 'Case Studies', href: '/insights/case-studies' },
      { label: 'Webinars & Events', href: '/insights/webinars-events' }
    ]
  },
  {
    label: 'Careers',
    href: '/careers',
    description: 'Open positions, culture, and why join our team.'
  },
  {
    label: 'Contact Us',
    href: '/contact',
    description: 'Get in touch, locations, and contact details.'
  }
];

// Renamed per brief: "Let's Talk" -> "CHROMATUS PRO"
export const chromatusPro = {
  label: 'CHROMATUS PRO',
  href: '/contact#contact-form',
  description: "Schedule a consultation and let's solve something extraordinary together."
};

// Footer / global element groupings (matches the flow chart's global elements band)
export const footerColumns = [
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Services', href: '/services' }
    ]
  },
  {
    title: 'Resources',
    links: [
      { label: 'Insights', href: '/insights' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' }
    ]
  }
];

export const socialLinks = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/chromatusconsulting', icon: 'linkedin' },
  { label: 'Twitter', href: 'https://twitter.com/Chromatus12', icon: 'twitter' },
  { label: 'Facebook', href: 'https://www.facebook.com/Chromatus-Consulting-100467295012830', icon: 'facebook' }
];

// Flat list of every route, used to build the sitemap and to seed the database.
export function getAllRoutes() {
  const routes = [{ label: 'Home', href: '/' }];
  primaryNav.forEach((item) => {
    routes.push({ label: item.label, href: item.href });
    if (item.children && Array.isArray(item.children)) {
      item.children.forEach((child) => {
        if (child.href !== item.href) routes.push({ label: child.label, href: child.href });
      });
    }
  });
  routes.push(chromatusPro);
  return routes;
}
