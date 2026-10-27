// Plans, price table and plan-link tests (REQ S2-021..S2-023 in odoo-device-management). Run with `npm test`
// (Node's built-in runner, no extra dependencies). The first group reads src/pricing.js and src/config.js directly. The others render the real pages
// through Vite's SSR loader, once without the billing env vars and once with them.

import { test, describe, before, after } from 'node:test';
import { signupOpen } from '../src/config.js';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Keep the shell's env out of the "unset" cases.
delete process.env.VITE_PLATFORM_URL;
delete process.env.VITE_BILLING_BASE_URL;
delete process.env.VITE_SHOP_DOMAIN;
delete process.env.VITE_HUB_URL;


describe('plan data', async () => {
  const P = await import('../src/pricing.js');
  const config = await import('../src/config.js');
  const { pricing } = P;
  const plan = code => P.findPlan(code);

  test('the plans billing sells, with exactly its names and monthly prices', () => {
    assert.deepEqual(pricing.plans.map(p => [p.code, p.name, p.price]), [
      ['free', 'Free', 0], ['basics', 'Basics', 30], ['growth', 'Growth', 150], ['max', 'Max', 500], ['enterprise', 'Enterprise', null]
    ]);
  });

  test('included checks, staff and locations match billing (entitlements migration 050)', () => {
    assert.deepEqual(pricing.plans.map(p => [p.code, p.checksIncluded, p.staff, p.locations]), [
      ['free', 25, 0, 1], ['basics', 125, 3, 1], ['growth', 1000, 30, 5], ['max', 5000, null, null], ['enterprise', null, null, null]
    ]);
  });

  test('the rate stays $0.50 for central_sync, one flat rate (no bands, no floor)', () => {
    assert.equal(P.OVERAGE_PER_CHECK, 0.5);
    for (const p of pricing.plans) {
      assert.equal(p.overageTiers, undefined, p.code);
      assert.equal(p.overageRate, undefined, p.code);
    }
  });

  test('every plan shows only "Prepaid and overage plans available." (Chris 10-26: no rate on the site)', () => {
    for (const p of pricing.plans) assert.equal(P.overageLine(p), 'Prepaid and overage plans available.', p.code);
    for (const row of P.compareRows()) assert.ok(!/past that|\$0\.50/i.test(row.join(' ')), row[0]);
    for (const f of pricing.faq) assert.doesNotMatch(f.a, /\$0\.50|billed at the end of the month/, f.q);
  });

  test('no graduated-band wording or code is left anywhere in src/ or the README', () => {
    const files = readdirSync(join(root, 'src'), { recursive: true }).filter(f => /\.(jsx?|css)$/.test(f)).map(f => join('src', f));
    for (const f of [...files, 'README.md', 'index.html']) {
      const t = readFileSync(join(root, f), 'utf8');
      assert.doesNotMatch(t, /graduated|overageTiers|PER_CHECK_FLOOR|\$0\.35|cheaper the more you run|volume rates|falling to|\bStarter\b/, f);
    }
  });

  test('the Free card line: credit or debit, a $1 hold released, nothing charged, no prepaid', () => {
    const note = plan('free').cardNote;
    for (const s of ['credit or debit card is required', '$1 hold', 'released', 'Nothing is charged', 'Prepaid cards are not accepted']) assert.ok(note.includes(s), s);
    assert.equal(P.planCard(plan('free')).checks, '25 device checks included a month');
  });

  test('the plan links: sold plans go to the hub with their code, nothing else is ever built', () => {
    for (const code of ['free', 'basics', 'growth', 'max']) assert.equal(P.signupUrl(code), `https://home.inphox.net/signup?plan=${code}`);
    assert.equal(P.signupUrl('enterprise'), null, 'Enterprise goes to sales, not to the hub');
    for (const bad of ['starter', 'enterprise-free', '', undefined, '../x', 'free&x=1']) assert.equal(P.signupUrl(bad), null, String(bad));
    assert.equal(P.signupUrl('growth', 'https://hub.example.test/'), 'https://hub.example.test/signup?plan=growth');
  });

  test('the hub address comes from VITE_HUB_URL, default home.inphox.net', () => {
    assert.equal(config.hubUrl, 'https://home.inphox.net');
  });

  test('the price table has no pack prices; one placeholder line is driven from pricing.js', () => {
    assert.deepEqual(pricing.packs.rows, []);
    assert.equal(typeof pricing.packs.line, 'string');
    assert.ok(!/\$\d/.test(pricing.packs.line));
  });

  test('the FAQ answers "what happens when I go over" in two sentences', () => {
    const f = pricing.faq[0];
    assert.match(f.q, /go over/);
    assert.equal(f.a.split(/(?<=\.)\s+/).length, 2);
    assert.ok(f.a.includes('Prepaid and overage plans are available') && f.a.includes('spending limit') && !f.a.includes('$0.50'));
  });

  test('each plan has everything of the plan before it; the compare table is built from the plan data', () => {
    const rows = P.compareRows();
    for (const r of rows) assert.equal(r.length, pricing.plans.length + 1, r[0]);
    const by = Object.fromEntries(rows.map(r => [r[0], r.slice(1)]));
    assert.deepEqual(by['Price a month'], ['$0', '$30', '$150', '$500', 'Talk to sales']);
    assert.deepEqual(by['Device checks included a month'], ['25', '125', '1,000', '5,000', 'By contract']);
    assert.deepEqual(by['Employees'], ['\u2014', 'Included', 'Included', 'Included', 'Included']);
    assert.deepEqual(by['Phone Intake'].slice(0, 4), ['—', '—', 'Included', 'Included']);
    assert.deepEqual(by['Repairs'], ['—', 'Add-on, $40 a month', 'Add-on, $100 a month', 'Included', 'Included']);
  });

  test('with no env vars: the Contact form goes to the InPhox platform, default login URL', () => {
    assert.equal(config.platformUrl, 'https://platform.inphox.net');
    assert.equal(config.signupAction, undefined, 'sign-up is the hub, not a form on this site');
    assert.equal(config.leadAction, 'https://platform.inphox.net/inphox/lead');
    assert.equal(config.shopDomain, 'inphox.net');
    assert.equal(config.SIGNIN_HREF, '#/signin');
  });

  test('no Odoo, vendor or P&M names in src/ or index.html', () => {
    const files = readdirSync(join(root, 'src'), { recursive: true }).filter(f => /\.(jsx?|css)$/.test(f)).map(f => join('src', f));
    for (const f of [...files, 'index.html']) {
      const text = readFileSync(join(root, f), 'utf8');
      assert.doesNotMatch(text, /odoo|sickw|P&M|pmelectronics/i, f);
    }
  });
});

describe('JavaScript off', async () => {
  const P = await import('../src/pricing.js');
  const { noscriptPlans } = await import('../src/noscriptPlans.js');

  test('the noscript block reads every plan, price, included checks and the overage sentence, from pricing.js', () => {
    const html = noscriptPlans();
    for (const p of P.pricing.plans) {
      const c = P.planCard(p);
      for (const s of [p.name, c.priceStr, c.checks, c.overage]) assert.ok(html.includes(s), `${p.code}: ${s}`);
    }
    for (const code of ['free', 'basics', 'growth', 'max']) assert.ok(html.includes(`href="https://home.inphox.net/signup?plan=${code}"`), code);
    assert.ok(html.startsWith('<noscript>') && html.endsWith('</noscript>'));
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

const text = html => html.replaceAll('&#x27;', "'").replaceAll('&quot;', '"').replaceAll('&amp;', '&');

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



const PAGES = ['home', 'industries', 'features', 'pricing', 'contact', 'platform', 'start', 'signin', 'signup-busy'];
const planLinks = html => [...html.matchAll(/<a [^>]*href="([^"]*)"[^>]*>/g)].map(m => m[1].replaceAll('&amp;', '&'));

describe('rendered', () => {
  let r;
  before(async () => (r = await renderWith('VITE_PLATFORM_URL=off\n')));
  after(() => r.close());

  test('every page renders, with no old plan names or prices left', () => {
    for (const page of PAGES) {
      const html = text(r.render({ page }));
      assert.ok(html.length > 500, page);
      assert.doesNotMatch(html, /Starter|\$300|\$700|\$5,000|0\.35|graduated|cheaper the more/, page);
    }
  });

  test('pricing: five plans, each price with the prepaid and overage line beside it, no rate anywhere', () => {
    const html = text(r.render({ page: 'pricing' }));
    for (const s of ['>Free<', '>Basics<', '>Growth<', '>Max<', '>Enterprise<', '$0', '$30', '$150', '$500', 'Talk to sales']) assert.ok(html.includes(s), s);
    const cards = html.match(/<article.*?<\/article>/gs);
    assert.equal(cards.length, 5);
    for (const card of cards) assert.match(card, /class="pl-over">Prepaid and overage plans available\.</);
    assert.ok(cards[0].includes('Prepaid cards are not accepted'));
    assert.ok(!html.includes('$0.50') && !html.includes('Custom overage'), 'no rate on the pricing page');
    assert.ok(!html.includes('/ year') && !html.includes('Annual'), 'no annual billing');
  });

  test('pricing: Free, Basics, Growth and Max buttons are links to the hub with their code; Enterprise goes to sales', () => {
    const html = r.render({ page: 'pricing' });
    const cards = html.match(/<article.*?<\/article>/gs);
    const hrefs = cards.map(c => c.match(/<a [^>]*class="pl-btn"[^>]*href="([^"]*)"|<a [^>]*href="([^"]*)"[^>]*class="pl-btn"/)).map(m => m[1] || m[2]);
    // Until the hub's sign-up is public (src/config.js signupOpen), every plan button goes to Contact.
    const hub = ['free', 'basics', 'growth', 'max'].map(c => (signupOpen ? `https://home.inphox.net/signup?plan=${c}` : '#/contact'));
    assert.deepEqual(hrefs, [...hub, '#/contact']);
  });

  test('pricing: no packs line ("coming") and no pack price table; the plan line says prepaid is available', () => {
    const html = text(r.render({ page: 'pricing' }));
    assert.ok(!html.includes('Prepaid check packs are coming') && !html.includes('pl-packs'));
    assert.ok(!/120 checks|1,000 checks \$/.test(html));
  });

  test('pricing: the "what happens when I go over" answer is in the page; compare comes before questions', () => {
    const html = text(r.render({ page: 'pricing' }));
    assert.ok(html.includes('What happens when I go over my included checks?'));
    assert.ok(html.indexOf('Compare plans') < html.indexOf('>Questions<'));
    assert.match(html, /<table>.*<th scope="col">Free<\/th>.*<th scope="row">Price a month<\/th>/s);
  });

  test('pricing: reachable by keyboard (real links and buttons, the table scroller takes focus), no horizontal page scroll rules', () => {
    const html = r.render({ page: 'pricing' });
    assert.ok(html.includes('tabindex="0"'));
    assert.ok(!/<div[^>]*onclick/i.test(html));
    const css = readFileSync(join(root, 'src', 'plans.css'), 'utf8');
    assert.match(css, /focus-visible/);
    assert.match(css, /minmax\(min\(100%,13\.5rem\)/);
  });

  test('Start: lists the plans with hub links, no sign-up form on this site', () => {
    const html = text(r.render({ page: 'start' }));
    assert.ok(!html.includes('<form') && !html.includes('type="password"') && !html.includes('type="email"'));
    if (!signupOpen) {   // closed: no hub sign-up link anywhere, plan buttons go to Contact
      assert.ok(!planLinks(html).some(h => h.includes('/signup')) && planLinks(html).includes('#/contact'), 'closed: Contact');
      return;
    }
    for (const code of ['free', 'basics', 'growth', 'max']) assert.ok(planLinks(html).includes(`https://home.inphox.net/signup?plan=${code}`), code);
  });

  test('the hub being down lands on "Sign-up is busy, try again in a minute"', () => {
    const html = text(r.render({ page: 'signup-busy' }));
    assert.ok(html.includes('Sign-up is busy, try again in a minute.'));
    assert.ok(html.includes('role="alert"'));
    assert.ok(html.includes('href="#/pricing"'));
  });

  test('an unknown page hash still shows the home page; the busy page is a known hash', async () => {
    const { default: SiteLogic } = await import('../src/SiteLogic.js').catch(() => ({}));
    const realLocation = globalThis.location;
    try {
      for (const [hash, want] of [['#/signup-busy', 'signup-busy'], ['#/starter', 'home'], ['#/pricing', 'pricing']]) {
        globalThis.location = { hash };
        const logic = r.logicWith({});
        assert.equal(logic.readPage(), want, hash);
      }
    } finally { globalThis.location = realLocation; }
  });

  test('every Sign in link goes to the hub sign-in once public, else to Sign in to your shop', () => {
    const html = r.render({ page: 'start', menu: true });
    const hrefs = [...html.matchAll(/<a [^>]*href="([^"]*)"[^>]*>Sign in<\/a>/g)].map(m => m[1]);
    assert.equal(hrefs.length, 4); // header, menu, Start tab, footer
    for (const h of hrefs) assert.equal(h, signupOpen ? 'https://home.inphox.net/login' : '#/signin');
    assert.ok(!html.includes('intake.inphox.net'));
    assert.ok(!html.includes('/web/login'), 'no direct Odoo sign-in page on the site');
  });

  test('Sign in to your shop: asks for the shop name on inphox.net; remembers the last one', () => {
    const html = text(r.render({ page: 'signin' }));
    for (const s of ['Sign in to your shop.', "Your shop's address", '.inphox.net', 'Continue to sign in']) assert.ok(html.includes(s), s);
    assert.ok(!html.includes('Last time you signed in to'));
    const again = text(r.render({ page: 'signin', siLast: 'bayareaphones' }));
    assert.ok(again.includes('bayareaphones.inphox.net'));
    assert.ok(again.includes('Continue to this shop'));
  });

  test('Sign in to your shop: a bad name shows an error and goes nowhere', () => {
    const realLocation = globalThis.location;
    const visited = [];
    globalThis.location = { assign: url => visited.push(url), hash: '#/signin' };
    try {
      const logic = r.logicWith({ page: 'signin', siShop: 'not a shop!' });
      logic.renderVals().si.submit({ preventDefault() {} });
      assert.equal(visited.length, 0);
      assert.match(logic.state.siErr, /letters, numbers and dashes/);
      const good = r.logicWith({ page: 'signin', siShop: 'https://BayAreaPhones.inphox.net/web/login' });
      good.renderVals().si.submit({ preventDefault() {} });
      assert.deepEqual(visited, ['https://bayareaphones.inphox.net/web/login']);
    } finally {
      globalThis.location = realLocation;
    }
  });

  test('Contact form stays client-side: success without a request', async () => {
    const { calls, state } = await submitLead(r, () => { throw new Error('no request expected'); });
    assert.equal(calls.length, 0);
    assert.equal(state.cSent, true);
  });
});


describe('rendered, platform configured', () => {
  let r;
  before(async () => (r = await renderWith('VITE_PLATFORM_URL=https://platform.example.test/\nVITE_SHOP_DOMAIN=shops.example.test\n')));
  after(() => r.close());

  test('a configured shop domain is used on Sign in to your shop', () => {
    const html = text(r.render({ page: 'signin' }));
    assert.ok(html.includes('.shops.example.test'));
  });

  test('Contact form POSTs name, email, company, segment, volume to /inphox/lead; 2xx shows success', async () => {
    const { calls, state } = await submitLead(r, () => ({ ok: true, status: 204 }));
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, 'https://platform.example.test/inphox/lead');
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

describe('rendered, sign-up open (the go-live build: VITE_SIGNUP_OPEN=1)', () => {
  let r;
  before(async () => (r = await renderWith('VITE_SIGNUP_OPEN=1\nVITE_PLATFORM_URL=off\n')));
  after(() => r.close());

  test('every Sign in link opens the InPhox hub sign-in, never a shop\'s own Odoo page', () => {
    const html = r.render({ page: 'start', menu: true });
    const hrefs = [...html.matchAll(/<a [^>]*href="([^"]*)"[^>]*>Sign in<\/a>/g)].map(m => m[1]);
    assert.equal(hrefs.length, 4); // header, menu, Start tab, footer
    for (const h of hrefs) assert.equal(h, 'https://home.inphox.net/login');
    assert.ok(!html.includes('/web/login') && !html.includes('intake.inphox.net'));
  });

  test('plan buttons and Start go to the hub sign-up with the plan code; Enterprise still goes to sales', () => {
    for (const page of ['pricing', 'start']) {
      const links = planLinks(r.render({ page }));
      for (const code of ['free', 'basics', 'growth', 'max']) assert.ok(links.includes(`https://home.inphox.net/signup?plan=${code}`), `${page} ${code}`);
      assert.ok(links.includes('#/contact'), `${page} enterprise -> sales`);
    }
  });
});

describe('rendered, phone-intake only (today\'s production build)', () => {
  let r;
  before(async () => (r = await renderWith('VITE_BILLING_BASE_URL=https://intake.example.test/\n')));
  after(() => r.close());

  test('Contact goes to phone-intake until VITE_PLATFORM_URL is set', async () => {
    const lead = await submitLead(r, () => ({ ok: true, status: 204 }));
    assert.equal(lead.calls[0].url, 'https://intake.example.test/billing/lead');
  });
});
