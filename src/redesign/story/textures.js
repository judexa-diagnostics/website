// Canvas-drawn textures for the story scene: phone screens, device cards,
// bench mat, sort table, shipping label. Everything is generated at runtime so
// no extra image files ship for these.
import * as THREE from 'three';

const INK = '#16130F', CREAM = '#F6F2EA', ORANGE = '#EB5E12', GREEN = '#3FB27F', RED = '#E5574B', MUTED = '#8E857A';
const MONO = "600 {s}px 'JetBrains Mono', ui-monospace, monospace";
const SANS = "{w} {s}px 'Archivo', system-ui, sans-serif";
const mono = (s, w = 600) => MONO.replace('600', w).replace('{s}', s);
const sans = (s, w = 700) => SANS.replace('{w}', w).replace('{s}', s);

let logoImg = null;
const logoWaiters = [];
export function whenLogo(cb) {
  if (logoImg && logoImg.complete && logoImg.naturalWidth) { cb(logoImg); return; }
  logoWaiters.push(cb);
  if (!logoImg) {
    logoImg = new Image();
    logoImg.onload = () => logoWaiters.splice(0).forEach(f => f(logoImg));
    logoImg.src = 'assets/inphox-logo.png';
  }
}

function canvasTex(w, h, draw, opts = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  if (opts.repeat) { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; }
  const redraw = () => { g.clearRect(0, 0, w, h); draw(g, w, h); tex.needsUpdate = true; };
  redraw();
  if (opts.logo) whenLogo(redraw);
  // Fonts load after first paint; redraw once they are ready so text is crisp.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(redraw);
  tex.userData.redraw = redraw;
  return tex;
}

function rr(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}

function barcode(g, x, y, w, h, seed = 7) {
  let s = seed;
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  let cx = x;
  while (cx < x + w) {
    const bw = 1 + Math.floor(rnd() * 3.2);
    if (rnd() > 0.42) g.fillRect(cx, y, bw, h);
    cx += bw + 1;
  }
}

// ---- Phone screens --------------------------------------------------------
const SW = 360, SH = 760;

function statusBar(g, dark) {
  g.fillStyle = dark ? '#F6F2EA' : INK;
  g.font = sans(22, 600);
  g.fillText('9:41', 40, 50);
  g.fillRect(SW - 86, 34, 30, 15);
  g.fillRect(SW - 52, 36, 4, 11);
  // dynamic island
  g.fillStyle = '#000';
  rr(g, SW / 2 - 58, 20, 116, 34, 17); g.fill();
}

export function screenTexture(kind, extra = {}) {
  return canvasTex(SW, SH, (g, w, h) => {
    if (kind === 'off') {
      const gr = g.createLinearGradient(0, 0, w, h);
      gr.addColorStop(0, '#0d0c0b'); gr.addColorStop(0.55, '#050505'); gr.addColorStop(1, '#16130f');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      // faint glass reflection
      g.fillStyle = 'rgba(255,255,255,0.05)';
      g.beginPath(); g.moveTo(0, h * 0.18); g.lineTo(w, 0); g.lineTo(w, h * 0.12); g.lineTo(0, h * 0.34); g.fill();
      g.fillStyle = '#000'; rr(g, w / 2 - 58, 20, 116, 34, 17); g.fill();
      return;
    }
    if (kind === 'boot') {
      g.fillStyle = '#0B0907'; g.fillRect(0, 0, w, h);
      statusBar(g, true);
      if (logoImg && logoImg.naturalWidth) g.drawImage(logoImg, w / 2 - 70, h / 2 - 130, 140, 140);
      g.fillStyle = CREAM; g.font = sans(34); g.textAlign = 'center';
      g.fillText('InPhox', w / 2, h / 2 + 50);
      g.font = mono(17, 500); g.fillStyle = MUTED;
      g.fillText('Reading device…', w / 2, h / 2 + 90);
      g.fillStyle = '#2A251F'; rr(g, 70, h / 2 + 120, w - 140, 8, 4); g.fill();
      g.fillStyle = ORANGE; rr(g, 70, h / 2 + 120, (w - 140) * 0.62, 8, 4); g.fill();
      g.textAlign = 'left';
      return;
    }
    if (kind === 'record') {
      g.fillStyle = CREAM; g.fillRect(0, 0, w, h);
      statusBar(g, false);
      if (logoImg && logoImg.naturalWidth) g.drawImage(logoImg, 30, 80, 46, 46);
      g.fillStyle = INK; g.font = sans(26); g.fillText('InPhox', 86, 113);
      g.font = mono(15, 600); g.fillStyle = '#1E7A4A'; g.fillText('IDENTIFIED · READY TO TEST', 30, 170);
      const rows = [['IMEI', '356798114520331'], ['Model', 'iPhone 14 Pro'], ['Storage', '256 GB'], ['Color', 'Deep Purple'], ['Carrier', 'Unlocked'], ['Battery', '91% · 312 cyc'], ['Find My', 'Off'], ['Parts', 'All genuine']];
      rows.forEach(([k, v], i) => {
        const y = 215 + i * 62;
        g.fillStyle = i % 2 ? '#FFFFFF' : '#EDE6DA'; g.fillRect(24, y - 34, w - 48, 54);
        g.fillStyle = MUTED; g.font = mono(15, 500); g.fillText(k, 40, y);
        g.fillStyle = INK; g.font = sans(19, 650); g.fillText(v, 140, y);
      });
      return;
    }
    if (kind === 'test') {
      g.fillStyle = '#0B0907'; g.fillRect(0, 0, w, h);
      statusBar(g, true);
      const pct = extra.pct ?? 0.6;
      g.lineWidth = 16; g.strokeStyle = '#2A251F';
      g.beginPath(); g.arc(w / 2, 300, 110, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = ORANGE; g.lineCap = 'round';
      g.beginPath(); g.arc(w / 2, 300, 110, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct); g.stroke();
      g.fillStyle = CREAM; g.font = sans(54); g.textAlign = 'center';
      g.fillText(Math.round(pct * 42) + '/42', w / 2, 318);
      g.font = mono(16, 500); g.fillStyle = MUTED; g.fillText('RUNNING CHECKS', w / 2, 460);
      g.textAlign = 'left';
      ['Display', 'Touch', 'Face ID', 'Speakers', 'Cameras'].forEach((t, i) => {
        const y = 520 + i * 42, done = i < pct * 6;
        g.fillStyle = done ? GREEN : '#3A342D'; g.beginPath(); g.arc(60, y - 6, 8, 0, 7); g.fill();
        g.fillStyle = done ? CREAM : MUTED; g.font = sans(19, 500); g.fillText(t, 82, y);
      });
      return;
    }
    if (kind === 'pass' || kind === 'fail' || kind === 'lock') {
      const col = kind === 'pass' ? GREEN : kind === 'fail' ? RED : '#E39B0B';
      g.fillStyle = '#0B0907'; g.fillRect(0, 0, w, h);
      statusBar(g, true);
      g.fillStyle = col; g.beginPath(); g.arc(w / 2, 290, 96, 0, 7); g.fill();
      g.strokeStyle = '#0B0907'; g.lineWidth = 18; g.lineCap = 'round'; g.lineJoin = 'round';
      g.beginPath();
      if (kind === 'pass') { g.moveTo(w / 2 - 42, 292); g.lineTo(w / 2 - 10, 324); g.lineTo(w / 2 + 46, 262); }
      else if (kind === 'fail') { g.moveTo(w / 2 - 36, 254); g.lineTo(w / 2 + 36, 326); g.moveTo(w / 2 + 36, 254); g.lineTo(w / 2 - 36, 326); }
      else { g.rect(w / 2 - 34, 282, 68, 52); g.moveTo(w / 2 - 22, 282); g.arc(w / 2, 270, 22, Math.PI, 0); }
      g.stroke();
      g.textAlign = 'center'; g.fillStyle = CREAM; g.font = sans(44);
      g.fillText(extra.title || (kind === 'pass' ? 'PASS' : kind === 'fail' ? 'FLAGGED' : 'LOCKED'), w / 2, 460);
      g.font = mono(18, 500); g.fillStyle = MUTED;
      g.fillText(extra.sub || (kind === 'pass' ? '42 / 42 checks' : 'Face ID'), w / 2, 500);
      g.font = sans(120, 800); g.fillStyle = col; g.globalAlpha = 0.18;
      g.fillText(extra.grade || 'A', w / 2, 680); g.globalAlpha = 1;
      g.textAlign = 'left';
    }
  }, { logo: kind === 'boot' || kind === 'record' });
}

// Back-glass texture with a subtle logo-less finish.
export function backTexture(color) {
  return canvasTex(256, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, shade(color, 18)); gr.addColorStop(0.5, color); gr.addColorStop(1, shade(color, -14));
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
}

export function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt)), gg = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt)), b = Math.max(0, Math.min(255, (n & 255) + amt));
  return '#' + ((r << 16) | (gg << 8) | b).toString(16).padStart(6, '0');
}

// ---- Device card (flips into a phone in scene 4) ------------------------
export function cardTexture(d) {
  return canvasTex(400, 820, (g, w, h) => {
    g.fillStyle = '#211D18'; rr(g, 0, 0, w, h, 34); g.fill();
    g.strokeStyle = '#3A342D'; g.lineWidth = 4; rr(g, 2, 2, w - 4, h - 4, 32); g.stroke();
    g.fillStyle = CREAM; g.font = sans(40); g.fillText(d.model, 30, 80);
    g.fillStyle = MUTED; g.font = mono(24, 500); g.fillText(d.storage + ' · ' + d.color, 30, 122);
    let x = 30;
    [d.grade, d.carrier].forEach((t, i) => {
      g.font = sans(24, 600); const tw = g.measureText(t).width + 26;
      g.strokeStyle = i === 0 ? ORANGE : '#6B6257'; g.lineWidth = 3; rr(g, x, 150, tw, 42, 8); g.stroke();
      g.fillStyle = i === 0 ? ORANGE : '#D9D0C2'; g.fillText(t, x + 13, 180); x += tw + 12;
    });
    g.fillStyle = MUTED; g.font = mono(22, 500); g.fillText('IMEI', 30, 250);
    g.fillStyle = CREAM; g.font = mono(27, 600); g.fillText(d.imei, 30, 286);
    g.fillStyle = '#2A251F'; rr(g, 30, 330, w - 60, 16, 8); g.fill();
    g.fillStyle = d.col; rr(g, 30, 330, w - 60, 16, 8); g.fill();
    g.fillStyle = d.col; g.font = sans(36); g.fillText(d.result, 30, 410);
    g.fillStyle = MUTED; g.font = mono(22, 500); g.fillText(d.sub, 30, 450);
    g.fillStyle = '#F6F2EA'; rr(g, 30, 520, w - 60, 200, 16); g.fill();
    g.fillStyle = INK; barcode(g, 56, 548, w - 112, 110, d.imei.length * 7 + d.imei.charCodeAt(13));
    g.font = mono(22, 600); g.fillText(d.imei, 56, 696);
    g.fillStyle = MUTED; g.font = mono(22, 500); g.fillText('→ ' + d.lane, 30, 780);
  });
}

// ---- Bench mat: dark slate cutting mat with a grid -------------------------
export function matTexture() {
  return canvasTex(1024, 640, (g, w, h) => {
    g.fillStyle = '#2C3E4A'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,255,255,0.08)'; g.lineWidth = 1;
    for (let x = 0; x < w; x += 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let y = 0; y < h; y += 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.strokeStyle = 'rgba(255,255,255,0.18)';
    for (let x = 0; x < w; x += 80) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let y = 0; y < h; y += 80) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.strokeStyle = 'rgba(235,94,18,0.75)'; g.lineWidth = 3; g.setLineDash([14, 10]);
    // device outline sized to a phone (mat is 124 x 76 cm on 1024 x 640 px)
    const ox = w / 2, oy = h / 2 + 1.6 * 8.4;
    rr(g, ox - 44, oy - 80, 88, 160, 14); g.stroke(); g.setLineDash([]);
    g.fillStyle = 'rgba(246,242,234,0.5)'; g.font = mono(11, 600);
    g.fillText('BENCH 2 · ESD SAFE', 18, h - 16);
    g.textAlign = 'center'; g.fillText('PLACE DEVICE', ox, oy + 98); g.textAlign = 'left';
    // ruler ticks along the top edge
    g.fillStyle = 'rgba(246,242,234,0.35)';
    for (let x = 0; x < w; x += 8.26) g.fillRect(x, 0, 1, (Math.round(x / 8.26) % 10 === 0) ? 14 : 6);
  });
}

// ---- Sort table with five lanes ----------------------------------------
export const LANES = [
  { key: 'repair', name: 'REPAIR', dest: 'Bench R-2', col: '#E5574B' },
  { key: 'qc', name: 'QC BENCH', dest: 'Second look', col: '#E39B0B' },
  { key: 'storage', name: 'STORAGE', dest: 'WH-A · C-14', col: '#3FB27F' },
  { key: 'sales', name: 'SALES FLOOR', dest: 'Elm St. Store', col: '#6FA8DC' },
  { key: 'ship', name: 'SHIPMENT', dest: 'SO-10422', col: '#EB5E12' }
];
// Table spans x [-200,200], z [-130,130] (local). Texture maps 1:1 at 4 px/cm.
export function sortTableTexture() {
  const S = 4;
  return canvasTex(400 * S, 260 * S, (g, w, h) => {
    g.fillStyle = '#26221D'; g.fillRect(0, 0, w, h);
    // subtle wood-ish / rubber noise
    for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * 0.025})`; g.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 30, 1); }
    const X = x => (x + 200) * S, Z = z => (z + 130) * S;
    // tray zone outline
    g.strokeStyle = 'rgba(246,242,234,0.25)'; g.lineWidth = 3; g.setLineDash([18, 12]);
    rr(g, X(-62), Z(-118), 124 * S, 92 * S, 24); g.stroke(); g.setLineDash([]);
    g.fillStyle = 'rgba(246,242,234,0.5)'; g.font = mono(30, 600);
    g.fillText('INTAKE TRAY · 12 TESTED', X(-62), Z(-122));
    LANES.forEach((l, i) => {
      const cx = -152 + i * 76, x0 = X(cx - 32), z0 = Z(28);
      // arrow from tray to lane
      g.strokeStyle = l.col; g.globalAlpha = 0.55; g.lineWidth = 6; g.setLineDash([22, 16]);
      g.beginPath(); g.moveTo(X(cx * 0.25), Z(-22)); g.quadraticCurveTo(X(cx * 0.6), Z(0), X(cx), Z(22)); g.stroke(); g.setLineDash([]);
      g.globalAlpha = 1;
      g.fillStyle = l.col; g.globalAlpha = 0.12; rr(g, x0, z0, 64 * S, 92 * S, 18); g.fill(); g.globalAlpha = 1;
      g.strokeStyle = l.col; g.lineWidth = 5; rr(g, x0, z0, 64 * S, 92 * S, 18); g.stroke();
      g.fillStyle = l.col; g.fillRect(x0, z0 + 92 * S - 54, 64 * S, 54);
      g.fillStyle = '#16130F'; g.font = sans(30, 800); g.fillText(l.name, x0 + 16, z0 + 92 * S - 16);
      g.fillStyle = 'rgba(246,242,234,0.6)'; g.font = mono(24, 500); g.fillText('→ ' + l.dest, x0 + 4, z0 + 92 * S + 40);
    });
  });
}

export function shippingLabelTexture() {
  return canvasTex(600, 400, (g, w, h) => {
    g.fillStyle = '#FBFAF6'; g.fillRect(0, 0, w, h);
    g.fillStyle = INK; g.font = sans(30, 800); g.fillText('PRIORITY', 24, 46);
    g.font = mono(18, 500); g.fillText('FROM  Northgate Wireless · Dallas TX', 24, 84);
    g.fillText('TO    Ortega Mobile Wholesale', 24, 112);
    g.fillText('      Shoreditch, London UK', 24, 136);
    g.fillRect(24, 154, w - 48, 4);
    barcode(g, 24, 176, w - 48, 120, 31);
    g.font = mono(22, 600); g.fillText('SO-10422 · 12 units · 3.4 kg', 24, 334);
    g.fillStyle = ORANGE; g.fillRect(24, 352, 120, 24);
    if (logoImg && logoImg.naturalWidth) g.drawImage(logoImg, w - 84, h - 84, 60, 60);
  }, { logo: true });
}

export function toteLabelTexture(text) {
  return canvasTex(256, 96, (g, w, h) => {
    g.fillStyle = '#FBFAF6'; g.fillRect(0, 0, w, h);
    g.fillStyle = INK; g.font = mono(26, 700); g.fillText(text, 14, 38);
    barcode(g, 14, 50, w - 28, 34, text.length * 13);
  });
}

export function rackBoxTexture(seed) {
  return canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = '#B98A55'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, h * 0.44, w, h * 0.12);
    g.fillStyle = '#FBFAF6'; g.fillRect(14 + (seed % 3) * 10, 18, 46, 28);
    g.fillStyle = INK; barcode(g, 18 + (seed % 3) * 10, 24, 38, 14, seed);
  });
}

export function floorLinesTexture() {
  // Long runway / conveyor floor markings, tiles along x.
  return canvasTex(512, 256, (g, w, h) => {
    g.fillStyle = '#2B2722'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#E3B21B'; g.fillRect(0, 20, w, 10); g.fillRect(0, h - 30, w, 10);
    g.fillStyle = 'rgba(246,242,234,0.6)';
    for (let x = 0; x < w; x += 128) g.fillRect(x, h / 2 - 4, 64, 8);
  }, { repeat: true });
}

export function glowSprite(color = '#EB5E12') {
  return canvasTex(64, 64, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.25, color); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
}
