// The website uses the apps' base template tokens (issue #11, W1). src/tokens.css is the template's
// token block; the home page and the shared chrome read only those names, never raw colours.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = p => readFileSync(join(root, p), 'utf8');
const HEX = /#[0-9a-fA-F]{3,8}\b/g;

test('tokens.css carries the template values (BASE_TEMPLATE_INVENTORY.md §7), light only', () => {
  const css = read('src/tokens.css');
  const want = {
    '--pmm-bg': '#ffffff', '--pmm-surface': '#ffffff', '--pmm-text': '#0f172a',
    '--pmm-brand': '#C67139', '--pmm-brand-dark': '#b2622d', '--pmm-brand-fill': '#b05a26', '--pmm-brand-soft': '#fff2eb',
    '--pmm-radius-field': '.375rem', '--pmm-radius': '.5rem', '--pmm-radius-card': '.75rem', '--pmm-radius-pill': '999px'
  };
  for (const [k, v] of Object.entries(want)) assert.match(css, new RegExp(`${k}:\\s*${v.replace('.', '\\.')};`), k);
  assert.match(css, /--pmm-font-sans:\s*"Satoshi"/);
  // No dark block: the rest of the site has no dark theme, so an OS setting must not half-theme a page.
  assert.doesNotMatch(css, /prefers-color-scheme:\s*dark|data-theme="dark"/);
});

test('the page frame is the template background and font, not paper and Archivo', () => {
  const css = read('src/index.css');
  assert.match(css, /body\{[^}]*background:var\(--pmm-bg\)/);
  assert.match(css, /body\{[^}]*font-family:var\(--pmm-font-sans\)/);
  assert.doesNotMatch(css, /F6F2EA|Archivo/);
  assert.ok(read('src/main.jsx').indexOf("'./tokens.css'") < read('src/main.jsx').indexOf("'./index.css'"));
});

test('no raw hex colour in the home page, the shared chrome or the plan cards', () => {
  for (const f of ['src/pages/Home.jsx', 'src/components/Header.jsx', 'src/components/Footer.jsx', 'src/components/SiteMenu.jsx',
    'src/components/PlanCard.jsx', 'src/Layout.jsx', 'src/pages/Pricing.jsx', 'src/pages/Start.jsx', 'src/pages/SignupBusy.jsx', 'src/plans.css']) {
    assert.deepEqual(read(f).match(HEX) || [], [], f);
  }
});

test('home.css: a raw colour only as a named custom property (the paper-ledger illustration)', () => {
  const lines = read('src/home.css').split('\n');
  const bad = lines.filter(l => /#[0-9a-fA-F]{3,8}\b/.test(l) && !/^\s*(--[\w-]+:\s*#[0-9a-fA-F]+;\s*)+(\/\*.*\*\/)?\s*$/.test(l));
  assert.deepEqual(bad, []);
});

test('buttons: the template radius and the filled brand colour with white text', () => {
  const css = read('src/tokens.css');
  assert.match(css, /\.ix-btn \{[^}]*border-radius: var\(--pmm-radius\)/);
  assert.match(css, /\.ix-btn\.is-primary \{[^}]*background: var\(--pmm-brand-fill\)[^}]*color: #fff/);
  assert.match(css, /max-width: 47\.99rem\) \{\s*\.ix-btn \{ min-height: 3rem; \}/); // 48px touch height on phones
});

test('one promo strip at most: the fixed "New" strip is gone', () => {
  assert.ok(!existsSync(join(root, 'src/components/PromoBar.jsx')));
  assert.doesNotMatch(read('src/Layout.jsx'), /PromoBar|promo/);
  assert.doesNotMatch(read('src/SiteLogic.js'), /promoFixed|promoX|heroBarRef/);
  assert.doesNotMatch(read('src/pages/Home.jsx'), /position:\s*"fixed"|>New</);
});
