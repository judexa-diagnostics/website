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
