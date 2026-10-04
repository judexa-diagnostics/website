export default function Footer({ v }) {
  const { goTrial, langName, loginUrl } = v;
  return (
    <footer style={{ borderTop: "2px solid #16130F", padding: "2.5rem clamp(1rem,3vw,2.5rem) 1.75rem", display: "flex", flexDirection: "column", gap: "2.25rem", background: "#F6F2EA" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(10.625rem,1fr))", gap: "1.75rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", gridColumn: "span 2", minWidth: "0" }}>
          <a href="#/home" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none", color: "#16130F" }}>
            <img src="assets/inphox-logo.png" alt="" style={{ width: "1.875rem", height: "1.875rem" }} />
            <span style={{ fontSize: "1.125rem", fontWeight: "700", fontStretch: "104%" }}>InPhox</span>
          </a>
          <p style={{ margin: "0", fontSize: "0.875rem", lineHeight: "1.55", color: "#3A342D", maxWidth: "20rem" }}>
            Diagnostics, inventory, repair and sales for businesses that buy, fix and resell electronics.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.875rem" }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", letterSpacing: ".02em", color: "#6B6257", marginBottom: "0.25rem" }}>Product</span>
          <a href="#/features" style={{ color: "#16130F", textDecoration: "none" }}>Features</a>
          <a href="#/industries" style={{ color: "#16130F", textDecoration: "none" }}>Industries</a>
          <a href="#/pricing" style={{ color: "#16130F", textDecoration: "none" }}>Pricing</a>
          <a href="#/platform" style={{ color: "#16130F", textDecoration: "none" }}>Integrations</a>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.875rem" }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", letterSpacing: ".02em", color: "#6B6257", marginBottom: "0.25rem" }}>Get started</span>
          <a href="#/start" onClick={goTrial} style={{ color: "#16130F", textDecoration: "none" }}>Join now</a>
          <a href={loginUrl} style={{ color: "#16130F", textDecoration: "none" }}>Sign in</a>
          <a href="#/contact" style={{ color: "#16130F", textDecoration: "none" }}>Contact sales</a>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.875rem" }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", letterSpacing: ".02em", color: "#6B6257", marginBottom: "0.25rem" }}>Company</span>
          <a href="#/platform" style={{ color: "#16130F", textDecoration: "none" }}>{"Security & compliance"}</a>
          <a href="#/contact" style={{ color: "#16130F", textDecoration: "none" }}>Contact</a>
          <a href="#/home" style={{ color: "#16130F", textDecoration: "none" }}>Privacy</a>
          <a href="#/home" style={{ color: "#16130F", textDecoration: "none" }}>Terms</a>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap", paddingTop: "1rem", borderTop: "1px solid #D9D0C2", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", color: "#6B6257" }}><span>© 2026 InPhox, Inc.</span><span>{"Language: "}<span>{langName}</span></span></div>
    </footer>
  );
}
