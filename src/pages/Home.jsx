import { Fragment, Suspense, lazy } from 'react';
import HeroConsole from '../redesign/HeroConsole.jsx';
import HeroPhone from '../redesign/HeroPhone.jsx';
import Station from '../redesign/Station.jsx';
const Story = lazy(() => import('../redesign/Story.jsx'));

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
      <Suspense fallback={<div style={{ height: "100vh", background: "#16130F" }} />}><Story /></Suspense>
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
          <div style={{ marginTop: "1rem", background: "#EDE6DA", border: "1px solid #D9D0C2", borderRadius: "0.25rem", overflow: "hidden", height: "clamp(17.5rem,27vw,23.75rem)" }}>
            <svg viewBox="0 0 400 340" width="100%" height="100%" preserveAspectRatio="xMidYMax meet" role="img" aria-label="Illustration of a smiling shop owner holding up a phone">
              <rect width="400" height="340" fill="#EDE6DA" />
              <g fill="#FFFFFF" stroke="#B9AE9E" strokeWidth="1.5">
                <rect x="28" y="56" width="26" height="34" />
                <rect x="58" y="62" width="26" height="28" />
                <rect x="88" y="56" width="26" height="34" />
                <rect x="290" y="62" width="26" height="28" />
                <rect x="320" y="56" width="26" height="34" />
                <rect x="350" y="62" width="22" height="28" />
                <rect x="28" y="128" width="30" height="32" />
                <rect x="62" y="134" width="30" height="26" />
                <rect x="330" y="128" width="30" height="32" />
              </g>
              <g stroke="#B9AE9E" strokeWidth="4"><line x1="16" y1="91" x2="384" y2="91" /><line x1="16" y1="161" x2="384" y2="161" /></g>
              <path d="M108 340 C108 272 140 244 200 244 C260 244 292 272 292 340 Z" fill="#3A342D" />
              <path d="M150 340 L156 266 Q200 256 244 266 L250 340 Z" fill="#EB5E12" />
              <g stroke="#C2470A" strokeWidth="6" strokeLinecap="round"><line x1="162" y1="266" x2="178" y2="246" /><line x1="238" y1="266" x2="222" y2="246" /></g>
              <rect x="182" y="292" width="36" height="22" rx="2" fill="#C2470A" />
              <rect x="186" y="214" width="28" height="34" fill="#B97A50" />
              <circle cx="157" cy="186" r="10" fill="#C98A5E" />
              <circle cx="243" cy="186" r="10" fill="#C98A5E" />
              <ellipse cx="200" cy="182" rx="44" ry="50" fill="#D99A6C" />
              <path d="M156 176 C152 128 186 116 206 120 C234 122 250 142 244 176 C238 154 222 146 200 148 C178 150 162 158 156 176 Z" fill="#16130F" />
              <path d="M158 190 C162 234 186 240 200 240 C214 240 238 234 242 190 C234 216 218 224 200 224 C182 224 166 216 158 190 Z" fill="#16130F" />
              <path d="M176 180 Q184 171 192 180" stroke="#16130F" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M208 180 Q216 171 224 180" stroke="#16130F" strokeWidth="4" fill="none" strokeLinecap="round" />
              <circle cx="171" cy="196" r="6" fill="#E08A6E" />
              <circle cx="229" cy="196" r="6" fill="#E08A6E" />
              <path d="M181 201 Q200 192 219 201 Q200 206 181 201 Z" fill="#16130F" />
              <path d="M186 206 Q200 222 214 206 Z" fill="#FFFFFF" stroke="#16130F" strokeWidth="3" strokeLinejoin="round" />
              <path d="M270 266 C298 254 314 222 318 190" stroke="#3A342D" strokeWidth="30" fill="none" strokeLinecap="round" />
              <g transform="rotate(10 322 150)">
                <rect x="304" y="112" width="38" height="68" rx="7" fill="#16130F" />
                <rect x="308" y="118" width="30" height="56" rx="4" fill="#F6F2EA" />
                <path d="M315 147 L321 153 L332 139" stroke="#1E7A4A" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </g>
              <circle cx="318" cy="182" r="15" fill="#D99A6C" />
              <path d="M130 270 C122 286 124 302 134 310" stroke="#3A342D" strokeWidth="30" fill="none" strokeLinecap="round" />
              <rect x="0" y="302" width="400" height="38" fill="#16130F" />
              <rect x="0" y="302" width="400" height="6" fill="#3A342D" />
              <ellipse cx="140" cy="304" rx="18" ry="9" fill="#D99A6C" />
              <rect x="236" y="292" width="44" height="12" rx="2" fill="#6B6257" />
            </svg>
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
      <section ref={xfRef} style={{ padding: "clamp(4rem,8vw,7rem) clamp(1rem,3vw,2.5rem) clamp(2.5rem,5vw,4rem)", display: "grid", gridTemplateColumns: ui.c48, gap: "clamp(1.5rem,4vw,3rem)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <div style={{ display: "flex", gap: "0.875rem", alignItems: "baseline" }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8125rem", fontWeight: "600", color: "#C2470A", flex: "none" }}>04</span>
            <h2 style={{ margin: "0", fontSize: "clamp(1.75rem,2.6vw,2.375rem)", lineHeight: "1.08", fontWeight: "600", fontStretch: "102%", letterSpacing: "-.01em", textWrap: "balance" }}>
              {"The work stays the same. "}
              <span style={{ color: "#C2470A" }}>The busywork goes away.</span>
            </h2>
          </div>
          <div style={{ marginTop: "1rem", backgroundColor: "#FFFBF2", backgroundImage: "repeating-linear-gradient(to bottom,transparent 0 1.9375rem,#E3CDB0 1.9375rem 2rem)", border: "1px solid #D9D0C2", boxShadow: "0 0.5rem 1.5rem rgba(22,19,15,.12)", transform: "rotate(-1.2deg)", padding: "0 1.125rem 1rem 3.25rem", position: "relative", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.75rem", lineHeight: "2rem", color: "#3A342D", maxWidth: "32.5rem" }}>
            <span style={{ position: "absolute", left: "2.375rem", top: "0", bottom: "0", width: "1px", background: "#E9A79F" }} />
            {" "}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "600", color: "#16130F" }}><span>INVENTORY · OCT</span><span>pg 14</span></div>
            {" "}
            {ledger.map((l, j) => (
              <Fragment key={j}>
                {" "}
                <div style={{ display: "grid", gridTemplateColumns: "2.75rem 1fr 2.125rem 1fr", gap: "0.5rem", whiteSpace: "nowrap", overflow: "hidden", color: l.fg, textDecoration: l.dec, textDecorationColor: "#B3261E" }}>
                  <span><span>{l.d}</span></span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}><span>{l.m}</span></span>
                  <span><span>{l.g}</span></span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}><span>{l.l}</span></span>
                </div>
                {" "}
              </Fragment>
            ))}
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
        </div>
      </section>
      <section style={{ padding: "0 0 clamp(3.5rem,7vw,5.5rem)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: "1rem", padding: "0 clamp(1rem,3vw,2.5rem) 1rem" }}>
          <div style={{ display: "flex", gap: "0.875rem", alignItems: "baseline", flexWrap: "wrap" }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8125rem", fontWeight: "600", color: "#C2470A", flex: "none" }}>05</span>
            <h2 style={{ margin: "0", fontSize: "clamp(1.625rem,2.4vw,2.125rem)", lineHeight: "1.1", fontWeight: "600", fontStretch: "102%", letterSpacing: "-.01em" }}>Heard at the counter</h2>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.75rem", color: "#6B6257" }}><span>{testi.pos}</span></span>
          </div>
          <div style={{ display: "flex", gap: "0.375rem" }}>
            <button className="hv-3" onClick={testi.prev} aria-label="Previous" style={{ width: "2.5rem", height: "2.25rem", border: "1px solid #16130F", background: "transparent", borderRadius: "2px", cursor: "pointer", fontSize: "0.9375rem", color: "#16130F" }}>←</button>
            <button className="hv-3" onClick={testi.next} aria-label="Next" style={{ width: "2.5rem", height: "2.25rem", border: "1px solid #16130F", background: "transparent", borderRadius: "2px", cursor: "pointer", fontSize: "0.9375rem", color: "#16130F" }}>→</button>
          </div>
        </div>
        <div ref={testiRef} onScroll={testi.onScroll} style={{ display: "flex", gap: "0", overflowX: "auto", scrollSnapType: "x mandatory", padding: "0 clamp(1rem,3vw,2.5rem)", scrollbarWidth: "none" }}>
          {testi.items.map((t, j) => (
            <figure key={j} style={{ flex: "0 0 min(27.5rem,84vw)", scrollSnapAlign: "start", margin: "0", padding: "1.375rem 1.75rem 0.5rem 0", marginRight: "1.75rem", borderTop: "2px solid #16130F", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "1.5rem" }}>
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
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", gap: "0.875rem", alignItems: "baseline" }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8125rem", fontWeight: "600", color: "#C2470A", flex: "none" }}>06</span>
            <h2 style={{ margin: "0", fontSize: "clamp(1.875rem,3vw,2.75rem)", lineHeight: "1.04", fontWeight: "650", fontStretch: "104%", letterSpacing: "-.015em", textWrap: "balance" }}>Start with one station. Add locations when you're ready.</h2>
          </div>
          <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
            <button className="hv-2" onClick={goTrial} style={{ height: "3rem", padding: "0 1.25rem", background: "#EB5E12", color: "#16130F", border: "0", borderRadius: "2px", fontSize: "0.9375rem", fontWeight: "600", cursor: "pointer" }}>Get started</button>
            <a className="hv-3" href="#/pricing" style={{ height: "3rem", padding: "0 1.25rem", display: "inline-flex", alignItems: "center", border: "1px solid #16130F", borderRadius: "2px", fontSize: "0.9375rem", fontWeight: "600", color: "#16130F", textDecoration: "none" }}>Compare plans</a>
          </div>
        </div>
        <ol style={{ listStyle: "none", margin: "0", padding: "0", borderTop: "1px solid #16130F" }}>
          <li style={{ display: "grid", gridTemplateColumns: "3.5rem 1fr auto", gap: "0.75rem", padding: "1.125rem 0", borderBottom: "1px solid #D9D0C2", alignItems: "baseline" }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8125rem", color: "#6B6257" }}>01</span>
            <span>
              <span style={{ display: "block", fontSize: "1.0625rem", fontWeight: "600", fontStretch: "100%" }}>Create your account</span>
              <span style={{ fontSize: "0.875rem", color: "#3A342D" }}>Company, locations, and who's on the team.</span>
            </span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", color: "#6B6257" }}>~2 min</span>
          </li>
          <li style={{ display: "grid", gridTemplateColumns: "3.5rem 1fr auto", gap: "0.75rem", padding: "1.125rem 0", borderBottom: "1px solid #D9D0C2", alignItems: "baseline" }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8125rem", color: "#6B6257" }}>02</span>
            <span>
              <span style={{ display: "block", fontSize: "1.0625rem", fontWeight: "600", fontStretch: "100%" }}>Pick a plan</span>
              <span style={{ fontSize: "0.875rem", color: "#3A342D" }}>Starter, Growth or Enterprise. Move up a plan when you need more checks.</span>
            </span>
            <a href="#/pricing" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", color: "#C2470A" }}>Pricing →</a>
          </li>
          <li style={{ display: "grid", gridTemplateColumns: "3.5rem 1fr auto", gap: "0.75rem", padding: "1.125rem 0", borderBottom: "1px solid #D9D0C2", alignItems: "baseline" }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8125rem", color: "#6B6257" }}>03</span>
            <span>
              <span style={{ display: "block", fontSize: "1.0625rem", fontWeight: "600", fontStretch: "100%" }}>Plug in your first device</span>
              <span style={{ fontSize: "0.875rem", color: "#3A342D" }}>Install the station app on a Mac or Windows PC and connect a USB hub.</span>
            </span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", color: "#6B6257" }}>~15 min</span>
          </li>
        </ol>
      </section>
    </>
  );
}
