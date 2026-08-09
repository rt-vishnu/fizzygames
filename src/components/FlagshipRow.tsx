import Link from "next/link";
import GameArt from "./GameArt";
import { formatPlays, getCategory, type Game } from "@/lib/games";

/**
 * The big titles get a wider, more editorial treatment than the standard
 * card grid — description, controls and category all visible up front.
 */
export default function FlagshipRow({ games }: { games: Game[] }) {
  if (games.length === 0) return null;

  return (
    <section className="animate-rise">
      <div className="mb-3">
        <h2 className="text-xl font-extrabold tracking-tight text-ink">
          The big ones
        </h2>
        <p className="text-sm text-body">
          Full games with progression, upgrades and a save file.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {games.map((game) => (
          <Link
            key={game.slug}
            href={`/game/${game.slug}`}
            className="group relative flex overflow-hidden rounded-2xl bg-canvas ring-1 ring-line transition hover:-translate-y-0.5 hover:ring-brand/70"
          >
            <div className="relative w-32 shrink-0 sm:w-40">
              <GameArt
                game={game}
                className="absolute inset-0 h-full w-full transition duration-300 group-hover:scale-105"
              />
            </div>
            <div className="min-w-0 flex-1 p-4">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-lg font-black text-ink">
                  {game.title}
                </h3>
                <span className="shrink-0 rounded-full bg-brand/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-positive-deep">
                  {getCategory(game.category)?.name}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-body">
                {game.tagline}
              </p>
              <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-body">
                <span className="text-warning-content">★ {game.rating.toFixed(1)}</span>
                <span>{formatPlays(game.plays)} plays</span>
                <span className="text-mute">{game.controls}</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
