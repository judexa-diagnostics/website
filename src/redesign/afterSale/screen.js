// The counter's point-of-sale screen, drawn in InPhox's own UI language
// (cream cards, ink header, orange accents, mono figures). Big type so it
// still reads from a ceiling camera.
import * as THREE from 'three';

const INK = '#16130F', CREAM = '#F6F2EA', OR = '#EB5E12', GR = '#1E7A4A', LINE = '#D9D0C2', MUTED = '#6E655A', PAPER = '#FFFFFF';
const sans = (s, w = 700) => `${w} ${s}px 'Archivo', system-ui, sans-serif`;
const mono = (s, w = 600) => `${w} ${s}px 'JetBrains Mono', ui-monospace, monospace`;

export const DEVICES = [
  { imei: '35 679811 452033 1', spec: '128 GB · Midnight', grade: 'A', price: 190 },
  { imei: '35 301211 987420 5', spec: '256 GB · Silver', grade: 'B', price: 150 },
  { imei: '35 091726 601344 8', spec: '128 GB · Graphite', grade: 'A', price: 120 },
];

function rr(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
function tick(g, x, y, s, col) {
  g.fillStyle = col; g.beginPath(); g.arc(x, y, s, 0, 7); g.fill();
  g.strokeStyle = PAPER; g.lineWidth = s * 0.35; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(x - s * 0.45, y + s * 0.02); g.lineTo(x - s * 0.1, y + s * 0.38); g.lineTo(x + s * 0.5, y - s * 0.35); g.stroke();
}
function money(g, text, x, y, size, col, struck) {
  g.fillStyle = col; g.font = mono(size, 700); g.fillText(text, x, y);
  if (struck) { const w = g.measureText(text).width; g.fillRect(x - 3, y - size * 0.36, w + 6, Math.max(3, size * 0.09)); }
}

export function makeScreen() {
  const c = document.createElement('canvas');
  c.width = 960; c.height = 592;
  const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  let last = '';
  function draw(s) {
    const key = JSON.stringify(s);
    if (key === last) return;
    last = key;
    const W = c.width, H = c.height;
    g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    g.fillStyle = CREAM; g.fillRect(0, 0, W, H);
    // header
    g.fillStyle = INK; g.fillRect(0, 0, W, 74);
    g.fillStyle = OR; g.fillRect(28, 22, 30, 30);
    g.fillStyle = CREAM; g.font = sans(34, 800); g.fillText('InPhox', 72, 50);
    g.font = mono(22, 600); g.fillStyle = '#BDB3A3'; g.fillText('COUNTER · BUY', 230, 48);
    g.textAlign = 'right'; g.fillStyle = s.paid ? '#7FD6A6' : '#F6B588';
    g.fillText(s.paid ? '● PAID' : s.accepted ? '● ACCEPTED' : s.n > 0 ? '● INTAKE' : '● READY', W - 28, 48);
    g.textAlign = 'left';

    if (s.done) {
      g.fillStyle = INK; g.font = sans(54, 800); g.fillText('Ticket closed', 40, 190);
      g.font = mono(28, 600); g.fillStyle = MUTED; g.fillText('3 devices → Testing queue', 40, 248);
      tick(g, 70, 340, 30, GR);
      g.fillStyle = GR; g.font = sans(40, 800); g.fillText('Paid · cash $490', 120, 354);
      g.fillStyle = MUTED; g.font = mono(24, 500); g.fillText('Receipt printed · ID on file', 40, 440);
      return;
    }
    if (s.n === 0) {
      g.fillStyle = INK; g.font = sans(56, 800); g.fillText('Scan a device', 40, 200);
      g.fillStyle = MUTED; g.font = mono(26, 500); g.fillText('IMEI · serial · or type it', 40, 250);
      g.strokeStyle = OR; g.lineWidth = 6; rr(g, 40, 300, 360, 180, 18); g.stroke();
      g.fillStyle = OR; g.fillRect(60, 386, 320, 6);
      return;
    }
    // device rows
    const rowH = 92;
    for (let i = 0; i < 3; i++) {
      const y = 96 + i * (rowH + 10);
      const d = DEVICES[i];
      const on = i < s.n, scanning = i === s.scanning;
      g.fillStyle = on ? PAPER : 'rgba(255,255,255,0.45)'; rr(g, 24, y, s.offer ? 560 : W - 48, rowH, 10); g.fill();
      g.strokeStyle = scanning ? OR : LINE; g.lineWidth = scanning ? 5 : 2; rr(g, 24, y, s.offer ? 560 : W - 48, rowH, 10); g.stroke();
      if (!on) {
        g.fillStyle = scanning ? OR : '#B9AE9E'; g.font = mono(26, 600); g.fillText(scanning ? 'Reading…' : `Device ${i + 1}`, 48, y + 56);
        continue;
      }
      g.fillStyle = INK; g.font = sans(30, 800); g.fillText(d.spec, 48, y + 40);
      g.fillStyle = MUTED; g.font = mono(21, 500); g.fillText('IMEI ' + d.imei, 48, y + 74);
      const gx = s.offer ? 470 : 640;
      tick(g, gx, y + 46, 17, GR);
      g.fillStyle = GR; g.font = mono(20, 700); g.fillText('CLEAN', gx + 24, y + 53);
      g.fillStyle = d.grade === 'A' ? GR : '#8A4A12'; rr(g, gx - (s.offer ? 76 : 100), y + 26, 54, 40, 8); g.fill();
      g.fillStyle = PAPER; g.font = sans(26, 800); g.textAlign = 'center'; g.fillText(d.grade, gx - (s.offer ? 49 : 73), y + 56); g.textAlign = 'left';
      if (!s.offer) { g.fillStyle = INK; g.font = mono(32, 700); g.textAlign = 'right'; g.fillText('$' + d.price, W - 48, y + 58); g.textAlign = 'left'; }
    }
    if (!s.offer) {
      g.fillStyle = INK; g.font = mono(24, 600); g.fillText(`${s.n} of 3 scanned`, 28, H - 40);
      return;
    }
    // offer panel
    const px = 604, pw = W - px - 24;
    g.fillStyle = INK; rr(g, px, 96, pw, H - 120, 14); g.fill();
    g.fillStyle = '#BDB3A3'; g.font = mono(22, 600); g.fillText('OFFER · 3 DEVICES', px + 24, 136);
    let y = 196;
    const rows = [['ASK', '$520', s.ask], ['OFFER', '$460', s.offerShown], ['COUNTER', '$490', s.counter]];
    rows.forEach(([lab, val, st]) => {
      if (!st) return;
      g.fillStyle = '#8E857A'; g.font = mono(20, 600); g.fillText(lab, px + 24, y);
      money(g, val, px + 150, y + 4, 38, st === 'struck' ? '#6E655A' : CREAM, st === 'struck');
      y += 62;
    });
    if (s.accepted) {
      g.fillStyle = s.paid ? GR : OR; rr(g, px + 18, H - 168, pw - 36, 128, 12); g.fill();
      g.fillStyle = PAPER; g.font = mono(22, 700); g.fillText(s.paid ? 'PAID · CASH' : 'ACCEPTED', px + 40, H - 128);
      g.font = mono(60, 800); g.fillText('$490', px + 40, H - 62);
    }
  }
  return { tex, draw, dispose() { tex.dispose(); } };
}
