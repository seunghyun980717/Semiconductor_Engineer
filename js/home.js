// 홈 — 3D 공정 여정 오버뷰: 8개 스테이션 + 중앙 HBM 스택
import * as THREE from 'three';
import { PROCESSES, HBM, renderNav } from './data/processes-index.js';
import { initScene } from './lib/three-core.js';
import { MAT, pick, shadow, makeWafer, makeBareWafer, makeChamber, makePlasmaGlow, makeBeam, makeLabel, makeParticleStream } from './lib/equip-kit.js';

renderNav('home');

// ---- 공정 카드 ----
document.getElementById('proc-cards').innerHTML = PROCESSES.map(p => `
  <a class="proc-card" href="process.html?id=${p.id}" style="--pc:${p.color}">
    <div class="num">PROCESS ${String(p.num).padStart(2, '0')}</div>
    <h3>${p.title}</h3>
    <div class="en">${p.en}</div>
    <p>${p.desc}</p>
    <div class="equip">🏭 ${p.equip}</div>
  </a>`).join('') + `
  <a class="proc-card" href="hbm.html" style="--pc:${HBM.color}">
    <div class="num">SPECIAL</div>
    <h3>★ ${HBM.title}</h3>
    <div class="en">${HBM.en}</div>
    <p>${HBM.desc}</p>
    <div class="equip">🏭 ${HBM.equip}</div>
  </a>`;

// ---- 3D 여정 ----
// 히어로 텍스트(좌측)와 겹치지 않도록 3D 씬을 화면 우측으로 오프셋
const wide = window.innerWidth > 980;
const ctx = initScene(document.getElementById('hero-canvas'), {
  cameraPos: [wide ? -4.2 : 0, 9.5, 15.5],
  target: [wide ? -4.2 : 0, 0.8, 0],
});
// 홈에서는 휠을 페이지 스크롤에 양보 (줌 비활성화 — 회전/클릭은 유지)
ctx.controls.enableZoom = false;
const world = new THREE.Group();
ctx.scene.add(world);
ctx.setPickRoot(world);

// 중앙: 회전하는 HBM 스택
const hbmGroup = new THREE.Group();
const baseDie = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 1.6),
  new THREE.MeshPhysicalMaterial({ color: 0x2f3a55, metalness: 0.8, roughness: 0.25, clearcoat: 1 }));
baseDie.position.y = 1.0;
hbmGroup.add(shadow(baseDie));
for (let i = 0; i < 8; i++) {
  const die = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.07, 1.35),
    new THREE.MeshPhysicalMaterial({ color: 0x47536e, metalness: 0.85, roughness: 0.2, clearcoat: 1 }));
  die.position.y = 1.13 + i * 0.13;
  hbmGroup.add(shadow(die));
  // 마이크로 범프
  for (let bx = -2; bx <= 2; bx++) for (let bz = -2; bz <= 2; bz++) {
    if (Math.abs(bx) + Math.abs(bz) > 3) continue;
    const bump = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), MAT.copper());
    bump.position.set(bx * 0.28, 1.065 + i * 0.13, bz * 0.28);
    hbmGroup.add(bump);
  }
}
// TSV 기둥 표현
for (let k = 0; k < 4; k++) {
  const tsv = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.1, 8), MAT.copper());
  tsv.position.set(k % 2 ? 0.5 : -0.5, 1.6, k < 2 ? 0.5 : -0.5);
  hbmGroup.add(tsv);
}
const hbmHalo = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.02, 12, 64),
  new THREE.MeshBasicMaterial({ color: 0xff5a2a, transparent: true, opacity: 0.6, toneMapped: false }));
hbmHalo.rotation.x = Math.PI / 2;
hbmHalo.position.y = 1.1;
hbmGroup.add(hbmHalo);
const hbmLabel = makeLabel('★ HBM — 클릭해서 심화 학습', { color: '#ff5a2a', size: 0.5 });
hbmLabel.position.y = 2.8;
hbmGroup.add(hbmLabel);
pick(hbmGroup, HBM.title, HBM.desc);
hbmGroup.userData.href = 'hbm.html';
world.add(hbmGroup);

// 8개 스테이션 (원형 배치)
const R = 6.2;
const minis = {
  wafer: () => { // 잉곳
    const g = new THREE.Group();
    const ingot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 1.1, 32), MAT.silicon());
    ingot.position.y = 0.75;
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.2, 0.3, 16), MAT.silicon());
    neck.position.y = 1.45;
    g.add(shadow(ingot), shadow(neck));
    const w = makeBareWafer(0.34, 0.03); w.position.set(0.55, 0.22, 0.2); g.add(w);
    return g;
  },
  oxidation: () => { // 산화로 튜브
    const g = new THREE.Group();
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.3, 24), MAT.glass(0xffb066, 0.4));
    tube.rotation.z = Math.PI / 2; tube.position.y = 0.7;
    const glowCore = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.1, 16), MAT.glow(0xff8844, 1.2));
    glowCore.rotation.z = Math.PI / 2; glowCore.position.y = 0.7;
    g.add(tube, glowCore);
    return g;
  },
  photo: () => { // 미니 스캐너
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.75, 0.7), MAT.paint());
    body.position.y = 0.55;
    g.add(shadow(body));
    g.add(makeBeam([0, 1.35, 0], [0, 0.95, 0], { color: 0xbb99ff, radius: 0.05 }));
    const ret = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.04, 0.34), MAT.glass(0x99ccff, 0.7));
    ret.position.y = 1.35; g.add(ret);
    const w = makeWafer(0.3, { tint: '#8877ff' }); w.position.y = 0.95; g.add(w);
    return g;
  },
  etch: () => { // 플라즈마 챔버
    const g = new THREE.Group();
    const ch = makeChamber({ r: 0.42, h: 0.6, y: 0.62 });
    g.add(ch);
    const pl = makePlasmaGlow({ r: 0.3, h: 0.3, color: 0xf472b6 });
    pl.position.y = 0.62; g.add(pl);
    g.userData.plasma = pl;
    return g;
  },
  deposition: () => { // 샤워헤드 + 입자
    const g = new THREE.Group();
    const ch = makeChamber({ r: 0.42, h: 0.6, y: 0.62 });
    g.add(ch);
    const ps = makeParticleStream({ count: 50, area: 0.22, yTop: 0.85, yBottom: 0.4, color: 0xa78bfa, size: 0.018 });
    g.add(ps);
    g.userData.ps = ps;
    return g;
  },
  metal: () => { // 배선 층 스택
    const g = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const layer = new THREE.Mesh(new THREE.BoxGeometry(0.7 - i * 0.06, 0.08, 0.7 - i * 0.06),
        i % 2 ? MAT.copper() : MAT.dark(0x39415a));
      layer.position.y = 0.3 + i * 0.14;
      g.add(shadow(layer));
    }
    return g;
  },
  eds: () => { // 프로브 카드 + 웨이퍼
    const g = new THREE.Group();
    const w = makeWafer(0.42, { tint: '#3ec9ff' }); w.position.y = 0.5; g.add(w);
    const card = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 24), MAT.paint(0x3a5a3a));
    card.position.y = 1.0; g.add(shadow(card));
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.002, 0.32, 6), MAT.gold());
      pin.position.set(Math.cos(a) * 0.16, 0.8, Math.sin(a) * 0.16);
      g.add(pin);
    }
    return g;
  },
  packaging: () => { // BGA 패키지
    const g = new THREE.Group();
    const sub = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.06, 0.85), MAT.paint(0x2a5a3a));
    sub.position.y = 0.4; g.add(shadow(sub));
    const mold = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.18, 0.7), MAT.plastic(0x1a1e2a));
    mold.position.y = 0.52; g.add(shadow(mold));
    for (let bx = -3; bx <= 3; bx++) for (let bz = -3; bz <= 3; bz++) {
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), MAT.steel(0xcfd6e4));
      ball.position.set(bx * 0.11, 0.35, bz * 0.11);
      g.add(ball);
    }
    return g;
  },
};

const spinners = [];
PROCESSES.forEach((p, i) => {
  const a = (i / PROCESSES.length) * Math.PI * 2 - Math.PI / 2;
  const st = new THREE.Group();
  st.position.set(Math.cos(a) * R, 0, Math.sin(a) * R);

  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.0, 0.22, 32),
    new THREE.MeshStandardMaterial({ color: 0x1a2234, metalness: 0.5, roughness: 0.5 }));
  pedestal.position.y = 0.11;
  st.add(shadow(pedestal));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.025, 10, 48),
    new THREE.MeshBasicMaterial({ color: p.color, toneMapped: false }));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.23;
  st.add(ring);

  const mini = minis[p.id]();
  mini.position.y = 0.22;
  st.add(mini);
  spinners.push(mini);

  const label = makeLabel(`${p.num}. ${p.title}`, { color: p.color, size: 0.36 });
  label.position.y = 2.15;
  st.add(label);

  pick(st, `${p.num}. ${p.title}`, p.desc + ' (클릭하면 상세 페이지로 이동)');
  st.userData.href = `process.html?id=${p.id}`;
  world.add(st);

  // 여정 화살표 (다음 스테이션으로)
  const a2 = ((i + 1) / PROCESSES.length) * Math.PI * 2 - Math.PI / 2;
  const mid = new THREE.Vector3(
    Math.cos((a + a2) / 2) * R * 1.02, 0.15, Math.sin((a + a2) / 2) * R * 1.02);
  const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.28, 10),
    new THREE.MeshBasicMaterial({ color: 0x3a4763, toneMapped: false }));
  arrow.position.copy(mid);
  arrow.rotation.x = Math.PI / 2;
  arrow.lookAt(Math.cos(a2) * R, 0.15, Math.sin(a2) * R);
  arrow.rotateX(Math.PI / 2);
  world.add(arrow);
});

// ---- 인터랙션 ----
const tooltip = document.getElementById('hero-tooltip');
const heroEl = document.querySelector('.hero');
ctx.onHover((hit, e) => {
  if (!hit) { tooltip.style.display = 'none'; return; }
  const { name, desc } = hit.userData.pick;
  tooltip.innerHTML = `<div class="tt-title">${name}</div><div class="tt-desc">${desc}</div>`;
  tooltip.style.display = 'block';
  const r = heroEl.getBoundingClientRect();
  tooltip.style.left = Math.min(e.clientX - r.left + 16, r.width - 300) + 'px';
  tooltip.style.top = (e.clientY - r.top + 16) + 'px';
});
ctx.onClick(hit => {
  if (hit?.userData.href) location.href = hit.userData.href;
});

// ---- 애니메이션 ----
ctx.onTick((t, dt) => {
  hbmGroup.rotation.y += 0.25 * dt;
  hbmHalo.scale.setScalar(1 + Math.sin(t * 2) * 0.03);
  world.children.forEach(c => { if (c.userData.plasma) c.userData.plasma.userData.pulse?.(t); });
  spinners.forEach(m => {
    m.userData.ps?.userData.tick(dt);
    m.userData.plasma?.userData.pulse?.(t);
  });
});
