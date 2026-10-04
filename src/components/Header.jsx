import { Fragment } from 'react';

export default function Header({ v }) {
  const { goSignin, goTrial, langCode, langOpen, langs, menuBtnBg, menuBtnFg, menuLabel, nav, toggleLang, toggleMenu, ui } = v;
  return (
    <header style={{ position: "sticky", top: "0", zIndex: "60", height: "4rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", padding: "0 clamp(1rem,3vw,2.5rem)", background: "#F6F2EA", borderBottom: "1px solid #D9D0C2" }}>
      <a href="#/home" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none", color: "#16130F", flex: "none" }}>
        <img src="assets/inphox-logo.png" alt="InPhox" style={{ width: "2.125rem", height: "2.125rem" }} />
        <span style={{ fontSize: "1.25rem", fontWeight: "700", fontStretch: "104%", letterSpacing: "-.01em" }}>InPhox</span>
      </a>
      <nav style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.875rem", fontWeight: "500" }}>
        <div style={{ position: "relative", display: ui.wideFlex }}>
          <button className="hv-0" onClick={toggleLang} style={{ height: "2.25rem", padding: "0 0.625rem", background: "transparent", border: "0", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.75rem", color: "#16130F", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.375rem" }}>
            <span style={{ width: "0.8125rem", height: "0.8125rem", border: "1.5px solid #16130F", borderRadius: "50%", display: "inline-block" }} />
            <span>{langCode}</span>{" ▾"}
          </button>
          {langOpen ? (
            <div style={{ position: "absolute", top: "2.5rem", left: "0", width: "11.25rem", background: "#FFFFFF", border: "1px solid #16130F", boxShadow: "0 0.5rem 1.5rem rgba(22,19,15,.12)", zIndex: "70" }}>
              {langs.map((l, j) => (
                <Fragment key={j}>
                  {" "}
                  <button className="hv-1" onClick={l.pick} style={{ width: "100%", height: "2.5rem", padding: "0 0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center", background: l.bg, border: "0", borderBottom: "1px solid #EDE7DC", fontSize: "0.875rem", color: "#16130F", cursor: "pointer", textAlign: "left" }}>
                    <span><span>{l.name}</span></span>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", color: "#6B6257" }}><span>{l.code}</span></span>
                  </button>
                  {" "}
                </Fragment>
              ))}
            </div>
          ) : null}
        </div>
        <a className="hv-0" href="#/pricing" style={{ height: "2.25rem", padding: "0 0.75rem", display: ui.wideFlex, alignItems: "center", color: "#16130F", textDecoration: "none", borderBottom: `2px solid ${nav.pricing}` }}>Pricing</a>
        <a className="hv-0" href="#/start" onClick={goSignin} style={{ height: "2.25rem", padding: "0 0.75rem", display: ui.wideFlex, alignItems: "center", color: "#16130F", textDecoration: "none", marginRight: "0.375rem" }}>Sign in</a>
        <button className="hv-2" onClick={goTrial} style={{ height: "2.25rem", padding: "0 0.875rem", background: "#EB5E12", color: "#16130F", border: "0", borderRadius: "2px", fontSize: "0.875rem", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" }}>Join now</button>
        <button className="hv-3" onClick={toggleMenu} aria-label="Menu" style={{ height: "2.25rem", padding: "0 0.75rem", marginLeft: "0.375rem", background: menuBtnBg, color: menuBtnFg, border: "1px solid #16130F", borderRadius: "2px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.75rem" }}>
          <span style={{ display: "flex", flexDirection: "column", gap: "0.1875rem" }}>
            <span style={{ width: "0.875rem", height: "1.5px", background: "currentColor" }} />
            <span style={{ width: "0.875rem", height: "1.5px", background: "currentColor" }} />
            <span style={{ width: "0.5625rem", height: "1.5px", background: "currentColor" }} />
          </span>
          <span>{menuLabel}</span>
        </button>
      </nav>
    </header>
  );
}
