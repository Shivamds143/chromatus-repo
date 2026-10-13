import SubpageBand from "./SubpageBand";

export default function PageHero({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <SubpageBand>
      <p className="eyebrow !text-signal-light">{eyebrow}</p>
      <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl">
        {title}
      </h1>
      <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-paper/75">{body}</p>
      {children}
    </SubpageBand>
  );
}
