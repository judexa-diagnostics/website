import { LazyMotion, MotionConfig, domMax, m } from 'motion/react';
import { FxScope, Tween } from '../redesign/fx/index.jsx';

const SEL = '#16130F';

export default function Features({ v }) {
  const { feat, ui } = v;
  // Rows that stay glide to their new place when the filter changes; rows that
  // appear rise in (FxScope picks them up).
  return (
    <LazyMotion features={domMax} strict>
    <MotionConfig reducedMotion="user">
    <FxScope>
      <section style={{ padding: "clamp(3rem,6vw,4.5rem) clamp(1rem,3vw,2.5rem) 1.5rem", display: "grid", gridTemplateColumns: ui.c48, gap: "clamp(1rem,4vw,3rem)", alignItems: "end" }}>
        <h1 data-fx="" style={{ margin: "0", fontSize: "clamp(2rem,3.4vw,3.125rem)", lineHeight: "1.02", fontWeight: "650", fontStretch: "104%", letterSpacing: "-.02em" }}>Features</h1>
        <p data-fx="" style={{ margin: "0", fontSize: "1rem", lineHeight: "1.6", color: "#3A342D", maxWidth: "38.75rem" }}>Every feature, listed plainly. Every plan includes all of them except the Double Puff station app, which comes with Growth and Enterprise; plans also differ in included checks, stations, staff users and support.</p>
      </section>
      <section style={{ padding: "0 clamp(1rem,3vw,2.5rem) clamp(3.5rem,7vw,5.5rem)" }}>
        <div data-fx="fade" data-fx-delay="120" style={{ position: "sticky", top: "4rem", zIndex: "5", background: "#F6F2EA", padding: "0.75rem 0", borderBottom: "1px solid #D9D0C2", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <input className="fc-9" value={feat.q} onChange={feat.setQ} placeholder="Search features, e.g. erasure, labels, IMEI" style={{ flex: "1 1 17.5rem", height: "2.5rem", padding: "0 0.75rem", border: "1px solid #D9D0C2", borderRadius: "2px", background: "#FFFFFF", fontSize: "0.875rem", color: "#16130F", outline: "none" }} />
          </div>
          <div style={{ display: "flex", gap: "0.375rem", overflowX: "auto", paddingBottom: "2px", scrollbarWidth: "none" }}>
            {feat.mods.map((md, j) => (
              <button key={j} className="fx-press" onClick={md.pick} style={{ position: "relative", flex: "none", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: "0.25rem", height: "2rem", padding: "0 0.625rem", borderRadius: "2px", border: `1px solid ${md.bd}`, background: md.bg === SEL ? "#FFFFFF" : md.bg, color: md.fg, fontSize: "0.8125rem", fontWeight: "500", cursor: "pointer", transition: "color 250ms ease, border-color 250ms ease, transform 160ms ease" }}>
                {md.bg === SEL ? <m.span layoutId="feat-chip" transition={{ type: "spring", stiffness: 520, damping: 40 }} style={{ position: "absolute", inset: "-1px", background: SEL, borderRadius: "2px", zIndex: 0 }} /> : null}
                <span style={{ position: "relative" }}>{md.t}</span>{" "}
                <span style={{ position: "relative", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", opacity: ".7" }}><span>{md.n}</span></span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: "37.5rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "8.125rem 1.2fr 2fr", gap: "0.75rem", height: "2.5rem", alignItems: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", letterSpacing: ".06em", textTransform: "uppercase", color: "#6B6257", borderBottom: "1px solid #16130F" }}>
              <span>Module</span>
              <span>Feature</span>
              <span>What it does</span>
            </div>
            {" "}
            {feat.rows.map((r, j) => (
              <m.div key={r.m + "|" + r.f} layout="position" className="hv-1"
                transition={{ duration: 0.32, ease: [0.2, 0.75, 0.2, 1] }}
                style={{ display: "grid", gridTemplateColumns: "8.125rem 1.2fr 2fr", gap: "0.75rem", padding: "0.75rem 0", alignItems: "baseline", borderBottom: "1px solid #EDE7DC", fontSize: "0.875rem" }}>
                <span data-fx="" data-fx-gap="16" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.71875rem", color: "#6B6257" }}><span>{r.m}</span></span>
                <span data-fx="" data-fx-gap="16" style={{ fontWeight: "600" }}><span>{r.f}</span></span>
                <span data-fx="" data-fx-gap="16" style={{ color: "#3A342D", lineHeight: "1.45" }}><span>{r.d}</span></span>
              </m.div>
            ))}
          </div>
        </div>
        {" "}
        {feat.empty ? (
          <>
            {" "}
            <div className="fx-mount" style={{ padding: "2.5rem 0", borderBottom: "1px solid #D9D0C2", display: "flex", flexDirection: "column", gap: "0.625rem", alignItems: "flex-start" }}>
              <span style={{ fontSize: "1.0625rem", fontWeight: "600" }}>No features match “<span>{feat.q}</span>”</span>
              <span style={{ fontSize: "0.875rem", color: "#3A342D" }}>Try a broader term, or ask us whether it's on the roadmap.</span>
              <div style={{ display: "flex", gap: "0.625rem" }}>
                <button onClick={feat.clear} style={{ height: "2.25rem", padding: "0 0.875rem", border: "1px solid #16130F", background: "transparent", borderRadius: "2px", fontSize: "0.8125rem", fontWeight: "600", cursor: "pointer", color: "#16130F" }}>Clear filters</button>
                <a href="#/contact" style={{ height: "2.25rem", display: "inline-flex", alignItems: "center", fontSize: "0.8125rem", fontWeight: "600", color: "#16130F" }}>Ask sales</a>
              </div>
            </div>
            {" "}
          </>
        ) : null}
        {" "}
        <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap", paddingTop: "1rem", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.75rem", color: "#6B6257" }}>
          <span>{"Showing "}<Tween value={String(feat.count)} duration={350} />{" of "}<span>{feat.total}</span>{" features"}</span>
          <a className="fx-arrow" href="#/pricing" style={{ color: "#C2470A" }}>Compare plan prices <span className="fx-arr">→</span></a>
        </div>
      </section>
    </FxScope>
    </MotionConfig>
    </LazyMotion>
  );
}
