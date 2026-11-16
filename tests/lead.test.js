// The Contact form's lead: sent once, a 2xx is the only success, and a server that never answers does not hold the button forever.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { sendLead, LEAD_WAIT_MS } from '../src/lead.js';

const URL_ = 'https://intake.inphox.test/billing/lead';
const body = new URLSearchParams({ name: 'Ana', email: 'ana@shop.test' });
const read = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8');

test('a 2xx answer is the only success; the request carries the form, no cookies and an abort signal', async () => {
  let seen;
  const r = await sendLead(URL_, body, { fetchImpl: async (u, o) => { seen = [u, o]; return { ok: true, status: 204 }; } });
  assert.equal(r, 'sent');
  assert.equal(seen[0], URL_);
  assert.equal(seen[1].method, 'POST');
  assert.equal(seen[1].body, body);
  assert.equal(seen[1].credentials, 'omit');
  assert.ok(seen[1].signal && typeof seen[1].signal.aborted === 'boolean');
});

test('a 4xx or a 5xx answer is a failure (the form stays, the person may try again)', async () => {
  for (const status of [400, 403, 429, 500, 503]) {
    assert.equal(await sendLead(URL_, body, { fetchImpl: async () => ({ ok: false, status }) }), 'failed', String(status));
  }
});

test('a network failure is a failure, not an exception', async () => {
  assert.equal(await sendLead(URL_, body, { fetchImpl: async () => { throw new TypeError('Failed to fetch'); } }), 'failed');
  assert.equal(await sendLead(URL_, body, { fetchImpl: () => { throw new Error('thrown before any promise') } }), 'failed');
});

test('a server that never answers: given up after the wait, so "Sending…" ends', async () => {
  const t0 = Date.now();
  const r = await sendLead(URL_, body, {
    fetchImpl: (u, o) => new Promise((_, rej) => o.signal.addEventListener('abort', () => rej(new Error('aborted')))),
    waitMs: 30
  });
  assert.equal(r, 'failed');
  assert.ok(Date.now() - t0 < 1000);
  assert.ok(LEAD_WAIT_MS >= 5000 && LEAD_WAIT_MS <= 30000, 'long enough for a slow phone, short enough to be an answer');
});

test('the form uses it: no bare fetch of the lead in the page logic, and no made-up request number on the success card', () => {
  const logic = read('src/SiteLogic.js');
  assert.match(logic, /sendLead\(leadAction/);
  assert.doesNotMatch(logic, /fetch\(leadAction/);
  assert.doesNotMatch(read('src/pages/Contact.jsx'), /REQ-/, 'the number was made from the email length: nobody could look it up');
  assert.doesNotMatch(logic, /ref: String\(4100/);
});

test('every box a person fills in on Contact is sent (2026-11-16: the Message box was typed and thrown away)', () => {
  const logic = read('src/SiteLogic.js');
  const page = read('src/pages/Contact.jsx');
  const boxes = [...page.matchAll(/value=\{ct\.v\.(\w+)\}/g)].map(m => m[1]);
  assert.ok(boxes.includes('msg'), 'the Message box is on the page');
  const fields = (logic.match(/const LEAD_FIELDS = \[([^\]]*)\]/) || [])[1] || '';
  const sentKeys = new Set([...fields.matchAll(/'(\w+)'/g)].map(m => m[1]));
  if (/body\.set\(LEAD_SITE_KEY, c\.site/.test(logic)) sentKeys.add('site');
  if (/body\.set\(LEAD_MESSAGE_KEY, c\.msg/.test(logic)) sentKeys.add('msg');
  if (/body\.set\(LEAD_LOCATIONS_KEY, c\.locs/.test(logic)) sentKeys.add('locs');
  const lost = boxes.filter(b => !sentKeys.has(b));
  assert.deepEqual(lost, [], 'boxes on the page that are never sent: ' + lost.join(', '));
});
