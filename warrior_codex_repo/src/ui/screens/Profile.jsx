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

// ═══ UI · THE PROFILE — your standing, your wall, your record ═══

export default function ProfileScreen({ results, startDate, record, ground, orders = [], held, onBack, onRestart, onTrain, onOrders }) {
  const overall = overallRank(results);
  const [launchLine] = useState(() => pickVoice("launch", RANKS[overall]));
  const provisional = !allComplete(results);
  const doneCount = completedTests(results).length;
  const remaining = CORE_TESTS.filter(t => results[t.id] === undefined);
  const best = bestTest(results);
  const bestRank = best ? rankForTest(best, results[best.id]) : 0;
  const rankName = RANKS[overall];
  const color = RANK_COLORS[rankName];
  const atMax = overall === 5;
  const nextIndex = Math.min(overall + 1, 5);
  const nextName = RANKS[nextIndex];
  const nextColor = RANK_COLORS[nextName];
  const trial = testDateFor(rankName, startDate);
  const ordersHeld = orders.filter(o => (held?.ids || []).includes(o.id)).length;
  const rec = record || { sessions: 0, tests: 0, lastSession: null };
  const gap = daysSince(rec.lastSession);
  const doctrine = rec.sessions > 0 ? missedDayLine(gap) : null;
  const weeksTrained = startDate
    ? Math.floor((Date.now() - new Date(startDate).getTime()) / (7 * 86400000)) : 0;

  const rows = completedTests(results).map(t => {
    const r = rankForTest(t, results[t.id]);
    const val = results[t.id];
    const target = t.thresholds[nextIndex];
    let pct = 0, meets = false;
    if (target == null) { meets = true; pct = 100; }
    else if (val != null && val !== "") {
      const v = Number(val);
      if (t.higher) { pct = target > 0 ? Math.min(100, (v / target) * 100) : 100; meets = v >= target; }
      else { pct = v > 0 ? Math.min(100, (target / v) * 100) : 0; meets = v <= target; }
    }
    return { t, r, val, target, pct, meets };
  });
  const walls = atMax ? [] : rows.filter(x => !x.meets).map(x => x.t.name);
  // (rows now only contains completed trials)

  const fmtTarget = (t, val) => {
    if (val == null) return "—";
    if (t.unit === "time") return fmt(val);
    if (t.unit === "m") return `${val} m`;
    if (t.unit === "sec") return `${val}s`;
    return `${val}`;
  };

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "2rem" }}>
      <div style={{ padding: "1.4rem 1.2rem 1rem", borderBottom: `1px solid ${LINE}`,
        display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: GOLD,
          fontSize: "1.2rem", cursor: "pointer" }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ color: GRAY, fontSize: "0.6rem", letterSpacing: "0.25em",
            fontFamily: "'Cinzel',serif" }}>YOUR STANDING</div>
          <div style={{ color, fontSize: "1.5rem", fontFamily: "'Cinzel',serif",
            letterSpacing: "0.1em" }}>{rankName.toUpperCase()}</div>
        </div>
      </div>

      {/* commander's morning word */}
      <div style={{ padding: "0.9rem 1.2rem 0" }}>
        <div style={{ color: GOLD, fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem",
          fontStyle: "italic", lineHeight: 1.45, textAlign: "center" }}>"{launchLine}"</div>
      </div>

      {/* provisional standing — trials still outstanding */}
      {provisional && (
        <div style={{ margin: "1rem 1.2rem 0", background: PANEL, border: `1px solid ${DARK_GOLD}`,
          borderRadius: 8, padding: "12px 14px" }}>
          <div style={{ color: GOLD, fontSize: "0.62rem", letterSpacing: "0.2em",
            fontFamily: "'Cinzel',serif", marginBottom: 6 }}>PROVISIONAL STANDING</div>
          <div style={{ color: LIGHT, fontFamily: "'Cormorant Garamond',serif", fontSize: "0.93rem",
            lineHeight: 1.55, marginBottom: 8 }}>
            Measured on <b style={{ color: GOLD }}>{doneCount} of ten</b> trials. Your rank is not yet true.
            {remaining.length ? " These remain:" : ""}
          </div>
          {remaining.map(t => (
            <div key={t.id} style={{ display: "flex", justifyContent: "space-between",
              padding: "4px 0", borderTop: `1px solid ${LINE}` }}>
              <div style={{ color: LIGHT, fontSize: "0.82rem",
                fontFamily: "'Cormorant Garamond',serif" }}>{t.name}</div>
              <div style={{ color: GRAY, fontSize: "0.68rem" }}>{t.needs}</div>
            </div>
          ))}
        </div>
      )}

      {/* THE DAY OF YOUR TEST — set by the program, not chosen */}
      {trial && (
        <div style={{ margin: "1rem 1.2rem 0", background: PANEL, border: `1px solid ${color}`,
          borderRadius: 8, padding: "14px" }}>
          <div style={{ color: GRAY, fontSize: "0.6rem", letterSpacing: "0.24em",
            fontFamily: "'Cinzel',serif", textAlign: "center" }}>THE DAY OF YOUR TEST</div>
          <div style={{ color: LIGHT, fontSize: "1.35rem", fontFamily: "'Cinzel',serif",
            letterSpacing: "0.06em", textAlign: "center", margin: "7px 0 3px" }}>
            {fmtDate(trial.date).toUpperCase()}
          </div>
          <div style={{ color: GRAY, fontSize: "0.72rem", textAlign: "center",
            fontFamily: "'Cormorant Garamond',serif" }}>
            {trial.weeks} weeks · {trial.sessions} sessions · you test for{" "}
            <b style={{ color: nextColor }}>{nextName}</b>
          </div>
          <div style={{ height: 5, background: LINE, borderRadius: 3, marginTop: 11, overflow: "hidden" }}>
            <div style={{ width: `${trial.pct}%`, height: "100%", background: color,
              transition: "width 0.5s ease" }} />
          </div>
          <div style={{ color: GOLD, fontSize: "0.7rem", textAlign: "center", marginTop: 7,
            fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic" }}>
            {trial.daysLeft > 0
              ? `${trial.daysLeft} days remain. The date does not move.`
              : `The day has come. Present yourself.`}
          </div>
        </div>
      )}

      {/* the missed-day doctrine — spoken once, without guilt */}
      {doctrine && (
        <div style={{ margin: "1rem 1.2rem 0", padding: "11px 14px", background: PANEL,
          border: `1px solid ${LINE}`, borderRadius: 8 }}>
          <div style={{ color: LIGHT, fontFamily: "'Cormorant Garamond',serif", fontSize: "0.95rem",
            fontStyle: "italic", lineHeight: 1.5 }}>"{doctrine}"</div>
        </div>
      )}

      {/* THE RECORD — a tally, not a streak. It only ever counts up. */}
      {rec.sessions > 0 && (
        <div style={{ margin: "1rem 1.2rem 0", background: PANEL, border: `1px solid ${LINE}`,
          borderRadius: 8, padding: "12px 14px" }}>
          <div style={{ color: GRAY, fontSize: "0.6rem", letterSpacing: "0.24em",
            fontFamily: "'Cinzel',serif", marginBottom: 9, textAlign: "center" }}>THE RECORD</div>
          <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
            {[
              { n: rec.sessions, label: "SESSIONS" },
              { n: weeksTrained, label: weeksTrained === 1 ? "WEEK" : "WEEKS" },
              { n: rec.tests, label: rec.tests === 1 ? "TEST PASSED" : "TESTS PASSED" },
            ].map(x => (
              <div key={x.label}>
                <div style={{ color: GOLD, fontSize: "1.5rem", fontFamily: "'Cinzel',serif" }}>{x.n}</div>
                <div style={{ color: GRAY, fontSize: "0.56rem", letterSpacing: "0.15em",
                  fontFamily: "'Cinzel',serif" }}>{x.label}</div>
              </div>
            ))}
          </div>
          <div style={{ color: GRAY, fontSize: "0.64rem", textAlign: "center", marginTop: 9,
            fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic" }}>
            Every mark was earned. None can be taken back.
          </div>
        </div>
      )}

      {/* your ground and your hour */}
      {ground && (
        <div style={{ margin: "0.7rem 1.2rem 0", padding: "9px 14px", background: PANEL,
          border: `1px solid ${LINE}`, borderRadius: 8, display: "flex",
          justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: GRAY, fontSize: "0.56rem", letterSpacing: "0.18em",
              fontFamily: "'Cinzel',serif" }}>YOUR GROUND</div>
            <div style={{ color: LIGHT, fontFamily: "'Cormorant Garamond',serif",
              fontSize: "0.92rem" }}>{ground.ground}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: GRAY, fontSize: "0.56rem", letterSpacing: "0.18em",
              fontFamily: "'Cinzel',serif" }}>YOUR HOUR</div>
            <div style={{ color: LIGHT, fontFamily: "'Cormorant Garamond',serif",
              fontSize: "0.92rem" }}>{ground.hour}</div>
          </div>
        </div>
      )}

      {/* honest encouragement — your strongest showing */}
      {best && (
        <div style={{ margin: "1rem 1.2rem 0", padding: "10px 14px", background: PANEL,
          border: `1px solid ${LINE}`, borderRadius: 8 }}>
          <div style={{ color: GRAY, fontSize: "0.6rem", letterSpacing: "0.2em",
            fontFamily: "'Cinzel',serif", marginBottom: 4 }}>YOUR STRONGEST TRIAL</div>
          <div style={{ color: LIGHT, fontFamily: "'Cormorant Garamond',serif", fontSize: "0.95rem" }}>
            <b>{best.name}</b> — you fought at{" "}
            <b style={{ color: RANK_COLORS[RANKS[bestRank]] }}>{RANKS[bestRank]}</b> standard.
            {bestRank > overall ? " Your rank is held back by the wall below, not by this." : ""}
          </div>
        </div>
      )}

      {/* the wall */}
      {!atMax && (
        <div style={{ margin: "1rem 1.2rem", background: PANEL, border: `1px solid ${DARK_GOLD}`,
          borderRadius: 8, padding: "12px 14px" }}>
          <div style={{ color: GOLD, fontSize: "0.62rem", letterSpacing: "0.2em",
            fontFamily: "'Cinzel',serif", marginBottom: 6 }}>THE WALL</div>
          <div style={{ color: LIGHT, fontFamily: "'Cormorant Garamond',serif", fontSize: "0.95rem",
            lineHeight: 1.55 }}>
            {walls.length
              ? <>These trials hold you at <b style={{ color }}>{rankName}</b>. Break them to reach{" "}
                <b style={{ color: nextColor }}>{nextName}</b>: <b style={{ color: GOLD }}>{walls.join(", ")}</b>.</>
              : <>Every trial meets <b style={{ color: nextColor }}>{nextName}</b>. Re-test to claim the rank.</>}
          </div>
        </div>
      )}
      {atMax && (
        <div style={{ margin: "1rem 1.2rem", background: PANEL, border: `1px solid ${color}`,
          borderRadius: 8, padding: "14px", textAlign: "center" }}>
          <div style={{ color, fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem" }}>
            You stand at the summit. There is no higher rank — hold the standard, and pass it on.
          </div>
        </div>
      )}

      {/* per-trial progress */}
      <div style={{ padding: "0 1.2rem" }}>
        <div style={{ color: GRAY, fontSize: "0.6rem", letterSpacing: "0.2em",
          fontFamily: "'Cinzel',serif", margin: "0.4rem 0 0.6rem" }}>
          {atMax ? "YOUR RESULTS" : `PROGRESS TO ${nextName.toUpperCase()}`}
        </div>
        {rows.map(({ t, r, val, target, pct, meets }) => (
          <div key={t.id} style={{ padding: "10px 0", borderBottom: `1px solid ${LINE}` }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 5 }}>
              <div style={{ flex: 1, color: LIGHT, fontFamily: "'Cormorant Garamond',serif",
                fontSize: "0.95rem" }}>
                {t.name}{t.sub ? <span style={{ color: GRAY, fontStyle: "italic" }}> · {t.sub}</span> : null}
              </div>
              <div style={{ color: LIGHT, fontSize: "0.82rem" }}>{fmtTarget(t, val)}</div>
              <div style={{ color: RANK_COLORS[RANKS[r]], fontSize: "0.58rem", fontWeight: "bold",
                letterSpacing: "0.08em", width: 52, textAlign: "right" }}>
                {RANKS[r].slice(0, 3).toUpperCase()}
              </div>
            </div>
            {!atMax && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, height: 5, background: LINE, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%",
                    background: meets ? nextColor : GOLD, transition: "width 0.5s ease" }} />
                </div>
                <div style={{ width: 78, textAlign: "right", fontSize: "0.62rem",
                  color: meets ? nextColor : GRAY }}>
                  {meets ? `${nextName} ✓` : `need ${fmtTarget(t, target)}`}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* STANDING ORDERS — small work, through the day */}
      {orders.length > 0 && (
        <button onClick={onOrders} style={{ width: "calc(100% - 2.4rem)", margin: "1rem 1.2rem 0",
          background: PANEL, border: `1px solid ${LINE}`, borderRadius: 8, padding: "12px 14px",
          cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: GRAY, fontSize: "0.6rem", letterSpacing: "0.22em",
              fontFamily: "'Cinzel',serif" }}>STANDING ORDERS</div>
            <div style={{ color: LIGHT, fontFamily: "'Cormorant Garamond',serif", fontSize: "0.95rem" }}>
              {ordersHeld} of {orders.length} held today
            </div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {orders.map(o => (
              <div key={o.id} style={{ width: 9, height: 9, borderRadius: 2,
                background: (held?.ids || []).includes(o.id) ? GOLD : LINE }} />
            ))}
          </div>
          <div style={{ color: DARK_GOLD, fontSize: "0.8rem" }}>→</div>
        </button>
      )}

      <div style={{ padding: "1.4rem 1.2rem 0" }}>
        <button onClick={onTrain} style={{ width: "100%", padding: 16, background: GOLD, color: BLACK,
          border: "none", fontSize: "0.78rem", letterSpacing: "0.2em", fontFamily: "'Cinzel',serif",
          fontWeight: "bold", cursor: "pointer", borderRadius: 4 }}>
          BEGIN TODAY'S TRAINING →
        </button>
        <button onClick={onRestart} style={{ width: "100%", marginTop: 10, padding: 12, background: "none",
          border: "none", color: GRAY, fontSize: "0.66rem", letterSpacing: "0.25em",
          fontFamily: "'Cinzel',serif", cursor: "pointer" }}>
          RE-TEST
        </button>
        <p style={{ color: GRAY, fontSize: "0.6rem", textAlign: "center", marginTop: 10, lineHeight: 1.6 }}>
          Self-recorded. Rank verification by video / coach comes at Warlord and above.
        </p>
      </div>
    </div>
  );
}
