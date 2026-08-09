import Link from "next/link";
import GameCard from "./GameCard";
import type { Game } from "@/lib/games";

export default function GameRow({
  title,
  subtitle,
  games,
  href,
}: {
  title: string;
  subtitle?: string;
  games: Game[];
  href?: string;
}) {
  if (games.length === 0) return null;

  return (
    <section className="animate-rise">
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-ink">
            {title}
          </h2>
          {subtitle && <p className="text-sm text-body">{subtitle}</p>}
        </div>
        {href && (
          <Link
            href={href}
            className="shrink-0 text-sm font-semibold text-positive-deep hover:underline"
          >
            See all →
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {games.map((game) => (
          <GameCard key={game.slug} game={game} />
        ))}
      </div>
    </section>
  );
}
