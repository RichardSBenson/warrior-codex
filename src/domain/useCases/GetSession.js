// ─────────────────────────────────────────────────────────────
// USE CASE · THE SESSION
// Given a program and where you are in it, what do you train today?
// Pure. The program is passed in; nothing is fetched, nothing is stored.
// ─────────────────────────────────────────────────────────────

const MS_DAY = 86400000;

/** Which week of the program a start date puts you in. Week 1 is day one. */
export function weekNumber(startISO, today = new Date()) {
  if (!startISO) return 1;
  const days = Math.floor((today - new Date(startISO)) / MS_DAY);
  return Math.max(1, Math.floor(days / 7) + 1);
}

/** Day 1 is Monday, day 6 Saturday, day 7 rest. */
export function dayNumber(today = new Date()) {
  const js = today.getDay();          // 0 Sunday … 6 Saturday
  return js === 0 ? 7 : js;
}

export function blockForWeek(program, week) {
  if (!program) return null;
  return program.blocks.find((b) => b.weeks.includes(week)) || null;
}

/**
 * Taper weeks carry no sessions of their own. They borrow the block they
 * follow and cut a set from every movement — never below one. This is the
 * program protecting the athlete from their own enthusiasm.
 */
export function taperSession(session, delta = 1) {
  return {
    ...session,
    tapered: true,
    movements: session.movements.map((m) => ({ ...m, sets: Math.max(1, m.sets - delta) })),
  };
}

export function getSession(program, week, day) {
  const block = blockForWeek(program, week);
  if (!block) return null;

  const dress = (base, extra) => ({
    ...base, week, phase: block.phase, label: block.label,
    note: block.note || base.note, warmUp: program.warmUp, coolDown: program.coolDown, ...extra,
  });

  // A taper week borrows the block it follows and cuts sets from every movement.
  if (block.taperFrom) {
    // Resolve through getSession so a taper can follow a block that is itself
    // a reuse of an earlier one. Chains resolve; they do not return null.
    const base = getSession(program, block.taperFrom[0], day);
    if (!base) return null;
    return taperSession(dress(base), block.setsDelta || 1);
  }

  // Some blocks the documents describe only as "same structure" as an earlier
  // one, with the emphasis shifted. They reuse those sessions rather than
  // inventing prescriptions that were never written down.
  if (block.sameAs) {
    const source = blockForWeek(program, block.sameAs[0]);
    const base = source && (source.days || []).find((d) => d.dayNumber === day);
    if (!base) return null;
    return dress(base, { tapered: false, reused: true });
  }

  let found = (block.days || []).find((d) => d.dayNumber === day);

  // A block may author only some days and fall back for the rest.
  if (!found && block.fillFrom && (block.fillFromDays || []).includes(day)) {
    const source = blockForWeek(program, block.fillFrom[0]);
    const base = source && (source.days || []).find((d) => d.dayNumber === day);
    if (base) return dress(base, { tapered: false, reused: true });
  }
  if (!found) return null;

  return dress(found, { note: found.note || block.note, tapered: false, reused: false });
}

/** Everything the training screen needs for today, or a rest day. */
export function todaysSession(program, startISO, today = new Date()) {
  const week = weekNumber(startISO, today);
  const day = dayNumber(today);
  if (day === 7) return { rest: true, week, dayNumber: 7, dayName: 'REST' };
  const session = getSession(program, week, day);
  return session ? { rest: false, ...session } : { rest: true, week, dayNumber: day, dayName: 'REST' };
}

/** Total prescribed sets — used for the progress bar. */
export const totalSets = (session) =>
  !session || !session.movements ? 0 : session.movements.reduce((n, m) => n + m.sets, 0);

export default { weekNumber, dayNumber, blockForWeek, getSession, todaysSession, totalSets, taperSession };
