// 패키징 공정 모듈 — 다이싱 소 + 다이본더 + 와이어본더 + 몰딩 프레스 + 솔더볼 마운트
// export 계약: camera / content / build3D(ctx) → { group, setStep(i), tick(t,dt) }
import * as THREE from 'three';
import {
  MAT, pick, shadow, makeWafer, makeCabinet, makePedestal, makeBeam,
  makeLabel, makeSignalTower, makeParticleStream, makeDie,
} from '../lib/equip-kit.js';

export const camera = { pos: [14, 8, 17], target: [0, 1.4, 0] };

export const content = {
  overview:
    '패키징은 EDS 테스트를 통과한 웨이퍼를 개별 칩(다이) 단위로 분리하고, 기판에 고정·배선한 뒤 외부 환경으로부터 보호하는 봉지재로 감싸 완제품 반도체로 만드는 후공정입니다. ' +
    '일반적으로 백그라인딩으로 웨이퍼 두께를 줄인 뒤, 다이싱 소로 낱개 칩으로 절단하고, 다이본더가 칩을 기판 위에 정밀 배치합니다. ' +
    '이어 와이어본더가 금/구리 와이어로 칩과 기판을 전기적으로 연결하거나, 고성능 제품은 플립칩 방식의 솔더 범프로 직접 접합합니다. ' +
    '배선이 끝난 조립체는 EMC(에폭시 몰딩 컴파운드)로 감싸 습기와 충격으로부터 보호하고, 마지막으로 레이저 마킹과 솔더볼 마운트를 거쳐 FBGA와 같은 완제품 패키지 형태를 갖춥니다. ' +
    'Disco의 다이싱·그라인딩 장비, ASMPT의 다이본더, K&S의 와이어본더 등 전문 장비업체들의 기술이 이 전 과정을 뒷받침합니다.',
  keyPoints: [
    '백그라인딩 → 다이싱 → 다이 어태치 → 와이어본딩/플립칩 → EMC 몰딩 → 마킹 → 솔더볼 마운트 순으로 진행',
    '블레이드 다이싱은 저비용이지만 소잉 라인 폭이 60~80μm로 다이 손실 발생, 스텔스 다이싱은 폭을 거의 0에 가깝게 줄여 다이 수율을 높임',
    '와이어본딩은 범용 메모리(FBGA 등)에, 플립칩은 고I/O·고성능 로직에 주로 사용',
    'DAF(Die Attach Film)는 에폭시 대비 두께 균일도가 뛰어나 적층 메모리 등 첨단 패키지에서 선호',
    'EMC 몰딩은 습기·충격·오염으로부터 칩을 보호하며, 고핀수/플립칩 패키지는 몰딩 전 언더필 공정이 추가됨',
    '솔더볼은 이후 PCB 표면실장(SMT) 시 전기적 접점이자 기계적 고정점 역할을 함',
  ],
  hbmNote:
    'HBM은 TSV로 다이를 수직 관통 연결해 12~16단까지 적층한 뒤 MR-MUF(Mass Reflow-Molded Underfill) 공정으로 한 번에 몰딩하는 SK하이닉스의 핵심 후공정 기술을 사용합니다. ' +
    'HBM4 세대에서도 마이크로범프 방식을 유지하며 구리-구리 하이브리드 본딩 전환은 차세대로 유보되는 추세이나, 스택 높이·열저항 개선 효과 때문에 2026~2027년 하이브리드 본딩 장비 투자가 크게 늘어날 전망입니다.',
  steps: [
    { name: '백그라인딩 (Back-Grinding)', desc: '다이아몬드 지석 휠로 웨이퍼 뒷면을 연삭해 두께를 줄입니다. TSV 구조에서는 비아를 노출시키는 정밀 마무리(CMP/식각)까지 이어집니다.', camera: { pos: [-9, 4.2, 7], target: [-6.8, 1.6, 1.0] } },
    { name: '다이싱 (Dicing)', desc: '회전하는 다이아몬드 블레이드가 웨이퍼를 격자형 소잉 라인을 따라 절단해 개별 다이로 분리합니다. 다이는 웨이퍼 링 프레임에 부착된 테이프 위에 정렬된 채 유지됩니다.', camera: { pos: [-8.5, 4, 6.5], target: [-6.8, 1.5, 1.3] } },
    { name: '다이 어태치 (Die Attach)', desc: '다이본더가 다이싱 테이프에서 다이를 픽업(진공 흡착)해 DAF/에폭시가 도포된 기판 위에 정밀 배치합니다.', camera: { pos: [-5, 4, 6], target: [-3.4, 1.5, 0.9] } },
    { name: '와이어 본딩 (Wire Bonding)', desc: '캐필러리가 금/구리 와이어를 다이 패드와 기판 리드 사이에 아치형으로 연결해 전기적 신호 경로를 완성합니다.', camera: { pos: [-1.5, 4, 6], target: [0, 1.5, 0.9] } },
    { name: 'EMC 몰딩 (Molding)', desc: '가열된 에폭시 몰딩 컴파운드를 금형에 주입해 다이와 와이어를 감싸 외부 충격·습기로부터 보호합니다.', camera: { pos: [2, 4, 6.5], target: [3.4, 1.5, 0.9] } },
    { name: '볼 마운트 & 마킹', desc: '기판 뒷면에 솔더볼을 격자로 부착(BGA)하고 레이저로 제품 정보를 마킹해 FBGA 완제품 패키지를 완성합니다.', camera: { pos: [6, 4.5, 7], target: [6.8, 1.7, 0.6] } },
  ],
  equipment: [
    { name: '다이싱 소 DAD3220', vendor: 'Disco', role: '다이아몬드 블레이드로 웨이퍼를 개별 다이로 절단. "자르다·깎다·닦다" 정밀가공 3대 기술을 핵심 역량으로 하는 세계적 리더.', spec: '블레이드 두께 수십 μm / 소잉 라인 폭 60~80μm' },
    { name: '백그라인더 DFG8540', vendor: 'Disco', role: '다이아몬드 지석 휠로 웨이퍼 뒷면을 연삭해 두께를 줄이고, TSV 구조에서는 비아 팁을 노출.', spec: 'Φ300mm 웨이퍼 완전자동 대응' },
    { name: '다이본더 AD-829', vendor: 'ASMPT (구 ASM Pacific Technology)', role: '다이싱 테이프에서 다이를 픽업해 기판/리드프레임 위에 정밀 배치(Pick & Place)하고 접착제를 경화.', spec: '픽업 정밀도 수 μm급' },
    { name: '와이어본더 iConn Apollo', vendor: 'K&S (Kulicke & Soffa)', role: '금/구리 와이어로 칩 패드와 기판 리드를 볼본딩(EFO)·웨지본딩 방식으로 연결.', spec: '와이어 직경 15~30μm, 초당 다수 와이어 본딩' },
    { name: '몰드 프레스 YSP', vendor: 'TOWA', role: 'EMC(에폭시 몰딩 컴파운드)를 가열·가압해 칩과 와이어를 압축성형(compression molding) 방식으로 봉지.', spec: '성형 온도 약 175°C' },
  ],
  parameters: [
    { name: '소잉 라인 폭 (Street Width)', typical: '블레이드 60~80μm / 스텔스 <10μm', monitor: '현미경 폭 측정, 웨이퍼당 다이 수 계산' },
    { name: '와이어 풀 강도 (Pull Strength)', typical: '와이어 직경별 규격 대비 ≥ 최소 관리치', monitor: '와이어 풀 테스트, 볼 전단(shear) 테스트' },
    { name: '몰드 컴파운드 보이드율', typical: '관리기준 <1% (목표 0%)', monitor: 'X-ray 검사, C-SAM(음향현미경)' },
    { name: '솔더볼 공면성 (Coplanarity)', typical: '≤ 100μm (볼피치에 따라 상이)', monitor: '3D 코플래너리티 스캐너' },
    { name: '백그라인딩 두께 균일도', typical: '완성 두께 ±5μm 이내 (TTV)', monitor: '접촉식/비접촉 두께게이지' },
  ],
  defects: [
    { name: '다이 크랙 (Die Crack)', signature: '최종 테스트에서 개방(open) 불량 급증, C-SAM/X-ray에서 다이 내부 크랙 라인 관찰', cause: '다이싱 기계적 응력, 박형 다이 핸들링 중 휨, 다이어태치 접착층 불균일에 의한 국소 응력', action: '스텔스 다이싱 등 저응력 공정 도입, DAF 균일 도포, 박형 다이 캐리어/스티프너 적용' },
    { name: '와이어 본딩 불량 (Wire Sweep/힐크랙)', signature: '와이어 풀 테스트/볼 전단 테스트 강도 미달, 몰딩 후 X-ray에서 와이어가 밀려 휘어진 형상(wire sweep) 관찰', cause: '본딩 파라미터(force/power/time) 불일치, 몰드 컴파운드 유동 압력 불균형, 본드패드 오염', action: '본딩 파라미터 정기 캘리브레이션, 몰드 게이트/벤트 설계 최적화, 본드패드 플라즈마 클린' },
    { name: '몰드 컴파운드 보이드 (Mold Void)', signature: 'X-ray/C-SAM에서 몰드 내부 기포 관찰, 와이어 밀집 영역·코너부에 집중', cause: '압축성형 시 불균형한 몰드 유동, EMC 흡습·아웃개싱, 경화 프로파일 부적절', action: '몰드 주입 속도/압력 최적화, 진공 몰딩, EMC 사전 베이크아웃 및 MSL 관리' },
    { name: '웨이퍼 워피지 (Backgrinding 후 Warpage)', signature: '박막화 후 웨이퍼 bow 측정치 급증, 후속 다이싱/이송 중 파손율 상승', cause: '박막화로 인한 강성 저하, 표면 응력 잔류, 임시 캐리어 지지 불충분', action: '임시 캐리어/캐리어 본딩 공정 최적화, 그라인딩 후 응력완화 CMP 스텝 추가' },
    { name: '솔더볼 Non-wet / 보이드', signature: '리플로우 후 X-ray/초음파 검사에서 볼 미접합 또는 내부 기포 관찰', cause: '플럭스 도포 불균일, 패드 산화막 잔류, 리플로우 온도 프로파일 부적절', action: '플럭스 도포량/균일도 관리, 패드 세정 강화, 리플로우 프로파일(피크온도·냉각속도) 재설정' },
  ],
};

export function build3D(ctx) {
  const group = new THREE.Group();

  function show(...o) { o.forEach(x => { x.visible = true; }); }
  function hide(...o) { o.forEach(x => { x.visible = false; }); }

  /* ================= 1. 다이싱 소 (Disco 스타일) x=-6.8 ================= */
  const dicer = new THREE.Group();
  dicer.position.set(-6.8, 0, 0);

  const dicerBody = makeCabinet({ w: 2.8, h: 2.2, d: 2.0, color: 0xf6e2e2 });
  pick(dicerBody, '다이싱 소 (Disco DAD3220)', '다이아몬드 블레이드로 웨이퍼를 개별 다이로 절단하는 장비. Disco는 자르다·깎다·닦다 정밀가공 기술의 세계적 리더입니다.');
  dicer.add(dicerBody);

  // 웨이퍼 링 프레임 (다이싱 테이프 고정용 스테인리스 링)
  const frameRing = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.045, 12, 48), MAT.steel(0x9aa4b5));
  frameRing.rotation.x = Math.PI / 2;
  frameRing.position.set(0, 1.3, 1.15);
  pick(frameRing, '웨이퍼 링 프레임', '다이싱 테이프를 팽팽하게 고정하는 스테인리스 링입니다. 다이싱 후에도 다이들이 테이프 위에 정렬된 채 유지되도록 지지합니다.');
  dicer.add(shadow(frameRing));

  const tapeMembrane = new THREE.Mesh(new THREE.CircleGeometry(0.76, 48),
    new THREE.MeshStandardMaterial({ color: 0x3a6ea5, transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
  tapeMembrane.rotation.x = -Math.PI / 2;
  tapeMembrane.position.set(0, 1.29, 1.15);
  pick(tapeMembrane, '다이싱 테이프', '점착성 필름으로, 웨이퍼를 절단하는 동안과 이후 다이 픽업 전까지 다이들의 상대 위치를 유지시켜 줍니다.');
  dicer.add(tapeMembrane);

  const diceWafer = makeWafer(0.62, { tint: '#9aa4c2', dieGrid: 8 });
  diceWafer.position.set(0, 1.33, 1.15);
  pick(diceWafer, '웨이퍼 (다이싱 대상)', '백그라인딩으로 얇아진 웨이퍼가 다이싱 테이프에 부착되어 개별 다이로 절단됩니다.');
  dicer.add(diceWafer);

  // 절단 격자선 (다이싱 진행 표시)
  const cutLines = new THREE.Group();
  for (let i = -3; i <= 3; i++) {
    if (i === 0) continue;
    const off = i * 0.19;
    const lx = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.006, 0.012), MAT.dark(0x11151f));
    lx.position.set(0, 1.345, 1.15 + off);
    cutLines.add(lx);
    const lz = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.006, 1.5), MAT.dark(0x11151f));
    lz.position.set(off, 1.345, 1.15);
    cutLines.add(lz);
  }
  cutLines.visible = false;
  dicer.add(cutLines);

  // 회전 블레이드
  const bladeArm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.55, 0.1), MAT.steel());
  bladeArm.position.set(0.85, 2.0, 1.15);
  dicer.add(bladeArm);
  const blade = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.025, 48),
    new THREE.MeshStandardMaterial({ color: 0xd7deea, metalness: 0.9, roughness: 0.2 }));
  blade.rotation.x = Math.PI / 2;
  blade.position.set(0.55, 1.62, 1.15);
  pick(blade, '다이아몬드 블레이드', '다이아몬드 입자가 박힌 얇은 블레이드가 수만 rpm으로 회전하며 웨이퍼를 기계적으로 절삭합니다. 블레이드 두께만큼 소잉 라인(street) 폭 손실이 발생해 다이 수에 영향을 줍니다.');
  dicer.add(shadow(blade));

  // 백그라인딩 휠 (별도 위치, 스텝0에서만 노출)
  const grindWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.22, 32), MAT.dark(0x55565c));
  grindWheel.position.set(0, 2.05, 1.15);
  pick(grindWheel, '백그라인딩 휠', '다이아몬드 지석 휠이 웨이퍼 뒷면을 연삭해 두께를 얇게 만듭니다. TSV 구조에서는 비아를 노출시키는 정밀 마무리까지 수행합니다.');
  dicer.add(shadow(grindWheel));
  const grindDust = makeParticleStream({ count: 40, area: 0.3, yTop: 2.0, yBottom: 1.4, color: 0xcfd6e4, size: 0.018 });
  grindDust.position.set(0, 0, 1.15);
  dicer.add(grindDust);

  const towerD = makeSignalTower();
  towerD.position.set(-1.2, 2.2, 0.9);
  dicer.add(towerD);
  const dicerLabel = makeLabel('백그라인딩 · 다이싱', { color: '#f87171', size: 0.4 });
  dicerLabel.position.set(0, 3.0, 0);
  dicer.add(dicerLabel);
  group.add(dicer);

  /* ================= 2. 다이본더 x=-3.4 ================= */
  const bonder = new THREE.Group();
  bonder.position.set(-3.4, 0, 0);

  const bonderBody = makeCabinet({ w: 2.4, h: 2.0, d: 1.8, color: 0xf6e2e2 });
  pick(bonderBody, '다이본더 (ASMPT AD-829)', '다이싱 테이프에서 다이를 픽업해 기판 위에 정밀 배치(Pick & Place)하는 장비. 픽업 정밀도는 수 μm급입니다.');
  bonder.add(bonderBody);

  const substrate1 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.06, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x2e7d4f, metalness: 0.2, roughness: 0.6 }));
  substrate1.position.set(0, 1.05, 1.0);
  pick(substrate1, '패키지 기판 (서브스트레이트)', '라미네이트 기판 위에 다이를 접착하고, 이후 와이어나 범프로 전기 신호를 연결합니다. FBGA 패키지의 뼈대입니다.');
  bonder.add(shadow(substrate1));

  const dieOnSub = makeDie({ w: 0.5, d: 0.4, h: 0.05, color: 0x474f66 });
  dieOnSub.position.set(0, 1.11, 1.0);
  dieOnSub.visible = false;
  bonder.add(dieOnSub);

  const gantryRail = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.07, 0.1), MAT.steel());
  gantryRail.position.set(0, 2.05, 1.0);
  bonder.add(gantryRail);

  const pickHead = new THREE.Group();
  pickHead.position.set(-0.6, 2.0, 1.0);
  const quill = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.5), MAT.steel(0x6b7488));
  quill.position.y = -0.25;
  pickHead.add(quill);
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.1), MAT.dark(0x222833));
  nozzle.position.y = -0.5;
  pick(nozzle, '픽업 헤드 (진공 흡착 노즐)', '이젝터 핀으로 다이싱 테이프 아래에서 다이를 살짝 들어올린 뒤 진공으로 흡착해 기판 위로 정밀 이동시킵니다.');
  pickHead.add(nozzle);
  const carriedDie = makeDie({ w: 0.5, d: 0.4, h: 0.05, color: 0x474f66 });
  carriedDie.position.y = -0.56;
  carriedDie.visible = false;
  pickHead.add(carriedDie);
  bonder.add(pickHead);

  const towerBd = makeSignalTower();
  towerBd.position.set(-1.05, 2.15, 0.75);
  bonder.add(towerBd);
  const bonderLabel = makeLabel('다이 어태치 (Die Bonder)', { color: '#f87171', size: 0.38 });
  bonderLabel.position.set(0, 3.0, 0);
  bonder.add(bonderLabel);
  group.add(bonder);

  /* ================= 3. 와이어본더 x=0 ================= */
  const wb = new THREE.Group();
  wb.position.set(0, 0, 0);

  const wbBody = makeCabinet({ w: 2.4, h: 2.0, d: 1.8, color: 0xf6e2e2 });
  pick(wbBody, '와이어본더 (K&S iConn Apollo)', '금/구리 와이어로 칩 패드와 기판 리드를 하나씩 연결하는 장비. 초당 다수의 와이어를 본딩할 수 있습니다.');
  wb.add(wbBody);

  const substrate2 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.06, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x2e7d4f, metalness: 0.2, roughness: 0.6 }));
  substrate2.position.set(0, 1.05, 1.0);
  wb.add(shadow(substrate2));

  const wbDie = makeDie({ w: 0.5, d: 0.4, h: 0.05, color: 0x474f66 });
  wbDie.position.set(0, 1.11, 1.0);
  pick(wbDie, '다이 (칩)', '기판에 접착된 실리콘 다이. 표면의 본딩 패드가 와이어로 기판 리드와 연결됩니다.');
  wb.add(wbDie);

  // 금 와이어 아치 (4개)
  const wireArches = [];
  const wireAnchors = [
    { from: [-0.2, 1.14, 0.82], to: [-0.35, 1.06, 0.62] },
    { from: [0.2, 1.14, 0.82], to: [0.35, 1.06, 0.62] },
    { from: [-0.2, 1.14, 1.18], to: [-0.35, 1.06, 1.38] },
    { from: [0.2, 1.14, 1.18], to: [0.35, 1.06, 1.38] },
  ];
  wireAnchors.forEach((a, idx) => {
    const from = new THREE.Vector3(...a.from);
    const to = new THREE.Vector3(...a.to);
    const mid = from.clone().lerp(to, 0.5).add(new THREE.Vector3(0, 0.22, 0));
    const curve = new THREE.CatmullRomCurve3([from, mid, to]);
    const geo = new THREE.TubeGeometry(curve, 24, 0.012, 8, false);
    const wire = new THREE.Mesh(geo, MAT.steel(0xe8c04a));
    wire.visible = false;
    if (idx === 0) pick(wire, '금 와이어 (Ball Bond)', '와이어 끝을 전기 스파크(EFO)로 녹여 볼을 만든 뒤 칩 패드에 접합하고, 반대쪽은 웨지본딩으로 기판 리드에 연결합니다.');
    wireArches.push(wire);
    wb.add(wire);
  });

  // 캐필러리 (본딩 툴)
  const capillaryArm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.1), MAT.steel());
  capillaryArm.position.set(-0.35, 2.0, 0.7);
  wb.add(capillaryArm);
  const capillary = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.22, 16), MAT.dark(0x2a3244));
  capillary.position.set(-0.35, 1.55, 0.7);
  pick(capillary, '캐필러리 (본딩 캐필러리)', '와이어를 안내하는 세라믹 관 형태의 툴. 초음파 진동과 압력을 가해 와이어를 패드에 접합시킵니다.');
  wb.add(capillary);
  const efoSpark = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 12), MAT.glow(0xfff2a8, 3.0));
  efoSpark.position.set(-0.35, 1.44, 0.7);
  efoSpark.visible = false;
  wb.add(efoSpark);

  const towerWb = makeSignalTower();
  towerWb.position.set(-1.05, 2.15, 0.75);
  wb.add(towerWb);
  const wbLabel = makeLabel('와이어 본딩 (Wire Bonder)', { color: '#f87171', size: 0.38 });
  wbLabel.position.set(0, 3.0, 0);
  wb.add(wbLabel);
  group.add(wb);

  /* ================= 4. 몰딩 프레스 x=3.4 ================= */
  const mold = new THREE.Group();
  mold.position.set(3.4, 0, 0);

  const moldBody = makeCabinet({ w: 2.6, h: 2.2, d: 1.9, color: 0xf6e2e2 });
  pick(moldBody, '몰드 프레스 (TOWA YSP)', 'EMC(에폭시 몰딩 컴파운드)를 가열·가압해 칩과 와이어를 압축성형 방식으로 봉지하는 장비. 성형 온도는 약 175°C입니다.');
  mold.add(moldBody);

  const substrate3 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.06, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x2e7d4f, metalness: 0.2, roughness: 0.6 }));
  substrate3.position.set(0, 1.05, 1.0);
  mold.add(shadow(substrate3));

  const moldDie = makeDie({ w: 0.5, d: 0.4, h: 0.05, color: 0x474f66 });
  moldDie.position.set(0, 1.11, 1.0);
  mold.add(moldDie);

  const emcBlock = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.001, 0.75),
    new THREE.MeshStandardMaterial({ color: 0x2a2a2e, metalness: 0.1, roughness: 0.75 }));
  emcBlock.position.set(0, 1.09, 1.0);
  pick(emcBlock, 'EMC 몰드 컴파운드', '가열된 에폭시 수지가 다이와 와이어를 완전히 감싸 외부 충격, 습기, 오염으로부터 보호합니다.');
  mold.add(emcBlock);

  const upperPlate = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.14, 1.1), MAT.steel(0x828da3));
  upperPlate.position.set(0, 2.0, 1.0);
  pick(upperPlate, '상부 몰드 플레이트', '가열된 상부 금형이 하강하며 EMC를 압축 성형합니다. 유동이 불균형하면 미충전 보이드가 발생할 수 있습니다.');
  mold.add(shadow(upperPlate));
  const lowerPlate = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.14, 1.1), MAT.steel(0x828da3));
  lowerPlate.position.set(0, 0.95, 1.0);
  mold.add(shadow(lowerPlate));

  const towerM = makeSignalTower();
  towerM.position.set(-1.15, 2.3, 0.75);
  mold.add(towerM);
  const moldLabel = makeLabel('EMC 몰딩 (Molding)', { color: '#f87171', size: 0.4 });
  moldLabel.position.set(0, 3.1, 0);
  mold.add(moldLabel);
  group.add(mold);

  /* ================= 5. 솔더볼 마운트 & 완성 패키지 x=6.8 ================= */
  const ballSt = new THREE.Group();
  ballSt.position.set(6.8, 0, 0);

  const ballBody = makeCabinet({ w: 2.4, h: 2.0, d: 1.8, color: 0xf6e2e2 });
  pick(ballBody, '솔더볼 마운터', '기판 뒷면 패드에 플럭스를 도포하고 솔더볼을 격자로 정렬 배치한 뒤 리플로우로 접합해 BGA 단자를 완성합니다.');
  ballSt.add(ballBody);

  const substrate4 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.06, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x2e7d4f, metalness: 0.2, roughness: 0.6 }));
  substrate4.position.set(0, 1.05, 1.0);
  ballSt.add(shadow(substrate4));

  const ballGrid = new THREE.Group();
  for (let i = -3; i <= 3; i++) {
    for (let j = -2; j <= 2; j++) {
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 12), MAT.steel(0xc3c9d4));
      ball.position.set(i * 0.11, 1.0, 1.0 + j * 0.11);
      ballGrid.add(ball);
    }
  }
  pick(ballGrid, '솔더볼 그리드 (BGA)', '기판 뒷면에 격자로 부착된 솔더볼 배열. 이후 메인보드에 표면실장(SMT)될 때 전기적 접점이자 기계적 고정점이 됩니다.');
  ballGrid.visible = false;
  ballSt.add(ballGrid);

  const markBeam = makeBeam([0, 1.9, 1.0], [0, 1.12, 1.0], { color: 0xff5a2a, radius: 0.012, opacity: 0.9 });
  markBeam.visible = false;
  ballSt.add(markBeam);

  // 완성된 FBGA 패키지 (전시대)
  const displayPedestal = makePedestal({ r: 0.34, y: 0.85 });
  displayPedestal.position.set(1.4, 0, -0.4);
  ballSt.add(displayPedestal);

  const finalPackage = new THREE.Group();
  const finalSub = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.05, 0.45),
    new THREE.MeshStandardMaterial({ color: 0x2e7d4f, metalness: 0.2, roughness: 0.6 }));
  finalPackage.add(finalSub);
  const finalMold = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.16, 0.4), MAT.dark(0x2a2a2e));
  finalMold.position.y = 0.105;
  finalPackage.add(finalMold);
  const finalBalls = new THREE.Group();
  for (let i = -2; i <= 2; i++) {
    for (let j = -2; j <= 2; j++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 10), MAT.steel(0xc3c9d4));
      b.position.set(i * 0.075, -0.03, j * 0.065);
      finalBalls.add(b);
    }
  }
  finalPackage.add(finalBalls);
  const finalLabel = makeLabel('FBGA', { color: '#f87171', size: 0.28 });
  finalLabel.position.set(0, 0.32, 0);
  finalPackage.add(finalLabel);
  pick(finalPackage, '완성된 FBGA 패키지', '백그라인딩부터 솔더볼 마운트까지 모든 후공정을 거쳐 완성된 최종 메모리 패키지입니다. 미세피치 솔더볼 배열이 특징입니다.');
  finalPackage.position.set(1.4, 1.35, -0.4);
  finalPackage.visible = false;
  ballSt.add(shadow(finalPackage));

  const towerBall = makeSignalTower();
  towerBall.position.set(-1.05, 2.15, 0.75);
  ballSt.add(towerBall);
  const ballLabel = makeLabel('볼 마운트 & 마킹', { color: '#f87171', size: 0.38 });
  ballLabel.position.set(0, 3.0, 0);
  ballSt.add(ballLabel);
  group.add(ballSt);

  /* ================= 단계 연출 ================= */
  const EMC_TARGET = 90; // emcBlock.scale.y 목표치 (완전 성형 상태)
  let grindOn = true, bladeOn = false;
  let wirePhase = 0;
  // moldState: 0=미성형(얇음) / 1=성형 진행 중(성장 애니메이션) / 2=성형 완료(고정)
  let moldState = 0;
  let ballsRevealed = false, markingOn = false, finalShown = false, stepTimer = 0;

  const stepFx = [
    () => { // 0: 백그라인딩
      grindOn = true; bladeOn = false;
      show(grindWheel, grindDust); hide(cutLines, blade);
      towerD.userData.setState('run');
      towerBd.userData.setState('warn'); towerWb.userData.setState('warn'); towerM.userData.setState('warn'); towerBall.userData.setState('warn');
    },
    () => { // 1: 다이싱
      grindOn = false; bladeOn = true;
      hide(grindWheel, grindDust); show(cutLines, blade);
      towerD.userData.setState('run');
      towerBd.userData.setState('warn'); towerWb.userData.setState('warn'); towerM.userData.setState('warn'); towerBall.userData.setState('warn');
    },
    () => { // 2: 다이 어태치
      dieOnSub.visible = true; carriedDie.visible = true;
      towerD.userData.setState('warn'); towerBd.userData.setState('run');
      towerWb.userData.setState('warn'); towerM.userData.setState('warn'); towerBall.userData.setState('warn');
    },
    () => { // 3: 와이어 본딩
      wirePhase = 0;
      wireArches.forEach(w => { w.visible = false; });
      moldState = 0; emcBlock.scale.y = 1; emcBlock.position.y = 1.09;
      towerD.userData.setState('warn'); towerBd.userData.setState('warn');
      towerWb.userData.setState('run'); towerM.userData.setState('warn'); towerBall.userData.setState('warn');
    },
    () => { // 4: EMC 몰딩
      wireArches.forEach(w => { w.visible = true; });
      moldState = 1; emcBlock.scale.y = 1; emcBlock.position.y = 1.09;
      towerD.userData.setState('warn'); towerBd.userData.setState('warn'); towerWb.userData.setState('warn');
      towerM.userData.setState('run'); towerBall.userData.setState('warn');
    },
    () => { // 5: 볼 마운트 & 마킹
      ballsRevealed = false; markingOn = true; finalShown = false; stepTimer = 0;
      ballGrid.visible = false; finalPackage.visible = false;
      wireArches.forEach(w => { w.visible = true; });
      moldState = 2; emcBlock.scale.y = EMC_TARGET; emcBlock.position.y = 1.09 + EMC_TARGET * 0.0005;
      towerD.userData.setState('warn'); towerBd.userData.setState('warn'); towerWb.userData.setState('warn');
      towerM.userData.setState('warn'); towerBall.userData.setState('run');
    },
  ];

  stepFx[0]();

  return {
    group,
    setStep(i) { stepFx[Math.min(i, stepFx.length - 1)]?.(); },
    tick(t, dt) {
      // 다이싱 소
      if (grindOn) grindWheel.rotation.y += 3.0 * dt;
      blade.rotation.y += (bladeOn ? 40 : 2) * dt;
      diceWafer.rotation.y += 0.15 * dt;
      grindDust.userData.tick(dt);

      // 다이 어태치: 픽업 헤드가 좌우로 왕복하며 다이를 옮김
      const swing = Math.sin(t * 1.1) * 0.5 + 0.5;
      pickHead.position.x = -0.6 + swing * 0.6;
      pickHead.position.y = 2.0 - Math.sin(t * 2.2) * 0.35 * (dieOnSub.visible ? 1 : 0);
      carriedDie.visible = dieOnSub.visible && pickHead.position.y < 1.85;

      // 와이어 본딩: 캐필러리가 위아래로 움직이며 EFO 스파크 발생
      wirePhase += dt * 0.5;
      capillary.position.y = 1.55 + Math.sin(t * 6) * 0.03;
      efoSpark.visible = Math.sin(t * 6) > 0.8;
      efoSpark.material.emissiveIntensity = 2 + Math.sin(t * 20) * 1.5;

      // 몰딩 프레스: 위아래로 개폐, EMC는 성형 단계에서만 서서히 차오름
      const pressPhase = Math.sin(t * 0.8) * 0.5 + 0.5;
      upperPlate.position.y = 2.0 - pressPhase * 0.75;
      if (moldState === 1 && emcBlock.scale.y < EMC_TARGET) {
        emcBlock.scale.y = Math.min(EMC_TARGET, emcBlock.scale.y + dt * 40);
        emcBlock.position.y = 1.09 + emcBlock.scale.y * 0.0005;
      }

      // 볼 마운트 & 마킹
      if (markingOn) {
        stepTimer += dt;
        markBeam.visible = true;
        markBeam.material.opacity = 0.5 + Math.sin(t * 10) * 0.35;
        if (!ballsRevealed && stepTimer > 1.5) { ballGrid.visible = true; ballsRevealed = true; }
        if (ballsRevealed && !finalShown && stepTimer > 3.0) { finalPackage.visible = true; finalShown = true; }
      } else {
        markBeam.visible = false;
      }
      if (finalPackage.visible) finalPackage.rotation.y += 0.5 * dt;
    },
  };
}
