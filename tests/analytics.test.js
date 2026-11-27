// First-party, anonymous visit statistics (src/analytics.js) keep the cookie policy's promises (2026-11-27): nothing with
// Do Not Track or Global Privacy Control, nothing on the server render, only inphox's own app as the destination, no
// cookies, and only clean values of the keys we name.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const setNav = nav => Object.defineProperty(globalThis, 'navigator', { value: nav, configurable: true, writable: true });
const realNav = globalThis.navigator;

async function withBrowser(nav, fn) {
  const store = {}, sent = [];
  setNav({ ...nav, sendBeacon: (url, blob) => { sent.push({ url, blob }); return true; } });
  globalThis.sessionStorage = { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = v; } };
  globalThis.location = { href: 'https://www.inphox.net/autograding/buyback', pathname: '/autograding/buyback', search: '?utm_source=outreach&ref=w3-acme' };
  try { return await fn(sent, store); } finally {
    setNav(realNav); delete globalThis.sessionStorage; delete globalThis.location;
  }
}
const link = href => ({ getAttribute: () => href });

test('Do Not Track or Global Privacy Control: no visit id and nothing sent, ever', async () => {
  const { optedOut, visitId, pageViewed } = await import('../src/analytics.js');
  assert.equal(optedOut(null), true, 'no browser (the server render): nothing');
  assert.equal(optedOut({ doNotTrack: '1' }), true);
  assert.equal(optedOut({ globalPrivacyControl: true }), true);
  assert.equal(optedOut({}), false);
  for (const nav of [{ doNotTrack: '1' }, { globalPrivacyControl: true }]) {
    await withBrowser(nav, async (sent, store) => {
      assert.equal(visitId(), '');
      pageViewed('ag-buyback', 'en');
      assert.equal(sent.length, 0);
      assert.deepEqual(store, {}, 'not even a visit id is stored');
    });
  }
});

test('a page view and a click go to inphox\'s own app only, with the page, the button and a random visit id', async () => {
  const { linkClicked } = await import('../src/analytics.js');
  await withBrowser({}, async (sent, store) => {
    linkClicked(link('https://autograding.inphox.net/?via=buyback-hero&lang=en'), 'ag-buyback');
    linkClicked(link('/es/contact?via=itad-close'), 'ag-itad');
    linkClicked(link('https://www.linkedin.com/company/inphox/'), 'about');   // not ours: not counted
    assert.equal(sent.length, 2);
    for (const s of sent) assert.equal(s.url, 'https://autograding.inphox.net/api/site-events');
    const bodies = await Promise.all(sent.map(s => s.blob.text()));
    const [a, b] = bodies.map(x => JSON.parse(x));
    assert.match(a.sid, /^[a-f0-9-]{36}$/);
    assert.equal(a.sid, store.inphox_sid, 'one visit id for the visit');
    assert.deepEqual(a.events, [{ name: 'site_cta_clicked', props: { page: 'ag-buyback', dest: 'app', via: 'buyback-hero' } }]);
    assert.deepEqual(b.events[0].props, { page: 'ag-itad', dest: 'contact', via: 'itad-close' });
    assert.equal(sent[0].blob.type, 'text/plain', 'a simple request: no preflight, no cookies');
  });
});

test('only clean values of the named keys leave the browser', async () => {
  const { payload } = await import('../src/analytics.js');
  const p = JSON.parse(payload('x', [{ name: 'site_page_viewed', props: { page: 'home', utm_source: '<script>', ref: 'w3-acme', email: 'a@b.c d' } }]));
  assert.deepEqual(p.events[0].props, { page: 'home', ref: 'w3-acme' });
  assert.equal(JSON.parse(payload('x', Array(30).fill({ name: 'site_page_viewed' }))).events.length, 10);
});

test('the cookie policy says what is counted and that Do Not Track and GPC stop it, in both languages', () => {
  const en = readFileSync(new URL('../src/legal/cookies.txt', import.meta.url), 'utf8');
  const es = readFileSync(new URL('../src/legal/es/cookies.txt', import.meta.url), 'utf8');
  assert.match(en, /Do Not Track or Global Privacy Control, the website sends nothing at all/);
  assert.match(en, /random visit id/);
  assert.match(es, /No rastrear o Control Global de Privacidad, el sitio web no envía nada/);
});
