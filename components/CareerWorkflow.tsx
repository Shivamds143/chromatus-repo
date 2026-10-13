"use client";

import { useState, useRef } from "react";
import Container from "@/components/Container";
import CareerApplicationForm from "@/components/CareerApplicationForm";

export type Role = {
  id?: number | string;
  slug?: string;
  title?: string;
  department?: string;
  location?: string;
  type?: string;
  summary?: string;
  description?: string;
  [key: string]: any;
};

type Props = {
  roles?: any[];
};

export default function CareerWorkflow({ roles = [] }: Props) {
  // If no roles are provided, fallback to the Business Developer role from screenshot
  const displayRoles: Role[] =
    roles && roles.length > 0
      ? roles
      : [
          {
            id: 1,
            slug: "business-developer",
            title: "Business Developer",
            department: "Sales",
            summary:
              "Want to gain maximum exposure while working for a leading organization? We are looking for a driven aspirant to maximize our brand value by widening our client base. The ideal candidate would be someone who fosters collaborative growth and loves to take on challenges.",
          },
        ];

  const [selectedRole, setSelectedRole] = useState<string>(
    displayRoles[0]?.title || "Business Developer"
  );
  const [showForm, setShowForm] = useState(false);
  const formSectionRef = useRef<HTMLDivElement>(null);

  const openingCount = displayRoles.length;
  const countLabel = openingCount.toString().padStart(2, "0");

  function handleApplyNow(roleTitle: string) {
    setSelectedRole(roleTitle);
    setShowForm(true);

    // Smooth scroll down to the application form
    setTimeout(() => {
      formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function handleResetRole() {
    setSelectedRole("General / Open Application");
  }

  return (
    <div>
      {/* Openings Section matching the reference design */}
      <section className="bg-[#f4f9f0] py-14 sm:py-20 border-b border-line/60">
        <Container>
          {/* Centered Heading: "Showing 01 Opening" */}
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl lg:text-4xl">
              Showing {countLabel} {openingCount === 1 ? "Opening" : "Openings"}
            </h2>
          </div>

          {/* Openings List */}
          <div className="mx-auto max-w-5xl space-y-6">
            {displayRoles.map((role, idx) => (
              <div
                key={role.id || role.slug || idx}
                className="group relative flex flex-col lg:flex-row lg:items-center justify-between gap-6 rounded-2xl border border-line/50 bg-white p-6 sm:p-8 shadow-xs transition duration-300 hover:shadow-md"
              >
                {/* Left Column: Role Title & Department */}
                <div className="lg:w-1/4 flex-shrink-0">
                  <h3 className="font-display text-xl font-bold text-ink sm:text-2xl leading-tight">
                    {role.title}
                  </h3>
                  {role.department && (
                    <p className="mt-1 text-sm font-medium text-slate">
                      {role.department}
                    </p>
                  )}
                  {role.type && (
                    <span className="inline-block mt-2 text-xs font-semibold text-slate/80 bg-paper-dim px-2.5 py-0.5 rounded-full">
                      {role.type}
                    </span>
                  )}
                </div>

                {/* Middle Column: Summary / Description */}
                <div className="lg:w-1/2 flex-grow">
                  <p className="text-sm sm:text-base leading-relaxed text-slate">
                    {role.summary || role.description}
                  </p>
                </div>

                {/* Right Column: Green Apply Now Button */}
                <div className="lg:w-auto flex-shrink-0 flex items-center justify-start lg:justify-end">
                  <button
                    type="button"
                    onClick={() => handleApplyNow(role.title || "Business Developer")}
                    className="inline-flex items-center justify-center rounded-lg bg-[#8cc63f] hover:bg-[#7db934] active:scale-[0.98] px-7 py-3 text-sm font-semibold text-white shadow-xs transition duration-200 cursor-pointer"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick link for General applications */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate">
              Don&apos;t see a role that fits your background?{" "}
              <button
                type="button"
                onClick={() => handleApplyNow("General / Open Application")}
                className="font-semibold text-indigo underline underline-offset-4 hover:text-indigo-dark transition cursor-pointer"
              >
                Submit a general application &rarr;
              </button>
            </p>
          </div>
        </Container>
      </section>

      {/* Application Form Section: Appears only when Apply Now is clicked */}
      {showForm && (
        <section
          id="apply"
          ref={formSectionRef}
          className="py-16 sm:py-20 bg-paper-dim/40 border-t border-line/60 transition-all duration-500"
        >
          <Container>
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-line">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#8cc63f] animate-pulse" />
                <span className="text-sm font-semibold text-ink">
                  Application Form &bull; {selectedRole}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-slate hover:text-ink hover:border-slate/40 transition cursor-pointer"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Close form
              </button>
            </div>

            <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] items-start">
              {/* Left Column: Why Work With Us */}
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo">Join Our Talent Network</p>
                  <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                    Ready to ask better questions?
                  </h2>
                  <p className="mt-4 text-base font-medium leading-relaxed text-slate-700">
                    Whether you are an experienced researcher or a fresh graduate with an analytical mindset, we want to hear from you. 
                    Share your CV with us and let us know what drives your curiosity.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-3.5 rounded-xl border border-line bg-white p-4 shadow-2xs">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo/10 text-indigo">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-ink">Direct Review by Team Leads</h3>
                      <p className="mt-0.5 text-xs font-medium text-slate-600">Every resume is evaluated directly by our practice leaders, not automated filters.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 rounded-xl border border-line bg-white p-4 shadow-2xs">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo/10 text-indigo">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-ink">Accepted Formats</h3>
                      <p className="mt-0.5 text-xs font-medium text-slate-600">We accept PDF (.pdf) and Microsoft Word (.doc, .docx) formats up to 10MB.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 rounded-xl border border-line bg-white p-4 shadow-2xs">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo/10 text-indigo">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-ink">Prompt Communication</h3>
                      <p className="mt-0.5 text-xs font-medium text-slate-600">Candidates shortlisted for discussions are usually notified within 3-5 business days.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-paper p-5 text-xs font-medium text-slate-700">
                  Questions regarding recruitment or hiring processes? You can reach our HR team at{" "}
                  <a href="mailto:info@chromatus.com" className="font-bold text-indigo underline">
                    info@chromatus.com
                  </a>
                  .
                </div>
              </div>

              {/* Right Column: The Career Application Form */}
              <div>
                <CareerApplicationForm
                  initialPosition={selectedRole}
                  onResetPosition={handleResetRole}
                />
              </div>
            </div>
          </Container>
        </section>
      )}
    </div>
  );
}
