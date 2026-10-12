// Procedural models for the story: phones, totes, racks, conveyors, the
// shipping box and bench tools. Units are centimetres.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { backTexture } from './textures.js';

export const PW = 7.2, PH = 14.7, PD = 0.82;

const geoCache = {};
function cached(key, make) { return geoCache[key] || (geoCache[key] = make()); }

// Rounded-rectangle plane with UVs that span 0..1 across the rectangle.
export function roundedRectGeo(w, h, r, seg = 6) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ShapeGeometry(s, seg);
  const uv = g.attributes.uv, pos = g.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) + w / 2) / w, (pos.getY(i) + h / 2) / h);
  return g;
}

export const MAT = {
  alu: new THREE.MeshStandardMaterial({ color: '#c9ccd1', metalness: 0.9, roughness: 0.32 }),
  darkMetal: new THREE.MeshStandardMaterial({ color: '#3a3b3f', metalness: 0.85, roughness: 0.35 }),
  black: new THREE.MeshStandardMaterial({ color: '#0c0c0d', metalness: 0.2, roughness: 0.5 }),
  lens: new THREE.MeshPhysicalMaterial({ color: '#0a0a12', metalness: 0.5, roughness: 0.05, clearcoat: 1 }),
  rubber: new THREE.MeshStandardMaterial({ color: '#1d1d1f', roughness: 0.85 }),
  cable: new THREE.MeshStandardMaterial({ color: '#f1efe9', roughness: 0.45, metalness: 0 }),
  plastic: new THREE.MeshStandardMaterial({ color: '#4a5a6a', roughness: 0.6 }),
  orange: new THREE.MeshStandardMaterial({ color: '#EB5E12', roughness: 0.55 }),
  steel: new THREE.MeshStandardMaterial({ color: '#8d9198', metalness: 0.8, roughness: 0.4 }),
  board: new THREE.MeshStandardMaterial({ color: '#1f3b2c', roughness: 0.6, metalness: 0.2 }),
  chip: new THREE.MeshStandardMaterial({ color: '#202124', roughness: 0.4, metalness: 0.4 }),
  copper: new THREE.MeshStandardMaterial({ color: '#b87333', roughness: 0.35, metalness: 0.9 })
};

// Models in the lot: [name, frame, back, kind]
export const PHONE_STYLES = [
  { name: 'iPhone 14 Pro', frame: '#6b5e7d', back: '#5a4d6e', kind: 'pro' },
  { name: 'iPhone 13', frame: '#1f2a36', back: '#232c38', kind: 'dual' },
  { name: 'Galaxy S23', frame: '#d8cfc0', back: '#e8dfcf', kind: 'galaxy' },
  { name: 'iPhone 12', frame: '#2e5a87', back: '#3a6c9e', kind: 'dual' },
  { name: 'Pixel 7', frame: '#2b2b2b', back: '#3b3d3f', kind: 'pixel' },
  { name: 'iPhone 14 Pro', frame: '#c8c4bd', back: '#e4e1dc', kind: 'pro' },
  { name: 'iPhone 11', frame: '#e6e3dc', back: '#f2efe8', kind: 'dual' },
  { name: 'Galaxy S22 Ultra', frame: '#4a2a2e', back: '#5e3238', kind: 'galaxy' },
  { name: 'iPhone 13', frame: '#8a1c26', back: '#a3222e', kind: 'dual' },
  { name: 'Pixel 8 Pro', frame: '#9fb8c8', back: '#b8cfdc', kind: 'pixel' },
  { name: 'iPhone 14 Pro', frame: '#2a2a2c', back: '#3a3a3d', kind: 'pro' },
  { name: 'iPhone 12', frame: '#e8e6e0', back: '#f4f2ee', kind: 'dual' }
];

export function makePhone(style, screenTex, { repairable = false, card = null, lite = false } = {}) {
  const g = new THREE.Group();
  const frameMat = new THREE.MeshStandardMaterial({ color: style.frame, metalness: 0.85, roughness: 0.28 });
  const body = new THREE.Mesh(cached('body', () => new RoundedBoxGeometry(PW, PH, PD, 5, 0.95)), frameMat);
  body.castShadow = true; body.receiveShadow = true;
  g.add(body);

  // Screen (front, +z)
  const bezel = new THREE.Mesh(cached('bezel', () => roundedRectGeo(PW - 0.16, PH - 0.16, 0.95)), MAT.black);
  bezel.position.z = PD / 2 + 0.005; g.add(bezel);
  const screenMat = new THREE.MeshStandardMaterial({ color: '#000', emissive: '#ffffff', emissiveMap: screenTex, emissiveIntensity: 0.95, roughness: 0.12, metalness: 0 });
  const screen = new THREE.Mesh(cached('screen', () => roundedRectGeo(PW - 0.55, PH - 0.55, 0.78)), screenMat);
  screen.position.z = PD / 2 + 0.012; g.add(screen);

  if (lite) {
    // Background phones (in totes / boxes): body + screen only, no shadows.
    body.castShadow = false;
    g.userData = { screen, screenMat, body, style };
    return g;
  }
  // Back assembly (-z) — hinged on the phone's left edge so a repair can lift it.
  const hinge = new THREE.Group();
  hinge.position.set(-PW / 2, 0, -PD / 2);
  const back = new THREE.Group(); back.position.set(PW / 2, 0, 0); hinge.add(back);
  const backMat = new THREE.MeshPhysicalMaterial({ map: backTexture(style.back), roughness: 0.22, metalness: 0.1, clearcoat: 0.8, clearcoatRoughness: 0.15 });
  const glass = new THREE.Mesh(cached('glass', () => roundedRectGeo(PW - 0.16, PH - 0.16, 0.95)), backMat);
  glass.rotation.y = Math.PI; glass.position.z = -0.008; back.add(glass);
  addCameras(back, style, frameMat, backMat);
  g.add(hinge);

  // Buttons + port
  const btn = cached('btn', () => new RoundedBoxGeometry(0.22, 1.6, 0.36, 2, 0.08));
  const b1 = new THREE.Mesh(btn, frameMat); b1.position.set(PW / 2 + 0.05, 3.2, 0); g.add(b1);
  const b2 = new THREE.Mesh(btn, frameMat); b2.position.set(-PW / 2 - 0.05, 3.6, 0); g.add(b2);
  const b3 = new THREE.Mesh(btn, frameMat); b3.position.set(-PW / 2 - 0.05, 1.6, 0); g.add(b3);
  const port = new THREE.Mesh(cached('port', () => new RoundedBoxGeometry(1.0, 0.2, 0.34, 2, 0.1)), MAT.black);
  port.position.set(0, -PH / 2 - 0.02, 0); g.add(port);

  const ud = { screen, screenMat, hinge, body, style };
  if (repairable) {
    // Interior visible once the back lifts: logic board + battery.
    const inner = new THREE.Group(); inner.position.z = -PD / 2 + 0.02; g.add(inner);
    const boardM = new THREE.Mesh(new THREE.BoxGeometry(PW - 1.0, 4.8, 0.12), MAT.board);
    boardM.position.set(0, PH / 2 - 3.4, -0.07); inner.add(boardM);
    for (let i = 0; i < 4; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 0.1), MAT.chip); c.position.set(-2 + i * 1.3, PH / 2 - 3 - (i % 2) * 1.6, -0.15); inner.add(c); }
    const battOld = makeBattery('#3a3a3a', '#E5574B'); battOld.position.set(0, -2.2, -0.12); inner.add(battOld);
    const battNew = makeBattery('#2a2a2a', '#3FB27F'); battNew.position.set(0, -2.2, -0.12); battNew.visible = false; inner.add(battNew);
    inner.visible = false;
    Object.assign(ud, { inner, battOld, battNew });
  }
  if (card) {
    // The device card is printed on a sheet that sits on the back of the phone;
    // flipping the phone over turns the card into the phone.
    const cm = new THREE.Mesh(cached('cardgeo', () => roundedRectGeo(PW + 0.2, PH + 0.2, 0.9)), new THREE.MeshStandardMaterial({ map: card, roughness: 0.6, emissive: '#ffffff', emissiveMap: card, emissiveIntensity: 0.35 }));
    cm.rotation.y = Math.PI; cm.position.z = -PD / 2 - 0.05; g.add(cm);
    ud.card = cm;
  }
  g.userData = ud;
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}

function makeBattery(color, stripe) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new RoundedBoxGeometry(PW - 1.4, 7.2, 0.3, 2, 0.12), new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.3 }));
  g.add(b);
  const s = new THREE.Mesh(new THREE.BoxGeometry(PW - 1.6, 0.5, 0.05), new THREE.MeshStandardMaterial({ color: stripe, emissive: stripe, emissiveIntensity: 0.4 }));
  s.position.z = -0.18; s.position.y = 2.6; g.add(s);
  return g;
}

function addCameras(back, style, frameMat, backMat) {
  const lensGeo = cached('lens', () => new THREE.CylinderGeometry(0.62, 0.62, 0.32, 28));
  const ringGeo = cached('ring', () => new THREE.CylinderGeometry(0.78, 0.78, 0.26, 28));
  const lens = (x, y, z = -0.3) => {
    const r = new THREE.Mesh(ringGeo, frameMat); r.rotation.x = Math.PI / 2; r.position.set(x, y, z + 0.04); back.add(r);
    const l = new THREE.Mesh(lensGeo, MAT.lens); l.rotation.x = Math.PI / 2; l.position.set(x, y, z - 0.03); back.add(l);
  };
  if (style.kind === 'pro' || style.kind === 'dual') {
    const bump = new THREE.Mesh(cached('bump', () => new RoundedBoxGeometry(3.5, 3.5, 0.3, 3, 0.7)), backMat);
    bump.position.set(-PW / 2 + 2.25, PH / 2 - 2.25, -0.14); back.add(bump);
    const cx = -PW / 2 + 2.25, cy = PH / 2 - 2.25;
    if (style.kind === 'pro') { lens(cx - 0.8, cy + 0.8); lens(cx - 0.8, cy - 0.8); lens(cx + 0.8, cy); }
    else { lens(cx - 0.75, cy + 0.75); lens(cx + 0.75, cy - 0.75); }
  } else if (style.kind === 'pixel') {
    const bar = new THREE.Mesh(cached('bar', () => new RoundedBoxGeometry(PW + 0.05, 1.9, 0.45, 3, 0.4)), frameMat);
    bar.position.set(0, PH / 2 - 3.2, -0.2); back.add(bar);
    lens(-1.6, PH / 2 - 3.2, -0.38); lens(0.0, PH / 2 - 3.2, -0.38);
  } else {
    lens(-PW / 2 + 1.5, PH / 2 - 1.6); lens(-PW / 2 + 1.5, PH / 2 - 3.4); lens(-PW / 2 + 1.5, PH / 2 - 5.2);
  }
}

export function makeTote(labelTex) {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color: '#3d5368', roughness: 0.7 });
  const L = 46, W = 30, H = 13, T = 0.9;
  const add = (w, h, d, x, y, z) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; g.add(b); };
  add(L, T, W, 0, T / 2, 0);
  add(L, H, T, 0, H / 2, W / 2); add(L, H, T, 0, H / 2, -W / 2);
  add(T, H, W, L / 2, H / 2, 0); add(T, H, W, -L / 2, H / 2, 0);
  if (labelTex) {
    const lab = new THREE.Mesh(new THREE.PlaneGeometry(14, 5.2), new THREE.MeshStandardMaterial({ map: labelTex, roughness: 0.8 }));
    lab.position.set(-12, H / 2 + 1, W / 2 + 0.5); g.add(lab);
  }
  return g;
}

export function makeRollerConveyor(length, width, { spacing = 7, startX = 0 } = {}) {
  const g = new THREE.Group();
  const n = Math.floor(length / spacing);
  const rg = new THREE.CylinderGeometry(2.2, 2.2, width, 14);
  rg.rotateX(Math.PI / 2);
  const rollers = new THREE.InstancedMesh(rg, MAT.steel, n);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < n; i++) { m4.makeTranslation(startX + i * spacing, -2.2, 0); rollers.setMatrixAt(i, m4); }
  rollers.receiveShadow = true;
  g.add(rollers);
  const railM = new THREE.MeshStandardMaterial({ color: '#d6a019', roughness: 0.5, metalness: 0.4 });
  [width / 2 + 1.5, -width / 2 - 1.5].forEach(z => {
    const r = new THREE.Mesh(new THREE.BoxGeometry(length, 6, 2.4), railM);
    r.position.set(startX + length / 2, -1.5, z); r.receiveShadow = true; g.add(r);
  });
  const legM = MAT.darkMetal;
  const legs = new THREE.InstancedMesh(new THREE.BoxGeometry(4, 88, 4), legM, Math.ceil(length / 120) * 2);
  let k = 0;
  for (let x = 0; x < length; x += 120) [width / 2, -width / 2].forEach(z => { m4.makeTranslation(startX + x, -48, z); legs.setMatrixAt(k++, m4); });
  legs.count = k; g.add(legs);
  return g;
}

// Pallet racks: blue uprights, orange beams, boxes on shelves.
export function makeRacks({ x0, x1, z, depth = 110, levels = 4, levelH = 110, boxTex }) {
  const g = new THREE.Group();
  const bays = Math.floor((x1 - x0) / 270);
  const upM = new THREE.MeshStandardMaterial({ color: '#2f4b6e', roughness: 0.6, metalness: 0.3 });
  const beamM = new THREE.MeshStandardMaterial({ color: '#d9531a', roughness: 0.5, metalness: 0.3 });
  const up = new THREE.InstancedMesh(new THREE.BoxGeometry(8, levels * levelH + 40, 8), upM, (bays + 1) * 2);
  const beam = new THREE.InstancedMesh(new THREE.BoxGeometry(270, 10, 5), beamM, bays * levels * 2);
  const boxM = new THREE.MeshStandardMaterial({ map: boxTex, roughness: 0.85 });
  const box = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), boxM, bays * levels * 4);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
  let iu = 0, ib = 0, ix = 0;
  for (let b = 0; b <= bays; b++) [z - depth / 2, z + depth / 2].forEach(zz => { m4.makeTranslation(x0 + b * 270, (levels * levelH + 40) / 2, zz); up.setMatrixAt(iu++, m4); });
  let seed = 3;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let b = 0; b < bays; b++) for (let l = 0; l < levels; l++) {
    const y = 20 + l * levelH;
    [z - depth / 2, z + depth / 2].forEach(zz => { m4.makeTranslation(x0 + b * 270 + 135, y, zz); beam.setMatrixAt(ib++, m4); });
    for (let k = 0; k < 4; k++) {
      if (rnd() < 0.18) continue;
      const w = 50 + rnd() * 18, h = 40 + rnd() * 45, d = 70 + rnd() * 25;
      p.set(x0 + b * 270 + 36 + k * 64, y + 5 + h / 2, z + (rnd() - 0.5) * 10); s.set(w, h, d);
      m4.compose(p, q, s); box.setMatrixAt(ix++, m4);
    }
  }
  box.count = ix;
  [up, beam, box].forEach(o => { o.castShadow = false; o.receiveShadow = true; g.add(o); });
  return g;
}

export function makeShippingBox(kraftTex, labelTex) {
  const g = new THREE.Group();
  const kt = kraftTex.clone(); kt.needsUpdate = true; kt.wrapS = kt.wrapT = THREE.RepeatWrapping; kt.repeat.set(0.6, 0.6);
  const m = new THREE.MeshStandardMaterial({ map: kt, color: '#d8b07c', roughness: 0.9 });
  const inside = new THREE.MeshStandardMaterial({ map: kt, color: '#b58b58', roughness: 0.95 });
  const L = 44, W = 22, H = 17, T = 0.5;
  const add = (w, h, d, x, y, z, mat = m) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; g.add(b); return b; };
  add(L, T, W, 0, T / 2, 0, inside);
  add(L, H, T, 0, H / 2, W / 2); add(L, H, T, 0, H / 2, -W / 2);
  add(T, H, W, L / 2, H / 2, 0); add(T, H, W, -L / 2, H / 2, 0);
  // dividers: 4 x 2 slots
  for (let i = 1; i < 4; i++) add(0.25, H - 3, W - 1, -L / 2 + i * (L / 4), (H - 3) / 2, 0, inside);
  add(L - 1, H - 3, 0.25, 0, (H - 3) / 2, 0, inside);
  // flaps hinge on top edges
  const flaps = [];
  const flap = (w, d, x, z, axis, sign) => {
    const h = new THREE.Group(); h.position.set(x, H, z); g.add(h);
    const f = new THREE.Mesh(new THREE.BoxGeometry(w, T, d), m); f.castShadow = true;
    if (axis === 'x') f.position.z = sign * d / 2; else f.position.x = sign * w / 2;
    h.add(f); h.userData = { axis, sign }; flaps.push(h); return h;
  };
  flap(L, W / 2, 0, W / 2, 'x', -1); flap(L, W / 2, 0, -W / 2, 'x', 1);
  flap(W / 2 - 0.5, W, -L / 2, 0, 'z', 1); flap(W / 2 - 0.5, W, L / 2, 0, 'z', -1);
  const tapeM = new THREE.MeshStandardMaterial({ color: '#c9a46a', roughness: 0.35, transparent: true, opacity: 0.85 });
  const tape = add(L + 1.6, 0.12, 5, 0, H + T + 0.1, 0, tapeM); tape.scale.x = 0.001; tape.visible = false;
  const label = new THREE.Mesh(new THREE.PlaneGeometry(15, 10), new THREE.MeshStandardMaterial({ map: labelTex, roughness: 0.7 }));
  label.rotation.x = -Math.PI / 2; label.position.set(L / 4, H + T + 0.25, W / 4 - 1); label.visible = false; g.add(label);
  g.userData = { flaps, tape, label, L, W, H };
  return g;
}

// Flat-lay bench tools.
export function makeTools() {
  const g = new THREE.Group();
  const handleM = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.45 });
  const screwdriver = (x, z, rot, c) => {
    const s = new THREE.Group();
    const h = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 10, 16), handleM(c)); s.add(h);
    const h2 = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.2, 2.5, 16), MAT.black); h2.position.y = -6.2; s.add(h2);
    const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 9, 10), MAT.steel); sh.position.y = -11.8; s.add(sh);
    s.rotation.set(0, rot, Math.PI / 2); s.position.set(x, 1.4, z); g.add(s);
  };
  screwdriver(-92, -26, 0.15, '#EB5E12'); screwdriver(-90, -18, 0.08, '#2f6fb5'); screwdriver(-88, -10, -0.05, '#222');
  // spudger + pry pick + tweezers
  const sp = new THREE.Mesh(new THREE.BoxGeometry(14, 0.5, 1.0), MAT.black); sp.position.set(-88, 0.4, 6); sp.rotation.y = 0.3; g.add(sp);
  const pick = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.2, 3), MAT.orange); pick.position.set(-78, 0.2, 14); g.add(pick);
  const tw = new THREE.Group();
  [0.09, -0.09].forEach(a => { const t = new THREE.Mesh(new THREE.BoxGeometry(12, 0.3, 0.6), MAT.steel); t.rotation.y = a; t.position.x = -6; tw.add(t); });
  tw.position.set(-82, 0.4, 24); tw.rotation.y = -0.5; g.add(tw);
  // suction cup
  const sc = new THREE.Group();
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.6, 1.0, 24), new THREE.MeshStandardMaterial({ color: '#2b6cb0', roughness: 0.5, transparent: true, opacity: 0.9 })); cup.position.y = 0.5; sc.add(cup);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.45, 10, 24), MAT.steel); ring.position.y = 2.6; sc.add(ring);
  sc.position.set(88, 0, 22); g.add(sc);
  // magnetic screw tray
  const tray = new THREE.Mesh(new RoundedBoxGeometry(20, 0.8, 14, 2, 0.4), new THREE.MeshStandardMaterial({ color: '#d9d4c8', roughness: 0.7 }));
  tray.position.set(92, 0.4, -14); g.add(tray);
  const screwG = new THREE.CylinderGeometry(0.25, 0.25, 0.5, 8);
  for (let i = 0; i < 14; i++) { const s = new THREE.Mesh(screwG, MAT.steel); s.position.set(84 + (i % 7) * 2.5, 1.0, -18 + Math.floor(i / 7) * 6 + (i % 2)); g.add(s); }
  // coffee mug (every bench has one)
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(4, 3.7, 9.5, 28), new THREE.MeshStandardMaterial({ color: '#F6F2EA', roughness: 0.4 }));
  mug.position.set(102, 4.75, 32); g.add(mug);
  const coffee = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.6, 0.2, 24), new THREE.MeshStandardMaterial({ color: '#3b2314', roughness: 0.2 }));
  coffee.position.set(102, 8.9, 32); g.add(coffee);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.55, 10, 20, Math.PI * 1.2), new THREE.MeshStandardMaterial({ color: '#F6F2EA', roughness: 0.4 }));
  handle.position.set(106, 5, 32); handle.rotation.z = -Math.PI * 0.6; g.add(handle);
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}

export function makeMacStudio() {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new RoundedBoxGeometry(19.7, 9.5, 19.7, 6, 2.2), MAT.alu); b.position.y = 4.75; g.add(b);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 0.4, 40), MAT.black); foot.position.y = 0.2; g.add(foot);
  for (let i = 0; i < 2; i++) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.35, 0.2), MAT.black); p.position.set(-6 + i * 1.6, 3.4, 9.86); g.add(p); }
  const slot = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.25, 0.2), MAT.black); slot.position.set(5, 3.4, 9.86); g.add(slot);
  const led = new THREE.Mesh(new THREE.CircleGeometry(0.18, 12), new THREE.MeshBasicMaterial({ color: '#ffffff' })); led.position.set(-8, 7.8, 9.87); g.add(led);
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}

// Testing stand: 12 slots, each with an LED that shows the result colour.
export function makeStand(n, spacing) {
  const g = new THREE.Group();
  const w = n * spacing + 6;
  const base = new THREE.Mesh(new RoundedBoxGeometry(w, 4, 12, 3, 1), MAT.darkMetal); base.position.y = 2; g.add(base);
  const back = new THREE.Mesh(new RoundedBoxGeometry(w, 12, 1.4, 3, 0.6), MAT.darkMetal); back.position.set(0, 8, -4.6); back.rotation.x = -0.18; g.add(back);
  const leds = [];
  for (let i = 0; i < n; i++) {
    const m = new THREE.MeshStandardMaterial({ color: '#222', emissive: '#000', emissiveIntensity: 1.6 });
    const l = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, 0.3), m); l.position.set(-w / 2 + 3 + spacing / 2 + i * spacing, 2.4, 6.05); g.add(l); leds.push(m);
  }
  g.userData.leds = leds;
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
