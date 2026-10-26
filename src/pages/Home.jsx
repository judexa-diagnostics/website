import { Fragment, Suspense, lazy } from 'react';
import HeroConsole from '../redesign/HeroConsole.jsx';
import Station from '../redesign/Station.jsx';
import PlanCard from '../components/PlanCard.jsx';
import { FxScope } from '../redesign/fx/index.jsx';
import { proofFacts, HOW_STEPS, VERIFIED_QUOTES, CAPS_ON_PHONE } from '../home.js';
import '../home.css';
const Story = lazy(() => import('../redesign/Story.jsx'));

// Home: hero with one call to action, proof, a short feature story, plan cards, then the close.
// Every colour, radius and font is a template token (tokens.css, home.css). The 3D walkthrough
// only loads when someone asks for it.
export default function Home({ v }) {
  const { caps, goTrial, startLabel, home, ledger, moreRef, walkRef, xf, xfRef } = v;
  const proof = proofFacts();
  return (
    <div className="hm">
      <section className="hm-hero" aria-labelledby="hm-h1">
        <div className="hm-hero-copy">
          <span className="hm-kicker">Device operations platform</span>
          <h1 id="hm-h1" className="hm-h1">The all-in-one platform for used electronics. <span>Literally.</span></h1>
          <p className="hm-sub">Diagnose, erase, grade, repair, store and sell from one system. Every device is tracked by IMEI from the moment it's plugged in until it ships.</p>
          <div className="hm-ctas">
            <button type="button" className="ix-btn is-primary hm-cta" onClick={goTrial}>{startLabel}</button>
            <a className="ix-btn hm-cta" href="#/pricing">See plans</a>
          </div>
          <p className="hm-trust">{home.trust.map((x, i) => <Fragment key={x}>{i ? <span aria-hidden="true"> · </span> : null}<span>{x}</span></Fragment>)}</p>
        </div>
        <div className="hm-console">
          <HeroConsole />
        </div>
      </section>

      <section className="hm-wrap hm-proof" aria-label="InPhox in numbers">
        {proof.map(f => (
          <div key={f.k} className="hm-fact">
            <b>{f.k}{f.tag ? <span className="hm-pill">{f.tag}</span> : null}</b>
            <span>{f.d}</span>
          </div>
        ))}
      </section>

      <section id="how" className="hm-wrap hm-sec" aria-labelledby="hm-how">
        <div className="hm-sec-head">
          <span className="hm-kicker">How it works</span>
          <h2 id="hm-how">From the bench to the buyer, one record per device.</h2>
        </div>
        <ol className="hm-how">
          {HOW_STEPS.map(s => (
            <li key={s.n} className="hm-card hm-step">
              <img src={s.img} alt={s.alt} loading="lazy" width="960" height="600" />
              <div className="hm-step-body">
                <span className="hm-num">{s.n}</span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="hm-row">
          {home.walk
            ? <button type="button" className="ix-btn" onClick={home.closeWalk}>Close the walkthrough</button>
            : <button type="button" className="ix-btn" onClick={home.openWalk}>Watch the full walkthrough</button>}
          <span className="hm-note">Seven steps in 3D, about two minutes.</span>
        </div>
      </section>
      <div ref={walkRef}>
        {home.walk ? (
          <Suspense fallback={<div className="hm-walk-wait">Loading the walkthrough…</div>}>
            <Story goTrial={goTrial} />
          </Suspense>
        ) : null}
      </div>

      <section className="hm-wrap hm-sec" aria-labelledby="hm-after">
        <div className="hm-sec-head hm-sec-head-row">
          <div>
            <span className="hm-kicker">After the sale</span>
            <h2 id="hm-after">Everything that happens after the sale, too.</h2>
            <p>For your customers and your vendors.</p>
          </div>
          <a className="hm-link" href="#/features">See every feature →</a>
        </div>
        <ul className="hm-caps">
          {caps.map((c, j) => (
            <li key={c.t} className={'hm-card hm-cap' + (j >= CAPS_ON_PHONE ? ' hm-cap-more' : '')}>
              <h3>{c.t}</h3>
              <p>{c.d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section ref={moreRef}><Station goTrial={goTrial} /></section>

      <FxScope>
      <section ref={xfRef} className="hm-wrap hm-sec hm-xf" aria-labelledby="hm-xf">
        <div className="hm-xf-l">
          <span className="hm-kicker">Before and after</span>
          <h2 id="hm-xf">The work stays the same. <span>The busywork goes away.</span></h2>
          <div className={'fx-paper hm-ledger' + ((xf.length > 0 && xf[0].on) ? ' fx-ledger-on' : '')}>
            <span className="hm-ledger-margin" />
            <div className="hm-ledger-head"><span>INVENTORY · OCT</span><span>pg 14</span></div>
            {ledger.map((l, j) => (
              <div key={j} className={'fx-ledger-row hm-ledger-row' + (l.struck ? ' is-struck' : '')}>
                {!l.struck ? <span aria-hidden="true" className="fx-strike" style={{ transitionDelay: (150 + j * 110) + "ms" }} /> : null}
                <span>{l.d}</span>
                <span className="hm-ell">{l.m}</span>
                <span>{l.g}</span>
                <span className="hm-ell">{l.l}</span>
              </div>
            ))}
            <span aria-hidden="true" className="fx-stamp">Logged in InPhox ✓</span>
          </div>
        </div>
        <div>
          <div className="hm-xf-head"><span>Before</span><span>With InPhox</span></div>
          {xf.map((x, j) => (
            <div key={j} className={'hm-xf-row' + (x.on ? ' is-on' : '')}>
              <span className="hm-xf-b" style={{ transitionDelay: x.d }}>{x.b}</span>
              <span className="hm-xf-a" style={{ transitionDelay: x.d2 }}>{x.a}</span>
            </div>
          ))}
        </div>
      </section>
      </FxScope>

      {VERIFIED_QUOTES.length ? (
        <section className="hm-wrap hm-sec" aria-labelledby="hm-quotes">
          <div className="hm-sec-head"><h2 id="hm-quotes">Heard at the counter</h2></div>
          <div className="hm-quotes">
            {VERIFIED_QUOTES.map(t => (
              <figure key={t.q} className="hm-card hm-quote">
                <blockquote>“{t.q}”</blockquote>
                <figcaption><b>{t.n}</b><span>{t.r}</span></figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      <section className="hm-wrap hm-sec pl" aria-labelledby="hm-plans">
        <div className="hm-sec-head hm-sec-head-row">
          <div>
            <span className="hm-kicker">Plans</span>
            <h2 id="hm-plans">Start free. Move up when you need more checks.</h2>
          </div>
          <a className="hm-link" href="#/pricing">Compare all plans →</a>
        </div>
        <div className="hm-plans">
          {home.plans.map(t => <PlanCard key={t.code} t={t} compact headingLevel={3} />)}
        </div>
      </section>

      <section className="hm-wrap hm-sec hm-close" aria-labelledby="hm-close">
        <div className="hm-close-l">
          <h2 id="hm-close">Start with one station. Add locations when you're ready.</h2>
          <div className="hm-ctas">
            <button type="button" className="ix-btn is-primary hm-cta" onClick={goTrial}>{startLabel}</button>
            <a className="ix-btn hm-cta" href="#/pricing">See plans</a>
          </div>
        </div>
        <ol className="hm-steps">
          <li><span className="hm-num">01</span><span><b>Create your account</b><span>Company, locations, and who's on the team.</span></span><span className="hm-meta">~2 min</span></li>
          <li><span className="hm-num">02</span><span><b>Pick a plan</b><span>Free, Basics, Growth, Max or Enterprise. Move up a plan when you need more checks.</span></span><a className="hm-meta" href="#/pricing">Plans →</a></li>
          <li><span className="hm-num">03</span><span><b>Plug in your first device</b><span>Install the station app on a Mac or Windows PC and connect a USB hub.</span></span><span className="hm-meta">~15 min</span></li>
        </ol>
      </section>
    </div>
  );
}
