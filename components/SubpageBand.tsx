import type { ReactNode } from "react";
import Container from "./Container";

// Honeycomb of pointy-top hexagons (the same shape as the logo mark). It is
// built once at module load, so it renders as plain SVG with no client JS.
const R = 22;
const CELL_W = Math.sqrt(3) * R;
const ROW_H = 1.5 * R;

// "row-col" -> [fill colour, fill opacity]. A handful of accent cells.
const ACCENTS: Record<string, [string, number]> = {
  "2-12": ["#1F82C5", 0.5],
  "3-14": ["#EA9322", 0.9],
  "5-11": ["#1F82C5", 0.3],
  "1-15": ["#F2AC52", 0.5],
  "4-15": ["#1F82C5", 0.55],
  "6-13": ["#EA9322", 0.35],
  "2-16": ["#1F82C5", 0.25],
};

type Cell = { points: string; fill: string; fillOpacity: number; strokeOpacity: number };

const cells: Cell[] = [];
for (let row = 0; row < 9; row++) {
  for (let col = 0; col < 18; col++) {
    const cx = col * CELL_W + (row % 2 ? CELL_W / 2 : 0) - 10;
    const cy = row * ROW_H + 12;
    // Fade in from left to right so the pattern never crowds the heading.
    const fade = Math.max(0, Math.min(1, (cx - 190) / 300));
    if (fade <= 0.02) continue;
    const points = Array.from({ length: 6 }, (_, k) => {
      const a = ((60 * k - 90) * Math.PI) / 180;
      return `${(cx + R * Math.cos(a)).toFixed(1)},${(cy + R * Math.sin(a)).toFixed(1)}`;
    }).join(" ");
    const accent = ACCENTS[`${row}-${col}`];
    cells.push({
      points,
      fill: accent ? accent[0] : "none",
      fillOpacity: accent ? Number((accent[1] * fade).toFixed(2)) : 0,
      strokeOpacity: Number((0.13 * fade).toFixed(3)),
    });
  }
}

/**
 * Shared header for every sub-page: a navy band with a honeycomb on the right
 * and an orange wave edge. `waveClass` is a Tailwind text-colour class that must
 * match the background of the section directly below, so the wave blends in
 * (e.g. "text-paper", "text-paper-dim", or "text-[#f4f9f0]").
 */
export default function SubpageBand({
  children,
  waveClass = "text-paper",
}: {
  children: ReactNode;
  waveClass?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-ink-soft text-paper">
      <svg
        viewBox="0 0 640 300"
        preserveAspectRatio="xMaxYMid slice"
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 h-full w-full opacity-25 sm:w-[64%] sm:opacity-70 md:opacity-100"
      >
        {cells.map((c, i) => (
          <polygon
            key={i}
            points={c.points}
            fill={c.fill}
            fillOpacity={c.fillOpacity}
            stroke="#ffffff"
            strokeOpacity={c.strokeOpacity}
            strokeWidth="1"
          />
        ))}
      </svg>

      <Container className="relative pb-28 pt-16 sm:pt-20">{children}</Container>

      <svg
        viewBox="0 0 680 26"
        preserveAspectRatio="none"
        aria-hidden="true"
        className={`absolute inset-x-0 -bottom-px h-8 w-full md:h-10 ${waveClass}`}
      >
        <path d="M0,26 V14 C110,-6 230,26 360,12 S580,-4 680,10 V26 Z" fill="currentColor" />
        <path
          d="M0,14 C110,-6 230,26 360,12 S580,-4 680,10"
          fill="none"
          stroke="#EA9322"
          strokeWidth="2"
        />
      </svg>
    </section>
  );
}
