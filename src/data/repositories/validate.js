// ─────────────────────────────────────────────────────────────
// DATA · STORED VALUE VALIDATION
//
// Everything in localStorage is untrusted input. It survives across sessions,
// it is editable by anyone with the device or a console, and it is shared by
// every script on the origin. A corrupted value must never reach the domain.
//
// The rule here is narrow: read what we recognise, discard the rest. No
// throwing, no repairing, no guessing — an unreadable value becomes the
// fallback, and the app carries on.
// ─────────────────────────────────────────────────────────────
import { CORE_TESTS } from "../../domain/entities/Trial.js";
import { RANKS } from "../../domain/entities/Rank.js";

const TRIAL_IDS = new Set(CORE_TESTS.map((t) => t.id));

/** Own enumerable string keys only — never inherited, never __proto__. */
function ownEntries(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.entries(Object.fromEntries(Object.entries(value)))
    .filter(([k]) => k !== "__proto__" && k !== "constructor" && k !== "prototype");
}

const isFiniteNumber = (n) => typeof n === "number" && Number.isFinite(n);

/**
 * Assessment results: a known trial id mapped to a finite, non-negative score.
 * An unknown id, a string, a NaN or a negative is dropped rather than scored.
 */
export function validateResults(raw) {
  const out = {};
  for (const [id, value] of ownEntries(raw)) {
    if (!TRIAL_IDS.has(id)) continue;
    if (!isFiniteNumber(value) || value < 0) continue;
    out[id] = value;
  }
  return out;
}

/**
 * The start date. Must be a real date and must not be in the future — a future
 * start would place the warrior at a negative week.
 */
export function validateStart(raw) {
  if (typeof raw !== "string") return null;
  const t = Date.parse(raw);
  if (Number.isNaN(t) || t > Date.now()) return null;
  return new Date(t).toISOString();
}

/** The record counts only ever go up, and only ever by whole numbers. */
export function validateRecord(raw, empty) {
  if (raw === null || typeof raw !== "object") return empty;
  const clamp = (n) => (isFiniteNumber(n) && n >= 0 ? Math.floor(n) : 0);
  return {
    ...empty,
    sessions: clamp(raw.sessions),
    orders: clamp(raw.orders),
    tests: clamp(raw.tests),
    lastSession: validateStart(raw.lastSession),
  };
}

/**
 * The Proving Ground override. A rank that exists, a week and day inside real
 * bounds. This one matters most: it is the only stored value that changes what
 * the app shows rather than what it remembers.
 */
export function validateDev(raw) {
  if (raw === null || typeof raw !== "object" || raw.enabled !== true) return null;
  const o = raw.override;
  if (o === null || typeof o !== "object") return { enabled: true, override: null };

  const rank = RANKS.includes(o.rank) ? o.rank : null;
  const inRange = (n, max) => isFiniteNumber(n) && Number.isInteger(n) && n >= 1 && n <= max;
  if (!rank || !inRange(o.week, 52) || !inRange(o.day, 7)) return { enabled: true, override: null };

  return { enabled: true, override: { rank, week: o.week, day: o.day } };
}

/** Standing orders held today: a day key and a list of known-shaped ids. */
export function validateHeld(raw) {
  if (raw === null || typeof raw !== "object") return null;
  if (typeof raw.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(raw.date)) return null;
  const ids = Array.isArray(raw.ids)
    ? raw.ids.filter((id) => typeof id === "string" && /^[a-z0-9_-]{1,40}$/i.test(id))
    : [];
  return { date: raw.date, ids };
}

export default { validateResults, validateStart, validateRecord, validateDev, validateHeld };
