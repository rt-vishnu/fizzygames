export type CategorySlug =
  | "io"
  | "arcade"
  | "puzzle"
  | "casual"
  | "shooting"
  | "strategy"
  | "adventure"
  | "board"
  | "racing";

export type Category = {
  slug: CategorySlug;
  name: string;
  emoji: string;
  blurb: string;
};

export type Achievement = {
  /** Must match the id the game passes to `Playpit.achieve()`. */
  id: string;
  name: string;
  hint: string;
  icon: string;
};

export type Game = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  /** Longer copy shown under the player: what you actually do in it. */
  howToPlay: string[];
  category: CategorySlug;
  tags: string[];
  /**
   * Where the game is served from. Bundled originals live under
   * `public/games/<slug>/index.html`. To wire up a third-party HTML5 game
   * instead, just point this at its embed URL:
   *
   *   embedUrl: "https://example.com/embed/some-game"
   *
   * Anything that renders in an iframe works — the player shell is identical.
   */
  embedUrl: string;
  /** Aspect ratio the game is designed for, used to size the player. */
  aspect: "16:9" | "4:3" | "1:1";
  /** Seeded so the numbers stay stable between server and client renders. */
  plays: number;
  rating: number;
  releasedAt: string;
  featured?: boolean;
  /** Marks the meatier titles so the home page can lead with them. */
  flagship?: boolean;
  controls: string;
  achievements?: Achievement[];
  /** Two hex stops used for accent colour and procedural fallback art. */
  art: [string, string];
  /** Cover image served from `/public` (e.g. `/thumbs/void-arena.webp`). */
  thumbnail: string;
};

export const CATEGORIES: Category[] = [
  {
    slug: "io",
    name: ".io",
    emoji: "🌐",
    blurb: "Arena survival. Grow, outlast, top the board.",
  },
  {
    slug: "strategy",
    name: "Strategy",
    emoji: "🧠",
    blurb: "Plan the whole wave before it starts.",
  },
  {
    slug: "adventure",
    name: "Adventure",
    emoji: "🗺️",
    blurb: "Levels, secrets, and a jump button.",
  },
  {
    slug: "racing",
    name: "Racing",
    emoji: "🏁",
    blurb: "Left, right, don't stop.",
  },
  {
    slug: "arcade",
    name: "Arcade",
    emoji: "🕹️",
    blurb: "Twitch reflexes, rising speed, one more try.",
  },
  {
    slug: "shooting",
    name: "Shooting",
    emoji: "🚀",
    blurb: "Point at the bad thing. Keep pointing.",
  },
  {
    slug: "puzzle",
    name: "Puzzle",
    emoji: "🧩",
    blurb: "Take your time. Then take it again.",
  },
  {
    slug: "casual",
    name: "Casual",
    emoji: "☕",
    blurb: "Pick up, play a round, put down.",
  },
  {
    slug: "board",
    name: "Board",
    emoji: "♟️",
    blurb: "Old rules, sharp opponents.",
  },
];

export const GAMES: Game[] = [
  /* ---------------------------------------------------------------- *
   * Flagship titles
   * ---------------------------------------------------------------- */
  {
    slug: "void-arena",
    title: "Void Arena",
    tagline: "Everything in here is trying to level up too.",
    description:
      "A last-one-standing arena. You start as a small ship among a dozen rivals, and every kill feeds an XP bar that hands you a choice of upgrades. The bots hunt each other as readily as they hunt you, so the leaderboard shifts whether or not you're winning — and the arena keeps shrinking.",
    howToPlay: [
      "Move with WASD or the arrows; aim and fire with the mouse.",
      "Kills and pickups fill the XP bar. Each level gives you a choice of three upgrades — the picks compound, so commit to a build.",
      "Bots fight each other. Let two of them tangle and clean up after.",
      "The storm edge closes in over time and hurts. Stay inside it.",
    ],
    category: "io",
    tags: ["io", "arena", "survival", "upgrades", "leaderboard", "shooter"],
    embedUrl: "/games/void-arena/index.html",
    aspect: "16:9",
    plays: 412880,
    rating: 4.7,
    releasedAt: "2026-07-14",
    featured: true,
    flagship: true,
    controls: "WASD / arrows + mouse",
    achievements: [
      { id: "level-10", name: "Fully Loaded", hint: "Reach level 10 in one run", icon: "⚡" },
      { id: "kills-25", name: "Arena Regular", hint: "Score 25 kills in one run", icon: "💀" },
      { id: "rank-1", name: "Top of the Board", hint: "Finish a run ranked #1", icon: "👑" },
      { id: "survive-5", name: "Long Haul", hint: "Survive five minutes", icon: "⏱️" },
    ],
    art: ["#38c8ff", "#054d28"],
    thumbnail: "/thumbs/void-arena.webp",
  },
  {
    slug: "iron-line",
    title: "Iron Line",
    tagline: "Twenty waves. One corridor. No second chances.",
    description:
      "Tower defence with an economy that punishes hoarding. Six tower types, each with a three-step upgrade path and a final choice between two specialisations. Enemies come as runners, armoured columns, shielded flyers and bosses that heal their escort, so a wall of one tower type will not hold.",
    howToPlay: [
      "Pick a tower from the tray and place it on any buildable ground tile.",
      "Click a placed tower to upgrade it, specialise it at level 3, or sell it back for most of its cost.",
      "Flyers ignore the path — keep something that can hit air.",
      "Call the next wave early for a gold bonus if you think you're ready.",
    ],
    category: "strategy",
    tags: ["tower defense", "strategy", "waves", "upgrades", "base building"],
    embedUrl: "/games/iron-line/index.html",
    aspect: "16:9",
    plays: 298430,
    rating: 4.8,
    releasedAt: "2026-06-30",
    featured: true,
    flagship: true,
    controls: "Mouse",
    achievements: [
      { id: "wave-10", name: "Holding", hint: "Clear wave 10", icon: "🛡️" },
      { id: "wave-20", name: "The Line Holds", hint: "Clear all 20 waves", icon: "🏰" },
      { id: "flawless", name: "Not One Through", hint: "Finish a map without losing a life", icon: "✨" },
      { id: "maxed", name: "Overengineered", hint: "Fully specialise a tower", icon: "🔧" },
    ],
    art: ["#9fe870", "#054d28"],
    thumbnail: "/thumbs/iron-line.webp",
  },
  {
    slug: "glow-runner",
    title: "Glow Runner",
    tagline: "Eight levels of jump, miss, retry.",
    description:
      "A precision platformer with a forgiving feel: coyote time, variable jump height and generous checkpoints, wrapped around levels that get genuinely mean. Collect the coins, find the key, reach the door — and if you're quick about it, beat the par time on the level select screen.",
    howToPlay: [
      "Arrows or WASD to run, up or space to jump. Hold jump for height.",
      "Find the key before the exit door will open.",
      "Touching a checkpoint saves your spot for the rest of the level.",
      "Every level tracks your best time and coin count separately.",
    ],
    category: "adventure",
    tags: ["platformer", "levels", "precision", "speedrun", "adventure"],
    embedUrl: "/games/glow-runner/index.html",
    aspect: "16:9",
    plays: 233910,
    rating: 4.6,
    releasedAt: "2026-07-02",
    featured: true,
    flagship: true,
    controls: "Arrows / WASD + space",
    achievements: [
      { id: "level-4", name: "Halfway Up", hint: "Clear level 4", icon: "🧗" },
      { id: "all-levels", name: "Summit", hint: "Clear all eight levels", icon: "🏁" },
      { id: "all-coins", name: "Completionist", hint: "Take every coin in a level", icon: "🪙" },
      { id: "par-time", name: "Quick Feet", hint: "Beat a level's par time", icon: "⚡" },
    ],
    art: ["#ffc091", "#2ead4b"],
    thumbnail: "/thumbs/glow-runner.webp",
  },
  {
    slug: "apex-drift",
    title: "Apex Drift",
    tagline: "Three tracks, four rivals, one racing line.",
    description:
      "A pseudo-3D racer in the old arcade style: a road that rolls and curves toward the horizon, opponents who defend their line, and a nitro bar that rewards clean cornering. Podium finishes pay credits, and credits buy cars that are faster and considerably less forgiving.",
    howToPlay: [
      "Up to accelerate, down to brake, left and right to steer.",
      "Shift burns nitro. It refills when you're on the racing line and off the grass.",
      "Three laps per race. Grass and collisions cost you speed, not just time.",
      "Finishing pays credits — spend them in the garage between races.",
    ],
    category: "racing",
    tags: ["racing", "driving", "3d", "time trial", "unlocks"],
    embedUrl: "/games/apex-drift/index.html",
    aspect: "16:9",
    plays: 341220,
    rating: 4.5,
    releasedAt: "2026-07-21",
    featured: true,
    flagship: true,
    controls: "Arrows + shift",
    achievements: [
      { id: "first-win", name: "First Blood", hint: "Win a race", icon: "🥇" },
      { id: "all-tracks", name: "Grand Tour", hint: "Win on all three tracks", icon: "🗺️" },
      { id: "clean-lap", name: "On The Line", hint: "Complete a lap without touching grass", icon: "🎯" },
      { id: "garage", name: "Collector", hint: "Unlock every car", icon: "🔑" },
    ],
    art: ["#ffd11a", "#b86700"],
    thumbnail: "/thumbs/apex-drift.webp",
  },

  /* ---------------------------------------------------------------- *
   * Arcade catalogue
   * ---------------------------------------------------------------- */
  {
    slug: "neon-serpent",
    title: "Neon Serpent",
    tagline: "Grow long. Don't fold.",
    description:
      "A snake that leaves a light trail behind it, with a twist: pellets come in flavours. Gold stretches you, blue slows time, purple lets you phase through your own tail for a few seconds. Every ten pellets the arena adds a wall, so the board you learned stops being the board you're on.",
    howToPlay: [
      "WASD or arrows to steer; swipe on touch.",
      "Gold pellets grow you and raise the speed. Combo them without pausing for bonus points.",
      "Blue slows time, purple grants phase, white clears the walls.",
      "New walls appear every ten pellets. Plan your loops around them.",
    ],
    category: "arcade",
    tags: ["snake", "retro", "highscore", "keyboard", "powerups"],
    embedUrl: "/games/neon-serpent/index.html",
    aspect: "1:1",
    plays: 184230,
    rating: 4.6,
    releasedAt: "2026-01-12",
    controls: "Arrows / WASD / swipe",
    achievements: [
      { id: "length-25", name: "Long Body", hint: "Reach 25 segments", icon: "🐍" },
      { id: "score-1500", name: "Neon Veteran", hint: "Score 1,500 points", icon: "💡" },
      { id: "combo-8", name: "Chain Eater", hint: "Land an 8-pellet combo", icon: "🔗" },
    ],
    art: ["#cdffad", "#2ead4b"],
    thumbnail: "/thumbs/neon-serpent.webp",
  },
  {
    slug: "brick-blitz",
    title: "Brick Blitz",
    tagline: "Break everything. Twice.",
    description:
      "Paddle, ball, wall of bricks — plus drops. Broken bricks release power-ups: multiball, a wider paddle, a laser cannon, a catch-and-aim sticky paddle. Twelve hand-built layouts escalate from a plain grid into shapes that funnel the ball exactly where you don't want it.",
    howToPlay: [
      "Move the paddle with the mouse or by dragging; space launches.",
      "Falling capsules are power-ups. Green helps, red does not.",
      "With the laser, click to fire. With the sticky paddle, the ball waits for you to aim.",
      "Twelve layouts, three lives, and a ball that never stops accelerating.",
    ],
    category: "arcade",
    tags: ["breakout", "paddle", "levels", "mouse", "powerups"],
    embedUrl: "/games/brick-blitz/index.html",
    aspect: "4:3",
    plays: 129884,
    rating: 4.4,
    releasedAt: "2026-01-28",
    controls: "Mouse / drag",
    achievements: [
      { id: "level-6", name: "Halfway Wall", hint: "Reach layout 6", icon: "🧱" },
      { id: "clear-all", name: "Demolition", hint: "Clear all twelve layouts", icon: "💥" },
      { id: "multiball-5", name: "Juggler", hint: "Have five balls in play", icon: "🤹" },
    ],
    art: ["#ffc091", "#d03238"],
    thumbnail: "/thumbs/brick-blitz.webp",
  },
  {
    slug: "merge-2048",
    title: "Merge 2048",
    tagline: "Slide, stack, panic.",
    description:
      "Push tiles across the grid and matching numbers fuse into their double. Three board sizes, an undo you get three of per run, and a running best-tile record. Reaching 2048 is the goal; keeping a free square is the actual game.",
    howToPlay: [
      "Arrows or WASD to slide every tile; swipe on touch.",
      "Equal tiles merge into one of double the value.",
      "Three undos per run — spend them on the move that broke your corner.",
      "Play 4×4 for the classic, 5×5 to breathe, 3×3 if you enjoy suffering.",
    ],
    category: "puzzle",
    tags: ["numbers", "grid", "logic", "touch", "undo"],
    embedUrl: "/games/merge-2048/index.html",
    aspect: "1:1",
    plays: 241005,
    rating: 4.8,
    releasedAt: "2025-11-04",
    controls: "Arrows / WASD / swipe",
    achievements: [
      { id: "tile-512", name: "Big Number", hint: "Make a 512 tile", icon: "🔢" },
      { id: "tile-2048", name: "The Whole Point", hint: "Make a 2048 tile", icon: "🏆" },
      { id: "no-undo", name: "No Take-Backs", hint: "Reach 512 without an undo", icon: "🚫" },
    ],
    art: ["#ffd11a", "#ffc091"],
    thumbnail: "/thumbs/merge-2048.webp",
  },
  {
    slug: "star-runner",
    title: "Star Runner",
    tagline: "Shoot the rocks, dodge the rest.",
    description:
      "You're a small ship in a large debris field. Bullets split big asteroids into small ones, and small ones into a lot of problems. Between waves you spend salvage on your ship — spread shot, rapid fire, shields, a bomb that clears the screen — and then the hunters show up.",
    howToPlay: [
      "Arrows or WASD to rotate and thrust; space fires; X drops a bomb.",
      "Clearing a wave opens the upgrade screen. Salvage is limited, so specialise.",
      "From wave 4 onward, hunter ships arrive that shoot back.",
      "Momentum carries. There are no brakes in space.",
    ],
    category: "shooting",
    tags: ["space", "asteroids", "waves", "keyboard", "upgrades"],
    embedUrl: "/games/star-runner/index.html",
    aspect: "16:9",
    plays: 156742,
    rating: 4.5,
    releasedAt: "2025-12-09",
    controls: "Arrows / WASD + space",
    achievements: [
      { id: "wave-5", name: "Still Flying", hint: "Reach wave 5", icon: "🚀" },
      { id: "wave-10", name: "Deep Field", hint: "Reach wave 10", icon: "🌌" },
      { id: "hunter-10", name: "Dogfighter", hint: "Destroy ten hunters", icon: "🎯" },
    ],
    art: ["#38c8ff", "#a72027"],
    thumbnail: "/thumbs/star-runner.webp",
  },
  {
    slug: "lane-rush",
    title: "Lane Rush",
    tagline: "Five lanes. No brakes.",
    description:
      "Weave through traffic on an endless highway that quietly accelerates. Near misses bank combo multipliers, fuel cans extend the run, and the shield pickup buys you exactly one mistake. Night falls after two kilometres and the headlights are all you get.",
    howToPlay: [
      "Left and right to change lane; up and down to close or open the gap.",
      "Passing close to traffic builds a combo multiplier that decays if you play safe.",
      "Fuel drains constantly — the cans on the road are not optional.",
      "Shields absorb one crash. Everything after that is on you.",
    ],
    category: "racing",
    tags: ["endless", "traffic", "arrows", "score", "combo"],
    embedUrl: "/games/lane-rush/index.html",
    aspect: "4:3",
    plays: 112377,
    rating: 4.3,
    releasedAt: "2026-02-01",
    controls: "Arrows / swipe",
    achievements: [
      { id: "dist-3000", name: "Long Drive", hint: "Cover 3,000 metres", icon: "🛣️" },
      { id: "combo-10", name: "Paint Scraper", hint: "Reach a ×10 combo", icon: "🔥" },
      { id: "night", name: "After Dark", hint: "Drive into the night stage", icon: "🌙" },
    ],
    art: ["#d03238", "#4a3b1c"],
    thumbnail: "/thumbs/lane-rush.webp",
  },
  {
    slug: "jet-hopper",
    title: "Jet Hopper",
    tagline: "One button. Endless regret.",
    description:
      "Tap to burn thrust, release to fall. Thread the gaps between drifting towers for as long as your nerve holds. Fuel cells extend the run, moving gates arrive at tower 15, and the gaps never get wider.",
    howToPlay: [
      "Click, tap or hold space to thrust. Let go to drop.",
      "Collect fuel cells for points and a small speed reprieve.",
      "From tower 15 the gaps start moving vertically.",
      "Threading a gap dead centre pays a perfect bonus.",
    ],
    category: "casual",
    tags: ["one-button", "endless", "reflex", "mobile"],
    embedUrl: "/games/jet-hopper/index.html",
    aspect: "4:3",
    plays: 98120,
    rating: 4.1,
    releasedAt: "2026-02-16",
    controls: "Click / tap / space",
    achievements: [
      { id: "towers-15", name: "Threading", hint: "Clear 15 towers", icon: "🗼" },
      { id: "towers-30", name: "Ice In The Veins", hint: "Clear 30 towers", icon: "🧊" },
      { id: "perfect-5", name: "Dead Centre", hint: "Five perfect gaps in a row", icon: "🎯" },
    ],
    art: ["#cdffad", "#38c8ff"],
    thumbnail: "/thumbs/jet-hopper.webp",
  },
  {
    slug: "memory-vault",
    title: "Memory Vault",
    tagline: "You saw it a second ago.",
    description:
      "Flip cards two at a time and hold the board in your head. Three grid sizes, a timed mode that adds pressure, and a streak bonus for consecutive matches. Clear every pair before the move counter humiliates you.",
    howToPlay: [
      "Click or tap two cards. Matching pairs stay open.",
      "Consecutive matches build a streak multiplier.",
      "Timed mode gives you a clock instead of a move budget.",
      "Best move count and best time are tracked per grid size.",
    ],
    category: "puzzle",
    tags: ["memory", "cards", "relaxing", "touch", "timed"],
    embedUrl: "/games/memory-vault/index.html",
    aspect: "4:3",
    plays: 73450,
    rating: 4.2,
    releasedAt: "2026-03-02",
    controls: "Click / tap",
    achievements: [
      { id: "clear-6", name: "Big Board", hint: "Clear the 6×6 grid", icon: "🧠" },
      { id: "streak-6", name: "Photographic", hint: "Match six pairs in a row", icon: "📷" },
      { id: "beat-clock", name: "Against The Clock", hint: "Win a timed round", icon: "⏰" },
    ],
    art: ["#9fe870", "#2ead4b"],
    thumbnail: "/thumbs/memory-vault.webp",
  },
  {
    slug: "tic-tac-tactics",
    title: "Tic Tac Tactics",
    tagline: "Small board, sharp opponent.",
    description:
      "Noughts and crosses, and then the version worth playing: Ultimate mode, a 3×3 board of 3×3 boards where your move dictates where your opponent must play next. The classic opponent never blunders on Hard; the Ultimate one is beatable if you think two boards ahead.",
    howToPlay: [
      "Classic: standard rules against three difficulty levels.",
      "Ultimate: win small boards to claim squares on the big one.",
      "In Ultimate your move sends the opponent to the matching small board.",
      "If that board is finished, they may play anywhere.",
    ],
    category: "board",
    tags: ["classic", "two-player", "ai", "quick", "ultimate"],
    embedUrl: "/games/tic-tac-tactics/index.html",
    aspect: "1:1",
    plays: 51988,
    rating: 3.9,
    releasedAt: "2026-03-21",
    controls: "Click / tap",
    achievements: [
      { id: "beat-hard", name: "Solved It", hint: "Beat the Hard opponent", icon: "🧩" },
      { id: "win-ultimate", name: "Two Boards Ahead", hint: "Win a game of Ultimate", icon: "♟️" },
      { id: "streak-3", name: "On A Run", hint: "Win three games in a row", icon: "🔥" },
    ],
    art: ["#e2f6d5", "#b86700"],
    thumbnail: "/thumbs/tic-tac-tactics.webp",
  },
];

export const ASPECT_RATIO: Record<Game["aspect"], string> = {
  "16:9": "16 / 9",
  "4:3": "4 / 3",
  "1:1": "1 / 1",
};

export function getGame(slug: string): Game | undefined {
  return GAMES.find((g) => g.slug === slug);
}

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function gamesInCategory(slug: CategorySlug): Game[] {
  return GAMES.filter((g) => g.category === slug);
}

export function featuredGames(): Game[] {
  return GAMES.filter((g) => g.featured);
}

export function flagshipGames(): Game[] {
  return GAMES.filter((g) => g.flagship);
}

export function popularGames(): Game[] {
  return [...GAMES].sort((a, b) => b.plays - a.plays);
}

export function newestGames(): Game[] {
  return [...GAMES].sort((a, b) => b.releasedAt.localeCompare(a.releasedAt));
}

export function topRatedGames(): Game[] {
  return [...GAMES].sort((a, b) => b.rating - a.rating);
}

export function allTags(): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const game of GAMES) {
    for (const tag of game.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function gamesWithTag(tag: string): Game[] {
  const needle = tag.toLowerCase();
  return GAMES.filter((g) => g.tags.some((t) => t.toLowerCase() === needle));
}

export function relatedGames(game: Game, limit = 6): Game[] {
  const scored = GAMES.filter((g) => g.slug !== game.slug).map((g) => {
    const shared = g.tags.filter((t) => game.tags.includes(t)).length;
    return { g, score: (g.category === game.category ? 3 : 0) + shared };
  });
  return scored
    .sort((a, b) => b.score - a.score || b.g.plays - a.g.plays)
    .slice(0, limit)
    .map((s) => s.g);
}

export function searchGames(query: string): Game[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);
  return GAMES.map((g) => {
    const haystack = [g.title, g.tagline, g.category, ...g.tags]
      .join(" ")
      .toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (g.title.toLowerCase().startsWith(term)) score += 6;
      else if (g.title.toLowerCase().includes(term)) score += 4;
      if (g.tags.some((t) => t.toLowerCase() === term)) score += 3;
      if (haystack.includes(term)) score += 1;
    }
    return { g, score };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || b.g.plays - a.g.plays)
    .map((s) => s.g);
}

export function formatPlays(plays: number): string {
  if (plays >= 1_000_000) return `${(plays / 1_000_000).toFixed(1)}M`;
  if (plays >= 1_000) return `${Math.round(plays / 1_000)}K`;
  return String(plays);
}
