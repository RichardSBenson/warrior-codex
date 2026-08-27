import { useState } from "react";
import { RANKS } from "../../domain/entities/Rank.js";
import { programFor, exerciseById, allExercises, sequenceFor } from "../../data/repositories/LocalProgramRepository.js";
import { getSession, totalSets } from "../../domain/useCases/GetSession.js";
import { normaliseWarmUp } from "../../domain/entities/WarmUp.js";
import { fmt, BLACK, PANEL, GOLD, DARK_GOLD, LIGHT, GRAY, LINE } from "../../design/uiKit.js";

/**
 * THE MANUSCRIPT
 *
 * Every session laid end to end, read rather than performed. Proofing a
 * program by training it takes twelve weeks; this takes a scroll.
 *
 * Read-only by construction — it renders through getSession, so a reused or
 * tapered block shows exactly what a warrior would be handed on the day,
 * not what the JSON happens to hold.
 */

const label = { fontFamily: "'Cinzel',serif", fontSize: "0.6rem", letterSpacing: "0.24em", color: DARK_GOLD };
const tab = (on) => ({
  minHeight: 44, padding: "9px 14px", flex: 1,
  background: on ? GOLD : "transparent", color: on ? BLACK : LIGHT,
  border: `1px solid ${on ? GOLD : LINE}`,
  fontFamily: "'Cinzel',serif", fontSize: "0.66rem", letterSpacing: "0.1em",
});

function Movement({ m }) {
  const known = exerciseById(m.movementId);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12,
      padding: "6px 0", borderBottom: `1px solid ${LINE}` }}>
      <div style={{ flex: 1 }}>
        <span style={{ color: known ? LIGHT : "#B98F8F", fontSize: "0.9rem" }}>{m.name}</span>
        {m.sub && <span style={{ color: GRAY, fontSize: "0.78rem", fontStyle: "italic" }}> — {m.sub}</span>}
        {!known && <span style={{ color: "#B98F8F", fontSize: "0.7rem" }}> · id "{m.movementId}" not in the library</span>}
      </div>
      <div style={{ color: GRAY, fontSize: "0.82rem", whiteSpace: "nowrap", textAlign: "right" }}>
        {m.sets} × {m.type === "sets" ? m.reps : `${m.seconds}s`}
        <span style={{ color: "#5a564c" }}>{m.rest ? ` · ${fmt(m.rest)}` : " · —"}</span>
      </div>
    </div>
  );
}

function Session({ s }) {
  if (!s) return null;
  return (
    <div style={{ background: PANEL, border: `1px solid ${LINE}`, padding: "12px 14px", marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.95rem", letterSpacing: "0.08em", color: GOLD }}>
          DAY {s.dayNumber} · {s.dayName}
        </div>
        <div style={{ color: GRAY, fontSize: "0.72rem" }}>
          {s.movements.length} mv · {totalSets(s)} sets
          {s.tapered && " · TAPERED"}{s.reused && " · REUSED"}
        </div>
      </div>
      <div style={{ color: LIGHT, fontSize: "0.82rem", fontStyle: "italic", marginBottom: 6 }}>{s.focus}</div>
      {s.movements.map((m, i) => <Movement key={i} m={m} />)}
      {s.note && (
        <div style={{ color: GRAY, fontSize: "0.8rem", fontStyle: "italic", marginTop: 8, lineHeight: 1.45 }}>
          {s.note}
        </div>
      )}
      {s.source && (
        <div style={{ color: "#8FB98F", fontSize: "0.7rem", marginTop: 6 }}>source: {s.source}</div>
      )}
    </div>
  );
}

function ProgramView({ program }) {
  if (!program) return <div style={{ color: GRAY }}>No program written for this rank yet.</div>;
  const warm = normaliseWarmUp(program.warmUp);
  const cool = normaliseWarmUp(program.coolDown);

  let sessions = 0, movements = 0, sets = 0;
  for (let w = 1; w <= program.weeks; w++)
    for (let d = 1; d <= 7; d++) {
      const s = getSession(program, w, d);
      if (!s) continue;
      sessions += 1; movements += s.movements.length; sets += totalSets(s);
    }

  return (
    <>
      <div style={{ border: `1px solid ${LINE}`, padding: 14, marginBottom: 16 }}>
        <div style={label}>{program.fromRank.toUpperCase()} → {program.toRank.toUpperCase()}</div>
        <div style={{ color: LIGHT, fontSize: "0.88rem", marginTop: 8, lineHeight: 1.6 }}>
          {program.weeks} weeks · {sessions} sessions · {movements} prescribed movements · {sets} sets
        </div>
        <div style={{ ...label, marginTop: 14 }}>WARM-UP · {fmt(warm.totalSeconds)}</div>
        {warm.steps.map((s, i) => (
          <div key={i} style={{ color: LIGHT, fontSize: "0.85rem", marginTop: 4 }}>
            {s.name} — {fmt(s.seconds)}
            {s.sequence && <span style={{ color: GOLD }}> · {s.sequence} sequence</span>}
            <div style={{ color: GRAY, fontSize: "0.78rem" }}>{s.cue}</div>
          </div>
        ))}
        {warm.note && <div style={{ color: GRAY, fontSize: "0.78rem", fontStyle: "italic", marginTop: 6 }}>{warm.note}</div>}
        <div style={{ ...label, marginTop: 14 }}>COOL-DOWN · {fmt(cool.totalSeconds)}</div>
        {cool.steps.map((s, i) => (
          <div key={i} style={{ color: LIGHT, fontSize: "0.85rem", marginTop: 4 }}>
            {s.name} — {fmt(s.seconds)}
            <div style={{ color: GRAY, fontSize: "0.78rem" }}>{s.cue}</div>
          </div>
        ))}
      </div>

      {program.blocks.map((b, i) => (
        <div key={i} style={{ marginBottom: 26 }}>
          <div style={{ ...label, marginBottom: 2 }}>
            {b.phase.toUpperCase()}{b.label ? ` · ${b.label.toUpperCase()}` : ""}
          </div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: "1.25rem", color: LIGHT,
            letterSpacing: "0.06em", marginBottom: 4 }}>
            {b.weeks.length > 1 ? `WEEKS ${b.weeks[0]}–${b.weeks[b.weeks.length - 1]}` : `WEEK ${b.weeks[0]}`}
            {b.taperFrom && <span style={{ color: GOLD, fontSize: "0.7rem" }}>  TAPER −{b.setsDelta || 1} SET</span>}
            {b.sameAs && <span style={{ color: GOLD, fontSize: "0.7rem" }}>  REUSES {b.sameAs.join("–")}</span>}
            {b.test && <span style={{ color: GOLD, fontSize: "0.7rem" }}>  TEST WEEK</span>}
          </div>
          {b.note && (
            <div style={{ color: GRAY, fontSize: "0.83rem", fontStyle: "italic",
              marginBottom: 10, lineHeight: 1.5 }}>{b.note}</div>
          )}
          {[1, 2, 3, 4, 5, 6, 7]
            .map((d) => getSession(program, b.weeks[0], d))
            .filter(Boolean)
            .map((s, j) => <Session key={j} s={s} />)}
        </div>
      ))}
    </>
  );
}

function ExerciseView() {
  const list = allExercises();
  const byCulture = {};
  for (const e of list) (byCulture[e.culture] ||= []).push(e);

  return (
    <>
      <div style={{ color: GRAY, fontSize: "0.85rem", marginBottom: 16 }}>
        {list.length} movements · {list.filter((e) => e.frames).length} with animation
      </div>
      {Object.keys(byCulture).sort().map((c) => (
        <div key={c} style={{ marginBottom: 20 }}>
          <div style={{ ...label, marginBottom: 6 }}>{c.toUpperCase()}</div>
          {byCulture[c].map((e) => (
            <div key={e.id} style={{ borderBottom: `1px solid ${LINE}`, padding: "7px 0" }}>
              <div style={{ color: LIGHT, fontSize: "0.9rem" }}>
                {e.name}
                {e.original && <span style={{ color: GOLD, fontStyle: "italic" }}> · {e.original}</span>}
                <span style={{ color: "#5a564c", fontSize: "0.7rem" }}> · {e.id}</span>
              </div>
              <div style={{ color: GRAY, fontSize: "0.8rem", lineHeight: 1.4 }}>{e.purpose}</div>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

function SequenceView() {
  const seq = sequenceFor("surya");
  if (!seq) return null;
  return (
    <>
      <div style={{ ...label }}>{seq.name.toUpperCase()} · {seq.original}</div>
      <div style={{ color: GRAY, fontSize: "0.82rem", margin: "8px 0 16px", lineHeight: 1.5 }}>
        {seq.note} {seq.form}
      </div>
      {seq.poses.map((p) => (
        <div key={p.n} style={{ borderBottom: `1px solid ${LINE}`, padding: "9px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <div style={{ color: GOLD, fontFamily: "'Cinzel',serif", fontSize: "0.92rem" }}>
              {p.n}. {p.sanskrit}
            </div>
            <div style={{ color: p.breath === "in" ? "#8FB98F" : p.breath === "out" ? "#B98F8F" : GRAY,
              fontSize: "0.66rem", letterSpacing: "0.14em", fontFamily: "'Cinzel',serif" }}>
              {p.breath.toUpperCase()}
            </div>
          </div>
          <div style={{ color: LIGHT, fontSize: "0.82rem", fontStyle: "italic" }}>{p.english}</div>
          <div style={{ color: GRAY, fontSize: "0.82rem", lineHeight: 1.45, marginTop: 2 }}>{p.cue}</div>
        </div>
      ))}
    </>
  );
}

export function Manuscript({ onBack }) {
  const [view, setView] = useState("program");
  const [rank, setRank] = useState("Recruit");

  return (
    <div style={{ background: BLACK, minHeight: "100vh", padding: "20px 16px 80px", color: LIGHT }}>
      <div style={label}>REVIEW</div>
      <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: "1.4rem", letterSpacing: "0.08em", margin: "4px 0 14px" }}>
        THE MANUSCRIPT
      </h2>

      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        <button style={tab(view === "program")} onClick={() => setView("program")}>PROGRAMS</button>
        <button style={tab(view === "exercises")} onClick={() => setView("exercises")}>MOVEMENTS</button>
        <button style={tab(view === "sequence")} onClick={() => setView("sequence")}>SEQUENCE</button>
      </div>

      {view === "program" && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 16 }}>
          {RANKS.slice(0, 5).map((r) => (
            <button key={r} style={{ ...tab(r === rank), flex: "0 0 auto", padding: "8px 10px" }}
              onClick={() => setRank(r)}>{r.toUpperCase()}</button>
          ))}
        </div>
      )}

      {view === "program" && <ProgramView program={programFor(rank)} />}
      {view === "exercises" && <ExerciseView />}
      {view === "sequence" && <SequenceView />}

      <button onClick={onBack}
        style={{ ...tab(false), width: "100%", marginTop: 24 }}>
        BACK
      </button>
    </div>
  );
}

export default Manuscript;
