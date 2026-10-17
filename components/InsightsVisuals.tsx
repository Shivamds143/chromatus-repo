import Icon from "./Icon";

type Feature = { label: string; text: string; icon: string };

type InsightVisual = {
  featuresTitle: string;
  features: Feature[];
  highlights: { tag: string; value: string }[];
  summaryNote: string;
};

const insightsVisualsData: Record<string, InsightVisual> = {
  "industry-reports": {
    featuresTitle: "What Each Report Delivers",
    features: [
      { label: "Market Sizing & 5-Year CAGR", text: "Quantitative projections across regions & sub-segments.", icon: "chart-bar" },
      { label: "Competitive Landscaping", text: "Tier 1 & emerging players, market share & strategic positioning.", icon: "target" },
      { label: "Value Chain & Supply Dynamics", text: "Material flows, manufacturing bottlenecks & margin analysis.", icon: "factory" },
      { label: "Regulatory & Policy Watch", text: "Global & domestic standards impacting commercialization.", icon: "shield" },
    ],
    highlights: [
      { tag: "Sectors Covered", value: "8 Key Industries" },
      { tag: "Update Cadence", value: "Quarterly & Annual" },
      { tag: "Format", value: "PDF & Data Appendices" },
      { tag: "Validation", value: "Primary Field Cross-Check" },
    ],
    summaryNote: "Every Chromatus report is grounded in primary stakeholder surveys and secondary intelligence — never automated scraping or unverified estimates.",
  },
  "whitepapers": {
    featuresTitle: "Deep-Dive Thematic Focus",
    features: [
      { label: "Strategic Problem Solving", text: "Focused inquiries into specific market pivots and disruptions.", icon: "compass" },
      { label: "Econometric Modeling", text: "Underlying elasticity, adoption curves and demand sensitivity.", icon: "flask" },
      { label: "Technology Evaluation", text: "Assessing readiness levels, patent landscapes and barriers.", icon: "chip" },
      { label: "Actionable Frameworks", text: "Evaluation scorecards and decision matrices for leadership.", icon: "file-text" },
    ],
    highlights: [
      { tag: "Depth", value: "Exhaustive Analysis" },
      { tag: "Target Audience", value: "CxO & Strategy Heads" },
      { tag: "Methodology", value: "Expert Delphi & Synthesis" },
      { tag: "Orientation", value: "Forward-Looking Trends" },
    ],
    summaryNote: "Designed for leaders seeking structured thinking beyond headline trends to guide long-term capital allocation.",
  },
  "case-studies": {
    featuresTitle: "Real Decisions, Proven Outcomes",
    features: [
      { label: "Market Entry Validation", text: "De-risking foreign market entry with ground-truth demand validation.", icon: "compass" },
      { label: "Product Pre-Launch CSAT", text: "Testing buyer willingness-to-pay and feature trade-offs.", icon: "heart" },
      { label: "Civic & Government Impact", text: "Ward-level field surveys guiding multi-crore public initiatives.", icon: "users-two" },
      { label: "Competitive Turnaround", text: "Pinpointing churn drivers to reclaim lost market share.", icon: "target" },
    ],
    highlights: [
      { tag: "Track Record", value: "Decade of Engagements" },
      { tag: "Client Types", value: "Enterprises & Public Bodies" },
      { tag: "Impact Scope", value: "Strategic & Operational" },
      { tag: "Results", value: "Quantified Value Delivered" },
    ],
    summaryNote: "Explore how Chromatus has partnered with leadership teams across industries to turn ambiguous market conditions into decisive action.",
  },
  "news-updates": {
    featuresTitle: "Firm Announcements & Milestones",
    features: [
      { label: "Research Publications", text: "New industry briefs, whitepapers and sector outlook releases.", icon: "file-text" },
      { label: "Conference & Keynotes", text: "Our leadership speaking at major industrial forums and symposia.", icon: "users" },
      { label: "Methodological Innovations", text: "Adoption of advanced survey toolkits, CAPI updates and statistical tools.", icon: "chip" },
      { label: "Firm Milestones", text: "Team expansions, regional field networks and partnership updates.", icon: "badge" },
    ],
    highlights: [
      { tag: "Frequency", value: "Regular Updates" },
      { tag: "Coverage", value: "National & Global" },
      { tag: "Media Contact", value: "press@chromatus.com" },
      { tag: "Archive", value: "Chronological Access" },
    ],
    summaryNote: "Stay connected with the latest research milestones, fieldwork expansions, and perspectives from Chromatus Consulting.",
  },
  "webinars-events": {
    featuresTitle: "What Our Sessions Cover",
    features: [
      { label: "Sector Outlooks", text: "Interactive forecasts and emerging industrial disruptions.", icon: "chart-bar" },
      { label: "Methodological Masterclasses", text: "Best practices in CATI/CAPI, sampling and ground validation.", icon: "flask" },
      { label: "Executive Q&A", text: "Direct access to practice directors and principal researchers.", icon: "users" },
      { label: "Dataset Appendices", text: "Downloadable presentation decks and reference datasets.", icon: "file-text" },
    ],
    highlights: [
      { tag: "Format", value: "Live & On-Demand" },
      { tag: "Audience", value: "Business Leaders" },
      { tag: "Duration", value: "45–60 Minutes" },
      { tag: "Access", value: "Complimentary" },
    ],
    summaryNote: "Every webinar translates complex market dynamics into actionable strategy, featuring ground-truth data from active Chromatus engagements.",
  },
};

export default function InsightsVisuals({ slug, cmsData }: { slug: string; cmsData?: any }) {
  const fallback = insightsVisualsData[slug];

  const highlights = (Array.isArray(cmsData?.metrics) && cmsData.metrics.length > 0)
    ? cmsData.metrics.map((m: any) => ({ tag: m.label, value: m.value }))
    : fallback?.highlights || [];

  const features = (Array.isArray(cmsData?.tiles) && cmsData.tiles.length > 0)
    ? cmsData.tiles.map((t: any) => ({ label: t.label, text: t.description || "", icon: t.icon || "target" }))
    : fallback?.features || [];

  const featuresTitle = cmsData?.tilesTitle || fallback?.featuresTitle || "Core Areas";
  const summaryNote = cmsData?.outcomeText || cmsData?.outcome || fallback?.summaryNote;

  if (highlights.length === 0 && features.length === 0 && !summaryNote) return null;

  return (
    <div className="!mt-10 space-y-8">
      {/* Highlights Bar */}
      {highlights.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {highlights.map((h: any, idx: number) => (
            <div key={h.tag || idx} className="rounded-xl border border-line bg-bglight p-3 text-center">
              <span className="mono-tag text-[10px] text-slate block">{h.tag}</span>
              <span className="font-display text-xs font-semibold text-ink sm:text-sm mt-0.5 block">
                {h.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Features Grid */}
      {features.length > 0 && (
        <section aria-labelledby="insights-features">
          <h3 id="insights-features" className="eyebrow">
            {featuresTitle}
          </h3>
          <div className="mt-3.5 grid gap-3 sm:grid-cols-2">
            {features.map((f: any, idx: number) => (
              <div
                key={f.label || idx}
                className="flex items-start gap-3 rounded-xl border border-line bg-white p-3.5 shadow-2xs"
              >
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo/10 text-indigo-dark mt-0.5">
                  <Icon name={f.icon || "target"} className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-display text-xs font-semibold text-ink sm:text-sm">{f.label}</p>
                  <p className="mt-1 text-xs text-slate leading-relaxed">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Summary Note */}
      {summaryNote && (
        <div className="rounded-xl border border-l-4 border-line border-l-signal bg-paper-dim/60 p-4">
          <p className="text-xs leading-relaxed text-ink/80 sm:text-[0.875rem]">
            <span className="font-semibold text-ink">Analytical Standard: </span>
            {summaryNote}
          </p>
        </div>
      )}
    </div>
  );
}
