// The last step of `npm run build`: reads what will actually be deployed (dist/) and fails the build on an SEO regression.
// Checked against src/routes.js, the one list of pages, so a new page is checked without touching this file.
// The website repo has no branch protection, so a failing build (CI and the Vercel deploy) is the only gate (2026-11-27).
import fs from 'node:fs';
import path from 'node:path';
import { ROUTES, SITE, canonicalFor } from '../src/routes.js';

const dist = path.resolve(process.argv[2] || 'dist');
const errors = [];
const fail = (where, what) => errors.push(`${where}: ${what}`);
const fileOf = r => (r.path === '/' ? 'index.html' : r.path.slice(1) + '.html');
const read = f => fs.readFileSync(path.join(dist, f), 'utf8');
const unesc = s => s.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#x27;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>');
// <svg> may carry its own <title>; only the document's head counts.
const head = html => html.slice(0, html.indexOf('</head>'));
const one = (html, re) => [...html.matchAll(re)].map(m => unesc(m[1]));

const known = new Set(ROUTES.map(r => r.path));
const titles = new Map(), descriptions = new Map();

for (const r of ROUTES) {
  const f = fileOf(r), where = f;
  if (!fs.existsSync(path.join(dist, f))) { fail(where, 'not written'); continue; }
  const html = read(f), h = head(html), indexable = r.index !== false;

  const t = one(h, /<title>([^<]*)<\/title>/g);
  if (t.length !== 1) fail(where, `${t.length} <title> tags in <head>`);
  else if (t[0] !== r.title) fail(where, `title "${t[0]}" is not routes.js "${r.title}"`);
  const d = one(h, /<meta name="description" content="([^"]*)">/g);
  if (d.length !== 1 || !d[0].trim()) fail(where, `${d.length} meta descriptions`);
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) fail(where, `${h1} <h1> tags (one per page: it names the page's topic)`);
  const robots = one(h, /<meta name="robots" content="([^"]*)">/g);
  if (robots.length !== 1) fail(where, `${robots.length} robots meta tags`);
  else if (indexable === /noindex/.test(robots[0])) fail(where, `robots "${robots[0]}" but routes.js index is ${indexable}`);
  const canon = one(h, /<link rel="canonical" href="([^"]*)">/g);
  if (canon.length !== 1 || canon[0] !== canonicalFor(r.page, r.lang || 'en')) fail(where, `canonical ${JSON.stringify(canon)} is not ${canonicalFor(r.page, r.lang || 'en')}`);
  const lang = one(html, /<html lang="([^"]*)">/g)[0];
  if (lang !== (r.lang || 'en')) fail(where, `<html lang="${lang}">`);
  for (const block of one(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(block); } catch (e) { fail(where, 'JSON-LD does not parse: ' + e.message); }
  }
  // Every same-site link goes to a page that exists or a file that is deployed (no crawl into a 404).
  for (const href of one(html, /<a [^>]*href="([^"]*)"/g)) {
    const local = href.startsWith(SITE) ? href.slice(SITE.length) || '/' : href;
    if (!local.startsWith('/') || local.startsWith('//')) continue;
    const p = local.split(/[?#]/)[0].replace(/(.)\/$/, '$1') || '/';
    if (!known.has(p) && !fs.existsSync(path.join(dist, p))) fail(where, `links to ${href}, which is no page`);
  }
  if (indexable) {
    const key = (r.lang || 'en');
    for (const [map, val, name] of [[titles, t[0], 'title'], [descriptions, d[0], 'description']]) {
      const k = key + '|' + val;
      if (map.has(k)) fail(where, `same ${name} as ${map.get(k)}`);
      else map.set(k, where);
    }
  }
}

// The sitemap lists exactly the indexable pages, at their canonical address.
const sitemap = fs.existsSync(path.join(dist, 'sitemap.xml')) ? read('sitemap.xml') : '';
const listed = new Set(one(sitemap, /<loc>([^<]*)<\/loc>/g));
const want = new Set(ROUTES.filter(r => r.index !== false).map(r => canonicalFor(r.page, r.lang || 'en')));
for (const u of want) if (!listed.has(u)) fail('sitemap.xml', 'missing ' + u);
for (const u of listed) if (!want.has(u)) fail('sitemap.xml', 'lists ' + u + ', which is not an indexable page');

// robots.txt names the sitemap and blocks nothing a page needs.
const robotsTxt = fs.existsSync(path.join(dist, 'robots.txt')) ? read('robots.txt') : '';
if (!robotsTxt.includes(`Sitemap: ${SITE}/sitemap.xml`)) fail('robots.txt', 'does not name the sitemap');
if (/^Disallow:\s*\/\s*$/m.test(robotsTxt)) fail('robots.txt', 'disallows the whole site');

// The 404 page is never indexed.
if (!fs.existsSync(path.join(dist, '404.html')) || !/<meta name="robots" content="noindex/.test(read('404.html'))) fail('404.html', 'missing or indexable');

if (errors.length) {
  console.error(`seo-check: ${errors.length} problem(s)\n  ` + errors.join('\n  '));
  process.exit(1);
}
console.log(`seo-check: ${ROUTES.length} pages, ${listed.size} sitemap URLs, all good`);
