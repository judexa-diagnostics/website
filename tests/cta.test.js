// One label for one action (issue #11, W1): every button that starts the sign-up says "Start free".
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const files = dir => readdirSync(dir).flatMap(f => { const p = join(dir, f); return statSync(p).isDirectory() ? files(p) : /\.(jsx?|css)$/.test(f) ? [p] : []; });
const SRC = files(join(root, 'src'));

test('the label is one constant, and the Free plan card uses it too', async () => {
  const P = await import('../src/pricing.js');
  assert.equal(P.START_FREE, 'Start free');
  assert.equal(P.planCard(P.findPlan('free')).cta, P.START_FREE);
});

test('the old sign-up labels are gone from the site', () => {
  for (const f of SRC) {
    const s = readFileSync(f, 'utf8');
    assert.doesNotMatch(s, />\s*(Join now|Get started|Buy a plan|Book a walkthrough|Create account|Create an account)\s*(→\s*)?</, f);
  }
});

test('every element that starts the sign-up prints the one label', () => {
  const opener = /onClick=\{(?:goTrial|si\.goTrial|\(\) => goTrial\(\))\}[^>]*>([\s\S]*?)<\/(?:button|a)>/g;
  let n = 0;
  for (const f of SRC) {
    for (const m of readFileSync(f, 'utf8').matchAll(opener)) {
      n++;
      assert.match(m[1].trim(), /^\{(startLabel|si\.startLabel|START_FREE)\}$/, `${f}: ${m[1].trim()}`);
    }
  }
  assert.ok(n >= 10, `found ${n} sign-up buttons`); // header, menu, footer, hero, close, walkthrough, station, industries, contact, sign in
});
