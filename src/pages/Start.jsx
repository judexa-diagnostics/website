import PlanButton from '../components/PlanButton.jsx';
import '../plans.css';

// Sign-up lives at the InPhox hub. This page only lists the five plans (Always Free, Basics, Growth, Max, Enterprise)
// and sends each to the hub with its code; the card promise sits above them, word for word (pricing.js CARD_PROMISE).
export default function Start({ v }) {
  const { st } = v;
  return (
    <div className="pl">
      <section className="pl-start">
        <h1>{st.headline}</h1>
        <p className="pl-note" style={{ fontSize: '1rem' }}>{st.sub}</p>
        <p className="pl-card-promise" role="note" style={{ margin: '0.75rem 0 1.25rem', padding: '0.875rem 1rem', border: '1px solid var(--pmm-text)', borderLeftWidth: '4px', borderRadius: '2px', fontSize: '1rem', lineHeight: 1.5, fontWeight: 600, overflowWrap: 'anywhere' }}>{st.card}</p>
        <div style={{ borderTop: '1px solid var(--pmm-text)' }}>
          {st.plans.map(p => (
            <div className="pl-row" key={p.name}>
              <div>
                <b>{p.name}</b> <span style={{ color: 'var(--pmm-text-3)' }}>{p.price}</span>
                <p>{p.d}. {p.o}</p>
              </div>
              <PlanButton a={p.act} className="pl-btn ix-btn"><span>{p.cta}</span></PlanButton>
            </div>
          ))}
        </div>
        <p className="pl-note">Already have an account? <a href={st.loginUrl}>Sign in</a>. <a href="#/pricing">Compare plans</a></p>
      </section>
    </div>
  );
}
