import React from 'react';
import { DCLogic } from './lib/dcLogic.jsx';
import { pricing, findPlan, planCard, compareRows, signupUrl, overageLine, trustLine, teaserPlans, SALES_HREF, OVERAGE_PER_CHECK, START_FREE, money as usd } from './pricing.js';
import { openSignup } from './hub.js';
import { SIGNIN_HREF, shopDomain, leadAction, hubUrl } from './config.js';
import { shopFromInput, shopLoginUrl, createThrottle } from './shop.js';
import { textProblem, isEmail } from './formCheck.js';

const PAGES = ['home','industries','features','pricing','contact','platform','careers','start','signin','signup-busy'];
// The last shop this browser signed in to, so Sign in is one click next time.
const LAST_SHOP_KEY = 'inphox_last_shop';
const readLastShop = () => { try { return (typeof localStorage !== 'undefined' && localStorage.getItem(LAST_SHOP_KEY)) || ''; } catch (e) { return ''; } };
const saveLastShop = shop => { try { if (shop) localStorage.setItem(LAST_SHOP_KEY, shop); else localStorage.removeItem(LAST_SHOP_KEY); } catch (e) { /* private window */ } };
const money = n => '$' + Math.round(n).toLocaleString('en-US');
const [FREE, BASICS, GROWTH, MAX] = ['free','basics','growth','max'].map(findPlan);
const LEAD_FIELDS = ['name','email','company','segment','volume']; // what POST /inphox/lead receives
// Layout is sized in rem; converts a design-pixel value (at a 16px root) to
// actual screen pixels at the current root font size.
const sc = px => px * (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16) / 16;

export default class SiteLogic extends DCLogic {
  state = {
    page:'home', menu:false, langOpen:false, lang:'EN', w:1440,
    scene:0, phase:10, mode:'anim', walk:false,
    hSel:{}, hPage:0, tenStage:[0,0,0,0,0,0,0,0,0,0], hQ:'', hStatus:'All statuses', hLoc:'All locations', hNote:'', carts:0,
    xfOn:false, ind:0, platMore:false, platCat:'All',
    fMod:'All', fQ:'',
    c:{name:'',email:'',company:'',locs:'',segment:'',volume:'',msg:''}, cRep:{}, cErr:{}, cSent:false, cSending:false, cSendErr:'',
    siShop:'', siErr:'', siLast: readLastShop()
  };
  wrapRef = React.createRef(); stageRef = React.createRef(); trackRef = React.createRef();
  moreRef = React.createRef(); xfRef = React.createRef(); walkRef = React.createRef();
  timers = [];

  inv = [
    ['Galaxy S23',['Grade A','128GB','Phantom Black','Verizon'],'350917266013448','WH-A / 03-B2','Warehouse A','Reserved','1d',649],
    ['Galaxy S23',['Grade A','128GB','Cream','Unlocked'],'350917266013455','WH-A / 03-B2','Warehouse A','Available','1d',649],
    ['Galaxy S23',['Grade B','256GB','Lavender','Unlocked'],'350917266029017','WH-A / 03-B3','Warehouse A','Available','4d',612],
    ['iPhone 14 Pro',['Grade A','128GB','Space Black','Unlocked'],'356798114520331','WH-A / 01-A1','Warehouse A','Reserved','2d',799],
    ['iPhone 14 Pro',['Grade A','256GB','Deep Purple','Verizon'],'356798114520349','Northgate Kiosk','Northgate Kiosk','Available','6d',869],
    ['iPhone 14 Pro',['Grade B','128GB','Silver','AT&T'],'356798114598774','Bench R-2','Repair bench','In repair','1d',719],
    ['iPhone 13',['Grade B','128GB','Midnight','Unlocked'],'353012119874205','WH-A / 02-C4','Warehouse A','Available','9d',429],
    ['iPhone 13',['Grade C','128GB','Blue','T-Mobile'],'353012119802911','WH-A / 02-C4','Warehouse A','On hold','12d',355],
    ['Pixel 7',['Grade A','128GB','Obsidian','Unlocked'],'358240501177962','Elm St. Store','Elm St. Store','Available','3d',389],
    ['Pixel 8 Pro',['Grade A','256GB','Bay','Unlocked'],'358240512230048','Carrier · 1Z84…','In transit','In transit','0d',749],
    ['iPhone 12',['Grade B','64GB','Blue','Unlocked'],'356702108836129','WH-A / 04-A1','Warehouse A','Available','21d',279],
    ['Galaxy S22 Ultra',['Grade B','256GB','Burgundy','Verizon'],'350211337650182','WH-A / 03-A4','Warehouse A','Reserved','5d',529],
    ['iPhone 11',['Grade B','64GB','White','Unlocked'],'353988103452017','Elm St. Store','Elm St. Store','Available','14d',219],
    ['iPad Air (5th)',['Grade A','64GB','Space Gray','Wi-Fi'],'352211098331470','WH-A / 05-B1','Warehouse A','Available','2d',419]
  ].map(([model,chips,imei,loc,locGroup,status,dwell,sell]) => ({model,chips,imei,loc,locGroup,status,dwell,sell}));
  stCol = { 'Available':['#E3F1E8','#1E7A4A'], 'Reserved':['#FBE7CC','#8A4A12'], 'In repair':['#F6E1DE','#B3261E'], 'On hold':['#EDE6DA','#3A342D'], 'In transit':['#16130F','#F6F2EA'] };

  scenes = ['Arrive','Connect','Diagnose','Route','Repair & track','Locations','Offers'];
  diag = [
    ['01','iPhone 14 Pro · 256 GB','356798114520331','PASS 42/42','pass','Certified'],
    ['02','iPhone 13 · 128 GB','353012119874205','FAIL · FACE ID','fail','Certified'],
    ['03','Galaxy S23 · 256 GB','350917266013448','PASS 42/42','pass','Certified'],
    ['04','iPhone 12 · 64 GB','356702108836129','LOCKED · ICLOUD','lock','Blocked'],
    ['05','Pixel 7 · 128 GB','358240501177962','PASS 42/42','pass','Certified'],
    ['06','iPhone 11 · 64 GB','353988103452017','FAIL · SPEAKER','fail','Certified']
  ];
  caps = [
    ['Custom workflows','Intake, grading and routing steps that match how your floor actually runs.'],
    ['CRM for customers and vendors','Accounts, purchase history, terms and price lists for buyers and suppliers.'],
    ['Online listings','Graded stock is ready to list the moment it is graded. Marketplace connections are set up with you on request.'],
    ['Returns','RMA intake that brings returned devices back into the test-and-grade flow.'],
    ['Auction and vendor marketplace','Sell lots to vetted buyers, or buy from vendors, without leaving InPhox.'],
    ['Data insights','Dwell time, margin by model and grade, and technician throughput.'],
    ['Third-party routing','Send devices to outside repair or recycling partners and track them while they are out.'],
    ['Built in house','Testing, erasure, inventory, repairs and sales are one product we build ourselves, not a bundle of plug-ins.'],
    ['Exports','Any list, report or certificate comes out as CSV or PDF when your accountant or buyer asks.']
  ].map(([t,d]) => ({t,d}));
  xfRows = [
    ['Diagnostic results copied into a spreadsheet at the end of every shift','Results are written to the device record the moment testing finishes'],
    ['Hunting for erasure proof when a buyer asks for it','A certificate per IMEI, already attached to the invoice'],
    ['"Which shelf is it on?" shouted across the floor','Location down to the bin, with the last scan time and who scanned it'],
    ['Offers negotiated over DMs, texts and email','One queue, with your floor prices enforced'],
    ['Separate tools for repair, shipping and listings','One record from intake to ship-out']
  ];
  // Testimonials: none. The five quotes that were here had no source (one named the console mock's
  // made-up tenant), so they are off the site. TODO(Sri): put only verified quotes in src/home.js
  // VERIFIED_QUOTES, with the customer's OK; the home page shows the section only when it is not empty.

  componentDidMount() {
    this.onHash = () => { this.stopTen(); this.setState({ page: this.readPage(), menu:false, langOpen:false }); window.scrollTo(0,0); };
    this.onResize = () => this.setState({ w: window.innerWidth });
    this.onScroll = () => this.handleScroll();
    window.addEventListener('hashchange', this.onHash);
    window.addEventListener('resize', this.onResize);
    window.addEventListener('scroll', this.onScroll, { passive:true });
    let saved = null; try { saved = localStorage.getItem('inphox-motion'); } catch(e) {}
    const rm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pref = this.props.startMode === 'Slideshow' ? 'slides' : null;
    const mode = saved || pref || (rm || window.innerWidth < 980 ? 'slides' : 'anim');
    this.setState({ page: this.readPage(), w: window.innerWidth, mode }, () => { if (mode === 'anim') this.playScene(0); setTimeout(this.onScroll, 60); });
  }
  componentWillUnmount() {
    window.removeEventListener('hashchange', this.onHash);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('scroll', this.onScroll);
    this.timers.forEach(clearTimeout);
    this.stopTen();
  }
  readPage() { const h = (location.hash || '').replace(/^#\/?/, ''); return PAGES.includes(h) ? h : 'home'; }
  goto(p, extra) {
    if (extra) this.setState(extra);
    if (this.readPage() === p && location.hash) { this.setState({ menu:false }); window.scrollTo(0,0); }
    else location.hash = '#/' + p;
  }
  tenRes = [['PASS','#1E7A4A'],['PASS','#1E7A4A'],['PASS','#1E7A4A'],['LOCKED','#16130F'],['PASS','#1E7A4A'],['FAIL','#B3261E'],['PASS','#1E7A4A'],['PASS','#1E7A4A'],['PASS','#1E7A4A'],['PASS','#1E7A4A']];
  tenTimers = [];
  startTen() {
    if (this.tenRun) return; this.tenRun = true;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { this.setState({ tenStage: Array(10).fill(4) }); return; }
    this.tenCycle();
  }
  tenCycle() {
    this.tenTimers.forEach(clearTimeout); this.tenTimers = [];
    this.setState({ tenStage: Array(10).fill(0) });
    for (let k = 0; k < 10; k++) {
      const base = 500 + k * 650;
      [[0,1],[350,2],[1000,3],[2400,4]].forEach(([d, st]) => this.tenTimers.push(setTimeout(() => this.setState(s => { const a = s.tenStage.slice(); a[k] = st; return { tenStage: a }; }), base + d)));
    }
    this.tenTimers.push(setTimeout(() => this.tenCycle(), 500 + 9 * 650 + 2400 + 3000));
  }
  stopTen() { this.tenRun = false; this.tenTimers.forEach(clearTimeout); this.tenTimers = []; }
  carryCfg = {
    2: { kind:'phone', start:null, end:[22,40], fade:true, life:950 },
    3: { kind:'phone', start:[20,36], end:[34,62], fade:true, life:950 },
    4: { kind:'phone', start:[34,62], end:null, fade:false, life:1450 },
    5: { kind:'box', start:[54,36], end:[22,15], fade:true, life:950 },
    6: { kind:'plane', start:[26,26], end:[64,64], fade:true, life:950 }
  };
  startCarry(from, to) {
    const cfg = this.carryCfg[to], st = this.stageRef.current; if (!cfg || !st) return false;
    const src = st.querySelector('[data-carry-src="' + from + '"]'), dst = st.querySelector('[data-carry-dst="' + to + '"]');
    if (!src || !dst) return false;
    const sr = st.getBoundingClientRect(), a = src.getBoundingClientRect(), b = dst.getBoundingClientRect(), W = window.innerWidth * (to - from);
    const box = (r, size, shift) => { const cx = r.left + r.width / 2 - sr.left - shift, cy = r.top + r.height / 2 - sr.top, w = size ? sc(size[0]) : r.width, hh = size ? sc(size[1]) : r.height; return { x: cx - w / 2, y: cy - hh / 2, w, h: hh }; };
    const A = box(a, cfg.start, 0), B = box(b, cfg.end, W);
    const ang = Math.atan2((B.y + B.h / 2) - (A.y + A.h / 2), (B.x + B.w / 2) - (A.x + A.w / 2)) * 180 / Math.PI + 90;
    clearTimeout(this.carryT);
    this.setState({ carry: { ...cfg, A, B, ang, go:false } });
    requestAnimationFrame(() => requestAnimationFrame(() => this.setState(s => s.carry ? { carry: { ...s.carry, go:true } } : null)));
    this.carryT = setTimeout(() => this.setState({ carry:null }), cfg.life);
    return true;
  }
  playScene(i) {
    const prev = this.state.scene;
    const delay = this.state.mode === 'anim' && i === prev + 1 && this.startCarry(prev, i) ? 650 : 0;
    this.timers.forEach(clearTimeout); this.timers = [];
    this.setState({ scene:i, phase:0 });
    [200, 650, 1100, 1550, 2000, 2450, 2900, 3350, 4000].forEach((t,k) => this.timers.push(setTimeout(() => this.setState({ phase:k+1 }), t + delay)));
  }
  handleScroll() {
    const s = this.state, vh = window.innerHeight;
    if (s.page === 'home') {
      const mr = this.moreRef.current;
      const w = this.wrapRef.current;
      if (w && s.mode === 'anim') {
        const r = w.getBoundingClientRect(), total = r.height - (vh - sc(64));
        const prog = Math.min(.9999, Math.max(0, (sc(64) - r.top) / total));
        const idx = Math.floor(prog * 7);
        if (idx !== s.scene) this.playScene(idx);
      }
      if (mr) { const r = mr.getBoundingClientRect(), vis = r.top < vh && r.bottom > 0; if (vis && !this.tenRun) this.startTen(); else if (!vis && this.tenRun) this.stopTen(); }
      const x = this.xfRef.current;
      if (x && !s.xfOn && x.getBoundingClientRect().top < vh * .7) this.setState({ xfOn:true });
    }
    if (s.page === 'industries') {
      const els = document.querySelectorAll('[data-ind]'); let a = 0;
      els.forEach((el,i) => { if (el.getBoundingClientRect().top < vh * .45) a = i; });
      if (a !== s.ind) this.setState({ ind:a });
    }
  }
  jumpScene(i) {
    const s = this.state;
    if (s.mode === 'anim') {
      const w = this.wrapRef.current; if (!w) return;
      const r = w.getBoundingClientRect(), total = r.height - (window.innerHeight - sc(64));
      window.scrollTo({ top: window.scrollY + r.top - sc(64) + ((i + .5) / 7) * total, behavior:'smooth' });
    } else {
      const t = this.trackRef.current; if (!t) return;
      const inner = t.firstElementChild, slide = inner && inner.children[i];
      if (slide) t.scrollTo({ left: slide.offsetLeft - inner.offsetLeft, behavior:'smooth' });
      this.setState({ scene:i });
    }
  }
  setMode(m) {
    try { localStorage.setItem('inphox-motion', m); } catch(e) {}
    this.timers.forEach(clearTimeout);
    this.setState({ mode:m, phase:10, carry:null }, () => { if (m === 'anim') this.jumpScene(this.state.scene); else this.jumpScene(this.state.scene); });
  }

  renderVals() {
    const s = this.state, wide = s.w >= 980;
    const ui = {
      wideFlex: wide ? 'flex' : 'none', wideBlock: wide ? 'block' : 'none',
      hero: wide ? 'minmax(0,3fr) minmax(0,7fr)' : 'minmax(0,1fr)',
      c48: wide ? 'minmax(0,4fr) minmax(0,8fr)' : 'minmax(0,1fr)',
      c75: wide ? 'minmax(0,7fr) minmax(0,5fr)' : 'minmax(0,1fr)',
      c57: wide ? 'minmax(0,5fr) minmax(0,7fr)' : 'minmax(0,1fr)',
      c39: wide ? '16.25rem minmax(0,1fr)' : 'minmax(0,1fr)',
      ruleR: wide ? '1px solid var(--pmm-border-soft)' : '0'
    };
    const is = {}; PAGES.forEach(p => is[p] = s.page === p);
    const nav = { pricing: s.page === 'pricing' ? 'var(--pmm-brand)' : 'transparent' };
    const langs = [['EN','English'],['ES','Español'],['FR','Français']];

    // hero product
    const q = s.hQ.trim().toLowerCase();
    const vis = this.inv.map((r,i) => ({...r, i})).filter(r =>
      (s.hStatus === 'All statuses' || r.status === s.hStatus) &&
      (s.hLoc === 'All locations' || r.locGroup === s.hLoc) &&
      (!q || (r.model + ' ' + r.chips.join(' ') + ' ' + r.imei + ' ' + r.loc + ' ' + r.status).toLowerCase().includes(q)));
    const pages = Math.max(1, Math.ceil(vis.length / 8)), pg = Math.min(s.hPage, pages - 1), shown = vis.slice(pg * 8, pg * 8 + 8);
    const selCount = Object.values(s.hSel).filter(Boolean).length;
    const allSel = shown.length > 0 && shown.every(r => s.hSel[r.i]);
    const hero = {
      q: s.hQ, status: s.hStatus, loc: s.hLoc, range: vis.length ? `${pg * 8 + 1}–${pg * 8 + shown.length} of ${vis.length}` : '0 of 0', empty: vis.length === 0, pageStr: `${pg + 1} / ${pages}`,
      prev: () => this.setState({ hPage: Math.max(0, pg - 1) }), next: () => this.setState({ hPage: Math.min(pages - 1, pg + 1) }), note: s.hNote, carts: s.carts,
      setQ: e => this.setState({ hQ: e.target.value, hPage:0 }),
      setStatus: e => this.setState({ hStatus: e.target.value, hPage:0 }),
      setLoc: e => this.setState({ hLoc: e.target.value, hPage:0 }),
      clear: () => this.setState({ hQ:'', hStatus:'All statuses', hLoc:'All locations', hPage:0 }),
      lookup: () => this.setState({ hQ:'0331', hPage:0 }),
      moveLabel: selCount ? `Move selected (${selCount})` : 'Move selected',
      moveBg: selCount ? '#EB5E12' : '#F1E4D6', moveFg: selCount ? '#16130F' : '#8E857A',
      move: () => { if (!selCount) { this.setState({ hNote:'Select rows to move them' }); return; } this.setState(st => ({ hSel:{}, carts: st.carts + 1, hNote:`${selCount} device${selCount>1?'s':''} added to move cart MC-02${13+st.carts}` })); },
      allBg: allSel ? '#F6F2EA' : 'transparent', allMark: allSel ? '✓' : '',
      selAll: e => { e.stopPropagation(); const n = {...s.hSel}; shown.forEach(r => n[r.i] = !allSel); this.setState({ hSel:n, hNote:'' }); },
      rows: shown.map(r => { const sel = !!s.hSel[r.i], c = this.stCol[r.status]; return {
        ...r, chips: r.chips.map(t => ({t})), sell: money(r.sell), bg: sel ? '#FBE7CC' : '#FFFFFF',
        cbBg: sel ? '#16130F' : '#FFFFFF', cbMark: sel ? '✓' : '', sBg: c[0], sFg: c[1],
        toggle: () => this.setState(st => ({ hSel: {...st.hSel, [r.i]: !st.hSel[r.i]}, hNote:'' })) }; })
    };

    // storyboard
    const anim = s.mode === 'anim';
    const P = i => !anim ? 10 : i === s.scene ? s.phase : i < s.scene ? 10 : 0;
    const p1 = P(0), p2 = P(1), p3 = P(2), p4 = P(3), p5 = P(4), p6 = P(5), p7 = P(6);
    const sb = {
      wrapH: anim ? '760vh' : 'auto', stagePos: anim ? 'sticky' : 'relative', stageH: anim ? 'calc(100vh - 4rem)' : 'auto',
      gap: anim ? '0px' : '1rem', ovx: anim ? 'hidden' : 'auto', snap: anim ? 'none' : 'x mandatory',
      pad: anim ? '0' : '1.25rem clamp(1rem,3vw,2.5rem) 1.25rem',
      trackT: anim ? `translateX(-${s.scene * 100}vw)` : 'none',
      innerW: anim ? '700vw' : 'max-content',
      slideFlex: anim ? '0 0 100vw' : '0 0 min(70rem, 88vw)',
      slidePad: anim ? '1.5rem clamp(1rem,3vw,2.5rem)' : 'clamp(1rem,2.5vw,2rem)',
      slideBorder: anim ? '0' : '1px solid #D9D0C2', slideBg: anim ? 'transparent' : '#FFFFFF',
      footPad: '0.625rem',
      num: '0' + (s.scene + 1), isSlides: !anim,
      foot: anim ? (s.scene < 6 ? 'Keep scrolling for the next step' : 'End of walkthrough · scroll on') : 'Slideshow · swipe or use the arrows',
      hint: anim ? 'Each scroll plays one complete step.' : 'Swipe through the steps at your own pace.',
      modeLabel: anim ? 'Skip animation → slideshow' : 'Turn scroll animation on',
      onTrack: e => { if (anim) return; const t = e.currentTarget, inner = t.firstElementChild; if (!inner) return; const kids = inner.children; let best = 0, bd = 1e9; for (let k = 0; k < kids.length; k++) { const d = Math.abs(kids[k].offsetLeft - inner.offsetLeft - t.scrollLeft); if (d < bd) { bd = d; best = k; } } if (best !== this.state.scene) this.setState({ scene:best }); },
      prev: () => this.jumpScene(Math.max(0, s.scene - 1)),
      next: () => this.jumpScene(Math.min(6, s.scene + 1))
    };
    const rail = this.scenes.map((n,i) => ({ n:'0'+(i+1), name:n, bg: i === s.scene ? '#FFFFFF' : 'transparent', bar: i === s.scene ? '#EB5E12' : 'transparent', onClick: () => this.jumpScene(i) }));
    const SEL = 12, bodies = ['#16130F','#3A342D','#6B6257','#B9AE9E','#8E857A','#3A342D'];
    const carry = anim && s.scene >= 1, dropped = p1 >= 5;
    const s1 = { stripT: `translateX(-${((p1 >= 1 ? SEL : 1) * 82 + 32) / 16}rem)`, tickO: p1 >= 1 && p1 < 5 ? 1 : 0, capO: p1 >= 6 ? 1 : 0,
      phones: Array.from({length:16}, (_, k) => { const sel = k === SEL; return { body: bodies[k % 6], ol: sel && p1 >= 4 && p1 < 6 ? '#EB5E12' : 'transparent', o: sel ? (dropped ? 0 : 1) : (p1 >= 4 ? .4 : 1), t: 'none', z: sel ? 2 : 1 }; }),
      bpO: carry ? 0 : dropped ? 1 : 0,
      bpT: carry ? 'translate(91vw,4.375rem) rotate(0deg) scale(1.8)' : dropped ? 'translateY(9.375rem) rotate(90deg)' : 'none',
      bpTr: carry ? 'transform 700ms cubic-bezier(.6,0,.2,1), opacity 650ms ease-in' : 'transform 650ms cubic-bezier(.3,.1,.2,1), opacity 0ms' };
    const s2 = { phoneO: anim && s.scene >= 2 ? 0 : 1, cableT: p2 >= 1 ? 'translateY(0)' : 'translateY(13.75rem)', screenBg: p2 >= 2 ? '#F6F2EA' : '#0B0907', logoO: p2 >= 2 ? 1 : 0, logoS: p2 >= 2 ? 1 : .6, r1: p2 >= 3 ? 1 : 0, r2: p2 >= 4 ? 1 : 0,
      status: p2 >= 4 ? 'IDENTIFIED · READY TO TEST' : p2 >= 2 ? 'READING DEVICE…' : 'WAITING FOR CONNECTION', statusFg: p2 >= 4 ? '#1E7A4A' : '#6B6257' };
    let done = 0;
    const s3rows = this.diag.map(([port,device,imei,func,k,erase], i) => {
      const res = p3 >= Math.min(i + 1, 5); if (res) done++;
      const c = { pass:['#1E7A4A','#1E7A4A'], fail:['#B3261E','#B3261E'], lock:['#16130F','#16130F'] }[k];
      return { port, device, imei, func: res ? func : `RUNNING ${14 + i * 4}/42`, fg: res ? c[0] : '#8A5C00', dot: res ? c[1] : '#E39B0B',
        erase: res ? erase : 'Queued', eFg: !res ? '#6B6257' : erase === 'Blocked' ? '#B3261E' : '#1E7A4A', bg: i === 0 && p3 >= 1 && p3 < 3 ? '#FBE7CC' : res && k !== 'pass' ? '#FDF4E7' : '#FFFFFF', src: i === 0 ? '2' : '', dst: i === 0 ? '2' : '' };
    });
    const s3 = { rows: s3rows, done, pct: Math.round(done / 6 * 100) + '%' };
    const s4 = {
      tiles: Array.from({length:12}, (_, i) => ({ o: p4 >= 1 ? 0 : 1, t: p4 >= 1 ? 'translateX(3.75rem) scale(.4)' : 'none', d: (i * 45) + 'ms' })),
      count: p4 >= 2 ? 12 : p4 >= 1 ? 7 : 0, boxT: p4 >= 2 ? 'scale(1)' : 'scale(.94)',
      lanes: [['Repair','3','25%','#B3261E','→ Bench R-2 · rear camera, battery'],['Sale / ship','6','50%','#EB5E12','→ SO-10422 · Ground · Fri'],['Storage','3','25%','#1E7A4A','→ WH-A · C-14-03, C-14-04']]
        .map(([name,n,w,c,dest]) => ({ name, n: p4 >= 3 ? n : '0', w: p4 >= 3 ? w : '0%', c, dest, o: p4 >= 4 ? 1 : 0 }))
    };
    const s5 = {
      stages: [['Issues found',1],['Repaired',3],['Packed',6],['Shipped',7],['Shelved',9]].map(([t,k]) => { const on = p5 >= k; return { t, bar: on ? '#16130F' : '#D9D0C2', fg: on ? '#16130F' : '#8E857A' }; }),
      listO: p5 >= 1 ? 1 : 0, hd: p5 >= 3 ? 'Fixed · retest 42/42' : '2 issues found', hdFg: p5 >= 3 ? '#1E7A4A' : '#B3261E',
      issues: [['Rear camera · no image','Rear camera · replaced',2],['Battery 71% · degraded','Battery · replaced',3]].map(([a1,a2,k]) => ({ t: p5 >= k ? a2 : a1, fg: p5 >= k ? '#1E7A4A' : '#B3261E' })),
      phoneL: p5 >= 4 ? '50%' : '18%', phoneT: p5 >= 5 ? 'translateY(1.5rem) scale(.32)' : 'none', phoneO: p5 >= 5 || (anim && p5 < 1) ? 0 : 1,
      boxO: p5 >= 4 && p5 < 9 ? 1 : 0, boxS: p5 >= 9 ? .4 : 1, boxL: p5 >= 7 ? '82%' : '50%', flapO: p5 >= 4 && p5 < 6 ? 1 : 0, tapeO: p5 >= 6 ? 1 : 0,
      doorBg: p5 >= 9 ? '#1E7A4A' : '#EDE6DA', recvO: p5 >= 9 ? 1 : 0
    };
    const act = p6 >= 6 ? 2 : p6 >= 4 ? 1 : p6 >= 2 ? 0 : -1;
    const s6 = { locs: [
      ['Elm Street','Store · Denton, TX','212','188 available','Marcus T., Ana R., Lee W.','40%','22%','down','right',2],
      ['Warehouse A','Refurb floor · Irving, TX','1,406','1,122 available','M. Ortiz, D. Chen, Sam P. + 4','18%','68%','up','right',4],
      ['Northgate Mall','Kiosk · Dallas, TX','84','71 available','Priya S., Jordan K.','74%','60%','up','left',6]
    ].map(([name,type,stock,avail,staffStr,x,y,v,hz,th], i) => { const full = i === act, seen = p6 >= th; return {
      name, type, stock, avail, staffStr, x, y,
      pinO: p6 >= 1 ? 1 : 0, pinT: p6 >= 1 ? 'translateY(0)' : 'translateY(-1.125rem)', pinD: (i * 120) + 'ms', pinBg: seen ? '#1E7A4A' : '#16130F',
      cTop: v === 'down' ? '1.5rem' : 'auto', cBot: v === 'up' ? '1.5rem' : 'auto', cLeft: hz === 'right' ? '-0.75rem' : 'auto', cRight: hz === 'left' ? '-0.75rem' : 'auto',
      origin: (v === 'down' ? 'top ' : 'bottom ') + (hz === 'right' ? 'left' : 'right'),
      cardS: full ? 1 : .6, cardO: full ? 1 : 0, tagO: seen && !full ? 1 : 0, z: full ? 3 : 1, src: i === 2 ? '5' : '', dst: i === 0 ? '5' : '' }; }) };
    const px = v => ((v - 300) / 80 * 100) + '%';
    const bv = p7 >= 7 ? 346 : p7 >= 5 ? 340 : p7 >= 3 ? 330 : p7 >= 1 ? 310 : null;
    const sv = p7 >= 6 ? 346 : p7 >= 4 ? 355 : p7 >= 2 ? 368 : null, settled = p7 >= 7, dealDone = p7 >= 8;
    const rounds = [[1,310,2,368,'auto'],[3,330,4,355,'Sam P.'],[5,340,6,346,'auto']];
    const s7 = {
      roundStr: settled ? 'agreed' : 'round ' + (p7 >= 5 ? 3 : p7 >= 3 ? 2 : 1) + ' of 3',
      bLab: bv ? '$' + bv : '—', sLab: sv ? '$' + sv : '—', who: settled ? '' : (p7 >= 6 || (p7 >= 2 && p7 < 4)) ? 'auto-counter' : p7 >= 4 ? 'Sam P.' : '',
      numFg: settled ? '#1E7A4A' : '#16130F',
      gap: settled ? 'agreed' : bv && sv ? 'gap $' + (sv - bv) : 'waiting',
      gapBg: settled ? '#1E7A4A' : '#FFFFFF', gapFg: settled ? '#FFFFFF' : '#16130F', gapBd: settled ? '#1E7A4A' : '#D9D0C2',
      bW: bv ? px(bv) : '0%', sW: sv ? ((380 - sv) / 80 * 100) + '%' : '0%', floorX: px(340),
      bFill: settled ? '#1E7A4A' : '#8E857A', sFill: settled ? '#1E7A4A' : '#16130F',
      rows: [...rounds.filter(r => p7 >= r[0]).map(([bp,b,sp,sval,by],i) => { const has = p7 >= sp; return { n:'R' + (i + 1), b:'$' + b, s: has ? '$' + sval : '…', by: has ? by : '', g: has ? '$' + (sval - b) : '', gFg:'#3A342D' }; }),
        ...(settled ? [{ n:'Final', b:'Accepts', s:'$346', by:'', g:'$0', gFg:'#1E7A4A' }] : [])],
      result: dealDone ? 'Settled at $346 / unit · $4,152 for 12 · invoice created' : settled ? 'Buyer accepted. Creating invoice…' : 'Negotiating · InPhox counters only above your floor',
      resBg: dealDone ? '#1E7A4A' : '#FFFFFF', resFg: dealDone ? '#FFFFFF' : '#3A342D'
    };

    const c = s.carry, CR = c ? (c.go ? c.B : c.A) : null, ease = 'cubic-bezier(.6,0,.2,1)';
    const cr = c ? { on:true, x: CR.x + 'px', y: CR.y + 'px', w: CR.w + 'px', h: CR.h + 'px', o: c.go && c.fade ? 0 : 1,
      tr: c.go ? `left 800ms ${ease}, top 800ms ${ease}, width 800ms ${ease}, height 800ms ${ease}, opacity 300ms ease 560ms` : 'none',
      isPhone: c.kind === 'phone', isBox: c.kind === 'box', isPlane: c.kind === 'plane',
      rad: Math.max(3, Math.round(CR.w * .17)) + 'px', pad: Math.max(2, Math.round(CR.w * .05)) + 'px', rad2: Math.max(2, Math.round(CR.w * .12)) + 'px', rot: 'rotate(' + c.ang + 'deg)' } : { on:false };
    const xf = this.xfRows.map(([b,a], i) => ({ b, a, on: s.xfOn, d: (i * 180) + 'ms', d2: (i * 180 + 250) + 'ms' }));

    return {
      ui, is, nav,
      menuOpen: s.menu, menuLabel: s.menu ? 'Close' : 'Menu', menuBtnBg: s.menu ? 'var(--pmm-text)' : 'transparent', menuBtnFg: s.menu ? 'var(--pmm-bg)' : 'var(--pmm-text)',
      toggleMenu: () => this.setState({ menu: !s.menu, langOpen:false }),
      menuItems: [['Industries','industries','Refurbishers, repair shops, buy and sell shops, retail chains, individual operators'],['Features','features','Every module, listed plainly'],['Pricing','pricing',`${FREE.name}, ${BASICS.name}, ${GROWTH.name}, ${MAX.name} and Enterprise`],['Contact','contact','Talk to sales about volume and locations'],['Learn more','platform','How it is built and the device record']]
        .map(([label,p,desc]) => ({ label, desc, href:'#/' + p, path:'/' + p, bg: s.page === p ? 'var(--pmm-brand-soft)' : 'var(--pmm-surface)' })),
      langOpen: s.langOpen, langCode: s.lang, langName: (langs.find(l => l[0] === s.lang) || langs[0])[1],
      toggleLang: () => this.setState({ langOpen: !s.langOpen }),
      langs: langs.map(([code,name]) => ({ code, name, bg: code === s.lang ? 'var(--pmm-brand-soft)' : 'var(--pmm-surface)', pick: () => this.setState({ lang:code, langOpen:false }) })),
      goTrial: e => { if (e && e.preventDefault) e.preventDefault(); this.setState({ menu:false }); openSignup(signupUrl('free', hubUrl)); },
      startLabel: START_FREE, // the one label of every goTrial button
      loginUrl: SIGNIN_HREF, // every Sign in link opens "Sign in to your shop"
      hero, moreRef: this.moreRef, wrapRef: this.wrapRef, trackRef: this.trackRef, xfRef: this.xfRef, walkRef: this.walkRef,
      sb, rail, s1, s2, s3, s4, s5, s6, s7, stageRef: this.stageRef, cr,
      toggleMode: () => this.setMode(anim ? 'slides' : 'anim'),
      caps: this.caps, xf,
      // Home page: the trust line and the plan cards come from pricing.js, like the Plans page.
      home: {
        trust: trustLine(),
        plans: teaserPlans().map(p => this.planTile(p)),
        walk: s.walk,
        openWalk: () => this.setState({ walk:true }, () => { const el = this.walkRef.current; if (el && el.scrollIntoView) el.scrollIntoView({ behavior:'smooth', block:'start' }); }),
        closeWalk: () => this.setState({ walk:false }, () => { const el = document.getElementById('how'); if (el && el.scrollIntoView) el.scrollIntoView({ block:'start' }); })
      },
      tenPhones: this.tenRes.map(([t,c], k) => { const st = s.tenStage[k]; return {
        t, c, scr: st >= 2 ? '#F6F2EA' : '#0B0907', bd: st >= 1 ? '#B9AE9E' : '#6B6257',
        cableS: st >= 1 ? 1 : .25, cable: st >= 1 ? '#B9AE9E' : '#6B6257',
        bootO: st >= 2 && st < 4 ? 1 : 0, logoS: st >= 2 ? 1 : .6, barO: st >= 3 ? 1 : 0,
        barW: st >= 3 ? '100%' : '0%', barTr: st >= 3 ? 'width 1400ms linear' : 'none', resO: st >= 4 ? 1 : 0 }; }),
      tenSum: (() => { const d = s.tenStage.filter(x => x >= 4).length, pass = this.tenRes.filter((r, k) => s.tenStage[k] >= 4 && r[0] === 'PASS').length, run = s.tenStage.filter(x => x >= 1 && x < 4).length; return d === 10 ? `10 of 10 complete · ${pass} passed · ${10 - pass} flagged` : `${d} of 10 complete · ${run} testing`; })(),
      ledger: [['10/01','iPh 13 128 blk','B','shelf 4?',0],['10/01','S22 Ultra 256','A-','bin C-12',0],['10/01','iPh 12 64 blue','B','sold??',1],['10/02','Pixel 7 obsid.','A','Elm st',0],['10/02','iPh 14 Pro 256','?','repair — Mike',1],['10/02','iPh 11 64 wht','B','kiosk / WH?',0],['10/03','S23 lavender','A','—',1]].map(([d,m,g,l,x]) => ({ d, m, g, l, struck: !!x })),
      ...this.pageVals(s, ui)
    };
  }
  industries = [
    ['Refurbishers & ITAD','High volume in, certified stock out.','Run hundreds of devices a day through test, erasure and grading, with a certificate for every IMEI your buyers will ask about.',['Receive lot and scan the manifest','Bulk-diagnose on stations','Certified erasure','Grade and photograph','Route to sale, repair or recycling'],['Diagnostics','Erasure','Grading','Inventory','Sales orders'],MAX.name],
    ['Independent repair shops','Know every part and every device on the bench.','Check in customer devices, log the fault, pull the part with its serial and retest before handing it back. The customer history stays with the device.',['Check in the customer device','Diagnose the fault','Pull the part and log its serial','Repair and retest','Notify the customer and hand back'],['Repair suite','Parts inventory','Retest','Invoices'],BASICS.name],
    ['Buy, sell & trade-in shops','Price lots quickly, and pay only for what arrived.','Verify every unit against the manifest on arrival, flag discrepancies automatically, and counter offers using rules instead of gut feel.',['Accept an offer or send a quote','Receive and verify against the manifest','Flag discrepancies to the vendor','Grade','Resell in lots'],['Offers & auto-counter','Diagnostics','Vendor CRM','Auction marketplace'],GROWTH.name],
    ['Multi-location retail','Every store, every shelf, one count.','Trade-ins at the counter, transfers to a refurb hub and restocking by demand, with staff roles and live stock for every location.',['Take the trade-in at the counter','Transfer to the refurb hub','Restock stores by demand','Sell in store or online'],['Locations & transfers','Roles & permissions','Listings','Data insights'],MAX.name],
    ['Individual operators & online sellers','List what\'s graded, ship what sold.','Graded stock is ready to list the moment it is graded, with marketplace connections set up with you on request. Orders print labels, and returns come back into testing.',['Source devices','Test and grade','List to marketplaces','Pick, pack and label','Handle returns'],['Listings','Shipping & labels','Returns','Exports'],GROWTH.name]
  ];
  ladder = [['One bench','A single technician testing and repairing.',`${FREE.name} · ${money(FREE.price)}/mo`],['One store','Counter trade-ins, repairs and retail stock.',`${BASICS.name} · ${money(BASICS.price)}/mo`],['A few locations','Transfers, staff roles and shared stock.',`${GROWTH.name} · ${money(GROWTH.price)}/mo`],['A network','Refurb hubs, many stores and insights.',`${MAX.name} · ${money(MAX.price)}/mo`]];
  features = [
    ['Diagnostics','Bulk port diagnostics','Test up to 40 devices per station in parallel'],
    ['Diagnostics','42-point functional test','Screen, touch, cameras, speakers, sensors, charging and more'],
    ['Diagnostics','IMEI, carrier & blacklist check','Runs automatically as soon as a device is connected'],
    ['Diagnostics','iCloud / FRP lock detection','Locked devices are flagged before anyone works on them'],
    ['Diagnostics','Battery health','Capacity and cycle count recorded on the device'],
    ['Erasure','Certified erasure','NIST 800-88 compliant data erasure'],
    ['Erasure','Erasure certificates','A PDF per IMEI, attachable to invoices'],
    ['Grading','Cosmetic grading','Grades A–D with photo capture'],
    ['Grading','Grade rules by model','Define what counts as A or B for each model'],
    ['Inventory','Bin-level locations','Track devices to warehouse, aisle and bin'],
    ['Inventory','Scan history','Every scan with time, user and location'],
    ['Inventory','Transfers & move carts','Move stock between locations'],
    ['Inventory','Dwell & aging','How long each device has been sitting'],
    ['Repair','Repair tickets','Customer and internal repairs with status'],
    ['Repair','Parts inventory','Parts stock with part serials linked to devices'],
    ['Repair','Retest after repair','Automatic retest before a device returns to stock'],
    ['Shipping','Carrier labels','Buy and print labels from the order'],
    ['Shipping','Pick lists & packing slips','Generated from sales orders'],
    ['Shipping','Outbound tracking','Shipment status shown on the order'],
    ['Sales','Quotes, sales orders & invoices','Quote, convert, invoice'],
    ['Sales','Offers queue','Customer and vendor offers in one place'],
    ['Sales','Auto-counter rules','Counter below-floor offers automatically'],
    ['Sales','Auction & vendor marketplace','Sell lots or buy from vendors'],
    ['Listings','Marketplace listings','Graded stock ready to list; connections on request'],
    ['CRM','Customer & vendor accounts','History, terms and contacts'],
    ['CRM','Price lists','Per-customer pricing by model and grade'],
    ['Insights','Margin by model & grade','Cost, repair and sale rolled up'],
    ['Insights','Technician throughput','Devices tested and repaired per tech'],
    ['Platform','Roles & permissions','Control who can grade, price or ship'],
    ['Platform','Exports','CSV and PDF from any list or report'],
    ['Platform','Connections on request','Tell us what your shop needs connected']
  ];
  integrations = [['Diagnostics','Devices','BUILT IN'],['Erasure certificates','Devices','BUILT IN'],['Grading','Devices','BUILT IN'],['Repairs & parts','Devices','BUILT IN'],['Inventory & locations','Stock','BUILT IN'],['Transfers','Stock','BUILT IN'],['Offers','Sales','BUILT IN'],['Sales orders & invoices','Sales','BUILT IN'],['Customer portal','Sales','BUILT IN'],['Reports','Stock','BUILT IN'],['CSV & PDF export','Connections','BUILT IN'],['Payments','Connections','ON REQUEST'],['Shipping labels','Connections','ON REQUEST'],['Marketplaces','Connections','ON REQUEST'],['Accounting','Connections','ON REQUEST']];
  record = [['Oct 2 · 08:14','Received in lot L-0418','Manifest scan','D. Chen','WH-A · Dock 2'],['08:31','Connected · port 17','Station B-04','D. Chen','WH-A'],['08:33','Functional test 41/42 · rear camera','InPhox Diagnostics','—','Station B-04'],['08:34','Erasure certified · NIST 800-88','InPhox Diagnostics','—','Station B-04'],['09:02','Repair RT-2207 · rear camera replaced','Repair suite','M. Ortiz','Bench R-2'],['09:24','Retest 42/42 · graded A-','InPhox Diagnostics','M. Ortiz','Bench R-2'],['09:30','Shelved','Handheld scan','Sam P.','C-14-03'],['Oct 3 · 10:02','Offer accepted at $869','Offers','—','—'],['14:47','Sold · label printed','Sales order SO-10422','Sam P.','Dock 1']];

  // One plan card's values (Plans page and home page): pricing.js planCard() plus where its button goes.
  // The site takes no payment and has no sign-up form: a plan button is a link to the hub's sign-up
  // with the plan's code; Enterprise goes to the sales contact.
  planTile(p) {
    const act = p.talkToSales ? { href: SALES_HREF } : { href: signupUrl(p.code, hubUrl), hub: true };
    return { ...planCard(p), hi: !!p.highlight, act };
  }
  pickChips(list, cur, on, multi) {
    return list.map(t => { const sel = multi ? !!cur[t] : cur === t; return { t, bg: sel ? '#16130F' : '#FFFFFF', fg: sel ? '#F6F2EA' : '#16130F', bd: sel ? '#16130F' : '#D9D0C2', pick: () => on(t) }; });
  }
  pageVals(s) {
    const ind = {
      nav: this.industries.map((r,i) => ({ k:'0'+(i+1), name:r[0], href:'#/industries', fg: i === s.ind ? '#16130F' : '#6B6257', num: i === s.ind ? '#EB5E12' : '#B9AE9E', fw: i === s.ind ? '600' : '500',
        go: e => { e.preventDefault(); const el = document.querySelectorAll('[data-ind]')[i]; if (el) window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - sc(72), behavior:'smooth' }); } })),
      panels: this.industries.map(([name,h,b,flow,mods,plan],i) => ({ k:'0'+(i+1), name, h, b, plan, flow: flow.map((t,j) => ({ t, n:'0'+(j+1) })), mods: mods.map(t => ({t})) })),
      ladder: this.ladder.map(([t,d,p],i) => ({ k:'0'+(i+1), t, d, p }))
    };

    const mods = ['All', ...Array.from(new Set(this.features.map(f => f[0])))];
    // Every plan includes every feature: plans differ only in checks, stations, users and support.
    const fq = s.fQ.trim().toLowerCase();
    const frows = this.features.filter(f => (s.fMod === 'All' || f[0] === s.fMod) && (!fq || (f[0]+' '+f[1]+' '+f[2]).toLowerCase().includes(fq)));
    const feat = {
      q: s.fQ, count: frows.length, total: this.features.length, empty: frows.length === 0,
      setQ: e => this.setState({ fQ: e.target.value }),
      clear: () => this.setState({ fQ:'', fMod:'All' }),
      mods: mods.map(m => { const sel = m === s.fMod; return { t:m, n: m === 'All' ? this.features.length : this.features.filter(f => f[0] === m).length, bg: sel ? '#16130F' : '#FFFFFF', fg: sel ? '#F6F2EA' : '#16130F', bd: sel ? '#16130F' : '#D9D0C2', pick: () => this.setState({ fMod:m }) }; }),
      rows: frows.map(([m,f,d]) => ({ m, f, d }))
    };

    // Pricing: every plan card comes from planTile() (see there).
    const pr = {
      intro: `Start free. Every plan includes device checks; past them, each check is ${usd(OVERAGE_PER_CHECK, 2)}, charged to your card at the end of the month.`,
      tiers: pricing.plans.map(p => this.planTile(p)),
      planNames: pricing.plans.map(p => p.name),
      compare: compareRows().map(([l, ...cells]) => ({ l, cells })),
      packs: pricing.packs.show ? pricing.packs.line : '',
      faq: pricing.faq,
      overage: overageLine
    };

    const vols = ['Under 100','100–500','500–2,500','2,500–10,000','10,000+'];
    const segs = [...this.industries.map(r => r[0]), 'Other'];
    const reps = ['Spreadsheets','Separate diagnostics app','Another inventory system','Paper / whiteboard','Nothing yet'];
    const setC = k => e => this.setState(st => ({ c: { ...st.c, [k]: e.target.value }, cErr: { ...st.cErr, [k]: '' } }));
    const ce = s.cErr;
    const sent = () => { this.setState({ cSending:false, cSent:true }); window.scrollTo(0,0); };
    const ct = {
      sent: s.cSent, form: !s.cSent, v: s.c, e: { name: ce.name || '', email: ce.email || '', company: ce.company || '', volume: ce.volume || '' },
      bd: { name: ce.name ? '#B3261E' : '#D9D0C2', email: ce.email ? '#B3261E' : '#D9D0C2', company: ce.company ? '#B3261E' : '#D9D0C2' },
      set: { name: setC('name'), email: setC('email'), company: setC('company'), locs: setC('locs'), msg: setC('msg') },
      segments: this.pickChips(segs, s.c.segment, t => this.setState(st => ({ c: { ...st.c, segment:t } }))),
      volumes: this.pickChips(vols, s.c.volume, t => this.setState(st => ({ c: { ...st.c, volume:t }, cErr: { ...st.cErr, volume:'' } }))),
      reps: this.pickChips(reps, s.cRep, t => this.setState(st => ({ cRep: { ...st.cRep, [t]: !st.cRep[t] } })), true),
      first: (s.c.name.trim().split(' ')[0] || 'there'), email: s.c.email, ref: String(4100 + (s.c.email.length * 37) % 900),
      sending: s.cSending, submitLabel: s.cSending ? 'Sending…' : 'Request a walkthrough',
      note: s.cSendErr || "We'll only use this to follow up on your request.", noteFg: s.cSendErr ? '#B3261E' : '#6B6257',
      reset: () => this.setState({ cSent:false, cSendErr:'', c:{name:'',email:'',company:'',locs:'',segment:'',volume:'',msg:''}, cRep:{} }),
      submit: e => { e.preventDefault(); if (s.cSending) return; const c = s.c, er = {};
        const cn = textProblem(c.name, 'Your name', true, 'Enter your name.'), cc = textProblem(c.company, 'Company name', true, 'Enter your company name.');
        if (cn) er.name = cn;
        if (!isEmail(c.email)) er.email = 'Enter a valid work email.';
        if (cc) er.company = cc;
        if (!c.volume) er.volume = 'Pick your monthly volume.';
        if (Object.keys(er).length) { this.setState({ cErr: er, cSent:false }); window.scrollTo(0,0); return; }
        // Platform turned off (VITE_PLATFORM_URL=off): client-side only, no network request.
        if (!leadAction) { this.setState({ cErr:{} }); sent(); return; }
        // Send the lead form-encoded to the platform; show the success card only on a 2xx.
        this.setState({ cErr:{}, cSending:true, cSendErr:'' });
        const body = new URLSearchParams(LEAD_FIELDS.map(k => [k, (c[k] || '').trim()]));
        fetch(leadAction, { method:'POST', headers:{ Accept:'application/json' }, body })
          .then(res => { if (!res.ok) throw new Error('Lead not accepted: ' + res.status); sent(); })
          .catch(() => this.setState({ cSending:false, cSendErr:"That didn't go through. Please try again in a moment." })); }
    };

    const cats = ['All', ...Array.from(new Set(this.integrations.map(i => i[1])))];
    const plat = {
      cats: cats.map(c => { const sel = c === s.platCat; return { t:c, bg: sel ? '#16130F' : '#FFFFFF', fg: sel ? '#F6F2EA' : '#16130F', bd: sel ? '#16130F' : '#D9D0C2', pick: () => this.setState({ platCat:c }) }; }),
      items: this.integrations.map(([n,c,st]) => { const hit = s.platCat === 'All' || s.platCat === c; return { n, s: st, fg: hit ? '#16130F' : '#D9D0C2', sc: !hit ? '#D9D0C2' : st === 'BUILT IN' ? '#1E7A4A' : '#8E857A' }; }),
      more: s.platMore, moreLabel: s.platMore ? 'Read less ▴' : 'Read more ▾', toggle: () => this.setState({ platMore: !s.platMore })
    };
    const rec = this.record.map(([t,e,src,u,l]) => ({ t, e, s:src, u, l }));

    // Create account: sign-up lives at the hub. This page lists the plans and sends each to the hub.
    const st = {
      loginUrl: SIGNIN_HREF,
      headline: 'Create your InPhox account.',
      sub: 'Pick a plan to continue to sign-up. Free starts with 25 device checks a month and needs a credit or debit card; nothing is charged.',
      plans: pricing.plans.map(p => { const c = planCard(p); return { name: p.name, d: c.checks, o: c.overage, price: c.priceStr + (c.per ? ' ' + c.per : ''), cta: c.cta, act: this.planTile(p).act }; })
    };
    // Sign in to your shop: each shop's InPhox app lives at <shop>.<shopDomain>.
    // At most 5 tries a minute, so the box cannot be used to run through names.
    const throttle = this.siThrottle || (this.siThrottle = createThrottle());
    const goShop = shop => {
      const t = throttle.try();
      if (!t.ok) { this.setState({ siErr: `Please wait a moment (${t.wait}s) before trying again.` }); return; }
      saveLastShop(shop); location.assign(shopLoginUrl(shop, shopDomain));
    };
    const si = {
      domain: shopDomain, value: s.siShop, err: s.siErr, bd: s.siErr ? '#B3261E' : '#D9D0C2',
      last: s.siLast, lastHost: s.siLast ? `${s.siLast}.${shopDomain}` : '',
      set: e => this.setState({ siShop: e.target.value, siErr: '' }),
      submit: e => { if (e && e.preventDefault) e.preventDefault();
        const r = shopFromInput(s.siShop, shopDomain);
        if (r.error) { this.setState({ siErr: r.error }); return; }
        goShop(r.shop); },
      continueLast: () => goShop(s.siLast),
      forget: () => { saveLastShop(''); this.setState({ siLast: '' }); },
      goTrial: e => { if (e && e.preventDefault) e.preventDefault(); this.setState({ menu:false }); openSignup(signupUrl('free', hubUrl)); },
      startLabel: START_FREE
    };
    return { ind, feat, pr, ct, plat, rec, st, si };
  }
}
