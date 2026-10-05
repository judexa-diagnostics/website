import React from 'react';
import { DCLogic } from './lib/dcLogic.jsx';
import { pricing, findPlan, planCard, compareRows, sellsOnline, estimate, cheapestPlan, fitsStations, startRate, PER_CHECK_FLOOR, count, money as usd } from './pricing.js';
import { SIGNIN_HREF, shopDomain, leadAction, signupAction } from './config.js';
import { shopFromInput, shopLoginUrl } from './shop.js';

const PAGES = ['home','industries','features','pricing','contact','platform','start','signin'];
// The last shop this browser signed in to, so Sign in is one click next time.
const LAST_SHOP_KEY = 'inphox_last_shop';
const readLastShop = () => { try { return (typeof localStorage !== 'undefined' && localStorage.getItem(LAST_SHOP_KEY)) || ''; } catch (e) { return ''; } };
const saveLastShop = shop => { try { if (shop) localStorage.setItem(LAST_SHOP_KEY, shop); else localStorage.removeItem(LAST_SHOP_KEY); } catch (e) { /* private window */ } };
const money = n => '$' + Math.round(n).toLocaleString('en-US');
const [STARTER, GROWTH, ENTERPRISE] = ['starter','growth','enterprise'].map(findPlan);
const LEAD_FIELDS = ['name','email','company','segment','volume']; // what POST /inphox/lead receives
// Layout is sized in rem; converts a design-pixel value (at a 16px root) to
// actual screen pixels at the current root font size.
const sc = px => px * (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16) / 16;

export default class SiteLogic extends DCLogic {
  state = {
    page:'home', menu:false, langOpen:false, lang:'EN', w:1440,
    scene:0, phase:10, mode:'anim', promoFixed:false, promoX:false,
    hSel:{}, hPage:0, tenStage:[0,0,0,0,0,0,0,0,0,0], hQ:'', hStatus:'All statuses', hLoc:'All locations', hNote:'', carts:0,
    xfOn:false, tIdx:0, ind:0, platMore:false, platCat:'All',
    fMod:'All', fQ:'',
    annual:false, checks:2500, stations:0, estPlan:null,
    c:{name:'',email:'',company:'',locs:'',segment:'',volume:'',msg:''}, cRep:{}, cErr:{}, cSent:false, cSending:false, cSendErr:'',
    step:1, a:{name:'',email:'',company:''}, aErr:{}, plan:'growth', trial:true, sSending:false, sErr:'',
    siShop:'', siErr:'', siLast: readLastShop()
  };
  wrapRef = React.createRef(); stageRef = React.createRef(); trackRef = React.createRef(); heroBarRef = React.createRef();
  moreRef = React.createRef(); xfRef = React.createRef(); testiRef = React.createRef();
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
    ['Pixel 8 Pro',['Grade A','256GB','Bay','Unlocked'],'358240512230048','UPS · 1Z84…','In transit','In transit','0d',749],
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
    ['Online listings','Publish graded stock to connected marketplaces and keep quantities in sync.'],
    ['Returns','RMA intake that brings returned devices back into the test-and-grade flow.'],
    ['Auction and vendor marketplace','Sell lots to vetted buyers, or buy from vendors, without leaving InPhox.'],
    ['Data insights','Dwell time, margin by model and grade, and technician throughput.'],
    ['Third-party routing','Send devices to outside repair or recycling partners and track them while they are out.'],
    ['Integrations','Diagnostics apps, marketplaces, carriers and Zapier.'],
    ['Live accounting','Cost, sale and repair entries post to your books as they happen.']
  ].map(([t,d]) => ({t,d}));
  xfRows = [
    ['Diagnostic results copied into a spreadsheet at the end of every shift','Results are written to the device record the moment testing finishes'],
    ['Hunting for erasure proof when a buyer asks for it','A certificate per IMEI, already attached to the invoice'],
    ['"Which shelf is it on?" shouted across the floor','Location down to the bin, with the last scan time and who scanned it'],
    ['Offers negotiated over DMs, texts and email','One queue, with your floor prices enforced'],
    ['Separate tools for repair, shipping and listings','One record from intake to ship-out']
  ];
  testimonials = [
    ['We used to copy test results into a sheet at the end of every shift. Now the grade is on the device record before the tech puts the phone down.','Miles','Operations lead · Northgate Wireless · 3 locations'],
    ['Buyers ask for erasure proof on every lot. We attach the certificates to the invoice, and that ends the conversation.','Amin','Owner · Ortega Mobile Wholesale'],
    ['The auto-counter stopped us from saying yes to bad offers at eleven at night.','Brian','Co-founder · Second Signal Phones'],
    ['I can see which kiosk has the 256 GB units before a customer walks across the mall to ask.','Lucas','General manager · CellPoint Kiosks · 6 locations'],
    ['Repairs used to vanish somewhere between the bench and the shelf. Now every move is a scan.','Andre','Repair manager · FixFirst Electronics']
  ];

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
      const hb = this.heroBarRef.current, mr = this.moreRef.current;
      if (hb && mr) {
        const f = hb.getBoundingClientRect().bottom < sc(64) && mr.getBoundingClientRect().top > vh - sc(40);
        if (f !== s.promoFixed) this.setState({ promoFixed:f });
      }
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
      ruleR: wide ? '1px solid #D9D0C2' : '0'
    };
    const is = {}; PAGES.forEach(p => is[p] = s.page === p);
    const nav = { pricing: s.page === 'pricing' ? '#EB5E12' : 'transparent' };
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
      footPad: anim && s.promoFixed && !s.promoX ? '4.125rem' : '0.625rem',
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
      lanes: [['Repair','3','25%','#B3261E','→ Bench R-2 · rear camera, battery'],['Sale / ship','6','50%','#EB5E12','→ SO-10422 · UPS Ground · Fri'],['Storage','3','25%','#1E7A4A','→ WH-A · C-14-03, C-14-04']]
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
    const xf = this.xfRows.map(([b,a], i) => ({ b, a, bFg: s.xfOn ? '#8E857A' : '#3A342D', strike: s.xfOn ? '#B3261E' : 'transparent', o: s.xfOn ? 1 : 0, t: s.xfOn ? 'none' : 'translateX(-0.5rem)', d: (i * 180) + 'ms', d2: (i * 180 + 250) + 'ms' }));
    const scrollTesti = dir => { const el = this.testiRef.current; if (!el) return; const f = el.querySelector('figure'); const w = f ? f.getBoundingClientRect().width + sc(28) : sc(400); el.scrollBy({ left: dir * w, behavior:'smooth' }); };
    const testi = {
      items: this.testimonials.map(([q,n,r]) => ({q,n,r})), pos: `${String(s.tIdx + 1).padStart(2,'0')} / ${String(this.testimonials.length).padStart(2,'0')}`,
      prev: () => scrollTesti(-1), next: () => scrollTesti(1),
      onScroll: e => { const el = e.currentTarget, f = el.querySelector('figure'); const w = f ? f.getBoundingClientRect().width + sc(28) : sc(400); const i = Math.min(this.testimonials.length - 1, Math.round(el.scrollLeft / w)); if (i !== this.state.tIdx) this.setState({ tIdx:i }); }
    };

    return {
      ui, is, nav,
      menuOpen: s.menu, menuLabel: s.menu ? 'Close' : 'Menu', menuBtnBg: s.menu ? '#16130F' : 'transparent', menuBtnFg: s.menu ? '#F6F2EA' : '#16130F',
      toggleMenu: () => this.setState({ menu: !s.menu, langOpen:false }),
      menuItems: [['Industries','industries','Refurbishers, repair shops, wholesale, retail chains, online sellers'],['Features','features','Every module, listed plainly'],['Pricing','pricing',`${STARTER.name}, ${GROWTH.name} and ${ENTERPRISE.name} plans`],['Contact','contact','Talk to sales about volume and locations'],['Learn more','platform','Integrations and the device record']]
        .map(([label,p,desc]) => ({ label, desc, href:'#/' + p, path:'/' + p, bg: s.page === p ? '#FBE7CC' : '#FFFFFF' })),
      langOpen: s.langOpen, langCode: s.lang, langName: (langs.find(l => l[0] === s.lang) || langs[0])[1],
      toggleLang: () => this.setState({ langOpen: !s.langOpen }),
      langs: langs.map(([code,name]) => ({ code, name, bg: code === s.lang ? '#FBE7CC' : '#FFFFFF', pick: () => this.setState({ lang:code, langOpen:false }) })),
      goTrial: e => { if (e && e.preventDefault) e.preventDefault(); this.goto('start', { step:1, trial:true, menu:false }); },
      loginUrl: SIGNIN_HREF, // every Sign in link opens "Sign in to your shop"
      hero, heroBarRef: this.heroBarRef, moreRef: this.moreRef, wrapRef: this.wrapRef, trackRef: this.trackRef, xfRef: this.xfRef, testiRef: this.testiRef,
      sb, rail, s1, s2, s3, s4, s5, s6, s7, stageRef: this.stageRef, cr,
      toggleMode: () => this.setMode(anim ? 'slides' : 'anim'),
      caps: this.caps, xf, testi,
      tenPhones: this.tenRes.map(([t,c], k) => { const st = s.tenStage[k]; return {
        t, c, scr: st >= 2 ? '#F6F2EA' : '#0B0907', bd: st >= 1 ? '#B9AE9E' : '#6B6257',
        cableS: st >= 1 ? 1 : .25, cable: st >= 1 ? '#B9AE9E' : '#6B6257',
        bootO: st >= 2 && st < 4 ? 1 : 0, logoS: st >= 2 ? 1 : .6, barO: st >= 3 ? 1 : 0,
        barW: st >= 3 ? '100%' : '0%', barTr: st >= 3 ? 'width 1400ms linear' : 'none', resO: st >= 4 ? 1 : 0 }; }),
      tenSum: (() => { const d = s.tenStage.filter(x => x >= 4).length, pass = this.tenRes.filter((r, k) => s.tenStage[k] >= 4 && r[0] === 'PASS').length, run = s.tenStage.filter(x => x >= 1 && x < 4).length; return d === 10 ? `10 of 10 complete · ${pass} passed · ${10 - pass} flagged` : `${d} of 10 complete · ${run} testing`; })(),
      ledger: [['10/01','iPh 13 128 blk','B','shelf 4?',0],['10/01','S22 Ultra 256','A-','bin C-12',0],['10/01','iPh 12 64 blue','B','sold??',1],['10/02','Pixel 7 obsid.','A','Elm st',0],['10/02','iPh 14 Pro 256','?','repair — Mike',1],['10/02','iPh 11 64 wht','B','kiosk / WH?',0],['10/03','S23 lavender','A','—',1]].map(([d,m,g,l,x]) => ({ d, m, g, l, fg: x ? '#8E857A' : '#3A342D', dec: x ? 'line-through' : 'none' })),
      promo: { show: s.page === 'home' && s.promoFixed && !s.promoX && (this.props.showPromo ?? true), dismiss: () => this.setState({ promoX:true }) },
      ...this.pageVals(s, ui)
    };
  }
  industries = [
    ['Refurbishers & ITAD','High volume in, certified stock out.','Run hundreds of devices a day through test, erasure and grading, with a certificate for every IMEI your buyers will ask about.',['Receive lot and scan the manifest','Bulk-diagnose on stations','Certified erasure','Grade and photograph','Route to sale, repair or recycling'],['Diagnostics','Erasure','Grading','Inventory','Sales orders'],ENTERPRISE.name],
    ['Independent repair shops','Know every part and every device on the bench.','Check in customer devices, log the fault, pull the part with its serial and retest before handing it back. The customer history stays with the device.',['Check in the customer device','Diagnose the fault','Pull the part and log its serial','Repair and retest','Notify the customer and hand back'],['Repair suite','Parts inventory','Retest','Invoices'],STARTER.name],
    ['Wholesale & trade-in buyers','Price lots quickly, and pay only for what arrived.','Verify every unit against the manifest on arrival, flag discrepancies automatically, and counter offers using rules instead of gut feel.',['Accept an offer or send a quote','Receive and verify against the manifest','Flag discrepancies to the vendor','Grade','Resell in lots'],['Offers & auto-counter','Diagnostics','Vendor CRM','Auction marketplace'],GROWTH.name],
    ['Multi-location retail','Every store, every shelf, one count.','Trade-ins at the counter, transfers to a refurb hub and restocking by demand, with staff roles and live stock for every location.',['Take the trade-in at the counter','Transfer to the refurb hub','Restock stores by demand','Sell in store or online'],['Locations & transfers','Roles & permissions','Listings','Data insights'],ENTERPRISE.name],
    ['Online marketplace sellers','List what\'s graded, ship what sold.','Graded stock goes straight to your listings with quantities kept in sync. Orders create labels, and returns come back into testing.',['Source devices','Test and grade','List to marketplaces','Pick, pack and label','Handle returns'],['Listings','Shipping & labels','Returns','Live accounting'],GROWTH.name]
  ];
  ladder = [['One bench','A single technician testing and repairing.',`${STARTER.name} · ${money(STARTER.price.month)}/mo`],['One store','Counter trade-ins, repairs and retail stock.',`${STARTER.name} → ${GROWTH.name}`],['A few locations','Transfers, staff roles and shared stock.',`${GROWTH.name} · ${money(GROWTH.price.month)}/mo`],['A network','Refurb hubs, many stores, API and insights.',`${ENTERPRISE.name} · ${money(ENTERPRISE.price.month)}/mo`]];
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
    ['Listings','Marketplace listings','Publish graded stock and sync quantities'],
    ['CRM','Customer & vendor accounts','History, terms and contacts'],
    ['CRM','Price lists','Per-customer pricing by model and grade'],
    ['Insights','Margin by model & grade','Cost, repair and sale rolled up'],
    ['Insights','Technician throughput','Devices tested and repaired per tech'],
    ['Platform','Roles & permissions','Control who can grade, price or ship'],
    ['Platform','Zapier','Connect other tools without code'],
    ['Platform','API & webhooks','Build on InPhox data'],
    ['Platform','Live accounting sync','Entries post to your books']
  ];
  integrations = [['PhoneCheck','Diagnostics','LIVE'],['M360','Diagnostics','LIVE'],['eBay','Marketplaces','LIVE'],['Zapier','Automation','LIVE'],['Webhooks','Developer','LIVE'],['REST API','Developer','LIVE'],['Amazon','Marketplaces','IN DEV'],['Back Market','Marketplaces','IN DEV'],['Swappa','Marketplaces','IN DEV'],['Shopify','Marketplaces','IN DEV'],['UPS','Shipping','IN DEV'],['FedEx','Shipping','IN DEV'],['USPS','Shipping','IN DEV'],['ShipStation','Shipping','IN DEV'],['QuickBooks Online','Accounting','IN DEV'],['Xero','Accounting','IN DEV'],['Stripe','Payments','IN DEV']];
  record = [['Oct 2 · 08:14','Received in lot L-0418','Manifest scan','D. Chen','WH-A · Dock 2'],['08:31','Connected · port 17','Station B-04','D. Chen','WH-A'],['08:33','Functional test 41/42 · rear camera','InPhox Diagnostics','—','Station B-04'],['08:34','Erasure certified · NIST 800-88','InPhox Diagnostics','—','Station B-04'],['09:02','Repair RT-2207 · rear camera replaced','Repair suite','M. Ortiz','Bench R-2'],['09:24','Retest 42/42 · graded A-','InPhox Diagnostics','M. Ortiz','Bench R-2'],['09:30','Shelved','Handheld scan','Sam P.','C-14-03'],['Oct 3 · 10:02','Listed at $869','eBay','—','—'],['14:47','Sold · UPS label created','eBay · UPS','Sam P.','Dock 1']];

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

    // Pricing. The site takes no payment: every plan button starts the sign-up flow
    // (the Start page) with that plan picked, and the plan is paid for in the app.
    // Enterprise billed monthly is contract only, so it becomes "Talk to us".
    const interval = s.annual ? 'year' : 'month';
    const yearly = interval === 'year';
    const choosePlan = code => { this.setState({ plan:code, step: s.a.email ? 2 : 1 }); location.hash = '#/start'; };
    const planAction = p => !sellsOnline(p, interval) ? { href:'#/contact' } : { onClick: () => choosePlan(p.code) };
    const planCta = p => sellsOnline(p, interval) ? `Start with ${p.name}` : 'Talk to us';
    const seg = on => on ? ['#16130F','#F6F2EA'] : ['transparent','#16130F'];
    const [mBg, mFg] = seg(!yearly), [yBg, yFg] = seg(yearly);

    // Estimate your month: every plan at this volume, the chosen one line by line.
    const best = cheapestPlan(s.checks, s.stations, interval);
    const sel = (s.estPlan && findPlan(s.estPlan)) || best;
    const est = estimate(sel, s.checks, interval), bestEst = estimate(best, s.checks, interval);
    const used = Math.min(s.checks, sel.checksIncluded);
    const lines = [
      { n: `${sel.name} plan`, calc: yearly ? `${money(sel.price.year)} a year ÷ 12` : sel.annualCommitment ? 'annual commitment, by contract' : 'billed monthly', cost: money(est.base) },
      { n: 'Included checks', calc: `${count(used)} of ${count(sel.checksIncluded)} used`, cost: money(0) },
      ...est.lines.map(l => ({ n: `${l.label} checks over`, calc: `${count(l.checks)} × ${usd(l.rate, 2)}`, cost: usd(l.cost, 2) }))
    ];
    let recMsg;
    if (!fitsStations(sel, s.stations)) recMsg = sel.stations === 0 ? `${sel.name} has no station app. ${best.name} covers ${s.stations} station${s.stations > 1 ? 's' : ''} for ${money(bestEst.total)}/mo.` : `${sel.name} has up to ${sel.stations} stations. ${best.name} covers ${s.stations} for ${money(bestEst.total)}/mo.`;
    else if (sel !== best) recMsg = `${best.name} covers this volume for ${money(est.total - bestEst.total)}/mo less.`;
    else if (est.overageChecks) recMsg = `${sel.name} costs least at this volume. Overage is billed in bands down to ${usd(PER_CHECK_FLOOR, 2)} a check, capped by a limit you set.`;
    else recMsg = `${sel.name} costs least at this volume, with ${count(sel.checksIncluded - s.checks)} included checks to spare.`;
    const yearSave = sel.price.month * 12 - sel.price.year;

    const pr = {
      mBg, mFg, yBg, yFg,
      monthLabel: pricing.intervals[0].label, yearLabel: pricing.intervals[1].label,
      monthly: () => this.setState({ annual:false }), yearly: () => this.setState({ annual:true }),
      tiers: pricing.plans.map(p => { const c = planCard(p, interval), hi = !!p.highlight; return {
        ...c, top: hi ? '#EB5E12' : 'transparent', bg: hi ? '#FFFFFF' : 'transparent',
        btnBg: hi ? '#EB5E12' : 'transparent', btnBd: hi ? '#EB5E12' : '#16130F', cta: planCta(p), act: planAction(p) }; }),
      paymentLine: pricing.paymentLine, footnote: pricing.footnote, faq: pricing.faq,
      planNames: pricing.plans.map(p => p.name),
      compare: compareRows().map(([l,a,b,c]) => ({l,a,b,c})),
      checks: s.checks, checksStr: count(s.checks), stations: s.stations,
      setChecks: e => this.setState({ checks: +e.target.value }),
      stDown: () => this.setState(st => ({ stations: Math.max(0, st.stations - 1) })), stUp: () => this.setState(st => ({ stations: Math.min(40, st.stations + 1) })),
      plans: pricing.plans.map(p => { const on = p === sel, x = estimate(p, s.checks, interval), fits = fitsStations(p, s.stations); return {
        name: p.name, tag: p === best ? 'Lowest cost' : !fits ? 'Too few stations' : '',
        tagFg: p === best ? '#1E7A4A' : '#B3261E',
        desc: `${count(p.checksIncluded)} checks included, then ${usd(startRate(p), 2)} falling to ${usd(PER_CHECK_FLOOR, 2)} · ${p.stations == null ? 'unlimited stations' : p.stations === 0 ? 'no station app' : `up to ${p.stations} stations`}`,
        rate: `${money(x.total)} / mo`,
        cbBg: on ? '#16130F' : '#FFFFFF', mark: on ? '✓' : '', toggle: () => this.setState({ estPlan: p.code }) }; }),
      lines, total: money(est.total), rec: recMsg,
      perCheck: `${usd(est.perCheck, 2)} per check, all in`,
      yearNote: yearly ? `Annual billing saves ${money(yearSave)} a year on ${sel.name}.` : `Billed annually, ${sel.name} would save ${money(yearSave)} a year.`,
      estCta: planCta(sel), estAct: planAction(sel)
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
        if (!c.name.trim()) er.name = 'Enter your name.';
        if (!/^\S+@\S+\.\S+$/.test(c.email)) er.email = 'Enter a valid work email.';
        if (!c.company.trim()) er.company = 'Enter your company name.';
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
      items: this.integrations.map(([n,c,st]) => { const hit = s.platCat === 'All' || s.platCat === c; return { n, s: st, fg: hit ? '#16130F' : '#D9D0C2', sc: !hit ? '#D9D0C2' : st === 'LIVE' ? '#1E7A4A' : '#8E857A' }; }),
      more: s.platMore, moreLabel: s.platMore ? 'Read less ▴' : 'Read more ▾', toggle: () => this.setState({ platMore: !s.platMore })
    };
    const rec = this.record.map(([t,e,src,u,l]) => ({ t, e, s:src, u, l }));

    const a = s.a, ae = s.aErr;
    const setA = k => e => this.setState(st => ({ a: { ...st.a, [k]: e.target.value }, aErr: { ...st.aErr, [k]: '' } }));
    const chosen = findPlan(s.plan) || GROWTH;
    // Create account: no password and no payment here. The sign-up goes to
    // the InPhox platform, which emails a confirmation link; the shop is then created,
    // the owner sets a password from the welcome email, finishes setup in the
    // app and pays for the plan as the last step.
    const createAccount = () => {
      if (s.sSending) return;
      if (!signupAction) { this.setState({ step:3 }); return; }
      this.setState({ sSending:true, sErr:'' });
      const body = new URLSearchParams([['owner_name', a.name.trim()], ['company_name', a.company.trim()], ['email', a.email.trim()], ['plan', chosen.code], ['interval', interval]]);
      fetch(signupAction, { method:'POST', headers:{ Accept:'application/json' }, body })
        .then(async res => {
          if (res.ok) { this.setState({ sSending:false, step:3 }); return; }
          let data = {}; try { data = await res.json(); } catch (e) { /* not JSON */ }
          if (res.status === 400 && data.field) {
            const map = { owner_name:'name', company_name:'company', email:'email' };
            const f = map[data.field];
            if (f) { this.setState({ sSending:false, step:1, aErr: { [f]: data.error || 'Check this field.' } }); return; }
          }
          if (res.status === 409) { this.setState({ sSending:false, sErr: 'Enterprise is billed annually. Switch to Annual on Pricing, or talk to us about monthly terms.' }); return; }
          throw new Error('Sign-up not accepted: ' + res.status);
        })
        .catch(() => this.setState({ sSending:false, sErr:"That didn't go through. Please try again in a moment." }));
    };
    const st = {
      loginUrl: SIGNIN_HREF,
      showStep1: s.step === 1, showStep2: s.step === 2, showDone: s.step === 3,
      headline: s.step === 3 ? 'Check your email.' : 'Set up InPhox for your shop.',
      sub: 'Create an account and choose a plan. You pay for it at the end of setting up your shop, not here.',
      steps: [['01','Account'],['02','Plan'],['03','Confirm your email']].map(([n,t],i) => { const cur = s.step === i + 1, dn = s.step > i + 1; return { n, t, fg: cur || dn ? '#F6F2EA' : '#8E857A', s: dn ? 'DONE' : cur ? 'NOW' : '', sc: dn ? '#7FC79F' : '#EB5E12' }; }),
      a, setA: { name: setA('name'), company: setA('company'), email: setA('email') },
      e: { name: ae.name || '', company: ae.company || '', email: ae.email || '' },
      bd: { name: ae.name ? '#B3261E' : '#D9D0C2', company: ae.company ? '#B3261E' : '#D9D0C2', email: ae.email ? '#B3261E' : '#D9D0C2' },
      next1: e => { e.preventDefault(); const er = {};
        if (!a.name.trim()) er.name = 'Enter your name.'; if (!a.company.trim()) er.company = 'Enter your company.';
        if (!/^\S+@\S+\.\S+$/.test(a.email)) er.email = 'Enter a valid work email.';
        this.setState(Object.keys(er).length ? { aErr: er } : { aErr:{}, step:2 }); },
      plans: pricing.plans.map(p => { const c = planCard(p, interval), on = p === chosen; return { name: p.name, d: `${p.who} · ${c.checks}`, price: c.priceStr + '/mo', bg: on ? '#FBE7CC' : 'transparent', dot: on ? '#16130F' : 'transparent', pick: () => this.setState({ plan:p.code, sErr:'' }) }; }),
      billing: `Nothing is charged now. You'll add payment (card or monthly USDC invoice) as the last step of setting up your shop, ${yearly ? 'billed annually' : 'billed monthly'}. `,
      trialBg: s.trial ? '#16130F' : '#FFFFFF', trialMark: s.trial ? '✓' : '', toggleTrial: () => this.setState({ trial: !s.trial }),
      back: () => this.setState({ step:1, sErr:'' }),
      // The plan is the last choice of sign-up; no payment happens on this site.
      cta2: !sellsOnline(chosen, interval) ? 'Talk to us' : s.sSending ? 'Creating your account…' : `Create account on ${chosen.name}`,
      act2: !sellsOnline(chosen, interval) ? { href:'#/contact' } : { onClick: createAccount },
      sErr: s.sErr,
      doneTag: `${chosen.name} plan chosen · pay when you finish setup`,
      doneTitle: `We sent a confirmation link to ${a.email || 'your email'}.`,
      doneSteps: [
        'Open the link to confirm your email',
        `We set up ${a.company || 'your shop'} (usually a few minutes) and email you when it's ready`,
        'Sign in, set your password, finish setting up your shop, and choose your plan'
      ]
    };
    // Sign in to your shop: each shop's InPhox app lives at <shop>.<shopDomain>.
    const goShop = shop => { saveLastShop(shop); location.assign(shopLoginUrl(shop, shopDomain)); };
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
      goTrial: e => { if (e && e.preventDefault) e.preventDefault(); this.goto('start', { step:1, trial:true, menu:false }); }
    };
    return { ind, feat, pr, ct, plat, rec, st, si };
  }
}
