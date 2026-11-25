// Collects every English string the site shows: text nodes and alt/aria-label/placeholder/title, on every page,
// at desktop and phone widths, while scrolling, while the demos play, and after clicking each in-page button.
// Output: JSON array of distinct normalized strings (stdout file arg).
const { chromium } = require(process.env.PW || 'playwright');
const fs = require('fs');
const B = 'http://127.0.0.1:4173';
const PAGES = process.argv[3] ? process.argv[3].split(',') : ['/', '/features', '/pricing', '/industries', '/platform', '/security', '/about', '/careers', '/contact', '/start', '/signin', '/signup-busy', '/no-such-page'];
const OUT = process.argv[2] || 'harvest.json';
const seen = new Set();
const COLLECT = () => {
  const S = window.__hv || (window.__hv = new Set());
  const ATTRS = ['alt', 'aria-label', 'placeholder', 'title'];
  const skip = n => { for (let e = n.nodeType === 1 ? n : n.parentElement; e; e = e.parentElement) { if (e.closest && e.closest('script,style,noscript,[data-no-tr],svg text.__x')) return true; break; } return false; };
  const add = t => { if (!t) return; const v = t.replace(/\s+/g, ' ').trim(); if (v && /[A-Za-z]/.test(v)) S.add(v); };
  const scan = root => {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n; (n = w.nextNode());) if (!skip(n)) add(n.nodeValue);
    (root.querySelectorAll ? root.querySelectorAll('*') : []).forEach(el => { if (skip(el)) return; ATTRS.forEach(a => el.hasAttribute(a) && add(el.getAttribute(a))); if (el.tagName === 'INPUT' && /^(submit|button)$/.test(el.type)) add(el.value); if (el.tagName === 'OPTION') add(el.textContent); });
  };
  scan(document.body);
  if (!window.__hvObs) {
    window.__hvObs = new MutationObserver(ms => ms.forEach(m => {
      if (m.type === 'characterData') { if (!skip(m.target)) add(m.target.nodeValue); }
      else if (m.type === 'attributes') { if (!skip(m.target)) add(m.target.getAttribute(m.attributeName)); }
      else m.addedNodes.forEach(n => n.nodeType === 3 ? (!skip(n) && add(n.nodeValue)) : n.nodeType === 1 && scan(n));
    }));
    window.__hvObs.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['alt', 'aria-label', 'placeholder', 'title'] });
  }
};
const dump = async page => { try { (await page.evaluate(() => [...(window.__hv || [])])).forEach(s => seen.add(s)); } catch (e) {} };

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined });
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    page.on('dialog', d => d.dismiss().catch(() => {}));
    for (const p of PAGES) {
      await page.goto(B + p, { waitUntil: 'load' }); await page.waitForTimeout(700);
      await page.evaluate(COLLECT);
      // scroll slowly to the bottom so reveals, the scroll story and lazy parts render
      const H = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < H + 2000; y += Math.round(h * 0.45)) { await page.evaluate(y => scrollTo(0, y), y); await page.waitForTimeout(p === '/' ? 260 : 120); }
      await page.evaluate(COLLECT); await dump(page);
      // let demos loop a while
      await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(p === '/' ? 9000 : 2500); await dump(page);
      // click each in-page button (one at a time, from a fresh page every 12 clicks)
      const n = await page.evaluate(() => document.querySelectorAll('main button, main [role=tab], main summary, header button').length);
      for (let i = 0; i < Math.min(n, 160); i++) {
        if (i % 12 === 0) { await page.goto(B + p, { waitUntil: 'load' }); await page.waitForTimeout(400); await page.evaluate(COLLECT); }
        try {
          const els = await page.$$('main button, main [role=tab], main summary, header button');
          const el = els[i]; if (!el) break;
          if (!(await el.isVisible())) { await el.scrollIntoViewIfNeeded({ timeout: 800 }).catch(() => {}); }
          await el.click({ timeout: 1200 });
          await page.waitForTimeout(450);
          if (new URL(page.url()).pathname !== p) { await dump(page); await page.goto(B + p, { waitUntil: 'load' }); await page.waitForTimeout(300); await page.evaluate(COLLECT); }
          else { await page.evaluate(COLLECT); }
        } catch (e) { /* hidden or detached */ }
        if (i % 6 === 5) await dump(page);
      }
      // forms: submit empty to show the error messages
      try { const f = await page.$('main form'); if (f) { await page.evaluate(() => { const b = document.querySelector('main form [type=submit], main form button'); b && b.click(); }); await page.waitForTimeout(600); await page.evaluate(COLLECT); } } catch (e) {}
      await dump(page);
      process.stderr.write(`${w} ${p} -> ${seen.size}\n`);
    }
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(OUT, JSON.stringify([...seen].sort(), null, 0));
  console.log('strings', seen.size);
})().catch(e => { console.error(e); process.exit(1); });
