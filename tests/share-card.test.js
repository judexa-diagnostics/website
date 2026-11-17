// A link to the site pasted in a chat app drew a bare title: no line, no picture (embed sweep 2026-11-17).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';

const page = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const meta = (attr, name) => (page.match(new RegExp(`<meta ${attr}="${name}" content="([^"]*)"`)) || [])[1];

test('the page carries a full share card', () => {
  assert.equal(meta('property', 'og:title'), 'InPhox: Device operations platform');
  const text = meta('property', 'og:description');
  assert.ok(text && text.length <= 160, 'a description of at most 160 characters');
  assert.equal(meta('name', 'description'), text);
  assert.equal(meta('name', 'twitter:card'), 'summary_large_image');
  const image = meta('property', 'og:image');
  assert.match(image, /^https:\/\/www\.inphox\.net\/assets\/og-image\.png$/);
});

test('the card picture ships with the site at 1200 x 630', () => {
  const file = new URL('../public/assets/og-image.png', import.meta.url);
  const head = readFileSync(file).subarray(0, 24);
  assert.equal(head.readUInt32BE(16), 1200);
  assert.equal(head.readUInt32BE(20), 630);
  assert.ok(statSync(file).size < 1_000_000);
});
