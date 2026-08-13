// ─────────────────────────────────────────────────────────────
// THE CODEX · COMPOSITION ROOT
//
// This file wires the layers together and does nothing else.
// The dependency rule points inward:
//
//     ui  →  usecases  →  domain
//     ui  →  adapters  →  (the outside world)
//
// domain/    knows nothing. Pure rules. Testable with node, no browser.
// usecases/  orchestrates the domain. Still pure.
// adapters/  the only place that touches persistence. Swap for Firebase here.
// ui/        React. Knows about the layers below; they know nothing of it.
// ─────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";

import { storage } from "./data/repositories/LocalStorageRepository.js";
import { CORE_TESTS } from "./domain/entities/Trial.js";
import { RANKS } from "./domain/entities/Rank.js";
import { programFor } from "./data/repositories/LocalProgramRepository.js";
import { todaysSession } from "./domain/useCases/GetSession.js";
import { emptyRecord, addSession, addOrderHeld } from "./domain/entities/Record.js";
import { defaultOrders, toggleOrder, ordersHeldToday } from "./domain/entities/StandingOrder.js";
import { roomComplete, overallRank, theWall } from "./domain/useCases/ScoreAssessment.js";

import { BLACK, LIGHT, GRAY, LINE } from "./design/uiKit.js";
import {
  SplashScreen, TestListScreen, TestScreen, ResultsScreen,
} from "./presentation/screens/AssessmentScreens.jsx";
import { GroundScreen, SessionScreen } from "./presentation/screens/TrainingScreens.jsx";
import ProfileScreen from "./presentation/screens/ProfileScreen.jsx";
import OrdersScreen from "./presentation/screens/OrdersScreen.jsx";

export default function App() {
  const [results, setResults] = useState(() => storage.loadResults());
  const [record, setRecord]   = useState(() => storage.loadRecord() || emptyRecord());
  const [ground, setGround]   = useState(() => storage.loadGround());
  const [startDate, setStart] = useState(() => storage.loadStart());
  const [orders, setOrders]   = useState(() => storage.loadOrders());
  const [held, setHeld]       = useState(() => ordersHeldToday(storage.loadHeld()));

  const hasStanding = roomComplete(results);
  const [screen, setScreen]   = useState(hasStanding ? "profile" : "splash");
  const [current, setCurrent] = useState(0);

  const rankName = RANKS[overallRank(results)];

  // Today's prescribed session, from the program for your current rank.
  // No program for that rank yet, or a seventh day — both come back as rest.
  const session = todaysSession(programFor(rankName), startDate);

  // persist results as they come in
  useEffect(() => { storage.saveResults(results); }, [results]);

  // the clock starts the moment the Room gives you a standing
  useEffect(() => {
    if (roomComplete(results) && !startDate) {
      const iso = new Date().toISOString();
      setStart(iso);
      storage.saveStart(iso);
    }
  }, [results, startDate]);

  // issue standing orders — aimed at the wall, once there is a wall to aim at
  useEffect(() => {
    if (roomComplete(results) && !orders) {
      const o = defaultOrders(theWall(results), results);
      setOrders(o);
      storage.saveOrders(o);
    }
  }, [results, orders]);

  const recordTrial = useCallback((value) => {
    setResults(r => ({ ...r, [CORE_TESTS[current].id]: value }));
    setScreen("list");
  }, [current]);

  const completeSession = useCallback(() => {
    const next = addSession(record);      // the Record only ever counts up
    setRecord(next);
    storage.saveRecord(next);
    setScreen("profile");
  }, [record]);

  const holdOrder = useCallback((id) => {
    const wasHeld = (held?.ids || []).includes(id);
    const next = toggleOrder(held, id);
    setHeld(next);
    storage.saveHeld(next);
    if (!wasHeld) {                        // a mark, only when newly held
      const rec = addOrderHeld(record);
      setRecord(rec);
      storage.saveRecord(rec);
    }
  }, [held, record]);

  const saveOrders = useCallback((o) => {
    setOrders(o);
    storage.saveOrders(o);
  }, []);

  const resetAll = useCallback(() => {
    storage.clearAll();
    setResults({});
    setRecord(emptyRecord());
    setGround(null);
    setStart(null);
    setOrders(null);
    setHeld(ordersHeldToday(null));
    setScreen("list");
  }, []);

  return (
    <div style={{
      minHeight: "100vh", maxWidth: 430, margin: "0 auto",
      background: BLACK, color: LIGHT,
      fontFamily: "'Cormorant Garamond', Georgia, serif",
    }}>
      {screen === "splash" && (
        <SplashScreen onStart={() => setScreen("list")} />
      )}

      {screen === "list" && (
        <TestListScreen
          results={results}
          onSelect={(i) => { setCurrent(i); setScreen("test"); }}
          onViewResults={() => setScreen("results")} />
      )}

      {screen === "test" && (
        <TestScreen
          test={CORE_TESTS[current]}
          index={current}
          onComplete={recordTrial}
          onBack={() => setScreen("list")} />
      )}

      {screen === "results" && (
        <ResultsScreen
          results={results}
          onRestart={resetAll}
          onViewProgress={() => setScreen("profile")} />
      )}

      {screen === "profile" && (
        <ProfileScreen
          results={results}
          startDate={startDate}
          record={record}
          ground={ground}
          orders={orders || []}
          held={held}
          onBack={() => setScreen(hasStanding ? "list" : "results")}
          onRestart={resetAll}
          onOrders={() => setScreen("orders")}
          onTrain={() => setScreen(ground ? "session" : "ground")} />
      )}

      {screen === "ground" && (
        <GroundScreen onDone={(g) => {
          storage.saveGround(g);
          setGround(g);
          setScreen("session");
        }} />
      )}

      {screen === "session" && !session.rest && (
        <SessionScreen
          session={{ ...session, rank: rankName }}
          onBack={() => setScreen("profile")}
          onComplete={completeSession} />
      )}

      {screen === "session" && session.rest && (
        <div style={{ padding: 32, textAlign: "center", color: LIGHT }}>
          <div style={{ fontSize: 12, letterSpacing: "0.3em", color: GRAY, marginBottom: 12 }}>
            WEEK {session.week} &middot; DAY {session.dayNumber}
          </div>
          <h2 style={{ fontSize: 26, letterSpacing: "0.1em", marginBottom: 16 }}>REST</h2>
          <p style={{ color: GRAY, maxWidth: 320, margin: "0 auto 28px", lineHeight: 1.6 }}>
            Complete rest, or gentle Surya Namaskar &mdash; five rounds only.
            Recovery is where strength is built.
          </p>
          <button onClick={() => setScreen("profile")}
            style={{ border: `1px solid ${LINE}`, color: LIGHT, padding: "12px 28px",
                     minHeight: 44, letterSpacing: "0.14em", background: "none" }}>
            BACK
          </button>
        </div>
      )}

      {screen === "orders" && (
        <OrdersScreen
          orders={orders || []}
          held={held}
          rank={rankName}
          onToggle={holdOrder}
          onSave={saveOrders}
          onBack={() => setScreen("profile")} />
      )}
    </div>
  );
}
