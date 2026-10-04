export default function Footer({ v }) {
  const { goSignin, goTrial, langName } = v;
  return (
    <footer style={{ borderTop: "2px solid #16130F", padding: "40px clamp(16px,3vw,40px) 28px", display: "flex", flexDirection: "column", gap: "36px", background: "#F6F2EA" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: "28px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", gridColumn: "span 2", minWidth: "0" }}>
          <a href="#/home" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "#16130F" }}>
            <img src="assets/inphox-logo.png" alt="" style={{ width: "30px", height: "30px" }} />
            <span style={{ fontSize: "18px", fontWeight: "700", fontStretch: "104%" }}>InPhox</span>
          </a>
          <p style={{ margin: "0", fontSize: "14px", lineHeight: "1.55", color: "#3A342D", maxWidth: "320px" }}>
            Diagnostics, inventory, repair and sales for businesses that buy, fix and resell electronics.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px" }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "11px", letterSpacing: ".02em", color: "#6B6257", marginBottom: "4px" }}>Product</span>
          <a href="#/features" style={{ color: "#16130F", textDecoration: "none" }}>Features</a>
          <a href="#/industries" style={{ color: "#16130F", textDecoration: "none" }}>Industries</a>
          <a href="#/pricing" style={{ color: "#16130F", textDecoration: "none" }}>Pricing</a>
          <a href="#/platform" style={{ color: "#16130F", textDecoration: "none" }}>Integrations</a>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px" }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "11px", letterSpacing: ".02em", color: "#6B6257", marginBottom: "4px" }}>Get started</span>
          <a href="#/start" onClick={goTrial} style={{ color: "#16130F", textDecoration: "none" }}>Join now</a>
          <a href="#/start" onClick={goSignin} style={{ color: "#16130F", textDecoration: "none" }}>Sign in</a>
          <a href="#/contact" style={{ color: "#16130F", textDecoration: "none" }}>Contact sales</a>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px" }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "11px", letterSpacing: ".02em", color: "#6B6257", marginBottom: "4px" }}>Company</span>
          <a href="#/platform" style={{ color: "#16130F", textDecoration: "none" }}>{"Security & compliance"}</a>
          <a href="#/contact" style={{ color: "#16130F", textDecoration: "none" }}>Contact</a>
          <a href="#/home" style={{ color: "#16130F", textDecoration: "none" }}>Privacy</a>
          <a href="#/home" style={{ color: "#16130F", textDecoration: "none" }}>Terms</a>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", paddingTop: "16px", borderTop: "1px solid #D9D0C2", fontFamily: "'JetBrains Mono',monospace", fontSize: "11px", color: "#6B6257" }}><span>© 2026 InPhox, Inc.</span><span>{"Language: "}<span>{langName}</span></span></div>
    </footer>
  );
}
