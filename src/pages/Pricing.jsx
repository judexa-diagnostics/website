import { Fragment } from 'react';

export default function Pricing({ v }) {
  const { pr, ui } = v;
  return (
    <>
      <section style={{ padding: "clamp(3rem,6vw,4.5rem) clamp(1rem,3vw,2.5rem) 1.75rem", display: "grid", gridTemplateColumns: ui.c48, gap: "clamp(1rem,4vw,3rem)", alignItems: "end" }}>
        <h1 style={{ margin: "0", fontSize: "clamp(2rem,3.4vw,3.125rem)", lineHeight: "1.02", fontWeight: "650", fontStretch: "104%", letterSpacing: "-.02em" }}>Pricing</h1>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: "1.25rem", flexWrap: "wrap" }}>
          <p style={{ margin: "0", fontSize: "1rem", lineHeight: "1.6", color: "#3A342D", maxWidth: "35rem" }}>
            Three bundles priced per month. Scroll down to build your own from individual services, or talk to sales if you have more than 10 locations.
          </p>
          <div style={{ display: "flex", border: "1px solid #16130F", borderRadius: "2px", overflow: "hidden", flex: "none" }}>
            <button onClick={pr.monthly} style={{ height: "2.25rem", padding: "0 0.875rem", border: "0", background: pr.mBg, color: pr.mFg, fontSize: "0.8125rem", fontWeight: "600", cursor: "pointer" }}>Monthly</button>
            <button onClick={pr.yearly} style={{ height: "2.25rem", padding: "0 0.875rem", border: "0", borderLeft: "1px solid #16130F", background: pr.yBg, color: pr.yFg, fontSize: "0.8125rem", fontWeight: "600", cursor: "pointer" }}>Annual · save 15%</button>
          </div>
        </div>
      </section>
      <section style={{ padding: "0 clamp(1rem,3vw,2.5rem)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,17.5rem),1fr))", borderTop: "2px solid #16130F", borderBottom: "1px solid #D9D0C2" }}>
          {pr.tiers.map((t, j) => (
            <div key={j} style={{ padding: "1.5rem 1.5rem 1.75rem", borderRight: "1px solid #D9D0C2", background: t.bg, display: "flex", flexDirection: "column", gap: "1rem", boxShadow: `inset 0 0.1875rem 0 ${t.top}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.375rem", fontWeight: "650", fontStretch: "104%" }}><span>{t.name}</span></span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65625rem", letterSpacing: ".06em", textTransform: "uppercase", color: "#C2470A" }}><span>{t.tag}</span></span>
              </div>
              <span style={{ fontSize: "0.875rem", color: "#3A342D", minHeight: "1.25rem" }}><span>{t.who}</span></span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.375rem" }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "2.25rem", fontWeight: "600", letterSpacing: "-.02em" }}><span>{t.priceStr}</span></span>
                <span style={{ fontSize: "0.875rem", color: "#6B6257" }}>/ month</span>
              </div>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", color: "#6B6257", marginTop: "-0.625rem" }}><span>{t.billed}</span></span>
              <button className="hv-10" onClick={t.choose} style={{ height: "2.75rem", borderRadius: "2px", fontSize: "0.875rem", fontWeight: "600", cursor: "pointer", background: t.btnBg, color: "#16130F", border: `1px solid ${t.btnBd}` }}><span>{t.cta}</span></button>
              <div style={{ display: "flex", flexDirection: "column", borderTop: "1px solid #D9D0C2" }}>
                {t.items.map((i, j) => (
                  <span key={j} style={{ padding: "0.5625rem 0", borderBottom: "1px solid #EDE7DC", fontSize: "0.875rem" }}><span>{i.x}</span></span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <section style={{ padding: "clamp(3rem,6vw,4.5rem) clamp(1rem,3vw,2.5rem) 0" }}>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", letterSpacing: ".02em", color: "#6B6257", marginBottom: "0.75rem" }}>Compare bundles</div>
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: "40rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr", gap: "0.75rem", height: "2.5rem", alignItems: "center", borderBottom: "1px solid #16130F", fontSize: "0.875rem", fontWeight: "600" }}>
              <span />
              <span>Bench</span>
              <span>Shop</span>
              <span>Network</span>
            </div>
            {" "}
            {pr.compare.map((c, j) => (
              <Fragment key={j}>
                {" "}
                <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr", gap: "0.75rem", padding: "0.625rem 0", borderBottom: "1px solid #EDE7DC", fontSize: "0.875rem", alignItems: "baseline" }}>
                  <span style={{ color: "#3A342D" }}><span>{c.l}</span></span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.78125rem" }}><span>{c.a}</span></span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.78125rem" }}><span>{c.b}</span></span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.78125rem" }}><span>{c.c}</span></span>
                </div>
                {" "}
              </Fragment>
            ))}
          </div>
        </div>
      </section>
      <section style={{ padding: "clamp(4rem,8vw,6.5rem) clamp(1rem,3vw,2.5rem) clamp(3rem,6vw,4.5rem)" }}>
        <div style={{ display: "grid", gridTemplateColumns: ui.c48, gap: "clamp(1rem,4vw,3rem)", paddingBottom: "1.25rem", borderBottom: "2px solid #16130F", alignItems: "end" }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", letterSpacing: ".02em", color: "#C2470A" }}>Build your own</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            <h2 style={{ margin: "0", fontSize: "clamp(1.625rem,2.5vw,2.25rem)", lineHeight: "1.08", fontWeight: "600", fontStretch: "102%", textWrap: "balance" }}>Pay only for the services you use.</h2>
            <p style={{ margin: "0", fontSize: "0.9375rem", lineHeight: "1.6", color: "#3A342D", maxWidth: "37.5rem" }}>
              Choose individual services and set your volume. We'll tell you if a bundle would cost less.
            </p>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: ui.c75, gap: "clamp(1.5rem,4vw,3rem)", paddingTop: "1.5rem", alignItems: "start" }}>
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(15rem,1fr))", gap: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid #D9D0C2" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <span style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", fontWeight: "600" }}>
                  <span>Devices tested per month</span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace" }}><span>{pr.devicesStr}</span></span>
                </span>
                <input type="range" min="50" max="10000" step="50" value={pr.devices} onChange={pr.setDevices} style={{ width: "100%", accentColor: "#EB5E12" }} />
                <span style={{ display: "flex", justifyContent: "space-between", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", color: "#6B6257" }}><span>50</span><span>10,000</span></span>
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: "600" }}>Locations</span>
                <div style={{ display: "flex", alignItems: "center", border: "1px solid #16130F", borderRadius: "2px", width: "max-content" }}>
                  <button className="hv-0" onClick={pr.locDown} aria-label="Fewer locations" style={{ width: "2.75rem", height: "2.5rem", border: "0", background: "transparent", fontSize: "1.125rem", cursor: "pointer", color: "#16130F" }}>−</button>
                  <span style={{ width: "3.5rem", textAlign: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.9375rem", borderLeft: "1px solid #D9D0C2", borderRight: "1px solid #D9D0C2", lineHeight: "2.5rem" }}><span>{pr.locs}</span></span>
                  <button className="hv-0" onClick={pr.locUp} aria-label="More locations" style={{ width: "2.75rem", height: "2.5rem", border: "0", background: "transparent", fontSize: "1.125rem", cursor: "pointer", color: "#16130F" }}>+</button>
                </div>
              </div>
            </div>
            {" "}
            {pr.services.map((v, j) => (
              <Fragment key={j}>
                {" "}
                <button className="hv-1" onClick={v.toggle} style={{ width: "100%", display: "grid", gridTemplateColumns: "1.5rem minmax(0,1fr) auto", gap: "0.875rem", alignItems: "start", padding: "0.875rem 0", border: "0", borderBottom: "1px solid #EDE7DC", background: "transparent", textAlign: "left", cursor: "pointer", color: "#16130F" }}>
                  <span style={{ width: "1.125rem", height: "1.125rem", marginTop: "2px", border: "1px solid #16130F", borderRadius: "2px", background: v.cbBg, color: "#FFFFFF", fontSize: "0.6875rem", display: "flex", alignItems: "center", justifyContent: "center" }}><span>{v.mark}</span></span>
                  <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "0.9375rem", fontWeight: "600" }}><span>{v.name}</span></span>
                    <span style={{ fontSize: "0.8125rem", color: "#3A342D" }}><span>{v.desc}</span></span>
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.78125rem", textAlign: "right", whiteSpace: "nowrap" }}><span>{v.rate}</span></span>
                </button>
                {" "}
              </Fragment>
            ))}
          </div>
          <div style={{ position: "sticky", top: "5.5rem", background: "#FFFFFF", border: "1px solid #16130F", borderRadius: "0.25rem" }}>
            <div style={{ padding: "0.875rem 1.125rem", borderBottom: "1px solid #D9D0C2", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", letterSpacing: ".02em", color: "#6B6257" }}>Your estimate</div>
            <div style={{ padding: "0.375rem 1.125rem 0" }}>
              {pr.lines.map((l, j) => (
                <Fragment key={j}>
                  {" "}
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", padding: "0.5rem 0", borderBottom: "1px solid #EDE7DC", fontSize: "0.84375rem" }}>
                    <span>
                      <span>{l.n}</span>
                      <span style={{ display: "block", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", color: "#6B6257" }}><span>{l.calc}</span></span>
                    </span>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace" }}><span>{l.cost}</span></span>
                  </div>
                  {" "}
                </Fragment>
              ))}
              {" "}
              {pr.noLines ? (
                <div style={{ padding: "1rem 0", fontSize: "0.875rem", color: "#3A342D" }}>Pick at least one service to see an estimate.</div>
              ) : null}
            </div>
            <div style={{ padding: "0.875rem 1.125rem", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: "0.875rem", fontWeight: "600" }}>Per month</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "1.75rem", fontWeight: "600" }}><span>{pr.total}</span></span>
            </div>
            <div style={{ margin: "0 1.125rem", padding: "0.625rem 0.75rem", background: "#FBE7CC", fontSize: "0.8125rem", lineHeight: "1.45" }}><span>{pr.rec}</span></div>
            <div style={{ padding: "1rem 1.125rem 1.125rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <button className="hv-2" onClick={pr.chooseCustom} style={{ height: "2.75rem", background: "#EB5E12", color: "#16130F", border: "0", borderRadius: "2px", fontSize: "0.875rem", fontWeight: "600", cursor: "pointer" }}>Start with these services</button>
              <a className="hv-3" href="#/contact" style={{ height: "2.75rem", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #16130F", borderRadius: "2px", fontSize: "0.875rem", fontWeight: "600", color: "#16130F", textDecoration: "none" }}>Talk to sales</a>
            </div>
          </div>
        </div>
      </section>
      <section style={{ margin: "0 clamp(1rem,3vw,2.5rem) clamp(3.5rem,7vw,5.5rem)", padding: "1.5rem 0", borderTop: "1px solid #16130F", borderBottom: "1px solid #16130F", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <span style={{ fontSize: "clamp(1.125rem,1.6vw,1.375rem)", fontWeight: "600", fontStretch: "100%" }}>More than 10 locations or 10,000 devices a month?</span>
        <a className="hv-8" href="#/contact" style={{ height: "2.75rem", padding: "0 1.125rem", display: "inline-flex", alignItems: "center", background: "#16130F", color: "#F6F2EA", borderRadius: "2px", fontSize: "0.875rem", fontWeight: "600", textDecoration: "none" }}>Get a custom quote</a>
      </section>
    </>
  );
}
