export default function Contact({ v }) {
  const { ct, goTrial, ui } = v;
  return (
    <section style={{ padding: "clamp(3rem,6vw,5rem) clamp(1rem,3vw,2.5rem) clamp(3.5rem,7vw,6rem)", display: "grid", gridTemplateColumns: ui.c57, gap: "clamp(2rem,5vw,5rem)", alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
        <h1 style={{ margin: "0", fontSize: "clamp(2rem,3.2vw,3rem)", lineHeight: "1.04", fontWeight: "650", fontStretch: "104%", letterSpacing: "-.02em", textWrap: "balance" }}>Tell us how your floor runs. We'll show you InPhox on it.</h1>
        <p style={{ margin: "0", fontSize: "1rem", lineHeight: "1.6", color: "#3A342D" }}>
          A 20-minute walkthrough with someone who knows refurb and repair, built around your device mix and the number of locations you run.
        </p>
        <div style={{ borderTop: "1px solid #16130F", marginTop: "0.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "7.5rem 1fr", gap: "0.75rem", padding: "0.75rem 0", borderBottom: "1px solid #D9D0C2", fontSize: "0.875rem" }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", letterSpacing: ".06em", textTransform: "uppercase", color: "#6B6257", paddingTop: "2px" }}>Reply</span>
            <span>Within one business day</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "7.5rem 1fr", gap: "0.75rem", padding: "0.75rem 0", borderBottom: "1px solid #D9D0C2", fontSize: "0.875rem" }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", letterSpacing: ".06em", textTransform: "uppercase", color: "#6B6257", paddingTop: "2px" }}>Email</span>
            <a href="mailto:sales@inphox.com" style={{ color: "#16130F" }}>sales@inphox.com</a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "7.5rem 1fr", gap: "0.75rem", padding: "0.75rem 0", borderBottom: "1px solid #D9D0C2", fontSize: "0.875rem" }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", letterSpacing: ".06em", textTransform: "uppercase", color: "#6B6257", paddingTop: "2px" }}>Support</span>
            <span>Existing customers: use Help inside the app</span>
          </div>
        </div>
      </div>
      {ct.sent ? (
        <div style={{ background: "#FFFFFF", border: "1px solid #16130F", borderRadius: "0.25rem", padding: "1.75rem", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", letterSpacing: ".02em", color: "#1E7A4A" }}>Request received · REQ-<span>{ct.ref}</span></span>
          <span style={{ fontSize: "1.5rem", fontWeight: "600", fontStretch: "102%" }}>{"Thanks, "}<span>{ct.first}</span>. We'll be in touch within a business day.</span>
          <span style={{ fontSize: "0.9375rem", lineHeight: "1.6", color: "#3A342D" }}>
            {"We'll email "}<span>{ct.email}</span>{" with a few times for a walkthrough. Meanwhile, you can create your account and connect a station."}
          </span>
          <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap", marginTop: "0.375rem" }}>
            <button onClick={goTrial} style={{ height: "2.75rem", padding: "0 1.125rem", background: "#EB5E12", color: "#16130F", border: "0", borderRadius: "2px", fontSize: "0.875rem", fontWeight: "600", cursor: "pointer" }}>Join now</button>
            <button onClick={ct.reset} style={{ height: "2.75rem", padding: "0 1.125rem", background: "transparent", color: "#16130F", border: "1px solid #16130F", borderRadius: "2px", fontSize: "0.875rem", fontWeight: "600", cursor: "pointer" }}>Send another request</button>
          </div>
        </div>
      ) : null}
      {ct.form ? (
        <form onSubmit={ct.submit} style={{ background: "#FFFFFF", border: "1px solid #D9D0C2", borderRadius: "0.25rem", padding: "clamp(1.125rem,2.5vw,1.75rem)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(13.75rem,1fr))", gap: "1rem" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.375rem", fontSize: "0.8125rem", fontWeight: "600" }}>
            {"Full name "}
            <input className="fc-9" value={ct.v.name} onChange={ct.set.name} style={{ height: "2.75rem", padding: "0 0.75rem", border: `1px solid ${ct.bd.name}`, borderRadius: "2px", fontSize: "0.9375rem", fontWeight: "400", color: "#16130F", outline: "none", background: "#FFFFFF" }} />
            <span style={{ fontSize: "0.75rem", fontWeight: "400", color: "#B3261E" }}><span>{ct.e.name}</span></span>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.375rem", fontSize: "0.8125rem", fontWeight: "600" }}>
            {"Work email "}
            <input className="fc-9" value={ct.v.email} onChange={ct.set.email} type="email" style={{ height: "2.75rem", padding: "0 0.75rem", border: `1px solid ${ct.bd.email}`, borderRadius: "2px", fontSize: "0.9375rem", fontWeight: "400", color: "#16130F", outline: "none", background: "#FFFFFF" }} />
            <span style={{ fontSize: "0.75rem", fontWeight: "400", color: "#B3261E" }}><span>{ct.e.email}</span></span>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.375rem", fontSize: "0.8125rem", fontWeight: "600" }}>
            {"Company "}
            <input className="fc-9" value={ct.v.company} onChange={ct.set.company} style={{ height: "2.75rem", padding: "0 0.75rem", border: `1px solid ${ct.bd.company}`, borderRadius: "2px", fontSize: "0.9375rem", fontWeight: "400", color: "#16130F", outline: "none", background: "#FFFFFF" }} />
            <span style={{ fontSize: "0.75rem", fontWeight: "400", color: "#B3261E" }}><span>{ct.e.company}</span></span>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.375rem", fontSize: "0.8125rem", fontWeight: "600" }}>
            {"Locations "}
            <select value={ct.v.locs} onChange={ct.set.locs} style={{ height: "2.75rem", padding: "0 0.625rem", border: "1px solid #D9D0C2", borderRadius: "2px", fontSize: "0.9375rem", fontWeight: "400", color: "#16130F", background: "#FFFFFF" }}>
              {" "}
              <option value="">Select…</option>
              <option>1</option>
              <option>2–3</option>
              <option>4–10</option>
              <option>11–40</option>
              <option>40+</option>
              {" "}
            </select>
            <span style={{ fontSize: "0.75rem" }} />
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", fontSize: "0.8125rem", fontWeight: "600", gridColumn: "1 / -1" }}>
            {"What kind of business? "}
            <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
              {ct.segments.map((o, j) => (
                <button key={j} type="button" onClick={o.pick} style={{ height: "2.25rem", padding: "0 0.75rem", borderRadius: "2px", border: `1px solid ${o.bd}`, background: o.bg, color: o.fg, fontSize: "0.8125rem", fontWeight: "500", cursor: "pointer" }}><span>{o.t}</span></button>
              ))}
            </div>
          </div>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.375rem", fontSize: "0.8125rem", fontWeight: "600", gridColumn: "1 / -1" }}>
            {"Devices processed per month "}
            <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
              {ct.volumes.map((o, j) => (
                <button key={j} type="button" onClick={o.pick} style={{ height: "2.5rem", padding: "0 0.875rem", borderRadius: "2px", border: `1px solid ${o.bd}`, background: o.bg, color: o.fg, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.78125rem", cursor: "pointer" }}><span>{o.t}</span></button>
              ))}
            </div>
            <span style={{ fontSize: "0.75rem", fontWeight: "400", color: "#B3261E" }}><span>{ct.e.volume}</span></span>
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", fontSize: "0.8125rem", fontWeight: "600", gridColumn: "1 / -1" }}>
            {"What are you using today? "}
            <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
              {ct.reps.map((o, j) => (
                <button key={j} type="button" onClick={o.pick} style={{ height: "2.25rem", padding: "0 0.75rem", borderRadius: "2px", border: `1px solid ${o.bd}`, background: o.bg, color: o.fg, fontSize: "0.8125rem", fontWeight: "500", cursor: "pointer" }}><span>{o.t}</span></button>
              ))}
            </div>
          </div>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.375rem", fontSize: "0.8125rem", fontWeight: "600", gridColumn: "1 / -1" }}>
            {"Anything we should know? "}
            <span style={{ fontWeight: "400", color: "#6B6257" }}>Optional</span>
            <textarea className="fc-9" value={ct.v.msg} onChange={ct.set.msg} rows="4" placeholder="e.g. We grade 300 iPhones a week and track parts in a spreadsheet." style={{ padding: "0.625rem 0.75rem", border: "1px solid #D9D0C2", borderRadius: "2px", fontSize: "0.9375rem", fontWeight: "400", color: "#16130F", outline: "none", resize: "vertical", background: "#FFFFFF" }} />
          </label>
          <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", paddingTop: "0.25rem" }}>
            <span aria-live="polite" style={{ fontSize: "0.75rem", color: ct.noteFg }}><span>{ct.note}</span></span>
            <button className="hv-2" type="submit" disabled={ct.sending} style={{ height: "3rem", padding: "0 1.375rem", background: "#EB5E12", color: "#16130F", border: "0", borderRadius: "2px", fontSize: "0.9375rem", fontWeight: "600", cursor: "pointer" }}><span>{ct.submitLabel}</span></button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
