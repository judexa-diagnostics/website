// Home page redesign (issue #11, W2–W5): hero, proof, short story, plan cards, no unsourced quotes.
// Rendered through Vite's SSR loader like tests/pricing.test.js.
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
for (const k of ['VITE_PLATFORM_URL', 'VITE_BILLING_BASE_URL', 'VITE_SHOP_DOMAIN', 'VITE_HUB_URL']) delete process.env[k];
const text = html => html.replaceAll('&#x27;', "'").replaceAll('&quot;', '"').replaceAll('&amp;', '&');

describe('home data', async () => {
  const P = await import('../src/pricing.js');
  const H = await import('../src/home.js');
  const free = P.findPlan('free');

  test('the trust line is built from the Free plan and the overage rate', () => {
    assert.deepEqual(P.trustLine(), [
      `Free plan: ${free.checksIncluded} device checks a month`, `$${P.OVERAGE_PER_CHECK.toFixed(2)} a check after that`, 'card needed, nothing charged'
    ]);
    assert.equal(P.trustLine()[0], 'Free plan: 25 device checks a month');
  });

  test('the home plan cards are the same plan objects as the Plans page (Free, Basics, Growth)', () => {
    const t = P.teaserPlans();
    assert.deepEqual(t.map(p => p.code), ['free', 'basics', 'growth']);
    t.forEach((p, i) => assert.equal(p, P.pricing.plans[i])); // same objects, not copies
  });

  test('proof facts quote pricing.js, not typed-in numbers', () => {
    const last = H.proofFacts().at(-1);
    assert.equal(last.k, `${P.pricing.plans.length} plans`);
    assert.match(last.d, /from \$0 a month, then \$0\.50 a check/);
  });

  test('no unsourced testimonials anywhere in src/', () => {
    assert.deepEqual(H.VERIFIED_QUOTES, []);
    const files = d => readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? files(p) : [p]; });
    for (const f of files(join(root, 'src')).filter(f => /\.(jsx?)$/.test(f))) {
      assert.doesNotMatch(readFileSync(f, 'utf8'), /Second Signal Phones|FixFirst Electronics|CellPoint Kiosks|Heard at the counter'|Operations lead · Northgate/, f);
    }
  });

  test('every how-it-works still exists in public/', () => {
    for (const s of H.HOW_STEPS) assert.ok(statSync(join(root, 'public', s.img)).size > 10000, s.img);
  });
});

describe('home rendered', () => {
  let server, render;
  before(async () => {
    const { createServer } = await import('vite');
    const envDir = mkdtempSync(join(tmpdir(), 'inphox-env-'));
    server = await createServer({ root, envDir, logLevel: 'silent', appType: 'custom', server: { middlewareMode: true, hmr: false, ws: false } });
    server.__envDir = envDir;
    const { createElement } = await import('react');
    const { renderToStaticMarkup } = await import('react-dom/server');
    const { default: SiteLogic } = await server.ssrLoadModule('/src/SiteLogic.js');
    const { default: Layout } = await server.ssrLoadModule('/src/Layout.jsx');
    render = state => {
      const logic = new SiteLogic({});
      logic.state = { ...logic.state, ...state };
      return text(renderToStaticMarkup(createElement(Layout, { v: logic.renderVals() })));
    };
  });
  after(async () => { await server.close(); rmSync(server.__envDir, { recursive: true, force: true }); });

  test('hero: a real H1 in the page, Start free first, See plans second, the trust line under them', () => {
    const html = render({ page: 'home' });
    const main = html.slice(html.indexOf('<main'));
    assert.match(main, /<h1 id="hm-h1" class="hm-h1">The all-in-one platform for used electronics/);
    const firstButton = main.match(/<button[^>]*>([^<]*)<\/button>/)[1];
    assert.equal(firstButton, 'Start free');
    const hero = main.slice(0, main.indexOf('hm-proof'));
    assert.ok(hero.indexOf('Start free') < hero.indexOf('See plans') && hero.indexOf('See plans') < hero.indexOf('Free plan: 25 device checks a month'));
    assert.doesNotMatch(main, /hp-phone|hp-h1/); // the tilted phone picture is not on the page
  });

  test('order: hero, proof, how it works, after the sale, station, plans, close', () => {
    const html = render({ page: 'home' });
    const at = s => { const i = html.indexOf(s); assert.ok(i > 0, s); return i; };
    const order = ['hm-hero', 'hm-proof', 'id="how"', 'id="hm-after"', 'st-root', 'id="hm-plans"', 'id="hm-close"'].map(at);
    assert.deepEqual(order, [...order].sort((a, b) => a - b));
  });

  test('the 3D walkthrough is opt-in: not on the page until asked for', () => {
    const html = render({ page: 'home' });
    assert.ok(html.includes('Watch the full walkthrough'));
    assert.ok(!html.includes('sx-root'));
    assert.ok(render({ page: 'home', walk: true }).includes('Close the walkthrough'));
  });

  test('plan cards: Free, Basics and Growth from pricing.js, linking to the hub (Contact while sign-up is closed), then Compare all plans', async () => {
    const { signupOpen } = await import('../src/config.js');
    const html = render({ page: 'home' });
    const plans = html.slice(html.indexOf('id="hm-plans"'), html.indexOf('id="hm-close"'));
    assert.deepEqual([...plans.matchAll(/class="pl-name">([^<]+)</g)].map(m => m[1]), ['Free', 'Basics', 'Growth']);
    for (const [code, price] of [['free', '$0'], ['basics', '$30'], ['growth', '$150']]) {
      assert.ok(plans.includes(signupOpen ? `href="https://home.inphox.net/signup?plan=${code}"` : 'href="#/contact"'), code);
      assert.ok(plans.includes(`<b>${price}</b>`), price);
    }
    assert.ok(plans.includes('Compare all plans'));
    assert.ok(!plans.includes('Max'));
  });

  test('testimonials stay hidden while there are no verified quotes', () => {
    assert.ok(!render({ page: 'home' }).includes('Heard at the counter'));
  });
});
