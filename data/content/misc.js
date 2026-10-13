export const careers = {
  eyebrow: '05 / CAREERS',
  title: 'Build your career around better questions.',
  lead: 'At Chromatus, curiosity is part of the job. Good research starts with a good question — we look for curious minds, analytical thinkers, and people who want to keep learning.',
  illustration: 'careersHero',
  cta: { label: 'Explore opportunities', href: '#open-roles' },
  whoWeLookFor: {
    eyebrow: 'WHO WE LOOK FOR',
    title: 'Curious minds. Analytical thinkers. People who want to keep learning.',
    lead: 'We value people who are comfortable asking "why?", willing to explore unfamiliar subjects, and able to turn information into clear thinking. You may be starting your career or already have experience in research, analytics, consulting, or a specialised industry. What matters is your ability to learn quickly, think critically, work with others, and take ownership of your work.',
    qualities: [
      { title: 'Curiosity', body: 'You want to understand how things work.' },
      { title: 'Analytical thinking', body: 'You can find patterns and meaning in information.' },
      { title: 'Attention to detail', body: 'You know that reliable research depends on getting the details right.' },
      { title: 'Communication skills', body: 'You can explain findings clearly, without making them unnecessarily complicated.' },
      { title: 'Ownership', body: 'You take responsibility for the quality of your work.' },
      { title: 'Adaptability', body: 'You are comfortable moving between industries, topics, and research questions.' }
    ]
  },
  stats: [
    { value: '8', label: 'Industry verticals we track' },
    { value: '20+', label: 'Dedicated researchers' },
    { value: '60+', label: 'Field investigators across India' }
  ],
  // Default opening sample matching the reference design:
  fallbackRoles: [
    {
      id: 1,
      slug: 'business-developer',
      title: 'Business Developer',
      department: 'Sales',
      location: 'Pune / Remote',
      type: 'Full-time',
      summary:
        'Want to gain maximum exposure while working for a leading organization? We are looking for a driven aspirant to maximize our brand value by widening our client base. The ideal candidate would be someone who fosters collaborative growth and loves to take on challenges.',
      description:
        'Want to gain maximum exposure while working for a leading organization? We are looking for a driven aspirant to maximize our brand value by widening our client base. The ideal candidate would be someone who fosters collaborative growth and loves to take on challenges.',
      is_active: 1,
      sort_order: 0,
      posted_at: '2025-01-01'
    }
  ]
};

export const contact = {
  eyebrow: '06 / CONTACT US',
  title: 'Have a hard thing worth solving?',
  lead: "Tell us where you want to go. We'll help you find the way there.",
  details: {
    address: 'Sai Shilp, Near Universal, Warje, Pune 411052',
    phone: '+91 7249004985',
    email: 'info@chromatus.com',
    hours: 'Monday – Friday, 9AM to 8PM'
  },
  form: {
    nameLabel: 'Your name',
    namePlaceholder: 'Jane Smith',
    emailLabel: 'Work email',
    emailPlaceholder: 'jane@company.com',
    messageLabel: 'How can we help?',
    messagePlaceholder: 'A little about your challenge...',
    submitLabel: 'Send an inquiry'
  }
};

export const chromatusPro = {
  eyebrow: 'CHROMATUS PRO',
  title: "Schedule a consultation and let's solve something extraordinary together.",
  lead:
    'CHROMATUS PRO is our direct line to the practice — a fast path to the right specialists for your challenge, no matter which discipline it touches.',
  bullets: [
    'A dedicated consultant reviews your challenge',
    'A discovery call to scope the right team and approach',
    'A proposal with a clear roadmap for the work ahead'
  ],
  form: {
    nameLabel: 'Your name',
    namePlaceholder: 'Jane Smith',
    emailLabel: 'Work email',
    emailPlaceholder: 'jane@company.com',
    companyLabel: 'Company name',
    companyPlaceholder: 'Acme Inc.',
    messageLabel: 'How can we help?',
    messagePlaceholder: 'A little about your challenge...',
    submitLabel: 'Send an inquiry'
  }
};

export const legal = {
  privacy: {
    title: 'Privacy Policy',
    updated: 'Last updated: June 2024',
    body: [
      'Chromatus Consulting ("Chromatus", "we", "us") respects your privacy. This policy explains what information we collect through this website, how we use it, and the choices you have.',
      'We collect information you provide directly, such as through our contact and CHROMATUS PRO forms (name, work email, company, and message) and newsletter sign-ups (email address). We also collect standard technical information such as browser type and pages visited, to help us improve the site.',
      'We use this information to respond to inquiries, deliver the services you request, send newsletters you have opted into, and improve our website. We do not sell your personal information.',
      'You may request access to, correction of, or deletion of your information at any time by contacting info@chromatus.com.'
    ]
  },
  terms: {
    title: 'Terms of Use',
    updated: 'Last updated: June 2024',
    body: [
      'By accessing this website, you agree to these Terms of Use. If you do not agree, please do not use this site.',
      'All content on this site — including text, graphics, logos, and the Chromatus name and marks — is the property of Chromatus Consulting or its licensors and is protected by applicable intellectual property laws.',
      'This site and its content are provided "as is" without warranties of any kind. Chromatus is not liable for any damages arising from your use of this site.',
      'We may update these terms from time to time. Continued use of the site after changes are posted constitutes acceptance of the revised terms.'
    ]
  },
  cookies: {
    title: 'Cookie Policy',
    updated: 'Last updated: June 2024',
    body: [
      'This site uses cookies and similar technologies to remember your preferences, understand how visitors use the site, and improve your experience.',
      'Essential cookies are required for the site to function, including basic navigation and form submission. Analytics cookies help us understand aggregate site usage.',
      'You can control or disable cookies through your browser settings. Disabling certain cookies may affect the functionality of parts of this website.'
    ]
  }
};

export const faq = {
  eyebrow: 'FAQ',
  title: 'Common questions.',
  body: "If you don't see your question here, it's usually faster to just ask us directly."
};
