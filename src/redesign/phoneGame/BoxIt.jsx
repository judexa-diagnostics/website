import { useEffect, useRef, useState } from 'react';
import { createBoxIt, readBest, GRADES } from './boxItEngine.js';
import { StatusBar } from './HomeScreen.jsx';

// The game screen inside the hero phone. The engine draws to a canvas at
// display rate; it stops whenever the game is closing, scrolled off-screen
// or the tab is hidden.
export default function BoxIt({ active }) {
  const wrapRef = useRef(null), canvasRef = useRef(null), gameRef = useRef(null);
  const [phase, setPhase] = useState('ready');
  const [result, setResult] = useState({ score: 0, best: readBest(), newBest: false });
  const [hint, setHint] = useState(true);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const id = setTimeout(() => setHint(false), 4200);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current, canvas = canvasRef.current;
    const game = createBoxIt(canvas, { onPhase: (ph, info) => { setPhase(ph); if (info) setResult(r => ({ ...r, ...info })); } });
    gameRef.current = game;
    if (import.meta.env.DEV) window.__boxit = game;
    const fit = () => { game.resize(wrap.clientWidth, wrap.clientHeight, window.devicePixelRatio || 1); game.draw(); };
    fit();
    const ro = new ResizeObserver(fit); ro.observe(wrap);

    let raf = 0, last = 0, onScreen = true;
    const run = now => {
      raf = 0;
      if (!onScreen || document.hidden || !activeRef.current) return;   // paused: resumes via kick()
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0; last = now;
      game.step(dt); game.draw();
      raf = requestAnimationFrame(run);
    };
    const kick = () => { if (!raf && onScreen && !document.hidden && activeRef.current) { last = 0; raf = requestAnimationFrame(run); } };
    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; kick(); }, { threshold: 0.05 });
    io.observe(wrap);
    const vis = () => kick();
    document.addEventListener('visibilitychange', vis);
    game.kick = kick;
    kick();

    // pointer: grab, drag and flick phones
    const pos = e => { const r = canvas.getBoundingClientRect(); return [(e.clientX - r.left) * (canvas.clientWidth / r.width), (e.clientY - r.top) * (canvas.clientHeight / r.height)]; };
    let pid = null;
    const pd = e => {
      const [x, y] = pos(e);
      if (game.down(x, y, e.timeStamp)) { pid = e.pointerId; canvas.setPointerCapture?.(e.pointerId); e.preventDefault(); }
    };
    const pm = e => { if (e.pointerId !== pid) return; const [x, y] = pos(e); game.move(x, y, e.timeStamp); };
    const pu = e => { if (e.pointerId !== pid) return; pid = null; game.up(e.timeStamp); };
    canvas.addEventListener('pointerdown', pd);
    canvas.addEventListener('pointermove', pm);
    canvas.addEventListener('pointerup', pu);
    canvas.addEventListener('pointercancel', pu);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); document.removeEventListener('visibilitychange', vis);
      canvas.removeEventListener('pointerdown', pd); canvas.removeEventListener('pointermove', pm);
      canvas.removeEventListener('pointerup', pu); canvas.removeEventListener('pointercancel', pu);
      if (import.meta.env.DEV && window.__boxit === game) window.__boxit = null;
    };
  }, []);

  useEffect(() => { if (active) gameRef.current?.kick?.(); }, [active]);

  const start = () => { gameRef.current?.start(); gameRef.current?.kick?.(); };

  return (
    <div className={'bx' + (phase === 'play' ? ' bx-playing' : '')}>
      <StatusBar tone="dark" />
      <div className="bx-field" ref={wrapRef}>
        <canvas ref={canvasRef} className="bx-canvas" aria-label="Box it game: drag each phone into the bin of its grade" role="img" />
        {phase !== 'play' ? (
          <div className="bx-card">
            {phase === 'ready' ? (
              <>
                <div className="bx-kick">Lot L-0418 · 312 units</div>
                <h2 className="bx-title">Box it</h2>
                <p className="bx-text">Phones come off the line graded. Drag or flick each one into its bin before it lands. Three wrong boxes and the lot is closed.</p>
                <div className="bx-legend">{GRADES.map(g => <span key={g.g} style={{ '--c': g.col }}>{g.g}</span>)}</div>
              </>
            ) : (
              <>
                <div className="bx-kick">Lot closed</div>
                <h2 className="bx-title">{result.score} boxed</h2>
                <p className="bx-text">{result.newBest ? 'New best. The whiteboard could never.' : `Best ${result.best}. One more lot?`}</p>
              </>
            )}
            <button type="button" className="bx-go" onClick={start}>{phase === 'ready' ? 'Start' : 'Play again'}</button>
          </div>
        ) : null}
        <div className={'bx-hint' + (hint || phase !== 'play' ? ' on' : '')}>Swipe up from the bar to exit</div>
      </div>
    </div>
  );
}
