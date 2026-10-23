// Brand alignment on the sign-in and start-free paths (KIRO_5 W4 "One look").
// The product/sign-in affordances must read the shop's product copper #C67139
// with the Satoshi face, not the marketing orange (#EB5E12 / #C2470A). The 3D
// marketing surfaces keep #EB5E12, so this test only guards the two product
// entry paths and the global brand tokens. Run with `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

// The shop app's product brand (pm_product_manager): copper accent + Satoshi.
const SHOP_COPPER = '#C67139';
// Marketing oranges that must not leak onto the product entry paths.
const MARKETING_ORANGE = /#EB5E12/i;        // Signin.jsx / Start.jsx affordances
const MARKETING_LINK_ORANGE = /#C2470A/i;   // index.css link token

const AFFORDANCE_PAGES = ['src/pages/Signin.jsx', 'src/pages/Start.jsx'];

test('the sign-in and start-free affordances do not use the marketing orange', () => {
  for (const p of AFFORDANCE_PAGES) {
    const css = read(p);
    assert.ok(!MARKETING_ORANGE.test(css), `${p} still uses the marketing orange #EB5E12`);
  }
});

test('the sign-in and start-free affordances use the shop product copper', () => {
  for (const p of AFFORDANCE_PAGES) {
    const css = read(p);
    assert.ok(css.includes(SHOP_COPPER), `${p} does not use the shop copper ${SHOP_COPPER}`);
  }
});

test('the global brand tokens match the shop: Satoshi face and copper links', () => {
  const css = read('src/index.css');
  assert.match(css, /font-family:\s*'Satoshi'/i, 'body font is not Satoshi');
  assert.ok(css.includes(SHOP_COPPER), `index.css does not use the shop copper ${SHOP_COPPER}`);
  assert.ok(!MARKETING_LINK_ORANGE.test(css), 'index.css link token still uses the marketing orange #C2470A');
});

test('Satoshi is actually loaded for the page', () => {
  const html = read('index.html');
  assert.match(html, /satoshi/i, 'index.html does not load the Satoshi face');
});

// Guardrail: the marketing 3D design keeps its orange. If this ever flips to
// zero it means someone rebranded the marketing surfaces, which W4 forbids.
test('the marketing 3D surfaces still keep their own orange (untouched)', () => {
  const marketing = read('src/redesign/story/story.css');
  assert.ok(MARKETING_ORANGE.test(marketing), 'marketing 3D story.css no longer uses #EB5E12 — scope creep');
});
