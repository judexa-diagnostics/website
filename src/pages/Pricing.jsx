import { Fragment } from 'react';

export default function Pricing({ v }) {
  const { pr, ui } = v;
  return (
    <>
      <section style={{ padding: "clamp(48px,6vw,72px) clamp(16px,3vw,40px) 28px", display: "grid", gridTemplateColumns: ui.c48, gap: "clamp(16px,4vw,48px)", alignItems: "end" }}>
        <h1 style={{ margin: "0", fontSize: "clamp(32px,3.4vw,50px)", lineHeight: "1.02", fontWeight: "650", fontStretch: "104%", letterSpacing: "-.02em" }}>Pricing</h1>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: "20px", flexWrap: "wrap" }}>
          <p style={{ margin: "0", fontSize: "16px", lineHeight: "1.6", color: "#3A342D", maxWidth: "560px" }}>
            Three bundles priced per month. Scroll down to build your own from individual services, or talk to sales if you have more than 10 locations.
          </p>
          <div style={{ display: "flex", border: "1px solid #16130F", borderRadius: "2px", overflow: "hidden", flex: "none" }}>
            <button onClick={pr.monthly} style={{ height: "36px", padding: "0 14px", border: "0", background: pr.mBg, color: pr.mFg, fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Monthly</button>
            <button onClick={pr.yearly} style={{ height: "36px", padding: "0 14px", border: "0", borderLeft: "1px solid #16130F", background: pr.yBg, color: pr.yFg, fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Annual · save 15%</button>
          </div>
        </div>
      </section>
      <section style={{ padding: "0 clamp(16px,3vw,40px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", borderTop: "2px solid #16130F", borderBottom: "1px solid #D9D0C2" }}>
          {pr.tiers.map((t, j) => (
            <div key={j} style={{ padding: "24px 24px 28px", borderRight: "1px solid #D9D0C2", background: t.bg, display: "flex", flexDirection: "column", gap: "16px", boxShadow: `inset 0 3px 0 ${t.top}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
                <span style={{ fontSize: "22px", fontWeight: "650", fontStretch: "104%" }}><span>{t.name}</span></span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "10.5px", letterSpacing: ".06em", textTransform: "uppercase", color: "#C2470A" }}><span>{t.tag}</span></span>
              </div>
              <span style={{ fontSize: "14px", color: "#3A342D", minHeight: "20px" }}><span>{t.who}</span></span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "36px", fontWeight: "600", letterSpacing: "-.02em" }}><span>{t.priceStr}</span></span>
                <span style={{ fontSize: "14px", color: "#6B6257" }}>/ month</span>
              </div>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "11px", color: "#6B6257", marginTop: "-10px" }}><span>{t.billed}</span></span>
              <button className="hv-10" onClick={t.choose} style={{ height: "44px", borderRadius: "2px", fontSize: "14px", fontWeight: "600", cursor: "pointer", background: t.btnBg, color: "#16130F", border: `1px solid ${t.btnBd}` }}><span>{t.cta}</span></button>
              <div style={{ display: "flex", flexDirection: "column", borderTop: "1px solid #D9D0C2" }}>
                {t.items.map((i, j) => (
                  <span key={j} style={{ padding: "9px 0", borderBottom: "1px solid #EDE7DC", fontSize: "14px" }}><span>{i.x}</span></span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <section style={{ padding: "clamp(48px,6vw,72px) clamp(16px,3vw,40px) 0" }}>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "11px", letterSpacing: ".02em", color: "#6B6257", marginBottom: "12px" }}>Compare bundles</div>
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: "640px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr", gap: "12px", height: "40px", alignItems: "center", borderBottom: "1px solid #16130F", fontSize: "14px", fontWeight: "600" }}>
              <span />
              <span>Bench</span>
              <span>Shop</span>
              <span>Network</span>
            </div>
            {" "}
            {pr.compare.map((c, j) => (
              <Fragment key={j}>
                {" "}
                <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr", gap: "12px", padding: "10px 0", borderBottom: "1px solid #EDE7DC", fontSize: "14px", alignItems: "baseline" }}>
                  <span style={{ color: "#3A342D" }}><span>{c.l}</span></span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "12.5px" }}><span>{c.a}</span></span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "12.5px" }}><span>{c.b}</span></span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "12.5px" }}><span>{c.c}</span></span>
                </div>
                {" "}
              </Fragment>
            ))}
          </div>
        </div>
      </section>
      <section style={{ padding: "clamp(64px,8vw,104px) clamp(16px,3vw,40px) clamp(48px,6vw,72px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: ui.c48, gap: "clamp(16px,4vw,48px)", paddingBottom: "20px", borderBottom: "2px solid #16130F", alignItems: "end" }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "11px", letterSpacing: ".02em", color: "#C2470A" }}>Build your own</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <h2 style={{ margin: "0", fontSize: "clamp(26px,2.5vw,36px)", lineHeight: "1.08", fontWeight: "600", fontStretch: "102%", textWrap: "balance" }}>Pay only for the services you use.</h2>
            <p style={{ margin: "0", fontSize: "15px", lineHeight: "1.6", color: "#3A342D", maxWidth: "600px" }}>
              Choose individual services and set your volume. We'll tell you if a bundle would cost less.
            </p>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: ui.c75, gap: "clamp(24px,4vw,48px)", paddingTop: "24px", alignItems: "start" }}>
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "24px", paddingBottom: "24px", borderBottom: "1px solid #D9D0C2" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "600" }}>
                  <span>Devices tested per month</span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace" }}><span>{pr.devicesStr}</span></span>
                </span>
                <input type="range" min="50" max="10000" step="50" value={pr.devices} onChange={pr.setDevices} style={{ width: "100%", accentColor: "#EB5E12" }} />
                <span style={{ display: "flex", justifyContent: "space-between", fontFamily: "'JetBrains Mono',monospace", fontSize: "11px", color: "#6B6257" }}><span>50</span><span>10,000</span></span>
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={{ fontSize: "14px", fontWeight: "600" }}>Locations</span>
                <div style={{ display: "flex", alignItems: "center", border: "1px solid #16130F", borderRadius: "2px", width: "max-content" }}>
                  <button className="hv-0" onClick={pr.locDown} aria-label="Fewer locations" style={{ width: "44px", height: "40px", border: "0", background: "transparent", fontSize: "18px", cursor: "pointer", color: "#16130F" }}>−</button>
                  <span style={{ width: "56px", textAlign: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: "15px", borderLeft: "1px solid #D9D0C2", borderRight: "1px solid #D9D0C2", lineHeight: "40px" }}><span>{pr.locs}</span></span>
                  <button className="hv-0" onClick={pr.locUp} aria-label="More locations" style={{ width: "44px", height: "40px", border: "0", background: "transparent", fontSize: "18px", cursor: "pointer", color: "#16130F" }}>+</button>
                </div>
              </div>
            </div>
            {" "}
            {pr.services.map((v, j) => (
              <Fragment key={j}>
                {" "}
                <button className="hv-1" onClick={v.toggle} style={{ width: "100%", display: "grid", gridTemplateColumns: "24px minmax(0,1fr) auto", gap: "14px", alignItems: "start", padding: "14px 0", border: "0", borderBottom: "1px solid #EDE7DC", background: "transparent", textAlign: "left", cursor: "pointer", color: "#16130F" }}>
                  <span style={{ width: "18px", height: "18px", marginTop: "2px", border: "1px solid #16130F", borderRadius: "2px", background: v.cbBg, color: "#FFFFFF", fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "center" }}><span>{v.mark}</span></span>
                  <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "15px", fontWeight: "600" }}><span>{v.name}</span></span>
                    <span style={{ fontSize: "13px", color: "#3A342D" }}><span>{v.desc}</span></span>
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "12.5px", textAlign: "right", whiteSpace: "nowrap" }}><span>{v.rate}</span></span>
                </button>
                {" "}
              </Fragment>
            ))}
          </div>
          <div style={{ position: "sticky", top: "88px", background: "#FFFFFF", border: "1px solid #16130F", borderRadius: "4px" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #D9D0C2", fontFamily: "'JetBrains Mono',monospace", fontSize: "11px", letterSpacing: ".02em", color: "#6B6257" }}>Your estimate</div>
            <div style={{ padding: "6px 18px 0" }}>
              {pr.lines.map((l, j) => (
                <Fragment key={j}>
                  {" "}
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", padding: "8px 0", borderBottom: "1px solid #EDE7DC", fontSize: "13.5px" }}>
                    <span>
                      <span>{l.n}</span>
                      <span style={{ display: "block", fontFamily: "'JetBrains Mono',monospace", fontSize: "11px", color: "#6B6257" }}><span>{l.calc}</span></span>
                    </span>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace" }}><span>{l.cost}</span></span>
                  </div>
                  {" "}
                </Fragment>
              ))}
              {" "}
              {pr.noLines ? (
                <div style={{ padding: "16px 0", fontSize: "14px", color: "#3A342D" }}>Pick at least one service to see an estimate.</div>
              ) : null}
            </div>
            <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: "14px", fontWeight: "600" }}>Per month</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "28px", fontWeight: "600" }}><span>{pr.total}</span></span>
            </div>
            <div style={{ margin: "0 18px", padding: "10px 12px", background: "#FBE7CC", fontSize: "13px", lineHeight: "1.45" }}><span>{pr.rec}</span></div>
            <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <button className="hv-2" onClick={pr.chooseCustom} style={{ height: "44px", background: "#EB5E12", color: "#16130F", border: "0", borderRadius: "2px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>Start with these services</button>
              <a className="hv-3" href="#/contact" style={{ height: "44px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #16130F", borderRadius: "2px", fontSize: "14px", fontWeight: "600", color: "#16130F", textDecoration: "none" }}>Talk to sales</a>
            </div>
          </div>
        </div>
      </section>
      <section style={{ margin: "0 clamp(16px,3vw,40px) clamp(56px,7vw,88px)", padding: "24px 0", borderTop: "1px solid #16130F", borderBottom: "1px solid #16130F", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "clamp(18px,1.6vw,22px)", fontWeight: "600", fontStretch: "100%" }}>More than 10 locations or 10,000 devices a month?</span>
        <a className="hv-8" href="#/contact" style={{ height: "44px", padding: "0 18px", display: "inline-flex", alignItems: "center", background: "#16130F", color: "#F6F2EA", borderRadius: "2px", fontSize: "14px", fontWeight: "600", textDecoration: "none" }}>Get a custom quote</a>
      </section>
    </>
  );
}
