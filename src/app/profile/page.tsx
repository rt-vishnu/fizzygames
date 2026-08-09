"use client";

import Link from "next/link";
import GameArt from "@/components/GameArt";
import { GAMES, getGame } from "@/lib/games";
import { useHydrated, useReset, useStats, useUnlocks } from "@/lib/scores";

function duration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ${mins - hours * 60}m`;
}

const TOTAL_ACHIEVEMENTS = GAMES.reduce(
  (n, g) => n + (g.achievements?.length ?? 0),
  0,
);

export default function ProfilePage() {
  const stats = useStats();
  const unlocks = useUnlocks();
  const hydrated = useHydrated();
  const reset = useReset();

  const unlockList = Object.values(unlocks).sort((a, b) => b.at - a.at);
  const played = Object.entries(stats.perGame)
    .map(([slug, s]) => ({ game: getGame(slug), ...s }))
    .filter((row) => row.game !== undefined)
    .sort((a, b) => b.runs - a.runs);

  const tiles = [
    { label: "Runs finished", value: stats.runs },
    { label: "Points scored", value: stats.totalScore.toLocaleString() },
    { label: "Time played", value: duration(stats.seconds) },
    {
      label: "Achievements",
      value: `${unlockList.length}/${TOTAL_ACHIEVEMENTS}`,
    },
  ];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <header className="animate-rise flex flex-wrap items-center gap-4">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand to-positive text-3xl">
          🎮
        </span>
        <div className="min-w-0">
          <h1 className="text-3xl font-black tracking-tight text-ink">
            Player profile
          </h1>
          <p className="text-body">
            Everything below is stored in this browser. No account, no server.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className="rounded-2xl bg-canvas p-4 ring-1 ring-line"
          >
            <p className="text-[11px] font-bold uppercase tracking-widest text-body">
              {tile.label}
            </p>
            <p className="mt-1 text-2xl font-black tabular-nums text-ink">
              {hydrated ? tile.value : "–"}
            </p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="mb-3 text-xl font-extrabold tracking-tight text-ink">
          Games played
        </h2>
        {!hydrated || played.length === 0 ? (
          <p className="rounded-2xl bg-canvas p-6 text-sm text-body ring-1 ring-line">
            Nothing recorded yet.{" "}
            <Link href="/" className="font-semibold text-positive-deep hover:underline">
              Go play something →
            </Link>
          </p>
        ) : (
          <ul className="space-y-2">
            {played.map((row) => (
              <li key={row.game!.slug}>
                <Link
                  href={`/game/${row.game!.slug}`}
                  className="flex items-center gap-4 rounded-2xl bg-canvas p-3 ring-1 ring-line transition hover:ring-brand/70"
                >
                  <GameArt
                    game={row.game!}
                    className="h-12 w-20 shrink-0 rounded-lg"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold text-ink">
                      {row.game!.title}
                    </span>
                    <span className="block text-xs text-body">
                      {row.runs} run{row.runs === 1 ? "" : "s"} ·{" "}
                      {duration(row.seconds)} played
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-[10px] uppercase tracking-widest text-body">
                      Best
                    </span>
                    <span className="block font-black tabular-nums text-warning-content">
                      {row.best.toLocaleString()}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-extrabold tracking-tight text-ink">
          Recent achievements
        </h2>
        {!hydrated || unlockList.length === 0 ? (
          <p className="rounded-2xl bg-canvas p-6 text-sm text-body ring-1 ring-line">
            No achievements unlocked yet. Each game has three or four.
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {unlockList.slice(0, 12).map((unlock) => {
              const game = getGame(unlock.game);
              return (
                <li
                  key={`${unlock.game}:${unlock.id}`}
                  className="flex items-start gap-3 rounded-2xl bg-warning/10 p-3 ring-1 ring-warning/40"
                >
                  <span aria-hidden="true" className="text-xl">
                    🏆
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-ink">
                      {unlock.label}
                    </span>
                    <span className="block text-xs text-body">
                      {game?.title ?? unlock.game}
                      {unlock.note ? ` · ${unlock.note}` : ""}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-line p-5">
        <h2 className="font-bold text-ink">Reset progress</h2>
        <p className="mt-1 text-sm text-body">
          Clears every score, achievement, unlock and saved game in this
          browser. There is no undo.
        </p>
        <button
          type="button"
          onClick={() => {
            if (confirm("Erase all Playpit progress in this browser?")) reset();
          }}
          className="mt-4 rounded-full bg-canvas-soft px-4 py-2 text-sm font-semibold text-negative-darkest ring-1 ring-line transition hover:bg-negative/10"
        >
          Erase everything
        </button>
      </section>
    </div>
  );
}
