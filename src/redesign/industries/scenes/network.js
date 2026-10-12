// Industries tab 04: Multi-location retail.
// A topographic slab of the US with eight storefronts and a refurb hub. A
// trade-in at Elm St trucks to the hub, gets graded, and two low-stock stores
// are restocked (one by air, one by road) while live counters roll. Then the
// slab curls onto the globe, the planet turns once past the partners
// (São Paulo, London, Dubai, Hong Kong, Sydney) and the camera dives home.
//
// Rendering: the world is drawn into an MSAA render target, then the shell's
// render pass draws a fullscreen composite (tilt-shift blur band that tracks
// the action, vignette, grain, tone mapping) plus crisp label sprites on top.
import { R, LOCATIONS, latLonToVec, buildEarth } from '../../story/earth.js';

const DURATION = 40;
const LAT0 = 37, LON0 = -96;
const LON_MIN = -127, LON_MAX = -65, LAT_MIN = 23, LAT_MAX = 51;

const INK = '#16130F', CREAM = '#F6F2EA', ORANGE = '#EB5E12', GREEN = '#1E7A4A';

const STORES = [
  { id: 'elm', name: 'Elm St', lat: 34.05, lon: -118.24, n: 212 },
  { id: 'harbor', name: 'Harbor', lat: 47.61, lon: -122.33, n: 147 },
  { id: 'mesa', name: 'Mesa Ave', lat: 33.45, lon: -112.07, n: 96 },
  { id: 'larimer', name: 'Larimer', lat: 39.74, lon: -104.99, n: 121 },
  { id: 'union', name: 'Union Sq', lat: 41.88, lon: -87.63, n: 9 },
  { id: 'midtown', name: 'Midtown', lat: 40.71, lon: -74.0, n: 318 },
  { id: 'peach', name: 'Peachtree', lat: 33.75, lon: -84.39, n: 14 },
  { id: 'bay', name: 'Bayside', lat: 25.76, lon: -80.19, n: 84 }
];
const HUB = { id: 'hub', name: 'Hub', lat: 32.78, lon: -96.8 };
const PARTNERS = ['sao', 'lon', 'dxb', 'hkg', 'syd'];
const PARTNER_LABEL = { sao: 'São Paulo', lon: 'London', dxb: 'Dubai', hkg: 'Hong Kong', syd: 'Sydney', dal: 'Hub · Dallas' };
const PARTNER_ROLE = { sao: 'partner store', lon: 'wholesale', dxb: 'export', hkg: 'sourcing', syd: 'marketplace', dal: '1,359 units' };

// ---------- small math helpers ----------
const clamp01 = x => Math.max(0, Math.min(1, x));
const sstep = (a, b, x) => { const u = clamp01((x - a) / (b - a)); return u * u * (3 - 2 * u); };
const ssmooth = (a, b, x) => { const u = clamp01((x - a) / (b - a)); return u * u * u * (u * (u * 6 - 15) + 10); };
const lerp = (a, b, u) => a + (b - a) * u;
const easeOutBack = u => { const c = 1.9; const v = u - 1; return 1 + (c + 1) * v * v * v + c * v * v; };
const win = (t, a, b) => t >= a && t < b;
// rolling counter: value a until t0, b after t1
const roll = (t, t0, t1, a, b) => Math.round(lerp(a, b, sstep(t0, t1, t)));
const fmt = n => n.toLocaleString('en-US');

// value noise + fbm (deterministic)
function hash2(x, y) { let h = (x * 374761393 + y * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return lerp(lerp(a, b, u), lerp(c, d, u), v);
}
function fbm(x, y) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < 5; i++) { s += a * vnoise(x * f, y * f); f *= 2.03; a *= 0.5; } return s / 0.97; }
function ridged(x, y) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < 4; i++) { s += a * (1 - Math.abs(vnoise(x * f, y * f) * 2 - 1)); f *= 2.1; a *= 0.5; } return s / 0.94; }
function segDist(lat, lon, line) {
  let best = 1e9; const c = Math.cos(lat * Math.PI / 180);
  for (let i = 0; i < line.length - 1; i++) {
    const [la1, lo1] = line[i], [la2, lo2] = line[i + 1];
    const ax = lo1 * c, ay = la1, bx = lo2 * c, by = la2, px = lon * c, py = lat;
    const dx = bx - ax, dy = by - ay; const u = clamp01(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy));
    const ex = ax + dx * u - px, ey = ay + dy * u - py; best = Math.min(best, Math.hypot(ex, ey));
  }
  return best;
}
const ROCKIES = [[50, -116], [47, -113.5], [44.5, -110.5], [41, -106.5], [38, -106], [35.5, -105.6], [32.5, -106]];
const SIERRA = [[50, -121.5], [46.5, -121.6], [43, -122], [40.5, -121.6], [38, -119.8], [36, -118.4], [34.3, -117.2], [32.8, -116.4]];
const APPAL = [[46.5, -69], [44, -72], [42, -74.5], [40.5, -77.5], [38, -80], [36, -82.2], [34.5, -84.8]];
const BASIN = [[42, -117], [39.5, -114.5], [37, -112], [36, -110]];

// ---------- shaders ----------
const arcVert = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const arcFrag = `uniform float reveal; uniform float tail; uniform float time; uniform float alpha; uniform float dashes; uniform vec3 color; varying vec2 vUv;
void main(){
  if (vUv.x > reveal || vUv.x < tail) discard;
  float head = smoothstep(0.10, 0.0, reveal - vUv.x) * step(reveal, 0.999);
  float dash = smoothstep(0.35, 0.5, fract(vUv.x * dashes - time * 1.6)) * smoothstep(1.0, 0.85, fract(vUv.x * dashes - time * 1.6));
  float a = (0.28 + 0.55 * dash + head) * alpha;
  gl_FragColor = vec4(color * (1.0 + head * 2.0 + dash * 0.6), a);
}`;
const compVert = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const compFrag = `uniform sampler2D tSrc; uniform vec2 res; uniform float focusY; uniform float band; uniform float blurPx; uniform float time; uniform float vig;
varying vec2 vUv;
void main(){
  float d = abs(vUv.y - focusY);
  float r = smoothstep(band, band + 0.32, d) * blurPx;
  vec3 col;
  if (r < 0.35) { col = texture2D(tSrc, vUv).rgb; }
  else {
    col = vec3(0.0);
    for (int i = 0; i < 20; i++) {
      float fi = float(i);
      float rr = sqrt((fi + 0.5) / 20.0) * r;
      float a = fi * 2.39996;
      col += texture2D(tSrc, vUv + vec2(cos(a), sin(a)) * rr / res).rgb;
    }
    col /= 20.0;
  }
  vec2 q = vUv - 0.5;
  float v = smoothstep(0.95, 0.18, length(q * vec2(1.0, 1.2)));
  col *= mix(1.0 - vig, 1.0, v);
  float g = fract(sin(dot(floor(vUv * res) + fract(time) * 97.0, vec2(12.9898, 78.233))) * 43758.5453);
  col += (g - 0.5) * 0.018 * (0.4 + col);
  gl_FragColor = vec4(max(col, 0.0), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export default async function create(ctx) {
  const { THREE, renderer, isSmall } = ctx;
  const asset = ctx.asset || (p => p);
  let viewW = ctx.width || 1200, viewH = ctx.height || 700;
  const disposables = new Set();
  const track = o => { disposables.add(o); return o; };

  // ---------- coordinates ----------
  const K = R * Math.PI / 180;               // world units per degree of latitude
  const COS0 = Math.cos(LAT0 * Math.PI / 180);
  const MAP_W = (LON_MAX - LON_MIN) * COS0 * K, MAP_D = (LAT_MAX - LAT_MIN) * K;
  const toXZ = (lat, lon) => ({ x: (lon - LON0) * COS0 * K, z: -(lat - LAT0) * K });
  const d1 = 0.01;
  const up0 = latLonToVec(LAT0, LON0, 1);
  const east0 = latLonToVec(LAT0, LON0 + d1, 1).sub(latLonToVec(LAT0, LON0 - d1, 1)).normalize();
  const north0 = latLonToVec(LAT0 + d1, LON0, 1).sub(latLonToVec(LAT0 - d1, LON0, 1)).normalize();
  // earth-local (latLonToVec frame) -> pivot-local (US centre on +y, north to -z, east to +x)
  const M3 = new THREE.Matrix3().set(east0.x, east0.y, east0.z, up0.x, up0.y, up0.z, -north0.x, -north0.y, -north0.z);
  const M4 = new THREE.Matrix4().setFromMatrix3(M3);
  const pivotLocal = (lat, lon, r = R) => latLonToVec(lat, lon, r).applyMatrix3(M3);

  // ---------- world scene (built around the shared globe) ----------
  const earth = buildEarth(renderer);
  const world = earth.scene;
  world.background = new THREE.Color('#0d0c0b');
  // our own lights; drop the story's
  world.children.filter(o => o.isLight).forEach(l => world.remove(l));
  const pivot = new THREE.Group(); pivot.position.set(0, -R, 0); world.add(pivot);
  world.remove(earth.group); pivot.add(earth.group);
  earth.group.quaternion.setFromRotationMatrix(M4);
  world.remove(earth.atmo); pivot.add(earth.atmo);
  earth.box.visible = false;
  earth.arcs.forEach(a => { a.mesh.visible = false; });
  const showMarker = new Set(['dal', ...PARTNERS]);
  earth.markers.forEach(m => { m.group.visible = showMarker.has(m.loc.id); });
  const atmoMat = earth.atmo.material;
  atmoMat.uniforms.fade = { value: 0 };
  atmoMat.fragmentShader = 'uniform float fade;\n' + atmoMat.fragmentShader.replace('i * 0.9); }', 'i * 0.9) * fade; }').replace('pow(0.68 + dot(normalize(vN), V), 3.2)', 'pow(max(0.68 + dot(normalize(vN), V), 0.0), 3.2)');
  atmoMat.needsUpdate = true;
  earth.earthMat.fragmentShader = earth.earthMat.fragmentShader.replace('* water * 0.32', '* water * 0.07');
  earth.earthMat.needsUpdate = true;
  earth.earthMat.uniforms.sunDir.value.set(-0.85, 0.7, 0.55).normalize();
  const cloudBaseOpacity = earth.clouds.material.opacity;
  const mapRoot = new THREE.Group(); mapRoot.position.set(0, R, 0); pivot.add(mapRoot);

  const hemi = new THREE.HemisphereLight('#d9e0ea', '#3a2f26', 1.0); world.add(hemi);
  const key = new THREE.DirectionalLight('#fff0da', 2.7);
  key.position.set(-38, 70, 48); key.target.position.set(0, 0, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -56, right: 56, top: 40, bottom: -40, near: 10, far: 220 });
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.03;
  world.add(key, key.target);
  const rim = new THREE.DirectionalLight('#9fb4ff', 0.55); rim.position.set(30, 25, -60); world.add(rim);

  // ---------- terrain from the land mask ----------
  const img = await new THREE.ImageLoader().loadAsync(asset('assets/earth/earth_specular_2048.jpg'));
  const FW = 744, FH = 336;
  const mc = document.createElement('canvas'); mc.width = FW; mc.height = FH;
  const mctx = mc.getContext('2d', { willReadFrequently: true });
  const sx = (LON_MIN + 180) / 360 * img.width, sw = (LON_MAX - LON_MIN) / 360 * img.width;
  const sy = (90 - LAT_MAX) / 180 * img.height, sh = (LAT_MAX - LAT_MIN) / 180 * img.height;
  mctx.imageSmoothingEnabled = true; mctx.imageSmoothingQuality = 'high';
  mctx.drawImage(img, sx, sy, sw, sh, 0, 0, FW, FH);
  const raw = mctx.getImageData(0, 0, FW, FH).data;
  let land = new Float32Array(FW * FH);
  for (let i = 0; i < FW * FH; i++) land[i] = 1 - raw[i * 4] / 255;
  const boxBlur = (src, r) => {
    const tmp = new Float32Array(src.length), out = new Float32Array(src.length);
    for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
      let s = 0, n = 0; for (let k = -r; k <= r; k++) { const xx = x + k; if (xx >= 0 && xx < FW) { s += src[y * FW + xx]; n++; } } tmp[y * FW + x] = s / n;
    }
    for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
      let s = 0, n = 0; for (let k = -r; k <= r; k++) { const yy = y + k; if (yy >= 0 && yy < FH) { s += tmp[yy * FW + x]; n++; } } out[y * FW + x] = s / n;
    }
    return out;
  };
  land = boxBlur(boxBlur(land, 2), 1);
  const shelf = boxBlur(boxBlur(land, 7), 7);
  const coast = new Float32Array(FW * FH), H = new Float32Array(FW * FH);
  for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
    const i = y * FW + x;
    const lat = LAT_MAX - (y / (FH - 1)) * (LAT_MAX - LAT_MIN), lon = LON_MIN + (x / (FW - 1)) * (LON_MAX - LON_MIN);
    const c = sstep(0.4, 0.6, land[i]); coast[i] = c;
    if (c <= 0) { H[i] = 0; continue; }
    const n = fbm(lon * 0.55, lat * 0.55), rn = ridged(lon * 0.9 + 7.1, lat * 0.9 + 3.3);
    const rk = Math.exp(-((segDist(lat, lon, ROCKIES) / 3.2) ** 2));
    const si = Math.exp(-((segDist(lat, lon, SIERRA) / 1.25) ** 2));
    const ap = Math.exp(-((segDist(lat, lon, APPAL) / 1.5) ** 2));
    const ba = Math.exp(-((segDist(lat, lon, BASIN) / 3.5) ** 2));
    const mtn = rk * 1.75 * (0.45 + 0.75 * rn) + si * 1.15 * (0.5 + 0.7 * rn) + ap * 0.6 * (0.5 + 0.6 * rn) + ba * 0.55 * (0.6 + 0.5 * n);
    // plains rise gently toward the Rockies
    const plains = sstep(-92, -104, lon) * 0.32;
    H[i] = c * (0.42 + plains + (0.05 + 0.12 * Math.min(1, mtn)) * n + mtn);
  }
  const fieldAt = (arr, fx, fy) => {
    fx = Math.max(0, Math.min(FW - 1.001, fx)); fy = Math.max(0, Math.min(FH - 1.001, fy));
    const x0 = Math.floor(fx), y0 = Math.floor(fy), u = fx - x0, v = fy - y0, i = y0 * FW + x0;
    return lerp(lerp(arr[i], arr[i + 1], u), lerp(arr[i + FW], arr[i + FW + 1], u), v);
  };
  const heightAt = (x, z) => fieldAt(H, (x / MAP_W + 0.5) * (FW - 1), (z / MAP_D + 0.5) * (FH - 1));

  // colour texture (2x field): hillshade, contours, coast line, sea shelf, graticule, edge fade
  const TW = FW * 2, TH = FH * 2;
  const tc = document.createElement('canvas'); tc.width = TW; tc.height = TH;
  const tctx = tc.getContext('2d');
  const im = tctx.createImageData(TW, TH); const px = im.data;
  const Ld = [-0.55, 0.62, -0.56]; { const l = Math.hypot(...Ld); Ld[0] /= l; Ld[1] /= l; Ld[2] /= l; }
  const zScale = 3.6; // exaggerate relief in the shading
  const cellX = MAP_W / (FW - 1), cellZ = MAP_D / (FH - 1);
  for (let y = 0; y < TH; y++) {
    const fy = y / (TH - 1) * (FH - 1); const v = y / (TH - 1);
    const lat = LAT_MAX - v * (LAT_MAX - LAT_MIN);
    for (let x = 0; x < TW; x++) {
      const fx = x / (TW - 1) * (FW - 1); const u = x / (TW - 1);
      const lon = LON_MIN + u * (LON_MAX - LON_MIN);
      const h = fieldAt(H, fx, fy), c = fieldAt(coast, fx, fy), sh = fieldAt(shelf, fx, fy);
      const hx = (fieldAt(H, fx + 0.6, fy) - fieldAt(H, fx - 0.6, fy)) / (1.2 * cellX);
      const hz = (fieldAt(H, fx, fy + 0.6) - fieldAt(H, fx, fy - 0.6)) / (1.2 * cellZ);
      // normal of y = h(x,z) with z pointing south; light from north-west
      let nx = -hx * zScale, ny = 1, nz = -hz * zScale; const nl = Math.hypot(nx, ny, nz); nx /= nl; ny /= nl; nz /= nl;
      const lam = Math.max(0, nx * Ld[0] + ny * Ld[1] + nz * Ld[2]);
      let r, g, b;
      if (c > 0.02) {
        const e = clamp01((h - 0.42) / 2.0);
        // cream lowlands -> warm sand -> pale stone peaks
        r = lerp(240, 214, e) ; g = lerp(233, 199, e); b = lerp(218, 170, e);
        const shade = 0.62 + 0.5 * lam;
        r *= shade; g *= shade; b *= shade;
        // contours
        const grad = Math.hypot(hx * cellX, hz * cellZ) / 0.5 + 1e-4; // height change per texel
        const s = 0.22, f = (h / s) % 1; const dd = Math.min(f, 1 - f) * s / grad;
        if (h > 0.5 && dd < 0.9) { const k = 0.9 - 0.1 * (1 - dd / 0.9); r *= k; g *= k; b *= k; }
        // coast edge darkening
        const edge = 1 - Math.abs(c - 0.5) * 2;
        const ek = 1 - 0.35 * Math.max(0, edge) * (c < 0.9 ? 1 : 0);
        r *= ek; g *= ek; b *= ek;
        // blend into sea at the coast fringe
        const sr = 22, sg = 27, sb = 34; const m = sstep(0.02, 0.35, c);
        r = lerp(sr, r, m); g = lerp(sg, g, m); b = lerp(sb, b, m);
      } else {
        // deep ink sea, lighter shelf near the coast
        const s = clamp01(sh * 2.2);
        r = lerp(17, 34, s); g = lerp(21, 42, s); b = lerp(27, 52, s);
        // dot grid
        if (x % 8 === 0 && y % 8 === 0) { r += 22; g += 24; b += 28; }
        // graticule every 5 degrees
        const glon = Math.abs(((lon + 1000) % 5) - 2.5), glat = Math.abs(((lat + 1000) % 5) - 2.5);
        if (glon > 2.5 - 0.05 || glat > 2.5 - 0.05) { r += 14; g += 17; b += 22; }
        // coast glow
        const gl = sstep(0.12, 0.45, sh) * (1 - c);
        r += gl * 30; g += gl * 26; b += gl * 18;
      }
      const ex = Math.min(u, 1 - u), ey = Math.min(v, 1 - v);
      const a = sstep(0.0, 0.11, ex) * sstep(0.0, 0.17, ey);
      const o = (y * TW + x) * 4;
      px[o] = r; px[o + 1] = g; px[o + 2] = b; px[o + 3] = a * 255;
    }
  }
  tctx.putImageData(im, 0, 0);
  const landTex = track(new THREE.CanvasTexture(tc));
  landTex.colorSpace = THREE.SRGBColorSpace;
  landTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

  // slab mesh: flat at uCurl=0, wrapped onto the globe at uCurl=1
  const SEG_X = 372, SEG_Z = 168;
  const slabGeo = track(new THREE.PlaneGeometry(MAP_W, MAP_D, SEG_X, SEG_Z));
  slabGeo.rotateX(-Math.PI / 2);
  { const p = slabGeo.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, heightAt(p.getX(i), p.getZ(i))); slabGeo.computeVertexNormals(); }
  const curlU = { uCurl: { value: 0 }, uR: { value: R }, uK: { value: K }, uLL0: { value: new THREE.Vector2(LAT0, LON0) }, uCos0: { value: COS0 }, uM: { value: M3 } };
  const slabMat = track(new THREE.MeshStandardMaterial({ map: landTex, roughness: 0.88, metalness: 0.0, transparent: true }));
  slabMat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, curlU);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', `#include <common>
uniform float uCurl; uniform float uR; uniform float uK; uniform vec2 uLL0; uniform float uCos0; uniform mat3 uM;
vec3 sphFrame(vec3 p, out vec3 e, out vec3 u, out vec3 n){
  float lon = uLL0.y + p.x / (uCos0 * uK);
  float lat = uLL0.x - p.z / uK;
  float phi = radians(lon + 180.0); float th = radians(90.0 - lat);
  vec3 v = vec3(-cos(phi) * sin(th), cos(th), sin(phi) * sin(th));
  e = uM * vec3(sin(phi), 0.0, cos(phi));
  n = uM * vec3(cos(phi) * cos(th), sin(th), -sin(phi) * cos(th));
  u = uM * v;
  return u * (uR + p.y + 0.25) - vec3(0.0, uR, 0.0);
}`).replace('#include <beginnormal_vertex>', `vec3 cE, cU, cN; vec3 cPos = sphFrame(position, cE, cU, cN);
vec3 objectNormal = normalize(mix(normal, normal.x * cE + normal.y * cU - normal.z * cN, uCurl));
#ifdef USE_TANGENT
vec3 objectTangent = vec3( tangent.xyz );
#endif`).replace('#include <begin_vertex>', 'vec3 transformed = mix(position, cPos, uCurl);');
  };
  const slab = new THREE.Mesh(slabGeo, slabMat);
  slab.receiveShadow = true; slab.frustumCulled = false; slab.renderOrder = 1;
  mapRoot.add(slab);

  // ---------- models ----------
  const M = {
    cream: track(new THREE.MeshStandardMaterial({ color: CREAM, roughness: 0.7 })),
    stone: track(new THREE.MeshStandardMaterial({ color: '#E2D8C6', roughness: 0.8 })),
    ink: track(new THREE.MeshStandardMaterial({ color: INK, roughness: 0.6 })),
    orange: track(new THREE.MeshStandardMaterial({ color: ORANGE, roughness: 0.5 })),
    green: track(new THREE.MeshStandardMaterial({ color: GREEN, roughness: 0.5 })),
    glass: track(new THREE.MeshStandardMaterial({ color: '#2a2a2e', emissive: '#ffbf7a', emissiveIntensity: 0.9, roughness: 0.2 })),
    hubGlass: track(new THREE.MeshStandardMaterial({ color: '#203028', emissive: '#7fffb7', emissiveIntensity: 0.0, roughness: 0.3 })),
    tire: track(new THREE.MeshStandardMaterial({ color: '#222', roughness: 0.9 }))
  };
  const G = {
    box: track(new THREE.BoxGeometry(1, 1, 1)),
    wheel: track(new THREE.CylinderGeometry(1, 1, 1, 12).rotateZ(Math.PI / 2)),
    tooth: track((() => { const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(1, 0); s.lineTo(0, 1); s.lineTo(0, 0); return new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false }); })())
  };
  const part = (geo, mat, sx, sy, sz, x, y, z, parent, cast = true) => {
    const m = new THREE.Mesh(geo, mat); m.scale.set(sx, sy, sz); m.position.set(x, y, z);
    m.castShadow = cast; m.receiveShadow = true; parent.add(m); return m;
  };
  function makeStore() {
    const g = new THREE.Group();
    part(G.box, M.ink, 1.45, 0.12, 1.15, 0, 0.06, 0, g);
    part(G.box, M.cream, 1.25, 0.82, 0.95, 0, 0.53, -0.02, g);
    part(G.box, M.stone, 1.33, 0.07, 1.03, 0, 0.97, -0.02, g);
    part(G.box, M.glass, 1.02, 0.42, 0.03, 0, 0.36, 0.46, g, false);
    part(G.box, M.ink, 0.06, 0.46, 0.05, 0, 0.36, 0.475, g, false);
    const aw = part(G.box, M.orange, 1.2, 0.05, 0.34, 0, 0.66, 0.6, g); aw.rotation.x = 0.38;
    part(G.box, M.ink, 1.1, 0.15, 0.04, 0, 0.84, 0.48, g, false);
    part(G.box, M.orange, 0.18, 0.08, 0.02, -0.38, 0.84, 0.505, g, false);
    part(G.box, M.stone, 0.32, 0.16, 0.26, 0.3, 1.08, -0.2, g);
    return g;
  }
  function makeHub() {
    const g = new THREE.Group();
    part(G.box, M.ink, 4.2, 0.14, 3.0, 0, 0.07, 0, g);
    part(G.box, M.cream, 3.8, 1.05, 2.5, 0, 0.66, 0, g);
    for (let i = 0; i < 4; i++) {
      const t = new THREE.Mesh(G.tooth, M.stone); t.scale.set(0.95, 0.5, 2.5);
      t.position.set(-1.9 + i * 0.95, 1.18, -1.25); t.castShadow = true; t.receiveShadow = true; g.add(t);
      part(G.box, M.hubGlass, 0.04, 0.44, 2.4, -1.9 + i * 0.95 + 0.02, 1.4, 0, g, false);
    }
    part(G.box, M.green, 3.82, 0.12, 2.52, 0, 0.98, 0, g);
    for (let i = 0; i < 3; i++) part(G.box, M.ink, 0.62, 0.62, 0.04, -1.1 + i * 1.1, 0.45, 1.25, g, false);
    part(G.box, M.hubGlass, 0.9, 0.3, 0.03, 1.35, 0.66, 1.26, g, false);
    part(G.box, M.ink, 0.9, 0.08, 0.6, 1.35, 0.15, 1.6, g);
    return g;
  }
  function makeTruck() {
    const g = new THREE.Group();
    part(G.box, M.cream, 0.5, 0.48, 0.95, 0, 0.36, -0.12, g);
    part(G.box, M.orange, 0.48, 0.4, 0.34, 0, 0.32, 0.55, g);
    part(G.box, M.glass, 0.4, 0.14, 0.02, 0, 0.42, 0.725, g, false);
    part(G.box, M.green, 0.505, 0.06, 0.96, 0, 0.5, -0.12, g, false);
    for (const [x, z] of [[-0.25, 0.5], [0.25, 0.5], [-0.25, -0.35], [0.25, -0.35]]) part(G.wheel, M.tire, 0.07, 0.12, 0.12, x, 0.12, z, g, false);
    g.scale.setScalar(1.35);
    return g;
  }
  function makePlane() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(track(new THREE.CapsuleGeometry(0.16, 1.3, 4, 10)), M.cream); body.rotation.x = Math.PI / 2; body.castShadow = true; g.add(body);
    part(G.box, M.cream, 1.9, 0.04, 0.36, 0, 0, 0.05, g);
    part(G.box, M.orange, 0.2, 0.05, 0.37, -0.9, 0, 0.05, g, false);
    part(G.box, M.orange, 0.2, 0.05, 0.37, 0.9, 0, 0.05, g, false);
    part(G.box, M.cream, 0.7, 0.03, 0.2, 0, 0.05, -0.68, g);
    part(G.box, M.orange, 0.03, 0.36, 0.26, 0, 0.2, -0.7, g);
    g.scale.setScalar(1.25);
    return g;
  }
  const ringGeo = track(new THREE.RingGeometry(0.86, 1.0, 64).rotateX(-Math.PI / 2));
  const arcGeoSweep = track(new THREE.RingGeometry(1.0, 1.25, 64, 1, 0, Math.PI * 1.3).rotateX(-Math.PI / 2));
  const glowMat = color => track(new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  const glowMesh = (geo, color) => { const m = new THREE.Mesh(geo, glowMat(color)); m.renderOrder = 4; return m; };

  // place stores + hub
  const site = (o) => {
    const { x, z } = toXZ(o.lat, o.lon);
    // ground = max height under the footprint so nothing floats or sinks
    let y = 0; for (const dx of [-1, 0, 1]) for (const dz of [-0.8, 0, 0.8]) y = Math.max(y, heightAt(x + dx, z + dz));
    return new THREE.Vector3(x, y, z);
  };
  const stores = STORES.map((s, i) => {
    const pos = site(s);
    const root = new THREE.Group(); root.position.copy(pos); mapRoot.add(root);
    const model = makeStore(); model.scale.setScalar(1.3); root.add(model);
    const pulse = glowMesh(ringGeo, ORANGE); pulse.position.y = 0.05; root.add(pulse);
    return { ...s, i, pos, root, model, pulse, top: 1.6 };
  });
  const byId = Object.fromEntries(stores.map(s => [s.id, s]));
  const hubPos = site(HUB);
  const hub = { ...HUB, pos: hubPos, root: new THREE.Group(), top: 1.85 };
  hub.root.position.copy(hubPos); mapRoot.add(hub.root);
  hub.model = makeHub(); hub.root.add(hub.model);
  hub.sweep = glowMesh(arcGeoSweep, '#3fd28a'); hub.sweep.position.y = 0.08; hub.sweep.scale.setScalar(2.6); hub.root.add(hub.sweep);
  hub.pulse = glowMesh(ringGeo, '#3fd28a'); hub.pulse.position.y = 0.06; hub.root.add(hub.pulse);

  const parcel = part(G.box, track(new THREE.MeshStandardMaterial({ color: '#C99A62', roughness: 0.8 })), 0.4, 0.3, 0.3, 0, 0, 0, byId.elm.root);
  const truckA = makeTruck(), truckB = makeTruck(), plane = makePlane();
  mapRoot.add(truckA, truckB, plane);

  // ---------- routes ----------
  const arcMat = (color, alpha, dashes) => track(new THREE.ShaderMaterial({
    uniforms: { reveal: { value: 0 }, tail: { value: 0 }, time: { value: 0 }, alpha: { value: alpha }, dashes: { value: dashes }, color: { value: new THREE.Color(color) } },
    vertexShader: arcVert, fragmentShader: arcFrag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  const groundPath = (a, b, bend) => {
    const pts = []; const N = 40; const dx = b.x - a.x, dz = b.z - a.z; const L = Math.hypot(dx, dz);
    const px = -dz / L, pz = dx / L;
    for (let i = 0; i <= N; i++) {
      const s = i / N; const off = Math.sin(Math.PI * s) * bend * L;
      const x = a.x + dx * s + px * off, z = a.z + dz * s + pz * off;
      pts.push(new THREE.Vector3(x, heightAt(x, z) + 0.08, z));
    }
    // smooth y a little so the road doesn't jitter over contours
    for (let k = 0; k < 3; k++) for (let i = 1; i < N; i++) pts[i].y = Math.max(heightAt(pts[i].x, pts[i].z) + 0.08, (pts[i - 1].y + pts[i].y * 2 + pts[i + 1].y) / 4);
    return new THREE.CatmullRomCurve3(pts);
  };
  const routeMesh = (curve, radius, mat, segs = 160) => { const m = new THREE.Mesh(track(new THREE.TubeGeometry(curve, segs, radius, 6, false)), mat); m.renderOrder = 3; m.frustumCulled = false; mapRoot.add(m); return m; };
  const elmPos = byId.elm.pos, unionPos = byId.union.pos, peachPos = byId.peach.pos;
  const roadA = groundPath(elmPos, hubPos, -0.08);
  const roadB = groundPath(hubPos, peachPos, 0.1);
  const airC = new THREE.QuadraticBezierCurve3(hubPos.clone().add(new THREE.Vector3(0, 2.2, 0)),
    hubPos.clone().lerp(unionPos, 0.5).add(new THREE.Vector3(0, 9, 0)), unionPos.clone().add(new THREE.Vector3(0, 1.6, 0)));
  const routeA = routeMesh(roadA, 0.13, arcMat(ORANGE, 1, 18));
  const routeB = routeMesh(roadB, 0.13, arcMat('#3fd28a', 1, 12));
  const routeC = routeMesh(airC, 0.1, arcMat('#3fd28a', 1, 14));
  // faint always-on network: hub to every store
  const net = stores.map((s, i) => {
    const a = hubPos.clone().add(new THREE.Vector3(0, 1.9, 0)), b = s.pos.clone().add(new THREE.Vector3(0, 1.0, 0));
    const L = a.distanceTo(b);
    const mid = a.clone().lerp(b, 0.5); mid.y = Math.max(a.y, b.y) + 1.2 + L * 0.1;
    const mat = arcMat('#d8cdb8', 0, 6 + Math.round(L / 3)); mat.uniforms.reveal.value = 1;
    const m = routeMesh(new THREE.QuadraticBezierCurve3(a, mid, b), 0.045, mat, 64);
    return { m, mat, phase: i * 0.37 };
  });

  // ---------- globe arcs between partners ----------
  const locById = Object.fromEntries(LOCATIONS.map(l => [l.id, l]));
  const globeArcs = [
    ['dal', 'sao', 25.3, 26.7], ['dal', 'lon', 27.4, 28.9], ['lon', 'dxb', 28.6, 29.8],
    ['dxb', 'hkg', 30.0, 31.3], ['hkg', 'syd', 30.9, 32.0], ['syd', 'dal', 33.0, 34.8]
  ].map(([a, b, t0, t1]) => {
    const va = latLonToVec(locById[a].lat, locById[a].lon, R), vb = latLonToVec(locById[b].lat, locById[b].lon, R);
    const ang = va.angleTo(vb);
    const mid = va.clone().add(vb).normalize().multiplyScalar(R * (1.03 + ang * 0.22));
    const curve = new THREE.QuadraticBezierCurve3(va.clone().multiplyScalar(1.004), mid, vb.clone().multiplyScalar(1.004));
    const mat = arcMat(b === 'dal' ? '#FFD08A' : ORANGE, 1, 10);
    const m = new THREE.Mesh(track(new THREE.TubeGeometry(curve, 120, 0.42, 6, false)), mat); m.frustumCulled = false;
    earth.group.add(m);
    return { m, mat, t0, t1 };
  });

  // ---------- labels (overlay, crisp, screen-sized) ----------
  const overlay = new THREE.Scene();
  const LW = 420, LH = 64, DPR = 2;
  await Promise.race([
    Promise.all([document.fonts?.load(`600 26px 'JetBrains Mono'`), document.fonts?.load(`700 26px Archivo`)]).catch(() => {}),
    new Promise(r => setTimeout(r, 1500))
  ]);
  const rr = (c, x, y, w, h, r) => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
  const labels = [];
  function makeLabel(center = [0.5, 0]) {
    const cv = document.createElement('canvas'); cv.width = LW * DPR; cv.height = LH * DPR;
    const c = cv.getContext('2d'); c.scale(DPR, DPR);
    const tex = track(new THREE.CanvasTexture(cv)); tex.colorSpace = THREE.SRGBColorSpace; tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false;
    const mat = track(new THREE.SpriteMaterial({ map: tex, sizeAttenuation: false, transparent: true, depthTest: false, depthWrite: false, toneMapped: false, opacity: 0 }));
    const sp = new THREE.Sprite(mat); sp.center.set(center[0], center[1]); sp.renderOrder = 10; overlay.add(sp);
    const lb = { cv, c, tex, mat, sp, key: '', size: 1, world: new THREE.Vector3() };
    labels.push(lb); return lb;
  }
  // kinds: count {name,value,suffix,style}; badge {role,text}; place {name,role}
  function drawCount(lb, name, value, suffix, style) {
    const key = [name, value, suffix, style].join('|'); if (key === lb.key) return; lb.key = key;
    const c = lb.c; c.clearRect(0, 0, LW, LH);
    const styles = {
      light: { bg: 'rgba(246,242,234,0.96)', fg: INK, sub: '#6B6257', dot: ORANGE, border: null },
      hub: { bg: 'rgba(22,19,15,0.94)', fg: CREAM, sub: '#B9AE9E', dot: '#3fd28a', border: '#3fd28a' },
      alert: { bg: ORANGE, fg: '#fff', sub: '#FFE3D2', dot: '#fff', border: null },
      ok: { bg: 'rgba(246,242,234,0.96)', fg: INK, sub: '#6B6257', dot: GREEN, border: GREEN }
    }[style];
    c.font = `600 15px 'JetBrains Mono', monospace`;
    const t1 = name.toUpperCase(), t2 = ' · ' + value, t3 = suffix ? ' ' + suffix : '';
    c.font = `700 14px 'JetBrains Mono', monospace`; const w1 = c.measureText(t1).width;
    c.font = `600 14px 'JetBrains Mono', monospace`; const w2 = c.measureText(t2).width;
    c.font = `500 12.5px 'JetBrains Mono', monospace`; const w3 = c.measureText(t3).width;
    const w = 30 + w1 + w2 + w3 + 12, h = 30, x = (LW - w) / 2, y = LH - h - 7; lb.pw = w;
    c.fillStyle = 'rgba(0,0,0,0.28)'; rr(c, x + 1, y + 2, w, h, 6); c.fill();
    c.fillStyle = styles.bg; rr(c, x, y, w, h, 6); c.fill();
    if (styles.border) { c.strokeStyle = styles.border; c.lineWidth = 1.5; rr(c, x + 0.75, y + 0.75, w - 1.5, h - 1.5, 5.5); c.stroke(); }
    c.beginPath(); c.moveTo(LW / 2 - 6, y + h - 0.5); c.lineTo(LW / 2 + 6, y + h - 0.5); c.lineTo(LW / 2, LH - 1); c.closePath(); c.fillStyle = styles.border || styles.bg; c.fill();
    c.fillStyle = styles.dot; c.beginPath(); c.arc(x + 15, y + h / 2, 4, 0, Math.PI * 2); c.fill();
    c.textBaseline = 'middle'; let cx = x + 26;
    c.fillStyle = styles.fg; c.font = `700 14px 'JetBrains Mono', monospace`; c.fillText(t1, cx, y + h / 2 + 0.5); cx += w1;
    c.font = `600 14px 'JetBrains Mono', monospace`; c.fillText(t2, cx, y + h / 2 + 0.5); cx += w2;
    c.fillStyle = styles.sub; c.font = `500 12.5px 'JetBrains Mono', monospace`; c.fillText(t3, cx, y + h / 2 + 0.5);
    lb.tex.needsUpdate = true;
  }
  function drawBadge(lb, role, text) {
    const key = role + '|' + text; if (key === lb.key) return; lb.key = key;
    const c = lb.c; c.clearRect(0, 0, LW, LH);
    c.font = `600 10.5px 'JetBrains Mono', monospace`; const wr = c.measureText(role.toUpperCase()).width;
    c.font = `600 14px Archivo, sans-serif`; const wt = c.measureText(text).width;
    const w = Math.max(wr, wt) + 50, h = 44, x = (LW - w) / 2, y = LH - h - 6; lb.pw = w;
    c.fillStyle = 'rgba(0,0,0,0.3)'; rr(c, x + 1, y + 2, w, h, 7); c.fill();
    c.fillStyle = 'rgba(22,19,15,0.95)'; rr(c, x, y, w, h, 7); c.fill();
    c.fillStyle = GREEN; rr(c, x, y, 4, h, 2); c.fill();
    // check mark disc
    c.fillStyle = '#3fd28a'; c.beginPath(); c.arc(x + 22, y + h / 2, 9, 0, Math.PI * 2); c.fill();
    c.strokeStyle = INK; c.lineWidth = 2.2; c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(x + 17.5, y + h / 2 + 0.5); c.lineTo(x + 20.8, y + h / 2 + 3.8); c.lineTo(x + 26.5, y + h / 2 - 3.5); c.stroke();
    c.textBaseline = 'alphabetic';
    c.fillStyle = '#7fe0ad'; c.font = `600 10.5px 'JetBrains Mono', monospace`; c.fillText(role.toUpperCase(), x + 38, y + 17);
    c.fillStyle = CREAM; c.font = `600 14px Archivo, sans-serif`; c.fillText(text, x + 38, y + 35);
    lb.tex.needsUpdate = true;
  }
  function drawPlace(lb, name, role, hq) {
    const key = name + '|' + role; if (key === lb.key) return; lb.key = key;
    const c = lb.c; c.clearRect(0, 0, LW, LH);
    c.font = `700 14px Archivo, sans-serif`; const w1 = c.measureText(name).width;
    c.font = `500 11.5px 'JetBrains Mono', monospace`; const w2 = c.measureText(role.toUpperCase()).width;
    const w = w1 + w2 + 44, h = 28, x = (LW - w) / 2, y = LH - h - 8; lb.pw = w;
    c.fillStyle = 'rgba(10,12,18,0.82)'; rr(c, x, y, w, h, 14); c.fill();
    c.strokeStyle = hq ? '#FFD08A' : 'rgba(235,94,18,0.9)'; c.lineWidth = 1.2; rr(c, x + 0.6, y + 0.6, w - 1.2, h - 1.2, 13.4); c.stroke();
    c.fillStyle = hq ? '#FFD08A' : ORANGE; c.beginPath(); c.arc(x + 14, y + h / 2, 3.6, 0, Math.PI * 2); c.fill();
    c.textBaseline = 'middle';
    c.fillStyle = '#fff'; c.font = `700 14px Archivo, sans-serif`; c.fillText(name, x + 24, y + h / 2 + 0.5);
    c.fillStyle = '#B9AE9E'; c.font = `500 11.5px 'JetBrains Mono', monospace`; c.fillText(role.toUpperCase(), x + 32 + w1, y + h / 2 + 0.5);
    lb.tex.needsUpdate = true;
  }
  stores.forEach(s => { s.label = makeLabel(); s.badge = makeLabel([0.5, -0.66]); });
  hub.label = makeLabel(); hub.badge = makeLabel([0.5, -0.66]);
  const placeLabels = ['dal', ...PARTNERS].map(id => {
    const l = locById[id]; const lb = makeLabel([0.5, 0]);
    drawPlace(lb, PARTNER_LABEL[id], PARTNER_ROLE[id], id === 'dal');
    return { id, lb, local: latLonToVec(l.lat, l.lon, R * (id === 'dal' ? 1.075 : 1.05)) };
  });

  // ---------- composite ----------
  const rtScale = () => Math.min(renderer.getPixelRatio(), 1.5);
  const rt = new THREE.WebGLRenderTarget(Math.max(2, Math.round(viewW * rtScale())), Math.max(2, Math.round(viewH * rtScale())), { type: THREE.HalfFloatType, samples: 4 });
  const compMat = track(new THREE.ShaderMaterial({
    uniforms: { tSrc: { value: rt.texture }, res: { value: new THREE.Vector2(rt.width, rt.height) }, focusY: { value: 0.5 }, band: { value: 0.12 }, blurPx: { value: 0 }, time: { value: 0 }, vig: { value: 0.5 } },
    vertexShader: compVert, fragmentShader: compFrag, depthTest: false, depthWrite: false
  }));
  const quad = new THREE.Mesh(track(new THREE.PlaneGeometry(2, 2)), compMat); quad.frustumCulled = false; quad.renderOrder = -1;
  overlay.add(quad);

  // ---------- camera ----------
  const camera = new THREE.PerspectiveCamera(30, viewW / viewH, 0.5, 6000);
  camera.rotation.order = 'YXZ';
  const deg = Math.PI / 180;
  // map-phase keyframes: t, target x, z, distance, pitch, yaw
  const KEYS = [
    [1.5, -3, 3, 108, 54, 0],
    [4.0, -5, 4, 100, 50, -2],
    [6.5, -18, 6, 58, 41, -8],
    [9.4, -7, 7.5, 46, 37, -4],
    [12.2, -1, 7.8, 40, 36, 5],
    [14.8, 4, 3, 56, 42, 3],
    [18.0, 7, 0.5, 60, 44, 0],
    [21.5, 8, 0, 70, 48, 0]
  ];
  const KEYS_SMALL = [
    [1.5, -4, 4, 150, 56, 0],
    [2.8, -6, 4, 120, 54, 0],
    [4.6, -22, 5, 70, 50, -2],
    [6.3, -24, 3.5, 60, 44, -5],
    // pulled back while the truck drives so Elm St and the hub share the frame
    [7.7, -16, 3.0, 80, 50, -3],
    [9.0, -7, 7.5, 52, 40, -4],
    [12.2, -1, 7.8, 40, 37, 5],
    // a little further north and back so the manager badge clears the top edge
    [14.8, 6, -4, 70, 46, 3],
    [18.0, 7, -5.5, 76, 48, 0],
    [21.5, 8, -1, 70, 50, 0]
  ];
  const sampleKeys = (t) => {
    const K_ = keys();
    if (t <= K_[0][0]) return K_[0].slice(1);
    for (let i = 0; i < K_.length - 1; i++) {
      if (t <= K_[i + 1][0]) {
        const a = K_[Math.max(0, i - 1)], b = K_[i], c = K_[i + 1], d = K_[Math.min(K_.length - 1, i + 2)];
        const u = (t - b[0]) / (c[0] - b[0]);
        const out = [];
        for (let k = 1; k < 6; k++) {
          // Catmull-Rom with clamped ends
          const p0 = a[k], p1 = b[k], p2 = c[k], p3 = d[k];
          const u2 = u * u, u3 = u2 * u;
          out.push(0.5 * ((2 * p1) + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u2 + (-p0 + 3 * p1 - 3 * p2 + p3) * u3));
        }
        return out;
      }
    }
    return K_[K_.length - 1].slice(1);
  };
  const globeDist = () => {
    const v = camera.fov * deg; const h = 2 * Math.atan(Math.tan(v / 2) * camera.aspect);
    return 1.22 * R / Math.sin(Math.min(v, h) / 2);
  };
  const small = () => camera.aspect < 1.05;
  const keys = () => (small() ? KEYS_SMALL : KEYS);
  const distMul = () => (small() ? Math.max(1, Math.pow(0.8 / camera.aspect, 0.9)) : camera.aspect < 1.25 ? Math.pow(1.25 / camera.aspect, 0.9) : 1);
  const ptr = { dragging: false, x0: 0, yaw: 0, yawV: 0, yawT: 0, px: 0, py: 0, pxT: 0, pyT: 0 };

  // globe tour: eastward spin US -> São Paulo -> London/Dubai -> HK/Sydney -> US
  const frameQ = (lat, lon) => {
    const p = pivotLocal(lat, lon, 1);
    const e = pivotLocal(lat, lon + d1, 1).sub(pivotLocal(lat, lon - d1, 1)).normalize();
    const n = new THREE.Vector3().crossVectors(p, e).normalize();
    const A = new THREE.Matrix4().makeBasis(e, n, p);
    const B = new THREE.Matrix4().makeBasis(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 1, 0));
    return new THREE.Quaternion().setFromRotationMatrix(B.multiply(A.transpose()));
  };
  const TOURQ = [
    [24.8, frameQ(LAT0, LON0)], [25.2, frameQ(LAT0, LON0)],
    [26.6, frameQ(-12, -55)], [27.3, frameQ(-12, -55)],
    [29.0, frameQ(36, 22)], [29.9, frameQ(36, 22)],
    [31.7, frameQ(-2, 128)], [32.6, frameQ(-2, 128)],
    [35.4, frameQ(LAT0 + 4, LON0 + 360 - 360)], [40, frameQ(LAT0, LON0)]
  ];
  const tourQ = new THREE.Quaternion();
  const sampleTour = t => {
    if (t <= TOURQ[0][0]) return tourQ.identity();
    for (let i = 0; i < TOURQ.length - 1; i++) {
      const [ta, qa] = TOURQ[i], [tb, qb] = TOURQ[i + 1];
      if (t <= tb) return tourQ.slerpQuaternions(qa, qb, ssmooth(ta, tb, t));
    }
    return tourQ.copy(TOURQ[TOURQ.length - 1][1]);
  };
  // frameQ(US) must be identity; drift the last stop slightly so the return feels like arrival
  TOURQ[TOURQ.length - 2][1] = frameQ(LAT0 + 2, LON0 - 6);

  const tmpV = new THREE.Vector3(), tmpV2 = new THREE.Vector3(), tmpP = new THREE.Vector3();
  const center = new THREE.Vector3(0, -R, 0), focusW = new THREE.Vector3();
  const bgMap = new THREE.Color('#0d0c0b'), bgSpace = new THREE.Color('#04050a');

  function cameraAt(t, dt) {
    // dive window wraps the loop seam: 36.4 .. 41.6 (== 1.6)
    const diveU = ((t - 36.4 + DURATION) % DURATION) / 5.2;
    const inDive = diveU < 1;
    const m = distMul();
    let tx, ty, tz, dist, pitch, yaw;
    const G = globeDist();
    if (inDive) {
      const k = keys()[0]; const s = ssmooth(0.05, 0.9, diveU);
      tx = lerp(0, k[1], s); tz = lerp(0, k[2], s); ty = lerp(-R, 0, s);
      dist = Math.exp(lerp(Math.log(G), Math.log(k[3] * m), s));
      pitch = lerp(90, k[4], ssmooth(0.5, 1, diveU)); yaw = 0;
    } else if (t < 21.5) {
      [tx, tz, dist, pitch, yaw] = sampleKeys(t); ty = 0; dist *= m;
    } else {
      const k = keys()[keys().length - 1]; const s = ssmooth(21.5, 24.8, t);
      tx = lerp(k[1], 0, s); tz = lerp(k[2], 0, s); ty = lerp(0, -R, s);
      dist = Math.exp(lerp(Math.log(k[3] * m), Math.log(G), s));
      pitch = lerp(k[4], 90, ssmooth(21.5, 24.0, t)); yaw = lerp(k[5], 0, s);
    }
    // pointer: drag yaw (springs back) + hover parallax
    const kS = 60, dS = 2 * Math.sqrt(kS);
    const target = ptr.dragging ? ptr.yawT : 0;
    ptr.yawV += ((target - ptr.yaw) * kS - ptr.yawV * dS) * dt; ptr.yaw += ptr.yawV * dt;
    ptr.px += (ptr.pxT - ptr.px) * Math.min(1, dt * 3); ptr.py += (ptr.pyT - ptr.py) * Math.min(1, dt * 3);
    const globeness = ty / -R;
    yaw = yaw * deg + ptr.yaw * (1 - globeness * 0.5) + ptr.px * 0.05;
    pitch = Math.min(90, pitch + ptr.py * 2.5) * deg;
    const cp = Math.cos(pitch);
    camera.position.set(tx + Math.sin(yaw) * cp * dist, ty + Math.sin(pitch) * dist, tz + Math.cos(yaw) * cp * dist);
    camera.rotation.set(-pitch, yaw, 0, 'YXZ');
    camera.near = Math.max(0.5, dist * 0.02); camera.far = dist + 3000;
    // lift the picture above the caption card (bottom of the stage)
    camera.setViewOffset(viewW, viewH, 0, viewH * lerp(small() ? 0.14 : 0.06, small() ? 0.08 : 0.03, ty / -R), viewW, viewH);
    camera.updateMatrixWorld();
    return { globeness, focus: focusW.set(tx, ty, tz) };
  }

  const labelScale = isSmall ? 0.74 : 1;
  function placeLabel(lb, worldPos, opacity, px = LH) {
    lb.sp.position.copy(worldPos);
    const P11 = camera.projectionMatrix.elements[5];
    const sy = 2 * px * labelScale / (viewH * P11);
    lb.sp.scale.set(sy * LW / LH, sy, 1);
    lb.mat.opacity = opacity; lb.sp.visible = opacity > 0.01;
    // keep the pill inside the stage: slide it sideways at the edges
    if (lb.sp.visible && lb.pw) {
      const nx = tmpP.copy(worldPos).project(camera).x;
      const cx = (nx * 0.5 + 0.5) * viewW, half = lb.pw * labelScale / 2, pad = 8;
      let shift = 0;
      if (cx - half < pad) shift = pad - (cx - half); else if (cx + half > viewW - pad) shift = (viewW - pad) - (cx + half);
      lb.sp.center.x = 0.5 - shift / (LW * labelScale);
    }
  }
  const storeGrow = (t, start) => {
    if (t < start) return 0;
    const up = clamp01((t - start) / 0.75);
    const down = 1 - sstep(21.2, 21.9, t);
    return Math.max(0, easeOutBack(up)) * down;
  };
  const along = (curve, u, obj, lift = 0) => {
    const p = curve.getPointAt(clamp01(u)); obj.position.copy(p); obj.position.y += lift;
    const q = curve.getPointAt(clamp01(u + 0.01)); q.y += lift;
    if (u >= 0.99) { const pp = curve.getPointAt(0.98); pp.y += lift; tmpV.copy(obj.position).sub(pp).add(obj.position); obj.lookAt(tmpV); }
    else obj.lookAt(q);
  };
  const ringPulse = (mesh, phase, color = 1, maxS = 3) => {
    if (phase <= 0 || phase >= 1) { mesh.material.opacity = 0; mesh.visible = false; return; }
    mesh.visible = true; mesh.scale.setScalar(0.6 + phase * maxS); mesh.material.opacity = (1 - phase) * 0.9 * color;
  };

  function update(dt, t) {
    const time = t;
    const { globeness, focus } = cameraAt(t, dt);
    // curl: wraps onto the globe 22.0..24.6, unwraps during the dive
    const diveU = ((t - 36.4 + DURATION) % DURATION) / 5.2;
    let curl = sstep(22.0, 24.6, t);
    if (diveU < 1) curl = 1 - sstep(0.42, 0.86, diveU);
    curlU.uCurl.value = curl;
    const globeOn = sstep(0.45, 0.95, curl);
    slab.visible = curl < 0.999;
    slabMat.opacity = 1 - sstep(0.82, 0.99, curl);
    earth.group.visible = curl > 0.02; earth.atmo.visible = curl > 0.02;
    earth.earthMat.uniforms.boost.value = globeOn;
    earth.clouds.material.opacity = cloudBaseOpacity * globeOn;
    atmoMat.uniforms.fade.value = globeOn;
    earth.stars.material.opacity = 0.85 * globeness;
    earth.markers.forEach(mk => { mk.group.visible = showMarker.has(mk.loc.id) && globeOn > 0.5; mk.ring.scale.setScalar(1 + 0.4 * Math.sin(time * 3 + mk.loc.lon)); });
    world.background.copy(bgMap).lerp(bgSpace, globeness);
    key.intensity = lerp(2.7, 1.6, globeness);
    // globe spin
    pivot.quaternion.copy(sampleTour(t));
    earth.clouds.rotation.y = time * 0.01;

    // stores rise / sink
    const hubG = storeGrow(t, 0.9);
    hub.root.scale.set(Math.max(0.001, Math.min(hubG, 1.1)), Math.max(0.001, hubG), Math.max(0.001, Math.min(hubG, 1.1)));
    hub.root.visible = hubG > 0.002;
    stores.forEach((s, i) => {
      const g = storeGrow(t, 1.25 + i * 0.22);
      s.root.scale.set(Math.max(0.001, Math.min(g, 1.08)), Math.max(0.001, g), Math.max(0.001, Math.min(g, 1.08)));
      s.root.visible = g > 0.002;
    });
    const netA = sstep(2.6, 4.0, t) * (1 - sstep(20.8, 21.6, t));
    net.forEach(n => { n.mat.uniforms.alpha.value = netA * 0.38; n.mat.uniforms.time.value = time * 0.6 + n.phase; n.m.visible = netA > 0.01; });

    // beat A: trade-in at Elm St -> truck to hub (5.0 .. 9.2)
    const elmN = t < 5.0 ? 212 : t < 6.3 ? 213 : 212;
    parcel.visible = win(t, 4.9, 6.4);
    if (parcel.visible) {
      const pop = easeOutBack(clamp01((t - 4.9) / 0.4)) * (1 - sstep(6.1, 6.4, t));
      parcel.scale.set(0.4 * pop, 0.3 * pop, 0.3 * pop);
      parcel.position.set(0.1, 1.55 + Math.sin(time * 5) * 0.06, 0.2); parcel.rotation.y = time * 1.2;
    }
    const uA = sstep(6.2, 9.1, t);
    truckA.visible = win(t, 6.1, 9.4);
    if (truckA.visible) { along(roadA, uA, truckA); truckA.scale.setScalar(1.35 * sstep(6.1, 6.35, t) * (1 - sstep(9.15, 9.4, t))); }
    routeA.material.uniforms.reveal.value = sstep(6.0, 9.1, t);
    routeA.material.uniforms.tail.value = sstep(9.4, 10.6, t);
    routeA.material.uniforms.time.value = time; routeA.visible = win(t, 6.0, 10.6);
    let hubN = t < 9.2 ? 1406 : 1407;

    // beat B: refurb at the hub (10 .. 14.8)
    const refurb = sstep(10.0, 10.6, t) * (1 - sstep(14.4, 15.0, t));
    M.hubGlass.emissiveIntensity = 0.15 + refurb * (1.6 + 0.5 * Math.sin(time * 6));
    hub.sweep.visible = refurb > 0.01; hub.sweep.material.opacity = refurb * 0.85; hub.sweep.rotation.y = -time * 2.2;
    ringPulse(hub.pulse, ((t - 9.15) / 1.0), 1, 3.2);

    // beat C: low stock at Union Sq + Peachtree; manager approves; air + road restock
    const lowOn = win(t, 15.2, 19.7);
    ringPulse(byId.union.pulse, lowOn ? ((t - 15.2) % 1.2) / 1.2 : (t - 19.7) / 0.9, 1, 2.6);
    ringPulse(byId.peach.pulse, win(t, 15.4, 20.7) ? ((t - 15.4) % 1.2) / 1.2 : (t - 20.7) / 0.9, 1, 2.6);
    const uC = sstep(16.9, 19.6, t);
    plane.visible = win(t, 16.8, 19.85);
    if (plane.visible) { along(airC, uC, plane, 0.25); plane.scale.setScalar(1.25 * sstep(16.8, 17.1, t) * (1 - sstep(19.55, 19.85, t))); plane.rotateZ(Math.sin(uC * Math.PI) * 0.25); }
    routeC.material.uniforms.reveal.value = sstep(16.8, 19.6, t);
    routeC.material.uniforms.tail.value = sstep(19.9, 21.0, t);
    routeC.material.uniforms.time.value = time; routeC.visible = win(t, 16.8, 21.0);
    const uB = sstep(17.4, 20.6, t);
    truckB.visible = win(t, 17.3, 20.9);
    if (truckB.visible) { along(roadB, uB, truckB); truckB.scale.setScalar(1.35 * sstep(17.3, 17.55, t) * (1 - sstep(20.6, 20.9, t))); }
    routeB.material.uniforms.reveal.value = sstep(17.3, 20.6, t);
    routeB.material.uniforms.tail.value = sstep(20.9, 21.6, t);
    routeB.material.uniforms.time.value = time; routeB.visible = win(t, 17.3, 21.6);
    if (t >= 16.8) hubN = roll(t, 16.8, 17.3, 1407, 1383);
    if (t >= 17.3) hubN = roll(t, 17.3, 17.8, 1383, 1359);
    const unionN = roll(t, 19.6, 20.1, 9, 33), peachN = roll(t, 20.6, 21.1, 14, 38);
    // M.glass flicker-free warm windows; store window boost when a delivery lands
    M.glass.emissiveIntensity = 0.9;

    // globe arcs
    globeArcs.forEach(a => {
      const out = 1 - sstep(35.2, 36.3, t);
      a.mat.uniforms.reveal.value = sstep(a.t0, a.t1, t);
      a.mat.uniforms.alpha.value = out * globeOn;
      a.mat.uniforms.time.value = time;
      a.m.visible = t > a.t0 && t < 36.3 && globeOn > 0.01;
    });

    world.updateMatrixWorld();

    // labels: counters
    const mapLab = (1 - sstep(20.9, 21.5, t)) * sstep(1.4, 2.4, t);
    const focusStores = new Set();
    if (win(t, 4.0, 10.0)) focusStores.add('elm');
    if (win(t, 14.6, 21.5)) { focusStores.add('union'); focusStores.add('peach'); }
    const overview = t < 4.2;
    const values = { elm: elmN, union: unionN, peach: peachN };
    stores.forEach(s => {
      const n = values[s.id] ?? s.n;
      const active = focusStores.has(s.id);
      let style = 'light', suffix = active ? 'in stock' : '';
      if ((s.id === 'union' && lowOn) || (s.id === 'peach' && win(t, 15.4, 20.7))) { style = 'alert'; suffix = 'low stock'; }
      else if ((s.id === 'union' && win(t, 19.7, 21.5)) || (s.id === 'peach' && win(t, 20.7, 21.5)) || (s.id === 'elm' && win(t, 5.0, 6.3))) { style = 'ok'; suffix = s.id === 'elm' ? 'trade-in +1' : 'restocked'; }
      drawCount(s.label, s.name, fmt(n), suffix, style);
      const show = isSmall ? (active ? 1 : 0) : (active ? 1 : overview ? 1 : focusStores.size ? 0.55 : 0.8);
      s.label.sp.renderOrder = active ? 14 : 10;
      const op = mapLab * show * sstep(0.6, 1, s.root.scale.y);
      tmpV.set(0, s.top, 0); s.root.localToWorld(tmpV);
      placeLabel(s.label, tmpV, op);
    });
    drawCount(hub.label, 'Hub', fmt(hubN), win(t, 9.2, 10.8) ? 'units +1' : 'units', 'hub');
    tmpV.set(0, hub.top, 0); hub.root.localToWorld(tmpV);
    placeLabel(hub.label, tmpV, mapLab * sstep(0.6, 1, hub.root.scale.y));

    // role badges
    const badge = (lb, anchorLb, role, text, a, b) => {
      const on = sstep(a, a + 0.35, t) * (1 - sstep(b - 0.35, b, t));
      if (on > 0) drawBadge(lb, role, text);
      const pop = on > 0 ? 0.8 + 0.2 * easeOutBack(clamp01((t - a) / 0.45)) : 1;
      placeLabel(lb, anchorLb.sp.position, on, LH * pop);
    };
    badge(byId.elm.badge, byId.elm.label, 'Clerk · Elm St', 'Books the trade-in', 4.4, 8.6);
    badge(hub.badge, hub.label, 'Tech · Hub', 'Erases and grades it A', 10.3, 14.6);
    badge(byId.union.badge, byId.union.label, 'Manager · Union Sq', 'Approves the transfer', 15.9, 19.4);
    stores.forEach(s => { if (s.id !== 'elm' && s.id !== 'union') { s.badge.sp.visible = false; } });

    // globe place labels
    tmpV.copy(camera.position).sub(center).normalize();
    placeLabels.forEach(p => {
      tmpV2.copy(p.local); earth.group.localToWorld(tmpV2);
      const facing = tmpV2.clone().sub(center).normalize().dot(tmpV);
      const op = globeOn * (isSmall ? sstep(0.5, 0.75, facing) : sstep(0.3, 0.55, facing)) * sstep(24.6, 25.4, t) * (1 - sstep(35.6, 36.4, t));
      placeLabel(p.lb, tmpV2, op);
    });

    // tilt-shift focus follows the action
    let fwp;
    if (win(t, 4.0, 9.3)) fwp = tmpV.copy(truckA.visible ? truckA.position : byId.elm.pos);
    else if (win(t, 9.3, 15)) fwp = tmpV.copy(hub.pos);
    else if (win(t, 15, 21.5)) fwp = tmpV.copy(hubPos).lerp(unionPos, 0.5);
    else fwp = null;
    if (fwp) mapRoot.localToWorld(fwp); else fwp = tmpV.copy(focus);
    fwp.project(camera);
    const fy = clamp01((fwp.y + 1) / 2);
    const cu = compMat.uniforms;
    cu.focusY.value += (fy - cu.focusY.value) * Math.min(1, dt * 2.5);
    if (!isFinite(cu.focusY.value)) cu.focusY.value = 0.5;
    cu.blurPx.value = 7.5 * rtScale() * (1 - globeness);
    cu.band.value = isSmall ? 0.14 : 0.11;
    cu.vig.value = lerp(0.42, 0.3, globeness);
    cu.time.value = time;

    renderer.setRenderTarget(rt);
    renderer.render(world, camera);
    renderer.setRenderTarget(null);
  }

  function resize(w, h) {
    viewW = w; viewH = h;
    const s = rtScale();
    rt.setSize(Math.max(2, Math.round(w * s)), Math.max(2, Math.round(h * s)));
    compMat.uniforms.res.value.set(rt.width, rt.height);
  }

  function pointer(e) {
    if (e.type === 'down') { ptr.dragging = true; ptr.x0 = e.x; ptr.yawT = 0; }
    else if (e.type === 'move') {
      if (ptr.dragging) ptr.yawT = Math.max(-0.5, Math.min(0.5, (e.x - ptr.x0) * -0.6));
      else { ptr.pxT = e.x; ptr.pyT = e.y; }
    } else if (e.type === 'up' || e.type === 'leave') { ptr.dragging = false; if (e.type === 'leave') { ptr.pxT = 0; ptr.pyT = 0; } }
  }

  function dispose() {
    const seen = new Set();
    const freeMat = m => {
      if (!m || seen.has(m)) return; seen.add(m);
      for (const k of Object.keys(m)) { const v = m[k]; if (v && v.isTexture) v.dispose(); }
      if (m.uniforms) for (const u of Object.values(m.uniforms)) if (u && u.value && u.value.isTexture) u.value.dispose();
      m.dispose();
    };
    for (const root of [world, overlay]) root.traverse(o => {
      if (o.geometry && !seen.has(o.geometry)) { seen.add(o.geometry); o.geometry.dispose(); }
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(freeMat);
    });
    disposables.forEach(d => { if (!seen.has(d) && d.dispose) d.dispose(); });
    key.shadow.map && key.shadow.map.dispose();
    rt.dispose();
  }

  // warm up programs for the world pass (the shell only compiles the overlay)
  try { renderer.compile(world, camera); } catch (e) { /* compiled lazily on first frame */ }

  return {
    scene: overlay, camera, duration: DURATION,
    captions: [
      { at: 0, title: 'Every store, one live count', body: 'Eight stores and a refurb hub share one inventory, counted to the unit.' },
      { at: 4.2, title: 'A trade-in at Elm St', body: 'Booked at the counter, it ships to the hub the same day.' },
      { at: 9.6, title: 'Graded at the hub', body: 'The hub erases and grades it. Every store sees the stock at once.' },
      { at: 15.0, title: 'Restock where it sells', body: 'Union Sq and Peachtree run low. A manager approves, the hub ships.' },
      { at: 22.0, title: 'Partners worldwide, same ledger', body: 'São Paulo, London, Dubai, Hong Kong and Sydney trade on the same system.' },
      { at: 33.4, title: 'Back home, already counted', body: 'Every transfer lands in every count, at every location, at the same moment.' }
    ],
    update, resize, pointer, dispose
  };
}
