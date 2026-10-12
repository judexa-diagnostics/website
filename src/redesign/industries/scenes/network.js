// PLACEHOLDER for the 'network' industry scene. Replaced by the real scene.
export default async function create({ THREE }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#16130F');
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(4, 3, 6); camera.lookAt(0, 0, 0);
  scene.add(new THREE.HemisphereLight('#ffffff', '#333333', 2));
  const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: '#EB5E12' }));
  scene.add(box);
  return {
    scene, camera, duration: 8,
    captions: [{ at: 0, title: 'network', body: 'Scene coming soon.' }],
    update(dt) { box.rotation.y += dt; },
    dispose() { box.geometry.dispose(); box.material.dispose(); }
  };
}
