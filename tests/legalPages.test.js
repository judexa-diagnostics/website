// website#20 (odm#1333 legal run): the draft compliance pages, their footer links, and security.txt.
// The pages ship as plain customer-protective drafts marked "Draft, needs Chris's lawyer"; only the text changes
// later. Run with `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

const PAGES = ['refunds', 'copyright', 'law-enforcement', 'subprocessors', 'erasure'];

test('each draft legal page exists and is marked a lawyer draft', () => {
  for (const slug of PAGES) {
    const txt = read(join('src/legal', slug + '.txt'));
    assert.match(txt, /^Version:/m, `${slug}: has a Version line`);
    assert.match(txt, /^Title:/m, `${slug}: has a Title line`);
    assert.match(txt, /Draft, needs Chris's lawyer/i, `${slug}: marked as a lawyer draft`);
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

test('Legal.jsx shows a Draft banner for a draft version', () => {
  const legal = read('src/pages/Legal.jsx');
  assert.ok(legal.includes("needs Chris's lawyer"), 'the Draft banner text is present');
  assert.match(legal, /isDraft/, 'the Draft banner is gated on the draft version');
});

test('security.txt is served from /.well-known with a contact and expiry', () => {
  const p = 'public/.well-known/security.txt';
  assert.ok(existsSync(join(root, p)), 'security.txt exists');
  const txt = read(p);
  assert.match(txt, /^Contact:/m, 'has a Contact line');
  assert.match(txt, /^Expires:/m, 'has an Expires line');
});
