// Refurbishers & ITAD: an x-ray cutaway of a refurb warehouse. Roof and
// front wall are cut away (section faces hatched orange), the remaining walls
// are ghosted with an x-ray shader so the yard and the docks stay visible.
// Flow left -> right: receive, test, erase, grade, repair, store, pack & ship.
// Units are metres. Everything that moves is a pure function of t (or loops
// with a period that divides the duration) so the loop is seamless.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { loadPeople, LOOKS } from '../../people/people.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const D = 48;            // loop length, seconds
const FY = 1.2;          // warehouse floor height (dock height)
const BX = 24, BZ = 11;  // half length / half depth of the building
const WH = 9;            // wall height above the floor
const INK = '#16130F', CREAM = '#F6F2EA', ORANGE = '#EB5E12', GREEN = '#1E7A4A';
const PASS = '#3FB27F', FAIL = '#E5574B', MUTED = '#8E857A';
const BG = '#E7DFD2';

const clamp01 = v => Math.max(0, Math.min(1, v));
const smooth = v => { v = clamp01(v); return v * v * (3 - 2 * v); };
const smoother = v => { v = clamp01(v); return v * v * v * (v * (v * 6 - 15) + 10); };
const lerp = (a, b, k) => a + (b - a) * k;
const wrapAngle = a => Math.atan2(Math.sin(a), Math.cos(a));
const lerpAngle = (a, b, k) => a + wrapAngle(b - a) * k;
function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

export default async function create(ctx) {
  const { renderer, isSmall } = ctx;
  let dead = false;
  const extra = new Set(); // textures / render targets not reachable by traversal

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.Fog(BG, 85, 190);
  const camera = new THREE.PerspectiveCamera(36, ctx.width / ctx.height, 0.5, 400);

  // ---------------------------------------------------------------- lights
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
  pmrem.dispose(); extra.add(envRT);
  scene.environment = envRT.texture;
  scene.environmentIntensity = 0.45;

  scene.add(new THREE.HemisphereLight('#fff6ea', '#8c8173', 0.95));
  const sun = new THREE.DirectionalLight('#ffe7c9', 2.5);
  sun.position.set(-26, 52, 34); sun.target.position.set(2, 0, -2);
  sun.castShadow = true;
  const sm = isSmall ? 1024 : 2048;
  sun.shadow.mapSize.set(sm, sm);
  Object.assign(sun.shadow.camera, { left: -36, right: 36, top: 26, bottom: -26, near: 10, far: 120 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
  scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight('#dfe8ff', 0.5); fill.position.set(30, 20, -30); scene.add(fill);

  // ------------------------------------------------------------- helpers
  const matCache = new Map();
  function M(color, rough = 0.6, metal = 0, o = {}) {
    const key = [color, rough, metal, JSON.stringify(o)].join('|');
    if (!matCache.has(key)) matCache.set(key, new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...o }));
    return matCache.get(key);
  }
  const box = (parent, w, h, d, mat, x, y, z, ry = 0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); m.rotation.y = ry; m.castShadow = m.receiveShadow = true; parent.add(m); return m;
  };
  const cyl = (parent, r1, r2, h, seg, mat, x, y, z, rx = 0, rz = 0) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), mat);
    m.position.set(x, y, z); m.rotation.set(rx, 0, rz); m.castShadow = m.receiveShadow = true; parent.add(m); return m;
  };

  function canvasTex(w, h, draw, { repeat = false, linear = false } = {}) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d');
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = linear ? THREE.NoColorSpace : THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    if (repeat) tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    const redraw = () => { if (dead) return; g.clearRect(0, 0, w, h); draw(g, w, h); tex.needsUpdate = true; };
    redraw();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(redraw);
    tex.userData.redraw = redraw;
    extra.add(tex);
    return tex;
  }
  const sans = (s, w = 700) => `${w} ${s}px 'Archivo', system-ui, sans-serif`;
  const mono = (s, w = 600) => `${w} ${s}px 'JetBrains Mono', ui-monospace, monospace`;
  function rr(g, x, y, w, h, r) {
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  function barcode(g, x, y, w, h, seed) {
    const r = rng(seed * 97 + 13); let cx = x;
    while (cx < x + w) { const bw = 1 + Math.floor(r() * 3); if (r() > 0.4) g.fillRect(cx, y, bw, h); cx += bw + 1; }
  }

  // Bake a static group: merge meshes per material into a few draw calls.
  function bake(root) {
    root.updateMatrixWorld(true);
    const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
    const buckets = new Map();
    const drop = [];
    root.traverse(o => {
      if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh || o.userData.keep) return;
      let gg = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
      for (const k of Object.keys(gg.attributes)) if (!['position', 'normal', 'uv'].includes(k)) gg.deleteAttribute(k);
      if (!gg.attributes.uv) gg.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(gg.attributes.position.count * 2), 2));
      gg.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld));
      const key = o.material.uuid + (o.castShadow ? 'c' : '') + (o.receiveShadow ? 'r' : '');
      if (!buckets.has(key)) buckets.set(key, { mat: o.material, cast: o.castShadow, recv: o.receiveShadow, list: [] });
      buckets.get(key).list.push(gg);
      drop.push(o);
    });
    for (const o of drop) { o.geometry.dispose(); o.parent.remove(o); }
    for (const b of buckets.values()) {
      const merged = mergeGeometries(b.list, false);
      b.list.forEach(x => x.dispose());
      const m = new THREE.Mesh(merged, b.mat); m.castShadow = b.cast; m.receiveShadow = b.recv;
      root.add(m);
    }
    return root;
  }

  // -------------------------------------------------------------- textures
  const floorTex = canvasTex(2048, 1024, (g, w, h) => {
    const X = x => (x + BX) / (2 * BX) * w, Z = z => (z + BZ) / (2 * BZ) * h, S = w / (2 * BX);
    g.fillStyle = '#CDC4B6'; g.fillRect(0, 0, w, h);
    const r = rng(11);
    for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(${r() > 0.5 ? '255,255,255' : '90,80,70'},${0.02 + r() * 0.03})`; g.beginPath(); g.arc(r() * w, r() * h, 20 + r() * 90, 0, 7); g.fill(); }
    g.strokeStyle = 'rgba(60,50,40,0.18)'; g.lineWidth = 1.5;
    for (let x = -BX; x <= BX; x += 6) { g.beginPath(); g.moveTo(X(x), 0); g.lineTo(X(x), h); g.stroke(); }
    for (let z = -BZ; z <= BZ; z += 5.5) { g.beginPath(); g.moveTo(0, Z(z)); g.lineTo(w, Z(z)); g.stroke(); }
    // walkway: yellow lines either side of the main aisle
    g.fillStyle = '#E2B436';
    g.fillRect(X(-23.5), Z(5.75), X(23.5) - X(-23.5), 0.1 * S);
    g.fillRect(X(-23.5), Z(10.4), X(23.5) - X(-23.5), 0.1 * S);
    // pedestrian chevrons in the aisle
    g.fillStyle = 'rgba(226,180,54,0.55)';
    for (let x = -22; x < 22; x += 3) { g.fillRect(X(x), Z(8.0), 0.9 * S, 0.12 * S); }
    // zones
    const zones = [['01 RECEIVE', -23.4, -16.2], ['02 TEST', -15.4, -8.0], ['03 ERASE', -7.4, -2.4], ['04 GRADE', -2.0, 2.6], ['05 REPAIR', 3.2, 9.0], ['06 STORE', 10.0, 17.0], ['07 SHIP', 17.6, 23.4]];
    zones.forEach(([name, x0, x1]) => {
      g.strokeStyle = 'rgba(22,19,15,0.35)'; g.lineWidth = 0.08 * S; g.setLineDash([0.5 * S, 0.3 * S]);
      g.strokeRect(X(x0), Z(-10.6), X(x1) - X(x0), Z(5.2) - Z(-10.6)); g.setLineDash([]);
      g.fillStyle = 'rgba(22,19,15,0.42)'; g.font = sans(Math.round(0.62 * S), 800);
      g.fillText(name, X(x0) + 0.3 * S, Z(5.0));
    });
    // dock door aprons
    g.fillStyle = 'rgba(22,19,15,0.12)';
    [-6, 0, 6].forEach(z => g.fillRect(X(-24), Z(z - 1.6), 2.2 * S, 3.2 * S));
    [-4, 4].forEach(z => g.fillRect(X(21.8), Z(z - 1.6), 2.2 * S, 3.2 * S));
    g.fillStyle = 'rgba(226,180,54,0.8)';
    [-6, 0, 6].forEach(z => { for (let i = 0; i < 6; i++) g.fillRect(X(-24) + i * 0.4 * S, Z(z - 1.6), 0.2 * S, 0.1 * S); });
  });

  const yardTex = canvasTex(2048, 2048, (g, w, h) => {
    // covers x -80..80, z -60..100 (160 x 160 m)
    const X = x => (x + 80) / 160 * w, Z = z => (z + 60) / 160 * h, S = w / 160;
    g.fillStyle = '#A9A196'; g.fillRect(0, 0, w, h);
    const r = rng(5);
    for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(${r() > 0.5 ? '255,250,240' : '50,45,40'},${0.02 + r() * 0.04})`; g.beginPath(); g.arc(r() * w, r() * h, 6 + r() * 50, 0, 7); g.fill(); }
    // sidewalk / apron around the building
    g.fillStyle = '#C9C1B4'; g.fillRect(X(-26), Z(-13), X(26) - X(-26), Z(14) - Z(-13));
    // road in front
    g.fillStyle = '#8F887E'; g.fillRect(0, Z(17), w, Z(27) - Z(17));
    g.fillStyle = '#F2EEE6';
    for (let x = -80; x < 80; x += 4) g.fillRect(X(x), Z(21.9), 2 * S, 0.18 * S);
    g.fillRect(0, Z(17.2), w, 0.16 * S); g.fillRect(0, Z(26.6), w, 0.16 * S);
    // trailer stalls at both dock faces + back lot
    g.fillStyle = 'rgba(246,242,234,0.92)';
    [-9, -3, 3, 9].forEach(z => g.fillRect(X(-62), Z(z) - 0.08 * S, X(-26) - X(-62), 0.16 * S));
    [-8, 0, 8].forEach(z => g.fillRect(X(26), Z(z) - 0.08 * S, X(62) - X(26), 0.16 * S));
    for (let x = -36; x <= 36; x += 4) g.fillRect(X(x) - 0.08 * S, Z(-52), 0.16 * S, Z(-34) - Z(-52));
    // yellow hatch at dock approaches
    g.fillStyle = 'rgba(226,180,54,0.85)';
    [-6, 0, 6].forEach(z => { for (let i = 0; i < 5; i++) g.fillRect(X(-31 + i * 0.9), Z(z - 1.4), 0.25 * S, 2.8 * S); });
    [-4, 4].forEach(z => { for (let i = 0; i < 5; i++) g.fillRect(X(27 + i * 0.9), Z(z - 1.4), 0.25 * S, 2.8 * S); });
    g.fillStyle = 'rgba(246,242,234,0.7)'; g.font = sans(Math.round(1.6 * S), 800);
    g.fillText('INBOUND', X(-48), Z(15)); g.fillText('OUTBOUND', X(34), Z(15));
  });

  const hatchTex = canvasTex(256, 64, (g, w, h) => {
    g.fillStyle = '#F1E4D4'; g.fillRect(0, 0, w, h);
    g.strokeStyle = ORANGE; g.lineWidth = 5;
    for (let x = -h; x < w + h; x += 16) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + h, 0); g.stroke(); }
  }, { repeat: true });

  const pileTex = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#5b4632'; g.fillRect(0, 0, w, h);
    const r = rng(23); const cols = ['#2b2b2b', '#e6e3dc', '#1f2a36', '#6b5e7d', '#2e5a87', '#8a1c26', '#c8c4bd', '#3b3d3f', '#d8cfc0'];
    for (let i = 0; i < 70; i++) {
      g.save(); g.translate(r() * w, r() * h); g.rotate(r() * Math.PI);
      g.fillStyle = cols[Math.floor(r() * cols.length)]; rr(g, -14, -28, 28, 56, 6); g.fill();
      if (r() > 0.5) { g.fillStyle = '#0b0b0c'; rr(g, -12, -26, 24, 52, 5); g.fill(); }
      g.restore();
    }
    g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(0, 0, w, h);
  });

  const kraftTex = canvasTex(512, 128, (g, w, h) => {
    g.fillStyle = '#C49A68'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(80,50,20,0.08)'; for (let x = 0; x < w; x += 6) g.fillRect(x, 0, 2, h);
    g.fillStyle = 'rgba(80,50,20,0.25)'; g.fillRect(0, 10, w, 3); g.fillRect(0, h - 14, w, 3);
    [40, 300].forEach((x, i) => {
      g.fillStyle = '#FBFAF6'; g.fillRect(x, 34, 120, 58);
      g.fillStyle = INK; g.font = mono(13, 600); g.fillText('LOT L-041' + (8 + i), x + 8, 52);
      barcode(g, x + 8, 58, 104, 26, 3 + i);
      g.fillStyle = ORANGE; g.fillRect(x + 100, 38, 14, 10);
    });
  });

  // InPhox-style UI for monitors.
  function uiTex(title, rows, foot) {
    return canvasTex(512, 320, (g, w, h) => {
      g.fillStyle = CREAM; g.fillRect(0, 0, w, h);
      g.fillStyle = INK; g.fillRect(0, 0, w, 44);
      g.fillStyle = ORANGE; rr(g, 16, 13, 18, 18, 4); g.fill();
      g.fillStyle = CREAM; g.font = sans(19, 700); g.fillText('InPhox', 42, 29);
      g.fillStyle = '#B9AE9E'; g.font = mono(14, 500); g.textAlign = 'right'; g.fillText('WAREHOUSE A', w - 16, 28); g.textAlign = 'left';
      g.fillStyle = INK; g.font = sans(24, 700); g.fillText(title, 18, 80);
      rows.forEach(([a, pill, col], i) => {
        const y = 98 + i * 44;
        g.fillStyle = '#FFFFFF'; rr(g, 14, y, w - 28, 36, 8); g.fill();
        g.strokeStyle = '#E2DACB'; g.lineWidth = 1.5; g.stroke();
        g.fillStyle = INK; g.font = mono(16, 500); g.fillText(a, 28, y + 24);
        g.font = mono(15, 600);
        const tw = g.measureText(pill).width + 24;
        const bg = col === PASS ? '#E3F1E8' : col === FAIL ? '#F6E1DE' : col === ORANGE ? '#FBE7CC' : '#EDE6DA';
        const fg = col === PASS ? GREEN : col === FAIL ? '#B3261E' : col === ORANGE ? '#8A4A12' : INK;
        g.fillStyle = bg; rr(g, w - 28 - tw, y + 6, tw, 24, 12); g.fill();
        g.fillStyle = fg; g.fillText(pill, w - 28 - tw + 12, y + 23);
      });
      if (foot) { g.fillStyle = MUTED; g.font = mono(14, 500); g.fillText(foot, 18, h - 14); }
    });
  }

  // ---------------------------------------------------------- static world
  const stat = new THREE.Group(); // baked at the end
  const dyn = new THREE.Group(); scene.add(dyn);

  // ground
  const yard = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), new THREE.MeshStandardMaterial({ map: yardTex, roughness: 0.92 }));
  yard.rotation.x = -Math.PI / 2; yard.position.set(0, 0, 20); yard.receiveShadow = true; scene.add(yard);
  const outer = new THREE.Mesh(new THREE.CircleGeometry(400, 48), new THREE.MeshStandardMaterial({ color: '#B4AC9F', roughness: 1 }));
  outer.rotation.x = -Math.PI / 2; outer.position.y = -0.02; scene.add(outer);

  // slab
  const concrete = M('#C8BFB2', 0.85);
  box(stat, 2 * BX + 0.6, FY, 2 * BZ + 0.6, concrete, 0, FY / 2, 0);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(2 * BX, 2 * BZ), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.42, metalness: 0.0 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = FY + 0.004; floor.receiveShadow = true; floor.userData.keep = true; scene.add(floor);
  // section cut: hatched front of the slab + knee wall with an orange cap
  const hatchMat = new THREE.MeshStandardMaterial({ map: hatchTex, roughness: 0.8 });
  hatchTex.repeat.set(48 / 2, 1);
  const cutFace = new THREE.Mesh(new THREE.PlaneGeometry(2 * BX + 0.6, FY), hatchMat);
  cutFace.position.set(0, FY / 2, BZ + 0.302); cutFace.userData.keep = true; scene.add(cutFace);
  const knee = new THREE.Group(); stat.add(knee);
  box(knee, 2 * BX, 0.9, 0.25, M('#EFE8DC', 0.8), 0, FY + 0.45, BZ);
  box(knee, 2 * BX + 0.02, 0.05, 0.27, M(ORANGE, 0.5), 0, FY + 0.925, BZ);

  // steel structure: columns, eave beams, trusses cut half way (roof removed)
  const steel = M('#4B4F55', 0.45, 0.7);
  const cap = M(ORANGE, 0.5);
  for (let x = -BX; x <= BX; x += 8) {
    box(stat, 0.3, WH, 0.3, steel, x, FY + WH / 2, -BZ);
    box(stat, 0.3, 0.9, 0.3, steel, x, FY + 0.45, BZ - 0.3);
    box(stat, 0.32, 0.04, 0.32, cap, x, FY + 0.92, BZ - 0.3);
  }
  [-BX, BX].forEach(x => {
    [-3, 5].forEach(z => box(stat, 0.3, WH, 0.3, steel, x, FY + WH / 2, z));
    box(stat, 0.3, WH, 0.3, steel, x, FY + WH / 2, BZ);
    box(stat, 0.3, 0.06, 0.32, cap, x, FY + WH, BZ);
    box(stat, 0.25, 0.5, 2 * BZ, steel, x, FY + WH - 0.25, 0);
  });
  box(stat, 2 * BX, 0.5, 0.25, steel, 0, FY + WH - 0.25, -BZ);
  for (let x = -BX + 4; x < BX; x += 4) {
    // truss from the back wall, cut at z = -1
    box(stat, 0.16, 0.7, 10, steel, x, FY + WH - 0.35, -6);
    box(stat, 0.18, 0.72, 0.04, cap, x, FY + WH - 0.35, -0.99);
    // high-bay light hanging off it
    const ly = FY + WH - 1.6;
    box(stat, 0.02, 0.9, 0.02, steel, x, ly + 0.5, -6);
    cyl(stat, 0.35, 0.22, 0.25, 16, M('#3a3d42', 0.4, 0.6), x, ly, -6);
    const bulb = cyl(stat, 0.3, 0.3, 0.02, 16, M('#fff8e8', 0.3, 0, { emissive: '#fff3d6', emissiveIntensity: 2.2 }), x, ly - 0.13, -6);
    bulb.castShadow = false;
  }
  [-8, -4].forEach(z => box(stat, 2 * BX, 0.2, 0.12, steel, 0, FY + WH - 0.1, z));

  // dock doors
  const doorFrame = M('#2B2722', 0.6), seal = M('#141210', 0.9), bumper = M('#1d1b19', 0.9), drum = M('#9a9ea4', 0.4, 0.6);
  const hiVis = M('#E2B436', 0.5);
  function dock(x, z, side) { // side = -1 (left wall) / +1 (right wall)
    const g = new THREE.Group(); g.position.set(x, 0, z); stat.add(g);
    const o = side * 0.12;
    box(g, 0.2, 3.3, 0.18, doorFrame, o, FY + 1.65, -1.6); box(g, 0.2, 3.3, 0.18, doorFrame, o, FY + 1.65, 1.6);
    box(g, 0.2, 0.2, 3.4, doorFrame, o, FY + 3.3, 0);
    box(g, 0.5, 0.6, 3.4, drum, -side * 0.05, FY + 3.7, 0);
    // dock seal pads + bumpers outside
    box(g, 0.35, 3.0, 0.3, seal, side * 0.4, FY + 1.6, -1.55); box(g, 0.35, 3.0, 0.3, seal, side * 0.4, FY + 1.6, 1.55);
    box(g, 0.35, 0.4, 3.4, seal, side * 0.4, FY + 3.15, 0);
    box(g, 0.2, 0.5, 0.35, bumper, side * 0.4, FY - 0.35, -1.0); box(g, 0.2, 0.5, 0.35, bumper, side * 0.4, FY - 0.35, 1.0);
    // dock leveler lip
    box(g, 1.6, 0.04, 2.0, M('#6d7177', 0.5, 0.6), -side * 0.7, FY + 0.02, 0);
    box(g, 0.12, 0.05, 2.0, hiVis, -side * 1.45, FY + 0.03, 0);
    // bollards
    cyl(g, 0.11, 0.11, 1.1, 12, hiVis, -side * 0.5, FY + 0.55, -2.0);
    cyl(g, 0.11, 0.11, 1.1, 12, hiVis, -side * 0.5, FY + 0.55, 2.0);
  }
  [-6, 0, 6].forEach(z => dock(-BX, z, -1));
  [-4, 4].forEach(z => dock(BX, z, 1));

  // x-ray walls
  const ghostMats = [];
  function ghostMat(axisX) {
    const m = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false,
      uniforms: {
        uTime: { value: 0 }, uTint: { value: new THREE.Color('#46637A') }, uEdge: { value: new THREE.Color(ORANGE) },
        uY0: { value: FY }, uY1: { value: FY + WH }, uAxis: { value: axisX ? new THREE.Vector2(1, 0) : new THREE.Vector2(0, 1) }
      },
      vertexShader: `varying vec3 vW; varying vec3 vN;
        void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: `uniform float uTime, uY0, uY1; uniform vec3 uTint, uEdge; uniform vec2 uAxis;
        varying vec3 vW; varying vec3 vN;
        float lineAA(float v, float width){ float d = abs(fract(v) - 0.5); float fw = fwidth(v) * 1.2; return 1.0 - smoothstep(width - fw, width + fw, 0.5 - d); }
        void main(){
          vec3 V = normalize(cameraPosition - vW);
          float f = pow(1.0 - abs(dot(V, normalize(vN))), 1.5);
          float u = dot(vW.xz, uAxis);
          float yN = (vW.y - uY0) / (uY1 - uY0);
          float rib = lineAA(u / 0.45, 0.02);
          float girt = lineAA((vW.y - uY0) / 2.25, 0.015);
          float top = smoothstep(0.975, 1.0, yN);
          float scan = exp(-pow((yN - fract(uTime / 12.0)) * 70.0, 2.0));
          float a = 0.06 + 0.24 * f + 0.12 * rib + 0.16 * girt + 0.6 * top + 0.18 * scan;
          vec3 c = mix(uTint, uEdge, clamp(top + scan * 0.5, 0.0, 1.0));
          gl_FragColor = vec4(c, a);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`
    });
    ghostMats.push(m); return m;
  }
  const wallBack = new THREE.Mesh(new THREE.PlaneGeometry(2 * BX, WH), ghostMat(true));
  wallBack.position.set(0, FY + WH / 2, -BZ); wallBack.renderOrder = 2; scene.add(wallBack);
  [-BX, BX].forEach(x => {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(2 * BZ, WH), ghostMat(false));
    w.rotation.y = Math.PI / 2; w.position.set(x, FY + WH / 2, 0); w.renderOrder = 2; scene.add(w);
  });
  // wall plinth (solid strip at the base so the cut reads)
  box(stat, 2 * BX, 0.35, 0.2, M('#EFE8DC', 0.8), 0, FY + 0.175, -BZ + 0.1);

  // hanging zone signs
  const SIGNS = [['01', 'Receive', -19.8], ['02', 'Test', -11.6], ['03', 'Erase', -4.9], ['04', 'Grade', 0.2], ['05', 'Repair', 6.0], ['06', 'Store', 13.6], ['07', 'Ship', 20.6]];
  SIGNS.forEach(([n, name, x]) => {
    const tex = canvasTex(512, 128, (g, w, h) => {
      g.fillStyle = INK; rr(g, 0, 0, w, h, 14); g.fill();
      g.fillStyle = ORANGE; g.font = mono(54, 600); g.fillText(n, 30, 86);
      g.fillStyle = CREAM; g.font = sans(62, 700); g.fillText(name, 130, 88);
    });
    const s = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.8), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.25 }));
    s.position.set(x, FY + 7.25, -9.6); s.userData.keep = true; scene.add(s);
    box(stat, 0.02, 1.4, 0.02, steel, x - 1.3, FY + 8.3, -9.6); box(stat, 0.02, 1.4, 0.02, steel, x + 1.3, FY + 8.3, -9.6);
    box(stat, 3.24, 0.82, 0.04, M('#2B2722', 0.6), x, FY + 7.25, -9.63);
  });

  // ---------------------------------------------------------- reusable parts
  const wood = M('#B48A5C', 0.85);
  const palletGeo = mergeGeometries([
    new THREE.BoxGeometry(1.2, 0.04, 1.0).translate(0, 0.13, 0),
    new THREE.BoxGeometry(1.2, 0.1, 0.14).translate(0, 0.06, -0.43),
    new THREE.BoxGeometry(1.2, 0.1, 0.14).translate(0, 0.06, 0),
    new THREE.BoxGeometry(1.2, 0.1, 0.14).translate(0, 0.06, 0.43)
  ]);
  const gaylordGeo = new THREE.CylinderGeometry(0.66, 0.62, 0.95, 8, 1, true).rotateY(Math.PI / 8).translate(0, 0.15 + 0.475, 0);
  const gaylordMat = new THREE.MeshStandardMaterial({ map: kraftTex, roughness: 0.9, side: THREE.DoubleSide });
  const pileGeo = new THREE.CircleGeometry(0.6, 8).rotateZ(Math.PI / 8).rotateX(-Math.PI / 2);
  const pileMat = new THREE.MeshStandardMaterial({ map: pileTex, roughness: 0.6 });
  function gaylord(parent, keep = false) {
    const g = new THREE.Group();
    const p = new THREE.Mesh(palletGeo, wood); p.castShadow = p.receiveShadow = true; g.add(p);
    const b = new THREE.Mesh(gaylordGeo, gaylordMat); b.castShadow = b.receiveShadow = true; g.add(b);
    const c = new THREE.Mesh(pileGeo, pileMat); c.position.y = 0.95; c.receiveShadow = true; g.add(c);
    if (keep) g.traverse(o => { o.userData.keep = true; });
    parent.add(g); return g;
  }

  function monitor(parent, tex, x, y, z, ry = 0, w = 0.62) {
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g);
    const h = w * 0.625;
    box(g, w + 0.04, h + 0.04, 0.03, M('#1c1a18', 0.5), 0, 0.28 + h / 2, 0);
    box(g, 0.05, 0.28, 0.04, M('#2b2a29', 0.4, 0.6), 0, 0.14, -0.03);
    box(g, 0.22, 0.015, 0.16, M('#2b2a29', 0.4, 0.6), 0, 0.008, -0.02);
    const s = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
    s.position.set(0, 0.28 + h / 2, 0.017); s.userData.keep = true; g.add(s);
    return g;
  }
  const benchTop = M('#E9E2D6', 0.55), benchLeg = M('#55595f', 0.4, 0.6), esd = M('#2F6B4C', 0.7);
  function bench(parent, x, z, len, dep = 0.8, mat = benchTop) {
    const g = new THREE.Group(); g.position.set(x, FY, z); parent.add(g);
    box(g, len, 0.05, dep, mat, 0, 0.9, 0);
    [-1, 1].forEach(sx => [-1, 1].forEach(sz => box(g, 0.05, 0.88, 0.05, benchLeg, sx * (len / 2 - 0.08), 0.44, sz * (dep / 2 - 0.08))));
    box(g, len - 0.2, 0.03, dep - 0.15, benchLeg, 0, 0.25, 0);
    return g;
  }

  // ---------------------------------------------------------- 01 receive
  const statics = [[-17.3, -8.6], [-18.7, -8.6], [-17.3, -10.0], [-18.7, -10.0], [-21.6, -9.8], [-21.6, -8.4]];
  statics.forEach(([x, z]) => { const g = gaylord(stat); g.position.set(x, FY, z); });
  const rcvDesk = bench(stat, -18.8, 1.6, 1.8, 0.7);
  monitor(stat, uiTex('Receive · Lot L-0418', [['IMEI 3567…0331', 'On manifest', PASS], ['IMEI 3530…4205', 'On manifest', PASS], ['IMEI 3582…7962', 'On manifest', PASS], ['IMEI 3502…0182', 'Not on manifest', ORANGE]], 'Scanned against manifest · 0 missing'), -18.25, FY + 0.93, 1.55, 0.2);
  box(stat, 0.6, 0.25, 0.4, M('#3d5368', 0.7), -19.4, FY + 1.05, 1.6); // tote on desk
  // pallet wrap station / scale plate
  box(stat, 1.4, 0.06, 1.4, M('#6d7177', 0.5, 0.6), -21.4, FY + 0.03, -4.2);

  // ---------------------------------------------------------- 02 test
  const phoneW = 0.09, phoneH = 0.18;
  const testSlots = [];
  [[-11.6, -8.4], [-11.6, -4.6]].forEach(([x, z], bi) => {
    bench(stat, x, z, 6.4, 0.8, esd);
    // sloped rack + hub rail
    const rack = new THREE.Group(); rack.position.set(x, FY + 0.93, z - 0.12); stat.add(rack);
    box(rack, 6.0, 0.05, 0.12, M('#2b2a29', 0.4, 0.5), 0, 0.02, 0.18);
    box(rack, 6.0, 0.5, 0.03, M('#3a3d42', 0.5, 0.5), 0, 0.27, -0.12, 0);
    for (let row = 0; row < 2; row++) for (let i = 0; i < 26; i++) {
      testSlots.push({ x: x - 2.85 + i * 0.228, y: FY + 0.93 + 0.12 + row * 0.24, z: z - 0.12 + 0.08 - row * 0.12, bench: bi });
    }
    monitor(stat, uiTex('Diagnostics · Bench T-' + (bi + 1), [['Slot 07 · 128 GB', 'Pass', PASS], ['Slot 08 · 256 GB', 'Pass', PASS], ['Slot 09 · 64 GB', 'Battery 71%', FAIL], ['Slot 10 · 128 GB', 'Testing', ORANGE]], '52 connected · results saved to each device'), x + 3.45, FY + 0.93, z - 0.05, -0.25);
  });
  const testBodies = new THREE.InstancedMesh(new THREE.BoxGeometry(phoneW + 0.01, phoneH + 0.01, 0.012), M('#1b1b1d', 0.35, 0.4), testSlots.length);
  const testScreens = new THREE.InstancedMesh(new THREE.PlaneGeometry(phoneW, phoneH), new THREE.MeshBasicMaterial({ toneMapped: false }), testSlots.length);
  {
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.32, 0, 0));
    testSlots.forEach((s, i) => {
      m4.compose(new THREE.Vector3(s.x, s.y, s.z), q, new THREE.Vector3(1, 1, 1)); testBodies.setMatrixAt(i, m4);
      const off = new THREE.Vector3(0, 0, 0.0075).applyQuaternion(q);
      m4.compose(new THREE.Vector3(s.x + off.x, s.y + off.y, s.z + off.z), q, new THREE.Vector3(1, 1, 1)); testScreens.setMatrixAt(i, m4);
      testScreens.setColorAt(i, new THREE.Color('#111'));
      s.off = (i * 0.618034 % 1) * 12;
    });
  }
  testBodies.castShadow = true; testBodies.receiveShadow = true;
  dyn.add(testBodies, testScreens);

  // ---------------------------------------------------------- 03 erase
  const eraseSlots = [];
  [-6.3, -3.8].forEach((x, ci) => {
    const g = new THREE.Group(); g.position.set(x, FY, -9.4); stat.add(g);
    box(g, 2.0, 2.1, 0.7, M('#24262a', 0.45, 0.5), 0, 1.05, 0);
    box(g, 1.84, 1.72, 0.02, M('#0f1012', 0.3, 0.2), 0, 1.0, 0.355);
    box(g, 2.04, 0.08, 0.74, cap, 0, 2.12, 0);
    for (let r = 0; r < 10; r++) for (let c = 0; c < 12; c++) eraseSlots.push({ x: x - 0.825 + c * 0.15, y: FY + 0.24 + r * 0.168, z: -9.4 + 0.37, off: ((r * 12 + c + ci * 7) * 0.381966 % 1) * 16 });
    monitor(g, uiTex('Erasure · Rack E-' + (ci + 1), [['Purge · 3567…0331', 'Verified', PASS], ['Purge · 3530…4205', 'Verified', PASS], ['Purge · 3582…7962', 'Wiping 64%', ORANGE], ['Certificate EC-0418-' + (ci ? '22' : '17'), 'Issued', PASS]], 'One certificate per device, filed to its record'), 0, 2.16, 0.05, 0, 0.7);
  });
  const eraseScreens = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.1, 0.13), new THREE.MeshBasicMaterial({ toneMapped: false }), eraseSlots.length);
  {
    const m4 = new THREE.Matrix4();
    eraseSlots.forEach((s, i) => { m4.makeTranslation(s.x, s.y, s.z); eraseScreens.setMatrixAt(i, m4); eraseScreens.setColorAt(i, new THREE.Color('#111')); });
  }
  dyn.add(eraseScreens);
  // certificate printer table
  bench(stat, -5.1, -6.9, 1.4, 0.6);
  box(stat, 0.42, 0.22, 0.36, M('#EFE8DC', 0.5), -5.4, FY + 1.04, -6.95);
  const certPaper = box(dyn, 0.21, 0.004, 0.29, M('#ffffff', 0.7), -5.4, FY + 1.16, -6.7);

  // ---------------------------------------------------------- 04 grade
  const booth = new THREE.Group(); booth.position.set(-0.4, FY, -8.6); stat.add(booth);
  const boothWhite = M('#F7F4EE', 0.9, 0, { emissive: '#ffffff', emissiveIntensity: 0.35 });
  box(booth, 0.9, 0.75, 0.05, M('#2b2a29', 0.4, 0.5), 0, 0.92 - 0.4, 0);
  bench(booth, 0, 0.2, 1.6, 1.2, benchTop).position.set(0, 0, 0.2);
  box(booth, 1.3, 0.03, 1.0, boothWhite, 0, 0.95 + 0.015, 0.2);
  box(booth, 1.3, 1.0, 0.03, boothWhite, 0, 1.45, -0.29);
  box(booth, 0.03, 1.0, 1.0, boothWhite, -0.65, 1.45, 0.2); box(booth, 0.03, 1.0, 1.0, boothWhite, 0.65, 1.45, 0.2);
  box(booth, 1.33, 0.03, 1.0, boothWhite, 0, 1.95, 0.2);
  // softboxes on stands
  [-1.25, 1.25].forEach(sx => {
    cyl(booth, 0.02, 0.02, 1.7, 8, steel, sx, 0.85, 0.7);
    const sb = box(booth, 0.7, 0.5, 0.1, M('#fffaf0', 0.6, 0, { emissive: '#fff3dc', emissiveIntensity: 1.6 }), sx, 1.8, 0.75, -sx * 0.5);
    sb.castShadow = false;
  });
  // turntable + phone (dynamic)
  const turn = new THREE.Group(); turn.position.set(-0.4, FY + 0.985, -8.4); dyn.add(turn);
  cyl(turn, 0.18, 0.2, 0.03, 32, M('#2b2a29', 0.3, 0.5), 0, 0.015, 0);
  const gPhone = new THREE.Group(); gPhone.position.y = 0.26; turn.add(gPhone);
  {
    const body = new THREE.Mesh(new RoundedBoxGeometry(0.072, 0.147, 0.0082, 4, 0.009), M('#6b5e7d', 0.28, 0.85)); body.castShadow = true; gPhone.add(body);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.066, 0.141), new THREE.MeshStandardMaterial({ color: '#050505', roughness: 0.1, metalness: 0.3 })); scr.position.z = 0.0042; gPhone.add(scr);
    const back = new THREE.Mesh(new THREE.PlaneGeometry(0.068, 0.143), new THREE.MeshPhysicalMaterial({ color: '#5a4d6e', roughness: 0.2, clearcoat: 1 })); back.position.z = -0.0042; back.rotation.y = Math.PI; gPhone.add(back);
    const bump = new THREE.Mesh(new RoundedBoxGeometry(0.035, 0.035, 0.004, 2, 0.007), M('#5a4d6e', 0.25, 0.5)); bump.position.set(-0.013, 0.05, -0.006); gPhone.add(bump);
    for (let k = 0; k < 3; k++) { const l = cyl(gPhone, 0.0065, 0.0065, 0.004, 16, M('#0a0a12', 0.05, 0.5), -0.021 + (k % 2) * 0.016, 0.058 - Math.floor(k / 2) * 0.016 + (k === 2 ? 0.008 : 0), -0.009, Math.PI / 2); l.castShadow = false; }
    gPhone.scale.setScalar(3.2);
  }
  const flash = new THREE.PointLight('#fff4e2', 0, 4, 2); flash.position.set(-0.4, FY + 1.6, -7.9); dyn.add(flash);
  bench(stat, 1.7, -6.9, 1.6, 0.8);
  monitor(stat, uiTex('Grade · 3567…0331', [['Screen', 'A', PASS], ['Housing', 'A', PASS], ['Battery health', '91%', PASS], ['Photos', '6 / 6', PASS]], 'Cosmetic score 94 · grade A'), 1.9, FY + 0.93, -7.05, -0.3);
  box(stat, 0.6, 0.25, 0.4, M('#3d5368', 0.7), 1.2, FY + 1.05, -6.8);

  // ---------------------------------------------------------- 05 repair
  const lampMat = M('#fffaf0', 0.4, 0, { emissive: '#fff1d0', emissiveIntensity: 2.0 });
  [[4.6, -8.4, 1], [7.4, -8.4, 1], [4.6, -4.6, -1], [7.4, -4.6, -1]].forEach(([x, z, f], i) => {
    bench(stat, x, z, 2.2, 0.8, esd);
    const lx = x + 0.7, lz = z - f * 0.3;
    cyl(stat, 0.1, 0.12, 0.03, 16, steel, lx, FY + 0.94, lz);
    const arm = cyl(stat, 0.015, 0.015, 0.6, 8, steel, lx, FY + 1.22, lz, 0, 0.35);
    arm.castShadow = false;
    const head = cyl(stat, 0.12, 0.08, 0.07, 18, M('#3a3d42', 0.4, 0.5), lx - 0.15, FY + 1.48, lz + f * 0.1);
    const glow = cyl(stat, 0.11, 0.11, 0.01, 18, lampMat, lx - 0.15, FY + 1.44, lz + f * 0.1); glow.castShadow = false; head.castShadow = false;
    // phone opened on a mat, parts tray, tote
    box(stat, 0.09, 0.008, 0.18, M('#1b1b1d', 0.3, 0.5), x - 0.2, FY + 0.93, z);
    box(stat, 0.09, 0.008, 0.18, M('#2f3b52', 0.3, 0.5), x - 0.05, FY + 0.93, z + 0.02, 0.4);
    box(stat, 0.3, 0.02, 0.2, M('#d9d4c8', 0.6), x + 0.2, FY + 0.935, z + 0.1);
    box(stat, 0.6, 0.25, 0.4, M(i % 2 ? '#EB5E12' : '#3d5368', 0.7), x - 0.75, FY + 1.05, z - f * 0.1);
    if (i === 1) monitor(stat, uiTex('Ticket R-2207', [['Screen assembly', 'Replaced', PASS], ['Parts used', '1 · from stock', '#EDE6DA'], ['Labor', '18 min', '#EDE6DA'], ['Next step', 'Re-test', ORANGE]], 'Parts and labor tracked to this unit'), x + 0.25, FY + 0.93, z - 0.2, 0.2);
  });

  // ---------------------------------------------------------- 06 store
  const rackRows = [10.8, 13.6, 16.4];
  const bays = 6, bayW = 2.0, levels = 6, levelH = 1.1, rz0 = -10.2;
  const upG = new THREE.BoxGeometry(0.09, levels * levelH + 0.3, 0.09);
  const ups = new THREE.InstancedMesh(upG, M('#2f4b6e', 0.55, 0.35), rackRows.length * (bays + 1) * 2);
  const beams = new THREE.InstancedMesh(new THREE.BoxGeometry(0.06, 0.1, bayW), M(ORANGE, 0.5, 0.3), rackRows.length * bays * levels * 2);
  const binG = new THREE.BoxGeometry(0.9, 0.34, 0.56);
  const bins = new THREE.InstancedMesh(binG, M('#ffffff', 0.7), rackRows.length * bays * levels * 3);
  {
    const m4 = new THREE.Matrix4(); let iu = 0, ib = 0, ix = 0; const r = rng(77);
    const binCols = ['#3d5368', '#3d5368', '#3d5368', '#46627c', '#EB5E12', '#2B2722', '#E9E2D6'].map(c => new THREE.Color(c));
    rackRows.forEach(x => {
      for (let b = 0; b <= bays; b++) [-0.5, 0.5].forEach(dx => { m4.makeTranslation(x + dx, FY + (levels * levelH + 0.3) / 2, rz0 + b * bayW); ups.setMatrixAt(iu++, m4); });
      for (let b = 0; b < bays; b++) for (let l = 0; l < levels; l++) {
        const y = FY + 0.15 + l * levelH;
        [-0.5, 0.5].forEach(dx => { m4.makeTranslation(x + dx, y, rz0 + b * bayW + bayW / 2); beams.setMatrixAt(ib++, m4); });
        for (let k = 0; k < 3; k++) {
          if (r() < 0.12) continue;
          m4.makeTranslation(x, y + 0.05 + 0.17, rz0 + b * bayW + 0.36 + k * 0.64); bins.setMatrixAt(ix, m4);
          bins.setColorAt(ix++, binCols[Math.floor(r() * binCols.length)]);
        }
      }
    });
    bins.count = ix;
  }
  [ups, beams, bins].forEach(o => { o.castShadow = true; o.receiveShadow = true; scene.add(o); });
  // highlighted bin (the one the picker goes to)
  const hiBin = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.38, 0.6), new THREE.MeshBasicMaterial({ color: ORANGE, transparent: true, opacity: 0.0, toneMapped: false, depthWrite: false }));
  hiBin.position.set(13.6, FY + 0.15 + 3 * levelH + 0.22, rz0 + 2 * bayW + 0.36 + 0.64);
  dyn.add(hiBin);

  // ---------------------------------------------------------- 07 pack & ship
  [[20.2, -6.4], [20.2, -2.8]].forEach(([x, z], i) => {
    bench(stat, x, z, 2.0, 0.9);
    box(stat, 0.44, 0.17, 0.22, M('#C49A68', 0.9), x - 0.4, FY + 1.01, z);
    box(stat, 0.44, 0.17, 0.22, M('#C49A68', 0.9), x - 0.4, FY + 1.18, z + 0.05, 0.1);
    box(stat, 0.3, 0.14, 0.2, M('#EFE8DC', 0.5), x + 0.75, FY + 1.0, z - 0.2);
    if (i === 0) monitor(stat, uiTex('Order SO-1182', [['Picked by IMEI', '64 / 64', PASS], ['Packed', '64', PASS], ['Label', 'Printed', PASS], ['Buyer', 'Tracking sent', PASS]], 'Loads to door 2 · pickup 4:00 PM'), x + 0.3, FY + 0.93, z - 0.25, -0.2);
  });
  const wrapMat = new THREE.MeshStandardMaterial({ color: '#dfe8ef', roughness: 0.15, metalness: 0, transparent: true, opacity: 0.35, depthWrite: false });
  [[22.4, -9.2], [22.4, -7.7], [18.6, -9.6]].forEach(([x, z]) => {
    const g = new THREE.Group(); g.position.set(x, FY, z); stat.add(g);
    const p = new THREE.Mesh(palletGeo, wood); p.castShadow = p.receiveShadow = true; g.add(p);
    for (let i = 0; i < 12; i++) box(g, 0.56, 0.38, 0.46, M('#C49A68', 0.9), -0.29 + (i % 2) * 0.58, 0.35 + Math.floor(i / 4) * 0.39, -0.24 + (Math.floor(i / 2) % 2) * 0.48);
    const w = new THREE.Mesh(new THREE.BoxGeometry(1.22, 1.2, 1.02), wrapMat); w.position.y = 0.75; w.userData.keep = true; g.add(w);
  });

  // ---------------------------------------------------------- conveyors
  function conveyor(x0, x1, z, h = 0.8, width = 0.62) {
    const L = x1 - x0, g = new THREE.Group(); stat.add(g);
    const rail = M('#d6a019', 0.5, 0.3);
    box(g, L, 0.1, 0.06, rail, (x0 + x1) / 2, FY + h - 0.02, z - width / 2 - 0.03);
    box(g, L, 0.1, 0.06, rail, (x0 + x1) / 2, FY + h - 0.02, z + width / 2 + 0.03);
    for (let x = x0 + 0.2; x < x1; x += 2.0) [-1, 1].forEach(s => box(g, 0.05, h - 0.05, 0.05, benchLeg, x, FY + (h - 0.05) / 2, z + s * (width / 2)));
    const n = Math.floor(L / 0.11);
    const rg = new THREE.CylinderGeometry(0.03, 0.03, width, 10).rotateX(Math.PI / 2);
    const rollers = new THREE.InstancedMesh(rg, M('#9a9ea4', 0.35, 0.8), n);
    const m4 = new THREE.Matrix4();
    for (let i = 0; i < n; i++) { m4.makeTranslation(x0 + 0.05 + i * 0.11, FY + h - 0.03, z); rollers.setMatrixAt(i, m4); }
    rollers.receiveShadow = true; scene.add(rollers);
  }
  const TC = { x0: -16.6, x1: 9.0, z: 4.2, y: FY + 0.8 };
  conveyor(TC.x0, TC.x1, TC.z);
  const OC = { x0: 17.4, x1: 24.6, z: 4, y: FY + 0.8 };
  conveyor(OC.x0, OC.x1 - 0.3, OC.z, 0.8, 0.7);

  const toteN = 16, toteL = TC.x1 - TC.x0, toteGeo = new THREE.BoxGeometry(0.6, 0.24, 0.42);
  const totes = new THREE.InstancedMesh(toteGeo, M('#3d5368', 0.65), toteN);
  const toteTops = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.54, 0.36).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: pileTex, roughness: 0.6 }), toteN);
  totes.castShadow = true; totes.receiveShadow = true; dyn.add(totes, toteTops);
  const boxN = 6, boxL = OC.x1 - OC.x0;
  const shipBoxes = new THREE.InstancedMesh(new THREE.BoxGeometry(0.5, 0.3, 0.38), M('#C49A68', 0.9), boxN);
  shipBoxes.castShadow = true; dyn.add(shipBoxes);

  // ---------------------------------------------------------- trucks
  const trailerMat = M('#F2EEE7', 0.45, 0.1), trailerIn = M('#D9D2C6', 0.8, 0, { side: THREE.DoubleSide });
  const tireMat = M('#1a1918', 0.85), rimMat = M('#9a9ea4', 0.35, 0.8), chassis = M('#2a2826', 0.6, 0.4);
  const glassMat = M('#1c2630', 0.08, 0.6), lightMat = M('#fff6e0', 0.3, 0, { emissive: '#fff0cc', emissiveIntensity: 1.2 });
  const tireGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.55, 20).rotateX(Math.PI / 2);
  const rimGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.57, 12).rotateX(Math.PI / 2);
  function wheel(g, x, z) {
    const t = new THREE.Mesh(tireGeo, tireMat); t.position.set(x, 0.5, z); t.castShadow = true; g.add(t);
    const r = new THREE.Mesh(rimGeo, rimMat); r.position.set(x, 0.5, z); g.add(r);
  }
  // Trailer box from x = 0 (rear) to len (+x), bed at 1.25. cut = open +z side and roof.
  function trailer(g, len, cut, stripe = ORANGE) {
    const W = 2.55, y0 = 1.25, H = 2.75;
    if (!cut) box(g, len, H, W, trailerMat, len / 2, y0 + H / 2, 0);
    else {
      box(g, len, 0.08, W, trailerIn, len / 2, y0 + 0.04, 0);
      box(g, len, H, 0.05, trailerMat, len / 2, y0 + H / 2, -W / 2);
      box(g, 0.05, H, W, trailerMat, len - 0.025, y0 + H / 2, 0);
      box(g, len, 0.05, 0.08, cap, len / 2, y0 + H, -W / 2);
      box(g, 0.08, 0.05, W, cap, len - 0.025, y0 + H, 0);
      box(g, len, 0.08, 0.06, cap, len / 2, y0 + 0.04, W / 2);
      for (let x = 1.5; x < len; x += 1.5) box(g, 0.05, 0.05, W, trailerMat, x, y0 + H - 0.03, 0);
    }
    box(g, len, 0.12, 0.02, M(stripe, 0.5), len / 2, y0 + 0.35, -W / 2 - 0.01);
    if (!cut) box(g, len, 0.12, 0.02, M(stripe, 0.5), len / 2, y0 + 0.35, W / 2 + 0.01);
    box(g, len - 0.4, 0.22, 1.0, chassis, len / 2, 1.05, 0);
    box(g, 0.12, 0.18, 2.3, chassis, 0.1, 0.75, 0);
    [-1, 1].forEach(s => { wheel(g, 1.4, s * 0.95); wheel(g, 2.65, s * 0.95); });
  }
  // Tractor cab: rear at x = 0, front at +x.
  function tractor(g, x, color) {
    const c = new THREE.Group(); c.position.x = x; g.add(c);
    const paint = M(color, 0.35, 0.3);
    box(c, 5.4, 0.3, 1.0, chassis, 1.4, 0.85, 0);
    box(c, 2.3, 2.5, 2.45, paint, 3.0, 2.35, 0);
    box(c, 0.6, 1.0, 2.4, paint, 4.3, 1.4, 0);
    const ws = box(c, 0.02, 0.9, 2.1, glassMat, 4.16, 3.0, 0);
    ws.castShadow = false;
    [-1, 1].forEach(s => {
      box(c, 1.0, 0.8, 0.02, glassMat, 3.5, 3.05, s * 1.23);
      box(c, 0.12, 0.3, 0.08, chassis, 4.25, 3.1, s * 1.35);
      cyl(c, 0.32, 0.32, 1.1, 14, rimMat, 1.6, 1.0, s * 0.85, 0, Math.PI / 2);
      box(c, 0.03, 0.18, 0.3, lightMat, 4.61, 1.25, s * 0.85);
      wheel(c, 3.7, s * 1.0); wheel(c, 0.2, s * 0.95); wheel(c, -1.0, s * 0.95);
    });
    box(c, 0.03, 0.5, 1.6, chassis, 4.61, 1.5, 0);
    box(c, 0.4, 0.15, 2.2, chassis, 4.7, 0.65, 0);
    cyl(c, 0.08, 0.08, 1.8, 10, steel, 1.75, 3.7, -1.05);
    return c;
  }
  function semi(len, cut, cabColor, withCab = true) {
    const g = new THREE.Group();
    const st = new THREE.Group(); g.add(st);
    trailer(st, len, cut);
    if (withCab) tractor(st, len - 0.3, cabColor);
    else [-1, 1].forEach(s => box(st, 0.1, 0.9, 0.1, chassis, len - 3.0, 0.5, s * 0.8));
    bake(st);
    return g;
  }
  function boxTruck(cut, color) {
    const g = new THREE.Group(); const st = new THREE.Group(); g.add(st);
    const len = 7.0, W = 2.45, y0 = 1.2, H = 2.6;
    if (!cut) box(st, len, H, W, trailerMat, len / 2, y0 + H / 2, 0);
    else {
      box(st, len, 0.08, W, trailerIn, len / 2, y0 + 0.04, 0);
      box(st, len, H, 0.05, trailerMat, len / 2, y0 + H / 2, -W / 2);
      box(st, 0.05, H, W, trailerMat, len - 0.025, y0 + H / 2, 0);
      box(st, len, 0.05, 0.08, cap, len / 2, y0 + H, -W / 2);
      box(st, 0.08, 0.05, W, cap, len - 0.025, y0 + H, 0);
      box(st, len, 0.08, 0.06, cap, len / 2, y0 + 0.04, W / 2);
    }
    box(st, len, 0.12, 0.02, M(GREEN, 0.5), len / 2, y0 + 0.35, -W / 2 - 0.01);
    box(st, len + 2.4, 0.22, 1.0, chassis, (len + 2.4) / 2, 0.95, 0);
    const paint = M(color, 0.35, 0.3);
    box(st, 1.9, 1.9, 2.3, paint, len + 1.15, 2.05, 0);
    box(st, 0.6, 0.9, 2.25, paint, len + 2.3, 1.35, 0);
    box(st, 0.02, 0.8, 2.0, glassMat, len + 2.11, 2.5, 0);
    [-1, 1].forEach(s => {
      box(st, 0.8, 0.7, 0.02, glassMat, len + 1.3, 2.5, s * 1.16);
      box(st, 0.03, 0.18, 0.3, lightMat, len + 2.61, 1.3, s * 0.8);
      wheel(st, 1.6, s * 0.95); wheel(st, len + 1.6, s * 1.0);
    });
    bake(st);
    return g;
  }
  // parked / docked trailers (static)
  const parked = [];
  const addParked = (obj, x, z, ry) => { obj.position.set(x, 0, z); obj.rotation.y = ry; scene.add(obj); parked.push(obj); };
  addParked(semi(13.6, false, '#2B2722', false), -BX - 0.35, -6, Math.PI);
  addParked(semi(13.6, false, GREEN, true), -BX - 0.35, 6, Math.PI);
  addParked(semi(13.6, false, '#E9E2D6', false), BX + 0.35, -4, 0);
  [-26, -12, 2, 16].forEach((x, i) => addParked(semi(13.6, false, ['#2B2722', '#8A2B1E', GREEN, '#E9E2D6'][i], i % 2 === 0), x, -36 + (i % 2) * 0.4, Math.PI / 2));

  // animated inbound semi (cutaway so the gaylords inside show)
  const inTruck = semi(13.6, true, ORANGE, true); scene.add(inTruck); inTruck.rotation.y = Math.PI; inTruck.scale.z = -1; // cut side toward the camera
  const inPallets = [0, 1, 2].map(() => gaylord(dyn, true));
  const PLOC = k => 1.0 + k * 1.4; // trailer-local x of pallet k (from the rear)
  // animated outbound box trucks (two identical so the loop seam is invisible)
  const outA = boxTruck(true, '#2B2722'), outB = boxTruck(true, '#2B2722');
  scene.add(outA, outB);
  const loadN = 60;
  const loadMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.5, 0.36, 0.4), M('#C49A68', 0.9), loadN);
  loadMesh.castShadow = true; outA.add(loadMesh);
  {
    const m4 = new THREE.Matrix4();
    for (let i = 0; i < loadN; i++) { const col = Math.floor(i / 15), r = i % 15; m4.makeTranslation(6.6 - col * 0.55, 1.46 + Math.floor(r / 5) * 0.37, -0.95 + (r % 5) * 0.46); loadMesh.setMatrixAt(i, m4); }
  }

  // forklift
  const fork = new THREE.Group(); dyn.add(fork);
  const carriage = new THREE.Group();
  {
    const st = new THREE.Group(); fork.add(st);
    const body = M(ORANGE, 0.45, 0.2), dark = M('#2B2722', 0.6, 0.3);
    box(st, 1.3, 0.75, 1.05, body, 0, 0.6, 0);
    box(st, 0.4, 0.85, 1.05, dark, -0.75, 0.62, 0);
    box(st, 0.6, 0.06, 0.9, dark, -0.15, 0.26, 0);
    [[-0.5, -0.5], [-0.5, 0.5], [0.45, -0.5], [0.45, 0.5]].forEach(([x, z]) => { const w = cyl(st, 0.26, 0.26, 0.2, 16, tireMat, x, 0.26, z, Math.PI / 2); w.castShadow = true; });
    [[-0.6, -0.48], [-0.6, 0.48], [0.4, -0.48], [0.4, 0.48]].forEach(([x, z]) => box(st, 0.05, 1.3, 0.05, dark, x, 1.6, z));
    box(st, 1.1, 0.05, 1.02, dark, -0.1, 2.25, 0);
    [-0.36, 0.36].forEach(z => box(st, 0.08, 2.2, 0.08, M('#3a3d42', 0.5, 0.6), 0.72, 1.15, z));
    box(st, 0.08, 0.08, 0.8, M('#3a3d42', 0.5, 0.6), 0.72, 2.22, 0);
    bake(st);
    carriage.position.set(0.8, 0, 0); fork.add(carriage);
    box(carriage, 0.05, 0.6, 0.9, dark, 0, 0.35, 0);
    [-0.26, 0.26].forEach(z => box(carriage, 1.1, 0.04, 0.12, dark, 0.55, 0.04, z));
  }

  // order picker in the storage aisle
  const picker = new THREE.Group(); dyn.add(picker);
  const pickPlat = new THREE.Group();
  {
    const st = new THREE.Group(); picker.add(st);
    box(st, 0.9, 0.35, 1.5, M(ORANGE, 0.45, 0.2), 0, 0.22, 0.3);
    [-0.3, 0.3].forEach(x => box(st, 0.08, 6.2, 0.08, M('#3a3d42', 0.5, 0.6), x, 3.3, 0.95));
    box(st, 0.7, 0.08, 0.08, M('#3a3d42', 0.5, 0.6), 0, 6.4, 0.95);
    bake(st);
    picker.add(pickPlat);
    box(pickPlat, 0.85, 0.08, 0.85, M('#2B2722', 0.6, 0.3), 0, 0.42, 0.3);
    box(pickPlat, 0.85, 0.04, 0.04, hiVis, 0, 1.45, -0.12);
    [-0.4, 0.4].forEach(x => box(pickPlat, 0.04, 1.0, 0.04, hiVis, x, 0.95, -0.12));
  }

  bake(stat); scene.add(stat);

  // ---------------------------------------------------------- people
  // Semi-realistic crew: shared body + photoreal heads, work shirts in InPhox
  // orange / charcoal / cream. One clip per worker keeps the mixers cheap.
  const kit = await loadPeople(ctx.loadGLTF, { asset: ctx.asset });
  const clip = n => kit.clips[n];
  const variants = [LOOKS.staffOrange, LOOKS.staffCharcoal, LOOKS.staffCream, LOOKS.staffCharcoalShort, LOOKS.staffOrangeLong];
  const mixers = [];
  let headN = 0;
  function person(variant, anim = 'idle', phase = 0) {
    const head = kit.HEADS[(headN * 3 + 1) % kit.HEADS.length]; headN++;
    const P = kit.person({ head, look: variants[variant], height: 1.66 + ((headN * 7) % 5) * 0.035, mixer: false, headShadow: false });
    const o = P.root;
    const mixer = new THREE.AnimationMixer(P.model);
    const act = mixer.clipAction(clip(anim)); act.play(); act.time = phase % clip(anim).duration;
    mixers.push(mixer);
    o.userData.act = act;
    return o;
  }
  const idlers = [
    [-19.3, 2.45, Math.PI, 0], [-15.6, 3.4, 0, 1], [-13.0, -9.25, 0, 2], [-10.0, -3.75, Math.PI, 0],
    [-5.1, -7.65, Math.PI, 3], [1.0, -6.0, -Math.PI / 2, 4], [4.6, -9.25, 0, 1], [7.4, -3.75, Math.PI, 2],
    [20.2, -5.55, Math.PI, 3], [20.6, -1.95, Math.PI, 0]
  ];
  idlers.forEach(([x, z, ry, v], i) => { const p = person(v, 'idle', i * 0.7); p.position.set(x, FY, z); p.rotation.y = ry; scene.add(p); });
  const driver = person(1, 'idle', 1.3); driver.position.set(-0.35, 0.22, 0); driver.rotation.y = Math.PI / 2; fork.add(driver);
  const pickerGuy = person(0, 'idle', 0.4); pickerGuy.position.set(0, 0.46, 0.3); pickerGuy.rotation.y = Math.PI / 2; pickPlat.add(pickerGuy);

  // walkers on closed loops; laps per loop is an integer so they are seamless
  function loop(pts) {
    const segs = []; let L = 0;
    for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; const l = Math.hypot(b[0] - a[0], b[1] - a[1]); segs.push({ a, b, l, s: L }); L += l; }
    return { L, at(s) { s = ((s % L) + L) % L; for (const g of segs) if (s <= g.s + g.l) { const k = (s - g.s) / g.l; return [lerp(g.a[0], g.b[0], k), lerp(g.a[1], g.b[1], k), Math.atan2(g.b[0] - g.a[0], g.b[1] - g.a[1])]; } return [pts[0][0], pts[0][1], 0]; } };
  }
  const walkers = [
    { path: loop([[-21, 6.6], [-7.5, 6.6], [-7.5, 9.6], [-21, 9.6]]), laps: 2, v: 2, off: 0 },
    { path: loop([[17, 9.4], [-6, 9.4], [-6, 6.9], [17, 6.9]]), laps: 1, v: 4, off: 10 },
    { path: loop([[-1, -1.2], [9, -1.2], [9, 1.6], [-1, 1.6]]), laps: 2, v: 1, off: 3 },
    { path: loop([[15.0, 2.6], [15.0, -9.4], [15.1, -9.4], [15.1, 2.6]]), laps: 2, v: 3, off: 6 },
    { path: loop([[-15.2, -6.5], [-7.8, -6.5], [-7.8, -6.4], [-15.2, -6.4]]), laps: 3, v: 2, off: 2 }
  ];
  walkers.forEach((w, i) => {
    w.o = person(w.v, 'walk', i * 0.3); scene.add(w.o);
    w.speed = w.path.L * w.laps / D;
    w.o.userData.act.timeScale = w.speed / 1.35;
    w.h = 0; w.init = false;
  });

  // ---------------------------------------------------------- floating labels
  const labels = [];
  function label(title, sub, color, anchor, stage, stem = 1.4) {
    const st = { title, sub, color };
    const tex = canvasTex(640, 150, (g, w, h) => {
      g.shadowColor = 'rgba(22,19,15,0.25)'; g.shadowBlur = 14; g.shadowOffsetY = 4;
      g.fillStyle = '#FFFFFF'; rr(g, 8, 8, w - 16, h - 24, 18); g.fill();
      g.shadowColor = 'transparent';
      g.strokeStyle = '#E2DACB'; g.lineWidth = 2; rr(g, 8, 8, w - 16, h - 24, 18); g.stroke();
      g.fillStyle = st.color; rr(g, 30, 34, 22, 22, 6); g.fill();
      g.fillStyle = INK; g.font = sans(40, 700); g.fillText(st.title, 70, 60);
      g.fillStyle = '#5A5249'; g.font = mono(27, 500); g.fillText(st.sub, 32, 106);
    });
    const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false, depthWrite: false, transparent: true, toneMapped: false });
    const sp = new THREE.Sprite(mat); sp.center.set(0.5, 0); sp.renderOrder = 20;
    const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0)]);
    const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: ORANGE, transparent: true, depthTest: false }));
    line.renderOrder = 19;
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), new THREE.MeshBasicMaterial({ color: ORANGE, transparent: true, depthTest: false, toneMapped: false }));
    dot.renderOrder = 19;
    scene.add(sp, line, dot);
    const L = { st, tex, sp, line, dot, anchor: anchor.clone(), stage, stem, w: 0,
      set(sub, title) { if (sub !== st.sub || (title && title !== st.title)) { st.sub = sub; if (title) st.title = title; tex.userData.redraw(); } } };
    labels.push(L); return L;
  }
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const lbRecv = label('Lot L-0418', '312 units · scanned 0', ORANGE, V(-21.6, FY + 1.2, -4.2), 1, 1.6);
  const lbTest = label('Bench T-1 · 52 on test', 'Pass 0 · Fail 0', PASS, V(-11.6, FY + 1.3, -8.4), 2, 1.5);
  const lbErase = label('Erased · certificate issued', 'Purge verified · EC-0418', PASS, V(-5.05, FY + 2.3, -9.4), 3, 1.2);
  const lbGrade = label('Graded A', '6 photos · cosmetic 94', PASS, V(-0.4, FY + 2.0, -8.4), 4, 1.0);
  const lbRepair = label('Ticket R-2207 · screen', 'Repaired · back to test', ORANGE, V(7.4, FY + 1.5, -8.4), 5, 1.3);
  const lbStore = label('Bin 06-B3 · 41 units', '128 GB · grade A · ready', ORANGE, hiBin.position.clone().add(V(0, 0.25, 0)), 6, 1.6);
  const lbShip = label('Order SO-1182', '64 units · loading', GREEN, V(26, 4.2, 4), 7, 1.4);
  const lbTruck = label('Inbound · 3 gaylords', 'Manifest matched', ORANGE, V(-30, 4.2, 0), 1, 1.2);

  // ---------------------------------------------------------- camera path
  // stage: target, radius, azimuth (0 = from +z, + toward +x), elevation
  const STAGES = [
    { a: 0, b: 2.5, tgt: [0, 2, 0.5], r: 66, az: 0.32, el: 0.56 },        // 0 overview
    { a: 4.5, b: 10, tgt: [-21.5, 1.6, -2.0], r: 21, az: 0.36, el: 0.6 }, // 1 receive
    { a: 11.5, b: 16, tgt: [-11.6, 1.9, -6.6], r: 11, az: -0.18, el: 0.48 },// 2 test
    { a: 17.5, b: 21.5, tgt: [-5.0, 2.1, -8.4], r: 9.2, az: 0.16, el: 0.44 },// 3 erase
    { a: 23, b: 27, tgt: [0.4, 2.1, -7.6], r: 7.6, az: -0.22, el: 0.34 },   // 4 grade
    { a: 28.5, b: 32.5, tgt: [6.0, 2.0, -6.5], r: 10.5, az: 0.28, el: 0.55 },// 5 repair
    { a: 34, b: 38, tgt: [12.4, 3.7, -4.6], r: 13.5, az: -0.02, el: 0.3 },     // 6 store
    { a: 39.5, b: 43.5, tgt: [25.5, 1.8, 2.5], r: 24, az: 0.2, el: 0.6 }      // 7 ship
  ];
  const camState = { tgt: new THREE.Vector3(), r: 0, az: 0, el: 0 };
  function camAt(t) {
    // find hold or transition
    const n = STAGES.length;
    for (let i = 0; i < n; i++) {
      const s = STAGES[i], nx = STAGES[(i + 1) % n];
      const nA = i + 1 < n ? nx.a : D + nx.a;
      if (t >= s.a && t < s.b) { // hold, with a slow drift
        const k = (t - s.a) / (s.b - s.a);
        return { tgt: s.tgt, r: s.r * (1 - 0.06 * k), az: s.az + 0.07 * (k - 0.5), el: s.el, stage: i, w: 1 };
      }
      if (t >= s.b && t < nA) {
        const k = smoother((t - s.b) / (nA - s.b));
        const big = Math.abs(nx.r - s.r) > 20 ? 0 : 1;
        const arc = Math.sin(Math.PI * k);
        return {
          tgt: s.tgt.map((v, j) => lerp(v, nx.tgt[j], k)),
          r: Math.exp(lerp(Math.log(s.r * 0.94), Math.log(nx.r), k)) * (1 + 0.18 * arc * big),
          az: lerp(s.az + 0.035, nx.az - 0.035, k), el: lerp(s.el, nx.el, k) + 0.1 * arc * big,
          stage: k < 0.5 ? i : (i + 1) % n, w: Math.abs(k - 0.5) * 2
        };
      }
    }
    const s = STAGES[0];
    return { tgt: s.tgt, r: s.r, az: s.az, el: s.el, stage: 0, w: 1 };
  }
  let aspect = ctx.width / ctx.height, viewH = ctx.height;
  const ptr = { x: 0, y: 0, sx: 0, sy: 0 };

  // ---------------------------------------------------------- timeline bits
  // inbound truck rear offset from the dock face (0 = docked)
  const inOff = t => {
    const tt = (t - 40 + D) % D; // arrival runs 40 s -> 4.5 s across the loop seam
    if (tt < 12.5) return 60 * Math.pow(1 - smooth(tt / 12.5), 1.5);
    if (t < 29) return 0;
    if (t < 35) return 60 * Math.pow((t - 29) / 6, 2);
    return 60;
  };
  const DOCK_IN = -BX - 0.35;
  // forklift segments (body centre C, heading a) for 3 pallets
  const H0 = [-19.6, -1.3], E0 = [-21.6, 0];
  const SLOT = k => [-17.2, -6.4 + k * 1.6];
  const fsegs = [];
  {
    let t0 = 5.2;
    const add = (from, to, dur, a, lift0, lift1, ev) => { fsegs.push({ t0, t1: t0 + dur, from, to, a, lift0, lift1, ev }); t0 += dur; };
    for (let k = 0; k < 3; k++) {
      const px = DOCK_IN - PLOC(k);
      const P = [px + 1.35, 0];
      const S = SLOT(k), A = [S[0] - 1.35 - 1.6, S[1]], F = [S[0] - 1.35, S[1]];
      const hAE = Math.atan2(-(A[1] - E0[1]), A[0] - E0[0]);
      add(H0, E0, 0.9, Math.PI, 0.08, 0.08);
      add(E0, P, 1.0, Math.PI, 0.08, 0.08);
      add(P, P, 0.5, Math.PI, 0.08, 0.3, { pick: k });
      add(P, E0, 1.0, Math.PI, 0.3, 0.3);
      add(E0, A, 1.1, hAE, 0.3, 0.3);
      add(A, F, 0.6, 0, 0.3, 0.3);
      add(F, F, 0.4, 0, 0.3, 0.08, { drop: k });
      add(F, A, 0.6, 0, 0.08, 0.08);
      add(A, H0, 1.0, Math.atan2(-(H0[1] - A[1]), H0[0] - A[0]) + Math.PI, 0.08, 0.08);
      t0 += 0.2;
    }
  }
  const forkState = { a: Math.PI };
  function forkAt(t) {
    for (const s of fsegs) if (t >= s.t0 && t < s.t1) {
      const k = smooth((t - s.t0) / (s.t1 - s.t0));
      return { x: lerp(s.from[0], s.to[0], k), z: lerp(s.from[1], s.to[1], k), a: s.a, lift: lerp(s.lift0, s.lift1, k), seg: s };
    }
    return { x: H0[0], z: H0[1], a: Math.PI, lift: 0.08, seg: null };
  }
  const pickT = fsegs.filter(s => s.ev && s.ev.pick !== undefined).map(s => s.t1);
  const dropT = fsegs.filter(s => s.ev && s.ev.drop !== undefined).map(s => s.t1);

  // outbound box truck path: rear point moves +x then turns toward the road (+z)
  const DOCK_OUT = BX + 0.35;
  function outPath(s) { // s metres travelled from the dock
    const R = 10, s1 = 12, s2 = s1 + Math.PI / 2 * R;
    if (s < s1) return [DOCK_OUT + s, 4, 0];
    if (s < s2) { const th = (s - s1) / R; return [DOCK_OUT + s1 + R * Math.sin(th), 4 + R * (1 - Math.cos(th)), -th]; }
    return [DOCK_OUT + s1 + R, 4 + R + (s - s2), -Math.PI / 2];
  }
  // the truck's reference point is its rear; the body extends along +x local (front)

  // ---------------------------------------------------------- update
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), vS = new THREE.Vector3(1, 1, 1), vP = new THREE.Vector3();
  const cA = new THREE.Color(), cOff = new THREE.Color('#141414'), cPass = new THREE.Color(PASS), cFail = new THREE.Color(FAIL), cTest = new THREE.Color(ORANGE), cWipe = new THREE.Color('#F6F2EA'), cWipeLo = new THREE.Color('#4A4238');
  const camRight = new THREE.Vector3();
  const hash = (i, c) => { const x = Math.sin(i * 127.1 + c * 311.7) * 43758.5453; return x - Math.floor(x); };
  let lastLbl = -1;

  function update(dt, t) {
    // camera
    const c = camAt(t);
    ptr.sx += (ptr.x - ptr.sx) * Math.min(1, dt * 2.5); ptr.sy += (ptr.y - ptr.sy) * Math.min(1, dt * 2.5);
    const narrow = aspect < 1.25 ? Math.pow(1.25 / aspect, 0.95) : 1;
    const r = c.r * narrow, az = c.az + ptr.sx * 0.06, el = Math.max(0.12, c.el + ptr.sy * 0.04);
    camera.position.set(c.tgt[0] + r * Math.sin(az) * Math.cos(el), c.tgt[1] + r * Math.sin(el), c.tgt[2] + r * Math.cos(az) * Math.cos(el));
    camera.lookAt(c.tgt[0], c.tgt[1] - (narrow > 1 ? r * 0.07 : 0), c.tgt[2]);
    camera.updateMatrixWorld();

    ghostMats.forEach(m => { m.uniforms.uTime.value = t; });
    mixers.forEach(m => m.update(dt));

    // inbound truck
    const off = inOff(t);
    inTruck.position.set(DOCK_IN - off, 0, 0);
    inTruck.visible = off < 59;
    // pallets: in truck until picked, carried, staged until 33 s, then back in the (hidden) truck
    const f = forkAt(t);
    if (dt > 0.2) forkState.a = f.a; forkState.a = lerpAngle(forkState.a, f.a, Math.min(1, dt * 5)); const fa = forkState.a;
    fork.position.set(f.x, FY, f.z); fork.rotation.y = fa;
    carriage.position.y = f.lift;
    const fdx = Math.cos(fa), fdz = -Math.sin(fa);
    inPallets.forEach((p, k) => {
      if (t < pickT[k] || t >= 36) { p.position.set(DOCK_IN - off - PLOC(k), 1.29, 0); p.rotation.y = 0; p.visible = inTruck.visible; }
      else if (t < dropT[k]) { p.position.set(f.x + fdx * 1.35, FY + f.lift - 0.08 + 0.05, f.z + fdz * 1.35); p.rotation.y = fa; p.visible = true; }
      else { const S = SLOT(k); p.position.set(S[0], FY, S[1]); p.rotation.y = 0; p.visible = t < 33; }
    });
    // inbound label rides on the truck
    lbTruck.anchor.set(DOCK_IN - off - 7, 4.1, 0);

    // outbound trucks: A docked 0-40 then departs; B arrives 43-48 (identical)
    const sA = t < 40 ? 0 : 75 * Math.pow(clamp01((t - 40) / 6.5), 2.1);
    const pA = outPath(sA); outA.position.set(pA[0], 0, pA[1]); outA.rotation.y = pA[2]; outA.visible = t < 47;
    const bk = clamp01((t - 43) / 5); const sB = 40 * Math.pow(1 - bk, 2);
    outB.position.set(DOCK_OUT + sB, 0, 4); outB.visible = t >= 43;
    loadMesh.count = Math.min(loadN, Math.floor(clamp01((t - 1.5) / 36) * loadN));
    lbShip.anchor.set(pA[0] + 3.5 * Math.cos(pA[2]), 4.0, pA[1] - 3.5 * Math.sin(pA[2]));

    // totes on the line
    for (let i = 0; i < toteN; i++) {
      const s = ((i / toteN) * toteL + (toteL / D) * t) % toteL;
      const e = Math.min(1, s / 0.4, (toteL - s) / 0.4);
      vP.set(TC.x0 + s, TC.y + 0.12, TC.z); vS.set(1, Math.max(0.001, e), 1); q.identity();
      m4.compose(vP, q, vS); totes.setMatrixAt(i, m4);
      vP.y = TC.y + 0.12 + 0.1 * e; m4.compose(vP, q, vS.set(e || 0.001, 1, e || 0.001)); toteTops.setMatrixAt(i, m4);
    }
    totes.instanceMatrix.needsUpdate = true; toteTops.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < boxN; i++) {
      const s = ((i / boxN) * boxL + (boxL * 4 / D) * t) % boxL;
      const e = Math.min(1, s / 0.3, (boxL - s) / 0.5);
      vP.set(OC.x0 + s, OC.y + 0.15, OC.z); m4.compose(vP, q.identity(), vS.set(Math.max(0.001, e), Math.max(0.001, e), Math.max(0.001, e)));
      shipBoxes.setMatrixAt(i, m4);
    }
    shipBoxes.instanceMatrix.needsUpdate = true;

    // test screens: 12 s cycles (4 per loop)
    let pass = 0, fail = 0;
    testSlots.forEach((s, i) => {
      const P = 12, x = t + s.off, cyc = Math.floor(x / P) % 4, u = (x % P) / P;
      if (u < 0.06) cA.copy(cOff);
      else if (u < 0.6) cA.copy(cTest).multiplyScalar(0.55 + 0.45 * Math.sin(t * 5 + i));
      else if (hash(i, cyc) < 0.1) { cA.copy(cFail); if (s.bench === 0) fail++; }
      else { cA.copy(cPass); if (s.bench === 0) pass++; }
      testScreens.setColorAt(i, cA);
    });
    testScreens.instanceColor.needsUpdate = true;
    // erase screens: 16 s cycles
    let wiped = 0;
    eraseSlots.forEach((s, i) => {
      const x = t + s.off, u = (x % 16) / 16;
      if (u < 0.05) cA.copy(cOff);
      else if (u < 0.72) cA.copy(cWipeLo).lerp(cWipe, ((u - 0.05) / 0.67) * (0.6 + 0.4 * Math.sin(t * 3 + i * 0.7)));
      else { cA.copy(cPass); wiped++; }
      eraseScreens.setColorAt(i, cA);
    });
    eraseScreens.instanceColor.needsUpdate = true;
    // certificate slides out of the printer every 8 s
    const cp = (t % 8) / 8; certPaper.position.z = -6.75 + 0.22 * smooth(cp * 3); certPaper.visible = cp < 0.85;

    // grading booth: turntable spin + flash every 3 s (16 per loop)
    turn.rotation.y = (t / D) * Math.PI * 2 * 6;
    gPhone.rotation.x = -0.2;
    const fl = (t % 3) / 3; flash.intensity = fl < 0.05 ? 18 * (1 - fl / 0.05) : 0;

    // order picker: 24 s cycle (two per loop)
    {
      const u = (t % 24) / 24;
      let z, h;
      if (u < 0.25) { z = lerp(2.0, -5.2, smooth(u / 0.25)); h = 0; }
      else if (u < 0.75) { z = -5.2; h = u < 0.45 ? 2.2 * smooth((u - 0.25) / 0.2) : u < 0.55 ? 2.2 : 2.2 * (1 - smooth((u - 0.55) / 0.2)); }
      else { z = lerp(-5.2, 2.0, smooth((u - 0.75) / 0.25)); h = 0; }
      picker.position.set(12.2, FY, z); picker.rotation.y = 0; pickPlat.position.y = h;
      hiBin.material.opacity = (u > 0.4 && u < 0.6 ? 0.55 : 0.18) * (0.75 + 0.25 * Math.sin(t * 6));
    }

    // walkers
    walkers.forEach(w => {
      const [x, z, h] = w.path.at(w.off + w.speed * t);
      w.o.position.set(x, FY, z);
      if (!w.init || dt > 0.2) { w.h = h; w.init = true; }
      w.h = lerpAngle(w.h, h, Math.min(1, dt * 6)); w.o.rotation.y = w.h;
    });

    // labels: counters + emphasis
    const recvN = Math.round(312 * smooth((t - 4.5) / 8));
    const tick = Math.floor(t * 4);
    if (tick !== lastLbl) {
      lastLbl = tick;
      lbRecv.set(`312 units · scanned ${recvN}`);
      lbTest.set(`Pass ${pass} · Fail ${fail} · testing ${26 * 2 - pass - fail}`);
      lbErase.set(`Purge verified · ${wiped} of ${eraseSlots.length} wiped`);
      lbShip.set(t < 40 ? `64 units · ${Math.min(64, Math.round(64 * clamp01((t - 1.5) / 36)))} loaded` : '64 units · shipped · tracking sent');
      lbTruck.set(t < 4.5 || t > 38 ? 'Arriving · door 2' : t < 27 ? 'At door 2 · unloading' : 'Empty · released');
    }
    const small = aspect < 1.25;
    labels.forEach(L => {
      let w;
      w = c.stage !== 0 && L.stage === c.stage ? 1 : 0;
      if (L === lbTruck && c.stage !== 1 && c.stage !== 0) w = 0;
      if (L === lbTruck && t > 34 && t < 40) w = 0;
      L.w += (w - L.w) * Math.min(1, dt * 4);
      const vis = L.w > 0.02;
      L.sp.visible = L.line.visible = L.dot.visible = vis;
      if (!vis) return;
      const dist = camera.position.distanceTo(L.anchor);
      const px = (small ? 175 : 240) * (c.stage === 0 ? 0.72 : 1);
      const base = px / viewH * 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const stem = L.stem * base * 0.25;
      L.sp.position.copy(L.anchor).add(vP.set(0, stem, 0));
      // keep the card on screen: nudge it sideways if it would clip an edge
      vP.copy(L.sp.position).project(camera);
      const half = px / (viewH * aspect) + 0.03;
      const dx = vP.x - half < -1 ? -1 - (vP.x - half) : vP.x + half > 1 ? 1 - (vP.x + half) : 0;
      if (dx) L.sp.position.addScaledVector(camRight.setFromMatrixColumn(camera.matrixWorld, 0), dx * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * aspect);
      L.sp.scale.set(base, base * 150 / 640, 1);
      L.sp.material.opacity = L.w;
      L.line.position.copy(L.anchor); L.line.scale.set(1, stem, 1); L.line.material.opacity = L.w;
      L.dot.position.copy(L.anchor); L.dot.scale.setScalar(base / 2.4); L.dot.material.opacity = L.w;
    });
  }

  return {
    scene, camera, duration: D,
    captions: [
      { at: 0, title: 'One floor, every device tracked', body: 'Thousands of phones a day: receive, test, erase, grade, repair, store and ship, all in InPhox.' },
      { at: 3.6, title: 'Receive lots against the manifest', body: 'Trucks unload gaylords; every IMEI is scanned to the lot, so nothing goes missing.' },
      { at: 10.6, title: 'Test dozens of phones at once', body: 'Benches run full diagnostics; pass and fail land on each device record automatically.' },
      { at: 16.6, title: 'Certified erasure for every device', body: 'Each phone is wiped and verified, and its certificate is filed with its history.' },
      { at: 22.1, title: 'Grade with photos, not guesswork', body: 'The photo booth captures every unit; graders set cosmetic grade in one tap.' },
      { at: 27.6, title: 'Repair what failed, tracked', body: 'Failed units route to technicians, with parts and labor tracked to the device.' },
      { at: 33.1, title: 'Store by bin, find instantly', body: 'Every device has a rack, shelf and bin, so pickers go straight to it.' },
      { at: 38.6, title: 'Pick, pack and ship orders', body: 'Orders pick by IMEI, pack, and load out with tracking sent to the buyer.' },
      { at: 44.2, title: 'Next truck, same flow', body: 'Every unit reconciles from dock to dock, shift after shift.' }
    ],
    update,
    resize(w, h) { aspect = w / h; viewH = h; },
    pointer(e) {
      if (e.type === 'leave') { ptr.x = 0; ptr.y = 0; return; }
      if (e.type === 'move') { ptr.x = e.x; ptr.y = e.y; }
    },
    dispose() {
      dead = true;
      mixers.forEach(m => { m.stopAllAction(); m.uncacheRoot(m.getRoot()); });
      kit.dispose();
      const mats = new Set(), geos = new Set();
      scene.traverse(o => {
        if (o.geometry && !o.isSkinnedMesh) geos.add(o.geometry);
        if (o.geometry && o.isSkinnedMesh) geos.add(o.geometry);
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => mats.add(m));
        if (o.isInstancedMesh) o.dispose();
      });
      geos.forEach(g => g.dispose());
      mats.forEach(m => { for (const k of ['map', 'emissiveMap']) if (m[k]) m[k].dispose(); m.dispose(); });
      matCache.forEach(m => m.dispose());
      palletGeo.dispose(); gaylordGeo.dispose(); pileGeo.dispose(); upG.dispose(); binG.dispose(); toteGeo.dispose(); tireGeo.dispose(); rimGeo.dispose();
      extra.forEach(x => x.dispose());
      scene.environment = null;
    }
  };
}
