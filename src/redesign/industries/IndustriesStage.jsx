import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './industriesStage.css';

// One WebGL stage for the Industries page, a tab per kind of business.
// Each tab is a scene module in ./scenes/<key>.js with this contract:
//
//   export default async function create(ctx) -> {
//     scene, camera,                 // THREE.Scene / THREE.PerspectiveCamera
//     duration,                      // seconds in one loop of the story
//     captions: [{ at, title, body }],// at = seconds into the loop
//     update(dt, t),                 // t = seconds into the loop (0..duration)
//     resize(w, h),                  // optional; the shell sets camera.aspect itself
//     pointer(e),                    // optional; { type, x, y } in -1..1, for hover/drag
//     dispose()                      // free geometries, materials, textures
//   }
//   ctx = { THREE, renderer, width, height, asset(path), loadGLTF(path), isSmall }
//
// The shell owns the renderer, the loop (only while on screen), the tabs,
// the caption ticker and the crossfade between tabs.
export const INDUSTRIES = [
  { key: 'itad', name: 'Refurbishers & ITAD' },
  { key: 'repair', name: 'Independent repair shops' },
  { key: 'shop', name: 'Buy, sell & trade-in shops' },
  { key: 'network', name: 'Multi-location retail' },
  { key: 'solo', name: 'Individual operators & online sellers' }
];

const loaders = {
  itad: () => import('./scenes/itad.js'),
  repair: () => import('./scenes/repair.js'),
  shop: () => import('./scenes/shop.js'),
  network: () => import('./scenes/network.js'),
  solo: () => import('./scenes/solo.js')
};

let gltfLoader = null;
async function loadGLTF(path) {
  if (!gltfLoader) {
    const [{ GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
      import('three/examples/jsm/loaders/GLTFLoader.js'),
      import('three/examples/jsm/libs/meshopt_decoder.module.js')
    ]);
    gltfLoader = new GLTFLoader();
    gltfLoader.setMeshoptDecoder(MeshoptDecoder);
  }
  return gltfLoader.loadAsync(path);
}

export default function IndustriesStage({ initial = 0, onChange }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const [idx, setIdx] = useState(initial);
  const [cap, setCap] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const live = useRef({ renderer: null, cur: null, visible: false, t: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    } catch (e) {
      setFailed(true);
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    live.current.renderer = renderer;

    const size = () => {
      const r = wrapRef.current.getBoundingClientRect();
      renderer.setSize(r.width, r.height, false);
      const c = live.current.cur;
      if (c) { c.camera.aspect = r.width / r.height; c.camera.updateProjectionMatrix(); c.resize && c.resize(r.width, r.height); }
    };
    size();
    const ro = new ResizeObserver(size); ro.observe(wrapRef.current);
    const io = new IntersectionObserver(([en]) => { live.current.visible = en.isIntersecting; }, { threshold: 0.05 });
    io.observe(wrapRef.current);

    let raf = 0, last = performance.now(), capKey = '';
    const loop = now => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const c = live.current.cur;
      if (!c || !live.current.visible || document.hidden) return;
      live.current.t = (live.current.t + dt) % c.duration;
      const t = live.current.t;
      c.update(dt, t);
      renderer.render(c.scene, c.camera);
      let k = null;
      for (const cp of c.captions || []) if (t >= cp.at) k = cp;
      const key = k ? k.title : '';
      if (key !== capKey) { capKey = key; setCap(k); }
      setProgress(t / c.duration);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      live.current.cur && live.current.cur.dispose();
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (failed) return undefined;
    let cancelled = false;
    const L = live.current;
    setLoading(true);
    const key = INDUSTRIES[idx].key;
    (async () => {
      while (!L.renderer) await new Promise(r => setTimeout(r, 30));
      const r = wrapRef.current.getBoundingClientRect();
      const mod = await loaders[key]();
      const next = await mod.default({
        THREE, renderer: L.renderer, width: r.width, height: r.height,
        asset: p => p, loadGLTF, isSmall: r.width < 700
      });
      if (cancelled) { next.dispose(); return; }
      next.camera.aspect = r.width / r.height; next.camera.updateProjectionMatrix();
      L.renderer.compile(next.scene, next.camera);
      const prev = L.cur; L.cur = next; L.t = L.pendingT != null ? L.pendingT % next.duration : 0; L.pendingT = null; L.loadedIdx = idx;
      prev && prev.dispose();
      setLoading(false);
    })().catch(err => { console.error('[industries] scene failed', key, err); if (!cancelled) setFailed(true); });
    onChange && onChange(idx);
    return () => { cancelled = true; };
  }, [idx, failed]);

  useEffect(() => {
    // Dev hook: jump to tab i at t seconds. The time is applied once that
    // scene is live (immediately if it already is).
    if (import.meta.env.DEV) window.__indGo = (i, t) => {
      const L = live.current;
      if (L.cur && L.loadedIdx === i) { if (t != null) L.t = t % L.cur.duration; }
      else { L.pendingT = t; }
      setIdx(i);
    };
  }, []);

  const pointer = type => e => {
    const c = live.current.cur; if (!c || !c.pointer) return;
    const r = wrapRef.current.getBoundingClientRect();
    c.pointer({ type, x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -(((e.clientY - r.top) / r.height) * 2 - 1), raw: e });
  };

  return (
    <div className="ix-root">
      <div className="ix-tabs" role="tablist" aria-label="Industries">
        {INDUSTRIES.map((ind, i) => (
          <button key={ind.key} role="tab" aria-selected={i === idx} className={'ix-tab' + (i === idx ? ' on' : '')} onClick={() => setIdx(i)}>
            <span className="n">{'0' + (i + 1)}</span><span className="t">{ind.name}</span>
          </button>
        ))}
      </div>
      <div className="ix-stage" ref={wrapRef}
        onPointerMove={pointer('move')} onPointerDown={pointer('down')} onPointerUp={pointer('up')} onPointerLeave={pointer('leave')}>
        <canvas ref={canvasRef} className={'ix-canvas' + (loading ? ' dim' : '')} />
        {failed ? <div className="ix-fallback">3D needs WebGL. The workflow for each business is listed below.</div> : null}
        {loading && !failed ? <div className="ix-loading"><span />Loading the floor…</div> : null}
        {cap && !loading ? (
          <div className="ix-cap" key={cap.title}>
            <div className="h">{cap.title}</div>
            {cap.body ? <div className="b">{cap.body}</div> : null}
          </div>
        ) : null}
        <div className="ix-bar"><i style={{ transform: `scaleX(${progress})` }} /></div>
      </div>
    </div>
  );
}
