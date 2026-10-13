import Container from "./Container";
import Reveal from "./Reveal";

const steps = [
  {
    stage: "01",
    title: "Define what matters",
    body: "We start by understanding the business question behind the brief, clarifying objectives, priorities, timelines, and challenges — so the research addresses the decision that truly matters.",
  },
  {
    stage: "02",
    title: "Build the evidence",
    body: "We bring together primary and secondary research — desk research, surveys, stakeholder interviews, field studies, and CAPI, CATI, and CAWI methodologies — to understand what's happening on the ground.",
  },
  {
    stage: "03",
    title: "Test, validate, refine",
    body: "We apply structured scrutiny throughout, using data checks, cross-tabulation, statistical techniques, and expert validation to strengthen the reliability of our findings.",
  },
  {
    stage: "04",
    title: "Turn insight into action",
    body: "We translate findings into clear conclusions, practical recommendations, and business direction — giving you a stronger basis for what comes next.",
  },
];

type ProcessProps = {
  content?: {
    eyebrow?: string;
    title?: string;
    text?: string;
    attribution?: string;
    steps?: Array<{ stage?: string; title: string; body: string }>;
  };
};

export default function Process({ content }: ProcessProps) {
  const eyebrow = content?.attribution || content?.eyebrow || "03 / Our approach";
  const title = content?.text || content?.title || "Evidence first. Insight driven. Action focused.";
  const displaySteps = content?.steps && content.steps.length > 0 ? content.steps : steps;

  return (
    <section className="bg-paper py-24">
      <Container>
        <p className="eyebrow"><span className="text-signal-dark">{eyebrow.includes("/") ? eyebrow.split("/")[0] + "/" : "03 /"}</span> {eyebrow.includes("/") ? eyebrow.split("/")[1] : eyebrow}</p>
        <h2 className="mt-3 max-w-lg font-display text-3xl font-semibold tracking-tight sm:text-[2.6rem]">
          {title}
        </h2>

        <div className="mt-14 grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
          {displaySteps.map((s, i) => (
            <Reveal key={s.stage || i} delay={i * 100}>
              <div
                className={`relative py-8 pr-8 lg:py-0 lg:pt-0 ${
                  i > 0 && i % 2 !== 0 ? "sm:border-l sm:border-line sm:pl-8" : ""
                } ${i > 0 ? "lg:border-l lg:border-line lg:pl-8" : ""}`}
              >
                <span className="font-display text-4xl font-semibold text-signal/30">
                  {s.stage || String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-ink">{s.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
