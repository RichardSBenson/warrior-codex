// ─────────────────────────────────────────────────────────────
// USE CASE · THE SCHEDULE
// The program sets the day of your test. You are told; you do not choose.
// A fixed, visible finish line pulls a person toward it — without a single reminder.
// ─────────────────────────────────────────────────────────────
import { PROGRAM_WEEKS, SESSIONS_PER_WEEK } from "../domain/program.js";
import { RANKS } from "../domain/ranks.js";

const MS_DAY = 86400000;

export function testDateFor(rankName, startISO) {
  const weeks = PROGRAM_WEEKS[rankName];
  if (!weeks || !startISO) return null;

  const start = new Date(startISO);
  const date = new Date(start);
  date.setDate(date.getDate() + weeks * 7);

  const daysTotal = weeks * 7;
  const daysGone = Math.max(0, Math.floor((Date.now() - start) / MS_DAY));
  const daysLeft = Math.max(0, Math.ceil((date - Date.now()) / MS_DAY));

  const i = RANKS.indexOf(rankName);
  const testingFor = RANKS[Math.min(i + 1, RANKS.length - 1)];

  return {
    weeks,
    sessions: weeks * SESSIONS_PER_WEEK,
    date,
    daysLeft,
    daysTotal,
    testingFor,
    pct: Math.min(100, Math.round((daysGone / daysTotal) * 100)),
    arrived: daysLeft === 0,
  };
}

export function weeksTrained(startISO) {
  if (!startISO) return 0;
  return Math.floor((Date.now() - new Date(startISO).getTime()) / (7 * MS_DAY));
}

export const fmtDate = (d) =>
  d.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });

export const TEST_DATE_CREED = "The date does not move.";
