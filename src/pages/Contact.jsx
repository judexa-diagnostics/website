export default function Contact({ v }) {
  const { ct, goTrial, ui } = v;
  return (
    <section style={{ padding: "clamp(48px,6vw,80px) clamp(16px,3vw,40px) clamp(56px,7vw,96px)", display: "grid", gridTemplateColumns: ui.c57, gap: "clamp(32px,5vw,80px)", alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <h1 style={{ margin: "0", fontSize: "clamp(32px,3.2vw,48px)", lineHeight: "1.04", fontWeight: "650", fontStretch: "104%", letterSpacing: "-.02em", textWrap: "balance" }}>Tell us how your floor runs. We'll show you InPhox on it.</h1>
        <p style={{ margin: "0", fontSize: "16px", lineHeight: "1.6", color: "#3A342D" }}>
          A 20-minute walkthrough with someone who knows refurb and repair, built around your device mix and the number of locations you run.
        </p>
        <div style={{ borderTop: "1px solid #16130F", marginTop: "8px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "12px", padding: "12px 0", borderBottom: "1px solid #D9D0C2", fontSize: "14px" }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "11px", letterSpacing: ".06em", textTransform: "uppercase", color: "#6B6257", paddingTop: "2px" }}>Reply</span>
            <span>Within one business day</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "12px", padding: "12px 0", borderBottom: "1px solid #D9D0C2", fontSize: "14px" }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "11px", letterSpacing: ".06em", textTransform: "uppercase", color: "#6B6257", paddingTop: "2px" }}>Email</span>
            <a href="mailto:sales@inphox.com" style={{ color: "#16130F" }}>sales@inphox.com</a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "12px", padding: "12px 0", borderBottom: "1px solid #D9D0C2", fontSize: "14px" }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "11px", letterSpacing: ".06em", textTransform: "uppercase", color: "#6B6257", paddingTop: "2px" }}>Support</span>
            <span>Existing customers: use Help inside the app</span>
          </div>
        </div>
      </div>
      {ct.sent ? (
        <div style={{ background: "#FFFFFF", border: "1px solid #16130F", borderRadius: "4px", padding: "28px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "11px", letterSpacing: ".02em", color: "#1E7A4A" }}>Request received · REQ-<span>{ct.ref}</span></span>
          <span style={{ fontSize: "24px", fontWeight: "600", fontStretch: "102%" }}>{"Thanks, "}<span>{ct.first}</span>. We'll be in touch within a business day.</span>
          <span style={{ fontSize: "15px", lineHeight: "1.6", color: "#3A342D" }}>
            {"We'll email "}<span>{ct.email}</span>{" with a few times for a walkthrough. Meanwhile, you can create your account and connect a station."}
          </span>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "6px" }}>
            <button onClick={goTrial} style={{ height: "44px", padding: "0 18px", background: "#EB5E12", color: "#16130F", border: "0", borderRadius: "2px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>Join now</button>
            <button onClick={ct.reset} style={{ height: "44px", padding: "0 18px", background: "transparent", color: "#16130F", border: "1px solid #16130F", borderRadius: "2px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>Send another request</button>
          </div>
        </div>
      ) : null}
      {ct.form ? (
        <form onSubmit={ct.submit} style={{ background: "#FFFFFF", border: "1px solid #D9D0C2", borderRadius: "4px", padding: "clamp(18px,2.5vw,28px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "16px" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", fontWeight: "600" }}>
            {"Full name "}
            <input className="fc-9" value={ct.v.name} onChange={ct.set.name} style={{ height: "44px", padding: "0 12px", border: `1px solid ${ct.bd.name}`, borderRadius: "2px", fontSize: "15px", fontWeight: "400", color: "#16130F", outline: "none", background: "#FFFFFF" }} />
            <span style={{ fontSize: "12px", fontWeight: "400", color: "#B3261E" }}><span>{ct.e.name}</span></span>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", fontWeight: "600" }}>
            {"Work email "}
            <input className="fc-9" value={ct.v.email} onChange={ct.set.email} type="email" style={{ height: "44px", padding: "0 12px", border: `1px solid ${ct.bd.email}`, borderRadius: "2px", fontSize: "15px", fontWeight: "400", color: "#16130F", outline: "none", background: "#FFFFFF" }} />
            <span style={{ fontSize: "12px", fontWeight: "400", color: "#B3261E" }}><span>{ct.e.email}</span></span>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", fontWeight: "600" }}>
            {"Company "}
            <input className="fc-9" value={ct.v.company} onChange={ct.set.company} style={{ height: "44px", padding: "0 12px", border: `1px solid ${ct.bd.company}`, borderRadius: "2px", fontSize: "15px", fontWeight: "400", color: "#16130F", outline: "none", background: "#FFFFFF" }} />
            <span style={{ fontSize: "12px", fontWeight: "400", color: "#B3261E" }}><span>{ct.e.company}</span></span>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", fontWeight: "600" }}>
            {"Locations "}
            <select value={ct.v.locs} onChange={ct.set.locs} style={{ height: "44px", padding: "0 10px", border: "1px solid #D9D0C2", borderRadius: "2px", fontSize: "15px", fontWeight: "400", color: "#16130F", background: "#FFFFFF" }}>
              {" "}
              <option value="">Select…</option>
              <option>1</option>
              <option>2–3</option>
              <option>4–10</option>
              <option>11–40</option>
              <option>40+</option>
              {" "}
            </select>
            <span style={{ fontSize: "12px" }} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", fontWeight: "600", gridColumn: "1 / -1" }}>
            {"Devices processed per month "}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {ct.volumes.map((o, j) => (
                <button key={j} type="button" onClick={o.pick} style={{ height: "40px", padding: "0 14px", borderRadius: "2px", border: `1px solid ${o.bd}`, background: o.bg, color: o.fg, fontFamily: "'JetBrains Mono',monospace", fontSize: "12.5px", cursor: "pointer" }}><span>{o.t}</span></button>
              ))}
            </div>
            <span style={{ fontSize: "12px", fontWeight: "400", color: "#B3261E" }}><span>{ct.e.volume}</span></span>
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", fontWeight: "600", gridColumn: "1 / -1" }}>
            {"What are you using today? "}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {ct.reps.map((o, j) => (
                <button key={j} type="button" onClick={o.pick} style={{ height: "36px", padding: "0 12px", borderRadius: "2px", border: `1px solid ${o.bd}`, background: o.bg, color: o.fg, fontSize: "13px", fontWeight: "500", cursor: "pointer" }}><span>{o.t}</span></button>
              ))}
            </div>
          </div>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", fontWeight: "600", gridColumn: "1 / -1" }}>
            {"Anything we should know? "}
            <span style={{ fontWeight: "400", color: "#6B6257" }}>Optional</span>
            <textarea className="fc-9" value={ct.v.msg} onChange={ct.set.msg} rows="4" placeholder="e.g. We grade 300 iPhones a week and track parts in a spreadsheet." style={{ padding: "10px 12px", border: "1px solid #D9D0C2", borderRadius: "2px", fontSize: "15px", fontWeight: "400", color: "#16130F", outline: "none", resize: "vertical", background: "#FFFFFF" }} />
          </label>
          <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap", paddingTop: "4px" }}>
            <span style={{ fontSize: "12px", color: "#6B6257" }}>We'll only use this to follow up on your request.</span>
            <button className="hv-2" type="submit" style={{ height: "48px", padding: "0 22px", background: "#EB5E12", color: "#16130F", border: "0", borderRadius: "2px", fontSize: "15px", fontWeight: "600", cursor: "pointer" }}>Request a walkthrough</button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
