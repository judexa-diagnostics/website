// Shared cast for the 3D scenes: one rigged body (a light copy of Michelle.glb),
// a set of photoreal generated heads, per-person clothing colours and the
// idle/walk clips already re-fitted to that skeleton (aftersale/clips.json).
//
//   const kit = await loadPeople(loadGLTF, { asset, heads: ['beard', 'bun'] });
//   const p = kit.person({ head: 'beard', look: LOOKS.staff, height: 1.78 });
//   scene.add(p.root);  p.mixer.update(dt);  p.setWalk(w);  kit.reach(p, 'Right', target, w);
//
// Everything heavy is shared: one body geometry (stylised head, hair, glasses
// and headphones cut out once), one material per look, one geometry/material
// per head. The head rides on the Head bone, so any animation system works.
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

// Heads: file + fit (size in metres for a 1.0-scale body, offsets from the Head bone).
const HEAD_FILES = {
  operator: 'assets/aftersale/head-operator.glb', // man, 30s, dark hair, stubble
  customer: 'assets/aftersale/head-customer.glb', // woman, 30s, dark hair in a bun
  beard: 'assets/people/head-beard.glb',          // man, 40s, cropped hair, beard
  grey: 'assets/people/head-grey.glb',            // man, 60s, grey hair
  ponytail: 'assets/people/head-ponytail.glb',    // woman, 30s, ponytail
  young: 'assets/people/head-young.glb',          // man, 20s, short black hair
  bun: 'assets/people/head-bun.glb',              // woman, 20s, hair tied back
  curls: 'assets/people/head-curls.glb'           // woman, 30s, short curls
};
export const HEADS = Object.keys(HEAD_FILES);
// Skin tone for hands/forearms, matched to each head.
const HEAD_SKIN = {
  operator: '#C99A78', customer: '#A8724F', beard: '#5E3A26', grey: '#D9AE93',
  ponytail: '#B98462', young: '#DDB497', bun: '#E2BCA2', curls: '#5A3624'
};
// size: multiplier; y: top of the head above the Head bone (m); z: forward offset (m)
const HEAD_FIT = { operator: { cut: 0.265 }, customer: { cut: 0.25 }, grey: { cut: 0.25, taper: 0.045 }, beard: { cut: 0.255 } };
const MALE = { operator: 1, beard: 1, grey: 1, young: 1 };
const FIT0 = { size: 1, y: 0.215, z: 0.02 };

// Clothing presets. Staff wear InPhox orange or charcoal work shirts.
export const LOOKS = {
  staffOrange: { shirt: '#E2601C', sleeves: false, pants: '#2B2A2A', shoes: '#1B1A19' },
  staffOrangeLong: { shirt: '#E2601C', sleeves: true, pants: '#33312E', shoes: '#1B1A19' },
  staffCharcoal: { shirt: '#36332F', sleeves: true, pants: '#2A3442', shoes: '#151413' },
  staffCharcoalShort: { shirt: '#3B3834', sleeves: false, pants: '#55493A', shoes: '#1E1C1A' },
  staffCream: { shirt: '#E7DFD1', sleeves: true, pants: '#2B2A2A', shoes: '#1B1A19' },
  casualOlive: { shirt: '#5B6B4E', sleeves: true, pants: '#2E3F5C', shoes: '#ECE7DE' },
  casualDenim: { shirt: '#6F8FB3', sleeves: false, pants: '#2B2F38', shoes: '#ECE7DE' },
  casualRust: { shirt: '#9C4A2F', sleeves: true, pants: '#3B3A36', shoes: '#2A2622' },
  casualWhite: { shirt: '#EDEAE4', sleeves: false, pants: '#4A5A6E', shoes: '#C9C2B6' },
  casualNavy: { shirt: '#26334A', sleeves: true, pants: '#8A7A62', shoes: '#3A2E24' },
  casualBerry: { shirt: '#7A3350', sleeves: false, pants: '#26262B', shoes: '#ECE7DE' },
  hiVis: { shirt: '#D9E021', sleeves: false, pants: '#2B2A2A', shoes: '#1B1A19' }
};

const REGION_BONES = {
  shirt: ['Spine', 'Spine1', 'Spine2', 'LeftShoulder', 'RightShoulder', 'LeftArm', 'RightArm', 'Neck'],
  sleeve: ['LeftForeArm', 'RightForeArm'],
  pants: ['Hips', 'LeftUpLeg', 'RightUpLeg', 'LeftLeg', 'RightLeg'],
  shoes: ['LeftFoot', 'RightFoot', 'LeftToeBase', 'RightToeBase', 'LeftToe_End', 'RightToe_End']
};
const HEAD_BONES = ['Head', 'HeadTop_End', 'LeftEye', 'RightEye'];
const clean = n => n.replace(/^mixamorig:?/, '');

export function bonesOf(root) {
  const m = {};
  root.traverse(o => { if (o.isBone) m[clean(o.name)] = o; });
  return m;
}

// One-off: cut the stylised head/hair/glasses/headphones out of the body and
// bake a per-vertex region mask (shirt, sleeve, pants, shoes; rest = skin).
function prepareBody(mesh) {
  const g = mesh.geometry.clone();
  const si = g.attributes.skinIndex, sw = g.attributes.skinWeight, pos = g.attributes.position;
  const names = mesh.skeleton.bones.map(b => clean(b.name));
  const n = pos.count;
  const region = new Float32Array(n * 4), headW = new Float32Array(n);
  const hipsBind = new THREE.Matrix4().copy(mesh.skeleton.boneInverses[names.indexOf('Hips')]).invert();
  const hipsY = new THREE.Vector3().setFromMatrixPosition(hipsBind).y;
  if (!g.boundingBox) g.computeBoundingBox();
  const height = g.boundingBox.max.y - g.boundingBox.min.y;
  const waist = hipsY + height * 0.035;
  const keys = ['shirt', 'sleeve', 'pants', 'shoes'];
  for (let i = 0; i < n; i++) {
    const w = { shirt: 0, sleeve: 0, pants: 0, shoes: 0, other: 0 };
    for (let k = 0; k < 4; k++) {
      const bn = names[si.getComponent(i, k)], wt = sw.getComponent(i, k);
      if (HEAD_BONES.includes(bn)) headW[i] += wt;
      let r = 'other';
      for (const key of keys) if (REGION_BONES[key].includes(bn)) r = key;
      if (bn === 'Hips') r = pos.getY(i) > waist ? 'shirt' : 'pants';
      w[r] += wt;
    }
    let best = 'other', bw = 0;
    for (const key of keys) if (w[key] > bw) { bw = w[key]; best = key; }
    const thr = { shirt: 0.35, sleeve: 0.4, pants: 0.3, shoes: 0.4 }[best];
    if (best !== 'other' && bw > thr) region[i * 4 + keys.indexOf(best)] = 1;
  }
  g.setAttribute('aRegion', new THREE.BufferAttribute(region, 4));
  shapeBody(g, mesh, region);
  // drop triangles that belong to the head (the photoreal head replaces them)
  const idx = g.index.array, keep = [];
  for (let t = 0; t < idx.length; t += 3) {
    const a = headW[idx[t]], b = headW[idx[t + 1]], c = headW[idx[t + 2]];
    if (Math.max(a, b, c) > 0.55 || a + b + c > 1.05) continue;
    keep.push(idx[t], idx[t + 1], idx[t + 2]);
  }
  g.setIndex(keep);
  return g;
}

// Rest-pose reshaping, stored as local-space offsets: aShape slims the
// stylised harem trousers to straight legs (always on); aBust flattens the
// chest for male characters (scaled by uFlat).
function shapeBody(g, mesh, region) {
  const pos = g.attributes.position, n = pos.count;
  // rest pose: every bone's (world * inverse bind) is the same mesh->world map
  const bind = new THREE.Matrix4().multiplyMatrices(mesh.skeleton.bones[0].matrixWorld, mesh.skeleton.boneInverses[0]), inv = new THREE.Matrix4().copy(bind).invert();
  const wp = name => { const b = mesh.skeleton.bones.find(x => clean(x.name) === name); return b.getWorldPosition(new THREE.Vector3()); };
  const legs = ['Left', 'Right'].map(sd => ({ hip: wp(sd + 'UpLeg'), knee: wp(sd + 'Leg'), ankle: wp(sd + 'Foot') }));
  const sp2 = wp('Spine2'), sp1 = wp('Spine1'), neck = wp('Neck');
  const restY = new Float32Array(n);
  const shape = new Float32Array(n * 3), bust = new Float32Array(n * 3), bustN = new Float32Array(n * 4);
  const spine = wp('Spine'), hipsW = wp('Hips');
  const fwdLocal = new THREE.Vector3(0, 0, 1).transformDirection(inv);
  const v = new THREE.Vector3(), w = new THREE.Vector3(), q = new THREE.Vector3(), d = new THREE.Vector3();
  const seg = (a, b, p, out) => { const ab = d.subVectors(b, a); const t = THREE.MathUtils.clamp(q.subVectors(p, a).dot(ab) / ab.lengthSq(), 0, 1); out.copy(a).addScaledVector(ab, t); return t; };
  // chest plane: front-most shirt point just under the collarbones
  let zPlane = -Infinity;
  const yBandTop = sp2.y + (neck.y - sp2.y) * 0.35;
  for (let i = 0; i < n; i++) {
    if (region[i * 4] < 0.5) continue;
    v.fromBufferAttribute(pos, i).applyMatrix4(bind);
    if (v.y > yBandTop && v.y < yBandTop + 0.04 && Math.abs(v.x) < 0.06) zPlane = Math.max(zPlane, v.z);
  }
  const crotch = (legs[0].hip.y + legs[0].knee.y) / 2 + 0.03;
  for (let i = 0; i < n; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(bind);
    restY[i] = v.y;
    const off = new THREE.Vector3();
    // legs: pull trouser cloth in toward the bone line
    if ((region[i * 4 + 2] > 0.5 || region[i * 4 + 3] > 0.5) && v.y < crotch + 0.06) {
      const L = legs[v.x > 0 === legs[0].hip.x > 0 ? 0 : 1];
      const t1 = seg(L.hip, L.knee, v, w); const r1 = w.distanceTo(v), c1 = w.clone();
      const t2 = seg(L.knee, L.ankle, v, w); const r2 = w.distanceTo(v);
      let c, r, rmax;
      if (r1 < r2) { c = c1; r = r1; rmax = THREE.MathUtils.lerp(0.088, 0.062, t1); } else { c = w; r = r2; rmax = THREE.MathUtils.lerp(0.06, 0.047, t2); }
      if (region[i * 4 + 3] > 0.5) rmax = Math.max(rmax, 0.07);
      const fade = THREE.MathUtils.clamp((crotch + 0.06 - v.y) / 0.08, 0, 1);
      if (r > rmax) off.copy(c).sub(v).setY(0).normalize().multiplyScalar((r - rmax) * fade);
    }
    const lo = inv.clone();
    const a = v.clone().applyMatrix4(lo), b = v.clone().add(off).applyMatrix4(lo);
    shape[i * 3] = b.x - a.x; shape[i * 3 + 1] = b.y - a.y; shape[i * 3 + 2] = b.z - a.z;
    // chest (male): front of the shirt becomes a gently curved plane from the
    // collarbones to the belt, filling the under-bust hollow as well
    if (region[i * 4] > 0.5 && v.z > 0.0 && v.y > hipsW.y + 0.02 && v.y < yBandTop + 0.02) {
      const tz = zPlane + 0.004 - 1.4 * v.x * v.x;
      const k = Math.min(THREE.MathUtils.smoothstep(v.y, hipsW.y + 0.02, hipsW.y + 0.1), 1 - THREE.MathUtils.smoothstep(v.y, yBandTop - 0.03, yBandTop + 0.02))
        * (1 - THREE.MathUtils.smoothstep(Math.abs(v.z - tz), 0.035, 0.07));
      if (k > 0) {
        const c2 = v.clone().setZ(THREE.MathUtils.lerp(v.z, tz, k)).applyMatrix4(lo);
        bust[i * 3] = c2.x - a.x; bust[i * 3 + 1] = c2.y - a.y; bust[i * 3 + 2] = c2.z - a.z;
        const nn = new THREE.Vector3(v.x * 2.8, 0, 1).normalize().transformDirection(inv);
        bustN[i * 4] = nn.x; bustN[i * 4 + 1] = nn.y; bustN[i * 4 + 2] = nn.z; bustN[i * 4 + 3] = k * 0.9;
      }
    }
    // hips (male): narrower pelvis so the trousers fall straight from the waist
    if (region[i * 4 + 2] > 0.5 && v.y > legs[0].knee.y + 0.12 && v.y < hipsW.y + 0.1) {
      const k = Math.min(THREE.MathUtils.smoothstep(v.y, legs[0].knee.y + 0.12, crotch), 1 - THREE.MathUtils.smoothstep(v.y, hipsW.y, hipsW.y + 0.1));
      const c4 = v.clone().add(new THREE.Vector3(-v.x * 0.16 * k, 0, -(v.z - hipsW.z) * 0.1 * k)).applyMatrix4(lo);
      bust[i * 3] += c4.x - a.x; bust[i * 3 + 1] += c4.y - a.y; bust[i * 3 + 2] += c4.z - a.z;
    }
    // waist: fill out the narrow waist so a shirt hangs straight
    if (region[i * 4] > 0.5 && v.y > hipsW.y && v.y < sp2.y) {
      const k = Math.min(THREE.MathUtils.smoothstep(v.y, hipsW.y, spine.y + 0.02), 1 - THREE.MathUtils.smoothstep(v.y, sp1.y, sp2.y));
      const rx = v.x, rz = v.z - spine.z;
      const c3 = v.clone().add(new THREE.Vector3(rx * 0.22 * k, 0, rz * 0.12 * k)).applyMatrix4(lo);
      bust[i * 3] += c3.x - a.x; bust[i * 3 + 1] += c3.y - a.y; bust[i * 3 + 2] += c3.z - a.z;
    }
  }
  g.setAttribute('aShape', new THREE.BufferAttribute(shape, 3));
  g.setAttribute('aBust', new THREE.BufferAttribute(bust, 3));
  g.setAttribute('aBustN', new THREE.BufferAttribute(bustN, 4));
  g.setAttribute('aRestY', new THREE.BufferAttribute(restY, 1));
  g.userData.hipsY = hipsW.y;
}

function clothMaterial(src, look, skin, hipsY) {
  const sleeve = look.sleeves ? look.shirt : skin;
  const u = {
    uShirt: { value: new THREE.Color(look.shirt) },
    uSleeve: { value: new THREE.Color(sleeve) },
    uPants: { value: new THREE.Color(look.pants) },
    uShoes: { value: new THREE.Color(look.shoes || '#222') },
    uSkin: { value: new THREE.Color(skin) },
    // per region: amount of recolour (x shirt, y sleeve, z pants, w shoes) and inflate
    uAmt: { value: new THREE.Vector4(1, look.sleeves ? 1 : 0.9, 1, 0.85) },
    uInfl: { value: new THREE.Vector4(look.shirtInflate ?? (look.male ? 1.9 : 1.3), look.sleeves ? 1.0 : 0, 0.5, 0) },
    uFlat: { value: look.male ? 1 : 0 },
    uHem: { value: look.hem ?? (look.male ? hipsY - 0.02 : 10) }
  };
  const m = new THREE.MeshStandardMaterial({ map: src.map, normalMap: look.male ? null : src.normalMap, roughness: 0.82, metalness: 0 });
  m.userData.u = u;
  m.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec4 aRegion;\nattribute vec3 aShape;\nattribute vec3 aBust;\nattribute vec4 aBustN;\nattribute float aRestY;\nuniform vec4 uInfl;\nuniform float uFlat, uHem;\nvarying vec4 vReg;\nvarying vec3 vObjP;')
      .replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\nobjectNormal = normalize(mix(objectNormal, aBustN.xyz, aBustN.w * uFlat));')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvec4 rg = aRegion;\nif (aRestY > uHem) { rg.x += rg.z; rg.z = 0.0; }\ntransformed += aShape + aBust * uFlat;\ntransformed += normalize(objectNormal) * dot(rg, uInfl) * 0.01;\nvReg = rg;\nvObjP = position;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform vec3 uShirt, uSleeve, uPants, uShoes, uSkin;\nuniform vec4 uAmt;\nvarying vec4 vReg;\nvarying vec3 vObjP;')
      .replace('#include <map_fragment>', `#include <map_fragment>
        {
          float lum = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
          float weave = 0.93 + 0.07 * sin(vObjP.x * 31.0 + vObjP.y * 23.0) * sin(vObjP.y * 27.0 - vObjP.z * 19.0);
          vec4 rg = smoothstep(vec4(0.3), vec4(0.7), vReg); // crisp seams and hems
          float clothW = clamp(rg.x + rg.y + rg.z + rg.w, 0.0, 1.0);
          vec3 cloth = (uShirt * rg.x + uSleeve * rg.y + uPants * rg.z + uShoes * rg.w) / max(rg.x + rg.y + rg.z + rg.w, 1e-3);
          float amt = clothW > 0.0 ? dot(rg, uAmt) / max(rg.x + rg.y + rg.z + rg.w, 1e-3) : 0.0;
          vec3 clothC = mix(diffuseColor.rgb, cloth * weave, amt);
          vec3 skinC = uSkin * clamp(0.62 + lum * 1.25, 0.6, 1.25);
          diffuseColor.rgb = mix(skinC, clothC, clothW);
        }`);
  };
  m.customProgramCacheKey = () => 'people-cloth';
  return m;
}

// Smooth normals for head meshes that ship without them (seam-aware by position).
function smoothNormals(geo) {
  const pos = geo.attributes.position, idx = geo.index, n = pos.count;
  const key = i => `${Math.round(pos.getX(i) * 1e4)},${Math.round(pos.getY(i) * 1e4)},${Math.round(pos.getZ(i) * 1e4)}`;
  const keys = new Array(n), acc = new Map();
  for (let i = 0; i < n; i++) keys[i] = key(i);
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  const tri = idx ? idx.count / 3 : n / 3;
  for (let t = 0; t < tri; t++) {
    const i0 = idx ? idx.getX(t * 3) : t * 3, i1 = idx ? idx.getX(t * 3 + 1) : t * 3 + 1, i2 = idx ? idx.getX(t * 3 + 2) : t * 3 + 2;
    a.fromBufferAttribute(pos, i0); b.fromBufferAttribute(pos, i1); c.fromBufferAttribute(pos, i2);
    const fn = c.sub(b).cross(a.sub(b));
    for (const i of [i0, i1, i2]) { const k = keys[i]; (acc.get(k) || acc.set(k, new THREE.Vector3()).get(k)).add(fn); }
  }
  const nrm = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const v = (acc.get(keys[i]) || new THREE.Vector3(0, 1, 0)).clone().normalize(); nrm[i * 3] = v.x; nrm[i * 3 + 1] = v.y; nrm[i * 3 + 2] = v.z; }
  geo.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
}

// Heads are normalised to metres: cranium width ~0.165 m, top of the head at
// y = 0, centred on the cranium; the flared neck base is trimmed off.
const toFloat = a => (a.array instanceof Float32Array ? a : new THREE.BufferAttribute(Float32Array.from({ length: a.count * a.itemSize }, (_, i) => a.getComponent(Math.floor(i / a.itemSize), i % a.itemSize)), a.itemSize));
function prepareHead(gltf, cutAt = 0.265, taper = 0.02) {
  const g = new THREE.Group();
  gltf.scene.updateMatrixWorld(true);
  const geos = [];
  gltf.scene.traverse(o => {
    if (!o.isMesh) return;
    let geo = new THREE.BufferGeometry();
    for (const k in o.geometry.attributes) geo.setAttribute(k, toFloat(o.geometry.attributes[k]));
    geo.setIndex(o.geometry.index ? Array.from(o.geometry.index.array) : null);
    geo.applyMatrix4(o.matrixWorld);
    geos.push([geo, o.material]);
  });
  // cranium box: the top 40% of the mesh
  const bb = new THREE.Box3();
  geos.forEach(([geo]) => { geo.computeBoundingBox(); bb.union(geo.boundingBox); });
  const top = bb.max.y, h = top - bb.min.y, cut = top - h * 0.4;
  const cb = new THREE.Box3(), v = new THREE.Vector3();
  geos.forEach(([geo]) => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); if (v.y > cut) cb.expandByPoint(v); } });
  const k = 0.165 / (cb.max.x - cb.min.x);
  const cx = (cb.min.x + cb.max.x) / 2, cz = (cb.min.z + cb.max.z) / 2;
  geos.forEach(([geo, mat]) => {
    geo.translate(-cx, -top, -cz); geo.scale(k, k, k);
    // straighten the flared neck base into a cylinder that tucks into the collar
    const p = geo.attributes.position, idx = geo.index.array, keep = [];
    let nx = 0, nz = 0, nc = 0; const rs = [];
    for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (y < -cutAt + taper + 0.03 && y > -cutAt + taper) { nx += p.getX(i); nz += p.getZ(i); nc++; } }
    if (nc) { nx /= nc; nz /= nc; }
    for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (y < -cutAt + taper + 0.03 && y > -cutAt + taper - 0.01) rs.push(Math.hypot(p.getX(i) - nx, p.getZ(i) - nz)); }
    rs.sort((x, y) => x - y);
    const r0 = Math.min(0.058, rs.length ? rs[Math.floor(rs.length * (taper > 0.02 ? 0.6 : 0.3))] : 0.055);
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i); if (y > -cutAt + taper) continue;
      const dx = p.getX(i) - nx, dz = p.getZ(i) - nz, r = Math.hypot(dx, dz);
      const lim = r0 * (1 - 0.15 * THREE.MathUtils.clamp((-cutAt + taper - y) / 0.06, 0, 1));
      if (r > lim) { p.setX(i, nx + dx * lim / r); p.setZ(i, nz + dz * lim / r); }
    }
    // trim the neck below cutAt + 0.04 metres from the top of the head
    for (let t = 0; t < idx.length; t += 3) {
      if (Math.min(p.getY(idx[t]), p.getY(idx[t + 1]), p.getY(idx[t + 2])) < -cutAt - 0.04) continue;
      keep.push(idx[t], idx[t + 1], idx[t + 2]);
    }
    geo.setIndex(keep);
    smoothNormals(geo);
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: mat.map, roughness: 0.62, metalness: 0 }));
    m.castShadow = true; m.receiveShadow = false;
    g.add(m);
  });
  return g;
}

// The source idle stands with the feet wide apart; on this body that reads as
// a straddle, so swing both thighs in a little (about the body's forward axis).
function narrowStance(clip, B, ang) {
  const hq = B.Hips.getWorldQuaternion(new THREE.Quaternion());
  const axis = new THREE.Vector3(0, 0, 1).applyQuaternion(hq.invert());
  for (const [side, sgn] of [['LeftUpLeg', -1], ['RightUpLeg', 1]]) {
    const tr = clip.tracks.find(t => t.name === B[side].name + '.quaternion');
    if (!tr) continue;
    const r = new THREE.Quaternion().setFromAxisAngle(axis, sgn * ang), q = new THREE.Quaternion();
    for (let i = 0; i < tr.values.length; i += 4) { q.fromArray(tr.values, i).premultiply(r).toArray(tr.values, i); }
  }
}



export async function loadPeople(loadGLTF, { asset = p => p, heads = HEADS } = {}) {
  heads = [...new Set(heads)].filter(h => HEAD_FILES[h]);
  const [body, clipsJSON, ...headGLTFs] = await Promise.all([
    loadGLTF(asset('assets/people/body.glb')),
    fetch(asset('assets/people/clips.json')).then(r => { if (!r.ok) throw new Error('clips ' + r.status); return r.json(); }),
    ...heads.map(h => loadGLTF(asset(HEAD_FILES[h])))
  ]);
  let skinned = null;
  body.scene.updateMatrixWorld(true);
  body.scene.traverse(o => { if (o.isSkinnedMesh && !skinned) skinned = o; });
  const geo = prepareBody(skinned);
  // rest-pose Head bone frame (body at scale 1)
  const hb = bonesOf(body.scene).Head;
  const hp = hb.getWorldPosition(new THREE.Vector3()), hq = hb.getWorldQuaternion(new THREE.Quaternion());
  const clips = { idle: THREE.AnimationClip.parse(clipsJSON.idle), walk: THREE.AnimationClip.parse(clipsJSON.walk) };
  narrowStance(clips.idle, bonesOf(body.scene), 0.075);
  const headMap = new Map();
  heads.forEach((h, i) => { const f = HEAD_FIT[h] || {}; headMap.set(h, prepareHead(headGLTFs[i], f.cut || 0.24, f.taper || 0.02)); });
  return makeKit({ body, geo, srcMat: skinned.material, headRest: { hp, hq }, bodyHeight: hp.y + FIT0.y, clips, heads: headMap, mats: new Map() });
}

const _v = new THREE.Vector3(), _v2 = new THREE.Vector3(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _q3 = new THREE.Quaternion();

function makeKit(C) {
  const people = [];
  const matFor = (look, skin) => {
    const k = JSON.stringify(look) + skin;
    if (!C.mats.has(k)) C.mats.set(k, clothMaterial(C.srcMat, look, skin, C.geo.userData.hipsY));
    return C.mats.get(k);
  };

  // height: top of the head in scene units; returns a person
  function person({ head = 'operator', look = LOOKS.casualOlive, height = 1.7, mixer = true, shadow = true, headShadow = shadow, phase = 0 } = {}) {
    const model = SkeletonUtils.clone(C.body.scene);
    const skin = look.skin || HEAD_SKIN[head] || '#A8724F';
    if (look.male == null) look = { ...look, male: !!MALE[head] };
    let body = null;
    model.traverse(o => {
      if (o.isSkinnedMesh) {
        o.geometry = C.geo;
        o.material = matFor(look, skin);
        o.castShadow = shadow; o.receiveShadow = true; o.frustumCulled = false;
        body = o;
      }
    });
    const bones = bonesOf(model);
    if (look.male) { bones.LeftArm.position.multiplyScalar(1.22); bones.RightArm.position.multiplyScalar(1.22); }
    // head on the Head bone: world rest frame = bone position, identity rotation
    const fit = { ...FIT0, ...(HEAD_FIT[head] || {}), ...(look.headFit || {}) };
    const proto = C.heads.get(head) || C.heads.values().next().value;
    const holder = new THREE.Group();
    const hm = proto.clone(true);
    hm.scale.setScalar(fit.size); hm.position.set(0, fit.y, fit.z);
    hm.traverse(o => { if (o.isMesh) o.castShadow = headShadow; });
    holder.add(hm);
    model.updateMatrixWorld(true);
    const hb = bones.Head;
    const local = new THREE.Matrix4().copy(hb.matrixWorld).invert()
      .multiply(new THREE.Matrix4().compose(C.headRest.hp, new THREE.Quaternion(), new THREE.Vector3(1, 1, 1)));
    local.decompose(holder.position, holder.quaternion, holder.scale);
    hb.add(holder);

    const root = new THREE.Group();
    root.add(model);
    const s = height / C.bodyHeight;
    model.scale.setScalar(s);
    const P = { root, model, body, bones, head: holder, scale: s, look, kind: head };
    if (mixer) {
      const mx = new THREE.AnimationMixer(model);
      const idle = mx.clipAction(C.clips.idle), walk = mx.clipAction(C.clips.walk);
      idle.play(); walk.play(); idle.setEffectiveWeight(1); walk.setEffectiveWeight(0);
      idle.time = phase % C.clips.idle.duration; walk.time = phase % C.clips.walk.duration;
      Object.assign(P, { mixer: mx, idle, walk, w: 0 });
      P.setWalk = (w, rate = 1) => { P.w = w; walk.setEffectiveWeight(w); idle.setEffectiveWeight(1 - w); walk.timeScale = rate; };
    }
    people.push(P);
    return P;
  }

  // hand position (palm centre) in world space
  function hand(P, side, out = new THREE.Vector3()) {
    const h = P.bones[side + 'Hand'], m = P.bones[side + 'HandMiddle1'];
    h.getWorldPosition(out);
    if (m) out.lerp(m.getWorldPosition(_v), 0.6);
    return out;
  }

  function rotateWorld(bone, dq) {
    bone.getWorldQuaternion(_q);
    bone.parent.getWorldQuaternion(_q2);
    bone.quaternion.copy(_q2.invert().multiply(_q3.copy(dq).multiply(_q)));
    bone.updateMatrixWorld(true);
  }

  // Two-bone arm IK toward a world target; pole = world point the elbow points to.
  function reach(P, side, target, w = 1, pole = null) {
    if (w <= 0.001) return;
    const A = P.bones[side + 'Arm'], B = P.bones[side + 'ForeArm'], Cb = P.bones[side + 'Hand'];
    P.root.updateMatrixWorld(true);
    const a = A.getWorldPosition(new THREE.Vector3()), b = B.getWorldPosition(new THREE.Vector3()), c = Cb.getWorldPosition(new THREE.Vector3());
    const goal0 = new THREE.Vector3().lerpVectors(c, target, w);
    const l1 = a.distanceTo(b), l2 = b.distanceTo(c);
    const dir = goal0.clone().sub(a);
    const d = THREE.MathUtils.clamp(dir.length(), Math.abs(l1 - l2) + 1e-4, (l1 + l2) * 0.999);
    dir.normalize();
    let p;
    if (pole) p = pole.clone().sub(a);
    else { // elbow down and slightly out/back
      const yaw = P.root.rotation.y, sx = side === 'Left' ? 1 : -1;
      p = new THREE.Vector3(Math.cos(yaw) * sx * 0.5, -1, -Math.sin(yaw) * sx * 0.5 - Math.cos(yaw) * 0.0);
      p.add(new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw)).multiplyScalar(0.3));
    }
    p.sub(dir.clone().multiplyScalar(p.dot(dir)));
    if (p.lengthSq() < 1e-10) p.set(0, -1, 0);
    p.normalize();
    const cosA = THREE.MathUtils.clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
    const e = a.clone().addScaledVector(dir, cosA * l1).addScaledVector(p, Math.sqrt(1 - cosA * cosA) * l1);
    const goal = a.clone().addScaledVector(dir, d);
    rotateWorld(A, new THREE.Quaternion().setFromUnitVectors(b.clone().sub(a).normalize(), e.clone().sub(a).normalize()));
    B.getWorldPosition(b); Cb.getWorldPosition(c);
    rotateWorld(B, new THREE.Quaternion().setFromUnitVectors(c.clone().sub(b).normalize(), goal.clone().sub(b).normalize()));
  }

  // point in a person's frame (x right... z forward, y up), scene units
  function local(P, x, y, z, out = new THREE.Vector3()) {
    return out.set(x, y, z).applyAxisAngle(_v2.set(0, 1, 0), P.root.rotation.y).add(P.root.getWorldPosition(_v));
  }

  // Both hands in front of the body holding something (box, tote, tray).
  // at = [x, y, z] in the person's frame (fraction of height), spread = half
  // width between the hands (fraction of height).
  function carry(P, w = 1, at = [0, 0.5, 0.2], spread = 0.12, out) {
    if (w <= 0.001) return null;
    const H = P.scale * C.bodyHeight;
    P.root.updateMatrixWorld(true);
    const yaw = P.root.rotation.y;
    // pole: elbows down and out to the side
    const pole = (sx) => local(P, sx * H * 0.5, H * 0.3, -H * 0.05, new THREE.Vector3());
    reach(P, 'Left', local(P, (at[0] + spread) * H, at[1] * H, at[2] * H, new THREE.Vector3()), w, pole(1));
    reach(P, 'Right', local(P, (at[0] - spread) * H, at[1] * H, at[2] * H, new THREE.Vector3()), w, pole(-1));
    if (out) local(P, at[0] * H, at[1] * H, at[2] * H, out);
    return yaw;
  }

  function setOpacity(P, a) {
    const t = a < 0.999;
    P.root.traverse(o => {
      if (!o.isMesh) return;
      if (!o.userData.ownMat) {
        const orig = o.material, m = orig.clone();
        m.onBeforeCompile = orig.onBeforeCompile; m.customProgramCacheKey = orig.customProgramCacheKey;
        o.material = m; o.userData.ownMat = true;
      }
      o.material.transparent = t; o.material.opacity = a; o.material.depthWrite = !t || a > 0.6;
    });
  }

  // Frees everything the kit made (safe to call after a scene-wide dispose).
  function dispose() {
    people.forEach(P => { if (P.mixer) { P.mixer.stopAllAction(); P.mixer.uncacheRoot(P.model); } P.root.traverse(o => { if (o.isMesh && o.userData.ownMat) o.material.dispose(); }); });
    people.length = 0;
    C.geo.dispose();
    C.mats.forEach(m => m.dispose());
    C.heads.forEach(h => h.traverse(o => { if (o.isMesh) { o.geometry.dispose(); if (o.material.map) o.material.map.dispose(); o.material.dispose(); } }));
    C.body.scene.traverse(o => { if (o.isMesh) { o.geometry.dispose(); for (const k in o.material) { const v = o.material[k]; if (v && v.isTexture) v.dispose(); } o.material.dispose(); } });
  }

  return { person, hand, reach, carry, local, setOpacity, dispose, clips: C.clips, bodyHeight: C.bodyHeight, LOOKS, HEADS };
}
