// ─────────────────────────────────────────────────────────────
// USE CASE · SEEDING A STANDING
//
// For testing only. Produces the set of trial results a warrior standing at a
// given rank would hold — every trial exactly at that rank's threshold.
//
// Pure, and deliberately blunt: it reads the thresholds already written in
// Trial.js rather than inventing plausible numbers, so a seeded standing is
// always exactly the rank asked for and never accidentally one either side.
// ─────────────────────────────────────────────────────────────
import { CORE_TESTS } from "../entities/Trial.js";
import { RANKS } from "../entities/Rank.js";

/** Every trial at the threshold for the named rank. */
export function resultsAtRank(rankName) {
  const i = RANKS.indexOf(rankName);
  if (i < 0) return {};
  return Object.fromEntries(CORE_TESTS.map((t) => [t.id, t.thresholds[i]]));
}

/**
 * A start date placing you at the given week of a program.
 * Week 1 is today; week 9 is eight weeks ago.
 */
export function startDateForWeek(week, today = new Date()) {
  const weeks = Math.max(0, (Number.isFinite(week) ? Math.floor(week) : 1) - 1);
  return new Date(today.getTime() - weeks * 7 * 86400000).toISOString();
}

export default { resultsAtRank, startDateForWeek };
