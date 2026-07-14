// ─────────────────────────────────────────────────────────────
// ADAPTER · STORAGE
//
// The ONLY file in the Codex that knows persistence exists.
// Nothing in domain/ or usecases/ may import from here — the dependency points inward.
//
// TO MOVE TO FIREBASE: rewrite the bodies of these functions. Nothing else changes.
// The rest of the app has no idea where its data lives, and that is the point.
// ─────────────────────────────────────────────────────────────
import { emptyRecord } from "../domain/record.js";

const KEYS = {
  results: "codex_assessment_v1",
  start:   "codex_start_v1",
  record:  "codex_record_v1",
  ground:  "codex_ground_v1",
  orders:  "codex_orders_v1",
  held:    "codex_held_v1",
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false; // private browsing, quota, etc. The app must survive this.
  }
}

export const storage = {
  loadResults: () => read(KEYS.results, {}),
  saveResults: (r) => write(KEYS.results, r),

  loadStart:   () => read(KEYS.start, null),
  saveStart:   (iso) => write(KEYS.start, iso),

  loadRecord:  () => read(KEYS.record, emptyRecord()),
  saveRecord:  (rec) => write(KEYS.record, rec),

  loadGround:  () => read(KEYS.ground, null),
  saveGround:  (g) => write(KEYS.ground, g),

  loadOrders:  () => read(KEYS.orders, null),
  saveOrders:  (o) => write(KEYS.orders, o),

  loadHeld:    () => read(KEYS.held, null),
  saveHeld:    (h) => write(KEYS.held, h),

  clearAll: () => {
    try {
      Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    } catch { /* nothing to do */ }
  },
};
