// guide.inphox.net (guide/build.mjs): every page in the index builds, links land on real pages and sections, no outside
// vendor names, and the plans table is the website's own price file (src/pricing.js), so the guide never drifts from it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pricing } from '../src/pricing.js';

const build = () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'guide-'));
  execFileSync(process.execPath, ['guide/build.mjs', dir], { stdio: 'pipe' });
  return dir;
};
const out = build();
const nav = JSON.parse(fs.readFileSync('guide/nav.json', 'utf8'));
const slugs = nav.groups.flatMap((g) => g.pages);

test('every page in the index is built, with its title, the logo home link and Report an issue', () => {
  for (const s of slugs) {
    const html = fs.readFileSync(path.join(out, s, 'index.html'), 'utf8');
    assert.match(html, /<a class="g-brand" href="\/"/, s);
    assert.match(html, /href="\/report-an-issue\/"/, s);
    assert.match(html, /<title>[^<]+ · inphox guide<\/title>/, s);
    assert.match(html, /property="og:image" content="https:\/\//, s);
  }
  assert.ok(fs.existsSync(path.join(out, 'index.html')));
});

test('the pages Double Puff and the apps link to exist (their addresses never change)', () => {
  for (const s of ['plug-in-iphone', 'plug-in-android', 'trust-this-computer', 'stuck-or-partial', 'station-wifi',
    'biometrics', 'secure-erase', 'diagnostic-app-android', 'diagnostic-app-iphone', 'report-an-issue', 'plans',
    'repairs-add-on', 'upload-inventory', 'export-data', 'find-phones', 'auto-activate', 'mdm-and-locks']) {
    assert.ok(slugs.includes(s), s);
  }
});

// Double Puff's "?" replays open these sections (double-puff help_topics.py "guide"): a renamed page or h2 id
// would send the station's Read more to the wrong place.
test('the sections Double Puff opens exist', () => {
  for (const addr of ['/auto-activate/#what-you-see', '/biometrics/#how', '/diagnostic-app-iphone/#install',
    '/plug-in-android/#no-permission', '/plug-in-android/#not-answering', '/plug-in-android/#set-up',
    '/plug-in-android/#welcome', '/plug-in-iphone/#no-active-lot', '/plug-in-iphone/#steps',
    '/report-an-issue/#what-to-send', '/secure-erase/#from-a-lot', '/station-updates/#strip',
    '/station-wifi/#type-it', '/stuck-or-partial/#quick', '/trust-this-computer/#iphone']) {
    const [, slug, id] = addr.match(/^\/([a-z0-9-]+)\/#([a-z0-9-]+)$/);
    const html = fs.readFileSync(path.join(out, slug, 'index.html'), 'utf8');
    assert.ok(html.includes(`id="${id}"`), addr);
  }
});

test('the plans table is src/pricing.js', () => {
  const html = fs.readFileSync(path.join(out, 'plans', 'index.html'), 'utf8');
  for (const p of pricing.plans) {
    assert.ok(html.includes(`<th scope="row">${p.name}</th>`), p.name);
    if (p.price) assert.ok(html.includes(`$${p.price.toLocaleString('en-US')} a month`), p.name);
    if (p.checksIncluded) assert.ok(html.includes(`<td>${p.checksIncluded.toLocaleString('en-US')}</td>`), p.name);
  }
});

test('search.json lists every page with its sections', () => {
  const idx = JSON.parse(fs.readFileSync(path.join(out, 'search.json'), 'utf8'));
  assert.deepEqual(idx.map((p) => p.slug).sort(), [...slugs].sort());
  assert.ok(idx.every((p) => p.sections.length > 0));
});

test('a vendor name in a page fails the build', () => {
  const page = 'guide/pages/biometrics.html';
  const before = fs.readFileSync(page, 'utf8');
  try {
    fs.writeFileSync(page, before + '\n<p>Paid with Stripe.</p>\n');
    assert.throws(() => build());
  } finally {
    fs.writeFileSync(page, before);
  }
});

test('the build never empties a folder that is not an earlier guide build', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'not-guide-'));
  fs.writeFileSync(path.join(dir, 'keep.txt'), 'mine');
  assert.throws(() => execFileSync(process.execPath, ['guide/build.mjs', dir], { stdio: 'pipe' }));
  assert.equal(fs.readFileSync(path.join(dir, 'keep.txt'), 'utf8'), 'mine');
});
