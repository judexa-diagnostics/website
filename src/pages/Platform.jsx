import { Fragment } from 'react';

export default function Platform({ v }) {
  const { plat, rec, ui } = v;
  return (
    <>
      <section style={{ padding: "clamp(3rem,6vw,5rem) clamp(1rem,3vw,2.5rem) 0" }}>
        <h1 style={{ margin: "0", fontSize: "clamp(2rem,3.6vw,3.375rem)", lineHeight: "1.02", fontWeight: "650", fontStretch: "104%", letterSpacing: "-.02em", textWrap: "balance", maxWidth: "66.25rem" }}>One record per device, shared with every tool you already run.</h1>
      </section>
      <section style={{ padding: "2rem clamp(1rem,3vw,2.5rem) 0" }}>
        <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", paddingBottom: "1rem", borderBottom: "1px solid #16130F" }}>
          {plat.cats.map((c, j) => (
            <button key={j} onClick={c.pick} style={{ height: "2rem", padding: "0 0.625rem", borderRadius: "2px", border: `1px solid ${c.bd}`, background: c.bg, color: c.fg, fontSize: "0.8125rem", fontWeight: "500", cursor: "pointer" }}><span>{c.t}</span></button>
          ))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "0.25rem 0", padding: "1.5rem 0 1.75rem", borderBottom: "1px solid #D9D0C2" }}>
          {plat.items.map((i, j) => (
            <span key={j} style={{ display: "inline-flex", alignItems: "baseline", gap: "0.375rem", paddingRight: "1.125rem", fontSize: "clamp(1.5rem,3vw,2.75rem)", lineHeight: "1.15", fontWeight: "600", fontStretch: "104%", letterSpacing: "-.015em", color: i.fg, transition: "color 300ms" }}>
              <span>{i.n}</span>
              <sup style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.625rem", fontWeight: "500", letterSpacing: ".04em", color: i.sc, fontStretch: "100%" }}><span>{i.s}</span></sup>
              <span style={{ color: "#D9D0C2", fontWeight: "400" }}>/</span>
            </span>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: ui.c48, gap: "clamp(1rem,4vw,3rem)", padding: "1.5rem 0" }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", color: "#6B6257", lineHeight: "1.6" }}>LIVE = available today<br />IN DEV = being built, not yet available</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", maxWidth: "45rem" }}>
            <p style={{ margin: "0", fontSize: "1.0625rem", lineHeight: "1.6", color: "#3A342D" }}>
              Diagnostics apps, marketplaces, carriers and accounting software each keep their own copy of a device. InPhox keeps the original record, which is the IMEI and everything that has happened to it, and syncs the parts each tool needs.
            </p>
            {plat.more ? (
              <>
                <p style={{ margin: "0", fontSize: "1rem", lineHeight: "1.6", color: "#3A342D" }}>
                  When a marketplace order comes in, the device reserves itself, a label is created with the carrier, and the sale posts to your books. If a buyer opens a return, the device comes back into the test-and-grade flow with its full history intact.
                </p>
                <p style={{ margin: "0", fontSize: "1rem", lineHeight: "1.6", color: "#3A342D" }}>
                  We only mark an integration Live when it works today. If you need one that isn't listed, tell us. Customer requests decide what we build next.
                </p>
              </>
            ) : null}
            <button onClick={plat.toggle} style={{ alignSelf: "flex-start", height: "2.25rem", padding: "0 2px", background: "transparent", border: "0", borderBottom: "1px solid #16130F", fontSize: "0.875rem", fontWeight: "600", cursor: "pointer", color: "#16130F" }}><span>{plat.moreLabel}</span></button>
          </div>
        </div>
      </section>
      <section style={{ padding: "clamp(3rem,6vw,5rem) clamp(1rem,3vw,2.5rem) clamp(3.5rem,7vw,6rem)", borderTop: "2px solid #16130F" }}>
        <div style={{ display: "grid", gridTemplateColumns: ui.c48, gap: "clamp(1rem,4vw,3rem)", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            <h2 style={{ margin: "0", fontSize: "clamp(1.5rem,2.3vw,2rem)", lineHeight: "1.1", fontWeight: "600", fontStretch: "102%", textWrap: "balance" }}>Every scan, test, repair and sale, in order.</h2>
            <p style={{ margin: "0", fontSize: "0.9375rem", lineHeight: "1.6", color: "#3A342D" }}>
              This is the audit trail buyers, insurers and compliance teams ask for, built as a side effect of normal work.
            </p>
          </div>
          <div style={{ background: "#FFFFFF", border: "1px solid #D9D0C2", borderRadius: "0.25rem", overflow: "hidden", minWidth: "0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap", padding: "0.875rem 1rem", borderBottom: "1px solid #D9D0C2" }}>
              <div>
                <div style={{ fontSize: "1.0625rem", fontWeight: "600", fontStretch: "100%" }}>iPhone 14 Pro · 256 GB · Deep Purple</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.75rem", color: "#6B6257" }}>IMEI 356798114520349 · SN F2LXK9QWPLJ7</div>
              </div>
              <span style={{ alignSelf: "center", padding: "0.1875rem 0.5rem", borderRadius: "2px", background: "#E3F1E8", color: "#1E7A4A", fontSize: "0.75rem", fontWeight: "600" }}>Sold · shipped</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <div style={{ minWidth: "40rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "7.5rem 1.6fr 1fr 5.625rem 1fr", gap: "0.625rem", padding: "0 1rem", height: "2rem", alignItems: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65625rem", letterSpacing: ".06em", textTransform: "uppercase", color: "#6B6257", borderBottom: "1px solid #D9D0C2" }}>
                  <span>Time</span>
                  <span>Event</span>
                  <span>Source</span>
                  <span>User</span>
                  <span>Location</span>
                </div>
                {" "}
                {rec.map((r, j) => (
                  <Fragment key={j}>
                    {" "}
                    <div style={{ display: "grid", gridTemplateColumns: "7.5rem 1.6fr 1fr 5.625rem 1fr", gap: "0.625rem", padding: "0 1rem", minHeight: "2.375rem", alignItems: "center", fontSize: "0.8125rem", borderBottom: "1px solid #EDE7DC" }}>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.71875rem", color: "#3A342D" }}><span>{r.t}</span></span>
                      <span style={{ fontWeight: "500" }}><span>{r.e}</span></span>
                      <span style={{ color: "#3A342D" }}><span>{r.s}</span></span>
                      <span style={{ color: "#3A342D" }}><span>{r.u}</span></span>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.71875rem" }}><span>{r.l}</span></span>
                    </div>
                    {" "}
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
