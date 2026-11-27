// Links into the Autograding app carry the tags the app keeps through sign-up and payment (Admin > Launch, by source).
// The app lets utm_source win and takes ?ref= as the source only when no utm_source came with it (2026-11-27).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { agQuery, agStartUrl, keepVisitorTags } from '../src/chrome.js';

const tags = q => Object.fromEntries(new URLSearchParams(q));

test('no ref and no tags of their own: the link is the website\'s', () => {
  assert.deepEqual(tags(agQuery('hero', 'en', '', null)),
    { utm_source: 'inphox.net', utm_medium: 'website', utm_campaign: 'autograding', utm_content: 'hero', lang: 'en' });
});

test('a ?ref= is passed on without the website\'s utm_source, so the app makes the ref the source', () => {
  const t = tags(agQuery('hero', 'es', 'w3-acme', null));
  assert.equal(t.ref, 'w3-acme');
  assert.equal(t.utm_source, undefined);
  assert.equal(t.utm_medium, 'website');
  assert.equal(t.lang, 'es');
});

test('a visitor\'s own tags (an outreach email) go on as they came, with the ref', () => {
  const visitor = { utm_source: 'outreach', utm_medium: 'email', utm_campaign: 'partnerships', utm_content: 'w2-sellmac_v9' };
  assert.deepEqual(tags(agQuery('hero', 'en', 'w2-sellmac', visitor)), { ref: 'w2-sellmac', ...visitor, lang: 'en' });
  assert.ok(agStartUrl('header').startsWith('https://autograding.inphox.net/?'));
});

test('a visitor\'s tags are kept only with a source, and only in safe characters', () => {
  const store = {};
  globalThis.sessionStorage = { setItem: (k, v) => { store[k] = v; }, getItem: k => store[k] ?? null };
  try {
    keepVisitorTags('?utm_medium=email');
    assert.deepEqual(store, {}, 'no source: nothing kept, the website tags the link');
    keepVisitorTags('?utm_source=outreach&utm_content=w2-sellmac_v9&utm_campaign=<script>');
    assert.deepEqual(JSON.parse(store.inphox_ag_utm), { utm_source: 'outreach', utm_content: 'w2-sellmac_v9' });
  } finally {
    delete globalThis.sessionStorage;
  }
});

test('one builder: no other source file writes a utm tag into a link by hand', () => {
  const walk = d => readdirSync(d).flatMap(f => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
  const src = new URL('../src', import.meta.url).pathname;
  const hand = walk(src).filter(f => /\.(js|jsx)$/.test(f) && !f.endsWith('chrome.js') && /utm_(source|medium|campaign|content)=/.test(readFileSync(f, 'utf8')));
  assert.deepEqual(hand, []);
});
