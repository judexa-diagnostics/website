import { pricing } from '../pricing.js';
import '../plans.css';

// Where a plan button lands when the hub does not answer.
export default function SignupBusy() {
  return (
    <div className="pl">
      <section className="pl-busy" role="alert">
        <h1>{pricing.busy.title}</h1>
        <p className="pl-note" style={{ fontSize: '1rem' }}>Nothing was charged and nothing was lost. Your plan is still one click away.</p>
        <a className="pl-btn" href="#/pricing" style={{ background: '#EB5E12', width: 'max-content', display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>{pricing.busy.retry}</a>
      </section>
    </div>
  );
}
