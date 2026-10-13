export const insightsOverview = {
  eyebrow: '04 / IDEAS IN MOTION',
  title: 'Insights to Help You Understand What\u2019s Next',
  lead: 'Markets change quickly. Customer expectations shift. New technologies emerge. Regulations evolve. Competitive landscapes rarely stay still. Our Resources hub brings together research, analysis, industry perspectives, and findings from our work across markets and sectors — giving you practical information to better understand what is happening today and where opportunities may emerge tomorrow. Explore our latest thinking, research findings, and project insights across industries and geographies.',
  illustration: 'insightsOverview',
  categories: [
    {
      icon: 'zap',
      title: 'Articles & Insights',
      href: '/insights/blogs-articles',
      body: 'Short, focused perspectives on market developments, emerging trends, changing customer behaviour, and business issues worth watching.'
    },
    {
      icon: 'database',
      title: 'Research Reports',
      href: '/insights/reports',
      body: 'Go deeper into specific markets, industries, and geographies with detailed research covering market dynamics, opportunities, competition, and growth outlooks.'
    },
    {
      icon: 'layers',
      title: 'Whitepapers',
      href: '/insights/whitepapers',
      body: 'Detailed analysis built around specific business questions, research themes, and market developments — designed for readers looking to go beyond the headlines.'
    },
    {
      icon: 'target',
      title: 'Case Studies',
      href: '/insights/case-studies',
      body: 'See how research translates into business decisions. Explore selected engagements covering market assessment, market entry, customer satisfaction, competitive intelligence, and other strategic challenges.'
    },
    {
      icon: 'users',
      title: 'Webinars & Events',
      href: '/insights/webinars-events',
      body: 'Live and recorded sessions with Chromatus practice leads.'
    }
  ]
};

// No fallback articles are seeded here — the source content provided for
// this site does not include real article/whitepaper/case-study copy, and
// inventing sample articles would misrepresent the company's work. Add real
// articles from Admin → Insights; every insights page already handles an
// empty list gracefully until then.
export const fallbackArticles = [];
