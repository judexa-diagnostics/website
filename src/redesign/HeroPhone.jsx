import { LazyMotion, domMax, m, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import './heroPhone.css';

// The hero copy, held in a phone that flies in from the left and rests
// turned slightly toward the console. Hover tilts it a little; it always
// springs back to the resting pose.
const REST_Y = 16, REST_X = 4, TILT = 9;

export default function HeroPhone({ goTrial }) {
  const reduce = useReducedMotion();
  const px = useMotionValue(0), py = useMotionValue(0);
  const spring = { stiffness: 170, damping: 18, mass: 0.6 };
  const rx = useSpring(useTransform(py, v => -v * TILT), spring);
  const ry = useSpring(useTransform(px, v => v * TILT), spring);
  const glareX = useTransform(ry, v => `${50 + v * 4}%`);
  const glareY = useTransform(rx, v => `${30 - v * 4}%`);
  const glare = useTransform([glareX, glareY], ([x, y]) => `radial-gradient(120% 70% at ${x} ${y}, rgba(255,255,255,.34), rgba(255,255,255,0) 55%)`);

  const move = e => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set(((e.clientX - r.left) / r.width) * 2 - 1);
    py.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };
  const leave = () => { px.set(0); py.set(0); };

  return (
    <LazyMotion features={domMax} strict>
      <div className="hp-stage">
        <m.div
          className="hp-fly"
          initial={reduce ? false : { x: '-115vw', rotateY: 62, rotateZ: -9, rotateX: 10 }}
          animate={{ x: 0, rotateY: REST_Y, rotateZ: 0, rotateX: REST_X }}
          transition={{ type: 'spring', stiffness: 46, damping: 13, mass: 1.1, delay: 0.15 }}
        >
          <m.div className="hp-tilt" style={{ rotateX: rx, rotateY: ry }} onPointerMove={move} onPointerLeave={leave}>
            <div className="hp-phone">
              <span className="hp-btn hp-btn-a" /><span className="hp-btn hp-btn-b" /><span className="hp-btn hp-btn-c" />
              <div className="hp-screen">
                <div className="hp-island" />
                <div className="hp-status"><span>9:41</span><span className="hp-bars"><i /><i /><i /><i /><b /></span></div>
                <div className="hp-app">
                  <div className="hp-brand"><img src="assets/inphox-logo.png" alt="" /><span>InPhox</span></div>
                  <h1 className="hp-h1">The all-in-one platform for used electronics. <span>Literally.</span></h1>
                  <p className="hp-p">Diagnose, erase, grade, repair, store and sell from one system. Every device is tracked by IMEI from the moment it's plugged in until it ships.</p>
                  <div className="hp-ctas">
                    <button className="hv-2 hp-join" onClick={goTrial}>Join now</button>
                    <a className="hv-3 hp-price" href="#/pricing">See pricing</a>
                  </div>
                  <div className="hp-track"><span className="hp-dot" />IMEI 356798114520349 · tracked</div>
                </div>
                <div className="hp-home" />
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
