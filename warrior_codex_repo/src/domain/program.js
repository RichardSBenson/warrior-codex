// ─────────────────────────────────────────────────────────────
// DOMAIN · THE PROGRAMS
// Weeks to climb FROM each rank to the next. Six sessions a week.
// The program sets the day of the test. The warrior does not choose it.
// ─────────────────────────────────────────────────────────────

export const PROGRAM_WEEKS = {
  Recruit: 12, Soldier: 16, Warrior: 20, Veteran: 24, Warlord: 32, Legend: null,
};

export const SESSIONS_PER_WEEK = 6;

// The six-day split.
export const SPLIT = ["STRIKE", "RAID", "MARCH", "BATTLE", "POWER", "GAMES"];

/**
 * One session, fully specified. The full program data slots into this shape unchanged —
 * this is the contract the session player reads.
 *   type: "sets"     — reps per set
 *   type: "hold"     — timed hold, per set
 *   type: "holdEach" — timed hold, each side
 */
export const SAMPLE_SESSION = {
  rank: "Recruit",
  week: 4,
  dayNumber: 1,
  dayName: "STRIKE",
  focus: "Push + Core",
  movements: [
    { name: "Hindu Push-Up",       sub: "Dand",      type: "sets", sets: 4, reps: "12 reps", rest: 45 },
    { name: "Pike Push-Up",        sub: "",          type: "sets", sets: 4, reps: "10 reps", rest: 45 },
    { name: "Diamond Push-Up",     sub: "",          type: "sets", sets: 3, reps: "12 reps", rest: 45 },
    { name: "Clap Push-Up",        sub: "explosive", type: "sets", sets: 3, reps: "6 reps",  rest: 60 },
    { name: "Plank Hold",          sub: "",          type: "hold", sets: 3, seconds: 45, rest: 40 },
    { name: "Shaolin Hollow Hold", sub: "",          type: "hold", sets: 3, seconds: 25, rest: 30 },
    { name: "Bow Draw",            sub: "each side", type: "sets", sets: 3, reps: "8 each side", rest: 40, movementId: "bowdraw" },
  ],
};

export const WARM_UP = "Warm up first — 5 minutes Surya Namaskar. Then complete every set.";
