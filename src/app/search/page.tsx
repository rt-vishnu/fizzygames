import type { Metadata } from "next";
import Link from "next/link";
import GameCard from "@/components/GameCard";
import { CATEGORIES, searchGames } from "@/lib/games";

export const metadata: Metadata = {
  title: "Search",
  description: "Find a game to play.",
};

type Props = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const results = query ? searchGames(query) : [];

  return (
    <div className="mx-auto max-w-7xl">
      <header className="animate-rise mb-6">
        <h1 className="text-3xl font-black tracking-tight text-ink">
          {query ? `Results for “${query}”` : "Search"}
        </h1>
        <p className="mt-1 text-body">
          {query
            ? `${results.length} game${results.length === 1 ? "" : "s"} found.`
            : "Type in the box above to find a game."}
        </p>
      </header>

      {query && results.length === 0 ? (
        <div className="rounded-2xl bg-canvas p-8 ring-1 ring-line">
          <p className="text-body">
            No games matched that. Try a category instead:
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="rounded-full bg-canvas-soft px-4 py-2 text-sm font-semibold text-ink ring-1 ring-line hover:ring-brand"
              >
                {cat.emoji} {cat.name}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {results.map((game) => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}
