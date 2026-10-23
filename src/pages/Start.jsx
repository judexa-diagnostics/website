import PlanButton from '../components/PlanButton.jsx';
import '../plans.css';

// Sign-up lives at the InPhox hub. This page only lists the plans and sends each to the hub with its code.
export default function Start({ v }) {
  const { st } = v;
  return (
    <div className="pl">
      <section className="pl-start">
        <h1>{st.headline}</h1>
        <p className="pl-note" style={{ fontSize: '1rem' }}>{st.sub}</p>
        <div style={{ borderTop: '1px solid #16130F' }}>
          {st.plans.map(p => (
            <div className="pl-row" key={p.name}>
              <div>
                <b>{p.name}</b> <span style={{ color: 'var(--pl-mute)' }}>{p.price}</span>
                <p>{p.d}. {p.o}</p>
              </div>
              <PlanButton a={p.act} className="pl-btn" style={{ background: 'transparent', border: '1px solid #16130F' }}><span>{p.cta}</span></PlanButton>
            </div>
          ))}
        </div>
        <p className="pl-note">Already have an account? <a href={st.loginUrl}>Sign in</a>. <a href="#/pricing">Compare plans</a></p>
      </section>
    </div>
  );
}
