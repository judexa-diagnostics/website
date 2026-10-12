// AfterSale engine: builds the shop, the two people and the props, then poses
// everything as a pure function of loop time and renders it through a CCTV
// grade. Created lazily by AfterSaleScene.jsx.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Actor, retargetClip, measureStride, clipFromJSON } from './people.js';
import { buildStore, buildProps, COUNTER, FRONT_DOOR, BACK_DOOR, ROOM } from './store.js';
import { makeScreen } from './screen.js';
import { makePhone, PHONE_STYLES, PD, MAT } from '../story/models.js';
import { screenTexture } from '../story/textures.js';
import {
  LOOP, OPERATOR, CUSTOMER, BUBBLES, CHIPS, SLOT, SLOT2, TOTE_POS, CASH_POS,
  buildTrack, screenState, clamp, prog, ease, smooth, window_, lerp,
} from './timeline.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const TOP = COUNTER.h;

function loadGLB(url) {
  const l = new GLTFLoader(); l.setMeshoptDecoder(MeshoptDecoder);
  return new Promise((res, rej) => l.load(url, res, undefined, rej));
}
async function loadJSON(url) { const r = await fetch(url); if (!r.ok) throw new Error(url + ' ' + r.status); return r.json(); }

const POST_VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
const POST_FS = `
precision highp float;
uniform sampler2D tDiffuse; uniform float uTime; uniform vec2 uRes; varying vec2 vUv;
vec3 aces(vec3 x){ const float a=2.51,b=0.03,c=2.43,d=0.59,e=0.14; return clamp((x*(a*x+b))/(x*(c*x+d)+e),0.0,1.0); }
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
vec3 toSRGB(vec3 c){ return mix(c * 12.92, 1.055 * pow(c, vec3(1.0/2.4)) - 0.055, step(0.0031308, c)); }
void main(){
  vec2 cc = vUv - 0.5;
  float r2 = dot(cc, cc);
  vec2 uv = 0.5 + cc * (0.93 + 0.14 * r2);
  vec2 ca = cc * 0.0035;
  vec3 col;
  col.r = texture2D(tDiffuse, uv + ca).r;
  col.g = texture2D(tDiffuse, uv).g;
  col.b = texture2D(tDiffuse, uv - ca).b;
  col = aces(col * 0.95);
  col = toSRGB(col);
  float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(vec3(l), col, 0.6) * vec3(0.97, 1.01, 1.0);
  col = (col - 0.5) * 1.07 + 0.5;
  float y = gl_FragCoord.y;
  col *= 0.955 + 0.045 * sin(y * 3.14159 * 0.5);
  float band = smoothstep(0.0, 0.08, abs(fract(vUv.y * 0.6 - uTime * 0.045) - 0.5));
  col *= 0.975 + 0.025 * band;
  col += (hash(gl_FragCoord.xy * 0.73 + fract(uTime * 7.31) * 91.0) - 0.5) * 0.06;
  float vig = smoothstep(0.85, 0.2, length(cc * vec2(1.0, 1.08)));
  col *= mix(0.62, 1.0, vig);
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

export async function createAfterSale(container, { base = './', onReady } = {}) {
  const marks = []; const T0 = performance.now(); const mark = (n) => marks.push(n + ' ' + Math.round(performance.now() - T0));
  /* ---------- renderer */
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const canvas = renderer.domElement;
  canvas.className = 'as-canvas';
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#2a2622');
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envRT.texture;
  scene.environmentIntensity = 0.25;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(58, 4 / 3, 0.1, 40);
  const CAM_POS = V(-1.05, 2.72, 2.6), CAM_AT = V(0.55, 0.98, -0.85);

  const rt = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: 4 });
  const post = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    vertexShader: POST_VS, fragmentShader: POST_FS, depthTest: false, depthWrite: false,
    uniforms: { tDiffuse: { value: rt.texture }, uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) } },
  }));
  const postScene = new THREE.Scene(); postScene.add(post);
  const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  /* ---------- overlay (CCTV OSD, bubbles, chips) */
  const osd = document.createElement('div'); osd.className = 'as-osd'; osd.setAttribute('aria-hidden', 'true');
  osd.innerHTML = '<div class="as-osd-top"><span class="as-rec"><i></i>REC</span><span class="as-cam">CAM 02<b> · FRONT COUNTER</b></span><span class="as-ts"></span></div><div class="as-chips"></div>';
  container.appendChild(osd);
  const tsEl = osd.querySelector('.as-ts'), recEl = osd.querySelector('.as-rec i'), chipsEl = osd.querySelector('.as-chips');
  const bubbleEls = BUBBLES.map((b) => {
    const el = document.createElement('div');
    el.className = 'as-bubble as-bubble-' + b.who;
    el.textContent = b.text;
    osd.appendChild(el);
    return el;
  });
  const chipEls = CHIPS.map((c) => {
    const el = document.createElement('div'); el.className = 'as-chip';
    el.innerHTML = `<i style="background:${c.dot}"></i>${c.text}`;
    chipsEl.appendChild(el); return el;
  });

  /* ---------- assets */
  const A = base + 'assets/';
  let body, headA, headB, clipsJSON;
  try {
    [body, headA, headB, clipsJSON] = await Promise.all([
      loadGLB(A + 'people/Michelle.glb'),
      loadGLB(A + 'aftersale/head-customer.glb'),
      loadGLB(A + 'aftersale/head-operator.glb'),
      loadJSON(A + 'aftersale/clips.json').catch(() => null),
    ]);
  } catch (err) {
    envRT.dispose(); rt.dispose(); renderer.dispose();
    canvas.remove(); osd.remove();
    throw err;
  }

  mark('assets');
  let clips;
  if (clipsJSON) {
    clips = { idle: clipFromJSON(clipsJSON.idle), walk: clipFromJSON(clipsJSON.walk) };
  } else {
    const soldier = await loadGLB(A + 'people/Soldier.glb');
    const get = (n) => soldier.animations.find((c) => c.name === n);
    clips = {
      idle: retargetClip(soldier.scene, get('Idle'), body.scene, { name: 'idle' }),
      walk: retargetClip(soldier.scene, get('Walk'), body.scene, { name: 'walk' }),
    };
    soldier.scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
  }

  mark('clips');
  /* ---------- world */
  const small = () => container.clientWidth < 480;
  const store = buildStore(scene, { lite: small() });
  const props = buildProps(scene);
  const pos = makeScreen();
  props.screen.material.map = pos.tex; props.screen.material.needsUpdate = true;

  const customer = new Actor({
    bodyGLTF: body, headGLTF: headA, clips, scale: 1.0,
    look: { shirt: '#5B6B4E', sleeves: true, pants: '#2E3F5C', shoes: '#ECE7DE', skin: '#7A4E35', headSize: 0.255, headY: 0.085, headZ: 0.012 },
  });
  const operator = new Actor({
    bodyGLTF: body, headGLTF: headB, clips, scale: 1.07,
    look: { shirt: '#EB5E12', sleeves: false, pants: '#2B2A2A', shoes: '#1B1A19', skin: '#B88A6A', shirtInflate: 2.0, headSize: 0.255, headY: 0.085, headZ: 0.01 },
  });
  for (const a of [customer, operator]) { scene.add(a.group); scene.add(a.head); }
  mark('actors');
  const strideC = measureStride(customer.root, clips.walk).stride;
  const strideO = measureStride(operator.root, clips.walk).stride;
  const trackC = buildTrack(CUSTOMER, strideC);
  const trackO = buildTrack(OPERATOR, strideO);
  mark('tracks');
  const idleDur = clips.idle.duration, walkDur = clips.walk.duration;

  // phones
  const offTex = screenTexture('off');
  const passTex = ['A', 'B', 'A'].map((g) => screenTexture('pass', { grade: g, title: 'CLEAN', sub: 'IMEI ok · not blocked' }));
  const phones = [1, 3, 10].map((k) => {
    const p = makePhone(PHONE_STYLES[k], offTex, { lite: true });
    p.scale.setScalar(0.01);
    p.traverse((o) => { if (o.isMesh) { o.castShadow = true; } });
    scene.add(p);
    return p;
  });

  /* ---------- per-frame posing */
  const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
  const bodyDir = (yaw, x, y, z) => V(x * Math.cos(yaw) + z * Math.sin(yaw), y, -x * Math.sin(yaw) + z * Math.cos(yaw));

  function poseActor(a, tr, t, off) {
    const s = tr.sample(t);
    a.group.position.set(s.x, 0, s.z);
    a.group.rotation.y = s.yaw;
    const w = Math.max(clamp(s.speed / 0.55), clamp(s.turn / 2.2) * 0.85);
    const ph = ((s.phase % 1) + 1) % 1;
    a.pose({ idle: 1 - w + 1e-4, walk: w }, { idle: (t + off) % idleDur, walk: ph * walkDur });
    // the source idle stands wide; bring the knees in a little while standing
    const k = (1 - w) * 0.075;
    if (k > 0.001) {
      const fwd = V(Math.sin(s.yaw), 0, Math.cos(s.yaw));
      a.rotateWorld(a.bones.LeftUpLeg, new THREE.Quaternion().setFromAxisAngle(fwd, -k), 1);
      a.rotateWorld(a.bones.RightUpLeg, new THREE.Quaternion().setFromAxisAngle(fwd, k), 1);
      a.rotateWorld(a.bones.LeftFoot, new THREE.Quaternion().setFromAxisAngle(fwd, k), 1);
      a.rotateWorld(a.bones.RightFoot, new THREE.Quaternion().setFromAxisAngle(fwd, -k), 1);
    }
    return s;
  }
  const headPos = (a, out) => a.headBone.getWorldPosition(out).add(tmp2.set(0, 0.06 * a.scale, 0));

  function phoneStackOnHand(a, side, list, t) {
    const h = a.handPos(side, tmp);
    const yaw = a.group.rotation.y;
    list.forEach((p, i) => {
      p.position.set(h.x, h.y - 0.05 + i * 0.009, h.z).add(bodyDir(yaw, 0, 0, 0.01));
      p.rotation.set(-Math.PI / 2, 0, yaw + Math.PI);
    });
    void t;
  }

  let lastScreen = '';
  function frame(t) {
    /* -- people */
    const sc = poseActor(customer, trackC, t, 0.0);
    const so = poseActor(operator, trackO, t, 0.7);
    const yc = sc.yaw, yo = so.yaw;
    const ch = headPos(customer, V(0, 0, 0)), oh = headPos(operator, V(0, 0, 0));

    // heads: look at each other while dealing, at the goods while scanning/paying
    const dealing = window_(t, 7.2, 33.4, 0.6);
    const scanFocus = window_(t, 9.6, 15.2, 0.4);
    const cashFocus = window_(t, 25.6, 29.2, 0.4);
    const custTarget = V(0, 0, 0).copy(oh).lerp(V(0.0, TOP, -0.05), Math.max(scanFocus * 0.7, cashFocus * 0.6));
    const shake = t > 19.0 && t < 20.2 ? Math.sin((t - 19.0) * 14) * 0.22 * Math.sin(prog(t, 19.0, 20.2) * Math.PI) : 0;
    const nodC = t > 23.4 && t < 24.4 ? Math.sin((t - 23.4) * 12) * 0.16 * Math.sin(prog(t, 23.4, 24.4) * Math.PI) : 0;
    const nodO = t > 22.9 && t < 23.9 ? Math.sin((t - 22.9) * 12) * 0.18 * Math.sin(prog(t, 22.9, 23.9) * Math.PI) : 0;
    customer.look(custTarget, dealing * 0.9, nodC, shake);
    const scanIdx = clamp(Math.floor((t - 9.8) / 1.6), 0, 2);
    const opLookGoods = V(0, 0, 0).set(SLOT(scanIdx)[0], TOP, SLOT(scanIdx)[1]);
    const opTarget = V(0, 0, 0).copy(ch).lerp(opLookGoods, scanFocus * 0.8).lerp(V(0.55, TOP - 0.1, 0.4), cashFocus * 0.7);
    operator.look(opTarget, Math.max(dealing * 0.85, window_(t, 37.6, 40.6, 0.4) * 0.6), nodO, 0);
    if (t > 37.6 && t < 40.6) operator.look(V(-0.2, TOP, 0.0), 0.5, 0, 0);

    /* -- customer hands: carry phones in, place them, pick up cash, pocket it */
    const poleR = (yaw) => bodyDir(yaw, -1, -1.2, -0.3).normalize();
    const poleL = (yaw) => bodyDir(yaw, 1, -1.2, -0.3).normalize();
    const place = window_(t, 7.0, 8.3, 0.55);
    if (place > 0) customer.reach('Right', V(-0.02, TOP + 0.06, -0.2), place, poleR(yc));
    const take = window_(t, 30.8, 31.9, 0.4);
    const pocket = window_(t, 31.5, 32.6, 0.45);
    if (take > 0 && t < 31.6) customer.reach('Right', V(CASH_POS[0], TOP + 0.04, CASH_POS[1]), take, poleR(yc));
    if (pocket > 0) {
      const hp = customer.bones.Hips.getWorldPosition(V(0, 0, 0)).add(bodyDir(yc, -0.14, -0.06, 0.07));
      customer.reach('Right', hp, pocket, poleR(yc));
    }

    /* -- operator hands */
    const T = OPERATOR_BEATS;
    // tote: carried in at loop start, set down, later loaded and carried out
    const toteDown = V(TOTE_POS[0], TOP, TOTE_POS[1]);
    const carryPos = bodyDir(yo, 0, 1.0 * operator.scale, 0.3).add(operator.group.position);
    let toteP, toteYaw;
    const lift = ease(t, 40.1, 40.6), setDown = ease(t, 3.75, 4.35);
    if (t < 3.75) { toteP = carryPos; toteYaw = yo; }
    else if (t < 4.35) { toteP = carryPos.clone().lerp(toteDown, setDown); toteP.y += Math.sin(setDown * Math.PI) * 0.03; toteYaw = lerp(yo, Math.PI, setDown); }
    else if (t < 40.1) { toteP = toteDown; toteYaw = Math.PI; }
    else { toteP = toteDown.clone().lerp(carryPos, lift); toteP.y += Math.sin(lift * Math.PI) * 0.04; toteYaw = lerp(Math.PI, yo, lift); }
    props.tote.position.copy(toteP); props.tote.rotation.y = toteYaw;
    const carryW = t < 4.2 ? 1 - ease(t, 4.0, 4.5) : ease(t, 39.9, 40.3);
    if (carryW > 0) {
      operator.reach('Left', props.tote.localToWorld(V(0.19, 0.1, 0)), carryW, poleL(yo));
      operator.reach('Right', props.tote.localToWorld(V(-0.19, 0.1, 0)), carryW, poleR(yo));
    }

    // scanner: pick up, scan three phones, put back
    const cradle = V(0.95, TOP + 0.05, 0.2);
    const holding = t >= T.scanPick && t < T.scanDrop;
    const scanW = window_(t, T.scanPick - 0.45, T.scanDrop + 0.45, 0.45);
    let scanTarget = cradle.clone(), beam = 0;
    if (holding) {
      const k = clamp((t - 9.8) / 1.6, 0, 2.999);
      const i = Math.floor(k), f = k - i;
      if (t < 9.8) scanTarget.lerp(V(SLOT(0)[0], TOP + 0.2, SLOT(0)[1] + 0.08), ease(t, T.scanPick, 9.8));
      else if (t < 14.6) {
        const [px, pz] = SLOT(i);
        scanTarget.set(px + 0.02, TOP + 0.17 + Math.sin(f * Math.PI) * 0.02, pz + 0.1);
        if (f > 0.75 && i < 2) scanTarget.lerp(V(SLOT(i + 1)[0], TOP + 0.2, SLOT(i + 1)[1] + 0.08), smooth((f - 0.75) / 0.25));
        beam = clamp(Math.sin(clamp((f - 0.15) / 0.45) * Math.PI) * 1.4);
      } else scanTarget.set(SLOT(2)[0], TOP + 0.2, SLOT(2)[1] + 0.08).lerp(cradle, ease(t, 14.6, T.scanDrop));
    }
    if (scanW > 0) operator.reach('Right', scanTarget, scanW, poleR(yo));
    if (holding) {
      const hp = operator.handPos('Right', V(0, 0, 0));
      props.scanner.position.copy(hp).add(V(0, 0.02, 0));
      const aim = t >= 9.8 && t < 14.6 ? V(SLOT(Math.floor(clamp((t - 9.8) / 1.6, 0, 2.99)))[0], TOP, SLOT(0)[1]) : hp.clone().add(bodyDir(yo, 0, -0.5, 1));
      props.scanner.lookAt(hp.clone().multiplyScalar(2).sub(aim));
    } else {
      props.scanner.position.copy(cradle).add(V(0, 0.0, 0));
      props.scanner.rotation.set(0, -0.2, 0);
    }
    props.beamMat.opacity = beam * 0.55;
    props.beam.visible = beam > 0.01;

    // cash: drawer opens, six bills counted onto the counter, drawer closes
    const drawerOpen = window_(t, 25.4, 29.9, 0.5);
    store.drawer.position.z = COUNTER.z + COUNTER.d / 2 - 0.22 + drawerOpen * 0.3;
    const drawerTop = V(0.55, TOP - 0.08, COUNTER.z + COUNTER.d / 2 + 0.06);
    const billT0 = 26.0, billDt = 0.5;
    const countW = window_(t, 25.7, 29.4, 0.35);
    let handTarget = drawerTop.clone();
    props.bills.forEach((b, i) => {
      const s0 = billT0 + i * billDt;
      const k = prog(t, s0, s0 + billDt);
      const land = V(CASH_POS[0] + (i % 2) * 0.006, TOP + 0.002 + i * 0.0012, CASH_POS[1] + i * 0.004);
      const from = drawerTop.clone().add(V(0, 0.03, 0));
      if (t >= s0 && t < s0 + billDt) {
        // pinch from the drawer (first 35%), swing to the pile, release
        const u = smooth(clamp((k - 0.25) / 0.6));
        handTarget = from.clone().lerp(land, u).add(V(0, Math.sin(u * Math.PI) * 0.12 + 0.03, 0));
      }
      let p;
      if (t < s0 + billDt * 0.25) p = null;
      else if (t < s0 + billDt * 0.85) { const u = smooth(clamp((k - 0.25) / 0.6)); p = from.clone().lerp(land, u).add(V(0, Math.sin(u * Math.PI) * 0.1, 0)); }
      else p = land;
      // the pile goes into the customer's hand, then the pocket
      if (p && t >= 31.4) {
        const hp = customer.handPos('Right', V(0, 0, 0));
        p = hp.clone().add(V(0, -0.01 + i * 0.001, 0));
      }
      const hidden = !p || t >= 32.45 || t < billT0;
      b.visible = !hidden;
      if (!hidden) { b.position.copy(p); b.rotation.set(0, 0.3 + i * 0.07 + (t >= 31.4 ? yc : 0), 0); }
    });
    if (countW > 0) operator.reach('Right', handTarget, countW, poleR(yo));

    // receipt prints, gets torn off and left with the cash
    const printK = ease(t, 28.9, 30.2);
    const tear = t >= 30.5;
    props.paperPivot.visible = t >= 28.9 && t < 30.5;
    props.paper.scale.y = 0.02 + printK * 0.14;
    const tearW = window_(t, 30.0, 31.0, 0.35);
    if (tearW > 0) operator.reach('Left', props.paperPivot.localToWorld(V(0, 0.12, 0)), tearW, poleL(yo));
    if (!receipt.parent) scene.add(receipt);
    receipt.visible = tear && t < 32.45;
    if (receipt.visible) {
      const k2 = ease(t, 30.5, 30.85);
      const from = operator.handPos('Left', V(0, 0, 0));
      const to = V(CASH_POS[0] + 0.05, TOP + 0.012, CASH_POS[1] + 0.03);
      receipt.position.copy(t < 31.4 ? from.lerp(to, k2) : customer.handPos('Right', V(0, 0, 0)));
      receipt.rotation.set(0, 0.6, 0);
    }

    /* -- phones */
    phones.forEach((p, i) => {
      const scanAt = 9.8 + i * 1.6 + 1.0;
      p.userData.screenMat.emissiveMap = t >= scanAt && t < 36.5 ? passTex[i] : offTex;
      p.userData.screenMat.emissiveIntensity = t >= scanAt && t < 36.5 ? 0.9 : 0.6;
      const slot = V(SLOT(i)[0], TOP + PD * 0.005, SLOT(i)[1]);
      const slot2 = V(SLOT2(i)[0], TOP + PD * 0.005, SLOT2(i)[1]);
      const yawS = Math.PI + (i - 1) * 0.12;
      const collectT0 = 37.8 + i * 0.75;
      if (t < 8.0) {
        // carried in the customer's right hand (stacked) until set down
        const h = customer.handPos('Right', V(0, 0, 0));
        const yawC = customer.group.rotation.y;
        if (t < 7.6) { p.position.copy(h).add(V(0, -0.02 + i * 0.0095, 0)).add(bodyDir(yawC, 0.0, 0, 0.03)); p.rotation.set(-Math.PI / 2 + 0.25, 0, yawC + Math.PI); }
        else { const k = ease(t, 7.6, 8.0); p.position.copy(h).add(V(0, -0.02 + i * 0.0095, 0)).lerp(V(-0.02, TOP + PD * 0.005 + i * 0.0085, -0.2), k); p.rotation.set(-Math.PI / 2, 0, yawC + Math.PI); }
        p.visible = t >= 1.0;
      } else if (t < 9.6) {
        const k = ease(t, 8.2 + i * 0.25, 8.9 + i * 0.25);
        p.position.set(-0.02, TOP + PD * 0.005 + i * 0.0085, -0.2).lerp(slot, k);
        p.rotation.set(-Math.PI / 2, 0, lerp(Math.PI, yawS, k));
        p.visible = true;
      } else if (t < collectT0) {
        const k = ease(t, scanAt + 0.1, scanAt + 0.5);
        p.position.copy(slot).lerp(slot2, k);
        p.rotation.set(-Math.PI / 2, 0, yawS);
        p.visible = true;
      } else if (t < collectT0 + 0.75) {
        const k = ease(t, collectT0, collectT0 + 0.6);
        const inTote = props.tote.localToWorld(V(-0.1 + i * 0.1, 0.05, 0));
        p.position.copy(slot2).lerp(inTote, k); p.position.y += Math.sin(k * Math.PI) * 0.12;
        p.rotation.set(-Math.PI / 2 + k * 1.2, 0, yawS);
        p.visible = true;
      } else if (t < 46.5) {
        p.position.copy(props.tote.localToWorld(V(-0.1 + i * 0.1, 0.05, 0)));
        p.rotation.set(-Math.PI / 2 + 1.2, 0, props.tote.rotation.y + Math.PI);
        p.visible = true;
      } else p.visible = false;
    });
    // operator hand follows each phone into the tote
    const colW = window_(t, 37.7, 40.1, 0.35);
    if (colW > 0) {
      const i = clamp(Math.floor((t - 37.8) / 0.75), 0, 2);
      operator.reach('Right', phones[i].position.clone().add(V(0, 0.03, 0)), colW * 0.9, poleR(yo));
    }

    customer.finish(); operator.finish();

    /* -- doors open when someone is near */
    const near = (a, x, z) => Math.hypot(a.group.position.x - x, a.group.position.z - z);
    const fd = Math.min(near(customer, FRONT_DOOR.x, ROOM.z0), 9);
    store.doorPivot.rotation.y = -smooth(clamp((1.25 - fd) / 0.7)) * 1.35;
    const bd = Math.min(near(operator, ROOM.x1, BACK_DOOR.z), 9);
    store.exitPivot.rotation.y = smooth(clamp((1.35 - bd) / 0.75)) * 1.5;

    /* -- POS screen */
    const st = screenState(t);
    const key = JSON.stringify(st);
    if (key !== lastScreen) { lastScreen = key; pos.draw(st); pos.tex.needsUpdate = true; }

    /* -- overlay */
    const W = container.clientWidth, H = container.clientHeight;
    BUBBLES.forEach((b, i) => {
      const el = bubbleEls[i];
      const a = window_(t, b.t0, b.t1, 0.22);
      if (a <= 0.01) { el.style.opacity = '0'; return; }
      const hp = (b.who === 'c' ? ch : oh).clone().add(V(0, 0.32, 0)).project(camera);
      let x = (hp.x * 0.5 + 0.5) * W, y = (-hp.y * 0.5 + 0.5) * H;
      x = clamp(x, el.offsetWidth / 2 + 6, W - el.offsetWidth / 2 - 6);
      y = clamp(y, el.offsetHeight + 30, H - 40);
      el.style.opacity = String(a);
      el.style.transform = `translate(${x.toFixed(1)}px, ${(y + (1 - a) * 6).toFixed(1)}px) translate(-50%, -100%)`;
    });
    CHIPS.forEach((c, i) => {
      const a = window_(t, c.t0, c.t1, 0.3);
      chipEls[i].style.opacity = String(a);
      chipEls[i].style.display = a > 0.01 ? '' : 'none';
    });
    const d = new Date(BASE_TIME + t * 1000);
    const p2 = (n) => String(n).padStart(2, '0');
    tsEl.textContent = `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}  ${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}`;
    recEl.style.opacity = (t % 1) < 0.55 ? '1' : '0.15';
    post.material.uniforms.uTime.value = t;
  }

  const receiptGeo = new THREE.PlaneGeometry(0.075, 0.14); receiptGeo.rotateX(-Math.PI / 2);
  const receipt = new THREE.Mesh(receiptGeo, props.paper.material);
  const now = new Date(); now.setHours(14, 32, 7, 0);
  const BASE_TIME = now.getTime();

  /* ---------- sizing + render */
  let W = 0, H = 0;
  function resize() {
    const w = Math.max(1, container.clientWidth), h = Math.max(1, container.clientHeight);
    if (w === W && h === H) return;
    W = w; H = h;
    renderer.setSize(w, h, false);
    const pr = renderer.getPixelRatio();
    rt.setSize(Math.round(w * pr), Math.round(h * pr));
    camera.aspect = w / h;
    // wide-angle CCTV: keep roughly the same horizontal coverage
    const hfov = THREE.MathUtils.degToRad(lerp(58, 66, clamp((camera.aspect - 1) / 0.4)));
    camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(hfov / 2) / camera.aspect));
    const tall = clamp((1.34 - camera.aspect) / 0.34);
    camera.position.copy(CAM_POS).add(V(-0.1 * tall, 0.15 * tall, 0.35 * tall));
    camera.lookAt(CAM_AT.clone().add(V(0.05 * tall, -0.05 * tall, 0)));
    camera.updateProjectionMatrix();
    post.material.uniforms.uRes.value.set(w, h);
  }
  function render(t) {
    resize();
    frame(t);
    renderer.setRenderTarget(rt);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(postScene, postCam);
  }

  if (import.meta.env.DEV) window.__as = { scene, camera, customer, operator, clips, strideC, strideO, renderer, marks };
  // first frame compiles shaders
  render(0);
  mark('first render');
  onReady && onReady();

  return {
    render,
    dispose() {
      [customer, operator].forEach((a) => a.dispose());
      store.dispose(); props.dispose(); pos.dispose();
      const shared = new Set(Object.values(MAT));
      phones.forEach((p) => p.traverse((o) => { if (o.isMesh && !shared.has(o.material)) o.material.dispose(); }));
      offTex.dispose(); passTex.forEach((x) => x.dispose());
      receiptGeo.dispose();
      body.scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { o.material.map && o.material.map.dispose(); o.material.normalMap && o.material.normalMap.dispose(); o.material.dispose(); } });
      [headA, headB].forEach((h) => h.scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { o.material.map && o.material.map.dispose(); o.material.dispose(); } }));
      envRT.dispose(); rt.dispose(); post.geometry.dispose(); post.material.dispose();
      renderer.dispose();
      renderer.forceContextLoss && renderer.forceContextLoss();
      canvas.remove(); osd.remove();
    },
  };
}

const OPERATOR_BEATS = { scanPick: 9.2, scanDrop: 15.3 };
export { LOOP };
