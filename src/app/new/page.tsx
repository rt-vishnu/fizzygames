import type { Metadata } from "next";
import GameCard from "@/components/GameCard";
import { newestGames } from "@/lib/games";

export const metadata: Metadata = {
  title: "New games",
  description: "The latest additions to the Playpit catalogue.",
};

export default function NewPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <header className="animate-rise mb-6">
        <h1 className="text-3xl font-black tracking-tight text-ink">
          ✨ New games
        </h1>
        <p className="mt-1 text-body">Freshest first.</p>
      </header>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {newestGames().map((game) => (
          <GameCard key={game.slug} game={game} />
        ))}
      </div>
    </div>
  );
}
