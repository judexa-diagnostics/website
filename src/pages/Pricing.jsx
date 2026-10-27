import PlanCard from '../components/PlanCard.jsx';
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
          {pr.tiers.map(t => <PlanCard key={t.code} t={t} />)}
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
          <a className="ix-btn" href="#/contact">Talk to sales</a>
        </div>
      </section>
    </div>
  );
}
