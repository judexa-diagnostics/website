import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import './afterSale.css';

// Security-camera view of an over-the-counter phone buy: walk in, intake scan,
// haggle, cash paid out, devices carried to the back for testing. Fills its
// parent (give the parent a size; 4:3 on desktop, 1:1 on phones works best).
const STILL_T = 24.1; // reduced motion: offer accepted, cash about to be counted

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) {
    return false;
  }
}

export default function AfterSaleScene() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const [state, setState] = useState('idle'); // idle | loading | ready | failed
  const [near, setNear] = useState(false);
  const [vis, setVis] = useState(false);
  const engineRef = useRef(null);

  // load when near the viewport; animate only while on screen
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === 'undefined') { setNear(true); setVis(true); return undefined; }
    const ioNear = new IntersectionObserver(([e]) => { if (e.isIntersecting) setNear(true); }, { rootMargin: '600px 0px' });
    const ioVis = new IntersectionObserver(([e]) => setVis(e.isIntersecting), { threshold: 0.05 });
    ioNear.observe(el); ioVis.observe(el);
    return () => { ioNear.disconnect(); ioVis.disconnect(); };
  }, []);

  useEffect(() => {
    if (!near || engineRef.current || !ref.current) return undefined;
    if (!hasWebGL()) { setState('failed'); return undefined; }
    let cancelled = false;
    setState('loading');
    const host = ref.current.querySelector('.as-stage');
    import('./afterSale/engine.js')
      .then(({ createAfterSale }) => createAfterSale(host, { base: import.meta.env.DEV && window.__afterBase ? window.__afterBase : import.meta.env.BASE_URL }))
      .then((eng) => {
        if (cancelled) { eng.dispose(); return; }
        engineRef.current = eng;
        setState('ready');
      })
      .catch((err) => {
        if (import.meta.env.DEV) console.error('AfterSaleScene', err);
        if (!cancelled) setState('failed');
      });
    return () => { cancelled = true; };
  }, [near]);

  // dispose on unmount
  useEffect(() => () => { if (engineRef.current) { engineRef.current.dispose(); engineRef.current = null; } }, []);

  // clock
  useEffect(() => {
    const eng = engineRef.current;
    if (state !== 'ready' || !eng) return undefined;
    const LOOP = 50;
    let offset = 0;
    const t0 = performance.now();
    const now = () => ((performance.now() - t0) / 1000 + offset) % LOOP;
    if (import.meta.env.DEV) window.__afterGo = (s) => { if (window.__afterFreeze) window.__afterFrozen = s; offset += s - now(); if (offset < 0) offset += LOOP; eng.render(((s % LOOP) + LOOP) % LOOP); };
    if (reduce) {
      eng.render(STILL_T);
      if (typeof ResizeObserver === 'undefined') return undefined;
      const ro = new ResizeObserver(() => eng.render(STILL_T));
      ro.observe(ref.current);
      return () => ro.disconnect();
    }
    if (!vis) return undefined;
    let raf = 0;
    const tick = () => { eng.render(import.meta.env.DEV && window.__afterFrozen != null ? window.__afterFrozen : now()); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    const onVisChange = () => { if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(tick); };
    document.addEventListener('visibilitychange', onVisChange);
    return () => { cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', onVisChange); };
  }, [state, vis, reduce]);

  return (
    <div
      ref={ref}
      className={'as-wrap as-' + state}
      role="img"
      aria-label="Security camera view of a shop counter: a customer brings in three phones, the clerk scans them, they agree on $490, the clerk pays in cash, and carries the phones to the back for testing."
    >
      <div className="as-stage" />
      {state !== 'ready' && (
        <div className="as-fallback" aria-hidden="true">
          <div className="as-fb-top"><span className="as-rec"><i />REC</span><span>CAM 02 · FRONT COUNTER</span></div>
          <div className="as-fb-mid">{state === 'failed' ? 'Counter · buy · paid' : 'Connecting camera…'}</div>
        </div>
      )}
    </div>
  );
}
