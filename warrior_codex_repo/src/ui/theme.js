// ─────────────────────────────────────────────────────────────
// UI · THEME
// Framework layer. The domain knows nothing of any of this.
// ─────────────────────────────────────────────────────────────
export const BLACK     = "#0a0a0a";
export const PANEL     = "#141414";
export const GOLD      = "#c9a227";
export const DARK_GOLD = "#7a6218";
export const LIGHT     = "#e8e3d8";
export const GRAY      = "#7a7568";
export const LINE      = "#2a2a2a";

/** seconds -> m:ss */
export function fmt(sec) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}:${String(r).padStart(2, "0")}` : `${r}s`;
}

/** a trial result, in the units a human reads */
export function displayValue(trial, value) {
  if (value === undefined || value === null) return "—";
  if (trial.type === "secs") return fmt(value);
  if (trial.type === "dist") return `${value.toFixed(2)}m`;
  return `${value} ${trial.unit}`;
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
