import { useEffect, useRef, useState } from 'react';

// A small logo editor for the Start form (2026-10-05): preview, drag to move,
// zoom, rotate, brightness/contrast, background, square or wide frame. It
// draws on a canvas and hands back a PNG, which is what the shop is set up
// with. Nothing leaves the browser until the form is sent.

export const FRAMES = { square: [512, 512], wide: [800, 400] };
export const BACKGROUNDS = [['none', 'None'], ['#FFFFFF', 'White'], ['#16130F', 'Black'], ['#EB5E12', 'Orange']];
export const DEFAULTS = { zoom: 1, rot: 0, x: 0, y: 0, bright: 100, contrast: 100, bg: 'none', frame: 'square' };

/** Draw img onto ctx (a w x h canvas) with the edit settings e. Exported for tests. */
export function drawLogo(ctx, img, e, w, h) {
  ctx.clearRect(0, 0, w, h);
  if (e.bg !== 'none') { ctx.fillStyle = e.bg; ctx.fillRect(0, 0, w, h); }
  const turned = e.rot % 180 !== 0;
  const iw = turned ? img.height : img.width, ih = turned ? img.width : img.height;
  const fit = Math.min(w / iw, h / ih) * e.zoom;
  ctx.save();
  ctx.filter = `brightness(${e.bright}%) contrast(${e.contrast}%)`;
  ctx.translate(w / 2 + e.x * w, h / 2 + e.y * h);
  ctx.rotate((e.rot * Math.PI) / 180);
  ctx.drawImage(img, (-img.width * fit) / 2, (-img.height * fit) / 2, img.width * fit, img.height * fit);
  ctx.restore();
}

const BTN = { height: '2.5rem', padding: '0 0.875rem', border: '1px solid #16130F', borderRadius: '2px', background: '#FFFFFF',
  color: '#16130F', fontSize: '0.8125rem', fontWeight: '600', cursor: 'pointer' };
const ROW = { display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', fontSize: '0.8125rem' };
const LBL = { width: '5.5rem', fontWeight: '600' };

export default function LogoEditor({ file, onApply, onCancel }) {
  const canvas = useRef(null);
  const drag = useRef(null);
  const [img, setImg] = useState(null);
  const [err, setErr] = useState('');
  const [e, setE] = useState(DEFAULTS);
  const set = k => v => setE(s => ({ ...s, [k]: v }));
  const [w, h] = FRAMES[e.frame];

  useEffect(() => {
    if (!file) return undefined;
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => setImg(im);
    im.onerror = () => setErr("That picture couldn't be opened. Choose another one.");
    im.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const c = canvas.current;
    if (c && img) drawLogo(c.getContext('2d'), img, e, w, h);
  }, [img, e, w, h]);

  const down = ev => { drag.current = { x: ev.clientX, y: ev.clientY, ox: e.x, oy: e.y }; ev.currentTarget.setPointerCapture?.(ev.pointerId); };
  const move = ev => {
    if (!drag.current) return;
    const r = ev.currentTarget.getBoundingClientRect();
    const d = drag.current;
    setE(s => ({ ...s, x: d.ox + (ev.clientX - d.x) / r.width, y: d.oy + (ev.clientY - d.y) / r.height }));
  };
  const up = () => { drag.current = null; };

  const apply = () => {
    const c = canvas.current;
    if (!c) return;
    c.toBlob(blob => {
      if (!blob) { setErr("That didn't work. Try again or choose another picture."); return; }
      onApply(new File([blob], 'logo.png', { type: 'image/png' }), c.toDataURL('image/png'));
    }, 'image/png');
  };

  if (err) return <span style={{ fontSize: '0.75rem', color: '#B3261E' }}>{err}</span>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.75rem', border: '1px solid #D9D0C2', background: '#FBF8F2' }}>
      <div style={{ fontSize: '0.75rem', color: '#6B6257' }}>Drag the picture to move it. The checkered area stays see-through.</div>
      <canvas ref={canvas} width={w} height={h} aria-label="Logo preview"
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        style={{ width: '100%', maxWidth: e.frame === 'wide' ? '22rem' : '14rem', aspectRatio: `${w} / ${h}`, alignSelf: 'center',
          cursor: 'grab', touchAction: 'none', border: '1px solid #D9D0C2',
          background: 'repeating-conic-gradient(#E9E3D8 0% 25%, #FFFFFF 0% 50%) 50% / 16px 16px' }} />
      <div style={ROW}><span style={LBL}>Shape</span>
        {[['square', 'Square'], ['wide', 'Wide']].map(([k, t]) => (
          <button key={k} type="button" onClick={() => set('frame')(k)} style={{ ...BTN, background: e.frame === k ? '#FBE7CC' : '#FFFFFF' }}>{t}</button>))}
      </div>
      <label style={ROW}><span style={LBL}>Zoom</span>
        <input type="range" min="0.2" max="4" step="0.05" value={e.zoom} onChange={ev => set('zoom')(Number(ev.target.value))} style={{ flex: 1 }} /></label>
      <label style={ROW}><span style={LBL}>Brightness</span>
        <input type="range" min="40" max="180" step="1" value={e.bright} onChange={ev => set('bright')(Number(ev.target.value))} style={{ flex: 1 }} /></label>
      <label style={ROW}><span style={LBL}>Contrast</span>
        <input type="range" min="40" max="200" step="1" value={e.contrast} onChange={ev => set('contrast')(Number(ev.target.value))} style={{ flex: 1 }} /></label>
      <div style={ROW}><span style={LBL}>Background</span>
        {BACKGROUNDS.map(([v, t]) => (
          <button key={v} type="button" onClick={() => set('bg')(v)} style={{ ...BTN, background: e.bg === v ? '#FBE7CC' : '#FFFFFF' }}>{t}</button>))}
      </div>
      <div style={ROW}>
        <button type="button" onClick={() => set('rot')((e.rot + 90) % 360)} style={BTN}>Rotate</button>
        <button type="button" onClick={() => setE(s => ({ ...DEFAULTS, frame: s.frame }))} style={BTN}>Reset</button>
        <span style={{ flex: 1 }} />
        <button type="button" onClick={onCancel} style={{ ...BTN, border: '0', background: 'transparent', color: '#B3261E' }}>Remove</button>
        <button type="button" className="hv-2" onClick={apply} disabled={!img}
          style={{ ...BTN, border: '0', background: '#EB5E12' }}>Use this logo</button>
      </div>
    </div>
  );
}
