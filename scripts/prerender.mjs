// After `vite build` (the browser app) and `vite build --ssr src/entry-server.jsx` (the same app for Node), this writes
// one HTML file per public page: dist/about.html is served at /about (vercel.json cleanUrls). Each file carries the
// page's words, its own <title>, description and canonical tag, and on / and /about the company and founders as
// JSON-LD. It also writes dist/404.html (served with a real 404 for unknown paths) and dist/sitemap.xml.
// Why prerender and not server-side rendering: the site stays static files on Vercel (no server to run or secure),
// the app code is unchanged, and the browser app still takes over on load exactly as before.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const dist = path.resolve('dist');
const ssrEntry = ['entry-server.js', 'entry-server.mjs'].map(f => path.resolve('dist-ssr', f)).find(f => fs.existsSync(f));
if (!ssrEntry) throw new Error('prerender: dist-ssr/entry-server.js missing; run vite build --ssr src/entry-server.jsx --outDir dist-ssr first');
const ssr = await import(pathToFileURL(ssrEntry).href);
const { ROUTES, SITE, SITE_NAME, canonicalFor, TEAM, personAlt, COMPANY_LEGAL_NAME, COMPANY_POSTAL_ADDRESS, COMPANY_PHONE } = ssr;

const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
if (!template.includes('<div id="root"></div>')) throw new Error('prerender: index.html has no empty #root');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const json = o => JSON.stringify(o).replace(/</g, '\\u003c');

const ORG_ID = SITE + '/#organization';
const slug = name => name.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const people = TEAM.map(p => ({
  '@type': 'Person',
  '@id': SITE + '/about#' + slug(p.name),
  name: p.name,
  jobTitle: p.title,
  ...(p.image ? { image: SITE + p.image } : {}),
  ...(p.linkedin ? { sameAs: [p.linkedin] } : {}),
  worksFor: { '@id': ORG_ID }
}));
const founders = people.filter((_, i) => /founder/i.test(TEAM[i].title));
const organization = {
  '@type': 'Organization',
  '@id': ORG_ID,
  name: SITE_NAME,
  legalName: COMPANY_LEGAL_NAME,
  url: SITE + '/',
  logo: SITE + '/assets/inphox-logo.png',
  description: 'Device operations software for businesses that buy, fix and resell used electronics.',
  ...(COMPANY_POSTAL_ADDRESS ? { address: COMPANY_POSTAL_ADDRESS } : {}),
  ...(COMPANY_PHONE ? { telephone: COMPANY_PHONE } : {}),
  founder: founders.map(p => ({ '@id': p['@id'] }))
};
const graphFor = page => {
  if (page === 'home') return { '@context': 'https://schema.org', '@graph': [organization, { '@type': 'WebSite', '@id': SITE + '/#website', url: SITE + '/', name: SITE_NAME, publisher: { '@id': ORG_ID } }] };
  if (page === 'about') return { '@context': 'https://schema.org', '@graph': [{ '@type': 'AboutPage', '@id': SITE + '/about', url: SITE + '/about', name: 'About inphox', about: { '@id': ORG_ID } }, organization, ...people] };
  return null;
};

function page(html, { title, description, canonical, noindex, graph }) {
  const set = (re, val) => { if (!re.test(html)) throw new Error('prerender: template lost ' + re); html = html.replace(re, val); };
  set(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  set(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(description)}">`);
  set(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(title)}">`);
  set(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(description)}">`);
  set(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${esc(canonical || SITE + '/')}">`);
  const extra = [
    canonical ? `<link rel="canonical" href="${esc(canonical)}">` : '',
    noindex ? '<meta name="robots" content="noindex">' : '',
    graph ? `<script type="application/ld+json">${json(graph)}</script>` : ''
  ].filter(Boolean).join('\n');
  return html.replace('</head>', extra + '\n</head>');
}

const written = [];
for (const r of ROUTES) {
  const app = ssr.render(r.page);
  const body = template.replace('<div id="root"></div>', `<div id="root">${app}</div>`);
  const html = page(body, { title: r.title, description: r.description, canonical: canonicalFor(r.page), noindex: r.index === false, graph: graphFor(r.page) });
  const file = r.path === '/' ? 'index.html' : r.path.slice(1) + '.html';
  fs.writeFileSync(path.join(dist, file), html);
  written.push(file);
}
// Unknown paths: Vercel serves 404.html with status 404.
const notFound = page(template.replace('<div id="root"></div>', `<div id="root">${ssr.render('notfound')}</div>`),
  { title: 'Page not found | inphox', description: 'This page does not exist.', canonical: null, noindex: true, graph: null });
fs.writeFileSync(path.join(dist, '404.html'), notFound);
written.push('404.html');

const today = new Date().toISOString().slice(0, 10);
const urls = ROUTES.filter(r => r.index !== false).map(r => `  <url><loc>${esc(canonicalFor(r.page))}</loc><lastmod>${today}</lastmod></url>`);
fs.writeFileSync(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
written.push('sitemap.xml');

console.log(`prerender: wrote ${written.length} files: ${written.join(', ')}`);
// Founder alt text must exist for every photo (step 8 of the crawlability brief).
for (const p of TEAM) if (p.image && !personAlt(p)) throw new Error('prerender: no alt text for ' + p.name);
