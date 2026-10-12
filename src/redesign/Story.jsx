// "How InPhox fits into your workflow": a scroll-driven 3D story in seven
// steps. One sticky stage holds a WebGL canvas (world.js) plus HTML overlays
// that read the same progress value P (0..7).
import { useEffect, useMemo, useRef, useState } from 'react';
import './story/story.css';
import { createWorld, DEVICES, seg, clamp } from './story/world.js';
import { LOCATIONS } from './story/earth.js';
import { LANES } from './story/textures.js';

const SCENES = [
  { name: 'Arrive', title: 'A lot lands on the line.', body: 'Three hundred phones in totes, from a trade-in run, a wholesale lot or a stack of returns. One gets picked. Nothing is known about it yet.' },
  { name: 'Connect', title: 'Plug it in. The phone tells InPhox the rest.', body: 'No typing. Within seconds of the cable going in, the record fills itself from the device: identity, storage, carrier, locks, battery and parts history.' },
  { name: 'Diagnose', title: 'Twelve at a time. Every result on the card.', body: 'Tests, erasure and grading run side by side. Each device gets a card, and each card prints the label that goes on the device. Hover one.' },
  { name: 'Route', title: 'Every device knows where it goes next.', body: 'Results decide the lane: repair, a second look at QC, storage, the sales floor or an open order. Nobody has to ask the whiteboard.' },
  { name: 'Repair & ship', title: 'Fixed part by part. Packed against the order.', body: 'Repairs are logged to the device, part by part, then retested. Shipments are picked by scan, packed, labelled and sent on their way.' },
  { name: 'Locations', title: 'Every unit, every location, one map.', body: 'Stores, warehouses, kiosks, partners and buyers, with live counts at each pin. Drag the globe to look around.' },
  { name: 'Offers', title: 'Negotiate on the floor. Close by scan.', body: 'Buyers bid, InPhox counters only above your floor, and the deal is verified unit by unit with the scanner before it ships.' }
];
// Scroll does not scrub the animation. Each scroll band triggers one beat,
// and a beat always plays to its end on its own clock. Scrolling back shows
// the end state of the earlier beat.
// [fromP, toP, seconds, band height (in viewport heights)]
const BEATS = [
  [0.00, 0.34, 2.2, 0.9],  // 01 the lot rolls in on the line
  [0.34, 1.00, 3.4, 0.9],  // 01 the hand picks one and lays it on the bench
  [1.00, 2.00, 3.2, 1.5],  // 02 plug in, the record fills itself
  [2.00, 3.00, 6.0, 1.2],  // 03 into the stand, twelve test at once
  [3.00, 4.12, 5.2, 1.0],  // 04 cards flip, take their lanes, camera to repair
  [4.12, 4.40, 4.2, 1.0],  // 05 the repair
  [4.40, 4.79, 4.8, 1.0],  // 05 pick, pack, close, label
  [4.79, 5.00, 3.6, 1.0],  // 05 down the line into the freighter
  [5.00, 5.06, 2.2, 1.0],  // 06 cut to the runway: the freighter waits
  [5.06, 5.60, 5.4, 1.0],  // 06 take-off, then the globe
  [6.00, 7.00, 9.0, 1.2]   // 07 offers, then verification
];
const SCENE_OF_BEAT = [0, 0, 1, 2, 3, 4, 4, 4, 5, 5, 6];
const AIR_END = 5.42;
const smooth = x => x * x * (3 - 2 * x);
const WHEELS_UP = { name: 'Locations', title: 'Wheels up.', body: 'The order is on its way to London. The label, the units and the invoice travel together, and every location knows what it holds.' };
const LEAD = 0.6; // idle band before the first beat (viewport heights)
const BAND = [LEAD, ...BEATS.map(b => b[3])];
const BAND_CUM = BAND.reduce((a, w, i) => (a.push(a[i] + w), a), [0]);
const BAND_TOTAL = BAND_CUM[BAND_CUM.length - 1];
const UNIT_VH = 100;
const SCENE_FIRST_BEAT = [0, 2, 3, 4, 5, 8, 10];
const bandAt = f => { const x = f * BAND_TOTAL; let i = 0; while (i < BAND.length - 1 && x >= BAND_CUM[i + 1]) i++; return i - 1; }; // -1 = idle
const bandMid = beat => (BAND_CUM[beat + 1] + BAND[beat + 1] * 0.5) / BAND_TOTAL;

export default function Story() {
  const rootRef = useRef(null), stageRef = useRef(null), canvasRef = useRef(null), worldRef = useRef(null);
  const anchorEls = useRef({}), flashRef = useRef(null);
  const [P, setP] = useState(0);
  const [ready, setReady] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const Pref = useRef(0), target = useRef(-1), clock = useRef(0), waitingRef = useRef(false), jumpRef = useRef(null), skipRef = useRef(null);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    let world;
    try { world = createWorld(canvasRef.current, { onEarthReady: () => {} }); }
    catch (e) { console.error('story: 3D unavailable', e && e.message, e && e.stack); setWebgl(false); return; }
    worldRef.current = world;
    if (import.meta.env.DEV) window.__world = world;
    const resize = () => { const r = stageRef.current.getBoundingClientRect(); world.setSize(r.width, r.height, window.devicePixelRatio || 1); };
    resize(); window.addEventListener('resize', resize);
    let raf, last = performance.now(), visible = true, shownP = -1, waitingShown = false, shownFlash = -1, readyShown = false;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '200px' });
    io.observe(rootRef.current);
    let done = -1, playing = null; // index of last finished beat, current beat
    const readScroll = () => {
      const r = rootRef.current.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      target.current = bandAt(clamp(-r.top / total, 0, 0.99999));
    };
    // test hook: jump straight to a story position (used by screenshots)
    if (import.meta.env.DEV) window.__storyGo = P => { Pref.current = P; done = BEATS.findIndex(b => b[1] >= P - 1e-6); playing = null; const r = rootRef.current.getBoundingClientRect(); window.scrollTo(0, window.scrollY + r.top + bandMid(done) * (r.height - window.innerHeight)); };
    const loop = now => {
      raf = requestAnimationFrame(loop);
      const dt = Math.max(0, Math.min(0.1, (now - last) / 1000)); last = now;
      if (!visible) return;
      readScroll();
      clock.current += dt;
      let want = target.current;
      // momentum carried in from above must not skip beats: hold at the next one
      if (want > done + 1 && !playing && !jumpRef.current) {
        const r = rootRef.current.getBoundingClientRect();
        if (r.top <= stageRef.current.getBoundingClientRect().top + 2) {
          const total = r.height - window.innerHeight;
          window.scrollTo({ top: Math.round(window.scrollY + r.top + bandMid(done + 1) * total), behavior: 'instant' });
          want = done + 1;
        }
      }
      if (jumpRef.current) {
        if (want === jumpRef.current.to) jumpRef.current = null;
        else want = playing ? playing.i : done; // rail jump in flight: wait for arrival
      }
      if (want < done && !playing) { done = want; Pref.current = want >= 0 ? BEATS[want][1] : 0; }
      if (playing && want < playing.i) { playing = null; done = want; Pref.current = want >= 0 ? BEATS[want][1] : 0; }
      if (!playing && want > done) {
        if (want - done > 1) done = want - 1;   // jumped ahead: skip to the beat before
        const i = done + 1, [from] = BEATS[i];
        playing = { i, t: 0, speed: 1 };
        Pref.current = from;
      }
      if (playing) {
        const [from, to, dur] = BEATS[playing.i];
        playing.t += dt * playing.speed / dur;
        Pref.current = from + (to - from) * Math.min(1, playing.t);
        if (playing.t >= 1) { done = playing.i; playing = null; }
      }
      waitingRef.current = !playing && done === want && done < BEATS.length - 1;
      if (import.meta.env.DEV) window.__storyState = { done, playing: playing && playing.i, want, P: Pref.current };
      const out = import.meta.env.DEV && window.__noRender ? {} : world.update(Pref.current, clock.current);
      for (const id in anchorEls.current) {
        const el = anchorEls.current[id]; if (!el) continue;
        const a = out[id];
        if (a && a.v) { el.style.transform = `translate(${a.x}px, ${a.y}px)`; el.style.opacity = a.f !== undefined ? clamp((a.f - 0.12) * 5) : 1; el.style.visibility = 'visible'; }
        else el.style.visibility = 'hidden';
      }
      // The dip into the globe is set here, every frame, from the unrounded P
      // (driving it from React state stepped it ~7 times a second).
      if (flashRef.current) {
        const p = Pref.current;
        const fo = p > 5.34 && p < 5.5 ? (p < AIR_END ? smooth(seg(p, 5.34, AIR_END)) : 1 - smooth(seg(p, AIR_END, 5.5))) : 0;
        if (fo !== shownFlash) { shownFlash = fo; flashRef.current.style.opacity = fo.toFixed(4); }
      }
      const q = Math.round(Pref.current * 250) / 250;
      if (q !== shownP) { shownP = q; setP(q); }
      if (waitingRef.current !== waitingShown) { waitingShown = waitingRef.current; setWaiting(waitingShown); }
      if (!readyShown) { readyShown = true; setReady(true); }
    };
    raf = requestAnimationFrame(loop);

    // ---- gesture stepping -------------------------------------------------
    // While the stage is pinned, native scrolling is held. A scroll gesture
    // (wheel / trackpad incl. inertia, touch swipe, keys) is collected, and
    // once the user stops scrolling exactly one beat plays. Input during a
    // beat is ignored. Past the last beat (or above the first) scrolling is
    // released back to the page.
    const HEAD = () => parseFloat(getComputedStyle(stageRef.current).top) || 0; // sticky offset (header)
    const pinned = () => { const r = rootRef.current.getBoundingClientRect(); return r.top <= HEAD() + 2 && r.bottom >= window.innerHeight - 2; };
    const scrollToBeat = beat => {
      const r = rootRef.current.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      window.scrollTo({ top: Math.round(window.scrollY + r.top + bandMid(beat) * total), behavior: 'instant' });
    };
    const busy = () => !!playing;
    const finishBeat = () => { if (!playing) return; Pref.current = BEATS[playing.i][1]; done = playing.i; playing = null; };
    skipRef.current = finishBeat;
    const canExit = dir => (dir > 0 && done >= BEATS.length - 1 && !playing) || (dir < 0 && done < 0 && !playing);
    // One continuous gesture (incl. trackpad inertia) = one step. A gesture
    // ends after a short pause; input that lands while a beat is playing
    // uses up the whole gesture.
    let gestureDir = 0, gestureTimer = null, lastInput = 0, consumed = false;
    const commit = () => {
      gestureTimer = null;
      const dir = gestureDir; gestureDir = 0;
      if (!dir || busy()) return;
      if (dir > 0) {
        if (done >= BEATS.length - 1) return;
        const i = done + 1;
        playing = { i, t: 0, speed: 1 }; Pref.current = BEATS[i][0];   // start now, not next frame
        target.current = i; scrollToBeat(i);
      } else {
        done = done - 1; Pref.current = done >= 0 ? BEATS[done][1] : 0;
        target.current = done; scrollToBeat(done);
      }
      consumed = true;
    };
    const onIntent = (dir, e) => {
      if (!pinned()) return false;
      if (canExit(dir)) return false;           // let the page scroll on
      if (e && e.cancelable) e.preventDefault();
      const now = (e && e.timeStamp) || performance.now();
      if (now - lastInput > 240) consumed = false; // a pause: this is a new gesture
      lastInput = now;
      if (busy()) consumed = true;
      if (consumed) { gestureDir = 0; if (gestureTimer) { clearTimeout(gestureTimer); gestureTimer = null; } return true; }
      gestureDir = dir;
      if (gestureTimer) clearTimeout(gestureTimer);
      gestureTimer = setTimeout(commit, 160);    // fires once scrolling stops
      return true;
    };
    const onWheel = e => { if (Math.abs(e.deltaY) < 2) return; const r = onIntent(e.deltaY > 0 ? 1 : -1, e); };
    let ty = null;
    const onTouchStart = e => { ty = e.touches[0].clientY; };
    const onTouchMove = e => {
      if (ty === null) return;
      const dy = ty - e.touches[0].clientY;
      if (Math.abs(dy) < 8) return;
      onIntent(dy > 0 ? 1 : -1, e);
    };
    const onTouchEnd = () => { ty = null; lastInput = 0; };
    const onKey = e => {
      if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
      const down = ['ArrowDown', 'ArrowRight', 'PageDown', ' ', 'Spacebar'].includes(e.key), up = ['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key);
      if (!down && !up) return;
      if (down && busy() && pinned()) { e.preventDefault(); finishBeat(); return; } // skip the rest of this beat
      lastInput = 0; // every key press is its own gesture
      if (onIntent(down ? 1 : -1, e) && gestureTimer) { clearTimeout(gestureTimer); commit(); }
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKey);

    return () => {
      cancelAnimationFrame(raf); window.removeEventListener('resize', resize); io.disconnect(); world.dispose();
      window.removeEventListener('wheel', onWheel); window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove); window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKey); if (gestureTimer) clearTimeout(gestureTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const beatNow = Math.max(0, BEATS.findIndex(b => P <= b[1] + 1e-6));
  const scene = P <= 0 ? 0 : SCENE_OF_BEAT[beatNow];
  const inAir = P > 5.015 && P < AIR_END;
  const t = i => seg(P, i, i + 1);
  const jump = i => {
    const r = rootRef.current.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    jumpRef.current = { to: SCENE_FIRST_BEAT[i] };
    setTimeout(() => { jumpRef.current = null; }, 2500);
    window.scrollTo({ top: window.scrollY + r.top + bandMid(SCENE_FIRST_BEAT[i]) * total, behavior: 'smooth' });
  };
  const skip = () => { const r = rootRef.current.getBoundingClientRect(); window.scrollTo({ top: window.scrollY + r.bottom - 64, behavior: 'smooth' }); };

  // globe drag
  const dragRef = useRef(null);
  const onDown = e => {
    if (P < 5) return;
    dragRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    worldRef.current?.drag(0, 0, 'start', clock.current);
  };
  const onMove = e => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x, dy = e.clientY - dragRef.current.y;
    dragRef.current = { x: e.clientX, y: e.clientY };
    worldRef.current?.drag(dx, dy, 'move', clock.current);
  };
  const onUp = () => { if (!dragRef.current) return; dragRef.current = null; worldRef.current?.drag(0, 0, 'end', clock.current); };

  const sc = inAir ? WHEELS_UP : SCENES[scene];
  const reg = id => el => { anchorEls.current[id] = el; };
  const fade = (i, a = 0.06, b = 0.94) => { const x = t(i); return P >= i && P < i + 1 ? Math.min(seg(x, 0, a), 1 - seg(x, b, 1)) : 0; };

  return (
    <section className="sx-root" ref={rootRef} style={{ height: `calc(${BAND_TOTAL * UNIT_VH}vh + 100vh)` }}>
      <div className="sx-stage" ref={stageRef}>
        <canvas ref={canvasRef} className="sx-canvas" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} style={{ cursor: P >= 5 ? (dragRef.current ? 'grabbing' : 'grab') : 'default', touchAction: P >= 5 ? 'pan-y' : 'auto' }} />
        {!webgl ? <div className="sx-nogl">3D preview needs WebGL. The steps below still read top to bottom.</div> : null}
        <div className="sx-vignette" />
        {/* warehouse -> runway is a WebGL crossfade (world.js); this only dips into the globe */}
        <div className="sx-flash" ref={flashRef} />

        <header className="sx-head">
          <div className="sx-kicker"><span>01</span> How InPhox fits into your workflow</div>
          <nav className="sx-rail" aria-label="Story steps">
            {SCENES.map((s, i) => (
              <button key={s.name} onClick={() => jump(i)} className={i === scene ? 'on' : i < scene ? 'past' : ''}>
                <span className="n">0{i + 1}</span><span className="l">{s.name}</span>
                <span className="bar"><span style={{ transform: `scaleX(${i < scene ? 1 : i === scene ? t(i) : 0})` }} /></span>
              </button>
            ))}
          </nav>
        </header>

        <div className="sx-copy" key={scene}>
          <span className="sx-num">0{scene + 1} / 07</span>
          <h3>{sc.title}</h3>
          <p>{sc.body}</p>
          {scene === 5 && !inAir ? <LocationList onPick={id => worldRef.current?.focusLocation(id, clock.current)} /> : null}
        </div>

        {/* scene 1 */}
        <div className="sx-anchor" ref={reg('lot')}><div className="sx-tag">Lot L-0418 · 312 units · <b>{Math.min(312, Math.round(seg(P, 0, 0.3) * 312))}</b> on the line</div></div>
        <div className="sx-pill" style={{ opacity: fade(0, 0.5, 0.97) * (P > 0.55 ? 1 : 0) }}>Bench 2 · 1 device · not yet identified</div>

        {/* scene 2 */}
        <DeviceRecord t={t(1)} show={P > 1.05 && P < 2.04} />

        {/* scene 3 */}
        <MacStation t={t(2)} show={P > 2.04 && P < 3.08} />

        {/* scene 4 */}
        {LANES.map((l, i) => (
          <div key={l.key} className="sx-anchor" ref={reg('lane_' + l.key)}>
            <div className="sx-lane" style={{ '--c': l.col }}><b>{DEVICES.filter(d => d.lane === l.key).length}</b> {l.name.toLowerCase()}</div>
          </div>
        ))}

        {/* scene 5 */}
        <div className="sx-anchor" ref={reg('repair')}>
          <div className="sx-callout">
            <div className="h">Repair · Bench R-2 · iPhone 13</div>
            <div className={'r' + (t(4) > 0.32 ? ' done' : '')}><span>Battery 71% · 1,204 cycles</span><span>{t(4) > 0.32 ? 'Replaced' : t(4) > 0.16 ? 'Replacing…' : 'Queued'}</span></div>
            <div className={'r' + (t(4) > 0.38 ? ' done' : '')}><span>Retest</span><span>{t(4) > 0.38 ? '42 / 42' : 'Queued'}</span></div>
            <div className="f">Part cost logged to the device · back to stock</div>
          </div>
        </div>
        <ShipCard P={P} />
        <div className="sx-pill" style={{ opacity: P > 4.36 && P < 4.66 ? 1 : 0 }}>Picking SO-10422 · scan each IMEI into the box</div>

        {/* scenes 6-7: globe labels */}
        {LOCATIONS.map(l => (
          <div key={l.id} className="sx-anchor" ref={reg('loc_' + l.id)}>
            <div className={'sx-pin' + (l.hq ? ' hq' : '') + (l.transit ? ' tr' : '')} style={{ opacity: P >= 6.05 ? 0 : 1 }}>
              <span className="nm">{l.name}</span>
              <span className="ct">{l.transit ? `${l.stock} inbound` : `${l.stock.toLocaleString()} units`}</span>
            </div>
          </div>
        ))}
        <div className="sx-hint" style={{ opacity: P > 5.5 && P < 6 ? 1 : 0 }}>Drag to rotate · tap a location to fly there</div>

        {/* scene 7 */}
        <Offers t={t(6)} show={P > 6.02} />

        <footer className="sx-foot">
          <span className="sx-btns">
            <span className={'sx-next' + (waiting ? ' on' : '')}>{scene === 6 && !waiting ? 'End of the walkthrough' : waiting ? 'Scroll, swipe or press → for the next step' : 'Playing…'}</span>
            {!waiting && P > 0 && !(scene === 6 && P >= 6.999) ? <button onClick={() => skipRef.current && skipRef.current()}>Skip animation ⏭</button> : null}
          </span>
          <span className="sx-btns"><button onClick={skip}>Skip the walkthrough ↓</button></span>
        </footer>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- scene 2
const RECORD = [
  ['IMEI', '356798114520331', 'modem'],
  ['IMEI 2 (eSIM)', '356798114520349', 'modem'],
  ['Serial', 'F2LZK3XQ0D', 'device'],
  ['Model', 'iPhone 14 Pro · A2650', 'device'],
  ['Storage', '256 GB · 41 GB used', 'device'],
  ['Color', 'Deep Purple', 'device'],
  ['OS', 'iOS 18.6.2', 'device'],
  ['Carrier', 'Unlocked · no SIM', 'modem'],
  ['Find My', 'Off', 'locks'],
  ['MDM', 'Not enrolled', 'locks'],
  ['Battery', '91% health · 312 cycles', 'battery'],
  ['Parts', 'Screen · battery · camera genuine', 'parts']
];
// Docked shipment card: appears once the box is packed and stays put while
// the box rides into the hold and the plane takes off, so it can be read.
function ShipCard({ P }) {
  const steps = [
    ['8 of 8 scanned in', 'Packed', 4.62],
    ['Label printed · 3.4 kg', 'Printed', 4.7],
    ['Conveyor to dock 1', 'Moving', 4.79],
    ['Loaded · freighter IX-418', 'In hold', 4.98],
    ['Dallas → London', 'Wheels up', 5.12]
  ];
  return (
    <div className={'sx-shipcard' + (P > 4.6 && P < 5.36 ? ' show' : '')}>
      <div className="h"><span>SO-10422</span><span>Ortega Mobile Wholesale</span></div>
      {steps.map(([k, v, at], i) => {
        const on = P >= at, next = !on && (i === 0 || P >= steps[i - 1][2]);
        return <div key={k} className={'r' + (on ? ' done' : next ? ' next' : '')}><span>{k}</span><span>{on ? v : next ? '…' : '—'}</span></div>;
      })}
      <div className="f">Ship to London, UK · invoice INV-2214 attached</div>
    </div>
  );
}

function DeviceRecord({ t, show }) {
  const n = Math.round(seg(t, 0.3, 0.55) * RECORD.length);
  return (
    <div className={'sx-record' + (show ? ' show' : '')}>
      <div className="paper">
        <span className="margin" />
        <div className="ph"><span>DEVICE RECORD · BENCH 2</span><span>{n < RECORD.length ? 'reading…' : 'complete'}</span></div>
        {RECORD.map((r, i) => (
          <div key={r[0]} className={'row' + (i < n ? ' in' : '')}>
            <span className="k">{r[0]}</span>
            <span className="v">{i < n ? r[1] : <i className="sk" style={{ width: 40 + ((i * 37) % 50) + '%' }} />}</span>
            <span className="src">{i < n ? '← ' + r[2] : ''}</span>
          </div>
        ))}
        <div className="pf">
          <span className={n >= RECORD.length ? 'ok' : ''}>{n >= RECORD.length ? 'Identified · ready to test' : `${n} of ${RECORD.length} fields read`}</span>
          <span>0 typed by hand</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- scene 3
function Barcode({ seed, h = 26 }) {
  const bars = useMemo(() => { let s = seed, x = 0; const out = []; while (x < 180) { s = (s * 9301 + 49297) % 233280; const w = 1 + Math.floor((s / 233280) * 3); if (s % 3) out.push([x, w]); x += w + 1; } return out; }, [seed]);
  return <svg className="bc" viewBox={`0 0 180 ${h}`} preserveAspectRatio="none">{bars.map(([x, w], i) => <rect key={i} x={x} y="0" width={w} height={h} />)}</svg>;
}
function MacStation({ t, show }) {
  const [hover, setHover] = useState(-1);
  const csv = Math.round(seg(t, 0.55, 0.95) * 12);
  return (
    <div className={'sx-mac' + (show ? ' show' : '')}>
      <div className="mbp">
        <div className="lid">
          <div className="notch" />
          <div className="scr">
            <div className="bar"><span className="dots"><i /><i /><i /></span><b>Station B-04</b><span>Diagnose · 12 connected</span><span className="sp" /><span className="cnt">{DEVICES.filter((d, i) => t - 0.22 - i * 0.008 > 0.44).length} / 12 done</span></div>
            <div className="grid">
              {DEVICES.map((d, i) => {
                const st = t - 0.22 - i * 0.008;
                const phase = st > 0.44 ? 'done' : st > 0.06 ? 'test' : st > -0.2 ? 'read' : 'wait';
                const pct = Math.round(clamp((st - 0.06) / 0.38) * 42);
                return (
                  <div key={i} className={'card ' + phase + ' k-' + d.kind + (hover === i ? ' hov' : '')} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(-1)}>
                    <div className="ch"><span className="m">{phase === 'wait' ? <i className="sk" style={{ width: '70%' }} /> : d.model}</span><span className="port">P{String(i + 1).padStart(2, '0')}</span></div>
                    <div className="pills">{phase === 'wait' ? <i className="sk" style={{ width: '80%' }} /> : <><em className="g">{phase === 'done' ? 'Grade ' + d.grade : 'Grading'}</em><em>{d.storage}</em><em>{d.carrier}</em></>}</div>
                    <div className="imei">{phase === 'wait' ? <i className="sk" style={{ width: '90%' }} /> : d.imei}</div>
                    <div className="prog"><span style={{ width: (phase === 'done' ? 100 : phase === 'test' ? (pct / 42) * 100 : 0) + '%' }} /></div>
                    <div className="res">{phase === 'done' ? d.result : phase === 'test' ? `Testing ${pct}/42` : phase === 'read' ? 'Reading device…' : 'Waiting'}</div>
                    <div className="er">{phase === 'done' ? (d.kind === 'lock' ? 'Erase blocked · lock on' : 'Erased · certificate ready') : ' '}</div>
                    {hover === i && phase === 'done' ? (
                      <div className="label">
                        <div className="lt"><b>{d.model}</b><span className="gr">{d.grade}</span></div>
                        <div className="ls">{d.storage} · {d.color} · {d.carrier}</div>
                        <Barcode seed={parseInt(d.imei.slice(-6), 10)} />
                        <div className="lm">IMEI {d.imei}</div>
                        <div className="lb"><span>{d.kind === 'pass' ? 'Tested 42/42 · Erased' : d.result}</span><img src="assets/inphox-logo.png" alt="" /></div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="base"><span /></div>
      </div>
      <div className="csv" aria-hidden="true">
        <div className="ch">export_station_B04.csv</div>
        <div className="r hd">imei,model,grade,result</div>
        {DEVICES.slice(0, csv).map((d, i) => <div key={i} className="r">{d.imei},{d.model.replace(' ', '')},{d.grade},{d.kind}</div>)}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- scene 6
function LocationList({ onPick }) {
  return (
    <div className="sx-locs">
      {LOCATIONS.slice(0, 8).map(l => (
        <button key={l.id} onClick={() => onPick(l.id)}>
          <span className={'dot' + (l.hq ? ' hq' : '') + (l.transit ? ' tr' : '')} /><span className="nm">{l.name}</span><span className="ct">{l.transit ? l.stock + ' inbound' : l.stock.toLocaleString()}</span>
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- scene 7
const ROUNDS = [
  { b: 310, s: 368, who: 'auto-counter' },
  { b: 330, s: 355, who: 'Sam P.' },
  { b: 340, s: 346, who: 'auto-counter' }
];
function Offers({ t, show }) {
  const step = Math.floor(seg(t, 0.04, 0.44) * 7); // 0..7
  const round = Math.min(2, Math.floor(step / 2));
  const accepted = step >= 6;
  const bHist = ROUNDS.slice(0, Math.min(3, Math.floor((step + 1) / 2) + (step >= 1 ? 0 : 0))).map(r => r.b);
  const sHist = ROUNDS.slice(0, Math.floor(step / 2)).map(r => r.s);
  const bNow = accepted ? 346 : bHist[bHist.length - 1];
  const sNow = sHist[sHist.length - 1];
  const scan = seg(t, 0.5, 0.92), scanned = Math.round(scan * 12);
  const pos = v => ((v - 300) / 80) * 100;
  return (
    <div className={'sx-offers' + (show ? ' show' : '')}>
      <div className="lot">
        <div className="lh"><b>Lot · 12 × iPhone 14 Pro 128 GB · Grade A</b><span>Market avg $352 · last sold $349 · your floor <em>$340</em></span></div>
        <div className="meter">
          <div className="track" />
          <div className="floor" style={{ left: pos(340) + '%' }}><span>floor</span></div>
          {bNow ? <div className="mk b" style={{ left: pos(bNow) + '%' }}><span>${bNow}</span></div> : null}
          {sNow && !accepted ? <div className="mk s" style={{ left: pos(sNow) + '%' }}><span>${sNow}</span></div> : null}
          <div className={'gap' + (accepted ? ' ok' : '')}>{accepted ? 'agreed at $346' : bNow && sNow ? `gap $${sNow - bNow}` : 'waiting'}</div>
        </div>
      </div>
      <div className="pov">
        <Phone side="buyer" title="Ortega Mobile Wholesale" sub="Buyer · London">
          <div className="ask">Asking <s>$372</s></div>
          {ROUNDS.flatMap((r, i) => [
            <div key={'o' + i} className={'msg out' + (step >= i * 2 ? ' in' : '') + (step >= i * 2 + 2 || accepted ? ' old' : '')}>
              <span className="lbl">Your offer</span><span className="px">${r.b}</span>
            </div>,
            <div key={'c' + i} className={'msg inc' + (step >= i * 2 + 1 ? ' in' : '') + (step >= i * 2 + 3 || (accepted && i < 2) ? ' old' : '')}>
              <span className="lbl">Counter</span><span className="px">${r.s}</span>
            </div>
          ])}
          <button className={'cta' + (accepted ? ' ok' : '')}>{accepted ? '✓ Accepted · $346 × 12' : 'Accept $' + (sNow || 372)}</button>
        </Phone>
        <div className="vs">{accepted ? <span className="ok">Deal</span> : <span>Round {round + 1} of 3</span>}</div>
        <Phone side="seller" title="Offers · Northgate Wireless" sub="You · Dallas">
          {ROUNDS.flatMap((r, i) => [
            <div key={'b' + i} className={'row' + (step >= i * 2 ? ' in' : '')}>
              <span>Bid</span>
              <span className={'px' + (step >= i * 2 + 2 || accepted ? ' cut' : '')}>${r.b}</span>
              <span className={'tag' + (r.b < 340 ? ' low' : ' okk')}>{r.b < 340 ? 'below floor' : 'at floor'}</span>
            </div>,
            <div key={'s' + i} className={'row me' + (step >= i * 2 + 1 ? ' in' : '')}>
              <span>{r.who}</span>
              <span className={'px' + (step >= i * 2 + 3 || (accepted && i < 2) ? ' cut' : '')}>${r.s}</span>
              <span className="tag">counter</span>
            </div>
          ])}
          <div className={'won' + (accepted ? ' in' : '')}>Settled $346 / unit · $4,152 · invoice drafted</div>
        </Phone>
      </div>
      <div className={'verify' + (scan > 0 ? ' in' : '')}>
        <div className="cam">
          <div className="vf"><span className="c tl" /><span className="c tr" /><span className="c bl" /><span className="c br" />
            <div className="lbl"><Barcode seed={881 + scanned} h={30} /><span>{DEVICES[Math.min(11, scanned)].imei}</span></div>
            <span className="laser" />
          </div>
        </div>
        <div className="list">
          <div className="lh2"><b>Verify by scan</b><span>{scanned} / 12 match the offer</span></div>
          {DEVICES.slice(0, 12).map((d, i) => (
            <div key={i} className={'it' + (i < scanned ? ' ok' : i === scanned ? ' cur' : '')}><span>{d.imei.slice(0, 8)}·{d.imei.slice(8)}</span><span>{i < scanned ? '✓' : i === scanned ? 'scanning' : ''}</span></div>
          ))}
          <div className={'inv' + (scanned >= 12 ? ' in' : '')}>INV-2214 · $4,152.00 · ready to ship</div>
        </div>
      </div>
    </div>
  );
}
function Phone({ side, title, sub, children }) {
  return (
    <div className={'sx-phone ' + side}>
      <div className="island" />
      <div className="sh"><b>{title}</b><span>{sub}</span></div>
      <div className="sb">{children}</div>
    </div>
  );
}
