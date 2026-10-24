// The plan buttons' hub check: the hub answers -> go to it; silence or a network failure -> the busy page.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openSignup, isPlainClick } from '../src/hub.js';
import { BUSY_HREF, signupUrl } from '../src/pricing.js';

const URL_ = signupUrl('growth');
const run = fetchImpl => {
  const seen = { go: [], busy: 0, fetch: [] };
  return openSignup(URL_, {
    fetchImpl: (u, o) => { seen.fetch.push([u, o]); return fetchImpl(u, o); },
    go: u => seen.go.push(u), busy: () => { seen.busy++; }, waitMs: 30
  }).then(r => ({ r, seen }));
};

test('the hub is down (network failure): the busy page, not a browser error', async () => {
  const { r, seen } = await run(async () => { throw new TypeError('Failed to fetch'); });
  assert.equal(r, 'busy');
  assert.deepEqual(seen.go, []);
  assert.equal(seen.busy, 1);
  assert.equal(BUSY_HREF, '#/signup-busy');
});

test('the hub does not answer in time: the busy page', async () => {
  const { r, seen } = await run((u, o) => new Promise((_, rej) => o.signal.addEventListener('abort', () => rej(new Error('aborted')))));
  assert.equal(r, 'busy');
  assert.equal(seen.busy, 1);
});

test('the hub answers (any status): go to the plan\'s sign-up address, asking only for the hub\'s front address, with no cookies', async () => {
  const { r, seen } = await run(async () => ({ type: 'opaque', status: 0 }));
  assert.equal(r, 'go');
  assert.deepEqual(seen.go, ['https://home.inphox.net/signup?plan=growth']);
  assert.equal(seen.fetch[0][0], 'https://home.inphox.net/');
  assert.equal(seen.fetch[0][1].credentials, 'omit');
  assert.equal(seen.busy, 0);
});

test('no fetch available: still go to the hub', async () => {
  const seen = [];
  assert.equal(await openSignup(URL_, { fetchImpl: undefined, go: u => seen.push(u), busy: () => seen.push('busy') }), 'go');
  assert.deepEqual(seen, [URL_]);
});

test('new-tab and modified clicks keep their normal meaning', () => {
  assert.equal(isPlainClick({ button: 0 }), true);
  for (const e of [{ button: 1 }, { button: 0, metaKey: true }, { button: 0, ctrlKey: true }, { button: 0, shiftKey: true }, { defaultPrevented: true }]) assert.equal(isPlainClick(e), false);
});
