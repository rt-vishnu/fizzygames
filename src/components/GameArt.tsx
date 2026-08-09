import type { Game } from "@/lib/games";

/** Cheap deterministic hash so the artwork is stable across renders. */
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let s = seed || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 10000) / 10000;
  };
}

/**
 * Procedural cover art. Every game gets a distinct arrangement of blocks
 * derived from its slug, so the grid reads as a catalogue without shipping
 * a single bitmap.
 */
export default function GameArt({
  game,
  className = "",
}: {
  game: Game;
  className?: string;
}) {
  const [from, to] = game.art;
  const next = rng(hash(game.slug));
  const cells = Array.from({ length: 14 }, () => ({
    x: Math.round(next() * 15),
    y: Math.round(next() * 9),
    w: 1 + Math.round(next() * 2),
    o: 0.08 + next() * 0.3,
  }));
  const id = `art-${game.slug}`;

  return (
    <svg
      viewBox="0 0 16 10"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <rect width="16" height="10" fill={`url(#${id})`} />
      <g fill="#fff">
        {cells.map((c, i) => (
          <rect
            key={i}
            x={c.x}
            y={c.y}
            width={c.w}
            height="1"
            rx="0.4"
            opacity={c.o}
          />
        ))}
      </g>
      {/* Soft canvas wash so covers sit calmly on the sage page. */}
      <rect width="16" height="10" fill="#ffffff" opacity="0.12" />
    </svg>
  );
}
