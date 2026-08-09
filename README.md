# Playpit

A browser game portal in the shape of sites like CrazyGames: a catalogue home
page, category/tag/search browsing, per-game landing pages with an embedded
player, per-game leaderboards and achievements, and a player profile.

Everything here is original — the twelve games ship with the repo as
self-contained HTML5 files, and the design and branding are the project's own.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- No database, no accounts. Game metadata lives in a typed data file; player
  state (scores, achievements, saves, unlocks) lives in `localStorage`.

## Running it

```bash
npm run dev
```

Then open http://localhost:3000. Other scripts: `npm run build`, `npm start`,
`npm run lint`.

## The games

Four flagship titles with real progression:

| Game | Genre | What's in it |
| --- | --- | --- |
| Void Arena | .io arena | 11 named AI rivals that fight each other, XP and level-ups with a choice of 3 from 12 upgrades, farmable shards, shrinking storm, live leaderboard, minimap |
| Iron Line | Tower defense | 6 tower types × 5 levels with a two-way specialisation at level 3, gold economy, 6 enemy types incl. flyers/healers/bosses, 20 authored waves, 2 maps, speed toggle |
| Glow Runner | Platformer | 8 hand-built levels, coyote time and variable jump height, patrollers, spikes, lava, moving platforms, keys and doors, checkpoints, level select with par times |
| Apex Drift | Racing | Pseudo-3D segmented road with curves and hills, 3 tracks, 4 rivals, 3 laps, nitro, credits and a 4-car garage |

Eight arcade titles, each with progression of its own:

| Game | Controls | Depth |
| --- | --- | --- |
| Neon Serpent | Arrows / WASD / swipe | Four pellet types, combo chains, a new wall every 10 pellets |
| Brick Blitz | Mouse / drag | 12 layouts, 5 power-up drops (multiball, wide, laser, sticky, shrink) |
| Merge 2048 | Arrows / WASD / swipe | Three board sizes, three undos per run, top-tile tracking |
| Star Runner | Arrows + space | Salvage economy, 6 upgrades between waves, hunters that shoot back, bombs |
| Lane Rush | Arrows / swipe | Five lanes, near-miss combo multiplier, fuel, shields, night stage |
| Jet Hopper | Click / tap / space | Fuel cells, perfect-gap streaks, gaps that start moving at tower 15 |
| Memory Vault | Click / tap | Two grid sizes, timed mode, streak multipliers |
| Tic Tac Tactics | Click / tap | Classic (minimax, 3 difficulties) plus Ultimate — 9 boards, send-to-board rules |

## Layout

```
src/
  app/
    page.tsx               home — hero, flagships, popular, categories, new, top rated
    game/[slug]/page.tsx   landing page, player, how-to-play, leaderboard, achievements
    category/[slug]/       one page per category
    tag/[tag]/             one page per tag
    search/page.tsx        server-rendered results for ?q=
    popular/, new/         full sorted listings
    library/               favourites + recently played
    profile/               lifetime stats, per-game bests, achievements, reset
  components/
    Shell.tsx              header, sidebar, mobile drawer, footer
    SearchBox.tsx          instant dropdown search, "/" to focus
    GamePlayer.tsx         iframe player + validated postMessage listener
    Leaderboard.tsx        per-game best runs
    Achievements.tsx       per-game unlock progress
    GameArt.tsx            procedural SVG cover art derived from the slug
  lib/
    games.ts               the catalogue + sorting/search/related/tag helpers
    scores.ts              runs, achievements and stats (localStorage)
    useLocalList.ts        localStorage list synced across components and tabs
public/games/
  _shared/playpit.js       the game SDK (see below)
  _shared/arcade.css       shared HUD/overlay/toast styling
  <slug>/index.html        one folder per game
```

## The game SDK

Every bundled game loads `public/games/_shared/playpit.js`, which provides:

- **Persistence** — `load`/`save` namespaced per game (high scores, unlocks, saves).
- **Reporting** — `run(score, meta)` and `achieve(id, label, note)` postMessage
  to the portal so the site can build leaderboards, achievements and stats.
- **Plumbing** — a fixed-timestep `loop(step, render)`, `input()` with held/edge
  detection and touch binding, and `fit()` for DPR-correct canvas sizing.
- **Chrome** — `hud()`/`set()` chips, `toast()` notifications.

The portal treats every message as untrusted: `GamePlayer` checks the message
came from its own iframe and origin, and `scores.ts` re-validates and clamps
every field before storing it.

## Adding a game

Append an entry to `GAMES` in [`src/lib/games.ts`](src/lib/games.ts). Every
page, category count, tag page, search index and related-games list reads from
that array, so nothing else needs touching.

`embedUrl` is the only field that decides where the game comes from:

```ts
// bundled: drop the files in public/games/my-game/
embedUrl: "/games/my-game/index.html",

// third-party: any URL that renders in an iframe works
embedUrl: "https://example.com/embed/some-game",
```

The player iframe is sandboxed with `allow-scripts allow-same-origin
allow-pointer-lock allow-popups`. `allow-same-origin` is what lets the bundled
games persist their own saves; if you embed a game you do not control, consider
dropping that flag for it.

Achievement ids listed in a game's `achievements` array must match the ids the
game passes to `Playpit.achieve()`.

## Things that are deliberately not here

Plays and ratings are static numbers in the data file — there is no backend
counting them, and leaderboards are per-browser rather than global. There are
no user accounts, comments or ad slots. Adding any of those means introducing a
database and an API layer; the catalogue module and `scores.ts` are the seams
where that would plug in.
