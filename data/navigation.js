// Single source of truth for site structure.
// Mirrors the "New Website Design – Flow Chart" exactly:
// Home -> About Us / Services / Industries / Insights / Careers / Contact Us
// Each primary page (except Careers & Contact Us) has its own set of sub-pages.

export const primaryNav = [
  {
    label: 'About Us',
    href: '/about-us',
    description: 'Our story, mission, values, and the Chromatus difference.',
    children: [
      { label: 'Our Story', href: '/about-us/our-story' },
      { label: 'Leadership Team', href: '/about-us/leadership-team' },
      { label: 'Values & Culture', href: '/about-us/values-culture' },
      { label: 'Awards & Recognitions', href: '/about-us/awards-recognitions' }
    ]
  },
  {
    label: 'Services',
    href: '/services',
    description: 'Research-backed answers before you commit resources.',
    children: [
      { label: 'Service Overview', href: '/services' },
      { label: 'Market Assessment', href: '/services/strategy-transformation' },
      { label: 'New Product Launch', href: '/services/technology-consulting' },
      { label: 'Consumer Behaviour', href: '/services/data-analytics' },
      { label: 'Price Benchmarking', href: '/services/cloud-digital-solutions' },
      { label: 'Satisfaction Studies', href: '/services/managed-services' },
      { label: 'Brand Management', href: '/services/engagement-models' },
      { label: 'Location Feasibility Study', href: '/services/location-feasibility-study' },
      { label: 'Baseline & Endline Study', href: '/services/baseline-endline-study' },
      { label: 'Government Surveys', href: '/services/government-surveys' }
    ]
  },
  {
    label: 'Industries',
    href: '/industries',
    description: 'Industries we serve and the problems we solve.',
    children: [
      { label: 'Industry Overview', href: '/industries' },
      { label: 'Energy & Power', href: '/industries/energy-power' },
      { label: 'Healthcare', href: '/industries/healthcare' },
      { label: 'Automotive & Transportation', href: '/industries/automotive-transportation' },
      { label: 'Food & Beverages', href: '/industries/food-beverages' },
      { label: 'Telecom & IT', href: '/industries/telecom-it' },
      { label: 'Aerospace & Defense', href: '/industries/aerospace-defense' },
      { label: 'Semiconductors & Electronics', href: '/industries/semiconductors-electronics' },
      { label: 'Chemicals & Materials', href: '/industries/chemicals-materials' },
      { label: 'Beyond These Eight', href: '/industries/beyond-these-eight' }
    ]
  },
  {
    label: 'Insights',
    href: '/insights',
    description: 'Thought leadership, articles, guides, and resources.',
    children: [
      { label: 'Resource Center', href: '/insights' },
      { label: 'Blogs & Articles', href: '/insights/blogs-articles' },
      { label: 'Whitepapers', href: '/insights/whitepapers' },
      { label: 'Case Studies', href: '/insights/case-studies' },
      { label: 'Reports', href: '/insights/reports' },
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
    href: '/contact-us',
    description: 'Get in touch, locations, and contact details.',
    children: [
      { label: 'Contact Overview', href: '/contact-us' },
      { label: 'Contact Form', href: '/contact-us/contact-form' },
      { label: 'Office Locations', href: '/contact-us/office-locations' },
      { label: 'General Inquiries', href: '/contact-us/general-inquiries' }
    ]
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
      { label: 'About Us', href: '/about-us' },
      { label: 'Services', href: '/services' },
      { label: 'Industries', href: '/industries' }
    ]
  },
  {
    title: 'Resources',
    links: [
      { label: 'Insights', href: '/insights' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact-us' }
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
