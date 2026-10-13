import Container from "./Container";
import Reveal from "./Reveal";

const quotes = [
  {
    quote:
      "When we needed a deeper cut on one market segment after delivery, the team turned it around fast without missing our timeline.",
    role: "Marketing Manager",
    org: "Healthcare IT company",
    initials: "HC",
    color: "#1F82C5",
  },
  {
    quote:
      "They understood our research need precisely and delivered insight that gave us a genuinely clearer read on our competitors.",
    role: "Brand Manager",
    org: "Fortune 300, chemicals & materials",
    initials: "F3",
    color: "#EA9322",
  },
  {
    quote:
      "The home healthcare findings lined up with our own internal data and opened up a real case for diversifying the business.",
    role: "Marketing Manager",
    org: "Home healthcare company",
    initials: "HH",
    color: "#3D9FDE",
  },
  {
    quote:
      "Detailed, country-by-country insight delivered quickly — it gave us a clear market picture when we needed one.",
    role: "Marketing Manager",
    org: "Telecom company",
    initials: "TC",
    color: "#C97614",
  },
];

function Stars() {
  return (
    <div className="flex gap-0.5 text-signal" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.5l2.9 6.3 6.9.7-5.2 4.6 1.6 6.8L12 17.8 5.8 21l1.6-6.8-5.2-4.6 6.9-.7L12 2.5z" />
        </svg>
      ))}
    </div>
  );
}

type TestimonialItem = {
  quote: string;
  author_name?: string;
  author_role?: string;
  company?: string;
  avatar_url?: string;
  role?: string;
  org?: string;
  initials?: string;
  color?: string;
};

const avatarColors = ["#1F82C5", "#EA9322", "#3D9FDE", "#C97614", "#15619B", "#F2AC52"];

export default function Testimonials({ items }: { items?: TestimonialItem[] }) {
  const displayQuotes = (items && items.length > 0)
    ? items.map((item, idx) => {
        const name = item.author_name || "";
        const computedInitials = name
          ? name
              .split(" ")
              .filter(Boolean)
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
          : item.initials || "CC";

        return {
          quote: item.quote,
          role: item.author_role || item.role || "Client",
          org: item.company || item.org || "Verified Client",
          initials: computedInitials,
          color: item.color || avatarColors[idx % avatarColors.length],
        };
      })
    : quotes;

  return (
    <section className="relative overflow-hidden bg-ink py-24 text-paper">
      <svg
        className="absolute inset-x-0 top-0 h-14 w-full text-paper-dim"
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path fill="currentColor" d="M0,0 C360,55 1080,55 1440,0 L1440,0 L0,0 Z" />
      </svg>
      <svg
        className="absolute inset-x-0 bottom-0 h-14 w-full text-signal"
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path fill="currentColor" d="M0,60 C360,5 1080,5 1440,60 L1440,60 L0,60 Z" />
      </svg>

      <Container className="relative">
        <p className="eyebrow text-paper/40"><span className="text-signal">05 /</span> Client reviews</p>
        <h2 className="mt-3 max-w-lg font-display text-3xl font-semibold tracking-tight sm:text-[2.6rem]">
          What it's like to work with us.
        </h2>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {displayQuotes.map((q, i) => (
            <Reveal key={i} delay={i * 90}>
              <figure className="flex h-full flex-col rounded-2xl border border-paper/10 bg-paper/[0.03] p-8 transition duration-300 hover:-translate-y-1 hover:border-signal/30 hover:bg-paper/[0.06]">
                <div className="flex items-center justify-between">
                  <span className="font-display text-3xl text-signal/50">&ldquo;</span>
                  <Stars />
                </div>
                <blockquote className="mt-2 flex-1 text-[0.95rem] leading-relaxed text-paper/75">
                  {q.quote}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-paper/10 pt-4">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                    style={{ backgroundColor: q.color }}
                  >
                    {q.initials}
                  </span>
                  <span className="text-xs">
                    <span className="block font-medium text-paper/80">{q.role}</span>
                    <span className="text-paper/40">{q.org}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
