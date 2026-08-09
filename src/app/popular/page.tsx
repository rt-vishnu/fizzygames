import type { Metadata } from "next";
import GameCard from "@/components/GameCard";
import { popularGames } from "@/lib/games";

export const metadata: Metadata = {
  title: "Popular games",
  description: "The most played games on Playpit right now.",
};

export default function PopularPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <header className="animate-rise mb-6">
        <h1 className="text-3xl font-black tracking-tight text-ink">
          🔥 Popular games
        </h1>
        <p className="mt-1 text-body">Ranked by total plays.</p>
      </header>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {popularGames().map((game) => (
          <GameCard key={game.slug} game={game} />
        ))}
      </div>
    </div>
  );
}
