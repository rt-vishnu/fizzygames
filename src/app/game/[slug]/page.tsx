import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Achievements from "@/components/Achievements";
import GamePlayer from "@/components/GamePlayer";
import GameRow from "@/components/GameRow";
import Leaderboard from "@/components/Leaderboard";
import {
  GAMES,
  formatPlays,
  getCategory,
  getGame,
  relatedGames,
} from "@/lib/games";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return GAMES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) return { title: "Game not found" };
  return {
    title: `${game.title} — play free online`,
    description: game.description,
  };
}

export default async function GamePage({ params }: Props) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  const category = getCategory(game.category);
  const related = relatedGames(game, 5);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <nav className="flex items-center gap-2 text-sm text-body">
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={`/category/${game.category}`} className="hover:text-ink">
          {category?.name}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-ink">{game.title}</span>
      </nav>

      <GamePlayer game={game} />

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-ink">
              {game.title}
            </h1>
            {game.flagship && (
              <span className="rounded-full bg-brand/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-positive-deep">
                Flagship
              </span>
            )}
          </div>
          <p className="mt-1 text-lg text-body">{game.tagline}</p>
          <p className="mt-4 max-w-2xl leading-relaxed text-body">
            {game.description}
          </p>

          <section className="mt-8">
            <h2 className="text-lg font-extrabold tracking-tight text-ink">
              How to play
            </h2>
            <ul className="mt-3 space-y-2">
              {game.howToPlay.map((line) => (
                <li
                  key={line}
                  className="flex gap-3 text-sm leading-relaxed text-body"
                >
                  <span aria-hidden="true" className="text-positive-deep">
                    ▸
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-8 flex flex-wrap gap-2">
            {game.tags.map((tag) => (
              <Link
                key={tag}
                href={`/tag/${encodeURIComponent(tag)}`}
                className="rounded-full bg-canvas px-3 py-1 text-xs font-semibold text-body ring-1 ring-line hover:text-ink"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl bg-canvas p-5 ring-1 ring-line">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-body">Rating</dt>
                <dd className="font-semibold text-warning-content">
                  ★ {game.rating.toFixed(1)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-body">Plays</dt>
                <dd className="font-semibold text-ink">
                  {formatPlays(game.plays)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-body">Category</dt>
                <dd className="font-semibold text-ink">{category?.name}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-body">Released</dt>
                <dd className="font-semibold text-ink">{game.releasedAt}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="shrink-0 text-body">Controls</dt>
                <dd className="text-right font-semibold text-ink">
                  {game.controls}
                </dd>
              </div>
            </dl>
          </div>

          <Leaderboard game={game} />
          <Achievements game={game} />
        </aside>
      </div>

      <GameRow title="You might also like" games={related} />
    </div>
  );
}
