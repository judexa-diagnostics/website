import { Fragment } from 'react';

export default function SiteMenu({ v }) {
  const { goTrial, startLabel, loginUrl, menuItems, toggleMenu } = v;
  return (
    <>
      <div className="fx-backdrop" onClick={toggleMenu} style={{ position: "fixed", inset: "4rem 0 0 0", background: "rgba(15,23,42,.18)", zIndex: "55" }} />
      <div className="fx-sheet" style={{ position: "fixed", top: "4rem", right: "clamp(0px,3vw,2.5rem)", width: "min(27.5rem,100vw)", maxHeight: "calc(100vh - 4rem)", overflow: "auto", background: "var(--pmm-surface)", border: "1px solid var(--pmm-border-soft)", borderTop: "0", borderRadius: "0 0 var(--pmm-radius-card) var(--pmm-radius-card)", boxShadow: "var(--pmm-shadow-lg)", zIndex: "58" }}>
        {menuItems.map((m, j) => (
          <Fragment key={j}>
            {" "}
            <a className="hv-1 fx-item" href={m.href} style={{ "--i": j, display: "grid", gridTemplateColumns: "1fr auto", gap: "2px 1rem", padding: "1rem 1.25rem", borderBottom: "1px solid var(--pmm-border-soft)", color: "var(--pmm-text)", textDecoration: "none", background: m.bg }}>
              <span style={{ fontSize: "1.125rem", fontWeight: "700" }}><span>{m.label}</span></span>
              <span style={{ fontFamily: "var(--pmm-font-mono)", fontSize: "0.6875rem", color: "var(--pmm-text-3)", alignSelf: "center" }}><span>{m.path}</span></span>
              <span style={{ fontSize: "0.8125rem", color: "var(--pmm-text-2)", gridColumn: "1 / -1" }}><span>{m.desc}</span></span>
            </a>
            {" "}
          </Fragment>
        ))}
        {" "}
        <div className="fx-item" style={{ "--i": menuItems.length, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", padding: "1rem 1.25rem", background: "var(--pmm-surface-2)" }}>
          <button type="button" className="ix-btn is-primary fx-press" onClick={goTrial}>{startLabel}</button>
          <a className="ix-btn fx-press" href={loginUrl}>Sign in</a>
        </div>
      </div>
    </>
  );
}
