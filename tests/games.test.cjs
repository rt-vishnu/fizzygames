const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const R = require("../public/games/relic-dominion/rules.js");
const F = require("../public/games/orbital-heist/physics.js");

function battle(cards) {
  const r = R.newRun();
  R.begin(r);
  r.battle.hand = cards.map(id => ({ id, plus: false }));
  r.battle.energy = 20;
  r.battle.enemies[0].hp = r.battle.enemies[0].maxHp = 200;
  return r;
}

test("cards cannot spend unavailable aether or target a defeated enemy", () => {
  const r = battle(["crush"]);
  r.battle.energy = 1;
  assert.equal(R.play(r, 0, 0), false);
  assert.equal(r.battle.hand.length, 1);
  r.battle.energy = 3;
  r.battle.enemies[0].hp = 0;
  assert.equal(R.play(r, 0, 0), false);
  assert.equal(r.battle.energy, 3);
});

test("multi-hit attacks resolve block per hit and relic power only on the first attack", () => {
  const r = battle(["flurry", "strike"]);
  r.relics.push("coil");
  r.battle.power = 3;
  r.battle.enemies[0].block = 10;
  R.play(r, 0, 0);
  assert.equal(r.battle.enemies[0].hp, 177); // 3 × (4+3+4) - 10
  R.play(r, 0, 0);
  assert.equal(r.battle.enemies[0].hp, 166); // 8+3; prism already consumed
});

test("poison bypasses enemy block and can end combat before the enemy attacks", () => {
  const r = battle(["venom", "catalyst"]);
  const e = r.battle.enemies[0];
  e.block = 100;
  R.play(r, 0, 0);
  R.play(r, 0, 0);
  assert.equal(e.poison, 8);
  e.hp = 8;
  const hp = r.hp;
  R.endTurn(r);
  assert.equal(r.hp, hp);
  assert.equal(r.phase, "reward");
});

test("weak reduces every attack hit and armor replaces unused block next turn", () => {
  const r = battle(["disarm", "fortify"]);
  R.play(r, 0, 0);
  R.play(r, 0, 0);
  const hp = r.hp;
  R.endTurn(r);
  assert.equal(r.hp, hp - 6); // floor(5 * .75) × 2
  assert.equal(r.battle.block, 4);
  assert.equal(r.battle.enemies[0].weak, 1);
});

test("exhausted cards stay out of reshuffles and the deck is preserved between battles", () => {
  const r = battle(["focus"]);
  r.battle.draw = [];
  r.battle.discard = [{ id: "guard", plus: false }];
  R.play(r, 0, 0);
  assert.equal(r.battle.exhaust.length, 1);
  assert.equal(r.battle.hand.length, 1);
  assert.equal(r.battle.hand[0].id, "guard");
  assert.equal(r.deck.length, 10);
  R.begin(r);
  assert.equal(r.battle.exhaust.length, 0);
});

test("lethal Blood Pact ends the run without applying later card effects", () => {
  const r = battle(["charge"]);
  r.hp = 4;
  R.play(r, 0, 0);
  assert.equal(r.phase, "lost");
  assert.equal(r.hp, 0);
  assert.equal(r.battle.energy, 20);
});

test("rewards and sanctuary services advance exactly once", () => {
  const r = battle(["strike"]);
  r.battle.enemies[0].hp = 1;
  R.play(r, 0, 0);
  const gold = r.gold;
  assert.equal(R.claim(r, "not-a-card"), false);
  assert.equal(R.claim(r, r.offer[0]), true);
  assert.equal(R.claim(r, null), false);
  assert.equal(r.depth, 1);
  assert.equal(r.gold, gold);
  r.phase = "camp";
  assert.equal(R.camp(r, "upgrade", 0), true);
  assert.equal(r.deck[0].plus, true);
  assert.equal(R.card(r.deck[0]).damage, 11);
  assert.equal(R.camp(r, "rest"), false);
  assert.equal(r.depth, 2);
});

test("a saved combat round-trips without losing zones, status, or enemy intent", () => {
  const r = battle(["venom", "fortify"]);
  R.play(r, 0, 0);
  const restored = JSON.parse(JSON.stringify(r));
  R.play(r, 0, 0);
  R.play(restored, 0, 0);
  assert.deepEqual(restored, r);
});

test("the ninth encounter concludes the expedition; all card upgrades produce valid descriptions", () => {
  const r = battle(["strike"]);
  r.depth = 8;
  r.battle.enemies[0].hp = 1;
  R.play(r, 0, 0);
  R.claim(r, null);
  assert.equal(r.phase, "won");
  assert.equal(r.depth, 9);
  for (const id of Object.keys(R.CARDS)) {
    const c = R.card({ id, plus: true });
    assert.ok(!c.text.includes("undefined") && !c.text.includes("{"));
  }
});

for (let index = 0; index < F.layouts.length; index++) {
  test(`orbital contract ${index + 1}: authored launch collects every core and extracts without a collision`, () => {
    const m = F.build(index), p = F.probe(m, m.angle, m.power);
    const cores = m.cores.map(() => false);
    let extracted = false;
    for (let t = 0; t < m.duration + .5; t += F.DT) {
      const old = { ...p };
      F.advance(p, m, F.DT);
      assert.equal(F.collision(p, old, m), null, `collision at ${p.t.toFixed(3)}s`);
      m.cores.forEach((c, i) => {
        if (F.distanceToSegment(c, old, p) < 21) cores[i] = true;
      });
      if (F.distanceToSegment(m.exit, old, p) < 25 && cores.every(Boolean)) {
        extracted = true;
        break;
      }
    }
    assert.ok(extracted);
    assert.equal(F.medal(m, p.t, 5-p.fuel, false), 3);
    assert.equal(F.medal(m, p.t, 0, true), 1);
  });
}

test("orbital steering consumes bounded fuel and swept collision catches crossing a planet", () => {
  const m = F.build(0), p = F.probe(m, 0, 180);
  p.fuel = F.DT / 2;
  F.advance(p, m, F.DT, { x: 1, y: 1 });
  assert.equal(p.fuel, 0);
  assert.equal(F.collision({ x: 550, y: 185, t: 0 }, { x: 390, y: 185 }, m), "Impact with a gravity well");
});

function chrono() {
  const elements = new Map(), reports = [], awards = [], held = {};
  const element = id => {
    if (!elements.has(id)) elements.set(id, { innerHTML: "", hidden: false, textContent: "", addEventListener() {} });
    return elements.get(id);
  };
  const P = {
    fit: () => ({}), input: () => ({ pressed: () => false, down: key => !!held[key], bind() {} }),
    audio: () => ({ play() {} }), load: (_, fallback) => fallback, save() {}, best: () => 0,
    achieve: id => awards.push(id), run: (...args) => reports.push(args),
    clamp: (n, a, b) => Math.max(a, Math.min(b, n)), shuffle: a => a,
    loop: () => ({ start() {} }),
  };
  const sandbox = { window: { Playpit: P, addEventListener() {} }, document: { getElementById: element, querySelectorAll: () => [], addEventListener() {} }, Math, Set };
  vm.createContext(sandbox);
  const source = fs.readFileSync(path.join(__dirname, "../public/games/chrono-rift/game.js"), "utf8");
  vm.runInContext(source + `\nglobalThis.harness = {start, step, rewind, dash, hurt, pause, finish, get s(){return s}, get state(){return state}, setHistory(h){history=h}, setEnemies(e){enemies=e}};`, sandbox);
  sandbox.harness.start();
  return { ...sandbox.harness, api: sandbox.harness, reports, awards, held };
}

test("Chrono rewind restores lost hull and position, respects cooldown, and never reduces hull", () => {
  const { api, awards } = chrono();
  api.s.hp = 40;
  api.setHistory(Array.from({length:180}, () => ({ x:100, y:150, hp:80 })));
  api.rewind();
  assert.equal(api.s.hp, 80);
  assert.equal(api.s.x, 100);
  assert.ok(api.s.rewindCd > 0);
  assert.ok(awards.includes("rewrite"));
  api.s.hp = 55;
  api.rewind();
  assert.equal(api.s.hp, 55);
  api.s.rewindCd = 0;
  api.setHistory(Array.from({length:180}, () => ({ x:100, y:150, hp:30 })));
  api.rewind();
  assert.equal(api.s.hp, 55);
});

test("Chrono dash prevents damage, pause freezes simulation, and a run reports once", () => {
  const { api, reports } = chrono();
  api.s.invul = 0;
  api.dash();
  api.hurt(30);
  assert.equal(api.s.hp, 100);
  api.pause();
  const before = JSON.stringify(api.s);
  api.step(1/60);
  assert.equal(JSON.stringify(api.s), before);
  api.pause();
  api.s.invul = 0;
  api.hurt(100);
  assert.equal(api.state, "end");
  api.finish(false);
  assert.equal(reports.length, 1);
});

test("Chrono a 60-second idle simulation stays bounded and ends cleanly", () => {
  const { api, reports } = chrono();
  for (let i = 0; i < 3600 && api.state === "play"; i++) api.step(1/60);
  assert.ok(Number.isFinite(api.s.x) && Number.isFinite(api.s.hp));
  assert.ok(api.s.x >= 18 && api.s.x <= 942);
  assert.ok(["end", "upgrade", "sector", "play"].includes(api.state));
  assert.ok(reports.length <= 1);
});
