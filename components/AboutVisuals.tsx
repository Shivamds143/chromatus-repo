import Icon from "./Icon";

type Metric = { value: string; label: string; detail: string };
type Tile = { label: string; icon: string; description?: string };
type Step = { stage: string; title: string; text: string; icon: string };

type AboutVisual = {
  metricsTitle?: string;
  metrics?: Metric[];
  tilesTitle: string;
  tiles: Tile[];
  stepsTitle?: string;
  steps?: Step[];
  outcomeTag: string;
  outcomeText: string;
};

const aboutVisualsData: Record<string, AboutVisual> = {
  "our-story": {
    metricsTitle: "Scale & Track Record",
    metrics: [
      { value: "25+", label: "Years Experience", detail: "Quantitative & qualitative research depth" },
      { value: "350+", label: "Research Topics", detail: "Knowledge base across 12 business sectors" },
      { value: "60+", label: "Field Officers", detail: "On-ground investigation network across India" },
      { value: "8+", label: "Core Verticals", detail: "Deep industry-specialized practice teams" },
    ],
    tilesTitle: "Core Consulting Capabilities",
    tiles: [
      { label: "Primary Field Studies", icon: "compass", description: "Surveys, CATI/CAPI & ground investigations" },
      { label: "Secondary Synthesis", icon: "file-text", description: "Market data & competitive intelligence" },
      { label: "Market Engineering", icon: "chart-bar", description: "Gap analysis, forecasting & pricing models" },
      { label: "Executive Strategy", icon: "target", description: "Directives built for board-level decisions" },
    ],
    outcomeTag: "Our Guiding Promise",
    outcomeText: "We work at the intersection of research and consulting — ensuring every dataset translates directly into measurable strategic advantage.",
  },
  "values-culture": {
    metricsTitle: "Operating Principles",
    metrics: [
      { value: "100%", label: "Evidence-Backed", detail: "Zero unverified assumptions in our findings" },
      { value: "12", label: "Industry Practices", detail: "Deep sector context from day one" },
      { value: "20+", label: "In-House Analysts", detail: "Trained researchers, economists & statisticians" },
      { value: "Cross-Sector", label: "Multi-Disciplinary", detail: "Social, industrial & commercial breadth" },
    ],
    tilesTitle: "Core Values Behind Every Engagement",
    tiles: [
      { label: "Evidence Over Assumption", icon: "shield", description: "Rigorous scrutiny before findings reach clients" },
      { label: "Client-Centric Pragmatism", icon: "handshake", description: "Focused on the decision that truly matters" },
      { label: "Methodological Depth", icon: "flask", description: "Combining multi-channel quantitative & qualitative rigor" },
      { label: "Uncompromised Integrity", icon: "badge", description: "Objective truths, even when they challenge conventions" },
    ],
    outcomeTag: "Culture in Action",
    outcomeText: "We maintain working knowledge across 350+ topics so our clients rarely start from zero — we bring contextual depth from day one.",
  },
  "our-approach": {
    tilesTitle: "Research Methodologies We Deploy",
    tiles: [
      { label: "CAPI & CATI Surveys", icon: "chart-bar" },
      { label: "CAWI Digital Research", icon: "chip" },
      { label: "In-Depth Stakeholder Interviews", icon: "users" },
      { label: "Statistical Cross-Tabulation", icon: "file-text" },
    ],
    stepsTitle: "The Four-Stage Engagement Process",
    steps: [
      { stage: "01", title: "Define What Matters", text: "Clarify the core business question behind the brief.", icon: "target" },
      { stage: "02", title: "Build the Evidence", text: "Multi-modal primary fieldwork and secondary intelligence.", icon: "compass" },
      { stage: "03", title: "Test, Validate, Refine", text: "Data sanity checks, statistical rigor & expert validation.", icon: "shield" },
      { stage: "04", title: "Turn Insight into Action", text: "Clear conclusions, practical trade-offs & execution plans.", icon: "chart-bar" },
    ],
    outcomeTag: "The Approach Outcome",
    outcomeText: "Evidence First. Insight Driven. Action Focused. A repeatable, disciplined framework that eliminates uncertainty from high-stakes decisions.",
  },
};

export default function AboutVisuals({ slug }: { slug: string }) {
  const v = aboutVisualsData[slug];
  if (!v) return null;

  return (
    <div className="!mt-12 space-y-12">
      {/* Metrics Row */}
      {v.metrics && (
        <section aria-labelledby="about-metrics">
          <h2 id="about-metrics" className="eyebrow">
            {v.metricsTitle || "Key Highlights"}
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {v.metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-xl border border-line bg-bglight p-4 transition hover:border-indigo/40"
              >
                <div className="font-display text-2xl font-bold text-indigo sm:text-3xl">
                  {m.value}
                </div>
                <div className="mt-1 font-display text-xs font-semibold uppercase tracking-wider text-ink">
                  {m.label}
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-slate">{m.detail}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tiles Section */}
      <section aria-labelledby="about-tiles">
        <h2 id="about-tiles" className="eyebrow">
          {v.tilesTitle}
        </h2>
        <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {v.tiles.map((t) => (
            <li
              key={t.label}
              className="flex items-start gap-3.5 rounded-xl border border-line bg-white p-4 shadow-sm"
            >
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo/10 text-indigo-dark mt-0.5">
                <Icon name={t.icon} className="h-5 w-5" />
              </span>
              <div>
                <span className="font-display text-sm font-semibold text-ink block">{t.label}</span>
                {t.description && (
                  <p className="mt-1 text-xs text-slate leading-relaxed">{t.description}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Process Steps Section (if present) */}
      {v.steps && (
        <section aria-labelledby="about-steps">
          <h2 id="about-steps" className="eyebrow">
            {v.stepsTitle || "Execution Flow"}
          </h2>
          <ol className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {v.steps.map((s, i) => (
              <li
                key={s.title}
                className="relative rounded-xl border border-line bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo/10 text-indigo-dark">
                    <Icon name={s.icon} className="h-4 w-4" />
                  </span>
                  <span className="font-mono text-xs font-semibold text-signal-dark">
                    {s.stage}
                  </span>
                </div>
                <p className="mt-3 font-display text-sm font-semibold text-ink">{s.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Outcome Banner */}
      <div className="rounded-xl border border-l-4 border-line border-l-signal bg-paper-dim/60 p-5">
        <p className="mono-tag text-signal-dark">{v.outcomeTag}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink/90 sm:text-[0.95rem]">{v.outcomeText}</p>
      </div>
    </div>
  );
}
