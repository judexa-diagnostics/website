// Where an industry page's calls to action go (src/pages/AgIndustry.jsx); plain JS so npm test checks it directly.
import { AG_APP, AG_DOCS, AG_PRICING, AG_SAMPLE, agQuery, agStartUrl } from '../chrome.js';

export const CTA_DESTINATIONS = ['start', 'developers', 'sample', 'contact', 'docs', 'pricing', 'example'];

/** Where a call to action goes. Every link into the app carries the visitor's ref and tags, plus via=<industry>-<spot>. */
export function ctaHref(cta, lang, ref, via) {
  const es = lang === 'es';
  switch (cta.to) {
    case 'start': return agStartUrl(via, lang, ref);
    case 'sample': return `${AG_SAMPLE}?${agQuery(via, lang, ref)}`;
    case 'developers': return `${AG_APP}/developers?${agQuery(via, lang, ref)}`;
    case 'contact': return `${es ? '/es/contact' : '/contact'}?${agQuery(via, lang, ref)}`;
    case 'docs': return AG_DOCS + (cta.anchor ? '#' + cta.anchor : '');
    case 'pricing': return AG_PRICING;
    case 'example': return '#example';
    default: throw new Error('industry cta: unknown destination ' + cta.to);
  }
}
