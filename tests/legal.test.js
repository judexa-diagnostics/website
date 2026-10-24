// Terms and Privacy pages (2026-10-24): the footer links used to go nowhere (#/home). They now open the same texts the
// sign-in hub shows. Run with `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseLegal } from '../src/legalDoc.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = p => readFileSync(join(root, p), 'utf8');

test('both texts parse with a version, a title and real paragraphs', () => {
  for (const [file, title] of [['src/legal/terms.txt', 'Terms of Service'], ['src/legal/privacy.txt', 'Privacy Policy']]) {
    const d = parseLegal(read(file));
    assert.match(d.version, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(d.title, title);
    assert.ok(d.paragraphs.length >= 15, file);
    assert.ok(!d.paragraphs.join(' ').includes('PLACEHOLDER'), file);
  }
});

test('the parser joins wrapped lines and drops blank paragraphs', () => {
  const d = parseLegal('Version: 2026-10-24\r\nTitle: T\r\n\r\nOne\r\nline.\r\n\r\n\r\nTwo.\r\n');
  assert.deepEqual(d, { version: '2026-10-24', title: 'T', paragraphs: ['One line.', 'Two.'] });
});

test('terms and privacy are pages, linked from the footer, with clean URLs', () => {
  assert.match(read('src/SiteLogic.js'), /'terms','privacy'\]/);
  const layout = read('src/Layout.jsx');
  assert.ok(layout.includes('<Legal doc="terms" />') && layout.includes('<Legal doc="privacy" />'));
  const footer = read('src/components/Footer.jsx');
  assert.ok(footer.includes('href="#/privacy"') && footer.includes('href="#/terms"'));
  assert.ok(!/href="#\/home"[^>]*>(Privacy|Terms)</.test(footer));
  const redirects = JSON.parse(read('vercel.json')).redirects;
  for (const k of ['terms', 'privacy']) assert.ok(redirects.some(r => r.source === '/' + k && r.destination === '/#/' + k), k);
});

test('the company is InPhox LLC everywhere (Chris 2026-10-24), never "Inc."', () => {
  assert.ok(read('src/components/Footer.jsx').includes('© 2026 InPhox LLC'));
  for (const f of ['src/components/Footer.jsx', 'src/legal/terms.txt', 'src/legal/privacy.txt']) {
    assert.ok(!/InPhox,? Inc\b/.test(read(f)), f);
  }
  for (const f of ['src/legal/terms.txt', 'src/legal/privacy.txt']) assert.ok(read(f).includes('InPhox LLC'), f);
});
