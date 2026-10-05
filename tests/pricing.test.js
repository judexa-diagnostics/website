// Pricing and sign-up wiring tests. Run with `npm test` (Node's built-in runner, no extra dependencies).
// The first group reads src/pricing.js and src/config.js directly. The others render the real pages
// through Vite's SSR loader, once without the billing env vars and once with them.

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Keep the shell's env out of the "unset" cases.
delete process.env.VITE_BILLING_BASE_URL;
delete process.env.VITE_APP_LOGIN_URL;

const FOOTNOTE = "Included checks reset monthly and don't roll over. Checks past your included amount get cheaper the more you run, down to $0.35 each. Overage is billed at the end of the month and capped by a limit you set; you can turn overage off.";
const PAYMENT_LINE = "Nothing is charged on this site. Choose your plan at the end of sign-up, then add a card or set up monthly USDC invoicing when you finish setting up your shop.";

describe('plan data', async () => {
  const P = await import('../src/pricing.js');
  const config = await import('../src/config.js');
  const { pricing } = P;
  const plan = code => P.findPlan(code);

  test('has the three plans from the billing spec', () => {
    const rows = pricing.plans.map(p => [p.code, p.name, p.price.month, p.price.year, p.checksIncluded, P.startRate(p), p.devicesPerMonth, p.stations, p.users]);
    assert.deepEqual(rows, [
      ['starter', 'Starter', 300, 3000, 500, 0.75, 1500, 0, 5],
      ['growth', 'Growth', 700, 7000, 1500, 0.6, 4500, 5, 15],
      ['enterprise', 'Enterprise', 5000, 50000, 15000, 0.45, null, null, null]
    ]);
    assert.deepEqual(pricing.plans.map(p => p.support), [
      'Email support',
      'Email support, answered within one business day',
      'A named contact and an onboarding call'
    ]);
  });

  test('per-check rates fall band by band to a $0.35 floor, never rising', () => {
    assert.equal(P.PER_CHECK_FLOOR, 0.35);
    for (const p of pricing.plans) {
      const rates = p.overageTiers.map(t => t.rate);
      assert.equal(rates.at(-1), 0.35, p.code);
      assert.equal(p.overageTiers.at(-1).upTo, null, p.code);
      for (let i = 1; i < rates.length; i++) assert.ok(rates[i] <= rates[i - 1], `${p.code} band ${i}`);
      assert.ok(rates.every(r => r >= 0.35), p.code);
    }
    assert.deepEqual(plan('starter').overageTiers.map(t => t.rate), [0.75, 0.65, 0.55, 0.45, 0.35]);
  });

  test('graduated overage: each band only prices the checks inside it', () => {
    const s = plan('starter');
    assert.deepEqual(P.overageCost(s, 0), { lines: [], total: 0 });
    const two = P.overageCost(s, 1500);
    assert.deepEqual(two.lines.map(l => [l.label, l.checks, l.rate]), [['First 1,000', 1000, 0.75], ['Next 4,000', 500, 0.65]]);
    assert.equal(Math.round(two.total * 100), 107500);
    const all = P.overageCost(s, 30000);
    assert.deepEqual(all.lines.map(l => [l.label, l.checks]), [['First 1,000', 1000], ['Next 4,000', 4000], ['Next 5,000', 5000], ['Next 15,000', 15000], ['Past 25,000', 5000]]);
    // Marginal price at volume is the floor.
    assert.equal(Math.round((P.overageCost(s, 40001).total - P.overageCost(s, 40000).total) * 100), 35);
  });

  test('annual is ten months of the monthly price (2 months free)', () => {
    for (const p of pricing.plans) assert.equal(p.price.year, p.price.month * 10, p.code);
    assert.equal(pricing.intervals[1].label, 'Annual · 2 months free');
  });

  test('annual shows the yearly price per month, rounded, with the exact yearly total', () => {
    const cards = pricing.plans.map(p => P.planCard(p, 'year'));
    assert.deepEqual(cards.map(c => c.priceStr), ['$250', '$583', '$4,167']);
    assert.deepEqual(cards.map(c => c.billed), [
      'Billed annually · $3,000 / year · 2 months free',
      'Billed annually · $7,000 / year · 2 months free',
      'Billed annually · $50,000 / year · 2 months free'
    ]);
    assert.deepEqual(P.priceFor(plan('growth'), 'year'), { perMonth: 583, yearTotal: 7000 });
  });

  test('monthly cards: price, included checks, volume rates, limits and what each plan adds', () => {
    const cards = pricing.plans.map(p => P.planCard(p, 'month'));
    assert.deepEqual(cards.map(c => c.priceStr), ['$300', '$700', '$5,000']);
    assert.deepEqual(cards.map(c => c.checks), [
      '500 device checks included per month',
      '1,500 device checks included per month',
      '15,000 device checks included per month'
    ]);
    assert.deepEqual(cards.map(c => c.overage), [
      'then from $0.75 per check, falling to $0.35 at volume',
      'then from $0.60 per check, falling to $0.35 at volume',
      'then from $0.45 per check, falling to $0.35 at volume'
    ]);
    const names = cards.map(c => c.items.map(i => i.x));
    assert.deepEqual(names[0], ['1,500 devices processed per month', '5 staff users', 'Phone Intake', 'Device checks', 'Device Management', 'Selling tools', 'Email support']);
    assert.deepEqual(names[1], ['4,500 devices processed per month', '5 stations · 15 staff users', 'Everything in Starter', 'Double Puff station app', 'Email support, answered within one business day']);
    assert.deepEqual(names[2], ['Unlimited devices processed per month', 'Unlimited stations · unlimited staff users', 'Everything in Growth', 'A named contact and an onboarding call']);
    assert.equal(cards[2].tag, 'Annual commitment');
    assert.equal(cards[2].billed, 'Annual commitment · monthly billing by contract');
  });

  test('Double Puff starts at Growth; everything else is in every plan', () => {
    const station = P.products.find(p => p.id === 'station');
    assert.deepEqual(pricing.plans.map(p => P.hasProduct(p, station)), [false, true, true]);
    for (const pr of P.products.filter(p => p.id !== 'station')) assert.deepEqual(pricing.plans.map(p => P.hasProduct(p, pr)), [true, true, true], pr.id);
  });

  test('Enterprise monthly is contract only', () => {
    assert.equal(P.sellsOnline(plan('enterprise'), 'month'), false);
    assert.equal(P.sellsOnline(plan('enterprise'), 'year'), true);
    assert.equal(P.sellsOnline(plan('starter'), 'month'), true);
    assert.equal(P.sellsOnline(plan('growth'), 'year'), true);
  });

  test('no checkout on the website: no payment modes, no checkout endpoint', () => {
    assert.equal(pricing.paymentModes, undefined);
    assert.equal(P.billedInterval, undefined);
    assert.equal(config.checkoutAction, undefined);
  });

  test('payment line, footnote and FAQ', () => {
    assert.equal(pricing.paymentLine, PAYMENT_LINE);
    assert.equal(pricing.footnote, FOOTNOTE);
    assert.deepEqual(pricing.faq.map(f => f.q), ['What counts as a device check?', 'Does per-check pricing get cheaper at volume?', 'What happens when we reach our included checks?', 'When do we pay?']);
    assert.match(pricing.faq[1].a, /\$0\.35/);
    assert.match(pricing.faq[2].a, /capped by a limit you set/);
    assert.match(pricing.faq[2].a, /never move a shop to a bigger plan/);
    assert.match(pricing.faq[3].a, /Not on this website/);
  });

  test('estimate prices overage in bands and picks the lowest-cost plan that fits', () => {
    const e = P.estimate(plan('starter'), 1500, 'month');
    assert.deepEqual([e.base, e.overageChecks, e.overage, e.total], [300, 1000, 750, 1050]);
    assert.equal(e.perCheck, 0.7);
    const g = P.estimate(plan('growth'), 1000, 'month');
    assert.deepEqual([g.base, g.overageChecks, g.overage, g.total, g.lines], [700, 0, 0, 700, []]);
    const big = P.estimate(plan('starter'), 2500, 'month'); // 2,000 over: 1,000 × .75 + 1,000 × .65
    assert.equal(Math.round(big.overage * 100), 140000);
    assert.equal(P.cheapestPlan(800, 0, 'month').code, 'starter');
    assert.equal(P.cheapestPlan(800, 1, 'month').code, 'growth'); // Starter has no station app
    assert.equal(P.cheapestPlan(1000, 0, 'month').code, 'starter'); // $300 + 500 × $0.75 = $675 < $700
    assert.equal(P.cheapestPlan(1500, 2, 'month').code, 'growth');
    assert.equal(P.cheapestPlan(2500, 2, 'month').code, 'growth');
    assert.equal(P.cheapestPlan(20000, 2, 'month').code, 'enterprise');
    assert.equal(P.cheapestPlan(500, 6, 'month').code, 'enterprise');
  });

  test('compare table rows come from the plan data', () => {
    const rows = Object.fromEntries(P.compareRows().map(([l, ...v]) => [l, v]));
    assert.deepEqual(rows['Price, billed monthly'], ['$300 / mo', '$700 / mo', 'By contract']);
    assert.deepEqual(rows['Price, billed annually'], ['$3,000 / yr', '$7,000 / yr', '$50,000 / yr']);
    assert.deepEqual(rows['Per check, first 1,000 over'], ['$0.75', '$0.60', '$0.45']);
    assert.deepEqual(rows['Per check, past 25,000 over'], ['$0.35', '$0.35', '$0.35']);
    assert.deepEqual(rows['Double Puff station app'], ['—', 'Included', 'Included']);
    assert.deepEqual(rows['Phone Intake'], ['Included', 'Included', 'Included']);
    assert.deepEqual(rows['Stations'], ['—', '5', 'Unlimited']);
  });

  test('with no env vars: no billing endpoints, default login URL', () => {
    assert.equal(config.billingBaseUrl, '');
    assert.equal(config.leadAction, null);
    assert.equal(config.appLoginUrl, 'https://intake.inphox.net/auth/login');
  });

  test('no Odoo, vendor or P&M names in src/ or index.html', () => {
    const files = readdirSync(join(root, 'src'), { recursive: true }).filter(f => /\.(jsx?|css)$/.test(f)).map(f => join('src', f));
    for (const f of [...files, 'index.html']) {
      const text = readFileSync(join(root, f), 'utf8');
      assert.doesNotMatch(text, /odoo|sickw|P&M|pmelectronics/i, f);
    }
  });
});

/** Start Vite in SSR mode with the given .env contents and return render helpers for the real pages. */
async function renderWith(envFile) {
  const { createServer } = await import('vite');
  const envDir = mkdtempSync(join(tmpdir(), 'inphox-env-'));
  if (envFile) writeFileSync(join(envDir, '.env'), envFile);
  const server = await createServer({
    root, envDir, logLevel: 'silent', appType: 'custom',
    server: { middlewareMode: true, hmr: false, ws: false }
  });
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { default: SiteLogic } = await server.ssrLoadModule('/src/SiteLogic.js');
  const { default: Layout } = await server.ssrLoadModule('/src/Layout.jsx');
  /** A SiteLogic whose setState applies directly, for driving handlers without a browser. */
  const logicWith = state => {
    const logic = new SiteLogic({ showPromo: false });
    logic.state = { ...logic.state, ...state };
    logic.__host = { __setLogicState: u => { logic.state = { ...logic.state, ...(typeof u === 'function' ? u(logic.state) : u) }; }, forceUpdate() {} };
    return logic;
  };
  const render = state => renderToStaticMarkup(createElement(Layout, { v: { showPromo: false, ...logicWith(state).renderVals() } }));
  const close = async () => {
    await server.close();
    rmSync(envDir, { recursive: true, force: true });
  };
  return { render, logicWith, close };
}

const forms = html => html.match(/<form[^>]*>.*?<\/form>/gs) ?? [];
const text = html => html.replaceAll('&#x27;', "'").replaceAll('&quot;', '"').replaceAll('&amp;', '&');
const hidden = (form, name) => form.match(new RegExp(`<input type="hidden" name="${name}" value="([^"]*)"`))?.[1];
const PAGES = ['home', 'industries', 'features', 'pricing', 'contact', 'platform', 'start'];

/** Run a Contact form submit with valid values and a stubbed fetch; returns the fetch calls and the final state. */
async function submitLead(r, fetchImpl) {
  const calls = [];
  const realFetch = globalThis.fetch, realWindow = globalThis.window;
  globalThis.fetch = async (url, opts) => { calls.push({ url, opts }); return fetchImpl(); };
  globalThis.window = { scrollTo() {} };
  try {
    const logic = r.logicWith({ page: 'contact', c: { name: 'Pat Lee', email: 'pat@shop.test', company: 'Lee Phones', locs: '1', segment: 'Independent repair shops', volume: '100–500', msg: '' } });
    logic.renderVals().ct.submit({ preventDefault() {} });
    await new Promise(res => setTimeout(res, 10));
    return { calls, state: logic.state };
  } finally {
    globalThis.fetch = realFetch;
    globalThis.window = realWindow;
  }
}


/** Run the Start page's Create account with valid values and a stubbed fetch; returns the calls and final state. */
async function submitSignup(r, fetchImpl, plan = 'growth') {
  const calls = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, opts) => { calls.push({ url, opts }); return fetchImpl(); };
  try {
    const logic = r.logicWith({ page: 'start', step: 2, plan, a: { name: 'Pat Lee', email: 'pat@shop.test', company: 'Lee Phones' } });
    logic.renderVals().st.act2.onClick();
    await new Promise(res => setTimeout(res, 10));
    return { calls, state: logic.state };
  } finally {
    globalThis.fetch = realFetch;
  }
}

describe('rendered, billing service not configured', () => {
  let r;
  before(async () => (r = await renderWith('')));
  after(() => r.close());

  test('every page renders, with no old plan names or prices left', () => {
    for (const page of PAGES) {
      const html = r.render({ page });
      assert.ok(html.length > 1000, page);
      for (const old of ['$149', '$449', '$1,190', 'save 15%', 'Build your own', 'Included in Bench', '>Network<', '>Shop<']) assert.ok(!html.includes(old), `${page}: ${old}`);
    }
  });

  test('pricing: the three plans render; plan buttons go to the Start page, Enterprise monthly to Talk to us', () => {
    const html = r.render({ page: 'pricing' });
    assert.equal(forms(html).length, 0);
    for (const s of ['Starter', 'Growth', 'Enterprise', '$300', '$700', '$5,000',
      '500 device checks included per month', '1,500 device checks included per month', '15,000 device checks included per month',
      'then from $0.75 per check, falling to $0.35 at volume', 'then from $0.60 per check', 'then from $0.45 per check',
      '1,500 devices processed per month', '4,500 devices processed per month', 'Unlimited devices processed per month',
      '5 staff users', '5 stations · 15 staff users', 'Unlimited stations · unlimited staff users',
      'Everything in Starter', 'Everything in Growth', 'Double Puff station app', 'Phone Intake',
      'Email support, answered within one business day', 'A named contact and an onboarding call',
      'Annual · 2 months free', PAYMENT_LINE, FOOTNOTE,
      'What counts as a device check?', 'Does per-check pricing get cheaper at volume?', 'When do we pay?', 'Estimate your month']) {
      assert.ok(text(html).includes(s), s);
    }
    for (const gone of ['Pay by', 'USDC invoice<', 'Continue to payment']) assert.ok(!html.includes(gone), gone);
    assert.ok(html.includes('<span>Start with Starter</span>'));
    assert.ok(html.includes('<span>Start with Growth</span>'));
    assert.match(html, /<a class="hv-10" href="#\/contact"[^>]*><span>Talk to us<\/span><\/a>/);
  });

  test('pricing: Compare plans comes before Questions, and the estimate after both', () => {
    const html = text(r.render({ page: 'pricing' }));
    const at = s => html.indexOf(s);
    assert.ok(at('>Compare plans<') > 0 && at('>Compare plans<') < at('>Questions<'));
    assert.ok(at('>Questions<') < at('>Estimate your month<'));
  });

  test('pricing, estimate: band lines, all-in per-check cost, lowest-cost tag', () => {
    const html = text(r.render({ page: 'pricing', checks: 2500, stations: 0, estPlan: 'starter' }));
    for (const s of ['Starter plan', 'Included checks', '500 of 500 used', 'First 1,000 checks over', '1,000 × $0.75', 'Next 4,000 checks over', '1,000 × $0.65', '$1,700', '$0.68 per check, all in', 'Growth covers this volume for']) {
      assert.ok(html.includes(s), s);
    }
    assert.ok(html.includes('Lowest cost'));
  });

  test('pricing, annual: per-month figure rounded, yearly total underneath, Enterprise sold', () => {
    const html = r.render({ page: 'pricing', annual: true });
    for (const s of ['$250', '$583', '$4,167', '$3,000 / year · 2 months free', '$7,000 / year', '$50,000 / year', 'Start with Enterprise']) assert.ok(html.includes(s), s);
  });

  test('Start: the plan is the last step and nothing is charged; Enterprise monthly is Talk to us', () => {
    const growth = r.render({ page: 'start', step: 2, plan: 'growth' });
    assert.equal(forms(growth).length, 0);
    assert.ok(growth.includes('<span>Create account on Growth</span>'));
    assert.ok(text(growth).includes('Nothing is charged now.'));
    const ent = r.render({ page: 'start', step: 2, plan: 'enterprise' });
    assert.match(ent, /href="#\/contact"[^>]*><span>Talk to us<\/span>/);
    const done = text(r.render({ page: 'start', step: 3, plan: 'growth', trial: false }));
    assert.ok(done.includes('Growth plan chosen · pay when you finish setup'));
  });

  test('Sign in links use the default login URL', () => {
    const html = r.render({ page: 'start', menu: true });
    const hrefs = [...html.matchAll(/<a [^>]*href="([^"]*)"[^>]*>Sign in<\/a>/g)].map(m => m[1]);
    assert.equal(hrefs.length, 4); // header, menu, Start tab, footer
    for (const h of hrefs) assert.equal(h, 'https://intake.inphox.net/auth/login');
  });

  test('Start without a sign-up service: Create account shows the confirmation step, no request', async () => {
    const { calls, state } = await submitSignup(r, () => { throw new Error('no request expected'); });
    assert.equal(calls.length, 0);
    assert.equal(state.step, 3);
    const html = text(r.render({ ...state, page: 'start' }));
    assert.ok(html.includes('Check your email.'));
    assert.ok(html.includes('We sent a confirmation link to pat@shop.test.'));
    assert.ok(!html.includes('type="password"'));
  });

  test('Contact form stays client-side: success without a request', async () => {
    const { calls, state } = await submitLead(r, () => { throw new Error('no request expected'); });
    assert.equal(calls.length, 0);
    assert.equal(state.cSent, true);
  });
});

describe('rendered, billing service configured', () => {
  let r;
  before(async () => (r = await renderWith('VITE_BILLING_BASE_URL=https://billing.example.test/\nVITE_APP_LOGIN_URL=https://app.example.test/auth/login\n')));
  after(() => r.close());

  test('pricing and Start never post to the billing service, even when it is configured', () => {
    for (const state of [{ page: 'pricing' }, { page: 'pricing', annual: true }, { page: 'start', step: 2, plan: 'growth' }]) {
      const html = r.render(state);
      assert.equal(forms(html).length, 0, JSON.stringify(state));
      assert.ok(!html.includes('/billing/checkout'), JSON.stringify(state));
    }
  });

  test('Start: Create account POSTs the sign-up (no password) to /billing/signup; 202 shows Check your email', async () => {
    const { calls, state } = await submitSignup(r, () => ({ ok: true, status: 202, json: async () => ({ status: 'check_email' }) }));
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, 'https://billing.example.test/billing/signup');
    assert.equal(calls[0].opts.method, 'POST');
    assert.deepEqual(Object.fromEntries(calls[0].opts.body), { owner_name: 'Pat Lee', company_name: 'Lee Phones', email: 'pat@shop.test', plan: 'growth', interval: 'month' });
    assert.equal(state.step, 3);
  });

  test('Start: a field error from the service goes back to the account step; other errors show a retry line', async () => {
    const bad = await submitSignup(r, () => ({ ok: false, status: 400, json: async () => ({ error: 'Enter a work email.', field: 'email' }) }));
    assert.equal(bad.state.step, 1);
    assert.equal(bad.state.aErr.email, 'Enter a work email.');
    const down = await submitSignup(r, () => ({ ok: false, status: 503, json: async () => ({}) }));
    assert.equal(down.state.step, 2);
    assert.match(down.state.sErr, /try again/);
  });

  test('Sign in links use the configured login URL', () => {
    const html = r.render({ page: 'start', menu: true });
    const hrefs = [...html.matchAll(/<a [^>]*href="([^"]*)"[^>]*>Sign in<\/a>/g)].map(m => m[1]);
    assert.equal(hrefs.length, 4);
    for (const h of hrefs) assert.equal(h, 'https://app.example.test/auth/login');
  });

  test('Contact form POSTs name, email, company, segment, volume to /billing/lead; 2xx shows success', async () => {
    const { calls, state } = await submitLead(r, () => ({ ok: true, status: 204 }));
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, 'https://billing.example.test/billing/lead');
    assert.equal(calls[0].opts.method, 'POST');
    assert.ok(calls[0].opts.body instanceof URLSearchParams);
    assert.deepEqual(Object.fromEntries(calls[0].opts.body), { name: 'Pat Lee', email: 'pat@shop.test', company: 'Lee Phones', segment: 'Independent repair shops', volume: '100–500' });
    assert.equal(state.cSent, true);
    assert.equal(state.cSending, false);
  });

  test('Contact form: an error keeps the form and shows an inline retry line', async () => {
    for (const impl of [() => ({ ok: false, status: 503 }), () => { throw new TypeError('network'); }]) {
      const { state } = await submitLead(r, impl);
      assert.equal(state.cSent, false);
      assert.equal(state.cSending, false);
      assert.match(state.cSendErr, /try again/);
    }
    const html = r.render({ page: 'contact', cSendErr: "That didn't go through. Please try again in a moment." });
    assert.ok(text(html).includes("That didn't go through. Please try again in a moment."));
  });
});
