// ─────────────────────────────────────────────────────────────
// DOMAIN · STANDING ORDERS
//
// A warrior does not train for one hour and sit for eight.
// Pehlwans trained morning and evening. Monks held stances between duties.
// The unbroken hour-long session is a modern gym convention, not a warrior one.
//
// THE ORDERS ATTACK THE WALL.
// The Wall names the trial holding you back. The orders hit it all day, in small doses.
// Frequent submaximal practice on a weak movement is the most reliable way to raise it,
// and it costs almost nothing in recovery.
//
// THE LAW OF THE ORDERS:
//   The session is what the Codex demands of you.
//   The orders are what you demand of yourself.
//
// They must be EASY. Never to failure. Never heavy. They groove the pattern;
// the session builds the adaptation. If an order feels like a workout, it is too big.
// ─────────────────────────────────────────────────────────────

let seq = 0;
const uid = () => `o${Date.now().toString(36)}${(seq++).toString(36)}`;

export const makeOrder = ({ movement, amount, time, targets }) => ({
  id: uid(), movement, amount, time, targets: targets || null,
});

const HOURS = ["11:00", "13:00", "16:00", "18:00"];

// Trials that cannot be dosed through the day — they are session work, whole or not at all.
const NOT_DOSABLE = new Set(["run", "broadjump", "bearcrawl"]);

/**
 * A daily dose for one trial: deliberately small — roughly a quarter of what you can already do.
 * Never to failure. This is practice, not training.
 */
const reps = (n) => `${n} ${n === 1 ? "rep" : "reps"}`;
const secs = (s) => (s >= 60 ? `${(s / 60).toFixed(s % 60 ? 1 : 0)} min` : `${s} sec`);

function doseFor(trial, current) {
  const v = current ?? 0;

  if (trial.id === "fingertip") {
    // Tendons. Go carefully and stay well clear of failure.
    if (v === 0) return "10 sec fingertip plank";
    return reps(Math.max(2, Math.round(v * 0.2)));
  }

  if (trial.id === "pullups") {
    // The classic weak lift. Small, frequent, never to failure — this is how it moves.
    if (v === 0) return "2 slow negatives";
    if (v <= 3) return `2 × ${reps(1)}`;
    return reps(Math.max(2, Math.round(v * 0.4)));
  }

  if (trial.type === "reps") {
    return reps(Math.max(5, Math.round(v * 0.25)));
  }

  if (trial.type === "secs") {
    return secs(Math.max(20, Math.round(v * 0.35)));
  }

  return "a short set";
}

/**
 * Standing orders, aimed at the Wall.
 * Up to four dosable trials that are holding you back, one per hour of the day.
 */
export function ordersForWall(wall, results) {
  if (!wall || wall.atMax || !wall.blocking?.length) return null;

  const targets = wall.blocking
    .filter(b => !NOT_DOSABLE.has(b.test.id))
    .slice(0, 4);

  if (!targets.length) return null;

  // A narrow wall means ONE enemy — so strike it repeatedly through the day,
  // rather than issuing a single lonely order. This is the whole point of the method.
  if (targets.length === 1) {
    const b = targets[0];
    const amount = doseFor(b.test, results[b.test.id]);
    return HOURS.slice(0, 3).map(time =>
      makeOrder({ movement: b.test.name, amount, time, targets: b.test.id })
    );
  }

  return targets.map((b, i) =>
    makeOrder({
      movement: b.test.name,
      amount: doseFor(b.test, results[b.test.id]),
      time: HOURS[i] || HOURS[HOURS.length - 1],
      targets: b.test.id,
    })
  );
}

/** If there is no wall to attack (or nothing measured yet), fall back to a modest daily dose. */
const FALLBACK = [
  { movement: "Hindu Push-Ups", amount: "10 reps", time: "11:00" },
  { movement: "Hindu Squats",   amount: "20 reps", time: "13:00" },
  { movement: "Plank Hold",     amount: "30 sec",  time: "16:00" },
];

export function defaultOrders(wall, results) {
  return ordersForWall(wall, results) || FALLBACK.map(makeOrder);
}

// ── holding the orders ──
// A day's orders die with the day. Nothing carries over. No streak. No debt.
export const isoDay = (d) => d.toISOString().slice(0, 10);

export function ordersHeldToday(held, today = new Date()) {
  if (!held || held.date !== isoDay(today)) return { date: isoDay(today), ids: [] };
  return held;
}

export function toggleOrder(held, id, today = new Date()) {
  const cur = ordersHeldToday(held, today);
  const ids = cur.ids.includes(id)
    ? cur.ids.filter(x => x !== id)
    : [...cur.ids, id];
  return { date: cur.date, ids };
}

export const ORDERS_CREED =
  "The session is what the Codex demands of you. These are what you demand of yourself. " +
  "Keep them light — they groove the pattern; the session builds the strength.";

export const ORDERS_WALL_NOTE =
  "These orders attack your wall. Small doses, often, on the trials holding you back.";
