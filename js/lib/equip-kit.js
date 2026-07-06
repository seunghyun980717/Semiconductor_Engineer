// 반도체 장비 3D 부품 키트 — 모든 공정 모듈이 공유하는 파라메트릭 프리미티브
// 규칙: 단위는 미터 스케일 감각(장비 높이 2~3), y=0이 바닥.
import * as THREE from 'three';

/* ---------------- 재질 ---------------- */
export const MAT = {
  steel: (c = 0x9aa4b5) => new THREE.MeshStandardMaterial({ color: c, metalness: 0.85, roughness: 0.35 }),
  paint: (c = 0xdde3ec) => new THREE.MeshStandardMaterial({ color: c, metalness: 0.15, roughness: 0.55 }),
  dark: (c = 0x2a3244) => new THREE.MeshStandardMaterial({ color: c, metalness: 0.4, roughness: 0.6 }),
  plastic: (c = 0x39415a) => new THREE.MeshStandardMaterial({ color: c, metalness: 0.05, roughness: 0.8 }),
  glass: (c = 0x8fd3ff, opacity = 0.28) => new THREE.MeshPhysicalMaterial({
    color: c, metalness: 0, roughness: 0.08, transmission: 0.6, transparent: true, opacity,
    side: THREE.DoubleSide,
  }),
  glow: (c = 0xff5a2a, intensity = 2.2) => new THREE.MeshStandardMaterial({
    color: c, emissive: c, emissiveIntensity: intensity, toneMapped: false,
  }),
  silicon: () => new THREE.MeshPhysicalMaterial({
    color: 0x5a6478, metalness: 0.9, roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.1,
  }),
  copper: () => new THREE.MeshStandardMaterial({ color: 0xd98a4a, metalness: 0.95, roughness: 0.3 }),
  gold: () => new THREE.MeshStandardMaterial({ color: 0xe8c04a, metalness: 0.95, roughness: 0.25 }),
};

/* 피킹 태그: 마우스 오버/클릭 시 정보 표시 대상 지정 */
export function pick(obj, name, desc) {
  obj.userData.pick = { name, desc };
  return obj;
}
export function shadow(obj) {
  obj.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return obj;
}

/* ---------------- 웨이퍼 ---------------- */
// 다이 격자가 그려진 300mm 웨이퍼 (r=반지름, tint=다이 색)
export function makeWafer(r = 0.8, { tint = '#7c6cff', thickness = 0.035, dieGrid = 14 } = {}) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 512;
  const g = cv.getContext('2d');
  const grad = g.createRadialGradient(256, 220, 40, 256, 256, 280);
  grad.addColorStop(0, '#c9d4ff'); grad.addColorStop(0.5, tint); grad.addColorStop(1, '#2d2a55');
  g.fillStyle = grad; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = 'rgba(10,12,25,.55)'; g.lineWidth = 2;
  const step = 512 / dieGrid;
  for (let i = 1; i < dieGrid; i++) {
    g.beginPath(); g.moveTo(i * step, 0); g.lineTo(i * step, 512); g.stroke();
    g.beginPath(); g.moveTo(0, i * step); g.lineTo(512, i * step); g.stroke();
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = [
    MAT.silicon(),                                                     // 옆면
    new THREE.MeshPhysicalMaterial({ map: tex, metalness: 0.75, roughness: 0.18, clearcoat: 1 }), // 윗면
    MAT.silicon(),                                                     // 아랫면
  ];
  const wafer = new THREE.Mesh(new THREE.CylinderGeometry(r, r, thickness, 64), mat);
  // 노치
  const notch = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.04, r * 0.04, thickness * 1.05, 12), MAT.dark(0x0b0e14));
  notch.position.set(0, 0, r);
  wafer.add(notch);
  wafer.castShadow = true;
  return wafer;
}

// 베어 웨이퍼(패턴 없는 거울면)
export function makeBareWafer(r = 0.8, thickness = 0.035) {
  const w = new THREE.Mesh(new THREE.CylinderGeometry(r, r, thickness, 64), MAT.silicon());
  w.castShadow = true;
  return w;
}

/* ---------------- FOUP (웨이퍼 운반 용기) ---------------- */
export function makeFoup(color = 0x7f8ba3) {
  const grp = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.9, 0.9), MAT.plastic(color));
  body.position.y = 0.45;
  grp.add(body);
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.8, 0.05), MAT.glass(0xaad4ff, 0.5));
  door.position.set(0, 0.45, 0.46);
  grp.add(door);
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.12), MAT.dark());
  handle.position.set(0, 0.96, 0);
  grp.add(handle);
  // 내부 웨이퍼 슬롯
  for (let i = 0; i < 6; i++) {
    const w = makeBareWafer(0.36, 0.02);
    w.position.set(0, 0.16 + i * 0.115, 0);
    grp.add(w);
  }
  return shadow(grp);
}

/* ---------------- 장비 몸체 ---------------- */
// 제어 캐비닛: 통풍구 + 상태등 + 스크린
export function makeCabinet({ w = 1.4, h = 2.2, d = 1.2, color = 0xdde3ec, screen = true } = {}) {
  const grp = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), MAT.paint(color));
  body.position.y = h / 2;
  grp.add(body);
  // 통풍구
  const vents = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const v = new THREE.Mesh(new THREE.BoxGeometry(w * 0.55, 0.02, 0.02), MAT.dark(0x1a2030));
    v.position.set(0, h * 0.18 + i * 0.055, d / 2 + 0.011);
    vents.add(v);
  }
  grp.add(vents);
  if (screen) {
    const scr = new THREE.Mesh(new THREE.BoxGeometry(w * 0.5, h * 0.16, 0.03), MAT.glow(0x58a6ff, 0.6));
    scr.position.set(0, h * 0.72, d / 2 + 0.02);
    grp.add(scr);
  }
  return shadow(grp);
}

// 상태 표시등 타워 (초록/노랑/빨강)
export function makeSignalTower() {
  const grp = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35), MAT.dark());
  pole.position.y = 0.17;
  grp.add(pole);
  const colors = [0xff4d6d, 0xffd166, 0x3ddc84];
  const lights = [];
  colors.forEach((c, i) => {
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.075, 20),
      new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: i === 2 ? 2.5 : 0.15, transparent: true, opacity: 0.9 }));
    seg.position.y = 0.4 + i * 0.08;
    lights.push(seg);
    grp.add(seg);
  });
  grp.userData.setState = (state) => { // 'run' | 'warn' | 'alarm'
    const on = { alarm: 0, warn: 1, run: 2 }[state] ?? 2;
    lights.forEach((l, i) => { l.material.emissiveIntensity = i === on ? 2.5 : 0.15; });
  };
  return grp;
}

// 진공 챔버 (원통형 + 뷰포트 + 상단 리드)
export function makeChamber({ r = 1.0, h = 1.2, color = 0xb9c2d4, y = 1.0 } = {}) {
  const grp = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 48), MAT.steel(color));
  body.position.y = y;
  grp.add(body);
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.1, r * 1.1, 0.12, 48), MAT.steel(0x828da3));
  lid.position.y = y + h / 2 + 0.06;
  grp.add(lid);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.08, r * 1.15, 0.14, 48), MAT.steel(0x828da3));
  base.position.y = y - h / 2 - 0.07;
  grp.add(base);
  // 뷰포트 창
  const port = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.06, 24), MAT.glass(0xaad4ff, 0.6));
  port.rotation.z = Math.PI / 2;
  port.position.set(0, y, r);
  port.rotation.x = Math.PI / 2;
  grp.add(port);
  // 볼트 링
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.05, 8), MAT.dark(0x39415a));
    bolt.position.set(Math.cos(a) * r * 1.02, y + h / 2 + 0.06, Math.sin(a) * r * 1.02);
    grp.add(bolt);
  }
  grp.userData.body = body;
  return shadow(grp);
}

// 웨이퍼 척(페데스탈)
export function makePedestal({ r = 0.55, y = 0.9 } = {}) {
  const grp = new THREE.Group();
  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, y, 24), MAT.steel(0x6b7488));
  column.position.y = y / 2;
  grp.add(column);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.09, 48), MAT.dark(0x39415a));
  top.position.y = y + 0.045;
  grp.add(top);
  grp.userData.topY = y + 0.09;
  return shadow(grp);
}

// 샤워헤드 (가스 분사판)
export function makeShowerhead({ r = 0.6, y = 2.0 } = {}) {
  const grp = new THREE.Group();
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.1, 48), MAT.steel(0x828da3));
  plate.position.y = y;
  grp.add(plate);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.5, 16), MAT.steel());
  stem.position.y = y + 0.3;
  grp.add(stem);
  // 노즐 구멍 표현
  const holes = new THREE.Group();
  for (let ring = 1; ring <= 3; ring++) {
    const n = ring * 8;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.02, 6), MAT.dark(0x11151f));
      hole.position.set(Math.cos(a) * ring * r * 0.28, y - 0.052, Math.sin(a) * ring * r * 0.28);
      holes.add(hole);
    }
  }
  grp.add(holes);
  return shadow(grp);
}

/* ---------------- 배관/빔/유틸 ---------------- */
export function makePipe(points, { radius = 0.05, color = 0x828da3 } = {}) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  const geo = new THREE.TubeGeometry(curve, 48, radius, 12, false);
  return shadow(new THREE.Mesh(geo, MAT.steel(color)));
}

export function makeBeam(from, to, { color = 0xbb66ff, radius = 0.03, opacity = 0.85 } = {}) {
  const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
  const len = a.distanceTo(b);
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, len, 12),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity, toneMapped: false })
  );
  mesh.position.copy(a).lerp(b, 0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  return mesh;
}

// 플라즈마 글로우 (챔버 내부 발광 원반)
export function makePlasmaGlow({ r = 0.55, h = 0.4, color = 0xbb66ff } = {}) {
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(r, r, h, 32, 1, true),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35, side: THREE.DoubleSide, toneMapped: false })
  );
  const core = new THREE.Mesh(
    new THREE.CylinderGeometry(r * 0.8, r * 0.8, h * 0.7, 32),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.18, toneMapped: false })
  );
  m.add(core);
  m.userData.pulse = (t) => { m.material.opacity = 0.25 + Math.sin(t * 6) * 0.1; };
  return m;
}

/* ---------------- 로봇 암 ---------------- */
// setPose(baseRot, a1, a2) 로 포즈 제어, endEffector에 웨이퍼 부착 가능
export function makeRobotArm({ reach = 1.1 } = {}) {
  const grp = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.5, 24), MAT.paint(0xc8cfdc));
  base.position.y = 0.25;
  grp.add(base);
  const pivot = new THREE.Group(); pivot.position.y = 0.55; grp.add(pivot);
  const seg1 = new THREE.Mesh(new THREE.BoxGeometry(reach * 0.55, 0.1, 0.18), MAT.paint(0xaab3c4));
  seg1.position.x = reach * 0.275;
  pivot.add(seg1);
  const joint2 = new THREE.Group(); joint2.position.set(reach * 0.55, 0.09, 0); pivot.add(joint2);
  const seg2 = new THREE.Mesh(new THREE.BoxGeometry(reach * 0.5, 0.08, 0.15), MAT.paint(0xc8cfdc));
  seg2.position.x = reach * 0.25;
  joint2.add(seg2);
  const ee = new THREE.Group(); ee.position.set(reach * 0.5, 0.06, 0); joint2.add(ee);
  const fork = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.02, 0.26), MAT.dark(0x39415a));
  ee.add(fork);
  shadow(grp);
  grp.userData.setPose = (baseRot, a1, a2) => {
    grp.rotation.y = baseRot;
    pivot.rotation.y = a1;
    joint2.rotation.y = a2;
  };
  grp.userData.endEffector = ee;
  return grp;
}

/* ---------------- 라벨 스프라이트 ---------------- */
export function makeLabel(text, { color = '#ff5a2a', size = 0.5 } = {}) {
  const cv = document.createElement('canvas');
  const g = cv.getContext('2d');
  const font = '700 42px Pretendard, "Malgun Gothic", sans-serif';
  g.font = font;
  const w = Math.ceil(g.measureText(text).width) + 48;
  cv.width = w; cv.height = 80;
  g.font = font;
  g.fillStyle = 'rgba(11,14,20,.82)';
  g.beginPath(); g.roundRect(0, 8, w, 64, 16); g.fill();
  g.strokeStyle = color; g.lineWidth = 3; g.stroke();
  g.fillStyle = '#e8ecf4'; g.textBaseline = 'middle';
  g.fillText(text, 24, 42);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  sp.scale.set(size * (w / 80), size, 1);
  sp.renderOrder = 10;
  return sp;
}

/* ---------------- 파티클 스트림 ---------------- */
// 위→아래로 떨어지는 입자(증착/이온주입/세정 표현). tick(t)로 애니메이션.
export function makeParticleStream({ count = 120, area = 0.5, yTop = 1.9, yBottom = 1.05, color = 0xffd166, size = 0.025 } = {}) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const speed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * area * 2;
    pos[i * 3 + 1] = yBottom + Math.random() * (yTop - yBottom);
    pos[i * 3 + 2] = (Math.random() - 0.5) * area * 2;
    speed[i] = 0.4 + Math.random() * 0.8;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({
    color, size, transparent: true, opacity: 0.9, toneMapped: false,
  }));
  pts.userData.tick = (dt) => {
    const p = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      p[i * 3 + 1] -= speed[i] * dt;
      if (p[i * 3 + 1] < yBottom) {
        p[i * 3 + 1] = yTop;
        p[i * 3] = (Math.random() - 0.5) * area * 2;
        p[i * 3 + 2] = (Math.random() - 0.5) * area * 2;
      }
    }
    geo.attributes.position.needsUpdate = true;
  };
  return pts;
}

/* ---------------- 칩/다이 ---------------- */
export function makeDie({ w = 0.5, d = 0.35, h = 0.05, color = 0x474f66 } = {}) {
  const die = new THREE.Mesh(new THREE.BoxGeometry(w, h, d),
    new THREE.MeshPhysicalMaterial({ color, metalness: 0.8, roughness: 0.2, clearcoat: 1 }));
  die.castShadow = true;
  return die;
}

// 로드포트 (FOUP 거치대)
export function makeLoadPort() {
  const grp = new THREE.Group();
  const table = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 1.0), MAT.steel(0x828da3));
  table.position.y = 0.9;
  grp.add(table);
  const leg = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.9, 0.8), MAT.paint(0xc8cfdc));
  leg.position.y = 0.45;
  grp.add(leg);
  const foup = makeFoup();
  foup.position.y = 0.94;
  foup.scale.setScalar(0.85);
  grp.add(foup);
  grp.userData.foup = foup;
  return shadow(grp);
}
