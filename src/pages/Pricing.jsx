import PlanButton from '../components/PlanButton.jsx';
import '../plans.css';

export default function Pricing({ v }) {
  const { pr } = v;
  return (
    <div className="pl">
      <section className="pl-wrap pl-head">
        <h1>Plans</h1>
        <p>{pr.intro}</p>
      </section>

      <section className="pl-wrap" aria-label="Plans">
        <div className="pl-grid">
          {pr.tiers.map(t => (
            <article key={t.code} className="pl-card" aria-labelledby={'pl-' + t.code} style={{ background: t.bg, boxShadow: `inset 0 0.1875rem 0 ${t.top}` }}>
              <div className="pl-top">
                <h2 id={'pl-' + t.code} className="pl-name" style={{ margin: 0 }}>{t.name}</h2>
                {t.tag ? <span className="pl-tag">{t.tag}</span> : null}
              </div>
              <span className="pl-who">{t.who}</span>
              <div className="pl-price"><b>{t.priceStr}</b>{t.per ? <span>{t.per}</span> : null}</div>
              <p className="pl-checks">{t.checks}</p>
              <p className="pl-over">{t.overage}</p>
              {t.cardNote ? <p className="pl-note">{t.cardNote}</p> : null}
              <PlanButton a={t.act} className="pl-btn" style={{ background: t.btnBg, border: `1px solid ${t.btnBd}` }}><span>{t.cta}</span></PlanButton>
              <ul className="pl-limits">{t.limits.map(x => <li key={x}>{x}</li>)}</ul>
              <ul className="pl-list">
                {t.items.map(i => <li key={i.x} className={i.strong ? 'strong' : ''}>{i.x}</li>)}
              </ul>
            </article>
          ))}
        </div>
        {pr.packs ? <p className="pl-packs">{pr.packs}</p> : null}
      </section>

      <section className="pl-wrap pl-section">
        <div className="pl-label">Compare plans</div>
        <div className="pl-scroll" tabIndex={0} role="region" aria-label="Compare plans, scrolls sideways on a small screen">
          <table>
            <thead>
              <tr><th scope="col"><span className="sr-only" style={{ position: 'absolute', left: '-9999px' }}>Feature</span></th>{pr.planNames.map(n => <th scope="col" key={n}>{n}</th>)}</tr>
            </thead>
            <tbody>
              {pr.compare.map(c => (
                <tr key={c.l}><th scope="row">{c.l}</th>{c.cells.map((x, j) => <td key={j}>{x}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="pl-wrap pl-section">
        <div className="pl-label">Questions</div>
        <div className="pl-faq">
          {pr.faq.map(f => (
            <div key={f.q}><h3>{f.q}</h3><p>{f.a}</p></div>
          ))}
        </div>
      </section>

      <section className="pl-wrap">
        <div className="pl-sales">
          <span>Need more than Max, or terms of your own?</span>
          <a href="#/contact">Talk to sales</a>
        </div>
      </section>
    </div>
  );
}
