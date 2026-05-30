/*
 * floaty eye thingies
 * A game poem about the little drifting things inside your eyes.
 *
 * The whole piece rests on one true detail: you can never look straight at a
 * floater. The moment your gaze settles on one, it slides away on the current
 * of the eye's own movement. Here, your pointer is your gaze, and the floaters
 * obey the same shyness.
 */

import { rand } from "./core/math.js";

const canvas = document.getElementById("field");
const ctx = canvas.getContext("2d");
const poem = document.getElementById("poem");

const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

// --- viewport ------------------------------------------------------------

let width = 0;
let height = 0;
let dpr = 1;

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// --- gaze (the pointer) --------------------------------------------------

const gaze = { x: -9999, y: -9999, active: false };
let travelled = 0; // how far the gaze has wandered, for fading the words

function moveGaze(x, y) {
  if (gaze.active) {
    travelled += Math.hypot(x - gaze.x, y - gaze.y);
    if (travelled > 240) poem.classList.add("faded");
  }
  gaze.x = x;
  gaze.y = y;
  gaze.active = true;
}

window.addEventListener("pointermove", (e) => moveGaze(e.clientX, e.clientY));
window.addEventListener("pointerdown", (e) => moveGaze(e.clientX, e.clientY));
window.addEventListener("pointerleave", () => (gaze.active = false));
// On touch there is no hover: when the finger lifts, the gaze lets go too.
window.addEventListener("pointerup", (e) => {
  if (e.pointerType !== "mouse") gaze.active = false;
});
window.addEventListener("pointercancel", () => (gaze.active = false));

// --- tilt (debug / prototype) --------------------------------------------
//
// A sketch for the Settle fold: when debug is on, deviceorientation drives
// a tilt vector that biases each floater's home drift, so the field gently
// flows toward "down" as you tip the phone. The compass overlay in the
// corner shows the live tilt. Once #8 lands this moves into a proper
// input/orientation module behind the Behavior interface.

const debugToggle = document.getElementById("debug-toggle");
const tilt = { x: 0, y: 0, calibrated: null, receiving: false };
let debug = false;

const TILT_RANGE = 30;   // degrees mapped to a unit on each axis
const TILT_FORCE = 0.6;  // drift-velocity contribution at |tilt| = 1, depth = 1

function onOrientation(e) {
  if (e.beta == null || e.gamma == null) return;
  // First reading defines "neutral" — however you're holding the phone now
  // becomes rest, so any motion from here reads as tilt.
  if (tilt.calibrated === null) {
    tilt.calibrated = { beta: e.beta, gamma: e.gamma };
  }
  const dx = e.gamma - tilt.calibrated.gamma; // left/right
  const dy = e.beta  - tilt.calibrated.beta;  // front/back pitch
  tilt.x = Math.max(-1, Math.min(1, dx / TILT_RANGE));
  tilt.y = Math.max(-1, Math.min(1, dy / TILT_RANGE));
  tilt.receiving = true;
}

async function enableTilt() {
  // iOS 13+ requires explicit permission from a user gesture; the change
  // event on the checkbox counts. Other browsers just attach the listener.
  if (typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function") {
    try {
      const result = await DeviceOrientationEvent.requestPermission();
      if (result !== "granted") return;
    } catch {
      return;
    }
  }
  window.addEventListener("deviceorientation", onOrientation);
}

function disableTilt() {
  window.removeEventListener("deviceorientation", onOrientation);
  tilt.x = 0;
  tilt.y = 0;
  tilt.calibrated = null;
  tilt.receiving = false;
}

debugToggle.addEventListener("change", async () => {
  debug = debugToggle.checked;
  if (debug) await enableTilt();
  else disableTilt();
});

// --- floaters ------------------------------------------------------------

// Eye floaters come in a few recognisable shapes: lone blobs, strands of
// beads, loose clusters, and faint rings. We build each from soft circles so
// they all share the same translucent, slightly-out-of-focus quality.

const TYPES = ["blob", "strand", "cluster", "ring"];

function makeBeads(type, scale) {
  const beads = [];
  if (type === "blob") {
    beads.push({ x: 0, y: 0, r: rand(7, 12) });
    beads.push({ x: rand(-4, 4), y: rand(-4, 4), r: rand(3, 6) });
  } else if (type === "strand") {
    const n = Math.floor(rand(5, 9));
    const dir = rand(0, Math.PI * 2);
    let px = 0;
    let py = 0;
    let ang = dir;
    for (let i = 0; i < n; i++) {
      ang += rand(-0.5, 0.5);
      const step = rand(6, 10);
      px += Math.cos(ang) * step;
      py += Math.sin(ang) * step;
      beads.push({ x: px, y: py, r: rand(2.2, 4.2) });
    }
  } else if (type === "cluster") {
    const n = Math.floor(rand(5, 10));
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2);
      const d = rand(0, 10);
      beads.push({ x: Math.cos(a) * d, y: Math.sin(a) * d, r: rand(2, 5) });
    }
  } else {
    // ring: beads arranged around an empty centre
    const n = Math.floor(rand(8, 12));
    const rad = rand(8, 13);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      beads.push({ x: Math.cos(a) * rad, y: Math.sin(a) * rad, r: rand(1.8, 3) });
    }
  }
  for (const b of beads) {
    b.x *= scale;
    b.y *= scale;
    b.r *= scale;
  }
  return beads;
}

class Floater {
  constructor() {
    this.reset(true);
  }

  reset(initial) {
    // depth gives parallax: nearer floaters are bigger, blurrier, faster.
    this.depth = rand(0.5, 1.4);
    this.scale = this.depth;
    this.type = TYPES[Math.floor(Math.random() * TYPES.length)];
    this.beads = makeBeads(this.type, this.scale);
    this.alpha = rand(0.05, 0.16) * (1.6 - this.depth * 0.6);
    this.blur = (3 + this.depth * 7);

    this.x = initial ? rand(0, width) : rand(-40, width + 40);
    this.y = initial ? rand(0, height) : rand(-40, height + 40);

    // a slow home drift, like fluid settling under its own weight
    const speed = (reduceMotion ? 0.05 : 0.12) * this.depth;
    this.dvx = rand(-0.4, 0.4) * speed;
    this.dvy = rand(0.2, 0.7) * speed; // a gentle tendency to sink
    this.vx = this.dvx;
    this.vy = this.dvy;

    // phase offsets for an organic wander
    this.t = rand(0, 1000);
    this.wanderAmp = reduceMotion ? 0.004 : 0.018;
    this.rot = rand(0, Math.PI * 2);
    this.spin = rand(-0.0015, 0.0015);
  }

  update(dt) {
    this.t += dt;

    // wander: summed sines stand in for cheap, smooth noise
    const wx = Math.sin(this.t * 0.0011 + this.rot) +
               0.5 * Math.sin(this.t * 0.0027);
    const wy = Math.cos(this.t * 0.0009 - this.rot) +
               0.5 * Math.cos(this.t * 0.0031);
    this.vx += wx * this.wanderAmp * this.depth;
    this.vy += wy * this.wanderAmp * this.depth;

    // the shyness: the closer the gaze, the harder it slips away
    if (gaze.active) {
      const ddx = this.x - gaze.x;
      const ddy = this.y - gaze.y;
      const dist = Math.hypot(ddx, ddy) || 0.0001;
      const reach = 150 * this.depth;
      if (dist < reach) {
        const push = Math.pow(1 - dist / reach, 2) * 1.6 * this.depth;
        this.vx += (ddx / dist) * push;
        this.vy += (ddy / dist) * push;
      }
    }

    // ease back toward the home drift so they always resettle; tilt nudges
    // the whole field in the direction of gravity, scaled by depth so
    // nearer floaters move more (matches the parallax).
    const targetVx = this.dvx + tilt.x * TILT_FORCE * this.depth;
    const targetVy = this.dvy + tilt.y * TILT_FORCE * this.depth;
    this.vx += (targetVx - this.vx) * 0.02;
    this.vy += (targetVy - this.vy) * 0.02;

    this.x += this.vx * dt * 0.06;
    this.y += this.vy * dt * 0.06;
    this.rot += this.spin * dt;

    // wrap softly around the edges of vision
    const m = 60;
    if (this.x < -m) this.x = width + m;
    else if (this.x > width + m) this.x = -m;
    if (this.y < -m) this.y = height + m;
    else if (this.y > height + m) this.y = -m;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.globalAlpha = this.alpha;
    ctx.shadowColor = "rgba(40, 50, 60, 0.5)";
    ctx.shadowBlur = this.blur;
    for (const b of this.beads) {
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      g.addColorStop(0, "rgba(70, 80, 92, 0.9)");
      g.addColorStop(0.6, "rgba(70, 80, 92, 0.35)");
      g.addColorStop(1, "rgba(70, 80, 92, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

let floaters = [];

function populate() {
  const count = Math.round(
    Math.min(34, Math.max(12, (width * height) / 42000))
  );
  floaters = [];
  for (let i = 0; i < count; i++) floaters.push(new Floater());
}

// --- backdrop ------------------------------------------------------------

function drawBackground() {
  // a soft, bright field — the pale light you look into to find them
  const cx = gaze.active ? gaze.x : width / 2;
  const cy = gaze.active ? gaze.y : height * 0.4;
  const bg = ctx.createRadialGradient(
    cx, cy, 0,
    width / 2, height / 2, Math.max(width, height) * 0.85
  );
  bg.addColorStop(0, "#fbfdff");
  bg.addColorStop(0.55, "#eef2f5");
  bg.addColorStop(1, "#dfe5ea");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);
}

function drawGaze() {
  if (!gaze.active) return;
  // the faint warmth of where you are looking — felt, not quite seen
  const g = ctx.createRadialGradient(
    gaze.x, gaze.y, 0, gaze.x, gaze.y, 90
  );
  g.addColorStop(0, "rgba(255, 255, 255, 0.5)");
  g.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(gaze.x, gaze.y, 90, 0, Math.PI * 2);
  ctx.fill();
}

function drawVignette() {
  const v = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.3,
    width / 2, height / 2, Math.max(width, height) * 0.75
  );
  v.addColorStop(0, "rgba(120, 130, 140, 0)");
  v.addColorStop(1, "rgba(120, 130, 140, 0.22)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, width, height);
}

function drawDebugArrow() {
  // sits below the debug checkbox in the top-right corner
  const radius = 32;
  const cx = width - radius - 18;
  const cy = 18 + 28 + radius;

  ctx.save();

  // compass face
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.fill();
  ctx.strokeStyle = "rgba(60, 70, 80, 0.3)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // center crosshair
  ctx.beginPath();
  ctx.moveTo(cx - 3, cy); ctx.lineTo(cx + 3, cy);
  ctx.moveTo(cx, cy - 3); ctx.lineTo(cx, cy + 3);
  ctx.strokeStyle = "rgba(60, 70, 80, 0.35)";
  ctx.stroke();

  // arrow proportional to tilt magnitude
  const ex = cx + tilt.x * radius;
  const ey = cy + tilt.y * radius;
  const mag = Math.hypot(tilt.x, tilt.y);
  if (mag > 0.02) {
    ctx.strokeStyle = "rgba(60, 70, 80, 0.85)";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    const angle = Math.atan2(ey - cy, ex - cx);
    const head = 7;
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex - head * Math.cos(angle - Math.PI / 6),
               ey - head * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex - head * Math.cos(angle + Math.PI / 6),
               ey - head * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  }

  // numeric readout
  ctx.font = "10px ui-monospace, Menlo, Consolas, monospace";
  ctx.fillStyle = "rgba(60, 70, 80, 0.55)";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(
    tilt.receiving
      ? `${tilt.x.toFixed(2)}, ${tilt.y.toFixed(2)}`
      : "(no tilt)",
    cx, cy + radius + 6
  );

  ctx.restore();
}

// --- loop ----------------------------------------------------------------

let last = performance.now();

function frame(now) {
  let dt = now - last;
  last = now;
  if (dt > 50) dt = 50; // keep things calm after a tab switch

  drawBackground();
  for (const f of floaters) f.update(dt);
  for (const f of floaters) f.draw();
  drawGaze();
  drawVignette();
  if (debug) drawDebugArrow();

  requestAnimationFrame(frame);
}

// --- boot ----------------------------------------------------------------

function init() {
  resize();
  populate();
  requestAnimationFrame(frame);
}

let resizeTimer = null;
window.addEventListener("resize", () => {
  resize();
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(populate, 200);
});

init();
