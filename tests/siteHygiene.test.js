// website#19 (odm#1333 legal run, rows L14/L17/L53/L59): no outside font host, a cookie section, a contact-form
// privacy notice, a business address/phone in the footer, a skip link, and an accessibility statement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

test('no request to an outside font host on load (fonts are self-hosted)', () => {
  const html = read('index.html');
  assert.ok(!/fonts\.googleapis\.com|api\.fontshare\.com|fonts\.gstatic\.com/.test(html), 'index.html loads no outside font host');
  const fontsCss = read('src/styles/fonts.css');
  assert.ok(fontsCss.includes("url('/fonts/"), 'fonts.css serves local /fonts files');
  assert.ok(!/https?:|\/\/cdn|fontshare|googleapis/.test(fontsCss), 'fonts.css has no outside URL');
  const woff2 = readdirSync(join(root, 'public/fonts')).filter((f) => f.endsWith('.woff2'));
  assert.ok(woff2.length >= 3, 'the woff2 files are committed to public/fonts');
});

test('a cookie section and an accessibility statement exist and are drafts', () => {
  for (const slug of ['cookies', 'accessibility']) {
    const txt = read(join('src/legal', slug + '.txt'));
    assert.match(txt, /^Version: \d{4}-\d{2}-\d{2}$/m, `${slug}: a plain dated version`);
    assert.doesNotMatch(txt, /Chris|lawyer|pending|\[[^\]]*\]/i, `${slug}: no internal names or placeholders`);
    assert.ok(read('src/routes.js').includes(`'${slug}'`), `${slug} is routable`);
    assert.ok(read('src/components/Footer.jsx').includes(`href="/${slug}"`), `footer links to ${slug}`);
  }
});

test('the contact form shows a privacy notice with a Privacy link', () => {
  const c = read('src/pages/Contact.jsx');
  assert.match(c, /Privacy Policy/);
  assert.ok(c.includes('href="/privacy"'), 'the notice links to the Privacy Policy');
});

test('the footer shows the company address and phone from config, never a placeholder', () => {
  const f = read('src/components/Footer.jsx');
  assert.ok(f.includes('COMPANY_POSTAL_ADDRESS') && f.includes('COMPANY_PHONE'), 'address and phone come from config');
  assert.doesNotMatch(f, /pending Chris|data-needs-chris|\[postal|\[phone/i, 'no placeholder text in the footer');
});

test('there is a skip link to the main content', () => {
  const l = read('src/Layout.jsx');
  assert.match(l, /href="#main"/);
  assert.match(l, /Skip to main content/);
  assert.match(l, /id="main"/);
});

test('the footer shows the real address and phone, and no footer text is under 16px (Chris 2026-11-15)', () => {
  const c = readFileSync(join(root, 'src/config.js'), 'utf8');
  assert.match(c, /COMPANY_POSTAL_ADDRESS = '375 S 9th Street, Joe West Hall, San Jose, CA 95112'/);
  assert.match(c, /COMPANY_PHONE = '916-582-9140'/);
  const f = readFileSync(join(root, 'src/components/Footer.jsx'), 'utf8');
  for (const m of f.matchAll(/fontSize: "([0-9.]+)rem"/g)) assert.ok(Number(m[1]) >= 1, `footer font ${m[1]}rem is under 16px`);
});

test('the site shows founder contact info for startup compliance (Chris 2026-11-20)', () => {
  const c = readFileSync(join(root, 'src/config.js'), 'utf8');
  assert.match(c, /FOUNDER_NAME = 'Christopher Luk'/);
  assert.match(c, /FOUNDER_EMAIL = 'christopher@inphox.net'/);
  const contact = readFileSync(join(root, 'src/pages/Contact.jsx'), 'utf8');
  assert.ok(contact.includes('FOUNDER_NAME') && contact.includes('FOUNDER_EMAIL'), 'Contact page links founder info');
  const footer = readFileSync(join(root, 'src/components/Footer.jsx'), 'utf8');
  assert.match(footer, /Founded by Christopher Luk/);
});

test('the About Us page lists the founder and team, and the footer and menu link to it (Google for Startups, 2026-11-20)', () => {
  const read = f => readFileSync(join(root, f), 'utf8');
  const about = read('src/pages/About.jsx');
  assert.ok(about.includes('TEAM') && about.includes('FOUNDER_NAME'), 'About page renders the team list');
  assert.match(read('src/config.js'), /export const TEAM = \[/);
  assert.match(read('src/config.js'), /FOUNDER_LINKEDIN = 'https:\/\/www\.linkedin\.com\/in\/christopher-luk-22312331b\/'/);
  assert.ok(existsSync(join(root, 'public/assets/team/christopher-luk.jpg')), 'Christopher photo exists');
  assert.ok(existsSync(join(root, 'public/assets/team/sri-vatsa-vuddanti.jpg')), 'Sri photo exists');
  assert.ok(existsSync(join(root, 'public/assets/team/iniyan-kannappan.jpg')), 'Iniyan photo exists');
  assert.match(read('src/Layout.jsx'), /is\.about \? <About/);
  assert.match(read('src/SiteLogic.js'), /'about'/);
  const footer = read('src/components/Footer.jsx');
  assert.match(footer, /href="\/about"[^>]*>About us</);
  assert.ok(!/christoper@/.test(footer + read('src/config.js') + read('src/pages/Contact.jsx')), 'founder email is spelled christopher@');
});
