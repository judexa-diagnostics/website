// website#20 (odm#1333 legal run): the draft compliance pages, their footer links, and security.txt.
// Reviewed 2026-11-14: the pages carry a plain dated Version line, and nothing internal (names, placeholders) shows. Run with `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

const PAGES = ['refunds', 'copyright', 'law-enforcement', 'subprocessors', 'erasure'];

test('each legal page exists, is dated and shows nothing internal', () => {
  for (const slug of PAGES) {
    const txt = read(join('src/legal', slug + '.txt'));
    assert.match(txt, /^Version:/m, `${slug}: has a Version line`);
    assert.match(txt, /^Title:/m, `${slug}: has a Title line`);
    assert.match(txt, /^Version: \d{4}-\d{2}-\d{2}$/m, `${slug}: a plain dated version`);
    assert.doesNotMatch(txt, /Chris|lawyer|pending|TODO|\[[^\]]*\]/i, `${slug}: no internal names or placeholders`);
  }
});

test('the pages are routable (in PAGES) and dispatched in Layout', () => {
  const site = read('src/SiteLogic.js');
  const layout = read('src/Layout.jsx');
  for (const slug of PAGES) {
    assert.ok(site.includes(`'${slug}'`), `${slug}: in the PAGES list`);
    assert.ok(layout.includes(`doc="${slug}"`), `${slug}: dispatched in Layout.jsx`);
  }
});

test('the footer links to each page', () => {
  const footer = read('src/components/Footer.jsx');
  for (const slug of PAGES) {
    assert.ok(footer.includes(`href="#/${slug}"`), `footer links to #/${slug}`);
  }
});

test('Legal.jsx shows a neutral Draft banner for a draft version', () => {
  const legal = read('src/pages/Legal.jsx');
  assert.ok(!/Chris|lawyer/.test(legal), 'the banner names nobody');
  assert.match(legal, /isDraft/, 'the Draft banner is gated on the draft version');
});

test('security.txt is served from /.well-known with a contact and expiry', () => {
  const p = 'public/.well-known/security.txt';
  assert.ok(existsSync(join(root, p)), 'security.txt exists');
  const txt = read(p);
  assert.match(txt, /^Contact:/m, 'has a Contact line');
  assert.match(txt, /^Expires:/m, 'has an Expires line');
  // RFC 9116 2.5.5: Expires SHOULD be less than a year ahead.
  const exp = Date.parse(txt.match(/^Expires:\s*(\S+)/m)[1]);
  assert.ok(exp - Date.parse('2026-11-14') < 365 * 864e5, 'expires within a year of the review');
  assert.doesNotMatch(txt, /^Policy:.*subprocessors/m, 'no Policy link to an unrelated page');
});
