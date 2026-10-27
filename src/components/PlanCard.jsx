import PlanButton from './PlanButton.jsx';
import '../plans.css';

// One plan card, shared by the Plans page and the home page's plan cards, so the two can never show
// different numbers. `t` is pricing.js planCard() plus `act` (where the button goes) and `hi`
// (the highlighted plan). `compact` leaves out the feature list (home page).
export default function PlanCard({ t, compact = false, headingLevel = 2 }) {
  const H = `h${headingLevel}`;
  return (
    <article className={'pl-card' + (t.hi ? ' is-hi' : '') + (compact ? ' is-compact' : '')} aria-labelledby={'pl-' + t.code + (compact ? '-c' : '')}>
      <div className="pl-top">
        <H id={'pl-' + t.code + (compact ? '-c' : '')} className="pl-name">{t.name}</H>
        {t.tag ? <span className="pl-tag">{t.tag}</span> : null}
      </div>
      <span className="pl-who">{t.who}</span>
      <div className="pl-price"><b>{t.priceStr}</b>{t.per ? <span>{t.per}</span> : null}</div>
      <p className="pl-checks">{t.checks}</p>
      <p className="pl-over">{t.overage}</p>
      {t.cardNote && !compact ? <p className="pl-note">{t.cardNote}</p> : null}
      <PlanButton a={t.act} className={'pl-btn ix-btn' + (t.hi ? ' is-primary' : '')}><span>{t.cta}</span></PlanButton>
      <ul className="pl-limits">{t.limits.map(x => <li key={x}>{x}</li>)}</ul>
      {compact ? null : (
        <ul className="pl-list">
          {t.items.map(i => <li key={i.x} className={i.strong ? 'strong' : ''}>{i.x}</li>)}
        </ul>
      )}
    </article>
  );
}
