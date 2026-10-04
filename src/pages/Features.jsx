import { Fragment } from 'react';

export default function Features({ v }) {
  const { feat, ui } = v;
  return (
    <>
      <section style={{ padding: "clamp(48px,6vw,72px) clamp(16px,3vw,40px) 24px", display: "grid", gridTemplateColumns: ui.c48, gap: "clamp(16px,4vw,48px)", alignItems: "end" }}>
        <h1 style={{ margin: "0", fontSize: "clamp(32px,3.4vw,50px)", lineHeight: "1.02", fontWeight: "650", fontStretch: "104%", letterSpacing: "-.02em" }}>Features</h1>
        <p style={{ margin: "0", fontSize: "16px", lineHeight: "1.6", color: "#3A342D", maxWidth: "620px" }}>Every feature, listed plainly. Filter by module or by plan to see exactly what you'd get.</p>
      </section>
      <section style={{ padding: "0 clamp(16px,3vw,40px) clamp(56px,7vw,88px)" }}>
        <div style={{ position: "sticky", top: "64px", zIndex: "5", background: "#F6F2EA", padding: "12px 0", borderBottom: "1px solid #D9D0C2", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <input className="fc-9" value={feat.q} onChange={feat.setQ} placeholder="Search features, e.g. erasure, labels, IMEI" style={{ flex: "1 1 280px", height: "40px", padding: "0 12px", border: "1px solid #D9D0C2", borderRadius: "2px", background: "#FFFFFF", fontSize: "14px", color: "#16130F", outline: "none" }} />
            <select value={feat.plan} onChange={feat.setPlan} style={{ height: "40px", padding: "0 10px", border: "1px solid #D9D0C2", borderRadius: "2px", background: "#FFFFFF", fontSize: "14px", color: "#16130F" }}>
              {" "}
              <option>Any plan</option>
              <option>Included in Bench</option>
              <option>Included in Shop</option>
              <option>Included in Network</option>
              {" "}
            </select>
          </div>
          <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "2px", scrollbarWidth: "none" }}>
            {feat.mods.map((m, j) => (
              <button key={j} onClick={m.pick} style={{ flex: "none", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: "4px", height: "32px", padding: "0 10px", borderRadius: "2px", border: `1px solid ${m.bd}`, background: m.bg, color: m.fg, fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>
                <span>{m.t}</span>{" "}
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "11px", opacity: ".7" }}><span>{m.n}</span></span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: "760px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "130px 1.2fr 2fr 84px 84px 84px", gap: "12px", height: "40px", alignItems: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: "11px", letterSpacing: ".06em", textTransform: "uppercase", color: "#6B6257", borderBottom: "1px solid #16130F" }}>
              <span>Module</span>
              <span>Feature</span>
              <span>What it does</span>
              <span>Bench</span>
              <span>Shop</span>
              <span>Network</span>
            </div>
            {" "}
            {feat.rows.map((r, j) => (
              <Fragment key={j}>
                {" "}
                <div className="hv-1" style={{ display: "grid", gridTemplateColumns: "130px 1.2fr 2fr 84px 84px 84px", gap: "12px", padding: "12px 0", alignItems: "baseline", borderBottom: "1px solid #EDE7DC", fontSize: "14px" }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "11.5px", color: "#6B6257" }}><span>{r.m}</span></span>
                  <span style={{ fontWeight: "600" }}><span>{r.f}</span></span>
                  <span style={{ color: "#3A342D", lineHeight: "1.45" }}><span>{r.d}</span></span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "12px", color: r.c0 }}><span>{r.v0}</span></span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "12px", color: r.c1 }}><span>{r.v1}</span></span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "12px", color: r.c2 }}><span>{r.v2}</span></span>
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
            <div style={{ padding: "40px 0", borderBottom: "1px solid #D9D0C2", display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-start" }}>
              <span style={{ fontSize: "17px", fontWeight: "600" }}>No features match “<span>{feat.q}</span>”</span>
              <span style={{ fontSize: "14px", color: "#3A342D" }}>Try a broader term, or ask us whether it's on the roadmap.</span>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={feat.clear} style={{ height: "36px", padding: "0 14px", border: "1px solid #16130F", background: "transparent", borderRadius: "2px", fontSize: "13px", fontWeight: "600", cursor: "pointer", color: "#16130F" }}>Clear filters</button>
                <a href="#/contact" style={{ height: "36px", display: "inline-flex", alignItems: "center", fontSize: "13px", fontWeight: "600", color: "#16130F" }}>Ask sales</a>
              </div>
            </div>
            {" "}
          </>
        ) : null}
        {" "}
        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", paddingTop: "16px", fontFamily: "'JetBrains Mono',monospace", fontSize: "12px", color: "#6B6257" }}>
          <span>{"Showing "}<span>{feat.count}</span>{" of "}<span>{feat.total}</span>{" features"}</span>
          <a href="#/pricing" style={{ color: "#C2470A" }}>Compare plan prices →</a>
        </div>
      </section>
    </>
  );
}
