// Characters for the after-sale counter scene: a rigged body (Michelle.glb),
// walk/idle/gesture clips retargeted from other rigs by bone name, a
// semi-realistic head mesh swapped onto the head bone, per-character clothing
// colours (shader tint by skin-weight region) and a tiny two-bone arm IK.
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

const _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _q3 = new THREE.Quaternion();
const _v = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3(), _v4 = new THREE.Vector3();
const _m = new THREE.Matrix4();

export function bonesOf(root) {
  const m = {};
  root.traverse((o) => { if (o.isBone) m[o.name.replace(/^mixamorig:?/, '')] = o; });
  return m;
}

function yawOfFeet(root, bones) {
  root.updateMatrixWorld(true);
  const f = bones.LeftFoot.getWorldPosition(new THREE.Vector3());
  const t = bones.LeftToeBase.getWorldPosition(new THREE.Vector3());
  return Math.atan2(t.x - f.x, t.z - f.z);
}

function snapshot(bones) {
  const s = {};
  for (const n in bones) s[n] = [bones[n].position.clone(), bones[n].quaternion.clone(), bones[n].scale.clone()];
  return s;
}
function restore(bones, s) {
  for (const n in s) { bones[n].position.copy(s[n][0]); bones[n].quaternion.copy(s[n][1]); bones[n].scale.copy(s[n][2]); }
}

// Bake `clip` (animating src) onto dst's skeleton. Both rigs must share bone
// names and stand in a T-pose at rest; their axes/rest frames may differ.
export function retargetClip(src, clip, dst, { fps = 30, name, inPlace = true } = {}) {
  const sb = bonesOf(src), db = bonesOf(dst);
  const sSnap = snapshot(sb), dSnap = snapshot(db);
  src.updateMatrixWorld(true); dst.updateMatrixWorld(true);
  const sRest = {}, dRest = {};
  for (const n in sb) sRest[n] = sb[n].getWorldQuaternion(new THREE.Quaternion());
  for (const n in db) dRest[n] = db[n].getWorldQuaternion(new THREE.Quaternion());
  const sHip0 = sb.Hips.getWorldPosition(new THREE.Vector3());
  const dHip0 = db.Hips.getWorldPosition(new THREE.Vector3());
  const hScale = dHip0.y / sHip0.y;
  const R = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yawOfFeet(dst, db) - yawOfFeet(src, sb));
  const Ri = R.clone().invert();

  // dst bones in parent-first order
  const order = [];
  dst.traverse((o) => { if (o.isBone) order.push(o); });
  const names = order.map((b) => b.name.replace(/^mixamorig:?/, ''));
  const hipParentInv = new THREE.Matrix4().copy(db.Hips.parent.matrixWorld).invert();

  const mixer = new THREE.AnimationMixer(src);
  const act = mixer.clipAction(clip); act.play();
  const n = Math.max(2, Math.round(clip.duration * fps) + 1);
  const times = new Float32Array(n);
  const qv = order.map(() => new Float32Array(n * 4));
  const pv = new Float32Array(n * 3);
  const world = new Map();
  for (let i = 0; i < n; i++) {
    const t = (clip.duration * i) / (n - 1);
    times[i] = t;
    mixer.setTime(t);
    src.updateMatrixWorld(true);
    world.clear();
    order.forEach((b, k) => {
      const nm = names[k];
      const pw = world.get(b.parent) || b.parent.getWorldQuaternion(new THREE.Quaternion());
      let w;
      if (sb[nm]) {
        // world delta of the source bone, expressed in dst's facing
        sb[nm].getWorldQuaternion(_q);
        _q.multiply(_q2.copy(sRest[nm]).invert());
        _q.premultiply(R).multiply(Ri);
        w = _q.clone().multiply(dRest[nm]);
      } else {
        w = pw.clone().multiply(dSnap[nm][1]);
      }
      world.set(b, w);
      const local = _q3.copy(pw).invert().multiply(w);
      local.toArray(qv[k], i * 4);
    });
    sb.Hips.getWorldPosition(_v).sub(sHip0).applyQuaternion(R).multiplyScalar(hScale);
    if (inPlace) { _v.x = 0; _v.z = 0; }
    _v.add(dHip0).applyMatrix4(hipParentInv);
    _v.toArray(pv, i * 3);
  }
  mixer.stopAllAction(); mixer.uncacheRoot(src);
  restore(sb, sSnap); restore(db, dSnap);
  const tracks = order.map((b, k) => new THREE.QuaternionKeyframeTrack(b.name + '.quaternion', times, qv[k]));
  tracks.push(new THREE.VectorKeyframeTrack(db.Hips.name + '.position', times, pv));
  return new THREE.AnimationClip(name || clip.name, clip.duration, tracks);
}

// Serialise / restore baked clips (lets us ship only the target body).
export function clipToJSON(c) { return THREE.AnimationClip.toJSON(c); }
export function clipFromJSON(j) { return THREE.AnimationClip.parse(j); }

// Distance covered per walk cycle: speed of the planted foot.
export function measureStride(root, clip) {
  const bones = bonesOf(root);
  const snap = snapshot(bones);
  const mixer = new THREE.AnimationMixer(root);
  mixer.clipAction(clip).play();
  const N = 120, pts = [];
  for (let i = 0; i <= N; i++) {
    mixer.setTime((clip.duration * i) / N);
    root.updateMatrixWorld(true);
    const p = bones.LeftFoot.getWorldPosition(new THREE.Vector3());
    pts.push(p);
  }
  mixer.stopAllAction(); mixer.uncacheRoot(root); restore(bones, snap);
  const minY = Math.min(...pts.map((p) => p.y));
  const yaw = yawOfFeet(root, bones);
  const fx = Math.sin(yaw), fz = Math.cos(yaw);
  let dist = 0, dt = 0;
  for (let i = 1; i <= N; i++) {
    if (pts[i].y < minY + 0.012 && pts[i - 1].y < minY + 0.012) {
      dist += -((pts[i].x - pts[i - 1].x) * fx + (pts[i].z - pts[i - 1].z) * fz);
      dt += clip.duration / N;
    }
  }
  const speed = dt > 0 ? dist / dt : 1.4;
  return { speed, stride: speed * clip.duration };
}

/* ------------------------------------------------------------ appearance */

const REGION_BONES = {
  shirt: ['Spine', 'Spine1', 'Spine2', 'LeftShoulder', 'RightShoulder', 'LeftArm', 'RightArm', 'Neck'],
  sleeve: ['LeftForeArm', 'RightForeArm'],
  pants: ['LeftUpLeg', 'RightUpLeg', 'LeftLeg', 'RightLeg'],
  shoes: ['LeftFoot', 'RightFoot', 'LeftToeBase', 'RightToeBase', 'LeftToe_End', 'RightToe_End'],
};

// Per-vertex clothing attribute: rgb = cloth colour, a = amount; plus inflate.
function paintClothes(mesh, look) {
  const g = mesh.geometry;
  const skinIndex = g.attributes.skinIndex, skinWeight = g.attributes.skinWeight, pos = g.attributes.position;
  const bones = mesh.skeleton.bones.map((b) => b.name.replace(/^mixamorig:?/, ''));
  const n = pos.count;
  const cloth = new Float32Array(n * 4), infl = new Float32Array(n);
  // waist height in bind space (geometry units): just above the hips bone
  const hipsIdx = bones.indexOf('Hips');
  const hipsInv = mesh.skeleton.boneInverses[hipsIdx];
  const hipsBind = new THREE.Matrix4().copy(hipsInv).invert();
  const hipsPos = new THREE.Vector3().setFromMatrixPosition(hipsBind);
  const up = mesh.geometry.boundingBox || (g.computeBoundingBox(), g.boundingBox);
  const height = up.max.y - up.min.y;
  const cols = {
    shirt: new THREE.Color(look.shirt), sleeve: new THREE.Color(look.sleeves ? look.shirt : look.skin || '#000'),
    pants: new THREE.Color(look.pants), shoes: new THREE.Color(look.shoes || '#222'), skin: new THREE.Color(look.skin || '#000'),
  };
  for (let i = 0; i < n; i++) {
    const w = { shirt: 0, sleeve: 0, pants: 0, shoes: 0, hips: 0, other: 0 };
    for (let k = 0; k < 4; k++) {
      const bn = bones[skinIndex.getComponent(i, k)], wt = skinWeight.getComponent(i, k);
      let r = 'other';
      for (const key in REGION_BONES) if (REGION_BONES[key].includes(bn)) r = key;
      if (bn === 'Hips') r = 'hips';
      w[r] += wt;
    }
    const y = pos.getY(i);
    // hips-weighted verts: belt line splits shirt (above) from pants (below)
    const waist = hipsPos.y + height * 0.035;
    if (y > waist) w.shirt += w.hips; else w.pants += w.hips;
    let best = 'other', bw = 0.0;
    for (const key of ['shirt', 'sleeve', 'pants', 'shoes']) if (w[key] > bw) { bw = w[key]; best = key; }
    let c = null, a = 0, inf = 0;
    if (best === 'shirt' && bw > 0.35) { c = cols.shirt; a = 1; inf = look.shirtInflate ?? 1.4; }
    else if (best === 'sleeve' && bw > 0.4) {
      if (look.sleeves) { c = cols.shirt; a = 1; inf = 1.0; } else if (look.skin) { c = cols.skin; a = 0.55; }
    } else if (best === 'pants' && bw > 0.3) { c = cols.pants; a = 1; inf = 0.6; }
    else if (best === 'shoes' && bw > 0.4) { c = cols.shoes; a = 0.8; }
    else if (look.skin && best === 'other') { c = cols.skin; a = 0.5; }
    if (c) { cloth[i * 4] = c.r; cloth[i * 4 + 1] = c.g; cloth[i * 4 + 2] = c.b; cloth[i * 4 + 3] = a; }
    infl[i] = inf;
  }
  g.setAttribute('aCloth', new THREE.BufferAttribute(cloth, 4));
  g.setAttribute('aInflate', new THREE.BufferAttribute(infl, 1));
}

function clothMaterial(src) {
  const m = new THREE.MeshStandardMaterial({
    map: src.map, normalMap: src.normalMap, roughness: 0.82, metalness: 0.0,
  });
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec4 aCloth;\nattribute float aInflate;\nvarying vec4 vCloth;\nvarying vec3 vObjP;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed += normalize(objectNormal) * aInflate * 0.01;\nvCloth = aCloth;\nvObjP = position;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec4 vCloth;\nvarying vec3 vObjP;')
      .replace('#include <map_fragment>', `#include <map_fragment>
        {
          float weave = 0.93 + 0.07 * sin(vObjP.x * 31.0 + vObjP.y * 23.0) * sin(vObjP.y * 27.0 - vObjP.z * 19.0);
          float lum = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
          vec3 target = vCloth.rgb * weave;
          diffuseColor.rgb = mix(diffuseColor.rgb, target * (vCloth.a > 0.75 ? 1.0 : (0.7 + lum * 0.9)), vCloth.a);
        }`);
  };
  m.customProgramCacheKey = () => 'as-cloth';
  return m;
}

// Smooth normals for meshes that ship without them (seam-aware by position).
export function smoothNormals(geo) {
  const pos = geo.attributes.position;
  const idx = geo.index;
  const n = pos.count;
  const key = (i) => `${Math.round(pos.getX(i) * 1e4)},${Math.round(pos.getY(i) * 1e4)},${Math.round(pos.getZ(i) * 1e4)}`;
  const keys = new Array(n), acc = new Map();
  for (let i = 0; i < n; i++) keys[i] = key(i);
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  const tri = idx ? idx.count / 3 : n / 3;
  for (let t = 0; t < tri; t++) {
    const i0 = idx ? idx.getX(t * 3) : t * 3, i1 = idx ? idx.getX(t * 3 + 1) : t * 3 + 1, i2 = idx ? idx.getX(t * 3 + 2) : t * 3 + 2;
    a.fromBufferAttribute(pos, i0); b.fromBufferAttribute(pos, i1); c.fromBufferAttribute(pos, i2);
    const fn = c.sub(b).cross(a.sub(b)); // area-weighted
    for (const i of [i0, i1, i2]) {
      const k = keys[i];
      const v = acc.get(k) || acc.set(k, new THREE.Vector3()).get(k);
      v.add(fn);
    }
  }
  const nrm = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const v = acc.get(keys[i]).clone().normalize(); nrm[i * 3] = v.x; nrm[i * 3 + 1] = v.y; nrm[i * 3 + 2] = v.z; }
  geo.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
}

/* ------------------------------------------------------------ the actor */

export class Actor {
  constructor({ bodyGLTF, headGLTF, clips, look, scale = 1 }) {
    const root = SkeletonUtils.clone(bodyGLTF.scene);
    this.root = root;
    this.scale = scale;
    root.scale.setScalar(scale);
    this.bones = bonesOf(root);
    root.traverse((o) => {
      if (o.isSkinnedMesh) {
        o.geometry = o.geometry.clone();
        paintClothes(o, look);
        o.material = clothMaterial(o.material);
        o.castShadow = true; o.receiveShadow = true;
        o.frustumCulled = false;
        this.body = o;
      }
    });
    // head swap: hide the body's head (and hair) by collapsing the head bone
    const hb = this.bones.Head;
    this.headBone = hb;
    root.updateMatrixWorld(true);
    const hp = hb.getWorldPosition(new THREE.Vector3()), hq = hb.getWorldQuaternion(new THREE.Quaternion());
    const head = headGLTF.scene.clone(true);
    head.traverse((o) => {
      if (o.isMesh) {
        if (!o.geometry.attributes.normal || o.material.flatShading) { o.geometry = o.geometry.clone(); smoothNormals(o.geometry); }
        const map = o.material.map;
        o.material = new THREE.MeshStandardMaterial({ map, roughness: 0.62, metalness: 0 });
        o.castShadow = true; o.receiveShadow = true;
      }
    });
    const pivot = new THREE.Group();
    pivot.add(head);
    head.scale.setScalar(look.headSize || 0.3);
    head.position.set(0, look.headY ?? 0.07, look.headZ ?? 0.0);
    pivot.matrixAutoUpdate = false;
    this.head = pivot;
    // rest offset: head pivot in head-bone (unscaled) space
    const boneRest = new THREE.Matrix4().compose(hp, hq, new THREE.Vector3(1, 1, 1));
    const pivotRest = new THREE.Matrix4().compose(new THREE.Vector3(hp.x, hp.y, hp.z), new THREE.Quaternion(), new THREE.Vector3(scale, scale, scale));
    this.headOffset = boneRest.clone().invert().multiply(pivotRest);
    // forward axis of the head bone in its local space (character faces +Z at rest)
    this.headLocalFwd = new THREE.Vector3(0, 0, 1).applyQuaternion(hq.clone().invert());
    hb.scale.setScalar(0.001);
    this.headScale0 = hb.scale.clone();

    this.mixer = new THREE.AnimationMixer(root);
    this.actions = {};
    for (const k in clips) {
      const a = this.mixer.clipAction(clips[k]);
      a.play(); a.setEffectiveWeight(0); a.enabled = true;
      this.actions[k] = a;
    }
    this.group = new THREE.Group();
    this.group.add(root);
    this.ik = {};
  }

  // weights: {idle: w, walk: w, ...}; times: {idle: t, ...}
  pose(weights, times) {
    let sum = 0;
    for (const k in this.actions) sum += weights[k] || 0;
    for (const k in this.actions) {
      const a = this.actions[k];
      const w = sum > 0 ? (weights[k] || 0) / sum : (k === 'idle' ? 1 : 0);
      a.setEffectiveWeight(w);
      if (times[k] !== undefined) a.time = times[k];
    }
    this.mixer.update(0);
    this.headBone.scale.copy(this.headScale0);
    this.group.updateMatrixWorld(true);
  }

  // Rotate a bone so its world rotation is premultiplied by `dq` (world space).
  rotateWorld(bone, dq, w = 1) {
    bone.getWorldQuaternion(_q);
    bone.parent.getWorldQuaternion(_q2);
    const target = _q3.copy(dq).multiply(_q);
    const local = _q2.invert().multiply(target);
    if (w >= 1) bone.quaternion.copy(local); else bone.quaternion.slerp(local, w);
    bone.updateMatrixWorld(true);
  }

  // Two-bone IK: side 'Left'|'Right', target world position, weight, pole (world dir the elbow points to).
  reach(side, target, w, pole) {
    if (w <= 0.001) return;
    const A = this.bones[side + 'Arm'], B = this.bones[side + 'ForeArm'], C = this.bones[side + 'Hand'];
    const a = A.getWorldPosition(new THREE.Vector3()), b = B.getWorldPosition(new THREE.Vector3()), c = C.getWorldPosition(new THREE.Vector3());
    const lab = a.distanceTo(b), lbc = b.distanceTo(c);
    const saveA = A.quaternion.clone(), saveB = B.quaternion.clone();
    const dir = target.clone().sub(a);
    const d = THREE.MathUtils.clamp(dir.length(), Math.abs(lab - lbc) + 1e-3, lab + lbc - 1e-3);
    dir.normalize();
    const p = (pole ? pole.clone() : new THREE.Vector3(0, -1, 0));
    p.sub(dir.clone().multiplyScalar(p.dot(dir)));
    if (p.lengthSq() < 1e-8) p.set(0, -1, 0).sub(dir.clone().multiplyScalar(-dir.y));
    p.normalize();
    const cosA = THREE.MathUtils.clamp((lab * lab + d * d - lbc * lbc) / (2 * lab * d), -1, 1);
    const e = a.clone().add(dir.clone().multiplyScalar(cosA * lab)).add(p.multiplyScalar(Math.sqrt(1 - cosA * cosA) * lab));
    const goal = a.clone().add(dir.clone().multiplyScalar(d));
    this.rotateWorld(A, new THREE.Quaternion().setFromUnitVectors(b.clone().sub(a).normalize(), e.clone().sub(a).normalize()), 1);
    B.getWorldPosition(b); C.getWorldPosition(c);
    this.rotateWorld(B, new THREE.Quaternion().setFromUnitVectors(c.clone().sub(b).normalize(), goal.clone().sub(b).normalize()), 1);
    if (w < 1) {
      const fa = A.quaternion.clone(), fb = B.quaternion.clone();
      A.quaternion.copy(saveA).slerp(fa, w); B.quaternion.copy(saveB).slerp(fb, w);
      A.updateMatrixWorld(true);
    }
  }

  // Turn the head (and a bit of neck) toward a world point.
  look(target, w = 1, nod = 0, shake = 0) {
    const H = this.headBone, N = this.bones.Neck;
    if (w > 0.001) {
      const hp = H.getWorldPosition(_v);
      H.getWorldQuaternion(_q);
      const fwd = _v2.copy(this.headLocalFwd).applyQuaternion(_q).normalize();
      const to = _v3.copy(target).sub(hp).normalize();
      // limit to ~70°
      const ang = Math.acos(THREE.MathUtils.clamp(fwd.dot(to), -1, 1));
      const lim = Math.min(1, 1.2 / Math.max(ang, 1e-3));
      const dq = new THREE.Quaternion().setFromUnitVectors(fwd, to);
      const part = new THREE.Quaternion().slerp(dq, w * Math.min(1, lim));
      const half = new THREE.Quaternion().slerp(part, 0.4);
      this.rotateWorld(N, half, 1);
      const rest = new THREE.Quaternion().copy(half).invert().multiply(part);
      this.rotateWorld(H, rest, 1);
    }
    if (nod || shake) {
      const yaw = this.group.rotation.y;
      const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
      if (nod) this.rotateWorld(H, new THREE.Quaternion().setFromAxisAngle(right, nod), 1);
      if (shake) this.rotateWorld(H, new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), shake), 1);
    }
  }

  handPos(side, out = new THREE.Vector3()) {
    const h = this.bones[side + 'Hand'];
    const m = this.bones[side + 'HandMiddle1'];
    h.getWorldPosition(out);
    if (m) out.lerp(m.getWorldPosition(_v), 0.6);
    return out;
  }

  // Place the swapped head on the (collapsed) head bone. Call after all bone edits.
  finish() {
    const hb = this.headBone;
    hb.updateMatrixWorld(true);
    hb.matrixWorld.decompose(_v, _q, _v2);
    _m.compose(_v, _q, _v3.set(1, 1, 1));
    this.head.matrix.multiplyMatrices(_m, this.headOffset);
    this.head.matrixWorldNeedsUpdate = true;
  }

  dispose() {
    this.mixer.stopAllAction();
    this.mixer.uncacheRoot(this.root);
    this.body.geometry.dispose();
    this.body.material.dispose();
    this.head.traverse((o) => { if (o.isMesh) { o.material.dispose(); } });
  }
}
