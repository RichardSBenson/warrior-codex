// ─────────────────────────────────────────────────────────────
// DOMAIN · THE RECORD
//
// A tally, not a streak. It counts up. It never counts down.
// A missed day does not subtract a mark — it simply adds none.
//
// Lally (2010): "Missing one opportunity to perform the behaviour did not materially
// affect the habit formation process." One day is noise. What kills habits is the guilt
// that follows the miss. So the Codex records, and says nothing that shames.
// ─────────────────────────────────────────────────────────────

export const emptyRecord = () => ({ sessions: 0, orders: 0, tests: 0, lastSession: null });

export const addSession = (rec) => ({
  ...rec,
  sessions: rec.sessions + 1,
  lastSession: new Date().toISOString(),
});

export const addOrderHeld = (rec) => ({
  ...rec,
  orders: rec.orders + 1,
  lastSession: new Date().toISOString(),
});

export const addTestPassed = (rec) => ({ ...rec, tests: rec.tests + 1 });

export function daysSince(iso) {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

/** The missed-day doctrine. Escalates in warmth, never in guilt. Never creates a debt. */
export function missedDayLine(gap) {
  if (gap === null || gap < 2) return null;
  if (gap < 4) return "A missed day is nothing. Take the next session as if nothing happened.";
  if (gap < 8) return "The ground has been quiet. Step back onto it today. Do not double the work to atone.";
  return "You have been away. The rank does not resent you — begin again where you stand.";
}

export const RECORD_CREED = "Every mark was earned. None can be taken back.";
