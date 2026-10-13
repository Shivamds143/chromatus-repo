'use client';

import CookiePrivacySettingsForm from '@/components/admin/CookiePrivacySettingsForm';

export default function CookiePrivacyPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-navy mb-1">Cookie &amp; Privacy</h1>
      <p className="text-sm text-inkgray mb-6">
        Control the cookie consent banner, its buttons and policy links, and which tracking
        categories require visitor consent before running. Visitors can change their choice at any
        time from the &ldquo;Cookie Settings&rdquo; link in the footer.
      </p>
      <CookiePrivacySettingsForm />
    </div>
  );
}
