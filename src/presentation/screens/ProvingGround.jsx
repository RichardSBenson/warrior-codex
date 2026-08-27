import { useState } from "react";
import { RANKS } from "../../domain/entities/Rank.js";
import { programFor } from "../../data/repositories/LocalProgramRepository.js";
import { getSession, blockForWeek, totalSets } from "../../domain/useCases/GetSession.js";
import { resultsAtRank, startDateForWeek } from "../../domain/useCases/SeedStanding.js";
import { BLACK, PANEL, GOLD, DARK_GOLD, LIGHT, GRAY, LINE } from "../../design/uiKit.js";

const DAY_NAMES = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const btn = (active) => ({
  minHeight: 44, minWidth: 44, padding: "8px 12px",
  background: active ? GOLD : "transparent",
  color: active ? BLACK : LIGHT,
  border: `1px solid ${active ? GOLD : LINE}`,
  fontFamily: "'Cinzel',serif", fontSize: "0.72rem", letterSpacing: "0.08em",
});

/**
 * THE PROVING GROUND
 *
 * A test harness, not a feature. It lets you stand anywhere in any program
 * without waiting out the calendar, so a twelve-week block can be walked in
 * a minute. It never writes a result, never advances a rank and never touches
 * the record — it only chooses which session the training screen shows.
 *
 * Reached with ?dev=1 and switched off from inside. Invisible otherwise.
 */
export function ProvingGround({ override, setOverride, onOpenSession, onReview, onSeed, onWipe, onBack, onDisable }) {
  const [rank, setRank] = useState(override?.rank || "Recruit");
  const [week, setWeek] = useState(override?.week || 1);
  const [day, setDay] = useState(override?.day || 1);

  const program = programFor(rank);
  const block = program ? blockForWeek(program, week) : null;
  const session = program ? getSession(program, week, day) : null;
  const maxWeek = program?.weeks || 1;

  const apply = (patch) => {
    const next = { rank, week, day, ...patch };
    if (patch.rank !== undefined) { setRank(patch.rank); next.week = 1; setWeek(1); }
    if (patch.week !== undefined) setWeek(patch.week);
    if (patch.day !== undefined) setDay(patch.day);
    setOverride(next);
  };

  return (
    <div style={{ background: BLACK, minHeight: "100vh", padding: 20, color: LIGHT }}>
      <div style={{ fontSize: "0.65rem", letterSpacing: "0.3em", color: DARK_GOLD, marginBottom: 4 }}>
        TEST HARNESS
      </div>
      <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: "1.4rem", letterSpacing: "0.08em", marginBottom: 6 }}>
        THE PROVING GROUND
      </h2>
      <p style={{ color: GRAY, fontSize: "0.85rem", lineHeight: 1.5, marginBottom: 22 }}>
        Stand anywhere in any program. Nothing here is recorded and no rank is earned.
      </p>

      <div style={{ fontSize: "0.65rem", letterSpacing: "0.2em", color: DARK_GOLD, marginBottom: 8 }}>PROGRAM</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
        {RANKS.slice(0, 5).map((r) => (
          <button key={r} style={btn(r === rank)} onClick={() => apply({ rank: r })}>
            {r.toUpperCase()}
          </button>
        ))}
      </div>

      {!program && (
        <div style={{ border: `1px solid ${LINE}`, padding: 16, marginBottom: 20, color: GRAY }}>
          No program written for {rank} yet. Recruit and Soldier are in.
        </div>
      )}

      {program && (
        <>
          <div style={{ fontSize: "0.65rem", letterSpacing: "0.2em", color: DARK_GOLD, marginBottom: 8 }}>
            WEEK {week} OF {maxWeek}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 20 }}>
            {Array.from({ length: maxWeek }, (_, i) => i + 1).map((n) => (
              <button key={n} style={{ ...btn(n === week), minWidth: 38, padding: "8px 4px" }}
                onClick={() => apply({ week: n })}>{n}</button>
            ))}
          </div>

          <div style={{ fontSize: "0.65rem", letterSpacing: "0.2em", color: DARK_GOLD, marginBottom: 8 }}>DAY</div>
          <div style={{ display: "flex", gap: 5, marginBottom: 22 }}>
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <button key={n} style={{ ...btn(n === day), minWidth: 42, padding: "8px 4px" }}
                onClick={() => apply({ day: n })}>{DAY_NAMES[n]}</button>
            ))}
          </div>

          <div style={{ background: PANEL, border: `1px solid ${LINE}`, padding: 16, marginBottom: 20 }}>
            {block && (
              <div style={{ fontSize: "0.7rem", letterSpacing: "0.16em", color: DARK_GOLD, marginBottom: 6 }}>
                {block.phase.toUpperCase()} · {block.label.toUpperCase()}
              </div>
            )}
            {session ? (
              <>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: "1.05rem", letterSpacing: "0.08em" }}>
                  {session.dayName} — {session.focus}
                </div>
                <div style={{ color: GRAY, fontSize: "0.85rem", marginTop: 6 }}>
                  {session.movements.length} movements · {totalSets(session)} sets
                  {session.tapered && " · tapered"}
                  {session.reused && " · reused block"}
                </div>
                {session.note && (
                  <div style={{ color: GRAY, fontSize: "0.82rem", marginTop: 8, fontStyle: "italic", lineHeight: 1.45 }}>
                    {session.note}
                  </div>
                )}
                <div style={{ marginTop: 12, borderTop: `1px solid ${LINE}`, paddingTop: 10 }}>
                  {session.movements.map((m, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 10,
                      fontSize: "0.82rem", padding: "3px 0" }}>
                      <span>{m.name}</span>
                      <span style={{ color: GRAY, whiteSpace: "nowrap" }}>
                        {m.sets} × {m.type === "sets" ? m.reps : `${m.seconds}s`}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ color: GRAY }}>Rest day — no session prescribed.</div>
            )}
          </div>

          {session && (
            <button style={{ ...btn(true), width: "100%", marginBottom: 10 }} onClick={onOpenSession}>
              OPEN IN TRAINING SCREEN
            </button>
          )}
        </>
      )}

      <div style={{ borderTop: `1px solid ${LINE}`, margin: "6px 0 16px", paddingTop: 16 }}>
        <div style={{ fontSize: "0.65rem", letterSpacing: "0.2em", color: DARK_GOLD, marginBottom: 6 }}>
          SKIP THE ASSESSMENT
        </div>
        <p style={{ color: GRAY, fontSize: "0.82rem", lineHeight: 1.5, marginTop: 0, marginBottom: 10 }}>
          Writes every trial at {rank} standard and starts you in week {week}. It is a
          shortcut past ten trials, not a rank — nothing here is verified.
        </p>
        <button style={{ ...btn(true), width: "100%", marginBottom: 8 }}
          onClick={() => onSeed(resultsAtRank(rank), startDateForWeek(week))}>
          STAND ME AT {rank.toUpperCase()}, WEEK {week}
        </button>
        <button style={{ ...btn(false), width: "100%", color: "#B98F8F", borderColor: "#5a3030" }}
          onClick={onWipe}>
          WIPE EVERYTHING AND START OVER
        </button>
      </div>

      <button style={{ ...btn(false), width: "100%", marginBottom: 10 }} onClick={onReview}>
        READ THE MANUSCRIPT
      </button>
      <button style={{ ...btn(false), width: "100%", marginBottom: 10 }}
        onClick={() => { setOverride(null); onBack(); }}>
        CLEAR OVERRIDE AND RETURN
      </button>
      <button style={{ ...btn(false), width: "100%", color: GRAY }} onClick={onDisable}>
        TURN OFF THE PROVING GROUND
      </button>
    </div>
  );
}

export default ProvingGround;
