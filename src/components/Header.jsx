import { Fragment } from 'react';

export default function Header({ v }) {
  const { goSignin, goTrial, langCode, langOpen, langs, menuBtnBg, menuBtnFg, menuLabel, nav, toggleLang, toggleMenu, ui } = v;
  return (
    <header style={{ position: "sticky", top: "0", zIndex: "60", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "0 clamp(16px,3vw,40px)", background: "#F6F2EA", borderBottom: "1px solid #D9D0C2" }}>
      <a href="#/home" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "#16130F", flex: "none" }}>
        <img src="assets/inphox-logo.png" alt="InPhox" style={{ width: "34px", height: "34px" }} />
        <span style={{ fontSize: "20px", fontWeight: "700", fontStretch: "104%", letterSpacing: "-.01em" }}>InPhox</span>
      </a>
      <nav style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "14px", fontWeight: "500" }}>
        <div style={{ position: "relative", display: ui.wideFlex }}>
          <button className="hv-0" onClick={toggleLang} style={{ height: "36px", padding: "0 10px", background: "transparent", border: "0", fontFamily: "'JetBrains Mono',monospace", fontSize: "12px", color: "#16130F", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "13px", height: "13px", border: "1.5px solid #16130F", borderRadius: "50%", display: "inline-block" }} />
            <span>{langCode}</span>{" ▾"}
          </button>
          {langOpen ? (
            <div style={{ position: "absolute", top: "40px", left: "0", width: "180px", background: "#FFFFFF", border: "1px solid #16130F", boxShadow: "0 8px 24px rgba(22,19,15,.12)", zIndex: "70" }}>
              {langs.map((l, j) => (
                <Fragment key={j}>
                  {" "}
                  <button className="hv-1" onClick={l.pick} style={{ width: "100%", height: "40px", padding: "0 12px", display: "flex", justifyContent: "space-between", alignItems: "center", background: l.bg, border: "0", borderBottom: "1px solid #EDE7DC", fontSize: "14px", color: "#16130F", cursor: "pointer", textAlign: "left" }}>
                    <span><span>{l.name}</span></span>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "11px", color: "#6B6257" }}><span>{l.code}</span></span>
                  </button>
                  {" "}
                </Fragment>
              ))}
            </div>
          ) : null}
        </div>
        <a className="hv-0" href="#/pricing" style={{ height: "36px", padding: "0 12px", display: ui.wideFlex, alignItems: "center", color: "#16130F", textDecoration: "none", borderBottom: `2px solid ${nav.pricing}` }}>Pricing</a>
        <a className="hv-0" href="#/start" onClick={goSignin} style={{ height: "36px", padding: "0 12px", display: ui.wideFlex, alignItems: "center", color: "#16130F", textDecoration: "none", marginRight: "6px" }}>Sign in</a>
        <button className="hv-2" onClick={goTrial} style={{ height: "36px", padding: "0 14px", background: "#EB5E12", color: "#16130F", border: "0", borderRadius: "2px", fontSize: "14px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" }}>Join now</button>
        <button className="hv-3" onClick={toggleMenu} aria-label="Menu" style={{ height: "36px", padding: "0 12px", marginLeft: "6px", background: menuBtnBg, color: menuBtnFg, border: "1px solid #16130F", borderRadius: "2px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontFamily: "'JetBrains Mono',monospace", fontSize: "12px" }}>
          <span style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <span style={{ width: "14px", height: "1.5px", background: "currentColor" }} />
            <span style={{ width: "14px", height: "1.5px", background: "currentColor" }} />
            <span style={{ width: "9px", height: "1.5px", background: "currentColor" }} />
          </span>
          <span>{menuLabel}</span>
        </button>
      </nav>
    </header>
  );
}
