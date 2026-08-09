"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameArt from "./GameArt";
import { ASPECT_RATIO, type Game } from "@/lib/games";
import { recordPlaytime, recordRun, unlockAchievement } from "@/lib/scores";
import { FAVORITES_KEY, RECENT_KEY, useLocalList } from "@/lib/useLocalList";

type Flash = { text: string; note: string; id: number };

export default function GamePlayer({ game }: { game: Game }) {
  const [started, setStarted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [flash, setFlash] = useState<Flash | null>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const recent = useLocalList(RECENT_KEY, 12);
  const favorites = useLocalList(FAVORITES_KEY, 60);
  const isFavorite = favorites.items.includes(game.slug);

  const pushRecent = recent.push;
  useEffect(() => {
    if (started) pushRecent(game.slug);
  }, [started, game.slug, pushRecent]);

  const announce = useCallback((text: string, note: string) => {
    setFlash({ text, note, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 4000);
    return () => clearTimeout(t);
  }, [flash]);

  /**
   * Games report progress by postMessage. Only messages from this game's own
   * iframe are honoured, and every field is re-validated in `scores.ts` — a
   * page can post anything it likes, so none of this is taken on trust.
   */
  useEffect(() => {
    if (!started) return;

    const onMessage = (event: MessageEvent) => {
      const frame = frameRef.current;
      if (!frame || event.source !== frame.contentWindow) return;
      if (event.origin !== window.location.origin) return;

      const data = event.data;
      if (!data || typeof data !== "object") return;
      if (data.source !== "playpit-game" || data.game !== game.slug) return;

      if (data.type === "run") {
        const { rank } = recordRun(game.slug, data.score, data.meta);
        if (data.isBest) {
          announce("New personal best!", `${Number(data.score) || 0} points`);
        } else if (rank && rank <= 3) {
          announce(`Top ${rank} run`, "Added to this game's leaderboard");
        }
      } else if (data.type === "achievement") {
        const fresh = unlockAchievement(
          game.slug,
          data.id,
          data.label,
          data.note,
        );
        if (fresh) {
          announce(
            `🏆 ${typeof data.label === "string" ? data.label : "Achievement"}`,
            typeof data.note === "string" ? data.note : "Unlocked",
          );
        }
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [started, game.slug, announce]);

  // Bank the session length when the player stops or navigates away.
  useEffect(() => {
    if (!started) return;
    const openedAt = Date.now();
    const bank = () => recordPlaytime(game.slug, (Date.now() - openedAt) / 1000);
    window.addEventListener("pagehide", bank);
    return () => {
      window.removeEventListener("pagehide", bank);
      bank();
    };
  }, [started, game.slug]);

  const fullscreen = () => {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.().catch(() => {});
  };

  const reload = () => {
    const frame = frameRef.current;
    if (frame) {
      setLoaded(false);
      frame.src = game.embedUrl;
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl bg-canvas ring-1 ring-line">
      <div
        ref={wrapRef}
        // Below sm, a 16:9 game at phone width is only ~200px tall — too
        // short for the in-game start overlay to fit, clipping its play
        // button below the fold. Floor the height on small screens; aspect
        // ratio takes back over once there's width to spare.
        className="relative w-full min-h-[420px] bg-canvas-soft sm:min-h-0"
        style={{ aspectRatio: ASPECT_RATIO[game.aspect] }}
      >
        {started ? (
          <>
            <iframe
              ref={frameRef}
              src={game.embedUrl}
              title={game.title}
              onLoad={() => setLoaded(true)}
              allow="autoplay; fullscreen; gamepad; keyboard-map"
              // Bundled games are same-origin so they can keep their own high
              // scores; drop allow-same-origin for any third-party embed.
              sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-popups"
              className="h-full w-full border-0"
            />
            {!loaded && (
              <div className="absolute inset-0 grid place-items-center bg-canvas-soft text-sm text-body">
                Loading {game.title}…
              </div>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="group absolute inset-0 grid place-items-center"
            aria-label={`Play ${game.title}`}
          >
            <GameArt game={game} className="absolute inset-0 h-full w-full" />
            <span className="absolute inset-0 bg-canvas/55" />
            <span className="relative flex flex-col items-center gap-3">
              <span className="grid h-20 w-20 place-items-center rounded-full bg-brand text-3xl text-ink shadow-2xl shadow-brand/40 transition group-hover:scale-110">
                ▶
              </span>
              <span className="text-lg font-bold text-ink">
                Play {game.title}
              </span>
            </span>
          </button>
        )}

        {flash && (
          <div
            role="status"
            className="animate-rise pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-2xl border border-brand bg-canvas/95 px-4 py-2 text-center shadow-2xl shadow-ink/15"
          >
            <p className="text-sm font-bold text-ink">{flash.text}</p>
            <p className="text-xs text-body">{flash.note}</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-3">
        <button
          type="button"
          onClick={() => favorites.toggle(game.slug)}
          aria-pressed={isFavorite}
          className={[
            "rounded-full px-4 py-2 text-sm font-semibold transition",
            isFavorite
              ? "bg-warning/20 text-warning-content ring-1 ring-warning/50"
              : "bg-canvas-soft text-body ring-1 ring-line hover:text-ink",
          ].join(" ")}
        >
          {isFavorite ? "★ In your library" : "☆ Add to library"}
        </button>
        <button
          type="button"
          onClick={reload}
          disabled={!started}
          className="rounded-full bg-canvas-soft px-4 py-2 text-sm font-semibold text-body ring-1 ring-line transition hover:text-ink disabled:opacity-40"
        >
          ↻ Restart
        </button>
        <button
          type="button"
          onClick={fullscreen}
          className="ml-auto rounded-full bg-canvas-soft px-4 py-2 text-sm font-semibold text-body ring-1 ring-line transition hover:text-ink"
        >
          ⛶ Fullscreen
        </button>
      </div>
    </div>
  );
}
