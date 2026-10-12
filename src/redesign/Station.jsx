import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, LazyMotion, MotionConfig, domMax, m, useReducedMotion } from 'motion/react';
import './station.css';

/* ------------------------------------------------------------------ *
 * Bench scene geometry (SVG viewBox units). HTML overlays use the same
 * numbers converted to percentages, so everything scales together.
 * ------------------------------------------------------------------ */
const W = 1600;
const H = 640;
const BASE = 486; // phone bottom edge (the port)
const HUB = { x: 584, y: 562, w: 432, h: 26 };
const SCREEN = { x: 461, y: 23, w: 678, h: 384 };
const MAC = { x: 948, y: 424, w: 170, h: 82 };
const MAC_PORT = { x: 1044.5, y: 471.6 };
const MAX_PHONES = 12;
const PORTS = 12;
const HOST = 'WIN-BENCH-04';
const LOGO = 'assets/inphox-logo.png';
const EASE = [0.2, 0.8, 0.2, 1];
const NARROW_MQ = '(max-width: 899px)';

const px = (v, total) => `${(v / total) * 100}%`;
const pad2 = (v) => String(v).padStart(2, '0');

/* IMEI = 8-digit TAC + 6-digit serial + Luhn check digit. */
function imeiFor(tac, seed) {
  const body = tac + String(seed).padStart(6, '0').slice(-6);
  let sum = 0;
  for (let i = 0; i < 14; i += 1) {
    let d = +body[i];
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return body + ((10 - (sum % 10)) % 10);
}

/* kind: island (Dynamic Island), notch, punch (centered hole), se (home button) */
const CATALOG = [
  { model: 'iPhone 15 Pro', cap: '256 GB', color: 'Natural Titanium', kind: 'island', brand: 'apple', frame: ['#C9C3B8', '#8F897F', '#E6E0D6'], tac: '35391738', seed: 418207, carrier: 'Unlocked', battery: 94, res: 'pass', grade: 'A', T: 5200 },
  { model: 'Galaxy S24 Ultra', cap: '512 GB', color: 'Titanium Gray', kind: 'punch', brand: 'samsung', square: true, frame: ['#9B9893', '#5F5C58', '#C4C1BB'], tac: '35095334', seed: 772615, carrier: 'T-Mobile, clean', battery: 88, res: 'pass', grade: 'B', T: 6100 },
  { model: 'iPhone 13', cap: '128 GB', color: 'Midnight', kind: 'notch', brand: 'apple', frame: ['#3A3F47', '#1E2228', '#5A616B'], tac: '35467211', seed: 90534, carrier: 'Unlocked', battery: 81, res: 'fail', fail: 'Face ID', failAt: 9, grade: 'C', T: 5600 },
  { model: 'Pixel 8 Pro', cap: '128 GB', color: 'Bay', kind: 'punch', brand: 'google', frame: ['#9DB8D6', '#6C8AAE', '#C9DAEC'], tac: '35880241', seed: 301118, carrier: 'Unlocked', battery: 97, res: 'pass', grade: 'A', T: 4800 },
  { model: 'iPhone 14 Pro Max', cap: '256 GB', color: 'Deep Purple', kind: 'island', brand: 'apple', frame: ['#6A5B6E', '#41364A', '#8E7E92'], tac: '35428562', seed: 556093, carrier: 'AT&T', battery: 86, res: 'locked', grade: '-', T: 1700 },
  { model: 'iPhone 12', cap: '64 GB', color: 'Blue', kind: 'notch', brand: 'apple', frame: ['#2F5C86', '#1B3B5C', '#5684AE'], tac: '35302511', seed: 648221, carrier: 'Unlocked', battery: 79, res: 'pass', grade: 'B', T: 5000 },
  { model: 'Galaxy S23', cap: '256 GB', color: 'Cream', kind: 'punch', brand: 'samsung', frame: ['#E9E1D2', '#BFB4A2', '#F7F1E6'], tac: '35251873', seed: 214470, carrier: 'Unlocked', battery: 90, res: 'fail', fail: 'Speaker', failAt: 22, grade: 'C', T: 5900 },
  { model: 'iPhone 16', cap: '128 GB', color: 'Ultramarine', kind: 'island', brand: 'apple', frame: ['#5C6FE0', '#3443A8', '#8C9BF0'], tac: '35681924', seed: 117304, carrier: 'Unlocked', battery: 100, res: 'pass', grade: 'A', T: 4600 },
  { model: 'Galaxy A54', cap: '128 GB', color: 'Awesome Lime', kind: 'punch', brand: 'samsung', frame: ['#D7E3A6', '#A9B871', '#EAF2C6'], tac: '35473819', seed: 802256, carrier: 'Metro, clean', battery: 92, res: 'pass', grade: 'B', T: 4400 },
  { model: 'iPhone SE', cap: '64 GB', color: 'Red', kind: 'se', brand: 'apple', frame: ['#C8202F', '#8E1420', '#E2505B'], tac: '35265910', seed: 330972, carrier: 'Unlocked', battery: 89, res: 'pass', grade: 'B', T: 4200 },
  { model: 'Pixel 7a', cap: '128 GB', color: 'Charcoal', kind: 'punch', brand: 'google', frame: ['#4A4C4F', '#2A2C2E', '#6C6F73'], tac: '35585618', seed: 491633, carrier: 'Unlocked', battery: 95, res: 'pass', grade: 'A', T: 4500 },
  { model: 'iPhone 11', cap: '64 GB', color: 'White', kind: 'notch', brand: 'apple', frame: ['#E8E6E1', '#BDBAB3', '#F7F6F2'], tac: '35392110', seed: 675118, carrier: 'Unlocked', battery: 72, res: 'fail', fail: 'Battery', failAt: 35, grade: 'C', T: 5300 },
].map((d) => ({ ...d, imei: imeiFor(d.tac, d.seed) }));

const TESTS = ['Display', 'Touch', 'Face ID', 'Cameras', 'Speakers', 'Microphones', 'Wi-Fi', 'Bluetooth', 'Cellular', 'Battery', 'Buttons', 'Sensors'];

/* timeline (virtual ms after plug-in) */
const SPARK = 380;
const BOOT = 520;
const TEST = 2200;
const ERASE = 2600;

function derive(spec, dev, vt) {
  if (dev.plugAt == null) return { ph: dev.disc ? 'disc' : 'idle', conn: false };
  const e = vt - dev.plugAt;
  if (e < 0) return { ph: dev.disc ? 'disc' : 'idle', conn: false };
  const tEnd = TEST + spec.T;
  const ph = e < BOOT ? 'off' : e < TEST ? 'boot' : e < tEnd ? 'test' : 'result';
  const max = spec.res === 'locked' ? 7 : 42;
  const p = ph === 'test' ? (e - TEST) / spec.T : ph === 'result' ? 1 : 0;
  const count = Math.min(max, Math.floor(p * max + (ph === 'result' ? 0 : 0.0001)));
  const fields = dev.known ? 6 : Math.max(0, Math.min(6, Math.floor((e - 1250) / 230)));
  let er = null;
  if (ph === 'result') {
    if (spec.res === 'locked') er = 'blocked';
    else er = e - tEnd < ERASE ? Math.floor(((e - tEnd) / ERASE) * 100) : 'done';
  }
  const failing = spec.res === 'fail' && count >= spec.failAt;
  const done = ph === 'result' && (er === 'done' || er === 'blocked');
  return {
    ph, conn: true, e, count, max, fields, er, done, failing,
    flow: e >= SPARK && !done,
    doneAt: dev.plugAt + tEnd + (spec.res === 'locked' ? 0 : ERASE),
  };
}

/* phone slots: even indices on the left (outer -> inner), odd on the right */
function layout(n) {
  const per = Math.max(4, Math.ceil(n / 2));
  const pitch = 412 / per;
  const w = pitch * 0.84;
  const h = w * 2.06;
  return Array.from({ length: n }, (_, i) => {
    const side = i % 2 === 0 ? 'L' : 'R';
    const k = Math.floor(i / 2);
    const x = side === 'L' ? 20 + k * pitch + (pitch - w) / 2 : 1580 - (k + 1) * pitch + (pitch - w) / 2;
    return { i, side, k, per, x, y: BASE - h, w, h, cx: x + w / 2, port: side === 'L' ? k : 11 - k };
  });
}

const portX = (p) => HUB.x + 30 + p * ((HUB.w - 60) / (PORTS - 1));
const PORT_Y = HUB.y + HUB.h / 2;

/* Metro-map style cable: down from the phone, along its own lane, down into
   the hub port. Outer phones get the lowest lane, so lines never cross. */
function laneOf(g) {
  const outer = g.per - 1 - g.k; // 0 = innermost
  return 516 + outer * (36 / Math.max(1, g.per - 1));
}
function cablePath(g, unplugged, lift) {
  const lane = laneOf(g);
  const r = 9;
  const sx = g.cx;
  const sy = unplugged ? lane - r : BASE + 7 - lift;
  const ex = portX(g.port);
  const ey = PORT_Y;
  const dir = ex > sx ? 1 : -1;
  const f = (v) => v.toFixed(1);
  return `M${f(sx)},${f(sy)} L${f(sx)},${f(lane - r)} Q${f(sx)},${f(lane)} ${f(sx + dir * r)},${f(lane)} L${f(ex - dir * r)},${f(lane)} Q${f(ex)},${f(lane)} ${f(ex)},${f(lane + r)} L${f(ex)},${ey}`;
}

const MAC_X = MAC_PORT.x;
const MAC_CABLE = `M${MAC_X},${MAC_PORT.y + 4} L${MAC_X},${PORT_Y - 9} Q${MAC_X},${PORT_Y} ${MAC_X - 9},${PORT_Y} L${HUB.x + HUB.w - 6},${PORT_Y}`;
const MAC_CABLE_REV = `M${HUB.x + HUB.w - 6},${PORT_Y} L${MAC_X - 9},${PORT_Y} Q${MAC_X},${PORT_Y} ${MAC_X},${PORT_Y - 9} L${MAC_X},${MAC_PORT.y + 4}`;

function statusOf(spec, st) {
  if (!st.conn) return st.ph === 'disc' ? 'Disconnected' : 'Waiting';
  if (st.ph === 'off') return 'Connecting';
  if (st.ph === 'boot') return 'Pairing';
  if (st.ph === 'test') return `Testing ${st.count}/${st.max}`;
  if (spec.res === 'locked') return 'Owner lock on';
  if (spec.res === 'fail') return `${spec.fail} failed`;
  return `Passed · Grade ${spec.grade}`;
}

function ledOf(spec, st) {
  if (!st.conn) return 'off';
  if (!st.done && st.ph !== 'result') return 'busy';
  if (spec.res === 'locked') return 'amber';
  if (spec.res === 'fail') return 'red';
  return 'green';
}

/* one status line per card: [key, tone, text, bar% | null, barTone] */
function cardLine(spec, st) {
  if (!st.conn) return ['disc', 'off', 'Disconnected', null];
  if (st.ph === 'off') return ['off', 'busy', 'Connecting', 3];
  if (st.ph === 'boot') return ['boot', 'busy', 'Pairing', 6];
  if (st.ph === 'test') return ['test', st.failing ? 'red' : 'busy', `Testing ${st.count}/${st.max}`, (st.count / st.max) * 100, st.failing ? 'red' : 'busy'];
  const tone = ledOf(spec, st);
  if (spec.res === 'locked') return ['lock', tone, 'Owner lock · erase held', null];
  const head = spec.res === 'pass' ? `Grade ${spec.grade}` : `${spec.fail} failed`;
  if (st.er === 'done') return ['done', tone, `${head} · erased`, null];
  return ['erase', tone, `${head} · erasing`, st.er, 'ink'];
}

/* ------------------------------------------------------------------ */

function Num({ v }) {
  return (
    <span className="st-roll">
      <m.span key={v} initial={{ y: '25%', opacity: 0 }} animate={{ y: '0%', opacity: 1 }} transition={{ duration: 0.35, ease: EASE }}>
        {pad2(v)}
      </m.span>
    </span>
  );
}

function PhoneScreen({ spec, st }) {
  if (!st.conn || st.ph === 'off') return <span className="st-scr st-scr-off" />;
  if (st.ph === 'boot') {
    return (
      <span className="st-scr st-scr-boot">
        <img src={LOGO} alt="" />
        <span className="st-bootbar"><span style={{ width: `${Math.min(100, ((st.e - BOOT) / (TEST - BOOT)) * 100)}%` }} /></span>
      </span>
    );
  }
  if (st.ph === 'test') {
    const frac = st.count / st.max;
    const cur = Math.min(TESTS.length - 1, Math.floor(frac * TESTS.length));
    const rows = [cur - 2, cur - 1, cur].filter((r) => r >= 0);
    return (
      <span className="st-scr st-scr-test">
        <span className="st-ring">
          <svg viewBox="0 0 40 40" aria-hidden="true">
            <circle cx="20" cy="20" r="16" className="st-ring-bg" />
            <circle cx="20" cy="20" r="16" className={`st-ring-fg${st.failing ? ' st-bad' : ''}`} style={{ strokeDashoffset: 100.53 * (1 - frac) }} />
          </svg>
          <span className="st-ring-n">{st.count}<small>/{st.max}</small></span>
        </span>
        <span className="st-rows">
          {rows.map((r) => {
            const bad = spec.res === 'fail' && TESTS[r] === spec.fail.replace('Speaker', 'Speakers');
            return (
              <span key={r} className={`st-row${r === cur ? ' st-row-cur' : ''}`}>
                <i className={r === cur ? 'st-spin' : bad ? 'st-x' : 'st-ok'} />
                {TESTS[r]}
              </span>
            );
          })}
        </span>
      </span>
    );
  }
  const r = spec.res;
  return (
    <span className={`st-scr st-scr-res st-res-${r}`}>
      <span className="st-res-mark">
        {r === 'pass' && <svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>}
        {r === 'fail' && <svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17" /></svg>}
        {r === 'locked' && (
          <svg viewBox="0 0 24 24"><rect x="5.5" y="10.5" width="13" height="9.5" rx="2" /><path d="M8.5 10.5V8a3.5 3.5 0 017 0v2.5" /></svg>
        )}
      </span>
      <span className="st-res-t">{r === 'pass' ? `Grade ${spec.grade}` : r === 'fail' ? spec.fail : 'Locked'}</span>
    </span>
  );
}

function Phone({ spec, st, g, hot, inline, onEnter, onLeave, onClick }) {
  const style = inline
    ? { '--f1': spec.frame[0], '--f2': spec.frame[1], '--f3': spec.frame[2] }
    : {
      left: px(g.x, W), top: px(g.y, H), width: px(g.w, W), height: px(g.h, H),
      fontSize: `${(g.w / 16) * 0.1}cqw`,
      '--f1': spec.frame[0], '--f2': spec.frame[1], '--f3': spec.frame[2],
    };
  return (
    <m.button
      type="button"
      className={`st-phone st-k-${spec.kind} st-b-${spec.brand}${spec.square ? ' st-sq' : ''}${hot ? ' st-hot' : ''}${st.conn ? ' st-on' : ''}${inline ? ' st-phone-in' : ''}`}
      style={style}
      initial={false}
      animate={{ y: hot ? '-4%' : '0%', scale: hot ? 1.03 : 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      onClick={onClick}
      aria-label={`${spec.model}, ${statusOf(spec, st)}`}
    >
      <span className="st-ph-frame">
        <span className="st-ph-b st-ph-b1" />
        <span className="st-ph-b st-ph-b2" />
        <span className="st-ph-b st-ph-b3" />
        <span className="st-ph-b st-ph-b4" />
        <span className="st-ph-glass">
          <span className="st-ph-scrwrap">
            <PhoneScreen spec={spec} st={st} />
          </span>
          <span className="st-ph-cam" />
          {spec.kind === 'se' && <span className="st-ph-home" />}
        </span>
      </span>
    </m.button>
  );
}

const cardIn = { initial: { opacity: 0, y: 8, scale: 0.98 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { duration: 0.4, ease: EASE } };

function Card({ spec, st, dev, hot, port, onEnter, onLeave }) {
  if (!dev.seen) {
    return (
      <m.div className="st-card st-card-empty" {...cardIn}>
        <span>Port {pad2(port + 1)}</span>
        <span>Waiting</span>
      </m.div>
    );
  }
  const disc = !st.conn;
  const f = disc ? 6 : st.fields;
  const [key, tone, text, bar, barTone] = cardLine(spec, st);
  return (
    <m.div className={`st-card${hot ? ' st-hot' : ''}${disc ? ' st-disc' : ''}`} onMouseEnter={onEnter} onMouseLeave={onLeave} {...cardIn}>
      <div className="st-card-h">
        <span className={`st-led st-led-${disc ? 'off' : ledOf(spec, st)}`} />
        {f >= 1 ? <b className="st-reveal">{spec.model}</b> : <span className="st-sk" style={{ width: '62%', height: '0.8em' }} />}
      </div>
      <div className="st-card-sub">{f >= 1 ? <span className="st-reveal">{spec.cap} · {spec.color}</span> : <span className="st-sk" style={{ width: '48%' }} />}</div>
      <div className="st-card-imei">{f >= 2 ? <span className="st-reveal">{spec.imei}</span> : <span className="st-sk" style={{ width: '70%' }} />}<span className="st-port">P{pad2(port + 1)}</span></div>
      <div className={`st-card-f st-f-${tone}`}>
        <m.span key={key} className={`st-line st-t-${tone}`}
          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }}>
          {text}
          {key === 'erase' && <span className="st-pct"> {st.er}%</span>}
        </m.span>
        <span className={`st-prog${bar == null ? ' st-prog-none' : ''}`}><span className={`st-bar-${barTone || 'busy'}`} style={{ width: `${bar ?? 100}%` }} /></span>
      </div>
    </m.div>
  );
}

function useNarrow() {
  const get = () => typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia(NARROW_MQ).matches;
  const [narrow, setNarrow] = useState(get);
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mq = window.matchMedia(NARROW_MQ);
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return narrow;
}

const popIn = { initial: { opacity: 0, scale: 0.96 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.96 }, transition: { duration: 0.18, ease: EASE } };

/* ------------------------------------------------------------------ */

export default function Station({ goTrial }) {
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">
        <Bench goTrial={goTrial} />
      </MotionConfig>
    </LazyMotion>
  );
}

function Bench({ goTrial }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const rootRef = useRef(null);
  const scrollRef = useRef(null);
  const vtRef = useRef(0);
  const speedRef = useRef(1);
  const timersRef = useRef([]);
  const macClicks = useRef([]);
  const prefersReduced = useReducedMotion();
  const reduced = useRef(typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const still = reduced.current || !!prefersReduced;
  const narrow = useNarrow();

  const [vt, setVt] = useState(0);
  const [visible, setVisible] = useState(false);
  const [started, setStarted] = useState(false);
  const [devs, setDevs] = useState(() => CATALOG.slice(0, 8).map(() => ({ plugAt: null, disc: false, seen: false, known: false })));
  const [hot, setHot] = useState(null);
  const [pop, setPop] = useState(null);
  const [toast, setToast] = useState(null);
  const [turbo, setTurbo] = useState(false);

  const devsRef = useRef(devs);
  devsRef.current = devs;
  const hotRef = useRef(hot);
  hotRef.current = hot;
  const popRef = useRef(pop);
  popRef.current = pop;

  const later = (fn, ms) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
  };
  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  /* visibility */
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return undefined;
    }
    const io = new IntersectionObserver(([en]) => setVisible(en.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* first reveal: stagger the plug-ins (or jump to the end state) */
  useEffect(() => {
    if (!visible || started) return;
    setStarted(true);
    if (reduced.current) {
      setDevs((ds) => ds.map((d) => ({ ...d, plugAt: -1e6, seen: true, known: true })));
      return;
    }
    const t0 = vtRef.current;
    setDevs((ds) => ds.map((d, i) => ({ ...d, plugAt: t0 + 600 + i * 760, seen: false })));
  }, [visible, started]);

  /* virtual clock: runs only while the section is on screen */
  useEffect(() => {
    if (!visible || !started) return undefined;
    let last = performance.now();
    let loopAt = null;
    const id = setInterval(() => {
      const now = performance.now();
      const dt = Math.min(250, now - last);
      last = now;
      const t = (vtRef.current += dt * speedRef.current);
      const ds = devsRef.current;
      // mark cards as seen once their plug lands
      if (ds.some((d) => d.plugAt != null && !d.seen && t >= d.plugAt + SPARK)) {
        setDevs((cur) => cur.map((d) => (d.plugAt != null && !d.seen && t >= d.plugAt + SPARK ? { ...d, seen: true } : d)));
      }
      // idle loop: once everything settles, unplug and re-test a couple
      if (!reduced.current) {
        const sts = ds.map((d, i) => derive(CATALOG[i], d, t));
        const plugged = sts.filter((s) => s.conn);
        const pending = ds.some((d) => d.plugAt != null && d.plugAt > t);
        const allDone = plugged.length > 0 && !pending && plugged.every((s) => s.done);
        if (allDone) {
          const settled = Math.max(...plugged.map((s) => s.doneAt));
          if (loopAt == null) loopAt = settled + 6500;
          if (t >= loopAt) {
            loopAt = null;
            const pick = ds
              .map((d, i) => i)
              .filter((i) => sts[i].conn && i !== hotRef.current && i !== popRef.current)
              .sort(() => Math.random() - 0.5)
              .slice(0, 2);
            setDevs((cur) => cur.map((d, i) => {
              const j = pick.indexOf(i);
              return j < 0 ? d : { ...d, plugAt: t + 1900 + j * 700, disc: true, known: true };
            }));
          }
        } else loopAt = null;
      }
      setVt(t);
    }, 100);
    return () => clearInterval(id);
  }, [visible, started]);

  /* close popover on outside click */
  useEffect(() => {
    if (pop == null) return undefined;
    const onDown = (ev) => {
      if (!ev.target.closest || !ev.target.closest('.st-popover, .st-phone')) setPop(null);
    };
    const onKey = (ev) => ev.key === 'Escape' && setPop(null);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [pop]);

  const say = (kind, title, sub) => {
    const id = Math.random();
    setToast({ id, kind, title, sub });
    later(() => setToast((t) => (t && t.id === id ? null : t)), kind === 'toaster' ? 4200 : 2800);
  };

  const n = devs.length;
  const geo = useMemo(() => layout(n), [n]);
  const sts = devs.map((d, i) => derive(CATALOG[i], d, vt));

  const connected = sts.filter((s) => s.conn).length;
  const done = sts.filter((s) => s.done).length;
  const testing = sts.filter((s) => s.conn && !s.done).length;
  const passed = sts.filter((s, i) => s.done && CATALOG[i].res === 'pass').length;
  const flagged = done - passed;
  const summary = done === n && n > 0
    ? `${n} of ${n} done · ${passed} passed · ${flagged} flagged`
    : `${done} of ${n} done · ${testing} testing`;

  /* actions */
  const unplug = (i) => setDevs((ds) => ds.map((d, j) => (j === i ? { ...d, plugAt: null, disc: true, known: true } : d)));
  const replug = (i) => setDevs((ds) => ds.map((d, j) => (j === i ? { ...d, plugAt: vtRef.current + 150, known: true, seen: true } : d)));
  const retest = (i) => setDevs((ds) => ds.map((d, j) => (j === i ? { ...d, plugAt: vtRef.current - BOOT, known: true, seen: true } : d)));
  const addPhone = () => {
    if (n >= MAX_PHONES) {
      say('toaster', 'Unsupported device: toaster', 'No IMEI found · grade: golden brown');
      return;
    }
    setDevs((ds) => (ds.length >= MAX_PHONES ? ds : [...ds, { plugAt: vtRef.current + 450, disc: false, seen: false, known: false }]));
    if (!started) setStarted(true);
  };
  const clickMac = () => {
    const now = performance.now();
    macClicks.current = [...macClicks.current.filter((t) => now - t < 2500), now];
    if (macClicks.current.length >= 5 && !turbo) {
      macClicks.current = [];
      setTurbo(true);
      speedRef.current = 2.6;
      say('turbo', 'Fans at full tilt', 'Running at 2.6x for a few seconds');
      later(() => {
        setTurbo(false);
        speedRef.current = 1;
      }, 7000);
    }
  };

  const hotI = hot != null && hot < n ? hot : null;
  const popI = pop != null && pop < n ? pop : null;
  const tipI = popI == null && !narrow ? hotI : null;
  const anyFlow = sts.some((s) => s.flow);
  const cols = narrow ? 2 : 4;
  const rows = Math.max(2, Math.ceil(n / cols));
  const free = narrow ? (n % cols ? cols - (n % cols) : 0) : rows * cols - n;

  /* draw outer cables last so they sit on top of inner ones */
  const cableOrder = geo.slice().sort((a, b) => b.k - a.k);

  const popActions = (i) => (
    <div className="st-pop-acts">
      <button type="button" disabled={!sts[i].conn} onClick={() => { retest(i); setPop(null); say('info', `Retesting ${CATALOG[i].model}`, 'Full 42-point check'); }}>Retest</button>
      <button type="button" disabled={!sts[i].done} onClick={() => {
        const s = CATALOG[i];
        setPop(null);
        say('label', `Label printed · ${s.model}`, `${s.cap} · ${s.res === 'pass' ? `Grade ${s.grade}` : s.res === 'fail' ? `${s.fail} failed` : 'Owner lock'} · …${s.imei.slice(-6)}`);
      }}>Print label</button>
      {sts[i].conn || devs[i].plugAt != null
        ? <button type="button" onClick={() => { unplug(i); setPop(null); }}>Unplug</button>
        : <button type="button" className="st-pop-pri" onClick={() => { replug(i); setPop(null); }}>Plug in</button>}
    </div>
  );

  const app = (
    <div className="st-app">
      <div className="st-app-h">
        <img src={LOGO} alt="" onClick={narrow ? clickMac : undefined} />
        <span className="st-app-t"><b>InPhox Station</b><span className="st-app-st"> · {HOST} · <span className="st-tab">{connected}</span> connected</span></span>
        <span className={`st-live${turbo ? ' st-live-t' : ''}`}>{turbo ? 'Turbo' : 'Live'}</span>
      </div>
      <div className="st-grid" style={narrow ? undefined : { gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`, gridTemplateRows: `repeat(${rows}, minmax(0,1fr))` }} data-rows={rows}>
        {devs.map((d, i) => (
          <Card key={`${i}-${d.seen ? 1 : 0}`} spec={CATALOG[i]} st={sts[i]} dev={d} hot={hotI === i || popI === i} port={geo[i].port}
            onEnter={() => setHot(i)} onLeave={() => setHot(null)} />
        ))}
        {Array.from({ length: free }, (_, j) => (
          <div key={`e${j}`} className="st-card st-card-empty st-card-free"><span>Free port</span></div>
        ))}
      </div>
      <div className="st-app-f">
        <span>Auto-erase on</span>
        <span className="st-tab">{summary}</span>
      </div>
      <div className={`st-toast-wrap${toast && toast.kind === 'toaster' ? ' st-toast-mid' : ''}`}>
        {toast && (
            <m.div key={toast.id} className={`st-toast st-toast-${toast.kind}`}
              initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: EASE }}>
              {toast.kind === 'toaster' && (
                <svg viewBox="0 0 48 36" className="st-toaster" aria-hidden="true">
                  <rect x="10" y="2" width="9" height="12" rx="2" fill="#E3B26B" />
                  <rect x="25" y="2" width="9" height="12" rx="2" fill="#C98A3E" />
                  <rect x="3" y="9" width="40" height="24" rx="8" fill="#CFC8BC" />
                  <rect x="43" y="17" width="4" height="7" rx="1.5" fill="#6B6257" />
                  <circle cx="12" cy="25" r="2.4" fill="#B3261E" />
                </svg>
              )}
              {toast.kind === 'label' && (
                <span className="st-barcode" aria-hidden="true">
                  {Array.from({ length: 22 }, (_, j) => <i key={j} style={{ flexGrow: ((j * 7) % 3) + 1 }} />)}
                </span>
              )}
              <span><b>{toast.title}</b><small>{toast.sub}</small></span>
            </m.div>
          )}
        
      </div>
    </div>
  );

  const head = (
    <div className="st-head">
      <div className="st-h-l">
        <span className="st-num">03</span>
        <h2>Plug in ten or more of your phones and judge the results yourself.</h2>
      </div>
      <div className="st-h-r">
        <p>Every plan includes intake, device checks and inventory. Growth and up add the station app on your own bench.</p>
        <div className="st-ctas">
          <button type="button" className="hv-2 st-cta" onClick={goTrial}>Get started</button>
          <a className="hv-7 st-cta st-cta-o" href="#/contact">Book a walkthrough</a>
        </div>
      </div>
    </div>
  );

  const addBtn = (
    <button type="button" className="st-add" onClick={addPhone}>
      <span>+</span> Add phone <em className="st-tab">{n}/{MAX_PHONES}</em>
    </button>
  );

  if (narrow) {
    return (
      <div className={`st-root st-narrow${turbo ? ' st-turbo' : ''}`} ref={rootRef}>
        {head}
        <div className="st-m-stats" aria-hidden="true">
          <span className="st-m-host">{HOST}</span>
          <span><b><Num v={testing} /></b>Testing</span>
          <span className="st-g"><b><Num v={passed} /></b>Passed</span>
          <span className="st-r"><b><Num v={flagged} /></b>Flagged</span>
        </div>
        <div className="st-m-display">
          <div className="st-m-bezel"><div className="st-screen st-m-screen">{app}</div></div>
          <span className="st-m-neck" /><span className="st-m-base" />
        </div>
        <div className="st-m-bench">
          <div className="st-m-phones">
            {geo.map((g) => (
              <div key={g.i} className="st-m-slot">
                <Phone spec={CATALOG[g.i]} st={sts[g.i]} g={g} hot={popI === g.i} inline
                  onClick={() => setPop((p) => (p === g.i ? null : g.i))} />
                <span className={`st-m-port st-led-${ledOf(CATALOG[g.i], sts[g.i])}`} />
              </div>
            ))}
          </div>
          <AnimatePresence>
            {popI != null && (
              <m.div key={popI} className="st-popover st-m-pop" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.22, ease: EASE }}>
                <b>{CATALOG[popI].model}</b>
                <span className="st-tip-sub">{statusOf(CATALOG[popI], sts[popI])} · IMEI <span className="st-tab">{CATALOG[popI].imei}</span></span>
                {popActions(popI)}
              </m.div>
            )}
          </AnimatePresence>
        </div>
        <div className="st-foot">
          <span>Tap a phone for actions</span>
          {addBtn}
        </div>
      </div>
    );
  }

  return (
    <div className="st-root" ref={rootRef}>
      {head}

      <div className="st-scroll" ref={scrollRef}>
        <div className={`st-scene${turbo ? ' st-turbo' : ''}${still ? ' st-still' : ''}`}>
          {/* wall stats */}
          <div className="st-wall st-wall-l" aria-hidden="true">
            <span className="st-wall-host">{HOST}</span>
            <span className="st-wall-k"><span className="st-tab">{connected}</span> of {PORTS} ports live</span>
          </div>
          <div className="st-wall st-wall-r" aria-hidden="true">
            <span><b><Num v={testing} /></b>Testing</span>
            <span className="st-g"><b><Num v={passed} /></b>Passed</span>
            <span className="st-r"><b><Num v={flagged} /></b>Flagged</span>
          </div>

          <svg className="st-svg" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
            <defs>
              <linearGradient id={`${uid}desk`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#F4F1EC" />
                <stop offset="1" stopColor="#FFFFFF" />
              </linearGradient>
              <linearGradient id={`${uid}deskFade`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#fff" stopOpacity="0" />
                <stop offset=".08" stopColor="#fff" stopOpacity="1" />
                <stop offset=".92" stopColor="#fff" stopOpacity="1" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
              <mask id={`${uid}deskMask`} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
                <rect x="0" y="0" width={W} height={H} fill={`url(#${uid}deskFade)`} />
              </mask>
              <radialGradient id={`${uid}shade`}>
                <stop offset="0" stopColor="#16130F" stopOpacity=".16" />
                <stop offset="1" stopColor="#16130F" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* desk */}
            <g mask={`url(#${uid}deskMask)`}>
              <rect x="0" y={BASE} width={W} height={H - BASE} fill={`url(#${uid}desk)`} />
              <rect x="0" y={BASE - 0.5} width={W} height="1" fill="#E6E0D6" />
            </g>

            {/* display stand + shadow */}
            <ellipse cx="800" cy="499" rx="170" ry="9" fill={`url(#${uid}shade)`} />
            <path d="M744 412 L856 412 L866 492 L734 492 Z" fill="#DDD8D0" />
            <rect x="672" y="489" width="256" height="9" rx="4.5" fill="#CFC8BC" />

            {/* display */}
            <rect x="450" y="12" width="700" height="406" rx="12" fill="#DDD8D0" />
            <rect x="452.5" y="14.5" width="695" height="401" rx="10" fill="#16130F" />
            <circle cx="800" cy="18.8" r="1.4" fill="#3A342D" />

            {/* Mac Studio */}
            <g className="st-mac" onClick={clickMac} role="presentation">
              <ellipse cx={MAC.x + MAC.w / 2} cy={MAC.y + MAC.h} rx="104" ry="8" fill={`url(#${uid}shade)`} />
              <rect x={MAC.x + 10} y={MAC.y + MAC.h - 9} width={MAC.w - 20} height="9" rx="4" fill="#CFC8BC" />
              <g className="st-vents">
                {Array.from({ length: 22 }, (_, j) => (
                  <circle key={j} cx={MAC.x + 18 + j * 6.4} cy={MAC.y + MAC.h - 3.6} r="1.1" fill="#A69E92" />
                ))}
              </g>
              <rect x={MAC.x} y={MAC.y} width={MAC.w} height={MAC.h - 7} rx="14" fill="#ECE8E2" stroke="#DDD8D0" strokeWidth="1" />
              <rect x={MAC_PORT.x - 4.5} y={MAC_PORT.y - 1.6} width="9" height="3.2" rx="1.6" fill="#6B6257" />
              <rect x={MAC_PORT.x + 11.5} y={MAC_PORT.y - 1.6} width="9" height="3.2" rx="1.6" fill="#6B6257" />
              <rect x={MAC_PORT.x + 29} y={MAC_PORT.y - 1} width="24" height="2" rx="1" fill="#6B6257" />
              <circle cx={MAC.x + 14} cy={MAC.y + MAC.h - 17} r="1.6" fill="#1E7A4A" />
              <rect x={MAC.x} y={MAC.y} width={MAC.w} height={MAC.h} fill="transparent" style={{ cursor: 'pointer' }}>
                <title>{HOST}</title>
              </rect>
            </g>

            {/* hub -> Mac cable */}
            <g className={`st-cable st-plugged${anyFlow ? ' st-live' : ''}`}>
              <path d={MAC_CABLE} className="st-c-line" />
              <path id={`${uid}mac`} d={MAC_CABLE_REV} fill="none" stroke="none" />
              {anyFlow && !still && [0, 1, 2].map((j) => (
                <circle key={j} r="3" className="st-pkt">
                  <animateMotion dur="1.2s" begin={`${-j * 0.4}s`} repeatCount="indefinite"><mpath href={`#${uid}mac`} /></animateMotion>
                </circle>
              ))}
            </g>

            {/* phone shadows */}
            {geo.map((g) => (
              <ellipse key={`sh${g.i}`} cx={g.cx} cy={BASE + 1} rx={g.w * 0.7} ry="6" fill={`url(#${uid}shade)`} className="st-phshadow" />
            ))}

            {/* phone cables */}
            {cableOrder.map((g) => {
              const i = g.i;
              const st = sts[i];
              const isHot = hotI === i || popI === i;
              const lift = isHot ? g.h * 0.04 : 0;
              const d = cablePath(g, !st.conn, lift);
              const pid = `${uid}c${i}`;
              const pw = Math.max(9, g.w * 0.16);
              return (
                <g key={`c${i}`} className={`st-cable${isHot ? ' st-hotc' : ''}${st.conn ? ' st-plugged' : ''}`}
                  onMouseEnter={() => setHot(i)} onMouseLeave={() => setHot(null)}>
                  <path d={d} style={{ d: `path('${d}')` }} className="st-c-hit" />
                  <path d={d} style={{ d: `path('${d}')` }} className="st-c-line" />
                  <path id={pid} d={d} fill="none" stroke="none" />
                  <rect className="st-plug" x={g.cx - pw / 2} y={BASE - 1} width={pw} height="9" rx="2.5"
                    style={{ transform: `translateY(${st.conn ? -lift : laneOf(g) - 9 - BASE - 7}px)` }} />
                  {st.flow && !still && [0, 1].map((j) => (
                    <circle key={j} r="3" className="st-pkt">
                      <animateMotion dur="1.6s" begin={`${-j * 0.8 - (i % 3) * 0.2}s`} repeatCount="indefinite"><mpath href={`#${pid}`} /></animateMotion>
                    </circle>
                  ))}
                </g>
              );
            })}

            {/* hub */}
            <ellipse cx={HUB.x + HUB.w / 2} cy={HUB.y + HUB.h + 1} rx={HUB.w * 0.56} ry="7" fill={`url(#${uid}shade)`} />
            <rect x={HUB.x} y={HUB.y} width={HUB.w} height={HUB.h} rx="8" fill="#FFFFFF" stroke="#E6E0D6" strokeWidth="1.2" />
            {Array.from({ length: PORTS }, (_, p) => {
              const gi = geo.find((g) => g.port === p);
              const led = gi ? ledOf(CATALOG[gi.i], sts[gi.i]) : 'off';
              const isHot = gi && (hotI === gi.i || popI === gi.i);
              return <circle key={`p${p}`} cx={portX(p)} cy={PORT_Y} r={isHot ? 4.4 : 3.4} className={`st-hled st-led-${led}`} />;
            })}
          </svg>

          {/* display contents */}
          <div className="st-screen" style={{ left: px(SCREEN.x, W), top: px(SCREEN.y, H), width: px(SCREEN.w, W), height: px(SCREEN.h, H) }}>
            {app}
          </div>

          {/* turbo whoosh */}
          <AnimatePresence>
            {turbo && (
              <m.div className="st-whoosh" style={{ left: px(MAC.x + MAC.w + 12, W), top: px(MAC.y + MAC.h / 2, H) }} aria-hidden="true"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <span>whoosh</span><i /><i /><i />
              </m.div>
            )}
          </AnimatePresence>

          {/* phones */}
          <div className="st-phones">
            {geo.map((g) => (
              <Phone key={g.i} spec={CATALOG[g.i]} st={sts[g.i]} g={g} hot={hotI === g.i || popI === g.i}
                onEnter={() => setHot(g.i)} onLeave={() => setHot(null)}
                onClick={() => setPop((p) => (p === g.i ? null : g.i))} />
            ))}
          </div>

          {/* hover tooltip + click popover */}
          <AnimatePresence>
            {tipI != null && (
              <m.div key={`t${tipI}`} className="st-tip" role="tooltip"
                style={{ left: px(geo[tipI].cx, W), top: px(geo[tipI].y - 14, H), x: geo[tipI].side === 'L' ? '-16%' : '-84%', y: '-100%', originY: 1 }}
                {...popIn}>
                <b>{CATALOG[tipI].model}</b>
                <span className="st-tip-sub">{CATALOG[tipI].cap} · {CATALOG[tipI].color}</span>
                <span className="st-tip-row"><em>IMEI</em><span className="st-tab">{CATALOG[tipI].imei}</span></span>
                <span className="st-tip-row"><em>Battery</em><span className="st-tab">{CATALOG[tipI].battery}%</span></span>
                <span className="st-tip-row st-tip-st"><em>Status</em>{statusOf(CATALOG[tipI], sts[tipI])}</span>
                <span className="st-tip-hint">Click for actions · {HOST}</span>
              </m.div>
            )}
            {popI != null && (
              <m.div key={`p${popI}`} className="st-popover"
                style={{ left: px(geo[popI].cx, W), top: px(geo[popI].y - 14, H), x: geo[popI].side === 'L' ? '-16%' : '-84%', y: '-100%', originY: 1 }}
                {...popIn}>
                <b>{CATALOG[popI].model}</b>
                <span className="st-tip-sub">{statusOf(CATALOG[popI], sts[popI])}</span>
                {popActions(popI)}
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="st-foot">
        <span>{HOST} · <span className="st-tab">{connected}</span> of {PORTS} ports</span>
        <span className="st-foot-sum st-tab">{summary}</span>
        {addBtn}
      </div>
    </div>
  );
}
