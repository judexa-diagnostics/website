import { Fragment } from 'react';
import { AG_APP } from '../chrome.js';

export default function SiteMenu({ v }) {
  const { goTrial, startLabel, loginUrl, menuItems, toggleMenu, chrome } = v;
  const { c, isAg, switcher } = chrome;
  return (
    <>
      <div className="fx-backdrop" onClick={toggleMenu} style={{ position: "fixed", inset: "4rem 0 0 0", background: "rgba(15,23,42,.18)", zIndex: "55" }} />
      <div className="fx-sheet" style={{ position: "fixed", top: "4rem", right: "clamp(0px,3vw,2.5rem)", width: "min(27.5rem,100vw)", maxHeight: "calc(100vh - 4rem)", overflow: "auto", background: "var(--pmm-surface)", border: "1px solid var(--pmm-border-soft)", borderTop: "0", borderRadius: "0 0 var(--pmm-radius-card) var(--pmm-radius-card)", boxShadow: "var(--pmm-shadow-lg)", zIndex: "58" }}>
        {/* Which inphox product: the same switch as the header, so it is there on a phone too. */}
        <nav aria-label={c.products} className="fx-item" style={{ "--i": 0, padding: "0.875rem 1.25rem", borderBottom: "1px solid var(--pmm-border-soft)", background: "var(--pmm-surface-2)" }}>
          <div style={{ fontFamily: "var(--pmm-font-mono)", fontSize: "0.875rem", color: "var(--pmm-text-2)", marginBottom: "0.5rem" }}>{c.switchTo}</div>
          <div className="fx-prod is-block">
            {switcher.map(p => (
              <a key={p.key} href={p.href} aria-current={p.on ? "page" : undefined} className={"fx-prod-opt" + (p.on ? " is-on" : "")}>{p.label}</a>
            ))}
          </div>
          {chrome.showLang ? (
            <div role="group" aria-label={c.language} style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
              {v.langs.map(l => (
                <button key={l.code} type="button" onClick={l.pick} aria-pressed={l.code === v.langCode} className="ix-btn is-sm" style={{ background: l.bg }}>{l.name}</button>
              ))}
            </div>
          ) : null}
        </nav>
        {menuItems.map((m, j) => (
          <Fragment key={j}>
            {" "}
            <a className="hv-1 fx-item" href={m.href} style={{ "--i": j + 1, display: "grid", gridTemplateColumns: "1fr auto", gap: "2px 1rem", padding: "1rem 1.25rem", borderBottom: "1px solid var(--pmm-border-soft)", color: "var(--pmm-text)", textDecoration: "none", background: m.bg }}>
              <span style={{ fontSize: "1.125rem", fontWeight: "700" }}><span>{m.label}</span>{m.ext ? <span aria-hidden="true">{" ↗"}</span> : null}</span>
              <span style={{ fontFamily: "var(--pmm-font-mono)", fontSize: "0.6875rem", color: "var(--pmm-text-3)", alignSelf: "center", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", maxWidth: "11rem", whiteSpace: "nowrap" }}><span>{m.path}</span></span>
              <span style={{ fontSize: "0.8125rem", color: "var(--pmm-text-2)", gridColumn: "1 / -1" }}><span>{m.desc}</span></span>
            </a>
            {" "}
          </Fragment>
        ))}
        {" "}
        <div className="fx-item" style={{ "--i": menuItems.length + 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", padding: "1rem 1.25rem", background: "var(--pmm-surface-2)" }}>
          {isAg ? (
            <>
              <a className="ix-btn is-primary fx-press" href={chrome.agStartMenu}>{c.agStart}</a>
              <a className="ix-btn fx-press" href={AG_APP + '/'}>{c.agSignin}</a>
            </>
          ) : (
            <>
              <button type="button" className="ix-btn is-primary fx-press" onClick={goTrial}>{startLabel}</button>
              <a className="ix-btn fx-press" href={loginUrl}>{c.signin}</a>
            </>
          )}
        </div>
      </div>
    </>
  );
}
