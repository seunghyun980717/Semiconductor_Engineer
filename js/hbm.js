// HBM 심화 페이지 — 12단 적층 / TSV / MR-MUF / 2.5D 패키징 인터랙티브 3D
import * as THREE from 'three';
import { renderNav } from './data/processes-index.js';
import { initScene } from './lib/three-core.js';
import { MAT, pick, shadow, makeLabel, makeBeam, makePedestal } from './lib/equip-kit.js';

renderNav('hbm');

/* ================= 학습 콘텐츠 ================= */
const STEPS = [
  { name: '전체 구조', desc: 'HBM 스택(base die + core die 12단)이 실리콘 인터포저 위에서 GPU와 나란히 결합된 2.5D 구조입니다. 분해도 슬라이더로 내부를 살펴보세요.', camera: { pos: [7, 5.5, 9], target: [0, 1.5, 0] } },
  { name: 'TSV 형성', desc: '딥 실리콘 식각(Lam Syndion) → 절연 라이너 → 배리어/시드 → 구리 전기도금(SABRE 3D) → CMP. 우측 확대 모델에서 TSV 단면 구조를 확인하세요.', camera: { pos: [-6.5, 3, 1.5], target: [-4.8, 1.6, -1.6] } },
  { name: '웨이퍼 박막화', desc: '캐리어 웨이퍼에 임시 접합 후 DISCO 그라인더로 이면을 30~50µm까지 연마합니다. 12단이면 다이 두께가 머리카락의 절반 이하가 됩니다.', camera: { pos: [-6.5, 3.5, 4.5], target: [-4.8, 1.0, 1.6] } },
  { name: '마이크로 범프', desc: '다이 상·하면에 Cu 필러 + Sn-Ag 솔더 캡의 마이크로 범프를 형성합니다. HBM4의 2048 I/O는 더 좁은 범프 피치를 요구합니다. 분해도로 다이 사이 범프를 확인하세요.', camera: { pos: [6.5, 3.5, 0.5], target: [4.8, 1.4, -1.6] } },
  { name: '칩 적층 & Mass Reflow', desc: '한미반도체 TC본더로 다이를 12단 가적층한 뒤, 매스 리플로우로 전체 솔더를 한 번에 용융 접합합니다. 다이가 순서대로 적층되는 과정을 보세요.', camera: { pos: [-3.5, 4, 5], target: [-1.6, 1.8, 0] } },
  { name: 'MR-MUF 몰딩', desc: '액상 보호재(EMC)가 모세관 현상으로 다이 사이 갭을 채우며 차오릅니다. 갭필·방열·자기정렬이 우수한 SK하이닉스 독자 기술로, 12단부터는 Advanced MR-MUF가 적용됩니다.', camera: { pos: [-3.5, 3.5, 4.5], target: [-1.6, 1.8, 0] } },
  { name: '2.5D 패키징 (CoWoS)', desc: '완성된 HBM 스택은 TSMC CoWoS 공정으로 실리콘 인터포저 위에서 GPU와 초고밀도 연결됩니다. 수천 개 I/O가 인터포저 미세 배선을 통해 데이터를 주고받습니다.', camera: { pos: [8, 6, 10], target: [0.5, 1.2, 0] } },
];

const TABS = {
  structure: `
    <h4>HBM 적층 구조</h4>
    <p><b>Base die(베이스 다이)</b> — 스택 최하단의 로직 다이. TSV로 올라오는 신호를 GPU와 인터페이스하고, TSV 리페어·테스트(DFT)·ESD 보호 회로를 담당합니다. HBM3E까지는 SK하이닉스 자체 공정, <b>HBM4부터는 TSMC 로직 공정(12nm급)</b>으로 전환됩니다.</p>
    <p><b>Core die(코어 다이)</b> — 실제 데이터를 저장하는 DRAM 다이. SK하이닉스 10나노급(1b/1c) 공정으로 제작되며 8/12/16장이 수직 적층됩니다. 최상단 다이는 신호가 관통할 필요가 없어 TSV가 없습니다.</p>
    <h4>TSV (Through-Silicon Via)</h4>
    <p>다이를 수직 관통하는 구리 전극. 수 µm 직경, 수십 µm 깊이의 고종횡비 홀에 절연 라이너(SiO₂) → 배리어(Ti/TiN/Ta) → Cu 시드 → 전기도금 충전 순으로 형성합니다. 신호·전원·접지가 스택 전체를 관통해 전달됩니다.</p>
    <h4>I/O 구성</h4>
    <table class="spec-table">
      <tr><th>세대</th><th>I/O 폭</th><th>의미</th></tr>
      <tr><td>HBM3/3E</td><td>1024-bit</td><td>8채널 × 128-bit</td></tr>
      <tr><td>HBM4</td><td><b>2048-bit</b></td><td>범프·배선 밀도 2배 → 로직 파운드리 base die 필요</td></tr>
    </table>
    <p style="font-size:12px;color:var(--dim)">💡 3D에서 다이·범프·TSV·몰드를 클릭하면 부품 설명이 표시됩니다.</p>`,
  generations: `
    <h4>HBM 세대별 진화</h4>
    <table class="spec-table gen-table">
      <tr><th>구분</th><th>HBM3</th><th>HBM3E</th><th>HBM4</th></tr>
      <tr><td>I/O</td><td>1024-bit</td><td>1024-bit</td><td>2048-bit</td></tr>
      <tr><td>스택 대역폭</td><td>~819GB/s</td><td>1.15~1.33TB/s</td><td>2TB/s+ (최대 3.3TB/s급)</td></tr>
      <tr><td>핀 속도</td><td>6.4Gbps</td><td>9.2~12.4Gbps</td><td>12.8Gbps+</td></tr>
      <tr><td>최대 적층</td><td>8-Hi</td><td>12-Hi (36GB)</td><td>12/16-Hi (최대 64GB급)</td></tr>
      <tr><td>본딩</td><td>MR-MUF</td><td>Adv. MR-MUF (12단)</td><td>Adv. MR-MUF (16단까지)</td></tr>
      <tr><td>Base die</td><td>자체 공정</td><td>자체 공정</td><td>TSMC 12nm급 (3nm 검토)</td></tr>
      <tr><td>전력</td><td>—</td><td>—</td><td>1.05V, 효율 최대 60% 개선</td></tr>
    </table>
    <h4>HBM4의 산업 구조 변화</h4>
    <p>2048-bit I/O와 고속 PHY·리페어 로직을 좁은 면적에 구현하려면 메모리 공정보다 로직 파운드리 미세공정이 유리합니다. SK하이닉스-TSMC 공식 파트너십으로 <b>메모리사 + 파운드리 협업 구조</b>로 재편되고 있으며, 엔비디아향 HBM4는 1b DRAM 코어 + TSMC N12 로직 다이 조합으로 알려져 있습니다.</p>
    <p>발열 대응으로는 열 관리 효율을 높인 <b>iHBM</b> 기술이 공개되어 차세대 제품에 적용될 예정입니다.</p>`,
  bonding: `
    <h4>SK하이닉스 MR-MUF vs 삼성 TC-NCF</h4>
    <table class="spec-table">
      <tr><th>항목</th><th>MR-MUF (SK하이닉스)</th><th>TC-NCF (삼성)</th></tr>
      <tr><td>접합</td><td>전체 가적층 후 매스 리플로우 일괄 용융</td><td>NCF 필름 + 열압착으로 1장씩 순차</td></tr>
      <tr><td>충전재</td><td>액상 EMC를 모세관 주입 (갭필 우수)</td><td>비전도성 필름(NCF)</td></tr>
      <tr><td>생산성</td><td>적층 수 늘어도 스텝 증가 적음</td><td>다이 수만큼 압착 반복</td></tr>
      <tr><td>휨/방열</td><td>휨 응력·방열 개선 (고방열 EMC)</td><td>필름 불균일·warpage 관리 어려움</td></tr>
    </table>
    <p>액체 몰딩재가 굳는 과정에서 다이가 <b>자기 정렬(self-align)</b>되는 효과도 MR-MUF의 강점입니다. 12단부터는 소재·공정을 고도화한 <b>Advanced MR-MUF</b>가 적용되며, 16단 HBM4까지 유지될 예정입니다.</p>
    <h4>하이브리드 본딩 (차세대)</h4>
    <p>범프 없이 Cu 패드를 직접 접합(Cu-Cu)하는 기술. 피치 10µm 이하, 스택 높이·열저항 대폭 감소가 가능하지만 수율·정렬 난제로 도입이 지연되고 있습니다. SK하이닉스는 <b>20단급부터 적용</b> 방침이며, 업계는 HBM5 시대(2029~30년)를 실질 전환점으로 봅니다. 장비는 BESI, 한미반도체(2세대 하이브리드 본더)가 준비 중입니다.</p>`,
  supply: `
    <h4>HBM 공정별 핵심 장비</h4>
    <div class="equip-item"><b>TSV 딥실리콘 식각</b><span class="vendor">Lam Research Syndion</span><p>고종횡비 비아 식각 전용. 램리서치가 삼성·SK 양사에 사실상 독점 공급.</p></div>
    <div class="equip-item"><b>TSV 구리 도금</b><span class="vendor">Lam Research SABRE 3D</span><p>전기도금(ECP)으로 비아 내부를 구리로 충전.</p></div>
    <div class="equip-item"><b>웨이퍼 박막화</b><span class="vendor">DISCO / Accretech / ASMPT</span><p>백그라인더·다이싱쏘·레이저쏘 시장을 DISCO가 주도. 30~50µm(16단은 20~60µm)까지 연마.</p></div>
    <div class="equip-item"><b>TC 본더 (적층)</b><span class="vendor">한미반도체</span><p>HBM용 TC본더 시장점유율 71.2% 1위 (대당 약 30억원). 한화세미텍도 SK하이닉스향 공급 확대 중. 고적층 대응 '와이드 TC본더' 개발.</p></div>
    <div class="equip-item"><b>2.5D 패키징</b><span class="vendor">TSMC CoWoS</span><p>로직+HBM을 실리콘 인터포저에 집적. CoWoS-L은 최대 12개 HBM 스택 지원. 공급 병목으로 SK하이닉스는 인텔 EMIB도 검토, 미국에 39억 달러 규모 2.5D 패키징 공장 계획.</p></div>`,
  defects: `
    <h4>HBM 대표 불량 & 품질 관리</h4>
    <div class="defect-item"><b>⚠ TSV 보이드 (Cu Fill Void)</b>
      <div class="row"><span class="k">시그니처</span><span class="v">TSV 저항 상승·산포 증가, 특정 웨이퍼 존 집중</span></div>
      <div class="row"><span class="k">원인</span><span class="v">도금액 첨가제 열화, 시드층 불연속, 고종횡비 홀 바닥 충전 부족</span></div>
      <div class="row"><span class="k">조치</span><span class="v">도금액 교체·분석, 시드 스퍼터 조건 보정, X-ray/SAT 검사 강화</span></div></div>
    <div class="defect-item"><b>⚠ 범프 Non-wet (미접합)</b>
      <div class="row"><span class="k">시그니처</span><span class="v">적층 후 특정 채널 오픈 불량, 데이지체인 저항 무한대</span></div>
      <div class="row"><span class="k">원인</span><span class="v">솔더 산화, 리플로우 온도 프로파일 이상, 다이 휨으로 인한 갭 편차</span></div>
      <div class="row"><span class="k">조치</span><span class="v">플럭스/분위기 관리, 리플로우 프로파일 재설정, 휨 보정</span></div></div>
    <div class="defect-item"><b>⚠ 적층 Warpage (휨)</b>
      <div class="row"><span class="k">시그니처</span><span class="v">적층 후 휨 측정치 상승 트렌드, 가장자리 범프 접합 불량 동반</span></div>
      <div class="row"><span class="k">원인</span><span class="v">박막 다이 응력, 몰드-실리콘 열팽창계수(CTE) 차이, 경화 조건</span></div>
      <div class="row"><span class="k">조치</span><span class="v">EMC 소재 변경(Advanced MR-MUF), 경화 프로파일 최적화</span></div></div>
    <div class="defect-item"><b>⚠ 언더필/몰드 보이드</b>
      <div class="row"><span class="k">시그니처</span><span class="v">SAT(초음파) 검사에서 공극 영상, 신뢰성 시험 후 크랙</span></div>
      <div class="row"><span class="k">원인</span><span class="v">몰드 주입 속도/점도 이상, 갭 협소부 기포 트랩</span></div>
      <div class="row"><span class="k">조치</span><span class="v">주입 조건·진공 탈포 최적화, 소재 점도 관리</span></div></div>
    <p style="margin-top:14px"><a class="btn small" href="spotfire.html?proc=hbm">📊 Spotfire에서 HBM 공정 데이터 실습하기</a></p>`,
};

/* ================= 3D 구성 ================= */
const ctx = initScene(document.getElementById('viewport'), {
  cameraPos: STEPS[0].camera.pos, target: STEPS[0].camera.target,
});
ctx.renderer.localClippingEnabled = true;
const clipPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
const clippable = []; // 단면 보기 대상 재질

const world = new THREE.Group();
ctx.scene.add(world);
ctx.setPickRoot(world);

/* ---- 패키지 기판 & 인터포저 & GPU ---- */
const substrate = new THREE.Mesh(new THREE.BoxGeometry(8, 0.3, 5.4),
  new THREE.MeshStandardMaterial({ color: 0x1e4d33, metalness: 0.2, roughness: 0.7 }));
substrate.position.y = 0.15;
pick(substrate, '패키지 기판 (Substrate)', '인터포저를 PCB와 연결하는 유기 기판. 하부에 BGA 솔더볼이 배열됩니다.');
world.add(shadow(substrate));

const interposer = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.16, 3.6), MAT.silicon());
interposer.position.y = 0.38;
pick(interposer, '실리콘 인터포저', '미세 배선층을 가진 수동 실리콘 기판. GPU와 HBM 사이 수천 개 I/O를 초고밀도로 연결합니다 (TSMC CoWoS의 핵심).');
world.add(shadow(interposer));

const gpu = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.35, 2.3),
  new THREE.MeshPhysicalMaterial({ color: 0x2b3550, metalness: 0.85, roughness: 0.2, clearcoat: 1 }));
gpu.position.set(1.7, 0.64, 0);
pick(gpu, 'GPU / AI 가속기 로직 다이', 'HBM의 데이터를 소비하는 연산 칩. 인터포저를 통해 HBM 스택과 1024~2048-bit로 연결됩니다.');
world.add(shadow(gpu));
const gpuLabel = makeLabel('GPU', { color: '#58a6ff', size: 0.4 });
gpuLabel.position.set(1.7, 1.5, 0);
world.add(gpuLabel);

/* ---- HBM 스택 (12-Hi) ---- */
const LAYERS = 12;
const DIE_W = 2.0, DIE_D = 1.7, DIE_H = 0.1, GAP = 0.08;
const STACK_X = -1.6, STACK_BASE = 0.46;

const stack = new THREE.Group();
stack.position.set(STACK_X, 0, 0);
world.add(stack);

// base die
const baseDieMat = new THREE.MeshPhysicalMaterial({ color: 0x33415f, metalness: 0.85, roughness: 0.2, clearcoat: 1, clipShadows: true });
clippable.push(baseDieMat);
const baseDie = new THREE.Mesh(new THREE.BoxGeometry(DIE_W + 0.15, 0.14, DIE_D + 0.15), baseDieMat);
baseDie.position.y = STACK_BASE + 0.07;
pick(baseDie, 'Base Die (로직 다이)', 'TSV 신호를 GPU와 인터페이스하는 로직 다이. 리페어·테스트 회로 포함. HBM4부터 TSMC 12nm급 공정으로 제작됩니다.');
stack.add(shadow(baseDie));

// core die 그룹들
const dieGroups = [];
const coreMat = new THREE.MeshPhysicalMaterial({ color: 0x4a5877, metalness: 0.85, roughness: 0.22, clearcoat: 1 });
const topMat = new THREE.MeshPhysicalMaterial({ color: 0x5a6a8e, metalness: 0.85, roughness: 0.22, clearcoat: 1 });
clippable.push(coreMat, topMat);

// 범프 격자 (8×6), TSV 격자 (중앙 8×2)
const bumpGeo = new THREE.SphereGeometry(0.021, 8, 8);
const tsvGeo = new THREE.CylinderGeometry(0.014, 0.014, DIE_H + GAP, 8);
const bumpMat = MAT.copper();
const tsvMat = new THREE.MeshStandardMaterial({ color: 0xd98a4a, metalness: 0.95, roughness: 0.3, emissive: 0xd96a2a, emissiveIntensity: 0 });

for (let i = 0; i < LAYERS; i++) {
  const g = new THREE.Group();
  const isTop = i === LAYERS - 1;
  const die = new THREE.Mesh(new THREE.BoxGeometry(DIE_W, DIE_H, DIE_D), isTop ? topMat : coreMat);
  die.castShadow = true;
  pick(die, isTop ? `Core Die #${i + 1} (최상단)` : `Core Die #${i + 1} (DRAM)`,
    isTop ? '최상단 DRAM 다이 — 신호가 관통할 필요가 없어 TSV가 없습니다.'
      : 'SK하이닉스 10나노급(1b) 공정 DRAM 다이. 30~50µm로 박막화되어 있으며 TSV가 관통합니다.');
  g.add(die);

  // 마이크로 범프 (다이 하부)
  const bumps = new THREE.InstancedMesh(bumpGeo, bumpMat, 48);
  const m = new THREE.Matrix4();
  let bi = 0;
  for (let bx = 0; bx < 8; bx++) for (let bz = 0; bz < 6; bz++) {
    m.setPosition((bx - 3.5) * (DIE_W / 8.4), -DIE_H / 2 - GAP / 2, (bz - 2.5) * (DIE_D / 6.4));
    bumps.setMatrixAt(bi++, m);
  }
  g.add(bumps);

  // TSV (최상단 제외, 다이 중앙부 관통)
  if (!isTop) {
    const tsv = new THREE.InstancedMesh(tsvGeo, tsvMat, 16);
    let ti = 0;
    for (let tx = 0; tx < 8; tx++) for (let tz = 0; tz < 2; tz++) {
      m.setPosition((tx - 3.5) * (DIE_W / 9), GAP / 2, (tz - 0.5) * 0.28);
      tsv.setMatrixAt(ti++, m);
    }
    g.add(tsv);
  }
  stack.add(g);
  dieGroups.push(g);
}

// MR-MUF 몰드
const mufMat = new THREE.MeshPhysicalMaterial({
  color: 0x2a3040, metalness: 0.15, roughness: 0.4, transparent: true, opacity: 0.5,
});
clippable.push(mufMat);
const stackH = LAYERS * (DIE_H + GAP) + 0.06;
const muf = new THREE.Mesh(new THREE.BoxGeometry(DIE_W + 0.15, 1, DIE_D + 0.15), mufMat);
pick(muf, 'MR-MUF 몰드 (EMC)', '액상으로 주입되어 다이 사이 갭을 채우고 경화되는 보호·방열재. SK하이닉스 독자 기술로 갭필·방열·자기정렬이 우수합니다.');
muf.castShadow = true;
stack.add(muf);

const hbmLabel = makeLabel('HBM3E 12-Hi', { color: '#ff5a2a', size: 0.42 });
hbmLabel.position.set(STACK_X, 3.4, 0);
world.add(hbmLabel);

// 인터포저 연결 발광 라인 (2.5D 단계)
const linkBeams = new THREE.Group();
for (let i = 0; i < 5; i++) {
  const z = (i - 2) * 0.5;
  const b = makeBeam([STACK_X + 1.1, 0.49, z], [0.5, 0.49, z], { color: 0xff5a2a, radius: 0.018, opacity: 0.8 });
  linkBeams.add(b);
}
world.add(linkBeams);

/* ---- TSV 단면 확대 모델 (STEP 1) ---- */
const tsvCloseup = new THREE.Group();
tsvCloseup.position.set(-4.8, 0, -1.6);
{
  const pl = makePedestal({ r: 0.7, y: 0.5 });
  tsvCloseup.add(pl);
  // 실리콘 블록 (반단면)
  const si = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.6, 0.65), MAT.silicon());
  si.position.set(0, 1.4, -0.33);
  pick(si, '실리콘 기판 (확대 단면)', 'TSV가 관통하는 DRAM 다이의 실리콘. 실제 비아는 직경 수 µm, 깊이 수십 µm입니다.');
  tsvCloseup.add(shadow(si));
  // 라이너 (절연)
  const liner = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 1.62, 24, 1, false, 0, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0xdfe8ff, metalness: 0.1, roughness: 0.4, side: THREE.DoubleSide }));
  liner.position.set(0, 1.4, 0);
  pick(liner, '절연 라이너 (SiO₂)', '구리와 실리콘을 전기적으로 절연하는 산화막. CVD로 컨포멀하게 증착합니다.');
  tsvCloseup.add(liner);
  // 배리어
  const barrier = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 1.62, 24, 1, false, 0, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x4a4f66, metalness: 0.8, roughness: 0.35, side: THREE.DoubleSide }));
  barrier.position.set(0, 1.4, 0);
  pick(barrier, '배리어 층 (Ti/TiN/Ta)', '구리가 실리콘으로 확산되는 것을 막는 금속 배리어. 위에 Cu 시드층이 올라갑니다.');
  tsvCloseup.add(barrier);
  // Cu 코어
  const cu = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 1.62, 24), MAT.copper());
  cu.position.set(0, 1.4, 0);
  pick(cu, '구리 충전 (Cu Fill)', 'SABRE 3D 전기도금으로 비아를 완전히 채운 구리 전극. 보이드 없이 채우는 것이 핵심 난제입니다.');
  tsvCloseup.add(shadow(cu));
  const lb = makeLabel('TSV 단면 (확대)', { color: '#ff5a2a', size: 0.34 });
  lb.position.y = 2.7;
  tsvCloseup.add(lb);
}
world.add(tsvCloseup);

/* ---- 백그라인딩 스테이션 (STEP 2) ---- */
const grinder = new THREE.Group();
grinder.position.set(-4.8, 0, 1.6);
let wheel;
{
  const chuckBase = makePedestal({ r: 0.75, y: 0.55 });
  grinder.add(chuckBase);
  const thinWafer = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.02, 48), MAT.silicon());
  thinWafer.position.y = 0.66;
  pick(thinWafer, '박막화 중인 웨이퍼', '캐리어 웨이퍼에 임시 접합된 상태로 이면을 연마. 목표 두께 30~50µm — 종이보다 얇습니다.');
  grinder.add(thinWafer);
  wheel = new THREE.Group();
  const wheelDisk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.12, 40), MAT.steel(0x8a94a8));
  const grit = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.045, 10, 40),
    new THREE.MeshStandardMaterial({ color: 0x3aa76d, metalness: 0.4, roughness: 0.8 }));
  grit.rotation.x = Math.PI / 2;
  grit.position.y = -0.06;
  wheel.add(wheelDisk, grit);
  wheel.position.set(0.3, 0.78, 0);
  pick(wheel, '그라인딩 휠 (DISCO)', '다이아몬드 지립 휠이 고속 회전하며 웨이퍼 이면을 µm 단위로 연마합니다.');
  grinder.add(shadow(wheel));
  const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.0, 16), MAT.steel());
  spindle.position.set(0.3, 1.35, 0);
  grinder.add(shadow(spindle));
  const lb = makeLabel('백그라인딩', { color: '#8ab4ff', size: 0.34 });
  lb.position.y = 2.3;
  grinder.add(lb);
}
world.add(grinder);

/* ---- 마이크로 범프 확대 모델 (STEP 3) ---- */
const bumpCloseup = new THREE.Group();
bumpCloseup.position.set(4.8, 0, -1.6);
{
  const pl = makePedestal({ r: 0.7, y: 0.5 });
  bumpCloseup.add(pl);
  const pad = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.12, 0.9), MAT.silicon());
  pad.position.y = 1.0;
  pick(pad, '다이 표면 (확대)', '마이크로 범프가 형성되는 다이 표면. UBM(Under Bump Metallurgy) 위에 범프가 올라갑니다.');
  bumpCloseup.add(shadow(pad));
  for (let i = 0; i < 3; i++) {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.42, 20), MAT.copper());
    pillar.position.set((i - 1) * 0.42, 1.27, 0);
    pick(pillar, 'Cu 필러', '도금으로 형성한 구리 기둥. 좁은 피치에서도 쇼트 없이 높이를 확보합니다.');
    bumpCloseup.add(shadow(pillar));
    const solder = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 12), MAT.steel(0xd8dde8));
    solder.scale.y = 0.7;
    solder.position.set((i - 1) * 0.42, 1.53, 0);
    pick(solder, 'Sn-Ag 솔더 캡', '리플로우 시 용융되어 상대 다이 패드와 접합되는 솔더. 산화되면 non-wet 불량이 발생합니다.');
    bumpCloseup.add(shadow(solder));
  }
  const lb = makeLabel('마이크로 범프 (확대)', { color: '#ffd166', size: 0.34 });
  lb.position.y = 2.4;
  bumpCloseup.add(lb);
}
world.add(bumpCloseup);

/* ================= 상태 & 애니메이션 ================= */
const state = {
  step: 0,
  explode: 0,        // UI 슬라이더 (0~1)
  explodeTarget: 0,
  stackProgress: LAYERS, // 쌓인 다이 수 (적층 단계에서 애니메이션)
  stacking: false,
  mufLevel: 1,       // 0~1
  mufTarget: 1,
  tsvGlow: 0,
};

function applyStep(i) {
  state.step = i;
  tsvCloseup.visible = i === 1;
  grinder.visible = i === 2;
  bumpCloseup.visible = i === 3;
  linkBeams.visible = i === 0 || i === 6;
  gpu.visible = gpuLabel.visible = true;
  state.tsvGlow = i === 1 ? 1 : 0;
  state.stacking = false;

  if (i === 3) state.explodeTarget = Math.max(state.explodeTarget, 0.45);
  else if (i !== 0) state.explodeTarget = 0;

  if (i === 4) { // 적층 애니메이션 시작
    state.stackProgress = 0;
    state.stacking = true;
    state.mufTarget = 0;
  } else {
    state.stackProgress = LAYERS;
    state.mufTarget = (i === 5 || i === 6 || i === 0) ? 1 : 0;
  }
  if (i === 5) { state.mufLevel = 0; } // 몰딩 차오르는 연출 재시작
}

ctx.onTick((t, dt) => {
  // 분해도/몰드 부드럽게
  state.explode += (state.explodeTarget - state.explode) * Math.min(dt * 4, 1);
  state.mufLevel += (state.mufTarget - state.mufLevel) * Math.min(dt * (state.step === 5 ? 0.9 : 4), 1);

  // 적층 진행
  if (state.stacking) {
    state.stackProgress = Math.min(LAYERS, state.stackProgress + dt * 2.2);
    if (state.stackProgress >= LAYERS) state.stacking = false;
  }

  // 다이 배치
  const spread = 1 + state.explode * 2.6;
  dieGroups.forEach((g, i) => {
    const built = state.stackProgress - i;
    g.visible = built > 0;
    const targetY = STACK_BASE + 0.14 + GAP / 2 + DIE_H / 2 + i * (DIE_H + GAP) * spread;
    const drop = built < 1 ? (1 - Math.max(built, 0)) * 1.8 : 0;
    g.position.y = targetY + drop;
  });

  // MUF 크기/위치 (다이 스택 감싸기, 분해 시 숨김)
  const visH = stackH * Math.max(state.mufLevel, 0.001);
  muf.visible = state.mufLevel > 0.02 && state.explode < 0.05;
  muf.scale.y = visH;
  muf.position.y = STACK_BASE + 0.14 + visH / 2;

  // TSV 발광 펄스
  tsvMat.emissiveIntensity = state.tsvGlow * (1.2 + Math.sin(t * 5) * 0.8);

  // 그라인더 휠 회전
  if (grinder.visible && wheel) wheel.rotation.y += 12 * dt;

  // 링크 빔 펄스
  if (linkBeams.visible) linkBeams.children.forEach((b, i) => {
    b.material.opacity = 0.4 + Math.sin(t * 4 + i) * 0.3;
  });
});

/* ================= UI 바인딩 ================= */
document.getElementById('veil').classList.add('hide');

// 부품 툴팁
const tip = document.getElementById('part-tip');
const vpWrap = document.querySelector('.viewport-wrap');
ctx.onHover((hit, e) => {
  if (!hit) { tip.style.display = 'none'; return; }
  const { name, desc } = hit.userData.pick;
  tip.innerHTML = `<b>${name}</b><span>${desc}</span>`;
  tip.style.display = 'block';
  const r = vpWrap.getBoundingClientRect();
  tip.style.left = Math.min(e.clientX - r.left + 14, r.width - 270) + 'px';
  tip.style.top = Math.min(e.clientY - r.top + 14, r.height - 90) + 'px';
});
ctx.onClick(hit => {
  if (hit) document.getElementById('hud-chip-text').textContent =
    `${hit.userData.pick.name} — ${hit.userData.pick.desc}`;
});

// 컨트롤
document.getElementById('explode').addEventListener('input', e => {
  state.explodeTarget = e.target.value / 100;
});
document.getElementById('cutaway').addEventListener('change', e => {
  const planes = e.target.checked ? [clipPlane] : [];
  clippable.forEach(m => { m.clippingPlanes = planes; m.needsUpdate = true; });
});

// 스텝 플레이어
let playing = false, playTimer = null;
const spTitle = document.getElementById('sp-title');
const spDesc = document.getElementById('sp-desc');
const dots = document.getElementById('step-dots');
function renderStep() {
  const s = STEPS[state.step];
  spTitle.textContent = `STEP ${state.step + 1}/${STEPS.length} · ${s.name}`;
  spDesc.textContent = s.desc;
  dots.innerHTML = STEPS.map((_, i) =>
    `<i class="${i < state.step ? 'done' : i === state.step ? 'on' : ''}" data-i="${i}"></i>`).join('');
  applyStep(state.step);
  if (s.camera) ctx.flyTo(s.camera.pos, s.camera.target);
}
dots.addEventListener('click', e => {
  if (e.target.dataset?.i !== undefined) { state.step = +e.target.dataset.i; renderStep(); }
});
document.getElementById('sp-prev').onclick = () => { state.step = Math.max(0, state.step - 1); renderStep(); };
document.getElementById('sp-next').onclick = () => { state.step = Math.min(STEPS.length - 1, state.step + 1); renderStep(); };
const playBtn = document.getElementById('sp-play');
playBtn.onclick = () => {
  playing = !playing;
  playBtn.textContent = playing ? '⏸' : '▶';
  clearInterval(playTimer);
  if (playing) playTimer = setInterval(() => { state.step = (state.step + 1) % STEPS.length; renderStep(); }, 6000);
};

// 탭
const tabBody = document.getElementById('tab-body');
function showTab(key) {
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === key));
  tabBody.innerHTML = TABS[key];
}
document.getElementById('tabs').addEventListener('click', e => {
  if (e.target.dataset?.tab) showTab(e.target.dataset.tab);
});
showTab('structure');
renderStep();
