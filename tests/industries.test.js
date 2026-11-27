// Autograding by industry (/autograding/<industry>, src/autograding/*). Each page must be complete in both languages,
// substantial, its own (Google's scaled-content and doorway-page policies), honest, and must convert through links that
// keep the visitor's campaign and add the page as via= (2026-11-27).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { INDUSTRY_META, INDUSTRY_PAGES } from '../src/autograding/industryMeta.js';
import { INDUSTRIES } from '../src/autograding/industries.js';
import { ctaHref, CTA_DESTINATIONS } from '../src/autograding/industryLinks.js';
import { ROUTES, productOf, pathFor } from '../src/routes.js';

/** Every word a reader sees on an industry page, in one language. */
const words = (slug, lang) => {
  const t = INDUSTRIES[slug][lang], out = [];
  const walk = v => { if (typeof v === 'string') out.push(v); else if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => k !== 'to' && k !== 'anchor' && walk(x)); };
  walk(t);
  return out.join(' ');
};
const SLUGS = INDUSTRY_META.map(m => m.slug);

test('every industry in the list has a page, and every page is in the list', () => {
  assert.deepEqual(Object.keys(INDUSTRIES).sort(), [...SLUGS].sort());
  for (const m of INDUSTRY_META) {
    assert.equal(pathFor(m.page, 'en'), '/autograding/' + m.slug);
    assert.equal(pathFor(m.page, 'es'), '/es/autograding/' + m.slug);
    assert.equal(productOf(m.page), 'ag', `${m.page}: the header and menu are Autograding's`);
    assert.equal(ROUTES.filter(r => r.page === m.page).length, 2, `${m.page}: English and Spanish routes`);
  }
});

test('each page is complete in English and Spanish, and the Spanish is written, not copied', () => {
  const need = ['kicker', 'h1', 'intro', 'cta', 'flow', 'sections', 'example', 'fit', 'evaluate', 'faq', 'close'];
  for (const slug of SLUGS) {
    const { en, es } = INDUSTRIES[slug];
    for (const k of need) { assert.ok(en[k], `${slug} en.${k}`); assert.ok(es[k], `${slug} es.${k}`); }
    assert.equal(es.sections.length, en.sections.length, `${slug}: same sections in both languages`);
    assert.equal(es.faq.length, en.faq.length, `${slug}: same questions in both languages`);
    assert.equal(es.flow.steps.length, en.flow.steps.length, `${slug}: same steps`);
    assert.notEqual(es.intro, en.intro, `${slug}: Spanish intro`);
    assert.notEqual(es.h1.join(' '), en.h1.join(' '), `${slug}: Spanish headline`);
    assert.ok(en.faq.length >= 3 && en.sections.length >= 4, `${slug}: enough substance`);
  }
});

test('each page says enough to be worth reading (at least 600 words in each language)', () => {
  for (const slug of SLUGS) for (const lang of ['en', 'es']) {
    const n = words(slug, lang).split(/\s+/).filter(Boolean).length;
    assert.ok(n >= 600, `${slug} ${lang}: ${n} words`);
  }
});

test('no two industry pages read alike (shared three-word phrases stay under 12%)', () => {
  const shingles = s => { const w = s.toLowerCase().replace(/[^a-z0-9áéíóúñü ]+/g, ' ').split(/\s+/).filter(Boolean); const out = new Set(); for (let i = 0; i + 2 < w.length; i++) out.add(w.slice(i, i + 3).join(' ')); return out; };
  for (const lang of ['en', 'es']) {
    const sh = Object.fromEntries(SLUGS.map(s => [s, shingles(words(s, lang))]));
    for (let i = 0; i < SLUGS.length; i++) for (let j = i + 1; j < SLUGS.length; j++) {
      const a = sh[SLUGS[i]], b = sh[SLUGS[j]];
      const shared = [...a].filter(x => b.has(x)).length, jac = shared / (a.size + b.size - shared);
      assert.ok(jac < 0.12, `${lang} ${SLUGS[i]} vs ${SLUGS[j]}: ${(jac * 100).toFixed(1)}% shared phrases`);
    }
  }
});

test('no claim the product cannot back (founder rules and the brief)', () => {
  const banned = [
    /every (scratch|flaw|defect)/i, /cada (rayón|defecto)/i, /\bmillions?\b|\bmillones\b/i,
    /(?<!7[–-])\b7 (seconds|segundos)\b|seven seconds|siete segundos/i, /99[.,]\d+ ?%/, /SOC ?2|ISO ?27001|HIPAA|R2v3|e-Stewards|NAID/i,
    /guaranteed (savings|accuracy|results|agreement)|we guarantee|garantizamos|ahorros? garantizados?|precisión garantizada/i, /testimonial|award|premio/i,
    /\bbetter than\b|\bmejor que\b|NSYS|Blancco/i, /soporte en español|spanish(-language)? support/i
  ];
  for (const slug of SLUGS) for (const lang of ['en', 'es']) {
    const text = words(slug, lang);
    for (const re of banned) assert.doesNotMatch(text, re, `${slug} ${lang}`);
  }
  for (const m of INDUSTRY_META) for (const lang of ['en', 'es']) for (const re of banned) assert.doesNotMatch(m[lang].title + ' ' + m[lang].description, re, m.slug);
});

test('every example is marked as an example', () => {
  for (const slug of SLUGS) for (const lang of ['en', 'es']) {
    assert.match(INDUSTRIES[slug][lang].example.note, /illustrative|ilustrativ|from the published|tomado de la documentación/i, `${slug} ${lang}`);
  }
});

test('calls to action go somewhere real, keep the visitor\'s campaign and name the page in via', () => {
  for (const slug of SLUGS) for (const lang of ['en', 'es']) {
    const { cta } = INDUSTRIES[slug][lang];
    for (const c of [cta.primary, cta.secondary]) {
      assert.ok(CTA_DESTINATIONS.includes(c.to), `${slug} ${lang}: ${c.to}`);
      const href = ctaHref(c, lang, 'w2-sellmac', `${slug}-hero`);
      if (['start', 'developers', 'sample', 'contact'].includes(c.to)) {
        const q = new URLSearchParams(href.split('?')[1]);
        assert.equal(q.get('via'), `${slug}-hero`, href);
        assert.equal(q.get('ref'), 'w2-sellmac', href);
        assert.equal(q.get('lang'), lang, href);
      }
      if (c.to === 'contact') assert.ok(href.startsWith(lang === 'es' ? '/es/contact?' : '/contact?'), href);
      if (c.to === 'start') assert.ok(href.startsWith('https://autograding.inphox.net/?'), href);
      if (c.to === 'sample') assert.ok(href.startsWith('https://autograding.inphox.net/s/'), href);
    }
  }
  assert.throws(() => ctaHref({ to: 'nowhere' }, 'en', '', 'x'), /unknown destination/);
});

test('the industries are reachable by normal navigation, not only the sitemap', () => {
  const read = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8');
  assert.match(read('src/pages/Autograding.jsx'), /<IndustryIndex lang=\{lang\} \/>/, 'the Autograding page lists them');
  assert.match(read('src/pages/AgIndustry.jsx'), /<IndustryIndex lang=\{lang\} current=\{page\} \/>/, 'each industry page lists the others');
  assert.match(read('src/components/Footer.jsx'), /#industries/, 'the footer links to them');
  assert.match(read('src/chrome.js'), /'By industry', '\/autograding#industries'/, 'the Autograding menu links to them');
  assert.equal(INDUSTRY_PAGES.length, SLUGS.length);
});
