import { Fragment } from 'react';

export default function Home({ v }) {
  const { caps, cr, goTrial, hero, heroBarRef, ledger, moreRef, rail, s1, s2, s3, s4, s5, s6, s7, sb, stageRef, tenPhones, tenSum, testi, testiRef, toggleMode, trackRef, ui, wrapRef, xf, xfRef } = v;
  return (
    <>
      <section style={{ position: "relative", borderBottom: "1px solid #D9D0C2", overflow: "hidden" }}>
        <div style={{ display: ui.wideBlock, position: "absolute", top: "0", bottom: "0", left: "40%", right: "0", background: "#EDE6DA" }} />
        <div style={{ position: "relative", display: "grid", gridTemplateColumns: ui.hero, alignItems: "center", gap: "clamp(1.5rem,3vw,2.5rem)", padding: "clamp(2rem,4.5vw,3.75rem) clamp(1rem,3vw,2.5rem)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem", minWidth: "0", position: "relative", zIndex: "2" }}>
            <h1 style={{ margin: "0", fontSize: "clamp(2rem,2.9vw,2.75rem)", lineHeight: "1.06", fontWeight: "650", fontStretch: "104%", letterSpacing: "-.02em", textWrap: "balance" }}>
              {"The all-in-one platform for used electronics. "}
              <span style={{ color: "#C2470A" }}>Literally.</span>
            </h1>
            <p style={{ margin: "0", fontSize: "1rem", lineHeight: "1.6", color: "#3A342D", textWrap: "pretty" }}>
              Diagnose, erase, grade, repair, store and sell from one system. Every device is tracked by IMEI from the moment it's plugged in until it ships.
            </p>
            <div style={{ display: "flex", gap: "0.625rem", alignItems: "center", flexWrap: "wrap" }}>
              <button className="hv-2" onClick={goTrial} style={{ height: "3.125rem", padding: "0 1.625rem", background: "#EB5E12", color: "#16130F", border: "0", borderRadius: "2px", fontSize: "1rem", fontWeight: "600", cursor: "pointer" }}>Join now</button>
              <a className="hv-3" href="#/pricing" style={{ height: "3.125rem", padding: "0 1.25rem", display: "inline-flex", alignItems: "center", border: "1px solid #16130F", borderRadius: "2px", fontSize: "1rem", fontWeight: "600", color: "#16130F", textDecoration: "none", background: "#F6F2EA" }}>See pricing</a>
            </div>
          </div>
          <div style={{ minWidth: "0", position: "relative", zIndex: "1", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            <div style={{ background: "#FFFFFF", border: "1px solid #16130F", borderRadius: "0.25rem", overflow: "hidden", boxShadow: "0 0.5rem 1.5rem rgba(22,19,15,.12)", zoom: ".86" }}>
              <div style={{ overflowX: "auto" }}>
                <div style={{ minWidth: "47.5rem" }}>
                  <div style={{ height: "2.5rem", background: "#C2470A", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 0.875rem", fontSize: "0.75rem", fontWeight: "500", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1.125rem" }}>
                      <span style={{ fontWeight: "700", fontSize: "0.875rem" }}>InPhox</span>
                      <span>Inventory Intelligence ▾</span>
                      <span>Device Operations ▾</span>
                      <span>Shipping</span>
                      <span>{"Pricing & Market ▾"}</span>
                      <span>Advanced ▾</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                      <span>Northgate Wireless · Dallas</span>
                      <span style={{ width: "1.5rem", height: "1.5rem", background: "#1E7A4A", borderRadius: "2px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "0.625rem" }}>NW</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem 0.75rem", padding: "0.75rem 0.875rem 0.625rem" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "0.625rem" }}>
                      <span style={{ fontSize: "1.25rem", fontWeight: "650" }}>Inventory</span>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65625rem", color: "#6B6257" }}>Updated 9:47 AM</span>
                    </div>
                    <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                      <button className="hv-4" onClick={hero.lookup} style={{ flex: "none", whiteSpace: "nowrap", height: "1.875rem", padding: "0 0.625rem", background: "#FFFFFF", border: "1px solid #D9D0C2", borderRadius: "2px", fontSize: "0.75rem", fontWeight: "600", cursor: "pointer", color: "#16130F" }}>Quick lookup</button>
                      <button className="hv-4" style={{ flex: "none", whiteSpace: "nowrap", height: "1.875rem", padding: "0 0.625rem", background: "#FFFFFF", border: "1px solid #D9D0C2", borderRadius: "2px", fontSize: "0.75rem", fontWeight: "600", cursor: "pointer", color: "#16130F" }}>Add inventory</button>
                      <button onClick={hero.move} style={{ flex: "none", whiteSpace: "nowrap", height: "1.875rem", padding: "0 0.625rem", background: hero.moveBg, border: `1px solid ${hero.moveBg}`, borderRadius: "2px", fontSize: "0.75rem", fontWeight: "600", cursor: "pointer", color: hero.moveFg }}><span>{hero.moveLabel}</span></button>
                      <button className="hv-4" style={{ flex: "none", whiteSpace: "nowrap", height: "1.875rem", padding: "0 0.625rem", background: "#FFFFFF", border: "1px solid #D9D0C2", borderRadius: "2px", fontSize: "0.75rem", fontWeight: "600", cursor: "pointer", color: "#16130F" }}>Sales order</button>
                      <button className="hv-4" style={{ flex: "none", whiteSpace: "nowrap", height: "1.875rem", padding: "0 0.625rem", background: "#FFFFFF", border: "1px solid #D9D0C2", borderRadius: "2px", fontSize: "0.75rem", fontWeight: "600", cursor: "pointer", color: "#16130F" }}>Reports</button>
                    </div>
                  </div>
                  <div style={{ margin: "0 0.875rem", border: "1px solid #D9D0C2", display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))" }}>
                    <div style={{ padding: "0.625rem 0.75rem", borderBottom: "2px solid #EB5E12" }}>
                      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.59375rem", letterSpacing: ".06em", color: "#C2470A" }}>IN STOCK</div>
                      <div style={{ fontSize: "1.375rem", fontWeight: "650", marginTop: "2px" }}>1,406</div>
                    </div>
                    <div style={{ padding: "0.625rem 0.75rem", borderLeft: "1px solid #D9D0C2" }}>
                      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.59375rem", letterSpacing: ".06em", color: "#6B6257" }}>AVAILABLE</div>
                      <div style={{ fontSize: "1.375rem", fontWeight: "650", marginTop: "2px" }}>1,122</div>
                      <div style={{ height: "0.1875rem", background: "#EDE7DC", marginTop: "0.375rem" }}>
                        <div style={{ height: "0.1875rem", width: "80%", background: "#EB5E12" }} />
                      </div>
                    </div>
                    <div style={{ padding: "0.625rem 0.75rem", borderLeft: "1px solid #D9D0C2" }}>
                      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.59375rem", letterSpacing: ".06em", color: "#6B6257" }}>ON HOLD</div>
                      <div style={{ fontSize: "1.375rem", fontWeight: "650", marginTop: "2px" }}>38</div>
                    </div>
                    <div style={{ padding: "0.625rem 0.75rem", borderLeft: "1px solid #D9D0C2" }}>
                      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.59375rem", letterSpacing: ".06em", color: "#6B6257" }}>IN TRANSIT</div>
                      <div style={{ fontSize: "1.375rem", fontWeight: "650", marginTop: "2px" }}>64</div>
                    </div>
                    <div style={{ padding: "0.625rem 0.75rem", borderLeft: "1px solid #D9D0C2" }}>
                      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.59375rem", letterSpacing: ".06em", color: "#6B6257" }}>SELL VALUE</div>
                      <div style={{ fontSize: "1.375rem", fontWeight: "650", marginTop: "2px" }}>$612,480</div>
                    </div>
                  </div>
                  <div style={{ margin: "0 0.875rem", padding: "0.4375rem 0.75rem", border: "1px solid #D9D0C2", borderTop: "0", display: "flex", gap: "1.125rem", fontSize: "0.6875rem", color: "#3A342D", flexWrap: "wrap" }}>
                    <span>{"Open repairs "}<strong>7</strong></span>
                    <span>{"Open quotes "}<strong>15</strong></span>
                    <span>{"Open sales "}<strong>22</strong></span>
                    <span>{"Open invoices "}<strong>5</strong></span>
                    <span>{"Open offers "}<strong>3</strong></span>
                    <span>{"Outbound "}<strong>4</strong></span>
                    <span>{"Move carts "}<strong><span>{hero.carts}</span></strong></span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr 1fr", gap: "0.375rem", padding: "0.625rem 0.875rem 0.5rem" }}>
                    <input className="fc-5" value={hero.q} onChange={hero.setQ} placeholder="Search model, grade, IMEI, location…" style={{ height: "1.875rem", padding: "0 0.625rem", border: "1px solid #D9D0C2", borderRadius: "2px", fontSize: "0.75rem", color: "#16130F", outline: "none", background: "#FFFFFF" }} />
                    <select value={hero.status} onChange={hero.setStatus} style={{ height: "1.875rem", padding: "0 0.5rem", border: "1px solid #D9D0C2", borderRadius: "2px", fontSize: "0.75rem", color: "#16130F", background: "#FFFFFF" }}>
                      {" "}
                      <option>All statuses</option>
                      <option>Available</option>
                      <option>Reserved</option>
                      <option>In repair</option>
                      <option>On hold</option>
                      <option>In transit</option>
                      {" "}
                    </select>
                    <select value={hero.loc} onChange={hero.setLoc} style={{ height: "1.875rem", padding: "0 0.5rem", border: "1px solid #D9D0C2", borderRadius: "2px", fontSize: "0.75rem", color: "#16130F", background: "#FFFFFF" }}>
                      {" "}
                      <option>All locations</option>
                      <option>Warehouse A</option>
                      <option>Northgate Kiosk</option>
                      <option>Elm St. Store</option>
                      <option>Repair bench</option>
                      <option>In transit</option>
                      {" "}
                    </select>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 0.875rem 0.5rem", fontSize: "0.6875rem", color: "#3A342D", minHeight: "1.375rem" }}>
                    <span>{"Showing "}<strong><span>{hero.range}</span></strong></span>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65625rem", color: "#1E7A4A" }}><span>{hero.note}</span></span>
                  </div>
                  <div style={{ borderTop: "1px solid #16130F" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1.375rem 1.05fr 2.5fr 1.2fr 1fr .95fr 2.125rem 3.125rem", gap: "0.5rem", padding: "0 0.875rem", height: "1.875rem", alignItems: "center", background: "#16130F", color: "#F6F2EA", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.59375rem", letterSpacing: ".08em" }}>
                      <button onClick={hero.selAll} aria-label="Select all" style={{ width: "0.8125rem", height: "0.8125rem", padding: "0", border: "1px solid #F6F2EA", borderRadius: "2px", background: hero.allBg, color: "#16130F", fontSize: "0.5625rem", lineHeight: "1", cursor: "pointer" }}><span>{hero.allMark}</span></button>
                      <span>MODEL</span>
                      <span>VARIANT</span>
                      <span>IMEI</span>
                      <span>LOCATION</span>
                      <span>STATUS</span>
                      <span>DWELL</span>
                      <span style={{ textAlign: "right" }}>SELL</span>
                    </div>
                    {" "}
                    {hero.rows.map((r, j) => (
                      <Fragment key={j}>
                        {" "}
                        <div className="hv-1" onClick={r.toggle} style={{ display: "grid", gridTemplateColumns: "1.375rem 1.05fr 2.5fr 1.2fr 1fr .95fr 2.125rem 3.125rem", gap: "0.5rem", padding: "0 0.875rem", height: "2.125rem", alignItems: "center", fontSize: "0.75rem", borderBottom: "1px solid #EDE7DC", background: r.bg, cursor: "pointer" }}>
                          <span style={{ width: "0.8125rem", height: "0.8125rem", border: "1px solid #8E857A", borderRadius: "2px", background: r.cbBg, color: "#FFFFFF", fontSize: "0.5625rem", display: "flex", alignItems: "center", justifyContent: "center" }}><span>{r.cbMark}</span></span>
                          <span style={{ fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}><span>{r.model}</span></span>
                          <span style={{ display: "flex", gap: "0.1875rem", overflow: "hidden" }}>
                            {r.chips.map((c, j) => (
                              <span key={j} style={{ flex: "none", padding: "1px 0.25rem", border: "1px solid #E3B48E", borderRadius: "2px", fontSize: "0.65625rem", fontWeight: "500", whiteSpace: "nowrap" }}><span>{c.t}</span></span>
                            ))}
                          </span>
                          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem" }}><span>{r.imei}</span></span>
                          <span style={{ fontSize: "0.71875rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}><span>{r.loc}</span></span>
                          <span>
                            <span style={{ display: "inline-block", padding: "2px 0.375rem", borderRadius: "2px", fontSize: "0.65625rem", fontWeight: "600", background: r.sBg, color: r.sFg, whiteSpace: "nowrap" }}><span>{r.status}</span></span>
                          </span>
                          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", color: "#3A342D" }}><span>{r.dwell}</span></span>
                          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", textAlign: "right" }}><span>{r.sell}</span></span>
                        </div>
                        {" "}
                      </Fragment>
                    ))}
                    {" "}
                    {hero.empty ? (
                      <>
                        {" "}
                        <div style={{ padding: "2rem 0.875rem", fontSize: "0.8125rem", color: "#3A342D" }}>
                          {"No devices match these filters. "}
                          <button onClick={hero.clear} style={{ background: "none", border: "0", padding: "0", fontSize: "0.8125rem", fontWeight: "600", color: "#16130F", borderBottom: "1px solid #16130F", cursor: "pointer" }}>Clear filters</button>
                        </div>
                        {" "}
                      </>
                    ) : null}
                    {" "}
                    <div style={{ height: "2.125rem", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "0.375rem", padding: "0 0.875rem", background: "#F6F2EA", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65625rem", color: "#3A342D" }}>
                      <span>{"Page "}<span>{hero.pageStr}</span></span>
                      <button onClick={hero.prev} aria-label="Previous page" style={{ width: "1.625rem", height: "1.375rem", border: "1px solid #D9D0C2", background: "#FFFFFF", borderRadius: "2px", cursor: "pointer", color: "#16130F" }}>‹</button>
                      <button onClick={hero.next} aria-label="Next page" style={{ width: "1.625rem", height: "1.375rem", border: "1px solid #D9D0C2", background: "#FFFFFF", borderRadius: "2px", cursor: "pointer", color: "#16130F" }}>›</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", color: "#6B6257" }}>Live preview of the inventory view. Try the search, filters and selection.</span>
          </div>
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
      <section style={{ padding: "clamp(3.5rem,7vw,5.5rem) clamp(1rem,3vw,2.5rem) 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: ui.c48, gap: "clamp(1rem,4vw,3rem)", alignItems: "end", paddingBottom: "1.5rem", borderBottom: "2px solid #16130F" }}>
          <div style={{ display: "flex", gap: "0.875rem", alignItems: "baseline" }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8125rem", fontWeight: "600", color: "#C2470A", flex: "none" }}>01</span>
            <h2 style={{ margin: "0", fontSize: "clamp(1.75rem,2.6vw,2.375rem)", lineHeight: "1.08", fontWeight: "600", fontStretch: "102%", letterSpacing: "-.01em", textWrap: "balance" }}>How InPhox fits into your workflow</h2>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: "1.25rem", flexWrap: "wrap" }}>
            <p style={{ margin: "0", fontSize: "0.9375rem", lineHeight: "1.6", color: "#3A342D", maxWidth: "33.75rem", textWrap: "pretty" }}>
              {"Follow one phone from the moment it lands on your bench to the moment it leaves the building. "}<span>{sb.hint}</span>
            </p>
            <button className="hv-3" onClick={toggleMode} style={{ flex: "none", height: "2rem", padding: "0 0.75rem", background: "transparent", border: "1px solid #16130F", borderRadius: "2px", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", letterSpacing: ".04em", color: "#16130F", cursor: "pointer" }}><span>{sb.modeLabel}</span></button>
          </div>
        </div>
      </section>
      <div ref={wrapRef} style={{ position: "relative", height: sb.wrapH }}>
        <div ref={stageRef} style={{ position: sb.stagePos, top: "4rem", height: sb.stageH, display: "flex", flexDirection: "column", overflow: "hidden", background: "#F6F2EA" }}>
          {cr.on ? (
            <div style={{ position: "absolute", left: cr.x, top: cr.y, width: cr.w, height: cr.h, opacity: cr.o, transition: cr.tr, zIndex: "20", pointerEvents: "none" }}>
              {cr.isPhone ? (
                <div style={{ width: "100%", height: "100%", background: "#16130F", borderRadius: cr.rad, padding: cr.pad }}>
                  <div style={{ width: "100%", height: "100%", borderRadius: cr.rad2, background: "#F6F2EA" }} />
                </div>
              ) : null}
              {" "}
              {cr.isBox ? (
                <div style={{ width: "100%", height: "100%", background: "#E9C9A0", border: "2px solid #16130F", position: "relative" }}>
                  <span style={{ position: "absolute", left: "50%", top: "0", bottom: "0", width: "22%", marginLeft: "-11%", background: "#D9AE7C" }} />
                </div>
              ) : null}
              {" "}
              {cr.isPlane ? (
                <svg viewBox="0 0 24 24" width="100%" height="100%" style={{ transform: cr.rot }}>
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="#16130F" />
                </svg>
              ) : null}
            </div>
          ) : null}
          <div style={{ padding: "0 clamp(1rem,3vw,2.5rem)", overflowX: "auto", flex: "none" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(6.5rem,1fr))", borderBottom: "1px solid #D9D0C2", minWidth: "45.5rem" }}>
              {rail.map((s, j) => (
                <button key={j} className="hv-1" onClick={s.onClick} style={{ textAlign: "left", padding: "0.75rem 0.75rem 0.875rem", background: s.bg, color: "#16130F", border: "0", borderRight: "1px solid #D9D0C2", borderTop: `0.1875rem solid ${s.bar}`, cursor: "pointer", display: "flex", flexDirection: "column", gap: "0.1875rem" }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", color: "#6B6257" }}><span>{s.n}</span></span>
                  <span style={{ fontSize: "0.875rem", fontWeight: "600", fontStretch: "100%", whiteSpace: "nowrap" }}><span>{s.name}</span></span>
                </button>
              ))}
            </div>
          </div>
          <div ref={trackRef} onScroll={sb.onTrack} style={{ flex: "1", minHeight: "0", display: "flex", gap: sb.gap, overflowX: sb.ovx, overflowY: "hidden", scrollSnapType: sb.snap, padding: sb.pad }}>
            <div style={{ display: "flex", gap: sb.gap, transform: sb.trackT, transition: "transform 700ms cubic-bezier(.6,0,.2,1)", width: sb.innerW, flex: "none" }}>
              <article style={{ flex: sb.slideFlex, scrollSnapAlign: "start", display: "grid", gridTemplateColumns: ui.c48, gap: "clamp(1.25rem,4vw,3.5rem)", alignItems: "center", alignContent: "center", padding: sb.slidePad, border: sb.slideBorder, background: sb.slideBg, minWidth: "0" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", minWidth: "0" }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8125rem", fontWeight: "600", color: "#C2470A" }}>01 / 07</span>
                  <h3 style={{ margin: "0", fontSize: "clamp(1.375rem,2.2vw,1.875rem)", lineHeight: "1.12", fontWeight: "600", fontStretch: "102%", textWrap: "balance" }}>A device lands on your bench.</h3>
                  <p style={{ margin: "0", fontSize: "1rem", lineHeight: "1.6", color: "#3A342D", textWrap: "pretty" }}>
                    One phone is pulled from a 300-unit lot, a trade-in or a return. Nothing is known about it yet.
                  </p>
                </div>
                <div style={{ position: "relative", height: "clamp(17.5rem,50vh,26.25rem)", background: "#EDE6DA", border: "1px solid #D9D0C2", borderRadius: "0.25rem" }}>
                  <div style={{ position: "absolute", inset: "0", overflow: "hidden", borderRadius: "0.25rem" }}>
                    <span style={{ position: "absolute", top: "0.5rem", left: "0.875rem", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65625rem", color: "#6B6257" }}>Lot L-0418 · 312 units</span>
                    {" "}
                    <span style={{ position: "absolute", top: "0.625rem", left: "50%", marginLeft: "-0.4375rem", width: "0", height: "0", borderLeft: "0.4375rem solid transparent", borderRight: "0.4375rem solid transparent", borderTop: "0.5625rem solid #EB5E12", opacity: s1.tickO, transition: "opacity 300ms", zIndex: "2" }} />
                    {" "}
                    <div style={{ position: "absolute", left: "50%", top: "1.75rem", height: "7.5rem", display: "flex", gap: "1.125rem", zIndex: "2", transform: s1.stripT, transition: "transform 1300ms cubic-bezier(.12,.75,.15,1)" }}>
                      {s1.phones.map((p, j) => (
                        <div key={j} style={{ flex: "none", width: "4rem", height: "7.5rem", background: p.body, borderRadius: "0.6875rem", padding: "0.25rem", outline: `2px solid ${p.ol}`, outlineOffset: "0.1875rem", opacity: p.o, transform: p.t, transition: "transform 650ms cubic-bezier(.3,.1,.2,1), opacity 400ms, outline-color 300ms", position: "relative", zIndex: p.z }}>
                          <div style={{ width: "100%", height: "100%", borderRadius: "0.5rem", background: "#0B0907", position: "relative" }}>
                            <span style={{ position: "absolute", top: "0.3125rem", left: "50%", width: "1.125rem", height: "0.25rem", marginLeft: "-0.5625rem", background: p.body, borderRadius: "2px" }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ position: "absolute", left: "0", right: "0", top: "11.625rem", bottom: "0", background: "#DCD3C5", borderTop: "1px solid #16130F" }} />
                    <div style={{ position: "absolute", left: "0.875rem", bottom: "0.75rem", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", color: "#3A342D", opacity: s1.capO, transition: "opacity 500ms", zIndex: "3" }}>Bench 2 · 1 device · not yet identified</div>
                  </div>
                  <div style={{ position: "absolute", left: "50%", top: "1.75rem", width: "4rem", height: "7.5rem", marginLeft: "-2rem", background: "#16130F", borderRadius: "0.6875rem", padding: "0.25rem", zIndex: "4", pointerEvents: "none", opacity: s1.bpO, transform: s1.bpT, transition: s1.bpTr }}>
                    <div style={{ width: "100%", height: "100%", borderRadius: "0.5rem", background: "#0B0907", position: "relative" }}>
                      <span style={{ position: "absolute", top: "0.3125rem", left: "50%", width: "1.125rem", height: "0.25rem", marginLeft: "-0.5625rem", background: "#16130F", borderRadius: "2px" }} />
                    </div>
                  </div>
                </div>
              </article>
              <article style={{ flex: sb.slideFlex, scrollSnapAlign: "start", display: "grid", gridTemplateColumns: ui.c48, gap: "clamp(1.25rem,4vw,3.5rem)", alignItems: "center", alignContent: "center", padding: sb.slidePad, border: sb.slideBorder, background: sb.slideBg, minWidth: "0" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", minWidth: "0" }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8125rem", fontWeight: "600", color: "#C2470A" }}>02 / 07</span>
                  <h3 style={{ margin: "0", fontSize: "clamp(1.375rem,2.2vw,1.875rem)", lineHeight: "1.12", fontWeight: "600", fontStretch: "102%", textWrap: "balance" }}>Plug it in. InPhox takes it from there.</h3>
                  <p style={{ margin: "0", fontSize: "1rem", lineHeight: "1.6", color: "#3A342D", textWrap: "pretty" }}>
                    There is nothing to type. Within seconds of the cable going in, InPhox reads the IMEI, model, storage, carrier and lock status.
                  </p>
                </div>
                <div style={{ position: "relative", height: "clamp(17.5rem,50vh,26.25rem)", background: "#EDE6DA", border: "1px solid #D9D0C2", borderRadius: "0.25rem", overflow: "hidden" }}>
                  <span style={{ position: "absolute", top: "0.875rem", right: "1rem", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65625rem", color: "#8E857A" }}>Hand + cable render · asset pending</span>
                  {" "}
                  <div data-carry-src="1" style={{ position: "absolute", left: "34%", top: "50%", width: "8.25rem", height: "16.5rem", margin: "-9.375rem 0 0 -4.125rem", background: "#16130F", borderRadius: "1.375rem", padding: "0.375rem", zIndex: "2", opacity: s2.phoneO }}>
                    <div style={{ width: "100%", height: "100%", borderRadius: "1.0625rem", background: s2.screenBg, transition: "background 500ms", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.75rem" }}>
                      <img src="assets/inphox-logo.png" alt="" style={{ width: "2.875rem", height: "2.875rem", opacity: s2.logoO, transform: `scale(${s2.logoS})`, transition: "all 500ms cubic-bezier(.2,.75,.2,1)" }} />
                      <span style={{ fontSize: "0.6875rem", fontWeight: "700", fontStretch: "102%", opacity: s2.logoO, transition: "opacity 500ms", color: "#16130F" }}>InPhox Diagnostics</span>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.53125rem", color: "#6B6257", opacity: s2.r1, transition: "opacity 400ms" }}>IMEI 356798114520331</span>
                    </div>
                  </div>
                  <div style={{ position: "absolute", left: "34%", top: "calc(50% + 7.125rem)", width: "1rem", marginLeft: "-0.5rem", height: "12.5rem", transform: s2.cableT, transition: "transform 800ms cubic-bezier(.2,.75,.2,1)", zIndex: "1" }}>
                    <div style={{ width: "1rem", height: "1.375rem", background: "#3A342D", borderRadius: "2px" }} />
                    <div style={{ width: "0.375rem", height: "11.25rem", background: "#3A342D", margin: "0 auto" }} />
                  </div>
                  <div style={{ position: "absolute", right: "1rem", top: "2.75rem", width: "min(14.375rem,44%)", background: "#FFFFFF", border: "1px solid #D9D0C2", borderRadius: "2px", fontSize: "0.75rem" }}>
                    <div style={{ padding: "0.5rem 0.625rem", borderBottom: "1px solid #D9D0C2", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.625rem", letterSpacing: ".06em", color: s2.statusFg }}><span>{s2.status}</span></div>
                    <div style={{ display: "grid", gridTemplateColumns: "3.875rem 1fr", gap: "0.375rem", padding: "0.4375rem 0.625rem", borderBottom: "1px solid #EDE7DC", opacity: s2.r1, transition: "opacity 400ms" }}>
                      <span style={{ color: "#6B6257" }}>IMEI</span>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem" }}>356798114520331</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "3.875rem 1fr", gap: "0.375rem", padding: "0.4375rem 0.625rem", borderBottom: "1px solid #EDE7DC", opacity: s2.r1, transition: "opacity 400ms 120ms" }}><span style={{ color: "#6B6257" }}>Model</span><span>iPhone 14 Pro · 256 GB</span></div>
                    <div style={{ display: "grid", gridTemplateColumns: "3.875rem 1fr", gap: "0.375rem", padding: "0.4375rem 0.625rem", borderBottom: "1px solid #EDE7DC", opacity: s2.r2, transition: "opacity 400ms" }}><span style={{ color: "#6B6257" }}>Carrier</span><span>Unlocked</span></div>
                    <div style={{ display: "grid", gridTemplateColumns: "3.875rem 1fr", gap: "0.375rem", padding: "0.4375rem 0.625rem", opacity: s2.r2, transition: "opacity 400ms 120ms" }}>
                      <span style={{ color: "#6B6257" }}>Locks</span>
                      <span style={{ color: "#1E7A4A", fontWeight: "600" }}>iCloud off · not blacklisted</span>
                    </div>
                  </div>
                </div>
              </article>
              <article style={{ flex: sb.slideFlex, scrollSnapAlign: "start", display: "grid", gridTemplateColumns: ui.c48, gap: "clamp(1.25rem,4vw,3.5rem)", alignItems: "center", alignContent: "center", padding: sb.slidePad, border: sb.slideBorder, background: sb.slideBg, minWidth: "0" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", minWidth: "0" }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8125rem", fontWeight: "600", color: "#C2470A" }}>03 / 07</span>
                  <h3 style={{ margin: "0", fontSize: "clamp(1.375rem,2.2vw,1.875rem)", lineHeight: "1.12", fontWeight: "600", fontStretch: "102%", textWrap: "balance" }}>Forty devices on one station, done in the time it takes to make coffee.</h3>
                  <p style={{ margin: "0", fontSize: "1rem", lineHeight: "1.6", color: "#3A342D", textWrap: "pretty" }}>
                    Every connected device is verified, diagnosed, securely erased and certified in parallel. Failures name the exact test that failed, so techs know the fix before they pick the phone up.
                  </p>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
                    <button className="hv-2" onClick={goTrial} style={{ height: "2.5rem", padding: "0 1rem", background: "#EB5E12", color: "#16130F", border: "0", borderRadius: "2px", fontSize: "0.875rem", fontWeight: "600", cursor: "pointer" }}>Try bulk diagnostics</button>
                    <a href="#/features" style={{ fontSize: "0.875rem", fontWeight: "600", color: "#16130F", textDecoration: "none", borderBottom: "1px solid #16130F", paddingBottom: "2px" }}>All diagnostic tests</a>
                  </div>
                </div>
                <div style={{ background: "#FFFFFF", border: "1px solid #D9D0C2", borderRadius: "0.25rem", overflow: "hidden", minWidth: "0" }}>
                  <div style={{ overflowX: "auto" }}>
                    <div style={{ minWidth: "35rem" }}>
                      <div style={{ height: "2.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 0.875rem", borderBottom: "1px solid #D9D0C2", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65625rem", letterSpacing: ".06em", textTransform: "uppercase" }}>
                        <span style={{ display: "flex", gap: "0.75rem" }}>
                          <strong>Station B-04</strong>
                          <span style={{ color: "#6B6257" }}>24 ports · 6 connected</span>
                        </span>
                        <span style={{ color: "#6B6257" }}><span>{s3.done}</span>{" / 6 complete"}</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "2.25rem 1.5fr 1.35fr 1.35fr .9fr", gap: "0.625rem", padding: "0 0.875rem", height: "1.875rem", alignItems: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.625rem", letterSpacing: ".06em", textTransform: "uppercase", color: "#6B6257", borderBottom: "1px solid #D9D0C2" }}>
                        <span>Port</span>
                        <span>Device</span>
                        <span>IMEI</span>
                        <span>Functional</span>
                        <span>Erasure</span>
                      </div>
                      {" "}
                      {s3.rows.map((r, j) => (
                        <Fragment key={j}>
                          {" "}
                          <div style={{ display: "grid", gridTemplateColumns: "2.25rem 1.5fr 1.35fr 1.35fr .9fr", gap: "0.625rem", padding: "0 0.875rem", height: "2.5rem", alignItems: "center", fontSize: "0.78125rem", borderBottom: "1px solid #EDE7DC", background: r.bg, transition: "background 400ms" }}>
                            <span data-carry-dst={r.dst} style={{ fontFamily: "'JetBrains Mono',monospace", color: "#6B6257" }}><span>{r.port}</span></span>
                            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}><span>{r.device}</span></span>
                            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.71875rem" }}><span>{r.imei}</span></span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65625rem", fontWeight: "600", color: r.fg }}>
                              <span style={{ width: "0.375rem", height: "0.375rem", flex: "none", background: r.dot }} />
                              <span>{r.func}</span>
                            </span>
                            <span data-carry-src={r.src} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65625rem", color: r.eFg, textAlign: "right" }}><span>{r.erase}</span></span>
                          </div>
                          {" "}
                        </Fragment>
                      ))}
                      {" "}
                      <div style={{ height: "2.25rem", display: "flex", alignItems: "center", gap: "0.75rem", padding: "0 0.875rem", background: "#F6F2EA", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65625rem", color: "#6B6257" }}>
                        <span style={{ flex: "1", height: "0.1875rem", background: "#E2DACD" }}>
                          <span style={{ display: "block", height: "0.1875rem", width: s3.pct, background: "#EB5E12", transition: "width 500ms" }} />
                        </span>
                        <span>Certificates · NIST 800-88 · PDF per IMEI</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
              <article style={{ flex: sb.slideFlex, scrollSnapAlign: "start", display: "grid", gridTemplateColumns: ui.c48, gap: "clamp(1.25rem,4vw,3.5rem)", alignItems: "center", alignContent: "center", padding: sb.slidePad, border: sb.slideBorder, background: sb.slideBg, minWidth: "0" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", minWidth: "0" }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8125rem", fontWeight: "600", color: "#C2470A" }}>04 / 07</span>
                  <h3 style={{ margin: "0", fontSize: "clamp(1.375rem,2.2vw,1.875rem)", lineHeight: "1.12", fontWeight: "600", fontStretch: "102%", textWrap: "balance" }}>Every result decides where the device goes next.</h3>
                  <p style={{ margin: "0", fontSize: "1rem", lineHeight: "1.6", color: "#3A342D", textWrap: "pretty" }}>
                    Graded units are boxed and sent to repair, to a sales order or to a shelf bin, following rules you set once. Nobody has to stop and ask where a phone goes.
                  </p>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <a href="#/features" style={{ fontSize: "0.875rem", fontWeight: "600", color: "#16130F", textDecoration: "none", borderBottom: "1px solid #16130F", paddingBottom: "2px" }}>See routing rules</a>
                  </div>
                </div>
                <div style={{ height: "clamp(17.5rem,50vh,26.25rem)", background: "#EDE6DA", border: "1px solid #D9D0C2", borderRadius: "0.25rem", overflow: "hidden", display: "grid", gridTemplateColumns: "auto auto 1fr", gap: "clamp(0.75rem,2.5vw,2rem)", alignItems: "center", padding: "1.25rem clamp(0.875rem,2.5vw,1.75rem)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1.125rem)", gap: "0.375rem" }}>
                    {s4.tiles.map((t, j) => (
                      <span key={j} style={{ width: "1.125rem", height: "2rem", background: "#16130F", borderRadius: "0.25rem", opacity: t.o, transform: t.t, transition: "all 500ms cubic-bezier(.4,0,.2,1)", transitionDelay: t.d }} />
                    ))}
                  </div>
                  <div data-carry-src="3" data-carry-dst="3" style={{ width: "clamp(5.75rem,10vw,7.5rem)", border: "2px solid #16130F", background: "#FFFFFF", padding: "0.625rem", display: "flex", flexDirection: "column", gap: "0.375rem", transform: s4.boxT, transition: "transform 500ms" }}>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.625rem", letterSpacing: ".06em", color: "#6B6257" }}>BOX 0418</span>
                    <span style={{ fontSize: "1.625rem", fontWeight: "650", fontStretch: "102%", fontFamily: "'JetBrains Mono',monospace" }}><span>{s4.count}</span></span>
                    <span style={{ fontSize: "0.6875rem", color: "#3A342D" }}>devices graded</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", minWidth: "0" }}>
                    {s4.lanes.map((l, j) => (
                      <div key={j} style={{ display: "flex", flexDirection: "column", gap: "0.3125rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", fontWeight: "600" }}>
                          <span><span>{l.name}</span></span>
                          <span style={{ fontFamily: "'JetBrains Mono',monospace" }}><span>{l.n}</span></span>
                        </div>
                        <div style={{ height: "0.5rem", background: "#E2DACD" }}>
                          <div style={{ height: "0.5rem", width: l.w, background: l.c, transition: "width 700ms cubic-bezier(.4,0,.2,1)" }} />
                        </div>
                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65625rem", color: "#3A342D", opacity: l.o, transition: "opacity 400ms", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}><span>{l.dest}</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
              <article style={{ flex: sb.slideFlex, scrollSnapAlign: "start", display: "grid", gridTemplateColumns: ui.c48, gap: "clamp(1.25rem,4vw,3.5rem)", alignItems: "center", alignContent: "center", padding: sb.slidePad, border: sb.slideBorder, background: sb.slideBg, minWidth: "0" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", minWidth: "0" }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8125rem", fontWeight: "600", color: "#C2470A" }}>05 / 07</span>
                  <h3 style={{ margin: "0", fontSize: "clamp(1.375rem,2.2vw,1.875rem)", lineHeight: "1.12", fontWeight: "600", fontStretch: "102%", textWrap: "balance" }}>Fix it, pack it, send it to the warehouse.</h3>
                  <p style={{ margin: "0", fontSize: "1rem", lineHeight: "1.6", color: "#3A342D", textWrap: "pretty" }}>
                    Issues found in testing become repair tickets, with parts linked by serial. Once a device passes retest it's boxed, labeled and tracked to its warehouse bin.
                  </p>
                </div>
                <div style={{ position: "relative", height: "clamp(17.5rem,50vh,26.25rem)", background: "#EDE6DA", border: "1px solid #D9D0C2", borderRadius: "0.25rem", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: "1rem", left: "1.25rem", right: "1.25rem", display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: "0.25rem" }}>
                    {s5.stages.map((g, j) => (
                      <div key={j} style={{ display: "flex", flexDirection: "column", gap: "0.375rem", minWidth: "0" }}>
                        <span style={{ height: "0.1875rem", background: g.bar, transition: "background 300ms" }} />
                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65625rem", color: g.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", transition: "color 300ms" }}><span>{g.t}</span></span>
                      </div>
                    ))}
                  </div>
                  <div style={{ position: "absolute", left: "0", right: "0", bottom: "0", height: "2.5rem", background: "#DCD3C5", borderTop: "1px solid #16130F" }} />
                  {" "}
                  <span style={{ position: "absolute", left: "18%", bottom: "0.75rem", transform: "translateX(-50%)", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65625rem", color: "#6B6257", whiteSpace: "nowrap" }}>Bench R-2</span>
                  <span style={{ position: "absolute", left: "50%", bottom: "0.75rem", transform: "translateX(-50%)", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65625rem", color: "#6B6257", whiteSpace: "nowrap" }}>Packing</span>
                  <span style={{ position: "absolute", left: "82%", bottom: "0.75rem", transform: "translateX(-50%)", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65625rem", color: "#6B6257", whiteSpace: "nowrap" }}>Warehouse A</span>
                  {" "}
                  <div style={{ position: "absolute", left: "82%", bottom: "2.5625rem", width: "8.25rem", marginLeft: "-4.125rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.625rem", color: "#1E7A4A", marginBottom: "0.375rem", whiteSpace: "nowrap", opacity: s5.recvO, transition: "opacity 400ms" }}>Shelved · C-14-03 · 09:30</span>
                    <span style={{ width: "8.25rem", height: "1.75rem", background: "#16130F", clipPath: "polygon(0 100%,50% 0,100% 100%)" }} />
                    <div style={{ width: "7.375rem", height: "5.25rem", background: "#FFFFFF", border: "2px solid #16130F", borderTop: "0", display: "flex", justifyContent: "center", alignItems: "flex-end" }}>
                      <span data-carry-src="4" style={{ width: "2.875rem", height: "3.375rem", background: s5.doorBg, border: "2px solid #16130F", borderBottom: "0", transition: "background 400ms" }} />
                    </div>
                  </div>
                  <div style={{ position: "absolute", left: s5.boxL, bottom: "2.5625rem", width: "6rem", height: "3.875rem", marginLeft: "-3rem", opacity: s5.boxO, transform: `scale(${s5.boxS})`, transformOrigin: "50% 100%", transition: "left 1000ms cubic-bezier(.6,0,.2,1), opacity 300ms, transform 350ms", zIndex: "3" }}>
                    <span style={{ position: "absolute", left: "0", top: "-0.9375rem", width: "3rem", height: "0.9375rem", background: "#D9AE7C", border: "2px solid #16130F", transformOrigin: "0 100%", transform: "rotate(-28deg)", opacity: s5.flapO, transition: "opacity 250ms" }} />
                    {" "}
                    <span style={{ position: "absolute", right: "0", top: "-0.9375rem", width: "3rem", height: "0.9375rem", background: "#D9AE7C", border: "2px solid #16130F", transformOrigin: "100% 100%", transform: "rotate(28deg)", opacity: s5.flapO, transition: "opacity 250ms" }} />
                    {" "}
                    <div style={{ position: "absolute", inset: "0", background: "#E9C9A0", border: "2px solid #16130F" }} />
                    {" "}
                    <span style={{ position: "absolute", left: "50%", top: "2px", bottom: "2px", width: "0.875rem", marginLeft: "-0.4375rem", background: "#D9AE7C", opacity: s5.tapeO, transition: "opacity 250ms" }} />
                    {" "}
                    <span style={{ position: "absolute", left: "0.625rem", right: "0.625rem", bottom: "0.5625rem", background: "#FFFFFF", border: "1px solid #16130F", padding: "2px 0.25rem", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.53125rem", textAlign: "center", opacity: s5.tapeO, transition: "opacity 250ms" }}>BOX 0418</span>
                  </div>
                  <div data-carry-dst="4" style={{ position: "absolute", left: s5.phoneL, bottom: "2.5625rem", width: "6.25rem", height: "11.375rem", marginLeft: "-3.125rem", transformOrigin: "50% 100%", transform: s5.phoneT, opacity: s5.phoneO, transition: "left 700ms cubic-bezier(.5,0,.2,1), transform 500ms cubic-bezier(.4,0,.2,1), opacity 300ms 200ms", zIndex: "2" }}>
                    <div style={{ width: "100%", height: "100%", background: "#16130F", borderRadius: "1rem", padding: "0.3125rem" }}>
                      <div style={{ width: "100%", height: "100%", borderRadius: "0.75rem", background: "#F6F2EA", padding: "1rem 0.5rem 0.5rem", display: "flex", flexDirection: "column", gap: "0.4375rem", opacity: s5.listO, transition: "opacity 300ms" }}>
                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.5rem", color: "#6B6257" }}>RT-2207 · …0331</span>
                        <span style={{ fontSize: "0.6875rem", fontWeight: "700", lineHeight: "1.2", color: s5.hdFg }}><span>{s5.hd}</span></span>
                        {s5.issues.map((i, j) => (
                          <span key={j} style={{ display: "flex", gap: "0.3125rem", alignItems: "flex-start", fontSize: "0.59375rem", lineHeight: "1.3", color: i.fg, transition: "color 300ms" }}>
                            <span style={{ flex: "none", width: "0.375rem", height: "0.375rem", marginTop: "0.1875rem", background: i.fg }} />
                            <span>{i.t}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
              <article style={{ flex: sb.slideFlex, scrollSnapAlign: "start", display: "grid", gridTemplateColumns: ui.c48, gap: "clamp(1.25rem,4vw,3.5rem)", alignItems: "center", alignContent: "center", padding: sb.slidePad, border: sb.slideBorder, background: sb.slideBg, minWidth: "0" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", minWidth: "0" }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8125rem", fontWeight: "600", color: "#C2470A" }}>06 / 07</span>
                  <h3 style={{ margin: "0", fontSize: "clamp(1.375rem,2.2vw,1.875rem)", lineHeight: "1.12", fontWeight: "600", fontStretch: "102%", textWrap: "balance" }}>Every store, every shelf, everyone on shift.</h3>
                  <p style={{ margin: "0", fontSize: "1rem", lineHeight: "1.6", color: "#3A342D", textWrap: "pretty" }}>
                    Run one mall kiosk or forty stores. You can see inventory, transfers and staff activity for each location, down to the bin.
                  </p>
                  <div style={{ padding: "0.75rem 0", borderTop: "1px solid #16130F", fontSize: "0.9375rem", fontWeight: "600", fontStretch: "100%" }}>Built for every growing phone business, from the first counter to the regional chain.</div>
                  <div>
                    <button className="hv-2" onClick={goTrial} style={{ height: "2.5rem", padding: "0 1rem", background: "#EB5E12", color: "#16130F", border: "0", borderRadius: "2px", fontSize: "0.875rem", fontWeight: "600", cursor: "pointer" }}>Plan for multiple locations</button>
                  </div>
                </div>
                <div style={{ position: "relative", height: "clamp(17.5rem,50vh,26.25rem)", backgroundColor: "#EFE9DE", backgroundImage: "linear-gradient(#E2DACD 1px,transparent 1px),linear-gradient(90deg,#E2DACD 1px,transparent 1px)", backgroundSize: "2.5rem 2.5rem", border: "1px solid #D9D0C2", borderRadius: "0.25rem", overflow: "hidden" }}>
                  <div style={{ position: "absolute", left: "-10%", right: "-10%", top: "52%", height: "0.5rem", background: "#FFFFFF", borderTop: "1px solid #D9D0C2", borderBottom: "1px solid #D9D0C2", transform: "rotate(-7deg)" }} />
                  <div style={{ position: "absolute", top: "-20%", bottom: "-20%", left: "47%", width: "0.5rem", background: "#FFFFFF", borderLeft: "1px solid #D9D0C2", borderRight: "1px solid #D9D0C2", transform: "rotate(14deg)" }} />
                  <div style={{ position: "absolute", top: "-20%", bottom: "-20%", left: "24%", width: "0.375rem", background: "#FFFFFF", borderLeft: "1px solid #D9D0C2", borderRight: "1px solid #D9D0C2", transform: "rotate(-22deg)" }} />
                  {" "}
                  <span style={{ position: "absolute", right: "0.875rem", bottom: "0.625rem", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65625rem", color: "#6B6257" }}>Dallas–Fort Worth · 3 locations</span>
                  {" "}
                  {s6.locs.map((lc, j) => (
                    <Fragment key={j}>
                      {" "}
                      <div data-carry-src={lc.src} data-carry-dst={lc.dst} style={{ position: "absolute", left: lc.x, top: lc.y, width: "1rem", height: "1rem", margin: "-0.5rem 0 0 -0.5rem", opacity: lc.pinO, transform: lc.pinT, transition: "all 450ms cubic-bezier(.2,.75,.2,1)", transitionDelay: lc.pinD, zIndex: lc.z }}>
                        <span style={{ position: "absolute", inset: "0", borderRadius: "50%", background: lc.pinBg, border: "0.1875rem solid #FFFFFF", boxShadow: "0 0 0 1px #16130F", transition: "background 300ms" }} />
                        {" "}
                        <div style={{ position: "absolute", top: lc.cTop, bottom: lc.cBot, left: lc.cLeft, right: lc.cRight, width: "11.5rem", background: "#FFFFFF", border: "1px solid #16130F", boxShadow: "0 0.5rem 1.5rem rgba(22,19,15,.12)", padding: "0.625rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.375rem", transformOrigin: lc.origin, transform: `scale(${lc.cardS})`, opacity: lc.cardO, transition: "all 400ms cubic-bezier(.2,.75,.2,1)" }}>
                          <div>
                            <div style={{ fontSize: "0.875rem", fontWeight: "600" }}><span>{lc.name}</span></div>
                            <div style={{ fontSize: "0.6875rem", color: "#6B6257" }}><span>{lc.type}</span></div>
                          </div>
                          <div style={{ display: "flex", alignItems: "baseline", gap: "0.375rem", borderTop: "1px solid #EDE7DC", paddingTop: "0.375rem" }}>
                            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "1.125rem", fontWeight: "600" }}><span>{lc.stock}</span></span>
                            <span style={{ fontSize: "0.6875rem", color: "#3A342D" }}>{"in stock · "}<span>{lc.avail}</span></span>
                          </div>
                          <div style={{ borderTop: "1px solid #EDE7DC", paddingTop: "0.375rem", fontSize: "0.71875rem", color: "#3A342D", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                            <span style={{ width: "0.4375rem", height: "0.4375rem", borderRadius: "50%", background: "#1E7A4A", flex: "none" }} />
                            <span>{lc.staffStr}</span>
                          </div>
                        </div>
                        {" "}
                        <span style={{ position: "absolute", top: "-0.25rem", left: "1.375rem", whiteSpace: "nowrap", padding: "2px 0.375rem", background: "#FFFFFF", border: "1px solid #D9D0C2", fontSize: "0.6875rem", fontWeight: "600", opacity: lc.tagO, transition: "opacity 300ms" }}>
                          <span>{lc.name}</span>{" · "}
                          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: "500" }}><span>{lc.stock}</span></span>
                        </span>
                      </div>
                      {" "}
                    </Fragment>
                  ))}
                </div>
              </article>
              <article style={{ flex: sb.slideFlex, scrollSnapAlign: "start", display: "grid", gridTemplateColumns: ui.c48, gap: "clamp(1.25rem,4vw,3.5rem)", alignItems: "center", alignContent: "center", padding: sb.slidePad, border: sb.slideBorder, background: sb.slideBg, minWidth: "0" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", minWidth: "0" }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8125rem", fontWeight: "600", color: "#C2470A" }}>07 / 07</span>
                  <h3 style={{ margin: "0", fontSize: "clamp(1.375rem,2.2vw,1.875rem)", lineHeight: "1.12", fontWeight: "600", fontStretch: "102%", textWrap: "balance" }}>Negotiate on rules, not gut feel.</h3>
                  <p style={{ margin: "0", fontSize: "1rem", lineHeight: "1.6", color: "#3A342D", textWrap: "pretty" }}>
                    Offers arrive in one queue. InPhox counters inside your floor prices, and you can step in at any point until the price settles.
                  </p>
                </div>
                <div style={{ height: "clamp(17.5rem,50vh,26.25rem)", background: "#EDE6DA", border: "1px solid #D9D0C2", borderRadius: "0.25rem", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <div style={{ flex: "none", padding: "0.625rem 1.25rem", background: "#FFFFFF", borderBottom: "1px solid #D9D0C2", display: "flex", justifyContent: "space-between", gap: "0.625rem", alignItems: "baseline", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.84375rem", fontWeight: "600" }}>12 × iPhone 13 · 128 GB · Grade B</span>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65625rem", color: "#6B6257" }}>{"Your floor $340 · "}<span>{s7.roundStr}</span></span>
                  </div>
                  <div data-carry-dst="6" style={{ flex: "none", display: "grid", gridTemplateColumns: "minmax(0,1fr) auto minmax(0,1fr)", alignItems: "end", gap: "0.75rem", padding: "0.875rem 1.25rem 0.625rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: "0" }}>
                      <span style={{ fontSize: "0.75rem", color: "#3A342D" }}>Riverbend Repair offers</span>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "clamp(1.5rem,2.6vw,2.125rem)", fontWeight: "600", color: s7.numFg, transition: "color 300ms" }}><span>{s7.bLab}</span></span>
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", padding: "0.25rem 0.5rem", background: s7.gapBg, color: s7.gapFg, border: `1px solid ${s7.gapBd}`, marginBottom: "0.5rem", whiteSpace: "nowrap", transition: "all 300ms" }}><span>{s7.gap}</span></span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: "flex-end", minWidth: "0" }}>
                      <span style={{ fontSize: "0.75rem", color: "#3A342D" }}>
                        {"You ask "}
                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.625rem", color: "#C2470A" }}><span>{s7.who}</span></span>
                      </span>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "clamp(1.5rem,2.6vw,2.125rem)", fontWeight: "600", color: s7.numFg, transition: "color 300ms" }}><span>{s7.sLab}</span></span>
                    </div>
                  </div>
                  <div style={{ flex: "none", margin: "0 1.25rem" }}>
                    <div style={{ position: "relative", height: "0.75rem", background: "#FFFFFF", border: "1px solid #D9D0C2" }}>
                      <div style={{ position: "absolute", left: "0", top: "0", bottom: "0", width: s7.bW, background: s7.bFill, transition: "width 500ms cubic-bezier(.4,0,.2,1), background 300ms" }} />
                      <div style={{ position: "absolute", right: "0", top: "0", bottom: "0", width: s7.sW, background: s7.sFill, transition: "width 500ms cubic-bezier(.4,0,.2,1), background 300ms" }} />
                      <div style={{ position: "absolute", left: s7.floorX, top: "-0.25rem", bottom: "-0.25rem", width: "2px", background: "#B3261E" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.625rem", color: "#6B6257", marginTop: "0.25rem" }}><span>$300</span><span style={{ color: "#B3261E" }}>floor</span><span>$380</span></div>
                  </div>
                  <div style={{ flex: "1", minHeight: "0", overflow: "hidden", margin: "0.5rem 1.25rem 0", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                    <div style={{ flex: "none", display: "grid", gridTemplateColumns: "3.5rem 1fr 1fr 3.5rem", gap: "0.5rem", padding: "0.375rem 0", borderBottom: "1px solid #16130F", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.625rem", color: "#6B6257" }}>
                      <span>Round</span>
                      <span>Buyer</span>
                      <span>You</span>
                      <span style={{ textAlign: "right" }}>Gap</span>
                    </div>
                    {s7.rows.map((r, j) => (
                      <div key={j} style={{ flex: "none", display: "grid", gridTemplateColumns: "3.5rem 1fr 1fr 3.5rem", gap: "0.5rem", padding: "0.3125rem 0", borderBottom: "1px solid #D9D0C2", fontSize: "0.78125rem", alignItems: "baseline" }}>
                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", color: "#6B6257" }}><span>{r.n}</span></span>
                        <span style={{ fontFamily: "'JetBrains Mono',monospace" }}><span>{r.b}</span></span>
                        <span style={{ fontFamily: "'JetBrains Mono',monospace" }}>
                          <span>{r.s}</span>{" "}
                          <span style={{ fontSize: "0.625rem", color: "#6B6257" }}><span>{r.by}</span></span>
                        </span>
                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", textAlign: "right", color: r.gFg }}><span>{r.g}</span></span>
                      </div>
                    ))}
                  </div>
                  <div style={{ flex: "none", padding: "0.625rem 1.25rem", background: s7.resBg, color: s7.resFg, fontSize: "0.8125rem", fontWeight: "600", transition: "all 300ms" }}><span>{s7.result}</span></div>
                </div>
              </article>
            </div>
          </div>
          <div style={{ flex: "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", padding: `0.625rem clamp(1rem,3vw,2.5rem) ${sb.footPad}`, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", color: "#6B6257", borderTop: "1px solid #D9D0C2" }}>
            <span>{"Scene "}<span>{sb.num}</span>{" / 07 · "}<span>{sb.foot}</span></span>
            {sb.isSlides ? (
              <span style={{ display: "flex", gap: "0.375rem" }}>
                <button className="hv-3" onClick={sb.prev} aria-label="Previous scene" style={{ width: "2.25rem", height: "2rem", border: "1px solid #16130F", background: "transparent", borderRadius: "2px", cursor: "pointer", fontSize: "0.875rem", color: "#16130F" }}>←</button>
                <button className="hv-3" onClick={sb.next} aria-label="Next scene" style={{ width: "2.25rem", height: "2rem", border: "1px solid #16130F", background: "transparent", borderRadius: "2px", cursor: "pointer", fontSize: "0.875rem", color: "#16130F" }}>→</button>
              </span>
            ) : null}
          </div>
        </div>
      </div>
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
      <section ref={moreRef} style={{ background: "#16130F", color: "#F6F2EA", padding: "clamp(3rem,6vw,4.5rem) clamp(1rem,3vw,2.5rem)", display: "grid", gridTemplateColumns: ui.c75, gap: "2rem", alignItems: "end" }}>
        <div>
          <div style={{ display: "flex", gap: "0.875rem", alignItems: "baseline" }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8125rem", fontWeight: "600", color: "#EB5E12", flex: "none" }}>03</span>
            <h2 style={{ margin: "0", fontSize: "clamp(1.75rem,3vw,2.75rem)", lineHeight: "1.05", fontWeight: "650", fontStretch: "104%", letterSpacing: "-.015em", textWrap: "balance", maxWidth: "47.5rem" }}>Plug in ten of your phones and judge the results yourself.</h2>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <p style={{ margin: "0", fontSize: "1rem", lineHeight: "1.6", color: "#D9D0C2" }}>
            Every plan includes intake, device checks and inventory; Growth and up add the Double Puff station app on your own bench.
          </p>
          <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
            <button className="hv-2" onClick={goTrial} style={{ height: "3rem", padding: "0 1.25rem", background: "#EB5E12", color: "#16130F", border: "0", borderRadius: "2px", fontSize: "0.9375rem", fontWeight: "600", cursor: "pointer" }}>Get started</button>
            <a className="hv-7" href="#/contact" style={{ height: "3rem", padding: "0 1.25rem", display: "inline-flex", alignItems: "center", border: "1px solid #F6F2EA", borderRadius: "2px", fontSize: "0.9375rem", fontWeight: "600", color: "#F6F2EA", textDecoration: "none" }}>Book a walkthrough</a>
          </div>
        </div>
        <div style={{ gridColumn: "1 / -1", marginTop: "clamp(1rem,3vw,2rem)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(10,minmax(0,1fr))", gap: "clamp(0.375rem,1.6vw,1.375rem)", padding: "0 clamp(0.25rem,2vw,1.75rem)" }}>
            {tenPhones.map((p, j) => (
              <div key={j} style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "0" }}>
                <div style={{ width: "100%", maxWidth: "4.625rem", aspectRatio: "1 / 2", background: "#2A251F", border: `1px solid ${p.bd}`, borderRadius: "0.625rem", padding: "0.25rem", transition: "border-color 300ms" }}>
                  <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "0.4375rem", background: p.scr, transition: "background 400ms", overflow: "hidden" }}>
                    <div style={{ position: "absolute", inset: "0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem", opacity: p.bootO, transition: "opacity 300ms" }}>
                      <img src="assets/inphox-logo.png" alt="" style={{ width: "46%", transform: `scale(${p.logoS})`, transition: "transform 400ms cubic-bezier(.2,.75,.2,1)" }} />
                      <span style={{ width: "64%", height: "0.1875rem", background: "#D9D0C2", opacity: p.barO, transition: "opacity 200ms" }}>
                        <span style={{ display: "block", height: "0.1875rem", width: p.barW, background: "#EB5E12", transition: p.barTr }} />
                      </span>
                    </div>
                    <div style={{ position: "absolute", inset: "0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.375rem", padding: "0.25rem", opacity: p.resO, transition: "opacity 300ms" }}>
                      <span style={{ width: "0.625rem", height: "0.625rem", background: p.c }} />
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "clamp(0.4375rem,.75vw,0.625rem)", fontWeight: "600", color: p.c, textAlign: "center", lineHeight: "1.2" }}><span>{p.t}</span></span>
                    </div>
                  </div>
                </div>
                <span style={{ width: "2px", height: "clamp(1.125rem,2.4vw,2rem)", background: p.cable, transformOrigin: "50% 100%", transform: `scaleY(${p.cableS})`, transition: "transform 300ms cubic-bezier(.2,.75,.2,1), background 300ms" }} />
              </div>
            ))}
          </div>
          <div style={{ height: "1rem", background: "#3A342D", border: "1px solid #6B6257", borderRadius: "2px" }} />
          <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.625rem", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", color: "#B9AE9E" }}><span>USB hub · Station B-04 · 10 of 24 ports</span><span><span>{tenSum}</span></span></div>
        </div>
      </section>
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
