import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GameCard from "@/components/GameCard";
import {
  CATEGORIES,
  type CategorySlug,
  gamesInCategory,
  getCategory,
} from "@/lib/games";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug as CategorySlug);
  if (!category) return { title: "Category not found" };
  return {
    title: `${category.name} games`,
    description: category.blurb,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategory(slug as CategorySlug);
  if (!category) notFound();

  const games = gamesInCategory(category.slug);

  return (
    <div className="mx-auto max-w-7xl">
      <header className="animate-rise mb-6">
        <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-ink">
          <span aria-hidden="true">{category.emoji}</span>
          {category.name} games
        </h1>
        <p className="mt-1 text-body">{category.blurb}</p>
      </header>

      {games.length === 0 ? (
        <p className="text-body">No games in this category yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {games.map((game) => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}
