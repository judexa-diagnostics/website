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
const { ROUTES, SITE, SITE_NAME, canonicalFor, TEAM, personAlt, COMPANY_LEGAL_NAME, COMPANY_POSTAL_ADDRESS, COMPANY_PHONE, pricing } = ssr;

const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
if (!template.includes('<div id="root"></div>')) throw new Error('prerender: index.html has no empty #root');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const json = o => JSON.stringify(o).replace(/</g, '\\u003c');

const ORG_ID = SITE + '/#organization';
// '375 S 9th Street, Joe West Hall, San Jose, CA 95112' → a schema.org PostalAddress.
function postal(line) {
  const m = /^(.*),\s*([^,]+),\s*([A-Z]{2})\s+(\d{5})$/.exec(line);
  if (!m) return line;
  return { '@type': 'PostalAddress', streetAddress: m[1], addressLocality: m[2], addressRegion: m[3], postalCode: m[4], addressCountry: 'US' };
}
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
  // A structured address and a sales contact point, the way device-software sites mark up their company.
  ...(COMPANY_POSTAL_ADDRESS ? { address: postal(COMPANY_POSTAL_ADDRESS) } : {}),
  ...(COMPANY_PHONE ? { telephone: '+1-' + COMPANY_PHONE } : {}),
  contactPoint: [{ '@type': 'ContactPoint', contactType: 'sales', url: SITE + '/contact', ...(COMPANY_PHONE ? { telephone: '+1-' + COMPANY_PHONE } : {}), areaServed: 'US', availableLanguage: ['English', 'Spanish'] }],
  // sameAs: no company profile pages exist yet; add them here (LinkedIn company page, etc.) once they do.
  founder: founders.map(p => ({ '@id': p['@id'] }))
};
const website = { '@type': 'WebSite', '@id': SITE + '/#website', url: SITE + '/', name: SITE_NAME, inLanguage: ['en', 'es'], publisher: { '@id': ORG_ID } };
const crumbs = r => ({ '@type': 'BreadcrumbList', itemListElement: [
  { '@type': 'ListItem', position: 1, name: SITE_NAME, item: SITE + '/' },
  { '@type': 'ListItem', position: 2, name: r.title.split(/ \| |: /)[0], item: canonicalFor(r.page, r.lang) }
] });
// The shop platform as software, with every self-serve plan as an offer (prices come from pricing.js, like the page).
const inventoryApp = {
  '@type': 'SoftwareApplication', '@id': SITE + '/#inventory', name: 'inphox Inventory', applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, Windows, macOS, iOS, Android', url: SITE + '/', publisher: { '@id': ORG_ID },
  description: 'Device testing, certified data erasure, cosmetic grading, inventory by location, repairs and sales for businesses that buy and resell used electronics.',
  offers: pricing.plans.filter(p => p.price != null).map(p => ({ '@type': 'Offer', name: p.name, price: String(p.price), priceCurrency: 'USD', url: SITE + '/pricing', category: 'subscription' }))
};
const agApp = lang => ({
  '@type': 'SoftwareApplication', '@id': SITE + '/autograding#app', name: 'inphox Autograding', applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web', url: 'https://autograding.inphox.net/', inLanguage: lang, publisher: { '@id': ORG_ID },
  description: lang === 'es'
    ? 'Calificación cosmética automática con IA para teléfonos, tabletas, laptops y relojes usados, con API abierta y cero retención de datos.'
    : 'AI cosmetic grading for used phones, tablets, laptops and watches from photos, with an open API and zero data retention.',
  offers: { '@type': 'Offer', price: '0.10', priceCurrency: 'USD', description: lang === 'es' ? 'Máximo por dispositivo calificado, con créditos prepagados' : 'At most per graded device, from prepaid credits', url: 'https://autograding.inphox.net/api/docs#pricing' }
});
const graphFor = r => {
  const page = r.page, g = [];
  if (page === 'home') g.push(organization, website, inventoryApp);
  else if (page === 'about') g.push({ '@type': 'AboutPage', '@id': SITE + '/about', url: SITE + '/about', name: 'About inphox', about: { '@id': ORG_ID } }, organization, ...people);
  else if (page === 'autograding') g.push(agApp(r.lang || 'en'));
  else if (page === 'pricing') g.push(inventoryApp, { '@type': 'FAQPage', mainEntity: pricing.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
  if (page !== 'home' && r.index !== false) g.push(crumbs(r));
  return g.length ? { '@context': 'https://schema.org', '@graph': g } : null;
};

function page(html, { title, description, canonical, noindex, graph, lang = 'en', alternates = null }) {
  const set = (re, val) => { if (!re.test(html)) throw new Error('prerender: template lost ' + re); html = html.replace(re, val); };
  set(/<html lang="[^"]*">/, `<html lang="${lang}">`);
  set(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  set(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(description)}">`);
  set(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(title)}">`);
  set(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(description)}">`);
  set(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${esc(canonical || SITE + '/')}">`);
  set(/<meta property="og:locale" content="[^"]*">/, `<meta property="og:locale" content="${lang === 'es' ? 'es_ES' : 'en_US'}">`);
  set(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${esc(title)}">`);
  set(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${esc(description)}">`);
  set(/<meta name="robots" content="[^"]*">/, `<meta name="robots" content="${noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'}">`);
  const extra = [
    canonical ? `<link rel="canonical" href="${esc(canonical)}">` : '',
    // A page with a Spanish twin names both, plus x-default, so search shows each reader their language.
    ...(alternates ? [
      `<meta property="og:locale:alternate" content="${lang === 'es' ? 'en_US' : 'es_ES'}">`,
      ...alternates.map(([l, href]) => `<link rel="alternate" hreflang="${l}" href="${esc(href)}">`)
    ] : []),
    graph ? `<script type="application/ld+json">${json(graph)}</script>` : ''
  ].filter(Boolean).join('\n');
  return html.replace('</head>', extra + '\n</head>');
}

const written = [];
const twinOf = r => ROUTES.find(x => x.page === r.page && x !== r);
for (const r of ROUTES) {
  const lang = r.lang || 'en', twin = twinOf(r);
  const app = ssr.render(r.page, lang);
  const body = template.replace('<div id="root"></div>', `<div id="root">${app}</div>`);
  const en = lang === 'en' ? r : twin;
  const alternates = twin ? [['en', canonicalFor(r.page, 'en')], ['es', canonicalFor(r.page, 'es')], ['x-default', canonicalFor(en.page, 'en')]] : null;
  const html = page(body, { title: r.title, description: r.description, canonical: canonicalFor(r.page, lang), noindex: r.index === false, graph: graphFor(r), lang, alternates });
  const file = r.path === '/' ? 'index.html' : r.path.slice(1) + '.html';
  fs.mkdirSync(path.dirname(path.join(dist, file)), { recursive: true });
  fs.writeFileSync(path.join(dist, file), html);
  written.push(file);
}
// Unknown paths: Vercel serves 404.html with status 404.
const notFound = page(template.replace('<div id="root"></div>', `<div id="root">${ssr.render('notfound')}</div>`),
  { title: 'Page not found | inphox', description: 'This page does not exist.', canonical: null, noindex: true, graph: null });
fs.writeFileSync(path.join(dist, '404.html'), notFound);
written.push('404.html');

const today = new Date().toISOString().slice(0, 10);
// Each URL once; a page with a Spanish twin lists both languages as xhtml:link alternates (Google's sitemap form).
const urls = ROUTES.filter(r => r.index !== false).map(r => {
  const twin = twinOf(r), loc = canonicalFor(r.page, r.lang || 'en');
  const alt = twin ? ['en', 'es'].map(l => `\n    <xhtml:link rel="alternate" hreflang="${l}" href="${esc(canonicalFor(r.page, l))}"/>`).join('') + `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(canonicalFor(r.page, 'en'))}"/>` : '';
  return `  <url><loc>${esc(loc)}</loc><lastmod>${today}</lastmod>${alt}${alt ? '\n  ' : ''}</url>`;
});
fs.writeFileSync(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`);
written.push('sitemap.xml');

console.log(`prerender: wrote ${written.length} files: ${written.join(', ')}`);
// Founder alt text must exist for every photo (step 8 of the crawlability brief).
for (const p of TEAM) if (p.image && !personAlt(p)) throw new Error('prerender: no alt text for ' + p.name);
