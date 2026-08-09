import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import GameCard from "@/components/GameCard";
import { allTags, gamesWithTag } from "@/lib/games";

type Props = { params: Promise<{ tag: string }> };

export function generateStaticParams() {
  return allTags().map(({ tag }) => ({ tag }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const label = decodeURIComponent(tag);
  return {
    title: `${label} games`,
    description: `Every Playpit game tagged ${label}.`,
  };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const label = decodeURIComponent(tag);
  const games = gamesWithTag(label);
  if (games.length === 0) notFound();

  const others = allTags().filter((t) => t.tag !== label);

  return (
    <div className="mx-auto max-w-7xl">
      <header className="animate-rise mb-6">
        <h1 className="text-3xl font-black tracking-tight text-ink">
          #{label}
        </h1>
        <p className="mt-1 text-body">
          {games.length} game{games.length === 1 ? "" : "s"} with this tag.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {games.map((game) => (
          <GameCard key={game.slug} game={game} />
        ))}
      </div>

      <h2 className="mb-3 mt-10 text-lg font-extrabold tracking-tight text-ink">
        Other tags
      </h2>
      <div className="flex flex-wrap gap-2">
        {others.map(({ tag: other, count }) => (
          <Link
            key={other}
            href={`/tag/${encodeURIComponent(other)}`}
            className="rounded-full bg-canvas px-3 py-1.5 text-xs font-semibold text-body ring-1 ring-line hover:text-ink"
          >
            #{other}
            <span className="ml-1.5 text-mute">{count}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
