import Link from "next/link";
import { CATEGORIES, gamesInCategory } from "@/lib/games";

export default function CategoryStrip() {
  return (
    <section className="animate-rise">
      <h2 className="mb-3 text-xl font-extrabold tracking-tight text-ink">
        Browse by category
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {CATEGORIES.map((cat) => {
          const count = gamesInCategory(cat.slug).length;
          return (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="rounded-2xl bg-canvas p-4 ring-1 ring-line transition hover:-translate-y-0.5 hover:ring-brand/70"
            >
              <span className="text-2xl" aria-hidden="true">
                {cat.emoji}
              </span>
              <p className="mt-2 font-bold text-ink">{cat.name}</p>
              <p className="text-xs text-body">
                {count} game{count === 1 ? "" : "s"}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
