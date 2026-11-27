import { INDUSTRY_META } from './industryMeta.js';
import './industry.css';

const T = {
  en: { k: 'Solutions by industry', h: ['Where autograding fits', 'your business.'], here: 'You are here' },
  es: { k: 'Soluciones por industria', h: ['Dónde encaja autograding', 'en tu negocio.'], here: 'Estás aquí' }
};

/** "Solutions by industry": every industry page, linked with its own name and line. On /autograding and under each
 *  industry page (current: that page). Own Spanish copy, so data-no-tr keeps the site-wide translator away. */
export default function IndustryIndex({ lang = 'en', current = null }) {
  const t = T[lang] || T.en, es = lang === 'es';
  return (
    <section id="industries" className="agi agi-index" lang={lang} data-no-tr="" aria-labelledby="agi-index-h">
      <div className="agi-wrap">
        <span className="agi-k agi-mono">{t.k}</span>
        <h2 id="agi-index-h">{t.h[0]} <em>{t.h[1]}</em></h2>
        <ul className="agi-grid">
          {INDUSTRY_META.map(m => {
            const here = m.page === current, x = m[es ? 'es' : 'en'];
            return (
              <li key={m.slug}>
                <a href={(es ? '/es' : '') + m.path} className={here ? 'is-here' : undefined} aria-current={here ? 'page' : undefined}>
                  <b>{x.nav}</b>
                  <span>{here ? t.here : x.blurb}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
