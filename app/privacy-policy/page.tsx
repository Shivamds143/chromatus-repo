import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import Container from "@/components/Container";
import { getPageContent } from "@/lib/cms";
import { legal } from "@/data/content/misc";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = { title: "Privacy Policy — Chromatus Consulting" };

export default async function PrivacyPolicyPage() {
  const content = await getPageContent("legal_privacy", legal.privacy);
  const title = content?.title || "Privacy Policy";
  const updated = content?.updated || "Last updated: September 2026";
  const customBody = content?.body && Array.isArray(content.body) ? content.body : null;

  return (
    <>
      <PageHero
        eyebrow="Legal"
        title={title}
        body="How Chromatus Consulting collects, uses, and protects information shared with us."
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
                <h2 className="font-display text-lg font-semibold text-ink">1. Introduction</h2>
            <p>
              Chromatus Consulting (&ldquo;Chromatus,&rdquo; &ldquo;we,&rdquo;
              &ldquo;us,&rdquo; or &ldquo;our&rdquo;) respects your privacy
              and is committed to protecting the personal information you
              share with us — whether as a website visitor, prospective or
              current client, research respondent, or job applicant. This
              policy explains what information we collect, how we use it,
              and the choices you have.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-ink">2. Information We Collect</h2>
            <p>Depending on how you interact with us, we may collect:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Contact details you provide through our contact form or newsletter signup, such as name, email address, company, and the details of your enquiry.</li>
              <li>Information you share when applying for a role, such as your resume and work history.</li>
              <li>Information collected during research studies you participate in as a respondent, in line with the specific study&apos;s consent terms.</li>
              <li>Basic technical information such as browser type, device, and pages visited, collected automatically through standard web analytics.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-ink">3. How We Use Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Respond to enquiries and scope potential research and consulting engagements.</li>
              <li>Deliver, analyse, and report on research studies we are engaged to run.</li>
              <li>Evaluate job applications and communicate with candidates.</li>
              <li>Send newsletter updates you have opted in to receive, and improve this website.</li>
              <li>Meet legal, regulatory, and contractual obligations.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-ink">4. Research Respondent Data</h2>
            <p>
              Where Chromatus collects data from survey or interview
              respondents on behalf of a client, that data is used for the
              specific research purpose disclosed at the time of collection,
              handled under the confidentiality terms of the relevant
              project, and reported to clients in aggregate or anonymised
              form unless respondents have separately agreed otherwise.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-ink">5. Sharing of Information</h2>
            <p>
              We do not sell personal information. We may share information
              with client organisations who have commissioned a study (in
              aggregate or agreed form), with service providers who support
              our operations (such as hosting or email delivery) under
              confidentiality obligations, or where required by law.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-ink">6. Data Retention & Security</h2>
            <p>
              We retain personal information only as long as necessary for
              the purposes described in this policy, or as required by law
              or contractual obligation, and apply reasonable technical and
              organisational measures to protect it against unauthorised
              access, loss, or misuse.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-ink">7. Your Choices</h2>
            <p>
              You can ask us to access, correct, or delete personal
              information we hold about you, or opt out of newsletter
              communications at any time using the unsubscribe link or by
              contacting us directly. Research respondents can also raise
              questions about their participation through the study
              contact provided to them.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-ink">8. Contact Us</h2>
            <p>
              For any questions about this Privacy Policy or how your
              information is handled, contact us at{" "}
              <a href="mailto:info@chromatus.com" className="text-indigo hover:text-indigo-light">
                info@chromatus.com
              </a>{" "}
              or write to us at Sai Shilp, Near Universal, Warje, Pune 411052.
            </p>
          </div>
          </>
          )}
        </Container>
      </section>
    </>
  );
}
