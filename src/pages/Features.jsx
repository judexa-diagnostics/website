import { Fragment } from 'react';

export default function Features({ v }) {
  const { feat, ui } = v;
  return (
    <>
      <section style={{ padding: "clamp(3rem,6vw,4.5rem) clamp(1rem,3vw,2.5rem) 1.5rem", display: "grid", gridTemplateColumns: ui.c48, gap: "clamp(1rem,4vw,3rem)", alignItems: "end" }}>
        <h1 style={{ margin: "0", fontSize: "clamp(2rem,3.4vw,3.125rem)", lineHeight: "1.02", fontWeight: "650", fontStretch: "104%", letterSpacing: "-.02em" }}>Features</h1>
        <p style={{ margin: "0", fontSize: "1rem", lineHeight: "1.6", color: "#3A342D", maxWidth: "38.75rem" }}>Every feature, listed plainly. Every plan includes all of them; plans differ in included checks, stations, staff users and support.</p>
      </section>
      <section style={{ padding: "0 clamp(1rem,3vw,2.5rem) clamp(3.5rem,7vw,5.5rem)" }}>
        <div style={{ position: "sticky", top: "4rem", zIndex: "5", background: "#F6F2EA", padding: "0.75rem 0", borderBottom: "1px solid #D9D0C2", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <input className="fc-9" value={feat.q} onChange={feat.setQ} placeholder="Search features, e.g. erasure, labels, IMEI" style={{ flex: "1 1 17.5rem", height: "2.5rem", padding: "0 0.75rem", border: "1px solid #D9D0C2", borderRadius: "2px", background: "#FFFFFF", fontSize: "0.875rem", color: "#16130F", outline: "none" }} />
          </div>
          <div style={{ display: "flex", gap: "0.375rem", overflowX: "auto", paddingBottom: "2px", scrollbarWidth: "none" }}>
            {feat.mods.map((m, j) => (
              <button key={j} onClick={m.pick} style={{ flex: "none", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: "0.25rem", height: "2rem", padding: "0 0.625rem", borderRadius: "2px", border: `1px solid ${m.bd}`, background: m.bg, color: m.fg, fontSize: "0.8125rem", fontWeight: "500", cursor: "pointer" }}>
                <span>{m.t}</span>{" "}
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", opacity: ".7" }}><span>{m.n}</span></span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: "37.5rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "8.125rem 1.2fr 2fr", gap: "0.75rem", height: "2.5rem", alignItems: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", letterSpacing: ".06em", textTransform: "uppercase", color: "#6B6257", borderBottom: "1px solid #16130F" }}>
              <span>Module</span>
              <span>Feature</span>
              <span>What it does</span>
            </div>
            {" "}
            {feat.rows.map((r, j) => (
              <Fragment key={j}>
                {" "}
                <div className="hv-1" style={{ display: "grid", gridTemplateColumns: "8.125rem 1.2fr 2fr", gap: "0.75rem", padding: "0.75rem 0", alignItems: "baseline", borderBottom: "1px solid #EDE7DC", fontSize: "0.875rem" }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.71875rem", color: "#6B6257" }}><span>{r.m}</span></span>
                  <span style={{ fontWeight: "600" }}><span>{r.f}</span></span>
                  <span style={{ color: "#3A342D", lineHeight: "1.45" }}><span>{r.d}</span></span>
                </div>
                {" "}
              </Fragment>
            ))}
          </div>
        </div>
        {" "}
        {feat.empty ? (
          <>
            {" "}
            <div style={{ padding: "2.5rem 0", borderBottom: "1px solid #D9D0C2", display: "flex", flexDirection: "column", gap: "0.625rem", alignItems: "flex-start" }}>
              <span style={{ fontSize: "1.0625rem", fontWeight: "600" }}>No features match “<span>{feat.q}</span>”</span>
              <span style={{ fontSize: "0.875rem", color: "#3A342D" }}>Try a broader term, or ask us whether it's on the roadmap.</span>
              <div style={{ display: "flex", gap: "0.625rem" }}>
                <button onClick={feat.clear} style={{ height: "2.25rem", padding: "0 0.875rem", border: "1px solid #16130F", background: "transparent", borderRadius: "2px", fontSize: "0.8125rem", fontWeight: "600", cursor: "pointer", color: "#16130F" }}>Clear filters</button>
                <a href="#/contact" style={{ height: "2.25rem", display: "inline-flex", alignItems: "center", fontSize: "0.8125rem", fontWeight: "600", color: "#16130F" }}>Ask sales</a>
              </div>
            </div>
            {" "}
          </>
        ) : null}
        {" "}
        <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap", paddingTop: "1rem", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.75rem", color: "#6B6257" }}>
          <span>{"Showing "}<span>{feat.count}</span>{" of "}<span>{feat.total}</span>{" features"}</span>
          <a href="#/pricing" style={{ color: "#C2470A" }}>Compare plan prices →</a>
        </div>
      </section>
    </>
  );
}
