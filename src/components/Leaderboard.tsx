"use client";

import { useHydrated, useRuns } from "@/lib/scores";
import { formatPlays, type Game } from "@/lib/games";

const MEDALS = ["🥇", "🥈", "🥉"];

function when(at: number): string {
  const mins = Math.round((Date.now() - at) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function Leaderboard({ game }: { game: Game }) {
  const runs = useRuns(game.slug);
  const hydrated = useHydrated();

  return (
    <section className="rounded-2xl bg-canvas p-5 ring-1 ring-line">
      <h2 className="text-lg font-extrabold tracking-tight text-ink">
        Your best runs
      </h2>
      <p className="mb-4 text-xs text-body">
        Scores this browser has recorded. Nothing leaves your device.
      </p>

      {!hydrated ? (
        <div className="h-24 animate-pulse rounded-xl bg-canvas-soft" />
      ) : runs.length === 0 ? (
        <p className="rounded-xl bg-canvas-soft p-4 text-sm text-body">
          No runs yet. Finish a game and your score lands here.
        </p>
      ) : (
        <ol className="space-y-1">
          {runs.map((run, i) => (
            <li
              key={`${run.at}-${i}`}
              className="flex items-center gap-3 rounded-xl px-2 py-2 odd:bg-canvas-soft/60"
            >
              <span className="w-6 text-center text-sm font-bold text-body">
                {MEDALS[i] ?? i + 1}
              </span>
              <span className="font-bold tabular-nums text-ink">
                {formatScore(run.score)}
              </span>
              {run.meta && (
                <span className="truncate text-xs text-body">
                  {Object.entries(run.meta)
                    .map(([k, v]) => `${k} ${v}`)
                    .join(" · ")}
                </span>
              )}
              <span className="ml-auto shrink-0 text-xs text-mute">
                {when(run.at)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function formatScore(score: number): string {
  return score >= 100000 ? formatPlays(score) : score.toLocaleString();
}
