import { Fragment } from 'react';

export default function Industries({ v }) {
  const { goTrial, ind, ui } = v;
  return (
    <>
      <section style={{ padding: "clamp(48px,6vw,80px) clamp(16px,3vw,40px) 32px", display: "grid", gridTemplateColumns: ui.c48, gap: "clamp(16px,4vw,48px)", borderBottom: "2px solid #16130F" }}>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "11px", letterSpacing: ".02em", color: "#6B6257", paddingTop: "10px" }}>Industries · 5 segments</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <h1 style={{ margin: "0", fontSize: "clamp(32px,3.4vw,50px)", lineHeight: "1.04", fontWeight: "650", fontStretch: "104%", letterSpacing: "-.02em", textWrap: "balance", maxWidth: "900px" }}>Built for every business that buys, fixes or resells devices.</h1>
          <p style={{ margin: "0", fontSize: "17px", lineHeight: "1.6", color: "#3A342D", maxWidth: "640px" }}>
            The same system runs a single repair counter or a 40-store network. You add modules and locations as you grow, and prices are published and charged per month.
          </p>
        </div>
      </section>
      <section style={{ display: "grid", gridTemplateColumns: ui.c39, padding: "0 clamp(16px,3vw,40px)" }}>
        <aside style={{ display: ui.wideBlock, borderRight: "1px solid #D9D0C2" }}>
          <div style={{ position: "sticky", top: "88px", padding: "24px 24px 24px 0", display: "flex", flexDirection: "column" }}>
            {ind.nav.map((n, j) => (
              <a key={j} href={n.href} onClick={n.go} style={{ display: "grid", gridTemplateColumns: "28px 1fr", padding: "12px 0", borderBottom: "1px solid #EDE7DC", textDecoration: "none", color: n.fg, fontSize: "15px", fontWeight: n.fw }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "11px", color: n.num, paddingTop: "2px" }}><span>{n.k}</span></span>
                <span><span>{n.name}</span></span>
              </a>
            ))}
            <a href="#/pricing" style={{ marginTop: "20px", fontSize: "14px", fontWeight: "600", color: "#16130F", textDecoration: "none", borderBottom: "1px solid #16130F", alignSelf: "start", paddingBottom: "2px" }}>See transparent pricing →</a>
          </div>
        </aside>
        <div>
          {ind.panels.map((p, j) => (
            <Fragment key={j}>
              {" "}
              <article data-ind={p.k} style={{ minHeight: "78vh", padding: "clamp(32px,5vw,64px) 0 clamp(32px,5vw,64px) clamp(0px,3vw,48px)", borderBottom: "1px solid #D9D0C2", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))", gap: "clamp(24px,4vw,48px)", alignContent: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "11px", letterSpacing: ".02em", color: "#C2470A" }}><span>{p.k}</span>{" · "}<span>{p.name}</span></div>
                  <h2 style={{ margin: "0", fontSize: "clamp(26px,2.5vw,36px)", lineHeight: "1.08", fontWeight: "600", fontStretch: "102%", letterSpacing: "-.01em", textWrap: "balance" }}><span>{p.h}</span></h2>
                  <p style={{ margin: "0", fontSize: "16px", lineHeight: "1.6", color: "#3A342D", textWrap: "pretty" }}><span>{p.b}</span></p>
                  <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap", marginTop: "6px" }}>
                    <button className="hv-2" onClick={goTrial} style={{ height: "40px", padding: "0 16px", background: "#EB5E12", color: "#16130F", border: "0", borderRadius: "2px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>Join now</button>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "12px", color: "#3A342D" }}>{"Usually starts on "}<strong><span>{p.plan}</span></strong></span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "11px", letterSpacing: ".02em", color: "#6B6257", paddingBottom: "8px", borderBottom: "1px solid #16130F" }}>Your workflow in InPhox</div>
                    {" "}
                    {p.flow.map((f, j) => (
                      <Fragment key={j}>
                        {" "}
                        <div style={{ display: "grid", gridTemplateColumns: "32px 1fr", padding: "10px 0", borderBottom: "1px solid #EDE7DC", fontSize: "15px" }}>
                          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "12px", color: "#6B6257" }}><span>{f.n}</span></span>
                          <span><span>{f.t}</span></span>
                        </div>
                        {" "}
                      </Fragment>
                    ))}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {p.mods.map((m, j) => (
                      <span key={j} style={{ height: "28px", padding: "0 10px", display: "inline-flex", alignItems: "center", border: "1px solid #D9D0C2", borderRadius: "2px", fontSize: "12.5px", fontWeight: "500", background: "#FFFFFF" }}><span>{m.t}</span></span>
                    ))}
                  </div>
                </div>
              </article>
              {" "}
            </Fragment>
          ))}
        </div>
      </section>
      <section style={{ padding: "clamp(56px,7vw,96px) clamp(16px,3vw,40px)", borderTop: "2px solid #16130F" }}>
        <div style={{ display: "grid", gridTemplateColumns: ui.c48, gap: "clamp(16px,4vw,48px)", marginBottom: "32px" }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "11px", letterSpacing: ".02em", color: "#6B6257", paddingTop: "8px" }}>Scales with you</div>
          <h2 style={{ margin: "0", fontSize: "clamp(26px,2.5vw,36px)", lineHeight: "1.08", fontWeight: "600", fontStretch: "102%", textWrap: "balance", maxWidth: "760px" }}>Start at one bench. The system and the price grow in steps you can see in advance.</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", borderTop: "1px solid #16130F" }}>
          {ind.ladder.map((l, j) => (
            <div key={j} style={{ padding: "18px 20px 22px 0", borderBottom: "1px solid #D9D0C2", display: "flex", flexDirection: "column", gap: "8px", marginRight: "20px" }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "12px", color: "#6B6257" }}><span>{l.k}</span></span>
              <span style={{ fontSize: "19px", fontWeight: "600", fontStretch: "102%" }}><span>{l.t}</span></span>
              <span style={{ fontSize: "14px", lineHeight: "1.5", color: "#3A342D" }}><span>{l.d}</span></span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "12px", marginTop: "4px" }}><span>{l.p}</span></span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "28px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <a className="hv-8" href="#/pricing" style={{ height: "44px", padding: "0 18px", display: "inline-flex", alignItems: "center", background: "#16130F", color: "#F6F2EA", borderRadius: "2px", fontSize: "14px", fontWeight: "600", textDecoration: "none" }}>Compare plans</a>
          <a className="hv-3" href="#/contact" style={{ height: "44px", padding: "0 18px", display: "inline-flex", alignItems: "center", border: "1px solid #16130F", color: "#16130F", borderRadius: "2px", fontSize: "14px", fontWeight: "600", textDecoration: "none" }}>Talk to sales</a>
        </div>
      </section>
    </>
  );
}
