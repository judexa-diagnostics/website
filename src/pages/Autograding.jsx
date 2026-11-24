import { useEffect, useMemo, useRef } from 'react';
import '../autograding/ag.css';
import { renderHero, renderMain } from '../autograding/template.js';
import { heroVals, mainVals } from '../autograding/vals.js';

// inphox Autograding: its own product, on its own page of this site. Loaded lazily (Layout), so the inphox Inventory
// pages never download it. The markup comes from the approved Claude Design board (src/autograding/*, generated), and
// is rendered to a string so the build prerender gives crawlers the same page a visitor sees.
const REF_KEY = 'inphox_ag_ref';
const cleanRef = r => (/^[A-Za-z0-9_-]{1,32}$/.test(r || '') ? r : '');
// An incoming ?ref= is kept for the visit, so every button on the page passes it on to the sign-up.
const readRef = () => {
  if (typeof window === 'undefined') return '';
  let ref = '';
  try { ref = cleanRef(new URLSearchParams(location.search).get('ref')); } catch (e) { /* old browser */ }
  try { if (ref) sessionStorage.setItem(REF_KEY, ref); else ref = cleanRef(sessionStorage.getItem(REF_KEY)); } catch (e) { /* private window */ }
  return ref;
};

export const autogradingHtml = (lang, ref = '') => renderMain(mainVals(lang, ref), renderHero(heroVals(lang, ref)));

export default function Autograding({ v }) {
  const lang = v && v.langCode === 'ES' ? 'es' : 'en';
  const ref = useMemo(readRef, []);
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

  return <div ref={root} className="ag" lang={lang} dangerouslySetInnerHTML={{ __html: html }} />;
}
