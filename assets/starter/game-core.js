/* Dependency-free deterministic game core. Reuse or replace for your own loop. */
(function exposeGameCore(globalScope) {
  "use strict";

  const WIDTH = 960;
  const HEIGHT = 540;
  const STEP_SECONDS = 1 / 60;

  function createRandom(seed) {
    let value = (Number(seed) >>> 0) || 1;
    return function random() {
      value = (value * 1664525 + 1013904223) >>> 0;
      return value / 4294967296;
    };
  }

  function clamp(value, low, high) {
    return Math.max(low, Math.min(high, value));
  }

  class SignalSprintCore {
    constructor(options) {
      const settings = options || {};
      this.seed = Number.isFinite(settings.seed) ? settings.seed : 513;
      this.target = Number.isFinite(settings.target) ? settings.target : 8;
      this.duration = Number.isFinite(settings.duration) ? settings.duration : 45;
      this.spawnInterval = Number.isFinite(settings.spawnInterval) ? settings.spawnInterval : 0.68;
      this.reset(this.seed);
    }

    reset(seed) {
      this.seed = Number.isFinite(seed) ? seed : this.seed;
      this.random = createRandom(this.seed);
      this.phase = "ready";
      this.elapsed = 0;
      this.spawnClock = 0.2;
      this.input = 0;
      this.collected = 0;
      this.items = [];
      this.events = [];
      this.player = { x: WIDTH / 2, previousX: WIDTH / 2, y: 442, radius: 22 };
      return this.snapshot();
    }

    start() {
      if (this.phase === "ready" || this.phase === "paused") {
        this.input = 0;
        this.phase = "running";
      }
      return this.snapshot();
    }

    pause() {
      if (this.phase === "running") {
        this.phase = "paused";
        this.input = 0;
      }
      return this.snapshot();
    }

    setInput(direction) {
      this.input = clamp(Number(direction) || 0, -1, 1);
    }

    addItem(item) {
      this.items.push({
        kind: item.kind === "hazard" ? "hazard" : "signal",
        x: clamp(Number(item.x) || WIDTH / 2, 0, WIDTH),
        previousY: Number(item.y) || 0,
        y: Number(item.y) || 0,
        size: Number(item.size) || 24,
        speed: Number(item.speed) || 180,
      });
    }

    step(seconds) {
      if (this.phase !== "running") return this.snapshot();
      const dt = Math.min(Math.max(Number(seconds) || STEP_SECONDS, 0), 0.1);
      this.events = [];
      this.elapsed += dt;
      this.player.previousX = this.player.x;
      this.player.x = clamp(this.player.x + this.input * 410 * dt, this.player.radius, WIDTH - this.player.radius);
      this.spawnClock -= dt;
      while (this.spawnClock <= 0) {
        this.spawn();
        this.spawnClock += this.spawnInterval;
      }
      const nextItems = [];
      for (const item of this.items) {
        item.previousY = item.y;
        item.y += item.speed * dt;
        if (this.touchesPlayer(item)) {
          if (item.kind === "hazard") {
            this.phase = "failed";
            this.events.push({ type: "hit" });
            break;
          }
          this.collected += 1;
          this.events.push({ type: "collect", collected: this.collected });
          if (this.collected >= this.target) {
            this.phase = "won";
            this.events.push({ type: "win" });
            break;
          }
          continue;
        }
        if (item.y < HEIGHT + item.size) nextItems.push(item);
      }
      this.items = nextItems;
      if (this.phase === "running" && this.elapsed >= this.duration) {
        this.phase = "failed";
        this.events.push({ type: "timeout" });
      }
      return this.snapshot();
    }

    spawn() {
      const margin = 48;
      this.addItem({
        kind: this.random() < 0.28 ? "hazard" : "signal",
        x: margin + this.random() * (WIDTH - margin * 2),
        y: -34,
        size: 22 + Math.floor(this.random() * 12),
        speed: 150 + this.elapsed * 4 + this.random() * 60,
      });
    }

    touchesPlayer(item) {
      const distanceX = item.x - this.player.x;
      const distanceY = item.y - this.player.y;
      const reach = this.player.radius + item.size * 0.52;
      return distanceX * distanceX + distanceY * distanceY <= reach * reach;
    }

    snapshot() {
      return {
        seed: this.seed,
        phase: this.phase,
        elapsed: this.elapsed,
        remaining: Math.max(0, this.duration - this.elapsed),
        collected: this.collected,
        target: this.target,
        input: this.input,
        player: { ...this.player },
        items: this.items.map((item) => ({ ...item })),
        events: this.events.map((event) => ({ ...event })),
      };
    }
  }

  const api = { WIDTH, HEIGHT, STEP_SECONDS, SignalSprintCore, createRandom };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  globalScope.SignalSprintCore = api;
})(typeof globalThis === "undefined" ? window : globalThis);
