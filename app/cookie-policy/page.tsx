import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import Container from "@/components/Container";
import { getPageContent } from "@/lib/cms";
import { legal } from "@/data/content/misc";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = { title: "Cookie Policy — Chromatus Consulting" };

export default async function CookiePolicyPage() {
  const content = await getPageContent("legal_cookies", legal.cookies);
  const title = content?.title || "Cookie Policy";
  const updated = content?.updated || "Last updated: September 2026";
  const customBody = content?.body && Array.isArray(content.body) ? content.body : null;

  return (
    <>
      <PageHero
        eyebrow="Legal"
        title={title}
        body="How Chromatus Consulting uses cookies and similar technologies on this site."
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
                <h2 className="font-display text-lg font-semibold text-ink">1. What Are Cookies</h2>
            <p>
              Cookies are small text files placed on your device when you
              visit a website. They help the site function properly and
              help us understand how it is used.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-ink">2. How We Use Cookies</h2>
            <ul className="list-disc space-y-1.5 pl-5">
              <li><span className="font-medium text-ink/80">Essential cookies</span> — required for the site to function correctly, such as remembering your navigation state.</li>
              <li><span className="font-medium text-ink/80">Analytics cookies</span> — help us understand which pages are visited and how, so we can improve the site.</li>
              <li><span className="font-medium text-ink/80">Preference cookies</span> — remember choices you&apos;ve made, such as dismissing a banner.</li>
            </ul>
            <p>We do not use cookies to sell your personal information.</p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-ink">3. Managing Cookies</h2>
            <p>
              Most browsers let you control or delete cookies through their
              settings. Restricting cookies may affect how parts of this
              site function.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-ink">4. Changes to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect
              changes in the cookies and technologies this site uses.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-ink">5. Contact Us</h2>
            <p>
              Questions about this Cookie Policy can be sent to{" "}
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
