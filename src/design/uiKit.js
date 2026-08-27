import { colours } from './tokens.js';

/* Colour constants are re-exported from tokens.js so the design system has a
   single source of truth. Screens keep importing them from here unchanged. */

// ─────────────────────────────────────────────────────────────
// UI · THEME
// Framework layer. The domain knows nothing of any of this.
// ─────────────────────────────────────────────────────────────
export const { BLACK, PANEL, GOLD, DARK_GOLD, LIGHT, GRAY, LINE } = colours;

/** seconds -> m:ss */
export function fmt(sec) {
  const n = typeof sec === "number" ? sec : Number(sec);
  const s = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}:${String(r).padStart(2, "0")}` : `${r}s`;
}

/**
 * A trial result, in the units a human reads.
 *
 * Deliberately forgiving. A stored value that is not a number must never be
 * the thing that takes a screen down — it renders as an em dash and the rest
 * of the page survives.
 */
export function displayValue(trial, value) {
  if (value === undefined || value === null || value === "") return "—";
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "—";
  if (!trial || !trial.type) return String(value);
  if (trial.type === "secs") return fmt(n);
  if (trial.type === "dist") return `${n.toFixed(2)}m`;
  return `${n} ${trial.unit || ""}`.trim();
}

export const btn = {
  gold: {
    background: GOLD, color: BLACK, border: "none", padding: "16px",
    fontSize: "0.78rem", letterSpacing: "0.2em", fontFamily: "'Cinzel',serif",
    fontWeight: "bold", cursor: "pointer", borderRadius: 4, width: "100%",
  },
  ghost: {
    background: "none", border: `1px solid ${GOLD}`, color: GOLD,
    padding: "7px 16px", fontSize: "0.64rem", letterSpacing: "0.15em",
    fontFamily: "'Cinzel',serif", cursor: "pointer", borderRadius: 5,
  },
  quiet: {
    background: "none", border: "none", color: GRAY, padding: "12px",
    fontSize: "0.66rem", letterSpacing: "0.25em",
    fontFamily: "'Cinzel',serif", cursor: "pointer", width: "100%",
  },
};

export const panel = {
  background: PANEL, border: `1px solid ${LINE}`, borderRadius: 8, padding: "12px 14px",
};

export const overlay = {
  position: "fixed", inset: 0, maxWidth: 430, margin: "0 auto",
  background: "rgba(10,10,10,0.97)", display: "flex", flexDirection: "column",
  alignItems: "center", justifyContent: "center", gap: 10, zIndex: 50,
};

export const label = {
  color: GRAY, fontSize: "0.6rem", letterSpacing: "0.22em", fontFamily: "'Cinzel',serif",
};

export const serif = { fontFamily: "'Cormorant Garamond',serif" };
