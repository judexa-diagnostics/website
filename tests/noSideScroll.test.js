// No sideways scroll on a phone. The hero's tilted phone sticks out 1-3 px past the screen at 320 and 390 px, which
// made every page wiggle sideways under a thumb. The page clips sideways with `overflow-x: clip` (not `hidden`, which
// would turn the page into a scroll box and break the sticky header). Run with `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(join(root, 'src/redesign/fx/fx.css'), 'utf8');

test('the page clips sideways so the tilted hero phone never adds a side scroll', () => {
  const rule = css.match(/\.fx-page\s*\{([^}]*)\}/g) || [];
  assert.ok(rule.some((r) => /overflow-x\s*:\s*clip/.test(r)), '.fx-page needs `overflow-x: clip`');
  assert.ok(!rule.some((r) => /overflow(-x)?\s*:\s*hidden/.test(r)), '`hidden` breaks the sticky header; use `clip`');
});

// Every page is a real address (inphox.net/pricing) with its own prerendered file; old #/ links are moved in the browser.
test('every page is a real path: a route, a prerendered file, served with clean URLs', async () => {
  const v = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'));
  assert.equal(v.cleanUrls, true);
  assert.equal(v.trailingSlash, false);
  assert.ok(!(v.redirects || []).some((r) => /#/.test(r.destination)), 'no redirect sends a page to a #/ address');
  const { ROUTES, pageFromPath, pageFromHash, pathFor } = await import('../src/routes.js');
  for (const r of ROUTES) {
    // One level more for Autograding by industry (/autograding/buyback, /es/autograding/buyback), 2026-11-27.
    assert.match(r.path, /^(\/es)?(\/[a-z-]*|\/autograding\/[a-z-]+)?$/, r.page);
    assert.equal(pageFromPath(r.path), r.page, r.path);
    assert.equal(pathFor(r.page, r.lang || 'en'), r.path);
    assert.ok(r.title && r.title.length <= 70, `${r.page}: a title of at most 70 characters`);
    assert.ok(r.description && r.description.length <= 170, `${r.page}: a description of at most 170 characters`);
  }
  assert.equal(new Set(ROUTES.map((r) => r.title)).size, ROUTES.length, 'every title is unique');
  assert.equal(new Set(ROUTES.map((r) => r.description)).size, ROUTES.length, 'every description is unique');
  assert.equal(pageFromHash('#/about'), 'about', 'old #/about links still find the page');
  assert.equal(pageFromPath('/about/'), 'about');
  assert.equal(pageFromPath('/no-such-page'), null, 'unknown paths are not pages (404)');
  for (const p of ['about', 'pricing', 'features', 'industries', 'security', 'careers', 'contact']) assert.ok(ROUTES.some((r) => r.page === p), `${p} is a route`);
  // Autograding is in English and Spanish; each names the other (hreflang) and Spanish lives under /es/.
  const { langFromPath, hasSpanish } = await import('../src/routes.js');
  assert.equal(pathFor('autograding', 'es'), '/es/autograding');
  assert.equal(langFromPath('/es/autograding'), 'es');
  assert.equal(langFromPath('/autograding'), 'en');
  // Every page is in Spanish too (Chris 2026-11-24), Spanish home at /es.
  for (const r of ROUTES.filter(x => !x.lang)) assert.ok(hasSpanish(r.page), `${r.page} has a Spanish page`);
  assert.equal(pathFor('pricing', 'es'), '/es/pricing');
  assert.equal(pathFor('home', 'es'), '/es');
  assert.equal(pageFromPath('/es'), 'home');
  assert.equal(langFromPath('/es'), 'es');
});

// Plan buttons go to Contact until the hub's sign-up is public (the hub answers 401 behind its password today).
test('plan buttons go to Contact while sign-up is closed (the default)', async () => {
  const { signupOpen } = await import('../src/config.js');
  assert.equal(signupOpen, false, 'with no setting, sign-up must read as closed');
  const logic = readFileSync(join(root, 'src/SiteLogic.js'), 'utf8');
  assert.match(logic, /const planAction = p => p\.talkToSales \|\| !signupOpen \? \{ href: SALES_HREF \}/);
});
