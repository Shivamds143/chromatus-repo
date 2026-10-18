import Icon from "./Icon";

type Tile = { label: string; icon: string };
type Step = { title: string; text: string; icon: string };
type ServiceVisual = {
  tilesTitle: string;
  tiles: Tile[];
  steps: Step[];
  outcome: string;
};

// Keyed by service slug. Labels are kept short and drawn from each service's
// own page copy. Icon names must exist in components/Icon.tsx.
const visuals: Record<string, ServiceVisual> = {
  "consumer-behaviour": {
    tilesTitle: "What we uncover",
    tiles: [
      { label: "Motivations", icon: "heart" },
      { label: "Triggers", icon: "compass" },
      { label: "Preferences", icon: "badge" },
      { label: "Barriers", icon: "shield" },
    ],
    steps: [
      { title: "Target groups", text: "Choose the consumers who matter", icon: "users" },
      { title: "Primary research", text: "Structured surveys with each group", icon: "file-text" },
      { title: "Pattern analysis", text: "By demographic, region, and occasion", icon: "chart-bar" },
      { title: "Decisions", text: "Product, pricing, and marketing", icon: "target" },
    ],
    outcome: "A clear view of what truly drives customer decisions.",
  },
  "brand-management": {
    tilesTitle: "What we assess",
    tiles: [
      { label: "Awareness", icon: "compass" },
      { label: "Perception", icon: "users" },
      { label: "Trust", icon: "shield" },
      { label: "Differentiation", icon: "badge" },
    ],
    steps: [
      { title: "Perception study", text: "How customers see you today", icon: "users-two" },
      { title: "Tracking research", text: "How that view changes over time", icon: "refresh" },
      { title: "Competitor benchmark", text: "Where you stand against rivals", icon: "chart-bar" },
      { title: "Brand diagnosis", text: "Strengths to keep, gaps to fix", icon: "target" },
    ],
    outcome: "Evidence to close perception gaps and build a more distinctive position.",
  },
  "new-product-launch": {
    tilesTitle: "Questions we answer",
    tiles: [
      { label: "Is there real demand?", icon: "chart-bar" },
      { label: "Who will buy it?", icon: "users" },
      { label: "Why would they choose it?", icon: "heart" },
      { label: "What should it cost?", icon: "badge" },
    ],
    steps: [
      { title: "Concept testing", text: "Test the idea with real buyers", icon: "flask" },
      { title: "Market assessment", text: "Size demand and map competitors", icon: "chart-bar" },
      { title: "Demand estimation", text: "How many will buy, and at what price", icon: "badge" },
      { title: "Positioning", text: "Decide how to present it", icon: "compass" },
    ],
    outcome: "A data-backed direction before you invest in launch.",
  },
  "satisfaction-studies": {
    tilesTitle: "What we find out",
    tiles: [
      { label: "Likes and dislikes", icon: "heart" },
      { label: "Expectation gaps", icon: "compass" },
      { label: "Service issues", icon: "shield" },
      { label: "Strengths to keep", icon: "badge" },
    ],
    steps: [
      { title: "Choose the audience", text: "B2B and B2C customers", icon: "users-two" },
      { title: "Run the survey", text: "Email, telephone, or face-to-face", icon: "mail" },
      { title: "Score and analyse", text: "CSAT and NPS across the journey", icon: "chart-bar" },
      { title: "Fix list", text: "What to improve first", icon: "target" },
    ],
    outcome: "A practical view of what to fix to improve satisfaction and retention.",
  },
  "price-benchmarking": {
    tilesTitle: "What we evaluate",
    tiles: [
      { label: "Competitive position", icon: "compass" },
      { label: "Price sensitivity", icon: "chart-bar" },
      { label: "Value perception", icon: "heart" },
      { label: "Pricing gaps", icon: "target" },
    ],
    steps: [
      { title: "Price mapping", text: "Competitor prices and structures", icon: "compass" },
      { title: "Value perception", text: "How customers judge what they get", icon: "users" },
      { title: "Willingness to pay", text: "What they will actually pay", icon: "chart-bar" },
      { title: "Pricing decision", text: "Set or review with evidence", icon: "target" },
    ],
    outcome: "Pricing based on market evidence, protecting margins while staying competitive.",
  },
  "location-feasibility-study": {
    tilesTitle: "What we assess",
    tiles: [
      { label: "Demand potential", icon: "chart-bar" },
      { label: "Demographics", icon: "users-two" },
      { label: "Competition", icon: "compass" },
      { label: "Infrastructure and regulation", icon: "factory" },
    ],
    steps: [
      { title: "Desk research", text: "Local market and demographic data", icon: "file-text" },
      { title: "Field research", text: "On-ground visits where needed", icon: "compass" },
      { title: "Stakeholder inputs", text: "Local voices and operators", icon: "handshake" },
      { title: "Site verdict", text: "Worth investing in, or not", icon: "target" },
    ],
    outcome: "Clear location decisions that reduce the risk of underperforming sites.",
  },
  "baseline-endline-study": {
    tilesTitle: "What we measure",
    tiles: [
      { label: "Starting point", icon: "compass" },
      { label: "The intervention", icon: "handshake" },
      { label: "Measured change", icon: "chart-bar" },
      { label: "Remaining gaps", icon: "target" },
    ],
    steps: [
      { title: "Baseline", text: "Record conditions before the programme", icon: "file-text" },
      { title: "Programme runs", text: "The intervention is delivered", icon: "handshake" },
      { title: "Endline", text: "Revisit the same indicators", icon: "refresh" },
      { title: "Impact report", text: "What changed, and what is left", icon: "chart-bar" },
    ],
    outcome: "Impact you can demonstrate with evidence, not assumptions.",
  },
  "market-assessment": {
    tilesTitle: "What we examine",
    tiles: [
      { label: "Size and growth", icon: "chart-bar" },
      { label: "Competition", icon: "target" },
      { label: "Drivers and restraints", icon: "compass" },
      { label: "Value chain", icon: "factory" },
    ],
    steps: [
      { title: "Research", text: "Primary interviews plus desk research", icon: "file-text" },
      { title: "Sizing and segments", text: "How big, and who is in it", icon: "chart-bar" },
      { title: "Competitive landscape", text: "DROC and Porter's Five Forces", icon: "target" },
      { title: "Strategic view", text: "Entry, investment, and growth", icon: "compass" },
    ],
    outcome: "A structured market view for planning, entry, and growth decisions.",
  },
  "government-surveys": {
    tilesTitle: "What we survey",
    tiles: [
      { label: "Socio-economic conditions", icon: "users-two" },
      { label: "Healthcare and education", icon: "heart-pulse" },
      { label: "Infrastructure and civic gaps", icon: "factory" },
      { label: "Traffic and mobility", icon: "compass" },
    ],
    steps: [
      { title: "Field investigation", text: "Investigators on the ground", icon: "compass" },
      { title: "Questionnaires", text: "Consistent, ward-level data", icon: "file-text" },
      { title: "Data validation", text: "Checks before analysis", icon: "shield" },
      { title: "Statistical analysis", text: "Priorities, now and later", icon: "chart-bar" },
    ],
    outcome: "Reliable ground-level evidence for planning and resource allocation.",
  },
};

export default function ServiceVisuals({ slug, cmsData }: { slug: string; cmsData?: any }) {
  const fallback = visuals[slug] || {};
  const tilesTitle = cmsData?.tilesTitle ?? fallback.tilesTitle ?? "What We Deliver";
  const tiles: Tile[] = Array.isArray(cmsData?.tiles) && cmsData.tiles.length > 0 ? cmsData.tiles : fallback.tiles || [];
  const rawSteps = Array.isArray(cmsData?.steps) && cmsData.steps.length > 0 ? cmsData.steps : fallback.steps || [];
  const steps: Step[] = rawSteps.map((s: any, idx: number) => ({
    title: s.title || `Step ${idx + 1}`,
    text: s.text || s.body || "",
    icon: s.icon || "target"
  }));
  const outcome = cmsData?.outcomeText ?? cmsData?.outcome ?? fallback.outcome;
  const metrics = Array.isArray(cmsData?.metrics) ? cmsData.metrics : [];

  const hasAny = tiles.length > 0 || steps.length > 0 || outcome || metrics.length > 0;
  if (!hasAny) return null;

  const v = { tilesTitle, tiles, steps, outcome };

  return (
    // `!mt-14` beats the parent's `space-y-5` spacing so this block sits clear of the text.
    <div className="!mt-14 space-y-12">
      <section aria-labelledby="service-uncover">
        <h2 id="service-uncover" className="eyebrow">
          {v.tilesTitle}
        </h2>
        <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4">
          {v.tiles.map((t) => (
            <li
              key={t.label}
              className="flex min-w-0 items-center gap-2 rounded-xl border border-line bg-white px-2.5 py-2.5 shadow-sm sm:gap-3 sm:px-4 sm:py-3"
            >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo/10 text-indigo-dark sm:h-9 sm:w-9">
                <Icon name={t.icon} className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
              </span>
              <span className="min-w-0 flex-1 break-words font-display text-xs font-medium leading-tight text-ink sm:text-sm sm:leading-snug">
                {t.label}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="service-method">
        <h2 id="service-method" className="eyebrow">
          How we run it
        </h2>
        <ol className="mt-4 grid gap-3 md:grid-cols-4 md:gap-6">
          {v.steps.map((s, i) => (
            <li
              key={s.title}
              className="relative rounded-xl border border-line bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo/10 text-indigo-dark">
                  <Icon name={s.icon} className="h-[18px] w-[18px]" />
                </span>
                <span className="font-mono text-[11px] text-signal-dark">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <p className="mt-3 font-display text-sm font-medium text-ink">{s.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate">{s.text}</p>
              {i < v.steps.length - 1 && (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="absolute -right-6 top-1/2 hidden h-6 w-6 -translate-y-1/2 text-signal md:block"
                >
                  <path
                    d="M8 12h8m0 0-3-3m3 3-3 3"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </li>
          ))}
        </ol>
      </section>

      <div className="border border-l-[3px] border-line border-l-signal bg-white px-5 py-4">
        <p className="mono-tag text-signal-dark">The outcome</p>
        <p className="mt-1.5 text-[0.95rem] leading-relaxed text-ink">{v.outcome}</p>
      </div>
    </div>
  );
}
