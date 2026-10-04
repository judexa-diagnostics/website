export default function PromoBar({ v }) {
  const { goTrial, promo } = v;
  return (
    <div style={{ position: "fixed", left: "0", right: "0", bottom: "0", zIndex: "50", minHeight: "3.5rem", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", background: "#16130F", color: "#F6F2EA", boxShadow: "0 -0.5rem 1.5rem rgba(22,19,15,.12)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", fontSize: "0.875rem", padding: "0.625rem clamp(1rem,3vw,2.5rem)", flex: "1 1 22.5rem" }}>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", letterSpacing: ".02em", color: "#EB5E12", flex: "none" }}>New</span>
        <span>Up to 40 devices per station, with certificates generated automatically.</span>
      </div>
      <div style={{ display: "flex", minHeight: "3.5rem", alignSelf: "stretch" }}>
        <a className="hv-6" href="#/pricing" style={{ display: "flex", alignItems: "center", padding: "0 1.25rem", color: "#F6F2EA", textDecoration: "none", borderLeft: "1px solid #3A342D", fontSize: "0.875rem", fontWeight: "600" }}>Buy a plan</a>
        <button className="hv-2" onClick={goTrial} style={{ padding: "0 1.5rem", background: "#EB5E12", color: "#16130F", border: "0", fontSize: "0.875rem", fontWeight: "600", cursor: "pointer" }}>Get started →</button>
        <button className="hv-11" onClick={promo.dismiss} aria-label="Dismiss" style={{ width: "3rem", background: "transparent", border: "0", borderLeft: "1px solid #3A342D", color: "#B9AE9E", fontSize: "1.125rem", cursor: "pointer" }}>×</button>
      </div>
    </div>
  );
}
