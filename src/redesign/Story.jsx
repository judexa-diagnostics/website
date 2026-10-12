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
const WEIGHTS = [1, 1, 1, 1, 1.6, 1.3, 1.3];
const CUM = WEIGHTS.reduce((a, w, i) => (a.push(a[i] + w), a), [0]);
const TOTAL = CUM[CUM.length - 1];
const UNIT_VH = 150;
const fracToP = f => { const x = f * TOTAL; let i = 0; while (i < 6 && x > CUM[i + 1]) i++; return i + clamp((x - CUM[i]) / WEIGHTS[i]); };
const pToFrac = P => { const i = Math.min(6, Math.floor(P)); return (CUM[i] + (P - i) * WEIGHTS[i]) / TOTAL; };

export default function Story() {
  const rootRef = useRef(null), stageRef = useRef(null), canvasRef = useRef(null), worldRef = useRef(null);
  const anchorEls = useRef({});
  const [P, setP] = useState(0);
  const [ready, setReady] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const Pref = useRef(0), target = useRef(0), clock = useRef(0);

  useEffect(() => {
    let world;
    try { world = createWorld(canvasRef.current, { onEarthReady: () => {} }); }
    catch (e) { console.error('story: 3D unavailable', e && e.message, e && e.stack); setWebgl(false); return; }
    worldRef.current = world;
    if (import.meta.env.DEV) window.__world = world;
    const resize = () => { const r = stageRef.current.getBoundingClientRect(); world.setSize(r.width, r.height, window.devicePixelRatio || 1); };
    resize(); window.addEventListener('resize', resize);
    let raf, last = performance.now(), visible = true, shownP = -1;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '200px' });
    io.observe(rootRef.current);
    const readScroll = () => {
      const r = rootRef.current.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      target.current = fracToP(clamp(-r.top / total));
    };
    const loop = now => {
      raf = requestAnimationFrame(loop);
    // test hook: jump straight to a story position (used by screenshots)
    if (import.meta.env.DEV) window.__storyGo = P => { const r = rootRef.current.getBoundingClientRect(); window.scrollTo(0, window.scrollY + r.top + pToFrac(P) * (r.height - window.innerHeight)); Pref.current = P; };
      const dt = Math.max(0, Math.min(0.1, (now - last) / 1000)); last = now;
      if (!visible) return;
      readScroll();
      clock.current += dt;
      const k = 1 - Math.exp(-dt * 7);
      Pref.current += (target.current - Pref.current) * k;
      if (Math.abs(target.current - Pref.current) < 0.0004) Pref.current = target.current;
      const out = world.update(Pref.current, clock.current);
      for (const id in anchorEls.current) {
        const el = anchorEls.current[id]; if (!el) continue;
        const a = out[id];
        if (a && a.v) { el.style.transform = `translate(${a.x}px, ${a.y}px)`; el.style.opacity = a.f !== undefined ? clamp((a.f - 0.12) * 5) : 1; el.style.visibility = 'visible'; }
        else el.style.visibility = 'hidden';
      }
      const q = Math.round(Pref.current * 250) / 250;
      if (q !== shownP) { shownP = q; setP(q); }
      if (!ready) setReady(true);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); io.disconnect(); world.dispose(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scene = Math.min(6, Math.floor(P + 0.0001));
  const t = i => seg(P, i, i + 1);
  const jump = i => {
    const r = rootRef.current.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    window.scrollTo({ top: window.scrollY + r.top + pToFrac(i + 0.42) * total, behavior: 'smooth' });
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

  const sc = SCENES[scene];
  const reg = id => el => { anchorEls.current[id] = el; };
  const fade = (i, a = 0.06, b = 0.94) => { const x = t(i); return P >= i && P < i + 1 ? Math.min(seg(x, 0, a), 1 - seg(x, b, 1)) : 0; };

  return (
    <section className="sx-root" ref={rootRef} style={{ height: `calc(${TOTAL * UNIT_VH}vh + 100vh)` }}>
      <div className="sx-stage" ref={stageRef}>
        <canvas ref={canvasRef} className="sx-canvas" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} style={{ cursor: P >= 5 ? (dragRef.current ? 'grabbing' : 'grab') : 'default', touchAction: P >= 5 ? 'pan-y' : 'auto' }} />
        {!webgl ? <div className="sx-nogl">3D preview needs WebGL. The steps below still read top to bottom.</div> : null}
        <div className="sx-vignette" />
        <div className="sx-flash day" style={{ opacity: P > 4.9 && P < 5 ? seg(P, 4.9, 4.99) : 0 }} />
        <div className="sx-flash" style={{ opacity: P >= 4.99 && P < 5.14 ? 1 - seg(P, 5.0, 5.14) : 0 }} />

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
          {scene === 5 ? <LocationList onPick={id => worldRef.current?.focusLocation(id, clock.current)} /> : null}
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
            <div className={'r' + (t(4) > 0.15 ? ' done' : '')}><span>Battery 71% · 1,204 cycles</span><span>{t(4) > 0.2 ? 'Replaced' : 'Replacing…'}</span></div>
            <div className={'r' + (t(4) > 0.3 ? ' done' : '')}><span>Retest</span><span>{t(4) > 0.3 ? '42 / 42' : 'Queued'}</span></div>
            <div className="f">Part cost logged to the device · back to stock</div>
          </div>
        </div>
        <div className="sx-anchor" ref={reg('box')}>
          <div className="sx-callout ship">
            <div className="h">SO-10422 · Ortega Mobile Wholesale</div>
            <div className="r done"><span>8 of 8 scanned in</span><span>Packed</span></div>
            <div className="f">Label printed · leaving Dallas</div>
          </div>
        </div>
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
        <div className="sx-hint" style={{ opacity: P > 5.18 && P < 6 ? 1 : 0 }}>Drag to rotate · tap a location to fly there</div>

        {/* scene 7 */}
        <Offers t={t(6)} show={P > 6.02} />

        <footer className="sx-foot">
          <span>Scene 0{scene + 1} / 07 · {scene < 6 ? 'keep scrolling' : 'end of walkthrough'}</span>
          <button onClick={skip}>Skip the walkthrough ↓</button>
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
function DeviceRecord({ t, show }) {
  const n = Math.round(seg(t, 0.22, 0.86) * RECORD.length);
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
  const step = Math.floor(seg(t, 0.06, 0.62) * 7); // 0..7
  const round = Math.min(2, Math.floor(step / 2));
  const accepted = step >= 6;
  const bHist = ROUNDS.slice(0, Math.min(3, Math.floor((step + 1) / 2) + (step >= 1 ? 0 : 0))).map(r => r.b);
  const sHist = ROUNDS.slice(0, Math.floor(step / 2)).map(r => r.s);
  const bNow = accepted ? 346 : bHist[bHist.length - 1];
  const sNow = sHist[sHist.length - 1];
  const scan = seg(t, 0.66, 0.96), scanned = Math.round(scan * 12);
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
