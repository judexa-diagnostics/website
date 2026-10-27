import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import './heroConsole.css';

/* ------------------------------------------------------------------ data */

const INV = [
  ['Galaxy S23', ['Grade A', '128GB', 'Phantom Black', 'Verizon'], '350917266013448', 'WH-A / 03-B2', 'Warehouse A', 'Reserved', '1d', 649],
  ['Galaxy S23', ['Grade A', '128GB', 'Cream', 'Unlocked'], '350917266013455', 'WH-A / 03-B2', 'Warehouse A', 'Available', '1d', 649],
  ['Galaxy S23', ['Grade B', '256GB', 'Lavender', 'Unlocked'], '350917266029017', 'WH-A / 03-B3', 'Warehouse A', 'Available', '4d', 612],
  ['iPhone 14 Pro', ['Grade A', '128GB', 'Space Black', 'Unlocked'], '356798114520331', 'WH-A / 01-A1', 'Warehouse A', 'Reserved', '2d', 799],
  ['iPhone 14 Pro', ['Grade A', '256GB', 'Deep Purple', 'Verizon'], '356798114520349', 'Northgate Kiosk', 'Northgate Kiosk', 'Available', '6d', 869],
  ['iPhone 14 Pro', ['Grade B', '128GB', 'Silver', 'AT&T'], '356798114598774', 'Bench R-2', 'Repair bench', 'In repair', '1d', 719],
  ['iPhone 13', ['Grade B', '128GB', 'Midnight', 'Unlocked'], '353012119874205', 'WH-A / 02-C4', 'Warehouse A', 'Available', '9d', 429],
  ['iPhone 13', ['Grade C', '128GB', 'Blue', 'T-Mobile'], '353012119802911', 'WH-A / 02-C4', 'Warehouse A', 'On hold', '12d', 355],
  ['Pixel 7', ['Grade A', '128GB', 'Obsidian', 'Unlocked'], '358240501177962', 'Elm St. Store', 'Elm St. Store', 'Available', '3d', 389],
  ['Pixel 8 Pro', ['Grade A', '256GB', 'Bay', 'Unlocked'], '358240512230048', 'Carrier · 1Z84…', 'In transit', 'In transit', '0d', 749],
  ['iPhone 12', ['Grade B', '64GB', 'Blue', 'Unlocked'], '356702108836129', 'WH-A / 04-A1', 'Warehouse A', 'Available', '21d', 279],
  ['Galaxy S22 Ultra', ['Grade B', '256GB', 'Burgundy', 'Verizon'], '350211337650182', 'WH-A / 03-A4', 'Warehouse A', 'Reserved', '5d', 529],
  ['iPhone 11', ['Grade B', '64GB', 'White', 'Unlocked'], '353988103452017', 'Elm St. Store', 'Elm St. Store', 'Available', '14d', 219],
  ['iPad Air (5th)', ['Grade A', '64GB', 'Space Gray', 'Wi-Fi'], '352211098331470', 'WH-A / 05-B1', 'Warehouse A', 'Available', '2d', 419],
].map(([model, chips, imei, loc, locGroup, status, dwell, sell], i) => ({ id: 'd' + i, model, chips, imei, loc, locGroup, status, dwell, sell, flash: 0, isNew: false }));

const ST_COL = {
  Available: ['#E3F1E8', '#1E7A4A'],
  Reserved: ['#FBE7CC', '#8A4A12'],
  'In repair': ['#F6E1DE', '#B3261E'],
  'On hold': ['#EDE6DA', '#3A342D'],
  'In transit': ['#16130F', '#F6F2EA'],
};
const STATUSES = ['All statuses', 'Available', 'Reserved', 'In repair', 'On hold', 'In transit'];
const LOCS = ['All locations', 'Warehouse A', 'Northgate Kiosk', 'Elm St. Store', 'Repair bench', 'Outbound', 'In transit'];

const DESTS = [
  { loc: 'WH-A / 02-C4', group: 'Warehouse A', sub: 'Shelf 02 · bin C4 · 41 units', bin: 'WHA-02-C4' },
  { loc: 'Bench R-2', group: 'Repair bench', sub: 'Repair · Andre · 3 in queue', bin: 'BENCH-R2', status: 'In repair' },
  { loc: 'Northgate Kiosk', group: 'Northgate Kiosk', sub: 'Store · display case 2', bin: 'NGK-CASE-2' },
  { loc: 'Elm St. Store', group: 'Elm St. Store', sub: 'Store · back room', bin: 'ELM-BACK-1' },
  { loc: 'Outbound dock', group: 'Outbound', sub: 'Ships today · 4:00 PM pickup', bin: 'DOCK-OUT-1' },
];

const MENUS = [
  { key: 'intel', label: 'Inventory Intelligence', items: [
    ['Aging & dwell time'], ['Stock by location'], ['Margin by model & grade'], ['Slow movers'],
    ['Find the charger nobody returned', 'Last seen: “borrowed for a sec” in 2023. Case still open.'],
    ['Predict next sale', 'Model predicts: iPhone 11. Model always predicts iPhone 11. Model is usually right.'],
  ] },
  { key: 'ops', label: 'Device Operations', items: [
    ['Receive devices'], ['Diagnostics queue'], ['Erasure certificates'], ['Grading queue'], ['Repair tickets'],
    ['Un-crack screen (beta)', 'Un-crack screen is in beta. Status: does not work. Please use the repair bench.'],
    ['Ask the phone how it feels', 'Phone says: “battery 87%, emotionally 100%.” Logged to the device record.'],
  ] },
  { key: 'price', label: 'Pricing & Market', items: [
    ['Price lists'], ['Buy offers'], ['Market trends'], ['Floor prices'],
    ['Convince customer 64 GB is enough', 'Drafting: “Have you considered… fewer photos of your lunch?”'],
    ['Haggle with yourself', 'You offered $400. You countered $420. You both feel great about it.'],
  ] },
  { key: 'adv', label: 'Advanced', items: [
    ['Locations & bins'], ['Users & roles'], ['Label printing'], ['Audit trail'],
    ['Locate drawer of mystery cables', 'Found it. Estimated 4,000 cables, 0 that fit anything you own.'],
    ['Turn it off and on again', 'Done. Everything is fine now. (It was already fine.)'],
  ] },
];

const NEW_MODELS = [
  ['iPhone 15', ['128GB', '256GB'], ['Black', 'Pink', 'Blue'], 712],
  ['iPhone 13 mini', ['128GB'], ['Starlight', 'Midnight'], 389],
  ['Galaxy S24', ['128GB', '256GB'], ['Onyx Black', 'Marble Gray'], 598],
  ['Pixel 8', ['128GB'], ['Hazel', 'Obsidian', 'Rose'], 459],
  ['Galaxy Z Flip5', ['256GB'], ['Mint', 'Graphite'], 549],
  ['iPhone SE (3rd)', ['64GB', '128GB'], ['Midnight', '(PRODUCT)RED'], 189],
  ['Galaxy A54', ['128GB'], ['Awesome Lime', 'Awesome Graphite'], 219],
  ['iPhone 14', ['128GB', '256GB'], ['Purple', 'Midnight', 'Starlight'], 579],
];
const TACS = { iPhone: ['35679811', '35301211', '35398810', '35670210'], Galaxy: ['35091726', '35021133'], Pixel: ['35824050', '35824051'] };
const CARRIERS = ['Unlocked', 'Unlocked', 'Verizon', 'AT&T', 'T-Mobile'];

const VIBES = [
  'Vibe check: passed.',
  'Previous owner: dropped it once, felt bad.',
  'Screen time last owner: we will not say.',
  'Has never seen the inside of a pool. Probably.',
  'Ringtone left on: default marimba. Classic.',
  'Case history: 3 cases, 1 with glitter.',
];

const SEARCH_EGGS = [
  [/brick/, 'No bricks in stock. We fixed all of them.'],
  [/flip ?phone|razr/, 'Flip phones are on display at the museum, aisle 2003.'],
  [/nokia|3310/, 'The 3310 does not need inventory. It needs a pedestal.'],
  [/charger|cable/, 'Chargers are never in stock. Nobody knows why. Nobody ever will.'],
  [/pager|beeper/, 'Pagers: 0 in stock. 1 doctor still asking.'],
  [/headphone jack/, 'Searching the archives… found one, in a museum.'],
];

const WEEK = [['Mon', 42], ['Tue', 97], ['Wed', 51], ['Thu', 58], ['Fri', 66], ['Sat', 39], ['Sun', 24]];
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

/* --------------------------------------------------------------- helpers */

const money = n => '$' + Math.round(n).toLocaleString('en-US');
const pick = a => a[Math.floor(Math.random() * a.length)];
const luhnDigit = body => {
  let sum = 0;
  for (let i = 0; i < body.length; i++) {
    let d = +body[body.length - 1 - i];
    if (i % 2 === 0) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  return String((10 - (sum % 10)) % 10);
};
const luhnOk = s => /^\d{15}$/.test(s) && luhnDigit(s.slice(0, 14)) === s[14];
const makeImei = model => {
  const fam = model.startsWith('iPhone') ? 'iPhone' : model.startsWith('Pixel') ? 'Pixel' : 'Galaxy';
  let body = pick(TACS[fam]);
  while (body.length < 14) body += Math.floor(Math.random() * 10);
  return body + luhnDigit(body);
};
const clock = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function useTicker(value, ms = 650) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = from.current;
    if (start === value || reducedMotion()) { from.current = value; setShown(value); return undefined; }
    let raf; const t0 = performance.now();
    const step = t => {
      const p = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - p, 3);
      const v = start + (value - start) * e;
      from.current = v; setShown(v);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);
  return shown;
}

/* --------------------------------------------------------------- reducer */

const INIT = {
  rows: INV, sel: {}, q: '', fStatus: 'All statuses', fLoc: 'All locations', page: 0,
  carts: 2, cartSeq: 213, quoteSeq: 1042, quotes: 15, inStock: 1406, available: 1122, value: 612480,
  menu: null, modal: null, drawer: null, note: '', updated: '9:47 AM', bump: {}, splus: false, moveNudge: 0,
};

function reducer(s, a) {
  switch (a.type) {
    case 'set': return { ...s, ...a.v };
    case 'filter': return { ...s, [a.k]: a.v, page: 0 };
    case 'clear': return { ...s, q: '', fStatus: 'All statuses', fLoc: 'All locations', page: 0 };
    case 'toggle': return { ...s, sel: { ...s.sel, [a.id]: !s.sel[a.id] }, note: '' };
    case 'selMany': { const sel = { ...s.sel }; a.ids.forEach(id => { sel[id] = a.on; }); return { ...s, sel, note: '' }; }
    case 'page': return { ...s, page: a.v };
    case 'menu': return { ...s, menu: s.menu === a.v ? null : a.v };
    case 'modal': return { ...s, modal: a.v, menu: null };
    case 'nudge': return { ...s, note: 'Select rows to move them', moveNudge: s.moveNudge + 1 };
    case 'openMove': {
      const ids = s.rows.filter(r => s.sel[r.id]).map(r => r.id);
      if (!ids.length) return { ...s, note: 'Select rows to move them', moveNudge: s.moveNudge + 1 };
      return { ...s, menu: null, modal: null, drawer: { step: 'pick', ids, dest: null, scanned: 0, beep: false, cartNo: 'MC-0' + (s.cartSeq + 1), byDemo: !!a.byDemo } };
    }
    case 'dest': return s.drawer && s.drawer.step === 'pick' ? { ...s, drawer: { ...s.drawer, dest: a.v } } : s;
    case 'scan': return s.drawer ? { ...s, drawer: { ...s.drawer, step: 'scan', scanned: 0, beep: false } } : s;
    case 'beep': return s.drawer ? { ...s, drawer: { ...s.drawer, beep: true } } : s;
    case 'scanned': return s.drawer ? { ...s, drawer: { ...s.drawer, scanned: a.n } } : s;
    case 'cartDone': {
      const d = s.drawer; if (!d) return s;
      return { ...s, sel: {}, carts: s.carts + 1, cartSeq: s.cartSeq + 1, drawer: { ...d, step: 'done' }, bump: { ...s.bump, carts: Date.now() } };
    }
    case 'applyCart': {
      const d = s.drawer; if (!d) return s;
      const dest = DESTS[d.dest], now = Date.now();
      const rows = s.rows.map(r => d.ids.includes(r.id)
        ? { ...r, loc: dest.loc, locGroup: dest.group, status: dest.status || (r.status === 'In transit' ? 'Available' : r.status), dwell: '0d', flash: now }
        : r);
      return { ...s, rows, drawer: null, updated: 'just now' };
    }
    case 'closeDrawer': return { ...s, drawer: null };
    case 'demoAbort': {
      if (s.drawer && s.drawer.step !== 'pick') return s;
      return { ...s, sel: {}, drawer: null };
    }
    case 'addRow': {
      const now = Date.now();
      return { ...s, rows: [{ ...a.row, flash: now, isNew: true }, ...s.rows], page: 0, inStock: s.inStock + 1, available: s.available + 1, value: s.value + a.row.sell, updated: 'just now', bump: { ...s.bump, inStock: now } };
    }
    case 'quoteSent': return { ...s, quotes: s.quotes + 1, quoteSeq: s.quoteSeq + 1, sel: {}, updated: 'just now', bump: { ...s.bump, quotes: Date.now() } };
    case 'splus': return { ...s, splus: a.v };
    default: return s;
  }
}

/* ------------------------------------------------------------- component */

export default function HeroConsole() {
  const [s, dispatch] = useReducer(reducer, INIT);
  const [toasts, setToasts] = useState([]);
  const [cursor, setCursor] = useState({ x: 0, y: 0, on: false, click: 0 });
  const [confetti, setConfetti] = useState(null);
  const wrapRef = useRef(null);
  const sRef = useRef(s); sRef.current = s;
  const timers = useRef(new Set());
  const run = useRef(0);
  const demoActive = useRef(false);
  const interacted = useRef(false);
  const inView = useRef(false);
  const demoCount = useRef(0);

  const later = useCallback((fn, ms) => {
    const t = setTimeout(() => { timers.current.delete(t); fn(); }, ms);
    timers.current.add(t);
    return t;
  }, []);
  useEffect(() => () => { timers.current.forEach(clearTimeout); timers.current.clear(); run.current++; }, []);

  const toast = useCallback((text, kind = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t.slice(-2), { id, text, kind }]);
    later(() => setToasts(t => t.filter(x => x.id !== id)), 4200);
  }, [later]);

  /* ---- derived table */
  const q = s.q.trim().toLowerCase();
  const vis = s.rows.filter(r =>
    (s.fStatus === 'All statuses' || r.status === s.fStatus) &&
    (s.fLoc === 'All locations' || r.locGroup === s.fLoc) &&
    (!q || (r.model + ' ' + r.chips.join(' ') + ' ' + r.imei + ' ' + r.loc + ' ' + r.status).toLowerCase().includes(q)));
  const pages = Math.max(1, Math.ceil(vis.length / 8));
  const pg = Math.min(s.page, pages - 1);
  const shown = vis.slice(pg * 8, pg * 8 + 8);
  const selIds = s.rows.filter(r => s.sel[r.id]).map(r => r.id);
  const selCount = selIds.length;
  const allSel = shown.length > 0 && shown.every(r => s.sel[r.id]);
  const egg = !vis.length && q ? (SEARCH_EGGS.find(([re]) => re.test(q)) || [])[1] : null;

  /* ---- move cart */
  const startScan = useCallback(() => {
    const d = sRef.current.drawer;
    if (!d || d.step !== 'pick' || d.dest == null) return;
    const n = d.ids.length, rm = reducedMotion();
    const beepAt = rm ? 300 : 1250, gap = rm ? 120 : 420;
    dispatch({ type: 'scan' });
    later(() => dispatch({ type: 'beep' }), beepAt);
    for (let i = 1; i <= n; i++) later(() => dispatch({ type: 'scanned', n: i }), beepAt + 250 + gap * i);
    const doneAt = beepAt + 250 + gap * n + 450;
    later(() => dispatch({ type: 'cartDone' }), doneAt);
    later(() => {
      dispatch({ type: 'applyCart' });
      toast(`${d.cartNo} complete · ${n} device${n > 1 ? 's' : ''} now at ${DESTS[d.dest].loc}`, 'ok');
    }, doneAt + 1700);
  }, [later, toast]);

  const openMove = useCallback(byDemo => {
    dispatch({ type: 'openMove', byDemo });
  }, []);

  /* ---- menus / outside click / escape */
  useEffect(() => {
    const onDown = e => {
      const st = sRef.current;
      if (st.menu && !e.target.closest('[data-hc-pop]')) dispatch({ type: 'set', v: { menu: null } });
    };
    const onKey = e => {
      if (e.key !== 'Escape') return;
      const st = sRef.current;
      if (st.menu) dispatch({ type: 'set', v: { menu: null } });
      else if (st.modal) dispatch({ type: 'modal', v: null });
      else if (st.drawer && st.drawer.step === 'pick') dispatch({ type: 'closeDrawer' });
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); };
  }, []);

  const menuItem = (label, eggText) => {
    dispatch({ type: 'set', v: { menu: null } });
    if (eggText) toast(eggText, 'egg');
    else toast(`Opening ${label}…`);
  };

  /* ---- konami */
  useEffect(() => {
    let buf = [];
    const onKey = e => {
      if (!inView.current) return;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      buf = [...buf, k].slice(-KONAMI.length);
      if (buf.join() === KONAMI.join()) {
        buf = [];
        dispatch({ type: 'splus', v: true });
        if (!reducedMotion()) setConfetti(Date.now());
        toast('Cheat code accepted. Every phone is now grade S+ (for 5 seconds).', 'egg');
        later(() => dispatch({ type: 'splus', v: false }), 5000);
        later(() => setConfetti(null), 3600);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [later, toast]);

  /* ---- autoplay demo */
  const abortDemo = useCallback(() => {
    run.current++;
    if (demoActive.current) {
      demoActive.current = false;
      dispatch({ type: 'demoAbort' });
    }
    setCursor(c => ({ ...c, on: false }));
  }, []);

  const playDemo = useCallback(async () => {
    const id = ++run.current;
    const ABORT = {};
    const sleep = ms => new Promise((res, rej) => later(() => (run.current === id ? res() : rej(ABORT)), ms));
    const wrap = wrapRef.current;
    const moveTo = async sel => {
      const el = wrap && wrap.querySelector(sel);
      if (!el) throw ABORT;
      const a = wrap.getBoundingClientRect(), b = el.getBoundingClientRect();
      setCursor(c => ({ ...c, on: true, x: b.left - a.left + b.width / 2, y: b.top - a.top + b.height / 2 }));
      await sleep(820);
    };
    const click = async () => { setCursor(c => ({ ...c, click: c.click + 1 })); await sleep(200); };
    demoActive.current = true;
    try {
      const st = sRef.current;
      if (st.q || st.fStatus !== 'All statuses' || st.fLoc !== 'All locations' || st.page) dispatch({ type: 'clear' });
      if (Object.values(st.sel).some(Boolean)) dispatch({ type: 'set', v: { sel: {} } });
      const destIdx = [1, 2, 0, 3, 4][demoCount.current % 5];
      const dest = DESTS[destIdx];
      const startPick = [0, 6, 3][demoCount.current % 3];
      demoCount.current++;
      const r = wrap.getBoundingClientRect();
      setCursor(c => ({ ...c, on: false, x: r.width * 0.82, y: r.height * 0.92 }));
      await sleep(80);
      setCursor(c => ({ ...c, on: true }));
      await sleep(450);
      const cand = sRef.current.rows.slice(0, 8).map((row, i) => ({ row, i }))
        .filter(({ row }) => row.loc !== dest.loc);
      const picks = [];
      for (let k = 0; k < cand.length && picks.length < 3; k++) picks.push(cand[(startPick + k * 2) % cand.length].row.id);
      const uniq = [...new Set(picks)];
      for (const rid of uniq) {
        await moveTo(`[data-hc-row="${rid}"] .hc-cb`);
        await click();
        dispatch({ type: 'selMany', ids: [rid], on: true });
        await sleep(260);
      }
      await moveTo('.hc-move');
      await click();
      openMove(true);
      await sleep(900);
      await moveTo(`[data-hc-dest="${destIdx}"]`);
      await click();
      dispatch({ type: 'dest', v: destIdx });
      await sleep(500);
      await moveTo('.hc-confirm');
      await click();
      startScan();
      demoActive.current = false;
      await sleep(700);
      setCursor(c => ({ ...c, on: false }));
      return true;
    } catch (e) {
      if (e !== ABORT) throw e;
      if (run.current === id) { demoActive.current = false; dispatch({ type: 'demoAbort' }); setCursor(c => ({ ...c, on: false })); }
      return false;
    }
  }, [later, openMove, startScan]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || typeof IntersectionObserver === 'undefined') return undefined;
    if (reducedMotion()) return undefined;
    let idle = null;
    const busy = () => { const st = sRef.current; return st.modal || st.drawer || st.menu; };
    const schedule = ms => {
      clearTimeout(idle);
      idle = setTimeout(async () => {
        if (interacted.current || !inView.current) return;
        if (wrap.offsetWidth < 620 || busy()) { schedule(4000); return; }
        const ok = await playDemo().catch(() => false);
        if (ok && !interacted.current && inView.current) schedule(9000 + 4500);
      }, ms);
    };
    const io = new IntersectionObserver(([en]) => {
      inView.current = en.isIntersecting && en.intersectionRatio > 0.35;
      if (inView.current) { if (!interacted.current) schedule(6000); }
      else { clearTimeout(idle); if (demoActive.current) abortDemo(); }
    }, { threshold: [0, 0.35, 0.6] });
    io.observe(wrap);
    return () => { io.disconnect(); clearTimeout(idle); };
  }, [playDemo, abortDemo]);

  const onReal = e => {
    if (!e.nativeEvent.isTrusted) return;
    if (!interacted.current) { interacted.current = true; abortDemo(); }
  };

  /* ---- add inventory, lookup, sales handled in modals below */
  const addRow = row => { dispatch({ type: 'addRow', row }); dispatch({ type: 'modal', v: null }); toast(`${row.model} received · IMEI …${row.imei.slice(-4)} put away at ${row.loc}`, 'ok'); };

  /* ---- render */
  const inStock = useTicker(s.inStock), avail = useTicker(s.available), value = useTicker(s.value);
  const drawer = s.drawer;
  const drawerRows = drawer ? drawer.ids.map(id => s.rows.find(r => r.id === id)).filter(Boolean) : [];

  return (
    <div className="hc-root" onPointerDownCapture={onReal} onKeyDownCapture={onReal}>
      <div className="hc-wrap" ref={wrapRef}>
        <div className="hc-frame">
          <div className="hc-scroll">
            <div className="hc-inner">
              {/* app bar */}
              <div className="hc-bar">
                <div className="hc-bar-l">
                  <span className="hc-brand">InPhox</span>
                  {MENUS.slice(0, 2).map(m => <Menu key={m.key} m={m} open={s.menu === m.key} dispatch={dispatch} onItem={menuItem} />)}
                  <button type="button" className="hc-bar-btn" onClick={() => toast('Opening Shipping… 4 boxes outbound, 0 taped to the ceiling.')}>Shipping</button>
                  {MENUS.slice(2).map(m => <Menu key={m.key} m={m} open={s.menu === m.key} dispatch={dispatch} onItem={menuItem} />)}
                </div>
                <div className="hc-bar-r">
                  <span className="hc-live"><i />Live</span>
                  <span>Northgate Wireless · Dallas</span>
                  <span className="hc-av">NW</span>
                </div>
              </div>

              {/* title + actions */}
              <div className="hc-head">
                <div className="hc-title">
                  <span>Inventory</span>
                  <span className="hc-upd">Updated {s.updated}</span>
                </div>
                <div className="hc-actions">
                  <button type="button" className="hc-btn" onClick={() => dispatch({ type: 'modal', v: 'lookup' })}>Quick lookup</button>
                  <button type="button" className="hc-btn" onClick={() => dispatch({ type: 'modal', v: 'add' })}>Add inventory</button>
                  <button type="button" key={s.moveNudge} className={'hc-btn hc-move' + (selCount ? ' is-on' : '') + (s.moveNudge ? ' is-nudge' : '')} aria-disabled={!selCount} onClick={() => openMove(false)}>
                    Move selected{selCount ? ` (${selCount})` : ''}
                  </button>
                  <button type="button" className="hc-btn" onClick={() => dispatch({ type: 'modal', v: 'sales' })}>Sales order</button>
                  <span className="hc-pop-anchor" data-hc-pop>
                    <button type="button" className={'hc-btn' + (s.menu === 'reports' ? ' is-pressed' : '')} aria-expanded={s.menu === 'reports'} onClick={() => dispatch({ type: 'menu', v: 'reports' })}>Reports</button>
                    {s.menu === 'reports' && <Reports />}
                  </span>
                </div>
              </div>

              {/* KPIs */}
              <div className="hc-kpis">
                <Kpi label="IN STOCK" val={Math.round(inStock).toLocaleString('en-US')} accent bump={s.bump.inStock} />
                <Kpi label="AVAILABLE" val={Math.round(avail).toLocaleString('en-US')} bar={avail / inStock} />
                <Kpi label="ON HOLD" val="38" />
                <Kpi label="IN TRANSIT" val="64" />
                <Kpi label="SELL VALUE" val={money(value)} />
              </div>
              <div className="hc-strip">
                <span>Open repairs <b>7</b></span>
                <span>Open quotes <b key={'q' + (s.bump.quotes || 0)} className={s.bump.quotes ? 'hc-bump' : ''}>{s.quotes}</b></span>
                <span>Open sales <b>22</b></span>
                <span>Open invoices <b>5</b></span>
                <span>Open offers <b>3</b></span>
                <span>Outbound <b>4</b></span>
                <span>Move carts <b key={'c' + (s.bump.carts || 0)} className={s.bump.carts ? 'hc-bump' : ''}>{s.carts}</b></span>
              </div>

              {/* filters */}
              <div className="hc-filters">
                <input className="hc-in" value={s.q} onChange={e => dispatch({ type: 'filter', k: 'q', v: e.target.value })} placeholder="Search model, grade, IMEI, location…" aria-label="Search inventory" />
                <select className="hc-in" value={s.fStatus} onChange={e => dispatch({ type: 'filter', k: 'fStatus', v: e.target.value })} aria-label="Status">
                  {STATUSES.map(o => <option key={o}>{o}</option>)}
                </select>
                <select className="hc-in" value={s.fLoc} onChange={e => dispatch({ type: 'filter', k: 'fLoc', v: e.target.value })} aria-label="Location">
                  {LOCS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="hc-meta">
                <span>Showing <b>{vis.length ? `${pg * 8 + 1}–${pg * 8 + shown.length} of ${vis.length}` : '0 of 0'}</b>{selCount ? <span className="hc-selnote"> · {selCount} selected</span> : null}</span>
                <span className="hc-note">{s.note}</span>
              </div>

              {/* table */}
              <div className="hc-table" role="table" aria-label="Devices">
                <div className="hc-tr hc-th" role="row">
                  <button type="button" className={'hc-cb hc-cb-all' + (allSel ? ' is-on' : '')} aria-label="Select all on page" aria-pressed={allSel}
                    onClick={() => dispatch({ type: 'selMany', ids: shown.map(r => r.id), on: !allSel })}>{allSel ? '✓' : ''}</button>
                  <span>MODEL</span><span>VARIANT</span><span>IMEI</span><span>LOCATION</span><span>STATUS</span><span>DWELL</span><span className="hc-r">SELL</span>
                </div>
                <div className="hc-tbody">
                  {shown.map(r => {
                    const sel = !!s.sel[r.id], c = ST_COL[r.status] || ST_COL['On hold'];
                    const scanning = drawer && drawer.ids.includes(r.id) && drawer.step !== 'pick';
                    return (
                      <div key={r.id} data-hc-row={r.id} role="row" className={'hc-tr' + (sel ? ' is-sel' : '') + (r.isNew ? ' is-new' : '') + (scanning ? ' is-scan' : '')}
                        onClick={() => dispatch({ type: 'toggle', id: r.id })}>
                        <button type="button" className={'hc-cb' + (sel ? ' is-on' : '')} aria-label={`Select ${r.model} ${r.imei.slice(-4)}`} aria-pressed={sel}
                          onClick={e => { e.stopPropagation(); dispatch({ type: 'toggle', id: r.id }); }}>{sel ? '✓' : ''}</button>
                        <span className="hc-model">{r.isNew && <em className="hc-newtag">NEW</em>}{r.model}</span>
                        <span className="hc-chips">
                          {r.chips.map((t, j) => (
                            <span key={j} className={'hc-chip' + (j === 0 ? ' is-grade' : '') + (j === 0 && s.splus ? ' is-splus' : '')}>{j === 0 && s.splus ? 'Grade S+' : t}</span>
                          ))}
                        </span>
                        <span className="hc-mono">{r.imei}</span>
                        <span className="hc-loc"><span key={r.flash} className={r.flash ? 'hc-flash' : ''}>{r.loc}</span></span>
                        <span><span className="hc-badge" style={{ background: c[0], color: c[1] }}>{r.status}</span></span>
                        <span className="hc-mono hc-mut">{r.dwell}</span>
                        <span className="hc-mono hc-r">{money(r.sell)}</span>
                      </div>
                    );
                  })}
                  {!vis.length && (
                    <div className="hc-empty">
                      {egg ? <span className="hc-egg">{egg} </span> : 'No devices match these filters. '}
                      <button type="button" className="hc-link" onClick={() => dispatch({ type: 'clear' })}>Clear filters</button>
                    </div>
                  )}
                </div>
                <div className="hc-pager">
                  <span>Page {pg + 1} / {pages}</span>
                  <button type="button" aria-label="Previous page" onClick={() => dispatch({ type: 'page', v: Math.max(0, pg - 1) })}>‹</button>
                  <button type="button" aria-label="Next page" onClick={() => dispatch({ type: 'page', v: Math.min(pages - 1, pg + 1) })}>›</button>
                </div>
              </div>
            </div>
          </div>

          {/* move cart drawer */}
          {drawer && <div className={'hc-scrim' + (drawer.step === 'done' ? ' is-out' : '')} onClick={() => drawer.step === 'pick' && dispatch({ type: 'closeDrawer' })} />}
          {drawer && (
            <MoveDrawer d={drawer} rows={drawerRows} dispatch={dispatch} onConfirm={startScan} />
          )}

          {s.modal && (
            <div className="hc-modal-scrim" onClick={e => { if (e.target === e.currentTarget) dispatch({ type: 'modal', v: null }); }}>
              {s.modal === 'lookup' && <Lookup rows={s.rows} close={() => dispatch({ type: 'modal', v: null })} later={later} />}
              {s.modal === 'add' && <AddInventory close={() => dispatch({ type: 'modal', v: null })} onAdd={addRow} later={later} />}
              {s.modal === 'sales' && (
                <SalesOrder rows={selCount ? s.rows.filter(r => s.sel[r.id]).slice(0, 4) : [s.rows.find(r => r.id === 'd4'), s.rows.find(r => r.id === 'd8')].filter(Boolean)}
                  quoteNo={'Q-' + s.quoteSeq} later={later}
                  close={() => dispatch({ type: 'modal', v: null })}
                  onSend={no => { dispatch({ type: 'quoteSent' }); dispatch({ type: 'modal', v: null }); toast(`Quote ${no} sent to Ortega Mobile Wholesale`, 'ok'); }} />
              )}
            </div>
          )}

          {confetti && <Confetti key={confetti} />}

          <div className="hc-toasts" aria-live="polite">
            {toasts.map(t => <div key={t.id} className={'hc-toast is-' + t.kind}>{t.kind === 'ok' ? <i className="hc-tick">✓</i> : t.kind === 'egg' ? <i className="hc-spark">✦</i> : null}<span>{t.text}</span></div>)}
          </div>
        </div>

        <svg className={'hc-cursor' + (cursor.on ? ' is-on' : '')} style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }} viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path d="M3 2 L3 19 L7.6 14.8 L10.6 21.4 L13.6 20 L10.7 13.6 L17 13.4 Z" fill="#16130F" stroke="#FFFFFF" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
        {cursor.on && cursor.click > 0 && <span key={cursor.click} className="hc-ripple" style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }} />}
      </div>
      <span className="hc-caption">Live preview of the inventory view. Select a few rows and move them, or just watch. <span className="hc-psst">psst: ↑↑↓↓←→←→BA</span></span>
    </div>
  );
}

/* --------------------------------------------------------- subcomponents */

function Menu({ m, open, dispatch, onItem }) {
  return (
    <span className="hc-pop-anchor" data-hc-pop>
      <button type="button" className={'hc-bar-btn' + (open ? ' is-open' : '')} aria-expanded={open} aria-haspopup="menu" onClick={() => dispatch({ type: 'menu', v: m.key })}>
        {m.label} <span className="hc-caret">▾</span>
      </button>
      {open && (
        <div className="hc-dd" role="menu">
          {m.items.map(([label, eggText], i) => (
            <button type="button" role="menuitem" key={label} className={'hc-dd-item' + (eggText ? ' is-egg' : '') + (eggText && i > 0 && !m.items[i - 1][1] ? ' is-first-egg' : '')} onClick={() => onItem(label, eggText)}>
              {label}{eggText && <span className="hc-dd-tag">lab</span>}
            </button>
          ))}
        </div>
      )}
    </span>
  );
}

function Kpi({ label, val, accent, bar, bump }) {
  return (
    <div className={'hc-kpi' + (accent ? ' is-accent' : '')}>
      <div className="hc-kpi-l">{label}</div>
      <div key={bump || 0} className={'hc-kpi-v' + (bump ? ' hc-bump' : '')}>{val}</div>
      {bar != null && <div className="hc-kpi-bar"><i style={{ transform: `scaleX(${Math.min(1, bar)})` }} /></div>}
    </div>
  );
}

function Reports() {
  const max = 100, W = 224, H = 86, bw = 20, gap = (W - bw * 7) / 6;
  return (
    <div className="hc-dd hc-reports" role="dialog" aria-label="Units sold this week">
      <div className="hc-rep-h"><span>Units sold this week</span><b>377</b></div>
      <svg viewBox={`0 0 ${W} ${H + 16}`} className="hc-rep-svg" role="img" aria-label="Units sold per day, Tuesday highest at 97">
        <line x1="0" x2={W} y1={H} y2={H} stroke="#D9D0C2" strokeWidth="1" />
        {WEEK.map(([d, v], i) => {
          const h = (v / max) * (H - 8), x = i * (bw + gap), y = H - h;
          const top = Math.min(4, h / 2);
          return (
            <g key={d} className="hc-rep-bar" style={{ animationDelay: `${i * 60}ms` }}>
              <title>{`${d}: ${v} units`}</title>
              <rect x={x - 3} y="0" width={bw + 6} height={H} fill="transparent" />
              <path d={`M${x},${H} V${y + top} Q${x},${y} ${x + top},${y} H${x + bw - top} Q${x + bw},${y} ${x + bw},${y + top} V${H} Z`} fill={d === 'Tue' ? 'var(--pmm-brand)' : '#E3B48E'} />
              <text x={x + bw / 2} y={H + 12} textAnchor="middle" className="hc-rep-x">{d[0]}</text>
              {d === 'Tue' && <text x={x + bw / 2} y={y - 3} textAnchor="middle" className="hc-rep-val">97</text>}
            </g>
          );
        })}
      </svg>
      <div className="hc-rep-cap">Tuesday was a lot.</div>
      <div className="hc-rep-foot"><span>Avg margin <b>24.8%</b></span><span>Avg dwell <b>6.2d</b></span></div>
    </div>
  );
}

function Barcode({ code }) {
  const bars = useMemo(() => {
    const out = []; let x = 0;
    let h = 2166136261;
    for (const c of code) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
    const rnd = () => { h = (Math.imul(h, 1664525) + 1013904223) >>> 0; return h / 4294967296; };
    while (x < 194) {
      const w = 1 + Math.floor(rnd() * 3), g = 1 + Math.floor(rnd() * 2);
      out.push([x, w]); x += w + g;
    }
    return out;
  }, [code]);
  return (
    <svg viewBox="0 0 200 54" className="hc-barcode" aria-hidden="true">
      {bars.map(([x, w], i) => <rect key={i} x={x + 2} y="2" width={w} height="40" fill="#16130F" />)}
      <text x="100" y="52" textAnchor="middle" className="hc-bc-t">{code}</text>
    </svg>
  );
}

function MoveDrawer({ d, rows, dispatch, onConfirm }) {
  const dest = d.dest != null ? DESTS[d.dest] : null;
  const stepN = d.step === 'pick' ? (dest ? 2 : 1) : 3;
  const autoFocus = useRef(null);
  useEffect(() => { if (!d.byDemo && autoFocus.current) autoFocus.current.focus({ preventScroll: true }); }, [d.byDemo]);
  return (
    <aside className={'hc-drawer' + (d.step === 'done' ? ' is-done' : '')} aria-label={`Move cart ${d.cartNo}`}>
      <div className="hc-dr-h">
        <div>
          <div className="hc-dr-k">MOVE CART</div>
          <div className="hc-dr-t">{d.cartNo}</div>
        </div>
        {d.step === 'pick' && <button type="button" ref={autoFocus} className="hc-x" aria-label="Close move cart" onClick={() => dispatch({ type: 'closeDrawer' })}>×</button>}
      </div>
      <ol className="hc-steps">
        {['Devices', 'Destination', 'Scan bin'].map((t, i) => <li key={t} className={i + 1 < stepN || d.step === 'done' ? 'is-done' : i + 1 === stepN ? 'is-cur' : ''}><i>{i + 1}</i>{t}</li>)}
      </ol>

      <div className="hc-dr-sec">{rows.length} device{rows.length > 1 ? 's' : ''}</div>
      <ul className="hc-dr-list">
        {rows.map((r, i) => {
          const done = d.step === 'done' || (d.step === 'scan' && d.scanned > i);
          const now = d.step === 'scan' && d.beep && d.scanned === i;
          return (
            <li key={r.id} className={done ? 'is-done' : now ? 'is-now' : ''}>
              <span className="hc-dr-m">{r.model}</span>
              <span className="hc-mono hc-mut">•••• {r.imei.slice(-4)}</span>
              <span className="hc-dr-st">{done ? <i className="hc-tick">✓</i> : now ? <i className="hc-spin" /> : <span className="hc-mut hc-small">{r.loc}</span>}</span>
            </li>
          );
        })}
      </ul>

      {d.step === 'pick' && (
        <>
          <div className="hc-dr-sec">Destination</div>
          <div className="hc-dests" role="radiogroup" aria-label="Destination">
            {DESTS.map((x, i) => (
              <button type="button" role="radio" aria-checked={d.dest === i} key={x.loc} data-hc-dest={i} className={'hc-dest' + (d.dest === i ? ' is-on' : '')} onClick={() => dispatch({ type: 'dest', v: i })}>
                <i className="hc-radio" />
                <span><b>{x.loc}</b><small>{x.sub}</small></span>
              </button>
            ))}
          </div>
          <div className="hc-dr-foot">
            <button type="button" className="hc-btn hc-confirm is-on" disabled={!dest} onClick={onConfirm}>Scan bin to confirm</button>
          </div>
        </>
      )}

      {d.step === 'scan' && (
        <div className="hc-scanbox">
          <div className="hc-dr-sec">Scan bin label · {dest.loc}</div>
          <div className={'hc-label' + (d.beep ? ' is-beep' : '')}>
            <Barcode code={dest.bin} />
            {!d.beep && <i className="hc-laser" />}
            {d.beep && <span className="hc-beep">BEEP</span>}
          </div>
          <div className="hc-prog"><i style={{ transform: `scaleX(${d.beep ? d.scanned / rows.length : 0})` }} /></div>
          <div className="hc-small hc-mut">{d.beep ? `Confirming devices… ${d.scanned}/${rows.length}` : 'Point the scanner at the bin label…'}</div>
        </div>
      )}

      {d.step === 'done' && (
        <div className="hc-done">
          <div className="hc-done-ic">✓</div>
          <div className="hc-done-t">{d.cartNo} · {rows.length} device{rows.length > 1 ? 's' : ''} moved</div>
          <div className="hc-small hc-mut">to {dest.loc} · by Miles · {clock()}</div>
        </div>
      )}
    </aside>
  );
}

function Lookup({ rows, close, later }) {
  const SAMPLE = '356798114520331';
  const [val, setVal] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | loading | result
  const [res, setRes] = useState(null);
  const typing = useRef(true);
  const inputRef = useRef(null);
  useEffect(() => {
    const rm = reducedMotion();
    if (rm) { setVal(SAMPLE); typing.current = false; return; }
    for (let i = 1; i <= SAMPLE.length; i++) later(() => { if (typing.current) setVal(SAMPLE.slice(0, i)); if (i === SAMPLE.length) typing.current = false; }, 260 + i * 55);
  }, [later]);
  useEffect(() => { inputRef.current && inputRef.current.focus({ preventScroll: true }); }, []);

  const go = e => {
    e && e.preventDefault();
    typing.current = false;
    const v = val.trim().toLowerCase(), digits = v.replace(/\D/g, '');
    let r;
    if (v === '3310' || v.includes('nokia')) r = { egg: 'Nokia 3310 detected.', lines: [['Grade', 'Indestructible'], ['Battery', '11 days'], ['Snake high score', '4,212']] };
    else if (/^0{15}$/.test(digits) || (digits.length === 15 && /^(\d)\1+$/.test(digits))) r = { egg: "That's not an IMEI, that's a vibe." };
    else if (v === '42') r = { egg: 'The answer to everything. Still not an IMEI, though.' };
    else if (digits === '123456789012345') r = { egg: 'Sequential IMEI. Bold. Wrong, but bold.' };
    else if (/brick/.test(v)) r = { egg: 'We do not stock bricks. We un-brick them.' };
    else if (digits.length === 15 && rows.some(x => x.imei === digits)) r = null;
    else if (digits.length !== 15) r = { egg: 'IMEIs are 15 digits. We counted twice.' };
    else if (!luhnOk(digits)) r = { egg: "Check digit doesn't add up. A typo, or a phone from the future." };
    if (!r) {
      const hit = rows.find(x => x.imei === digits);
      const seedN = +digits.slice(-6);
      const base = hit || (() => { const m = NEW_MODELS[seedN % NEW_MODELS.length]; return { model: m[0], chips: ['Grade B', m[1][0], m[2][seedN % m[2].length], CARRIERS[seedN % CARRIERS.length]], loc: 'Not in your stock' }; })();
      r = { dev: base, imei: digits, battery: 82 + (seedN % 17), vibe: VIBES[seedN % VIBES.length] };
    }
    setPhase('loading');
    later(() => { setRes(r); setPhase('result'); }, reducedMotion() ? 150 : 950);
  };

  return (
    <div className="hc-modal" role="dialog" aria-modal="false" aria-label="Quick lookup">
      <div className="hc-m-h"><b>Quick lookup</b><button type="button" className="hc-x" aria-label="Close" onClick={close}>×</button></div>
      <form className="hc-lk-row" onSubmit={go}>
        <input ref={inputRef} className="hc-in hc-mono" value={val} placeholder="Scan or type an IMEI" aria-label="IMEI"
          onChange={e => { typing.current = false; setVal(e.target.value.slice(0, 24)); setPhase('idle'); }} />
        <button type="submit" className="hc-btn is-on">Look up</button>
      </form>
      {phase === 'idle' && <div className="hc-small hc-mut hc-lk-hint">Lock status, blacklist, carrier and battery in one scan.</div>}
      {phase === 'loading' && (
        <div className="hc-card">
          <div className="hc-skel" style={{ width: '46%' }} /><div className="hc-skel" style={{ width: '72%' }} />
          <div className="hc-grid2">{[0, 1, 2, 3].map(i => <div key={i} className="hc-skel" />)}</div>
        </div>
      )}
      {phase === 'result' && res && res.egg && !res.lines && <div className="hc-card hc-card-egg"><span className="hc-spark">✦</span> {res.egg}</div>}
      {phase === 'result' && res && res.lines && (
        <div className="hc-card hc-card-in">
          <div className="hc-card-t">{res.egg}</div>
          <div className="hc-grid2">{res.lines.map(([k, v]) => <div key={k}><small>{k}</small><b>{v}</b></div>)}</div>
        </div>
      )}
      {phase === 'result' && res && res.dev && (
        <div className="hc-card hc-card-in">
          <div className="hc-card-t">{res.dev.model}<span className="hc-mono hc-mut"> · {res.imei}</span></div>
          <div className="hc-chips hc-chips-wrap">{res.dev.chips.map(c => <span key={c} className="hc-chip">{c}</span>)}</div>
          <div className="hc-grid2">
            <div><small>Lock status</small><b className="hc-good">Off</b></div>
            <div><small>Blacklist</small><b className="hc-good">Clean</b></div>
            <div><small>Battery health</small><b>{res.battery}%</b></div>
            <div><small>Location</small><b>{res.dev.loc}</b></div>
          </div>
          <div className="hc-vibe">{res.vibe}</div>
        </div>
      )}
      <div className="hc-small hc-mut hc-lk-try">Try <code>3310</code>, <code>42</code> or fifteen zeros.</div>
    </div>
  );
}

function AddInventory({ close, onAdd, later }) {
  const row = useMemo(() => {
    const [model, stor, cols, base] = pick(NEW_MODELS);
    const grade = pick(['Grade A', 'Grade A', 'Grade B']);
    const chips = [grade, pick(stor), pick(cols), pick(CARRIERS)];
    const sell = Math.round((base * (grade === 'Grade A' ? 1 : 0.9)) / 5) * 5 - 1;
    return { id: 'n' + Date.now(), model, chips, imei: makeImei(model), loc: 'WH-A / 01-A3', locGroup: 'Warehouse A', status: 'Available', dwell: '0d', sell };
  }, []);
  const [step, setStep] = useState(0); // 0 scanning, 1 model, 2 imei, 3 chips, 4 checks, 5 ready
  useEffect(() => {
    const rm = reducedMotion();
    [1, 2, 3, 4, 5].forEach(n => later(() => setStep(n), rm ? n * 60 : 900 + n * 420));
  }, [later]);
  return (
    <div className="hc-modal hc-add" role="dialog" aria-label="Add inventory">
      <div className="hc-m-h"><b>Add inventory</b><button type="button" className="hc-x" aria-label="Close" onClick={close}>×</button></div>
      <div className="hc-add-body">
        <div className={'hc-phone' + (step >= 5 ? ' is-ok' : '')}>
          <i className="hc-notch" />
          {step < 5 && <i className="hc-beam" />}
          {step >= 5 && <span className="hc-phone-ok">✓</span>}
        </div>
        <div className="hc-add-fields">
          <div className="hc-small hc-mut">{step < 5 ? 'Reading device…' : 'Device identified'}</div>
          <Field on={step >= 1} k="Model" v={row.model} />
          <Field on={step >= 2} k="IMEI" v={row.imei} mono />
          <div className="hc-field"><small>Variant</small>
            {step >= 3 ? <span className="hc-chips hc-chips-wrap hc-fade">{row.chips.map(c => <span key={c} className="hc-chip">{c}</span>)}</span> : <div className="hc-skel" style={{ width: '80%' }} />}
          </div>
          <div className="hc-field"><small>Checks</small>
            {step >= 4 ? <span className="hc-fade hc-checks"><b className="hc-good">Lock off</b><b className="hc-good">Clean</b><b>Put away: {row.loc}</b></span> : <div className="hc-skel" style={{ width: '60%' }} />}
          </div>
        </div>
      </div>
      <div className="hc-m-f">
        <span className="hc-small hc-mut">{step >= 5 ? `Suggested sell ${money(row.sell)}` : 'Hold the phone still. It can tell.'}</span>
        <button type="button" className="hc-btn is-on hc-add-go" disabled={step < 5} onClick={() => onAdd(row)}>Add to stock</button>
      </div>
    </div>
  );
}

function Field({ on, k, v, mono }) {
  return (
    <div className="hc-field"><small>{k}</small>
      {on ? <b className={'hc-fade' + (mono ? ' hc-mono' : '')}>{v}</b> : <div className="hc-skel" style={{ width: mono ? '70%' : '50%' }} />}
    </div>
  );
}

function SalesOrder({ rows, quoteNo, later, close, onSend }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const rm = reducedMotion();
    rows.forEach((_, i) => later(() => setN(i + 1), rm ? 0 : 350 + i * 420));
  }, [rows, later]);
  const sub = rows.slice(0, n).reduce((a, r) => a + r.sell, 0);
  const total = useTicker(sub, 500);
  return (
    <div className="hc-modal" role="dialog" aria-label="Sales order">
      <div className="hc-m-h"><b>New quote <span className="hc-mono hc-mut">{quoteNo}</span></b><button type="button" className="hc-x" aria-label="Close" onClick={close}>×</button></div>
      <div className="hc-so-cust"><small>Customer</small><b>Ortega Mobile Wholesale</b><span className="hc-mut hc-small"> · Net 15 · wholesale tier</span></div>
      <div className="hc-so-lines">
        {rows.map((r, i) => (
          <div key={r.id} className={'hc-so-line' + (i < n ? ' is-in' : '')}>
            <span><b>{r.model}</b> <span className="hc-mut hc-small">{r.chips.slice(0, 3).join(' · ')}</span></span>
            <span className="hc-mono hc-mut">…{r.imei.slice(-4)}</span>
            <span className="hc-mono hc-r">{money(r.sell)}</span>
          </div>
        ))}
      </div>
      <div className="hc-so-tot">
        <span className="hc-small hc-mut">Erasure certificates attached · {rows.length} device{rows.length > 1 ? 's' : ''}</span>
        <span>Total <b className="hc-mono">{money(total)}</b></span>
      </div>
      <div className="hc-m-f">
        <span className="hc-small hc-mut">Price floor respected. Nobody said yes at 11 PM.</span>
        <button type="button" className="hc-btn is-on" disabled={n < rows.length} onClick={() => onSend(quoteNo)}>Send quote</button>
      </div>
    </div>
  );
}

function Confetti() {
  const bits = useMemo(() => Array.from({ length: 34 }, (_, i) => ({
    left: Math.random() * 100, delay: Math.random() * 0.9, dur: 1.8 + Math.random() * 1.2,
    rot: (Math.random() * 720 - 360) | 0, dx: (Math.random() * 60 - 30) | 0,
    c: ['#EB5E12', '#16130F', '#1E7A4A', '#C2470A', '#E3B48E'][i % 5], s: 0.8 + Math.random() * 0.6,
  })), []);
  return (
    <div className="hc-confetti" aria-hidden="true">
      {bits.map((b, i) => (
        <i key={i} style={{ left: b.left + '%', animationDelay: b.delay + 's', animationDuration: b.dur + 's', '--r': b.rot + 'deg', '--dx': b.dx + 'px', '--c': b.c, '--s': b.s }} />
      ))}
    </div>
  );
}

