// One continuous 3D world for the 7-step story, driven by a single progress
// value P in [0, 7]. Everything is a pure function of P (plus a little idle
// time for life), so scrolling back plays the story in reverse.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { makePhone, makeTote, makeRollerConveyor, makeRacks, makeShippingBox, makeTools, makeMacStudio, makeStand, PHONE_STYLES, PW, PH, PD, MAT } from './models.js';
import { screenTexture, cardTexture, matTexture, sortTableTexture, shippingLabelTexture, toteLabelTexture, rackBoxTexture, glowSprite, LANES } from './textures.js';
import { buildEarth, LOCATIONS, TOUR, facing, latLonToVec, R as ER } from './earth.js';

// ---- small math helpers -------------------------------------------------
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const seg = (t, a, b) => clamp((t - a) / (b - a));
const sm = x => x * x * (3 - 2 * x);
const ease = (t, a, b) => sm(seg(t, a, b));
const easeOut = (t, a, b) => { const x = seg(t, a, b); return 1 - (1 - x) * (1 - x) * (1 - x); };
const easeIn = (t, a, b) => { const x = seg(t, a, b); return x * x * x; };
const lerp = (a, b, t) => a + (b - a) * t;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const vlerp = (a, b, t, out = new THREE.Vector3()) => out.copy(a).lerp(b, t);

// Device data shared with the HTML overlays.
export const DEVICES = [
  { model: 'iPhone 14 Pro', storage: '256 GB', color: 'Deep Purple', carrier: 'Unlocked', grade: 'A', imei: '356798114520331', result: 'PASS 42/42', kind: 'pass', lane: 'ship' },
  { model: 'iPhone 13', storage: '128 GB', color: 'Midnight', carrier: 'Unlocked', grade: 'B', imei: '353012119874205', result: 'FAIL · Battery 71%', kind: 'fail', lane: 'repair' },
  { model: 'Galaxy S23', storage: '256 GB', color: 'Cream', carrier: 'Verizon', grade: 'A', imei: '350917266013448', result: 'PASS 42/42', kind: 'pass', lane: 'sales' },
  { model: 'iPhone 12', storage: '64 GB', color: 'Blue', carrier: 'Unlocked', grade: 'B', imei: '356702108836129', result: 'PASS 42/42', kind: 'pass', lane: 'storage' },
  { model: 'Pixel 7', storage: '128 GB', color: 'Obsidian', carrier: 'Unlocked', grade: 'A', imei: '358240501177962', result: 'PASS 42/42', kind: 'pass', lane: 'ship' },
  { model: 'iPhone 14 Pro', storage: '128 GB', color: 'Silver', carrier: 'AT&T', grade: 'B', imei: '356798114598774', result: 'FAIL · Rear camera', kind: 'fail', lane: 'repair' },
  { model: 'iPhone 11', storage: '64 GB', color: 'White', carrier: 'Unlocked', grade: 'B', imei: '353988103452017', result: 'PASS 42/42', kind: 'pass', lane: 'sales' },
  { model: 'Galaxy S22 Ultra', storage: '256 GB', color: 'Burgundy', carrier: 'Verizon', grade: 'B', imei: '350211337650182', result: 'PASS 42/42', kind: 'pass', lane: 'storage' },
  { model: 'iPhone 13', storage: '128 GB', color: 'Red', carrier: 'T-Mobile', grade: 'C', imei: '353012119802911', result: 'PASS 42/42', kind: 'pass', lane: 'ship' },
  { model: 'Pixel 8 Pro', storage: '256 GB', color: 'Bay', carrier: 'Unlocked', grade: 'A', imei: '358240512230048', result: 'CHECK · Activation lock', kind: 'lock', lane: 'qc' },
  { model: 'iPhone 14 Pro', storage: '256 GB', color: 'Space Black', carrier: 'Verizon', grade: 'A', imei: '356798114520349', result: 'PASS 42/42', kind: 'pass', lane: 'sales' },
  { model: 'iPhone 12', storage: '128 GB', color: 'White', carrier: 'Unlocked', grade: 'A', imei: '356702108811042', result: 'PASS 42/42', kind: 'pass', lane: 'storage' }
];
const KCOL = { pass: '#3FB27F', fail: '#E5574B', lock: '#E39B0B' };

// Bench layout (cm)
const BENCH_Y = 90;
const MAT_PHONE = V(0, BENCH_Y + 0.62 + PD / 2, 6);
const STAND_Z = -26, STAND_SP = 11;
const MAC_POS = V(86, BENCH_Y, 2);
const CONV_Z = -92, CONV_Y = BENCH_Y + 4;
// Sort table
const TABLE = V(0, BENCH_Y, 420), TK = 0.5;
const tpos = (x, z, y = 0) => V(TABLE.x + x * TK, BENCH_Y + 0.6 + y, TABLE.z + z * TK);
const TRAY_SLOT = i => tpos(-39 + (i % 4) * 26, -98 + Math.floor(i / 4) * 34);
const laneIndex = k => LANES.findIndex(l => l.key === k);
const LANE_SLOT = (lane, n) => tpos(-152 + laneIndex(lane) * 76 - 18 + (n % 3) * 18, 56 + Math.floor(n / 3) * 36);
const BOX_POS = V(132, BENCH_Y, 462);
const RUN_Z = 462;

export function createWorld(canvas, { onEarthReady } = {}) {
  const TEX = TEX_CACHE;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  const bg = new THREE.Color('#1b1713');
  scene.background = bg;
  scene.fog = new THREE.Fog('#1b1713', 520, 2600);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  const camera = new THREE.PerspectiveCamera(34, 1, 1, 9000);

  // Lights: warm overhead key with shadows + cool fill.
  scene.add(new THREE.HemisphereLight('#fff1dc', '#2a231c', 0.75));
  const key = new THREE.DirectionalLight('#ffe7c7', 2.1);
  key.position.set(120, 420, 260); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -260, right: 260, top: 260, bottom: -260, near: 50, far: 1200 });
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.6;
  scene.add(key); scene.add(key.target);
  const fill = new THREE.DirectionalLight('#a9c4ff', 0.45); fill.position.set(-300, 200, -100); scene.add(fill);

  const loader = new THREE.TextureLoader();
  const concrete = loader.load('assets/story/concrete.jpg', t => { t.colorSpace = THREE.SRGBColorSpace; });
  concrete.wrapS = concrete.wrapT = THREE.RepeatWrapping; concrete.repeat.set(60, 60); concrete.anisotropy = 8;
  const kraft = loader.load('assets/story/kraft.jpg', t => { t.colorSpace = THREE.SRGBColorSpace; });

  // ---- floor ----
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12000, 12000), new THREE.MeshStandardMaterial({ map: concrete, color: '#8d857b', roughness: 0.78, metalness: 0.05 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  // painted aisle lines
  const lineM = new THREE.MeshStandardMaterial({ color: '#d9a21a', roughness: 0.6 });
  [[-150, 0, 2200, 6, 0], [700, RUN_Z + 70, 6000, 6, 0], [700, RUN_Z - 70, 6000, 6, 0]].forEach(([x, z, w, d]) => {
    const l = new THREE.Mesh(new THREE.PlaneGeometry(w, d), lineM); l.rotation.x = -Math.PI / 2; l.position.set(x + (x === -150 ? 0 : 0), 0.3, z); scene.add(l);
  });

  // ---- workbench ----
  const bench = new THREE.Group(); scene.add(bench);
  const wood = new THREE.MeshStandardMaterial({ color: '#6b4f36', roughness: 0.7 });
  const top = new THREE.Mesh(new THREE.BoxGeometry(250, 4, 110), wood); top.position.set(0, BENCH_Y - 2, -10); top.receiveShadow = true; top.castShadow = true; bench.add(top);
  [[-118, -60], [118, -60], [-118, 40], [118, 40]].forEach(([x, z]) => { const l = new THREE.Mesh(new THREE.BoxGeometry(5, BENCH_Y - 4, 5), MAT.darkMetal); l.position.set(x, (BENCH_Y - 4) / 2, z); l.castShadow = true; bench.add(l); });
  const mat = new THREE.Mesh(new THREE.BoxGeometry(124, 0.6, 76), new THREE.MeshStandardMaterial({ map: matTexture(), roughness: 0.9 }));
  mat.position.set(0, BENCH_Y + 0.3, 4); mat.receiveShadow = true; bench.add(mat);
  const tools = makeTools(); tools.position.y = BENCH_Y; bench.add(tools);
  const mac = makeMacStudio(); mac.position.copy(MAC_POS); bench.add(mac);
  const stand = makeStand(12, STAND_SP); stand.position.set(0, BENCH_Y, STAND_Z); bench.add(stand);
  // overhead lamp
  const lamp = new THREE.Mesh(new THREE.CylinderGeometry(30, 36, 6, 40, 1, true), new THREE.MeshStandardMaterial({ color: '#2b2b2b', side: THREE.DoubleSide, roughness: 0.5, metalness: 0.6 }));
  lamp.position.set(0, 290, -10); scene.add(lamp);
  const lampGlow = new THREE.Mesh(new THREE.CircleGeometry(29, 40), new THREE.MeshBasicMaterial({ color: '#fff3dc' })); lampGlow.rotation.x = Math.PI / 2; lampGlow.position.set(0, 287.5, -10); scene.add(lampGlow);

  // ---- intake conveyor + totes ----
  const conv = makeRollerConveyor(1400, 38, { startX: -700 }); conv.position.set(0, CONV_Y, CONV_Z); scene.add(conv);
  const totes = [];
  const lotPhones = [];
  for (let k = 0; k < 5; k++) {
    const t = makeTote(k === 0 ? toteLabelTexture('L-0418 · 312') : toteLabelTexture('L-04' + (19 + k))); t.position.set(0, CONV_Y, CONV_Z); scene.add(t);
    for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) {
      if (k === 0 && r === 1 && c === 2) continue; // the picked phone is separate
      const st = PHONE_STYLES[(k * 7 + r * 5 + c) % PHONE_STYLES.length];
      const p = makePhone(st, OFF(), { lite: true });
      p.position.set(-17.2 + c * 8.6, 0.9 + PH / 2, (r ? 6 : -6)); p.rotation.y = 0; t.add(p);
    }
    totes.push(t);
  }
  // picked phone (scene 1-3): the iPhone 14 Pro
  const hero = makePhone(PHONE_STYLES[0], OFF());
  scene.add(hero);

  // ---- hand ----
  const handGrip = new THREE.Group(); scene.add(handGrip);
  let hand = null;
  new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load('assets/story/hand.glb', g => {
    hand = g.scene; const s = 13;
    hand.scale.setScalar(s);
    hand.traverse(o => { if (o.isMesh) { o.castShadow = true; o.material.roughness = 0.55; } });
    const inner = new THREE.Group(); inner.add(hand);
    hand.rotation.set(Math.PI, 0, 0);
    hand.position.set(0, 0.7 * s, 0.24 * s);
    handGrip.add(inner);
    handGrip.userData.inner = inner;
  });

  // ---- connect: cable from mat phone to mac ----
  const portWorld = V(MAT_PHONE.x, MAT_PHONE.y, MAT_PHONE.z + PH / 2);
  const cableCurve = new THREE.CatmullRomCurve3([
    V(portWorld.x, portWorld.y, portWorld.z + 16), V(portWorld.x + 4, BENCH_Y + 1.6, portWorld.z + 30),
    V(30, BENCH_Y + 1.4, 40), V(62, BENCH_Y + 1.4, 26), V(MAC_POS.x - 12, BENCH_Y + 1.4, 16), V(MAC_POS.x - 6, BENCH_Y + 3.4, MAC_POS.z + 9.9)
  ]);
  const cable = new THREE.Mesh(new THREE.TubeGeometry(cableCurve, 160, 0.55, 12, false), MAT.cable); cable.castShadow = true; scene.add(cable);
  const plug = new THREE.Group();
  const boot = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.7, 3.2), new THREE.MeshStandardMaterial({ color: '#f4f2ec', roughness: 0.4 })); boot.position.z = 1.6; plug.add(boot);
  const tip = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.26, 0.9), MAT.steel); tip.position.z = -0.45; plug.add(tip);
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 16, 12), MAT.cable); tail.rotation.x = Math.PI / 2; tail.position.z = 3.2 + 8; plug.add(tail);
  scene.add(plug);
  const packetTex = glowSprite('#EB5E12');
  const packets = Array.from({ length: 14 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: packetTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(3.4); scene.add(s); return s; });

  // ---- diagnose: 11 more phones drop into the stand ----
  const standPhones = DEVICES.map((d, i) => {
    if (i === 0) return hero;
    const p = makePhone(PHONE_STYLES[i], OFF()); scene.add(p); return p;
  });
  const standSlot = i => V(-((12 - 1) * STAND_SP) / 2 + i * STAND_SP, BENCH_Y + 4 + PH / 2, STAND_Z + 1.5);

  // ---- route: cards on the sort table ----
  const sortTable = new THREE.Group(); scene.add(sortTable);
  const st = new THREE.Mesh(new THREE.BoxGeometry(400 * TK, 4, 260 * TK), [MAT.darkMetal, MAT.darkMetal, new THREE.MeshStandardMaterial({ map: sortTableTexture(), roughness: 0.85 }), MAT.darkMetal, MAT.darkMetal, MAT.darkMetal]);
  st.position.set(TABLE.x, BENCH_Y - 1.4, TABLE.z); st.receiveShadow = true; sortTable.add(st);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { const l = new THREE.Mesh(new THREE.BoxGeometry(5, BENCH_Y - 4, 5), MAT.darkMetal); l.position.set(TABLE.x + a * 95, (BENCH_Y - 4) / 2, TABLE.z + b * 60); sortTable.add(l); });
  // a side shelf where the shipping box waits, joined to the runway
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(60, 4, 60), MAT.darkMetal); shelf.position.set(BOX_POS.x, BENCH_Y - 2, BOX_POS.z); shelf.receiveShadow = true; scene.add(shelf);

  const cards = DEVICES.map((d, i) => {
    const col = KCOL[d.kind];
    const laneName = LANES.find(l => l.key === d.lane);
    const tex = cardTexture({ ...d, col, sub: d.kind === 'pass' ? 'Erased · cert ready' : d.kind === 'fail' ? 'Needs repair' : 'Second look', lane: laneName.name + ' · ' + laneName.dest });
    const ph = makePhone(PHONE_STYLES[i], resultTex(d.kind, d.grade), { card: tex, repairable: i === 1 });
    scene.add(ph); return ph;
  });
  const laneCount = {}; const laneSlotOf = DEVICES.map(d => { const n = laneCount[d.lane] || 0; laneCount[d.lane] = n + 1; return n; });

  // ---- ship: box + runway ----
  const box = makeShippingBox(kraft, shippingLabelTexture()); box.position.copy(BOX_POS); scene.add(box);
  const prefilled = [];
  const boxSlot = i => V((-1.5 + (i % 4)) * 11, 0.5 + PH / 2, (i < 4 ? -5.5 : 5.5));
  [3, 5, 6, 7, 1].forEach((slot, k) => { const p = makePhone(PHONE_STYLES[(k * 3 + 2) % 12], OFF(), { lite: true }); p.position.copy(boxSlot(slot)); box.add(p); prefilled.push(p); });
  const shipOrder = DEVICES.map((d, i) => i).filter(i => DEVICES[i].lane === 'ship'); // 0,4,8
  const shipSlots = [0, 2, 4];
  const runway = makeRollerConveyor(5200, 40, { startX: 0, spacing: 9 }); runway.position.set(BOX_POS.x + 20, CONV_Y - 2, RUN_Z); scene.add(runway);
  const racksL = makeRacks({ x0: 260, x1: 3150, z: RUN_Z - 230, boxTex: rackBoxTexture(4) }); scene.add(racksL);
  const racksR = makeRacks({ x0: 260, x1: 3150, z: RUN_Z + 230, boxTex: rackBoxTexture(9) }); scene.add(racksR);
  const racksBack = makeRacks({ x0: -1100, x1: 1100, z: -430, boxTex: rackBoxTexture(2) }); scene.add(racksBack);
  // the bay door at the far end of the runway: daylight
  const DOOR_X = 3200;
  const skyTex = (() => { const c = document.createElement('canvas'); c.width = 16; c.height = 256; const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#7fb2ff'); gr.addColorStop(0.7, '#dcebff'); gr.addColorStop(1, '#fff6e6'); g.fillStyle = gr; g.fillRect(0, 0, 16, 256); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const door = new THREE.Mesh(new THREE.PlaneGeometry(520, 560), new THREE.MeshBasicMaterial({ map: skyTex, fog: false }));
  door.rotation.y = -Math.PI / 2; door.position.set(DOOR_X, 280, RUN_Z); scene.add(door);
  const wallM = new THREE.MeshStandardMaterial({ color: '#2a2622', roughness: 0.9 });
  [[RUN_Z - 1400, 2280], [RUN_Z + 1400, 2280]].forEach(([z, w]) => { const wl = new THREE.Mesh(new THREE.BoxGeometry(20, 1400, w), wallM); wl.position.set(DOOR_X + 10, 700, z); scene.add(wl); });
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(20, 840, 520), wallM); lintel.position.set(DOOR_X + 10, 560 + 420, RUN_Z); scene.add(lintel);
  const trail = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowSprite('#EB5E12'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  trail.scale.set(60, 60, 1); scene.add(trail);
  // ceiling light strips along the runway
  const stripM = new THREE.MeshBasicMaterial({ color: '#fff4de' });
  const strips = new THREE.InstancedMesh(new THREE.BoxGeometry(160, 2, 8), stripM, 34);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < 19; i++) { m4.makeTranslation(300 + i * 150, 520, RUN_Z); strips.setMatrixAt(i, m4); }
  strips.count = 19;
  scene.add(strips);
  // repair callout props: screwdriver hovering over the repair lane
  const driver = new THREE.Group();
  const dh = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.5, 11, 16), new THREE.MeshStandardMaterial({ color: '#EB5E12', roughness: 0.45 })); dh.position.y = 7; driver.add(dh);
  const ds = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 9, 10), MAT.steel); ds.position.y = -3; driver.add(ds);
  scene.add(driver);

  // ---- earth ----
  const E = buildEarth(renderer, onEarthReady);

  // ---- textures by state ----
  function OFF() { return TEX.off || (TEX.off = screenTexture('off')); }
  function resultTex(kind, grade) {
    const k = kind + grade;
    if (!TEX[k]) TEX[k] = screenTexture(kind, { grade, sub: kind === 'pass' ? '42 / 42 checks' : kind === 'fail' ? 'Needs repair' : 'Activation lock' });
    return TEX[k];
  }
  TEX.boot = TEX.boot || screenTexture('boot');
  TEX.record = TEX.record || screenTexture('record');
  [0.2, 0.45, 0.7, 0.92].forEach(p => { TEX['t' + p] = TEX['t' + p] || screenTexture('test', { pct: p }); });
  const setScreen = (ph, tex) => { if (ph.userData.screenMat.emissiveMap !== tex) { ph.userData.screenMat.emissiveMap = tex; ph.userData.screenMat.needsUpdate = true; } };

  // ---- camera shots (warehouse) ----
  // [P, position, target]
  const shots = [
    [0.00, V(-40, 330, 300), V(0, 70, -70)],
    [0.30, V(70, 230, 150), V(0, 92, -70)],
    [0.62, V(60, 205, 70), V(0, 108, -70)],
    [0.95, V(10, 170, 95), V(0, 90, 0)],
    [1.25, V(2, 132, 62), V(4, 90, 8)],
    [1.90, V(-2, 126, 58), V(2, 90, 8)],
    [2.25, V(0, 186, 120), V(0, 98, -20)],
    [2.85, V(0, 196, 132), V(0, 100, -20)],
    [3.15, V(0, 330, 640), V(0, 90, 428)],
    [3.95, V(0, 330, 640), V(0, 90, 428)],
    [4.12, V(-112, 196, 548), V(-74, 90, 446)],
    [4.40, V(-112, 196, 548), V(-74, 90, 446)],
    [4.52, V(150, 222, 606), V(98, 90, 452)],
    [4.74, V(150, 222, 606), V(98, 90, 452)],
    [4.84, V(40, 118, RUN_Z), V(1400, 108, RUN_Z)],
    [4.92, V(40, 118, RUN_Z), V(1400, 108, RUN_Z)],
    [5.00, V(260, 150, RUN_Z), V(3200, 230, RUN_Z)]
  ];
  const _p = new THREE.Vector3(), _t = new THREE.Vector3();
  function shotAt(P) {
    let i = 0; while (i < shots.length - 2 && P > shots[i + 1][0]) i++;
    const [a, pa, ta] = shots[i], [b, pb, tb] = shots[i + 1];
    const k = sm(seg(P, a, b));
    vlerp(pa, pb, k, _p); vlerp(ta, tb, k, _t);
  }

  // anchors for HTML labels: name -> world position (or null)
  const anchors = {};
  const tmp = new THREE.Vector3();
  let W = 1, H = 1, aspectK = 1;

  // ---- globe interaction state ----
  const globe = { yaw: 0, pitch: 0, userYaw: 0, userPitch: 0, lastDrag: -1e9, dragging: false, focus: null, focusAt: -1e9 };

  function setSize(w, h, dpr) {
    W = w; H = h;
    renderer.setPixelRatio(Math.min(dpr, w > 1800 ? 1.25 : 1.6));
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    E.camera.aspect = w / h; E.camera.updateProjectionMatrix();
    // narrow screens: pull the camera back so the subject still fits
    aspectK = Math.max(1, 1.5 / (w / h));
  }

  const pinch = new THREE.Vector3();
  function update(P, time) {
    const t1 = seg(P, 0, 1), t2 = seg(P, 1, 2), t3 = seg(P, 2, 3), t4 = seg(P, 3, 4), t5 = seg(P, 4, 5), t6 = seg(P, 5, 6), t7 = seg(P, 6, 7);
    for (const k in anchors) delete anchors[k];

    // ===== scene 1: conveyor brings the lot; the hand picks one phone =====
    const travel = lerp(-420, 0, easeOut(t1, 0, 0.32));
    totes.forEach((t, k) => { t.position.x = travel - k * 64 + (k ? -40 : 0); });
    const tote0 = totes[0].position;
    const pickStart = V(tote0.x, CONV_Y + 0.9 + PH / 2, CONV_Z + 6);
    const lift = V(tote0.x, CONV_Y + 44, CONV_Z + 6);
    const over = V(MAT_PHONE.x, MAT_PHONE.y + 30, MAT_PHONE.z - 4);
    const k1 = ease(t1, 0.48, 0.58), k2 = ease(t1, 0.58, 0.82), k3 = ease(t1, 0.82, 0.92);
    const heroPos = new THREE.Vector3();
    let heroRot = 0;
    if (t1 < 0.58) vlerp(pickStart, lift, k1, heroPos);
    else if (t1 < 0.82) { vlerp(lift, over, k2, heroPos); heroPos.y += Math.sin(k2 * Math.PI) * 22; }
    else vlerp(over, MAT_PHONE, k3, heroPos);
    heroRot = -Math.PI / 2 * ease(t1, 0.6, 0.86);

    // hand follows the pinch point on the phone's top edge
    const handIn = ease(t1, 0.3, 0.46), handOut = ease(t1, 0.92, 1);
    if (handGrip.userData.inner) {
      const top = V(0, PH / 2, 0).applyAxisAngle(V(1, 0, 0), heroRot).add(heroPos);
      pinch.copy(top);
      const approach = V(70, 90, 110);
      handGrip.position.copy(pinch).addScaledVector(approach, (1 - handIn) + handOut);
      handGrip.rotation.set(heroRot * 0.45, -0.25, 0.12);
      handGrip.visible = P < 1 && handIn > 0.001 && handOut < 0.999;
    }

    // ===== scene 2: plug in, the phone reports itself =====
    const plugIn = ease(t2, 0.04, 0.2);
    plug.position.set(portWorld.x, portWorld.y, portWorld.z + 0.6 + (1 - plugIn) * 14);
    plug.visible = P > 0.95 && P < 3.1;
    cable.visible = plug.visible;
    const flowing = P > 1.2 && P < 3.05;
    packets.forEach((s, i) => {
      s.visible = flowing;
      if (!flowing) return;
      const u = clamp((((time * 0.22 + i / packets.length) % 1) + 1) % 1, 0, 0.9999);
      s.position.copy(cableCurve.getPointAt(u)); s.position.y += 0.8;
      s.material.opacity = 0.9 * Math.sin(u * Math.PI);
    });

    // hero screen
    if (P < 1.18) setScreen(hero, OFF());
    else if (P < 1.42) setScreen(hero, TEX.boot);
    else if (P < 2.25) setScreen(hero, TEX.record);

    // ===== scene 3: the stand fills, twelve test at once =====
    standPhones.forEach((ph, i) => {
      const slot = standSlot(i);
      if (i === 0) {
        const kk = ease(t3, 0.02, 0.2);
        if (P >= 2) {
          vlerp(MAT_PHONE, slot, kk, heroPos); heroPos.y += Math.sin(kk * Math.PI) * 24;
          heroRot = -Math.PI / 2 * (1 - kk);
        }
        ph.position.copy(heroPos); ph.rotation.set(heroRot, 0, 0);
      } else {
        const d = ease(t3, 0.04 + i * 0.012, 0.16 + i * 0.012);
        ph.position.set(slot.x, slot.y + (1 - d) * 70, slot.z);
        ph.rotation.set(-0.14, 0, 0);
        ph.visible = P > 2 && P < 3.2 && d > 0.001;
      }
      if (P >= 2.2) {
        const st = t3 - 0.22 - i * 0.008;
        const kind = DEVICES[i].kind;
        let tex = TEX.boot;
        if (st > 0.06) tex = TEX['t' + (st < 0.14 ? 0.2 : st < 0.24 ? 0.45 : st < 0.34 ? 0.7 : 0.92)];
        if (st > 0.44) tex = resultTex(kind, DEVICES[i].grade);
        setScreen(ph, tex);
        const led = stand.userData.leds[i];
        const c = st > 0.44 ? KCOL[kind] : st > 0 ? '#EB5E12' : '#000';
        led.emissive.set(c); led.color.set(st > 0 ? c : '#222');
      } else { const led = stand.userData.leds[i]; led.emissive.set('#000'); led.color.set('#222'); }
    });
    hero.visible = P < 3.2;
    hero.rotation.order = 'XYZ';
    if (P < 2) { hero.position.copy(heroPos); hero.rotation.set(P < 1 ? heroRot : -Math.PI / 2, 0, 0); }

    // ===== scene 4: cards flip into phones and take their lane =====
    cards.forEach((ph, i) => {
      const d = DEVICES[i];
      const appear = ease(t4, 0.0 + i * 0.012, 0.1 + i * 0.012);
      const flip = ease(t4, 0.16 + i * 0.016, 0.34 + i * 0.016);
      const go = ease(t4, 0.46 + laneIndex(d.lane) * 0.05 + laneSlotOf[i] * 0.02, 0.7 + laneIndex(d.lane) * 0.05 + laneSlotOf[i] * 0.02);
      const a = TRAY_SLOT(i), b = LANE_SLOT(d.lane, laneSlotOf[i]);
      const p = vlerp(a, b, go, tmp);
      p.y += Math.sin(flip * Math.PI) * 9 + Math.sin(go * Math.PI) * 14 + PD / 2;
      p.y += (1 - appear) * 30;
      ph.position.copy(p);
      // lying flat, top toward -z; flipped by rotating about the long axis
      ph.rotation.order = 'XYZ';
      ph.rotation.set(-Math.PI / 2, Math.PI * (1 - flip), 0);
      ph.visible = P > 2.9 && appear > 0.001 && !(d.lane === 'ship' && P > 4.4);
      ph.scale.setScalar(1);
      if (ph.userData.card) ph.userData.card.visible = flip < 0.5;
    });

    // ===== scene 5: repair, pack, ship =====
    const rp = cards[1], ru = rp.userData;
    if (P > 4) {
      const r1 = ease(t5, 0.06, 0.1);     // flip face down
      const r2 = ease(t5, 0.1, 0.14);     // back opens
      const r3 = ease(t5, 0.15, 0.24);    // battery swap
      const r4 = ease(t5, 0.25, 0.29);    // back closes
      const r5 = ease(t5, 0.29, 0.33);    // flip back
      const flipAmt = r1 * (1 - r5);
      const base = LANE_SLOT('repair', laneSlotOf[1]);
      rp.position.set(base.x + 6, base.y + PD / 2 + Math.sin(flipAmt * Math.PI) * 6 + flipAmt * 0.4, base.z - 4);
      rp.rotation.set(-Math.PI / 2, Math.PI * flipAmt, 0);
      ru.inner.visible = r2 > 0 && r4 < 1;
      ru.hinge.rotation.y = -(r2 * (1 - r4)) * 1.9;
      ru.battOld.visible = r3 < 0.5; ru.battNew.visible = r3 >= 0.5;
      const sw = r3 < 0.5 ? r3 * 2 : (1 - r3) * 2;
      (r3 < 0.5 ? ru.battOld : ru.battNew).position.set(0, -2.2 - sw * 12, -0.12 - sw * 2);
      driver.visible = P > 4.05 && P < 4.34;
      driver.position.set(base.x + 6 + 10 - r3 * 6, base.y + 18 + Math.sin(time * 3) * 0.8, base.z - 6);
      driver.rotation.set(0.25, time * 0.6, -0.5);
      if (t5 > 0.32) setScreen(rp, resultTex('pass', 'B'));
      else setScreen(rp, resultTex('fail', 'B'));
    } else { driver.visible = false; if (ru.inner) { ru.inner.visible = false; ru.hinge.rotation.y = 0; } }

    // pack the three shipment phones
    const bu = box.userData;
    shipOrder.forEach((ci, k) => {
      const ph = cards[ci];
      const s0 = 0.42 + k * 0.05, kk = ease(t5, s0, s0 + 0.07);
      if (P > 4 && t5 > s0 - 0.001 && P < 4.4 + 0.6) {
        const from = LANE_SLOT('ship', laneSlotOf[ci]); from.y += PD / 2;
        const slotLocal = boxSlot(shipSlots[k]);
        const to = slotLocal.clone().add(box.position);
        const p = vlerp(from, to, kk, tmp); p.y += Math.sin(kk * Math.PI) * 26;
        ph.position.copy(p);
        ph.rotation.set(-Math.PI / 2 * (1 - kk), 0, 0);
        ph.visible = true;
        if (kk >= 1) { // parent into the box so it travels with it
          if (ph.parent !== box) { box.add(ph); }
          ph.position.copy(slotLocal); ph.rotation.set(0, 0, 0);
        } else if (ph.parent !== scene) scene.add(ph);
      } else if (ph.parent !== scene && P < 4.4) { scene.add(ph); }
    });
    // flaps, tape, label
    const fl = ease(t5, 0.6, 0.68);
    bu.flaps.forEach((h, i) => {
      const order = i < 2 ? ease(t5, 0.64, 0.7) : ease(t5, 0.6, 0.65);
      const open = i < 2 ? 1.95 : 1.75;
      const a = open * (1 - order);
      if (h.userData.axis === 'x') h.rotation.x = -h.userData.sign * a;
      else h.rotation.z = h.userData.sign * a;
    });
    void fl;
    const tp = ease(t5, 0.7, 0.74);
    bu.tape.visible = tp > 0; bu.tape.scale.x = Math.max(0.001, tp);
    bu.label.visible = t5 > 0.74 && P > 4;
    // runway: box slides on, accelerates, lifts off
    const slide = ease(t5, 0.77, 0.82);
    const run = easeIn(t5, 0.8, 0.98);
    const liftK = sm(seg(t5, 0.84, 0.98));
    box.position.set(BOX_POS.x + slide * 30 + run * (DOOR_X - BOX_POS.x + 200), BENCH_Y + slide * (CONV_Y - BENCH_Y) + liftK * 170, BOX_POS.z);
    box.rotation.z = liftK * 0.18;
    box.visible = P < 5.02;
    trail.visible = t5 > 0.82 && P < 5;
    trail.position.copy(box.position).add(V(-26, 9, 0));
    trail.material.opacity = seg(t5, 0.82, 0.88);
    if (P < 4.4 && P > 3) { prefilled.forEach(p => p.visible = true); }

    // ===== camera (warehouse) =====
    shotAt(Math.min(P, 5));
    // follow the box during the flight

    camera.position.copy(_t).addScaledVector(_p.clone().sub(_t), aspectK);
    camera.lookAt(_t);
    // the wide view of the bench sits right of the text column on desktop
    // push the subject right of the text column; scenes with a right-hand
    // overlay (record, laptop) keep it centred instead
    const overlayK = Math.max(ease(P, 1.0, 1.2) * (1 - ease(P, 2.85, 3.05)), 0);
    const shiftX = W / H > 1.2 ? lerp(-0.18, 0.04, overlayK) : 0;
    camera.setViewOffset(W, H, shiftX * W, 0, W, H);

    // ===== earth (scenes 6-7) =====
    const useEarth = P >= 5;
    if (useEarth) updateEarth(t6, t7, P, time);

    // labels
    if (!useEarth) {
      if (P < 1) anchors.lot = totes[0].localToWorld(V(-12, 22, 15));
      if (P > 3.55 && P < 4.05) LANES.forEach((l, i) => { anchors['lane_' + l.key] = tpos(-152 + i * 76, 22); });
      if (P > 4.12 && P < 4.4) anchors.repair = rp.position.clone().add(V(0, 10, 0));
      if (P > 4.68 && P < 4.82) anchors.box = box.position.clone().add(V(0, 28, 0));
      if (P > 1.2 && P < 2) anchors.phone = hero.position.clone().add(V(0, 6, -4));
    }
    const out = {};
    const cam = useEarth ? E.camera : camera;
    for (const k in anchors) {
      tmp.copy(anchors[k]).project(cam);
      out[k] = { x: (tmp.x * 0.5 + 0.5) * W, y: (-tmp.y * 0.5 + 0.5) * H, v: tmp.z < 1 };
    }
    if (useEarth) Object.assign(out, earthLabels());
    renderer.render(useEarth ? E.scene : scene, useEarth ? E.camera : camera);
    return out;
  }

  // ---- earth update ----
  const tourFace = TOUR.map(id => { const l = LOCATIONS.find(x => x.id === id); return facing(l.lat, l.lon); });
  const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
  let lastTime = 0;
  function updateEarth(t6, t7, P, time) {
    const dt = Math.min(0.05, time - lastTime); lastTime = time;
    // tour target from scroll
    const tour = seg(t6, 0.16, 1) * (TOUR.length - 1);
    const i0 = Math.floor(tour), i1 = Math.min(TOUR.length - 1, i0 + 1), f = sm(tour - i0);
    let yawT = tourFace[i0].yaw + wrap(tourFace[i1].yaw - tourFace[i0].yaw) * f;
    let pitchT = lerp(tourFace[i0].pitch, tourFace[i1].pitch, f);
    if (P >= 6) { yawT = tourFace[0].yaw + (P - 6) * 2.4 + time * 0.04; pitchT = 0.35; }
    if (globe.focus) { const l = LOCATIONS.find(x => x.id === globe.focus); const fc = facing(l.lat, l.lon); if (time - globe.focusAt < 6) { yawT = fc.yaw; pitchT = fc.pitch; } else globe.focus = null; }
    const manual = globe.dragging || time - globe.lastDrag < 3.5;
    if (manual) { globe.yaw = globe.userYaw; globe.pitch = globe.userPitch; }
    else {
      const k = 1 - Math.exp(-dt * 3.2);
      globe.yaw += wrap(yawT - globe.yaw) * k; globe.pitch += (pitchT - globe.pitch) * k;
      globe.userYaw = globe.yaw; globe.userPitch = globe.pitch;
    }
    E.group.rotation.set(globe.pitch, globe.yaw, 0);
    E.clouds.rotation.y = time * 0.006;
    // zoom out from Dallas
    const z = ease(t6, 0, 0.16);
    const wide = W / H > 1.2;
    const dist = lerp(ER * 1.32, ER * (wide ? 4.9 : 6.2), z) * (P >= 6 ? lerp(1, 1.12, ease(t7, 0, 0.2)) : 1);
    E.camera.position.set(0, 0, dist);
    E.camera.lookAt(0, 0, 0);
    const offX = wide ? lerp(0, -ER * 0.62, z) : 0;
    E.camera.setViewOffset(W, H, (wide ? -0.16 : 0) * W * z, 0, W, H);
    E.group.position.set(-offX * 0, 0, 0);
    E.atmo.position.copy(E.group.position);
    E.earthMat.uniforms.boost.value = P >= 6 ? lerp(1, 0.55, ease(t7, 0, 0.25)) : 1;
    // arcs + pins
    E.arcs.forEach(a => { a.mat.uniforms.reveal.value = ease(t6, 0.12 + a.delay, 0.5 + a.delay); a.mat.uniforms.time.value = time; });
    E.markers.forEach((m, i) => { const s = 1 + ((time * 0.6 + i * 0.13) % 1) * 3; m.ring.scale.setScalar(s); m.ring.material.opacity = 0.8 * (1 - ((time * 0.6 + i * 0.13) % 1)); });
    // box lands on Dallas
    const dal = LOCATIONS[0];
    const land = ease(t6, 0, 0.1);
    const pDal = latLonToVec(dal.lat, dal.lon, ER * (1.01 + (1 - land) * 0.5));
    E.box.position.copy(pDal); E.box.lookAt(0, 0, 0); E.box.visible = t6 < 0.14;
  }

  function earthLabels() {
    const out = {};
    const camDir = E.camera.position.clone().normalize();
    E.markers.forEach(m => {
      const wp = m.group.localToWorld(m.tip.clone());
      const n = m.group.getWorldPosition(new THREE.Vector3()).sub(E.group.position).normalize();
      const facingCam = n.dot(camDir);
      tmp.copy(wp).project(E.camera);
      out['loc_' + m.loc.id] = { x: (tmp.x * 0.5 + 0.5) * W, y: (-tmp.y * 0.5 + 0.5) * H, v: facingCam > 0.12, f: facingCam };
    });
    return out;
  }

  // drag to rotate the globe (no zoom, no pan)
  function drag(dx, dy, phase, time) {
    if (phase === 'start') { globe.dragging = true; globe.userYaw = globe.yaw; globe.userPitch = globe.pitch; globe.focus = null; }
    if (phase === 'move') { globe.userYaw += dx * 0.006; globe.userPitch = clamp(globe.userPitch + dy * 0.005, -1.25, 1.25); }
    if (phase === 'end') globe.dragging = false;
    globe.lastDrag = time;
  }
  function focusLocation(id, time) { globe.focus = id; globe.focusAt = time; globe.lastDrag = -1e9; }

  function dispose() { renderer.dispose(); pmrem.dispose(); }
  return { update, setSize, drag, focusLocation, dispose, renderer };
}

const TEX_CACHE = {};
