// Spanish for the whole site without rewriting every component: the pages render in English as always, and on /es/
// pages this layer swaps each English string for its Spanish translation (src/i18n/es.js): text nodes and the alt,
// aria-label, placeholder and title attributes. The build prerender runs translateHtml() over each page's HTML, so
// crawlers get the Spanish words; in the browser, translateLive() keeps doing it as the page changes (the demos, the
// forms, the menus). A string with no translation (a model name, an IMEI, a price) is left as it is.
// The Autograding page has its own Spanish copy and is marked data-no-tr, so this layer leaves it alone.
import { ES, ES_PATTERNS } from './es.js';
import { ROUTES } from '../routes.js';

const ATTRS = ['alt', 'aria-label', 'placeholder', 'title'];
const norm = s => s.replace(/\s+/g, ' ').trim();

/** Spanish for one string, or null when there is none. Keeps the string's own leading and trailing spaces. */
export function tr(s) {
  if (s == null) return null;
  const n = norm(String(s));
  if (!n || !/[A-Za-z]/.test(n)) return null;
  let out = Object.prototype.hasOwnProperty.call(ES, n) ? ES[n] : null;
  if (out == null) {
    for (const [re, rep] of ES_PATTERNS) {
      if (re.test(n)) { out = n.replace(re, rep); break; }
    }
  }
  if (out == null) return null;
  const lead = String(s).match(/^\s*/)[0], trail = String(s).match(/\s*$/)[0];
  return lead + out + trail;
}

// Internal links stay in Spanish: /pricing -> /es/pricing (only paths the site has a Spanish page for).
const ES_PATHS = new Map(ROUTES.filter(r => r.lang === 'es').map(r => [r.enPath, r.path]));
export const esHref = href => {
  if (!href || !href.startsWith('/') || href.startsWith('//') || href.startsWith('/es')) return null;
  const m = /^([^?#]*)(.*)$/.exec(href);
  const to = ES_PATHS.get(m[1] === '' ? '/' : m[1]);
  return to ? to + m[2] : null;
};

// ---- build time: HTML string ----
const decode = s => s.replace(/&(amp|lt|gt|quot|#x27|#39|nbsp);/g, (_, e) => ({ amp: '&', lt: '<', gt: '>', quot: '"', '#x27': "'", '#39': "'", nbsp: ' ' })[e]);
const encText = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const encAttr = s => encText(s).replace(/"/g, '&quot;');

/** Translates a rendered page's HTML: text between tags and the four attributes, never inside script, style or a
 *  data-no-tr element; internal hrefs point at the Spanish pages. */
export function translateHtml(html) {
  // Cut out what must not change: <script>/<style> blocks and data-no-tr subtrees (by tag depth).
  const keep = [];
  const hold = s => `\u0000${keep.push(s) - 1}\u0000`;
  html = html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, hold);
  html = cutNoTr(html, hold);
  html = html.replace(/(\s(?:alt|aria-label|placeholder|title)=")([^"]*)(")/g, (m, a, v, b) => { const t = tr(decode(v)); return t == null ? m : a + encAttr(t) + b; });
  html = html.replace(/(\shref=")([^"]*)(")/g, (m, a, v, b) => { const t = esHref(decode(v)); return t == null ? m : a + encAttr(t) + b; });
  html = html.replace(/>([^<>\u0000]+)</g, (m, text) => { const t = tr(decode(text)); return t == null ? m : '>' + encText(t) + '<'; });
  return html.replace(/\u0000(\d+)\u0000/g, (_, i) => keep[+i]);
}
function cutNoTr(html, hold) {
  let out = '', i = 0;
  const open = /<([a-z][a-z0-9]*)\b[^>]*\sdata-no-tr(?:="[^"]*")?[^>]*>/gi;
  for (let m; (m = open.exec(html));) {
    const tag = m[1].toLowerCase();
    let depth = 1, j = open.lastIndex;
    const re = new RegExp(`<(/?)${tag}\\b[^>]*?(/?)>`, 'gi'); re.lastIndex = j;
    for (let t; depth && (t = re.exec(html));) { if (t[1]) depth--; else if (!t[2]) depth++; j = re.lastIndex; }
    out += html.slice(i, m.index) + hold(html.slice(m.index, j));
    i = j; open.lastIndex = j;
  }
  return out + html.slice(i);
}

// ---- in the browser ----
const skip = node => { const el = node.nodeType === 1 ? node : node.parentElement; return !el || !!el.closest('script,style,noscript,[data-no-tr]'); };
function textNode(n, done) {
  const v = n.nodeValue;
  if (done.get(n) === v) return;               // our own write
  const t = tr(v);
  if (t != null && t !== v) { n.nodeValue = t; done.set(n, t); }
}
function element(el, done) {
  for (const a of ATTRS) {
    if (!el.hasAttribute(a)) continue;
    const v = el.getAttribute(a), key = el, mark = a + '\u0000' + v;
    if (done.get(key) === mark) continue;
    const t = tr(v);
    if (t != null && t !== v) { el.setAttribute(a, t); done.set(key, a + '\u0000' + t); }
  }
  if (el.tagName === 'A') { const h = el.getAttribute('href'); const t = esHref(h); if (t) el.setAttribute('href', t); }
}
function scan(root, done) {
  if (root.nodeType === 3) { if (!skip(root)) textNode(root, done); return; }
  if (root.nodeType !== 1 || skip(root)) return;
  element(root, done);
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
    acceptNode: n => (n.nodeType === 1 && n.closest('script,style,noscript,[data-no-tr]')) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
  });
  for (let n; (n = w.nextNode());) n.nodeType === 3 ? textNode(n, done) : element(n, done);
}

/** Translates `root` now and keeps translating whatever changes under it. Returns a stop function. */
export function translateLive(root) {
  const done = new WeakMap();
  scan(root, done);
  const obs = new MutationObserver(ms => {
    for (const m of ms) {
      if (m.type === 'characterData') { if (!skip(m.target)) textNode(m.target, done); }
      else if (m.type === 'attributes') { if (!skip(m.target)) element(m.target, done); }
      else m.addedNodes.forEach(n => scan(n, done));
    }
  });
  obs.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: [...ATTRS, 'href'] });
  return () => obs.disconnect();
}
