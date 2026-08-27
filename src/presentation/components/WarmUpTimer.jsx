import { useState, useEffect, useRef } from "react";
import { normaliseWarmUp, stepAt, poseAt } from "../../domain/entities/WarmUp.js";
import { sequenceFor } from "../../data/repositories/LocalProgramRepository.js";
import { fmt, GOLD, DARK_GOLD, LIGHT, GRAY, LINE, BLACK } from "../../design/uiKit.js";

/**
 * THE WARM-UP
 *
 * Counts each step down and moves to the next on its own, so nobody has to
 * look at the screen mid-flow. Wall-clock based rather than tick-counted —
 * a phone that locks or a tab that backgrounds does not lose the time.
 *
 * It can be skipped. Every program document calls the warm-up non-negotiable,
 * but a warrior who warmed up in the garden should not be made to sit here.
 */
const BREATH = {
  in:     { label: "BREATHE IN",  colour: "#8FB98F" },
  out:    { label: "BREATHE OUT", colour: "#B98F8F" },
  settle: { label: "SETTLE",      colour: "#7a7568" },
};

export function WarmUpTimer({ warmUp, onDone }) {
  const { steps, note, totalSeconds } = normaliseWarmUp(warmUp);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const startedAt = useRef(null);
  const banked = useRef(0);
  const tick = useRef(null);

  useEffect(() => () => clearInterval(tick.current), []);

  useEffect(() => {
    if (!running) return undefined;
    const run = () => {
      const live = startedAt.current === null ? 0 : (Date.now() - startedAt.current) / 1000;
      setElapsed(banked.current + live);
    };
    run();
    tick.current = setInterval(run, 250);
    return () => clearInterval(tick.current);
  }, [running]);

  if (!steps.length) return null;

  const secs = Math.floor(elapsed);
  const at = stepAt(steps, secs);
  const finished = at.complete || secs >= totalSeconds;

  const sequence = steps[at.index] && steps[at.index].sequence
    ? sequenceFor(steps[at.index].sequence) : null;
  const pose = sequence && running !== null && !finished
    ? poseAt(sequence.poses, at.into, sequence.secondsPerPose) : null;

  const start = () => { startedAt.current = Date.now(); setRunning(true); };
  const pause = () => {
    banked.current += startedAt.current ? (Date.now() - startedAt.current) / 1000 : 0;
    startedAt.current = null;
    setRunning(false);
  };

  const btn = {
    minHeight: 44, padding: "10px 18px", background: "transparent", color: LIGHT,
    border: `1px solid ${LINE}`, fontFamily: "'Cinzel',serif",
    fontSize: "0.7rem", letterSpacing: "0.14em", cursor: "pointer",
  };

  return (
    <div style={{ border: `1px solid ${LINE}`, background: BLACK, padding: "1.1rem 1.2rem", margin: "0 1.2rem 1rem" }}>
      <div style={{ color: DARK_GOLD, fontSize: "0.6rem", letterSpacing: "0.28em",
        fontFamily: "'Cinzel',serif", marginBottom: 10 }}>
        WARM-UP · {fmt(totalSeconds)}
      </div>

      {finished ? (
        <>
          <div style={{ color: GOLD, fontFamily: "'Cinzel',serif", fontSize: "1.1rem",
            letterSpacing: "0.08em", marginBottom: 10 }}>
            WARM. BEGIN THE SESSION.
          </div>
          <button style={{ ...btn, borderColor: GOLD, color: GOLD, width: "100%" }} onClick={onDone}>
            CONTINUE
          </button>
        </>
      ) : (
        <>
          <div style={{ color: LIGHT, fontFamily: "'Cinzel',serif", fontSize: "1.05rem",
            letterSpacing: "0.06em" }}>
            {steps[at.index].name}
          </div>

          {pose ? (
            <>
              <div style={{ color: GRAY, fontSize: "0.6rem", letterSpacing: "0.22em",
                fontFamily: "'Cinzel',serif", marginTop: 8 }}>
                POSE {pose.pose.n} OF 12 · ROUND {pose.round} · {pose.leadLeg.toUpperCase()} LEG LEADS
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 4 }}>
                <div style={{ color: GOLD, fontFamily: "'Cinzel',serif", fontSize: "1.3rem",
                  letterSpacing: "0.05em" }}>{pose.pose.sanskrit}</div>
                <div style={{ color: GRAY, fontFamily: "'Cormorant Garamond',serif",
                  fontSize: "0.9rem", fontStyle: "italic" }}>{pose.pose.english}</div>
              </div>
              <div style={{ color: BREATH[pose.pose.breath].colour, fontFamily: "'Cinzel',serif",
                fontSize: "0.7rem", letterSpacing: "0.2em", marginTop: 6 }}>
                {BREATH[pose.pose.breath].label}
              </div>
              <div style={{ color: LIGHT, fontFamily: "'Cormorant Garamond',serif",
                fontSize: "0.92rem", marginTop: 6, lineHeight: 1.45, minHeight: "2.6em" }}>
                {pose.pose.leads
                  ? pose.pose.cue.replace(/lead (leg|foot)/, `${pose.leadLeg} $1`)
                  : pose.pose.cue}
              </div>
              <div style={{ display: "flex", gap: 3, margin: "10px 0 6px" }}>
                {sequence.poses.map((p, i) => (
                  <div key={i} style={{ flex: 1, height: 4,
                    background: i < pose.index ? DARK_GOLD : i === pose.index ? GOLD : LINE }} />
                ))}
              </div>
              <div style={{ color: GRAY, fontSize: "0.66rem", letterSpacing: "0.1em" }}>
                {fmt(at.left)} left in the warm-up
              </div>
            </>
          ) : (
            <>
              {steps[at.index].cue && (
                <div style={{ color: GRAY, fontFamily: "'Cormorant Garamond',serif",
                  fontSize: "0.85rem", marginTop: 3, lineHeight: 1.45 }}>
                  {steps[at.index].cue}
                </div>
              )}
              <div style={{ color: GOLD, fontFamily: "'Cinzel',serif", fontSize: "3.4rem",
                lineHeight: 1.1, margin: "8px 0 4px", fontVariantNumeric: "tabular-nums" }}>
                {fmt(at.left)}
              </div>
            </>
          )}

          <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ flex: s.seconds || 1, height: 4, background: LINE, overflow: "hidden" }}>
                <div style={{ height: "100%", background: GOLD,
                  width: i < at.index ? "100%" : i === at.index ? `${(at.into / s.seconds) * 100}%` : "0%",
                  transition: "width 0.3s linear" }} />
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ ...btn, flex: 1, borderColor: GOLD, color: GOLD }}
              onClick={running ? pause : start}>
              {running ? "PAUSE" : secs > 0 ? "RESUME" : "BEGIN"}
            </button>
            <button style={{ ...btn, color: GRAY }} onClick={onDone}>SKIP</button>
          </div>
        </>
      )}

      {note && (
        <div style={{ color: GRAY, fontFamily: "'Cormorant Garamond',serif", fontSize: "0.8rem",
          marginTop: 12, lineHeight: 1.45, fontStyle: "italic" }}>
          {note}
        </div>
      )}
    </div>
  );
}

export default WarmUpTimer;
