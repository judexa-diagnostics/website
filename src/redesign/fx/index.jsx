// Shared motion helpers for the marketing pages.
//  - <FxScope> / useReveal: elements marked data-fx inside reveal on scroll
//    (staggered), or play an entrance when on screen at mount. Visible by
//    default; only hidden by JS when below the fold and IO exists.
//  - <Tween value="$1,490" />: tweens the number inside a string, always
//    ending on the exact string it was given (width reserved, no shift).
//  - spot: pointer handler feeding the .fx-spot spotlight.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './fx.css';

const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export const prefersReduced = () =>
  typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useReducedPref() {
  const [r, setR] = useState(prefersReduced);
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setR(mq.matches);
    mq.addEventListener ? mq.addEventListener('change', on) : mq.addListener(on);
    return () => { mq.removeEventListener ? mq.removeEventListener('change', on) : mq.removeListener(on); };
  }, []);
  return r;
}

const MAX_DELAY = 1100;
const gapOf = el => +(el.dataset.fxGap || 70);
const baseOf = el => +(el.dataset.fxDelay || 0);

export function useReveal(ref) {
  useIso(() => {
    const root = ref.current;
    if (!root || prefersReduced() || typeof IntersectionObserver === 'undefined') return;
    const seen = new WeakSet();
    // Clip / scale variants collapse their own box while waiting, so they are
    // watched through their parent instead.
    const proxyOf = el => (el.dataset.fx === 'type' || el.dataset.fx === 'line') && el.parentElement ? el.parentElement : el;
    const waiting = new Map(); // observed node -> elements it releases
    const release = nodes => {
      let k = 0;
      nodes.forEach(n => {
        (waiting.get(n) || []).forEach(el => {
          el.style.setProperty('--fx-d', Math.min(MAX_DELAY, k++ * gapOf(el) + baseOf(el)) + 'ms');
          el.dataset.fxState = 'in';
        });
        waiting.delete(n);
        io.unobserve(n);
      });
    };
    const io = new IntersectionObserver(entries => {
      release(entries.filter(e => e.isIntersecting)
        .sort((a, b) => (a.boundingClientRect.top - b.boundingClientRect.top) || (a.boundingClientRect.left - b.boundingClientRect.left))
        .map(e => e.target));
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0 });
    // Backstop for when observer callbacks lag (busy main thread, 3D scenes):
    // after scrolling settles, release whatever is plainly on screen.
    const check = () => {
      if (!waiting.size) return;
      const vh = window.innerHeight, vw = window.innerWidth;
      const on = [...waiting.keys()].map(n => [n, n.getBoundingClientRect()])
        .filter(([, r]) => r.top < vh * 0.94 && r.bottom > 0 && r.left < vw - 8)
        .sort((a, b) => a[1].top - b[1].top).map(([n]) => n);
      if (on.length) release(on);
    };
    let tid = 0;
    const settle = () => { clearTimeout(tid); tid = setTimeout(check, 180); };
    const poll = setInterval(check, 700);
    window.addEventListener('scroll', settle, { passive: true, capture: true });
    window.addEventListener('resize', settle);
    const watch = el => {
      const px = proxyOf(el);
      if (!waiting.has(px)) { waiting.set(px, []); io.observe(px); }
      waiting.get(px).push(el);
    };
    const scan = () => {
      const vh = window.innerHeight || 800;
      let k = 0;
      root.querySelectorAll('[data-fx]').forEach(el => {
        if (seen.has(el)) return;
        seen.add(el);
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return; // not rendered
        const offRight = r.left >= window.innerWidth - 8;
        if (!offRight && r.top < vh * 0.94 && r.bottom > 0) {
          el.style.setProperty('--fx-d', Math.min(MAX_DELAY, k++ * gapOf(el) + baseOf(el)) + 'ms');
          el.dataset.fxState = 'enter';
        } else if (offRight || r.top >= vh * 0.94) {
          el.dataset.fxState = 'pre';
          watch(el);
        }
      });
    };
    scan();
    // Pieces rendered later (filters, steps, expanders) get the same treatment.
    const mo = new MutationObserver(scan);
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      io.disconnect(); mo.disconnect(); clearTimeout(tid); clearInterval(poll);
      window.removeEventListener('scroll', settle, { capture: true }); window.removeEventListener('resize', settle);
      // Never leave anything hidden behind.
      root.querySelectorAll('[data-fx-state="pre"]').forEach(el => { el.dataset.fxState = 'in'; });
    };
  }, []);
}

// A box-less wrapper that scopes useReveal; layout is unchanged.
export function FxScope({ children }) {
  const ref = useRef(null);
  useReveal(ref);
  return <div ref={ref} style={{ display: 'contents' }}>{children}</div>;
}

// ---- Number tween ----
const NUM = /^([\s\S]*?)(\d[\d,]*(?:\.\d+)?)([\s\S]*)$/;
const parse = s => {
  const m = typeof s === 'string' ? s.match(NUM) : null;
  if (!m) return null;
  const raw = m[2], dot = raw.indexOf('.');
  return { pre: m[1], n: parseFloat(raw.replace(/,/g, '')), dec: dot < 0 ? 0 : raw.length - dot - 1, comma: raw.includes(','), post: m[3] };
};
const fmt = (p, n) => {
  let s = n.toFixed(p.dec);
  if (p.comma || Math.abs(n) >= 1000) {
    const [i, d] = s.split('.');
    s = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (d ? '.' + d : '');
  }
  return p.pre + s + p.post;
};

export function Tween({ value, duration = 650, fromZero = false, align = 'start' }) {
  const str = value == null ? '' : String(value);
  const [shown, setShown] = useState(str);
  const prev = useRef(str);
  const raf = useRef(0);
  const box = useRef(null);
  const run = (fromStr, toStr, dur) => {
    cancelAnimationFrame(raf.current);
    const a = parse(fromStr), b = parse(toStr);
    if (!a || !b || a.n === b.n || prefersReduced()) { setShown(toStr); return; }
    const t0 = performance.now();
    const step = t => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      if (k >= 1) { setShown(toStr); return; } // always land on the exact string
      setShown(fmt({ ...b, dec: b.dec }, a.n + (b.n - a.n) * e));
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };
  // Count up from zero the first time it is on screen (optional).
  useIso(() => {
    if (!fromZero || prefersReduced() || typeof IntersectionObserver === 'undefined') return;
    const el = box.current, b = parse(str);
    if (!el || !b || b.n === 0) return;
    const zero = fmt(b, 0);
    const go = () => run(zero, prev.current, duration + 300);
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) { setShown(zero); go(); return; }
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); setShown(zero); go(); } }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (prev.current === str) return;
    const from = shown;
    prev.current = str;
    run(from, str, duration);
  }, [str]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return (
    <span ref={box} style={{ display: 'inline-grid', fontVariantNumeric: 'tabular-nums' }}>
      <span aria-hidden="true" style={{ gridArea: '1 / 1', visibility: 'hidden' }}>{str}</span>
      <span style={{ gridArea: '1 / 1', justifySelf: align }}>{shown}</span>
    </span>
  );
}

// Pointer position for the .fx-spot spotlight.
export const spot = e => {
  const el = e.currentTarget, r = el.getBoundingClientRect();
  el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
  el.style.setProperty('--my', (e.clientY - r.top) + 'px');
};
