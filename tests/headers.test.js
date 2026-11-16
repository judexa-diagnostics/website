// What the host sends with every page, and what the build does not ship (audit 2026-11-15, odm#1422 section 6).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8');

test('vercel.json sends the security headers on every path', () => {
  const rules = JSON.parse(read('vercel.json')).headers || [];
  const all = rules.find(r => r.source === '/(.*)');
  assert.ok(all, 'no header rule for every path');
  const h = Object.fromEntries(all.headers.map(x => [x.key.toLowerCase(), x.value]));
  assert.equal(h['x-content-type-options'], 'nosniff');
  assert.equal(h['x-frame-options'], 'DENY');
  assert.match(h['content-security-policy'], /frame-ancestors 'none'/);
  assert.equal(h['referrer-policy'], 'strict-origin-when-cross-origin');
  assert.match(h['permissions-policy'], /camera=\(\)/);
  assert.match(h['permissions-policy'], /microphone=\(\)/);
  assert.match(h['permissions-policy'], /geolocation=\(\)/);
});

test('the build does not ship source maps', () => {
  assert.doesNotMatch(read('vite.config.js'), /sourcemap\s*:\s*(true|'inline'|'hidden'|"inline"|"hidden")/);
});

test('the committed production settings hold public addresses only', () => {
  for (const line of read('.env.production').split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const [name, value = ''] = line.split('=');
    assert.match(name, /^VITE_[A-Z_]+$/, name);       // a VITE_ name is public by design: it is copied into the page's script
    assert.doesNotMatch(value, /secret|token|key|password|sk_|pk_/i, name);
    assert.ok(/^(https:\/\/[a-z0-9.-]+|[01])$/.test(value.trim()), name + ' is not an https address or a 0/1 switch');
  }
});
