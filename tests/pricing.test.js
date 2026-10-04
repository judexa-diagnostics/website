// Pricing and billing-wiring tests. Run with `npm test` (Node's built-in runner, no extra dependencies).
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

const FOOTNOTE = "Included checks reset monthly and don't roll over. Overage is billed at the end of the month and capped by a limit you set; you can turn overage off.";

describe('plan data', async () => {
  const P = await import('../src/pricing.js');
  const config = await import('../src/config.js');
  const { pricing } = P;
  const plan = code => P.findPlan(code);

  test('has the three plans from the billing spec', () => {
    const rows = pricing.plans.map(p => [p.code, p.name, p.price.month, p.price.year, p.checksIncluded, p.overagePerCheck, p.devicesPerMonth, p.stations, p.users]);
    assert.deepEqual(rows, [
      ['starter', 'Starter', 300, 3000, 500, 0.75, 1500, 2, 5],
      ['growth', 'Growth', 700, 7000, 1500, 0.6, 4500, 5, 15],
      ['enterprise', 'Enterprise', 5000, 50000, 15000, 0.45, null, null, null]
    ]);
    assert.deepEqual(pricing.plans.map(p => p.support), [
      'Email support',
      'Email support, answered within one business day',
      'A named contact and an onboarding call'
    ]);
  });

  test('annual is ten months of the monthly price (2 months free)', () => {
    for (const p of pricing.plans) assert.equal(p.price.year, p.price.month * 10, p.code);
    assert.equal(pricing.intervals[1].label, 'Annual · 2 months free');
  });

  test('annual shows the yearly price per month, rounded, with the exact yearly total', () => {
    const cards = pricing.plans.map(p => P.planCard(p, 'year', 'card'));
    assert.deepEqual(cards.map(c => c.priceStr), ['$250', '$583', '$4,167']);
    assert.deepEqual(cards.map(c => c.billed), [
      'Billed annually · $3,000 / year · 2 months free',
      'Billed annually · $7,000 / year · 2 months free',
      'Billed annually · $50,000 / year · 2 months free'
    ]);
    assert.deepEqual(P.priceFor(plan('growth'), 'year'), { perMonth: 583, yearTotal: 7000 });
  });

  test('monthly cards: price, included checks, overage and limits', () => {
    const cards = pricing.plans.map(p => P.planCard(p, 'month', 'card'));
    assert.deepEqual(cards.map(c => c.priceStr), ['$300', '$700', '$5,000']);
    assert.deepEqual(cards.map(c => c.checks), [
      '500 device checks included per month',
      '1,500 device checks included per month',
      '15,000 device checks included per month'
    ]);
    assert.deepEqual(cards.map(c => c.overage), [
      'then $0.75 per check, capped by a limit you set',
      'then $0.60 per check, capped by a limit you set',
      'then $0.45 per check, capped by a limit you set'
    ]);
    assert.deepEqual(cards.map(c => c.items.slice(0, 3)), [
      ['1,500 devices processed per month', '2 stations', '5 staff users'],
      ['4,500 devices processed per month', '5 stations', '15 staff users'],
      ['Unlimited devices processed per month', 'Unlimited stations', 'Unlimited staff users']
    ]);
    assert.equal(cards[2].tag, 'Annual commitment');
    assert.equal(cards[2].billed, 'Annual commitment · monthly billing by contract');
  });

  test('USDC invoices are monthly only; Enterprise monthly is not sold through checkout', () => {
    assert.equal(P.billedInterval('year', 'invoice_usdc'), 'month');
    assert.equal(P.billedInterval('year', 'card'), 'year');
    assert.equal(P.billedInterval('month', 'card'), 'month');
    assert.equal(P.sellsOnline(plan('enterprise'), 'month'), false);
    assert.equal(P.sellsOnline(plan('enterprise'), 'year'), true);
    assert.equal(P.sellsOnline(plan('starter'), 'month'), true);
    assert.equal(P.sellsOnline(plan('growth'), 'year'), true);
  });

  test('form values match what /billing/checkout expects', () => {
    assert.deepEqual(pricing.plans.map(p => p.code), ['starter', 'growth', 'enterprise']);
    assert.deepEqual(pricing.intervals.map(i => i.value), ['month', 'year']);
    assert.deepEqual(pricing.paymentModes.map(m => m.value), ['card', 'invoice_usdc']);
  });

  test('payment line, footnote and FAQ', () => {
    assert.equal(pricing.paymentLine, 'Pay by card, or by monthly USDC invoice.');
    assert.equal(pricing.footnote, FOOTNOTE);
    assert.deepEqual(pricing.faq.map(f => f.q), ['What counts as a device check?', 'What happens when we reach our included checks?']);
    assert.match(pricing.faq[1].a, /capped by a limit you set/);
    assert.match(pricing.faq[1].a, /never move a shop to a bigger plan/);
  });

  test('estimate adds overage at the plan rate and picks the lowest-cost plan that fits', () => {
    assert.deepEqual(P.estimate(plan('starter'), 1500, 'month'), { base: 300, overageChecks: 1000, overage: 750, total: 1050 });
    assert.deepEqual(P.estimate(plan('growth'), 1000, 'month'), { base: 700, overageChecks: 0, overage: 0, total: 700 });
    assert.equal(P.cheapestPlan(800, 2, 'month').code, 'starter');
    assert.equal(P.cheapestPlan(800, 3, 'month').code, 'growth'); // Starter has 2 stations
    assert.equal(P.cheapestPlan(1500, 2, 'month').code, 'growth');
    assert.equal(P.cheapestPlan(12000, 2, 'month').code, 'enterprise');
    assert.equal(P.cheapestPlan(500, 6, 'month').code, 'enterprise');
  });

  test('compare table rows come from the plan data', () => {
    const rows = Object.fromEntries(P.compareRows().map(([l, ...v]) => [l, v]));
    assert.deepEqual(rows['Price, billed monthly'], ['$300 / mo', '$700 / mo', 'By contract']);
    assert.deepEqual(rows['Price, billed annually'], ['$3,000 / yr', '$7,000 / yr', '$50,000 / yr']);
    assert.deepEqual(rows['Then, per check'], ['$0.75', '$0.60', '$0.45']);
    assert.deepEqual(rows['Stations'], ['2', '5', 'Unlimited']);
  });

  test('with no env vars: no billing endpoints, default login URL', () => {
    assert.equal(config.billingBaseUrl, '');
    assert.equal(config.checkoutAction, null);
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
      'then $0.75 per check, capped by a limit you set', 'then $0.60 per check', 'then $0.45 per check',
      '1,500 devices processed per month', '4,500 devices processed per month', 'Unlimited devices processed per month',
      '2 stations', '5 stations', 'Unlimited stations', '5 staff users', '15 staff users', 'Unlimited staff users',
      'Email support, answered within one business day', 'A named contact and an onboarding call',
      'Annual · 2 months free', 'USDC invoice', 'Pay by card, or by monthly USDC invoice.', FOOTNOTE,
      'What counts as a device check?', 'What happens when we reach our included checks?']) {
      assert.ok(text(html).includes(s), s);
    }
    assert.ok(html.includes('<span>Start with Starter</span>'));
    assert.ok(html.includes('<span>Start with Growth</span>'));
    assert.match(html, /<a class="hv-10" href="#\/contact"[^>]*><span>Talk to us<\/span><\/a>/);
  });

  test('pricing, annual: per-month figure rounded, yearly total underneath, Enterprise sold', () => {
    const html = r.render({ page: 'pricing', annual: true });
    for (const s of ['$250', '$583', '$4,167', '$3,000 / year · 2 months free', '$7,000 / year', '$50,000 / year', 'Start with Enterprise']) assert.ok(html.includes(s), s);
  });

  test('pricing, USDC: annual is disabled and prices fall back to monthly', () => {
    const html = r.render({ page: 'pricing', annual: true, pay: 'invoice_usdc' });
    assert.ok(html.includes('USDC invoices are billed monthly.'));
    assert.match(html, /<button disabled=""[^>]*><span>Annual · 2 months free<\/span>/);
    assert.ok(html.includes('$300') && !html.includes('$250'));
    assert.ok(html.includes('Invoiced monthly · pay in USDC'));
  });

  test('Sign in links use the default login URL', () => {
    const html = r.render({ page: 'start', menu: true });
    const hrefs = [...html.matchAll(/<a [^>]*href="([^"]*)"[^>]*>Sign in<\/a>/g)].map(m => m[1]);
    assert.equal(hrefs.length, 4); // header, menu, Start tab, footer
    for (const h of hrefs) assert.equal(h, 'https://intake.inphox.net/auth/login');
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

  test('pricing, monthly card: Starter and Growth POST plan, interval and payment_mode to /billing/checkout', () => {
    const html = r.render({ page: 'pricing' });
    const fs = forms(html);
    for (const f of fs) {
      assert.match(f, /^<form method="post" action="https:\/\/billing\.example\.test\/billing\/checkout"/);
      assert.equal(hidden(f, 'interval'), 'month');
      assert.equal(hidden(f, 'payment_mode'), 'card');
    }
    // two cards plus the estimator's button (Starter is cheapest at the default 800 checks, 2 stations)
    assert.deepEqual(fs.map(f => hidden(f, 'plan')), ['starter', 'growth', 'starter']);
    assert.match(html, /href="#\/contact"[^>]*><span>Talk to us<\/span>/); // Enterprise monthly is never submitted
  });

  test('pricing, annual card: Enterprise is submitted with interval=year', () => {
    const fs = forms(r.render({ page: 'pricing', annual: true }));
    assert.deepEqual(fs.slice(0, 3).map(f => [hidden(f, 'plan'), hidden(f, 'interval'), hidden(f, 'payment_mode')]), [
      ['starter', 'year', 'card'], ['growth', 'year', 'card'], ['enterprise', 'year', 'card']
    ]);
  });

  test('pricing, USDC: interval is month and Enterprise is not submitted', () => {
    const fs = forms(r.render({ page: 'pricing', annual: true, pay: 'invoice_usdc' }));
    assert.ok(fs.length > 0);
    for (const f of fs) {
      assert.equal(hidden(f, 'interval'), 'month');
      assert.equal(hidden(f, 'payment_mode'), 'invoice_usdc');
      assert.notEqual(hidden(f, 'plan'), 'enterprise');
    }
  });

  test('Start: the plan step ends in checkout, or Talk to us for Enterprise monthly', () => {
    const growth = forms(r.render({ page: 'start', step: 2, plan: 'growth' }));
    assert.equal(growth.length, 1);
    assert.equal(hidden(growth[0], 'plan'), 'growth');
    const ent = r.render({ page: 'start', step: 2, plan: 'enterprise' });
    assert.equal(forms(ent).length, 0);
    assert.match(ent, /href="#\/contact"[^>]*><span>Talk to us<\/span>/);
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
