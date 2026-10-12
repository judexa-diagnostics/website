// The shop: room shell, storefront + front door, back exit, counter, shelving,
// display case, lights. Units are metres. Camera side is +Z, the street is -Z.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export const ROOM = { x0: -3.3, x1: 2.5, z0: -3.6, z1: 3.6, h: 3.15 };
export const COUNTER = { x0: -0.95, x1: 1.38, z: 0, d: 0.62, h: 1.0 };
export const FRONT_DOOR = { x: -1.15, w: 1.0, h: 2.2 }; // in the back (street) wall, z = ROOM.z0
export const BACK_DOOR = { z: -0.3, w: 0.92, h: 2.1 }; // in the right wall, x = ROOM.x1

const INK = '#16130F', CREAM = '#F6F2EA', ORANGE = '#EB5E12';

function canvas(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
function rnd(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

function floorTex() {
  const t = canvas(1024, 1024, (g, w, h) => {
    const r = rnd(11);
    const n = 4, s = w / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const v = 150 + r() * 12;
      g.fillStyle = `rgb(${v},${v - 4},${v - 10})`; g.fillRect(i * s, j * s, s, s);
      for (let k = 0; k < 220; k++) { g.fillStyle = `rgba(${r() > 0.5 ? 255 : 90},${r() > 0.5 ? 250 : 85},240,${0.04 + r() * 0.05})`; g.fillRect(i * s + r() * s, j * s + r() * s, 2 + r() * 6, 2 + r() * 6); }
    }
    g.strokeStyle = 'rgba(70,62,52,0.55)'; g.lineWidth = 3;
    for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, h); g.stroke(); g.beginPath(); g.moveTo(0, i * s); g.lineTo(w, i * s); g.stroke(); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function woodTex(base = '#B98A5A') {
  const t = canvas(512, 256, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    const r = rnd(5);
    for (let i = 0; i < 140; i++) {
      const y = r() * h, a = 0.05 + r() * 0.09;
      g.strokeStyle = r() > 0.5 ? `rgba(60,35,15,${a})` : `rgba(255,230,190,${a})`;
      g.lineWidth = 0.6 + r() * 2.2;
      g.beginPath(); g.moveTo(0, y);
      for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.01 + i) * 3 + (r() - 0.5) * 2);
      g.stroke();
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function streetTex() {
  return canvas(1024, 512, (g, w, h) => {
    const sky = g.createLinearGradient(0, 0, 0, h * 0.5);
    sky.addColorStop(0, '#D9E4EA'); sky.addColorStop(1, '#F3EFE6');
    g.fillStyle = sky; g.fillRect(0, 0, w, h);
    const r = rnd(3);
    // buildings across the street
    let x = -20;
    while (x < w) {
      const bw = 120 + r() * 160, bh = 140 + r() * 120;
      const tone = 150 + r() * 60;
      g.fillStyle = `rgb(${tone},${tone - 10 - r() * 20},${tone - 25 - r() * 20})`;
      g.fillRect(x, h * 0.62 - bh, bw, bh + 10);
      g.fillStyle = 'rgba(40,50,60,0.35)';
      for (let yy = h * 0.62 - bh + 18; yy < h * 0.58; yy += 34) for (let xx = x + 12; xx < x + bw - 24; xx += 30) g.fillRect(xx, yy, 16, 20);
      x += bw + 6;
    }
    // sidewalk + road
    g.fillStyle = '#C9C2B6'; g.fillRect(0, h * 0.62, w, h * 0.12);
    g.fillStyle = '#8D8A86'; g.fillRect(0, h * 0.74, w, h * 0.26);
    g.fillStyle = '#E8E2D4'; for (let xx = 0; xx < w; xx += 90) g.fillRect(xx, h * 0.86, 50, 5);
    // a tree
    g.fillStyle = '#5E6E4A'; g.beginPath(); g.arc(w * 0.7, h * 0.4, 70, 0, 7); g.fill();
    g.fillStyle = '#4A3A2A'; g.fillRect(w * 0.7 - 6, h * 0.45, 12, h * 0.2);
  });
}

function signTex() {
  return canvas(1024, 192, (g, w, h) => {
    g.fillStyle = INK; g.fillRect(0, 0, w, h);
    g.fillStyle = ORANGE; g.fillRect(0, h - 14, w, 14);
    g.fillStyle = CREAM; g.font = "800 96px 'Archivo', system-ui, sans-serif"; g.textBaseline = 'middle';
    g.fillText('WE BUY PHONES', 44, h / 2 - 4);
    g.fillStyle = ORANGE; g.font = "600 34px 'JetBrains Mono', ui-monospace, monospace";
    g.textAlign = 'right'; g.fillText('CASH · SAME DAY', w - 40, h / 2 - 2);
  });
}

function posterTex() {
  return canvas(256, 360, (g, w, h) => {
    g.fillStyle = CREAM; g.fillRect(0, 0, w, h);
    g.fillStyle = ORANGE; g.fillRect(0, 0, w, 96);
    g.fillStyle = CREAM; g.font = "800 44px 'Archivo', system-ui, sans-serif"; g.fillText('TRADE', 18, 62);
    g.fillStyle = INK; g.font = "800 42px 'Archivo', system-ui, sans-serif"; g.fillText('IN.', 18, 150); g.fillText('TESTED.', 18, 196); g.fillText('PAID.', 18, 242);
    g.fillStyle = '#1E7A4A'; g.fillRect(18, 280, 120, 10);
    g.fillStyle = '#6E655A'; g.font = "600 18px 'JetBrains Mono', ui-monospace, monospace"; g.fillText('InPhox counter', 18, 330);
  });
}

function boxTex(seed) {
  const cols = ['#EB5E12', '#1E7A4A', '#16130F', '#F6F2EA', '#3A5A78', '#C9B48A', '#8A3B2E'];
  const r = rnd(seed * 7919 + 104729); r(); r(); r();
  return canvas(64, 96, (g, w, h) => {
    const c = cols[Math.floor(r() * cols.length)];
    g.fillStyle = c; g.fillRect(0, 0, w, h);
    g.fillStyle = c === '#F6F2EA' ? '#16130F' : '#F6F2EA';
    g.globalAlpha = 0.85; g.fillRect(8, 14, w - 16, 6); g.fillRect(8, 26, w - 30, 4);
    g.globalAlpha = 0.35; g.fillRect(12, 44, w - 24, h - 60);
  });
}

// Generic paper money (no real currency): sage note with a medallion and "100".
export function billTex() {
  return canvas(256, 108, (g, w, h) => {
    g.fillStyle = '#C9D2B8'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#6F7F5E'; g.lineWidth = 4; g.strokeRect(6, 6, w - 12, h - 12);
    g.lineWidth = 1; for (let i = 0; i < 18; i++) { g.beginPath(); g.ellipse(w / 2, h / 2, 30 + i * 5, 18 + i * 2.6, 0, 0, 7); g.strokeStyle = 'rgba(80,100,70,0.18)'; g.stroke(); }
    g.fillStyle = '#8FA07A'; g.beginPath(); g.ellipse(w / 2, h / 2, 26, 32, 0, 0, 7); g.fill();
    g.fillStyle = '#3E4B33'; g.font = "800 30px 'Archivo', system-ui, sans-serif"; g.fillText('100', 16, 40); g.textAlign = 'right'; g.fillText('100', w - 16, h - 16);
  });
}

function receiptTex() {
  return canvas(96, 256, (g, w, h) => {
    g.fillStyle = '#FBFAF6'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#5A544C';
    for (let y = 18; y < h - 10; y += 12) g.fillRect(10, y, 20 + ((y * 37) % 50), 3);
    g.fillRect(10, h - 40, w - 20, 6);
  });
}

const box = (w, h, d, mat, r = 0) => new THREE.Mesh(r ? new RoundedBoxGeometry(w, h, d, 2, r) : new THREE.BoxGeometry(w, h, d), mat);

export function buildStore(scene, { lite = false } = {}) {
  const disposables = [];
  const M = (o) => { const m = new THREE.MeshStandardMaterial(o); disposables.push(m); if (o.map) disposables.push(o.map); return m; };
  const room = new THREE.Group();
  scene.add(room);
  const { x0, x1, z0, z1, h } = ROOM;
  const W = x1 - x0, D = z1 - z0;

  // floor
  const ft = floorTex(); ft.repeat.set(W / 1.2, D / 1.2);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), M({ map: ft, roughness: 0.42, metalness: 0.0 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2); floor.receiveShadow = true;
  room.add(floor);
  // ceiling
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), M({ color: '#EEEAE2', roughness: 0.9 }));
  ceil.rotation.x = Math.PI / 2; ceil.position.set((x0 + x1) / 2, h, (z0 + z1) / 2); room.add(ceil);

  const wallMat = M({ color: '#D8D0C3', roughness: 0.92 });
  const darkWall = M({ color: '#2B2620', roughness: 0.85 });
  const trim = M({ color: '#3A342D', roughness: 0.6 });

  // back (street) wall with a storefront window + glass door
  const fd = FRONT_DOOR;
  const winX0 = x0 + 0.25, winX1 = fd.x + fd.w / 2 + 0.95;
  const addWall = (cx, cy, w, hh, mat = wallMat) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, hh, 0.12), mat); m.position.set(cx, cy, z0 - 0.06); m.receiveShadow = true; room.add(m); return m; };
  addWall((x0 + winX0) / 2, h / 2, winX0 - x0, h);
  addWall((winX1 + x1) / 2, h / 2, x1 - winX1, h, darkWall);
  addWall((winX0 + winX1) / 2, (2.45 + h) / 2, winX1 - winX0, h - 2.45);
  addWall((winX0 + winX1) / 2, 0.2, winX1 - winX0, 0.4, trim);
  // mullions
  for (const mx of [winX0, fd.x - fd.w / 2, fd.x + fd.w / 2, winX1]) { const m = box(0.06, 2.45, 0.1, trim); m.position.set(mx, 1.225, z0); room.add(m); }
  const header = box(winX1 - winX0, 0.06, 0.1, trim); header.position.set((winX0 + winX1) / 2, 2.45, z0); room.add(header);
  // glass
  const glass = new THREE.MeshPhysicalMaterial({ color: '#DDE7EA', roughness: 0.05, metalness: 0, transmission: 0, transparent: true, opacity: 0.16, depthWrite: false });
  disposables.push(glass);
  const pane = (cx, w) => { const g = new THREE.Mesh(new THREE.PlaneGeometry(w, 2.05), glass); g.position.set(cx, 0.4 + 2.05 / 2, z0 + 0.005); room.add(g); };
  pane((winX0 + fd.x - fd.w / 2) / 2, fd.x - fd.w / 2 - winX0);
  pane((fd.x + fd.w / 2 + winX1) / 2, winX1 - fd.x - fd.w / 2);
  // vinyl lettering on the window
  const vinyl = canvas(512, 96, (g, w, hh) => { g.fillStyle = 'rgba(246,242,234,0.9)'; g.font = "800 54px 'Archivo', system-ui, sans-serif"; g.fillText('InPhox', 10, 62); g.fillStyle = 'rgba(235,94,18,0.95)'; g.font = "600 24px 'JetBrains Mono', monospace"; g.fillText('BUY · SELL · REPAIR', 230, 60); });
  disposables.push(vinyl);
  const vm = new THREE.MeshBasicMaterial({ map: vinyl, transparent: true, depthWrite: false }); disposables.push(vm);
  const vin = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.26), vm); vin.position.set((winX0 + fd.x - fd.w / 2) / 2, 1.55, z0 + 0.01); room.add(vin);

  // door (pivot on its left jamb), opens inward
  const doorPivot = new THREE.Group(); doorPivot.position.set(fd.x - fd.w / 2 + 0.03, 0, z0 + 0.02); room.add(doorPivot);
  const dframe = M({ color: '#2C2824', roughness: 0.4, metalness: 0.5 });
  const dw = fd.w - 0.06;
  [[dw / 2, 0.04, dw, 0.08], [dw / 2, fd.h - 0.04 - 0.06, dw, 0.08], [0.04, fd.h / 2, 0.08, fd.h - 0.1], [dw - 0.04, fd.h / 2, 0.08, fd.h - 0.1], [dw / 2, 0.16, dw, 0.24]].forEach(([cx, cy, w, hh]) => {
    const b = box(w, hh, 0.05, dframe); b.position.set(cx, cy, 0); doorPivot.add(b);
  });
  const dg = new THREE.Mesh(new THREE.PlaneGeometry(dw - 0.12, fd.h - 0.4), glass); dg.position.set(dw / 2, fd.h / 2 + 0.06, 0); doorPivot.add(dg);
  const bar = box(0.03, 0.5, 0.05, M({ color: '#B8B4AC', metalness: 0.9, roughness: 0.3 })); bar.position.set(dw - 0.14, 1.05, 0.06); doorPivot.add(bar);

  // street behind the glass
  const st = streetTex(); disposables.push(st);
  const stm = new THREE.MeshBasicMaterial({ map: st, color: '#8d8d8d', toneMapped: false }); disposables.push(stm);
  const street = new THREE.Mesh(new THREE.PlaneGeometry(9, 4.5), stm); street.position.set(-1.0, 1.4, z0 - 3.2); room.add(street);
  const sidewalk = new THREE.Mesh(new THREE.PlaneGeometry(9, 3.2), M({ color: '#CFC8BC', roughness: 0.9 })); sidewalk.rotation.x = -Math.PI / 2; sidewalk.position.set(-1.0, 0.0, z0 - 1.6); sidewalk.receiveShadow = true; room.add(sidewalk);
  const outLight = new THREE.Mesh(new THREE.PlaneGeometry(5, 2.2), new THREE.MeshBasicMaterial({ color: '#FFF6E6', transparent: true, opacity: 0.18, depthWrite: false })); outLight.rotation.x = -Math.PI / 2; outLight.position.set(fd.x, 0.003, z0 + 1.1); room.add(outLight);

  // side walls
  const left = new THREE.Mesh(new THREE.PlaneGeometry(D, h), wallMat); left.rotation.y = Math.PI / 2; left.position.set(x0, h / 2, (z0 + z1) / 2); left.receiveShadow = true; room.add(left);
  // right wall with the back-exit opening
  const bd = BACK_DOOR;
  const rw = (za, zb, y0 = 0, y1 = h) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(zb - za, y1 - y0), wallMat); m.rotation.y = -Math.PI / 2; m.position.set(x1, (y0 + y1) / 2, (za + zb) / 2); m.receiveShadow = true; room.add(m); };
  rw(z0, bd.z - bd.w / 2); rw(bd.z + bd.w / 2, z1); rw(bd.z - bd.w / 2, bd.z + bd.w / 2, bd.h, h);
  // back corridor (dim) beyond the exit
  const corr = new THREE.Mesh(new THREE.BoxGeometry(2.6, bd.h + 0.2, bd.w + 0.6), M({ color: '#5A534A', roughness: 1, side: THREE.BackSide })); corr.position.set(x1 + 1.3, (bd.h + 0.2) / 2, bd.z); room.add(corr);
  // door frame + door (pivot on the camera-side jamb, swings into the corridor)
  const jamb = M({ color: '#3A342D', roughness: 0.5 });
  [[bd.z - bd.w / 2 - 0.03, 0.06, bd.h], [bd.z + bd.w / 2 + 0.03, 0.06, bd.h]].forEach(([z, w, hh]) => { const j = box(0.08, hh, w, jamb); j.position.set(x1 - 0.01, hh / 2, z); room.add(j); });
  const lint = box(0.08, 0.06, bd.w + 0.12, jamb); lint.position.set(x1 - 0.01, bd.h + 0.03, bd.z); room.add(lint);
  const exitPivot = new THREE.Group(); exitPivot.position.set(x1 + 0.02, 0, bd.z + bd.w / 2); room.add(exitPivot);
  const doorMat = M({ color: '#4B5560', roughness: 0.55, metalness: 0.2 });
  const exitDoor = box(0.045, bd.h - 0.02, bd.w - 0.02, doorMat, 0.01); exitDoor.position.set(0, bd.h / 2, -(bd.w - 0.02) / 2); exitDoor.castShadow = true; exitPivot.add(exitDoor);
  const kick = box(0.05, 0.25, bd.w - 0.08, M({ color: '#9AA0A6', metalness: 0.8, roughness: 0.35 })); kick.position.set(-0.004, 0.16, -(bd.w - 0.02) / 2); exitPivot.add(kick);
  const handle = box(0.06, 0.03, 0.14, M({ color: '#C8C4BC', metalness: 0.9, roughness: 0.25 })); handle.position.set(-0.04, 1.02, -bd.w + 0.14); exitPivot.add(handle);
  const staff = canvas(256, 96, (g, w, hh) => { g.fillStyle = '#F6F2EA'; g.fillRect(0, 0, w, hh); g.fillStyle = INK; g.font = "800 40px 'Archivo', system-ui, sans-serif"; g.fillText('STAFF ONLY', 16, 48); g.fillStyle = ORANGE; g.font = "600 20px 'JetBrains Mono', monospace"; g.fillText('TESTING · STOCK', 16, 80); });
  disposables.push(staff);
  const sm = new THREE.MeshBasicMaterial({ map: staff }); disposables.push(sm);
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.15), sm); plate.rotation.y = -Math.PI / 2; plate.position.set(-0.03, 1.55, -bd.w / 2); exitPivot.add(plate);
  const exitSign = box(0.04, 0.12, 0.34, new THREE.MeshBasicMaterial({ color: '#2FB070' })); exitSign.position.set(x1 - 0.04, bd.h + 0.22, bd.z); room.add(exitSign);

  // back wall interior (right of the window): sign + slatwall shelving
  const sgn = signTex(); disposables.push(sgn);
  const signW = Math.min(2.6, x1 - winX1 - 0.16);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(signW, signW * 0.1875), new THREE.MeshStandardMaterial({ map: sgn, emissive: '#ffffff', emissiveMap: sgn, emissiveIntensity: 0.35, roughness: 0.6 }));
  sign.position.set((winX1 + x1) / 2, 2.3, z0 + 0.01); room.add(sign);
  const shelfMat = M({ color: '#D9D2C5', roughness: 0.7 });
  const bx0 = winX1 + 0.2, bx1 = x1 - 0.2;
  for (let level = 0; level < 3; level++) {
    const y = 1.22 + level * 0.3;
    const s = box(bx1 - bx0, 0.025, 0.3, shelfMat); s.position.set((bx0 + bx1) / 2, y, z0 + 0.15); s.castShadow = !lite; s.receiveShadow = true; room.add(s);
    let x = bx0 + 0.08; let k = level * 31 + 7;
    while (x < bx1 - 0.12) {
      const bw = 0.09 + ((k * 13) % 5) * 0.012, bh = 0.16 + ((k * 7) % 4) * 0.025;
      const t = boxTex(k); disposables.push(t);
      const pk = box(bw, bh, 0.06, M({ map: t, roughness: 0.6 })); pk.position.set(x + bw / 2, y + 0.012 + bh / 2, z0 + 0.12); room.add(pk);
      x += bw + 0.035; k++;
    }
  }
  // poster on left of door
  const pt = posterTex(); disposables.push(pt);
  const poster = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.7), M({ map: pt, roughness: 0.7 })); poster.position.set(x0 + 0.002, 1.55, -1.3); poster.rotation.y = Math.PI / 2; room.add(poster);

  // glass display case along the back wall (customer side)
  const caseG = new THREE.Group(); caseG.position.set((bx0 + bx1) / 2, 0, z0 + 0.55); room.add(caseG);
  const cw = bx1 - bx0;
  const base = box(cw, 0.72, 0.55, M({ color: '#2B2620', roughness: 0.55 })); base.position.y = 0.36; base.castShadow = !lite; base.receiveShadow = true; caseG.add(base);
  const deck = box(cw - 0.04, 0.02, 0.5, M({ color: '#F1ECE2', roughness: 0.8 })); deck.position.y = 0.73; caseG.add(deck);
  const cg = new THREE.Mesh(new THREE.BoxGeometry(cw, 0.3, 0.55), glass); cg.position.y = 0.88; caseG.add(cg);
  const caseTop = box(cw, 0.012, 0.55, new THREE.MeshPhysicalMaterial({ color: '#E9F0F0', transparent: true, opacity: 0.25, roughness: 0.05 })); caseTop.position.y = 1.035; caseG.add(caseTop);
  const caseLight = new THREE.Mesh(new THREE.PlaneGeometry(cw - 0.1, 0.04), new THREE.MeshBasicMaterial({ color: '#FFF4DE' })); caseLight.rotation.x = Math.PI / 2; caseLight.position.set(0, 1.025, -0.2); caseG.add(caseLight);

  // ceiling light panels
  const panelMat = new THREE.MeshBasicMaterial({ color: '#FFFBF2', toneMapped: false }); disposables.push(panelMat);
  [[-1.6, -2.0], [0.9, -2.0], [-1.6, 0.6], [0.9, 0.6], [-1.6, 2.6], [0.9, 2.6]].forEach(([x, z]) => {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.3), panelMat); p.rotation.x = Math.PI / 2; p.position.set(x, h - 0.01, z); room.add(p);
  });

  // ---- the counter
  const C = COUNTER;
  const cGroup = new THREE.Group(); room.add(cGroup);
  const cl = C.x1 - C.x0, cx = (C.x0 + C.x1) / 2;
  const wt = woodTex(); wt.repeat.set(3, 1); disposables.push(wt);
  const top = box(cl + 0.06, 0.045, C.d + 0.08, M({ map: wt, color: '#E0C29E', roughness: 0.45 }), 0.01);
  top.position.set(cx, C.h - 0.0225, C.z); top.castShadow = true; top.receiveShadow = true; cGroup.add(top);
  const carc = M({ color: '#2F2A25', roughness: 0.6 });
  // customer-facing panel (front of the counter as seen by customers), orange stripe
  const front = box(cl, C.h - 0.045, 0.04, carc); front.position.set(cx, (C.h - 0.045) / 2, C.z - C.d / 2 + 0.02); front.castShadow = true; cGroup.add(front);
  const stripe = box(cl, 0.06, 0.042, M({ color: ORANGE, roughness: 0.5 })); stripe.position.set(cx, C.h - 0.16, C.z - C.d / 2 + 0.02); cGroup.add(stripe);
  // ends
  [C.x0 + 0.02, C.x1 - 0.02].forEach((x) => { const e = box(0.04, C.h - 0.045, C.d, carc); e.position.set(x, (C.h - 0.045) / 2, C.z); e.castShadow = true; cGroup.add(e); });
  // operator side: shelf + drawers (camera sees this)
  const inner = M({ color: '#3A342D', roughness: 0.7 });
  const shelf = box(cl - 0.08, 0.025, C.d - 0.06, inner); shelf.position.set(cx, 0.32, C.z); cGroup.add(shelf);
  const bottom = box(cl - 0.08, 0.025, C.d - 0.06, inner); bottom.position.set(cx, 0.06, C.z); cGroup.add(bottom);
  const backPanel = box(cl - 0.08, C.h - 0.1, 0.02, M({ color: '#24201C', roughness: 0.8 })); backPanel.position.set(cx, C.h / 2, C.z - C.d / 2 + 0.05); cGroup.add(backPanel);
  // stuff on the lower shelf
  for (let i = 0; i < 5; i++) { const t = boxTex(90 + i); disposables.push(t); const b = box(0.22, 0.14, 0.3, M({ map: t, roughness: 0.7 })); b.position.set(C.x0 + 0.3 + i * 0.38, 0.4, C.z + 0.02); b.rotation.y = (i % 2 ? 0.05 : -0.04); cGroup.add(b); }
  // cash drawer (slides toward +Z)
  const drawer = new THREE.Group(); drawer.position.set(0.55, C.h - 0.14, C.z + C.d / 2 - 0.22); cGroup.add(drawer);
  const dbody = box(0.42, 0.1, 0.42, M({ color: '#1F1C19', roughness: 0.5, metalness: 0.3 })); drawer.add(dbody);
  const dfront = box(0.44, 0.11, 0.02, M({ color: '#2A2622', roughness: 0.4, metalness: 0.4 })); dfront.position.z = 0.215; drawer.add(dfront);
  const tray = box(0.38, 0.01, 0.36, M({ color: '#3B3631', roughness: 0.6 })); tray.position.y = 0.045; drawer.add(tray);
  const btex = billTex(); disposables.push(btex);
  for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.025, 0.16), M({ map: btex, color: '#B9C7A4', roughness: 0.8 })); b.position.set(-0.13 + i * 0.087, 0.06, -0.02); drawer.add(b); }
  const drawerHousing = box(0.46, 0.13, 0.02, M({ color: '#161310', roughness: 0.6 })); drawerHousing.position.set(0.55, C.h - 0.14, C.z - 0.0); cGroup.add(drawerHousing);

  // ---- lights
  const hemi = new THREE.HemisphereLight('#FFF8EC', '#6A5D4C', 0.55); scene.add(hemi);
  const key = new THREE.DirectionalLight('#FFF3E2', 1.7);
  key.position.set(-1.2, 6, 2.2); key.target.position.set(0.2, 0, -0.4);
  key.castShadow = true;
  key.shadow.mapSize.set(lite ? 1024 : 2048, lite ? 1024 : 2048);
  const sc = key.shadow.camera; sc.left = -3.6; sc.right = 3.6; sc.top = 4.2; sc.bottom = -4.2; sc.near = 1; sc.far = 12;
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02; key.shadow.radius = 4;
  scene.add(key, key.target);
  const fill = new THREE.PointLight('#FFE8CC', 6, 7, 1.6); fill.position.set(0.3, 2.7, -1.2); scene.add(fill);
  const window = new THREE.DirectionalLight('#E8F0F6', 0.8); window.position.set(-1.5, 2.2, -8); window.target.position.set(0, 0.8, 0); scene.add(window, window.target);

  return {
    room, doorPivot, exitPivot, drawer, lights: [hemi, key, fill, window],
    dispose() {
      room.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
      disposables.forEach((d) => d.dispose && d.dispose());
      [hemi, key, fill, window].forEach((l) => { l.dispose && l.dispose(); scene.remove(l); if (l.target) scene.remove(l.target); });
      scene.remove(room);
    },
  };
}

/* ------------------------------------------------------------------ props */

export function buildProps(scene, receiptTexOut) {
  const disposables = [];
  const g = new THREE.Group(); scene.add(g);
  const M = (o) => { const m = new THREE.MeshStandardMaterial(o); disposables.push(m); return m; };
  const C = COUNTER;

  // POS monitor on a stand, facing the operator (+Z)
  const mon = new THREE.Group(); mon.position.set(0.95, C.h, C.z - 0.08); mon.rotation.y = -0.32; g.add(mon);
  const foot = box(0.2, 0.012, 0.16, M({ color: '#1A1816', roughness: 0.4, metalness: 0.4 }), 0.004); foot.position.y = 0.006; mon.add(foot);
  const neck = box(0.04, 0.2, 0.025, M({ color: '#1A1816', roughness: 0.4, metalness: 0.4 })); neck.position.set(0, 0.11, -0.03); mon.add(neck);
  const bezel = box(0.5, 0.32, 0.025, M({ color: '#141210', roughness: 0.35, metalness: 0.2 }), 0.008); bezel.position.set(0, 0.34, 0); bezel.rotation.x = -0.1; bezel.castShadow = true; mon.add(bezel);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.47, 0.29), new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }));
  screen.position.set(0, 0.34, 0.0135); screen.rotation.x = -0.1; mon.add(screen);
  // receipt printer
  const printer = new THREE.Group(); printer.position.set(1.17, C.h, C.z + 0.13); printer.rotation.y = -0.5; g.add(printer);
  const pb = box(0.13, 0.11, 0.17, M({ color: '#26231F', roughness: 0.45 }), 0.012); pb.position.y = 0.055; pb.castShadow = true; printer.add(pb);
  const rt = receiptTex(); disposables.push(rt);
  const paperMat = new THREE.MeshStandardMaterial({ map: rt, roughness: 0.85, side: THREE.DoubleSide }); disposables.push(paperMat);
  const paperPivot = new THREE.Group(); paperPivot.position.set(0, 0.112, -0.03); printer.add(paperPivot);
  const paperGeo = new THREE.PlaneGeometry(0.075, 1); paperGeo.translate(0, 0.5, 0);
  const paper = new THREE.Mesh(paperGeo, paperMat); paper.rotation.x = -0.25; paperPivot.add(paper);
  // handheld scanner (pistol grip), sits in a cradle near the operator's right
  const scanner = new THREE.Group();
  const sh = box(0.05, 0.05, 0.13, M({ color: '#2B2723', roughness: 0.5 }), 0.012); sh.position.set(0, 0, 0.0); scanner.add(sh);
  const sg = box(0.04, 0.1, 0.045, M({ color: '#2B2723', roughness: 0.5 }), 0.012); sg.position.set(0, -0.055, 0.045); sg.rotation.x = 0.3; scanner.add(sg);
  const nose = box(0.054, 0.035, 0.02, M({ color: ORANGE, roughness: 0.5 }), 0.006); nose.position.set(0, 0.0, -0.07); scanner.add(nose);
  scanner.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  g.add(scanner);
  const cradle = box(0.09, 0.03, 0.15, M({ color: '#1E1B18', roughness: 0.6 }), 0.008); cradle.position.set(1.18, C.h + 0.015, C.z + 0.2); g.add(cradle);
  const beamMat = new THREE.MeshBasicMaterial({ color: '#FF3B1F', transparent: true, opacity: 0.0, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending });
  disposables.push(beamMat);
  const beamGeo = new THREE.ConeGeometry(0.06, 1, 4, 1, true); beamGeo.translate(0, -0.5, 0); beamGeo.rotateX(Math.PI / 2); // tip at origin, fanning along -Z
  const beam = new THREE.Mesh(beamGeo, beamMat); beam.scale.set(1, 0.12, 0.25); scanner.add(beam); beam.position.z = -0.08;
  // grey tote for intake devices
  const tote = new THREE.Group();
  const tm = M({ color: '#5E6670', roughness: 0.65 });
  const tw = 0.36, td = 0.24, th = 0.12;
  const tb = box(tw, 0.012, td, tm); tb.position.y = 0.006; tote.add(tb);
  [[0, th / 2, td / 2, tw, th, 0.012], [0, th / 2, -td / 2, tw, th, 0.012], [tw / 2, th / 2, 0, 0.012, th, td], [-tw / 2, th / 2, 0, 0.012, th, td]].forEach(([x, y, z, w, hh, d]) => { const s = box(w, hh, d, tm); s.position.set(x, y, z); tote.add(s); });
  const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.05), new THREE.MeshBasicMaterial({ color: ORANGE })); tag.position.set(0, th * 0.6, td / 2 + 0.007); tote.add(tag);
  tote.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  g.add(tote);
  // bills (counted out one by one)
  const bt = billTex(); disposables.push(bt);
  const billMat = new THREE.MeshStandardMaterial({ map: bt, color: '#A9BC92', roughness: 0.85, side: THREE.DoubleSide }); disposables.push(billMat);
  const billGeo = new THREE.PlaneGeometry(0.156, 0.066); billGeo.rotateX(-Math.PI / 2);
  const bills = [];
  for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(billGeo, billMat); b.castShadow = true; b.receiveShadow = true; g.add(b); bills.push(b); }
  void receiptTexOut;
  return {
    group: g, mon, screen, scanner, beam, beamMat, tote, bills, paper, paperPivot,
    dispose() {
      g.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material && o.material.dispose) o.material.dispose(); });
      disposables.forEach((d) => d.dispose && d.dispose());
      scene.remove(g);
    },
  };
}
