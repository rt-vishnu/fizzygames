"use client";

import { useCallback, useSyncExternalStore } from "react";

const EVENT = "playpit:storage";
const EMPTY: string[] = [];

/**
 * useSyncExternalStore demands a referentially stable snapshot, so parsed
 * lists are cached per key and only rebuilt when the raw string changes.
 */
const cache = new Map<string, { raw: string | null; value: string[] }>();

function read(key: string): string[] {
  if (typeof window === "undefined") return EMPTY;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    return EMPTY;
  }
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value;

  let value: string[] = EMPTY;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      value = parsed.filter((v): v is string => typeof v === "string");
    }
  } catch {
    value = EMPTY;
  }
  cache.set(key, { raw, value });
  return value;
}

function write(key: string, value: string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode / quota — the list is a nicety, not a requirement */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: key }));
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * A list of game slugs persisted in localStorage, kept in sync across every
 * component on the page (and across tabs) that watches the same key.
 *
 * `ready` is false during SSR and the hydration pass, so callers can hold off
 * rendering until server and client markup agree.
 */
export function useLocalList(key: string, limit = 24) {
  const items = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => EMPTY,
  );
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const push = useCallback(
    (slug: string) => {
      const next = [slug, ...read(key).filter((s) => s !== slug)].slice(0, limit);
      write(key, next);
    },
    [key, limit],
  );

  const toggle = useCallback(
    (slug: string) => {
      const current = read(key);
      const next = current.includes(slug)
        ? current.filter((s) => s !== slug)
        : [slug, ...current].slice(0, limit);
      write(key, next);
    },
    [key, limit],
  );

  const clear = useCallback(() => write(key, []), [key]);

  return { items, ready, push, toggle, clear };
}

export const RECENT_KEY = "playpit:recent";
export const FAVORITES_KEY = "playpit:favorites";
