// Small math + vector helpers shared across the engine. Plain functions, no
// classes — everything that needs them just imports what it needs.

export function rand(a, b) {
  return a + Math.random() * (b - a);
}

export function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export const vec2 = {
  add(a, b) {
    return { x: a.x + b.x, y: a.y + b.y };
  },
  sub(a, b) {
    return { x: a.x - b.x, y: a.y - b.y };
  },
  len(v) {
    return Math.hypot(v.x, v.y);
  },
  normalize(v) {
    const l = Math.hypot(v.x, v.y);
    return l > 0 ? { x: v.x / l, y: v.y / l } : { x: 0, y: 0 };
  },
};
