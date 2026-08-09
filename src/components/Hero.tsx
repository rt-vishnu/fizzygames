import Link from "next/link";
import GameArt from "./GameArt";
import { formatPlays, type Game } from "@/lib/games";

export default function Hero({ game }: { game: Game }) {
  return (
    <section className="animate-rise relative overflow-hidden rounded-3xl ring-1 ring-line">
      <GameArt game={game} className="absolute inset-0 h-full w-full" />
      {/* Light scrim: the hero copy is ink, so the art must be washed out
          toward canvas rather than darkened. */}
      <div className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas/92 to-canvas/25" />
      <div className="relative flex flex-col gap-4 p-6 sm:p-10 lg:max-w-2xl">
        <span className="w-fit rounded-full bg-warning/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-warning-content">
          Featured
        </span>
        <h1 className="text-3xl font-black leading-tight tracking-tight text-ink sm:text-5xl">
          {game.title}
        </h1>
        <p className="max-w-xl text-sm text-body sm:text-base">
          {game.description}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/game/${game.slug}`}
            className="rounded-full bg-brand px-6 py-3 text-sm font-bold text-ink shadow-lg shadow-brand/30 transition hover:brightness-110"
          >
            ▶ Play now
          </Link>
          <span className="text-sm text-body">
            <span className="text-warning-content">★ {game.rating.toFixed(1)}</span> ·{" "}
            {formatPlays(game.plays)} plays
          </span>
        </div>
      </div>
    </section>
  );
}
