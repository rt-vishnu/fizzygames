"use client";

import { useGameUnlocks, useHydrated } from "@/lib/scores";
import type { Game } from "@/lib/games";

export default function Achievements({ game }: { game: Game }) {
  const unlocks = useGameUnlocks(game.slug);
  const hydrated = useHydrated();
  const defs = game.achievements ?? [];

  if (defs.length === 0) return null;

  const earned = new Set(unlocks.map((u) => u.id));
  const count = hydrated ? earned.size : 0;

  return (
    <section className="rounded-2xl bg-canvas p-5 ring-1 ring-line">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-extrabold tracking-tight text-ink">
          Achievements
        </h2>
        <span className="text-sm font-semibold text-body">
          {count}/{defs.length}
        </span>
      </div>

      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-canvas-soft">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand to-positive transition-all duration-500"
          style={{ width: `${(count / defs.length) * 100}%` }}
        />
      </div>

      <ul className="space-y-2">
        {defs.map((def) => {
          const got = hydrated && earned.has(def.id);
          return (
            <li
              key={def.id}
              className={[
                "flex items-start gap-3 rounded-xl p-3 ring-1 transition",
                got
                  ? "bg-warning/10 ring-warning/40"
                  : "bg-canvas-soft/50 ring-line",
              ].join(" ")}
            >
              <span
                aria-hidden="true"
                className={got ? "text-xl" : "text-xl grayscale opacity-40"}
              >
                {def.icon}
              </span>
              <span className="min-w-0">
                <span
                  className={[
                    "block text-sm font-bold",
                    got ? "text-ink" : "text-body",
                  ].join(" ")}
                >
                  {def.name}
                </span>
                <span className="block text-xs text-body">{def.hint}</span>
              </span>
              {got && (
                <span className="ml-auto shrink-0 text-xs font-bold text-warning-content">
                  ✓
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
