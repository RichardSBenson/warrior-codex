// ─────────────────────────────────────────────────────────────
// DOMAIN · THE MOVEMENT REGISTRY
//
// ONE entry per movement. Sessions, trials, standing orders and the Codex all
// reference these by id — never by name. Change a movement here and it changes
// everywhere, forever.
//
// Each entry carries: what it is, where it came from, how to do it, and how to draw it.
// `video` is a slot: when dojo footage exists, it drops in. Until then, the
// animation carries the load — and it works offline, which the video never will.
//
// COORDINATES: x → right, y → DOWN. Ground at y=92. Figure fills roughly 0–100.
// Every joint is deliberate. A coach can correct any of these by changing a number.
// ─────────────────────────────────────────────────────────────

export const MOVEMENTS = {

  // ── THE ROOM ───────────────────────────────────────────────
  dand: {
    id: "dand",
    name: "Hindu Push-Up",
    original: "Dand",
    culture: "Indian Pehlwani",
    evidence: "D",
    history:
      "With the baithak, the twin pillar of pehlwani conditioning. Wrestlers performed " +
      "hundreds daily in the akhara.",
    purpose: "Pressing endurance, shoulder health, spinal flow.",
    cues: [
      "Start in an inverted V — hips high, arms and legs straight.",
      "Swoop the chest low, close to the ground, between the hands.",
      "Rise into the arch — hips low, chest up, arms straight.",
      "Return the way you came. It is one arc, not a straight press.",
    ],
    video: null,
    view: "side",
    trace: "head",
    dur: 3600,
    frames: [
      { label: "THE INVERTED V", hold: 400,
        head: [30, 58], neck: [35, 53], hip: [55, 31], knee: [68, 62],
        ankle: [74, 90], toe: [79, 92], elbow: [30, 73], hand: [25, 92] },
      { label: "THE DESCENT", hold: 0,
        head: [28, 72], neck: [33, 66], hip: [52, 47], knee: [66, 70],
        ankle: [74, 90], toe: [79, 92], elbow: [27, 79], hand: [25, 92] },
      { label: "THE SWOOP", hold: 180,
        head: [23, 84], neck: [29, 83], hip: [52, 68], knee: [65, 81],
        ankle: [74, 90], toe: [79, 92], elbow: [23, 83], hand: [25, 92] },
      { label: "THE ARCH", hold: 500,
        head: [26, 50], neck: [27, 61], hip: [50, 81], knee: [62, 87],
        ankle: [73, 91], toe: [79, 92], elbow: [25, 77], hand: [25, 92] },
      { label: "RETURN", hold: 0,
        head: [28, 58], neck: [31, 58], hip: [53, 52], knee: [66, 72],
        ankle: [74, 90], toe: [79, 92], elbow: [27, 76], hand: [25, 92] },
    ],
  },

  baithak: {
    id: "baithak",
    name: "Hindu Squat",
    original: "Baithak",
    culture: "Indian Pehlwani",
    evidence: "D",
    history:
      "The core of the akhara wrestler's vyayam. Pehlwans performed 500–2,000 daily, " +
      "and the count was a mark of standing.",
    purpose: "Leg endurance, lactate tolerance, knee resilience.",
    cues: [
      "Heels rise as you descend. Do not fight it — the movement lives on the toes.",
      "Arms sweep back on the way down, forward on the way up.",
      "Drop deep. Hamstring to calf.",
      "Rise in rhythm. Never stop moving.",
    ],
    video: null,
    view: "side",
    trace: "hip",
    dur: 2200,
    frames: [
      { label: "STAND", hold: 220,
        head: [50, 18], neck: [50, 27], hip: [50, 52], knee: [50, 72],
        ankle: [50, 90], toe: [57, 92], elbow: [52, 40], hand: [54, 54] },
      { label: "THE SINK", hold: 0,
        head: [49, 30], neck: [49, 39], hip: [46, 62], knee: [55, 76],
        ankle: [50, 88], toe: [57, 92], elbow: [45, 50], hand: [41, 58] },
      { label: "ON THE TOES", hold: 200,
        head: [48, 46], neck: [48, 54], hip: [44, 74], knee: [58, 79],
        ankle: [51, 86], toe: [57, 92], elbow: [41, 62], hand: [36, 66] },
      { label: "THE DRIVE", hold: 0,
        head: [49, 32], neck: [49, 41], hip: [47, 63], knee: [54, 76],
        ankle: [50, 89], toe: [57, 92], elbow: [52, 48], hand: [57, 48] },
    ],
  },

  horse: {
    id: "horse",
    name: "Horse Stance",
    original: "Ma bu",
    culture: "Shaolin",
    evidence: "D",
    history:
      "The foundational stance of Shaolin and northern kung fu. Held for long periods " +
      "to root the fighter before any strike was taught.",
    purpose: "Isometric leg strength, postural endurance, mental discipline.",
    cues: [
      "Feet wide, toes forward. Thighs parallel to the ground.",
      "Spine straight. Do not lean.",
      "Breathe: in for four, out for eight. Slow the exhale, slow the mind.",
      "Fix your gaze on one point. Do not watch the clock.",
    ],
    video: null,
    view: "front",
    trace: null,
    dur: 5200,
    frames: [
      { label: "SINK", hold: 0,
        head: [50, 20], neck: [50, 31], hipL: [44, 61], hipR: [56, 61],
        kneeL: [31, 66], kneeR: [69, 66], ankleL: [29, 90], ankleR: [71, 90],
        shoulderL: [41, 32], shoulderR: [59, 32],
        elbowL: [34, 46], elbowR: [66, 46], handL: [42, 52], handR: [58, 52] },
      { label: "HOLD", hold: 1400,
        head: [50, 21], neck: [50, 32], hipL: [44, 63], hipR: [56, 63],
        kneeL: [30, 66], kneeR: [70, 66], ankleL: [29, 90], ankleR: [71, 90],
        shoulderL: [41, 33], shoulderR: [59, 33],
        elbowL: [34, 47], elbowR: [66, 47], handL: [42, 53], handR: [58, 53] },
      { label: "BREATHE", hold: 1400,
        head: [50, 20], neck: [50, 31], hipL: [44, 62], hipR: [56, 62],
        kneeL: [30, 66], kneeR: [70, 66], ankleL: [29, 90], ankleR: [71, 90],
        shoulderL: [41, 32], shoulderR: [59, 32],
        elbowL: [34, 46], elbowR: [66, 46], handL: [42, 52], handR: [58, 52] },
    ],
  },

  plank: {
    id: "plank",
    name: "Plank Hold",
    original: null,
    culture: "Universal",
    evidence: "F",
    history:
      "A modern name. The braced core underlies every strike thrown, every load carried, " +
      "and every blow absorbed.",
    purpose: "Core endurance, bracing.",
    cues: [
      "Elbows under shoulders. Forearms flat.",
      "One straight line from crown to heel. No sag, no pike.",
      "Squeeze the glutes. Brace as if about to take a blow.",
      "Breathe. Holding your breath is how the hold ends early.",
    ],
    video: null,
    view: "side",
    trace: null,
    dur: 4000,
    frames: [
      { label: "BRACE", hold: 1600,
        head: [22, 62], neck: [30, 64], hip: [58, 66], knee: [72, 70],
        ankle: [86, 74], toe: [88, 80], elbow: [26, 78], hand: [34, 80] },
      { label: "HOLD", hold: 1600,
        head: [22, 63], neck: [30, 65], hip: [58, 67], knee: [72, 71],
        ankle: [86, 75], toe: [88, 81], elbow: [26, 79], hand: [34, 81] },
    ],
  },

  fingertip: {
    id: "fingertip",
    name: "Fingertip Push-Up",
    original: null,
    culture: "Shaolin",
    evidence: "D",
    history:
      "Iron-body training. Shaolin monks progressively reduced the number of supporting " +
      "fingers — one of the hardest conditioning feats in any tradition.",
    purpose: "Finger, tendon and grip strength.",
    cues: [
      "Fingers spread wide and firmly planted. Wrists straight.",
      "Lower under full control. Never drop.",
      "BUILD TO IT: fingertip plank first, then against a wall, then the floor.",
      "Stop at any joint pain. No rank is worth a ruined hand.",
    ],
    warning: true,
    video: null,
    view: "side",
    trace: null,
    dur: 2600,
    frames: [
      { label: "TOP", hold: 300,
        head: [22, 56], neck: [30, 58], hip: [58, 64], knee: [72, 70],
        ankle: [86, 76], toe: [88, 82], elbow: [26, 72], hand: [24, 86] },
      { label: "LOWER", hold: 0,
        head: [21, 68], neck: [29, 70], hip: [58, 72], knee: [72, 76],
        ankle: [86, 80], toe: [88, 85], elbow: [21, 79], hand: [24, 86] },
      { label: "BOTTOM", hold: 260,
        head: [20, 76], neck: [28, 78], hip: [58, 78], knee: [72, 80],
        ankle: [86, 82], toe: [88, 86], elbow: [18, 83], hand: [24, 86] },
    ],
  },

  // ── THE BAR ────────────────────────────────────────────────
  pullup: {
    id: "pullup",
    name: "Pull-Up",
    original: null,
    culture: "Universal",
    evidence: "D",
    history:
      "Walls, ropes, rigging, cliffs. The most universally necessary warrior movement there is.",
    purpose: "Vertical pulling strength.",
    cues: [
      "Dead hang. Arms straight at the bottom — every rep, no exceptions.",
      "Pull with the back, not the arms. Drive the elbows down.",
      "Chin clears the bar.",
      "Lower under control. The negative is half the rep.",
    ],
    video: null,
    view: "side",
    trace: "head",
    dur: 2400,
    frames: [
      { label: "DEAD HANG", hold: 320,
        head: [50, 34], neck: [50, 42], hip: [50, 64], knee: [51, 80],
        ankle: [52, 92], toe: [58, 93], elbow: [50, 26], hand: [50, 14] },
      { label: "THE PULL", hold: 0,
        head: [50, 26], neck: [50, 34], hip: [51, 56], knee: [53, 72],
        ankle: [55, 85], toe: [61, 87], elbow: [45, 24], hand: [50, 14] },
      { label: "CHIN OVER", hold: 260,
        head: [50, 19], neck: [50, 27], hip: [51, 49], knee: [54, 65],
        ankle: [57, 78], toe: [63, 80], elbow: [42, 26], hand: [50, 14] },
    ],
  },

  deadhang: {
    id: "deadhang",
    name: "Dead Hang",
    original: null,
    culture: "Universal",
    evidence: "D",
    history:
      "Hanging from a ledge, a rope, a cliff. Grip fails first — and it is trained last.",
    purpose: "Grip endurance, shoulder decompression.",
    cues: [
      "Full grip. Thumb around the bar.",
      "Shoulders engaged, not slack in the socket.",
      "Body still. Swinging is not hanging.",
      "The forearms will burn. That is the trial.",
    ],
    video: null,
    view: "side",
    trace: null,
    dur: 4200,
    frames: [
      { label: "HANG", hold: 1800,
        head: [50, 34], neck: [50, 42], hip: [50, 64], knee: [51, 80],
        ankle: [52, 92], toe: [58, 93], elbow: [50, 26], hand: [50, 14] },
      { label: "HOLD", hold: 1800,
        head: [50, 35], neck: [50, 43], hip: [50, 65], knee: [51, 81],
        ankle: [52, 92], toe: [58, 93], elbow: [50, 27], hand: [50, 14] },
    ],
  },
};

export const getMovement = (id) => MOVEMENTS[id] || null;
export const allMovements = () => Object.values(MOVEMENTS);
export const movementIds = () => Object.keys(MOVEMENTS);

/** Trials map to the movement that demonstrates them. */
export const TRIAL_MOVEMENT = {
  dand: "dand",
  baithak: "baithak",
  horse: "horse",
  plank: "plank",
  fingertip: "fingertip",
  pullups: "pullup",
  deadhang: "deadhang",
};
