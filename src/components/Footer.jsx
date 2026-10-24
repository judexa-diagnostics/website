import { useRef } from 'react';
import { useReveal } from '../redesign/fx/index.jsx';

export default function Footer({ v }) {
  const { goTrial, langName, loginUrl } = v;
  const ref = useRef(null);
  useReveal(ref);
  return (
    <footer ref={ref} style={{ borderTop: "2px solid #16130F", padding: "2.5rem clamp(1rem,3vw,2.5rem) 1.75rem", display: "flex", flexDirection: "column", gap: "2.25rem", background: "#F6F2EA" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(10.625rem,1fr))", gap: "1.75rem" }}>
        <div data-fx="" data-fx-gap="90" style={{ display: "flex", flexDirection: "column", gap: "0.625rem", gridColumn: "span 2", minWidth: "0" }}>
          <a href="#/home" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none", color: "#16130F" }}>
            <img src="assets/inphox-logo.png" alt="" style={{ width: "1.875rem", height: "1.875rem" }} />
            <span style={{ fontSize: "1.125rem", fontWeight: "700", fontStretch: "104%" }}>InPhox</span>
          </a>
          <p style={{ margin: "0", fontSize: "0.875rem", lineHeight: "1.55", color: "#3A342D", maxWidth: "20rem" }}>
            Diagnostics, inventory, repair and sales for businesses that buy, fix and resell electronics.
          </p>
        </div>
        <div data-fx="" data-fx-gap="90" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.875rem" }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", letterSpacing: ".02em", color: "#6B6257", marginBottom: "0.25rem" }}>Product</span>
          <a className="fx-ul fx-ul-tight" href="#/features" style={{ color: "#16130F", textDecoration: "none", alignSelf: "flex-start" }}>Features</a>
          <a className="fx-ul fx-ul-tight" href="#/industries" style={{ color: "#16130F", textDecoration: "none", alignSelf: "flex-start" }}>Industries</a>
          <a className="fx-ul fx-ul-tight" href="#/pricing" style={{ color: "#16130F", textDecoration: "none", alignSelf: "flex-start" }}>Pricing</a>
          <a className="fx-ul fx-ul-tight" href="#/platform" style={{ color: "#16130F", textDecoration: "none", alignSelf: "flex-start" }}>How it's built</a>
        </div>
        <div data-fx="" data-fx-gap="90" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.875rem" }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", letterSpacing: ".02em", color: "#6B6257", marginBottom: "0.25rem" }}>Get started</span>
          <a className="fx-ul fx-ul-tight" href="#/start" onClick={goTrial} style={{ color: "#16130F", textDecoration: "none", alignSelf: "flex-start" }}>Join now</a>
          <a className="fx-ul fx-ul-tight" href={loginUrl} style={{ color: "#16130F", textDecoration: "none", alignSelf: "flex-start" }}>Sign in</a>
          <a className="fx-ul fx-ul-tight" href="#/contact" style={{ color: "#16130F", textDecoration: "none", alignSelf: "flex-start" }}>Contact sales</a>
        </div>
        <div data-fx="" data-fx-gap="90" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.875rem" }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", letterSpacing: ".02em", color: "#6B6257", marginBottom: "0.25rem" }}>Company</span>
          <a className="fx-ul fx-ul-tight" href="#/platform" style={{ color: "#16130F", textDecoration: "none", alignSelf: "flex-start" }}>{"Security & compliance"}</a>
          <a className="fx-ul fx-ul-tight" href="#/careers" style={{ color: "#16130F", textDecoration: "none", alignSelf: "flex-start" }}>Careers</a>
          <a className="fx-ul fx-ul-tight" href="#/contact" style={{ color: "#16130F", textDecoration: "none", alignSelf: "flex-start" }}>Contact</a>
          <a className="fx-ul fx-ul-tight" href="#/privacy" style={{ color: "#16130F", textDecoration: "none", alignSelf: "flex-start" }}>Privacy</a>
          <a className="fx-ul fx-ul-tight" href="#/terms" style={{ color: "#16130F", textDecoration: "none", alignSelf: "flex-start" }}>Terms</a>
        </div>
      </div>
      <div data-fx="fade" style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap", paddingTop: "1rem", borderTop: "1px solid #D9D0C2", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", color: "#6B6257" }}><span>© 2026 InPhox LLC</span><span>{"Language: "}<span>{langName}</span></span></div>
    </footer>
  );
}
