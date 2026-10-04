import { Fragment } from 'react';

export default function SiteMenu({ v }) {
  const { goSignin, goTrial, menuItems, toggleMenu } = v;
  return (
    <>
      <div onClick={toggleMenu} style={{ position: "fixed", inset: "4rem 0 0 0", background: "rgba(22,19,15,.18)", zIndex: "55" }} />
      <div style={{ position: "fixed", top: "4rem", right: "clamp(0px,3vw,2.5rem)", width: "min(27.5rem,100vw)", maxHeight: "calc(100vh - 4rem)", overflow: "auto", background: "#FFFFFF", border: "1px solid #16130F", borderTop: "0", boxShadow: "0 0.5rem 1.5rem rgba(22,19,15,.12)", zIndex: "58" }}>
        {menuItems.map((m, j) => (
          <Fragment key={j}>
            {" "}
            <a className="hv-1" href={m.href} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "2px 1rem", padding: "1rem 1.25rem", borderBottom: "1px solid #EDE7DC", color: "#16130F", textDecoration: "none", background: m.bg }}>
              <span style={{ fontSize: "1.125rem", fontWeight: "600", fontStretch: "102%" }}><span>{m.label}</span></span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", color: "#6B6257", alignSelf: "center" }}><span>{m.path}</span></span>
              <span style={{ fontSize: "0.8125rem", color: "#6B6257", gridColumn: "1 / -1" }}><span>{m.desc}</span></span>
            </a>
            {" "}
          </Fragment>
        ))}
        {" "}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", padding: "1rem 1.25rem", background: "#F6F2EA" }}>
          <button onClick={goTrial} style={{ height: "2.75rem", background: "#EB5E12", border: "0", borderRadius: "2px", fontSize: "0.875rem", fontWeight: "600", cursor: "pointer", color: "#16130F" }}>Join now</button>
          <button onClick={goSignin} style={{ height: "2.75rem", background: "transparent", border: "1px solid #16130F", borderRadius: "2px", fontSize: "0.875rem", fontWeight: "600", cursor: "pointer", color: "#16130F" }}>Sign in</button>
        </div>
      </div>
    </>
  );
}
