// Shared cast for the 3D scenes: pictogram figures in the spirit of road-sign
// and wayfinding pictograms. A round head with no face, a rounded torso and
// capsule limbs, all in one soft off-white; staff get a single InPhox-orange
// vest so the operator reads apart from customers. The figure is one skinned
// mesh built from code and bound to the rig in body.glb, so the idle/walk
// clips (clips.json) and the arm helpers below drive it like any character.
//
//   const kit = await loadPeople(loadGLTF, { asset });
//   const p = kit.person({ look: LOOKS.staffOrange, height: 1.78 });
//   scene.add(p.root);  p.mixer.update(dt);  p.setWalk(w);  kit.reach(p, 'Right', target, w);
//
// Walking: the clip covers WALK_STRIDE body heights per cycle, so a figure
// moving at v units/s plays it at timeScale = walkRate(p, v) (feet stay put).
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// Kept for callers that still pick a "head" per person; figures are identical.
export const HEADS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

// accent: the staff vest. Everything else is the same white figure.
const ORANGE = '#E2601C';
export const LOOKS = {
  staffOrange: { accent: ORANGE },
  staffOrangeLong: { accent: ORANGE },
  staffCharcoal: { accent: ORANGE },
  staffCharcoalShort: { accent: ORANGE },
  staffCream: { accent: ORANGE },
  casualOlive: {},
  casualDenim: {},
  casualRust: {},
  casualWhite: {},
  casualNavy: {},
  casualBerry: {},
  hiVis: { accent: ORANGE }
};
const WHITE = '#F3F2EF';

// Distance covered by one walk cycle, in body heights (measured from the clip:
// the planted foot travels 0.29 m in 0.20 s on the 1.58 m rig).
export const WALK_STRIDE = 0.885;

const clean = n => n.replace(/^mixamorig:?/, '');

export function bonesOf(root) {
  const m = {};
  root.traverse(o => { if (o.isBone) m[clean(o.name)] = o; });
  return m;
}

// Lathe a tapered capsule along +y: hemisphere of radius ra at y=0, of rb at y=len.
function capsule(len, ra, rb, seg = 20) {
  const pts = [], n = 8;
  for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + (i / n) * (Math.PI / 2); pts.push(new THREE.Vector2(Math.cos(a) * ra, Math.sin(a) * ra)); }
  for (let i = 0; i <= n; i++) { const a = (i / n) * (Math.PI / 2); pts.push(new THREE.Vector2(Math.cos(a) * rb, len + Math.sin(a) * rb)); }
  pts[0].x = 0; pts[pts.length - 1].x = 0;
  return new THREE.LatheGeometry(pts, seg);
}

// The pictogram body, in the rig's rest space (metres, feet at y = 0, facing +z).
// parts: [geometry, weight(vertexPos) -> [[bone, w], ...], isVest(vertexPos)]
function buildFigure(B) {
  const P = n => B[n].getWorldPosition(new THREE.Vector3());
  const parts = [];
  const rigid = name => () => [[name, 1]];
  const along = (geo, a, b) => {
    const d = new THREE.Vector3().subVectors(b, a);
    geo.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()));
    geo.translate(a.x, a.y, a.z);
    return geo;
  };
  const limb = (a, b, ra, rb, bone) => parts.push([along(capsule(a.distanceTo(b), ra, rb), a, b), rigid(bone)]);

  // head: a plain sphere floating just above the shoulders (no neck), the
  // way sign pictograms draw it
  const head = P('Head');
  const hg = new THREE.SphereGeometry(0.097, 32, 20); hg.translate(0, head.y + 0.08, head.z + 0.012);
  parts.push([hg, rigid('Head')]);

  // torso: smooth lathe profile (radius, height) from the hips to rounded
  // shoulders, flattened front to back; skinned Hips -> Spine -> Spine1 -> Spine2.
  // The vest edge gets its own ring so the colour change is crisp.
  const hipY = P('Hips').y, sh = P('LeftArm').y, vestY = hipY - 0.03;
  const key = [[0.0, hipY - 0.105], [0.07, hipY - 0.098], [0.108, hipY - 0.075], [0.12, hipY - 0.035], [0.121, hipY + 0.04],
    [0.117, hipY + 0.1], [0.123, hipY + 0.17], [0.134, sh - 0.085], [0.139, sh - 0.045], [0.132, sh - 0.008], [0.112, sh + 0.024],
    [0.075, sh + 0.045], [0.0, sh + 0.054]];
  const curve = new THREE.SplineCurve(key.map(([r, y]) => new THREE.Vector2(r, y)));
  let prof = curve.getPoints(40);
  // split exactly at the vest edge: two rings 1 mm apart
  const iv = prof.findIndex(v => v.y > vestY);
  const vr = THREE.MathUtils.lerp(prof[iv - 1].x, prof[iv].x, (vestY - prof[iv - 1].y) / (prof[iv].y - prof[iv - 1].y));
  prof = [...prof.slice(0, iv), new THREE.Vector2(vr, vestY - 0.0005), new THREE.Vector2(vr, vestY + 0.0005), ...prof.slice(iv)];
  prof[0].x = 0; prof[prof.length - 1].x = 0;
  const tg = new THREE.LatheGeometry(prof, 32);
  tg.scale(1, 1, 0.66); tg.translate(0, 0, P('Spine1').z);
  const ys = ['Hips', 'Spine', 'Spine1', 'Spine2'].map(n => [n, P(n).y]);
  parts.push([tg, v => {
    if (v.y <= ys[0][1]) return [['Hips', 1]];
    for (let i = 0; i < ys.length - 1; i++) {
      const [na, ya] = ys[i], [nb, yb] = ys[i + 1];
      if (v.y <= yb) { const k = (v.y - ya) / (yb - ya); return [[na, 1 - k], [nb, k]]; }
    }
    return [['Spine2', 1]];
  }, v => v.y > vestY]);

  for (const s of ['Left', 'Right']) {
    // arms: upper arm, forearm, a rounded hand
    limb(P(s + 'Arm'), P(s + 'ForeArm'), 0.041, 0.036, s + 'Arm');
    limb(P(s + 'ForeArm'), P(s + 'Hand'), 0.034, 0.029, s + 'ForeArm');
    const hand = P(s + 'Hand'), mid = P(s + 'HandMiddle1');
    const tip = hand.clone().lerp(mid, 1.15);
    const hgeo = capsule(hand.distanceTo(tip), 0.032, 0.027, 14); hgeo.scale(0.72, 1, 1); // flat mitt, palm down at rest
    parts.push([along(hgeo, hand, tip), rigid(s + 'Hand')]);
    // legs: thigh, shin, foot (sole on the floor at rest)
    limb(P(s + 'UpLeg'), P(s + 'Leg'), 0.064, 0.05, s + 'UpLeg');
    limb(P(s + 'Leg'), P(s + 'Foot'), 0.047, 0.039, s + 'Leg');
    const f = P(s + 'Foot'), toe = P(s + 'ToeBase');
    const heel = new THREE.Vector3(f.x, 0.04, f.z - 0.04), front = new THREE.Vector3(toe.x, 0.032, toe.z + 0.03);
    parts.push([along(capsule(heel.distanceTo(front), 0.04, 0.032, 14), heel, front), rigid(s + 'Foot')]);
  }
  return parts;
}

// One merged, skinned geometry per vest colour.
function figureGeometry(parts, boneIndex, accent) {
  const white = new THREE.Color(WHITE).convertSRGBToLinear(), acc = accent ? new THREE.Color(accent).convertSRGBToLinear() : white;
  const geos = parts.map(([g0, weigh, vest]) => {
    const g = g0.clone();
    g.deleteAttribute('uv');
    const pos = g.attributes.position, n = pos.count;
    const si = new Uint16Array(n * 4), sw = new Float32Array(n * 4), col = new Float32Array(n * 3), v = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      v.fromBufferAttribute(pos, i);
      weigh(v).forEach(([bn, w], k) => { si[i * 4 + k] = boneIndex[bn]; sw[i * 4 + k] = w; });
      const c = vest && vest(v) ? acc : white;
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4));
    g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    return g;
  });
  return mergeGeometries(geos, false);
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

export async function loadPeople(loadGLTF, { asset = p => p } = {}) {
  const [body, clipsJSON] = await Promise.all([
    loadGLTF(asset('assets/people/body.glb')),
    fetch(asset('assets/people/clips.json')).then(r => { if (!r.ok) throw new Error('clips ' + r.status); return r.json(); })
  ]);
  body.scene.updateMatrixWorld(true);
  const B = bonesOf(body.scene);
  // the rig only: the original mesh is dropped, the figure is built from code
  const drop = [];
  body.scene.traverse(o => { if (o.isMesh) drop.push(o); });
  drop.forEach(o => { o.parent.remove(o); o.geometry.dispose(); for (const k in o.material) { const v = o.material[k]; if (v && v.isTexture) v.dispose(); } o.material.dispose(); });
  // hand rest frames: mitt direction (wrist -> fingers) and palm normal (palm down)
  const handRest = {};
  for (const sd of ['Left', 'Right']) {
    const h = B[sd + 'Hand'], m = B[sd + 'HandMiddle1'];
    handRest[sd] = { q: h.getWorldQuaternion(new THREE.Quaternion()), dir: m.getWorldPosition(new THREE.Vector3()).sub(h.getWorldPosition(new THREE.Vector3())).normalize(), n: new THREE.Vector3(0, -1, 0) };
  }
  const boneNames = Object.keys(B), boneIndex = Object.fromEntries(boneNames.map((n, i) => [n, i]));
  const inverses = boneNames.map(n => new THREE.Matrix4().copy(B[n].matrixWorld).invert());
  const parts = buildFigure(B);
  const geos = new Map();
  const geoFor = accent => { const k = accent || ''; if (!geos.has(k)) geos.set(k, figureGeometry(parts, boneIndex, accent)); return geos.get(k); };
  const bb = new THREE.Box3(); geoFor(null).computeBoundingBox(); bb.copy(geoFor(null).boundingBox);
  const clips = { idle: THREE.AnimationClip.parse(clipsJSON.idle), walk: THREE.AnimationClip.parse(clipsJSON.walk) };
  narrowStance(clips.idle, B, 0.075);
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.68, metalness: 0, envMapIntensity: 0.6 });
  return makeKit({ body, boneNames, inverses, geoFor, bodyHeight: bb.max.y, clips, mat, geos, handRest });
}

const _v = new THREE.Vector3(), _v2 = new THREE.Vector3(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _q3 = new THREE.Quaternion();

function makeKit(C) {
  const people = [];

  // height: top of the head in scene units; returns a person
  function person({ look = LOOKS.casualOlive, height = 1.7, mixer = true, shadow = true, phase = 0 } = {}) {
    const model = SkeletonUtils.clone(C.body.scene);
    const bones = bonesOf(model);
    const skeleton = new THREE.Skeleton(C.boneNames.map(n => bones[n]), C.inverses);
    const body = new THREE.SkinnedMesh(C.geoFor(look && look.accent), C.mat);
    body.castShadow = shadow; body.receiveShadow = true; body.frustumCulled = false;
    model.add(body);
    model.updateMatrixWorld(true);
    body.bind(skeleton, new THREE.Matrix4());
    const holder = new THREE.Group(); bones.Head.add(holder); // kept for callers that attach to the head

    const root = new THREE.Group();
    root.add(model);
    const s = height / C.bodyHeight;
    model.scale.setScalar(s);
    const P = { root, model, body, bones, head: holder, scale: s, look };
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

  // walk clip playback rate for a ground speed (scene units / s), feet planted
  const walkRate = (P, speed) => speed / (WALK_STRIDE * P.scale * C.bodyHeight / C.clips.walk.duration);

  // Turn a hand so the mitt points along dir and the palm faces n (world
  // directions), blended by w. Use it to put the palm flat against something held.
  const _m1 = new THREE.Matrix4(), _m2 = new THREE.Matrix4(), _x1 = new THREE.Vector3(), _y1 = new THREE.Vector3(), _z1 = new THREE.Vector3();
  function orientHand(P, side, dir, n, w = 1) {
    if (w <= 0.001) return;
    const R = C.handRest[side], bone = P.bones[side + 'Hand'];
    const basis = (d, nn, m) => { _x1.copy(d).normalize(); _y1.copy(nn).addScaledVector(_x1, -nn.dot(_x1)).normalize(); _z1.crossVectors(_x1, _y1); return m.makeBasis(_x1, _y1, _z1); };
    basis(R.dir, R.n, _m1); basis(dir, n, _m2);
    _q.setFromRotationMatrix(_m2.multiply(_m1.transpose())).multiply(R.q); // target world rotation
    bone.parent.updateWorldMatrix(true, false);
    bone.parent.getWorldQuaternion(_q2).invert();
    bone.quaternion.slerp(_q2.multiply(_q), Math.min(1, w));
    bone.updateMatrixWorld(true);
  }
  // half the thickness of the flat hand (scene units) for a person
  const palmHalf = P => 0.032 * 0.72 * P.scale;

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
    C.geos.forEach(g => g.dispose());
    C.mat.dispose();
  }

  return { person, hand, reach, carry, local, setOpacity, dispose, walkRate, orientHand, palmHalf, clips: C.clips, bodyHeight: C.bodyHeight, LOOKS, HEADS };
}
