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

// Typed addresses (inphox.net/pricing) open the page instead of a 404: the site's pages live after `#/`.
test('every page has a plain address that redirects to its #/ page', () => {
  const v = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'));
  const logic = readFileSync(join(root, 'src/SiteLogic.js'), 'utf8');
  const pages = JSON.parse(logic.match(/const PAGES = (\[[^\]]*\])/)[1].replace(/'/g, '"'));
  for (const p of pages.filter((p) => !['home', 'signup-busy'].includes(p))) {
    assert.ok(v.redirects.some((r) => r.source === `/${p}` && r.destination === `/#/${p}`), `/${p} has no redirect`);
  }
});
