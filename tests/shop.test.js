// "Sign in to your shop" helpers (src/shop.js). Run with `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shopFromInput, shopLoginUrl } from '../src/shop.js';

const D = 'inphox.net';

test('accepts the shop name however it is typed or pasted', () => {
  for (const raw of ['bayareaphones', ' BayAreaPhones ', 'bayareaphones.inphox.net', 'bayareaphones.inphox.net.',
    'https://bayareaphones.inphox.net', 'https://bayareaphones.inphox.net/web/login?redirect=/odoo', 'http://www.bayareaphones.inphox.net/']) {
    assert.deepEqual(shopFromInput(raw, D), { shop: 'bayareaphones' }, raw);
  }
  assert.deepEqual(shopFromInput('fix-my-phone-2', D), { shop: 'fix-my-phone-2' });
});

test('refuses what is not a shop name on this domain', () => {
  for (const raw of ['', '   ', 'inphox.net', 'owner@shop.com', 'shop.example.com', 'bad name', '-dash', 'dash-', 'a_b', 'x'.repeat(64)]) {
    assert.ok(shopFromInput(raw, D).error, raw);
  }
});

test('the shop sign-in URL is the shop app on the shop domain', () => {
  assert.equal(shopLoginUrl('bayareaphones', D), 'https://bayareaphones.inphox.net/web/login');
});

import { createThrottle, RESERVED } from '../src/shop.js';

test('reserved and platform names are refused, however they are typed', () => {
  for (const raw of ['www', 'API', 'intake', 'platform', 'admin', 'https://intake.inphox.net/web/login', 'sheets-micro']) {
    assert.ok(shopFromInput(raw, D).error, raw);
  }
  assert.ok(RESERVED.has('www') && RESERVED.has('api') && RESERVED.has('intake') && RESERVED.has('platform') && RESERVED.has('admin'));
  assert.deepEqual(shopFromInput('wwwshop', D), { shop: 'wwwshop' });
});

test('the name is a DNS label of 1 to 63 characters', () => {
  assert.deepEqual(shopFromInput('a', D), { shop: 'a' });
  assert.deepEqual(shopFromInput('a'.repeat(63), D), { shop: 'a'.repeat(63) });
  assert.match(shopFromInput('a'.repeat(64), D).error, /too long/);
  for (const raw of ['-a', 'a-', 'a--', 'a b', 'a\tb', 'ünï', '../x', 'a%20b', "a'b", 'a;b']) {
    assert.ok(shopFromInput(raw, D).error, raw);
  }
});

test('the throttle allows 5 tries a minute, then says how long to wait, then lets go', () => {
  let t = 1000;
  const th = createThrottle({ now: () => t });
  for (let i = 0; i < 5; i++) { assert.deepEqual(th.try(), { ok: true }); t += 1000; }
  const blocked = th.try();
  assert.equal(blocked.ok, false);
  assert.ok(blocked.wait >= 1 && blocked.wait <= 60);
  t += 55000; // the the first try left the window
  assert.equal(th.try().ok, true);
  assert.equal(th.try().ok, false);
});
