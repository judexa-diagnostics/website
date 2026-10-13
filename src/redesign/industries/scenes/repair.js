// Industries tab 02: an independent repair shop.
// One 40 s loop: drop-off at the counter (ticket RT-2207 on the tablet), the
// technician carries the phone to the bench, the station runs 42 checks, the
// display is swapped (part serial scanned into the ticket), retest goes 42/42,
// the customer gets a ready text, pickup + payment at the counter.
// Units are centimetres. Everything is stateless in t so the loop and the
// dev jump (window.__indGo) land on the same frame.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { clone as skClone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { loadPeople, LOOKS } from '../../people/people.js';
import { MAT, PW, PH, makeTools, makeMacStudio } from '../../story/models.js';
import { whenLogo } from '../../story/textures.js';

const V3 = THREE.Vector3, Q = THREE.Quaternion;
const INK = '#16130F', CREAM = '#F6F2EA', OR = '#EB5E12', OR2 = '#C2470A', GR = '#1E7A4A', RED = '#B3261E';
const M1 = '#3A342D', M2 = '#6B6257', M3 = '#8E857A', RULE = '#D9D0C2', ROW = '#EDE7DC';
const sans = (s, w = 700) => `${w} ${s}px Archivo, system-ui, sans-serif`;
const mono = (s, w = 500) => `${w} ${s}px 'JetBrains Mono', ui-monospace, monospace`;
const DUR = 40;

const clamp01 = x => (x < 0 ? 0 : x > 1 ? 1 : x);
const lin = (a, b, t) => clamp01((t - a) / (b - a));
const ss = (a, b, t) => { const x = lin(a, b, t); return x * x * (3 - 2 * x); };
const sm = (a, b, t) => { const x = lin(a, b, t); return x * x * x * (x * (x * 6 - 15) + 10); };
const mix = (a, b, k) => a + (b - a) * k;

function luhn(body) {
  let s = 0;
  for (let i = 0; i < 14; i++) { let d = +body[i]; if (i % 2) { d *= 2; if (d > 9) d -= 9; } s += d; }
  return body + ((10 - (s % 10)) % 10);
}
const IMEI = luhn('35670112844071');
const IMEI_FMT = IMEI.slice(0, 6) + ' ' + IMEI.slice(6, 8) + ' ' + IMEI.slice(8, 14) + ' ' + IMEI.slice(14);

const TESTS = ['Display', 'Touch', 'Multi-touch', 'Dead pixels', 'Brightness', 'Front cam', 'Rear cam',
  'Wide cam', 'Flash', 'Face unlock', 'Proximity', 'Light sensor', 'Gyro', 'Accel', 'Compass',
  'Barometer', 'Earpiece', 'Speaker', 'Mic 1', 'Mic 2', 'Mic 3', 'Vibration', 'Vol +', 'Vol −',
  'Power key', 'Mute key', 'Wi-Fi', 'Bluetooth', 'Cellular', 'GPS', 'NFC', 'SIM tray',
  'Charging', 'Wireless chg', 'Battery', 'Storage', 'Memory', 'Thermal', 'Lock status',
  'Carrier', 'Parts check', 'Liquid'];
const STEPS = ['Diagnosing', 'Repairing', 'Retest', 'Ready'];

// ---------------------------------------------------------------- timeline
// Bench phone events (seconds into the loop).
const T = {
  dropAt: 3.0, typeA: 3.2, typeB: 4.5, printA: 4.6, printB: 5.4,
  pick: 6.0, walkA: 6.5, walkB: 8.4, place: 9.4, plug: 9.9, devA: 10.1, testA: 10.5, testB: 12.6,
  openA: 13.4, openB: 14.8, drawerA: 15.0, drawerB: 15.8, bagUp: 16.6, scanA: 16.7, scanHit: 17.6,
  scanB: 18.6, crackOut: 18.6, crackDone: 19.6, newA: 19.6, newB: 20.8, closeA: 21.0, closeB: 22.4,
  retestA: 23.0, retestB: 25.6, ready: 26.6, bubbleA: 27.6, bubbleB: 32.2,
  leaveBench: 28.6, atCounter: 31.8, handA: 32.6, handB: 33.6, custTake: 34.2, payA: 34.6, paid: 35.6, exitA: 36.4
};

// The bag and the old display are cleared off the mat while the camera is on
// the monitor (out of frame), so nothing visibly vanishes.
const CLEAR_T = 27.2;

function deskTime(t) {
  // Shop clock on screens: 10:41 at loop start, 10:59 at the end.
  const m = 41 + Math.floor((t / DUR) * 18);
  return '10:' + String(m).padStart(2, '0');
}

// ---------------------------------------------------------------- canvas helpers
let texList = []; // textures of the scene instance being built
function canvasTex(w, h, draw, live = false) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  let last = null, lastKey = '';
  const paint = (state, force) => {
    const key = state === undefined ? '' : JSON.stringify(state);
    if (!force && key === lastKey && last !== null) return;
    last = state; lastKey = key;
    g.save(); g.clearRect(0, 0, w, h); draw(g, w, h, state); g.restore();
    tex.needsUpdate = true;
  };
  tex.userData.paint = paint;
  tex.userData.repaint = () => { if (last !== null) paint(last, true); };
  texList.push(tex);
  if (!live) paint(0);
  return tex;
}
function rr(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
function barcode(g, x, y, w, h, seed = 7) {
  let s = seed; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  let cx = x;
  while (cx < x + w) { const bw = 1 + Math.floor(rnd() * 3.2); if (rnd() > 0.42) g.fillRect(cx, y, bw, h); cx += bw + 1; }
}
function check(g, x, y, s, col, lw = 3) {
  g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(x, y); g.lineTo(x + s * 0.38, y + s * 0.36); g.lineTo(x + s, y - s * 0.45); g.stroke();
}
function cross(g, x, y, s, col, lw = 3) {
  g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x, y); g.lineTo(x + s, y + s); g.moveTo(x + s, y); g.lineTo(x, y + s); g.stroke();
}
let LOGO = null;
function logo(g, x, y, s) { if (LOGO && LOGO.naturalWidth) g.drawImage(LOGO, x, y, s, s); else { g.fillStyle = OR; rr(g, x, y, s, s, s * 0.2); g.fill(); } }
function pill(g, x, y, text, bg, fg, size = 15) {
  g.font = sans(size, 650); const w = g.measureText(text).width + size * 1.2;
  g.fillStyle = bg; rr(g, x, y, w, size * 1.9, 4); g.fill();
  g.fillStyle = fg; g.fillText(text, x + size * 0.6, y + size * 1.32);
  return w;
}
const STEP_COL = [['#FBE7CC', '#8A4A12'], ['#F6E1DE', RED], ['#E8E4F4', '#4B3F8A'], ['#E3F1E8', GR]];

// ---------------------------------------------------------------- station monitor
function drawMonitor(g, W, H, S) {
  g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, W, H);
  // top bar
  g.fillStyle = OR2; g.fillRect(0, 0, W, 58);
  logo(g, 16, 11, 36);
  g.fillStyle = '#fff'; g.font = sans(24, 750); g.fillText('InPhox', 62, 38);
  g.font = sans(17, 550);
  ['Repairs', 'Devices', 'Parts', 'Customers'].forEach((n, i) => {
    g.globalAlpha = i === 0 ? 1 : 0.72; g.fillText(n, 196 + i * 120, 37);
    if (i === 0) { g.fillRect(196, 50, g.measureText(n).width, 3); }
  });
  g.globalAlpha = 1;
  g.font = mono(15, 600); g.textAlign = 'right';
  g.fillText('BENCH R-2  ·  ' + S.tm, W - 44, 36); g.textAlign = 'left';
  g.fillStyle = '#9EE6B8'; g.beginPath(); g.arc(W - 26, 31, 6, 0, 7); g.fill();

  // title row
  g.fillStyle = INK; g.font = sans(30, 750); g.fillText('RT-2207', 28, 104);
  g.font = sans(22, 500); g.fillStyle = M1; g.fillText('Cracked screen  ·  quoted $129', 170, 103);
  if (S.status >= 0) {
    const [bg, fg] = STEP_COL[S.status];
    g.font = sans(18, 650); const tw = g.measureText(STEPS[S.status]).width;
    pill(g, W - 40 - tw - 22, 76, STEPS[S.status], bg, fg, 18);
  }
  g.fillStyle = RULE; g.fillRect(28, 124, W - 56, 2);

  // ---- column 1: device card
  const c1 = 28, cw1 = 340, top = 144;
  g.strokeStyle = RULE; g.lineWidth = 2; rr(g, c1, top, cw1, 520, 6); g.stroke();
  g.fillStyle = M3; g.font = mono(14, 600); g.fillText('DEVICE', c1 + 20, top + 32);
  if (!S.plugged) {
    g.fillStyle = M2; g.font = sans(20, 500); g.fillText('Waiting for device…', c1 + 20, top + 80);
    g.strokeStyle = ROW; g.lineWidth = 5; g.beginPath(); g.arc(c1 + 36, top + 130, 14, 0, 7); g.stroke();
    g.strokeStyle = OR; g.beginPath(); g.arc(c1 + 36, top + 130, 14, S.spin, S.spin + 1.6); g.stroke();
  } else {
    const rows = [
      ['IMEI', IMEI_FMT, 'mono'],
      ['Storage', '128 GB · Midnight'],
      ['Battery', '87% · 640 cycles'],
      ['Lock', 'Off · Unlocked'],
      ['Display', S.replaced ? 'Replaced · new part' : 'Original · cracked'],
      ['Owner', 'Dana R. · •••-0142']
    ];
    g.fillStyle = INK; g.font = sans(28, 750); g.fillText('6.1″ phone', c1 + 20, top + 72);
    let x = c1 + 20;
    x += pill(g, x, top + 88, 'Connected', '#E3F1E8', GR, 14) + 8;
    pill(g, x, top + 88, 'USB · 0.4 s', ROW, M1, 14);
    rows.forEach(([k, v, kind], i) => {
      const a = clamp01(S.dev * rows.length - i);
      if (a <= 0) return;
      g.globalAlpha = a;
      const y = top + 168 + i * 56;
      g.fillStyle = i % 2 ? '#FFFFFF' : '#FBF8F2'; g.fillRect(c1 + 10, y - 30, cw1 - 20, 50);
      g.fillStyle = M3; g.font = mono(14, 500); g.fillText(k.toUpperCase(), c1 + 20, y);
      g.fillStyle = (k === 'Display') ? (S.replaced ? GR : RED) : INK;
      g.font = kind === 'mono' ? mono(19, 600) : sans(19, 600);
      g.fillText(v, c1 + 112, y);
    });
    g.globalAlpha = 1;
  }

  // ---- column 2: 42-point test
  const c2 = 388, cw2 = 500;
  g.strokeStyle = RULE; g.lineWidth = 2; rr(g, c2, top, cw2, 520, 6); g.stroke();
  g.fillStyle = M3; g.font = mono(14, 600); g.fillText(S.retest ? 'RETEST · 42 CHECKS' : '42-POINT TEST', c2 + 20, top + 32);
  const done = S.count, fails = S.fails;
  const failed = fails.filter(i => i < done).length;
  const passN = done - failed;
  g.textAlign = 'right';
  g.font = sans(34, 800); g.fillStyle = done === 0 ? M3 : failed ? RED : (done === 42 ? GR : INK);
  g.fillText(passN + '/42', c2 + cw2 - 20, top + 40);
  g.textAlign = 'left';
  const cols = 6, cellW = 74, cellH = 52, gap = 4, gx = c2 + 20, gy = top + 62;
  for (let i = 0; i < 42; i++) {
    const cx = gx + (i % cols) * (cellW + gap), cy = gy + Math.floor(i / cols) * (cellH + gap);
    const isFail = fails.includes(i), isDone = i < done, isRun = i === done && S.running;
    g.fillStyle = !isDone ? '#F4F0E8' : isFail ? '#F6E1DE' : '#E3F1E8';
    rr(g, cx, cy, cellW, cellH, 4); g.fill();
    if (isRun) { g.strokeStyle = OR; g.lineWidth = 2.5; rr(g, cx + 1, cy + 1, cellW - 2, cellH - 2, 4); g.stroke(); }
    g.fillStyle = !isDone ? M3 : isFail ? RED : GR;
    g.font = sans(12, 650);
    let name = TESTS[i];
    g.fillText(name, cx + 7, cy + 20);
    if (isDone) { if (isFail) cross(g, cx + 8, cy + 30, 11, RED, 2.5); else check(g, cx + 8, cy + 38, 13, GR, 2.5); }
  }
  const fy = gy + 7 * (cellH + gap) + 20;
  g.font = sans(17, 600);
  if (done >= 42 && failed) { g.fillStyle = RED; g.fillText('2 failed: Display, Touch  →  screen repair', c2 + 20, fy); }
  else if (done >= 42) { g.fillStyle = GR; g.fillText('All 42 passed. Matches intake, nothing new.', c2 + 20, fy); }
  else if (S.running) { g.fillStyle = M2; g.fillText('Running ' + TESTS[Math.min(41, done)] + '…', c2 + 20, fy); }
  else { g.fillStyle = M3; g.fillText(S.plugged ? 'Ready to test' : 'Plug in to start', c2 + 20, fy); }

  // ---- column 3: ticket
  const c3 = 908, cw3 = W - 28 - c3;
  g.strokeStyle = RULE; g.lineWidth = 2; rr(g, c3, top, cw3, 520, 6); g.stroke();
  g.fillStyle = M3; g.font = mono(14, 600); g.fillText('REPAIR TICKET', c3 + 20, top + 32);
  // stepper
  const sx = c3 + 30, sw = (cw3 - 60) / 3, sy = top + 74;
  g.fillStyle = ROW; g.fillRect(sx, sy - 2, sw * 3, 4);
  if (S.status > 0) { g.fillStyle = GR; g.fillRect(sx, sy - 2, sw * Math.min(3, S.status), 4); }
  STEPS.forEach((n, i) => {
    const x = sx + i * sw, on = i <= S.status, cur = i === S.status;
    g.fillStyle = on ? (cur && i < 3 ? OR : GR) : '#FFFFFF';
    g.strokeStyle = on ? (cur && i < 3 ? OR : GR) : RULE; g.lineWidth = 3;
    g.beginPath(); g.arc(x, sy, 11, 0, 7); g.fill(); g.stroke();
    if (on && !(cur && i < 3)) check(g, x - 5, sy + 1, 10, '#fff', 2.5);
    g.fillStyle = on ? INK : M3; g.font = sans(13, cur ? 750 : 550); g.textAlign = 'center';
    g.fillText(n, x, sy + 34); g.textAlign = 'left';
  });
  // parts
  let y = top + 150;
  g.fillStyle = M3; g.font = mono(13, 600); g.fillText('PARTS & LABOR', c3 + 20, y); y += 34;
  g.fillStyle = INK; g.font = sans(18, 650); g.fillText('Display assembly 6.1″', c3 + 20, y);
  g.textAlign = 'right'; g.fillText('$89', c3 + cw3 - 20, y); g.textAlign = 'left';
  y += 14;
  if (S.part === 2) {
    g.fillStyle = S.flash > 0 ? `rgba(30,122,74,${0.12 + S.flash * 0.25})` : '#E3F1E8';
    rr(g, c3 + 16, y, cw3 - 32, 62, 5); g.fill();
    check(g, c3 + 28, y + 26, 14, GR, 3);
    g.fillStyle = GR; g.font = mono(17, 700); g.fillText('SN DSP61-884120', c3 + 52, y + 27);
    g.fillStyle = M1; g.font = sans(14, 500); g.fillText('Scanned ' + S.tm + ' · bin B-04 · stock 6 → 5', c3 + 52, y + 50);
  } else {
    g.setLineDash([7, 6]); g.strokeStyle = S.part === 1 ? OR : '#C9BFB0'; g.lineWidth = 2;
    rr(g, c3 + 16, y, cw3 - 32, 62, 5); g.stroke(); g.setLineDash([]);
    g.fillStyle = S.part === 1 ? OR2 : M3; g.font = sans(16, 600);
    g.fillText(S.part === 1 ? 'Reading serial…' : 'Scan part serial to attach', c3 + 30, y + 37);
    if (S.part === 1) { g.fillStyle = OR; g.fillRect(c3 + 30, y + 46, (cw3 - 70) * S.scanP, 3); }
  }
  y += 98;
  g.fillStyle = INK; g.font = sans(18, 600); g.fillText('Labor · screen', c3 + 20, y);
  g.textAlign = 'right'; g.fillText('$40', c3 + cw3 - 20, y); g.textAlign = 'left';
  y += 20; g.fillStyle = RULE; g.fillRect(c3 + 20, y, cw3 - 40, 2); y += 36;
  g.fillStyle = INK; g.font = sans(22, 800); g.fillText('Total quoted', c3 + 20, y);
  g.textAlign = 'right'; g.fillText('$129', c3 + cw3 - 20, y); g.textAlign = 'left';
  y += 48;
  g.font = sans(15, 550);
  g.fillStyle = M2; g.fillText('Dana R. · drop-off 10:41 · texted ✓', c3 + 20, y);
  y += 30;
  if (S.status === 3) {
    g.fillStyle = '#E3F1E8'; rr(g, c3 + 16, y - 6, cw3 - 32, 66, 5); g.fill();
    g.fillStyle = GR; g.font = sans(18, 750); g.fillText('Ready for pickup', c3 + 30, y + 22);
    g.font = sans(14, 550); g.fillStyle = M1; g.fillText('Text sent to •••-0142 · ' + S.tm, c3 + 30, y + 46);
  }

  // ---- activity log
  const ly = 682;
  g.fillStyle = '#FBF8F2'; g.fillRect(28, ly, W - 56, 94);
  g.fillStyle = M3; g.font = mono(13, 600); g.fillText('ACTIVITY', 44, ly + 26);
  g.font = mono(15, 500);
  S.log.slice(-3).forEach((l, i) => {
    g.fillStyle = i === Math.min(2, S.log.length - 1) ? INK : M2;
    g.fillText(l, 44, ly + 52 + i * 20);
  });
}

function monitorState(t) {
  // once the customer has left, the bench goes back to its idle screen, which
  // is also what it shows at t = 0, so the loop seam does not flip it
  const t0 = t;
  if (t >= T.exitA) t = 0;
  const plugged = t >= T.plug && t < T.leaveBench + 0.5;
  const retest = t >= T.retestA - 0.4;
  let count = 0, running = false;
  if (!retest && t >= T.testA) { count = Math.min(42, Math.floor(lin(T.testA, T.testB, t) * 42)); running = count < 42; }
  if (retest) { count = Math.min(42, Math.floor(lin(T.retestA, T.retestB, t) * 42)); running = count < 42 && t >= T.retestA; }
  let status = -1;
  if (t >= T.plug) status = 0;
  if (t >= T.openA) status = 1;
  if (t >= T.retestA - 0.4) status = 2;
  if (t >= T.ready) status = 3;
  if (t < T.plug) status = -1;
  const part = t >= T.scanHit ? 2 : t >= T.scanA + 0.4 ? 1 : 0;
  const log = ['10:41  RT-2207 opened at counter · Dana R.'];
  if (t >= T.plug) log.push('10:43  Plugged in at bench R-2');
  if (t >= T.testB) log.push('10:44  40/42 · Display, Touch failed');
  if (t >= T.scanHit) log.push('10:51  Part DSP61-884120 attached · bin B-04');
  if (t >= T.retestB) log.push('10:57  Retest 42/42 passed');
  if (t >= T.ready) log.push('10:57  Ready text sent to customer');
  return {
    tm: deskTime(t0), plugged, dev: plugged ? lin(T.devA, T.devA + 0.9, t) : 0, retest, count, running,
    fails: retest ? [] : [0, 1], status, part, scanP: Math.round(lin(T.scanA + 0.4, T.scanHit, t) * 10) / 10,
    flash: part === 2 ? Math.round((1 - lin(T.scanHit, T.scanHit + 0.8, t)) * 4) / 4 : 0,
    replaced: t >= T.closeB, log, spin: plugged ? 0 : Math.round((t * 6) % 6.28 * 4) / 4
  };
}

// ---------------------------------------------------------------- counter tablet
function drawTablet(g, W, H, S) {
  g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, W, H);
  g.fillStyle = OR2; g.fillRect(0, 0, W, 54);
  logo(g, 14, 10, 34);
  g.fillStyle = '#fff'; g.font = sans(22, 750); g.fillText('InPhox', 58, 36);
  g.font = sans(17, 550); g.globalAlpha = 0.8; g.fillText('Counter', 150, 35); g.globalAlpha = 1;
  g.font = mono(15, 600); g.textAlign = 'right'; g.fillText(S.tm, W - 18, 35); g.textAlign = 'left';
  const L = 36;
  if (S.mode === 'home') {
    g.fillStyle = INK; g.font = sans(34, 750); g.fillText('Repairs today', L, 112);
    const rows = [['RT-2203', 'Battery', 'Ready', 3], ['RT-2204', 'Charge port', 'Repairing', 1], ['RT-2205', 'Back glass', 'Diagnosing', 0], ['RT-2206', 'Camera', 'Retest', 2]];
    rows.forEach(([id, iss, st, si], i) => {
      const y = 150 + i * 92;
      g.fillStyle = i % 2 ? '#FFFFFF' : '#FBF8F2'; g.fillRect(L - 10, y, W - 2 * L + 20, 84);
      g.fillStyle = INK; g.font = mono(24, 700); g.fillText(id, L, y + 52);
      g.font = sans(24, 550); g.fillStyle = M1; g.fillText(iss, L + 170, y + 52);
      g.font = sans(20, 650); const tw = g.measureText(st).width;
      pill(g, W - L - tw - 24, y + 24, st, STEP_COL[si][0], STEP_COL[si][1], 20);
    });
    g.fillStyle = OR; rr(g, L, H - 92, 280, 62, 6); g.fill();
    g.fillStyle = INK; g.font = sans(24, 750); g.fillText('+  New repair', L + 30, H - 51);
    return;
  }
  if (S.mode === 'form') {
    g.fillStyle = INK; g.font = sans(34, 750); g.fillText('New repair ticket', L, 112);
    const f = [['CUSTOMER', 'Dana R. · (555) •••-0142'], ['DEVICE', '6.1″ phone · 128 GB · Midnight'], ['ISSUE', 'Cracked screen'], ['QUOTE', '$129 · display + labor']];
    f.forEach(([k, v], i) => {
      const y = 140 + i * 98;
      g.fillStyle = M3; g.font = mono(16, 600); g.fillText(k, L, y + 20);
      g.strokeStyle = S.p * 4 > i && S.p * 4 < i + 1 ? OR : RULE; g.lineWidth = 2.5; rr(g, L, y + 32, W - 2 * L, 54, 4); g.stroke();
      const a = clamp01(S.p * 4 - i);
      g.fillStyle = INK; g.font = sans(24, 600);
      g.fillText(v.slice(0, Math.round(v.length * a)), L + 16, y + 68);
    });
    g.fillStyle = S.p >= 1 ? OR : '#F1E4D6'; rr(g, W - L - 250, H - 84, 250, 58, 6); g.fill();
    g.fillStyle = INK; g.font = sans(23, 750); g.fillText('Create ticket', W - L - 220, H - 46);
    return;
  }
  if (S.mode === 'ticket') {
    g.fillStyle = M3; g.font = mono(18, 600); g.fillText('TICKET CREATED · ' + '10:41', L, 102);
    g.fillStyle = INK; g.font = sans(84, 800); g.fillText('RT-2207', L, 192);
    g.font = sans(34, 600); g.fillStyle = M1; g.fillText('Cracked screen · quoted $129', L, 246);
    const [bg, fg] = STEP_COL[S.status];
    pill(g, L, 276, STEPS[S.status], bg, fg, 24);
    g.fillStyle = '#E3F1E8'; rr(g, L, 362, W - 2 * L, 70, 6); g.fill();
    check(g, L + 22, 398, 18, GR, 4);
    g.fillStyle = GR; g.font = sans(24, 650); g.fillText('Customer texted a tracking link', L + 56, 405);
    g.fillStyle = INK; barcode(g, L, 470, 360, 70, 2207);
    g.font = mono(18, 600); g.fillText('RT-2207 · ' + IMEI, L, 566);
    g.fillStyle = M2; g.font = sans(20, 550); g.fillText('Label printed', W - L - 150, 560);
    return;
  }
  if (S.mode === 'pay') {
    g.fillStyle = M3; g.font = mono(18, 600); g.fillText('PICKUP · RT-2207', L, 102);
    g.fillStyle = INK; g.font = sans(34, 650); g.fillText('Screen repair · 42/42 retest', L, 156);
    g.font = sans(26, 550); g.fillStyle = M1;
    g.fillText('Display assembly', L, 220); g.fillText('Labor', L, 262);
    g.textAlign = 'right'; g.fillText('$89', W - L, 220); g.fillText('$40', W - L, 262);
    g.fillStyle = INK; g.font = sans(44, 800); g.fillText('$129', W - L, 340); g.textAlign = 'left';
    g.font = sans(44, 800); g.fillText('Total', L, 340);
    g.fillStyle = '#FBE7CC'; rr(g, L, 380, W - 2 * L, 120, 8); g.fill();
    g.fillStyle = '#8A4A12'; g.font = sans(30, 700); g.fillText('Tap card to pay', L + 30, 450);
    g.strokeStyle = OR; g.lineWidth = 5; g.beginPath(); g.arc(W - L - 70, 440, 30, -Math.PI / 2, -Math.PI / 2 + S.p * 6.28); g.stroke();
    return;
  }
  // paid
  g.fillStyle = GR; g.beginPath(); g.arc(W / 2, 220, 92, 0, 7); g.fill();
  check(g, W / 2 - 44, 228, 88, '#fff', 16);
  g.textAlign = 'center';
  g.fillStyle = INK; g.font = sans(60, 800); g.fillText('Paid $129', W / 2, 400);
  g.fillStyle = M1; g.font = sans(26, 550); g.fillText('RT-2207 closed · receipt texted', W / 2, 448);
  g.fillStyle = M3; g.font = mono(18, 500); g.fillText('Repair history saved to IMEI ' + IMEI.slice(-6), W / 2, 500);
  g.textAlign = 'left';
}
function tabletState(t) {
  const tm = deskTime(t);
  if (t >= T.paid && t < DUR - 0.6) return { mode: 'paid', tm };
  if (t >= T.atCounter + 0.4) return { mode: 'pay', tm, p: Math.round(lin(T.payA, T.paid, t) * 12) / 12 };
  if (t >= T.typeB + 0.2) {
    let status = 0;
    if (t >= T.openA) status = 1; if (t >= T.retestA - 0.4) status = 2; if (t >= T.ready) status = 3;
    return { mode: 'ticket', tm, status };
  }
  if (t >= T.typeA) return { mode: 'form', tm, p: Math.round(lin(T.typeA, T.typeB, t) * 40) / 40 };
  return { mode: 'home', tm };
}

// ---------------------------------------------------------------- phone screens
function crackLines(g, w, h) {
  let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const cx = w * 0.68, cy = h * 0.3;
  g.strokeStyle = 'rgba(235,240,245,0.75)'; g.lineWidth = 1.6;
  for (let k = 0; k < 13; k++) {
    let a = (k / 13) * Math.PI * 2 + rnd() * 0.3, x = cx, y = cy; g.beginPath(); g.moveTo(x, y);
    const n = 6 + Math.floor(rnd() * 6);
    for (let i = 0; i < n; i++) { a += (rnd() - 0.5) * 0.7; const l = 18 + rnd() * 50; x += Math.cos(a) * l; y += Math.sin(a) * l; g.lineTo(x, y); }
    g.stroke();
  }
  g.strokeStyle = 'rgba(235,240,245,0.35)'; g.lineWidth = 1;
  for (let r = 1; r < 4; r++) { g.beginPath(); for (let k = 0; k <= 16; k++) { const a = (k / 16) * 6.28; const rr2 = r * 22 + rnd() * 10; g.lineTo(cx + Math.cos(a) * rr2, cy + Math.sin(a) * rr2); } g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); g.arc(cx, cy, 6, 0, 7); g.fill();
}
function drawPhone(g, w, h, S) {
  g.fillStyle = '#0B0907'; g.fillRect(0, 0, w, h);
  if (S.mode === 'off') { g.fillStyle = '#050505'; g.fillRect(0, 0, w, h); }
  else if (S.mode === 'lock') {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#2B3A4F'); gr.addColorStop(1, '#1A1512');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(246,242,234,0.92)'; g.textAlign = 'center'; g.font = sans(84, 300); g.fillText(S.tm || '10:41', w / 2, 210);
    g.font = sans(20, 500); g.fillText('Monday, Oct 12', w / 2, 120);
    if (S.ready) { g.fillStyle = 'rgba(246,242,234,0.9)'; rr(g, 24, 280, w - 48, 92, 18); g.fill(); g.textAlign = 'left'; g.fillStyle = GR; g.font = sans(17, 700); g.fillText('Repair complete', 44, 316); g.fillStyle = INK; g.font = sans(16, 500); g.fillText('42/42 checks passed', 44, 346); }
    g.textAlign = 'left';
  } else if (S.mode === 'boot') {
    logo(g, w / 2 - 50, h / 2 - 120, 100);
    g.fillStyle = CREAM; g.textAlign = 'center'; g.font = sans(30, 700); g.fillText('InPhox', w / 2, h / 2 + 30);
    g.font = mono(16, 500); g.fillStyle = M3; g.fillText('Reading device…', w / 2, h / 2 + 66); g.textAlign = 'left';
  } else if (S.mode === 'test' || S.mode === 'result') {
    const bad = S.fails, pct = S.count / 42;
    g.lineWidth = 18; g.strokeStyle = '#2A251F'; g.beginPath(); g.arc(w / 2, 290, 112, 0, 7); g.stroke();
    g.strokeStyle = S.mode === 'result' ? (bad ? '#E5574B' : '#3FB27F') : OR; g.lineCap = 'round';
    g.beginPath(); g.arc(w / 2, 290, 112, -Math.PI / 2, -Math.PI / 2 + 6.283 * Math.max(0.01, pct)); g.stroke();
    g.fillStyle = CREAM; g.textAlign = 'center'; g.font = sans(56, 800);
    g.fillText((S.count - (S.count > 1 ? bad : 0)) + '/42', w / 2, 310);
    g.font = mono(17, 600); g.fillStyle = S.mode === 'result' ? (bad ? '#E5574B' : '#3FB27F') : M3;
    g.fillText(S.mode === 'result' ? (bad ? 'DISPLAY · TOUCH' : 'ALL PASSED') : 'RUNNING CHECKS', w / 2, 460);
    g.textAlign = 'left';
    if (S.mode === 'result' && !bad) { g.fillStyle = '#3FB27F'; g.beginPath(); g.arc(w / 2, 560, 46, 0, 7); g.fill(); check(g, w / 2 - 22, 562, 44, '#0B0907', 9); }
  }
  if (S.cracked) crackLines(g, w, h);
  g.fillStyle = '#000'; rr(g, w / 2 - 56, 18, 112, 32, 16); g.fill();
}
function crackedState(t) {
  if (t >= T.plug && t < T.plug + 0.6) return { mode: 'boot', cracked: 1 };
  if (t >= T.plug + 0.6 && t < T.testB) return { mode: 'test', cracked: 1, count: Math.min(42, Math.floor(lin(T.testA, T.testB, t) * 42)), fails: Math.floor(lin(T.testA, T.testB, t) * 42) >= 2 ? 2 : 0 };
  if (t >= T.testB && t < T.openA) return { mode: 'result', cracked: 1, count: 42, fails: 2 };
  if (t >= T.openA) return { mode: 'off', cracked: 1 };
  return { mode: 'lock', cracked: 1, tm: '10:41' };
}
function newState(t) {
  if (t < T.retestA - 0.4) return { mode: 'off' };
  if (t < T.retestB) return { mode: 'test', count: Math.min(42, Math.floor(lin(T.retestA, T.retestB, t) * 42)), fails: 0 };
  if (t < T.leaveBench) return { mode: 'result', count: 42, fails: 0 };
  return { mode: 'lock', ready: 1, tm: deskTime(t) };
}

// ---------------------------------------------------------------- static textures
function woodFloor() {
  return canvasTex(1024, 1024, g => {
    const pw = 128;
    for (let x = 0; x < 1024; x += pw) {
      let y = -((x / pw) * 331) % 1024;
      while (y < 1024) {
        const l = 300 + ((x * 7 + y * 3) % 260);
        const hue = 26 + ((x + y) % 7), li = 44 + ((x * 3 + y) % 9);
        g.fillStyle = `hsl(${hue},38%,${li}%)`; g.fillRect(x, y, pw, l);
        for (let k = 0; k < 26; k++) { g.fillStyle = `rgba(60,35,15,${0.05 + (k % 5) * 0.02})`; g.fillRect(x + ((k * 37) % pw), y, 1 + (k % 3), l); }
        g.fillStyle = 'rgba(30,18,8,0.55)'; g.fillRect(x, y, pw, 2); g.fillRect(x, y, 2, l);
        y += l;
      }
    }
  });
}
function plaster(col) {
  return canvasTex(512, 512, g => {
    g.fillStyle = col; g.fillRect(0, 0, 512, 512);
    let s = 5; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 5000; i++) { g.fillStyle = `rgba(${rnd() > 0.5 ? '255,255,255' : '80,60,40'},${rnd() * 0.05})`; g.fillRect(rnd() * 512, rnd() * 512, 2 + rnd() * 6, 2 + rnd() * 6); }
  });
}
function esdMat() {
  return canvasTex(1024, 512, (g, w, h) => {
    g.fillStyle = '#2C4A40'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,255,255,0.06)'; g.lineWidth = 1;
    for (let x = 0; x < w; x += 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let y = 0; y < h; y += 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.strokeStyle = 'rgba(255,255,255,0.14)';
    for (let x = 0; x < w; x += 80) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let y = 0; y < h; y += 80) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.fillStyle = 'rgba(246,242,234,0.55)'; g.font = mono(15, 700);
    g.fillText('ESD SAFE · BENCH R-2', 22, h - 20);
    g.fillStyle = '#C8CCD1'; [[18, 18], [w - 18, 18]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill(); });
  });
}
const BIN_CODES = ['DSP-61', 'DSP-67', 'DSP-54', 'BAT-61', 'BAT-67',
  'CAM-R1', 'CAM-F1', 'USB-C', 'LTN-P', 'SPK-B',
  'FLX-PW', 'FLX-VL', 'ADH-61', 'ADH-67', 'SCR-P5',
  'GLS-BK', 'MIC-B', 'ANT-5G', 'SIM-TR', 'BTN-SET'];
function binAtlas() {
  return canvasTex(1024, 512, (g) => {
    BIN_CODES.forEach((c, i) => {
      const x = (i % 5) * 204.8, y = Math.floor(i / 5) * 128;
      g.fillStyle = '#FBFAF6'; g.fillRect(x + 4, y + 4, 196, 120);
      g.fillStyle = c.startsWith('DSP') ? OR : INK; g.fillRect(x + 4, y + 4, 12, 120);
      g.fillStyle = INK; g.font = mono(36, 700); g.fillText(c, x + 28, y + 52);
      g.fillStyle = M2; g.font = mono(18, 500); g.fillText('B-' + String(i + 1).padStart(2, '0') + ' · qty ' + (3 + (i * 7) % 11), x + 28, y + 80);
      g.fillStyle = INK; barcode(g, x + 28, y + 92, 160, 22, i * 13 + 5);
    });
  });
}
function smallLabel(text, sub, accent) {
  return canvasTex(320, 128, (g, w, h) => {
    g.fillStyle = '#FBFAF6'; g.fillRect(0, 0, w, h);
    g.fillStyle = accent || OR; g.fillRect(0, 0, 10, h);
    g.fillStyle = INK; g.font = mono(34, 700); g.fillText(text, 24, 44);
    g.fillStyle = M1; g.font = sans(24, 600); g.fillText(sub, 24, 80);
    g.fillStyle = INK; barcode(g, 24, 94, w - 48, 22, text.length * 31 + sub.length);
  });
}
function partLabel() {
  return canvasTex(256, 160, (g, w, h) => {
    g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, w, h);
    g.fillStyle = INK; g.font = mono(24, 700); g.fillText('DSP-61', 14, 32);
    g.font = mono(15, 500); g.fillStyle = M1; g.fillText('SN DSP61-884120', 14, 56);
    g.fillStyle = INK; barcode(g, 14, 70, w - 28, 54, 884);
    g.font = mono(13, 500); g.fillText('OLED ASSY 6.1', 14, 146);
  });
}
function bubbleTex() {
  return canvasTex(760, 300, (g, w, h) => {
    g.shadowColor = 'rgba(0,0,0,0.35)'; g.shadowBlur = 24; g.shadowOffsetY = 8;
    g.fillStyle = '#FFFFFF'; rr(g, 20, 16, w - 40, h - 76, 28); g.fill();
    g.beginPath(); g.moveTo(90, h - 64); g.lineTo(70, h - 22); g.lineTo(140, h - 64); g.fill();
    g.shadowColor = 'transparent';
    logo(g, 46, 40, 44);
    g.fillStyle = M3; g.font = mono(20, 600); g.fillText('TEXT · REPAIR SHOP · NOW', 104, 70);
    g.fillStyle = INK; g.font = sans(34, 700); g.fillText('Your phone is ready for pickup.', 46, 136);
    g.fillStyle = M1; g.font = sans(28, 500); g.fillText('RT-2207 · screen replaced · $129', 46, 182);
  });
}
function signTex() {
  return canvasTex(1024, 256, (g, w, h) => {
    g.fillStyle = INK; rr(g, 0, 0, w, h, 24); g.fill();
    g.fillStyle = OR; g.font = sans(120, 800); g.textAlign = 'center'; g.fillText('REPAIRS', w / 2 - 70, 168);
    g.fillStyle = CREAM; g.font = mono(36, 600); g.textAlign = 'left'; g.fillText('DROP-OFF', w - 270, 112); g.fillText('& PICKUP', w - 270, 160);
  });
}
function pegboardTex() {
  return canvasTex(512, 256, (g, w, h) => {
    g.fillStyle = '#CDB896'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(40,28,15,0.55)';
    for (let x = 8; x < w; x += 16) for (let y = 8; y < h; y += 16) { g.beginPath(); g.arc(x, y, 2.6, 0, 7); g.fill(); }
  });
}

// ---------------------------------------------------------------- geometry helpers
function box(w, h, d, mat, x = 0, y = 0, z = 0, parent, r = 0) {
  const geo = r ? new RoundedBoxGeometry(w, h, d, 2, r) : new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true;
  if (parent) parent.add(m);
  return m;
}
function std(color, roughness = 0.6, metalness = 0, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
}

// Repair phone lying face up (+y). Display hinges on the +x edge like a book.
function makeRepairPhone(crackTex, newTex) {
  const g = new THREE.Group();
  const frameM = std('#1f2a36', 0.3, 0.85);
  const T0 = 0.62;
  const body = box(PW, T0, PH, frameM, 0, -0.12, 0, g, 0.3);
  // inner tray (visible when the display is open)
  const inner = new THREE.Group(); inner.position.y = T0 / 2 - 0.1; g.add(inner);
  box(PW - 0.5, 0.05, PH - 0.5, std('#26292d', 0.7, 0.3), 0, 0.02, 0, inner);
  box(PW - 1.2, 0.16, 4.6, std('#1d3a2c', 0.55, 0.3), 0, 0.1, -PH / 2 + 3.2, inner);
  box(2.0, 0.22, 2.4, MAT.steel, -1.4, 0.18, -PH / 2 + 3.0, inner);
  box(1.4, 0.2, 1.4, MAT.chip, 1.6, 0.17, -PH / 2 + 3.4, inner);
  const batt = box(PW - 1.8, 0.28, 7.2, std('#2a2a2c', 0.45, 0.35), -0.2, 0.15, 1.6, inner);
  box(PW - 2.6, 0.02, 1.4, std('#E8E2D6', 0.6), -0.2, 0.3, 0.4, inner);
  box(0.9, 0.06, 5.6, MAT.copper, PW / 2 - 1.0, 0.12, -1.0, inner);
  box(1.2, 0.08, 0.8, MAT.black, PW / 2 - 1.0, 0.16, -3.6, inner);
  box(2.4, 0.18, 1.2, MAT.steel, 0, 0.12, PH / 2 - 1.2, inner);
  batt.castShadow = false;
  // rim so the open edge reads as a frame
  const rimM = frameM;
  box(PW, 0.36, 0.22, rimM, 0, 0.26, PH / 2 - 0.11, g); box(PW, 0.36, 0.22, rimM, 0, 0.26, -PH / 2 + 0.11, g);
  box(0.22, 0.36, PH, rimM, -PW / 2 + 0.11, 0.26, 0, g); box(0.22, 0.36, PH, rimM, PW / 2 - 0.11, 0.26, 0, g);
  // port
  box(1.0, 0.24, 0.1, MAT.black, 0, 0.05, PH / 2 + 0.01, g);
  // hinge at +x edge, top surface
  const hinge = new THREE.Group(); hinge.position.set(PW / 2 - 0.05, 0.44, 0); g.add(hinge);
  const mkDisplay = tex => {
    const d = new THREE.Group();
    const slab = box(PW - 0.12, 0.2, PH - 0.12, std('#0a0a0b', 0.2, 0.2), 0, 0, 0, d, 0.09);
    slab.castShadow = true;
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(PW - 0.5, PH - 0.5), new THREE.MeshStandardMaterial({ color: '#000', emissive: '#fff', emissiveMap: tex, emissiveIntensity: 0.9, roughness: 0.08, metalness: 0.1 }));
    scr.rotation.x = -Math.PI / 2; scr.position.y = 0.105; d.add(scr);
    // flex cable on the underside
    box(1.0, 0.04, 2.2, MAT.copper, PW / 2 - 1.2, -0.12, -2.0, d);
    return d;
  };
  const crack = mkDisplay(crackTex), fresh = mkDisplay(newTex);
  crack.position.x = -(PW / 2 - 0.05); hinge.add(crack);
  g.userData = { hinge, crack, fresh, body };
  return g;
}

// Simple waiting phone for the trays.
function makeTrayPhone(col) {
  const g = new THREE.Group();
  box(PW, 0.8, PH, std(col, 0.3, 0.8), 0, 0.4, 0, g, 0.3);
  const s = new THREE.Mesh(new THREE.PlaneGeometry(PW - 0.4, PH - 0.4), std('#0b0c0e', 0.08, 0.2));
  s.rotation.x = -Math.PI / 2; s.position.y = 0.81; g.add(s);
  return g;
}

// ---------------------------------------------------------------- characters (IK on mixamo rigs)
const _a = new V3(), _b = new V3(), _c = new V3(), _t = new V3(), _e = new V3(), _d = new V3(), _p = new V3(), _v = new V3();
const _q = new Q(), _q2 = new Q(), _q3 = new Q(), _qi = new Q(), _qa = new Q(), _qb = new Q(), qLook = new Q();
function rotateBoneWorld(bone, dq) {
  bone.getWorldQuaternion(_q2); _q2.premultiply(dq);
  bone.parent.getWorldQuaternion(_q3).invert();
  bone.quaternion.copy(_q3.multiply(_q2));
  bone.updateMatrixWorld(true);
}
function aimBone(bone, from, to) { _q.setFromUnitVectors(from, to); rotateBoneWorld(bone, _q); }
function solveArm(ch, side, target, pole, w) {
  if (w <= 0.001) return;
  const A = ch.b[side + 'Arm'], B = ch.b[side + 'Fore'], C = ch.b[side + 'Hand'];
  A.getWorldPosition(_a); B.getWorldPosition(_b); C.getWorldPosition(_c);
  _t.lerpVectors(_c, target, w);
  const l1 = _a.distanceTo(_b), l2 = _b.distanceTo(_c);
  _d.subVectors(_t, _a); let d = _d.length();
  d = Math.max(Math.abs(l1 - l2) + 0.01, Math.min(d, (l1 + l2) * 0.995)); _d.normalize();
  const cosA = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));
  _p.subVectors(pole, _a); _p.addScaledVector(_d, -_p.dot(_d)).normalize();
  _e.copy(_a).addScaledVector(_d, l1 * cosA).addScaledVector(_p, l1 * sinA);
  aimBone(A, _v.subVectors(_b, _a).normalize(), _e.sub(_a).normalize());
  B.getWorldPosition(_b); C.getWorldPosition(_c);
  _t.copy(_a).addScaledVector(_d, d);
  aimBone(B, _v.subVectors(_c, _b).normalize(), _t.sub(_b).normalize());
}

const BONE_KEYS = { hips: 'Hips', spine: 'Spine', spine1: 'Spine1', spine2: 'Spine2', neck: 'Neck', head: 'Head',
  LArm: 'LeftArm', LFore: 'LeftForeArm', LHand: 'LeftHand', RArm: 'RightArm', RFore: 'RightForeArm', RHand: 'RightHand', top: 'HeadTop_End' };
// Bake a clip from one mixamo rig onto another whose bind pose differs:
// target world rotation = source world rotation * (source rest^-1 * target rest).
function bakeRetarget(tgtModel, srcGltf, clip, fps = 30) {
  const src = skClone(srcGltf.scene);
  const sb = {};
  src.traverse(o => { if (o.isBone) sb[o.name] = o; });
  src.updateMatrixWorld(true); tgtModel.updateMatrixWorld(true);
  const order = [];
  tgtModel.traverse(o => { if (o.isBone && sb[o.name]) order.push(o); });
  const off = new Map();
  for (const b of order) off.set(b, sb[b.name].getWorldQuaternion(new Q()).invert().multiply(b.getWorldQuaternion(new Q())));
  const mixer = new THREE.AnimationMixer(src);
  mixer.clipAction(clip).play();
  const n = Math.max(2, Math.round(clip.duration * fps) + 1);
  const times = new Float32Array(n), vals = new Map(order.map(b => [b, new Float32Array(n * 4)]));
  const wq = new Map(), tmp = new Q();
  for (let i = 0; i < n; i++) {
    const tt = (i / (n - 1)) * clip.duration; times[i] = tt;
    mixer.setTime(tt); src.updateMatrixWorld(true);
    wq.clear();
    for (const b of order) {
      const W = sb[b.name].getWorldQuaternion(new Q()).multiply(off.get(b));
      wq.set(b, W);
      const pw = wq.has(b.parent) ? wq.get(b.parent) : b.parent.getWorldQuaternion(tmp);
      pw.clone().invert().multiply(W).toArray(vals.get(b), i * 4);
    }
  }
  mixer.stopAllAction(); mixer.uncacheRoot(src);
  return new THREE.AnimationClip(clip.name, clip.duration, order.map(b => new THREE.QuaternionKeyframeTrack(b.name + '.quaternion', times, vals.get(b))));
}

function makeChar(gltf, clipsSrc, { height, tint, hide = [], retargetFrom = null, person = null }) {
  // person: a ready-dressed body from the shared cast (already sized)
  const root = person ? person.root : new THREE.Group();
  const model = person ? person.model : skClone(gltf.scene);
  if (!person) root.add(model);
  if (retargetFrom) {
    const out = {};
    for (const [k, clip] of Object.entries(clipsSrc)) out[k] = bakeRetarget(model, retargetFrom, clip);
    clipsSrc = out;
  }
  const b = {};
  model.traverse(o => {
    for (const [k, n] of Object.entries(BONE_KEYS)) if (!b[k] && o.name.replace(/^mixamorig:?/, '') === n) b[k] = o;
    if (o.isMesh && !person) {
      o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false;
      if (hide.some(h => o.name.includes(h))) o.visible = false;
      const m = o.material.clone();
      if (tint && tint[m.name]) m.color = new THREE.Color(tint[m.name]);
      m.roughness = Math.max(m.roughness ?? 0.6, 0.62); m.metalness = Math.min(m.metalness ?? 0, 0.1);
      o.material = m;
    }
  });
  root.updateMatrixWorld(true);
  if (!person) { const top = new V3(); b.top.getWorldPosition(top); model.scale.multiplyScalar(height / top.y); }
  // Stateless sampler (no AnimationMixer): every frame starts from the rest
  // pose, so the IK / lean / finger edits applied after it never accumulate.
  const bones = {};
  model.traverse(o => { if (o.isBone) bones[o.name] = o; });
  const rest = Object.values(bones).map(o => [o, o.quaternion.clone()]);
  const chans = {};
  for (const [k, clip] of Object.entries(clipsSrc)) for (const tr of clip.tracks) {
    if (!tr.name.endsWith('.quaternion')) continue;
    const pn = THREE.PropertyBinding.parseTrackName(tr.name);
    const name = pn.objectName === 'bones' ? pn.objectIndex : pn.nodeName;
    const bone = bones[name];
    if (!bone) continue;
    (chans[bone.name] || (chans[bone.name] = { bone }))[k] = tr.createInterpolant();
  }
  const dur = Object.fromEntries(Object.entries(clipsSrc).map(([k, c]) => [k, c.duration]));
  return { root, model, b, rest, chans: Object.values(chans), dur, person };
}

// Waypoint track: [{t, x, z, yaw}]. Between two waypoints at different spots
// the person walks a straight line with a trapezoid speed profile (quick
// start, steady pace, quick stop), facing the way they walk; standing still
// they turn to the waypoint's yaw. The walk clip is driven by the distance
// walked, so the feet stay planted at any pace.
const ACC = 0.16;
function profile(u) { // -> [distance fraction, speed fraction]
  const v = 1 / (1 - ACC);
  if (u < ACC) return [v * u * u / (2 * ACC), u / ACC];
  if (u > 1 - ACC) { const r = 1 - u; return [1 - v * r * r / (2 * ACC), r / ACC]; }
  return [v * (u - ACC / 2), 1];
}
const lerpAngle = (a, b, k) => { let d = b - a; d = Math.atan2(Math.sin(d), Math.cos(d)); return a + d * k; };
function evalTrack(track, t) {
  let i = 0;
  while (i < track.length - 2 && t >= track[i + 1].t) i++;
  const A = track[i], B = track[i + 1];
  const moving = Math.hypot(B.x - A.x, B.z - A.z) > 1;
  if (!moving || t < A.t || t >= B.t) {
    const P = t >= B.t ? B : A;
    // arriving: turn from the walking direction to the waypoint's yaw
    let yaw = A.yaw;
    const prev = track[i - 1];
    if (!moving && prev && Math.hypot(A.x - prev.x, A.z - prev.z) > 1) yaw = lerpAngle(Math.atan2(A.x - prev.x, A.z - prev.z), A.yaw, ss(A.t, A.t + 0.75, t));
    return { x: P.x, z: P.z, yaw, speed: 0, dist: 0 };
  }
  const len = Math.hypot(B.x - A.x, B.z - A.z), T0 = B.t - A.t;
  const [f, sp] = profile(lin(A.t, B.t, t));
  const head = Math.atan2(B.x - A.x, B.z - A.z);
  // set off: turn from the standing yaw toward the path over the first steps
  const yaw = lerpAngle(A.yaw, head, ss(A.t - 0.15, A.t + 0.5, t));
  return { x: mix(A.x, B.x, f), z: mix(A.z, B.z, f), yaw, speed: sp * len / T0 / (1 - ACC), dist: f * len };
}

// ---------------------------------------------------------------- layout constants
const COUNTER = { x0: -260, x1: -40, z: 95, d: 50, h: 100 };
const BENCH = { x0: -100, x1: 110, z: -152, d: 72, h: 92 };
const MAT_Y = BENCH.h + 0.6;
const PHONE_MAT = new V3(18, MAT_Y + 0.45, -140);
const TABLET = new V3(-100, COUNTER.h, 94);
const CUST_OUT = { x: 230, z: 190 };
const CUST_AT = { x: -175, z: 148 };
const TECH_COUNTER = { x: -130, z: 52 };
const TECH_BENCH = { x: 0, z: -104 };

const TECH_TRACK = [
  { t: 0, ...TECH_COUNTER, yaw: 0.15 },
  { t: T.walkA, ...TECH_COUNTER, yaw: 0.15 },
  { t: T.walkB, ...TECH_BENCH, yaw: Math.PI },
  { t: T.leaveBench + 0.2, ...TECH_BENCH, yaw: Math.PI },
  { t: T.leaveBench + 2.2, ...TECH_COUNTER, yaw: 0.15 },
  { t: DUR, ...TECH_COUNTER, yaw: 0.15 }
];
// The customer waits at the shop entrance (front right) facing in, walks to
// the counter at a normal pace and back out; while the phone is on the bench
// they are away (hidden).
const IN_YAW = -1.63, OUT_YAW = 1.51;
const CUST_TRACK = [
  { t: 0, ...CUST_OUT, yaw: IN_YAW },
  { t: 0.2, ...CUST_OUT, yaw: IN_YAW },
  { t: 2.9, ...CUST_AT, yaw: Math.PI },
  { t: 5.6, ...CUST_AT, yaw: Math.PI },
  { t: 8.8, ...CUST_OUT, yaw: OUT_YAW },
  { t: 9.3, ...CUST_OUT, yaw: IN_YAW },
  { t: 28.0, ...CUST_OUT, yaw: IN_YAW },
  { t: 31.6, ...CUST_AT, yaw: Math.PI },
  { t: T.exitA, ...CUST_AT, yaw: Math.PI },
  { t: 39.0, ...CUST_OUT, yaw: IN_YAW },
  { t: DUR, ...CUST_OUT, yaw: IN_YAW }
];

// ---------------------------------------------------------------- camera keys
// [t, pos, target, fov]
const CAM = [
  [0, [360, 250, 500], [-30, 80, -20], 36],
  [3.6, [40, 150, 330], [-135, 110, 85], 32],
  [6.2, [110, 165, 300], [-90, 100, 40], 36],
  [9.0, [150, 175, 40], [10, 105, -140], 36],
  [11.6, [95, 132, -62], [52, 122, -176], 30],
  [13.2, [92, 130, -66], [50, 120, -176], 30],
  [14.8, [120, 215, -10], [10, 100, -135], 26],
  [17.2, [140, 205, -20], [36, 106, -130], 27],
  [19.4, [118, 216, -12], [8, 100, -136], 26],
  [22.4, [116, 214, -14], [12, 100, -136], 26],
  [24.4, [96, 132, -66], [52, 122, -176], 30],
  [26.8, [92, 130, -64], [50, 121, -176], 30],
  [29.6, [230, 200, 230], [-50, 100, -10], 37],
  [32.6, [30, 150, 320], [-145, 110, 88], 33],
  [36.0, [55, 155, 335], [-140, 108, 85], 34],
  [DUR, [360, 250, 500], [-30, 80, -20], 36]
];
function catmull(p0, p1, p2, p3, s) {
  const s2 = s * s, s3 = s2 * s;
  return 0.5 * ((2 * p1) + (-p0 + p2) * s + (2 * p0 - 5 * p1 + 4 * p2 - p3) * s2 + (-p0 + 3 * p1 - 3 * p2 + p3) * s3);
}
function camAt(t, outPos, outTgt) {
  const n = CAM.length - 1; // last == first
  let i = 0; while (i < n - 1 && t >= CAM[i + 1][0]) i++;
  const k0 = CAM[i], k1 = CAM[i + 1];
  const u = lin(k0[0], k1[0], t);
  const s = mix(u, sm(0, 1, u), 0.6);
  const at = j => CAM[((j % n) + n) % n];
  const P = [at(i - 1), k0, k1, at(i + 2)];
  for (const [out, idx] of [[outPos, 1], [outTgt, 2]]) {
    out.set(
      catmull(P[0][idx][0], P[1][idx][0], P[2][idx][0], P[3][idx][0], s),
      catmull(P[0][idx][1], P[1][idx][1], P[2][idx][1], P[3][idx][1], s),
      catmull(P[0][idx][2], P[1][idx][2], P[2][idx][2], P[3][idx][2], s));
  }
  return mix(k0[3], k1[3], s);
}

// ================================================================= create
export default async function create(ctx) {
  const { renderer } = ctx;
  let small = ctx.isSmall, W = ctx.width, H = ctx.height;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#1c1814');
  scene.fog = new THREE.Fog('#1c1814', 700, 1500);
  // aspect guard: the stage can report 0x0 while it is laid out
  const ASP = () => (W > 0 && H > 0 ? W / H : 1.6);
  const camera = new THREE.PerspectiveCamera(36, ASP(), 2, 3000);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  scene.environment = envTex;
  scene.environmentIntensity = 0.35;
  const keep = new Set(Object.values(MAT));

  const myTex = texList = [];
  let alive = true;
  whenLogo(img => { LOGO = img; if (alive) myTex.forEach(t => t.userData.repaint()); });
  const fontsReady = () => { if (alive) myTex.forEach(t => t.userData.repaint()); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fontsReady);

  // ---- characters (load in parallel with building the room)
  const loads = loadPeople(ctx.loadGLTF, { asset: ctx.asset });

  // ---- lights
  scene.add(new THREE.HemisphereLight('#fff0dc', '#3a2c20', 0.42));
  const key = new THREE.DirectionalLight('#ffe2bf', 2.2);
  key.position.set(220, 420, 260); key.target.position.set(-40, 0, -20);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -380, right: 380, top: 330, bottom: -330, near: 100, far: 1100 });
  key.shadow.bias = -0.0005; key.shadow.normalBias = 0.8; key.shadow.radius = 4;
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight('#b8ccff', 0.35); fill.position.set(-300, 200, 300); scene.add(fill);

  // ---- room
  const floorTex = woodFloor(); floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping; floorTex.repeat.set(3, 3);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), std('#ffffff', 0.62, 0, { map: floorTex }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 150); floor.receiveShadow = true; scene.add(floor);
  const wallTex = plaster('#E9E1D3');
  const wallM = std('#ffffff', 0.92, 0, { map: wallTex });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(700, 320), wallM); back.position.set(-10, 160, -200); back.receiveShadow = true; scene.add(back);
  const left = new THREE.Mesh(new THREE.PlaneGeometry(520, 320), wallM); left.rotation.y = Math.PI / 2; left.position.set(-340, 160, 60); left.receiveShadow = true; scene.add(left);
  // wainscot
  const wainM = std('#2F4B44', 0.7);
  box(700, 100, 2, wainM, -10, 50, -199, scene); box(2, 100, 520, wainM, -339, 50, 60, scene);
  box(700, 4, 4, std('#E9E1D3', 0.6), -10, 101, -197, scene);
  // sign
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(160, 40), new THREE.MeshStandardMaterial({ map: signTex(), emissive: '#ffffff', emissiveMap: null, roughness: 0.5 }));
  sign.material.emissive = new THREE.Color('#000'); sign.position.set(-338, 215, 60); sign.rotation.y = Math.PI / 2; scene.add(sign);
  sign.material.emissiveMap = sign.material.map; sign.material.emissive = new THREE.Color('#ffffff'); sign.material.emissiveIntensity = 0.35;
  // pegboard above bench
  const peg = new THREE.Mesh(new THREE.PlaneGeometry(150, 60), std('#fff', 0.85, 0, { map: pegboardTex() }));
  peg.position.set(-10, 168, -198.5); peg.receiveShadow = true; scene.add(peg);
  const pegTools = new THREE.Group(); pegTools.position.set(-10, 168, -196); scene.add(pegTools);
  [['#EB5E12', -55], ['#2f6fb5', -42], ['#222', -30], ['#1E7A4A', -18]].forEach(([c, x]) => {
    box(2.2, 11, 2.2, std(c, 0.45), x, 4, 1.5, pegTools); box(0.5, 10, 0.5, MAT.steel, x, -6, 1.5, pegTools);
  });
  const coil = new THREE.Mesh(new THREE.TorusGeometry(7, 0.6, 8, 28), MAT.cable); coil.position.set(10, 2, 2); pegTools.add(coil);
  box(16, 2, 8, MAT.darkMetal, 40, -6, 3, pegTools); box(2, 18, 2, MAT.darkMetal, 33, 2, 2, pegTools);
  box(10, 14, 1, std('#F6F2EA', 0.8), 58, 0, 1, pegTools);

  // ---- counter
  const counter = new THREE.Group(); scene.add(counter);
  const cx = (COUNTER.x0 + COUNTER.x1) / 2, cl = COUNTER.x1 - COUNTER.x0;
  const oakM = std('#8a5a33', 0.55, 0, { map: floorTex });
  box(cl, COUNTER.h - 4, COUNTER.d - 6, std('#2F4B44', 0.7), cx, (COUNTER.h - 4) / 2, COUNTER.z, counter);
  for (let i = 0; i < 22; i++) box(cl / 22 - 1.2, COUNTER.h - 14, 2, oakM, COUNTER.x0 + (i + 0.5) * (cl / 22), (COUNTER.h - 14) / 2 + 4, COUNTER.z + COUNTER.d / 2 - 2, counter);
  box(cl + 8, 4, COUNTER.d + 4, std('#F1ECE3', 0.35, 0), cx, COUNTER.h - 2, COUNTER.z, counter, 1);
  // tablet on a stand, facing the customer side + camera
  const tabletTex = canvasTex(1000, 640, drawTablet, true);
  const tablet = new THREE.Group(); tablet.position.copy(TABLET); tablet.rotation.y = 0.55; counter.add(tablet);
  box(8, 1.2, 8, MAT.darkMetal, 0, 0.6, 0, tablet, 0.4);
  box(2, 12, 2, MAT.darkMetal, 0, 6, -1, tablet);
  const tabHead = new THREE.Group(); tabHead.position.set(0, 18, 0); tabHead.rotation.x = -0.32; tablet.add(tabHead);
  box(26, 17.4, 1, MAT.black, 0, 0, -0.5, tabHead, 0.5);
  const tabScr = new THREE.Mesh(new THREE.PlaneGeometry(24.5, 15.7), new THREE.MeshStandardMaterial({ color: '#000', emissive: '#fff', emissiveMap: tabletTex, emissiveIntensity: 0.85, roughness: 0.4, envMapIntensity: 0.15 }));
  tabScr.position.z = 0.02; tabHead.add(tabScr);
  // label printer
  const printer = new THREE.Group(); printer.position.set(-62, COUNTER.h, 100); printer.rotation.y = 0.5; counter.add(printer);
  box(13, 10, 17, std('#F6F2EA', 0.5), 0, 5, 0, printer, 1.4);
  box(13.2, 2, 6, std('#16130F', 0.5), 0, 10, -4, printer, 0.6);
  box(8, 0.4, 0.4, MAT.black, 0, 6, 8.6, printer);
  const ledP = new THREE.Mesh(new THREE.CircleGeometry(0.6, 12), new THREE.MeshBasicMaterial({ color: '#3FB27F' })); ledP.position.set(4.5, 8, 8.55); printer.add(ledP);
  const ticketLabel = new THREE.Mesh(new THREE.PlaneGeometry(7, 4.4), std('#fff', 0.7, 0, { map: smallLabel('RT-2207', 'Cracked screen', OR) }));
  ticketLabel.rotation.x = -Math.PI / 2 + 0.25; printer.add(ticketLabel);
  // card terminal
  const term = new THREE.Group(); term.position.set(-198, COUNTER.h, 104); term.rotation.y = -0.3; counter.add(term);
  box(8, 2.2, 15, MAT.black, 0, 1.6, 0, term, 0.8);
  const termScr = new THREE.Mesh(new THREE.PlaneGeometry(6, 5), new THREE.MeshBasicMaterial({ color: '#2a2622' }));
  termScr.rotation.x = -Math.PI / 2; termScr.position.set(0, 2.75, -3); term.add(termScr);
  // a few items on the counter
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(4, 3.5, 9, 18), std('#E8DCC8', 0.7)); cup.position.set(-238, COUNTER.h + 4.5, 106); counter.add(cup);
  for (let i = 0; i < 6; i++) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 12, 6), std(['#EB5E12', '#16130F', '#1E7A4A'][i % 3], 0.5)); p.position.set(-239 + (i % 3) - 1, COUNTER.h + 9, 106 + (i % 2)); p.rotation.z = (i - 2.5) * 0.08; counter.add(p); }
  // pendants
  const pendants = [];
  [-200, -90].forEach(x => {
    const pg = new THREE.Group(); pg.position.set(x, 210, COUNTER.z); scene.add(pg);
    box(0.4, 90, 0.4, MAT.black, 0, 45, 0, pg);
    const shade = new THREE.Mesh(new THREE.ConeGeometry(14, 16, 28, 1, true), std('#16130F', 0.5, 0.4, { side: THREE.DoubleSide })); pg.add(shade);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(4.2, 16, 12), new THREE.MeshBasicMaterial({ color: '#ffd9a0' })); bulb.position.y = -7; pg.add(bulb);
    const pl = new THREE.PointLight('#ffc98a', 6000, 260, 1.6); pl.position.y = -10; pg.add(pl);
    pendants.push(pg);
  });

  // ---- repair bench
  const bench = new THREE.Group(); scene.add(bench);
  const bx = (BENCH.x0 + BENCH.x1) / 2, bl = BENCH.x1 - BENCH.x0;
  box(bl, 5, BENCH.d, oakM, bx, BENCH.h - 2.5, BENCH.z, bench, 0.8);
  [[BENCH.x0 + 4, BENCH.z - 30], [BENCH.x1 - 4, BENCH.z - 30], [BENCH.x0 + 4, BENCH.z + 30], [BENCH.x1 - 4, BENCH.z + 30]].forEach(([x, z]) => box(5, BENCH.h - 5, 5, MAT.darkMetal, x, (BENCH.h - 5) / 2, z, bench));
  box(bl - 10, 3, BENCH.d - 10, MAT.darkMetal, bx, 22, BENCH.z, bench);
  // ESD mat
  const matM = std('#fff', 0.85, 0, { map: esdMat() });
  const mat = new THREE.Mesh(new RoundedBoxGeometry(110, 0.6, 58, 2, 0.25), matM); mat.position.set(10, BENCH.h + 0.3, -146); mat.receiveShadow = true; bench.add(mat);
  // monitor
  const monTex = canvasTex(1280, 800, drawMonitor, true);
  const monitor = new THREE.Group(); monitor.position.set(52, BENCH.h, -180); monitor.rotation.y = -0.12; bench.add(monitor);
  const aluM = std('#c9ccd1', 0.3, 0.9);
  box(22, 1.2, 16, aluM, 0, 0.6, 0, monitor, 0.5);
  box(5, 26, 2.2, aluM, 0, 13, -3, monitor, 0.6);
  const monHead = new THREE.Group(); monHead.position.set(0, 32, 0); monHead.rotation.x = -0.05; monitor.add(monHead);
  box(66, 41.5, 2.4, aluM, 0, 0, -1.4, monHead, 0.8);
  box(65, 40.5, 0.3, MAT.black, 0, 0, -0.05, monHead);
  const monScr = new THREE.Mesh(new THREE.PlaneGeometry(63, 39.4), new THREE.MeshStandardMaterial({ color: '#000', emissive: '#fff', emissiveMap: monTex, emissiveIntensity: 0.92, roughness: 0.45, envMapIntensity: 0.12 }));
  monScr.position.z = 0.15; monHead.add(monScr);
  const screenLight = new THREE.PointLight('#fff4e6', 1200, 110, 1.8); screenLight.position.set(52, BENCH.h + 32, -150); bench.add(screenLight);
  // desktop box
  const desk = makeMacStudio(); desk.position.set(98, BENCH.h, -172); desk.scale.setScalar(0.9); bench.add(desk);
  // keyboard
  box(36, 1.4, 12, aluM, 60, BENCH.h + 0.7, -128, bench, 0.5);
  box(34, 0.4, 10, std('#e8e8e6', 0.5), 60, BENCH.h + 1.5, -128, bench);
  // tools (story set, scaled to fit)
  const tools = makeTools(); tools.scale.setScalar(0.42); tools.position.set(10, MAT_Y, -146); bench.add(tools);
  // parts drawer cabinet (left of the mat)
  const cab = new THREE.Group(); cab.position.set(-70, BENCH.h, -160); bench.add(cab);
  const cabM = std('#d9d4ca', 0.55, 0.2);
  box(34, 28, 30, cabM, 0, 14, 0, cab, 0.6);
  const drawers = [];
  for (let i = 0; i < 4; i++) {
    const dg = new THREE.Group(); dg.position.set(0, 3.5 + i * 6.6, 0); cab.add(dg);
    box(31, 5.6, 1.2, std(i === 1 ? '#EB5E12' : '#2F4B44', 0.6), 0, 0, 15.2, dg);
    box(29, 4.6, 26, std('#F1ECE3', 0.7), 0, 0, 2, dg);
    box(8, 1, 1.4, MAT.steel, 0, 0.6, 16.4, dg);
    const lab = new THREE.Mesh(new THREE.PlaneGeometry(7, 2.6), std('#fff', 0.8, 0, { map: smallLabel(['SCR', 'DSP-61', 'BAT', 'FLX'][i], ['Screws', 'Displays', 'Batteries', 'Flex'][i], i === 1 ? OR : INK) }));
    lab.position.set(-9.5, 0.4, 15.85); dg.add(lab);
    drawers.push(dg);
  }
  const drawer = drawers[1];
  // scanner on a cradle
  const scanner = new THREE.Group(); bench.add(scanner);
  box(4.2, 5, 9, std('#2A2622', 0.5), 0, 0, 0, scanner, 1);
  box(3.2, 9, 3.6, std('#2A2622', 0.5), 0, -6, 2.8, scanner, 1).rotation.x = -0.3;
  const scanWin = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4), new THREE.MeshBasicMaterial({ color: '#c63a2a' })); scanWin.position.z = -4.55; scanWin.rotation.y = Math.PI; scanner.add(scanWin);
  box(1.2, 1.4, 2, std('#EB5E12', 0.5), 0, -3, 1.4, scanner);
  const laser = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 1), new THREE.MeshBasicMaterial({ color: '#ff3b2b', transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(laser);
  const cradle = new THREE.Group(); cradle.position.set(92, BENCH.h, -128); bench.add(cradle);
  box(9, 3, 9, std('#2A2622', 0.5), 0, 1.5, 0, cradle, 1);
  const SCAN_REST_POS = new V3(92, BENCH.h + 9, -128), SCAN_REST_Q = new Q().setFromEuler(new THREE.Euler(-1.1, 0.4, 0));
  const SCAN_GRIP = new V3(0, -6, 2.8).applyQuaternion(SCAN_REST_Q);
  // lamp
  const lamp = new THREE.Group(); lamp.position.set(-84, BENCH.h, -186); bench.add(lamp);
  box(14, 2, 14, MAT.black, 0, 1, 0, lamp, 0.8);
  const arm1 = box(1.6, 50, 1.6, MAT.black, 0, 25, 0, lamp); arm1.rotation.z = -0.25; arm1.position.x = 6;
  const arm2 = box(1.6, 46, 1.6, MAT.black, 30, 50, 10, lamp); arm2.rotation.set(0.5, 0, -1.25);
  const head = new THREE.Mesh(new THREE.CylinderGeometry(4, 9, 10, 24, 1, true), std('#EB5E12', 0.5, 0.2, { side: THREE.DoubleSide }));
  head.position.set(52, 58, 30); head.rotation.set(0.35, 0, 0.2); head.castShadow = true; lamp.add(head);
  const lampBulb = new THREE.Mesh(new THREE.CircleGeometry(4, 20), new THREE.MeshBasicMaterial({ color: '#fff3dc' })); lampBulb.rotation.x = -Math.PI / 2 + 0.35; lampBulb.position.set(52, 53.5, 31.6); lamp.add(lampBulb);
  const spot = new THREE.SpotLight('#ffe3b8', 9000, 240, 0.8, 0.7, 1.6);
  spot.position.set(-30, BENCH.h + 60, -150); spot.target.position.set(18, BENCH.h, -140);
  scene.add(spot, spot.target);
  // a bench stool behind the tech? Keep the floor clear for walking.

  // ---- phone + cable
  const crackTex = canvasTex(360, 760, drawPhone, true), newTex = canvasTex(360, 760, drawPhone, true);
  const phone = makeRepairPhone(crackTex, newTex); scene.add(phone);
  const { hinge, crack, fresh } = phone.userData;
  scene.add(fresh);
  phone.traverse(o => { if (o.isMesh) o.castShadow = true; });
  const cableM = std('#F1EFE9', 0.45);
  let cableMesh = null, cableKey = '';
  const CABLE_ROOT = new V3(92, BENCH.h + 3, -166);
  const plugM = std('#F6F2EA', 0.4);
  const plug = box(1.2, 0.7, 2.4, plugM, 0, 0, 0, scene, 0.3);

  // part bag (anti-static, with serial label)
  const bag = new THREE.Group(); scene.add(bag);
  const bagM = std('#b9b4bd', 0.28, 0.7, { transparent: true, opacity: 0.92 });
  box(10, 0.5, 18, bagM, 0, 0, 0, bag, 0.2);
  const bagLabel = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 4), std('#fff', 0.7, 0, { map: partLabel() }));
  bagLabel.rotation.x = -Math.PI / 2; bagLabel.position.set(0, 0.27, 3.5); bag.add(bagLabel);
  box(10.2, 0.6, 1, std('#8f8a93', 0.4, 0.6), 0, 0, -8.6, bag);

  // ---- waiting trays (left wall shelf by the bench)
  const shelfG = new THREE.Group(); shelfG.position.set(-200, 0, -186); scene.add(shelfG);
  const shelfM = oakM;
  [104, 146].forEach(y => { box(150, 3, 26, shelfM, 0, y, 0, shelfG, 0.5); box(2, 6, 22, MAT.darkMetal, -70, y - 4, -2, shelfG); box(2, 6, 22, MAT.darkMetal, 70, y - 4, -2, shelfG); });
  const waiting = [['RT-2203', 'Battery · ready', '#E8E6E0', '#1E7A4A'], ['RT-2204', 'Charge port', '#2e5a87', '#EB5E12'], ['RT-2205', 'Back glass', '#4a2a2e', '#EB5E12'], ['RT-2206', 'Camera', '#c8c4bd', '#EB5E12'],
    ['RT-2199', 'Speaker · ready', '#2a2a2c', '#1E7A4A'], ['RT-2201', 'Water damage', '#9fb8c8', '#B3261E']];
  waiting.forEach(([id, iss, col, acc], i) => {
    const row = i < 4 ? 0 : 1, k = i < 4 ? i : i - 4;
    const tx = -54 + k * 36, ty = row ? 147.5 : 105.5;
    const tray = new THREE.Group(); tray.position.set(tx + (row ? 18 : 0), ty, 0); shelfG.add(tray);
    const trM = std('#F6F2EA', 0.7);
    box(30, 1, 20, trM, 0, 0.5, 0, tray); box(30, 3, 1, trM, 0, 2, 9.5, tray); box(30, 3, 1, trM, 0, 2, -9.5, tray); box(1, 3, 20, trM, 14.5, 2, 0, tray); box(1, 3, 20, trM, -14.5, 2, 0, tray);
    const ph = makeTrayPhone(col); ph.rotation.y = Math.PI / 2 + (i % 2 ? 0.08 : -0.06); ph.position.set(-3, 1, -1); tray.add(ph);
    const lab = new THREE.Mesh(new THREE.PlaneGeometry(10, 4), std('#fff', 0.7, 0, { map: smallLabel(id, iss, acc) }));
    lab.position.set(0, 2.5, 10.1); tray.add(lab);
  });

  // ---- parts bins shelving (right of the bench)
  const binsG = new THREE.Group(); binsG.position.set(195, 0, -178); binsG.rotation.y = -0.18; scene.add(binsG);
  const upM = std('#2F4B44', 0.6, 0.3);
  [[-52, -18], [52, -18], [-52, 18], [52, 18]].forEach(([x, z]) => box(3, 200, 3, upM, x, 100, z, binsG));
  const levels = [40, 80, 120, 160];
  levels.forEach(y => box(108, 2, 40, std('#C9C2B4', 0.5, 0.4), 0, y - 1, 0, binsG));
  box(108, 2, 40, std('#C9C2B4', 0.5, 0.4), 0, 199, 0, binsG);
  const atlas = binAtlas();
  const binCols = ['#EB5E12', '#2F6FB5', '#F1ECE3', '#2F6FB5', '#EB5E12'];
  const binPart = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const parts = [binPart(19, 1, 34), binPart(19, 16, 1), binPart(1, 16, 34), binPart(1, 16, 34), binPart(19, 7, 1)];
  const offs = [[0, 0.5, 0], [0, 8, -16.5], [-9, 8, 0], [9, 8, 0], [0, 3.5, 16.5]];
  const binMs = parts.map(p => { const m = new THREE.InstancedMesh(p, std('#ffffff', 0.55), 20); m.castShadow = true; m.receiveShadow = true; binsG.add(m); return m; });
  const m4 = new THREE.Matrix4(), colr = new THREE.Color();
  for (let i = 0; i < 20; i++) {
    const c = i % 5, r = Math.floor(i / 5);
    const x = -42 + c * 21, y = levels[3 - r], z = 1;
    binMs.forEach((m, k) => { m4.makeTranslation(x + offs[k][0], y + offs[k][1], z + offs[k][2]); m.setMatrixAt(i, m4); m.setColorAt(i, colr.set(binCols[(c + r) % 5])); });
    const geo = new THREE.PlaneGeometry(16, 5.6);
    const uv = geo.attributes.uv; const u0 = c / 5, v0 = 1 - (r + 1) / 4;
    for (let j = 0; j < uv.count; j++) uv.setXY(j, u0 + uv.getX(j) * 0.2 - 0.002 * (uv.getX(j) - 0.5), v0 + uv.getY(j) * 0.25);
    const lab = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: atlas, roughness: 0.8 }));
    lab.position.set(x, y + 4, z + 17.2); binsG.add(lab);
    // parts peeking out of bins
    const pk = new THREE.Mesh(new THREE.BoxGeometry(12, 1.5 + (i % 3), 8), std(['#0b0c0e', '#3a3b3f', '#b9b4bd'][i % 3], 0.4, 0.5));
    pk.position.set(x, y + 2, z + 4); pk.rotation.x = -0.3; binsG.add(pk);
  }
  binMs.forEach(m => { m.instanceColor.needsUpdate = true; });

  // stool at the counter + plant
  const plantPot = new THREE.Mesh(new THREE.CylinderGeometry(14, 11, 30, 20), std('#C9BBA5', 0.8)); plantPot.position.set(-310, 15, 210); scene.add(plantPot);
  for (let i = 0; i < 9; i++) { const lf = new THREE.Mesh(new THREE.SphereGeometry(10, 10, 8), std('#2F5D3A', 0.8)); lf.scale.set(0.5, 1.6, 0.25); lf.position.set(-310 + Math.cos(i * 0.7) * 8, 52 + (i % 3) * 8, 210 + Math.sin(i * 0.7) * 8); lf.rotation.set(Math.cos(i) * 0.5, i, Math.sin(i) * 0.5); lf.castShadow = true; scene.add(lf); }

  // soft lens vignette, parented to the camera
  const vigTex = canvasTex(256, 256, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h / 2, w * 0.28, w / 2, h / 2, w * 0.72);
    gr.addColorStop(0, 'rgba(18,12,6,0)'); gr.addColorStop(1, 'rgba(18,12,6,0.62)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
  const vignette = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: vigTex, transparent: true, depthTest: false, depthWrite: false, fog: false, toneMapped: false }));
  vignette.position.z = -10; vignette.renderOrder = 999; vignette.frustumCulled = false;
  camera.add(vignette); scene.add(camera);

  // text bubble
  // (a heads-up card in camera space, so it reads at any framing and width)
  const bubble = new THREE.Mesh(new THREE.PlaneGeometry(1, 300 / 760), new THREE.MeshBasicMaterial({ map: bubbleTex(), transparent: true, depthTest: false, depthWrite: false, fog: false, toneMapped: false }));
  bubble.renderOrder = 1000; bubble.frustumCulled = false; camera.add(bubble);

  // ---- characters
  // pictogram cast: the tech in the orange staff vest, a walk-in customer in plain white
  const kit = await loads;
  const clips = kit.clips;
  const tech = makeChar(null, clips, { person: kit.person({ head: 'ponytail', look: LOOKS.staffOrange, height: 168, mixer: false }) });
  const cust = makeChar(null, clips, { person: kit.person({ head: 'operator', look: LOOKS.casualRust, height: 180, mixer: false }) });
  scene.add(tech.root, cust.root);
  const fingers = [];
  tech.model.traverse(o => { const m = /(Left|Right)Hand(Index|Middle|Ring|Pinky|Thumb)([123])$/.exec(o.name); if (m) fingers.push({ o, side: m[1], f: m[2], j: +m[3] }); });
  const curlQ = new Q(), AX = { X: new V3(1, 0, 0), Y: new V3(0, 1, 0), Z: new V3(0, 0, 1) };
  function curl(amount) {
    for (const fb of fingers) {
      const a = (fb.f === 'Thumb' ? 0.2 : 0.4 + fb.j * 0.12) * amount * (fb.side === 'Left' ? 1 : -1);
      curlQ.setFromAxisAngle(AX.X, a);
      fb.o.quaternion.multiply(curlQ);
    }
  }
  
  // ---- per-frame helpers
  const tmpN = new V3(), tmpP = new V3(), tmpQ = new Q(), tmpE = new THREE.Euler(), fwd = new V3(), right = new V3(), up = new V3(0, 1, 0);
  const hips = new V3(), tgtL = new V3(), tgtR = new V3(), pole = new V3(), look = new V3();

  // stride: scene units walked per walk-clip cycle (feet planted at any pace)
  const strideOf = ch => kit.walkRate(ch.person, 1) > 0 ? 1 / kit.walkRate(ch.person, 1) * ch.dur.walk : 1;
  function poseChar(ch, track, t) {
    const st = evalTrack(track, t);
    const { x, z, yaw, speed: sp } = st;
    ch.root.position.set(x, 0, z); ch.root.rotation.y = yaw;
    // idle <-> walk crossfade follows the speed ramp (about a quarter second)
    const wW = ss(0, 55, sp);
    const tw = ((st.dist / strideOf(ch)) * ch.dur.walk) % ch.dur.walk, ti = t % ch.dur.idle;
    for (const [o, q] of ch.rest) o.quaternion.copy(q);
    for (const c of ch.chans) {
      if (c.idle) _qa.fromArray(c.idle.evaluate(ti)); else _qa.copy(c.bone.quaternion);
      if (c.walk && wW > 0) { _qb.fromArray(c.walk.evaluate(tw)); _qa.slerp(_qb, wW); }
      c.bone.quaternion.copy(_qa);
    }
    ch.root.updateMatrixWorld(true);
    fwd.set(Math.sin(yaw), 0, Math.cos(yaw)); right.set(-Math.cos(yaw), 0, Math.sin(yaw));
    return { yaw, sp, wW };
  }
  function lean(ch, ang) {
    if (Math.abs(ang) < 1e-4) return;
    _q.setFromAxisAngle(right, -ang / 3);
    rotateBoneWorld(ch.b.spine, _q); rotateBoneWorld(ch.b.spine1, _q); rotateBoneWorld(ch.b.spine2, _q);
  }
  function lookAt(ch, target, w) {
    if (w <= 0) return;
    // turn neck + head toward the target, measured from the body's forward
    ch.b.head.getWorldPosition(_a);
    _d.subVectors(target, _a).normalize();
    _v.set(Math.sin(ch.root.rotation.y), 0, Math.cos(ch.root.rotation.y));
    _q.setFromUnitVectors(_v, _d); _qi.identity(); _q.slerp(_qi, 1 - w * 0.6);
    qLook.copy(_q).slerp(_qi, 0.5);
    rotateBoneWorld(ch.b.neck, qLook);
    rotateBoneWorld(ch.b.head, qLook);
  }
  const charLocal = (ch, lx, ly, lz, out) => out.set(lx, ly, lz).applyAxisAngle(up, ch.root.rotation.y).add(ch.root.position);
  function armPole(ch, side, out) {
    // elbow points down, out and back
    const s = side === 'L' ? 1 : -1;
    return charLocal(ch, s * 40, 60, -40, out);
  }

  // phone poses
  const COUNTER_DROP = new V3(-158, COUNTER.h + 0.45, 108);
  const COUNTER_HAND = new V3(-150, COUNTER.h + 0.45, 100);
  const qFlat = new Q();
  const qFlatYaw = a => new Q().setFromEuler(new THREE.Euler(0, a, 0));
  const QMAT = qFlatYaw(0.08), QDROP = qFlatYaw(0.5), QHAND = qFlatYaw(-0.3);
  // phone lying on the palm: back of the phone on the hand, screen up toward the face
  // (the hand turns so the palm lies flat under the phone; no overlap)
  const handPhonePose = (ch, side, outP, outQ) => {
    const S = side === 'R' ? 'Right' : 'Left';
    outQ.setFromEuler(tmpE.set(-0.9, ch.root.rotation.y + Math.PI, 0, 'YXZ'));
    tmpN.set(0, 1, 0).applyQuaternion(outQ);
    kit.orientHand(ch.person, S, tmpP.set(0, 0, -1).applyQuaternion(outQ), tmpN, 1);
    kit.hand(ch.person, S, outP);
    outP.addScaledVector(tmpN, kit.palmHalf(ch.person) + 0.5).addScaledVector(tmpP, 2.5);
  };
  // hinge open angle
  const hingeAng = t => (ss(T.openA, T.openB, t) - ss(T.closeA, T.closeB, t)) * 1.75;
  const HINGE_LOCAL = new V3(-(PW / 2 - 0.05), 0, 0);
  const CRACK_ASIDE = new V3(-13, MAT_Y + 0.5, -146), Q_ASIDE = qFlatYaw(0.25);
  const BAG_IN = new V3(-70, BENCH.h + 9.5, -150), BAG_SCAN = new V3(28, BENCH.h + 13, -128), BAG_DOWN = new V3(-26, MAT_Y + 0.6, -126);
  const Q_BAG_SCAN = new Q().setFromEuler(new THREE.Euler(0.7, 0.25, 0)), Q_BAG_DOWN = qFlatYaw(-0.3), Q_BAG_IN = qFlatYaw(0);
  const SCAN_AIM = new V3(46, BENCH.h + 22, -114), Q_SCAN_AIM = new Q();
  {
    // scanner looks at the bag label from SCAN_AIM (its window faces local -z)
    const m = new THREE.Matrix4().lookAt(BAG_SCAN, SCAN_AIM, up);
    Q_SCAN_AIM.setFromRotationMatrix(m);
  }
  const hingeWorld = new THREE.Matrix4(), hp = new V3(), hq = new Q(), hs = new V3();
  const dispP = new V3(), dispQ = new Q();
  function placeOnHinge(obj, outP, outQ) {
    hinge.updateMatrixWorld(true);
    hingeWorld.copy(hinge.matrixWorld).decompose(hp, hq, hs);
    outP.copy(HINGE_LOCAL).applyQuaternion(hq).add(hp); outQ.copy(hq);
    void obj;
  }
  function setPose(obj, p, q) { obj.position.copy(p); obj.quaternion.copy(q); }

  function rebuildCable(endP, endDir, key) {
    if (key === cableKey) return;
    cableKey = key;
    const mid1 = new V3().lerpVectors(CABLE_ROOT, endP, 0.35); mid1.y = MAT_Y + 0.8;
    const mid2 = endP.clone().addScaledVector(endDir, 8); mid2.y = MAT_Y + 0.7;
    const curve = new THREE.CatmullRomCurve3([CABLE_ROOT, new V3(CABLE_ROOT.x - 4, MAT_Y + 0.8, CABLE_ROOT.z + 8), mid1, mid2, endP.clone().addScaledVector(endDir, 1.6)]);
    const geo = new THREE.TubeGeometry(curve, 48, 0.32, 6, false);
    if (cableMesh) { cableMesh.geometry.dispose(); cableMesh.geometry = geo; }
    else { cableMesh = new THREE.Mesh(geo, cableM); cableMesh.castShadow = true; scene.add(cableMesh); }
  }

  // ---- camera framing
  const camP = new V3(), camT = new V3(), par = { x: 0, y: 0, tx: 0, ty: 0 }, hover = { k: 0, target: 0 };
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function applyView() {
    if (!(W > 0 && H > 0)) { camera.aspect = ASP(); camera.updateProjectionMatrix(); return; }
    camera.aspect = ASP();
    if (small) camera.setViewOffset(W, H, 0, H * 0.07, W, H);
    else camera.setViewOffset(W, H, -W * 0.06, 0, W, H);
    camera.updateProjectionMatrix();
  }
  applyView();

  const v1 = new V3(), q1 = new Q();
  function update(dt, t) {
    t = ((t % DUR) + DUR) % DUR;
    // ---- screens
    monTex.userData.paint(monitorState(t));
    tabletTex.userData.paint(tabletState(t));
    crackTex.userData.paint(crackedState(t));
    newTex.userData.paint(newState(t));

    // ---- characters
    poseChar(cust, CUST_TRACK, t);
    const custVisible = !(t > 9.2 && t < 27.6);
    cust.root.visible = custVisible;
    const ts = poseChar(tech, TECH_TRACK, t);
    curl(1);
    const atBench = ss(T.walkB - 0.6, T.walkB + 0.2, t) * (1 - ss(T.leaveBench - 0.2, T.leaveBench + 0.4, t));
    lean(tech, 0.24 * atBench + 0.12 * ss(2.8, 3.6, t) * (1 - ss(5.8, 6.4, t)) + 0.12 * ss(T.atCounter - 0.4, T.atCounter, t) * (1 - ss(36.5, 38, t)));
    lean(cust, 0.1 * (ss(2.6, 3.0, t) * (1 - ss(3.4, 4, t)) + ss(T.custTake - 0.5, T.custTake, t) * (1 - ss(T.custTake + 0.3, T.custTake + 0.8, t)) + ss(T.payA - 0.2, T.payA + 0.2, t) * (1 - ss(T.paid, T.paid + 0.4, t))));

    // ---- bench object choreography
    hinge.rotation.z = -hingeAng(t);
    const drawerOut = ss(T.drawerA, T.drawerB, t) * (1 - ss(T.scanB + 0.4, T.scanB + 1.2, t));
    drawer.position.z = drawerOut * 18;

    // phone root pose (whole device)
    let phoneP = PHONE_MAT, phoneQ = QMAT;
    const pp = new V3(), pq = new Q();
    if (t < T.dropAt - 0.3 || t >= T.custTake) { handPhonePose(cust, 'R', pp, pq); phoneP = pp; phoneQ = pq; }
    else if (t < T.dropAt) { handPhonePose(cust, 'R', pp, pq); const k = ss(T.dropAt - 0.3, T.dropAt, t); pp.lerp(COUNTER_DROP, k); pq.slerp(QDROP, k); phoneP = pp; phoneQ = pq; }
    else if (t < T.pick) { phoneP = COUNTER_DROP; phoneQ = QDROP; }
    else if (t < T.place) {
      handPhonePose(tech, 'R', pp, pq);
      const k1 = ss(T.pick, T.pick + 0.3, t), k2 = ss(T.place - 0.4, T.place, t);
      v1.copy(COUNTER_DROP).lerp(pp, k1).lerp(PHONE_MAT, k2); q1.copy(QDROP).slerp(pq, k1).slerp(QMAT, k2);
      phoneP = v1; phoneQ = q1;
    } else if (t < T.leaveBench) { phoneP = PHONE_MAT; phoneQ = QMAT; }
    else if (t < T.handA) {
      handPhonePose(tech, 'R', pp, pq);
      const k1 = ss(T.leaveBench, T.leaveBench + 0.4, t), k2 = ss(T.handA - 0.4, T.handA, t);
      v1.copy(PHONE_MAT).lerp(pp, k1).lerp(COUNTER_HAND, k2); q1.copy(QMAT).slerp(pq, k1).slerp(QHAND, k2);
      phoneP = v1; phoneQ = q1;
    } else if (t < T.custTake - 0.3) { phoneP = COUNTER_HAND; phoneQ = QHAND; }
    else { handPhonePose(cust, 'R', pp, pq); const k = ss(T.custTake - 0.3, T.custTake, t); v1.copy(COUNTER_HAND).lerp(pp, k); q1.copy(QHAND).slerp(pq, k); phoneP = v1; phoneQ = q1; }
    // the hand pose read above is from the pre-IK skeleton for this frame; IK below
    // targets the same point so the hand meets the phone.
    setPose(phone, phoneP, phoneQ);
    phone.updateMatrixWorld(true);

    // displays. Before crackOut the cracked display rides the hinge; it is then
    // set aside on the mat. The new display rises from the bag at newA, lands on
    // the hinge and stays there; at CLEAR_T (camera on the monitor) the aside
    // pieces are cleared so the loop restarts clean.
    placeOnHinge(null, dispP, dispQ);
    if (t < T.crackOut || t >= CLEAR_T) {
      if (crack.parent !== hinge) hinge.add(crack);
      crack.position.copy(HINGE_LOCAL); crack.quaternion.identity();
      crack.visible = t < T.crackOut;
    } else {
      if (crack.parent !== scene) scene.add(crack);
      const k = ss(T.crackOut, T.crackDone, t);
      v1.copy(dispP).lerp(CRACK_ASIDE, k); v1.y += Math.sin(k * Math.PI) * 6;
      q1.copy(dispQ).slerp(Q_ASIDE, k);
      setPose(crack, v1, q1); crack.visible = true;
    }
    if (t < T.newA) {
      // the new display rides inside the anti-static bag until it is taken out
      fresh.visible = t >= T.drawerB - 0.4 && t < CLEAR_T; // posed with the bag below
    } else {
      fresh.visible = true;
      const k = ss(T.newA, T.newB, t);
      v1.copy(BAG_DOWN).lerp(dispP, k); v1.y += Math.sin(k * Math.PI) * 9; q1.copy(Q_BAG_DOWN).slerp(dispQ, k);
      setPose(fresh, v1, q1);
    }

    // bag
    bag.visible = t >= T.drawerB - 0.4 && t < CLEAR_T;
    {
      const k1 = ss(T.drawerB - 0.2, T.bagUp, t), k2 = ss(T.scanB - 0.1, T.scanB + 0.6, t);
      v1.copy(BAG_IN).lerp(BAG_SCAN, k1); v1.y += Math.sin(k1 * Math.PI) * 10; v1.lerp(BAG_DOWN, k2);
      v1.z += drawerOut * 18 * (1 - k1);
      q1.copy(Q_BAG_IN).slerp(Q_BAG_SCAN, k1).slerp(Q_BAG_DOWN, k2);
      setPose(bag, v1, q1);
    }
    if (t < T.newA && fresh.visible) { fresh.position.copy(bag.position); fresh.quaternion.copy(bag.quaternion); }
    setPose(scanner, SCAN_REST_POS, SCAN_REST_Q);
    // cable: plug follows the phone port when plugged, rests on the mat otherwise
    {
      const plugged = t >= T.plug - 0.5 && t < T.leaveBench;
      const portP = new V3(0, 0.05, PH / 2 + 1.2).applyQuaternion(QMAT).add(PHONE_MAT);
      const restP = new V3(40, MAT_Y + 0.6, -128);
      const k = plugged ? ss(T.plug - 0.5, T.plug, t) : 1 - ss(T.leaveBench - 0.5, T.leaveBench - 0.1, t);
      v1.copy(restP).lerp(portP, k);
      if (!plugged && t >= T.leaveBench - 0.1) v1.copy(restP);
      const dir = new V3(0, 0, 1).applyQuaternion(QMAT);
      plug.position.copy(v1); plug.quaternion.copy(QMAT);
      rebuildCable(v1, dir, v1.x.toFixed(1) + v1.z.toFixed(1));
    }
    // ticket label from the printer
    {
      const out = ss(T.printA, T.printB, t);
      ticketLabel.visible = t > T.printA && t < T.pick + 0.3;
      ticketLabel.position.set(0, 6.2 - out * 0.2, 8.6 + out * 4.2);
    }
    // bubble: slides in at the top right (top centre on phones)
    {
      const a = ss(T.bubbleA, T.bubbleA + 0.4, t) * (1 - ss(T.bubbleB - 0.4, T.bubbleB, t));
      bubble.visible = a > 0.01;
      bubble.material.opacity = a;
      const d = 40, hh = d * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2), hw = hh * ASP();
      const w = small ? hw * 1.7 : Math.min(hw * 0.75, hh * 1.1);
      const pop = 0.92 + 0.08 * ss(T.bubbleA, T.bubbleA + 0.5, t);
      bubble.scale.set(w * pop, w * pop, 1);
      const x = small ? 0 : hw - w / 2 - hw * 0.18, y = hh - (w * 0.39) / 2 - hh * (small ? 0.06 : 0.08);
      bubble.position.set(x + (1 - a) * hw * (small ? 0 : 0.2), y + (small ? (1 - a) * hh * 0.2 : 0), -d);
    }
    // ---- tech IK targets
    const workW = atBench;
    if (workW > 0.01) {
      // default: hands on the phone sides, small working motion
      const wob = Math.sin(t * 2.3) * 0.8;
      tgtL.set(PHONE_MAT.x - 7.5, MAT_Y + 4, PHONE_MAT.z + 6 + wob);
      tgtR.set(PHONE_MAT.x + 7.5, MAT_Y + 4, PHONE_MAT.z + 5 - wob);
      // opening / closing: right hand on the display edge
      if (t > T.openA - 0.4 && t < T.drawerA) { placeOnHinge(null, dispP, dispQ); tgtR.copy(new V3(-PW + 1, 0.5, 3).applyQuaternion(dispQ).add(dispP)); }
      if (t > T.closeA - 0.5 && t < T.closeB + 0.2) { placeOnHinge(null, dispP, dispQ); tgtR.copy(new V3(-PW + 1, 0.5, 3).applyQuaternion(dispQ).add(dispP)); }
      // drawer + bag with the left hand
      if (t > T.drawerA - 0.4 && t < T.scanB + 0.4) tgtL.copy(drawer.getWorldPosition(v1)).add(new V3(0, 1.5, 17));
      if (t > T.drawerB - 0.2 && t < T.scanB + 0.6) tgtL.copy(bag.position).add(new V3(-3, 1, 6));
      // scanner with the right hand
      if (t > T.scanA - 0.6 && t < T.scanB + 0.9) {
        const reach = ss(T.scanA - 0.6, T.scanA - 0.1, t) * (1 - ss(T.scanB + 0.4, T.scanB + 0.9, t));
        const lift = ss(T.scanA, T.scanA + 0.6, t) * (1 - ss(T.scanB - 0.2, T.scanB + 0.4, t));
        v1.copy(SCAN_REST_POS).add(SCAN_GRIP).lerp(SCAN_AIM, lift);
        tgtR.lerp(v1, reach);
      }
      // swap: both hands guide the displays
      if (t > T.crackOut - 0.3 && t < T.crackDone) tgtL.copy(crack.position).add(new V3(0, 1, 2));
      if (t > T.newA - 0.3 && t < T.newB + 0.2) tgtR.copy(fresh.position).add(new V3(2, 1, 3));
      armPole(tech, 'L', pole); solveArm(tech, 'L', tgtL, pole, workW);
      armPole(tech, 'R', pole); solveArm(tech, 'R', tgtR, pole, workW);
      look.set(PHONE_MAT.x, MAT_Y, PHONE_MAT.z);
      if (t > 10 && t < 12.6 || t > T.retestA && t < T.ready) look.set(52, BENCH.h + 32, -178);
      if (t > T.scanA && t < T.scanB) look.copy(BAG_SCAN);
      lookAt(tech, look, workW);
    }
    // counter: typing on the tablet (tech) / carrying
    const carryT = ss(T.pick - 0.4, T.pick, t) * (1 - ss(T.place - 0.3, T.place, t)) + ss(T.leaveBench - 0.2, T.leaveBench + 0.3, t) * (1 - ss(T.handA - 0.3, T.handA + 0.1, t));
    if (carryT > 0.01) { charLocal(tech, -14, 98, 20, tgtR); armPole(tech, 'R', pole); solveArm(tech, 'R', tgtR, pole, carryT); }
    const typeW = ss(2.8, 3.3, t) * (1 - ss(5.2, 5.8, t)) + ss(T.payA - 0.6, T.payA, t) * (1 - ss(T.paid + 0.2, T.paid + 0.8, t));
    if (typeW > 0.01) {
      tgtL.set(TABLET.x - 4 + Math.sin(t * 9) * 1.5, COUNTER.h + 14, TABLET.z - 8);
      armPole(tech, 'L', pole); solveArm(tech, 'L', tgtL, pole, typeW);
    }
    const pickW = ss(T.pick - 0.6, T.pick, t) * (1 - ss(T.pick + 0.1, T.pick + 0.4, t));
    if (pickW > 0.01) { armPole(tech, 'R', pole); solveArm(tech, 'R', COUNTER_DROP, pole, pickW); }
    const giveW = ss(T.handA - 0.6, T.handA - 0.2, t) * (1 - ss(T.handA + 0.1, T.handA + 0.5, t));
    if (giveW > 0.01) { armPole(tech, 'R', pole); solveArm(tech, 'R', COUNTER_HAND, pole, giveW); }
    if (atBench < 0.5) { look.set(CUST_AT.x, 165, CUST_AT.z); if (custVisible) lookAt(tech, look, 0.5 * (1 - atBench) * (1 - ts.wW)); }
    // customer arms: carrying, dropping, taking, paying
    if (custVisible) {
      const holdW = (1 - ss(T.dropAt - 0.1, T.dropAt + 0.2, t)) + ss(T.custTake - 0.1, T.custTake + 0.3, t);
      if (holdW > 0.01) { charLocal(cust, -14, 100, 24, tgtR); armPole(cust, 'R', pole); solveArm(cust, 'R', tgtR, pole, Math.min(1, holdW)); }
      const dropW = ss(T.dropAt - 0.6, T.dropAt - 0.2, t) * (1 - ss(T.dropAt + 0.1, T.dropAt + 0.5, t));
      if (dropW > 0.01) { armPole(cust, 'R', pole); solveArm(cust, 'R', COUNTER_DROP, pole, dropW); }
      const takeW = ss(T.custTake - 0.7, T.custTake - 0.3, t) * (1 - ss(T.custTake - 0.1, T.custTake + 0.3, t));
      if (takeW > 0.01) { armPole(cust, 'R', pole); solveArm(cust, 'R', COUNTER_HAND, pole, takeW); }
      const payW = ss(T.payA - 0.4, T.payA, t) * (1 - ss(T.paid - 0.2, T.paid + 0.3, t));
      if (payW > 0.01) { tgtL.set(-198, COUNTER.h + 6, 104); armPole(cust, 'L', pole); solveArm(cust, 'L', tgtL, pole, payW); }
      look.set(TABLET.x, COUNTER.h + 15, TABLET.z); lookAt(cust, look, 0.4 * (1 - clamp01(evalTrack(CUST_TRACK, t).speed / 40)));
    }
    // re-read the hand after IK so the phone sits in the final hand
    if ((t >= T.pick + 0.3 && t < T.place - 0.4) || (t >= T.leaveBench + 0.4 && t < T.handA - 0.4)) { handPhonePose(tech, 'R', pp, pq); setPose(phone, pp, pq); }
    if (t < T.dropAt - 0.3 || t >= T.custTake) { handPhonePose(cust, 'R', pp, pq); setPose(phone, pp, pq); }
    phone.updateMatrixWorld(true);
    if (t >= T.newB) { placeOnHinge(null, dispP, dispQ); setPose(fresh, dispP, dispQ); }
    // scanner: sits on its cradle, rides in the right hand while scanning
    {
      const kh = ss(T.scanA - 0.15, T.scanA + 0.05, t) * (1 - ss(T.scanB + 0.35, T.scanB + 0.5, t));
      if (kh > 0.001) {
        tech.b.RHand.getWorldPosition(hp);
        bagLabel.getWorldPosition(v1);
        const m = new THREE.Matrix4().lookAt(hp, v1, up);
        q1.setFromRotationMatrix(m);
        const pos = new V3(0, 6, -2.8).applyQuaternion(q1).add(hp);
        scanner.position.copy(SCAN_REST_POS).lerp(pos, kh);
        scanner.quaternion.copy(SCAN_REST_Q).slerp(q1, kh);
      }
      const on = t > T.scanA + 0.55 && t < T.scanHit + 0.1;
      laser.visible = on;
      if (on) {
        scanner.updateMatrixWorld(true);
        const from = new V3(0, 0, -4.6).applyMatrix4(scanner.matrixWorld);
        const to = bagLabel.getWorldPosition(new V3());
        const flick = 0.6 + 0.4 * Math.sin(t * 90);
        laser.position.lerpVectors(from, to, 0.5);
        laser.scale.set(0.3, from.distanceTo(to), 1);
        const dir = to.clone().sub(from).normalize();
        const zc = camera.position.clone().sub(laser.position).normalize();
        const xc = new V3().crossVectors(dir, zc).normalize();
        const zc2 = new V3().crossVectors(xc, dir);
        laser.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xc, dir, zc2));
        laser.material.opacity = 0.75 * flick;
      }
      scanWin.material.color.set(t > T.scanHit && t < T.scanHit + 0.4 ? '#4be08a' : '#c63a2a');
    }
    // ---- lights
    screenLight.intensity = 900 + (t >= T.plug && t < T.leaveBench ? 400 : 0);

    // ---- camera
    let fov = camAt(t, camP, camT);
    par.x += (par.tx - par.x) * Math.min(1, dt * 3); par.y += (par.ty - par.y) * Math.min(1, dt * 3);
    hover.k += (hover.target - hover.k) * Math.min(1, dt * 4);
    const dist = camP.distanceTo(camT);
    v1.subVectors(camP, camT).normalize();
    const rx = new V3().crossVectors(up, v1).normalize();
    camP.addScaledVector(rx, par.x * dist * 0.04).addScaledVector(up, par.y * dist * 0.025);
    // hover on a screen: lean in a little
    camP.lerp(camT, hover.k * 0.12);
    if (small) {
      // portrait: widen and pull back so the subject fits across
      const a = ASP();
      const f = Math.min(1.75, Math.pow(1.5 / Math.max(0.5, a), 0.55));
      fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(fov) / 2) * f));
    }
    if (Math.abs(camera.fov - fov) > 1e-3) { camera.fov = fov; camera.updateProjectionMatrix(); }
    camera.position.copy(camP); camera.lookAt(camT);
    { const vh = 2 * 10 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * 1.3; vignette.scale.set(vh * ASP(), vh, 1); }
  }

  function pointer(e) {
    if (e.type === 'leave') { par.tx = 0; par.ty = 0; hover.target = 0; return; }
    par.tx = e.x; par.ty = e.y;
    ndc.set(e.x, e.y); ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects([monScr, tabScr], false);
    hover.target = hit.length ? 1 : 0;
  }

  function resize(w, h) { if (w > 0 && h > 0) { W = w; H = h; small = w < 700; } applyView(); }

  function dispose() {
    alive = false;
    const mats = new Set(), geos = new Set(), texs = new Set(myTex);
    scene.traverse(o => {
      if (o.geometry) geos.add(o.geometry);
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => mats.add(m));
    });
    [crack, fresh].forEach(d => d.traverse(o => { if (o.geometry) geos.add(o.geometry); if (o.material) mats.add(o.material); }));
    mats.forEach(m => {
      if (keep.has(m)) return;
      for (const k of ['map', 'emissiveMap', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap']) if (m[k]) texs.add(m[k]);
      m.dispose();
    });
    geos.forEach(g => g.dispose());
    texs.forEach(t => t.dispose());
    myTex.length = 0;
    envTex.dispose();
    if (cableMesh) cableMesh.geometry.dispose();
    kit.dispose();
  }

  return {
    scene, camera, duration: DUR,
    captions: [
      { at: 0, title: 'Drop-off at the counter', body: 'Ticket RT-2207 opens on the counter tablet: cracked screen, quoted $129.' },
      { at: 8.6, title: 'Diagnose on the bench', body: 'Plug in. The station reads the IMEI and runs 42 checks.' },
      { at: 13.4, title: 'Scan the part in', body: 'The display comes from the drawer and its serial attaches to the ticket.' },
      { at: 22.8, title: 'Retest: 42 of 42', body: 'Same checks as intake. All green, so the ticket moves to Ready.' },
      { at: 27.4, title: 'Customer texted automatically', body: 'Ready for pickup, with the ticket number and total. No phone tag.' },
      { at: 32.4, title: 'Pickup and payment', body: 'Paid at the counter. The repair stays on the device history.' }
    ],
    update, pointer, resize, dispose
  };
}
