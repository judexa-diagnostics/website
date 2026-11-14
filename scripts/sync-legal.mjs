// website#18: copy the current Terms and Privacy from the sign-in service (inphox-id) into src/legal, so the website
// never drifts from what people actually agree to. Run at build-prep time (and in CI) with a token that can read the
// inphox-id repo:  node scripts/sync-legal.mjs
// It writes src/legal/terms.txt and src/legal/privacy.txt and prints the versions. The drift test (tests/legalSync
// .test.js) then fails if someone edits the website copy to an older version by hand.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const REPO = 'judexa-diagnostics/inphox-id';
const FILES = { terms: 'app/data/legal/terms.txt', privacy: 'app/data/legal/privacy.txt' };
const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;

for (const [name, path] of Object.entries(FILES)) {
  const url = `https://api.github.com/repos/${REPO}/contents/${path}`;
  const res = await fetch(url, { headers: { Accept: 'application/vnd.github.raw', ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
  if (!res.ok) { console.error(`sync-legal: ${name} fetch failed (${res.status}); leaving the committed copy in place`); process.exit(1); }
  const text = await res.text();
  writeFileSync(join(root, 'src/legal', `${name}.txt`), text);
  console.log(`sync-legal: ${name} = ${(text.split('\n')[0] || '').replace('Version:', '').trim()}`);
}
