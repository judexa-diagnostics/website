// website#18 (odm#1333 legal run, row L2): the website serves the same Terms/Privacy people agree to in the sign-in
// service. This pins the current versions so an accidental edit to an older copy fails here; scripts/sync-legal.mjs
// re-copies the live texts from inphox-id at build-prep time. Run with `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseLegal } from '../src/legalDoc.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

// The versions live in the sign-in service (inphox-id app/data/legal). Bump these when sync-legal.mjs pulls newer
// texts; the test then guarantees the website never regresses to an older copy.
const CURRENT = { terms: '2026-11-13', privacy: '2026-11-13.2' };

for (const [doc, version] of Object.entries(CURRENT)) {
  test(`the website ${doc} is the current version people agree to (${version})`, () => {
    const d = parseLegal(read(join('src/legal', `${doc}.txt`)));
    assert.equal(d.version, version, `src/legal/${doc}.txt is ${d.version}, not the current ${version}. Run \`node scripts/sync-legal.mjs\` to copy the live text from inphox-id.`);
    assert.ok(d.paragraphs.length > 5, `${doc} looks empty/short`);
  });
}

test('the Terms include the Marketplace section (the old website copy did not)', () => {
  assert.match(read('src/legal/terms.txt'), /marketplace/i, 'terms.txt has no Marketplace wording');
});
