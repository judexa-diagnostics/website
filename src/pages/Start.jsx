export default function Start({ v }) {
  const { st, ui } = v;
  return (
    <section style={{ display: "grid", gridTemplateColumns: ui.c57, minHeight: "calc(100vh - 4rem)", borderBottom: "1px solid #D9D0C2" }}>
      <div style={{ background: "#16130F", color: "#F6F2EA", padding: "clamp(2rem,5vw,4rem) clamp(1rem,3vw,2.5rem)", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "2rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <img src="assets/inphox-logo.png" alt="" style={{ width: "4rem", height: "4rem" }} />
          <h1 style={{ margin: "0", fontSize: "clamp(1.75rem,2.8vw,2.5rem)", lineHeight: "1.06", fontWeight: "650", fontStretch: "104%", letterSpacing: "-.015em", textWrap: "balance" }}><span>{st.headline}</span></h1>
          <p style={{ margin: "0", fontSize: "0.9375rem", lineHeight: "1.6", color: "#D9D0C2", maxWidth: "26.25rem" }}><span>{st.sub}</span></p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", borderTop: "1px solid #3A342D" }}>
          {st.steps.map((x, j) => (
            <div key={j} style={{ display: "grid", gridTemplateColumns: "2.25rem 1fr auto", gap: "0.625rem", padding: "0.75rem 0", borderBottom: "1px solid #3A342D", fontSize: "0.875rem", color: x.fg }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.75rem" }}><span>{x.n}</span></span>
              <span><span>{x.t}</span></span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", color: x.sc }}><span>{x.s}</span></span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "clamp(2rem,5vw,4rem) clamp(1rem,4vw,4rem)", display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "40rem", width: "100%" }}>
        <div style={{ display: "flex", borderBottom: "1px solid #D9D0C2" }}>
          <button onClick={st.toSignin} style={{ height: "2.75rem", padding: "0 0.25rem", marginRight: "1.5rem", background: "transparent", border: "0", borderBottom: `2px solid ${st.tabA}`, fontSize: "0.9375rem", fontWeight: "600", cursor: "pointer", color: "#16130F", marginBottom: "-1px" }}>Sign in</button>
          <button onClick={st.toCreate} style={{ height: "2.75rem", padding: "0 0.25rem", background: "transparent", border: "0", borderBottom: `2px solid ${st.tabB}`, fontSize: "0.9375rem", fontWeight: "600", cursor: "pointer", color: "#16130F", marginBottom: "-1px" }}>Create account</button>
        </div>
        {st.showSignin ? (
          <form onSubmit={st.signin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.375rem", fontSize: "0.8125rem", fontWeight: "600" }}>
              {"Work email "}
              <input className="fc-9" type="email" value={st.si.email} onChange={st.setSi.email} autoComplete="email" style={{ height: "2.75rem", padding: "0 0.75rem", border: "1px solid #D9D0C2", borderRadius: "2px", fontSize: "0.9375rem", fontWeight: "400", color: "#16130F", outline: "none", background: "#FFFFFF" }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.375rem", fontSize: "0.8125rem", fontWeight: "600" }}>
              <span style={{ display: "flex", justifyContent: "space-between" }}>
                Password
                <button type="button" onClick={st.forgot} style={{ background: "none", border: "0", padding: "0", fontSize: "0.8125rem", fontWeight: "500", color: "#C2470A", cursor: "pointer" }}>Forgot password?</button>
              </span>
              <input className="fc-9" type="password" value={st.si.pw} onChange={st.setSi.pw} autoComplete="current-password" style={{ height: "2.75rem", padding: "0 0.75rem", border: "1px solid #D9D0C2", borderRadius: "2px", fontSize: "0.9375rem", fontWeight: "400", color: "#16130F", outline: "none", background: "#FFFFFF" }} />
            </label>
            <span style={{ fontSize: "0.8125rem", color: st.siFg, minHeight: "1.125rem" }}><span>{st.siMsg}</span></span>
            <button className="hv-2" type="submit" style={{ height: "3rem", background: "#EB5E12", color: "#16130F", border: "0", borderRadius: "2px", fontSize: "0.9375rem", fontWeight: "600", cursor: "pointer" }}>Sign in</button>
            <span style={{ fontSize: "0.8125rem", color: "#3A342D" }}>
              {"New to InPhox? "}
              <button type="button" onClick={st.toCreate} style={{ background: "none", border: "0", padding: "0", fontSize: "0.8125rem", fontWeight: "600", color: "#16130F", borderBottom: "1px solid #16130F", cursor: "pointer" }}>Create an account</button>
            </span>
          </form>
        ) : null}
        {st.showStep1 ? (
          <form onSubmit={st.next1} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(13.75rem,1fr))", gap: "1rem" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.375rem", fontSize: "0.8125rem", fontWeight: "600" }}>
              {"Full name "}
              <input className="fc-9" value={st.a.name} onChange={st.setA.name} style={{ height: "2.75rem", padding: "0 0.75rem", border: `1px solid ${st.bd.name}`, borderRadius: "2px", fontSize: "0.9375rem", fontWeight: "400", color: "#16130F", outline: "none", background: "#FFFFFF" }} />
              <span style={{ fontSize: "0.75rem", fontWeight: "400", color: "#B3261E" }}><span>{st.e.name}</span></span>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.375rem", fontSize: "0.8125rem", fontWeight: "600" }}>
              {"Company "}
              <input className="fc-9" value={st.a.company} onChange={st.setA.company} style={{ height: "2.75rem", padding: "0 0.75rem", border: `1px solid ${st.bd.company}`, borderRadius: "2px", fontSize: "0.9375rem", fontWeight: "400", color: "#16130F", outline: "none", background: "#FFFFFF" }} />
              <span style={{ fontSize: "0.75rem", fontWeight: "400", color: "#B3261E" }}><span>{st.e.company}</span></span>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.375rem", fontSize: "0.8125rem", fontWeight: "600", gridColumn: "1 / -1" }}>
              {"Work email "}
              <input className="fc-9" type="email" value={st.a.email} onChange={st.setA.email} style={{ height: "2.75rem", padding: "0 0.75rem", border: `1px solid ${st.bd.email}`, borderRadius: "2px", fontSize: "0.9375rem", fontWeight: "400", color: "#16130F", outline: "none", background: "#FFFFFF" }} />
              <span style={{ fontSize: "0.75rem", fontWeight: "400", color: "#B3261E" }}><span>{st.e.email}</span></span>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.375rem", fontSize: "0.8125rem", fontWeight: "600", gridColumn: "1 / -1" }}>
              {"Password "}
              <span style={{ fontWeight: "400", color: "#6B6257" }}>At least 8 characters</span>
              <input className="fc-9" type="password" value={st.a.pw} onChange={st.setA.pw} style={{ height: "2.75rem", padding: "0 0.75rem", border: `1px solid ${st.bd.pw}`, borderRadius: "2px", fontSize: "0.9375rem", fontWeight: "400", color: "#16130F", outline: "none", background: "#FFFFFF" }} />
              <span style={{ fontSize: "0.75rem", fontWeight: "400", color: "#B3261E" }}><span>{st.e.pw}</span></span>
            </label>
            <button className="hv-2" type="submit" style={{ gridColumn: "1 / -1", height: "3rem", background: "#EB5E12", color: "#16130F", border: "0", borderRadius: "2px", fontSize: "0.9375rem", fontWeight: "600", cursor: "pointer" }}>Continue to plan</button>
          </form>
        ) : null}
        {st.showStep2 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", flexDirection: "column", borderTop: "1px solid #16130F" }}>
              {st.plans.map((p, j) => (
                <button key={j} className="hv-1" onClick={p.pick} style={{ display: "grid", gridTemplateColumns: "1.375rem minmax(0,1fr) auto", gap: "0.75rem", alignItems: "start", padding: "0.875rem 0.75rem", border: "0", borderBottom: "1px solid #D9D0C2", background: p.bg, textAlign: "left", cursor: "pointer", color: "#16130F" }}>
                  <span style={{ width: "1rem", height: "1rem", marginTop: "2px", borderRadius: "50%", border: "1px solid #16130F", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ width: "0.5rem", height: "0.5rem", borderRadius: "50%", background: p.dot }} />
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "0.9375rem", fontWeight: "600" }}><span>{p.name}</span></span>
                    <span style={{ fontSize: "0.8125rem", color: "#3A342D" }}><span>{p.d}</span></span>
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8125rem" }}><span>{p.price}</span></span>
                </button>
              ))}
            </div>
            {st.isCustom ? (
              <div style={{ fontSize: "0.8125rem", color: "#3A342D", padding: "0.625rem 0.75rem", background: "#FBE7CC" }}>
                {"Your current services estimate is "}
                <strong><span>{st.customTotal}</span></strong>
                {"/month. "}
                <a href="#/pricing" style={{ color: "#16130F", fontWeight: "600" }}>Adjust services on Pricing →</a>
              </div>
            ) : null}
            <button onClick={st.toggleTrial} style={{ display: "flex", gap: "0.625rem", alignItems: "center", padding: "0", background: "transparent", border: "0", cursor: "pointer", fontSize: "0.875rem", color: "#16130F", textAlign: "left" }}>
              <span style={{ width: "1.125rem", height: "1.125rem", border: "1px solid #16130F", borderRadius: "2px", background: st.trialBg, color: "#FFFFFF", fontSize: "0.6875rem", display: "flex", alignItems: "center", justifyContent: "center" }}><span>{st.trialMark}</span></span>
              {" Book a free onboarding call. We'll help you connect your first station."}
            </button>
            <div style={{ display: "flex", gap: "0.625rem" }}>
              <button onClick={st.back} style={{ height: "3rem", padding: "0 1.125rem", background: "transparent", color: "#16130F", border: "1px solid #16130F", borderRadius: "2px", fontSize: "0.9375rem", fontWeight: "600", cursor: "pointer" }}>Back</button>
              <button className="hv-2" onClick={st.next2} style={{ flex: "1", height: "3rem", background: "#EB5E12", color: "#16130F", border: "0", borderRadius: "2px", fontSize: "0.9375rem", fontWeight: "600", cursor: "pointer" }}><span>{st.cta2}</span></button>
            </div>
          </div>
        ) : null}
        {st.showDone ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", letterSpacing: ".02em", color: "#1E7A4A" }}><span>{st.doneTag}</span></span>
            <span style={{ fontSize: "clamp(1.375rem,2vw,1.75rem)", fontWeight: "600", fontStretch: "102%", lineHeight: "1.2" }}><span>{st.doneTitle}</span></span>
            <div style={{ borderTop: "1px solid #16130F" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2.25rem 1fr", padding: "0.75rem 0", borderBottom: "1px solid #D9D0C2", fontSize: "0.875rem" }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", color: "#6B6257" }}>01</span>
                <span>Install the InPhox station app on a Mac or Windows PC</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "2.25rem 1fr", padding: "0.75rem 0", borderBottom: "1px solid #D9D0C2", fontSize: "0.875rem" }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", color: "#6B6257" }}>02</span>
                <span>Connect a USB hub and plug in your first device</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "2.25rem 1fr", padding: "0.75rem 0", borderBottom: "1px solid #D9D0C2", fontSize: "0.875rem" }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", color: "#6B6257" }}>03</span>
                <span>Invite your technicians and set up your locations</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
              <button className="hv-2" style={{ height: "3rem", padding: "0 1.25rem", background: "#EB5E12", color: "#16130F", border: "0", borderRadius: "2px", fontSize: "0.9375rem", fontWeight: "600", cursor: "pointer" }}>Open workspace</button>
              <a href="#/home" style={{ height: "3rem", padding: "0 1.25rem", display: "inline-flex", alignItems: "center", border: "1px solid #16130F", borderRadius: "2px", fontSize: "0.9375rem", fontWeight: "600", color: "#16130F", textDecoration: "none" }}>Back to site</a>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
