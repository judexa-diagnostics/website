// guide.inphox.net, built from guide/nav.json + guide/pages/*.html (2026-11-24, Chris: "looks like api docs on the left side is
// the index and on the right are all the instructions ... our logo is clickable to go to the home page ... reporting issues").
// No dependencies: Node's own fs. `node guide/build.mjs [outDir]` (default dist-guide/) writes one page per topic
// (/<slug>/index.html, so a link from the apps or Double Puff lands on that topic), the home page (/index.html), search.json
// (titles, section headings and text, for the search box) and the assets. A page is an HTML fragment whose first line is
// `<!-- title: ... | summary: ... -->`; every <h2 id="..."> in it is a section (the right-hand "On this page" and a deep
// link: /<slug>/#<id>). Checks (exit 1): a nav slug without a page, a page outside the nav, an h2 without an id, two ids
// alike on a page, a link to /<slug>/ that is not a page, a vendor name from tests/guide_words.json.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(process.argv[2] || path.join(here, '..', 'dist-guide'));
const nav = JSON.parse(fs.readFileSync(path.join(here, 'nav.json'), 'utf8'));
const SITE = 'https://guide.inphox.net';
const SUPPORT = 'support@inphox.net';
const HOME = 'https://home.inphox.net';
const problems = [];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const text = (html) => html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();

// The plans come from the website's own price file (src/pricing.js, which `npm test` checks against what billing
// sells): a page writes <!-- plans-table --> and gets the table, so a price change is still one edit.
const { pricing, OVERAGE_PER_CHECK } = await import('../src/pricing.js');
const money = (n) => (n === 0 ? '$0' : `$${n.toLocaleString('en-US')}`);
export function plansTable() {
  const rows = pricing.plans.map((p) => `<tr><th scope="row">${esc(p.name)}</th>
<td>${p.price === null ? 'Contract' : `${money(p.price)} a month`}</td>
<td>${p.checksIncluded === null ? 'In your contract' : p.checksIncluded.toLocaleString('en-US')}</td>
<td>${p.staff === null ? 'No limit' : p.staff === 0 ? 'The owner only' : `Up to ${p.staff}`}</td>
<td>${p.locations === null ? 'No limit' : p.locations}</td>
<td>${p.repairsAddon ? `${money(p.repairsAddon)} a month` : p.code === 'free' ? 'Upgrade first' : 'In your contract'}</td>
<td>${p.adds.map((a) => esc(a.label)).join(', ')}</td></tr>`).join('\n');
  return `<div class="g-table"><table><thead><tr><th scope="col">Plan</th><th scope="col">Price</th><th scope="col">Checks a month</th>
<th scope="col">People</th><th scope="col">Locations</th><th scope="col">Repairs add-on</th><th scope="col">Adds (each plan has everything above it)</th></tr></thead>
<tbody>
${rows}
</tbody></table></div>
<p>Past your included checks, each check is ${money(OVERAGE_PER_CHECK).replace('$0.5', '50¢')} on every plan, up to the spending limit you set.</p>`;
}

export function parsePage(src, slug) {
  const m = src.match(/^<!--\s*title:\s*(.*?)\s*\|\s*summary:\s*(.*?)\s*-->\s*\n/);
  if (!m) throw new Error(`${slug}: the first line must be <!-- title: ... | summary: ... -->`);
  const body = src.slice(m[0].length).replace('<!-- plans-table -->', plansTable);
  const sections = [];
  const seen = new Set();
  for (const h of body.matchAll(/<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/g)) {
    const id = (h[1] || '').match(/\sid="([a-z0-9-]+)"/);
    if (!id) { problems.push(`${slug}: an <h2> without an id: ${text(h[2])}`); continue; }
    if (seen.has(id[1])) problems.push(`${slug}: two sections with the id ${id[1]}`);
    seen.add(id[1]);
    sections.push({ id: id[1], title: text(h[2]) });
  }
  return { title: m[1], summary: m[2], body, sections };
}

// every page, in nav order
const order = [];
for (const g of nav.groups) for (const slug of g.pages) order.push({ slug, group: g.title });
const pages = new Map();
for (const { slug, group } of order) {
  const file = path.join(here, 'pages', `${slug}.html`);
  if (!fs.existsSync(file)) { problems.push(`nav lists ${slug} but guide/pages/${slug}.html is missing`); continue; }
  pages.set(slug, { slug, group, ...parsePage(fs.readFileSync(file, 'utf8'), slug) });
}
for (const f of fs.readdirSync(path.join(here, 'pages'))) {
  const slug = f.replace(/\.html$/, '');
  if (f.endsWith('.html') && !pages.has(slug) && slug !== 'index') problems.push(`guide/pages/${f} is not in nav.json`);
}
const home = parsePage(fs.readFileSync(path.join(here, 'pages', 'index.html'), 'utf8'), 'index');

// links between pages must land on a page (and, with #id, on a section of it)
for (const p of [...pages.values(), { slug: 'index', body: home.body }]) {
  for (const l of p.body.matchAll(/href="\/([a-z0-9-]+)\/(?:#([a-z0-9-]+))?"/g)) {
    const to = pages.get(l[1]);
    if (!to) problems.push(`${p.slug}: link to /${l[1]}/ but there is no such page`);
    else if (l[2] && !to.sections.some((s) => s.id === l[2])) problems.push(`${p.slug}: link to /${l[1]}/#${l[2]} but that page has no such section`);
  }
}
const words = JSON.parse(fs.readFileSync(path.join(here, '..', 'tests', 'guide_words.json'), 'utf8'));
for (const p of [...pages.values(), { slug: 'index', body: home.body, title: home.title }]) {
  const t = text(p.body).toLowerCase();
  for (const w of words.never) if (new RegExp(`\\b${w.toLowerCase()}\\b`).test(t)) problems.push(`${p.slug}: says "${w}" (no outside vendor or product names)`);
}

function sidebar(current) {
  return nav.groups.map((g) => {
    const open = g.pages.includes(current) || current === 'index';
    const items = g.pages.filter((s) => pages.has(s)).map((s) => {
      const p = pages.get(s);
      return `<li><a href="/${s}/"${s === current ? ' aria-current="page"' : ''}>${esc(p.title)}</a></li>`;
    }).join('');
    return `<details class="g-group"${open ? ' open' : ''}><summary>${esc(g.title)}</summary><ul>${items}</ul></details>`;
  }).join('\n');
}

function shell({ slug, title, summary, body, sections, group }) {
  const isHome = slug === 'index';
  const url = isHome ? `${SITE}/` : `${SITE}/${slug}/`;
  const i = order.findIndex((o) => o.slug === slug);
  const prev = i > 0 ? pages.get(order[i - 1].slug) : null;
  const next = i >= 0 && i < order.length - 1 ? pages.get(order[i + 1].slug) : (isHome ? pages.get(order[0].slug) : null);
  const toc = sections.length > 1
    ? `<nav class="g-toc" aria-label="On this page"><p>On this page</p><ul>${sections.map((s) => `<li><a href="#${s.id}">${esc(s.title)}</a></li>`).join('')}</ul></nav>`
    : '';
  const tabTitle = isHome ? 'inphox guide · How to use inphox and Double Puff' : `${title} · inphox guide`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(tabTitle)}</title>
<meta name="description" content="${esc(summary)}">
<link rel="canonical" href="${url}">
<link rel="icon" type="image/png" href="/assets/inphox-logo.png">
<link rel="apple-touch-icon" href="/assets/inphox-logo.png">
<meta property="og:site_name" content="inphox guide">
<meta property="og:title" content="${esc(isHome ? 'inphox guide' : title)}">
<meta property="og:description" content="${esc(summary)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/assets/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="/assets/guide.css">
</head>
<body>
<a class="g-skip" href="#g-main">Skip to the instructions</a>
<header class="g-top">
  <button class="g-menu" type="button" aria-controls="g-side" aria-expanded="false">Menu</button>
  <a class="g-brand" href="/" aria-label="inphox guide home"><img src="/assets/inphox-logo.png" alt="" width="28" height="28"><span>inphox <b>guide</b></span></a>
  <form class="g-search" role="search" action="/search/"><label class="g-vh" for="g-q">Search the guide</label><input id="g-q" name="q" type="search" placeholder="Search" autocomplete="off"><ul class="g-results" id="g-results" hidden></ul></form>
  <a class="g-report" href="/report-an-issue/"><span>Report</span><span class="g-long">an issue</span></a>
</header>
<div class="g-wrap">
  <aside class="g-side" id="g-side" aria-label="Guide contents">
    <a class="g-side-home" href="/"${isHome ? ' aria-current="page"' : ''}>Guide home</a>
    ${sidebar(slug)}
    <a class="g-side-app" href="${HOME}">Open inphox</a>
  </aside>
  <main class="g-main" id="g-main">
    ${isHome ? '' : `<p class="g-crumb"><a href="/">Guide</a> <span aria-hidden="true">›</span> ${esc(group)}</p>`}
    <h1>${esc(isHome ? title : title)}</h1>
    <p class="g-lede">${esc(summary)}</p>
    ${toc ? toc.replace('class="g-toc"', 'class="g-toc g-toc-inline"') : ''}
    <article class="g-body">
${body}
    </article>
    <nav class="g-pager" aria-label="Next and previous">
      ${prev ? `<a class="g-prev" href="/${prev.slug}/"><small>Previous</small>${esc(prev.title)}</a>` : '<span></span>'}
      ${next ? `<a class="g-next" href="/${next.slug}/"><small>Next</small>${esc(next.title)}</a>` : '<span></span>'}
    </nav>
    <footer class="g-foot">
      <p>Something here wrong or missing? <a href="/report-an-issue/">Tell us</a>: email <span class="g-mail">${SUPPORT}</span> <button type="button" class="g-copy" data-copy="${SUPPORT}">Copy</button></p>
      <p><a href="/">Guide home</a> · <a href="${HOME}">Open inphox</a> · <a href="https://inphox.net">inphox.net</a></p>
    </footer>
  </main>
  ${toc ? toc.replace('class="g-toc"', 'class="g-toc g-toc-side"') : '<span></span>'}
</div>
<script src="/assets/guide.js" defer></script>
</body>
</html>
`;
}

function write(rel, content) {
  const f = path.join(out, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, content);
}

if (problems.length) {
  console.error(problems.map((p) => `GUIDE: ${p}`).join('\n'));
  process.exit(1);
}
// Only ever empties a folder that is empty or holds an earlier guide build (its search.json): never a path given by mistake.
if (fs.existsSync(out) && fs.readdirSync(out).length) {
  if (!fs.existsSync(path.join(out, 'search.json'))) {
    console.error(`GUIDE: ${out} is not empty and is not an earlier guide build: pick an empty folder`);
    process.exit(1);
  }
  for (const f of fs.readdirSync(out)) fs.rmSync(path.join(out, f), { recursive: true, force: true });
}
write('index.html', shell({ slug: 'index', group: '', ...home }));
for (const p of pages.values()) write(`${p.slug}/index.html`, shell(p));
write('search/index.html', shell({ slug: 'index', group: '', title: 'Search', summary: 'Search every page of the guide.',
  body: '<div id="g-search-page"><p>Type in the search box at the top.</p></div>', sections: [] }).replace('<title>inphox guide · How to use inphox and Double Puff</title>', '<title>Search · inphox guide</title>'));
write('search.json', JSON.stringify([...pages.values()].map((p) => ({
  slug: p.slug, title: p.title, group: p.group, summary: p.summary,
  sections: p.sections.map((s) => ({ id: s.id, title: s.title })),
  text: text(p.body).slice(0, 6000),
}))));
write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url><loc>${SITE}/</loc></url>\n${[...pages.keys()].map((s) => `<url><loc>${SITE}/${s}/</loc></url>`).join('\n')}\n</urlset>\n`);
// assets: the guide's own, the screenshots, and the site's logo, share picture and font
const copy = (from, to) => { fs.mkdirSync(path.dirname(path.join(out, to)), { recursive: true }); fs.copyFileSync(from, path.join(out, to)); };
for (const f of fs.readdirSync(path.join(here, 'assets'))) {
  const src = path.join(here, 'assets', f);
  if (fs.statSync(src).isDirectory()) for (const g of fs.readdirSync(src)) copy(path.join(src, g), `assets/${f}/${g}`);
  else copy(src, `assets/${f}`);
}
const pub = path.join(here, '..', 'public', 'assets');
copy(path.join(pub, 'inphox-logo.png'), 'assets/inphox-logo.png');
copy(path.join(pub, 'og-image.png'), 'assets/og-image.png');
copy(path.join(pub, 'fonts', 'Satoshi-Variable.woff2'), 'assets/fonts/Satoshi-Variable.woff2');
console.log(`guide: ${pages.size + 1} pages, ${[...pages.values()].reduce((n, p) => n + p.sections.length, 0)} sections -> ${out}`);
