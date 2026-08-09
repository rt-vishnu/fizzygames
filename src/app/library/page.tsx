"use client";

import Link from "next/link";
import GameCard from "@/components/GameCard";
import { getGame } from "@/lib/games";
import { FAVORITES_KEY, RECENT_KEY, useLocalList } from "@/lib/useLocalList";

function Section({
  title,
  subtitle,
  slugs,
  onClear,
}: {
  title: string;
  subtitle: string;
  slugs: string[];
  onClear: () => void;
}) {
  const games = slugs.map(getGame).filter((g) => g !== undefined);

  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-ink">
            {title}
          </h2>
          <p className="text-sm text-body">{subtitle}</p>
        </div>
        {games.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 text-sm font-semibold text-body hover:text-ink"
          >
            Clear
          </button>
        )}
      </div>
      {games.length === 0 ? (
        <p className="rounded-2xl bg-canvas p-6 text-sm text-body ring-1 ring-line">
          Nothing here yet.{" "}
          <Link href="/" className="font-semibold text-positive-deep hover:underline">
            Find something to play →
          </Link>
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {games.map((game) => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function LibraryPage() {
  const favorites = useLocalList(FAVORITES_KEY, 60);
  const recent = useLocalList(RECENT_KEY, 12);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10">
      <header className="animate-rise">
        <h1 className="text-3xl font-black tracking-tight text-ink">
          💾 My library
        </h1>
        <p className="mt-1 text-body">
          Saved on this device only — no account required.
        </p>
      </header>

      {favorites.ready && (
        <>
          <Section
            title="Favourites"
            subtitle="Games you starred."
            slugs={favorites.items}
            onClear={favorites.clear}
          />
          <Section
            title="Recently played"
            subtitle="The last few you opened."
            slugs={recent.items}
            onClear={recent.clear}
          />
        </>
      )}
    </div>
  );
}
