// website#19 (odm#1333 legal run, rows L14/L17/L53/L59): no outside font host, a cookie section, a contact-form
// privacy notice, a business address/phone in the footer, a skip link, and an accessibility statement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

test('no request to an outside font host on load (fonts are self-hosted)', () => {
  const html = read('index.html');
  assert.ok(!/fonts\.googleapis\.com|api\.fontshare\.com|fonts\.gstatic\.com/.test(html), 'index.html loads no outside font host');
  const fontsCss = read('src/styles/fonts.css');
  assert.ok(fontsCss.includes("url('/fonts/"), 'fonts.css serves local /fonts files');
  assert.ok(!/https?:|\/\/cdn|fontshare|googleapis/.test(fontsCss), 'fonts.css has no outside URL');
  const woff2 = readdirSync(join(root, 'public/fonts')).filter((f) => f.endsWith('.woff2'));
  assert.ok(woff2.length >= 3, 'the woff2 files are committed to public/fonts');
});

test('a cookie section and an accessibility statement exist and are drafts', () => {
  for (const slug of ['cookies', 'accessibility']) {
    const txt = read(join('src/legal', slug + '.txt'));
    assert.match(txt, /Draft, needs Chris's lawyer|plain statement/i, `${slug} is a draft/statement`);
    assert.ok(read('src/SiteLogic.js').includes(`'${slug}'`), `${slug} is routable`);
    assert.ok(read('src/components/Footer.jsx').includes(`href="#/${slug}"`), `footer links to ${slug}`);
  }
});

test('the contact form shows a privacy notice with a Privacy link', () => {
  const c = read('src/pages/Contact.jsx');
  assert.match(c, /Privacy Policy/);
  assert.ok(c.includes('href="#/privacy"'), 'the notice links to the Privacy Policy');
});

test('the footer carries a business address and phone (placeholders pending Chris)', () => {
  const f = read('src/components/Footer.jsx');
  assert.ok(f.includes('data-needs-chris="postal-address"'), 'a postal-address slot is in the footer');
  assert.ok(f.includes('data-needs-chris="phone"'), 'a phone slot is in the footer');
});

test('there is a skip link to the main content', () => {
  const l = read('src/Layout.jsx');
  assert.match(l, /href="#main"/);
  assert.match(l, /Skip to main content/);
  assert.match(l, /id="main"/);
});
