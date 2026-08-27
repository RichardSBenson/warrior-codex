import { Component } from "react";
import { BLACK, GOLD, LIGHT, GRAY, LINE } from "../../design/uiKit.js";

/**
 * A React component that throws takes the whole tree down and renders nothing.
 * On a phone that looks like a black page, with no clue what happened — which
 * is exactly how a missing import went unnoticed through several releases.
 *
 * This catches it, names it, and offers a way out.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Codex crashed:", error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div style={{ background: BLACK, minHeight: "100vh", padding: 24, color: LIGHT,
        fontFamily: "'Cormorant Garamond',serif" }}>
        <div style={{ color: GOLD, fontFamily: "'Cinzel',serif", fontSize: "0.62rem",
          letterSpacing: "0.28em", marginBottom: 8 }}>SOMETHING BROKE</div>
        <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: "1.3rem", letterSpacing: "0.08em",
          marginBottom: 12 }}>THE SCREEN DID NOT LOAD</h2>
        <p style={{ color: GRAY, lineHeight: 1.6 }}>
          Your training record is untouched — nothing is lost. This is a fault in the app,
          not in anything you did.
        </p>
        <pre style={{ background: "#141414", border: `1px solid ${LINE}`, padding: 12,
          color: "#B98F8F", fontSize: "0.72rem", overflowX: "auto", whiteSpace: "pre-wrap",
          fontFamily: "ui-monospace, monospace" }}>
          {String(this.state.error?.message || this.state.error)}
        </pre>
        <button onClick={() => window.location.reload()}
          style={{ minHeight: 44, width: "100%", marginTop: 12, background: GOLD, color: BLACK,
            border: "none", fontFamily: "'Cinzel',serif", fontSize: "0.72rem", letterSpacing: "0.14em" }}>
          RELOAD
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
