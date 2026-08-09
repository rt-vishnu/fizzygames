/**
 * Playpit game SDK.
 *
 * Every bundled game loads this file. It gives games four things they would
 * otherwise each reimplement:
 *
 *   1. Persistence  — namespaced localStorage (best scores, unlocks, saves).
 *   2. Reporting    — postMessage to the portal so the site can build
 *                     leaderboards, achievements and profile stats.
 *   3. Plumbing     — a fixed-ish game loop, input state, canvas fitting.
 *   4. Chrome       — HUD chips, overlays and toasts driven from JS.
 *
 * Games talk to the portal only through `run()` and `achieve()`. The portal
 * validates every message, so nothing here is trusted on the other side.
 */
(function (global) {
  "use strict";

  var slug =
    document.documentElement.getAttribute("data-game") ||
    (location.pathname.split("/").filter(Boolean)[1] || "unknown");

  /* ------------------------------------------------------------------ *
   * Storage
   * ------------------------------------------------------------------ */

  function key(name) {
    return "playpit:" + slug + ":" + name;
  }

  function load(name, fallback) {
    try {
      var raw = localStorage.getItem(key(name));
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function save(name, value) {
    try {
      localStorage.setItem(key(name), JSON.stringify(value));
    } catch (e) {
      /* private mode — progress just won't persist */
    }
    return value;
  }

  /* ------------------------------------------------------------------ *
   * Reporting to the portal
   * ------------------------------------------------------------------ */

  function send(type, payload) {
    var msg = { source: "playpit-game", game: slug, type: type };
    for (var k in payload) if (payload.hasOwnProperty(k)) msg[k] = payload[k];
    try {
      parent.postMessage(msg, "*");
    } catch (e) {
      /* standalone (opened directly) — nothing to report to */
    }
  }

  var startedAt = Date.now();

  /**
   * Record a finished run. Returns { best, isBest } so the game can show
   * "new record" without tracking it separately.
   */
  function run(score, meta) {
    score = Math.max(0, Math.round(score || 0));
    var best = load("best", 0);
    var isBest = score > best;
    if (isBest) save("best", (best = score));

    var totals = load("totals", { runs: 0, score: 0, seconds: 0 });
    totals.runs++;
    totals.score += score;
    totals.seconds += Math.round((Date.now() - startedAt) / 1000);
    save("totals", totals);
    startedAt = Date.now();

    send("run", {
      score: score,
      best: best,
      isBest: isBest,
      meta: meta || null,
    });
    return { best: best, isBest: isBest };
  }

  var unlocked = load("achievements", {});

  /** Unlock an achievement once. Returns true the first time only. */
  function achieve(id, label, note) {
    if (unlocked[id]) return false;
    unlocked[id] = Date.now();
    save("achievements", unlocked);
    send("achievement", { id: id, label: label || id, note: note || "" });
    if (label) toast("🏆", label, note || "Achievement unlocked");
    return true;
  }

  function best() {
    return load("best", 0);
  }

  /* ------------------------------------------------------------------ *
   * Chrome: HUD, overlay, toasts
   * ------------------------------------------------------------------ */

  var hudEl = null;
  var hudFields = {};

  /** hud({ score: 'Score', wave: 'Wave' }) builds the chip row once. */
  function hud(fields) {
    if (!hudEl) {
      hudEl = document.createElement("div");
      hudEl.className = "pp-hud";
      document.body.appendChild(hudEl);
    }
    hudEl.innerHTML = "";
    hudFields = {};
    Object.keys(fields).forEach(function (name) {
      var chip = document.createElement("div");
      chip.className = "pp-chip";
      var label = document.createElement("span");
      label.textContent = fields[name];
      var value = document.createElement("b");
      value.textContent = "0";
      chip.appendChild(label);
      chip.appendChild(value);
      hudEl.appendChild(chip);
      hudFields[name] = { chip: chip, value: value };
    });
    return hudFields;
  }

  /** set({ score: 120, wave: 3 }) — unknown keys are ignored. */
  function set(values) {
    Object.keys(values).forEach(function (name) {
      var f = hudFields[name];
      if (f) f.value.textContent = values[name];
    });
  }

  var toastsEl = null;

  function toast(icon, text, note) {
    if (!toastsEl) {
      toastsEl = document.createElement("div");
      toastsEl.className = "pp-toasts";
      document.body.appendChild(toastsEl);
    }
    var el = document.createElement("div");
    el.className = "pp-toast";
    el.innerHTML =
      "<span>" +
      icon +
      "</span><div>" +
      text +
      (note ? "<small>" + note + "</small>" : "") +
      "</div>";
    toastsEl.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () {
        el.remove();
      }, 320);
    }, 2600);
  }

  /* ------------------------------------------------------------------ *
   * Input
   * ------------------------------------------------------------------ */

  var DEFAULT_MAP = {
    ArrowLeft: "left", a: "left", A: "left",
    ArrowRight: "right", d: "right", D: "right",
    ArrowUp: "up", w: "up", W: "up",
    ArrowDown: "down", s: "down", S: "down",
    " ": "fire", Enter: "confirm", Escape: "pause",
    Shift: "boost", z: "action", Z: "action", x: "alt", X: "alt",
  };

  /**
   * Held-key state plus edge detection. `pressed(name)` is true only on the
   * first poll after the key goes down, which is what jump/shoot want.
   */
  function input(extraMap) {
    var map = {};
    for (var k in DEFAULT_MAP) map[k] = DEFAULT_MAP[k];
    for (var j in extraMap || {}) map[j] = extraMap[j];

    var held = {};
    var edge = {};

    function onDown(e) {
      var name = map[e.key];
      if (!name) return;
      if (!held[name]) edge[name] = true;
      held[name] = true;
      if (e.key === " " || e.key.indexOf("Arrow") === 0) e.preventDefault();
    }
    function onUp(e) {
      var name = map[e.key];
      if (name) held[name] = false;
    }

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", function () {
      held = {};
    });

    return {
      held: held,
      down: function (name) {
        return !!held[name];
      },
      pressed: function (name) {
        if (!edge[name]) return false;
        edge[name] = false;
        return true;
      },
      /** Wire a touch button (or any element) to a virtual key. */
      bind: function (el, name) {
        if (!el) return;
        var on = function (e) {
          if (!held[name]) edge[name] = true;
          held[name] = true;
          e.preventDefault();
        };
        var off = function () {
          held[name] = false;
        };
        el.addEventListener("touchstart", on, { passive: false });
        el.addEventListener("touchend", off);
        el.addEventListener("touchcancel", off);
        el.addEventListener("mousedown", on);
        el.addEventListener("mouseup", off);
        el.addEventListener("mouseleave", off);
      },
      release: function () {
        window.removeEventListener("keydown", onDown);
        window.removeEventListener("keyup", onUp);
      },
    };
  }

  var isTouch =
    "ontouchstart" in window || (navigator.maxTouchPoints || 0) > 0;

  /* ------------------------------------------------------------------ *
   * Canvas + loop
   * ------------------------------------------------------------------ */

  /**
   * Size a canvas for the device pixel ratio while keeping a fixed logical
   * coordinate system, so game code never deals with DPR.
   */
  function fit(canvas, w, h) {
    var dpr = Math.min(global.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    /**
     * Pick a CSS size that preserves the aspect ratio inside whatever box the
     * host gives us. A plain `width/height` in px plus `max-width: 100%` only
     * shrinks one axis, which on a phone-sized iframe stretched every game
     * vertically. Never scale above 1:1, so desktop keeps the exact pixel
     * size games have always been laid out against.
     */
    function layout() {
      var host = canvas.parentElement;
      var aw = host ? host.clientWidth : global.innerWidth;
      var ah = host ? host.clientHeight : global.innerHeight;
      if (!aw || !ah) return;
      var s = Math.min(aw / w, ah / h, 1);
      canvas.style.width = Math.round(w * s) + "px";
      canvas.style.height = Math.round(h * s) + "px";
    }

    layout();
    // The iframe can be resized without the inner window firing `resize`
    // (host layout changes, fullscreen), so watch the host box directly.
    if (global.ResizeObserver && canvas.parentElement) {
      new global.ResizeObserver(layout).observe(canvas.parentElement);
    }
    global.addEventListener("resize", layout);
    global.addEventListener("orientationchange", layout);
    return ctx;
  }

  /**
   * Fixed-timestep loop. `step(dt)` runs at a steady 60 Hz (dt in seconds,
   * possibly several times per frame); `render()` runs once per frame. A long
   * stall is clamped rather than simulated, so tabbing away can't teleport
   * anything through a wall.
   */
  function loop(step, render) {
    var STEP = 1 / 60;
    var acc = 0;
    var last = 0;
    var raf = 0;
    var running = false;

    function frame(now) {
      if (!running) return;
      if (!last) last = now;
      acc += Math.min((now - last) / 1000, 0.25);
      last = now;
      var guard = 0;
      while (acc >= STEP && guard++ < 8) {
        step(STEP);
        acc -= STEP;
      }
      if (render) render();
      raf = requestAnimationFrame(frame);
    }

    return {
      start: function () {
        if (running) return;
        running = true;
        last = 0;
        raf = requestAnimationFrame(frame);
      },
      stop: function () {
        running = false;
        cancelAnimationFrame(raf);
      },
      get running() {
        return running;
      },
    };
  }

  /* ------------------------------------------------------------------ *
   * Small helpers games keep needing
   * ------------------------------------------------------------------ */

  function clamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  function pick(arr) {
    return arr[(Math.random() * arr.length) | 0];
  }

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = (Math.random() * (i + 1)) | 0;
      var t = arr[i];
      arr[i] = arr[j];
      arr[j] = t;
    }
    return arr;
  }

  function time(seconds) {
    var m = Math.floor(seconds / 60);
    var s = seconds - m * 60;
    return m + ":" + (s < 10 ? "0" : "") + s.toFixed(2);
  }

  function commas(n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /** Tiny WebAudio blipper — no asset files, and silent if audio is blocked. */
  function audio() {
    var ctxA = null;
    function ensure() {
      if (ctxA) return ctxA;
      try {
        ctxA = new (global.AudioContext || global.webkitAudioContext)();
      } catch (e) {
        ctxA = false;
      }
      return ctxA;
    }
    var muted = load("muted", false);
    return {
      get muted() {
        return muted;
      },
      toggle: function () {
        muted = !muted;
        save("muted", muted);
        return muted;
      },
      play: function (freq, dur, type, vol) {
        if (muted) return;
        var a = ensure();
        if (!a) return;
        if (a.state === "suspended") a.resume();
        var osc = a.createOscillator();
        var gain = a.createGain();
        osc.type = type || "square";
        osc.frequency.setValueAtTime(freq, a.currentTime);
        gain.gain.setValueAtTime(vol == null ? 0.05 : vol, a.currentTime);
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          a.currentTime + (dur || 0.1),
        );
        osc.connect(gain);
        gain.connect(a.destination);
        osc.start();
        osc.stop(a.currentTime + (dur || 0.1));
      },
    };
  }

  global.Playpit = {
    slug: slug,
    isTouch: isTouch,
    load: load,
    save: save,
    run: run,
    best: best,
    achieve: achieve,
    unlocked: unlocked,
    hud: hud,
    set: set,
    toast: toast,
    input: input,
    fit: fit,
    loop: loop,
    audio: audio,
    clamp: clamp,
    lerp: lerp,
    rand: rand,
    pick: pick,
    shuffle: shuffle,
    time: time,
    commas: commas,
    roundRect: roundRect,
  };

  send("ready", {});
})(window);
