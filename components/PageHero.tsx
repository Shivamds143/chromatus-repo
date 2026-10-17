import SubpageBand from "./SubpageBand";

export default function PageHero({
  eyebrow,
  title,
  body,
  imageSrc,
  children,
  eyebrowColor,
}: {
  eyebrow: string;
  title: string;
  body: string;
  imageSrc?: string;
  children?: React.ReactNode;
  eyebrowColor?: string;
}) {
  const cleanEyebrow = eyebrow
    ? eyebrow
        .replace(/^[0-9]{1,2}\s*[\/—–-]\s*/, "")
        .replace(/^[A-Za-z\s]+\s*\/\s*/, "")
        .trim() || eyebrow
    : "";

  return (
    <SubpageBand>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        <div className="max-w-2xl">
          <p
            className="eyebrow eyebrow-dark"
            style={eyebrowColor ? { color: eyebrowColor } : undefined}
          >
            {cleanEyebrow}
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-paper/75">{body}</p>
          {children}
        </div>
        {imageSrc && (
          <div className="relative z-10 flex items-center justify-start lg:justify-end shrink-0">
            <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/95 p-3.5 shadow-2xl backdrop-blur transition hover:scale-[1.02]">
              <img
                src={imageSrc}
                alt={title}
                className="h-36 sm:h-44 w-auto max-w-[260px] sm:max-w-[320px] object-contain rounded-xl"
              />
            </div>
          </div>
        )}
      </div>
    </SubpageBand>
  );
}
