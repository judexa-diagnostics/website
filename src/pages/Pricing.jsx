import { Fragment } from 'react';
import PlanButton from '../components/PlanButton.jsx';

export default function Pricing({ v }) {
  const { pr, ui } = v;
  return (
    <>
      <section style={{ padding: "clamp(3rem,6vw,4.5rem) clamp(1rem,3vw,2.5rem) 1.75rem", display: "grid", gridTemplateColumns: ui.c48, gap: "clamp(1rem,4vw,3rem)", alignItems: "end" }}>
        <h1 style={{ margin: "0", fontSize: "clamp(2rem,3.4vw,3.125rem)", lineHeight: "1.02", fontWeight: "650", fontStretch: "104%", letterSpacing: "-.02em" }}>Pricing</h1>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: "1.25rem", flexWrap: "wrap" }}>
          <p style={{ margin: "0", fontSize: "1rem", lineHeight: "1.6", color: "#3A342D", maxWidth: "35rem" }}>
            Three plans, priced by the device checks you run. Every plan includes the whole product; plans differ in included checks, stations, staff users and support.
          </p>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem", flex: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", color: "#6B6257" }}>Billing</span>
              <div style={{ display: "flex", border: "1px solid #16130F", borderRadius: "2px", overflow: "hidden" }}>
                <button onClick={pr.monthly} style={{ height: "2.25rem", padding: "0 0.875rem", border: "0", background: pr.mBg, color: pr.mFg, fontSize: "0.8125rem", fontWeight: "600", cursor: "pointer" }}><span>{pr.monthLabel}</span></button>
                <button onClick={pr.yearly} disabled={pr.yearOff} style={{ height: "2.25rem", padding: "0 0.875rem", border: "0", borderLeft: "1px solid #16130F", background: pr.yBg, color: pr.yFg, fontSize: "0.8125rem", fontWeight: "600", cursor: pr.yearCursor, opacity: pr.yearOpacity }}><span>{pr.yearLabel}</span></button>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", color: "#6B6257" }}>Pay by</span>
              <div style={{ display: "flex", border: "1px solid #16130F", borderRadius: "2px", overflow: "hidden" }}>
                <button onClick={pr.card} style={{ height: "2.25rem", padding: "0 0.875rem", border: "0", background: pr.cBg, color: pr.cFg, fontSize: "0.8125rem", fontWeight: "600", cursor: "pointer" }}><span>{pr.cardLabel}</span></button>
                <button onClick={pr.usdc} style={{ height: "2.25rem", padding: "0 0.875rem", border: "0", borderLeft: "1px solid #16130F", background: pr.uBg, color: pr.uFg, fontSize: "0.8125rem", fontWeight: "600", cursor: "pointer" }}><span>{pr.usdcLabel}</span></button>
              </div>
            </div>
            <span aria-live="polite" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", color: "#6B6257", minHeight: "1rem" }}><span>{pr.payNote}</span></span>
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
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <span style={{ fontSize: "0.9375rem", fontWeight: "600" }}><span>{t.checks}</span></span>
                <span style={{ fontSize: "0.8125rem", lineHeight: "1.45", color: "#3A342D" }}><span>{t.overage}</span></span>
              </div>
              <PlanButton a={t.act} className="hv-10" style={{ height: "2.75rem", borderRadius: "2px", fontSize: "0.875rem", fontWeight: "600", cursor: "pointer", background: t.btnBg, color: "#16130F", border: `1px solid ${t.btnBd}` }}><span>{t.cta}</span></PlanButton>
              <div style={{ display: "flex", flexDirection: "column", borderTop: "1px solid #D9D0C2" }}>
                {t.items.map((i, j) => (
                  <span key={j} style={{ padding: "0.5625rem 0", borderBottom: "1px solid #EDE7DC", fontSize: "0.875rem" }}><span>{i.x}</span></span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", paddingTop: "1rem", fontSize: "0.8125rem", lineHeight: "1.55", color: "#3A342D", maxWidth: "47.5rem" }}>
          <span><span>{pr.paymentLine}</span></span>
          <span><span>{pr.footnote}</span></span>
        </div>
      </section>
      <section style={{ padding: "clamp(3rem,6vw,4.5rem) clamp(1rem,3vw,2.5rem) 0" }}>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", letterSpacing: ".02em", color: "#6B6257", marginBottom: "0.75rem" }}>Questions</div>
        <div style={{ borderTop: "1px solid #16130F" }}>
          {pr.faq.map((f, j) => (
            <div key={j} style={{ display: "grid", gridTemplateColumns: ui.c48, gap: "0.5rem clamp(1rem,4vw,3rem)", padding: "1rem 0", borderBottom: "1px solid #D9D0C2" }}>
              <span style={{ fontSize: "1rem", fontWeight: "600", lineHeight: "1.4" }}><span>{f.q}</span></span>
              <p style={{ margin: "0", fontSize: "0.9375rem", lineHeight: "1.6", color: "#3A342D", maxWidth: "45rem" }}><span>{f.a}</span></p>
            </div>
          ))}
        </div>
      </section>
      <section style={{ padding: "clamp(3rem,6vw,4.5rem) clamp(1rem,3vw,2.5rem) 0" }}>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", letterSpacing: ".02em", color: "#6B6257", marginBottom: "0.75rem" }}>Compare plans</div>
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: "40rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr", gap: "0.75rem", height: "2.5rem", alignItems: "center", borderBottom: "1px solid #16130F", fontSize: "0.875rem", fontWeight: "600" }}>
              <span />
              {pr.planNames.map((n, j) => <span key={j}>{n}</span>)}
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
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", letterSpacing: ".02em", color: "#C2470A" }}>Estimate your month</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            <h2 style={{ margin: "0", fontSize: "clamp(1.625rem,2.5vw,2.25rem)", lineHeight: "1.08", fontWeight: "600", fontStretch: "102%", textWrap: "balance" }}>See what a month costs at your volume.</h2>
            <p style={{ margin: "0", fontSize: "0.9375rem", lineHeight: "1.6", color: "#3A342D", maxWidth: "37.5rem" }}>
              Set your device checks and stations. We'll show what each plan costs with overage included, and which costs least.
            </p>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: ui.c75, gap: "clamp(1.5rem,4vw,3rem)", paddingTop: "1.5rem", alignItems: "start" }}>
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(15rem,1fr))", gap: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid #D9D0C2" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <span style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", fontWeight: "600" }}>
                  <span>Device checks per month</span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace" }}><span>{pr.checksStr}</span></span>
                </span>
                <input type="range" min="50" max="20000" step="50" value={pr.checks} onChange={pr.setChecks} style={{ width: "100%", accentColor: "#EB5E12" }} />
                <span style={{ display: "flex", justifyContent: "space-between", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", color: "#6B6257" }}><span>50</span><span>20,000</span></span>
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: "600" }}>Stations</span>
                <div style={{ display: "flex", alignItems: "center", border: "1px solid #16130F", borderRadius: "2px", width: "max-content" }}>
                  <button className="hv-0" onClick={pr.stDown} aria-label="Fewer stations" style={{ width: "2.75rem", height: "2.5rem", border: "0", background: "transparent", fontSize: "1.125rem", cursor: "pointer", color: "#16130F" }}>−</button>
                  <span style={{ width: "3.5rem", textAlign: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.9375rem", borderLeft: "1px solid #D9D0C2", borderRight: "1px solid #D9D0C2", lineHeight: "2.5rem" }}><span>{pr.stations}</span></span>
                  <button className="hv-0" onClick={pr.stUp} aria-label="More stations" style={{ width: "2.75rem", height: "2.5rem", border: "0", background: "transparent", fontSize: "1.125rem", cursor: "pointer", color: "#16130F" }}>+</button>
                </div>
              </div>
            </div>
            {" "}
            {pr.plans.map((v, j) => (
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
            </div>
            <div style={{ padding: "0.875rem 1.125rem", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: "0.875rem", fontWeight: "600" }}>Per month</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "1.75rem", fontWeight: "600" }}><span>{pr.total}</span></span>
            </div>
            <div style={{ margin: "0 1.125rem", padding: "0.625rem 0.75rem", background: "#FBE7CC", fontSize: "0.8125rem", lineHeight: "1.45" }}><span>{pr.rec}</span></div>
            <div style={{ padding: "1rem 1.125rem 1.125rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <PlanButton a={pr.estAct} className="hv-2" style={{ height: "2.75rem", background: "#EB5E12", color: "#16130F", border: "0", borderRadius: "2px", fontSize: "0.875rem", fontWeight: "600", cursor: "pointer" }}><span>{pr.estCta}</span></PlanButton>
              <a className="hv-3" href="#/contact" style={{ height: "2.75rem", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #16130F", borderRadius: "2px", fontSize: "0.875rem", fontWeight: "600", color: "#16130F", textDecoration: "none" }}>Talk to sales</a>
            </div>
          </div>
        </div>
      </section>
      <section style={{ margin: "0 clamp(1rem,3vw,2.5rem) clamp(3.5rem,7vw,5.5rem)", padding: "1.5rem 0", borderTop: "1px solid #16130F", borderBottom: "1px solid #16130F", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <span style={{ fontSize: "clamp(1.125rem,1.6vw,1.375rem)", fontWeight: "600", fontStretch: "100%" }}>Want Enterprise billed monthly, or terms of your own?</span>
        <a className="hv-8" href="#/contact" style={{ height: "2.75rem", padding: "0 1.125rem", display: "inline-flex", alignItems: "center", background: "#16130F", color: "#F6F2EA", borderRadius: "2px", fontSize: "0.875rem", fontWeight: "600", textDecoration: "none" }}>Get a custom quote</a>
      </section>
    </>
  );
}
