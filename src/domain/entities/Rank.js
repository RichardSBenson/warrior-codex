// ─────────────────────────────────────────────────────────────
// DOMAIN · RANKS
// The ladder, and how a single trial is scored against it.
// Pure. Knows nothing of React, storage, or the outside world.
// ─────────────────────────────────────────────────────────────

export const RANKS = ["Recruit", "Soldier", "Warrior", "Veteran", "Warlord", "Legend"];

export const RANK_COLORS = {
  Recruit: "#8a8a8a",
  Soldier: "#c0704a",
  Warrior: "#c9a227",
  Veteran: "#9b59b6",
  Warlord: "#c0392b",
  Legend:  "#e8d48a",
};

export const REVEAL_FLAVOR = {
  Recruit: "Every warrior began here. The path is open.",
  Soldier: "You hold the line. The ranks will have you.",
  Warrior: "You are dangerous alone. Few reach this ground.",
  Veteran: "You have endured. Long service, and still standing.",
  Warlord: "You lead. Others move because you move.",
  Legend:  "Your name outlives your body. There is nothing above this.",
};

// The lore. Every rank is a role a person actually held.
export const RANK_LORE = {
  Recruit: "The Roman tiro — drilled with weapons of double weight, so that real arms felt light.",
  Soldier: "The Roman miles — twenty miles in five hours under load, and again tomorrow.",
  Warrior: "The individual fighter of the Celtic, Norse and Zulu traditions. Judged alone.",
  Veteran: "The Roman veteranus — served the full term and came out the other side.",
  Warlord: "The war-leader. Others move because you move.",
  Legend:  "Kleos aphthiton — imperishable fame. The name that outlives the body.",
};

export const rankIndex = (name) => RANKS.indexOf(name);
export const nextRank = (i) => RANKS[Math.min(i + 1, RANKS.length - 1)];
export const isMaxRank = (i) => i === RANKS.length - 1;

/**
 * Score one trial against the ladder.
 * Returns the highest rank index the value satisfies (0 = Recruit).
 */
export function rankForTest(trial, value) {
  if (value === undefined || value === null) return 0;
  let rank = 0;
  for (let i = 0; i < trial.thresholds.length; i++) {
    const t = trial.thresholds[i];
    if (t === null) continue;
    const meets = trial.higher ? value >= t : value <= t;
    if (meets) rank = i;
  }
  return rank;
}
