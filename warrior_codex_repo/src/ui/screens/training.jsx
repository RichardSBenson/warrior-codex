import { useState, useEffect, useRef } from "react";
import {
  BLACK, PANEL, GOLD, DARK_GOLD, LIGHT, GRAY, LINE,
  fmt, displayValue, btn, panel, overlay, label, serif,
} from "../theme.js";
import { CORE_TESTS, TIERS } from "../../domain/trials.js";
import { RANKS, RANK_COLORS, REVEAL_FLAVOR, rankForTest } from "../../domain/ranks.js";
import { pickVoice } from "../../domain/voice.js";
import { WARM_UP } from "../../domain/program.js";
import {
  standing, overallRank, completedTests, remainingTests,
  roomComplete, allComplete, bestTest, theWall,
} from "../../usecases/assessment.js";
import { testDateFor, fmtDate, weeksTrained } from "../../usecases/schedule.js";
import { daysSince, missedDayLine, RECORD_CREED } from "../../domain/record.js";

// ═══ UI · THE TRAINING FLOW ═══

export function GroundScreen({ onDone }) {
  const [ground, setGround] = useState("");
  const [hour, setHour] = useState("");
  const ready = ground.trim() && hour.trim();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column",
      justifyContent: "center", padding: "2rem 1.5rem" }}>
      <div style={{ textAlign: "center", marginBottom: "1.6rem" }}>
        <div style={{ fontSize: "1.9rem", marginBottom: 10 }}>⚔</div>
        <div style={{ color: GOLD, fontFamily: "'Cinzel',serif", fontSize: "1rem",
          letterSpacing: "0.2em" }}>CLAIM YOUR GROUND</div>
      </div>
      <p style={{ color: LIGHT, fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem",
        lineHeight: 1.65, textAlign: "center", marginBottom: "1.8rem" }}>
        Every warrior has a training ground and an hour they hold it.
        The akhara. The dojo. A garage, a yard, a strip of floor.
        <br /><br />
        <b style={{ color: GOLD }}>Name yours. You will be asked once.</b>
      </p>

      <div style={{ marginBottom: 14 }}>
        <div style={{ color: GRAY, fontSize: "0.62rem", letterSpacing: "0.2em",
          fontFamily: "'Cinzel',serif", marginBottom: 6 }}>YOUR GROUND</div>
        <input value={ground} onChange={e => setGround(e.target.value)}
          placeholder="the garage · the park · the spare room"
          style={inputStyle} />
      </div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: GRAY, fontSize: "0.62rem", letterSpacing: "0.2em",
          fontFamily: "'Cinzel',serif", marginBottom: 6 }}>YOUR HOUR</div>
        <input value={hour} onChange={e => setHour(e.target.value)}
          placeholder="06:00 · before work · after the school run"
          style={inputStyle} />
      </div>

      <button onClick={() => ready && onDone({ ground: ground.trim(), hour: hour.trim() })}
        disabled={!ready}
        style={{ width: "100%", padding: 16, background: ready ? GOLD : "transparent",
          color: ready ? BLACK : GRAY, border: `1px solid ${ready ? GOLD : LINE}`,
          fontSize: "0.75rem", letterSpacing: "0.2em", fontFamily: "'Cinzel',serif",
          fontWeight: "bold", cursor: ready ? "pointer" : "default", borderRadius: 4 }}>
        THIS IS MY GROUND
      </button>
      <p style={{ color: GRAY, fontSize: "0.66rem", textAlign: "center", marginTop: 14,
        lineHeight: 1.6, fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic" }}>
        Lay your kit out the night before. Remove everything that stands between waking and working.
        The Codex will not remind you — the ground will.
      </p>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "13px 14px", background: PANEL, border: `1px solid ${LINE}`,
  borderRadius: 6, color: LIGHT, fontSize: "0.95rem",
  fontFamily: "'Cormorant Garamond',serif", outline: "none", boxSizing: "border-box",
};

export function SessionScreen({ session, onBack, onComplete }) {
  // progress: for each movement, how many sets are checked off
  const [done, setDone] = useState(() => session.movements.map(() => 0));
  const [rest, setRest] = useState(null);       // rest countdown seconds remaining
  const [holdTimer, setHoldTimer] = useState(null); // {mi, elapsed, target} active hold
  const restRef = useRef(null);
  const holdRef = useRef(null);
  // commander voice — chosen once when the session mounts, spoken to the user's current rank
  const [preLine] = useState(() => pickVoice("preworkout", session.rank));
  const [midLine] = useState(() => pickVoice("midworkout", session.rank));
  const [winLine] = useState(() => pickVoice("victory", session.rank));

  useEffect(() => () => { clearInterval(restRef.current); clearInterval(holdRef.current); }, []);

  const totalSets = session.movements.reduce((s, m) => s + m.sets, 0);
  const doneSets = done.reduce((s, n) => s + n, 0);
  const allDone = doneSets >= totalSets;

  function startRest(seconds) {
    clearInterval(restRef.current);
    setRest(seconds);
    restRef.current = setInterval(() => {
      setRest(r => {
        if (r <= 1) { clearInterval(restRef.current); return null; }
        return r - 1;
      });
    }, 1000);
  }
  function completeSet(mi) {
    setDone(d => { const n = [...d]; if (n[mi] < session.movements[mi].sets) n[mi] += 1; return n; });
    const m = session.movements[mi];
    if (done[mi] + 1 < m.sets) startRest(m.rest); // rest only if more sets remain
  }
  function startHold(mi) {
    const m = session.movements[mi];
    clearInterval(holdRef.current);
    const started = Date.now();
    setHoldTimer({ mi, elapsed: 0, target: m.seconds });
    holdRef.current = setInterval(() => {
      setHoldTimer(h => h ? { ...h, elapsed: (Date.now() - started) / 1000 } : null);
    }, 100);
  }
  function stopHold() {
    clearInterval(holdRef.current);
    const mi = holdTimer.mi;
    setHoldTimer(null);
    completeSet(mi);
  }

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "6rem" }}>
      {/* header */}
      <div style={{ padding: "1.3rem 1.2rem 1rem", borderBottom: `1px solid ${LINE}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: GOLD,
            fontSize: "1.2rem", cursor: "pointer" }}>←</button>
          <div style={{ flex: 1 }}>
            <div style={{ color: GRAY, fontSize: "0.6rem", letterSpacing: "0.25em",
              fontFamily: "'Cinzel',serif" }}>
              {session.rank.toUpperCase()} · WEEK {session.week} · DAY {session.dayNumber}
            </div>
            <div style={{ color: GOLD, fontSize: "1.5rem", fontFamily: "'Cinzel',serif",
              letterSpacing: "0.08em" }}>{session.dayName}</div>
            <div style={{ color: LIGHT, fontSize: "0.8rem", fontStyle: "italic",
              fontFamily: "'Cormorant Garamond',serif" }}>{session.focus}</div>
          </div>
        </div>
        <div style={{ color: LIGHT, fontFamily: "'Cormorant Garamond',serif", fontSize: "0.95rem",
          marginTop: 10, lineHeight: 1.5, fontStyle: "italic" }}>
          "{preLine}"
        </div>
        <div style={{ color: GRAY, fontFamily: "'Cormorant Garamond',serif", fontSize: "0.82rem",
          marginTop: 6, lineHeight: 1.5 }}>
          Warm up first — 5 minutes Surya Namaskar. Then complete every set.
        </div>
        <div style={{ height: 5, background: LINE, borderRadius: 3, marginTop: 12, overflow: "hidden" }}>
          <div style={{ width: `${(doneSets / totalSets) * 100}%`, height: "100%", background: GOLD,
            transition: "width 0.4s ease" }} />
        </div>
        <div style={{ color: GRAY, fontSize: "0.66rem", marginTop: 5 }}>{doneSets} / {totalSets} sets complete</div>
      </div>

      {/* mid-workout commander line — appears once past halfway, before all done */}
      {doneSets >= Math.ceil(totalSets / 2) && !allDone && (
        <div style={{ margin: "0.8rem 1rem 0", padding: "10px 14px", background: PANEL,
          border: `1px solid ${DARK_GOLD}`, borderRadius: 8 }}>
          <div style={{ color: GOLD, fontFamily: "'Cormorant Garamond',serif", fontSize: "0.95rem",
            fontStyle: "italic", lineHeight: 1.4 }}>"{midLine}"</div>
        </div>
      )}

      {/* movement list */}
      <div style={{ padding: "0.8rem 1rem" }}>
        {session.movements.map((m, mi) => {
          const complete = done[mi] >= m.sets;
          const isHold = m.type === "hold" || m.type === "holdEach";
          return (
            <div key={mi} style={{ background: PANEL, border: `1px solid ${complete ? DARK_GOLD : LINE}`,
              borderRadius: 8, padding: "12px 14px", marginBottom: 10, opacity: complete ? 0.7 : 1 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <div style={{ flex: 1, color: LIGHT, fontFamily: "'Cormorant Garamond',serif",
                  fontSize: "1.05rem", fontWeight: 600 }}>
                  {m.name}{m.sub ? <span style={{ color: GRAY, fontStyle: "italic" }}> · {m.sub}</span> : null}
                </div>
                {complete && <div style={{ color: GOLD, fontSize: "1rem" }}>✓</div>}
              </div>
              <div style={{ color: GRAY, fontSize: "0.72rem", marginBottom: 10 }}>
                {m.sets} sets × {isHold ? `${m.seconds}s hold${m.type === "holdEach" ? " each side" : ""}` : m.reps}
                {" · "}{m.rest}s rest
              </div>
              {/* set pips */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                {Array.from({ length: m.sets }).map((_, si) => (
                  <div key={si} style={{ width: 26, height: 26, borderRadius: 6,
                    border: `1px solid ${si < done[mi] ? GOLD : LINE}`,
                    background: si < done[mi] ? GOLD : "transparent",
                    color: si < done[mi] ? BLACK : GRAY, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "0.7rem", fontFamily: "'Cinzel',serif" }}>
                    {si + 1}
                  </div>
                ))}
                {!complete && (
                  isHold ? (
                    <button onClick={() => startHold(mi)} style={sessionBtn}>
                      START HOLD
                    </button>
                  ) : (
                    <button onClick={() => completeSet(mi)} style={sessionBtn}>
                      SET DONE
                    </button>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* rest overlay */}
      {rest != null && (
        <div style={overlay}>
          <div style={{ color: GRAY, fontSize: "0.7rem", letterSpacing: "0.2em" }}>REST</div>
          <div style={{ color: GOLD, fontSize: "3.4rem", fontFamily: "'Cinzel',serif" }}>{fmt(rest)}</div>
          <button onClick={() => { clearInterval(restRef.current); setRest(null); }} style={sessionBtn}>SKIP</button>
        </div>
      )}

      {/* hold overlay */}
      {holdTimer && (
        <div style={overlay}>
          <div style={{ color: GRAY, fontSize: "0.7rem", letterSpacing: "0.2em" }}>
            {session.movements[holdTimer.mi].name.toUpperCase()} — HOLD
          </div>
          <div style={{ color: holdTimer.elapsed >= holdTimer.target ? "#4a9d5b" : GOLD,
            fontSize: "3.6rem", fontFamily: "'Cinzel',serif" }}>{fmt(holdTimer.elapsed)}</div>
          <div style={{ color: GRAY, fontSize: "0.8rem" }}>
            {holdTimer.elapsed >= holdTimer.target ? "TARGET MET — hold on" : `target ${holdTimer.target}s`}
          </div>
          <button onClick={stopHold} style={{ ...sessionBtn, marginTop: 16, borderColor: "#c0392b", color: "#e0a0a0" }}>
            STOP
          </button>
        </div>
      )}

      {/* complete bar */}
      {allDone && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, maxWidth: 430, margin: "0 auto",
          padding: "1rem 1.2rem", background: BLACK, borderTop: `1px solid ${DARK_GOLD}` }}>
          <div style={{ color: GOLD, fontFamily: "'Cormorant Garamond',serif", fontSize: "0.95rem",
            fontStyle: "italic", textAlign: "center", marginBottom: 10, lineHeight: 1.4 }}>"{winLine}"</div>
          <button onClick={onComplete} style={{ width: "100%", padding: 16, background: GOLD, color: BLACK,
            border: "none", fontSize: "0.78rem", letterSpacing: "0.2em", fontFamily: "'Cinzel',serif",
            fontWeight: "bold", cursor: "pointer", borderRadius: 4 }}>
            SESSION COMPLETE ✓
          </button>
        </div>
      )}
    </div>
  );
}

const sessionBtn = {
  padding: "7px 16px", background: "none", border: `1px solid ${GOLD}`, color: GOLD,
  fontSize: "0.64rem", letterSpacing: "0.15em", fontFamily: "'Cinzel',serif",
  cursor: "pointer", borderRadius: 5,
};
