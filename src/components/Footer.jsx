import { useRef } from 'react';
import { useReveal } from '../redesign/fx/index.jsx';
import { COMPANY_POSTAL_ADDRESS, COMPANY_PHONE, COMPANY_LINKEDIN } from '../config.js';
import { AG_APP, AG_DOCS, AG_PRICING } from '../chrome.js';

export default function Footer({ v }) {
  const { goTrial, startLabel, langName, loginUrl, chrome } = v;
  const f = chrome.c.foot, agHome = chrome.lc === 'es' ? '/es/autograding' : '/autograding';
  const L = { color: "var(--pmm-text)", textDecoration: "none", alignSelf: "flex-start" };
  const H = { fontFamily: "var(--pmm-font-mono)", fontSize: "1rem", letterSpacing: ".02em", color: "var(--pmm-text-3)", marginBottom: "0.25rem" };
  const ref = useRef(null);
  useReveal(ref);
  return (
    <footer ref={ref} style={{ marginTop: "clamp(2rem,5vw,3.5rem)", borderTop: "1px solid var(--pmm-border-soft)", padding: "2.5rem clamp(1rem,3vw,2.5rem) 1.75rem", display: "flex", flexDirection: "column", gap: "2.25rem", background: "var(--pmm-surface-2)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(10.625rem,1fr))", gap: "1.75rem" }}>
        <div data-fx="" data-fx-gap="90" style={{ display: "flex", flexDirection: "column", gap: "0.625rem", gridColumn: v.ui.wideBlock === "block" ? "span 2" : "1 / -1", minWidth: "0" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none", color: "var(--pmm-text)" }}>
            <img src="/assets/inphox-logo.png" alt="" style={{ width: "1.875rem", height: "1.875rem" }} />
            <span style={{ fontSize: "1.125rem", fontWeight: "700" }}>inphox</span>
          </a>
          <p style={{ margin: "0", fontSize: "1rem", lineHeight: "1.55", color: "var(--pmm-text-2)", maxWidth: "20rem" }}>
            {f.blurb}
          </p>
        </div>
        <div data-fx="" data-fx-gap="90" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "1rem" }}>
          <span style={H}>{f.inventory}</span>
          <a className="fx-ul fx-ul-tight" href="/features" style={L}>{f.features}</a>
          <a className="fx-ul fx-ul-tight" href="/industries" style={L}>{f.industries}</a>
          <a className="fx-ul fx-ul-tight" href="/pricing" style={L}>{f.pricing}</a>
          <a className="fx-ul fx-ul-tight" href="/platform" style={L}>{f.built}</a>
        </div>
        <div data-fx="" data-fx-gap="90" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "1rem" }}>
          <span style={H}>{f.autograding}</span>
          <a className="fx-ul fx-ul-tight" href={agHome} style={L}>{f.agOverview}</a>
          <a className="fx-ul fx-ul-tight" href={AG_PRICING} style={L}>{f.agPricing}</a>
          <a className="fx-ul fx-ul-tight" href={AG_DOCS} style={L}>{f.agDocs}</a>
          <a className="fx-ul fx-ul-tight" href={AG_APP + '/'} style={L}>{f.agSignin}</a>
        </div>
        <div data-fx="" data-fx-gap="90" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "1rem" }}>
          <span style={{ fontFamily: "var(--pmm-font-mono)", fontSize: "1rem", letterSpacing: ".02em", color: "var(--pmm-text-3)", marginBottom: "0.25rem" }}>{f.start}</span>
          <a className="fx-ul fx-ul-tight" href="/start" onClick={goTrial} style={{ color: "var(--pmm-text)", textDecoration: "none", alignSelf: "flex-start" }}>{startLabel}</a>
          <a className="fx-ul fx-ul-tight" href={loginUrl} style={L}>{f.signin}</a>
          <a className="fx-ul fx-ul-tight" href="/contact" style={{ color: "var(--pmm-text)", textDecoration: "none", alignSelf: "flex-start" }}>{f.sales}</a>
        </div>
        <div data-fx="" data-fx-gap="90" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "1rem" }}>
          <span style={{ fontFamily: "var(--pmm-font-mono)", fontSize: "1rem", letterSpacing: ".02em", color: "var(--pmm-text-3)", marginBottom: "0.25rem" }}>{f.company}</span>
          <a className="fx-ul fx-ul-tight" href="/about" style={{ color: "var(--pmm-text)", textDecoration: "none", alignSelf: "flex-start" }}>{f.aboutUs}</a>
          <a className="fx-ul fx-ul-tight" href="/security" style={L}>{f.security}</a>
          <a className="fx-ul fx-ul-tight" href="/careers" style={{ color: "var(--pmm-text)", textDecoration: "none", alignSelf: "flex-start" }}>{f.careers}</a>
          <a className="fx-ul fx-ul-tight" href={COMPANY_LINKEDIN} rel="me noopener" target="_blank" style={L}>LinkedIn</a>
          <a className="fx-ul fx-ul-tight" href="/contact" style={{ color: "var(--pmm-text)", textDecoration: "none", alignSelf: "flex-start" }}>{f.contact}</a>
          <a className="fx-ul fx-ul-tight" href="/privacy" style={{ color: "var(--pmm-text)", textDecoration: "none", alignSelf: "flex-start" }}>{f.privacy}</a>
          <a className="fx-ul fx-ul-tight" href="/terms" style={{ color: "var(--pmm-text)", textDecoration: "none", alignSelf: "flex-start" }}>{f.terms}</a>
          <a className="fx-ul fx-ul-tight" href="/refunds" style={{ color: "var(--pmm-text)", textDecoration: "none", alignSelf: "flex-start" }}>{f.refunds}</a>
          <a className="fx-ul fx-ul-tight" href="/copyright" style={{ color: "var(--pmm-text)", textDecoration: "none", alignSelf: "flex-start" }}>{f.copyright}</a>
          <a className="fx-ul fx-ul-tight" href="/law-enforcement" style={{ color: "var(--pmm-text)", textDecoration: "none", alignSelf: "flex-start" }}>{f.law}</a>
          <a className="fx-ul fx-ul-tight" href="/subprocessors" style={{ color: "var(--pmm-text)", textDecoration: "none", alignSelf: "flex-start" }}>{f.subprocessors}</a>
          <a className="fx-ul fx-ul-tight" href="/erasure" style={{ color: "var(--pmm-text)", textDecoration: "none", alignSelf: "flex-start" }}>{f.erasure}</a>
          <a className="fx-ul fx-ul-tight" href="/cookies" style={{ color: "var(--pmm-text)", textDecoration: "none", alignSelf: "flex-start" }}>{f.cookies}</a>
          <a className="fx-ul fx-ul-tight" href="/accessibility" style={{ color: "var(--pmm-text)", textDecoration: "none", alignSelf: "flex-start" }}>{f.accessibility}</a>
        </div>
      </div>
      <div data-fx="fade" style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap", paddingTop: "1rem", borderTop: "1px solid var(--pmm-border-soft)", fontFamily: "var(--pmm-font-mono)", fontSize: "1rem", color: "var(--pmm-text-3)" }}><span>{"© 2026 inphox LLC · " + (chrome.lc === "es" ? "Fundada por Christopher Luk" : "Founded by Christopher Luk")}</span><span>{["inphox LLC", COMPANY_POSTAL_ADDRESS, COMPANY_PHONE].filter(Boolean).join(" · ")}</span><span>{f.language + ": "}<span>{langName}</span></span></div>
    </footer>
  );
}
