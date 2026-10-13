// Contact Us sub-page content — Contact Form, Office Locations, and General
// Inquiries. Each export is admin-editable via Website → Contact Us using
// the same generic content editor as every other page.

export const contactFormPage = {
  eyebrow: 'CONTACT US / CONTACT FORM',
  title: "Let's talk about what you're solving for.",
  lead: 'Share a few details and the right specialist will follow up.',
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

export const officeLocations = {
  eyebrow: 'CONTACT US / OFFICE LOCATIONS',
  title: 'Find us around the world.',
  lead: 'Our consultants work closely with clients across every region — here is where our teams are based.',
  offices: [
    {
      city: 'Pune (Headquarters)',
      address: 'Sai Shilp, Near Universal, Warje, Pune 411052, India',
      phone: '+91 7249004985',
      email: 'info@chromatus.com',
      mapUrl: 'https://maps.google.com/?q=Sai+Shilp+Warje+Pune'
    },
    {
      city: 'Remote / Global',
      address: 'Distributed team members working remotely.',
      phone: '+91 7249004985',
      email: 'info@chromatus.com',
      mapUrl: ''
    }
  ]
};

export const generalInquiries = {
  eyebrow: 'CONTACT US / GENERAL INQUIRIES',
  title: 'Reach the right team faster.',
  lead: "Not sure who to contact? Here's a quick directory for common requests.",
  departments: [
    { name: 'New business & partnerships', email: 'info@chromatus.com', body: 'Questions about our services, proposals, or partnering with Chromatus.' },
    { name: 'Careers & recruiting', email: 'info@chromatus.com', body: 'Questions about open roles, applications, or our internship programs.' },
    { name: 'Press & media', email: 'info@chromatus.com', body: 'Media inquiries, interview requests, and press materials.' },
    { name: 'Support', email: 'info@chromatus.com', body: 'Existing clients needing help with an ongoing engagement.' }
  ]
};
