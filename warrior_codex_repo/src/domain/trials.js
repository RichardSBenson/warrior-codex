// ─────────────────────────────────────────────────────────────
// DOMAIN · TRIALS
// The ten trials, grouped by what they demand of you.
// Thresholds are indexed: 0=Recruit 1=Soldier 2=Warrior 3=Veteran 4=Warlord 5=Legend
// ─────────────────────────────────────────────────────────────

export const TIERS = [
  { key: "room",  title: "THE ROOM",  blurb: "No equipment. No excuses. Begin here." },
  { key: "bar",   title: "THE BAR",   blurb: "Find a bar, a beam, a branch, a ledge." },
  { key: "field", title: "THE FIELD", blurb: "Open ground. This is where the truth is told." },
];

export const CORE_TESTS = [
  { id: "dand", group: "room", needs: "No equipment",
    name: "Hindu Push-Ups", sub: "Dand", culture: "Indian Pehlwani",
    type: "reps", timeCap: 300, higher: true, unit: "reps",
    thresholds: [10, 25, 50, 75, 100, 150] },

  { id: "baithak", group: "room", needs: "No equipment",
    name: "Hindu Squats", sub: "Baithak", culture: "Indian Pehlwani",
    type: "reps", timeCap: 600, higher: true, unit: "reps",
    thresholds: [20, 50, 100, 200, 350, 500] },

  { id: "horse", group: "room", needs: "No equipment",
    name: "Horse Stance", sub: "Ma Bu", culture: "Shaolin",
    type: "secs", higher: true, unit: "sec",
    thresholds: [30, 60, 120, 180, 300, 480] },

  { id: "plank", group: "room", needs: "No equipment",
    name: "Plank Hold", sub: "", culture: "Universal",
    type: "secs", higher: true, unit: "sec",
    thresholds: [45, 90, 120, 180, 240, 360] },

  { id: "fingertip", group: "room", needs: "No equipment",
    name: "Fingertip Push-Ups", sub: "Shaolin", culture: "Shaolin",
    type: "reps", timeCap: null, higher: true, unit: "reps",
    thresholds: [0, 3, 8, 15, 25, 40],
    // Fingertips load the tendons hard. This is not optional guidance.
    safety: "Fingertips load the tendons hard. If you are new: hold a fingertip plank, then press " +
            "against a wall, then drop to the floor over weeks. Stop at any joint pain. Zero reps is a " +
            "valid Recruit score — there is no shame in it, and no rank worth a ruined hand." },

  { id: "pullups", group: "bar", needs: "A bar, beam or ledge",
    name: "Pull-Ups", sub: "", culture: "Universal",
    type: "reps", timeCap: 120, higher: true, unit: "reps",
    thresholds: [0, 5, 10, 15, 20, 25] },

  { id: "deadhang", group: "bar", needs: "A bar, beam or ledge",
    name: "Dead Hang", sub: "Cliff Grip", culture: "Universal",
    type: "secs", higher: true, unit: "sec",
    thresholds: [15, 30, 60, 90, 30, 60],
    // From Warlord the trial becomes the ONE-ARM Cliff Grip — both arms, weaker arm scores.
    note: "From Warlord this becomes the One-Arm Cliff Grip: 30s each arm at Warlord, 60s each arm " +
          "at Legend. Both arms must hold. The weaker arm is your score." },

  { id: "run", group: "field", needs: "A measured 2 km route",
    name: "2 km Run", sub: "", culture: "Universal",
    type: "secs", higher: false, unit: "sec",
    thresholds: [840, 720, 600, 540, 480, 420] },

  { id: "broadjump", group: "field", needs: "About 3 m of clear ground",
    name: "Broad Jump", sub: "best of 3", culture: "Greek",
    type: "dist", higher: true, unit: "m",
    thresholds: [1.2, 1.5, 1.8, 2.1, 2.4, 2.7] },

  { id: "bearcrawl", group: "field", needs: "A measured 20 m",
    name: "Bear Crawl 20m", sub: "", culture: "Universal",
    type: "secs", higher: false, unit: "sec",
    thresholds: [30, 25, 20, 16, 13, 10] },
];

// Earned, not required at entry. Sits OUTSIDE the ten.
export const WARLORD_TRIAL = {
  name: "The Warlord Trial — The Loaded Carry",
  detail: "Carry a stone, log or sandbag 50 metres, unbroken. Carried, not dragged.",
  standards: [
    { rank: "Warlord", load: "100% of bodyweight", distance: "50 metres" },
    { rank: "Legend",  load: "125% of bodyweight", distance: "50 metres" },
  ],
};

export const ROOM_IDS = CORE_TESTS.filter(t => t.group === "room").map(t => t.id);
export const testById = (id) => CORE_TESTS.find(t => t.id === id);
