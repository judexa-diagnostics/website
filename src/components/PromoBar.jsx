export default function PromoBar({ v }) {
  const { goTrial, promo } = v;
  return (
    <div style={{ position: "fixed", left: "0", right: "0", bottom: "0", zIndex: "50", minHeight: "56px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", background: "#16130F", color: "#F6F2EA", boxShadow: "0 -8px 24px rgba(22,19,15,.12)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "14px", padding: "10px clamp(16px,3vw,40px)", flex: "1 1 360px" }}>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "11px", letterSpacing: ".02em", color: "#EB5E12", flex: "none" }}>New</span>
        <span>Up to 40 devices per station, with certificates generated automatically.</span>
      </div>
      <div style={{ display: "flex", minHeight: "56px", alignSelf: "stretch" }}>
        <a className="hv-6" href="#/pricing" style={{ display: "flex", alignItems: "center", padding: "0 20px", color: "#F6F2EA", textDecoration: "none", borderLeft: "1px solid #3A342D", fontSize: "14px", fontWeight: "600" }}>Buy a plan</a>
        <button className="hv-2" onClick={goTrial} style={{ padding: "0 24px", background: "#EB5E12", color: "#16130F", border: "0", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>Get started →</button>
        <button className="hv-11" onClick={promo.dismiss} aria-label="Dismiss" style={{ width: "48px", background: "transparent", border: "0", borderLeft: "1px solid #3A342D", color: "#B9AE9E", fontSize: "18px", cursor: "pointer" }}>×</button>
      </div>
    </div>
  );
}
