// Industries tab 05 — Individual operators & online sellers.
// One person's day in one continuous world (metres, y up):
//   1) Meetup in a parking lot at golden hour: IMEI check on the phone,
//      price suggestion, phone-to-phone payment.
//   2) Drive home along a suburban road while the sun goes down.
//   3) The camera flies through the lit front window into the living room:
//      plug in, test, grade, list, sold, print a label, pack, pickup by the
//      door, close on the order total, wash to cream and loop.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { loadPeople, LOOKS } from '../../people/people.js';
import { makePhone, PHONE_STYLES } from '../../story/models.js';
import { whenLogo } from '../../story/textures.js';

const INK = '#16130F', CREAM = '#F6F2EA', ORANGE = '#EB5E12', GREEN = '#1E7A4A', LGREEN = '#3FB27F', MUTED = '#8E857A';
const sans = (s, w = 700) => `${w} ${s}px 'Archivo', system-ui, sans-serif`;
const mono = (s, w = 600) => `${w} ${s}px 'JetBrains Mono', ui-monospace, monospace`;

const DURATION = 46;
const clamp01 = x => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
const seg = (t, a, b) => clamp01((t - a) / (b - a));
const env = (t, a, b, fi = 0.4, fo = 0.4) => Math.min(smooth((t - a) / fi), smooth((b - t) / fo));
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// Key places
const HOUSE = V(135, 0, 0);            // living room centre (floor)
const WIN = V(-0.3, 1.45, 2.5);        // window centre, house-local
const OP_STAND = V(-0.5, 0, 2.7);      // operator at the meetup (faces +x)
const SE_STAND = V(0.55, 0, 2.7);      // seller (faces -x)

// --------------------------------------------------------------------------
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
let LOGO = null;
whenLogo(img => { LOGO = img; });

export default async function create(ctx) {
  const { renderer, isSmall } = ctx;
  const disposables = [];
  const track = o => { disposables.push(o); return o; };

  // Canvas texture whose drawing depends on a state key; redraws only on change.
  function dynTex(w, h, draw) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d');
    const tex = track(new THREE.CanvasTexture(c));
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    let key = null, last = null;
    const set = (k, arg) => { if (k === key) return; key = k; last = arg; g.clearRect(0, 0, w, h); draw(g, w, h, arg); tex.needsUpdate = true; };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { const k = key; key = null; set(k, last); });
    return { tex, set, g };
  }
  function staticTex(w, h, draw, repeat) {
    const t = dynTex(w, h, draw); t.set('x');
    if (repeat) { t.tex.wrapS = t.tex.wrapT = THREE.RepeatWrapping; }
    return t.tex;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, ctx.width / ctx.height, 0.05, 900);
  scene.add(camera);

  // Environment for believable reflections (car paint, glass, laptop).
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  scene.environment = envTex;
  scene.environmentIntensity = 0.55;

  // ---- Sky + light rig ---------------------------------------------------
  const skyU = {
    top: { value: new THREE.Color('#5b7fae') }, hor: { value: new THREE.Color('#f2b27c') },
    sunC: { value: new THREE.Color('#ffd49a') }, sunDir: { value: V(-0.8, 0.25, -0.55).normalize() }, sunAmt: { value: 1 }
  };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(700, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, uniforms: skyU,
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); vec4 p = modelViewMatrix*vec4(position,1.); gl_Position = projectionMatrix*p; gl_Position.z = gl_Position.w; }',
    fragmentShader: `uniform vec3 top, hor, sunC, sunDir; uniform float sunAmt; varying vec3 vD;
      void main(){ float h = max(vD.y, 0.0); vec3 c = mix(hor, top, pow(smoothstep(0.0, 0.55, h), 0.7));
        c = mix(c, hor * 0.55, smoothstep(0.0, -0.2, vD.y));
        float s = max(dot(normalize(vD), normalize(sunDir)), 0.0);
        c += sunC * (pow(s, 900.0) * 3.0 + pow(s, 12.0) * 0.35 + pow(s, 3.0) * 0.12) * sunAmt;
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  }));
  sky.frustumCulled = false; sky.renderOrder = -10;
  scene.add(sky);
  scene.fog = new THREE.Fog('#e9b98e', 40, 320);

  const sun = new THREE.DirectionalLight('#ffbf80', 3.6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(isSmall ? 1024 : 2048, isSmall ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 140 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sun.shadow.radius = 3;
  scene.add(sun, sun.target);
  const hemi = new THREE.HemisphereLight('#9fb6d8', '#6b5440', 0.9);
  scene.add(hemi);

  // ---- Materials ----------------------------------------------------------
  const M = (o) => track(new THREE.MeshStandardMaterial(o));
  const asphaltTex = staticTex(512, 512, (g, w, h) => {
    g.fillStyle = '#3a3836'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) { const v = 40 + Math.random() * 50; g.fillStyle = `rgba(${v},${v - 2},${v - 4},0.5)`; g.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5); }
    for (let i = 0; i < 14; i++) { g.fillStyle = 'rgba(20,20,20,0.12)'; g.beginPath(); g.ellipse(Math.random() * w, Math.random() * h, 20 + Math.random() * 60, 10 + Math.random() * 30, Math.random() * 3, 0, 7); g.fill(); }
  }, true);
  const lotTex = staticTex(1024, 512, (g, w, h) => {
    // 28 x 14 m lot, ~36 px per metre
    g.drawImage(asphaltTex.image, 0, 0, 512, 512); g.drawImage(asphaltTex.image, 512, 0, 512, 512);
    const X = x => (x + 14) / 28 * w, Z = z => (z + 6) / 14 * h;
    g.strokeStyle = 'rgba(240,236,226,0.85)'; g.lineWidth = 4;
    for (let x = -12.6; x <= 12.7; x += 2.8) { g.beginPath(); g.moveTo(X(x), Z(-5.2)); g.lineTo(X(x), Z(-0.2) + 40); g.stroke(); }
    g.setLineDash([24, 18]); g.beginPath(); g.moveTo(X(-13), Z(4.4)); g.lineTo(X(13), Z(4.4)); g.stroke(); g.setLineDash([]);
    g.fillStyle = 'rgba(240,236,226,0.7)'; g.font = sans(28, 800);
  });
  const roadTex = staticTex(256, 512, (g, w, h) => {
    g.drawImage(asphaltTex.image, 0, 0, 256, 512);
    g.fillStyle = '#e3b21b'; g.fillRect(w / 2 - 7, 0, 5, h); g.fillRect(w / 2 + 2, 0, 5, h);
    g.fillStyle = 'rgba(240,236,226,0.8)'; g.fillRect(10, 0, 5, h); g.fillRect(w - 15, 0, 5, h);
  }, true);
  const grassTex = staticTex(256, 256, (g, w, h) => {
    g.fillStyle = '#4c6a32'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 6000; i++) { g.fillStyle = `hsla(${80 + Math.random() * 30},${35 + Math.random() * 25}%,${22 + Math.random() * 20}%,0.6)`; g.fillRect(Math.random() * w, Math.random() * h, 1, 3); }
  }, true);
  const concreteTex = staticTex(256, 256, (g, w, h) => {
    g.fillStyle = '#b9b2a6'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 4000; i++) { const v = 150 + Math.random() * 60; g.fillStyle = `rgba(${v},${v - 4},${v - 10},0.35)`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    g.fillStyle = 'rgba(60,55,50,0.35)'; g.fillRect(0, 0, w, 2); g.fillRect(0, 0, 2, h);
  }, true);

  const asphaltM = M({ map: lotTex, roughness: 0.92, metalness: 0 });
  const roadM = M({ map: roadTex, roughness: 0.9 });
  roadTex.repeat.set(1, 30);
  const grassM = M({ map: grassTex, roughness: 1 }); grassTex.repeat.set(60, 60);
  const walkM = M({ map: concreteTex, roughness: 0.95 }); concreteTex.repeat.set(1, 120);
  const curbM = M({ color: '#a8a196', roughness: 0.9 });

  // ---- Ground: grass, lot, road, sidewalks --------------------------------
  const plane = (w, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.receiveShadow = true; scene.add(m); return m; };
  plane(600, 600, grassM, 60, -0.02, 0);
  plane(28, 14, asphaltM, 0, 0, 1);
  const road = plane(7, 260, roadM, 70, 0.005, 12); road.rotation.z = Math.PI / 2;
  const walkA = plane(1.8, 260, walkM, 70, 0.06, 7.6); walkA.rotation.z = Math.PI / 2;
  const walkB = plane(1.8, 260, walkM, 70, 0.06, 16.4); walkB.rotation.z = Math.PI / 2;
  plane(4, 4.5, asphaltM, 7, 0.004, 9.6);           // lot exit apron
  const drive = plane(3.2, 7.6, walkM, 139, 0.065, 5.9); drive.material = M({ map: concreteTex, color: '#cfc8bb', roughness: 0.9 });
  // curbs
  const curbGeo = new THREE.BoxGeometry(1, 0.14, 0.18);
  const curbs = new THREE.InstancedMesh(curbGeo, curbM, 6);
  [[70, 8.6, 260], [70, 15.4, 260], [0, -6.05, 28], [-14, 1, 0.18, 14], [14, 1, 0.18, 9]].forEach(([x, z, l, d], i) => {
    const mm = new THREE.Matrix4().compose(V(x, 0.07, z), new THREE.Quaternion(), d ? V(0.18, 1, d / 0.18) : V(l, 1, 1));
    curbs.setMatrixAt(i, mm);
  });
  curbs.count = 5; curbs.receiveShadow = curbs.castShadow = true; scene.add(curbs);

  // ---- Trees, shrubs, houses (instanced) ----------------------------------
  const rnd = (() => { let s = 11; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const trunkM = M({ color: '#5a4636', roughness: 1 });
  const leafM = M({ color: '#4f6b34', roughness: 0.95 });
  const treeSpots = [];
  for (let x = 20; x < 150; x += 9 + rnd() * 5) { treeSpots.push([x, 6.2 + rnd() * 0.6]); treeSpots.push([x + 4, 18.6 + rnd()]); }
  [[-9, -8], [-4, -9], [3, -8.6], [9, -8.2], [15, -7], [-16, 4], [-15, 9], [18, 4], [128, -6], [142, -6], [131, 5], [146, 4]].forEach(p => treeSpots.push(p));
  const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.12, 0.18, 1, 6), trunkM, treeSpots.length);
  const crowns = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 2), leafM, treeSpots.length * 3);
  const mm = new THREE.Matrix4(), qq = new THREE.Quaternion();
  treeSpots.forEach(([x, z], i) => {
    const hgt = 2.2 + rnd() * 1.6, r = 1.4 + rnd() * 0.9;
    trunks.setMatrixAt(i, mm.compose(V(x, hgt / 2, z), qq, V(1, hgt, 1)));
    for (let k = 0; k < 3; k++) {
      const c = new THREE.Color().setHSL(0.22 + rnd() * 0.07, 0.35 + rnd() * 0.2, 0.22 + rnd() * 0.1);
      crowns.setMatrixAt(i * 3 + k, mm.compose(V(x + (rnd() - 0.5) * r, hgt + r * 0.6 + k * r * 0.35, z + (rnd() - 0.5) * r), qq.setFromEuler(new THREE.Euler(rnd(), rnd(), rnd())), V(r * (0.8 + rnd() * 0.4), r * (0.75 + rnd() * 0.3), r * (0.8 + rnd() * 0.4))));
      crowns.setColorAt(i * 3 + k, c);
    }
    qq.identity();
  });
  trunks.castShadow = crowns.castShadow = true; crowns.receiveShadow = true;
  scene.add(trunks, crowns);

  // shrubs along the lot's back edge
  const shrubs = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.6, 1), leafM, 22);
  for (let i = 0; i < 22; i++) {
    shrubs.setMatrixAt(i, mm.compose(V(-13 + i * 1.25, 0.35, -6.7 + rnd() * 0.3), qq, V(1 + rnd() * 0.4, 0.7 + rnd() * 0.3, 0.9)));
    shrubs.setColorAt(i, new THREE.Color().setHSL(0.24 + rnd() * 0.05, 0.4, 0.2 + rnd() * 0.08));
  }
  shrubs.castShadow = shrubs.receiveShadow = true; scene.add(shrubs);

  // Neighbourhood houses: bodies, roofs, windows
  const houseSpots = [];
  for (let x = 24; x < 160; x += 13 + rnd() * 3) {
    if (Math.abs(x - HOUSE.x) > 9) houseSpots.push([x, -1.5 - rnd() * 2, 0]);
    houseSpots.push([x + 5, 25 + rnd() * 2, Math.PI]);
  }
  const hcols = ['#d9cdb8', '#b9c2c4', '#e3d9c6', '#a7a08f', '#c9b39a', '#dfe0d8', '#9fb0a7'];
  const bodies = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), M({ roughness: 0.9 }), houseSpots.length);
  const roofGeo = (() => { const s = new THREE.Shape(); s.moveTo(-0.5, 0); s.lineTo(0.5, 0); s.lineTo(0, 0.5); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false }); g.translate(0, 0, -0.5); return g; })();
  const roofs = new THREE.InstancedMesh(roofGeo, M({ color: '#4a4440', roughness: 0.85 }), houseSpots.length);
  const winMat = M({ color: '#2b2e33', emissive: '#ffc27a', emissiveIntensity: 0, roughness: 0.3, metalness: 0.2 });
  const wins = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), winMat, houseSpots.length * 4);
  let wi = 0;
  houseSpots.forEach(([x, z, ry], i) => {
    const w = 8 + rnd() * 3, d = 7, h = 3 + rnd() * 1.2;
    const q = new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), ry);
    bodies.setMatrixAt(i, mm.compose(V(x, h / 2, z), q, V(w, h, d)));
    bodies.setColorAt(i, new THREE.Color(hcols[i % hcols.length]));
    roofs.setMatrixAt(i, mm.compose(V(x, h, z), q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), Math.PI / 2)), V(d + 0.6, 2.6, w + 0.8)));
    const front = ry === 0 ? 1 : -1;
    for (let k = 0; k < 4; k++) {
      const wx = x + (k - 1.5) * (w / 4.4), wy = k === 1 ? 1.1 : 1.6;
      wins.setMatrixAt(wi++, mm.compose(V(wx, wy, z + front * (d / 2 + 0.02)), q, V(k === 1 ? 1 : 1.3, k === 1 ? 2.1 : 1.1, 1)));
    }
  });
  wins.count = wi;
  bodies.castShadow = bodies.receiveShadow = roofs.castShadow = true;
  scene.add(bodies, roofs, wins);

  // Commercial strip behind the lot (no signage)
  const strip = new THREE.Group(); scene.add(strip);
  const stripBody = new THREE.Mesh(new THREE.BoxGeometry(34, 5.2, 8), M({ color: '#cbbfae', roughness: 0.9 }));
  stripBody.position.set(0, 2.6, -13); stripBody.castShadow = stripBody.receiveShadow = true; strip.add(stripBody);
  const awn = new THREE.Mesh(new THREE.BoxGeometry(34.4, 0.3, 1.6), M({ color: '#7d6a58', roughness: 0.8 }));
  awn.position.set(0, 3.6, -8.4); awn.castShadow = true; strip.add(awn);
  const glassM = M({ color: '#1b2328', roughness: 0.08, metalness: 0.6, emissive: '#ffcf96', emissiveIntensity: 0.15 });
  for (let i = 0; i < 6; i++) { const g = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.4), glassM); g.position.set(-14 + i * 5.6, 1.6, -8.98); strip.add(g); }

  // Street lights: poles + heads, glow sprites and soft pools on the road
  const glowTex = staticTex(128, 128, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gr.addColorStop(0, 'rgba(255,240,210,1)'); gr.addColorStop(0.2, 'rgba(255,190,110,0.55)'); gr.addColorStop(1, 'rgba(255,160,80,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
  const lampSpots = [[-8, 5.2], [8, 5.2]];
  for (let x = 22; x < 150; x += 18) lampSpots.push([x, 8.9]);
  const poleM = M({ color: '#3b3d40', roughness: 0.6, metalness: 0.6 });
  const headM = M({ color: '#222', emissive: '#ffd9a0', emissiveIntensity: 0 });
  const poles = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.07, 0.1, 6, 8), poleM, lampSpots.length);
  const arms = new THREE.InstancedMesh(new THREE.BoxGeometry(1.4, 0.08, 0.08), poleM, lampSpots.length);
  const heads = new THREE.InstancedMesh(new THREE.BoxGeometry(0.6, 0.12, 0.28), headM, lampSpots.length);
  const glowM = track(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  const poolM = track(new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  const poolGeo = new THREE.PlaneGeometry(9, 9);
  lampSpots.forEach(([x, z], i) => {
    const dir = z > 8 ? 1 : 1;
    poles.setMatrixAt(i, mm.compose(V(x, 3, z), qq, V(1, 1, 1)));
    arms.setMatrixAt(i, mm.compose(V(x, 5.95, z + dir * 0.6), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), Math.PI / 2), V(1, 1, 1)));
    heads.setMatrixAt(i, mm.compose(V(x, 5.9, z + dir * 1.2), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), Math.PI / 2), V(1, 1, 1)));
    const s = new THREE.Sprite(glowM); s.position.set(x, 5.8, z + dir * 1.2); s.scale.setScalar(2.2); scene.add(s);
    const p = new THREE.Mesh(poolGeo, poolM); p.rotation.x = -Math.PI / 2; p.position.set(x, 0.03, z + dir * 1.6); scene.add(p);
  });
  poles.castShadow = true; scene.add(poles, arms, heads);

  // ---- Cars -----------------------------------------------------------------
  // Re-hue the car's blue body paint to another colour (canvas pass on the map).
  function repaint(mat, paint) {
    const img = mat.map && mat.map.image; if (!img) return;
    const w = img.width, h = img.height, c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, w, h), px = d.data, tc = new THREE.Color(paint), hsl = {}; tc.getHSL(hsl);
    const tmpC = new THREE.Color(), o = {};
    for (let i = 0; i < px.length; i += 4) {
      const r = px[i], gg = px[i + 1], b = px[i + 2];
      if (b > r + 18 && b >= gg) {
        tmpC.setRGB(r / 255, gg / 255, b / 255); tmpC.getHSL(o);
        const l = THREE.MathUtils.clamp(o.l * (hsl.l / 0.28), 0, 0.95);
        tmpC.setHSL(hsl.h, hsl.s * Math.min(1, o.s * 1.4), l);
        px[i] = tmpC.r * 255; px[i + 1] = tmpC.g * 255; px[i + 2] = tmpC.b * 255;
      }
    }
    g.putImageData(d, 0, 0);
    const t = track(new THREE.CanvasTexture(c)); t.flipY = mat.map.flipY; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    mat.map = t; mat.needsUpdate = true;
  }
  let carProto = null;
  try { carProto = (await ctx.loadGLTF('assets/ind-solo/car.glb')).scene; } catch (e) { carProto = null; }
  const badgeM = M({ color: '#1a1b1d', roughness: 0.35, metalness: 0.6 });
  function makeCar(paint) {
    const g = new THREE.Group();
    if (carProto) {
      const c = carProto.clone(true);
      c.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; o.material = o.material.clone(); track(o.material); if (paint) repaint(o.material, paint); o.material.envMapIntensity = 1.2; } });
      const box = new THREE.Box3().setFromObject(c), size = box.getSize(V(0, 0, 0)), ctr = box.getCenter(V(0, 0, 0));
      const inner = new THREE.Group(); inner.add(c);
      c.position.set(-ctr.x, -box.min.y, -ctr.z);
      inner.scale.set(1.8 / size.x, 1.5 / size.y, 4.1 / size.z);
      inner.rotation.y = CAR_YAW;
      g.add(inner);
      // the scanned model has its wheels baked into the body: cut them out
      // once (shared geometry) so separate wheels can roll and steer
      if (!carWheelsCut) {
        carWheelsCut = true;
        c.updateMatrixWorld(true); inner.updateMatrixWorld(true);
        c.traverse(o => {
          if (!o.isMesh || !o.geometry.index) return;
          const pos = o.geometry.attributes.position, idx = o.geometry.index.array, keep = [];
          const mw = new THREE.Matrix4().copy(inner.matrix).multiply(o.matrixWorld); // car-local, before g
          const pts = new Float32Array(pos.count * 3), v = V(0, 0, 0);
          for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i).applyMatrix4(mw); pts[i * 3] = v.x; pts[i * 3 + 1] = v.y; pts[i * 3 + 2] = v.z; }
          const inWheel = i => {
            const x = pts[i * 3], y = pts[i * 3 + 1], z = pts[i * 3 + 2];
            if (Math.abs(x) < 0.42) return false;
            return WHEELS.some(([, wz]) => Math.hypot(z - wz, y - 0.25) < 0.285);
          };
          for (let t = 0; t < idx.length; t += 3) if (!(inWheel(idx[t]) && inWheel(idx[t + 1]) && inWheel(idx[t + 2]))) keep.push(idx[t], idx[t + 1], idx[t + 2]);
          o.geometry.setIndex(keep);
        });
      }
      // plain badge plate over the grille so no maker's emblem shows
      // (deep enough to swallow the chrome emblem that stands proud of the grille)
      const plate = new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.15, 0.12, 2, 0.025), badgeM);
      plate.position.set(0, 0.565, 1.955); g.add(plate);
    } else {
      const body = new THREE.Mesh(new RoundedBoxGeometry(1.8, 0.75, 4.1, 3, 0.25), M({ color: paint || '#27416b', roughness: 0.3, metalness: 0.6 }));
      body.position.y = 0.65; body.castShadow = true; g.add(body);
      const cab = new THREE.Mesh(new RoundedBoxGeometry(1.6, 0.6, 2.2, 3, 0.25), M({ color: '#151a20', roughness: 0.1, metalness: 0.5 }));
      cab.position.set(0, 1.25, -0.3); cab.castShadow = true; g.add(cab);
    }
    // lamps (front = +z)
    const tail = track(new THREE.SpriteMaterial({ map: glowTex, color: '#ff3020', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
    const headL = track(new THREE.SpriteMaterial({ map: glowTex, color: '#fff4dc', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
    [-0.62, 0.62].forEach(x => {
      const tl = new THREE.Sprite(tail); tl.position.set(x, 0.92, -2.08); tl.scale.setScalar(0.55); g.add(tl);
      const hl = new THREE.Sprite(headL); hl.position.set(x, 0.72, 2.1); hl.scale.setScalar(0.9); g.add(hl);
    });
    // wheels: steer pivot -> spin group -> tyre, rim and five spokes (so the roll reads)
    const wheels = WHEELS.map(([x, z]) => {
      const pivot = new THREE.Group(); pivot.position.set(x, WHEEL_R, z); g.add(pivot);
      const spin = new THREE.Group(); pivot.add(spin);
      const tyre = new THREE.Mesh(tyreGeo, tyreM); tyre.castShadow = true; spin.add(tyre);
      const sx = Math.sign(x);
      const rim = new THREE.Mesh(rimGeo, rimM); rim.position.x = sx * 0.012; spin.add(rim);
      for (let k = 0; k < 5; k++) {
        const sp = new THREE.Mesh(spokeGeo, spokeM); sp.position.x = sx * 0.1;
        sp.rotation.x = (k / 5) * Math.PI * 2; spin.add(sp);
      }
      const hub = new THREE.Mesh(hubGeo, hubM); hub.position.x = sx * 0.104; spin.add(hub);
      return { pivot, spin, front: z > 0 };
    });
    g.userData = { tail, headL, wheels };
    return g;
  }
  const CAR_YAW = 0;
  let carWheelsCut = false;
  // measured on the normalised model: tyre radius 0.25 m, axles at z 1.21 / -1.45
  const WHEEL_R = 0.262, WHEELBASE = 2.66;
  const WHEELS = [[0.63, 1.21], [-0.63, 1.21], [0.63, -1.45], [-0.63, -1.45]];
  const tyreGeo = track(new THREE.CylinderGeometry(WHEEL_R, WHEEL_R, 0.19, 32)); tyreGeo.rotateZ(Math.PI / 2);
  const rimGeo = track(new THREE.CylinderGeometry(0.17, 0.17, 0.18, 28)); rimGeo.rotateZ(Math.PI / 2);
  const spokeGeo = track(new THREE.BoxGeometry(0.03, 0.15, 0.05)); spokeGeo.translate(0, 0.085, 0);
  const hubGeo = track(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 16)); hubGeo.rotateZ(Math.PI / 2);
  const tyreM = M({ color: '#1b1b1c', roughness: 0.85 });
  const rimM = M({ color: '#2f3134', roughness: 0.5, metalness: 0.5 });
  const spokeM = M({ color: '#c9cdd2', roughness: 0.25, metalness: 0.85 });
  const hubM = M({ color: '#2a2b2d', roughness: 0.4, metalness: 0.6 });
  const opCar = makeCar(null); opCar.position.set(-2.8, 0, -0.9); scene.add(opCar);
  const seCar = makeCar('#8a2b22'); seCar.position.set(2.8, 0, -0.9); scene.add(seCar);
  const parked = [['#e4e1da', -8.4, 0], ['#5d6166', 8.4, 0], ['#9aa3a8', -11.2, 0.02]].map(([c, x, r]) => { const k = makeCar(c); k.position.set(x, 0, -0.9); k.rotation.y = r; scene.add(k); return k; });
  void parked;
  const headSpot = new THREE.SpotLight('#fff1d6', 0, 40, 0.5, 0.6, 1.2);
  headSpot.position.set(0, 0.8, 2.1); opCar.add(headSpot); headSpot.target.position.set(0, 0, 14); opCar.add(headSpot.target);

  // Drive path (US rules, keep right): forward out of the space, through the
  // lot exit, a left turn across the near lane into the far (eastbound) lane,
  // centred in it (road z 8.5..15.5, centre line z 12, lane centre z 13.75),
  // then a left turn across the westbound lane into the driveway.
  const LANE_Z = 13.75;
  const path = new THREE.CatmullRomCurve3([
    V(-2.8, 0, -0.9), V(-2.8, 0, 1.8), V(-1.6, 0, 4.0), V(2.0, 0, 5.4), V(5.6, 0, 6.6), V(6.9, 0, 8.6),
    V(8.0, 0, 11.2), V(10.2, 0, 13.2), V(13.6, 0, LANE_Z), V(30, 0, LANE_Z), V(70, 0, LANE_Z), V(110, 0, LANE_Z),
    V(128, 0, LANE_Z), V(133.6, 0, 13.4), V(137.0, 0, 11.6), V(138.7, 0, 9.0), V(139, 0, 7.2), V(139, 0, 5.6)
  ], false, 'centripetal');
  path.arcLengthDivisions = 6000; path.updateArcLengths(); // fine table: even speed, no jitter
  const pathLen = path.getLength();
  const DRIVE0 = 13.4, DRIVE1 = 24.0;
  function driveU(t) {
    // ease in over the first 2.2 s, cruise, ease out over the last 2.0 s
    const a = DRIVE0, b = DRIVE1, T = b - a, ti = 2.2, to = 2.2;
    const tt = Math.max(0, Math.min(T, t - a));
    const vmax = 1 / (T - ti / 2 - to / 2);
    let d;
    if (tt < ti) d = 0.5 * vmax * tt * tt / ti;
    else if (tt < T - to) d = 0.5 * vmax * ti + vmax * (tt - ti);
    else { const r = T - tt; d = 1 - 0.5 * vmax * r * r / to; }
    return clamp01(d);
  }

  // ---- People ----------------------------------------------------------------
  // Pictogram cast: the operator wears the orange vest, the seller is plain.
  const kit = await loadPeople(ctx.loadGLTF, { asset: ctx.asset });
  const clips = kit.clips;
  const CAST = {
    operator: { look: LOOKS.staffOrange, height: 1.68 },
    seller: { look: LOOKS.casualOlive, height: 1.82 }
  };
  function person(kind) {
    const P = kit.person({ ...CAST[kind], mixer: false });
    const root = P.model, holder = P.root;
    scene.add(holder);
    const mixer = new THREE.AnimationMixer(root);
    const acts = {};
    for (const k of ['idle', 'walk']) { acts[k] = mixer.clipAction(clips[k]); acts[k].play(); acts[k].setEffectiveWeight(k === 'idle' ? 1 : 0); }
    const B = P.bones;
    return { holder, root, mixer, acts, B, kind, P };
  }
  const op = person('operator');
  const se = person('seller');
  const opHome = person('operator');
  se.mixer.setTime(1.3);

  // Bone aiming (post-animation pose layering). A bone's +Y axis is its length.
  const _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _q3 = new THREE.Quaternion(), _v = new THREE.Vector3(), _d = new THREE.Vector3();
  function aim(bone, dirWorld, w) {
    if (!bone || w <= 0) return;
    bone.updateWorldMatrix(true, false);
    bone.getWorldQuaternion(_q);
    _v.set(0, 1, 0).applyQuaternion(_q);
    _q2.setFromUnitVectors(_v, _d.copy(dirWorld).normalize()).multiply(_q);
    bone.parent.getWorldQuaternion(_q3);
    _q3.invert().multiply(_q2);
    bone.quaternion.slerp(_q3, Math.min(1, w));
    bone.updateWorldMatrix(false, true);
  }
  // character-local direction -> world
  const toW = (p, x, y, z) => _dl.set(x, y, z).applyQuaternion(p.holder.quaternion);
  const _dl = new THREE.Vector3();
  function holdPose(p, side, w, reach = 0) {
    if (w <= 0) return;
    const s = side === 'Right' ? -1 : 1; // character-local x of that side
    aim(p.B[side + 'Arm'], toW(p, s * 0.32, -0.8 + reach * 0.35, 0.42 + reach * 0.3), w);
    aim(p.B[side + 'ForeArm'], toW(p, -s * 0.3, 0.42 - reach * 0.3, 0.86), w);
    aim(p.B[side + 'Hand'], toW(p, -s * 0.15, 0.2 - reach * 0.1, 1), w);
  }
  // Seated on the couch, back against the backrest, thighs along the seat,
  // shins down to the floor, hands resting on the thighs.
  function sitPose(p, w) {
    aim(p.B.LeftUpLeg, toW(p, 0.1, -0.06, 1), w); aim(p.B.RightUpLeg, toW(p, -0.1, -0.06, 1), w);
    aim(p.B.LeftLeg, toW(p, 0.02, -1, 0.3), w); aim(p.B.RightLeg, toW(p, -0.02, -1, 0.3), w);
    aim(p.B.LeftFoot, toW(p, 0, -0.35, 1), w); aim(p.B.RightFoot, toW(p, 0, -0.35, 1), w);
    aim(p.B.Spine, toW(p, 0, 1, -0.16), w * 0.9);
    aim(p.B.Spine2, toW(p, 0, 1, -0.05), w * 0.8);
    aim(p.B.Neck, toW(p, 0, 1, 0.2), w * 0.8);
    aim(p.B.Head, toW(p, 0, 0.8, 0.6), w * 0.8);
    aim(p.B.LeftArm, toW(p, 0.14, -0.95, 0.28), w); aim(p.B.RightArm, toW(p, -0.14, -0.95, 0.28), w);
    aim(p.B.LeftForeArm, toW(p, -0.08, -0.42, 1), w); aim(p.B.RightForeArm, toW(p, 0.08, -0.42, 1), w);
  }
  const handPos = (p, side, out) => kit.hand(p.P, side, out);
  const headPos = (p, out) => { p.B.Head.getWorldPosition(out); return out; };

  // ---- Phones in the meetup ---------------------------------------------------
  const SW = 360, SH = 760;
  function appFrame(g, title) {
    g.fillStyle = CREAM; g.fillRect(0, 0, SW, SH);
    g.fillStyle = INK; g.font = sans(20, 600); g.fillText('6:42', 34, 48);
    g.fillStyle = '#000'; rr(g, SW / 2 - 52, 22, 104, 30, 15); g.fill();
    g.fillStyle = INK; g.fillRect(SW - 74, 36, 26, 13);
    if (LOGO) g.drawImage(LOGO, 28, 82, 36, 36); else { g.fillStyle = ORANGE; rr(g, 28, 82, 36, 36, 8); g.fill(); }
    g.fillStyle = INK; g.font = sans(26, 800); g.fillText('InPhox', 74, 110);
    g.fillStyle = MUTED; g.font = mono(15, 500); g.fillText(title, 28, 160);
  }
  const opScreen = dynTex(SW, SH, (g, w, h, s) => {
    const st = s.st, p = s.p || 0;
    if (st === 'home') { appFrame(g, 'BUY · CHECK A DEVICE'); g.fillStyle = INK; g.font = sans(34, 800); g.fillText('Scan the IMEI', 28, 210); return; }
    if (st === 'scan') {
      appFrame(g, 'BUY · CHECK A DEVICE');
      g.fillStyle = '#1d1a17'; rr(g, 28, 186, w - 56, 300, 22); g.fill();
      g.fillStyle = '#f2efe8'; rr(g, 70, 270, w - 140, 120, 8); g.fill();
      g.fillStyle = INK; barcode(g, 84, 282, w - 168, 80, 41);
      g.fillStyle = ORANGE; g.fillRect(44, 200 + p * 270, w - 88, 4);
      g.strokeStyle = ORANGE; g.lineWidth = 5;
      [[44, 202, 1, 1], [w - 44, 202, -1, 1], [44, 470, 1, -1], [w - 44, 470, -1, -1]].forEach(([x, y, a, b]) => { g.beginPath(); g.moveTo(x, y + b * 30); g.lineTo(x, y); g.lineTo(x + a * 30, y); g.stroke(); });
      g.fillStyle = INK; g.font = sans(28, 800); g.fillText('Reading IMEI…', 28, 540);
      g.fillStyle = MUTED; g.font = mono(17, 500); g.fillText('Hold steady over *#06#', 28, 574);
      return;
    }
    if (st === 'clean' || st === 'price') {
      appFrame(g, 'DEVICE CHECK');
      g.fillStyle = INK; g.font = sans(30, 800); g.fillText('iPhone 13', 28, 210);
      g.fillStyle = MUTED; g.font = mono(16, 500); g.fillText('128 GB · Midnight', 28, 240);
      g.fillText('IMEI 354672 11 090534 4', 28, 266);
      g.fillStyle = GREEN; rr(g, 28, 290, 150, 46, 23); g.fill();
      g.fillStyle = '#fff'; g.font = sans(22, 800); g.fillText('✓  Clean', 52, 321);
      const rows = [['Blacklist', 'Clear'], ['Carrier', 'Unlocked'], ['Activation lock', 'Off'], ['Payment plan', 'Paid off']];
      rows.forEach(([a, b], i) => {
        const y = 380 + i * 46; const on = st === 'price' || p * 4.5 > i + 0.4;
        g.fillStyle = 'rgba(22,19,15,0.08)'; g.fillRect(28, y + 14, w - 56, 1);
        g.fillStyle = INK; g.font = sans(19, 600); g.fillText(a, 28, y);
        g.fillStyle = on ? GREEN : '#c8c0b2'; g.font = mono(17, 700); g.textAlign = 'right'; g.fillText(on ? b + ' ✓' : '…', w - 28, y); g.textAlign = 'left';
      });
      if (st === 'price') {
        const a = smooth(p * 2);
        g.globalAlpha = a;
        g.fillStyle = INK; rr(g, 20, 560 + (1 - a) * 30, w - 40, 176, 18); g.fill();
        g.fillStyle = '#B9AE9E'; g.font = mono(15, 500); g.fillText('SUGGESTED OFFER', 40, 596 + (1 - a) * 30);
        g.fillStyle = CREAM; g.font = sans(54, 800); g.fillText('$310', 40, 652 + (1 - a) * 30);
        g.fillStyle = '#B9AE9E'; g.font = mono(15, 500); g.fillText('resale ~$389 · margin $79', 40, 682 + (1 - a) * 30);
        g.fillStyle = ORANGE; rr(g, 40, 694 + (1 - a) * 30, w - 80, 34, 17); g.fill();
        g.fillStyle = '#fff'; g.font = sans(17, 800); g.textAlign = 'center'; g.fillText('Pay seller $310', w / 2, 717 + (1 - a) * 30); g.textAlign = 'left';
        g.globalAlpha = 1;
      }
      return;
    }
    if (st === 'pay' || st === 'paid') {
      appFrame(g, 'PAY SELLER');
      g.fillStyle = INK; g.font = sans(70, 800); g.textAlign = 'center'; g.fillText('$310', w / 2, 300);
      g.fillStyle = MUTED; g.font = mono(16, 500); g.fillText('to the seller · phone to phone', w / 2, 336);
      if (st === 'pay') {
        g.strokeStyle = ORANGE; g.lineWidth = 8; g.beginPath(); g.arc(w / 2, 470, 54, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); g.stroke();
        g.fillStyle = INK; g.font = sans(22, 700); g.fillText('Sending…', w / 2, 580);
      } else {
        g.fillStyle = GREEN; g.beginPath(); g.arc(w / 2, 470, 58, 0, 7); g.fill();
        g.strokeStyle = '#fff'; g.lineWidth = 9; g.beginPath(); g.moveTo(w / 2 - 24, 472); g.lineTo(w / 2 - 6, 490); g.lineTo(w / 2 + 26, 452); g.stroke();
        g.fillStyle = INK; g.font = sans(26, 800); g.fillText('Paid', w / 2, 580);
        g.fillStyle = MUTED; g.font = mono(15, 500); g.fillText('Added to stock · cost $310', w / 2, 612);
      }
      g.textAlign = 'left';
    }
  });
  const soldScreen = dynTex(SW, SH, (g, w, h, s) => {
    if (s.st === 'imei') {
      g.fillStyle = '#f4f2ee'; g.fillRect(0, 0, w, h);
      g.fillStyle = INK; g.font = sans(26, 700); g.textAlign = 'center'; g.fillText('*#06#', w / 2, 220);
      g.font = mono(18, 500); g.fillStyle = MUTED; g.fillText('IMEI', w / 2, 290);
      g.fillStyle = INK; g.font = mono(22, 600); g.fillText('354672110905344', w / 2, 322);
      g.fillStyle = '#f2efe8'; rr(g, 50, 350, w - 100, 120, 8); g.fill();
      g.fillStyle = INK; barcode(g, 62, 362, w - 124, 96, 41);
      g.textAlign = 'left';
    } else if (s.st === 'test') {
      g.fillStyle = INK; g.fillRect(0, 0, w, h);
      if (LOGO) g.drawImage(LOGO, w / 2 - 36, 220, 72, 72);
      g.fillStyle = CREAM; g.font = sans(28, 800); g.textAlign = 'center'; g.fillText(s.done ? 'All tests passed' : 'Testing…', w / 2, 360);
      g.fillStyle = '#3a342d'; rr(g, 60, 400, w - 120, 12, 6); g.fill();
      g.fillStyle = s.done ? LGREEN : ORANGE; rr(g, 60, 400, (w - 120) * (s.p || 0), 12, 6); g.fill();
      g.textAlign = 'left';
    } else { g.fillStyle = '#060606'; g.fillRect(0, 0, w, h); }
  });
  const sellerScreen = dynTex(SW, SH, (g, w, h, s) => {
    g.fillStyle = '#121417'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#f2efe8'; g.font = sans(20, 600); g.fillText('6:43', 34, 48);
    if (s.st === 'got') {
      g.fillStyle = 'rgba(63,178,127,0.18)'; g.beginPath(); g.arc(w / 2, 300, 110, 0, 7); g.fill();
      g.fillStyle = LGREEN; g.beginPath(); g.arc(w / 2, 300, 64, 0, 7); g.fill();
      g.strokeStyle = '#fff'; g.lineWidth = 10; g.beginPath(); g.moveTo(w / 2 - 26, 302); g.lineTo(w / 2 - 6, 322); g.lineTo(w / 2 + 28, 282); g.stroke();
      g.fillStyle = '#f2efe8'; g.textAlign = 'center'; g.font = sans(52, 800); g.fillText('+$310.00', w / 2, 480);
      g.fillStyle = '#9a958c'; g.font = mono(17, 500); g.fillText('Payment received', w / 2, 516);
      g.textAlign = 'left';
    } else {
      g.fillStyle = '#9a958c'; g.font = mono(17, 500); g.textAlign = 'center'; g.fillText('Waiting for payment…', w / 2, 400); g.textAlign = 'left';
    }
  });
  const styleOf = (frame, back, kind = 'dual') => ({ name: 'x', frame, back, kind });
  const opPhone = makePhone(styleOf('#d8cfc0', '#e8dfcf', 'pixel'), opScreen.tex); opPhone.scale.setScalar(0.01); scene.add(opPhone);
  const soldPhone = makePhone(PHONE_STYLES[1], soldScreen.tex); soldPhone.scale.setScalar(0.01); scene.add(soldPhone);
  const sePhone = makePhone(styleOf('#2b2b2b', '#3b3d3f', 'galaxy'), sellerScreen.tex); sePhone.scale.setScalar(0.01); scene.add(sePhone);
  opScreen.set('home', { st: 'home' }); soldScreen.set('imei', { st: 'imei' }); sellerScreen.set('wait', { st: 'wait' });

  const _m4 = new THREE.Matrix4(), _x = new THREE.Vector3(), _y = new THREE.Vector3(), _z = new THREE.Vector3();
  // Put a phone on a person's palm: screen along face, phone up from upHint.
  // The hand turns (weight w) so the palm lies against the phone's back; the
  // phone's centre ends up in out (scene units are metres; phones are 0.01-scaled cm models).
  const _pd = new THREE.Vector3();
  function holdPhone(p, side, phone, face, upHint, w, out) {
    orient(phone, out, face, upHint);
    _pd.set(0, 1, 0).applyQuaternion(phone.quaternion);
    kit.orientHand(p.P, side, _pd, face, w);
    kit.hand(p.P, side, out);
    out.addScaledVector(face, kit.palmHalf(p.P) + 0.0045).addScaledVector(_pd, 0.03);
    phone.position.copy(out);
    return out;
  }
  function orient(obj, pos, face, upHint) {
    _z.copy(face).normalize();
    _x.crossVectors(upHint, _z).normalize();
    _y.crossVectors(_z, _x);
    _m4.makeBasis(_x, _y, _z);
    obj.quaternion.setFromRotationMatrix(_m4);
    obj.position.copy(pos);
  }

  // scan beam from the operator's phone camera to the seller's screen
  const beamM = track(new THREE.MeshBasicMaterial({ color: ORANGE, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  const beamGeo = new THREE.CylinderGeometry(0.0015, 0.012, 1, 10, 1, true); beamGeo.translate(0, 0.5, 0);
  const beam = new THREE.Mesh(beamGeo, beamM); scene.add(beam);
  // payment dots
  const dotGeo = new THREE.SphereGeometry(0.012, 10, 8);
  const dotM = track(new THREE.MeshBasicMaterial({ color: ORANGE, transparent: true }));
  const dots = new THREE.InstancedMesh(dotGeo, dotM, 18); dots.frustumCulled = false; scene.add(dots);

  // ---- Floating labels --------------------------------------------------------
  function labelTex(kicker, text, tone) {
    return staticTex(640, 168, (g, w, h) => {
      g.fillStyle = 'rgba(22,19,15,0.25)'; rr(g, 10, 16, w - 20, h - 22, 24); g.fill();
      g.fillStyle = CREAM; rr(g, 6, 6, w - 20, h - 26, 24); g.fill();
      g.fillStyle = tone || ORANGE; rr(g, 6, 6, 12, h - 26, 6); g.fill();
      g.fillStyle = tone || ORANGE; g.beginPath(); g.arc(52, 52, 9, 0, 7); g.fill();
      g.fillStyle = MUTED; g.font = mono(24, 600); g.fillText(kicker, 74, 61);
      g.fillStyle = INK; g.font = sans(44, 800); g.fillText(text, 40, 118);
    });
  }
  const labels = [];
  const _cp2 = new THREE.Vector3();
  function addLabel(kicker, text, a, b, anchor, size = 0.5, tone) {
    const mat = track(new THREE.SpriteMaterial({ map: labelTex(kicker, text, tone), transparent: true, depthTest: false, depthWrite: false, opacity: 0 }));
    const s = new THREE.Sprite(mat); s.renderOrder = 50; s.scale.set(size, size * 168 / 640, 1); s.center.set(0.5, 0);
    scene.add(s); labels.push({ s, a, b, anchor, size });
  }

  // ---- The house ---------------------------------------------------------------
  const house = new THREE.Group(); house.position.copy(HOUSE); scene.add(house);
  const RW = 6, RD = 5, RH = 2.7;
  const plankTex = staticTex(512, 512, (g, w, h) => {
    for (let r = 0; r < 8; r++) {
      const off = (r % 2) * 180;
      for (let x = -off; x < w; x += 360) {
        const l = 38 + Math.random() * 8;
        g.fillStyle = `hsl(28, ${38 + Math.random() * 10}%, ${l}%)`; g.fillRect(x, r * 64, 360, 64);
        for (let k = 0; k < 30; k++) { g.fillStyle = `rgba(60,35,15,${Math.random() * 0.12})`; g.fillRect(x, r * 64 + Math.random() * 64, 360, 1 + Math.random() * 2); }
        g.fillStyle = 'rgba(40,24,10,0.5)'; g.fillRect(x, r * 64, 2, 64);
      }
      g.fillStyle = 'rgba(40,24,10,0.55)'; g.fillRect(0, r * 64, w, 2);
    }
  }, true);
  plankTex.repeat.set(3, 2.5);
  const floorM = M({ map: plankTex, roughness: 0.55, metalness: 0 });
  const wallM = M({ color: '#e7dccb', roughness: 0.92 });
  const extM = M({ color: '#cdbfa8', roughness: 0.9 });
  const trimM = M({ color: '#f4efe6', roughness: 0.6 });
  const hm = (geo, mat, x, y, z, parent = house) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };
  hm(new THREE.BoxGeometry(RW, 0.1, RD), floorM, 0, -0.05, 0);
  hm(new THREE.BoxGeometry(RW + 0.4, 0.12, RD + 0.4), M({ color: '#f1ebe1', roughness: 0.95 }), 0, RH + 0.06, 0);
  // walls: back, left, right (single boxes); front has a window opening
  const T = 0.18;
  hm(new THREE.BoxGeometry(RW + 2 * T, RH, T), wallM, 0, RH / 2, -RD / 2 - T / 2);
  hm(new THREE.BoxGeometry(T, RH, RD), wallM, -RW / 2 - T / 2, RH / 2, 0);
  hm(new THREE.BoxGeometry(T, RH, RD), wallM, RW / 2 + T / 2, RH / 2, 0);
  const wx = WIN.x, ww = 1.7, wsill = 0.75, wtop = 2.1;
  const frontParts = [
    [(-RW / 2 + (wx - ww / 2)) / 2, RH / 2, (wx - ww / 2) - (-RW / 2 - T), RH],
    [((wx + ww / 2) + RW / 2) / 2, RH / 2, RW / 2 + T - (wx + ww / 2), RH],
    [wx, wsill / 2, ww, wsill], [wx, (wtop + RH) / 2, ww, RH - wtop]
  ];
  frontParts.forEach(([x, y, w, h]) => {
    hm(new THREE.BoxGeometry(w, h, T), wallM, x, y, RD / 2 + T / 2 - 0.02);
    hm(new THREE.BoxGeometry(w, h, 0.06), extM, x, y, RD / 2 + T + 0.03);
  });
  // window trim + mullion
  const trimH = new THREE.BoxGeometry(ww + 0.16, 0.08, 0.3), trimV = new THREE.BoxGeometry(0.08, wtop - wsill, 0.3);
  hm(trimH, trimM, wx, wsill, RD / 2 + T / 2 + 0.04); hm(trimH, trimM, wx, wtop, RD / 2 + T / 2 + 0.04);
  hm(trimV, trimM, wx - ww / 2, (wsill + wtop) / 2, RD / 2 + T / 2 + 0.04); hm(trimV, trimM, wx + ww / 2, (wsill + wtop) / 2, RD / 2 + T / 2 + 0.04);
  const glassMat = track(new THREE.MeshPhysicalMaterial({ color: '#cfe0ea', roughness: 0.05, metalness: 0, transparent: true, opacity: 0.18, depthWrite: false }));
  const glass = hm(new THREE.PlaneGeometry(ww, wtop - wsill), glassMat, wx, (wsill + wtop) / 2, RD / 2 + T / 2 + 0.02); glass.castShadow = false;
  // exterior shell: siding around the room + gable roof, porch light, door
  const shellM = M({ color: '#c4b59d', roughness: 0.9 });
  hm(new THREE.BoxGeometry(0.06, RH + 0.4, RD + 2 * T + 0.1), shellM, -RW / 2 - T - 0.05, (RH + 0.4) / 2, 0);
  hm(new THREE.BoxGeometry(0.06, RH + 0.4, RD + 2 * T + 0.1), shellM, RW / 2 + T + 0.05, (RH + 0.4) / 2, 0);
  hm(new THREE.BoxGeometry(RW + 2 * T + 0.16, 0.4, 0.06), shellM, 0, RH + 0.2, RD / 2 + T + 0.05);
  const roof = new THREE.Mesh(roofGeo, M({ color: '#3f3a36', roughness: 0.8 }));
  roof.scale.set(RD + 1.6, 3, RW + 1.2); roof.rotation.y = Math.PI / 2; roof.position.set(0, RH + 0.4, 0); roof.castShadow = true; house.add(roof);
  const extDoor = hm(new THREE.BoxGeometry(0.95, 2.05, 0.06), M({ color: '#2f4a43', roughness: 0.5 }), 1.8, 1.03, RD / 2 + T + 0.06);
  void extDoor;
  const porch = new THREE.PointLight('#ffc98a', 0, 8, 2); porch.position.set(1.8, 2.35, RD / 2 + 0.7); house.add(porch);
  const porchBulb = hm(new THREE.SphereGeometry(0.07, 12, 8), M({ color: '#fff', emissive: '#ffd6a0', emissiveIntensity: 2 }), 1.25, 2.3, RD / 2 + T + 0.12);
  void porchBulb;

  // interior: rug, couch, coffee table, lamp, shelf, art, door, plant
  const rugTex = staticTex(512, 340, (g, w, h) => {
    g.fillStyle = '#d9cbb3'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#a2846a'; g.lineWidth = 10; g.strokeRect(22, 22, w - 44, h - 44);
    g.strokeStyle = '#c56a3a'; g.lineWidth = 4; g.strokeRect(44, 44, w - 88, h - 88);
    for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(80,60,40,${Math.random() * 0.08})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
  });
  const rug = hm(new THREE.PlaneGeometry(2.6, 1.8), M({ map: rugTex, roughness: 1 }), -0.3, 0.006, -0.1); rug.rotation.x = -Math.PI / 2;

  let couch;
  try {
    couch = (await ctx.loadGLTF('assets/ind-solo/couch.glb')).scene;
    couch.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } });
    const box = new THREE.Box3().setFromObject(couch);
    couch.position.y = -box.min.y;
    const cw = new THREE.Group(); cw.add(couch); cw.rotation.y = COUCH_YAW; cw.position.set(-0.3, 0, 0.75); cw.scale.setScalar(1.05); house.add(cw);
  } catch (e) {
    const cm = M({ color: '#8d8478', roughness: 0.95 });
    hm(new RoundedBoxGeometry(2.0, 0.42, 0.9, 3, 0.08), cm, -0.3, 0.25, 0.75);
    hm(new RoundedBoxGeometry(2.0, 0.5, 0.22, 3, 0.08), cm, -0.3, 0.65, 1.1);
  }
  const woodTex = staticTex(256, 256, (g, w, h) => {
    g.fillStyle = '#8a5c3a'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 80; i++) { g.strokeStyle = `rgba(50,28,12,${0.08 + Math.random() * 0.12})`; g.lineWidth = 1 + Math.random() * 2; g.beginPath(); const y = Math.random() * h; g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + 6, w * 0.6, y - 6, w, y + 2); g.stroke(); }
  });
  const woodM = M({ map: woodTex, roughness: 0.45, metalness: 0 });
  const TBL = V(-0.3, 0.42, -0.45);
  hm(new RoundedBoxGeometry(1.2, 0.04, 0.6, 2, 0.015), woodM, TBL.x, TBL.y - 0.02, TBL.z);
  [[-0.54, -0.24], [0.54, -0.24], [-0.54, 0.24], [0.54, 0.24]].forEach(([x, z]) => hm(new THREE.CylinderGeometry(0.018, 0.014, 0.4, 8), M({ color: '#2a2622', roughness: 0.5, metalness: 0.5 }), TBL.x + x, 0.2, TBL.z + z));

  // laptop (screen faces +z, toward the couch and the window)
  const lapScreen = dynTex(1024, 640, drawLaptop);
  const laptop = new THREE.Group(); laptop.position.set(TBL.x - 0.12, TBL.y, TBL.z - 0.02); house.add(laptop);
  const aluM = M({ color: '#b9bcc1', roughness: 0.35, metalness: 0.85 });
  const lapBase = new THREE.Mesh(new RoundedBoxGeometry(0.31, 0.012, 0.215, 2, 0.005), aluM); lapBase.position.set(0, 0.006, 0.0); lapBase.castShadow = true; laptop.add(lapBase);
  const kb = new THREE.Mesh(new THREE.PlaneGeometry(0.27, 0.1), M({ color: '#1d1e20', roughness: 0.7 })); kb.rotation.x = -Math.PI / 2; kb.position.set(0, 0.0125, -0.03); laptop.add(kb);
  const lidHinge = new THREE.Group(); lidHinge.position.set(0, 0.012, -0.105); lidHinge.rotation.x = -0.28; laptop.add(lidHinge);
  const lid = new THREE.Mesh(new RoundedBoxGeometry(0.31, 0.205, 0.008, 2, 0.004), aluM); lid.position.set(0, 0.1025, 0); lid.castShadow = true; lidHinge.add(lid);
  const lapScrMat = M({ color: '#000', emissive: '#ffffff', emissiveMap: lapScreen.tex, emissiveIntensity: 1, roughness: 0.75, envMapIntensity: 0.15 });
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.29, 0.18), lapScrMat); scr.position.set(0, 0.104, 0.0045); lidHinge.add(scr);
  const lapGlow = new THREE.PointLight('#cfe0ff', 0.25, 1.6, 2); lapGlow.position.set(0, 0.15, 0.15); laptop.add(lapGlow);
  // cable from laptop to the phone dock spot
  const DOCK = V(TBL.x - 0.42, TBL.y + 0.004, TBL.z + 0.12);
  const cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    V(laptop.position.x - 0.155, TBL.y + 0.006, laptop.position.z - 0.02), V(laptop.position.x - 0.22, TBL.y + 0.004, laptop.position.z + 0.0),
    V(DOCK.x + 0.04, TBL.y + 0.004, DOCK.z - 0.12), V(DOCK.x, TBL.y + 0.004, DOCK.z - 0.085)
  ]), 24, 0.0028, 6), M({ color: '#f1efe9', roughness: 0.45 })); house.add(cable);

  // compact label printer
  const printer = new THREE.Group(); printer.position.set(TBL.x + 0.43, TBL.y, TBL.z - 0.1); printer.rotation.y = -0.35; house.add(printer);
  const prM = M({ color: '#2a2724', roughness: 0.55 });
  const prBody = new THREE.Mesh(new RoundedBoxGeometry(0.13, 0.1, 0.15, 3, 0.025), prM); prBody.position.y = 0.05; prBody.castShadow = true; printer.add(prBody);
  const prTop = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.012, 0.1, 2, 0.005), M({ color: '#3a3632', roughness: 0.3, metalness: 0.1, transparent: true, opacity: 0.85 })); prTop.position.set(0, 0.1, -0.015); printer.add(prTop);
  const prStripe = new THREE.Mesh(new THREE.BoxGeometry(0.131, 0.006, 0.151), M({ color: ORANGE, roughness: 0.5 })); prStripe.position.y = 0.02; printer.add(prStripe);
  const prLed = new THREE.Mesh(new THREE.SphereGeometry(0.004, 8, 6), M({ color: '#222', emissive: LGREEN, emissiveIntensity: 1 })); prLed.position.set(0.045, 0.08, 0.076); printer.add(prLed);
  const shipLabel = staticTex(400, 600, (g, w, h) => {
    g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, w, h);
    g.fillStyle = INK; g.font = sans(44, 800); g.fillText('PRIORITY', 24, 60);
    g.fillRect(24, 76, w - 48, 4);
    g.font = mono(17, 500); g.fillText('FROM  Home office · Oakland CA', 24, 112);
    g.font = mono(15, 500); g.fillStyle = MUTED; g.fillText('SHIP TO', 24, 150);
    g.fillStyle = INK; g.font = sans(28, 700); g.fillText('R. Okafor', 24, 186);
    g.font = mono(18, 500); g.fillText('2140 Larch Ave, Apt 3', 24, 216); g.fillText('Portland OR 97214', 24, 242);
    g.fillRect(24, 266, w - 48, 3);
    barcode(g, 24, 290, w - 48, 150, 77);
    g.font = mono(20, 700); g.fillText('ORDER #1042 · 0.4 lb', 24, 480);
    g.fillStyle = ORANGE; g.fillRect(24, 510, 110, 22);
    if (LOGO) g.drawImage(LOGO, w - 84, h - 84, 60, 60);
  });
  const labelPaperM = M({ map: shipLabel, roughness: 0.75 });
  const paperClip = new THREE.Group(); paperClip.position.set(0, 0.07, 0.076); printer.add(paperClip);
  const paperGeo = new THREE.PlaneGeometry(0.1, 0.15); paperGeo.translate(0, 0.075, 0);
  const paper = new THREE.Mesh(paperGeo, labelPaperM); paper.rotation.set(Math.PI / 2 - 0.22, Math.PI, 0); paperClip.add(paper);

  // phones lined up on the table (screens up), the bought one will join them
  const offTex = staticTex(SW, SH, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#0d0c0b'); gr.addColorStop(1, '#16130f'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.05)'; g.beginPath(); g.moveTo(0, h * 0.18); g.lineTo(w, 0); g.lineTo(w, h * 0.12); g.lineTo(0, h * 0.34); g.fill(); });
  const tablePhones = [];
  [0, 3, 5, 9].forEach((si, i) => {
    const ph = makePhone(PHONE_STYLES[si], offTex, { lite: true }); ph.scale.setScalar(0.01);
    ph.rotation.set(-Math.PI / 2, 0, 0.04 * (i - 1.5)); ph.position.set(TBL.x - 0.5 + i * 0.085, TBL.y + 0.005, TBL.z - 0.17); house.add(ph); tablePhones.push(ph);
  });
  // the bought phone at home (a second instance so the meetup one can stay put)
  const homePhone = makePhone(PHONE_STYLES[1], soldScreen.tex); homePhone.scale.setScalar(0.01); house.add(homePhone);

  // small shipping box with four flaps
  const kraft = await new Promise(res => new THREE.TextureLoader().load('assets/story/kraft.jpg', t => { t.colorSpace = THREE.SRGBColorSpace; res(track(t)); }, undefined, () => res(null)));
  const boxM = M({ map: kraft, color: '#d8b07c', roughness: 0.9 });
  const BX = 0.22, BY = 0.08, BZ = 0.15, BT = 0.004;
  const box = new THREE.Group(); house.add(box);
  const bpart = (w, h, d, x, y, z, par = box) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), boxM); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; par.add(m); return m; };
  bpart(BX, BT, BZ, 0, BT / 2, 0); bpart(BX, BY, BT, 0, BY / 2, BZ / 2); bpart(BX, BY, BT, 0, BY / 2, -BZ / 2); bpart(BT, BY, BZ, BX / 2, BY / 2, 0); bpart(BT, BY, BZ, -BX / 2, BY / 2, 0);
  const flaps = [];
  const flap = (w, d, x, z, axis, sign) => { const h = new THREE.Group(); h.position.set(x, BY, z); box.add(h); const f = bpart(w, BT, d, 0, 0, 0, h); if (axis === 'x') f.position.z = sign * d / 2; else f.position.x = sign * w / 2; h.userData = { axis, sign }; flaps.push(h); };
  flap(BX, BZ / 2, 0, BZ / 2, 'x', -1); flap(BX, BZ / 2, 0, -BZ / 2, 'x', 1); flap(BZ / 2 - 0.004, BZ, -BX / 2, 0, 'z', 1); flap(BZ / 2 - 0.004, BZ, BX / 2, 0, 'z', -1);
  flaps[2].children[0].scale.set(1, 1, 1);
  const boxLabel = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.105), labelPaperM); boxLabel.rotation.set(-Math.PI / 2, 0, Math.PI / 2); boxLabel.position.set(0.03, BY + BT + 0.003, 0); box.add(boxLabel);
  const BOX_TABLE = V(TBL.x + 0.2, TBL.y, TBL.z + 0.15), BOX_DOOR = V(1.0, 0, -2.15);

  // floor lamp, side shelf, art, interior door, plant
  const lampPos = V(-1.75, 0, 0.9);
  hm(new THREE.CylinderGeometry(0.14, 0.16, 0.03, 20), M({ color: '#222', metalness: 0.6, roughness: 0.4 }), lampPos.x, 0.015, lampPos.z);
  hm(new THREE.CylinderGeometry(0.012, 0.012, 1.5, 8), M({ color: '#222', metalness: 0.6, roughness: 0.4 }), lampPos.x, 0.76, lampPos.z);
  const shade = hm(new THREE.CylinderGeometry(0.16, 0.22, 0.28, 24, 1, true), M({ color: '#f1e3c8', emissive: '#ffb869', emissiveIntensity: 0.9, roughness: 0.9, side: THREE.DoubleSide }), lampPos.x, 1.55, lampPos.z); shade.castShadow = false;
  const lampL = new THREE.PointLight('#ffa95c', 9, 8, 1.6); lampL.position.set(lampPos.x, 1.5, lampPos.z); house.add(lampL);
  const ceil = new THREE.SpotLight('#ffcf9a', 22, 6, 0.85, 0.9, 1.4); ceil.position.set(0.4, RH - 0.05, 0.6); ceil.target.position.set(-0.3, 0.4, -0.5);
  ceil.castShadow = true; ceil.shadow.mapSize.set(1024, 1024); ceil.shadow.bias = -0.0006; ceil.shadow.normalBias = 0.02; ceil.shadow.radius = 4;
  house.add(ceil, ceil.target);
  const fill = new THREE.PointLight('#ffd7a8', 1.1, 9, 1.5); fill.position.set(1.6, 2.2, 1.2); house.add(fill);
  const artTex = staticTex(400, 300, (g, w, h) => {
    g.fillStyle = '#efe7da'; g.fillRect(0, 0, w, h);
    g.fillStyle = ORANGE; g.beginPath(); g.arc(150, 160, 80, 0, 7); g.fill();
    g.fillStyle = GREEN; g.fillRect(200, 60, 120, 170);
    g.fillStyle = INK; g.fillRect(60, 238, 280, 8);
  });
  hm(new THREE.BoxGeometry(0.92, 0.7, 0.03), M({ color: '#2a2622', roughness: 0.5 }), -0.3, 1.65, -RD / 2 + 0.02);
  hm(new THREE.PlaneGeometry(0.84, 0.62), M({ map: artTex, roughness: 0.8 }), -0.3, 1.65, -RD / 2 + 0.04);
  const doorFrame = hm(new THREE.BoxGeometry(1.08, 2.15, 0.05), trimM, 1.45, 1.075, -RD / 2 + 0.01); void doorFrame;
  hm(new THREE.BoxGeometry(0.94, 2.05, 0.05), M({ color: '#3a4f48', roughness: 0.55 }), 1.45, 1.03, -RD / 2 + 0.04);
  hm(new THREE.SphereGeometry(0.03, 12, 8), M({ color: '#c9a35c', metalness: 0.9, roughness: 0.3 }), 1.08, 1.0, -RD / 2 + 0.1);
  // shelf with books on the left of the back wall
  [[1.0, 0.03, 0.32, 0, 0.015], [1.0, 0.03, 0.32, 0, 0.6], [1.0, 0.03, 0.32, 0, 1.2], [1.0, 0.03, 0.32, 0, 1.6], [0.03, 1.6, 0.32, -0.485, 0.8], [0.03, 1.6, 0.32, 0.485, 0.8]]
    .forEach(([w, h, d, x, y]) => hm(new THREE.BoxGeometry(w, h, d), woodM, -2.2 + x, y, -RD / 2 + 0.17));
  for (let i = 0; i < 18; i++) {
    const c = new THREE.Color().setHSL(rnd(), 0.3, 0.35 + rnd() * 0.25);
    const bh = 0.2 + rnd() * 0.06;
    hm(new THREE.BoxGeometry(0.035 + rnd() * 0.02, bh, 0.2), M({ color: c, roughness: 0.8 }), -2.62 + (i % 9) * 0.09, 0.615 + Math.floor(i / 9) * 0.6 + bh / 2, -RD / 2 + 0.2);
  }
  // plant
  hm(new THREE.CylinderGeometry(0.16, 0.12, 0.34, 16), M({ color: '#d8cfc2', roughness: 0.7 }), 2.4, 0.17, -1.9);
  const plantLeaves = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.18, 1), M({ color: '#3d6b3a', roughness: 0.8 }), 7);
  for (let i = 0; i < 7; i++) plantLeaves.setMatrixAt(i, mm.compose(V(2.4 + (rnd() - 0.5) * 0.4, 0.55 + rnd() * 0.6, -1.9 + (rnd() - 0.5) * 0.4), qq, V(1, 1.4, 1)));
  plantLeaves.castShadow = true; house.add(plantLeaves);

  // ---- Laptop UI -----------------------------------------------------------------
  const TESTS = ['Display', 'Touch', 'Face ID', 'Cameras', 'Speakers', 'Microphones', 'Wi-Fi', 'Bluetooth', 'Cellular', 'Battery 89%', 'Buttons', 'Sensors'];
  function drawLaptop(g, w, h, s) {
    g.fillStyle = CREAM; g.fillRect(0, 0, w, h);
    // top bar
    g.fillStyle = INK; g.fillRect(0, 0, w, 56);
    if (LOGO) g.drawImage(LOGO, 18, 12, 32, 32);
    g.fillStyle = CREAM; g.font = sans(22, 800); g.fillText('InPhox', 60, 36);
    g.fillStyle = '#B9AE9E'; g.font = mono(15, 500); g.fillText('HOME OFFICE · 1 STATION', 170, 35);
    g.textAlign = 'right'; g.fillText('8:42 PM', w - 22, 35); g.textAlign = 'left';
    if (s.st === 'total') {
      g.fillStyle = MUTED; g.font = mono(20, 600); g.fillText('ORDER #1042 · SHIPPED', 60, 130);
      g.fillStyle = INK; g.font = sans(34, 700); g.fillText('Order total', 60, 190);
      g.font = sans(150, 800); g.fillText('$389.00', 52, 340);
      const rows = [['Bought in the lot', '$310.00'], ['Shipping label', 'prepaid'], ['Margin', '+$79.00']];
      rows.forEach(([a, b], i) => {
        const y = 420 + i * 52; g.fillStyle = 'rgba(22,19,15,0.12)'; g.fillRect(60, y + 16, w - 120, 2);
        g.fillStyle = INK; g.font = sans(26, 600); g.fillText(a, 60, y);
        g.fillStyle = i === 2 ? GREEN : INK; g.font = mono(26, 700); g.textAlign = 'right'; g.fillText(b, w - 60, y); g.textAlign = 'left';
      });
      return;
    }
    // left: device card
    g.fillStyle = '#fff'; rr(g, 24, 80, 330, 536, 16); g.fill();
    g.strokeStyle = '#E3DACB'; g.lineWidth = 2; rr(g, 24, 80, 330, 536, 16); g.stroke();
    g.fillStyle = '#1f2a36'; rr(g, 48, 106, 70, 136, 14); g.fill();
    g.fillStyle = s.conn ? '#2a3b52' : '#111'; rr(g, 54, 112, 58, 124, 10); g.fill();
    g.fillStyle = INK; g.font = sans(30, 800); g.fillText('iPhone 13', 136, 140);
    g.fillStyle = MUTED; g.font = mono(16, 500); g.fillText('128 GB · Midnight', 136, 168);
    g.fillText('IMEI …0534 4', 136, 194);
    const pill = (x, y, txt, bg, fg) => { g.font = sans(18, 800); const tw = g.measureText(txt).width + 30; g.fillStyle = bg; rr(g, x, y, tw, 34, 17); g.fill(); g.fillStyle = fg; g.fillText(txt, x + 15, y + 23); return tw; };
    pill(136, 208, s.conn ? 'Connected' : 'Waiting for device', s.conn ? '#E6F2EA' : '#EFE8DC', s.conn ? GREEN : MUTED);
    const facts = [['Bought', '$310 · today'], ['IMEI check', 'Clean'], ['Battery', s.n > 9 ? '89%' : '—'], ['Grade', s.grade ? 'A' : '—']];
    facts.forEach(([a, b], i) => {
      const y = 300 + i * 48; g.fillStyle = 'rgba(22,19,15,0.08)'; g.fillRect(48, y + 16, 282, 2);
      g.fillStyle = MUTED; g.font = mono(16, 500); g.fillText(a.toUpperCase(), 48, y);
      g.fillStyle = INK; g.font = sans(20, 700); g.textAlign = 'right'; g.fillText(b, 330, y); g.textAlign = 'left';
    });
    if (s.grade) {
      g.fillStyle = INK; rr(g, 48, 500, 282, 92, 14); g.fill();
      g.fillStyle = ORANGE; g.font = sans(62, 800); g.fillText('A', 70, 568);
      g.fillStyle = CREAM; g.font = sans(22, 700); g.fillText('Grade A', 130, 545);
      g.fillStyle = '#B9AE9E'; g.font = mono(15, 500); g.fillText('12/12 passed · wiped', 130, 572);
    }
    // right column
    const X0 = 378;
    if (s.st === 'test') {
      g.fillStyle = INK; g.font = sans(30, 800); g.fillText(s.n >= 12 ? 'All tests passed' : 'Testing…', X0, 120);
      g.fillStyle = '#E3DACB'; rr(g, X0, 140, w - X0 - 24, 12, 6); g.fill();
      g.fillStyle = s.n >= 12 ? LGREEN : ORANGE; rr(g, X0, 140, (w - X0 - 24) * (s.n / 12), 12, 6); g.fill();
      TESTS.forEach((tn, i) => {
        const col = i % 2, row = Math.floor(i / 2), x = X0 + col * 316, y = 176 + row * 72;
        g.fillStyle = '#fff'; rr(g, x, y, 300, 60, 10); g.fill();
        const done = i < s.n, run = i === s.n;
        g.fillStyle = done ? LGREEN : run ? ORANGE : '#E3DACB'; g.beginPath(); g.arc(x + 30, y + 30, 13, 0, 7); g.fill();
        if (done) { g.strokeStyle = '#fff'; g.lineWidth = 4; g.beginPath(); g.moveTo(x + 23, y + 30); g.lineTo(x + 28, y + 36); g.lineTo(x + 38, y + 24); g.stroke(); }
        g.fillStyle = done || run ? INK : MUTED; g.font = sans(21, 650); g.fillText(tn, x + 56, y + 38);
      });
      return;
    }
    // listing / sold / label
    const sold = s.st === 'sold' || s.st === 'label';
    if (sold) {
      g.fillStyle = ORANGE; rr(g, X0, 80, w - X0 - 24, 80, 14); g.fill();
      g.fillStyle = '#fff'; g.font = mono(16, 600); g.fillText('NEW ORDER · #1042', X0 + 24, 110);
      g.font = sans(30, 800); g.fillText('Sold · $389', X0 + 24, 146);
    } else {
      g.fillStyle = INK; g.font = sans(30, 800); g.fillText('Listing created', X0, 120);
      g.fillStyle = MUTED; g.font = mono(16, 500); g.fillText('3 sales channels · synced', X0, 148);
    }
    g.fillStyle = '#fff'; rr(g, X0, 180, w - X0 - 24, 300, 14); g.fill();
    g.fillStyle = '#1f2a36'; rr(g, X0 + 24, 204, 120, 220, 18); g.fill();
    g.fillStyle = '#2a3b52'; rr(g, X0 + 32, 212, 104, 204, 12); g.fill();
    g.fillStyle = INK; g.font = sans(28, 800); g.fillText('iPhone 13 · 128 GB', X0 + 170, 236);
    g.fillStyle = MUTED; g.font = mono(17, 500); g.fillText('Midnight · Grade A · Unlocked', X0 + 170, 266);
    g.fillStyle = INK; g.font = sans(64, 800); g.fillText('$389', X0 + 170, 350);
    pill(X0 + 170, 378, sold ? 'Sold' : 'Listed', sold ? '#FCE6D8' : '#E6F2EA', sold ? ORANGE : GREEN);
    if (s.st === 'label') {
      g.fillStyle = INK; rr(g, X0, 500, w - X0 - 24, 92, 14); g.fill();
      g.fillStyle = CREAM; g.font = sans(26, 800); g.fillText('Label printed ✓', X0 + 24, 540);
      g.fillStyle = '#B9AE9E'; g.font = mono(16, 500); g.fillText('Pickup tomorrow · 9–12', X0 + 24, 572);
    } else if (sold) {
      g.fillStyle = MUTED; g.font = mono(18, 500); g.fillText('Ship to R. Okafor · Portland OR', X0, 530);
    } else {
      g.fillStyle = MUTED; g.font = mono(18, 500); g.fillText('Price from your sell-through data', X0, 530);
    }
  }

  // ---- Labels (world anchors) -------------------------------------------------------
  const _a = new THREE.Vector3();
  const H = p => p.clone().add(HOUSE);
  addLabel('IMEI CHECK', 'Clean · unlocked', 4.4, 6.3, () => _a.copy(opPhone.position).lerp(soldPhone.position, 0.35).add(V(0, 0.1, 0)), 0.34, GREEN);
  addLabel('SUGGESTED OFFER', '$310 · resale $389', 6.3, 8.2, () => _a.copy(opPhone.position).lerp(soldPhone.position, 0.35).add(V(0, 0.1, 0)), 0.34);
  addLabel('PAID PHONE TO PHONE', '$310 sent', 9.5, 11.6, () => _a.copy(sePhone.position).add(V(0, 0.16, 0)), 0.38, GREEN);
  addLabel('IN STOCK', 'iPhone 13 · cost $310', 15.6, 20.5, () => _a.copy(opCar.position).add(V(0, 2.3, 0)), 3.0);
  addLabel('TESTED', 'Grade A · 12/12 passed', 34.0, 35.9, () => _a.copy(H(V(-0.42, 0.72, -0.47))), 0.3, GREEN);
  addLabel('LISTED', 'Listed · $389', 35.9, 37.6, () => _a.copy(H(V(-0.42, 0.72, -0.47))), 0.3);
  addLabel('ORDER #1042', 'Sold · $389', 37.6, 38.6, () => _a.copy(H(V(-0.42, 0.72, -0.47))), 0.3);
  addLabel('LABEL', 'Printed · prepaid', 39.4, 41.2, () => _a.copy(H(V(0.14, 0.64, -0.55))), 0.28);
  addLabel('READY', 'Packed · by the door', 42.7, 44.0, () => _a.copy(box.getWorldPosition(new THREE.Vector3())).add(V(0, 0.3, 0)), 0.42, GREEN);

  // ---- Fade overlay ---------------------------------------------------------------
  const fadeM = track(new THREE.MeshBasicMaterial({ color: CREAM, transparent: true, opacity: 1, depthTest: false, depthWrite: false, fog: false }));
  const fade = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), fadeM); fade.position.z = -0.1; fade.renderOrder = 999; camera.add(fade);

  // ---- Camera shots ----------------------------------------------------------------
  const tmp = { p: V(0, 0, 0), l: V(0, 0, 0) };
  const _cp = V(0, 0, 0), _cl = V(0, 0, 0), _h = V(0, 0, 0), _f = V(0, 0, 0), _r = V(0, 0, 0);
  const lerpV = (a, b, k, out) => out.copy(a).lerp(b, k);
  const keysShot = keys => (t, out) => {
    let i = 0; while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
    const [t0, p0, l0, f0] = keys[i], [t1, p1, l1, f1] = keys[i + 1];
    const k = smooth((t - t0) / (t1 - t0));
    lerpV(p0, p1, k, out.p); lerpV(l0, l1, k, out.l); out.fov = f0 + (f1 - f0) * k; return out;
  };
  const meetWide = keysShot([
    [-1, V(7.5, 2.7, 11.5), V(0.2, 1.05, 2.1), 34], [3.4, V(3.6, 1.75, 6.6), V(0.0, 1.2, 2.5), 32]
  ]);
  const overShoulder = (t, out) => {
    // behind the operator's right shoulder, looking at their phone and the seller
    // off-axis over the operator's right shoulder so the head never blocks
    const k = smooth(seg(t, 2.8, 8.2));
    headPos(op, _cp); _f.copy(_cp).sub(opPhone.position).normalize();
    _r.set(0, 0, 1); // operator faces +x, their right is +z
    // beside the operator's right arm, phone screen centre frame, seller behind
    out.p.copy(opPhone.position).add(_cp.set(-0.34 + k * 0.04, 0.26 - k * 0.03, 0.3 - k * 0.03));
    out.l.copy(opPhone.position).add(_h.set(0.1, 0.03, -0.04));
    out.fov = 28; return out;
  };
  const payShot = keysShot([[7.6, V(0.1, 1.45, 4.6), V(0.05, 1.25, 2.6), 30], [11.4, V(-0.4, 1.55, 4.9), V(0.05, 1.2, 2.5), 32]]);
  const partShot = keysShot([[10.8, V(1.0, 1.9, 6.6), V(0.4, 1.0, 2.0), 36], [14.4, V(-4.0, 5.5, 13.0), V(-1.5, 0.8, 1.0), 40]]);
  // Heading used by the chase camera: the path direction averaged over the
  // last ~10 m driven (a low-pass in distance), so the camera swings round a
  // turn smoothly instead of snapping with the car. Stateless in t.
  const _sd = V(0, 0, 0);
  const smoothHeading = (u, out) => {
    out.set(0, 0, 0);
    const d = u * pathLen;
    for (let i = 0; i <= 16; i++) {
      const di = Math.max(0, d - i * 0.65);
      path.getTangentAt(Math.min(di / pathLen, 0.9999), _sd);
      out.addScaledVector(_sd, 17 - i);
    }
    return out.setY(0).normalize();
  };
  const CRANE = V(-4.0, 5.5, 13.0); // where the lot shot ends, well clear of the car's path
  const carCam = (t, out) => {
    const u = driveU(t);
    path.getPointAt(u, _h); smoothHeading(u, _f);
    _r.set(-_f.z, 0, _f.x); // right of travel
    const k = smooth(seg(t, DRIVE0 + 1, DRIVE1 - 2.5));
    const side = 2.6 + Math.sin(k * Math.PI) * 2.2, back = 7.5 - Math.sin(k * Math.PI) * 1.5;
    out.p.copy(_h).addScaledVector(_f, -back).addScaledVector(_r, side); out.p.y = 1.6 + Math.sin(k * Math.PI) * 0.5;
    out.l.copy(_h).addScaledVector(_f, 3).setY(0.9);
    // In the lot the camera stays up where the meetup shot ended and turns to
    // watch the car pull out; over the next ~18 m driven it eases into the
    // chase position. The camera never crosses the car, so no whip.
    const kc = smooth(seg(u * pathLen, 10, 48));
    out.p.lerpVectors(CRANE, out.p, kc);
    out.l.lerpVectors(_cp.copy(_h).setY(0.8), out.l, kc);
    out.fov = 40; return out;
  };
  const W = H(WIN);
  const windowShot = keysShot([
    [23.0, V(W.x + 6.5, 2.4, W.z + 9.5), V(139, 0.9, 5.6), 40],
    [25.0, V(W.x + 1.2, 1.9, W.z + 4.2), V(W.x, 1.5, W.z), 40],
    [26.4, V(W.x, 1.52, W.z + 0.55), V(W.x, 1.25, W.z - 3.0), 40],
    [27.6, H(V(0.35, 1.5, 1.75)), H(V(-0.35, 0.5, -0.5)), 42]
  ]);
  const roomShot = keysShot([
    [27.6, H(V(0.35, 1.5, 1.75)), H(V(-0.35, 0.5, -0.5)), 42],
    [29.3, H(V(1.3, 1.1, -1.25)), H(V(-0.45, 0.72, 0.35)), 38],
    [30.5, H(V(0.12, 0.82, 0.2)), H(V(-0.62, 0.45, -0.32)), 34],
    [31.6, H(V(-0.18, 0.84, 0.14)), H(V(-0.42, 0.56, -0.47)), 30],
    [37.0, H(V(-0.14, 0.86, 0.16)), H(V(-0.42, 0.56, -0.47)), 30],
    [38.9, H(V(0.6, 0.88, 0.25)), H(V(0.14, 0.5, -0.56)), 32],
    [40.2, H(V(0.42, 0.92, 0.3)), H(V(-0.06, 0.47, -0.36)), 32],
    [41.8, H(V(0.38, 0.95, 0.28)), H(V(-0.08, 0.47, -0.32)), 32],
    [42.9, H(V(0.4, 1.2, -0.6)), H(V(1.0, 0.15, -2.15)), 36],
    [43.6, H(V(0.38, 1.18, -0.68)), H(V(1.0, 0.15, -2.15)), 36],
    [44.6, H(V(-0.18, 0.84, 0.14)), H(V(-0.42, 0.56, -0.47)), 30],
    [46.0, H(V(-0.4, 0.62, -0.18)), H(V(-0.42, 0.56, -0.5)), 28]
  ]);
  const SHOTS = [
    [-1, 3.6, meetWide], [2.8, 8.2, overShoulder], [7.6, 11.4, payShot], [10.8, 14.6, partShot],
    [13.6, 23.8, carCam], [23.0, 27.6, windowShot], [27.6, 47, roomShot]
  ];
  const sa = { p: V(0, 0, 0), l: V(0, 0, 0), fov: 40 }, sb = { p: V(0, 0, 0), l: V(0, 0, 0), fov: 40 };
  function cameraAt(t) {
    t = Number.isFinite(t) ? Math.max(0, Math.min(DURATION - 0.001, t)) : 0;
    const act = SHOTS.filter(s => t >= s[0] && t < s[1]);
    if (!act.length) act.push(SHOTS[SHOTS.length - 1]);
    act[0][2](t, sa);
    if (act.length > 1) {
      act[1][2](t, sb);
      const k = smooth((t - act[1][0]) / (act[0][1] - act[1][0]));
      sa.p.lerp(sb.p, k); sa.l.lerp(sb.l, k); sa.fov += (sb.fov - sa.fov) * k;
    }
    return sa;
  }

  // ---- Pointer parallax ------------------------------------------------------------
  const ptr = { x: 0, y: 0, sx: 0, sy: 0 };

  // ---- Update -------------------------------------------------------------------------
  const pA = V(0, 0, 0), pB = V(0, 0, 0), up = V(0, 1, 0), _hp = V(0, 0, 0), _qs = new THREE.Quaternion(), _qo = new THREE.Quaternion();
  let aspect = ctx.width / ctx.height;
  const opWalk = [OP_STAND.clone(), V(-1.2, 0, 2.0), V(-1.75, 0, 0.3)];
  const seWalk = [SE_STAND.clone(), V(3.0, 0, 2.5), V(3.8, 0, 0.4)];
  function walkAlong(p, pts, k) {
    const a = pts[0], b = pts[1], c = pts[2];
    const q = 1 - k; const x = q * q * a.x + 2 * q * k * b.x + k * k * c.x, z = q * q * a.z + 2 * q * k * b.z + k * k * c.z;
    const dx = 2 * q * (b.x - a.x) + 2 * k * (c.x - b.x), dz = 2 * q * (b.z - a.z) + 2 * k * (c.z - b.z);
    p.holder.position.set(x, 0, z);
    return Math.atan2(dx, dz);
  }
  // Turn on the spot toward the path (0.45 s), then walk it; the walk clip
  // plays at the rate that matches the ground speed so the feet stay planted.
  const lerpAngle = (a, b, k) => { let d = b - a; d = Math.atan2(Math.sin(d), Math.cos(d)); return a + d * k; };
  const _wp = V(0, 0, 0);
  function walkOff(p, pts, t0, t1, face0, t) {
    const ta = t0 + 0.45;
    const kf = tt => { const u = seg(tt, ta, t1); return smooth(u) * 0.6 + u * 0.4; };
    if (t <= t0) return 0;
    const h0 = walkAlong(p, pts, 0.002);
    walkAlong(p, pts, kf(t + 0.04)); _wp.copy(p.holder.position);
    const y = walkAlong(p, pts, kf(t));
    const speed = _wp.distanceTo(p.holder.position) / 0.04;
    p.holder.rotation.y = t < ta ? lerpAngle(face0, h0, smooth(seg(t, t0, ta))) : y;
    p.acts.walk.timeScale = speed > 0.05 ? kit.walkRate(p.P, speed) : 1;
    return smooth(seg(t, ta - 0.15, ta + 0.15)) * (1 - smooth(seg(t, t1 - 0.2, t1 + 0.05)));
  }

  const C = x => new THREE.Color(x);
  const COL = {
    c1: C('#4f74a8'), c2: C('#2d3a66'), c3: C('#0f1630'), h1: C('#f4a565'), h2: C('#e0794f'), h3: C('#3a3150'),
    sun0: C('#ffb877'), sun1: C('#ff8a4c'), hs0: C('#8ea7cf'), hs1: C('#38487a'), hg0: C('#7a5a3e'), hg1: C('#1c1a20')
  };
  const _e = V(0, 0, 0), _g = V(0, 0, 0), DOWN5 = V(0, -0.05, 0);
  function update(dt, t) {
    // ---- light / sky over the day
    const dusk = t < 26.5 ? smooth(seg(t, DRIVE0 - 0.5, DRIVE1 + 0.3)) : 1;
    const elev = THREE.MathUtils.lerp(0.2, -0.05, dusk);
    skyU.sunDir.value.set(-0.85, elev, -0.5).normalize();
    const k1 = smooth(dusk * 2), k2 = smooth(dusk * 2 - 1);
    skyU.top.value.copy(COL.c1).lerp(COL.c2, k1).lerp(COL.c3, k2);
    skyU.hor.value.copy(COL.h1).lerp(COL.h2, k1).lerp(COL.h3, k2);
    skyU.sunAmt.value = 1 - k2;
    scene.fog.color.copy(skyU.hor.value).lerp(skyU.top.value, 0.25);
    sun.intensity = 3.8 * (1 - smooth(dusk * 1.3));
    sun.color.copy(COL.sun0).lerp(COL.sun1, k1);
    hemi.intensity = THREE.MathUtils.lerp(0.62, 0.2, dusk);
    hemi.color.copy(COL.hs0).lerp(COL.hs1, dusk);
    hemi.groundColor.copy(COL.hg0).lerp(COL.hg1, dusk);
    scene.environmentIntensity = t > 25.5 ? 0.1 : THREE.MathUtils.lerp(0.55, 0.18, dusk);
    const lampsOn = smooth(seg(dusk, 0.45, 0.8));
    headM.emissiveIntensity = 3 * lampsOn; glowM.opacity = lampsOn; poolM.opacity = 0.35 * lampsOn;
    winMat.emissiveIntensity = 1.4 * lampsOn;
    glassM.emissiveIntensity = 0.15 + 0.9 * lampsOn;
    porch.intensity = 3 * lampsOn;
    headSpot.intensity = 60 * lampsOn * (t > DRIVE0 - 0.6 && t < DRIVE1 + 1 ? 1 : 0);
    const running = t > DRIVE0 - 0.6 && t < DRIVE1 + 0.8 ? 1 : 0;
    opCar.userData.headL.opacity = running * (0.35 + 0.65 * lampsOn);
    opCar.userData.tail.opacity = running * (0.45 + 0.55 * lampsOn);
    const inside = t > 26.2;
    sun.shadow.autoUpdate = !inside; ceil.shadow.autoUpdate = inside;
    ceil.intensity = inside || t > 23 ? 22 : 0;

    // ---- car
    const u = driveU(t);
    path.getPointAt(u, pA); path.getTangentAt(Math.min(u, 0.9999), pB);
    opCar.position.copy(pA); opCar.rotation.y = Math.atan2(pB.x, pB.z);
    {
      // wheels roll with the distance driven; the fronts steer with the path's
      // curvature (bicycle model: steer = atan(wheelbase * dYaw/ds))
      const dist = u * pathLen;
      const yawAt = s => { path.getTangentAt(THREE.MathUtils.clamp(s / pathLen, 0, 0.9999), _sd); return Math.atan2(_sd.x, _sd.z); };
      let dy = yawAt(dist + 0.6) - yawAt(dist - 0.6); dy = Math.atan2(Math.sin(dy), Math.cos(dy));
      const steer = THREE.MathUtils.clamp(Math.atan(WHEELBASE * dy / 1.2), -0.6, 0.6);
      for (const w of opCar.userData.wheels) { w.spin.rotation.x = dist / WHEEL_R; w.pivot.rotation.y = w.front ? steer : 0; }
    }

    // ---- people at the meetup
    const meet = t < 14.5;
    op.holder.visible = se.holder.visible = meet;
    if (meet) {
      op.holder.position.copy(OP_STAND); se.holder.position.copy(SE_STAND);
      op.holder.rotation.y = Math.PI / 2; se.holder.rotation.y = -Math.PI / 2;
      // walk off to the cars
      const opW = walkOff(op, opWalk, 11.2, 13.4, Math.PI / 2, t);
      const seW = walkOff(se, seWalk, 11.0, 13.6, -Math.PI / 2, t);
      op.acts.walk.setEffectiveWeight(opW); op.acts.idle.setEffectiveWeight(1 - opW);
      se.acts.walk.setEffectiveWeight(seW); se.acts.idle.setEffectiveWeight(1 - seW);
      op.mixer.update(dt); se.mixer.update(dt);
      if (t > 13.3) op.holder.visible = false;
      // arm layers
      const opR = env(t, 1.3, 10.6, 0.8, 0.6);               // operator's own phone (right hand)
      const opL = env(t, 7.7, 10.6, 0.5, 0.6);               // receives the sold phone (left hand)
      const seR = env(t, 1.0, 8.3, 0.8, 0.5) * (1 - smooth(seg(t, 7.6, 8.3)) * 0) ;
      const seL = env(t, 8.6, 11.2, 0.5, 0.5);               // seller's own phone shows the payment
      holdPose(op, 'Right', opR, 0); holdPose(op, 'Left', opL, 0);
      holdPose(se, 'Right', seR, 0.7 * smooth(seg(t, 1.0, 2.2)) * (1 - smooth(seg(t, 7.6, 8.3)))); holdPose(se, 'Left', seL, 0.2);
      // Held phones lie flat on the palm: the hand is turned so the palm sits
      // against the back of the phone, and the phone rests on it (no overlap).
      // operator's phone in the right hand, screen to the face
      handPos(op, 'Right', _hp); headPos(op, pB);
      _e.copy(pB).sub(_hp).add(DOWN5).normalize();
      holdPhone(op, 'Right', opPhone, _e, toW(op, 0, 0.3, 1).normalize(), opR, _hp);
      opPhone.visible = opR > 0.05;
      // sold phone: seller's right hand -> operator's left hand. The seller
      // shows the IMEI screen to the operator; once handed over it faces the operator.
      const hk = smooth(seg(t, 7.7, 8.4));
      handPos(se, 'Right', pA); _f.copy(toW(se, 0, 0.4, 1)).normalize();
      holdPhone(se, 'Right', soldPhone, _f, up, seR * (1 - hk), pA); _qs.copy(soldPhone.quaternion);
      handPos(op, 'Left', pB); headPos(op, _r).sub(pB).normalize();
      holdPhone(op, 'Left', soldPhone, _r, up, Math.max(opL, hk), pB); _qo.copy(soldPhone.quaternion);
      const sp = _g.copy(pA).lerp(pB, hk); sp.y += Math.sin(hk * Math.PI) * 0.06;
      soldPhone.position.copy(sp); soldPhone.quaternion.copy(_qs).slerp(_qo, hk);
      soldPhone.visible = (seR > 0.15 || hk > 0.01) && (hk < 0.99 || opL > 0.1);
      // seller's own phone (left hand)
      handPos(se, 'Left', pA); headPos(se, _e).sub(pA).normalize();
      holdPhone(se, 'Left', sePhone, _e, up, seL, pA);
      sePhone.visible = seL > 0.08; sePhone.scale.setScalar(0.01 * Math.min(1, seL * 1.6));
      // screens
      if (t < 2.4) opScreen.set('home', { st: 'home' });
      else if (t < 4.3) { const p = (t - 2.4) * 1.6 % 1; opScreen.set('scan' + Math.round(p * 30), { st: 'scan', p }); }
      else if (t < 6.2) { const p = seg(t, 4.3, 5.6); opScreen.set('clean' + Math.round(p * 10), { st: 'clean', p }); }
      else if (t < 8.9) { const p = seg(t, 6.2, 6.9); opScreen.set('price' + Math.round(p * 16), { st: 'price', p }); }
      else if (t < 9.7) { const p = seg(t, 8.9, 9.6); opScreen.set('pay' + Math.round(p * 20), { st: 'pay', p }); }
      else opScreen.set('paid', { st: 'paid' });
      const bo = env(t, 2.5, 4.4, 0.3, 0.3) * (0.55 + 0.45 * Math.sin(t * 30));
      beam.visible = bo > 0.01; beamM.opacity = bo * 0.8;
      if (beam.visible) { beam.position.copy(opPhone.position); _d.copy(soldPhone.position).sub(opPhone.position); beam.scale.set(1, _d.length(), 1); beam.quaternion.setFromUnitVectors(up, _d.normalize()); }
      sellerScreen.set(t > 9.6 ? 'got' : 'wait', { st: t > 9.6 ? 'got' : 'wait' });
      soldScreen.set('imei', { st: 'imei' });
      // payment dots: arc from operator phone to seller phone
      const pk = seg(t, 8.95, 9.75);
      if (pk > 0 && pk < 1 && sePhone.visible) {
        dots.visible = true;
        const a = opPhone.position, b = sePhone.position;
        for (let i = 0; i < 18; i++) {
          const k = clamp01(pk * 1.6 - i * 0.035);
          const pos = _g.copy(a).lerp(b, k); pos.y += Math.sin(k * Math.PI) * 0.22;
          const sc = k <= 0 || k >= 1 ? 0 : 1 - i / 22;
          dots.setMatrixAt(i, mm.compose(pos, qq, V(sc, sc, sc)));
        }
        dots.instanceMatrix.needsUpdate = true;
      } else dots.visible = false;
    } else {
      opPhone.visible = soldPhone.visible = sePhone.visible = false; dots.visible = false; beam.visible = false;
    }

    // ---- home
    const home = t > 22.5;
    opHome.holder.visible = home;
    if (home) {
      opHome.holder.position.copy(H(V(-0.42, 0, 0.75))); opHome.holder.rotation.y = Math.PI;
      opHome.acts.idle.setEffectiveWeight(1); opHome.acts.walk.setEffectiveWeight(0);
      opHome.mixer.update(dt * 0.6);
      sitPose(opHome, 1);
      // seat the hips on the cushion
      opHome.B.Hips.getWorldPosition(_hp);
      opHome.holder.position.y += (HOUSE.y + 0.6) - _hp.y; // pelvis on the cushion, not in it
      opHome.holder.updateMatrixWorld(true);
    }
    // bought phone: comes out of the bag next to the dock, then plugs in
    const plug = smooth(seg(t, 30.0, 31.0));
    const pk2 = smooth(seg(t, 40.2, 41.0));  // into the box
    const dockP = DOCK;
    if (pk2 <= 0) {
      homePhone.position.set(dockP.x + 0.06 * (1 - plug), dockP.y + 0.004 + Math.sin(plug * Math.PI) * 0.03, dockP.z + 0.06 * (1 - plug));
      homePhone.rotation.set(-Math.PI / 2, 0, (1 - plug) * 0.5 + Math.PI);
    } else {
      const bpos = _g.copy(BOX_TABLE); bpos.y += 0.02;
      homePhone.position.copy(dockP).lerp(bpos, pk2); homePhone.position.y += Math.sin(pk2 * Math.PI) * 0.12;
      homePhone.rotation.set(-Math.PI / 2, 0, Math.PI + pk2 * Math.PI / 2);
    }
    homePhone.visible = t < 41.9;
    if (t < 31.0) soldScreen.set('off', { st: 'off' });
    else if (t < 34) { const p = seg(t, 31.1, 34); soldScreen.set('t' + Math.round(p * 20), { st: 'test', p }); }
    else soldScreen.set('done', { st: 'test', p: 1, done: true });

    // laptop UI
    if (t < 31.0) lapScreen.set('wait', { st: 'test', n: 0, conn: false });
    else if (t < 35.8) { const n = Math.min(12, Math.floor(seg(t, 31.2, 34.0) * 12.99)); lapScreen.set('t' + n + (t > 34 ? 'g' : ''), { st: 'test', n, conn: true, grade: t > 34 }); }
    else if (t < 37.6) lapScreen.set('list', { st: 'list', n: 12, conn: true, grade: true });
    else if (t < 39.4) lapScreen.set('sold', { st: 'sold', n: 12, conn: true, grade: true });
    else if (t < 43.4) lapScreen.set('label', { st: 'label', n: 12, conn: true, grade: true });
    else lapScreen.set('total', { st: 'total' });
    lapScrMat.emissiveIntensity = 1.0;

    // printer: label feeds out 38.8-40.0, then lifts onto the box
    const feed = smooth(seg(t, 38.8, 40.0));
    paperClip.visible = t > 38.6 && t < 41.0;
    paper.scale.set(1, Math.max(0.001, feed), 1);
    prLed.material.emissive.set(t > 38.6 && t < 40.2 && Math.floor(t * 6) % 2 ? ORANGE : LGREEN);

    // box: open on the table, flaps close 41.0-41.8, label goes on, then to the door
    const close = smooth(seg(t, 41.0, 41.7));
    flaps.forEach((f, i) => {
      const k = i < 2 ? smooth(close * 2 - 1) : smooth(close * 2);
      const ang = (i < 2 ? 1.95 : 1.8) * (1 - k);
      const sgn = f.userData.sign;
      if (f.userData.axis === 'x') f.rotation.x = -sgn * ang; else f.rotation.z = sgn * ang;
      if (i < 2) f.position.y = BY + 0.004 * (i === 0 ? 1 : 0); else f.position.y = BY - 0.002;
    });
    boxLabel.visible = t > 41.7;
    const boxMove = smooth(seg(t, 41.9, 42.8));
    box.position.copy(BOX_TABLE).lerp(BOX_DOOR, boxMove); box.position.y += Math.sin(boxMove * Math.PI) * 0.35;
    box.rotation.y = boxMove * 0.4;
    box.visible = t > 27;

    // ---- camera
    const c = cameraAt(t);
    if (import.meta.env.DEV && window.__soloCam) {
      // dev-only QC hook: fixed camera, optionally relative to the car
      const o = window.__soloCam, b0 = o.car ? opCar.position : V(0, 0, 0);
      c.p.set(...o.p).add(b0); c.l.set(...o.l).add(b0); if (o.fov) c.fov = o.fov;
    }
    ptr.sx += (ptr.x - ptr.sx) * Math.min(1, dt * 3); ptr.sy += (ptr.y - ptr.sy) * Math.min(1, dt * 3);
    camera.position.copy(c.p);
    camera.lookAt(c.l);
    const dist = c.p.distanceTo(c.l);
    const par = Math.min(0.25, dist * 0.04);
    camera.position.addScaledVector(_x.set(1, 0, 0).applyQuaternion(camera.quaternion), ptr.sx * par);
    camera.position.addScaledVector(_y.set(0, 1, 0).applyQuaternion(camera.quaternion), ptr.sy * par * 0.5);
    camera.lookAt(c.l);
    // keep horizontal framing on portrait screens
    const vf = c.fov * Math.PI / 180, hf = 2 * Math.atan(Math.tan(vf / 2) * (16 / 9));
    const want = aspect < 16 / 9 ? 2 * Math.atan(Math.tan(hf / 2) / aspect) * 180 / Math.PI : c.fov;
    camera.fov = Math.min(isSmall ? 70 : 60, aspect < 1 ? want * 0.84 : aspect < 1.2 ? want * 0.92 : Math.min(want, c.fov * 1.25));
    camera.updateProjectionMatrix();
    // sun shadow follows the action
    _cl.copy(c.l); if (t > DRIVE0 && t < DRIVE1 + 2) _cl.copy(opCar.position);
    sun.target.position.copy(_cl); sun.position.copy(_cl).addScaledVector(skyU.sunDir.value, 60);
    sun.target.updateMatrixWorld();
    sky.position.copy(camera.position);

    // ---- labels
    camera.updateMatrixWorld();
    for (const L of labels) {
      const o = env(t, L.a, L.b, 0.35, 0.35);
      L.s.visible = o > 0.001;
      if (!L.s.visible) continue;
      L.s.position.copy(L.anchor());
      const dist = L.s.position.distanceTo(camera.position);
      const sz = dist * (aspect < 1 ? 0.36 : 0.26) * Math.tan(camera.fov * Math.PI / 360) / Math.tan(17 * Math.PI / 180) * (aspect < 1 ? aspect : 1);
      L.s.position.y += (1 - o) * sz * 0.08;
      L.s.material.opacity = o;
      L.s.scale.set(sz, sz * 168 / 640, 1);
      // keep the card inside the frame on narrow screens: slide it sideways
      _cp2.copy(L.s.position).applyMatrix4(camera.matrixWorldInverse);
      const depth = Math.max(0.01, -_cp2.z), wN = sz / (depth * Math.tan(camera.fov * Math.PI / 360) * aspect);
      const nx = _cp2.copy(L.s.position).project(camera).x, pad = 0.04;
      let shift = 0;
      if (nx - wN / 2 < -1 + pad) shift = -1 + pad - (nx - wN / 2); else if (nx + wN / 2 > 1 - pad) shift = 1 - pad - (nx + wN / 2);
      L.s.center.x = 0.5 - shift / wN;
    }

    // ---- fade
    fadeM.opacity = Math.max(1 - smooth(t / 0.9), smooth(seg(t, 45.15, 45.95)));
    fade.visible = fadeM.opacity > 0.002;
    void _cp; void tmp;
  }

  const captions = [
    { at: 0, title: 'Meet the seller', body: 'A parking lot at golden hour. The phone gets checked before any money moves.' },
    { at: 3.6, title: 'IMEI check on your phone', body: 'Scan the IMEI. InPhox confirms it is clean and suggests what to pay.' },
    { at: 8.4, title: 'Pay phone to phone', body: 'Pay on the spot. The phone lands in your stock with its cost.' },
    { at: 13.6, title: 'Drive home', body: 'Stock, cost and the seller receipt are already in your books.' },
    { at: 27.4, title: 'Test and grade on the couch', body: 'Plug it into the laptop. Full tests, a wipe and a grade in minutes.' },
    { at: 35.8, title: 'Listed, then sold', body: 'One click lists it at $389. When the order lands it is marked sold.' },
    { at: 38.8, title: 'Print, pack, pickup', body: 'The label prints on the desk. The box waits by the door for pickup.' },
    { at: 43.4, title: 'A whole business, one person', body: '$310 in, $389 out. Every order and margin in one place.' }
  ];

  update(0, 0);
  if (import.meta.env.DEV) window.__soloCamAt = t => { const c = cameraAt(t); return { p: c.p.toArray(), l: c.l.toArray(), fov: c.fov }; };
  return {
    scene, camera, duration: DURATION, captions,
    update,
    resize(w, h) { aspect = w / h; },
    pointer(e) { if (e.type === 'leave') { ptr.x = 0; ptr.y = 0; } else { ptr.x = e.x; ptr.y = e.y; } },
    dispose() {
      [op, se, opHome].forEach(p => { p.mixer.stopAllAction(); p.mixer.uncacheRoot(p.root); });
      const seen = new Set();
      const free = m => {
        if (!m || seen.has(m)) return; seen.add(m);
        for (const k in m) { const v = m[k]; if (v && v.isTexture) v.dispose(); }
        if (m.uniforms) for (const k in m.uniforms) { const v = m.uniforms[k].value; if (v && v.isTexture) v.dispose(); }
        m.dispose();
      };
      const walk = root => root.traverse(o => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(free);
        if (o.isLight && o.shadow && o.shadow.map) o.shadow.map.dispose();
      });
      walk(scene); kit.dispose(); if (carProto) walk(carProto);
      disposables.forEach(d => d && d.dispose && (d.isMaterial ? free(d) : d.dispose()));
      envTex.dispose();
    }
  };
}
const COUCH_YAW = Math.PI / 2;
