// ─────────────────────────────────────────────────────────────
// DOMAIN · THE ANIMATION ENGINE
//
// Movements are DRAWN, not filmed. Every joint is specified — so the form is
// exactly what a coach approves, and it can be corrected by changing one number.
//
// Why this exists: 80 movements as keyframes weigh under 200 KB and work offline.
// 80 as video weigh 100+ MB and break the PWA's offline promise — in a garage with
// no signal, which is precisely where our people train.
//
// Pure. No React, no DOM. The renderer is a detail; this is the truth.
// ─────────────────────────────────────────────────────────────

/** Bodies accelerate and settle. Linear motion looks like a puppet. */
export const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

const lerp = (a, b, t) => a + (b - a) * t;
const lerpPoint = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

/**
 * The pose at a moment in the cycle.
 * Each frame may HOLD (a stance is held; a rep is not), then TRAVELS to the next.
 */
export function poseAt(movement, ms) {
  const frames = movement.frames;
  const n = frames.length;
  const holdTotal = frames.reduce((s, f) => s + (f.hold || 0), 0);
  const cycle = holdTotal + movement.dur;
  const travel = movement.dur / n;

  const p = ((ms % cycle) + cycle) % cycle;

  let acc = 0;
  for (let i = 0; i < n; i++) {
    const hold = frames[i].hold || 0;

    if (p < acc + hold) {
      return { pose: frames[i], phase: frames[i].label, t: 0 };
    }
    acc += hold;

    if (p < acc + travel) {
      const raw = (p - acc) / travel;
      const t = ease(raw);
      const a = frames[i];
      const b = frames[(i + 1) % n];
      const pose = {};
      for (const joint in a) {
        if (Array.isArray(a[joint]) && Array.isArray(b[joint])) {
          pose[joint] = lerpPoint(a[joint], b[joint], t);
        }
      }
      return { pose, phase: raw < 0.5 ? a.label : b.label, t };
    }
    acc += travel;
  }
  return { pose: frames[0], phase: frames[0].label, t: 0 };
}

/** Total length of one cycle, in ms. */
export const cycleLength = (m) =>
  m.frames.reduce((s, f) => s + (f.hold || 0), 0) + m.dur;

/**
 * THE TRACE — the arc a joint carves through space across the whole cycle.
 * This is the thing video cannot show: the Dand is an ARC, not a straight press.
 */
export function tracePath(movement, samples = 120) {
  if (!movement.trace) return [];
  const total = cycleLength(movement);
  const pts = [];
  for (let i = 0; i <= samples; i++) {
    const { pose } = poseAt(movement, (i / samples) * total);
    const p = pose[movement.trace];
    if (p) pts.push(p);
  }
  return pts;
}

/** Bones to draw, per view. The skeleton is explicit — nothing is inferred. */
export const SIDE_BONES = [
  ["neck", "hip"],
  ["neck", "elbow", "hand"],
  ["hip", "knee", "ankle"],
  ["ankle", "toe"],
];

export const FRONT_BONES = [
  ["shoulderL", "shoulderR"],
  ["neck", "midHip"],
  ["shoulderL", "elbowL", "handL"],
  ["shoulderR", "elbowR", "handR"],
  ["hipL", "kneeL", "ankleL"],
  ["hipR", "kneeR", "ankleR"],
];

/** Front view needs a mid-hip; derive it rather than storing it in every frame. */
export function withDerived(pose) {
  if (pose.hipL && pose.hipR && !pose.midHip) {
    return {
      ...pose,
      midHip: [(pose.hipL[0] + pose.hipR[0]) / 2, (pose.hipL[1] + pose.hipR[1]) / 2],
    };
  }
  return pose;
}
