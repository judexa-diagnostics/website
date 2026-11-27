import { useEffect, useMemo, useRef } from 'react';
import '../autograding/ag.css';
import { renderHero, renderMain } from '../autograding/template.js';
import { heroVals, mainVals } from '../autograding/vals.js';
import { visitorRef } from '../chrome.js';
import IndustryIndex from '../autograding/IndustryIndex.jsx';

// inphox Autograding: its own product, on its own page of this site. Loaded lazily (Layout), so the inphox Inventory
// pages never download it. The markup comes from the approved Claude Design board (src/autograding/*, generated), and
// is rendered to a string so the build prerender gives crawlers the same page a visitor sees.
// An incoming ?ref= is kept for the visit (chrome.js, from whichever page the visitor landed on), so every button on
// the page passes it on to the sign-up.

// On the Spanish page, links into the site open its Spanish pages (/es/contact, /es/pricing).
const esLinks = html => html.replace(/href="\/(contact|pricing)([?"])/g, 'href="/es/$1$2');
export const autogradingHtml = (lang, ref = '') => {
  const html = renderMain(mainVals(lang, ref), renderHero(heroVals(lang, ref)));
  return lang === 'es' ? esLinks(html) : html;
};

export default function Autograding({ v }) {
  const lang = v && v.langCode === 'ES' ? 'es' : 'en';
  const ref = useMemo(visitorRef, []);
  const html = useMemo(() => autogradingHtml(lang, ref), [lang, ref]);
  const root = useRef(null);

  // The "their grade, in your terms" card: drag left and right to compare the seller's report with your profile.
  useEffect(() => {
    const el = root.current; if (!el) return undefined;
    const range = el.querySelector('[data-norm="range"]'), lens = el.querySelector('[data-norm="lens"]'), edge = el.querySelector('[data-norm="edge"]');
    if (!range || !lens || !edge) return undefined;
    const move = () => {
      const x = Math.max(0, Math.min(100, Number(range.value) || 0));
      lens.classList.remove('ag-lens'); edge.classList.remove('ag-lens-edge');
      lens.style.clipPath = `inset(0 ${100 - x}% 0 0)`; edge.style.left = x + '%';
    };
    range.addEventListener('input', move);
    return () => range.removeEventListener('input', move);
  }, [html]);

  // data-no-tr: this page has its own Spanish copy; the site-wide translation layer (src/i18n) leaves it alone.
  return (
    <>
      <div ref={root} className="ag" lang={lang} data-no-tr="" dangerouslySetInnerHTML={{ __html: html }} />
      <IndustryIndex lang={lang} />
    </>
  );
}
