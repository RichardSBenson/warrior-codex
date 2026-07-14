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
import MovementFigure from "./MovementFigure.jsx";
import { TRIAL_MOVEMENT, getMovement } from "../../domain/movements.js";

// ═══ UI · THE ASSESSMENT FLOW ═══

export function SplashScreen({ onStart }) {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 60); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "2rem",
      opacity: show ? 1 : 0, transition: "opacity 0.8s ease",
    }}>
      <div style={{ fontSize: "3.4rem", marginBottom: "1.1rem",
        filter: "drop-shadow(0 0 22px rgba(201,162,39,0.4))" }}>⚔</div>
      <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.9rem", color: GOLD,
        letterSpacing: "0.24em", textAlign: "center", marginBottom: "0.4rem",
        textShadow: "0 0 34px rgba(201,162,39,0.25)" }}>THE CODEX</h1>
      <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", color: DARK_GOLD,
        letterSpacing: "0.42em", marginBottom: "2.2rem" }}>KNOW YOUR RANK</div>
      <div style={{ width: 60, height: 1,
        background: `linear-gradient(90deg,transparent,${GOLD},transparent)`, marginBottom: "2.2rem" }} />
      <p style={{ color: LIGHT, fontSize: "1rem", textAlign: "center", maxWidth: 300,
        lineHeight: 1.8, marginBottom: "2.6rem", fontFamily: "'Cormorant Garamond', serif" }}>
        Ten trials will measure you.<br />
        Your rank is set by your weakest.<br />
        <span style={{ color: GOLD }}>A warrior has no gap in the wall.</span>
      </p>
      <button onClick={onStart} style={{
        background: GOLD, border: `1px solid ${GOLD}`, color: BLACK,
        padding: "15px 54px", fontSize: "0.74rem", letterSpacing: "0.3em",
        fontFamily: "'Cinzel', serif", fontWeight: "bold", cursor: "pointer", borderRadius: 3 }}>
        BEGIN
      </button>
      <p style={{ color: GRAY, fontSize: "0.6rem", marginTop: "1.5rem", letterSpacing: "0.18em" }}>
        10 TRIALS · FIND YOUR RANK
      </p>
    </div>
  );
}

export function TestListScreen({ results, onSelect, onViewResults }) {
  const done = CORE_TESTS.filter(t => results[t.id] !== undefined).length;
  const roomDone = roomComplete(results);
  const fullDone = allComplete(results);
  return (
    <div style={{ minHeight: "100vh", paddingBottom: "1rem" }}>
      <div style={{ padding: "1.6rem 1.2rem 1rem", borderBottom: `1px solid ${LINE}` }}>
        <h2 style={{ fontFamily: "'Cinzel', serif", color: GOLD, fontSize: "1.1rem",
          letterSpacing: "0.15em" }}>THE TRIALS</h2>
        <div style={{ color: GRAY, fontSize: "0.8rem", marginTop: 4 }}>{done} / 10 complete</div>
        <div style={{ height: 4, background: LINE, borderRadius: 2, marginTop: 10, overflow: "hidden" }}>
          <div style={{ width: `${(done / 10) * 100}%`, height: "100%", background: GOLD, transition: "width 0.4s ease" }} />
        </div>
        {!roomDone && (
          <div style={{ color: LIGHT, fontFamily: "'Cormorant Garamond',serif", fontSize: "0.9rem",
            marginTop: 12, lineHeight: 1.5 }}>
            Begin with <b style={{ color: GOLD }}>The Room</b> — four trials, no equipment, right where you stand.
            They alone will give you a standing.
          </div>
        )}
        {roomDone && !fullDone && (
          <div style={{ color: LIGHT, fontFamily: "'Cormorant Garamond',serif", fontSize: "0.9rem",
            marginTop: 12, lineHeight: 1.5 }}>
            The room has measured you. <b style={{ color: GOLD }}>The field will test you.</b> Complete the
            remaining trials to confirm your true rank.
          </div>
        )}
      </div>

      {TIERS.map(g => {
        const tests = CORE_TESTS.map((t, i) => ({ t, i })).filter(x => x.t.group === g.key);
        const gDone = tests.filter(x => results[x.t.id] !== undefined).length;
        return (
          <div key={g.key} style={{ padding: "0.9rem 0.8rem 0.2rem" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, padding: "0 6px 6px" }}>
              <div style={{ color: GOLD, fontFamily: "'Cinzel',serif", fontSize: "0.72rem",
                letterSpacing: "0.2em" }}>{g.title}</div>
              <div style={{ flex: 1, height: 1, background: LINE }} />
              <div style={{ color: GRAY, fontSize: "0.64rem" }}>{gDone}/{tests.length}</div>
            </div>
            <div style={{ color: GRAY, fontSize: "0.68rem", padding: "0 6px 8px",
              fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic" }}>{g.blurb}</div>

            {tests.map(({ t, i }) => {
              const val = results[t.id];
              const isDone = val !== undefined;
              return (
                <button key={t.id} onClick={() => onSelect(i)} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12,
                  background: PANEL, border: `1px solid ${isDone ? DARK_GOLD : LINE}`,
                  borderRadius: 6, padding: "12px 14px", marginBottom: 8, cursor: "pointer",
                  textAlign: "left" }}>
                  <div style={{ width: 30, textAlign: "center", color: GOLD, fontSize: "0.7rem",
                    fontFamily: "'Cinzel',serif" }}>{String(i + 1).padStart(2, "0")}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: LIGHT, fontFamily: "'Cormorant Garamond',serif",
                      fontSize: "1.02rem", fontWeight: 600 }}>
                      {t.name}{t.sub ? <span style={{ color: GRAY, fontStyle: "italic" }}> · {t.sub}</span> : null}
                    </div>
                    <div style={{ color: GRAY, fontSize: "0.68rem", letterSpacing: "0.05em" }}>
                      {t.needs}{t.timeCap ? ` · ${fmt(t.timeCap)} cap` : ""}
                    </div>
                  </div>
                  {isDone ? (
                    <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ color: LIGHT, fontSize: "0.82rem" }}>{displayValue(t, val)}</div>
                      <div style={{ color: GOLD, fontSize: "0.95rem" }}>✓</div>
                    </div>
                  ) : (
                    <div style={{ color: DARK_GOLD, fontSize: "0.8rem" }}>→</div>
                  )}
                </button>
              );
            })}
          </div>
        );
      })}

      {roomDone && (
        <div style={{ padding: "0.8rem 1.2rem 2rem" }}>
          <button onClick={onViewResults} style={{
            width: "100%", padding: 16, background: GOLD, color: BLACK, border: "none",
            fontSize: "0.82rem", letterSpacing: "0.2em", fontFamily: "'Cinzel',serif",
            fontWeight: "bold", cursor: "pointer", borderRadius: 4 }}>
            {fullDone ? "VIEW YOUR RANK →" : "VIEW YOUR STANDING →"}
          </button>
          {!fullDone && (
            <p style={{ color: GRAY, fontSize: "0.64rem", textAlign: "center", marginTop: 10, lineHeight: 1.6 }}>
              Provisional — based on {done} of 10 trials. Complete the rest to confirm your rank.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function TestScreen({ test, index, onComplete, onBack, mode = "assessment", targetRankIndex = null }) {
  const [phase, setPhase] = useState("ready"); // ready | active | input
  const [elapsed, setElapsed] = useState(0);
  const [reps, setReps] = useState(0);
  const [entry, setEntry] = useState("");
  const [entryMin, setEntryMin] = useState("");
  const [entrySec, setEntrySec] = useState("");
  const timerRef = useRef(null);

  const isReps = test.type === "reps";
  const isHold = test.type === "hold";
  const isRunTime = test.type === "runtime";
  const isSecs = test.type === "secs";
  const isDistance = test.type === "distance";
  const capped = test.timeCap != null;

  useEffect(() => () => clearInterval(timerRef.current), []);

  const startTimer = useCallback((countdown) => {
    setPhase("active");
    const started = Date.now();
    timerRef.current = setInterval(() => {
      const e = (Date.now() - started) / 1000;
      if (countdown && e >= test.timeCap) {
        clearInterval(timerRef.current);
        setElapsed(test.timeCap);
        finishReps(reps);
      } else {
        setElapsed(e);
      }
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test, reps]);

  function stopHold() {
    clearInterval(timerRef.current);
    onComplete(test.id, Math.round(elapsed));
  }
  function finishReps(count) {
    clearInterval(timerRef.current);
    onComplete(test.id, count);
  }

  const isRankTest = mode === "ranktest" && targetRankIndex != null;
  void isReps; // (isReps used below)

  // format a single threshold value for display
  const fmtThreshold = (val) => {
    if (val == null) return "—";
    if (test.unit === "time") return fmt(val);
    if (test.unit === "m") return `${val} m`;
    if (test.unit === "sec") return `${val}s`;
    return `${val} ${test.unit}`;
  };

  // In a RANK TEST, show ONLY the single target for the rank being attempted.
  // In the ENTRY ASSESSMENT, show nothing — just go hard.
  const TargetLine = () => {
    if (!isRankTest) return null;
    const target = test.thresholds[targetRankIndex];
    const rankName = RANKS[targetRankIndex];
    const color = RANK_COLORS[rankName];
    if (target == null) return null;
    return (
      <div style={{ marginTop: 18, textAlign: "center" }}>
        <div style={{ color: GRAY, fontSize: "0.62rem", letterSpacing: "0.2em" }}>
          TO EARN
        </div>
        <div style={{ color, fontSize: "1rem", fontFamily: "'Cinzel',serif",
          letterSpacing: "0.12em", margin: "3px 0" }}>{rankName.toUpperCase()}</div>
        <div style={{ color: LIGHT, fontSize: "1.4rem", fontFamily: "'Cinzel',serif" }}>
          {fmtThreshold(target)}
        </div>
        <div style={{ color: GRAY, fontSize: "0.72rem", fontFamily: "'Cormorant Garamond',serif",
          fontStyle: "italic", marginTop: 4 }}>Go hard — you might just get there.</div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "1.2rem", borderBottom: `1px solid ${LINE}`, display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => { clearInterval(timerRef.current); onBack(); }} style={{
          background: "none", border: "none", color: GOLD, fontSize: "1.2rem", cursor: "pointer" }}>←</button>
        <div>
          <div style={{ color: GOLD, fontSize: "0.6rem", letterSpacing: "0.2em", fontFamily: "'Cinzel',serif" }}>
            TRIAL {String(index + 1).padStart(2, "0")}
          </div>
          <div style={{ color: LIGHT, fontSize: "1.15rem", fontFamily: "'Cormorant Garamond',serif", fontWeight: 600 }}>
            {test.name}{test.sub ? <span style={{ color: GRAY, fontStyle: "italic" }}> · {test.sub}</span> : null}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "1.5rem", textAlign: "center" }}>

        {/* READY */}
        {phase === "ready" && (
          <>
            <p style={{ color: LIGHT, fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem",
              maxWidth: 300, lineHeight: 1.6, marginBottom: 8 }}>
              {isReps && capped && `Max reps in ${fmt(test.timeCap)}. Tap to count each rep.`}
              {isReps && !capped && `Max reps. No time limit — go until form breaks. Tap to count each rep.`}
              {isHold && `Hold as long as you can. Timer counts up — stop when you break form.`}
              {isRunTime && `Enter your 2 km time.`}
              {isSecs && `Enter your time for the ${test.name}.`}
              {isDistance && `Enter your best of three jumps, in metres.`}
            </p>
            {TRIAL_MOVEMENT[test.id] && (
              <div style={{ margin: "14px 0 4px", display: "flex", justifyContent: "center" }}>
                <MovementFigure movementId={TRIAL_MOVEMENT[test.id]} size={168} showPhase />
              </div>
            )}
            {!isRankTest && (
              <div style={{ color: GOLD, fontFamily: "'Cinzel',serif", fontSize: "0.8rem",
                letterSpacing: "0.15em", marginTop: 10 }}>GIVE EVERYTHING. GO HARD.</div>
            )}
            {test.id === "fingertip" && (
              <div style={{ marginTop: 14, padding: "10px 12px", background: PANEL,
                border: `1px solid #7a3b3b`, borderRadius: 8, maxWidth: 320 }}>
                <div style={{ color: "#e0a0a0", fontSize: "0.62rem", letterSpacing: "0.15em",
                  fontFamily: "'Cinzel',serif", marginBottom: 5 }}>BUILD TO THIS</div>
                <div style={{ color: LIGHT, fontFamily: "'Cormorant Garamond',serif",
                  fontSize: "0.86rem", lineHeight: 1.5 }}>
                  Fingertips load the tendons hard. If you are new: hold a fingertip plank, then press against
                  a wall, then drop to the floor over weeks. <b>Stop at any joint pain.</b> Zero reps is a valid
                  Recruit score — there is no shame in it, and no rank worth a ruined hand.
                </div>
              </div>
            )}
            <TargetLine />
            <button onClick={() => {
              if (isReps && capped) startTimer(true);
              else if (isReps && !capped) setPhase("active");
              else if (isHold) startTimer(false);
              else setPhase("input");
            }} style={{
              marginTop: 26, background: GOLD, color: BLACK, border: "none", padding: "14px 44px",
              fontSize: "0.8rem", letterSpacing: "0.2em", fontFamily: "'Cinzel',serif",
              fontWeight: "bold", cursor: "pointer", borderRadius: 4 }}>
              {isReps || isHold ? "START" : "ENTER RESULT"}
            </button>
          </>
        )}

        {/* ACTIVE - reps */}
        {phase === "active" && isReps && (
          <>
            {capped ? (
              <>
                <div style={{ color: elapsed > test.timeCap - 30 ? "#c0392b" : GOLD,
                  fontSize: "2.4rem", fontFamily: "'Cinzel',serif", marginBottom: 4 }}>
                  {fmt(test.timeCap - elapsed)}
                </div>
                <div style={{ color: GRAY, fontSize: "0.65rem", letterSpacing: "0.2em", marginBottom: 20 }}>REMAINING</div>
              </>
            ) : (
              <div style={{ color: GRAY, fontSize: "0.65rem", letterSpacing: "0.2em", marginBottom: 20 }}>
                NO TIME LIMIT — GO TO FORM FAILURE
              </div>
            )}
            <div style={{ color: LIGHT, fontSize: "5rem", fontFamily: "'Cinzel',serif", lineHeight: 1 }}>{reps}</div>
            <div style={{ color: GRAY, fontSize: "0.7rem", letterSpacing: "0.2em", marginBottom: 24 }}>REPS</div>
            <div style={{ display: "flex", gap: 14 }}>
              <button onClick={() => setReps(r => Math.max(0, r - 1))} style={cBtn(false)}>–</button>
              <button onClick={() => setReps(r => r + 1)} style={cBtn(true)}>+1</button>
            </div>
            <button onClick={() => finishReps(reps)} style={doneBtn}>DONE</button>
          </>
        )}

        {/* ACTIVE - hold */}
        {phase === "active" && isHold && (
          <>
            <div style={{ color: GOLD, fontSize: "3.4rem", fontFamily: "'Cinzel',serif" }}>{fmt(elapsed)}</div>
            <div style={{ color: GRAY, fontSize: "0.7rem", letterSpacing: "0.2em", marginBottom: 10 }}>HOLDING</div>
            {isRankTest && test.thresholds[targetRankIndex] != null && (
              <div style={{ color: RANK_COLORS[RANKS[targetRankIndex]], fontSize: "0.72rem",
                letterSpacing: "0.12em", marginBottom: 24 }}>
                {elapsed >= test.thresholds[targetRankIndex]
                  ? `${RANKS[targetRankIndex].toUpperCase()} REACHED — HOLD ON`
                  : `TARGET ${fmt(test.thresholds[targetRankIndex])}`}
              </div>
            )}
            {!isRankTest && <div style={{ marginBottom: 24 }} />}
            <button onClick={stopHold} style={{ ...doneBtn, marginTop: 10, background: "#c0392b", color: "#fff" }}>
              STOP — I BROKE FORM
            </button>
          </>
        )}

        {/* INPUT - run/secs/distance */}
        {phase === "input" && (
          <>
            {isRunTime ? (
              <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center" }}>
                <input value={entryMin} onChange={e => setEntryMin(e.target.value)} placeholder="min"
                  inputMode="numeric" style={inp} />
                <span style={{ color: GOLD, fontSize: "1.4rem" }}>:</span>
                <input value={entrySec} onChange={e => setEntrySec(e.target.value)} placeholder="sec"
                  inputMode="numeric" style={inp} />
              </div>
            ) : (
              <input value={entry} onChange={e => setEntry(e.target.value)}
                placeholder={test.unit === "m" ? "metres (e.g. 1.8)" : "seconds"}
                inputMode="decimal" style={{ ...inp, width: 200 }} />
            )}
            <TargetLine />
            <button onClick={() => {
              let v;
              if (isRunTime) v = (Number(entryMin) || 0) * 60 + (Number(entrySec) || 0);
              else v = Number(entry);
              if (!v && v !== 0) return;
              onComplete(test.id, isDistance ? v : Math.round(v * (isDistance ? 1 : 1)));
            }} style={{ marginTop: 24, background: GOLD, color: BLACK, border: "none",
              padding: "14px 44px", fontSize: "0.8rem", letterSpacing: "0.2em",
              fontFamily: "'Cinzel',serif", fontWeight: "bold", cursor: "pointer", borderRadius: 4 }}>
              RECORD
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function ResultsScreen({ results, onRestart, onViewProgress }) {
  const overall = overallRank(results);
  const rankName = RANKS[overall];
  const color = RANK_COLORS[rankName];
  const provisional = !allComplete(results);
  const doneCount = completedTests(results).length;
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 220); return () => clearTimeout(t); }, []);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "2rem 1.4rem", textAlign: "center",
      opacity: show ? 1 : 0, transform: show ? "scale(1)" : "scale(0.94)",
      transition: "opacity 0.7s ease, transform 0.7s ease",
    }}>
      <div style={{ fontSize: "2.2rem", marginBottom: "1.1rem",
        filter: `drop-shadow(0 0 18px ${color}66)` }}>⚔</div>
      <div style={{ color: GRAY, fontSize: "0.66rem", letterSpacing: "0.36em",
        fontFamily: "'Cinzel',serif" }}>{provisional ? "THE ROOM HAS SPOKEN" : "CONGRATULATIONS"}</div>
      <div style={{ color: GRAY, fontSize: "0.82rem", letterSpacing: "0.15em", marginTop: 16,
        fontFamily: "'Cormorant Garamond',serif" }}>
        {provisional ? "YOU STAND AT" : "YOUR RANK IS"}
      </div>
      <div style={{ color, fontSize: "3rem", fontFamily: "'Cinzel',serif", letterSpacing: "0.14em",
        textShadow: `0 0 30px ${color}55`, margin: "6px 0 12px" }}>
        {rankName.toUpperCase()}
      </div>
      <div style={{ width: 80, height: 1, margin: "0 auto 22px",
        background: `linear-gradient(90deg,transparent,${color},transparent)` }} />
      <p style={{ color: LIGHT, fontFamily: "'Cormorant Garamond',serif", fontSize: "1.05rem",
        lineHeight: 1.6, maxWidth: 300 }}>
        {provisional
          ? `Provisional — measured on ${doneCount} of ten trials. The field has not yet tested you.`
          : REVEAL_FLAVOR[rankName]}
      </p>
      <button onClick={onViewProgress} style={{
        marginTop: "2.4rem", background: GOLD, color: BLACK, border: "none",
        padding: "14px 44px", fontSize: "0.72rem", letterSpacing: "0.2em",
        fontFamily: "'Cinzel',serif", fontWeight: "bold", cursor: "pointer", borderRadius: 4 }}>
        VIEW YOUR PATH
      </button>
      <button onClick={onRestart} style={{
        marginTop: "1rem", background: "none", border: "none", color: GRAY,
        padding: "6px", fontSize: "0.66rem", letterSpacing: "0.2em",
        fontFamily: "'Cinzel',serif", cursor: "pointer" }}>
        RE-TEST
      </button>
    </div>
  );
}
