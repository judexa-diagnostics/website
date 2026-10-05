// Sign in to your shop: every shop runs its own InPhox app at <shop>.<domain>;
// this page asks which one and sends the browser to that shop's sign-in page.
export default function Signin({ v }) {
  const { si, ui } = v;
  const mono = "'JetBrains Mono',monospace";
  return (
    <section style={{ display: "grid", gridTemplateColumns: ui.c57, minHeight: "calc(100vh - 4rem)", borderBottom: "1px solid #D9D0C2" }}>
      <div style={{ background: "#16130F", color: "#F6F2EA", padding: "clamp(2rem,5vw,4rem) clamp(1rem,3vw,2.5rem)", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <img src="assets/inphox-logo.png" alt="" style={{ width: "4rem", height: "4rem" }} />
        <h1 style={{ margin: "0", fontSize: "clamp(1.75rem,2.8vw,2.5rem)", lineHeight: "1.06", fontWeight: "650", fontStretch: "104%", letterSpacing: "-.015em", textWrap: "balance" }}>Sign in to your shop.</h1>
        <p style={{ margin: "0", fontSize: "0.9375rem", lineHeight: "1.6", color: "#D9D0C2", maxWidth: "26.25rem" }}>
          Every shop has its own InPhox address. It's in your welcome email, and it's the address you sign in at every day.
        </p>
      </div>
      <div style={{ padding: "clamp(2rem,5vw,4rem) clamp(1rem,4vw,4rem)", display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "40rem", width: "100%" }}>
        <div style={{ display: "flex", borderBottom: "1px solid #D9D0C2" }}>
          <span aria-current="page" style={{ height: "2.75rem", padding: "0 0.25rem", marginRight: "1.5rem", display: "inline-flex", alignItems: "center", borderBottom: "2px solid #EB5E12", fontSize: "0.9375rem", fontWeight: "600", color: "#16130F", marginBottom: "-1px" }}>Sign in</span>
          <a href="#/start" onClick={si.goTrial} style={{ height: "2.75rem", padding: "0 0.25rem", display: "inline-flex", alignItems: "center", borderBottom: "2px solid transparent", fontSize: "0.9375rem", fontWeight: "600", color: "#16130F", textDecoration: "none", marginBottom: "-1px" }}>Create account</a>
        </div>

        {si.last ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", padding: "1rem", border: "1px solid #16130F", borderRadius: "2px", background: "#FFFFFF" }}>
            <span style={{ fontFamily: mono, fontSize: "0.6875rem", letterSpacing: ".02em", color: "#6B6257" }}>Last time you signed in to</span>
            <span style={{ fontFamily: mono, fontSize: "1rem", fontWeight: "600" }}><span>{si.lastHost}</span></span>
            <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
              <button className="hv-2" onClick={si.continueLast} style={{ height: "2.75rem", padding: "0 1.125rem", background: "#EB5E12", color: "#16130F", border: "0", borderRadius: "2px", fontSize: "0.9375rem", fontWeight: "600", cursor: "pointer" }}>Continue to this shop</button>
              <button onClick={si.forget} style={{ height: "2.75rem", padding: "0 1.125rem", background: "transparent", color: "#16130F", border: "1px solid #16130F", borderRadius: "2px", fontSize: "0.9375rem", fontWeight: "600", cursor: "pointer" }}>Use another shop</button>
            </div>
          </div>
        ) : null}

        <form onSubmit={si.submit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.375rem", fontSize: "0.8125rem", fontWeight: "600" }}>
            {"Your shop's address "}
            <span style={{ display: "flex", alignItems: "stretch", border: `1px solid ${si.bd}`, borderRadius: "2px", background: "#FFFFFF" }}>
              <span style={{ display: "flex", alignItems: "center", padding: "0 0 0 0.75rem", fontFamily: mono, fontSize: "0.875rem", color: "#6B6257" }}>https://</span>
              <input className="fc-9" value={si.value} onChange={si.set} placeholder="yourshop" autoCapitalize="none" autoCorrect="off" spellCheck="false" autoComplete="off" aria-describedby="si-suffix"
                style={{ flex: "1", minWidth: "0", height: "2.75rem", padding: "0 0.25rem", border: "0", fontFamily: mono, fontSize: "0.9375rem", fontWeight: "400", color: "#16130F", outline: "none", background: "transparent" }} />
              <span id="si-suffix" style={{ display: "flex", alignItems: "center", padding: "0 0.75rem", borderLeft: "1px solid #EDE7DC", fontFamily: mono, fontSize: "0.875rem", color: "#6B6257", whiteSpace: "nowrap" }}><span>.{si.domain}</span></span>
            </span>
            <span role="alert" style={{ fontSize: "0.75rem", fontWeight: "400", color: "#B3261E", minHeight: "1rem" }}><span>{si.err}</span></span>
          </label>
          <button className="hv-2" type="submit" style={{ height: "3rem", background: "#EB5E12", color: "#16130F", border: "0", borderRadius: "2px", fontSize: "0.9375rem", fontWeight: "600", cursor: "pointer" }}>Continue to sign in</button>
        </form>

        <p style={{ margin: "0", fontSize: "0.8125rem", lineHeight: "1.6", color: "#3A342D" }}>
          Can't find your shop's address? It's in the "Your InPhox shop is ready" email.{" "}
          <a href="#/contact" style={{ color: "#16130F", fontWeight: "600" }}>Contact us</a> if you still can't find it.
          {" "}New to InPhox? <a href="#/start" onClick={si.goTrial} style={{ color: "#16130F", fontWeight: "600" }}>Create an account</a>.
        </p>
      </div>
    </section>
  );
}
