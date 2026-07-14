import { useState } from "react";
import {
  GOLD, DARK_GOLD, LIGHT, GRAY, LINE, BLACK, PANEL,
  btn, panel, label, serif,
} from "../theme.js";
import { makeOrder, ORDERS_CREED } from "../../domain/orders.js";

// ─────────────────────────────────────────────────────────────
// UI · STANDING ORDERS
//
// A warrior does not train for one hour and sit for eight.
// The Codex issues orders by rank; the warrior may rewrite them. They are his.
// Held or not held. No streak. No debt. Each one held is a mark on the Record.
// ─────────────────────────────────────────────────────────────
export default function OrdersScreen({ orders, held, rank, onToggle, onSave, onBack }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(orders);

  const heldIds = held?.ids || [];
  const heldCount = orders.filter(o => heldIds.includes(o.id)).length;

  function updateDraft(i, field, value) {
    setDraft(d => d.map((o, idx) => (idx === i ? { ...o, [field]: value } : o)));
  }
  function addRow() {
    setDraft(d => [...d, makeOrder({ movement: "", amount: "", time: "" })]);
  }
  function removeRow(i) {
    setDraft(d => d.filter((_, idx) => idx !== i));
  }
  function commit() {
    const clean = draft.filter(o => o.movement.trim() && o.amount.trim());
    onSave(clean);
    setDraft(clean);
    setEditing(false);
  }

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "2rem" }}>
      {/* header */}
      <div style={{ padding: "1.3rem 1.2rem 1rem", borderBottom: `1px solid ${LINE}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: GOLD,
            fontSize: "1.2rem", cursor: "pointer" }}>←</button>
          <div style={{ flex: 1 }}>
            <div style={{ ...label }}>{rank.toUpperCase()}</div>
            <div style={{ color: GOLD, fontSize: "1.35rem", fontFamily: "'Cinzel',serif",
              letterSpacing: "0.08em" }}>STANDING ORDERS</div>
          </div>
          {!editing && (
            <button onClick={() => { setDraft(orders); setEditing(true); }}
              style={{ ...btn.ghost, width: "auto" }}>EDIT</button>
          )}
        </div>
        <div style={{ ...serif, color: LIGHT, fontSize: "0.92rem", marginTop: 10, lineHeight: 1.5 }}>
          Small work, through the day. The hour-long session is a modern invention —
          the pehlwan trained morning and evening, and the monk held his stance between duties.
        </div>
        {!editing && (
          <div style={{ color: GOLD, fontSize: "0.72rem", marginTop: 8, ...serif }}>
            {heldCount} of {orders.length} held today
          </div>
        )}
      </div>

      {/* the orders */}
      <div style={{ padding: "1rem" }}>
        {editing ? (
          <>
            {draft.map((o, i) => (
              <div key={o.id} style={{ ...panel, marginBottom: 8, display: "flex", gap: 6,
                alignItems: "center" }}>
                <input value={o.movement} placeholder="Push-Ups"
                  onChange={e => updateDraft(i, "movement", e.target.value)}
                  style={{ ...inputSm, flex: 2 }} />
                <input value={o.amount} placeholder="20 reps"
                  onChange={e => updateDraft(i, "amount", e.target.value)}
                  style={{ ...inputSm, flex: 1.3 }} />
                <input value={o.time} placeholder="11:40"
                  onChange={e => updateDraft(i, "time", e.target.value)}
                  style={{ ...inputSm, flex: 1 }} />
                <button onClick={() => removeRow(i)} style={{ background: "none", border: "none",
                  color: GRAY, fontSize: "1.1rem", cursor: "pointer", padding: "0 4px" }}>×</button>
              </div>
            ))}
            <button onClick={addRow} style={{ ...btn.ghost, width: "100%", marginTop: 4 }}>
              + ADD AN ORDER
            </button>
            <button onClick={commit} style={{ ...btn.gold, marginTop: 12 }}>
              THESE ARE MY ORDERS
            </button>
          </>
        ) : (
          <>
            {orders.map(o => {
              const isHeld = heldIds.includes(o.id);
              return (
                <button key={o.id} onClick={() => onToggle(o.id)}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 12,
                    background: PANEL, border: `1px solid ${isHeld ? DARK_GOLD : LINE}`,
                    borderRadius: 8, padding: "13px 14px", marginBottom: 8, cursor: "pointer",
                    textAlign: "left", opacity: isHeld ? 0.75 : 1 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 5,
                    border: `1px solid ${isHeld ? GOLD : LINE}`,
                    background: isHeld ? GOLD : "transparent", color: BLACK,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.8rem" }}>
                    {isHeld ? "✓" : ""}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ ...serif, color: LIGHT, fontSize: "1.02rem", fontWeight: 600 }}>
                      {o.movement}
                    </div>
                    <div style={{ color: GRAY, fontSize: "0.7rem" }}>{o.amount}</div>
                  </div>
                  <div style={{ color: isHeld ? GOLD : GRAY, fontSize: "0.85rem",
                    fontFamily: "'Cinzel',serif" }}>{o.time}</div>
                </button>
              );
            })}
            <p style={{ ...serif, color: GRAY, fontSize: "0.72rem", textAlign: "center",
              marginTop: 14, lineHeight: 1.6, fontStyle: "italic" }}>
              {ORDERS_CREED}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

const inputSm = {
  padding: "8px 9px", background: BLACK, border: `1px solid ${LINE}`, borderRadius: 5,
  color: LIGHT, fontSize: "0.82rem", fontFamily: "'Cormorant Garamond',serif",
  outline: "none", minWidth: 0, boxSizing: "border-box",
};
