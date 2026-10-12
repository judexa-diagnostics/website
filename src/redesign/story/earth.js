// The globe: NASA Blue Marble day + city lights, clouds, atmosphere, stock
// locations at their real coordinates, and arcs between them.
import * as THREE from 'three';

export const R = 100;

// Real coordinates (lat, lon). Stock numbers are illustrative.
export const LOCATIONS = [
  { id: 'dal', name: 'Dallas, TX', role: 'Warehouse A · HQ', lat: 32.7767, lon: -96.7970, stock: 1406, avail: 1122, hq: true },
  { id: 'la', name: 'Los Angeles, CA', role: 'Store · Melrose', lat: 34.0522, lon: -118.2437, stock: 212, avail: 188 },
  { id: 'nyc', name: 'New York, NY', role: 'Store · Midtown', lat: 40.7128, lon: -74.0060, stock: 318, avail: 271 },
  { id: 'mia', name: 'Miami, FL', role: 'Mall kiosk', lat: 25.7617, lon: -80.1918, stock: 84, avail: 71 },
  { id: 'tor', name: 'Toronto, ON', role: 'Partner refurbisher', lat: 43.6532, lon: -79.3832, stock: 140, avail: 96 },
  { id: 'mex', name: 'Mexico City', role: 'Repair partner', lat: 19.4326, lon: -99.1332, stock: 61, avail: 40 },
  { id: 'lon', name: 'London, UK', role: 'Wholesale buyer', lat: 51.5074, lon: -0.1278, stock: 260, avail: 0, transit: true },
  { id: 'fra', name: 'Frankfurt, DE', role: 'Wholesale buyer', lat: 50.1109, lon: 8.6821, stock: 120, avail: 0, transit: true },
  { id: 'dxb', name: 'Dubai, UAE', role: 'Export buyer', lat: 25.2048, lon: 55.2708, stock: 180, avail: 0, transit: true },
  { id: 'hkg', name: 'Hong Kong', role: 'Sourcing lots', lat: 22.3193, lon: 114.1694, stock: 512, avail: 512 },
  { id: 'syd', name: 'Sydney, AU', role: 'Marketplace buyer', lat: -33.8688, lon: 151.2093, stock: 48, avail: 0, transit: true },
  { id: 'sao', name: 'São Paulo, BR', role: 'Partner store', lat: -23.5505, lon: -46.6333, stock: 77, avail: 64 }
];
export const TOUR = ['dal', 'la', 'nyc', 'tor', 'lon', 'dxb', 'hkg', 'syd', 'sao', 'dal'];

// Matches THREE.SphereGeometry's default UV layout (u=0 at lon -180).
export function latLonToVec(lat, lon, r = R) {
  const phi = (lon + 180) / 360 * Math.PI * 2, theta = (90 - lat) / 180 * Math.PI;
  return new THREE.Vector3(-r * Math.cos(phi) * Math.sin(theta), r * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta));
}
// Globe rotation (Euler XYZ) that brings a location to face +z.
export function facing(lat, lon) {
  const v = latLonToVec(lat, lon, 1);
  const yaw = -Math.atan2(v.x, v.z);
  const zp = Math.sqrt(v.x * v.x + v.z * v.z);
  const pitch = Math.atan2(v.y, zp);
  return { yaw, pitch };
}

const earthVert = `
varying vec2 vUv; varying vec3 vN; varying vec3 vP;
void main(){ vUv = uv; vN = normalize(mat3(modelMatrix) * normal); vec4 wp = modelMatrix * vec4(position,1.0); vP = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }`;
const earthFrag = `
uniform sampler2D dayTex; uniform sampler2D nightTex; uniform sampler2D specTex; uniform vec3 sunDir; uniform float boost;
varying vec2 vUv; varying vec3 vN; varying vec3 vP;
void main(){
  vec3 N = normalize(vN); vec3 V = normalize(cameraPosition - vP);
  float d = dot(N, normalize(sunDir));
  float dayMix = smoothstep(-0.18, 0.28, d);
  vec3 day = texture2D(dayTex, vUv).rgb;
  vec3 night = texture2D(nightTex, vUv).rgb * vec3(1.0, 0.72, 0.42) * 2.2;
  vec3 col = mix(night + day * 0.035, day * (0.22 + 1.05 * max(d, 0.0)), dayMix);
  float water = texture2D(specTex, vUv).r;
  vec3 H = normalize(normalize(sunDir) + V);
  col += vec3(1.0, 0.92, 0.8) * pow(max(dot(N, H), 0.0), 220.0) * water * 0.32 * dayMix;
  float fres = pow(1.0 - max(dot(N, V), 0.0), 2.6);
  col += vec3(0.32, 0.58, 1.0) * fres * (0.18 + 0.7 * dayMix);
  gl_FragColor = vec4(col * boost, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;
const atmoVert = `varying vec3 vN; varying vec3 vP; void main(){ vN = normalize(mat3(modelMatrix) * normal); vec4 wp = modelMatrix * vec4(position,1.0); vP = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }`;
const atmoFrag = `uniform vec3 sunDir; varying vec3 vN; varying vec3 vP;
void main(){ vec3 V = normalize(cameraPosition - vP); float i = pow(0.68 + dot(normalize(vN), V), 3.2); float lit = 0.35 + 0.65 * smoothstep(-0.3, 0.4, dot(normalize(vN), normalize(sunDir)));
  gl_FragColor = vec4(vec3(0.36, 0.62, 1.0) * i * lit, i * 0.9); }`;
const arcFrag = `uniform float reveal; uniform float time; uniform vec3 color; varying vec2 vUv;
void main(){ if (vUv.x > reveal) discard; float head = smoothstep(0.18, 0.0, abs(fract(vUv.x * 1.0 - time * 0.35) - 0.5) - 0.32);
  float a = 0.45 + head * 0.55; gl_FragColor = vec4(color * (0.8 + head), a); }`;
const arcVert = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;

export function buildEarth(renderer, onReady) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#05060a');
  const camera = new THREE.PerspectiveCamera(32, 1, 1, 5000);
  camera.position.set(0, 0, 360);
  const loader = new THREE.TextureLoader();
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  let pending = 4;
  const done = () => { if (--pending === 0 && onReady) onReady(); };
  const tex = (p, srgb = true) => loader.load(p, t => { t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.anisotropy = maxAniso; done(); }, undefined, done);

  const sunDir = new THREE.Vector3(-0.6, 0.35, 0.75).normalize();
  const earthMat = new THREE.ShaderMaterial({
    uniforms: { dayTex: { value: tex('assets/earth/earth_atmos_2048.jpg') }, nightTex: { value: tex('assets/earth/earth_lights_2048.png') }, specTex: { value: tex('assets/earth/earth_specular_2048.jpg', false) }, sunDir: { value: sunDir }, boost: { value: 1 } },
    vertexShader: earthVert, fragmentShader: earthFrag
  });
  const group = new THREE.Group(); group.rotation.order = 'XYZ'; scene.add(group);
  const earth = new THREE.Mesh(new THREE.SphereGeometry(R, 128, 96), earthMat); group.add(earth);

  const clouds = new THREE.Mesh(new THREE.SphereGeometry(R * 1.009, 96, 72), new THREE.MeshLambertMaterial({ map: tex('assets/earth/earth_clouds_1024.png'), transparent: true, opacity: 0.55, depthWrite: false }));
  group.add(clouds);
  const sun = new THREE.DirectionalLight('#fff6e8', 2.2); sun.position.copy(sunDir).multiplyScalar(500); scene.add(sun);
  scene.add(new THREE.AmbientLight('#334', 0.5));

  const atmo = new THREE.Mesh(new THREE.SphereGeometry(R * 1.12, 96, 72), new THREE.ShaderMaterial({ uniforms: { sunDir: { value: sunDir } }, vertexShader: atmoVert, fragmentShader: atmoFrag, side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(atmo); // not in group: glow stays round while the globe turns

  // stars
  const sg = new THREE.BufferGeometry(); const sp = [];
  for (let i = 0; i < 2600; i++) { const v = new THREE.Vector3().randomDirection().multiplyScalar(1400 + Math.random() * 900); sp.push(v.x, v.y, v.z); }
  sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  const stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: '#cfd8ff', size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0.8 }));
  scene.add(stars);

  // markers
  const pinM = new THREE.MeshBasicMaterial({ color: '#EB5E12' });
  const pinHQ = new THREE.MeshBasicMaterial({ color: '#FFD08A' });
  const ringGeo = new THREE.RingGeometry(1.2, 1.7, 40);
  const markers = LOCATIONS.map(l => {
    const pos = latLonToVec(l.lat, l.lon, R * 1.002);
    const m = new THREE.Group(); m.position.copy(pos); m.lookAt(pos.clone().multiplyScalar(2));
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, l.hq ? 7 : 4.5, 8), l.hq ? pinHQ : pinM);
    stem.rotation.x = Math.PI / 2; stem.position.z = (l.hq ? 7 : 4.5) / 2; m.add(stem);
    const head = new THREE.Mesh(new THREE.SphereGeometry(l.hq ? 1.15 : 0.85, 16, 12), l.hq ? pinHQ : pinM); head.position.z = l.hq ? 7 : 4.5; m.add(head);
    const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: l.hq ? '#FFD08A' : '#EB5E12', transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false }));
    ring.position.z = 0.3; m.add(ring);
    group.add(m);
    return { loc: l, group: m, ring, head, tip: new THREE.Vector3(0, 0, l.hq ? 7 : 4.5) };
  });

  // arcs from Dallas to everyone else
  const hq = LOCATIONS[0];
  const a = latLonToVec(hq.lat, hq.lon, R);
  const arcs = LOCATIONS.slice(1).map((l, i) => {
    const b = latLonToVec(l.lat, l.lon, R);
    const ang = a.angleTo(b);
    const mid = a.clone().add(b).normalize().multiplyScalar(R * (1.02 + ang * 0.28));
    const curve = new THREE.QuadraticBezierCurve3(a.clone().multiplyScalar(1.004), mid, b.clone().multiplyScalar(1.004));
    const mat = new THREE.ShaderMaterial({ uniforms: { reveal: { value: 0 }, time: { value: 0 }, color: { value: new THREE.Color(l.transit ? '#FFD08A' : '#EB5E12') } }, vertexShader: arcVert, fragmentShader: arcFrag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 96, 0.32, 6, false), mat);
    group.add(mesh);
    return { mesh, mat, delay: i * 0.05 };
  });

  // the box that arrives from the warehouse scene
  const box = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.6, 1.6), new THREE.MeshStandardMaterial({ color: '#c99a62', roughness: 0.8 }));
  group.add(box);

  return { scene, camera, group, earth, clouds, atmo, stars, markers, arcs, box, earthMat };
}
