import { Fragment, useEffect, useRef } from 'react';
import '../redesign/fx/fx.css';

export default function Header({ v }) {
  const { goTrial, startLabel, menuOpen, langCode, langOpen, langs, loginUrl, menuBtnBg, menuBtnFg, menuLabel, nav, toggleLang, toggleMenu, ui } = v;
  // Frost the bar once the page scrolls; written to the DOM, no re-render.
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let last = null;
    const on = () => { const s = window.scrollY > 8 ? '1' : '0'; if (s !== last) { last = s; el.dataset.scrolled = s; } };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <header ref={ref} className="fx-head" style={{ position: "sticky", top: "0", zIndex: "60", height: "4rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", padding: "0 clamp(1rem,3vw,2.5rem)", background: "var(--pmm-bg)", borderBottom: "1px solid var(--pmm-border-soft)" }}>
      <a className="fx-logo" href="#/home" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none", color: "var(--pmm-text)", flex: "none" }}>
        <img src="assets/inphox-logo.png" alt="InPhox" style={{ width: "2.125rem", height: "2.125rem" }} />
        <span style={{ fontSize: "1.25rem", fontWeight: "700", letterSpacing: "-.01em" }}>InPhox</span>
      </a>
      <nav style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.9375rem", fontWeight: "500" }}>
        <div style={{ position: "relative", display: ui.wideFlex }}>
          <button className="hv-0" onClick={toggleLang} style={{ height: "2.25rem", padding: "0 0.625rem", background: "transparent", border: "0", borderRadius: "var(--pmm-radius)", fontFamily: "var(--pmm-font-mono)", fontSize: "0.75rem", color: "var(--pmm-text)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.375rem" }}>
            <span style={{ width: "0.8125rem", height: "0.8125rem", border: "1.5px solid var(--pmm-text)", borderRadius: "50%", display: "inline-block" }} />
            <span>{langCode}</span>{" ▾"}
          </button>
          {langOpen ? (
            <div className="fx-drop" style={{ position: "absolute", top: "2.5rem", left: "0", width: "11.25rem", background: "var(--pmm-surface)", border: "1px solid var(--pmm-border-soft)", borderRadius: "var(--pmm-radius-card)", overflow: "hidden", boxShadow: "var(--pmm-shadow-lg)", zIndex: "70" }}>
              {langs.map((l, j) => (
                <Fragment key={j}>
                  {" "}
                  <button className="hv-1" onClick={l.pick} style={{ width: "100%", height: "2.5rem", padding: "0 0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center", background: l.bg, border: "0", borderBottom: "1px solid var(--pmm-border-soft)", fontSize: "0.875rem", color: "var(--pmm-text)", cursor: "pointer", textAlign: "left" }}>
                    <span><span>{l.name}</span></span>
                    <span style={{ fontFamily: "var(--pmm-font-mono)", fontSize: "0.6875rem", color: "var(--pmm-text-3)" }}><span>{l.code}</span></span>
                  </button>
                  {" "}
                </Fragment>
              ))}
            </div>
          ) : null}
        </div>
        <a className="hv-0 fx-ul" href="#/pricing" style={{ position: "relative", height: "2.25rem", padding: "0 0.75rem", display: ui.wideFlex, alignItems: "center", color: "var(--pmm-text)", textDecoration: "none", borderBottom: `2px solid ${nav.pricing}` }}>Pricing</a>
        <a className="hv-0 fx-ul" href={loginUrl} style={{ position: "relative", height: "2.25rem", padding: "0 0.75rem", display: ui.wideFlex, alignItems: "center", color: "var(--pmm-text)", textDecoration: "none", marginRight: "0.375rem" }}>Sign in</a>
        <button type="button" className="ix-btn is-primary is-sm fx-press" onClick={goTrial} style={{ whiteSpace: "nowrap" }}>{startLabel}</button>
        <button className="hv-3 fx-press" onClick={toggleMenu} aria-label="Menu" style={{ height: "2.25rem", padding: "0 0.75rem", marginLeft: "0.375rem", background: menuBtnBg, color: menuBtnFg, border: "1px solid var(--pmm-border-soft)", borderRadius: "var(--pmm-radius)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: "var(--pmm-font-mono)", fontSize: "0.75rem" }}>
          <span style={{ display: "flex", flexDirection: "column", gap: "0.1875rem" }}>
            <span style={{ width: "0.875rem", height: "1.5px", background: "currentColor", transition: "transform 280ms cubic-bezier(.2,.75,.2,1)", transform: menuOpen ? "translateY(0.28125rem) rotate(45deg)" : "none" }} />
            <span style={{ width: "0.875rem", height: "1.5px", background: "currentColor", transition: "opacity 200ms ease", opacity: menuOpen ? 0 : 1 }} />
            <span style={{ width: menuOpen ? "0.875rem" : "0.5625rem", height: "1.5px", background: "currentColor", transition: "transform 280ms cubic-bezier(.2,.75,.2,1), width 280ms ease", transform: menuOpen ? "translateY(-0.28125rem) rotate(-45deg)" : "none" }} />
          </span>
          <span>{menuLabel}</span>
        </button>
      </nav>
    </header>
  );
}
