"use client";

import GameCard from "./GameCard";
import { getGame } from "@/lib/games";
import { RECENT_KEY, useLocalList } from "@/lib/useLocalList";

export default function RecentlyPlayed() {
  const { items, ready, clear } = useLocalList(RECENT_KEY, 12);
  const games = items.map(getGame).filter((g) => g !== undefined);

  if (!ready || games.length === 0) return null;

  return (
    <section className="animate-rise">
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-ink">
            Jump back in
          </h2>
          <p className="text-sm text-body">Games you opened on this device.</p>
        </div>
        <button
          type="button"
          onClick={clear}
          className="shrink-0 text-sm font-semibold text-body hover:text-ink"
        >
          Clear
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {games.map((game) => (
          <GameCard key={game.slug} game={game} size="sm" />
        ))}
      </div>
    </section>
  );
}
