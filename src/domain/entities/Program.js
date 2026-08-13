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
 * The training screen's contract. Real sessions now come from the program via
 * GetSession; this stays as the shape reference and the fallback session.
 *   type: "sets"     — reps per set
 *   type: "hold"     — timed hold, per set
 *   type: "holdEach" — timed hold, each side
 */
export const SESSION_SHAPE = ['rank', 'week', 'dayNumber', 'dayName', 'focus', 'movements'];

export const WARM_UP = "Warm up first — 5 minutes Surya Namaskar. Then complete every set.";
