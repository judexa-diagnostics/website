// Cargo plane + airport scene for the take-off beat. Units are metres here;
// the warehouse scene reuses makePlane() scaled to centimetres.
import * as THREE from 'three';

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

// Plane faces +x. Origin = centre of the cargo floor at the rear door.
// Returns { group, ramp, door } so the rear ramp/door can open and close.
export function makePlane({ fog = true } = {}) {
  const g = new THREE.Group();
  const white = new THREE.MeshStandardMaterial({ color: '#f2f0ec', roughness: 0.45, metalness: 0.15, fog });
  const grey = new THREE.MeshStandardMaterial({ color: '#9aa0a8', roughness: 0.5, metalness: 0.4, fog });
  const orange = new THREE.MeshStandardMaterial({ color: '#EB5E12', roughness: 0.5, fog });
  const glass = new THREE.MeshStandardMaterial({ color: '#1b2430', roughness: 0.15, metalness: 0.6, fog });
  const inside = new THREE.MeshStandardMaterial({ color: '#cfc8bc', roughness: 0.8, side: THREE.BackSide, fog });
  const R = 2.7, L = 30;
  // fuselage: open tube so the hold is visible from the rear
  const tubeGeo = new THREE.CylinderGeometry(R, R, L, 40, 1, true); tubeGeo.rotateZ(Math.PI / 2);
  const tube = new THREE.Mesh(tubeGeo, white); tube.position.set(L / 2, R - 0.9, 0); g.add(tube);
  const tubeIn = new THREE.Mesh(tubeGeo, inside); tubeIn.position.copy(tube.position); tubeIn.scale.set(0.995, 0.97, 0.97); g.add(tubeIn);
  // cargo floor + roller strips inside
  const floor = new THREE.Mesh(new THREE.BoxGeometry(L, 0.12, 3.4), new THREE.MeshStandardMaterial({ color: '#6b6e73', roughness: 0.6, fog }));
  floor.position.set(L / 2, -0.06, 0); g.add(floor);
  const lamp = new THREE.PointLight('#fff3dc', 40, 30, 1.6); lamp.position.set(4, 1.6, 0); g.add(lamp);
  // nose
  const nose = new THREE.Mesh(new THREE.SphereGeometry(R, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2), white);
  nose.rotation.z = -Math.PI / 2; nose.scale.set(1, 1.9, 1); nose.position.set(L, R - 0.9, 0); g.add(nose);
  const cockpit = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 2.6), glass); cockpit.position.set(L + 3.0, R + 0.7, 0); cockpit.rotation.z = -0.5; g.add(cockpit);
  // upswept tail
  const tailGeo = new THREE.CylinderGeometry(R, R * 0.35, 8, 40, 1, true); tailGeo.rotateZ(Math.PI / 2);
  const tail = new THREE.Mesh(tailGeo, white); tail.position.set(-4, R + 0.2, 0); tail.rotation.z = -0.2; g.add(tail);
  // livery stripe
  const stripe = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.004, R * 1.004, L * 0.92, 40, 1, true, Math.PI * 0.42, Math.PI * 0.16), orange);
  stripe.rotation.z = Math.PI / 2; stripe.position.copy(tube.position); stripe.position.x += 0.6; g.add(stripe);
  const stripe2 = stripe.clone(); stripe2.rotation.x = Math.PI; g.add(stripe2);
  // wings (swept, high-mounted like a freighter)
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0); wingShape.lineTo(-5.5, 19); wingShape.lineTo(-8.2, 19); wingShape.lineTo(-6.5, 0); wingShape.closePath();
  const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.35, bevelEnabled: false }); wingGeo.rotateX(Math.PI / 2);
  [1, -1].forEach(s => {
    const w = new THREE.Mesh(wingGeo, white); w.scale.z = s; w.position.set(L * 0.62, R * 1.55, 0); w.rotation.x = s > 0 ? 0 : 0; w.scale.set(1, 1, s); g.add(w);
    [7, 13].forEach((d, k) => {
      const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.85, 4.2, 24), grey); eng.rotation.z = Math.PI / 2;
      eng.position.set(L * 0.62 - 1.6 - d * 0.29 - k * 0.2, R * 1.55 - 1.2, s * d); g.add(eng);
      const intake = new THREE.Mesh(new THREE.CircleGeometry(0.8, 24), new THREE.MeshStandardMaterial({ color: '#1e2126', fog }));
      intake.rotation.y = Math.PI / 2; intake.position.set(eng.position.x + 2.11, eng.position.y, eng.position.z); g.add(intake);
    });
  });
  // tail fin + stabilisers
  const finShape = new THREE.Shape(); finShape.moveTo(0, 0); finShape.lineTo(-4.5, 8); finShape.lineTo(-7, 8); finShape.lineTo(-6.5, 0); finShape.closePath();
  const fin = new THREE.Mesh(new THREE.ExtrudeGeometry(finShape, { depth: 0.3, bevelEnabled: false }), white);
  fin.position.set(-1.5, R * 1.6, -0.15); g.add(fin);
  const finLogo = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), new THREE.MeshBasicMaterial({ color: '#EB5E12', fog }));
  finLogo.position.set(-5.4, R * 1.6 + 4.2, 0.17); g.add(finLogo);
  const finLogo2 = finLogo.clone(); finLogo2.position.z = -0.17; finLogo2.rotation.y = Math.PI; g.add(finLogo2);
  const stabShape = new THREE.Shape(); stabShape.moveTo(0, 0); stabShape.lineTo(-2.5, 6.5); stabShape.lineTo(-4.2, 6.5); stabShape.lineTo(-4, 0); stabShape.closePath();
  const stabGeo = new THREE.ExtrudeGeometry(stabShape, { depth: 0.25, bevelEnabled: false }); stabGeo.rotateX(Math.PI / 2);
  [1, -1].forEach(s => { const st = new THREE.Mesh(stabGeo, white); st.position.set(-2.5, R * 1.45, 0); st.scale.set(1, 1, s); g.add(st); });
  // landing gear
  [[L * 0.55, 2.2], [L * 0.55, -2.2], [L + 1.5, 0]].forEach(([x, z]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 1.6, 10), grey); leg.position.set(x, -1.0, z); g.add(leg);
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.5, 20), new THREE.MeshStandardMaterial({ color: '#1b1b1c', roughness: 0.9, fog }));
    wheel.rotation.x = Math.PI / 2; wheel.position.set(x, -1.75, z); g.add(wheel);
  });
  // rear ramp (hinged at the floor edge) + upper door (hinged at the top)
  const ramp = new THREE.Group(); ramp.position.set(0, 0, 0); g.add(ramp);
  const rampM = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.14, 3.4), grey); rampM.position.set(-2.1, 0, 0); ramp.add(rampM);
  const door = new THREE.Group(); door.position.set(0, R * 1.6, 0); g.add(door);
  const doorM = new THREE.Mesh(new THREE.CircleGeometry(R * 0.98, 40, Math.PI / 2, Math.PI), white); doorM.rotation.y = Math.PI / 2; doorM.position.set(-0.02, -R * 0.65, 0); door.add(doorM);
  const doorLow = new THREE.Mesh(new THREE.CircleGeometry(R * 0.98, 40, -Math.PI / 2, Math.PI), white); doorLow.rotation.y = -Math.PI / 2; doorLow.position.set(0, R - 0.9, 0); doorLow.visible = false; g.add(doorLow);
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  g.userData = { ramp, door, doorLow };
  return g;
}

// open = 1: ramp down flat, door up. open = 0: closed.
export function setPlaneDoor(plane, open) {
  const { ramp, door, doorLow } = plane.userData;
  ramp.rotation.z = -(1 - open) * 1.35;
  door.rotation.z = open * 1.2;
  doorLow.visible = open < 0.05;
}

export function buildAirport() {
  const scene = new THREE.Scene();
  const sky = canvasTex(8, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0b1a3a'); gr.addColorStop(0.35, '#3f7fd0'); gr.addColorStop(0.62, '#9cc6f2'); gr.addColorStop(0.72, '#f6d9b8'); gr.addColorStop(1, '#f6d9b8'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  sky.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = sky;
  scene.fog = new THREE.Fog('#d7e3ee', 500, 4200);
  scene.add(new THREE.HemisphereLight('#dbe9ff', '#5a6b4a', 1.3));
  const sun = new THREE.DirectionalLight('#fff1dc', 2.4); sun.position.set(-300, 400, 200); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -80, right: 80, top: 80, bottom: -80, near: 10, far: 1500 });
  scene.add(sun); scene.add(sun.target);
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(20000, 20000), new THREE.MeshStandardMaterial({ color: '#8f9a74', roughness: 1 }));
  grass.rotation.x = -Math.PI / 2; grass.position.y = -2.3; grass.receiveShadow = true; scene.add(grass);
  const rwTex = canvasTex(256, 64, (g, w, h) => { g.fillStyle = '#3a3b3e'; g.fillRect(0, 0, w, h); g.fillStyle = '#f4f2ec'; g.fillRect(0, h / 2 - 2, w / 2, 4); g.fillRect(0, 3, w, 3); g.fillRect(0, h - 6, w, 3); });
  rwTex.wrapS = THREE.RepeatWrapping; rwTex.repeat.set(120, 1);
  const runway = new THREE.Mesh(new THREE.PlaneGeometry(6000, 60), new THREE.MeshStandardMaterial({ map: rwTex, roughness: 0.9 }));
  runway.material.polygonOffset = true; runway.material.polygonOffsetFactor = -2; runway.material.polygonOffsetUnits = -2;
  runway.rotation.x = -Math.PI / 2; runway.position.set(2600, -2.25, 0); runway.receiveShadow = true; scene.add(runway);
  // edge lights
  const lg = new THREE.InstancedMesh(new THREE.SphereGeometry(0.35, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffe2a8' }), 240);
  const m4 = new THREE.Matrix4(); let k = 0;
  for (let x = -400; x < 5600; x += 50) [31, -31].forEach(z => { m4.makeTranslation(x, -2.0, z); lg.setMatrixAt(k++, m4); });
  lg.count = k; scene.add(lg);
  // a hangar + the warehouse the box came from
  const hang = new THREE.Mesh(new THREE.BoxGeometry(90, 26, 120), new THREE.MeshStandardMaterial({ color: '#d9d4c8', roughness: 0.8 }));
  hang.position.set(-120, 11, -120); hang.castShadow = true; scene.add(hang);
  const sign = canvasTex(512, 96, (g, w, h) => { g.fillStyle = '#16130F'; g.fillRect(0, 0, w, h); g.fillStyle = '#EB5E12'; g.fillRect(0, h - 10, w, 10); g.fillStyle = '#F6F2EA'; g.font = "700 54px 'Archivo', sans-serif"; g.fillText('InPhox · Dallas DC', 24, 62); });
  const signM = new THREE.Mesh(new THREE.PlaneGeometry(60, 11), new THREE.MeshBasicMaterial({ map: sign })); signM.position.set(-120, 30, -59.9); scene.add(signM);
  const plane = makePlane({ fog: true }); scene.add(plane);
  setPlaneDoor(plane, 0);
  const camera = new THREE.PerspectiveCamera(38, 1, 1, 12000);
  return { scene, camera, plane, sun };
}
