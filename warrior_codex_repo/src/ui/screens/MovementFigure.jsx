import { useEffect, useRef, useState } from "react";
import { GOLD, GRAY, LIGHT, LINE } from "../theme.js";
import {
  poseAt, tracePath, withDerived, SIDE_BONES, FRONT_BONES,
} from "../../domain/animation.js";
import { getMovement } from "../../domain/movements.js";

// ─────────────────────────────────────────────────────────────
// UI · THE MOVEMENT FIGURE
//
// Renders any movement from the registry. Pure presentation — all the truth
// about the movement lives in domain/movements.js, where a coach can correct it.
//
// The figure is incised in gold on stone, and THE TRACE shows the arc the body
// carves through space. That is the thing video cannot show: the Dand is an arc,
// not a straight press.
// ─────────────────────────────────────────────────────────────
export default function MovementFigure({
  movementId,
  size = 200,
  showTrace = true,
  showPhase = false,
  speed = 1,
  playing = true,
}) {
  const mv = getMovement(movementId);
  const [pose, setPose] = useState(null);
  const [phase, setPhase] = useState("");
  const raf = useRef(null);
  const t0 = useRef(performance.now());

  useEffect(() => {
    if (!mv) return;
    t0.current = performance.now();

    // Respect the person's wishes. Reduced motion means a still pose, not a spinning figure.
    const still = typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (still || !playing) {
      const { pose: p, phase: ph } = poseAt(mv, 0);
      setPose(withDerived(p));
      setPhase(ph || "");
      return;
    }

    const tick = (now) => {
      const { pose: p, phase: ph } = poseAt(mv, (now - t0.current) * speed);
      setPose(withDerived(p));
      setPhase(ph || "");
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [movementId, speed, playing, mv]);

  if (!mv || !pose) return null;

  const bones = mv.view === "front" ? FRONT_BONES : SIDE_BONES;
  const path = (joints) => {
    const pts = joints.map(j => pose[j]).filter(Boolean);
    if (pts.length < 2) return "";
    return "M" + pts.map(p => `${p[0]} ${p[1]}`).join(" L ");
  };

  const trace = showTrace && mv.trace ? tracePath(mv) : [];
  const traceD = trace.length
    ? "M" + trace.map(p => `${p[0]} ${p[1]}`).join(" L ") + " Z"
    : "";

  return (
    <div style={{ width: size, maxWidth: "100%" }}>
      <div style={{
        position: "relative", width: "100%", aspectRatio: "1/1",
        background: "radial-gradient(ellipse at 50% 35%, #1a1815 0%, #131211 55%, #0c0b0a 100%)",
        border: `1px solid ${LINE}`, borderRadius: 3, overflow: "hidden",
      }}>
        <svg viewBox="0 0 100 100" style={{ display: "block", width: "100%", height: "100%" }}
          role="img" aria-label={`${mv.name} — animated demonstration`}>
          {/* the ground */}
          <line x1="6" y1="92" x2="94" y2="92"
            stroke="rgba(201,162,39,.18)" strokeWidth="0.4" />

          {/* THE TRACE — the arc the body carves */}
          {traceD && (
            <path d={traceD} fill="none" stroke={GOLD} strokeWidth="0.9"
              opacity="0.3" strokeLinecap="round" />
          )}

          {/* the figure */}
          <g style={{ filter: "drop-shadow(0 0 3px rgba(201,162,39,.45))" }}>
            {bones.map((b, i) => (
              <path key={i} d={path(b)} fill="none" stroke={GOLD}
                strokeWidth="2.1" strokeLinecap="round" />
            ))}
            {pose.head && (
              <circle cx={pose.head[0]} cy={pose.head[1]} r="4.6"
                fill="none" stroke={GOLD} strokeWidth="2.1" />
            )}
          </g>
        </svg>
      </div>

      {showPhase && phase && (
        <div style={{
          color: GOLD, fontSize: "0.62rem", letterSpacing: "0.2em",
          fontFamily: "'Cinzel',serif", textAlign: "center",
          marginTop: 8, minHeight: "1.1em",
        }}>
          {phase}
        </div>
      )}
    </div>
  );
}

/** The full teaching card: figure, lineage, and the cues that keep form honest. */
export function MovementCard({ movementId }) {
  const mv = getMovement(movementId);
  if (!mv) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <MovementFigure movementId={movementId} size={240} showPhase />

      <div style={{ textAlign: "center" }}>
        <div style={{ color: LIGHT, fontFamily: "'Cinzel',serif", fontSize: "1.05rem",
          letterSpacing: "0.1em" }}>{mv.name}</div>
        {mv.original && (
          <div style={{ color: GOLD, fontFamily: "'Cinzel',serif", fontSize: "0.68rem",
            letterSpacing: "0.18em", marginTop: 3 }}>
            {mv.original.toUpperCase()} · {mv.culture.toUpperCase()}
          </div>
        )}
      </div>

      <p style={{ color: GRAY, fontFamily: "'Cormorant Garamond',serif", fontSize: "0.92rem",
        fontStyle: "italic", textAlign: "center", lineHeight: 1.55, maxWidth: 300 }}>
        {mv.history}
      </p>

      <div style={{ width: "100%", maxWidth: 320 }}>
        {mv.cues.map((c, i) => (
          <div key={i} style={{ display: "flex", gap: 9, padding: "5px 0",
            borderTop: i ? `1px solid ${LINE}` : "none" }}>
            <div style={{ color: GOLD, fontFamily: "'Cinzel',serif", fontSize: "0.68rem",
              minWidth: 14 }}>{i + 1}</div>
            <div style={{ color: LIGHT, fontFamily: "'Cormorant Garamond',serif",
              fontSize: "0.92rem", lineHeight: 1.45 }}>{c}</div>
          </div>
        ))}
      </div>

      {mv.warning && (
        <div style={{ padding: "10px 12px", background: "#141414",
          border: "1px solid #7a3b3b", borderRadius: 8, maxWidth: 320 }}>
          <div style={{ color: "#e0a0a0", fontSize: "0.6rem", letterSpacing: "0.15em",
            fontFamily: "'Cinzel',serif", marginBottom: 4 }}>BUILD TO THIS</div>
          <div style={{ color: LIGHT, fontFamily: "'Cormorant Garamond',serif",
            fontSize: "0.86rem", lineHeight: 1.5 }}>
            This movement loads the tendons hard. Progress over weeks, not days.
            Stop at any joint pain.
          </div>
        </div>
      )}

      {/* When dojo footage exists it drops in here — but the app never depends on it. */}
      {mv.video && (
        <button style={{ background: "none", border: `1px solid ${GOLD}`, color: GOLD,
          padding: "8px 18px", fontSize: "0.62rem", letterSpacing: "0.16em",
          fontFamily: "'Cinzel',serif", borderRadius: 4, cursor: "pointer" }}>
          WATCH THE REAL THING
        </button>
      )}
    </div>
  );
}
