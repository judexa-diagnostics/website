import { useEffect, useId, useMemo, useRef, useState } from 'react';
import './station.css';

/* ------------------------------------------------------------------ *
 * Bench scene geometry (SVG viewBox units). HTML overlays use the same
 * numbers converted to percentages, so everything scales together.
 * ------------------------------------------------------------------ */
const W = 1600;
const H = 640;
const BASE = 486; // phone bottom edge (the port)
const HUB = { x: 572, y: 552, w: 456, h: 44 };
const SCREEN = { x: 461, y: 23, w: 678, h: 384 };
const MAC = { x: 948, y: 424, w: 170, h: 82 };
const MAC_PORT = { x: 1044.5, y: 471.6 };
const MAX_PHONES = 12;
const LOGO = 'assets/inphox-logo.png';

const px = (v, total) => `${(v / total) * 100}%`;

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
  { model: 'iPhone 15 Pro', cap: '256 GB', color: 'Natural Titanium', kind: 'island', brand: 'apple', frame: ['#C9C3B8', '#8F897F', '#E6E0D6'], tac: '35391738', seed: 418207, sn: 'K7WQ2HXP9V', carrier: 'Unlocked', battery: 94, os: 'iOS 18.6', res: 'pass', grade: 'A', T: 5200, cable: 'w' },
  { model: 'Galaxy S24 Ultra', cap: '512 GB', color: 'Titanium Gray', kind: 'punch', brand: 'samsung', square: true, frame: ['#9B9893', '#5F5C58', '#C4C1BB'], tac: '35095334', seed: 772615, sn: 'R5CX20B4LMT', carrier: 'T-Mobile · clean', battery: 88, os: 'Android 15', res: 'pass', grade: 'B', T: 6100, cable: 'b' },
  { model: 'iPhone 13', cap: '128 GB', color: 'Midnight', kind: 'notch', brand: 'apple', frame: ['#3A3F47', '#1E2228', '#5A616B'], tac: '35467211', seed: 90534, sn: 'G0NFR3KQ7D', carrier: 'Verizon · unlocked', battery: 81, os: 'iOS 17.6', res: 'fail', fail: 'Face ID', failAt: 9, grade: 'C', T: 5600, cable: 'w' },
  { model: 'Pixel 8 Pro', cap: '128 GB', color: 'Bay', kind: 'punch', brand: 'google', frame: ['#9DB8D6', '#6C8AAE', '#C9DAEC'], tac: '35880241', seed: 301118, sn: '3B151FDJ2006HX', carrier: 'Unlocked', battery: 97, os: 'Android 15', res: 'pass', grade: 'A', T: 4800, cable: 'b' },
  { model: 'iPhone 14 Pro Max', cap: '256 GB', color: 'Deep Purple', kind: 'island', brand: 'apple', frame: ['#6A5B6E', '#41364A', '#8E7E92'], tac: '35428562', seed: 556093, sn: 'H4MPQ9T2XR', carrier: 'AT&T', battery: 86, os: 'iOS 18.1', res: 'locked', grade: '-', T: 1700, cable: 'w' },
  { model: 'iPhone 12', cap: '64 GB', color: 'Blue', kind: 'notch', brand: 'apple', frame: ['#2F5C86', '#1B3B5C', '#5684AE'], tac: '35302511', seed: 648221, sn: 'F2LXK9Q7HG', carrier: 'Unlocked', battery: 79, os: 'iOS 17.5', res: 'pass', grade: 'B', T: 5000, cable: 'w' },
  { model: 'Galaxy S23', cap: '256 GB', color: 'Cream', kind: 'punch', brand: 'samsung', frame: ['#E9E1D2', '#BFB4A2', '#F7F1E6'], tac: '35251873', seed: 214470, sn: 'R5CW31MZK8P', carrier: 'Unlocked', battery: 90, os: 'Android 14', res: 'fail', fail: 'Speaker', failAt: 22, grade: 'C', T: 5900, cable: 'b' },
  { model: 'iPhone 16', cap: '128 GB', color: 'Ultramarine', kind: 'island', brand: 'apple', frame: ['#5C6FE0', '#3443A8', '#8C9BF0'], tac: '35681924', seed: 117304, sn: 'L9DRW2FQ4M', carrier: 'Unlocked', battery: 100, os: 'iOS 18.6', res: 'pass', grade: 'A', T: 4600, cable: 'w' },
  { model: 'Galaxy A54', cap: '128 GB', color: 'Awesome Lime', kind: 'punch', brand: 'samsung', frame: ['#D7E3A6', '#A9B871', '#EAF2C6'], tac: '35473819', seed: 802256, sn: 'R58T60QWD2A', carrier: 'Metro · clean', battery: 92, os: 'Android 14', res: 'pass', grade: 'B', T: 4400, cable: 'b' },
  { model: 'iPhone SE', cap: '64 GB', color: 'Red', kind: 'se', brand: 'apple', frame: ['#C8202F', '#8E1420', '#E2505B'], tac: '35265910', seed: 330972, sn: 'C39XK2HPN7', carrier: 'Unlocked', battery: 89, os: 'iOS 17.7', res: 'pass', grade: 'B', T: 4200, cable: 'w' },
  { model: 'Pixel 7a', cap: '128 GB', color: 'Charcoal', kind: 'punch', brand: 'google', frame: ['#4A4C4F', '#2A2C2E', '#6C6F73'], tac: '35585618', seed: 491633, sn: '2A091JEGR0Q7KL', carrier: 'Unlocked', battery: 95, os: 'Android 15', res: 'pass', grade: 'A', T: 4500, cable: 'b' },
  { model: 'iPhone 11', cap: '64 GB', color: 'White', kind: 'notch', brand: 'apple', frame: ['#E8E6E1', '#BDBAB3', '#F7F6F2'], tac: '35392110', seed: 675118, sn: 'DX3VN8QHMK', carrier: 'Unlocked', battery: 72, os: 'iOS 17.6', res: 'fail', fail: 'Battery', failAt: 35, grade: 'C', T: 5300, cable: 'w' },
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
    spark: e >= SPARK && e < SPARK + 700,
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

const portX = (p) => HUB.x + 64 + p * ((HUB.w - 128) / 11);

function cablePath(g, unplugged, lift) {
  const bootH = Math.max(14, g.w * 0.3);
  const sx = g.cx;
  const sy = BASE + 3 + bootH + (unplugged ? 34 : 0) - lift;
  const ex = portX(g.port);
  const ey = HUB.y + 18;
  const dir = g.side === 'L' ? 1 : -1;
  const outer = g.per - 1 - g.k; // 0 = innermost
  const depth = 44 + outer * 13;
  const c1y = Math.min(612, sy + depth);
  const c2x = ex - dir * (150 + outer * 18);
  const c2y = ey + 16 + outer * 5;
  return `M${sx.toFixed(1)},${sy.toFixed(1)} C${sx.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${ex.toFixed(1)},${ey}`;
}

const MAC_CABLE = `M${MAC_PORT.x},${MAC_PORT.y + 8} C${MAC_PORT.x},${MAC_PORT.y + 70} ${HUB.x + HUB.w + 60},${HUB.y + 26} ${HUB.x + HUB.w - 8},${HUB.y + 24}`;

function statusOf(spec, st) {
  if (!st.conn) return st.ph === 'disc' ? 'Disconnected' : 'Waiting';
  if (st.ph === 'off') return 'Connecting';
  if (st.ph === 'boot') return 'Pairing';
  if (st.ph === 'test') return `Testing ${st.count}/${st.max}`;
  if (spec.res === 'locked') return 'Owner lock on';
  if (spec.res === 'fail') return `Flagged · ${spec.fail}`;
  return `Passed · Grade ${spec.grade}`;
}

function ledOf(spec, st) {
  if (!st.conn) return 'off';
  if (!st.done && st.ph !== 'result') return 'busy';
  if (spec.res === 'locked') return 'amber';
  if (spec.res === 'fail') return 'red';
  return 'green';
}

/* ------------------------------------------------------------------ */

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
        <span className="st-scr-cap">Checking</span>
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
      <span className="st-res-s">{r === 'pass' ? '42/42 passed' : r === 'fail' ? '41/42 passed' : 'Owner lock on'}</span>
    </span>
  );
}

function Phone({ spec, st, g, hot, onEnter, onLeave, onClick }) {
  const style = {
    left: px(g.x, W), top: px(g.y, H), width: px(g.w, W), height: px(g.h, H),
    fontSize: `${(g.w / 16) * 0.1}cqw`,
    '--f1': spec.frame[0], '--f2': spec.frame[1], '--f3': spec.frame[2],
    '--tilt': g.side === 'L' ? '11deg' : '-11deg',
  };
  return (
    <button
      type="button"
      className={`st-phone st-k-${spec.kind} st-b-${spec.brand}${spec.square ? ' st-sq' : ''}${hot ? ' st-hot' : ''}${st.conn ? ' st-on' : ''}`}
      style={style}
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
          <span className="st-ph-glare" />
        </span>
      </span>
    </button>
  );
}

function Field({ show, label, children, w }) {
  if (!show) return <span className="st-f st-f-sk"><span className="st-sk" style={{ width: w }} /></span>;
  return (
    <span className="st-f st-reveal">
      <span className="st-f-l">{label}</span>
      <span className="st-f-v">{children}</span>
    </span>
  );
}

function Card({ spec, st, dev, hot, port, onEnter, onLeave }) {
  if (!dev.seen) {
    return (
      <div className="st-card st-card-empty">
        <span>Port {String(port + 1).padStart(2, '0')}</span>
        <span>Waiting for device</span>
      </div>
    );
  }
  const disc = !st.conn;
  const f = disc ? 6 : st.fields;
  const chip = st.ph === 'result'
    ? spec.res === 'pass' ? ['pass', `PASS 42/42 · ${spec.grade}`] : spec.res === 'fail' ? ['fail', `FAIL · ${spec.fail}`] : ['lock', 'LOCKED']
    : null;
  return (
    <div className={`st-card${hot ? ' st-hot' : ''}${disc ? ' st-disc' : ''}`} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <div className="st-card-h">
        <span className={`st-led st-led-${disc ? 'off' : ledOf(spec, st)}`} />
        {f >= 1 ? <b className="st-reveal">{spec.model}</b> : <span className="st-sk" style={{ width: '62%', height: '0.75em' }} />}
        <span className="st-port">P{String(port + 1).padStart(2, '0')}</span>
      </div>
      <div className="st-card-sub">{f >= 1 ? <span className="st-reveal">{spec.cap} · {spec.color}</span> : <span className="st-sk" style={{ width: '48%' }} />}</div>
      <div className="st-fields">
        <Field show={f >= 2} label="IMEI" w="80%">{spec.imei}</Field>
        <Field show={f >= 3} label="S/N" w="64%">{spec.sn}</Field>
        <Field show={f >= 4} label="Carrier" w="70%">
          {spec.res === 'locked' && f >= 4 && (st.ph === 'result' || disc) ? <span className="st-amber">Owner lock on</span> : spec.carrier}
        </Field>
        <Field show={f >= 5} label="Battery" w="54%">
          <span className="st-batt"><span style={{ width: `${spec.battery}%` }} className={spec.battery < 80 ? 'st-low' : ''} /></span>
          {spec.battery}%
        </Field>
        <Field show={f >= 6} label="OS" w="44%">{spec.os}</Field>
      </div>
      <div className="st-card-f">
        {disc ? (
          <span className="st-chip st-chip-off">Disconnected</span>
        ) : chip ? (
          <>
            <span className={`st-chip st-chip-${chip[0]} st-pop-in`}>{chip[1]}</span>
            <span className={`st-erase${st.er === 'done' ? ' st-erase-ok' : ''}${st.er === 'blocked' ? ' st-erase-no' : ''}`}>
              {st.er === 'done' ? 'Erased · certificate ready' : st.er === 'blocked' ? 'Erase held · owner lock on' : `Erasing · ${st.er}%`}
            </span>
          </>
        ) : (
          <>
            <span className="st-prog-l">{st.ph === 'test' ? <>Testing <b>{st.count}/{st.max}</b></> : st.ph === 'boot' ? 'Pairing with station' : 'Connecting'}</span>
            <span className="st-prog"><span className={st.failing ? 'st-bad' : ''} style={{ width: `${st.ph === 'test' ? (st.count / st.max) * 100 : 4}%` }} /></span>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function Station({ goTrial }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const rootRef = useRef(null);
  const scrollRef = useRef(null);
  const vtRef = useRef(0);
  const speedRef = useRef(1);
  const timersRef = useRef([]);
  const macClicks = useRef([]);
  const reduced = useRef(typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  const [vt, setVt] = useState(0);
  const [visible, setVisible] = useState(false);
  const [started, setStarted] = useState(false);
  const [devs, setDevs] = useState(() => CATALOG.slice(0, 8).map(() => ({ plugAt: null, disc: false, seen: false, known: false })));
  const [hot, setHot] = useState(null);
  const [pop, setPop] = useState(null);
  const [toast, setToast] = useState(null);
  const [turbo, setTurbo] = useState(false);
  const [toaster, setToaster] = useState(false);

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
    const io = new IntersectionObserver(([en]) => setVisible(en.isIntersecting), { threshold: 0.2 });
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
    // narrow screens: start on the left phones, then pan to the display
    const s = scrollRef.current;
    if (s && s.scrollWidth > s.clientWidth + 4) {
      s.scrollLeft = 0;
      later(() => {
        if (scrollRef.current) scrollRef.current.scrollTo({ left: (s.scrollWidth - s.clientWidth) / 2, behavior: 'smooth' });
      }, 3200);
    }
  }, [visible, started]);

  /* center the bench on narrow screens */
  useEffect(() => {
    const s = scrollRef.current;
    if (s && s.scrollWidth > s.clientWidth) s.scrollLeft = (s.scrollWidth - s.clientWidth) / 2;
  }, []);

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
    ? `${n} of ${n} complete · ${passed} passed · ${flagged} flagged`
    : `${done} of ${n} complete · ${testing} testing`;

  /* actions */
  const unplug = (i) => setDevs((ds) => ds.map((d, j) => (j === i ? { ...d, plugAt: null, disc: true, known: true } : d)));
  const replug = (i) => setDevs((ds) => ds.map((d, j) => (j === i ? { ...d, plugAt: vtRef.current + 150, known: true, seen: true } : d)));
  const retest = (i) => setDevs((ds) => ds.map((d, j) => (j === i ? { ...d, plugAt: vtRef.current - BOOT, known: true, seen: true } : d)));
  const addPhone = () => {
    if (n >= MAX_PHONES) {
      setToaster(true);
      say('toaster', 'Unsupported device: toaster', 'No IMEI found · grade: golden brown');
      later(() => setToaster(false), 4200);
      return;
    }
    setDevs((ds) => [...ds, { plugAt: vtRef.current + 450, disc: false, seen: false, known: false }]);
    if (!started) setStarted(true);
  };
  const clickMac = () => {
    const now = performance.now();
    macClicks.current = [...macClicks.current.filter((t) => now - t < 2500), now];
    if (macClicks.current.length >= 5 && !turbo) {
      macClicks.current = [];
      setTurbo(true);
      speedRef.current = 2.6;
      say('turbo', 'Fans at full tilt', 'Bench running at 2.6x for a few seconds');
      later(() => {
        setTurbo(false);
        speedRef.current = 1;
      }, 7000);
    }
  };

  const hotI = hot != null && hot < n ? hot : null;
  const popI = pop != null && pop < n ? pop : null;
  const tipI = popI == null ? hotI : null;
  const anyFlow = sts.some((s) => s.flow);
  const cols = 4;
  const rows = Math.max(2, Math.ceil(n / cols));

  /* draw outer cables last so they sit on top of inner ones */
  const cableOrder = geo.slice().sort((a, b) => b.k - a.k);

  return (
    <div className="st-root" ref={rootRef}>
      <div className="st-head">
        <div className="st-h-l">
          <span className="st-num">03</span>
          <h2>Plug in ten or more of your phones and judge the results yourself.</h2>
        </div>
        <div className="st-h-r">
          <p>Every plan includes intake, device checks and inventory; Growth and up add the Double Puff station app on your own bench.</p>
          <div className="st-ctas">
            <button type="button" className="hv-2 st-cta" onClick={goTrial}>Get started</button>
            <a className="hv-7 st-cta st-cta-o" href="#/contact">Book a walkthrough</a>
          </div>
        </div>
      </div>

      <div className="st-scroll" ref={scrollRef}>
        <div className={`st-scene${turbo ? ' st-turbo' : ''}${reduced.current ? ' st-still' : ''}`}>
          {/* wall stats */}
          <div className="st-wall st-wall-l" aria-hidden="true">
            <span className="st-wall-k">Station</span>
            <span className="st-wall-big">B-04</span>
            <span className="st-wall-k">{connected} of 24 ports live</span>
          </div>
          <div className="st-wall st-wall-r" aria-hidden="true">
            <span><b>{String(testing).padStart(2, '0')}</b>testing</span>
            <span className="st-g"><b>{String(passed).padStart(2, '0')}</b>passed</span>
            <span className="st-r"><b>{String(flagged).padStart(2, '0')}</b>flagged</span>
          </div>

          <svg className="st-svg" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
            <defs>
              <radialGradient id={`${uid}glow`} cx="800" cy="210" r="760" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#F6F2EA" stopOpacity=".09" />
                <stop offset=".45" stopColor="#EB5E12" stopOpacity=".035" />
                <stop offset="1" stopColor="#16130F" stopOpacity="0" />
              </radialGradient>
              <linearGradient id={`${uid}desk`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#1E1A15" />
                <stop offset=".55" stopColor="#2A251F" />
                <stop offset="1" stopColor="#332D26" />
              </linearGradient>
              <linearGradient id={`${uid}deskEdge`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#4A433A" />
                <stop offset=".25" stopColor="#2E2922" />
                <stop offset="1" stopColor="#16130F" />
              </linearGradient>
              <radialGradient id={`${uid}pool`} cx="800" cy="470" r="520" gradientUnits="userSpaceOnUse" gradientTransform="matrix(1 0 0 .22 0 366)">
                <stop offset="0" stopColor="#F6F2EA" stopOpacity=".11" />
                <stop offset="1" stopColor="#F6F2EA" stopOpacity="0" />
              </radialGradient>
              <linearGradient id={`${uid}alu`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#8E8A84" />
                <stop offset=".08" stopColor="#D8D5D0" />
                <stop offset=".5" stopColor="#C4C1BB" />
                <stop offset=".92" stopColor="#DCD9D4" />
                <stop offset="1" stopColor="#8A8680" />
              </linearGradient>
              <linearGradient id={`${uid}aluV`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ECE9E4" />
                <stop offset=".12" stopColor="#D2CFC9" />
                <stop offset=".85" stopColor="#B3AFA8" />
                <stop offset="1" stopColor="#8F8B85" />
              </linearGradient>
              <linearGradient id={`${uid}neck`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#5E5A55" />
                <stop offset=".5" stopColor="#9C9892" />
                <stop offset="1" stopColor="#5A5651" />
              </linearGradient>
              <linearGradient id={`${uid}hub`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#5A544B" />
                <stop offset=".18" stopColor="#3A342D" />
                <stop offset="1" stopColor="#1F1B17" />
              </linearGradient>
              <linearGradient id={`${uid}metal`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#7C7872" />
                <stop offset=".5" stopColor="#EDEAE5" />
                <stop offset="1" stopColor="#7C7872" />
              </linearGradient>
              <linearGradient id={`${uid}bootW`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#B9B3AA" />
                <stop offset=".35" stopColor="#FAF8F4" />
                <stop offset="1" stopColor="#C9C3B9" />
              </linearGradient>
              <linearGradient id={`${uid}bootB`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#0E0C0A" />
                <stop offset=".35" stopColor="#4A453F" />
                <stop offset="1" stopColor="#141210" />
              </linearGradient>
              <linearGradient id={`${uid}deskFade`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#fff" stopOpacity="0" />
                <stop offset=".04" stopColor="#fff" stopOpacity="1" />
                <stop offset=".96" stopColor="#fff" stopOpacity="1" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
              <mask id={`${uid}deskMask`} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
                <rect x="0" y="0" width={W} height={H} fill={`url(#${uid}deskFade)`} />
              </mask>
              <radialGradient id={`${uid}pktG`}>
                <stop offset="0" stopColor="#FFF4EA" />
                <stop offset=".3" stopColor="#FFB27A" />
                <stop offset=".55" stopColor="#EB5E12" stopOpacity=".45" />
                <stop offset="1" stopColor="#EB5E12" stopOpacity="0" />
              </radialGradient>
              <filter id={`${uid}soft`} x="-50%" y="-200%" width="200%" height="500%">
                <feGaussianBlur stdDeviation="5" />
              </filter>
              <filter id={`${uid}pkt`} x="-200%" y="-200%" width="500%" height="500%">
                <feGaussianBlur stdDeviation="2.4" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id={`${uid}hotf`} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" />
              </filter>
            </defs>

            {/* room */}
            <rect x="0" y="0" width={W} height={H} fill={`url(#${uid}glow)`} />
            <g mask={`url(#${uid}deskMask)`}>
              <rect x="0" y="468" width={W} height="152" fill={`url(#${uid}desk)`} />
              <rect x="0" y="468" width={W} height="152" fill={`url(#${uid}pool)`} />
              <rect x="0" y="467.5" width={W} height="1" fill="#F6F2EA" opacity=".05" />
              <rect x="0" y="620" width={W} height="20" fill={`url(#${uid}deskEdge)`} />
              <rect x="0" y="620" width={W} height="1" fill="#8E857A" opacity=".35" />
            </g>

            {/* display stand + shadow */}
            <ellipse cx="800" cy="500" rx="150" ry="7" fill="#000" opacity=".55" filter={`url(#${uid}soft)`} />
            <path d="M738 405 L862 405 L874 492 L726 492 Z" fill={`url(#${uid}neck)`} />
            <rect x="668" y="489" width="264" height="10" rx="5" fill={`url(#${uid}alu)`} />
            <rect x="672" y="489.4" width="256" height="1.4" rx=".7" fill="#fff" opacity=".55" />

            {/* display */}
            <rect x="447" y="9" width="706" height="412" rx="13" fill="#000" opacity=".35" filter={`url(#${uid}soft)`} />
            <rect x="450" y="12" width="700" height="406" rx="12" fill={`url(#${uid}alu)`} />
            <rect x="452.4" y="14.4" width="695.2" height="401.2" rx="10" fill="#0A0908" />
            <circle cx="800" cy="18.6" r="1.7" fill="#1E2630" />
            <circle cx="800" cy="18.6" r=".7" fill="#3E5468" />

            {/* Mac Studio */}
            <g className="st-mac" onClick={clickMac} role="presentation">
              <ellipse cx={MAC.x + MAC.w / 2} cy={MAC.y + MAC.h + 2} rx="96" ry="6" fill="#000" opacity=".6" filter={`url(#${uid}soft)`} />
              <rect x={MAC.x + 10} y={MAC.y + MAC.h - 8} width={MAC.w - 20} height="9" rx="4" fill="#141210" />
              <g className="st-vents">
                {Array.from({ length: 22 }, (_, j) => (
                  <circle key={j} cx={MAC.x + 18 + j * 6.4} cy={MAC.y + MAC.h - 3.4} r="1.25" fill="#3A342D" />
                ))}
              </g>
              <rect x={MAC.x} y={MAC.y} width={MAC.w} height={MAC.h - 6} rx="15" fill={`url(#${uid}aluV)`} />
              <rect x={MAC.x} y={MAC.y} width={MAC.w} height={MAC.h - 6} rx="15" fill={`url(#${uid}alu)`} opacity=".45" />
              <rect x={MAC.x + 12} y={MAC.y + 1} width={MAC.w - 24} height="1.4" rx=".7" fill="#fff" opacity=".8" />
              <rect x={MAC_PORT.x - 4.5} y={MAC_PORT.y - 1.7} width="9" height="3.4" rx="1.7" fill="#1A1816" />
              <rect x={MAC_PORT.x + 11.5} y={MAC_PORT.y - 1.7} width="9" height="3.4" rx="1.7" fill="#1A1816" />
              <rect x={MAC_PORT.x + 29} y={MAC_PORT.y - 1} width="24" height="2" rx="1" fill="#1A1816" />
              <circle cx={MAC.x + 14} cy={MAC.y + MAC.h - 15} r="1.5" fill="#F6F2EA" className="st-pwr" />
              <rect x={MAC.x} y={MAC.y} width={MAC.w} height={MAC.h} fill="transparent" style={{ cursor: 'pointer' }} />
            </g>

            {/* hub -> Mac cable */}
            <g className={`st-cable st-cable-b${anyFlow ? ' st-live' : ''}`}>
              <path d={MAC_CABLE} className="st-c-out" />
              <path d={MAC_CABLE} className="st-c-core" />
              <path d={MAC_CABLE} className="st-c-sheen" />
              <path id={`${uid}mac`} d={`M${HUB.x + HUB.w - 8},${HUB.y + 24} C${HUB.x + HUB.w + 60},${HUB.y + 26} ${MAC_PORT.x},${MAC_PORT.y + 70} ${MAC_PORT.x},${MAC_PORT.y + 8}`} fill="none" stroke="none" />
              <rect x={MAC_PORT.x - 6.5} y={MAC_PORT.y - 3.5} width="13" height="13" rx="4" fill={`url(#${uid}bootB)`} />
              {anyFlow && !reduced.current && [0, 1, 2, 3].map((j) => (
                <circle key={j} r="6" className="st-pkt" fill={`url(#${uid}pktG)`}>
                  <animateMotion dur="1.1s" begin={`${-j * 0.275}s`} repeatCount="indefinite"><mpath href={`#${uid}mac`} /></animateMotion>
                </circle>
              ))}
            </g>

            {/* phone shadows */}
            {geo.map((g) => (
              <ellipse key={`sh${g.i}`} cx={g.cx} cy={BASE + 2} rx={g.w * 0.62} ry="5" fill="#000" opacity=".6" filter={`url(#${uid}soft)`} className="st-phshadow" />
            ))}

            {/* phone cables */}
            {cableOrder.map((g) => {
              const i = g.i;
              const spec = CATALOG[i];
              const st = sts[i];
              const isHot = hotI === i || popI === i;
              const lift = isHot ? 9.6 : 0;
              const d = cablePath(g, !st.conn, lift);
              const bootH = Math.max(14, g.w * 0.3);
              const bw = Math.max(10, g.w * 0.21);
              const pid = `${uid}c${i}`;
              return (
                <g key={`c${i}`} className={`st-cable st-cable-${spec.cable}${isHot ? ' st-hotc' : ''}${st.conn ? ' st-plugged' : ''}`}
                  onMouseEnter={() => setHot(i)} onMouseLeave={() => setHot(null)}>
                  {isHot && <path d={d} style={{ d: `path('${d}')` }} className="st-c-hot" filter={`url(#${uid}hotf)`} />}
                  <path d={d} style={{ d: `path('${d}')` }} className="st-c-out" />
                  <path d={d} style={{ d: `path('${d}')` }} className="st-c-core" />
                  <path d={d} style={{ d: `path('${d}')` }} className="st-c-sheen" />
                  <path id={pid} d={d} fill="none" stroke="none" />
                  <g className="st-plug" style={{ transform: `translateY(${(st.conn ? 0 : 34) - lift}px)` }}>
                    <rect x={g.cx - g.w * 0.075} y={BASE - 6} width={g.w * 0.15} height="10" rx="2" fill={`url(#${uid}metal)`} />
                    <rect x={g.cx - bw / 2} y={BASE + 3} width={bw} height={bootH} rx={bw * 0.28} fill={`url(#${uid}boot${spec.cable === 'w' ? 'W' : 'B'})`} />
                    <path d={`M${g.cx - bw * 0.36},${BASE + 3 + bootH - 1} L${g.cx - 3.2},${BASE + 3 + bootH + 6} L${g.cx + 3.2},${BASE + 3 + bootH + 6} L${g.cx + bw * 0.36},${BASE + 3 + bootH - 1} Z`} fill={`url(#${uid}boot${spec.cable === 'w' ? 'W' : 'B'})`} />
                  </g>
                  {st.spark && !reduced.current && (
                    <g className="st-spark" style={{ transformOrigin: `${g.cx}px ${BASE + 2}px` }}>
                      <circle cx={g.cx} cy={BASE + 2} r="9" fill="#EB5E12" opacity=".5" filter={`url(#${uid}pkt)`} />
                      <circle cx={g.cx} cy={BASE + 2} r="3" fill="#FFE2C8" />
                    </g>
                  )}
                  {st.flow && !reduced.current && [0, 1, 2].map((j) => (
                    <circle key={j} r="6.5" className="st-pkt" fill={`url(#${uid}pktG)`}>
                      <animateMotion dur="1.5s" begin={`${-j * 0.5 - (i % 3) * 0.17}s`} repeatCount="indefinite"><mpath href={`#${pid}`} /></animateMotion>
                    </circle>
                  ))}
                </g>
              );
            })}

            {/* hub */}
            <ellipse cx={HUB.x + HUB.w / 2} cy={HUB.y + HUB.h + 2} rx={HUB.w * 0.52} ry="6" fill="#000" opacity=".7" filter={`url(#${uid}soft)`} />
            <rect x={HUB.x} y={HUB.y} width={HUB.w} height={HUB.h} rx="9" fill={`url(#${uid}hub)`} />
            <rect x={HUB.x + 8} y={HUB.y + 0.6} width={HUB.w - 16} height="1.2" rx=".6" fill="#B9AE9E" opacity=".45" />
            <text x={HUB.x + 14} y={HUB.y + 27} className="st-hub-t">B-04</text>
            <text x={HUB.x + HUB.w - 14} y={HUB.y + 27} className="st-hub-t" textAnchor="end">x24</text>
            {Array.from({ length: 12 }, (_, p) => {
              const gi = geo.find((g) => g.port === p);
              const led = gi ? ledOf(CATALOG[gi.i], sts[gi.i]) : 'off';
              const isHot = gi && (hotI === gi.i || popI === gi.i);
              return (
                <g key={`p${p}`}>
                  <rect x={portX(p) - 6} y={HUB.y + 31} width="12" height="5" rx="2.5" fill="#0D0B09" />
                  <circle cx={portX(p)} cy={HUB.y + 20} r={isHot ? 4 : 3} className={`st-hled st-hled-${led}`} />
                </g>
              );
            })}
          </svg>

          {/* display contents */}
          <div className="st-screen" style={{ left: px(SCREEN.x, W), top: px(SCREEN.y, H), width: px(SCREEN.w, W), height: px(SCREEN.h, H) }}>
            <div className="st-app">
              <div className="st-app-h">
                <img src={LOGO} alt="" />
                <b>Bench intake</b>
                <span className="st-app-st">Station B-04 · {connected} connected</span>
                <span className={`st-live${turbo ? ' st-live-t' : ''}`}>{turbo ? 'Turbo' : 'Live'}</span>
              </div>
              <div className="st-grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`, gridTemplateRows: `repeat(${rows}, minmax(0,1fr))` }} data-rows={rows}>
                {devs.map((d, i) => (
                  <Card key={i} spec={CATALOG[i]} st={sts[i]} dev={d} hot={hotI === i || popI === i} port={geo[i].port}
                    onEnter={() => setHot(i)} onLeave={() => setHot(null)} />
                ))}
                {Array.from({ length: rows * cols - n }, (_, j) => (
                  <div key={`e${j}`} className="st-card st-card-empty st-card-free"><span>Free port</span><span>Plug in a phone</span></div>
                ))}
              </div>
              <div className="st-app-f">
                <span>Auto-erase on · Labels to printer 2</span>
                <span>{summary}</span>
              </div>
              {toast && (
                <div key={toast.id} className={`st-toast st-toast-${toast.kind}`}>
                  {toast.kind === 'toaster' && (
                    <svg viewBox="0 0 48 36" className="st-toaster" aria-hidden="true">
                      <rect x="10" y="2" width="9" height="12" rx="2" fill="#E3B26B" />
                      <rect x="25" y="2" width="9" height="12" rx="2" fill="#C98A3E" />
                      <rect x="3" y="9" width="40" height="24" rx="8" fill="#C9C3B9" />
                      <rect x="3" y="9" width="40" height="5" rx="2.5" fill="#E9E4DC" />
                      <rect x="43" y="17" width="4" height="7" rx="1.5" fill="#6B6257" />
                      <circle cx="12" cy="25" r="2.4" fill="#E5574B" />
                    </svg>
                  )}
                  {toast.kind === 'label' && (
                    <span className="st-barcode" aria-hidden="true">
                      {Array.from({ length: 26 }, (_, j) => <i key={j} style={{ width: `${(((j * 7) % 3) + 1) * 0.06}cqw` }} />)}
                    </span>
                  )}
                  <span><b>{toast.title}</b><small>{toast.sub}</small></span>
                </div>
              )}
            </div>
            <span className="st-screen-glare" />
          </div>

          {/* turbo whoosh */}
          {turbo && (
            <div className="st-whoosh" style={{ left: px(MAC.x + MAC.w / 2, W), top: px(MAC.y - 6, H) }} aria-hidden="true">
              <span>whoosh</span><i /><i /><i />
            </div>
          )}

          {/* phones */}
          <div className="st-phones">
            {geo.map((g) => (
              <Phone key={g.i} spec={CATALOG[g.i]} st={sts[g.i]} g={g} hot={hotI === g.i || popI === g.i}
                onEnter={() => setHot(g.i)} onLeave={() => setHot(null)}
                onClick={() => setPop((p) => (p === g.i ? null : g.i))} />
            ))}
          </div>

          {/* hover tooltip */}
          {tipI != null && (
            <div className={`st-tip st-tip-${geo[tipI].side}`} style={{ left: px(geo[tipI].cx, W), top: px(geo[tipI].y - 14, H) }} role="tooltip">
              <b>{CATALOG[tipI].model}</b>
              <span className="st-tip-sub">{CATALOG[tipI].cap} · {CATALOG[tipI].color}</span>
              <span><em>IMEI</em>{CATALOG[tipI].imei}</span>
              <span><em>Battery</em>{CATALOG[tipI].battery}% health</span>
              <span><em>Carrier</em>{CATALOG[tipI].carrier}</span>
              <span className="st-tip-st"><em>Status</em>{statusOf(CATALOG[tipI], sts[tipI])}</span>
              <span className="st-tip-hint">Click for actions</span>
            </div>
          )}

          {/* click popover */}
          {popI != null && (
            <div className={`st-popover st-tip-${geo[popI].side}`} style={{ left: px(geo[popI].cx, W), top: px(geo[popI].y - 14, H) }}>
              <b>{CATALOG[popI].model}</b>
              <span className="st-tip-sub">{statusOf(CATALOG[popI], sts[popI])}</span>
              <div className="st-pop-acts">
                <button type="button" disabled={!sts[popI].conn} onClick={() => { retest(popI); setPop(null); say('info', `Retesting ${CATALOG[popI].model}`, 'Full 42-point check from the start'); }}>Retest</button>
                <button type="button" disabled={!sts[popI].done} onClick={() => {
                  const s = CATALOG[popI];
                  setPop(null);
                  say('label', `Label printed · ${s.model}`, `${s.cap} · ${s.res === 'pass' ? `Grade ${s.grade}` : s.res === 'fail' ? `Flagged: ${s.fail}` : 'Hold: owner lock'} · …${s.imei.slice(-6)}`);
                }}>Print label</button>
                {sts[popI].conn || devs[popI].plugAt != null
                  ? <button type="button" onClick={() => { unplug(popI); setPop(null); }}>Unplug</button>
                  : <button type="button" className="st-pop-pri" onClick={() => { replug(popI); setPop(null); }}>Plug back in</button>}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="st-foot">
        <span>USB hub · Station B-04 · {connected} of 24 ports</span>
        <span className="st-foot-sum">{summary}</span>
        <span className="st-swipe" aria-hidden="true">Swipe the bench sideways</span>
        <button type="button" className="st-add" onClick={addPhone}>
          <span>+</span> Add phone <em>{n}/{MAX_PHONES}</em>
        </button>
      </div>
    </div>
  );
}
