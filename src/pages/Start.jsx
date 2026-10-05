import PlanButton from '../components/PlanButton.jsx';

const LABEL = { display: "flex", flexDirection: "column", gap: "0.375rem", fontSize: "0.8125rem", fontWeight: "600" };
const INPUT = { height: "2.75rem", padding: "0 0.75rem", borderRadius: "2px", fontSize: "0.9375rem", fontWeight: "400", color: "#16130F", outline: "none", background: "#FFFFFF" };
const ERR = { fontSize: "0.75rem", fontWeight: "400", color: "#B3261E" };

// One labelled input of the shop step: st.sh[k], its setter, error and border.
function ShopField({ st, k, label, wide, hint, ...rest }) {
  return (
    <label style={{ ...LABEL, ...(wide ? { gridColumn: "1 / -1" } : {}) }}>
      {label}
      <input className="fc-9" value={st.sh[k]} onChange={st.setSh[k]} {...rest} style={{ ...INPUT, border: `1px solid ${st.shBd[k]}` }} />
      {hint && !st.she[k] ? <span style={{ fontSize: "0.75rem", fontWeight: "400", color: "#6B6257" }}>{hint}</span> : null}
      <span style={ERR}><span>{st.she[k]}</span></span>
    </label>
  );
}

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
          <a href={st.loginUrl} style={{ height: "2.75rem", padding: "0 0.25rem", marginRight: "1.5rem", display: "inline-flex", alignItems: "center", borderBottom: "2px solid transparent", fontSize: "0.9375rem", fontWeight: "600", color: "#16130F", textDecoration: "none", marginBottom: "-1px" }}>Sign in</a>
          <span aria-current="page" style={{ height: "2.75rem", padding: "0 0.25rem", display: "inline-flex", alignItems: "center", borderBottom: "2px solid #EB5E12", fontSize: "0.9375rem", fontWeight: "600", color: "#16130F", marginBottom: "-1px" }}>Create account</span>
        </div>
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
            <button className="hv-2" type="submit" style={{ gridColumn: "1 / -1", height: "3rem", background: "#EB5E12", color: "#16130F", border: "0", borderRadius: "2px", fontSize: "0.9375rem", fontWeight: "600", cursor: "pointer" }}>Continue</button>
          </form>
        ) : null}
        {st.showShop ? (
          <form onSubmit={st.nextShop} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(11rem,1fr))", gap: "1rem" }}>
            <p style={{ gridColumn: "1 / -1", margin: "0", fontSize: "0.875rem", color: "#3A342D" }}>Your shop is set up with these, so there is nothing to fill in when you first sign in. The address is used for sales tax and your invoices.</p>
            <ShopField st={st} k="street" label="Street address" wide autoComplete="address-line1" />
            <ShopField st={st} k="street2" label="Suite or unit (optional)" wide autoComplete="address-line2" />
            <ShopField st={st} k="city" label="City" autoComplete="address-level2" />
            <ShopField st={st} k="state" label="State" autoComplete="address-level1" maxLength={60} />
            <ShopField st={st} k="zip" label="ZIP" autoComplete="postal-code" maxLength={20} />
            <label style={LABEL}>
              {"Country"}
              <select className="fc-9" value={st.sh.country} onChange={st.setSh.country} style={{ ...INPUT, border: `1px solid ${st.shBd.country}` }}>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
              </select>
              <span style={ERR}><span>{st.she.country}</span></span>
            </label>
            <ShopField st={st} k="phone" label="Shop phone" type="tel" autoComplete="tel" />
            <ShopField st={st} k="bemail" label="Shop email (optional)" type="email" hint={st.bemailHint} />
            <ShopField st={st} k="site" label="Website (optional)" wide placeholder="yourshop.com" autoComplete="url" />
            <div style={{ ...LABEL, gridColumn: "1 / -1" }}>
              {"Logo (optional)"}
              <div style={{ display: "flex", gap: "0.625rem", alignItems: "center", flexWrap: "wrap" }}>
                <label style={{ height: "2.75rem", padding: "0 1rem", display: "inline-flex", alignItems: "center", border: "1px solid #16130F", borderRadius: "2px", fontSize: "0.875rem", fontWeight: "600", cursor: "pointer", background: "#FFFFFF" }}>
                  {st.logoName ? 'Choose another' : 'Choose a picture'}
                  <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={st.pickLogo} style={{ display: "none" }} />
                </label>
                {st.logoName ? <span style={{ fontSize: "0.875rem", fontWeight: "400" }}>{st.logoName} <button type="button" onClick={st.clearLogo} style={{ marginLeft: "0.375rem", background: "transparent", border: "0", color: "#B3261E", cursor: "pointer", fontSize: "0.8125rem", fontWeight: "600" }}>Remove</button></span>
                  : <span style={{ fontSize: "0.75rem", fontWeight: "400", color: "#6B6257" }}>PNG, JPG, WEBP or GIF, up to 2 MB. You can add it later too.</span>}
              </div>
              <span style={ERR}><span>{st.logoErr}</span></span>
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: "0.625rem" }}>
              <button type="button" onClick={st.backShop} style={{ height: "3rem", padding: "0 1.125rem", background: "transparent", color: "#16130F", border: "1px solid #16130F", borderRadius: "2px", fontSize: "0.9375rem", fontWeight: "600", cursor: "pointer" }}>Back</button>
              <button className="hv-2" type="submit" style={{ flex: "1", height: "3rem", background: "#EB5E12", color: "#16130F", border: "0", borderRadius: "2px", fontSize: "0.9375rem", fontWeight: "600", cursor: "pointer" }}>Continue to plan</button>
            </div>
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
            <div style={{ fontSize: "0.8125rem", color: "#3A342D", padding: "0.625rem 0.75rem", background: "#FBE7CC" }}>
              <span>{st.billing}</span>
              <a href="#/pricing" style={{ color: "#16130F", fontWeight: "600" }}>Change on Pricing →</a>
            </div>
            <button onClick={st.toggleTrial} style={{ display: "flex", gap: "0.625rem", alignItems: "center", padding: "0", background: "transparent", border: "0", cursor: "pointer", fontSize: "0.875rem", color: "#16130F", textAlign: "left" }}>
              <span style={{ width: "1.125rem", height: "1.125rem", border: "1px solid #16130F", borderRadius: "2px", background: st.trialBg, color: "#FFFFFF", fontSize: "0.6875rem", display: "flex", alignItems: "center", justifyContent: "center" }}><span>{st.trialMark}</span></span>
              {" Book a free onboarding call. We'll help you connect your first station."}
            </button>
            <div style={{ display: "flex", gap: "0.625rem" }}>
              <button onClick={st.back} style={{ height: "3rem", padding: "0 1.125rem", background: "transparent", color: "#16130F", border: "1px solid #16130F", borderRadius: "2px", fontSize: "0.9375rem", fontWeight: "600", cursor: "pointer" }}>Back</button>
              <PlanButton a={st.act2} className="hv-2" style={{ flex: "1", height: "3rem", background: "#EB5E12", color: "#16130F", border: "0", borderRadius: "2px", fontSize: "0.9375rem", fontWeight: "600", cursor: "pointer" }}><span>{st.cta2}</span></PlanButton>
            </div>
            {st.sErr ? <span role="alert" style={{ fontSize: "0.8125rem", color: "#B3261E" }}><span>{st.sErr}</span></span> : null}
          </div>
        ) : null}
        {st.showDone ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6875rem", letterSpacing: ".02em", color: "#1E7A4A" }}><span>{st.doneTag}</span></span>
            <span style={{ fontSize: "clamp(1.375rem,2vw,1.75rem)", fontWeight: "600", fontStretch: "102%", lineHeight: "1.2" }}><span>{st.doneTitle}</span></span>
            <div style={{ borderTop: "1px solid #16130F" }}>
              {st.doneSteps.map((t, j) => (
                <div key={j} style={{ display: "grid", gridTemplateColumns: "2.25rem 1fr", padding: "0.75rem 0", borderBottom: "1px solid #D9D0C2", fontSize: "0.875rem" }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", color: "#6B6257" }}>{'0' + (j + 1)}</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
              <a className="hv-2" href={st.loginUrl} style={{ height: "3rem", padding: "0 1.25rem", display: "inline-flex", alignItems: "center", background: "#EB5E12", color: "#16130F", borderRadius: "2px", fontSize: "0.9375rem", fontWeight: "600", textDecoration: "none" }}>Go to sign in</a>
              <a href="#/home" style={{ height: "3rem", padding: "0 1.25rem", display: "inline-flex", alignItems: "center", border: "1px solid #16130F", borderRadius: "2px", fontSize: "0.9375rem", fontWeight: "600", color: "#16130F", textDecoration: "none" }}>Back to site</a>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
