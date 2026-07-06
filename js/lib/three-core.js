// 3D 씬 부트스트랩 — 렌더러/카메라/조명/컨트롤/피킹을 한번에 구성
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export function initScene(container, opts = {}) {
  const {
    background = 0x0b0e14,
    fog = true,
    cameraPos = [8, 6, 10],
    target = [0, 1.2, 0],
    floor = true,
  } = opts;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(background);
  if (fog) scene.fog = new THREE.Fog(background, 22, 60);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
  camera.position.set(...cameraPos);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  container.appendChild(renderer.domElement);
  renderer.domElement.style.display = 'block';

  // 환경맵 — 금속/유리 재질이 실제처럼 반사되도록 (클린룸 실내광)
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(...target);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.maxPolarAngle = Math.PI * 0.52;
  controls.minDistance = 2.5;
  controls.maxDistance = 40;

  // ---- 조명 ----
  scene.add(new THREE.HemisphereLight(0xaebbdd, 0x1a1408, 0.85));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(8, 14, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -15; key.shadow.camera.right = 15;
  key.shadow.camera.top = 15; key.shadow.camera.bottom = -15;
  key.shadow.bias = -0.0004;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x6a86ff, 0.7);
  rim.position.set(-10, 6, -8);
  scene.add(rim);

  // ---- 클린룸 바닥 ----
  if (floor) {
    const floorMesh = new THREE.Mesh(
      new THREE.CircleGeometry(30, 64),
      new THREE.MeshStandardMaterial({ color: 0x11151f, roughness: 0.85, metalness: 0.25 })
    );
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);
    const grid = new THREE.GridHelper(60, 60, 0x26314a, 0x1a2234);
    grid.position.y = 0.001;
    scene.add(grid);
  }

  // ---- 리사이즈 ----
  function resize() {
    const w = container.clientWidth, h = container.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  resize();
  new ResizeObserver(resize).observe(container);

  // ---- 렌더 루프 ----
  const clock = new THREE.Clock();
  const tickers = [];
  let running = true;
  renderer.setAnimationLoop(() => {
    if (!running) return;
    const dt = clock.getDelta();
    const t = clock.elapsedTime;
    controls.update();
    for (const fn of tickers) fn(t, dt);
    renderer.render(scene, camera);
  });

  // ---- 피킹 (userData.pick = {name, desc} 가 있는 메시) ----
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let pickRoot = scene;
  let hoverCb = null, clickCb = null;
  let lastHover = null;

  function findPickable(obj) {
    let cur = obj;
    while (cur) {
      if (cur.userData && cur.userData.pick) return cur;
      cur = cur.parent;
    }
    return null;
  }
  function cast(e) {
    const r = renderer.domElement.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObject(pickRoot, true);
    for (const h of hits) {
      const p = findPickable(h.object);
      if (p && p.visible) return p;
    }
    return null;
  }
  renderer.domElement.addEventListener('pointermove', e => {
    if (!hoverCb) return;
    const hit = cast(e);
    if (hit !== lastHover) {
      lastHover = hit;
      renderer.domElement.style.cursor = hit ? 'pointer' : 'default';
    }
    hoverCb(hit, e);
  });
  renderer.domElement.addEventListener('click', e => {
    if (!clickCb) return;
    clickCb(cast(e), e);
  });

  // 카메라 부드러운 이동
  let camAnim = null;
  function flyTo(pos, tgt, dur = 1.2) {
    camAnim = {
      t: 0, dur,
      p0: camera.position.clone(), p1: new THREE.Vector3(...pos),
      t0: controls.target.clone(), t1: new THREE.Vector3(...tgt),
    };
  }
  tickers.push((t, dt) => {
    if (!camAnim) return;
    camAnim.t += dt;
    const k = Math.min(camAnim.t / camAnim.dur, 1);
    const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; // easeInOutQuad
    camera.position.lerpVectors(camAnim.p0, camAnim.p1, e);
    controls.target.lerpVectors(camAnim.t0, camAnim.t1, e);
    if (k >= 1) camAnim = null;
  });

  return {
    THREE, scene, camera, renderer, controls,
    onTick: fn => tickers.push(fn),
    setPickRoot: root => { pickRoot = root; },
    onHover: fn => { hoverCb = fn; },
    onClick: fn => { clickCb = fn; },
    flyTo,
    dispose: () => { running = false; renderer.setAnimationLoop(null); renderer.dispose(); },
  };
}
