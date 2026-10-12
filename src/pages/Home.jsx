import { Fragment, Suspense, lazy } from 'react';
import HeroConsole from '../redesign/HeroConsole.jsx';
import HeroPhone from '../redesign/HeroPhone.jsx';
import Station from '../redesign/Station.jsx';
import { FxScope } from '../redesign/fx/index.jsx';
const Story = lazy(() => import('../redesign/Story.jsx'));
const AfterSaleScene = lazy(() => import('../redesign/AfterSaleScene.jsx'));

export default function Home({ v }) {
  const { caps, cr, goTrial, hero, heroBarRef, ledger, moreRef, rail, s1, s2, s3, s4, s5, s6, s7, sb, stageRef, tenPhones, tenSum, testi, testiRef, toggleMode, trackRef, ui, wrapRef, xf, xfRef } = v;
  return (
    <>
      <section style={{ position: "relative", borderBottom: "1px solid #D9D0C2", overflow: "hidden" }}>
        <div style={{ display: ui.wideBlock, position: "absolute", top: "0", bottom: "0", left: "40%", right: "0", background: "#EDE6DA" }} />
        <div style={{ position: "relative", display: "grid", gridTemplateColumns: ui.hero, alignItems: "center", gap: "clamp(1.5rem,3vw,2.5rem)", padding: "clamp(2rem,4.5vw,3.75rem) clamp(1rem,3vw,2.5rem)" }}>
          <HeroPhone goTrial={goTrial} />
          <HeroConsole />
        </div>
      </section>
      <div ref={heroBarRef} style={{ minHeight: "3.5rem", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", background: "#16130F", color: "#F6F2EA" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.9375rem", padding: "0.875rem clamp(1rem,3vw,2.5rem)", flex: "1 1 26.25rem" }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", letterSpacing: ".02em", color: "#EB5E12", flex: "none" }}>New</span>
          <span style={{ textWrap: "pretty" }}>
            Test, erase and grade up to 40 devices per station, with erasure certificates generated automatically.
          </span>
        </div>
        <div style={{ display: "flex", flex: "0 1 auto", minHeight: "3.5rem", alignSelf: "stretch" }}>
          <a className="hv-6" href="#/pricing" style={{ display: "flex", alignItems: "center", padding: "0 1.5rem", color: "#F6F2EA", textDecoration: "none", borderLeft: "1px solid #3A342D", fontSize: "0.875rem", fontWeight: "600" }}>Buy a plan</a>
          <button className="hv-2" onClick={goTrial} style={{ padding: "0 1.75rem", background: "#EB5E12", color: "#16130F", border: "0", fontSize: "0.875rem", fontWeight: "600", cursor: "pointer" }}>Get started →</button>
        </div>
      </div>
      <Suspense fallback={<div style={{ height: "100vh", background: "#16130F" }} />}><Story goTrial={goTrial} /></Suspense>
      <section style={{ padding: "clamp(3.5rem,6vw,5rem) clamp(1rem,3vw,2.5rem) clamp(3rem,6vw,4.5rem)", display: "grid", gridTemplateColumns: ui.c48, gap: "clamp(1.5rem,4vw,3rem)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", gap: "0.875rem", alignItems: "baseline" }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8125rem", fontWeight: "600", color: "#C2470A", flex: "none" }}>02</span>
            <h2 style={{ margin: "0", fontSize: "clamp(1.5rem,2.2vw,1.875rem)", lineHeight: "1.12", fontWeight: "600", fontStretch: "102%", textWrap: "balance" }}>
              {"Everything that happens "}
              <span style={{ color: "#C2470A" }}>after the sale</span>
              , too.
            </h2>
          </div>
          <p style={{ margin: "0", fontSize: "0.9375rem", lineHeight: "1.6", color: "#3A342D" }}>For your customers and your vendors.</p>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap", marginTop: "0.25rem" }}>
            <button className="hv-2" onClick={goTrial} style={{ height: "2.75rem", padding: "0 1.25rem", background: "#EB5E12", color: "#16130F", border: "0", borderRadius: "2px", fontSize: "0.9375rem", fontWeight: "600", cursor: "pointer" }}>Join now</button>
            <a href="#/features" style={{ fontSize: "0.9375rem", fontWeight: "600", color: "#16130F", textDecoration: "none", borderBottom: "1px solid #16130F", paddingBottom: "2px" }}>See every feature →</a>
          </div>
          <div className="as-mount" style={{ marginTop: "1rem", background: "#16130F", border: "1px solid #D9D0C2", borderRadius: "0.25rem", overflow: "hidden" }}>
            <Suspense fallback={null}><AfterSaleScene /></Suspense>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(15.625rem,1fr))", columnGap: "2rem" }}>
          {caps.map((c, j) => (
            <div key={j} style={{ padding: "0.875rem 0 1.125rem", borderTop: "1px solid #D9D0C2", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <span style={{ fontSize: "1rem", fontWeight: "600", fontStretch: "100%" }}><span>{c.t}</span></span>
              <span style={{ fontSize: "0.875rem", lineHeight: "1.5", color: "#3A342D" }}><span>{c.d}</span></span>
            </div>
          ))}
        </div>
      </section>
      <section ref={moreRef}><Station goTrial={goTrial} /></section>
      <FxScope>
      <section ref={xfRef} style={{ padding: "clamp(4rem,8vw,7rem) clamp(1rem,3vw,2.5rem) clamp(2.5rem,5vw,4rem)", display: "grid", gridTemplateColumns: ui.c48, gap: "clamp(1.5rem,4vw,3rem)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <div style={{ display: "flex", gap: "0.875rem", alignItems: "baseline" }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8125rem", fontWeight: "600", color: "#C2470A", flex: "none" }}>04</span>
            <h2 style={{ margin: "0", fontSize: "clamp(1.75rem,2.6vw,2.375rem)", lineHeight: "1.08", fontWeight: "600", fontStretch: "102%", letterSpacing: "-.01em", textWrap: "balance" }}>
              {"The work stays the same. "}
              <span style={{ color: "#C2470A" }}>The busywork goes away.</span>
            </h2>
          </div>
          <div className={"fx-paper" + ((xf.length > 0 && xf[0].o === 1) ? " fx-ledger-on" : "")} style={{ marginTop: "1rem", backgroundColor: "#FFFBF2", backgroundImage: "repeating-linear-gradient(to bottom,transparent 0 1.9375rem,#E3CDB0 1.9375rem 2rem)", border: "1px solid #D9D0C2", boxShadow: "0 0.5rem 1.5rem rgba(22,19,15,.12)", transform: "rotate(-1.2deg)", padding: "0 1.125rem 1rem 3.25rem", position: "relative", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.75rem", lineHeight: "2rem", color: "#3A342D", maxWidth: "32.5rem" }}>
            <span style={{ position: "absolute", left: "2.375rem", top: "0", bottom: "0", width: "1px", background: "#E9A79F" }} />
            {" "}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "600", color: "#16130F" }}><span>INVENTORY · OCT</span><span>pg 14</span></div>
            {" "}
            {ledger.map((l, j) => (
              <Fragment key={j}>
                {" "}
                <div className="fx-ledger-row" style={{ position: "relative", display: "grid", gridTemplateColumns: "2.75rem 1fr 2.125rem 1fr", gap: "0.5rem", whiteSpace: "nowrap", overflow: "hidden", color: l.fg, textDecoration: l.dec, textDecorationColor: "#B3261E" }}>
                  {l.dec !== "line-through" ? <span aria-hidden="true" className="fx-strike" style={{ transitionDelay: (150 + j * 110) + "ms" }} /> : null}
                  <span><span>{l.d}</span></span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}><span>{l.m}</span></span>
                  <span><span>{l.g}</span></span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}><span>{l.l}</span></span>
                </div>
                {" "}
              </Fragment>
            ))}
            <span aria-hidden="true" className="fx-stamp">Logged in InPhox ✓</span>
          </div>
        </div>
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "1.5rem", paddingBottom: "0.625rem", borderBottom: "2px solid #16130F", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", letterSpacing: ".02em", color: "#6B6257" }}><span>Before</span><span style={{ color: "#16130F" }}>With InPhox</span></div>
          {" "}
          {xf.map((x, j) => (
            <Fragment key={j}>
              {" "}
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "1.5rem", padding: "1rem 0", borderBottom: "1px solid #D9D0C2", alignItems: "start" }}>
                <span style={{ fontSize: "0.9375rem", lineHeight: "1.5", color: x.bFg, textDecoration: "line-through", textDecorationColor: x.strike, transition: "all 600ms", transitionDelay: x.d }}><span>{x.b}</span></span>
                <span style={{ fontSize: "0.9375rem", lineHeight: "1.5", fontWeight: "600", opacity: x.o, transform: x.t, transition: "all 600ms", transitionDelay: x.d2 }}><span>{x.a}</span></span>
              </div>
              {" "}
            </Fragment>
          ))}
          <div data-fx="" data-fx-delay="900" style={{ display: "flex", alignItems: "center", gap: "0.75rem 1.5rem", flexWrap: "wrap", paddingTop: "1.75rem" }}>
            <button className="hv-2 fx-press" onClick={goTrial} style={{ height: "3rem", padding: "0 1.375rem", background: "#EB5E12", color: "#16130F", border: "0", borderRadius: "2px", fontSize: "0.9375rem", fontWeight: "600", cursor: "pointer" }}>Join now</button>
            <a className="fx-arrow" href="#/pricing" style={{ fontSize: "0.9375rem", fontWeight: "600", color: "#16130F", textDecoration: "underline", textUnderlineOffset: "3px" }}>See pricing<span className="fx-arr" style={{ marginLeft: "0.3em" }}>→</span></a>
          </div>
        </div>
      </section>
      </FxScope>
      <FxScope>
      <section style={{ padding: "0 0 clamp(3.5rem,7vw,5.5rem)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: "1rem", padding: "0 clamp(1rem,3vw,2.5rem) 1rem" }}>
          <div data-fx="" style={{ display: "flex", gap: "0.875rem", alignItems: "baseline", flexWrap: "wrap" }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8125rem", fontWeight: "600", color: "#C2470A", flex: "none" }}>05</span>
            <h2 style={{ margin: "0", fontSize: "clamp(1.625rem,2.4vw,2.125rem)", lineHeight: "1.1", fontWeight: "600", fontStretch: "102%", letterSpacing: "-.01em" }}>Heard at the counter</h2>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.75rem", color: "#6B6257" }}><span key={testi.pos} className="fx-pop">{testi.pos}</span></span>
          </div>
          <div style={{ display: "flex", gap: "0.375rem" }}>
            <button className="hv-3 fx-press" onClick={testi.prev} aria-label="Previous" style={{ width: "2.5rem", height: "2.25rem", border: "1px solid #16130F", background: "transparent", borderRadius: "2px", cursor: "pointer", fontSize: "0.9375rem", color: "#16130F" }}>←</button>
            <button className="hv-3 fx-press" onClick={testi.next} aria-label="Next" style={{ width: "2.5rem", height: "2.25rem", border: "1px solid #16130F", background: "transparent", borderRadius: "2px", cursor: "pointer", fontSize: "0.9375rem", color: "#16130F" }}>→</button>
          </div>
        </div>
        <div ref={testiRef} onScroll={testi.onScroll} style={{ display: "flex", gap: "0", overflowX: "auto", scrollSnapType: "x mandatory", padding: "0 clamp(1rem,3vw,2.5rem)", scrollbarWidth: "none" }}>
          {testi.items.map((t, j) => (
            <figure key={j} data-fx="fade" data-fx-gap="110" style={{ flex: "0 0 min(27.5rem,84vw)", scrollSnapAlign: "start", margin: "0", padding: "1.375rem 1.75rem 0.5rem 0", marginRight: "1.75rem", borderTop: `2px solid ${j === parseInt(testi.pos, 10) - 1 ? "#EB5E12" : "#16130F"}`, transition: "border-color 400ms ease, opacity 640ms cubic-bezier(.2,.75,.2,1) var(--fx-d, 0ms)", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "1.5rem" }}>
              <blockquote style={{ margin: "0", fontSize: "clamp(1.125rem,1.6vw,1.3125rem)", lineHeight: "1.4", fontWeight: "500", fontStretch: "100%", textWrap: "pretty" }}>“<span>{t.q}</span>”</blockquote>
              <figcaption style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "0.8125rem" }}>
                <span style={{ fontWeight: "600" }}><span>{t.n}</span></span>
                <span style={{ color: "#6B6257" }}><span>{t.r}</span></span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
      <section style={{ borderTop: "1px solid #D9D0C2", padding: "clamp(3.5rem,7vw,5.5rem) clamp(1rem,3vw,2.5rem)", display: "grid", gridTemplateColumns: ui.c57, gap: "clamp(1.5rem,5vw,4.5rem)" }}>
        <div data-fx="" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", gap: "0.875rem", alignItems: "baseline" }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8125rem", fontWeight: "600", color: "#C2470A", flex: "none" }}>06</span>
            <h2 style={{ margin: "0", fontSize: "clamp(1.875rem,3vw,2.75rem)", lineHeight: "1.04", fontWeight: "650", fontStretch: "104%", letterSpacing: "-.015em", textWrap: "balance" }}>Start with one station. Add locations when you're ready.</h2>
          </div>
          <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
            <button className="hv-2 fx-press" onClick={goTrial} style={{ height: "3rem", padding: "0 1.25rem", background: "#EB5E12", color: "#16130F", border: "0", borderRadius: "2px", fontSize: "0.9375rem", fontWeight: "600", cursor: "pointer" }}>Get started</button>
            <a className="hv-3" href="#/pricing" style={{ height: "3rem", padding: "0 1.25rem", display: "inline-flex", alignItems: "center", border: "1px solid #16130F", borderRadius: "2px", fontSize: "0.9375rem", fontWeight: "600", color: "#16130F", textDecoration: "none" }}>Compare plans</a>
          </div>
        </div>
        <ol style={{ listStyle: "none", margin: "0", padding: "0", borderTop: "1px solid #16130F" }}>
          <li data-fx="" data-fx-gap="110" style={{ display: "grid", gridTemplateColumns: "3.5rem 1fr auto", gap: "0.75rem", padding: "1.125rem 0", borderBottom: "1px solid #D9D0C2", alignItems: "baseline" }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8125rem", color: "#6B6257" }}>01</span>
            <span>
              <span style={{ display: "block", fontSize: "1.0625rem", fontWeight: "600", fontStretch: "100%" }}>Create your account</span>
              <span style={{ fontSize: "0.875rem", color: "#3A342D" }}>Company, locations, and who's on the team.</span>
            </span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", color: "#6B6257" }}>~2 min</span>
          </li>
          <li data-fx="" data-fx-gap="110" style={{ display: "grid", gridTemplateColumns: "3.5rem 1fr auto", gap: "0.75rem", padding: "1.125rem 0", borderBottom: "1px solid #D9D0C2", alignItems: "baseline" }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8125rem", color: "#6B6257" }}>02</span>
            <span>
              <span style={{ display: "block", fontSize: "1.0625rem", fontWeight: "600", fontStretch: "100%" }}>Pick a plan</span>
              <span style={{ fontSize: "0.875rem", color: "#3A342D" }}>Starter, Growth or Enterprise. Move up a plan when you need more checks.</span>
            </span>
            <a href="#/pricing" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", color: "#C2470A" }}>Pricing →</a>
          </li>
          <li data-fx="" data-fx-gap="110" style={{ display: "grid", gridTemplateColumns: "3.5rem 1fr auto", gap: "0.75rem", padding: "1.125rem 0", borderBottom: "1px solid #D9D0C2", alignItems: "baseline" }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8125rem", color: "#6B6257" }}>03</span>
            <span>
              <span style={{ display: "block", fontSize: "1.0625rem", fontWeight: "600", fontStretch: "100%" }}>Plug in your first device</span>
              <span style={{ fontSize: "0.875rem", color: "#3A342D" }}>Install the station app on a Mac or Windows PC and connect a USB hub.</span>
            </span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", color: "#6B6257" }}>~15 min</span>
          </li>
        </ol>
      </section>
      </FxScope>
    </>
  );
}
