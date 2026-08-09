"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import GameArt from "./GameArt";
import { searchGames } from "@/lib/games";

export default function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => searchGames(query).slice(0, 6), [query]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={boxRef} className="relative w-full max-w-md">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!query.trim()) return;
          setOpen(false);
          router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          type="search"
          placeholder="Search games…  (press /)"
          aria-label="Search games"
          className="w-full rounded-full border border-line bg-canvas py-2 pl-10 pr-4 text-sm text-ink placeholder:text-mute focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-body"
        >
          🔍
        </span>
      </form>

      {open && query.trim() && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-line bg-canvas shadow-2xl shadow-ink/10">
          {results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-body">
              Nothing matches “{query}”.
            </p>
          ) : (
            <ul>
              {results.map((game) => (
                <li key={game.slug}>
                  <Link
                    href={`/game/${game.slug}`}
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                    }}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-canvas-soft"
                  >
                    <GameArt
                      game={game}
                      className="h-10 w-16 shrink-0 rounded-lg"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-ink">
                        {game.title}
                      </span>
                      <span className="block truncate text-xs text-body">
                        {game.tagline}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
