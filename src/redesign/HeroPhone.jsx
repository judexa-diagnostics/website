import { useEffect, useRef, useState } from 'react';
import { LazyMotion, animate, domMax, m, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import HomeScreen from './phoneGame/HomeScreen.jsx';
import BoxIt from './phoneGame/BoxIt.jsx';
import './heroPhone.css';
import './phoneGame/phoneGame.css';

// The hero copy, held in a phone that flies in from the left and rests
// turned slightly toward the console. Hover tilts it a little; it always
// springs back to the resting pose.
//
// Easter egg: swipe up from the home bar (touch or mouse drag, or focus the
// bar and press ArrowUp) and the app closes like a real phone, revealing a
// home screen. The InPhox icon reopens the app; "Box it" opens a mini game,
// which the same swipe closes again.
const REST_Y = 16, REST_X = 4, TILT = 9;
const CLOSE_SPRING = { type: 'spring', stiffness: 320, damping: 32, mass: 0.8 };
const OPEN_SPRING = { type: 'spring', stiffness: 260, damping: 26, mass: 0.8 };

export default function HeroPhone({ goTrial }) {
  const reduce = useReducedMotion();
  const px = useMotionValue(0), py = useMotionValue(0);
  const spring = { stiffness: 170, damping: 18, mass: 0.6 };
  const rx = useSpring(useTransform(py, v => -v * TILT), spring);
  const ry = useSpring(useTransform(px, v => v * TILT), spring);
  const glareX = useTransform(ry, v => `${50 + v * 4}%`);
  const glareY = useTransform(rx, v => `${30 - v * 4}%`);
  const glare = useTransform([glareX, glareY], ([x, y]) => `radial-gradient(120% 70% at ${x} ${y}, rgba(255,255,255,.34), rgba(255,255,255,0) 55%)`);

  // 'app' | 'home' | 'game'. appP / gameP: 0 = that layer open, 1 = closed.
  const [mode, setMode] = useState('app');
  const [gameOn, setGameOn] = useState(false);       // game layer mounted
  const [focusHome, setFocusHome] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [flown, setFlown] = useState(false);
  const modeRef = useRef(mode); modeRef.current = mode;
  const drag = useRef(null), screenRef = useRef(null), barRef = useRef(null), gameOrigin = useRef('50% 60%');
  const appP = useMotionValue(0), gameP = useMotionValue(1);

  const appScale = useTransform(appP, [0, 1], [1, 0.2]);
  const appY = useTransform(appP, [0, 1], [0, -18]);
  const appOpacity = useTransform(appP, [0, 0.55, 0.9], [1, 0.75, 0]);
  const appRadius = useTransform(appP, [0, 0.15], [0, 34]);
  const homeScale = useTransform(appP, [0, 1], [1.1, 1]);
  const homeOpacity = useTransform(appP, [0, 0.4], [0.2, 1]);
  const homeVis = useTransform(appP, v => (v < 0.002 ? 'hidden' : 'visible'));
  const gameScale = useTransform(gameP, [0, 1], [1, 0.16]);
  const gameOpacity = useTransform(gameP, [0, 0.6, 0.95], [1, 0.8, 0]);
  const gameRadius = useTransform(gameP, [0, 0.15], [0, 40]);

  const go = (mv, to, tr, done) => animate(mv, to, reduce ? { duration: 0 } : tr).then(done);

  const closeApp = viaKey => {
    setMode('home'); px.set(0); py.set(0);
    go(appP, 1, CLOSE_SPRING);
    if (viaKey) setFocusHome(n => n + 1);
  };
  const openApp = e => {
    setMode('app');
    go(appP, 0, OPEN_SPRING);
    if (e && e.detail === 0) barRef.current?.focus({ preventScroll: true }); // keyboard: keep focus in the phone
  };
  const openGame = e => {
    const scr = screenRef.current, t = e && e.currentTarget;
    if (scr && t) {
      const a = scr.getBoundingClientRect(), b = t.getBoundingClientRect();
      gameOrigin.current = `${((b.left + b.width / 2 - a.left) / a.width) * 100}% ${((b.top + b.height / 3 - a.top) / a.height) * 100}%`;
    }
    setGameOn(true); setMode('game'); px.set(0); py.set(0);
    gameP.set(1);
    go(gameP, 0, OPEN_SPRING);
  };
  const closeGame = viaKey => {
    setMode('home');
    go(gameP, 1, CLOSE_SPRING, () => { if (modeRef.current !== 'game') setGameOn(false); });
    if (viaKey) setFocusHome(n => n + 1);
  };

  // ---- swipe up from the home bar --------------------------------------
  const onBarDown = e => {
    const mv = modeRef.current === 'app' ? appP : modeRef.current === 'game' ? gameP : null;
    if (!mv || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const h = screenRef.current ? screenRef.current.getBoundingClientRect().height : 600;
    drag.current = { id: e.pointerId, y0: e.clientY, h, mv, samples: [[e.timeStamp, e.clientY]], moved: 0 };
    mv.stop(); setDragging(true); px.set(0); py.set(0);
  };
  const onBarMove = e => {
    const d = drag.current; if (!d || e.pointerId !== d.id) return;
    const dy = d.y0 - e.clientY;
    d.moved = Math.max(d.moved, Math.abs(dy));
    // follows the finger, then resists a little (rubber band) past ~45% of the screen
    const raw = Math.max(0, dy) / (d.h * 0.45);
    d.mv.set(raw < 0.7 ? raw : 0.7 + (1 - Math.exp(-(raw - 0.7) * 2)) * 0.25);
    d.samples.push([e.timeStamp, e.clientY]); if (d.samples.length > 6) d.samples.shift();
  };
  const onBarUp = e => {
    const d = drag.current; if (!d || e.pointerId !== d.id) return;
    drag.current = null; setDragging(false);
    const [t0, y0] = d.samples[0], [t1, y1] = d.samples[d.samples.length - 1];
    const vel = t1 > t0 ? (y0 - y1) / (t1 - t0) : 0;   // px per ms, upward positive
    const p = d.mv.get();
    if (p > 0.28 || (vel > 0.45 && d.moved > 14)) {
      if (modeRef.current === 'app') closeApp(false); else if (modeRef.current === 'game') closeGame(false);
    } else go(d.mv, 0, OPEN_SPRING);
  };
  const onBarKey = e => {
    if (e.key !== 'ArrowUp') return;
    e.preventDefault(); e.stopPropagation();
    if (modeRef.current === 'app') closeApp(true); else if (modeRef.current === 'game') closeGame(true);
  };

  // the home bar nudges once after the fly-in, so the swipe is discoverable
  const [nudge, setNudge] = useState(false);
  useEffect(() => {
    if (reduce) return undefined;
    const id = setTimeout(() => setNudge(true), 2600);
    const off = setTimeout(() => setNudge(false), 4400);
    return () => { clearTimeout(id); clearTimeout(off); };
  }, [reduce]);

  const move = e => {
    if (e.pointerType !== 'mouse' || drag.current || modeRef.current === 'game') return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set(((e.clientX - r.left) / r.width) * 2 - 1);
    py.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };
  const leave = () => { px.set(0); py.set(0); };
  const appOpen = mode === 'app';

  return (
    <LazyMotion features={domMax} strict>
      <div className="hp-stage">
        <m.div
          className="hp-fly"
          initial={reduce ? false : { x: '-115vw', rotateY: 62, rotateZ: -9, rotateX: 10 }}
          // while the game is open the phone turns to face you (truer drags)
          animate={mode === 'game' ? { x: 0, rotateY: 0, rotateZ: 0, rotateX: 0 } : { x: 0, rotateY: REST_Y, rotateZ: 0, rotateX: REST_X }}
          transition={flown ? { type: 'spring', stiffness: 140, damping: 20 } : { type: 'spring', stiffness: 46, damping: 13, mass: 1.1, delay: 0.15 }}
          onAnimationComplete={() => setFlown(true)}
        >
          <m.div className="hp-tilt" style={{ rotateX: rx, rotateY: ry }} onPointerMove={move} onPointerLeave={leave}>
            <div className="hp-phone">
              <span className="hp-btn hp-btn-a" /><span className="hp-btn hp-btn-b" /><span className="hp-btn hp-btn-c" />
              <div className={'hp-screen hp-m-' + mode} ref={screenRef}>
                <div className="hp-island" />
                <m.div className="hp-homescreen" style={{ scale: homeScale, opacity: homeOpacity, visibility: appOpen && !dragging ? homeVis : 'visible' }} aria-hidden={appOpen && !dragging ? true : undefined}>
                  <HomeScreen onOpenApp={openApp} onOpenGame={openGame} focusFirst={focusHome} />
                </m.div>
                {/* The app stays in the DOM when closed (the h1 is the page's heading). */}
                <m.div className={'hp-appwin' + (appOpen ? '' : ' closed')} style={{ scale: appScale, y: appY, opacity: appOpacity, borderRadius: appRadius }}>
                  <div className="hp-status"><span>9:41</span><span className="hp-bars"><i /><i /><i /><i /><b /></span></div>
                  <div className="hp-app">
                    <div className="hp-brand"><img src="assets/inphox-logo.png" alt="" /><span>InPhox</span></div>
                    <h1 className="hp-h1">The all-in-one platform for used electronics. <span>Literally.</span></h1>
                    <p className="hp-p">Diagnose, erase, grade, repair, store and sell from one system. Every device is tracked by IMEI from the moment it's plugged in until it ships.</p>
                    <div className="hp-ctas">
                      <button className="hv-2 hp-join" onClick={goTrial} tabIndex={appOpen ? undefined : -1}>Join now</button>
                      <a className="hv-3 hp-price" href="#/pricing" tabIndex={appOpen ? undefined : -1}>See pricing</a>
                    </div>
                    <div className="hp-track"><span className="hp-dot" />IMEI 356798114520349 · tracked</div>
                  </div>
                </m.div>
                {gameOn ? (
                  <m.div className="hp-gamewin" style={{ scale: gameScale, opacity: gameOpacity, borderRadius: gameRadius, transformOrigin: gameOrigin.current }}>
                    <BoxIt active={mode === 'game' && !dragging} />
                  </m.div>
                ) : null}
                <button
                  type="button" ref={barRef}
                  className={'hp-home' + (nudge && appOpen ? ' nudge' : '') + (dragging ? ' held' : '')}
                  data-tip={mode === 'game' ? 'Swipe up to exit' : 'Swipe up'}
                  aria-label={mode === 'game' ? 'Home bar: swipe up or press Arrow Up to leave the game' : 'Home bar: swipe up or press Arrow Up to close the app'}
                  tabIndex={mode === 'home' ? -1 : 0}
                  onPointerDown={onBarDown} onPointerMove={onBarMove} onPointerUp={onBarUp} onPointerCancel={onBarUp}
                  onKeyDown={onBarKey}
                />
                <m.div className="hp-glare" style={{ background: glare }} />
              </div>
            </div>
          </m.div>
        </m.div>
        <div className="hp-shadow" />
      </div>
    </LazyMotion>
  );
}
