// jules WEB-AUDIT 2026-11-05 (website#15): the page head carries a description and share (og/twitter) tags, and the
// share image is an absolute https URL (a relative path does not work for link previews).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');

test('the head has a description and the og/twitter tags', () => {
  for (const t of ['name="description"', 'property="og:title"', 'property="og:description"', 'property="og:image"',
    'name="twitter:card"', 'name="twitter:title"', 'name="twitter:description"', 'name="twitter:image"']) {
    assert.ok(html.includes(t), `index.html is missing ${t}`);
  }
});

test('the share images are absolute https URLs to a real file', () => {
  const imgs = [...html.matchAll(/(?:og|twitter):image" content="([^"]+)"/g)].map(m => m[1]);
  assert.equal(imgs.length, 2);
  for (const u of imgs) {
    assert.match(u, /^https:\/\//, `${u} must be absolute`);
    assert.ok(readFileSync(join(root, 'public', new URL(u).pathname)).length > 0);
  }
});
