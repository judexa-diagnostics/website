import { Fragment } from 'react';

export default function Industries({ v }) {
  const { goTrial, ind, ui } = v;
  return (
    <>
      <section style={{ padding: "clamp(3rem,6vw,5rem) clamp(1rem,3vw,2.5rem) 2rem", display: "grid", gridTemplateColumns: ui.c48, gap: "clamp(1rem,4vw,3rem)", borderBottom: "2px solid #16130F" }}>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", letterSpacing: ".02em", color: "#6B6257", paddingTop: "0.625rem" }}>Industries · 5 segments</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
          <h1 style={{ margin: "0", fontSize: "clamp(2rem,3.4vw,3.125rem)", lineHeight: "1.04", fontWeight: "650", fontStretch: "104%", letterSpacing: "-.02em", textWrap: "balance", maxWidth: "56.25rem" }}>Built for every business that buys, fixes or resells devices.</h1>
          <p style={{ margin: "0", fontSize: "1.0625rem", lineHeight: "1.6", color: "#3A342D", maxWidth: "40rem" }}>
            The same system runs a single repair counter or a 40-store network. You move up a plan as your volume grows, and every price is published.
          </p>
        </div>
      </section>
      <section style={{ display: "grid", gridTemplateColumns: ui.c39, padding: "0 clamp(1rem,3vw,2.5rem)" }}>
        <aside style={{ display: ui.wideBlock, borderRight: "1px solid #D9D0C2" }}>
          <div style={{ position: "sticky", top: "5.5rem", padding: "1.5rem 1.5rem 1.5rem 0", display: "flex", flexDirection: "column" }}>
            {ind.nav.map((n, j) => (
              <a key={j} href={n.href} onClick={n.go} style={{ display: "grid", gridTemplateColumns: "1.75rem 1fr", padding: "0.75rem 0", borderBottom: "1px solid #EDE7DC", textDecoration: "none", color: n.fg, fontSize: "0.9375rem", fontWeight: n.fw }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", color: n.num, paddingTop: "2px" }}><span>{n.k}</span></span>
                <span><span>{n.name}</span></span>
              </a>
            ))}
            <a href="#/pricing" style={{ marginTop: "1.25rem", fontSize: "0.875rem", fontWeight: "600", color: "#16130F", textDecoration: "none", borderBottom: "1px solid #16130F", alignSelf: "start", paddingBottom: "2px" }}>See transparent pricing →</a>
          </div>
        </aside>
        <div>
          {ind.panels.map((p, j) => (
            <Fragment key={j}>
              {" "}
              <article data-ind={p.k} style={{ minHeight: "78vh", padding: "clamp(2rem,5vw,4rem) 0 clamp(2rem,5vw,4rem) clamp(0px,3vw,3rem)", borderBottom: "1px solid #D9D0C2", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,20rem),1fr))", gap: "clamp(1.5rem,4vw,3rem)", alignContent: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", letterSpacing: ".02em", color: "#C2470A" }}><span>{p.k}</span>{" · "}<span>{p.name}</span></div>
                  <h2 style={{ margin: "0", fontSize: "clamp(1.625rem,2.5vw,2.25rem)", lineHeight: "1.08", fontWeight: "600", fontStretch: "102%", letterSpacing: "-.01em", textWrap: "balance" }}><span>{p.h}</span></h2>
                  <p style={{ margin: "0", fontSize: "1rem", lineHeight: "1.6", color: "#3A342D", textWrap: "pretty" }}><span>{p.b}</span></p>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap", marginTop: "0.375rem" }}>
                    <button className="hv-2" onClick={goTrial} style={{ height: "2.5rem", padding: "0 1rem", background: "#EB5E12", color: "#16130F", border: "0", borderRadius: "2px", fontSize: "0.875rem", fontWeight: "600", cursor: "pointer" }}>Join now</button>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.75rem", color: "#3A342D" }}>{"Usually starts on "}<strong><span>{p.plan}</span></strong></span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", letterSpacing: ".02em", color: "#6B6257", paddingBottom: "0.5rem", borderBottom: "1px solid #16130F" }}>Your workflow in InPhox</div>
                    {" "}
                    {p.flow.map((f, j) => (
                      <Fragment key={j}>
                        {" "}
                        <div style={{ display: "grid", gridTemplateColumns: "2rem 1fr", padding: "0.625rem 0", borderBottom: "1px solid #EDE7DC", fontSize: "0.9375rem" }}>
                          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.75rem", color: "#6B6257" }}><span>{f.n}</span></span>
                          <span><span>{f.t}</span></span>
                        </div>
                        {" "}
                      </Fragment>
                    ))}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                    {p.mods.map((m, j) => (
                      <span key={j} style={{ height: "1.75rem", padding: "0 0.625rem", display: "inline-flex", alignItems: "center", border: "1px solid #D9D0C2", borderRadius: "2px", fontSize: "0.78125rem", fontWeight: "500", background: "#FFFFFF" }}><span>{m.t}</span></span>
                    ))}
                  </div>
                </div>
              </article>
              {" "}
            </Fragment>
          ))}
        </div>
      </section>
      <section style={{ padding: "clamp(3.5rem,7vw,6rem) clamp(1rem,3vw,2.5rem)", borderTop: "2px solid #16130F" }}>
        <div style={{ display: "grid", gridTemplateColumns: ui.c48, gap: "clamp(1rem,4vw,3rem)", marginBottom: "2rem" }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", letterSpacing: ".02em", color: "#6B6257", paddingTop: "0.5rem" }}>Scales with you</div>
          <h2 style={{ margin: "0", fontSize: "clamp(1.625rem,2.5vw,2.25rem)", lineHeight: "1.08", fontWeight: "600", fontStretch: "102%", textWrap: "balance", maxWidth: "47.5rem" }}>Start at one bench. The system and the price grow in steps you can see in advance.</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(13.75rem,1fr))", borderTop: "1px solid #16130F" }}>
          {ind.ladder.map((l, j) => (
            <div key={j} style={{ padding: "1.125rem 1.25rem 1.375rem 0", borderBottom: "1px solid #D9D0C2", display: "flex", flexDirection: "column", gap: "0.5rem", marginRight: "1.25rem" }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.75rem", color: "#6B6257" }}><span>{l.k}</span></span>
              <span style={{ fontSize: "1.1875rem", fontWeight: "600", fontStretch: "102%" }}><span>{l.t}</span></span>
              <span style={{ fontSize: "0.875rem", lineHeight: "1.5", color: "#3A342D" }}><span>{l.d}</span></span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.75rem", marginTop: "0.25rem" }}><span>{l.p}</span></span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "1.75rem", display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
          <a className="hv-8" href="#/pricing" style={{ height: "2.75rem", padding: "0 1.125rem", display: "inline-flex", alignItems: "center", background: "#16130F", color: "#F6F2EA", borderRadius: "2px", fontSize: "0.875rem", fontWeight: "600", textDecoration: "none" }}>Compare plans</a>
          <a className="hv-3" href="#/contact" style={{ height: "2.75rem", padding: "0 1.125rem", display: "inline-flex", alignItems: "center", border: "1px solid #16130F", color: "#16130F", borderRadius: "2px", fontSize: "0.875rem", fontWeight: "600", textDecoration: "none" }}>Talk to sales</a>
        </div>
      </section>
    </>
  );
}
