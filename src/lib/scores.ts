"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * The portal's record of what the player has done: per-game score history,
 * unlocked achievements, and lifetime totals.
 *
 * Everything lives in localStorage. Games report runs by postMessage (see
 * `public/games/_shared/playpit.js`); `GamePlayer` validates those messages
 * and calls into here. Nothing a game sends is trusted — scores are clamped
 * and coerced before they are stored.
 */

const EVENT = "playpit:scores";

const RUNS_KEY = (slug: string) => `playpit:portal:runs:${slug}`;
const ACHIEVEMENTS_KEY = "playpit:portal:achievements";
const STATS_KEY = "playpit:portal:stats";

const MAX_RUNS = 10;

export type Run = {
  score: number;
  at: number;
  /** Free-form per-game detail, e.g. `{ wave: 7 }` or `{ track: "Coast" }`. */
  meta?: Record<string, string | number> | null;
};

export type Unlock = {
  game: string;
  id: string;
  label: string;
  note: string;
  at: number;
};

export type Stats = {
  runs: number;
  totalScore: number;
  seconds: number;
  perGame: Record<string, { runs: number; best: number; seconds: number }>;
};

const EMPTY_RUNS: Run[] = [];
const EMPTY_UNLOCKS: Unlock[] = [];
const EMPTY_STATS: Stats = { runs: 0, totalScore: 0, seconds: 0, perGame: {} };

/* -------------------------------------------------------------------------- *
 * Raw storage with a stable-snapshot cache (required by useSyncExternalStore)
 * -------------------------------------------------------------------------- */

const cache = new Map<string, { raw: string | null; value: unknown }>();

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    return fallback;
  }
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;

  let value: T = fallback;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed !== null && typeof parsed === "object") value = parsed as T;
    } catch {
      value = fallback;
    }
  }
  cache.set(key, { raw, value });
  return value;
}

function writeJSON(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or private mode — progress simply won't persist */
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/* -------------------------------------------------------------------------- *
 * Writes
 * -------------------------------------------------------------------------- */

/** Coerce whatever a game sent into a small, safe meta object. */
function cleanMeta(meta: unknown): Run["meta"] {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return null;
  const out: Record<string, string | number> = {};
  let n = 0;
  for (const [k, v] of Object.entries(meta as Record<string, unknown>)) {
    if (n >= 6) break;
    if (typeof k !== "string" || k.length > 24) continue;
    if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
    else if (typeof v === "string") out[k] = v.slice(0, 40);
    else continue;
    n++;
  }
  return n ? out : null;
}

export function recordRun(
  slug: string,
  rawScore: unknown,
  rawMeta: unknown,
): { rank: number | null; best: number } {
  const score = Math.max(
    0,
    Math.min(Number.MAX_SAFE_INTEGER, Math.round(Number(rawScore) || 0)),
  );

  const runs = readJSON<Run[]>(RUNS_KEY(slug), EMPTY_RUNS);
  const next = [...runs, { score, at: Date.now(), meta: cleanMeta(rawMeta) }]
    .sort((a, b) => b.score - a.score || a.at - b.at)
    .slice(0, MAX_RUNS);
  writeJSON(RUNS_KEY(slug), next);

  const stats = readJSON<Stats>(STATS_KEY, EMPTY_STATS);
  const per = stats.perGame[slug] ?? { runs: 0, best: 0, seconds: 0 };
  const updated: Stats = {
    runs: stats.runs + 1,
    totalScore: stats.totalScore + score,
    seconds: stats.seconds,
    perGame: {
      ...stats.perGame,
      [slug]: {
        runs: per.runs + 1,
        best: Math.max(per.best, score),
        seconds: per.seconds,
      },
    },
  };
  writeJSON(STATS_KEY, updated);

  const rank = next.findIndex((r) => r.score === score && r.meta !== undefined);
  return { rank: rank === -1 ? null : rank + 1, best: next[0]?.score ?? score };
}

export function recordPlaytime(slug: string, seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return;
  const add = Math.min(Math.round(seconds), 60 * 60 * 6);
  const stats = readJSON<Stats>(STATS_KEY, EMPTY_STATS);
  const per = stats.perGame[slug] ?? { runs: 0, best: 0, seconds: 0 };
  writeJSON(STATS_KEY, {
    ...stats,
    seconds: stats.seconds + add,
    perGame: {
      ...stats.perGame,
      [slug]: { ...per, seconds: per.seconds + add },
    },
  });
}

export function unlockAchievement(
  slug: string,
  id: unknown,
  label: unknown,
  note: unknown,
): boolean {
  if (typeof id !== "string" || !id || id.length > 48) return false;
  const all = readJSON<Record<string, Unlock>>(ACHIEVEMENTS_KEY, {});
  const composite = `${slug}:${id}`;
  if (all[composite]) return false;
  writeJSON(ACHIEVEMENTS_KEY, {
    ...all,
    [composite]: {
      game: slug,
      id,
      label: typeof label === "string" ? label.slice(0, 60) : id,
      note: typeof note === "string" ? note.slice(0, 120) : "",
      at: Date.now(),
    },
  });
  return true;
}

export function resetEverything() {
  try {
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith("playpit:")) keys.push(k);
    }
    keys.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* nothing to clear */
  }
  cache.clear();
  window.dispatchEvent(new Event(EVENT));
}

/* -------------------------------------------------------------------------- *
 * Reads (hooks)
 * -------------------------------------------------------------------------- */

export function useRuns(slug: string): Run[] {
  return useSyncExternalStore(
    subscribe,
    () => readJSON<Run[]>(RUNS_KEY(slug), EMPTY_RUNS),
    () => EMPTY_RUNS,
  );
}

export function useUnlocks(): Record<string, Unlock> {
  return useSyncExternalStore(
    subscribe,
    () => readJSON<Record<string, Unlock>>(ACHIEVEMENTS_KEY, {}),
    () => ({}),
  );
}

export function useGameUnlocks(slug: string): Unlock[] {
  const all = useUnlocks();
  return Object.values(all).filter((u) => u.game === slug);
}

export function useStats(): Stats {
  return useSyncExternalStore(
    subscribe,
    () => readJSON<Stats>(STATS_KEY, EMPTY_STATS),
    () => EMPTY_STATS,
  );
}

/** True once the client store has taken over from the SSR snapshot. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

export function useReset() {
  return useCallback(() => resetEverything(), []);
}

export { EMPTY_UNLOCKS };
