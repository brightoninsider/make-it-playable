(function startSignalSprint() {
  "use strict";

  if (!window.SignalSprintCore) return;

  const { WIDTH, HEIGHT, STEP_SECONDS, SignalSprintCore } = window.SignalSprintCore;
  const CONFIG = {
    title: "Signal Sprint",
    subtitle: "A small, finished Canvas game starter",
    seed: 513,
    colours: { ink: "#172334", paper: "#f7f4ed", signal: "#2ab7a9", warning: "#e85454", night: "#16243b" },
  };

  const canvas = document.querySelector("canvas");
  const context = canvas.getContext("2d");
  const app = document.querySelector(".game-shell");
  const menu = document.querySelector(".menu");
  const menuTitle = document.querySelector("[data-menu-title]");
  const menuCopy = document.querySelector("[data-menu-copy]");
  const primary = document.querySelector("[data-primary]");
  const pauseButton = document.querySelector("[data-pause]");
  const muteButton = document.querySelector("[data-mute]");
  const score = document.querySelector("[data-score]");
  const clock = document.querySelector("[data-clock]");
  const live = document.querySelector("[data-live]");
  const title = document.querySelector("[data-title]");
  const subtitle = document.querySelector("[data-subtitle]");
  title.textContent = CONFIG.title;
  subtitle.textContent = CONFIG.subtitle;

  const core = new SignalSprintCore({ seed: CONFIG.seed });
  let lastFrame = performance.now();
  let accumulator = 0;
  let muted = false;
  let audioContext = null;
  let animation = 0;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function writeLive(message) {
    live.textContent = message;
  }

  function formatTime(seconds) {
    return `${Math.ceil(seconds).toString().padStart(2, "0")}s`;
  }

  function updateHud(state) {
    score.textContent = `${state.collected} / ${state.target}`;
    clock.textContent = formatTime(state.remaining);
    pauseButton.disabled = state.phase !== "running" && state.phase !== "paused";
    pauseButton.textContent = state.phase === "paused" ? "Resume" : "Pause";
  }

  function showMenu(heading, copy, action) {
    menu.hidden = false;
    menuTitle.textContent = heading;
    menuCopy.textContent = copy;
    primary.textContent = action;
    primary.focus({ preventScroll: true });
  }

  function hideMenu() {
    menu.hidden = true;
  }

  function reset() {
    core.reset(CONFIG.seed);
    accumulator = 0;
    lastFrame = performance.now();
    updateHud(core.snapshot());
    showMenu("Catch the signals.", "Move left and right. Collect eight teal signals; avoid red static. Arrow keys or A/D work alongside touch and pointer controls.", "Start round");
    writeLive("Ready. Collect eight signals before time runs out.");
  }

  function ensureAudio() {
    if (muted || audioContext) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    try {
      audioContext = new AudioContext();
    } catch (_) {
      audioContext = null;
    }
  }

  function tone(frequency, duration, type) {
    if (muted || !audioContext || audioContext.state !== "running") return;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = type || "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.09, audioContext.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration + 0.02);
  }

  function begin() {
    ensureAudio();
    if (!muted && audioContext && audioContext.state === "suspended") audioContext.resume().catch(() => {});
    core.start();
    accumulator = 0;
    lastFrame = performance.now();
    hideMenu();
    canvas.focus({ preventScroll: true });
    updateHud(core.snapshot());
    writeLive("Round started. Move left and right to catch teal signals.");
    tone(440, 0.08, "triangle");
  }

  function pause() {
    const state = core.snapshot();
    if (state.phase === "running") {
      core.pause();
      accumulator = 0;
      if (audioContext) audioContext.suspend().catch(() => {});
      showMenu("Round paused.", "Your score and timer are waiting. Resume when you are ready.", "Resume");
      writeLive("Round paused.");
    } else if (state.phase === "paused") {
      begin();
    }
    updateHud(core.snapshot());
  }

  function processEvents(state) {
    for (const event of state.events) {
      if (event.type === "collect") tone(660, 0.07, "sine");
      if (event.type === "hit" || event.type === "timeout") tone(120, 0.24, "sawtooth");
      if (event.type === "win") tone(880, 0.16, "triangle");
    }
    if (state.phase === "won") {
      showMenu("Signal line open.", `You caught ${state.collected} signals with ${formatTime(state.remaining)} remaining.`, "Play again");
      writeLive(`You won with ${formatTime(state.remaining)} remaining.`);
    }
    if (state.phase === "failed") {
      showMenu("Static got through.", `You caught ${state.collected} of ${state.target} signals. Try the same seeded round again.`, "Retry round");
      writeLive(`Round ended. You caught ${state.collected} signals.`);
    }
  }

  function update(delta) {
    if (core.snapshot().phase !== "running") {
      accumulator = 0;
      updateHud(core.snapshot());
      return;
    }
    accumulator += Math.min(delta, 0.12);
    while (accumulator >= STEP_SECONDS) {
      const state = core.step(STEP_SECONDS);
      processEvents(state);
      accumulator -= STEP_SECONDS;
      if (state.phase !== "running") break;
    }
    updateHud(core.snapshot());
  }

  function roundedRect(x, y, width, height, radius) {
    context.beginPath();
    context.roundRect(x, y, width, height, radius);
  }

  function draw(state, alpha) {
    const factor = canvas.width / WIDTH;
    context.setTransform(factor, 0, 0, factor, 0, 0);
    const gradient = context.createLinearGradient(0, 0, 0, HEIGHT);
    gradient.addColorStop(0, "#213a60");
    gradient.addColorStop(1, CONFIG.colours.night);
    context.fillStyle = gradient;
    context.fillRect(0, 0, WIDTH, HEIGHT);
    context.globalAlpha = 0.22;
    for (let index = 0; index < 17; index += 1) {
      const x = (index * 89 + 37) % WIDTH;
      const y = (index * 131 + 61) % 360;
      context.fillStyle = "#d7f5ff";
      context.fillRect(x, y, 2, 2);
    }
    context.globalAlpha = 1;
    context.fillStyle = "#20314d";
    context.fillRect(0, 478, WIDTH, 62);
    context.strokeStyle = "rgba(235, 247, 252, .18)";
    context.lineWidth = 2;
    for (let x = 20; x < WIDTH; x += 80) {
      context.beginPath();
      context.moveTo(x, 492);
      context.lineTo(x + 40, 524);
      context.stroke();
    }
    for (const item of state.items) {
      const y = item.previousY + (item.y - item.previousY) * alpha;
      context.save();
      context.translate(item.x, y);
      context.rotate(reducedMotion.matches ? 0 : y * 0.006);
      context.fillStyle = item.kind === "signal" ? CONFIG.colours.signal : CONFIG.colours.warning;
      if (item.kind === "signal") {
        roundedRect(-item.size / 2, -item.size / 2, item.size, item.size, 6);
        context.fill();
        context.fillStyle = "rgba(255,255,255,.56)";
        context.fillRect(-item.size * 0.22, -item.size * 0.26, item.size * 0.44, 3);
      } else {
        context.beginPath();
        context.moveTo(0, -item.size * 0.7);
        context.lineTo(item.size * 0.66, item.size * 0.58);
        context.lineTo(-item.size * 0.66, item.size * 0.58);
        context.closePath();
        context.fill();
        context.fillStyle = "rgba(255,255,255,.78)";
        context.fillRect(-2, -item.size * 0.18, 4, item.size * 0.43);
      }
      context.restore();
    }
    const x = state.player.previousX + (state.player.x - state.player.previousX) * alpha;
    context.save();
    context.translate(x, state.player.y);
    context.fillStyle = CONFIG.colours.paper;
    context.beginPath();
    context.arc(0, 0, state.player.radius, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = CONFIG.colours.ink;
    context.beginPath();
    context.arc(0, 0, 7, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const pixels = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * pixels);
    canvas.height = Math.round(rect.width * pixels * (HEIGHT / WIDTH));
    canvas.style.height = `${rect.width * (HEIGHT / WIDTH)}px`;
  }

  function frame(now) {
    const delta = (now - lastFrame) / 1000;
    lastFrame = now;
    update(delta);
    draw(core.snapshot(), Math.min(1, Math.max(0, accumulator / STEP_SECONDS)));
    animation = requestAnimationFrame(frame);
  }

  function setPointerInput(event) {
    if (core.snapshot().phase !== "running") return;
    const rect = canvas.getBoundingClientRect();
    core.setInput(event.clientX - rect.left < rect.width / 2 ? -1 : 1);
  }

  primary.addEventListener("click", () => {
    const phase = core.snapshot().phase;
    if (phase === "won" || phase === "failed") reset();
    begin();
  });
  pauseButton.addEventListener("click", pause);
  muteButton.addEventListener("click", () => {
    muted = !muted;
    muteButton.setAttribute("aria-pressed", String(muted));
    muteButton.textContent = muted ? "Sound off" : "Sound on";
    if (muted && audioContext) audioContext.suspend().catch(() => {});
    if (!muted) {
      ensureAudio();
      if (audioContext && core.snapshot().phase === "running" && audioContext.state === "suspended") audioContext.resume().catch(() => {});
    }
    if (core.snapshot().phase === "running") canvas.focus({ preventScroll: true });
    writeLive(muted ? "Sound muted." : "Sound enabled.");
  });
  canvas.addEventListener("pointerdown", (event) => { canvas.setPointerCapture(event.pointerId); setPointerInput(event); });
  canvas.addEventListener("pointermove", (event) => { if (event.buttons) setPointerInput(event); });
  canvas.addEventListener("pointerup", () => core.setInput(0));
  canvas.addEventListener("pointercancel", () => core.setInput(0));
  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (event.repeat && ["p", "m"].includes(key)) return;
    if (core.snapshot().phase !== "running" && ["arrowleft", "arrowright", "a", "d"].includes(key)) return;
    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") { core.setInput(-1); event.preventDefault(); }
    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") { core.setInput(1); event.preventDefault(); }
    if (event.key.toLowerCase() === "p") pause();
    if (event.key.toLowerCase() === "m") muteButton.click();
  });
  window.addEventListener("keyup", (event) => {
    if (["ArrowLeft", "ArrowRight", "a", "d", "A", "D"].includes(event.key)) core.setInput(0);
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) return;
    core.setInput(0);
    if (audioContext) audioContext.suspend().catch(() => {});
    if (core.snapshot().phase === "running") pause();
  });
  window.addEventListener("blur", () => {
    core.setInput(0);
    if (core.snapshot().phase === "running") pause();
  });
  window.addEventListener("resize", resize);
  reducedMotion.addEventListener("change", () => app.dataset.motion = reducedMotion.matches ? "reduced" : "full");

  app.dataset.motion = reducedMotion.matches ? "reduced" : "full";
  resize();
  primary.disabled = false;
  muteButton.disabled = false;
  reset();
  cancelAnimationFrame(animation);
  animation = requestAnimationFrame(frame);
})();
