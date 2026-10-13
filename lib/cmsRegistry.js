// Registry of every editable content block in the site. Each entry maps a
// `key` (the same key page.js files pass to getPageContent) to the public
// route it powers, so the admin panel can list, link to, and edit them
// generically without any page-specific code.
export const CMS_PAGES = [
  { key: 'home', label: 'Homepage', route: '/', group: 'Home' },

  { key: 'aboutOverview', label: 'Overview', route: '/about', group: 'About Us' },
  { key: 'ourStory', label: 'Our Story', route: '/about/our-story', group: 'About Us' },
  { key: 'leadershipTeam', label: 'Leadership Team', route: '/about/leadership-team', group: 'About Us' },
  { key: 'valuesCulture', label: 'Values & Culture', route: '/about/values-culture', group: 'About Us' },
  { key: 'ourApproach', label: 'Our Approach', route: '/about/our-approach', group: 'About Us' },

  { key: 'servicesOverview', label: 'Overview', route: '/services', group: 'Services' },
  { key: 'consumerBehaviour', label: 'Consumer Behaviour', route: '/services/consumer-behaviour', group: 'Services' },
  { key: 'brandManagement', label: 'Brand Management', route: '/services/brand-management', group: 'Services' },
  { key: 'newProductLaunch', label: 'New Product Launch', route: '/services/new-product-launch', group: 'Services' },
  { key: 'satisfactionStudies', label: 'Satisfaction Studies', route: '/services/satisfaction-studies', group: 'Services' },
  { key: 'priceBenchmarking', label: 'Price Benchmarking', route: '/services/price-benchmarking', group: 'Services' },
  { key: 'locationFeasibilityStudy', label: 'Location Feasibility Study', route: '/services/location-feasibility-study', group: 'Services' },
  { key: 'baselineEndlineStudy', label: 'Baseline & Endline Study', route: '/services/baseline-endline-study', group: 'Services' },
  { key: 'marketAssessment', label: 'Market Assessment', route: '/services/market-assessment', group: 'Services' },
  { key: 'governmentSurveys', label: 'Government Surveys', route: '/services/government-surveys', group: 'Services' },

  { key: 'industriesOverview', label: 'Overview', route: '/industries', group: 'Industries' },
  { key: 'healthcare', label: 'Healthcare', route: '/industries/healthcare', group: 'Industries' },
  { key: 'automotiveTransportation', label: 'Automotive & Transportation', route: '/industries/automotive-transportation', group: 'Industries' },
  { key: 'foodBeverages', label: 'Food & Beverages', route: '/industries/food-beverages', group: 'Industries' },
  { key: 'telecomIt', label: 'Telecom & IT', route: '/industries/telecom-it', group: 'Industries' },
  { key: 'aerospaceDefense', label: 'Aerospace & Defense', route: '/industries/aerospace-defense', group: 'Industries' },
  { key: 'semiconductorsElectronics', label: 'Semiconductors & Electronics', route: '/industries/semiconductors-electronics', group: 'Industries' },
  { key: 'energyPower', label: 'Energy & Power', route: '/industries/energy-power', group: 'Industries' },
  { key: 'chemicalsMaterials', label: 'Chemicals & Materials', route: '/industries/chemicals-materials', group: 'Industries' },
  { key: 'beyondTheseEight', label: 'Beyond These Eight', route: '/industries/beyond-these-eight', group: 'Industries' },

  { key: 'insightsOverview', label: 'Overview', route: '/insights', group: 'Insights' },

  { key: 'careers', label: 'Careers Overview', route: '/careers', group: 'Careers' },
  { key: 'whoWeLookFor', label: 'Who We Look For', route: '/careers/who-we-look-for', group: 'Careers' },
  { key: 'diversityEquityInclusion', label: 'Diversity, Equity & Inclusion', route: '/careers/diversity-equity-inclusion', group: 'Careers' },
  { key: 'openPositions', label: 'Open Positions', route: '/careers/open-positions', group: 'Careers' },

  { key: 'contact', label: 'Contact Us', route: '/contact', group: 'Contact Us' },
  { key: 'faq', label: 'FAQ', route: '/faq', group: 'Other pages' },
  { key: 'legal_privacy', label: 'Privacy Policy', route: '/privacy-policy', group: 'Legal' },
  { key: 'legal_terms', label: 'Terms of Use', route: '/terms', group: 'Legal' },
  { key: 'legal_cookies', label: 'Cookie Policy', route: '/cookie-policy', group: 'Legal' }
];

export function getCmsPageMeta(key) {
  return CMS_PAGES.find((p) => p.key === key) || null;
}
