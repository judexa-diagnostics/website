// Industries tab 3: "Buy, sell & trade-in shops".
// An x-ray cutaway of a small phone store at dusk. Roof gone, the front and
// right walls cut to sills with ghosted outlines, so the camera can orbit the
// whole loop: a walk-in sells a bag of phones at the counter (each IMEI is
// scanned with a phone camera), the offer is accepted, the phones are tested
// at a desk station in the back room and binned on labelled shelves, a
// wholesale order is scanned into a box, taped, labelled, and a courier van
// collects it out front. Units are centimetres; the loop is 40 s.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { loadPeople, LOOKS } from '../../people/people.js';
import { makePhone, makeShippingBox, makeStand, makeTote, PHONE_STYLES, PH, PD } from '../../story/models.js';
import { screenTexture } from '../../story/textures.js';

const INK = '#16130F', CREAM = '#F6F2EA', ORANGE = '#EB5E12', GREEN = '#1E7A4A', MUTED = '#8E857A', LINE = '#D9D0C2';
const MONO = (s, w = 600) => `${w} ${s}px 'JetBrains Mono', ui-monospace, monospace`;
const SANS = (s, w = 700) => `${w} ${s}px 'Archivo', system-ui, sans-serif`;
const DUR = 40;
const PD_HALF = 0.5;
const TAU = Math.PI * 2;

const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = v => { v = clamp01(v); return v * v * (3 - 2 * v); };
const lerp = (a, b, k) => a + (b - a) * k;
const win = (t, a, b) => clamp01((t - a) / (b - a));
function lerpAngle(a, b, k) { let d = ((b - a + Math.PI) % TAU + TAU) % TAU - Math.PI; return a + d * k; }
// Fade in over `fi`, hold, fade out over `fo` inside [a, b].
const pulse = (t, a, b, fi = 0.3, fo = 0.35) => (t < a || t > b ? 0 : Math.min(smooth((t - a) / fi), smooth((b - t) / fo)));

function rr(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
function barcode(g, x, y, w, h, seed = 7) {
  let s = seed; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  for (let cx = x; cx < x + w;) { const bw = 1 + Math.floor(rnd() * 3.2); if (rnd() > 0.42) g.fillRect(cx, y, bw, h); cx += bw + 1; }
}
function check(g, cx, cy, r, bg, fg) {
  g.fillStyle = bg; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill();
  g.strokeStyle = fg; g.lineWidth = r * 0.28; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(cx - r * 0.42, cy + r * 0.02); g.lineTo(cx - r * 0.1, cy + r * 0.34); g.lineTo(cx + r * 0.45, cy - r * 0.3); g.stroke();
}

export default async function create(ctx) {
  const small = !!ctx.isSmall;
  const owned = []; // textures we created (materials/geometries are swept from the scene)
  const extra = []; // geometries/materials not attached to the scene graph

  function ctex(w, h, draw, { repeat = false } = {}) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d');
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    if (repeat) tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    const redraw = (...a) => { g.clearRect(0, 0, w, h); draw(g, w, h, ...a); tex.needsUpdate = true; };
    redraw();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => redraw());
    tex.userData.redraw = redraw;
    owned.push(tex);
    return tex;
  }

  // ---------------------------------------------------------------- scene
  const scene = new THREE.Scene();
  const BG = new THREE.Color('#1a1611');
  scene.background = BG;
  scene.fog = new THREE.Fog(BG, 2600, 5200);
  const camera = new THREE.PerspectiveCamera(small ? 40 : 34, ctx.width / ctx.height, 5, 8000);

  scene.add(new THREE.HemisphereLight('#ffe9cf', '#2a2018', 0.75));
  const key = new THREE.DirectionalLight('#ffd9ad', 2.1);
  key.position.set(700, 1300, 900); key.target.position.set(0, 0, 40);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -760, right: 760, top: 720, bottom: -720, near: 300, far: 3200 });
  key.shadow.bias = -0.0004; key.shadow.normalBias = 1.2; key.shadow.radius = 4;
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight('#9fb6d8', 0.35); fill.position.set(-900, 600, -400); scene.add(fill);
  const warm = (x, y, z, i, d = 700) => { const l = new THREE.PointLight('#ffb36b', i, d, 1.6); l.position.set(x, y, z); scene.add(l); return l; };
  warm(-100, 240, 120, 2.6e4); warm(300, 240, 190, 1.6e4); warm(-320, 240, -150, 1.4e4); warm(250, 240, -170, 1.4e4);
  const streetLamp = new THREE.PointLight('#ffc98a', 2.2e4, 900, 1.6); streetLamp.position.set(-330, 330, 400); scene.add(streetLamp);

  // ---------------------------------------------------------------- materials & textures
  const std = (o) => new THREE.MeshStandardMaterial(o);
  const woodTex = ctex(1024, 1024, (g, w, h) => {
    const rows = 16, rh = h / rows; let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let r = 0; r < rows; r++) {
      let x = -rnd() * 300;
      while (x < w) {
        const len = 220 + rnd() * 260, base = 150 + rnd() * 26;
        g.fillStyle = `rgb(${base + 40},${base - 2},${base - 46})`; g.fillRect(x, r * rh, len, rh);
        for (let k = 0; k < 9; k++) { g.fillStyle = `rgba(90,55,25,${0.05 + rnd() * 0.06})`; g.fillRect(x, r * rh + rnd() * rh, len, 1 + rnd() * 2); }
        g.fillStyle = 'rgba(40,24,10,0.55)'; g.fillRect(x, r * rh, 2, rh);
        x += len;
      }
      g.fillStyle = 'rgba(40,24,10,0.5)'; g.fillRect(0, r * rh, w, 2);
    }
  }, { repeat: true });
  woodTex.repeat.set(2.2, 1.5);
  const concreteTex = ctex(512, 512, (g, w, h) => {
    g.fillStyle = '#8f8a82'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 4000; i++) { const v = Math.random(); g.fillStyle = `rgba(${v > 0.5 ? 255 : 0},${v > 0.5 ? 250 : 0},${v > 0.5 ? 240 : 0},${Math.random() * 0.05})`; g.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 6, 2 + Math.random() * 6); }
    g.strokeStyle = 'rgba(0,0,0,0.18)'; g.lineWidth = 2; g.strokeRect(0, 0, w, h);
  }, { repeat: true });
  concreteTex.repeat.set(4, 2.5);
  const sidewalkTex = ctex(512, 256, (g, w, h) => {
    g.fillStyle = '#7d7871'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * 0.04})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    g.strokeStyle = 'rgba(30,26,22,0.45)'; g.lineWidth = 3;
    for (let x = 0; x <= w; x += 128) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    g.beginPath(); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke();
  }, { repeat: true });
  sidewalkTex.repeat.set(12, 1);
  const asphaltTex = ctex(512, 512, (g, w, h) => {
    g.fillStyle = '#2b2824'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 6000; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`; g.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5); }
    g.fillStyle = 'rgba(232,206,150,0.75)'; g.fillRect(0, h * 0.62, w * 0.55, 10);
  }, { repeat: true });
  asphaltTex.repeat.set(9, 1);

  const M = {
    wall: std({ color: '#efe7da', roughness: 0.92 }),
    wallEdge: std({ color: '#d8ccb9', roughness: 0.9 }),
    wood: std({ map: woodTex, roughness: 0.62 }),
    concrete: std({ map: concreteTex, color: '#c9c3b8', roughness: 0.8 }),
    walnut: std({ color: '#5a3b24', roughness: 0.55 }),
    oak: std({ color: '#b98d5c', roughness: 0.6 }),
    ink: std({ color: '#25211c', roughness: 0.55, metalness: 0.2 }),
    steel: std({ color: '#5b5f66', roughness: 0.45, metalness: 0.75 }),
    shelf: std({ color: '#c9c6bf', roughness: 0.6, metalness: 0.3 }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#cfe3e6', roughness: 0.05, metalness: 0, transparent: true, opacity: 0.16, depthWrite: false, clearcoat: 1, side: THREE.DoubleSide }),
    felt: std({ color: '#efe6d6', roughness: 0.95 }),
    bin: std({ color: '#44596d', roughness: 0.7 }),
    binHot: std({ color: '#44596d', roughness: 0.7, emissive: ORANGE, emissiveIntensity: 0 }),
    kraft: std({ color: '#c39a66', roughness: 0.9 }),
    orange: std({ color: ORANGE, roughness: 0.5 }),
    cream: std({ color: CREAM, roughness: 0.6 }),
    tire: std({ color: '#141312', roughness: 0.9 }),
    van: std({ color: '#ecebe6', roughness: 0.35, metalness: 0.25 }),
    vanGlass: std({ color: '#1d2329', roughness: 0.08, metalness: 0.6 }),
    plant: std({ color: '#3e6b45', roughness: 0.8 })
  };
  const ghostLine = new THREE.LineBasicMaterial({ color: ORANGE, transparent: true, opacity: 0.55, toneMapped: false, depthWrite: false });
  const ghostFill = new THREE.MeshBasicMaterial({ color: '#ffb27a', transparent: true, opacity: 0.035, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });

  const box = (w, h, d, mat, x, y, z, parent = scene, { cast = true, recv = true, round = 0 } = {}) => {
    const geo = round ? new RoundedBoxGeometry(w, h, d, 2, round) : new THREE.BoxGeometry(w, h, d);
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = recv; parent.add(m); return m;
  };
  const plane = (w, h, mat, parent = scene) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); parent.add(m); return m; };
  // Ghosted x-ray outline of a wall or volume.
  const ghost = (w, h, d, x, y, z, fillIt = true) => {
    const g = new THREE.BoxGeometry(w, h, d);
    const l = new THREE.LineSegments(new THREE.EdgesGeometry(g), ghostLine); l.position.set(x, y, z); scene.add(l);
    if (fillIt) { const f = new THREE.Mesh(g, ghostFill); f.position.set(x, y, z); f.renderOrder = 2; scene.add(f); } else extra.push(g);
  };

  // ---------------------------------------------------------------- ground, street
  const ground = plane(9000, 9000, std({ color: '#221d17', roughness: 1 })); ground.rotation.x = -Math.PI / 2; ground.position.y = -2; ground.receiveShadow = true;
  const sidewalk = box(3000, 4, 140, std({ map: sidewalkTex, roughness: 0.9 }), 0, 0, 370, scene, { cast: false });
  box(3000, 14, 8, std({ color: '#9a948b', roughness: 0.8 }), 0, 0, 440, scene, { cast: false });
  const street = plane(3000, 240, std({ map: asphaltTex, roughness: 0.85 })); street.rotation.x = -Math.PI / 2; street.position.set(0, -1, 560); street.receiveShadow = true;
  // neighbouring lots, dim blocks so the store reads as one shop on a street
  box(500, 330, 600, std({ color: '#3a322a', roughness: 0.95 }), -760, 165, 0, scene, { cast: false });
  box(500, 260, 600, std({ color: '#342d26', roughness: 0.95 }), 760, 130, 0, scene, { cast: false });
  ghost(500, 330, 600, -760, 165, 0, false); ghost(500, 260, 600, 760, 130, 0, false);
  // street lamp + planter + A-frame sign
  box(8, 340, 8, M.ink, -330, 170, 410);
  box(70, 6, 10, M.ink, -300, 338, 410);
  const lampHead = box(30, 8, 20, std({ color: '#fff2d6', emissive: '#ffd59a', emissiveIntensity: 2 }), -270, 332, 410, scene, { cast: false });
  box(110, 40, 40, std({ color: '#5d5248', roughness: 0.9 }), -400, 22, 340);
  for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(22 + (i % 3) * 5, 1), M.plant); b.position.set(-440 + i * 16, 50 + (i % 2) * 10, 340 + (i % 2 ? 8 : -6)); b.castShadow = true; scene.add(b); }
  const aTex = ctex(256, 384, (g, w, h) => {
    g.fillStyle = INK; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(246,242,234,0.25)'; g.lineWidth = 4; g.strokeRect(10, 10, w - 20, h - 20);
    g.fillStyle = CREAM; g.font = SANS(44, 800); g.textAlign = 'center';
    g.fillText('WE BUY', w / 2, 100); g.fillText('PHONES', w / 2, 150);
    g.fillStyle = ORANGE; g.fillRect(50, 175, w - 100, 6);
    g.fillStyle = CREAM; g.font = MONO(22, 600);
    g.fillText('Cash or credit', w / 2, 225); g.fillText('in minutes', w / 2, 258);
    g.font = MONO(20, 500); g.fillStyle = '#B9AE9E'; g.fillText('Trade-ins welcome', w / 2, 330);
  });
  const aframe = new THREE.Group(); aframe.position.set(-150, 2, 365); aframe.rotation.y = 0.35; scene.add(aframe);
  [1, -1].forEach(s => {
    const p = new THREE.Mesh(new THREE.BoxGeometry(56, 84, 2), [M.ink, M.ink, M.ink, M.ink, std({ map: aTex, roughness: 0.7 }), std({ map: aTex, roughness: 0.7 })]);
    p.position.set(0, 42, s * 10); p.rotation.x = s * 0.14; p.castShadow = true; aframe.add(p);
  });

  // ---------------------------------------------------------------- the store shell
  const SX = 450, SZ = 300, WH = 290, T = 12;
  const floorF = box(2 * SX, 4, SZ, M.wood, 0, 2, SZ / 2, scene, { cast: false });
  const floorB = box(2 * SX, 4, SZ, M.concrete, 0, 2, -SZ / 2, scene, { cast: false });
  // solid back + left walls
  box(2 * SX + T, WH, T, M.wall, 0, WH / 2, -SZ - T / 2);
  box(T, WH, 2 * SZ + T, M.wall, -SX - T / 2, WH / 2, 0);
  box(T + 2, 14, 2 * SZ + T, M.wallEdge, -SX - T / 2, WH, 0, scene, { cast: false });
  box(2 * SX + T, 14, T + 2, M.wallEdge, 0, WH, -SZ - T / 2, scene, { cast: false });
  // cut walls: right wall + front facade (sills), partition (half height, doorway x 60..150)
  const SILL = 46;
  box(T, SILL, 2 * SZ + T, M.wall, SX + T / 2, SILL / 2, 0);
  ghost(T, WH - SILL, 2 * SZ + T, SX + T / 2, SILL + (WH - SILL) / 2, 0);
  box(450 - 0, SILL, T, M.wall, -SX + 225 - 30, SILL / 2, SZ + T / 2); // x -450..-30
  box(360, SILL, T, M.wall, 270, SILL / 2, SZ + T / 2); // x 90..450
  ghost(2 * SX, WH - SILL, T, 0, SILL + (WH - SILL) / 2, SZ + T / 2);
  ghost(120, 230, T, 30, 115, SZ + T / 2, false); // door frame
  const PART = 100;
  box(510, PART, T, M.wall, -195, PART / 2, 0); // -450..60
  box(300, PART, T, M.wall, 300, PART / 2, 0); // 150..450
  ghost(2 * SX, WH - PART, T, 0, PART + (WH - PART) / 2, 0);
  // ghost roof
  ghost(2 * SX + T, 10, 2 * SZ + T, 0, WH + 5, 0, false);
  for (let x = -300; x <= 300; x += 150) ghost(6, 6, 2 * SZ, x, WH, 0, false);
  // sill caps (cut faces read like a section drawing)
  const cutCap = std({ color: '#2a241e', roughness: 0.8 });
  box(T + 1, 1.5, 2 * SZ + T, cutCap, SX + T / 2, SILL + 0.6, 0, scene, { cast: false });
  box(420, 1.5, T + 1, cutCap, -240, SILL + 0.6, SZ + T / 2, scene, { cast: false });
  box(360, 1.5, T + 1, cutCap, 270, SILL + 0.6, SZ + T / 2, scene, { cast: false });
  box(510, 1.5, T + 1, cutCap, -195, PART + 0.6, 0, scene, { cast: false });
  box(300, 1.5, T + 1, cutCap, 300, PART + 0.6, 0, scene, { cast: false });
  // door mat
  box(110, 1, 60, std({ color: '#2b2622', roughness: 1 }), 30, 4.6, 268, scene, { cast: false });

  // Store sign on the left wall (inside), plus a skirting strip
  const signTex = ctex(1024, 256, (g, w, h) => {
    g.fillStyle = INK; g.fillRect(0, 0, w, h);
    g.fillStyle = ORANGE; g.fillRect(0, h - 14, w, 14);
    g.fillStyle = CREAM; g.font = SANS(96, 800); g.fillText('NORTHGATE', 48, 128);
    g.font = SANS(96, 300); g.fillStyle = '#E8DCC8'; g.fillText('MOBILE', 610, 128);
    g.font = MONO(34, 600); g.fillStyle = '#B9AE9E'; g.fillText('BUY  ·  SELL  ·  TRADE-IN  ·  WHOLESALE', 52, 200);
  });
  const sign = plane(300, 75, std({ map: signTex, roughness: 0.6, emissive: '#ffffff', emissiveMap: signTex, emissiveIntensity: 0.25 }));
  sign.rotation.y = Math.PI / 2; sign.position.set(-SX + 1, 236, 150);

  // ---------------------------------------------------------------- shared phone screens
  const scrOff = screenTexture('off'); owned.push(scrOff);
  const scrTest = screenTexture('test', { pct: 0.55 }); owned.push(scrTest);
  const scrPass = screenTexture('pass', { grade: 'A' }); owned.push(scrPass);
  const scrRecord = screenTexture('record'); owned.push(scrRecord);
  const scrBoot = screenTexture('boot'); owned.push(scrBoot);
  const litePhone = (i, scr = scrOff) => { const p = makePhone(PHONE_STYLES[i % PHONE_STYLES.length], scr, { lite: true }); p.traverse(o => { if (o.isMesh) o.castShadow = false; }); return p; };
  const priceTex = ctex(256, 64, (g, w, h) => { g.fillStyle = CREAM; g.fillRect(0, 0, w, h); g.fillStyle = INK; g.font = MONO(30, 700); g.fillText('$', 14, 44); g.font = MONO(30, 700); g.fillText('A · 128', 50, 44); });
  const priceMat = std({ map: priceTex, roughness: 0.7 });

  // ---------------------------------------------------------------- storefront: wall display + glass case
  // slatwall on the left wall with phones on angled holders
  const slat = box(4, 120, 230, std({ color: '#d9cdb9', roughness: 0.85 }), -SX + 2, 150, 150, scene, { cast: false });
  for (let k = 0; k < 6; k++) box(5, 2, 230, M.wallEdge, -SX + 4, 95 + k * 22, 150, scene, { cast: false });
  for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) {
    const p = litePhone(r * 6 + c, (r + c) % 4 === 0 ? scrBoot : scrOff);
    p.scale.setScalar(1.1); p.rotation.set(0, Math.PI / 2, 0); p.rotateX(-0.12);
    p.position.set(-SX + 12, 112 + r * 36, 62 + c * 35); scene.add(p);
    const tag = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.3), priceMat); tag.rotation.y = Math.PI / 2; tag.position.set(-SX + 14, 100 + r * 36, 62 + c * 35); scene.add(tag);
  }
  // freestanding glass display case near the window
  const caseG = new THREE.Group(); caseG.position.set(-300, 0, 215); scene.add(caseG);
  box(150, 70, 60, M.walnut, 0, 35, 0, caseG);
  box(150, 3, 60, M.felt, 0, 71.5, 0, caseG, { cast: false });
  box(150, 30, 60, M.glass, 0, 88, 0, caseG, { cast: false });
  { const l = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(150, 30, 60)), new THREE.LineBasicMaterial({ color: '#e8dcc8', transparent: true, opacity: 0.5 })); l.position.y = 88; caseG.add(l); }
  for (let i = 0; i < 8; i++) { const p = litePhone(i + 3, i % 3 === 0 ? scrRecord : scrOff); p.rotation.x = -Math.PI / 2 + 0.25; p.position.set(-60 + (i % 4) * 40, 77, -10 + Math.floor(i / 4) * 22); caseG.add(p); }

  // ---------------------------------------------------------------- sales counter
  const counter = new THREE.Group(); counter.position.set(-100, 0, 110); scene.add(counter);
  box(260, 8, 60, M.ink, 0, 4, 0, counter);
  box(260, 60, 56, M.walnut, 0, 38, -2, counter);
  box(260, 3, 58, M.felt, 0, 69.5, 0, counter, { cast: false });
  box(260, 28, 60, M.glass, 0, 85, 0, counter, { cast: false });
  box(264, 3, 64, std({ color: '#e7e1d6', roughness: 0.25, metalness: 0.05 }), 0, 100.5, 0, counter);
  { const l = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(260, 28, 60)), new THREE.LineBasicMaterial({ color: '#e8dcc8', transparent: true, opacity: 0.45 })); l.position.y = 85; counter.add(l); }
  for (let i = 0; i < 10; i++) { const p = litePhone(i, i % 4 === 1 ? scrRecord : scrOff); p.rotation.x = -Math.PI / 2 + 0.3; p.position.set(-110 + i * 24, 75, 8); counter.add(p); }
  // card reader + tablet POS on the counter
  box(8, 3, 14, M.ink, 95, 103, -10, counter, { round: 1 });
  const posTex = ctex(640, 440, (g, w, h, st = 0) => {
    g.fillStyle = CREAM; g.fillRect(0, 0, w, h);
    g.fillStyle = INK; g.fillRect(0, 0, w, 54);
    g.fillStyle = CREAM; g.font = SANS(24, 700); g.fillText('InPhox', 22, 36);
    g.fillStyle = '#B9AE9E'; g.font = MONO(18, 500); g.fillText('Counter · Trade-in', 130, 35);
    g.fillStyle = MUTED; g.font = MONO(18, 600); g.fillText('WALK-IN · BAG OF 8', 26, 92);
    const rows = [['iPhone 13 · 128', 'A', 210], ['iPhone 12 · 64', 'B', 120], ['Galaxy S23 · 256', 'A', 260], ['+ 5 more', '', 650]];
    rows.forEach(([m, gr, p], i) => {
      const y = 122 + i * 46; g.fillStyle = i % 2 ? '#FFFFFF' : '#EDE6DA'; g.fillRect(20, y, w - 40, 40);
      g.fillStyle = INK; g.font = SANS(20, 600); g.fillText(m, 34, y + 27);
      if (gr) { g.strokeStyle = ORANGE; g.lineWidth = 2; rr(g, 300, y + 8, 30, 24, 4); g.stroke(); g.fillStyle = ORANGE; g.font = SANS(16, 700); g.fillText(gr, 309, y + 26); }
      g.fillStyle = INK; g.font = MONO(20, 600); g.textAlign = 'right'; g.fillText('$' + p, w - 34, y + 27); g.textAlign = 'left';
    });
    g.fillStyle = INK; g.font = SANS(26, 700); g.fillText('Offer', 26, 352);
    g.textAlign = 'right'; g.font = SANS(36, 800); g.fillText('$1,240', w - 26, 356); g.textAlign = 'left';
    g.fillStyle = st ? GREEN : ORANGE; rr(g, 20, 374, w - 40, 50, 6); g.fill();
    g.fillStyle = CREAM; g.font = SANS(22, 700); g.textAlign = 'center';
    g.fillText(st ? '✓ Accepted · Paid' : 'Send offer', w / 2, 407); g.textAlign = 'left';
  });
  const tablet = new THREE.Group(); tablet.position.set(-30, 106, 96); tablet.rotation.set(-0.95, Math.PI + 0.35, 0, 'YXZ'); scene.add(tablet);
  box(32, 22, 1.2, M.ink, 0, 0, 0, tablet, { round: 0.5 });
  { const s = plane(29.5, 20, std({ color: '#000', emissive: '#fff', emissiveMap: posTex, emissiveIntensity: 0.9, roughness: 0.2 }), tablet); s.position.z = 0.65; }
  // pendant lamps over the counter
  const lampMat = std({ color: '#2b2722', roughness: 0.5, metalness: 0.4 });
  const bulbMat = std({ color: '#fff3dd', emissive: '#ffcf8f', emissiveIntensity: 3 });
  for (let i = 0; i < 3; i++) {
    const x = -190 + i * 90;
    const cord = box(0.8, 40, 0.8, M.ink, x, WH - 20, 110, scene, { cast: false });
    const shade = new THREE.Mesh(new THREE.ConeGeometry(16, 16, 24, 1, true), lampMat); shade.position.set(x, WH - 48, 110); shade.material.side = THREE.DoubleSide; scene.add(shade);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(5, 16, 12), bulbMat); bulb.position.set(x, WH - 56, 110); scene.add(bulb);
  }

  // intake tote (phones land here) + walk-in's bag
  const intakeTex = ctex(256, 96, (g, w) => { g.fillStyle = '#FBFAF6'; g.fillRect(0, 0, w, 96); g.fillStyle = INK; g.font = MONO(24, 700); g.fillText('INTAKE · T-07', 12, 36); barcode(g, 12, 50, w - 24, 34, 41); });
  const intake = makeTote(intakeTex); intake.scale.setScalar(0.8); scene.add(intake);
  const intakePhones = [];
  for (let i = 0; i < 8; i++) { const p = litePhone(i + 1); scene.add(p); intakePhones.push(p); }
  const bag = new THREE.Group(); scene.add(bag);
  {
    const bm = std({ color: '#cbb894', roughness: 0.95 });
    const b = new THREE.Mesh(new RoundedBoxGeometry(30, 32, 13, 3, 3), bm); b.position.y = 16; b.castShadow = true; bag.add(b);
    const hm = new THREE.Mesh(new THREE.TorusGeometry(8, 0.9, 8, 20, Math.PI), bm); hm.position.set(0, 32, 4); bag.add(hm);
    const hm2 = hm.clone(); hm2.position.z = -4; bag.add(hm2);
    const logo = new THREE.Mesh(new THREE.CircleGeometry(5, 20), std({ color: '#7b6a50', roughness: 1 })); logo.position.set(0, 18, 6.6); bag.add(logo);
  }

  // ---------------------------------------------------------------- packing table (storefront right)
  const pack = new THREE.Group(); pack.position.set(300, 0, 190); scene.add(pack);
  box(170, 4, 80, M.oak, 0, 90, 0, pack);
  [[-80, -36], [80, -36], [-80, 36], [80, 36]].forEach(([x, z]) => box(5, 88, 5, M.steel, x, 44, z, pack));
  box(160, 3, 70, M.oak, 0, 22, 0, pack);
  for (let i = 0; i < 5; i++) box(46, 1.2, 24, M.kraft, -45, 24.5 + i * 1.3, 0, pack, { cast: false }); // flat boxes
  // label printer
  const printer = new THREE.Group(); printer.position.set(62, 92, -14); pack.add(printer);
  box(18, 14, 20, std({ color: '#e9e5dc', roughness: 0.5 }), 0, 7, 0, printer, { round: 2 });
  box(12, 0.6, 2, M.ink, 0, 9, 10.2, printer, { cast: false });
  const prLed = box(1.4, 1.4, 0.6, std({ color: '#222', emissive: '#3FB27F', emissiveIntensity: 0 }), 6, 12, 10.2, printer, { cast: false });
  // tape gun
  const tapeGun = new THREE.Group(); tapeGun.position.set(55, 92, 22); pack.add(tapeGun);
  { const r = new THREE.Mesh(new THREE.TorusGeometry(4.4, 1.6, 10, 24), std({ color: '#c9a46a', roughness: 0.4 })); r.rotation.y = Math.PI / 2; r.position.y = 6; tapeGun.add(r); box(3, 2, 14, M.orange, 0, 2, 2, tapeGun); box(3, 10, 3, M.orange, 0, 5, 7, tapeGun); }
  // order tote with 8 phones waiting to be packed
  const soTex = ctex(256, 96, (g, w) => { g.fillStyle = '#FBFAF6'; g.fillRect(0, 0, w, 96); g.fillStyle = INK; g.font = MONO(24, 700); g.fillText('SO-1042 · PICK', 12, 36); barcode(g, 12, 50, w - 24, 34, 77); });
  const soTote = makeTote(soTex); soTote.scale.setScalar(0.8); soTote.position.set(-48, 92, 4); pack.add(soTote);
  const kraftTex = ctex(256, 256, (g, w, h) => {
    g.fillStyle = '#c69d69'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1800; i++) { g.fillStyle = `rgba(${Math.random() > 0.5 ? '255,240,210' : '90,60,30'},${Math.random() * 0.08})`; g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 10, 1); }
  });
  const labelTex = ctex(600, 400, (g, w, h) => {
    g.fillStyle = '#FBFAF6'; g.fillRect(0, 0, w, h);
    g.fillStyle = INK; g.font = SANS(34, 800); g.fillText('SO-1042', 24, 50);
    g.font = MONO(20, 600); g.textAlign = 'right'; g.fillText('8 UNITS · 2.1 KG', w - 24, 48); g.textAlign = 'left';
    g.font = MONO(19, 500); g.fillText('FROM  Northgate Mobile', 24, 92); g.fillText('TO    Wholesale buyer · Dock 3', 24, 120);
    g.fillRect(24, 140, w - 48, 4);
    barcode(g, 24, 162, w - 48, 140, 53);
    g.font = MONO(22, 600); g.fillText('TRK 4471 0923 5518', 24, 334);
    g.fillStyle = ORANGE; g.fillRect(24, 352, 140, 22);
  });
  const shipBox = makeShippingBox(kraftTex, labelTex); scene.add(shipBox);
  const { flaps, tape, label: boxLabel, L: BL, W: BW } = shipBox.userData;
  const packPhones = [];
  const soSlots = [];
  for (let i = 0; i < 8; i++) {
    const p = litePhone(i + 5); scene.add(p); packPhones.push(p);
    soSlots.push(new THREE.Vector3(-BL / 2 + ((i % 4) + 0.5) * (BL / 4), PH / 2 + 0.6, (i < 4 ? -1 : 1) * BW / 4));
  }
  // printed label sliding out of the printer
  const slip = new THREE.Mesh(new THREE.PlaneGeometry(15, 10), std({ map: labelTex, roughness: 0.7 })); slip.rotation.x = -Math.PI / 2; scene.add(slip);

  // ---------------------------------------------------------------- back room: station desk
  const desk = new THREE.Group(); desk.position.set(-405, 0, -160); scene.add(desk);
  box(70, 4, 180, M.oak, 0, 74, 0, desk);
  box(66, 70, 4, M.steel, 0, 37, -86, desk); box(66, 70, 4, M.steel, 0, 37, 86, desk);
  // monitor
  const monTex = ctex(1024, 576, (g, w, h, st = { phase: 0, done: 0 }) => {
    g.fillStyle = '#FBF8F2'; g.fillRect(0, 0, w, h);
    g.fillStyle = INK; g.fillRect(0, 0, w, 64);
    g.fillStyle = CREAM; g.font = SANS(30, 700); g.fillText('InPhox', 28, 43);
    g.fillStyle = '#B9AE9E'; g.font = MONO(22, 500); g.fillText('Station · BACK-01', 160, 42);
    g.textAlign = 'right'; g.fillStyle = st.phase ? ORANGE : '#3FB27F'; g.fillText(st.phase === 0 ? '● READY' : st.done >= 4 ? '● 4/4 DONE' : '● TESTING', w - 28, 42); g.textAlign = 'left';
    const rows = [['iPhone 13', '128 GB · Midnight'], ['iPhone 12', '64 GB · Blue'], ['Galaxy S23', '256 GB · Cream'], ['Pixel 7', '128 GB · Obsidian']];
    rows.forEach(([m, s], i) => {
      const y = 92 + i * 112;
      g.fillStyle = '#FFFFFF'; rr(g, 24, y, w - 48, 98, 10); g.fill(); g.strokeStyle = LINE; g.lineWidth = 2; rr(g, 24, y, w - 48, 98, 10); g.stroke();
      g.fillStyle = MUTED; g.font = MONO(20, 600); g.fillText('PORT ' + (i + 1), 46, y + 38);
      if (st.phase === 0) { g.fillStyle = '#B9AE9E'; g.font = SANS(28, 500); g.fillText('Plug in a device', 190, y + 60); return; }
      g.fillStyle = INK; g.font = SANS(30, 700); g.fillText(m, 190, y + 44);
      g.fillStyle = MUTED; g.font = MONO(20, 500); g.fillText(s, 190, y + 76);
      const done = i < st.done, pct = done ? 1 : Math.min(0.92, st.pct || 0.4);
      g.fillStyle = '#EDE6DA'; rr(g, 520, y + 40, 300, 16, 8); g.fill();
      g.fillStyle = done ? '#3FB27F' : ORANGE; rr(g, 520, y + 40, 300 * pct, 16, 8); g.fill();
      g.fillStyle = done ? GREEN : ORANGE; g.font = MONO(22, 700);
      g.fillText(done ? 'PASS · A' : Math.round(pct * 42) + '/42', 850, y + 56);
    });
  });
  const monitor = new THREE.Group(); monitor.position.set(-28, 76, 0); monitor.rotation.y = Math.PI / 2; desk.add(monitor);
  box(64, 38, 2.5, M.ink, 0, 34, 0, monitor, { round: 0.8 });
  { const s = plane(60, 34, std({ color: '#000', emissive: '#fff', emissiveMap: monTex, emissiveIntensity: 0.85, roughness: 0.25 }), monitor); s.position.set(0, 34, 1.3); }
  box(5, 16, 5, M.steel, 0, 8, -4, monitor); box(24, 1.5, 16, M.steel, 0, 0.75, -4, monitor);
  box(14, 1.6, 40, std({ color: '#dcd6cb', roughness: 0.6 }), 14, 76.8, 30, desk, { round: 0.6 }); // keyboard
  // the station: a 4-port stand with phones plugged in
  const stand = makeStand(4, 11); stand.position.set(4, 76, -55); stand.rotation.y = Math.PI / 2; desk.add(stand);
  const leds = stand.userData.leds;
  const stationPhones = [];
  for (let i = 0; i < 4; i++) {
    const p = makePhone(PHONE_STYLES[[1, 3, 2, 4][i]], scrOff); p.scale.setScalar(1); scene.add(p); stationPhones.push(p);
  }
  const slotWorld = i => { const v = new THREE.Vector3(-25 + 3 + 5.5 + i * 11, 4 + PH / 2 + 0.5, 0.6); return v; };
  // a cable bundle from the stand to a small hub
  box(16, 4, 10, M.ink, 30, 78, -55, desk, { round: 1 });
  // desk lamp + mug
  box(10, 1.5, 10, M.ink, -20, 76.5, 60, desk);
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(4, 3.7, 9, 20), M.cream); mug.position.set(10, 80.5, 70); mug.castShadow = true; desk.add(mug);

  // ---------------------------------------------------------------- back room: shelving with labelled bins
  const shelfUnits = [{ x0: -60, name: 'A' }, { x0: 190, name: 'B' }];
  const LEVELS = [18, 63, 108, 153], BIN_W = 56;
  const binGeoParts = (() => {
    const w = BIN_W - 4, h = 26, d = 40, t = 1.2, gs = [];
    const add = (bw, bh, bd, x, y, z) => { const g = new THREE.BoxGeometry(bw, bh, bd); g.translate(x, y, z); gs.push(g); };
    add(w, t, d, 0, t / 2, 0); add(t, h, d, -w / 2, h / 2, 0); add(t, h, d, w / 2, h / 2, 0); add(w, h, t, 0, h / 2, -d / 2); add(w, h * 0.55, t, 0, h * 0.275, d / 2);
    return gs;
  })();
  const binGeo = (() => {
    // merge by hand (no BufferGeometryUtils import needed for 5 boxes)
    const pos = [], nor = [], idx = []; let off = 0;
    binGeoParts.forEach(g => { const p = g.attributes.position.array, n = g.attributes.normal.array; pos.push(...p); nor.push(...n); g.index.array.forEach(i => idx.push(i + off)); off += g.attributes.position.count; g.dispose(); });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setIndex(idx); return g;
  })();
  let hotBin = null, hotBinPos = new THREE.Vector3();
  shelfUnits.forEach(u => {
    const g = new THREE.Group(); g.position.set(u.x0, 0, -SZ + 30); scene.add(g);
    const W = 4 * BIN_W + 10, D = 46;
    [[-W / 2, -D / 2], [W / 2, -D / 2], [-W / 2, D / 2], [W / 2, D / 2]].forEach(([x, z]) => box(3.5, 205, 3.5, M.steel, x, 102.5, z, g));
    LEVELS.concat([198]).forEach(y => box(W, 2.5, D, M.shelf, 0, y - 1.5, 0, g));
    // label strips: one canvas per unit
    const lt = ctex(1024, 512, (c, w, h) => {
      c.fillStyle = '#e9e4d9'; c.fillRect(0, 0, w, h);
      LEVELS.slice().reverse().forEach((_, rIdx) => {
        for (let k = 0; k < 4; k++) {
          const n = rIdx * 4 + k + 1, x = k * 256, y = rIdx * 128;
          c.fillStyle = '#FBFAF6'; c.fillRect(x + 10, y + 12, 236, 104);
          c.fillStyle = INK; c.font = MONO(46, 800); c.fillText(u.name + '·' + String(n).padStart(2, '0'), x + 24, y + 62);
          barcode(c, x + 24, y + 74, 200, 30, n * 7 + u.name.charCodeAt(0));
        }
      });
    });
    LEVELS.forEach((y, li) => {
      const rIdx = 3 - li;
      const strip = new THREE.Mesh(new THREE.PlaneGeometry(4 * BIN_W, 7), std({ map: lt.clone(), roughness: 0.8 }));
      strip.material.map.offset.set(0, (3 - rIdx) * 0.25); strip.material.map.repeat.set(1, 0.25); strip.material.map.needsUpdate = true; owned.push(strip.material.map);
      strip.position.set(0, y - 6.5, D / 2 + 0.6); g.add(strip);
      for (let k = 0; k < 4; k++) {
        const n = rIdx * 4 + k + 1;
        const isHot = u.name === 'B' && n === 4;
        const b = new THREE.Mesh(binGeo, isHot ? M.binHot : M.bin); b.position.set(-1.5 * BIN_W + k * BIN_W, y, 2); b.castShadow = true; b.receiveShadow = true; g.add(b);
        // a few phones peeking out of each bin
        const c = 1 + ((n * 7 + k) % 3);
        for (let j = 0; j < c; j++) { const p = litePhone(n + j + k); p.position.set(b.position.x - 12 + j * 9, y + PH / 2 + 1, b.position.z - 4 + j); p.rotation.y = Math.PI / 2 + 0.1 * j; p.rotation.z = 0.08 * (j - 1); g.add(p); }
        if (isHot) { hotBin = b; g.updateMatrixWorld(true); b.getWorldPosition(hotBinPos); }
      }
    });
    // boxes on top
    for (let k = 0; k < 3; k++) box(60 + k * 6, 26 + k * 5, 38, M.kraft, -80 + k * 80, 199 + (26 + k * 5) / 2, 0, g);
  });
  const hotRing = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(BIN_W, 30, 44)), new THREE.LineBasicMaterial({ color: ORANGE, transparent: true, opacity: 0, toneMapped: false, depthTest: false }));
  hotRing.position.copy(hotBinPos).add(new THREE.Vector3(0, 14, 0)); hotRing.renderOrder = 8; scene.add(hotRing);
  // supply rack in the back-right corner
  const sup = new THREE.Group(); sup.position.set(-SX + 150, 0, -SZ + 30); scene.add(sup);
  [[-40, -20], [40, -20], [-40, 20], [40, 20]].forEach(([x, z]) => box(3.5, 160, 3.5, M.steel, x, 80, z, sup));
  [20, 80, 140].forEach(y => box(84, 2.5, 44, M.shelf, 0, y, 0, sup));
  for (let i = 0; i < 4; i++) box(34, 22, 30, M.kraft, -20 + (i % 2) * 40, 33 + Math.floor(i / 2) * 60, 0, sup);

  // ---------------------------------------------------------------- the van
  const van = new THREE.Group(); scene.add(van);
  {
    const body = box(380, 210, 196, M.van, 40, 135, 0, van, { round: 14 });
    const cab = box(150, 150, 192, M.van, -205, 104, 0, van, { round: 18 });
    const hood = box(80, 70, 190, M.van, -270, 72, 0, van, { round: 16 });
    const ws = box(4, 70, 170, M.vanGlass, -282, 140, 0, van, { cast: false }); ws.rotation.z = -0.5;
    [[-1]].forEach(() => {});
    [-1, 1].forEach(s => {
      box(80, 52, 2, M.vanGlass, -205, 148, s * 97, van, { cast: false });
      box(400, 14, 1.5, std({ color: '#2f6f8f', roughness: 0.5 }), 20, 110, s * 98.5, van, { cast: false });
      [-240, 150].forEach(x => {
        const w = new THREE.Mesh(new THREE.CylinderGeometry(36, 36, 26, 28), M.tire); w.rotation.x = Math.PI / 2; w.position.set(x, 36, s * 88); w.castShadow = true; van.add(w);
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(18, 18, 27, 20), M.steel); hub.rotation.x = Math.PI / 2; hub.position.copy(w.position); van.add(hub);
      });
    });
    box(4, 18, 40, std({ color: '#fff7e6', emissive: '#fff1cc', emissiveIntensity: 2 }), -311, 84, 66, van, { cast: false });
    box(4, 18, 40, std({ color: '#fff7e6', emissive: '#fff1cc', emissiveIntensity: 2 }), -311, 84, -66, van, { cast: false });
    box(4, 30, 14, std({ color: '#8a1d16', emissive: '#e0301e', emissiveIntensity: 1.2 }), 231, 120, 80, van, { cast: false });
    box(4, 30, 14, std({ color: '#8a1d16', emissive: '#e0301e', emissiveIntensity: 1.2 }), 231, 120, -80, van, { cast: false });
    box(30, 10, 196, M.ink, -318, 40, 0, van, { cast: false });
  }
  van.position.set(4000, 0, 540);

  // ---------------------------------------------------------------- floating labels (sprites)
  // Fixed-size canvases; the card is drawn centred and sized to its text.
  function card(spec, { w = 760, h = 210, worldH = 38 } = {}) {
    let cur = spec;
    const tex = ctex(w, h, (g, W, H, s) => {
      if (s) cur = s; s = cur;
      const dark = s.theme === 'dark';
      const padX = 30, icon = s.icon ? 64 : 0;
      g.font = SANS(s.big ? 46 : 38, 750); const tw = g.measureText(s.title).width;
      g.font = MONO(22, 600); const kw = s.kicker ? g.measureText(s.kicker).width : 0;
      g.font = MONO(22, 500); const sw = s.sub ? g.measureText(s.sub).width : 0;
      const cw = Math.min(W - 8, Math.max(tw, kw, sw) + padX * 2 + icon);
      const lines = (s.kicker ? 1 : 0) + 1 + (s.sub ? 1 : 0);
      const ch = 40 + lines * 38 + (s.big ? 10 : 0);
      const x = (W - cw) / 2, y = H - ch - 6;
      g.shadowColor = 'rgba(0,0,0,0.35)'; g.shadowBlur = 14; g.shadowOffsetY = 4;
      g.fillStyle = dark ? 'rgba(22,19,15,0.94)' : '#FBF8F2'; rr(g, x, y, cw, ch, 12); g.fill();
      g.shadowColor = 'transparent';
      g.strokeStyle = dark ? '#3A342D' : LINE; g.lineWidth = 2; rr(g, x, y, cw, ch, 12); g.stroke();
      g.fillStyle = s.accent || ORANGE; g.fillRect(x, y + 12, 5, ch - 24);
      let tx = x + padX;
      if (s.icon === 'check') check(g, tx + 22, y + ch / 2, 22, s.accent || '#3FB27F', dark ? INK : '#FFFFFF');
      if (s.icon === 'scan') { g.strokeStyle = ORANGE; g.lineWidth = 4; const cx = tx + 22, cy = y + ch / 2; [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { g.beginPath(); g.moveTo(cx + a * 20, cy + b * 8); g.lineTo(cx + a * 20, cy + b * 20); g.lineTo(cx + a * 8, cy + b * 20); g.stroke(); }); g.fillStyle = ORANGE; g.fillRect(cx - 14, cy - 1.5, 28, 3); }
      if (s.icon === 'pin') { const cx = tx + 22, cy = y + ch / 2 - 4; g.fillStyle = ORANGE; g.beginPath(); g.arc(cx, cy, 14, Math.PI, 0); g.lineTo(cx, cy + 24); g.closePath(); g.fill(); g.fillStyle = dark ? INK : '#FFF'; g.beginPath(); g.arc(cx, cy, 5.5, 0, TAU); g.fill(); }
      if (s.icon === 'box') { const cx = tx + 22, cy = y + ch / 2; g.fillStyle = '#C69D69'; g.fillRect(cx - 18, cy - 14, 36, 30); g.fillStyle = '#A57E4E'; g.fillRect(cx - 18, cy - 14, 36, 8); g.fillStyle = '#FBFAF6'; g.fillRect(cx - 2, cy + 2, 16, 10); }
      tx += icon;
      let ty = y + 26;
      if (s.kicker) { g.fillStyle = s.kickerCol || (dark ? '#B9AE9E' : MUTED); g.font = MONO(22, 600); ty += 22; g.fillText(s.kicker, tx, ty); ty += 12; }
      g.fillStyle = dark ? CREAM : INK; g.font = SANS(s.big ? 46 : 38, 750); ty += s.big ? 44 : 36; g.fillText(s.title, tx, ty);
      if (s.sub) { g.fillStyle = s.subCol || (dark ? '#B9AE9E' : MUTED); g.font = MONO(22, 500); ty += 36; g.fillText(s.sub, tx, ty); }
    });
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false, toneMapped: false, opacity: 0 });
    const sp = new THREE.Sprite(mat);
    sp.center.set(0.5, 0);
    const k = small ? 1.7 : 1;
    sp.scale.set(worldH * k * w / h, worldH * k, 1);
    sp.userData.base = sp.scale.clone();
    sp.renderOrder = 20; sp.visible = false;
    scene.add(sp);
    sp.userData.set = s => tex.userData.redraw(s);
    return sp;
  }
  const showLabel = (sp, a, pos) => {
    sp.visible = a > 0.002; if (!sp.visible) return;
    sp.material.opacity = a;
    const s = 0.86 + 0.14 * a; sp.scale.copy(sp.userData.base).multiplyScalar(s);
    if (pos) sp.position.copy(pos);
  };
  const L = {
    store: card({ theme: 'dark', kicker: 'NORTHGATE MOBILE · TODAY', title: '214 in stock · 9 sold', sub: '14 bought · 3 orders to ship', icon: 'check', accent: '#3FB27F' }, { worldH: 70 }),
    scan: [
      card({ kicker: 'IMEI 3530 1211 …4205', title: '✓ Clean', sub: 'iPhone 13 · 128 GB', icon: 'check', accent: '#1E7A4A' }),
      card({ kicker: 'IMEI 3567 0210 …6129', title: '✓ Clean', sub: 'iPhone 12 · 64 GB', icon: 'check', accent: '#1E7A4A' }),
      card({ kicker: 'IMEI 3509 1726 …3448', title: '✓ Clean', sub: 'Galaxy S23 · 256 GB', icon: 'check', accent: '#1E7A4A' })
    ],
    count: card({ theme: 'dark', kicker: 'BAG · WALK-IN', title: '3 of 8 scanned', sub: '0 flagged · 0 locked', icon: 'scan' }),
    offer: card({ theme: 'dark', kicker: 'OFFER ACCEPTED', title: '$1,240 · 8 units', sub: 'Paid · receipt texted', icon: 'check', accent: ORANGE, kickerCol: ORANGE, big: true }, { h: 230 }),
    test: card({ kicker: 'STATION · BACK-01', title: 'Testing 4 · 42 checks', sub: 'Grade lands on each record', icon: 'scan' }),
    passed: card({ kicker: 'STATION · BACK-01', title: '4/4 passed · Grade A', sub: 'Ready to bin', icon: 'check', accent: '#1E7A4A' }),
    bin: card({ theme: 'dark', kicker: 'PUT AWAY · iPHONE 13 · A', title: 'Shelf B · bin 4', sub: '12 units in bin', icon: 'pin' }),
    pack: card({ kicker: 'WHOLESALE · SO-1042', title: 'Packing 0/8', sub: 'Scan each phone into the box', icon: 'box' }),
    packed: card({ theme: 'dark', kicker: 'WHOLESALE', title: 'SO-1042 packed · 8 units', sub: 'Label printed · $3,960', icon: 'check', accent: '#3FB27F' }),
    picked: card({ kicker: 'COURIER · 6:42 PM', title: 'Picked up · in transit', sub: 'TRK 4471 0923 · buyer notified', icon: 'check', accent: '#1E7A4A' }, { worldH: 70 })
  };

  // ---------------------------------------------------------------- scan beam (from a handheld phone camera)
  const beamGeo = new THREE.BufferGeometry();
  beamGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(12), 3));
  beamGeo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 0, 1, 1, 1, 1, 0], 2));
  beamGeo.setIndex([0, 1, 2, 0, 2, 3]);
  const beamTex = ctex(64, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, 'rgba(235,94,18,0.95)'); gr.addColorStop(1, 'rgba(255,170,90,0.25)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  function makeBeam() {
    const g = beamGeo.clone();
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: beamTex, color: '#ffffff', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
    m.frustumCulled = false; m.renderOrder = 6; scene.add(m);
    const line = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: '#ffb070', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
    line.renderOrder = 7; scene.add(line);
    const tmp = new THREE.Vector3(), side = new THREE.Vector3(), dir = new THREE.Vector3();
    return {
      set(from, to, spread, a, sweep) {
        m.visible = line.visible = a > 0.01; if (!m.visible) return;
        dir.subVectors(to, from);
        tmp.subVectors(camera.position, to);
        side.crossVectors(dir, tmp).normalize().multiplyScalar(spread);
        const p = g.attributes.position;
        p.setXYZ(0, from.x - side.x * 0.08, from.y - side.y * 0.08, from.z - side.z * 0.08);
        p.setXYZ(1, from.x + side.x * 0.08, from.y + side.y * 0.08, from.z + side.z * 0.08);
        p.setXYZ(2, to.x + side.x, to.y + side.y, to.z + side.z);
        p.setXYZ(3, to.x - side.x, to.y - side.y, to.z - side.z);
        p.needsUpdate = true;
        m.material.opacity = a * 0.55;
        line.material.opacity = a;
        line.position.copy(to).add(tmp.set(0, (sweep - 0.5) * PH * 0.9, 0));
        line.lookAt(camera.position); line.scale.set(spread * 2.2, 0.7, 1);
      }
    };
  }
  const beamCounter = makeBeam(), beamPack = makeBeam();
  extra.push(beamGeo);

  // ---------------------------------------------------------------- people
  // Semi-realistic cast: shared body, photoreal heads, staff in InPhox work shirts.
  const kit = await loadPeople(ctx.loadGLTF, { asset: ctx.asset, heads: ['curls', 'young', 'grey', 'bun'] });
  const mixers = [];
  function person(opts) {
    const p = kit.person(opts);
    scene.add(p.root);
    mixers.push(p.mixer);
    return p;
  }
  const clerk = person({ head: 'curls', look: LOOKS.staffOrange, height: 172 });
  const tech = person({ head: 'young', look: LOOKS.staffCharcoal, height: 176 });
  const courier = person({ head: 'grey', look: { shirt: '#7a5a36', sleeves: true, pants: '#2a2420', shoes: '#1B1A19' }, height: 180 });
  const seller = person({ head: 'bun', look: LOOKS.casualDenim, height: 164 });

  // Timelines: segments cover 0..DUR. { a, b, at:[x,z], face } or { a, b, path:[[x,z],...] } or { a, b, hide:true }
  const FZ = 0, BZ = Math.PI, FX = Math.PI / 2, BX = -Math.PI / 2;
  const P = {
    clerk: [
      { a: 0, b: 13, at: [-95, 58], face: FZ },
      { a: 13, b: 17.6, path: [[-95, 58], [105, 30], [105, -40], [-318, -92]] },
      { a: 17.6, b: 19.8, at: [-318, -92], face: BX },
      { a: 19.8, b: 24.4, path: [[-318, -92], [-200, -170], [232, -200]] },
      { a: 24.4, b: 25.9, at: [232, -200], face: BZ },
      { a: 25.9, b: 31.4, path: [[232, -200], [105, -40], [105, 30], [-95, 58]] },
      { a: 31.4, b: DUR, at: [-95, 58], face: FZ }
    ],
    tech: [
      { a: 0, b: 21.6, at: [-335, -165], face: BX },
      { a: 21.6, b: 26.6, path: [[-335, -165], [105, -40], [105, 30], [300, 122]] },
      { a: 26.6, b: 35.2, at: [300, 122], face: FZ },
      { a: 35.2, b: DUR, path: [[300, 122], [105, 30], [105, -40], [-335, -165]] }
    ],
    seller: [
      { a: 0, b: 5.6, path: [[-560, 470], [30, 405], [30, 290], [-70, 178]] },
      { a: 5.6, b: 14.4, at: [-70, 178], face: BZ },
      { a: 14.4, b: 20.4, path: [[-70, 178], [30, 290], [30, 400], [560, 470]] },
      { a: 20.4, b: DUR, hide: true }
    ],
    courier: [
      { a: 0, b: 30.0, hide: true },
      { a: 30.0, b: 33.6, path: [[150, 418], [30, 345], [30, 275], [300, 262]] },
      { a: 33.6, b: 35.0, at: [300, 262], face: BZ },
      { a: 35.0, b: 38.4, path: [[300, 262], [30, 275], [30, 345], [150, 418]] },
      { a: 38.4, b: DUR, hide: true }
    ]
  };
  // Precompute path lengths
  Object.values(P).forEach(segs => segs.forEach(s => {
    if (!s.path) return;
    s.len = []; let L0 = 0;
    for (let i = 1; i < s.path.length; i++) { const d = Math.hypot(s.path[i][0] - s.path[i - 1][0], s.path[i][1] - s.path[i - 1][1]); s.len.push(d); L0 += d; }
    s.total = L0;
  }));
  const ACC = 0.14;
  const profile = u => { // trapezoid velocity -> distance fraction, speed fraction
    const v = 1 / (1 - ACC);
    if (u < ACC) return [v * u * u / (2 * ACC), u / ACC];
    if (u > 1 - ACC) { const r = 1 - u; return [1 - v * r * r / (2 * ACC), r / ACC]; }
    return [v * (u - ACC / 2), 1];
  };
  const along = (s, d) => {
    for (let i = 0; i < s.len.length; i++) {
      if (d <= s.len[i] || i === s.len.length - 1) { const k = s.len[i] ? clamp01(d / s.len[i]) : 0; const a = s.path[i], b = s.path[i + 1]; return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; }
      d -= s.len[i];
    }
    return s.path[s.path.length - 1];
  };
  const pathHeading = (s, d) => {
    const p0 = along(s, Math.max(0, d - 22)), p1 = along(s, Math.min(s.total, d + 22));
    return Math.atan2(p1[0] - p0[0], p1[1] - p0[1]);
  };
  function evalPerson(segs, t) {
    const i = segs.findIndex(s => t >= s.a && t < s.b);
    const s = segs[i < 0 ? segs.length - 1 : i];
    const prev = segs[(segs.indexOf(s) - 1 + segs.length) % segs.length];
    if (s.hide) return { hide: true };
    if (s.at) {
      let h = s.face;
      if (prev.path) h = lerpAngle(pathHeading(prev, prev.total), s.face, smooth((t - s.a) / 0.7));
      return { x: s.at[0], z: s.at[1], h, speed: 0 };
    }
    const u = clamp01((t - s.a) / (s.b - s.a));
    const [f, sp] = profile(u);
    const d = f * s.total;
    const [x, z] = along(s, d);
    let h = pathHeading(s, d);
    if (prev.at) h = lerpAngle(prev.face, h, smooth((t - s.a) / 0.45));
    const vmax = s.total / (s.b - s.a) / (1 - ACC);
    return { x, z, h, speed: sp * vmax };
  }
  function drivePerson(p, segs, t, dt) {
    const st = evalPerson(segs, t);
    p.root.visible = !st.hide;
    if (st.hide) return st;
    p.root.position.set(st.x, 4, st.z);
    p.root.rotation.y = st.h;
    const target = clamp01(st.speed / 60);
    p.w += (target - p.w) * Math.min(1, dt * 10);
    p.walk.setEffectiveWeight(p.w); p.idle.setEffectiveWeight(1 - p.w);
    p.walk.timeScale = st.speed > 1 ? THREE.MathUtils.clamp(st.speed / 135, 0.7, 1.35) : 1;
    return st;
  }
  // world point in a person's local frame (x right, y up, z forward)
  const vA = new THREE.Vector3(), vB = new THREE.Vector3(), vC = new THREE.Vector3(), vD = new THREE.Vector3();
  const local = (p, x, y, z, out) => out.set(x, y, z).applyAxisAngle(new THREE.Vector3(0, 1, 0), p.root.rotation.y).add(p.root.position);
  // handheld scanner phones
  const handClerk = makePhone(PHONE_STYLES[10], ctex(360, 760, (g, w, h) => {
    g.fillStyle = '#0B0907'; g.fillRect(0, 0, w, h);
    const gr = g.createLinearGradient(0, 120, 0, h - 120); gr.addColorStop(0, '#3a332b'); gr.addColorStop(1, '#1d1915'); g.fillStyle = gr; g.fillRect(0, 100, w, h - 220);
    g.strokeStyle = ORANGE; g.lineWidth = 8; const bx = 60, by = 240, bw = w - 120, bh = 240;
    [[bx, by, 1, 1], [bx + bw, by, -1, 1], [bx, by + bh, 1, -1], [bx + bw, by + bh, -1, -1]].forEach(([x, y, a, b]) => { g.beginPath(); g.moveTo(x, y + b * 40); g.lineTo(x, y); g.lineTo(x + a * 40, y); g.stroke(); });
    g.fillStyle = 'rgba(235,94,18,0.9)'; g.fillRect(bx + 10, by + bh / 2, bw - 20, 4);
    g.fillStyle = CREAM; g.font = SANS(28, 700); g.textAlign = 'center'; g.fillText('Scan IMEI', w / 2, 80);
    g.font = MONO(18, 500); g.fillStyle = '#B9AE9E'; g.fillText('InPhox · Counter', w / 2, h - 60);
  }));
  const handTech = makePhone(PHONE_STYLES[4], handClerk.userData.screenMat.emissiveMap);
  [handClerk, handTech].forEach(p => { p.scale.setScalar(1.05); scene.add(p); });

  // ---------------------------------------------------------------- camera rig
  // keys: [t, tx, ty, tz, az(deg), el(deg), dist]
  const CK = [
    [0, 20, 60, 110, 34, 36, 1850],
    [4.6, -20, 70, 120, 24, 33, 1500],
    [6.6, -95, 108, 118, 30, 27, 470],
    [11.2, -95, 110, 120, 14, 25, 450],
    [12.6, -70, 118, 140, 6, 26, 560],
    [15.2, -90, 110, 120, 20, 30, 640],
    [17.4, -360, 100, -130, 60, 40, 600],
    [21.2, -370, 104, -140, 74, 38, 560],
    [22.8, 220, 125, -230, 22, 26, 720],
    [26.0, 260, 135, -250, 30, 22, 600],
    [27.8, 300, 104, 190, 50, 46, 420],
    [32.6, 300, 104, 190, 36, 48, 400],
    [34.4, 250, 90, 270, 30, 50, 700],
    [37.4, 120, 80, 380, 26, 42, 1150],
    [DUR, 20, 60, 110, 34, 36, 1850]
  ];
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  const camTarget = new THREE.Vector3();
  function placeCamera(t) {
    let i = 0; while (i < CK.length - 2 && t >= CK[i + 1][0]) i++;
    const a = CK[i], b = CK[i + 1];
    const k = smooth((t - a[0]) / (b[0] - a[0]));
    const v = a.map((x, j) => lerp(x, b[j], k));
    const aspect = camera.aspect || 1.6;
    const fit = aspect < 1.25 ? Math.pow(1.25 / aspect, 0.8) : 1;
    const az = (v[4] + 3 * Math.sin(t / DUR * TAU) + ptr.x * 4) * Math.PI / 180;
    const el = (v[5] + ptr.y * 2.5) * Math.PI / 180;
    const d = v[6] * fit;
    camTarget.set(v[1], v[2], v[3]);
    camera.position.set(camTarget.x + Math.sin(az) * Math.cos(el) * d, camTarget.y + Math.sin(el) * d, camTarget.z + Math.cos(az) * Math.cos(el) * d);
    camera.lookAt(camTarget);
    // Lift the subject above centre so the caption box never covers it.
    const vh = 1000 / aspect, lift = (aspect < 1 ? 0.16 : 0.08) * vh;
    camera.setViewOffset(1000, vh, 0, lift, 1000, vh);
  }

  // ---------------------------------------------------------------- per-frame state
  const intakeSlot = (i, out) => out.set(-150 - 13 + i * 3.7, 101 + PH / 2 + 0.8, 106);
  intake.position.set(-150, 101, 106);
  const SCAN_STARTS = [6.0, 7.1, 8.2, 9.3, 9.75, 10.2, 10.65, 11.1];
  const PACK_STARTS = [27.4, 27.95, 28.5, 29.05, 29.6, 30.0, 30.4, 30.8];
  const stationIn = [17.9, 18.15, 18.4, 18.65], stationPass = [19.4, 20.0, 20.6, 21.1];
  let posState = -1, monKey = '', packCount = -1, scanCount = -1;
  const scanPoint = new THREE.Vector3(-88, 102.5 + PD_HALF, 112);
  const bagCounter = new THREE.Vector3(-40, 101, 118);
  const deskTray = new THREE.Vector3(-392, 78, -92);
  const qY = new THREE.Quaternion(), eul = new THREE.Euler();
  const toteHeld = new THREE.Vector3(), boxHeld = new THREE.Vector3();
  // the walk-in's bag hangs from her left hand (bag origin = its base; handles 40 up)
  const bagInHand = out => { kit.hand(seller, 'Left', out); out.y -= 39; return out; };

  function update(dt, t) {
    ptr.x += (ptr.tx - ptr.x) * Math.min(1, dt * 3); ptr.y += (ptr.ty - ptr.y) * Math.min(1, dt * 3);
    placeCamera(t);

    drivePerson(clerk, P.clerk, t, dt);
    drivePerson(tech, P.tech, t, dt);
    drivePerson(seller, P.seller, t, dt);
    drivePerson(courier, P.courier, t, dt);
    // courier fades in/out at the van
    const cA = Math.min(smooth((t - 30) / 0.5), smooth((38.4 - t) / 0.4));
    kit.setOpacity(courier, cA);
    mixers.forEach(m => m.update(dt));
    [clerk, tech, seller, courier].forEach(p => p.root.updateMatrixWorld(true));
    // carried things are held: both hands on the tote / box, bag in a hand
    const toteW = t >= 12.9 && t < 18.0 ? Math.min(smooth((t - 12.9) / 0.25), 1 - smooth((t - 17.6) / 0.4)) : 0;
    if (toteW > 0) kit.carry(clerk, toteW, [0, 0.6, 0.2], 0.075, toteHeld); else local(clerk, 0, 103, 34, toteHeld);
    toteHeld.y -= 10;
    const boxW = t >= 34.4 && t < 38.6 ? Math.min(smooth((t - 34.4) / 0.3), 1 - smooth((t - 38.2) / 0.4)) : 0;
    if (boxW > 0) kit.carry(courier, boxW, [0, 0.6, 0.2], 0.115, boxHeld); else local(courier, 0, 108, 36, boxHeld);
    boxHeld.y -= 16;
    if (t < 6.0) kit.reach(seller, 'Left', local(seller, 21, 72, 2, vD), t < 5.6 ? 1 : 1 - smooth((t - 5.6) / 0.4));
    // scanning: the phone is up in the right hand
    const clerkUp = t >= 5.4 && t < 12.6 ? Math.min(smooth((t - 5.4) / 0.3), 1 - smooth((t - 12.3) / 0.3)) : 0;
    if (clerkUp > 0) kit.reach(clerk, 'Right', local(clerk, -6, 128, 30, vD), clerkUp);
    const techUp = t >= 27.0 && t < 31.6 ? Math.min(smooth((t - 27.0) / 0.3), 1 - smooth((t - 31.3) / 0.3)) : 0;
    if (techUp > 0) kit.reach(tech, 'Right', local(tech, -6, 128, 30, vD), techUp);
    const carryPhone = t >= 19.8 && t < 24.7 ? Math.min(smooth((t - 19.8) / 0.3), 1 - smooth((t - 24.4) / 0.3)) : 0;
    if (carryPhone > 0) kit.reach(clerk, 'Right', local(clerk, -10, 100, 26, vD), carryPhone);

    // handheld phones: clerk holds one while scanning; tech while packing
    kit.hand(clerk, 'Right', vA);
    handClerk.position.copy(vA);
    handClerk.rotation.set(lerp(-0.3, -1.25, clerkUp), clerk.root.rotation.y + Math.PI, 0, 'YXZ');
    handClerk.visible = t < 13;
    kit.hand(tech, 'Right', vA);
    handTech.position.copy(vA); handTech.rotation.set(lerp(-0.3, -1.25, techUp), tech.root.rotation.y + Math.PI, 0, 'YXZ');
    handTech.visible = t >= 26.6 && t < 35.2;

    // --- bag: carried in, set on the counter, folded away after the offer
    if (t < 5.6) { bagInHand(vA); bag.position.copy(vA); bag.rotation.y = seller.root.rotation.y; bag.scale.setScalar(1); bag.visible = t > 0.02; }
    else if (t < 6.0) { const k = smooth((t - 5.6) / 0.4); bagInHand(vA); bag.position.lerpVectors(vA, bagCounter, k); bag.rotation.y = lerpAngle(seller.root.rotation.y, 0.2, k); }
    else { bag.position.copy(bagCounter); bag.rotation.y = 0.2; const f = 1 - smooth((t - 12.6) / 0.6); bag.scale.set(1, Math.max(0.05, f), 1); bag.visible = f > 0.06; }

    // --- intake tote: on the counter, carried by the clerk, then on the desk
    // (after the phones are tested the tote is cleared off the desk, and a
    // fresh empty one is set on the counter before the loop starts again)
    intake.scale.setScalar(0.8); intake.visible = true;
    if (t < 13.1) intake.position.set(-150, 101, 106), intake.rotation.y = 0;
    else if (t < 17.6) { intake.position.copy(toteHeld); intake.rotation.y = clerk.root.rotation.y + Math.PI / 2; }
    else if (t < 38.6) { const k = smooth((t - 17.6) / 0.4); intake.position.lerpVectors(toteHeld, deskTray, k); intake.rotation.y = lerpAngle(clerk.root.rotation.y + Math.PI / 2, Math.PI / 2, k); if (t > 37.6) { const f = 1 - smooth(t - 37.6); intake.scale.set(0.8, 0.8 * Math.max(0.04, f), 0.8); intake.visible = f > 0.05; } }
    else { const f = smooth((t - 38.8) / 0.8); intake.position.set(-150, 101, 106); intake.rotation.y = 0; intake.scale.set(0.8, 0.8 * Math.max(0.04, f), 0.8); intake.visible = f > 0.05; }
    intake.updateMatrixWorld();
    // phones out of the bag -> scanned in the air -> into the tote
    for (let i = 0; i < 8; i++) {
      const p = intakePhones[i], s0 = SCAN_STARTS[i], slow = i < 3;
      const r = slow ? 0.3 : 0.18, sc = slow ? 0.55 : 0.22, dn = slow ? 0.3 : 0.2;
      intake.localToWorld(vB.set(-16 + i * 4.6, PH / 2 / 0.8 + 1, 0));
      const upright = intake.rotation.y + Math.PI / 2;
      if (t < s0) { p.visible = false; continue; }
      p.visible = true;
      if (t < s0 + r) { const k = smooth((t - s0) / r); vA.set(bagCounter.x, bagCounter.y + 24, bagCounter.z); p.position.lerpVectors(vA, scanPoint, k); p.position.y += Math.sin(k * Math.PI) * 12; p.rotation.set(-Math.PI / 2 * k, 0, 0); }
      else if (t < s0 + r + sc) { p.position.copy(scanPoint); p.rotation.set(-Math.PI / 2, 0, 0); }
      else if (t < s0 + r + sc + dn) { const k = smooth((t - s0 - r - sc) / dn); p.position.lerpVectors(scanPoint, vB, k); p.position.y += Math.sin(k * Math.PI) * 10; p.rotation.set(-Math.PI / 2 * (1 - k), upright * k, 0); }
      else { p.position.copy(vB); p.rotation.set(0, upright, 0); }
      if (i < 4 && t >= stationIn[i]) { const k = smooth((t - stationIn[i]) / 0.3); p.position.y += k * 12; p.visible = k < 0.98; }
      if (t > 37.6) p.visible = false;
    }
    // scan beam on the counter
    let beamA = 0, beamTo = scanPoint, sweep = 0;
    for (let i = 0; i < 8; i++) {
      const s0 = SCAN_STARTS[i] + (i < 3 ? 0.3 : 0.18), d = i < 3 ? 0.55 : 0.22;
      if (t >= s0 && t < s0 + d) { beamA = Math.sin(clamp01((t - s0) / d) * Math.PI); sweep = (t - s0) / d; }
    }
    local(clerk, 8, 131, 36, vA);
    beamCounter.set(vA, beamTo, 9, beamA, sweep);
    const sc = SCAN_STARTS.filter(s => t >= s + 0.6).length;
    if (sc !== scanCount && t > 6 && t < 13) { scanCount = sc; L.count.userData.set({ theme: 'dark', kicker: 'BAG · WALK-IN', title: `${sc} of 8 scanned`, sub: '0 flagged · 0 locked', icon: 'scan' }); }

    // --- POS tablet flips to "Paid" once accepted
    const ps = t >= 12.9 ? 1 : 0;
    if (ps !== posState) { posState = ps; posTex.userData.redraw(ps); }

    // --- station: phones rise into ports, test, pass one by one
    for (let i = 0; i < 4; i++) {
      const p = stationPhones[i];
      const tIn = stationIn[i] + 0.3;
      const v = slotWorld(i); stand.localToWorld(vA.copy(v));
      const k = smooth((t - tIn) / 0.35);
      p.visible = t >= tIn && !(i === 0 && t >= 25.1);
      p.position.copy(vA); p.position.y += (1 - k) * 14;
      p.quaternion.copy(stand.getWorldQuaternion(qY)); p.rotateX(-0.18);
      if (i === 0 && t >= 19.8 && t < 25.1) { // clerk takes the first tested phone to the shelf
        if (t < 24.4) { kit.hand(clerk, 'Right', vB); const kk = smooth((t - 19.8) / 0.5); p.position.lerpVectors(vA, vB, kk); p.rotation.set(-0.4, clerk.root.rotation.y + Math.PI, 0, 'YXZ'); }
        else { const kk = smooth((t - 24.6) / 0.5); kit.hand(clerk, 'Right', vB); vC.copy(hotBinPos).add(vA.set(12, 8 + PH / 2, 0)); p.position.lerpVectors(vB, vC, kk); p.position.y += Math.sin(kk * Math.PI) * 25; p.rotation.set(0, Math.PI / 2, 0); }
      }
      const passed = t >= stationPass[i];
      const testing = t >= tIn && !passed;
      const want = passed ? scrPass : testing ? scrTest : scrOff;
      if (p.userData.screenMat.emissiveMap !== want) { p.userData.screenMat.emissiveMap = want; p.userData.screenMat.needsUpdate = true; }
      const led = leds[i];
      if (passed) { led.emissive.set('#3FB27F'); led.emissiveIntensity = 1.6; }
      else if (testing) { led.emissive.set(ORANGE); led.emissiveIntensity = 0.8 + 0.8 * Math.abs(Math.sin(t * 5 + i)); }
      else { led.emissive.set('#000'); led.emissiveIntensity = 0; }
    }
    const phase = t >= 17.9 && t < 39 ? 1 : 0;
    const done = stationPass.filter(s => t >= s).length * phase;
    const pct = Math.round(clamp01((t - 18.2) / 3) * 10) / 10;
    const mk = phase + ':' + done + ':' + pct;
    if (mk !== monKey) { monKey = mk; monTex.userData.redraw({ phase, done, pct }); }

    // --- bin highlight
    const hb = pulse(t, 24.9, 28.2, 0.3, 0.6);
    M.binHot.emissiveIntensity = hb * (0.5 + 0.25 * Math.sin(t * 6));
    hotRing.material.opacity = hb;

    // --- packing: box unfolds, phones scanned in, flaps, tape, label
    const boxPos = vC.set(300 + 18, 92, 190 + 2);
    let boxA = 1;
    if (t < 26.2) boxA = 0;
    else if (t < 34.6) shipBox.position.copy(boxPos);
    else if (t < 35.0) shipBox.position.lerpVectors(boxPos, boxHeld, smooth((t - 34.6) / 0.4));
    else if (t < 38.4) shipBox.position.copy(boxHeld);
    else boxA = 0;
    shipBox.visible = boxA > 0;
    const unfold = smooth((t - 26.2) / 0.6);
    shipBox.scale.set(1, t < 27 ? Math.max(0.04, unfold) : 1, 1);
    shipBox.rotation.y = t >= 34.6 && t < 38.4 ? courier.root.rotation.y + Math.PI / 2 : 0;
    const open = t < 31.4 ? smooth((t - 26.6) / 0.6) : 1 - smooth((t - 31.4) / 0.7);
    flaps.forEach((h, i) => {
      const a = open * (Math.PI * 0.62 + (i % 2) * 0.05);
      const d = h.userData;
      if (d.axis === 'x') h.rotation.x = d.sign * a; else h.rotation.z = -d.sign * a;
    });
    tape.visible = t >= 32.1 && t < 38.4; tape.scale.x = Math.max(0.001, smooth((t - 32.1) / 0.6));
    boxLabel.visible = t >= 33.9 && t < 38.4;
    // label slip out of the printer then onto the box
    prLed.material.emissiveIntensity = t > 32.6 && t < 33.4 ? 1.5 * (0.5 + 0.5 * Math.sin(t * 20)) : 0;
    printer.updateMatrixWorld(); printer.localToWorld(vA.set(0, 9, 10));
    if (t >= 32.6 && t < 33.9) {
      slip.visible = true;
      const out = smooth((t - 32.6) / 0.6), fly = smooth((t - 33.3) / 0.6);
      vB.copy(vA).add(vB.set(0, 0.6, 5 * out));
      shipBox.updateMatrixWorld(); shipBox.localToWorld(vA.set(BL / 4, 17.8, BW / 4 - 1));
      slip.position.lerpVectors(vB, vA, fly); slip.position.y += Math.sin(fly * Math.PI) * 14;
      slip.scale.set(1, out < 1 && fly === 0 ? Math.max(0.05, out) : 1, 1);
    } else slip.visible = false;
    // phones from the pick tote into the box
    soTote.updateMatrixWorld();
    shipBox.updateMatrixWorld();
    let pBeamA = 0, pSweep = 0, pBeamTo = vA;
    for (let i = 0; i < 8; i++) {
      const p = packPhones[i], s0 = PACK_STARTS[i];
      soTote.localToWorld(vB.set(-16 + i * 4.6, PH / 2 / 0.8 + 1, 0));
      shipBox.localToWorld(vC.copy(soSlots[i]));
      const scanAt = vD.set(292, 95, 178);
      if (t < s0) { p.position.copy(vB); p.rotation.set(0, Math.PI / 2, 0); }
      else if (t < s0 + 0.4) { const k = smooth((t - s0) / 0.4); p.position.lerpVectors(vB, scanAt, k); p.position.y += Math.sin(k * Math.PI) * 10; p.rotation.set(-Math.PI / 2 * k, Math.PI / 2 * (1 - k), 0); if (k > 0.4) { pBeamA = Math.sin(clamp01((k - 0.4) / 0.6) * Math.PI); pSweep = (k - 0.4) / 0.6; pBeamTo = scanAt; } }
      else if (t < s0 + 0.75) { const k = smooth((t - s0 - 0.4) / 0.35); p.position.lerpVectors(scanAt, vC, k); p.position.y += Math.sin(k * Math.PI) * 8; p.rotation.set(-Math.PI / 2 * (1 - k), 0, 0); }
      else { p.position.copy(vC); p.rotation.set(0, shipBox.rotation.y, 0); }
      p.visible = t < s0 + 0.75 ? true : shipBox.visible && t < 32.2;
    }
    local(tech, 8, 131, 36, vB);
    beamPack.set(vB, pBeamTo, 8, pBeamA, pSweep);
    const pc = PACK_STARTS.filter(s => t >= s + 0.75).length;
    if (pc !== packCount) { packCount = pc; L.pack.userData.set({ kicker: 'WHOLESALE · SO-1042', title: `Packing ${pc}/8`, sub: pc < 8 ? 'Scan each phone into the box' : 'All 8 matched to the order', icon: 'box' }); }

    // --- van
    let vx = 4000;
    if (t >= 26 && t < 30) { const k = 1 - Math.pow(1 - clamp01((t - 26) / 3.8), 3); vx = lerp(1700, 150, k); }
    else if (t >= 30 && t < 38.6) vx = 150;
    else if (t >= 38.6) { const k = Math.pow(clamp01((t - 38.6) / 1.4), 2.2); vx = lerp(150, -1500, k); }
    van.position.x = vx; van.visible = vx < 3000;

    // --- labels
    showLabel(L.store, pulse(t, 0.6, 4.8), vA.set(-40, 330, 60));
    const feedBase = new THREE.Vector3(-185, 140, 125);
    L.scan.forEach((sp, i) => {
      const a0 = SCAN_STARTS[i] + 0.65;
      showLabel(sp, pulse(t, a0, 12.2, 0.25, 0.35), vB.copy(feedBase).add(vC.set(0, (2 - i) * 40 * (small ? 1.7 : 1), 0)));
    });
    showLabel(L.count, pulse(t, 9.5, 12.2), vA.set(-10, 175, 120));
    showLabel(L.offer, pulse(t, 12.6, 16.6, 0.3, 0.45), vA.set(-90, 190, 140));
    showLabel(L.test, pulse(t, 18.4, 20.4), vA.set(-395, 175, -150));
    showLabel(L.passed, pulse(t, 20.6, 23.0), vA.set(-395, 175, -150));
    showLabel(L.bin, pulse(t, 25.0, 28.4), vA.copy(hotBinPos).add(vB.set(95, 20, 40)));
    showLabel(L.pack, pulse(t, 27.6, 32.0), vA.set(300, 165, 175));
    showLabel(L.packed, pulse(t, 33.9, 36.6), vA.set(300, 175, 190));
    showLabel(L.picked, pulse(t, 36.4, 39.7, 0.3, 0.3), vA.set(Math.max(van.position.x, -200), 290, 540));
  }

  // ---------------------------------------------------------------- module API
  const captions = [
    { at: 0, title: 'Buy, sell and trade, one system', body: 'A small store that buys bags of phones, tests them, shelves them and ships wholesale.' },
    { at: 5.6, title: 'Scan the bag at the counter', body: 'A phone camera reads each IMEI; blacklist and lock checks come back in seconds.' },
    { at: 12.6, title: 'Offer accepted, paid on the spot', body: 'Built from model, grade and your buy prices. One tap, paid, receipt sent.' },
    { at: 17.4, title: 'Tested at the desk station', body: 'Plug in, run 42 checks, and the grade lands on each device record.' },
    { at: 22.8, title: 'Every phone gets a bin', body: 'Shelf and bin are saved with the IMEI, so anyone can find it fast.' },
    { at: 27.6, title: 'Pack wholesale orders by scan', body: 'Each phone is scanned into the box, the order checks off, the label prints.' },
    { at: 34.2, title: 'Courier picks up out front', body: 'Tracking attaches to the order; stock and the buyer update as it leaves.' }
  ].map(c => ({ ...c, title: c.title.split(' ').length > 6 ? c.title.split(' ').slice(0, 6).join(' ') : c.title }));

  scene.updateMatrixWorld(true);
  placeCamera(0);
  update(0, 0);

  return {
    scene, camera, duration: DUR, captions,
    update,
    resize() {},
    pointer(e) {
      if (e.type === 'leave') { ptr.tx = 0; ptr.ty = 0; return; }
      if (e.type === 'move') { ptr.tx = e.x; ptr.ty = e.y; }
    },
    dispose() {
      mixers.forEach(m => { m.stopAllAction(); m.uncacheRoot(m.getRoot()); });
      kit.dispose();
      const mats = new Set(), geos = new Set(), texs = new Set(owned);
      scene.traverse(o => {
        if (o.geometry) geos.add(o.geometry);
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => mats.add(m));
      });
      mats.forEach(m => { for (const k in m) { const v = m[k]; if (v && v.isTexture) texs.add(v); } m.dispose(); });
      geos.forEach(g => g.dispose());
      extra.forEach(g => g.dispose && g.dispose());
      texs.forEach(t => t.dispose());
      key.shadow.map && key.shadow.map.dispose();
      scene.clear();
    }
  };
}
