// ─────────────────────────────────────────────────────────────
// ENTITY · THE WARM-UP
//
// Every program opens with one, and every program document calls it
// non-negotiable. A sentence cannot be timed, so a warm-up is steps.
//
// Older programs stored a sentence. Those still work — they are read as a
// single untimed step — so nothing breaks while the data catches up.
// ─────────────────────────────────────────────────────────────

const MS = (n) => (Number.isFinite(n) && n > 0 ? Math.floor(n) : 0);

/** Accepts the structured form or the legacy sentence. Always returns steps. */
export function normaliseWarmUp(warmUp) {
  if (!warmUp) return { steps: [], note: "", totalSeconds: 0 };

  if (typeof warmUp === "string") {
    return { steps: [{ name: warmUp, seconds: 0, cue: "" }], note: "", totalSeconds: 0 };
  }

  const steps = Array.isArray(warmUp.steps)
    ? warmUp.steps
        .filter((s) => s && typeof s.name === "string")
        .map((s) => ({ name: s.name, seconds: MS(s.seconds), cue: s.cue || "" }))
    : [];

  return {
    steps,
    note: typeof warmUp.note === "string" ? warmUp.note : "",
    totalSeconds: steps.reduce((n, s) => n + s.seconds, 0),
  };
}

/** Which step a number of elapsed seconds falls in, and how far into it. */
export function stepAt(steps, elapsed) {
  let remaining = Math.max(0, elapsed);
  for (let i = 0; i < steps.length; i++) {
    if (remaining < steps[i].seconds || steps[i].seconds === 0) {
      return { index: i, into: remaining, left: Math.max(0, steps[i].seconds - remaining) };
    }
    remaining -= steps[i].seconds;
  }
  return { index: steps.length, into: 0, left: 0, complete: true };
}

export default { normaliseWarmUp, stepAt };

// ─────────────────────────────────────────────────────────────
// The guided sequence inside a step
//
// Surya Namaskar is not one movement held for five minutes. It is twelve
// poses, cycled — one set leading with the right leg, the next with the left,
// the pair of them making a round. A step that names a sequence is walked
// pose by pose rather than counted down as a single block.
//
// Pure, as everything here is. The poses are handed in; this file does not
// know where they come from.
// ─────────────────────────────────────────────────────────────

/**
 * Where in the sequence a number of elapsed seconds lands.
 * Returns the pose, which set and round it belongs to, and which leg leads.
 */
export function poseAt(poses, elapsed, secondsPerPose = 5) {
  if (!Array.isArray(poses) || poses.length === 0) return null;
  const per = MS(secondsPerPose) || 5;
  const seconds = Math.max(0, Math.floor(elapsed));

  const spent = Math.floor(seconds / per);
  const index = spent % poses.length;
  const setNumber = Math.floor(spent / poses.length);

  return {
    pose: poses[index],
    index,
    left: per - (seconds % per),
    into: seconds % per,
    set: setNumber + 1,
    round: Math.floor(setNumber / 2) + 1,
    leadLeg: setNumber % 2 === 0 ? "right" : "left",
  };
}

/** How many complete rounds fit in the time given. Two sets make a round. */
export function roundsIn(seconds, poseCount, secondsPerPose = 5) {
  if (!poseCount) return 0;
  return Math.floor(seconds / (poseCount * (secondsPerPose || 5) * 2));
}
