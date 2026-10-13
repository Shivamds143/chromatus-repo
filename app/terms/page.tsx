import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import Container from "@/components/Container";
import { getPageContent } from "@/lib/cms";
import { legal } from "@/data/content/misc";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = { title: "Terms & Conditions — Chromatus Consulting" };

export default async function TermsPage() {
  const content = await getPageContent("legal_terms", legal.terms);
  const title = content?.title || "Terms & Conditions";
  const updated = content?.updated || "Last updated: September 2026";
  const customBody = content?.body && Array.isArray(content.body) ? content.body : null;

  return (
    <>
      <PageHero
        eyebrow="Legal"
        title={title}
        body="The terms that govern use of this site and engagement with Chromatus Consulting."
      />
      <section className="py-24">
        <Container className="max-w-2xl space-y-10 text-sm leading-relaxed text-slate">
          <p className="rounded-lg border border-line bg-paper-dim px-5 py-4 text-xs text-slate">
            {updated}
          </p>

          {customBody && customBody.length > 0 ? (
            <div className="space-y-6">
              {customBody.map((paragraph: string, idx: number) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <h2 className="font-display text-lg font-semibold text-ink">1. Acceptance of Terms</h2>
            <p>
              By accessing or using this website, you agree to be bound by
              these Terms &amp; Conditions. If you do not agree, please do
              not use this site.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-ink">2. Use of This Site</h2>
            <p>
              This website is provided for general information about
              Chromatus Consulting&apos;s services, industries, and
              capabilities. You agree to use it only for lawful purposes and
              not to attempt to disrupt its operation, misuse the contact
              or newsletter forms, or copy content for commercial
              redistribution without permission.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-ink">3. Intellectual Property</h2>
            <p>
              All content on this site — including text, research
              descriptions, graphics, and the Chromatus name and logo — is
              the property of Chromatus Consulting or its licensors and is
              protected by applicable intellectual property laws. Nothing on
              this site grants you a licence to use our name, logo, or
              content except as expressly permitted.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-ink">4. No Professional Advice</h2>
            <p>
              Content on this website — including service and industry
              descriptions — is provided for general informational purposes
              only and does not constitute business, financial, or legal
              advice. Any actual research or consulting engagement is
              governed by a separate, signed agreement between Chromatus
              Consulting and the client.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-ink">5. Third-Party Links</h2>
            <p>
              This site may link to third-party websites, including our
              social media profiles. We are not responsible for the content
              or practices of any third-party site.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-ink">6. Limitation of Liability</h2>
            <p>
              This site and its content are provided &ldquo;as is&rdquo;
              without warranties of any kind. To the fullest extent
              permitted by law, Chromatus Consulting is not liable for any
              indirect, incidental, or consequential damages arising from
              your use of this site.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-ink">7. Changes to These Terms</h2>
            <p>
              We may update these Terms &amp; Conditions from time to time.
              Continued use of the site after changes are posted constitutes
              acceptance of the revised terms.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-ink">8. Governing Law</h2>
            <p>
              These terms are governed by the laws of India, and any
              disputes arising from use of this site will be subject to the
              exclusive jurisdiction of the courts in Pune, Maharashtra.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-ink">9. Contact Us</h2>
            <p>
              Questions about these terms can be sent to{" "}
              <a href="mailto:info@chromatus.com" className="text-indigo hover:text-indigo-light">
                info@chromatus.com
              </a>.
            </p>
          </div>
          </>
          )}
        </Container>
      </section>
    </>
  );
}
