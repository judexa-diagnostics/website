// The <noscript> block of index.html: every plan, its price, its included checks and the overage
// sentence, as plain HTML. Built from pricing.js, so a price change here needs no second edit.
import { plainPlans, pricing, signupUrl, DEFAULT_HUB_URL } from './pricing.js';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function noscriptPlans(hub = DEFAULT_HUB_URL) {
  const rows = plainPlans().map((p, i) => {
    const code = pricing.plans[i].code;
    const url = signupUrl(code, hub);
    const link = url ? `<a href="${esc(url)}">Start with ${esc(p.name)}</a>` : '<a href="#/contact">Talk to sales</a>';
    return `<li><strong>${esc(p.name)}</strong>: ${esc(p.price)}. ${esc(p.checks)}. ${esc(p.overage)}${p.note ? ' ' + esc(p.note) : ''} ${link}</li>`;
  }).join('\n');
  return `<noscript><div class="pl-noscript"><h1>InPhox plans</h1><ul>\n${rows}\n</ul><p>Turn on JavaScript to see the full site.</p></div></noscript>`;
}
