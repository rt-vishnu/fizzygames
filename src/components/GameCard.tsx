import Link from "next/link";
import GameArt from "./GameArt";
import { formatPlays, type Game } from "@/lib/games";

export default function GameCard({
  game,
  size = "md",
}: {
  game: Game;
  size?: "sm" | "md" | "lg";
}) {
  const pad = size === "lg" ? "p-4" : "p-3";
  const title = size === "lg" ? "text-lg" : "text-sm";

  return (
    <Link
      href={`/game/${game.slug}`}
      className="group relative block overflow-hidden rounded-2xl bg-canvas ring-1 ring-line transition duration-200 hover:-translate-y-1 hover:ring-brand/70 focus-visible:-translate-y-1 focus-visible:ring-brand focus-visible:outline-none"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <GameArt
          game={game}
          className="h-full w-full transition duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-transparent to-transparent" />
        <span className="absolute left-2 top-2 rounded-full bg-canvas/85 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-body backdrop-blur">
          {game.category}
        </span>
        <span className="absolute inset-0 grid place-items-center opacity-0 transition group-hover:opacity-100">
          <span className="rounded-full bg-brand px-4 py-2 text-sm font-bold text-ink shadow-lg shadow-brand/30">
            ▶ Play
          </span>
        </span>
      </div>
      <div className={pad}>
        <h3 className={`${title} truncate font-bold text-ink`}>{game.title}</h3>
        <p className="mt-1 flex items-center gap-2 text-xs text-body">
          <span className="text-warning-content">★ {game.rating.toFixed(1)}</span>
          <span aria-hidden="true">·</span>
          <span>{formatPlays(game.plays)} plays</span>
        </p>
      </div>
    </Link>
  );
}
