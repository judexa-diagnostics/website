import { useRef } from 'react';
import { useReveal } from '../redesign/fx/index.jsx';

export default function Footer({ v }) {
  const { goTrial, startLabel, langName, loginUrl } = v;
  const ref = useRef(null);
  useReveal(ref);
  return (
    <footer ref={ref} style={{ marginTop: "clamp(2rem,5vw,3.5rem)", borderTop: "1px solid var(--pmm-border-soft)", padding: "2.5rem clamp(1rem,3vw,2.5rem) 1.75rem", display: "flex", flexDirection: "column", gap: "2.25rem", background: "var(--pmm-surface-2)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(10.625rem,1fr))", gap: "1.75rem" }}>
        <div data-fx="" data-fx-gap="90" style={{ display: "flex", flexDirection: "column", gap: "0.625rem", gridColumn: "span 2", minWidth: "0" }}>
          <a href="#/home" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none", color: "var(--pmm-text)" }}>
            <img src="assets/inphox-logo.png" alt="" style={{ width: "1.875rem", height: "1.875rem" }} />
            <span style={{ fontSize: "1.125rem", fontWeight: "700" }}>InPhox</span>
          </a>
          <p style={{ margin: "0", fontSize: "0.875rem", lineHeight: "1.55", color: "var(--pmm-text-2)", maxWidth: "20rem" }}>
            Diagnostics, inventory, repair and sales for businesses that buy, fix and resell electronics.
          </p>
        </div>
        <div data-fx="" data-fx-gap="90" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.875rem" }}>
          <span style={{ fontFamily: "var(--pmm-font-mono)", fontSize: "0.6875rem", letterSpacing: ".02em", color: "var(--pmm-text-3)", marginBottom: "0.25rem" }}>Product</span>
          <a className="fx-ul fx-ul-tight" href="#/features" style={{ color: "var(--pmm-text)", textDecoration: "none", alignSelf: "flex-start" }}>Features</a>
          <a className="fx-ul fx-ul-tight" href="#/industries" style={{ color: "var(--pmm-text)", textDecoration: "none", alignSelf: "flex-start" }}>Industries</a>
          <a className="fx-ul fx-ul-tight" href="#/pricing" style={{ color: "var(--pmm-text)", textDecoration: "none", alignSelf: "flex-start" }}>Pricing</a>
          <a className="fx-ul fx-ul-tight" href="#/platform" style={{ color: "var(--pmm-text)", textDecoration: "none", alignSelf: "flex-start" }}>How it's built</a>
        </div>
        <div data-fx="" data-fx-gap="90" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.875rem" }}>
          <span style={{ fontFamily: "var(--pmm-font-mono)", fontSize: "0.6875rem", letterSpacing: ".02em", color: "var(--pmm-text-3)", marginBottom: "0.25rem" }}>Start</span>
          <a className="fx-ul fx-ul-tight" href="#/start" onClick={goTrial} style={{ color: "var(--pmm-text)", textDecoration: "none", alignSelf: "flex-start" }}>{startLabel}</a>
          <a className="fx-ul fx-ul-tight" href={loginUrl} style={{ color: "var(--pmm-text)", textDecoration: "none", alignSelf: "flex-start" }}>Sign in</a>
          <a className="fx-ul fx-ul-tight" href="#/contact" style={{ color: "var(--pmm-text)", textDecoration: "none", alignSelf: "flex-start" }}>Contact sales</a>
        </div>
        <div data-fx="" data-fx-gap="90" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.875rem" }}>
          <span style={{ fontFamily: "var(--pmm-font-mono)", fontSize: "0.6875rem", letterSpacing: ".02em", color: "var(--pmm-text-3)", marginBottom: "0.25rem" }}>Company</span>
          <a className="fx-ul fx-ul-tight" href="#/platform" style={{ color: "var(--pmm-text)", textDecoration: "none", alignSelf: "flex-start" }}>{"Security & compliance"}</a>
          <a className="fx-ul fx-ul-tight" href="#/careers" style={{ color: "var(--pmm-text)", textDecoration: "none", alignSelf: "flex-start" }}>Careers</a>
          <a className="fx-ul fx-ul-tight" href="#/contact" style={{ color: "var(--pmm-text)", textDecoration: "none", alignSelf: "flex-start" }}>Contact</a>
          <a className="fx-ul fx-ul-tight" href="#/home" style={{ color: "var(--pmm-text)", textDecoration: "none", alignSelf: "flex-start" }}>Privacy</a>
          <a className="fx-ul fx-ul-tight" href="#/home" style={{ color: "var(--pmm-text)", textDecoration: "none", alignSelf: "flex-start" }}>Terms</a>
        </div>
      </div>
      <div data-fx="fade" style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap", paddingTop: "1rem", borderTop: "1px solid var(--pmm-border-soft)", fontFamily: "var(--pmm-font-mono)", fontSize: "0.6875rem", color: "var(--pmm-text-3)" }}><span>© 2026 InPhox, Inc.</span><span>{"Language: "}<span>{langName}</span></span></div>
    </footer>
  );
}
