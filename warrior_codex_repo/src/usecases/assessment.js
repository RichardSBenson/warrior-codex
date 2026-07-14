// ─────────────────────────────────────────────────────────────
// USE CASE · ASSESSMENT
// Given a set of trial results, what is this person's standing?
// Depends only on the domain. Knows nothing of React or storage.
// ─────────────────────────────────────────────────────────────
import { CORE_TESTS, ROOM_IDS } from "../domain/trials.js";
import { RANKS, rankForTest, isMaxRank } from "../domain/ranks.js";

export const completedTests = (results) =>
  CORE_TESTS.filter(t => results[t.id] !== undefined);

export const remainingTests = (results) =>
  CORE_TESTS.filter(t => results[t.id] === undefined);

export const roomComplete = (results) =>
  ROOM_IDS.every(id => results[id] !== undefined);

export const allComplete = (results) =>
  CORE_TESTS.every(t => results[t.id] !== undefined);

/**
 * Your rank is your weakest link — but only across trials you have actually attempted.
 * An unattempted trial does not drag you to Recruit; it simply is not counted yet.
 */
export function overallRank(results) {
  const done = completedTests(results);
  if (!done.length) return 0;
  return done.reduce((min, t) => Math.min(min, rankForTest(t, results[t.id])), 5);
}

/** The trial you scored highest on — used to tell the truth kindly. */
export function bestTest(results) {
  const done = completedTests(results);
  if (!done.length) return null;
  return done.reduce((best, t) =>
    rankForTest(t, results[t.id]) > rankForTest(best, results[best.id]) ? t : best, done[0]);
}

/**
 * THE WALL — the trials holding you back from the next rank.
 * One enemy, named. This is the most important information in the Codex.
 *
 * A trial is "the wall" only if it does NOT yet meet the next rank's standard.
 * Trials already at or above the next rank are not blocking you — they are carrying you.
 */
export function theWall(results) {
  const overall = overallRank(results);
  if (isMaxRank(overall)) return { atMax: true, blocking: [], next: null };

  const nextIdx = overall + 1;
  const next = RANKS[nextIdx];

  const blocking = completedTests(results)
    .filter(t => rankForTest(t, results[t.id]) < nextIdx)
    .map(t => ({
      test: t,
      current: results[t.id],
      needed: t.thresholds[nextIdx],
    }));

  return { atMax: false, blocking, next };
}

export function standing(results) {
  const overall = overallRank(results);
  return {
    rankIndex: overall,
    rankName: RANKS[overall],
    provisional: !allComplete(results),
    completed: completedTests(results).length,
    remaining: remainingTests(results),
    best: bestTest(results),
    wall: theWall(results),
  };
}
