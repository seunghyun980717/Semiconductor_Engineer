// 패키징 공정 모듈 — 다이싱 소 + TC본더(듀얼헤드) + 몰딩 프레스 + 리플로우 오븐(볼마운트/마킹 인라인)
// export 계약: camera / content / build3D(ctx) → { group, setStep(i), tick(t,dt) }
import * as THREE from 'three';
import {
  MAT, pick, shadow, makeWafer, makeCabinet, makePedestal, makeBeam,
  makeLabel, makeSignalTower, makeParticleStream, makeDie,
  makeESC, makeSpindle, makeScreenPanel, makeHose, makeGasBox, makeTurboPump,
} from '../lib/equip-kit.js';

export const camera = { pos: [13, 7.5, 16], target: [0.5, 1.3, 0] };

export const content = {
  overview:
    '패키징은 EDS 테스트를 통과한 웨이퍼를 개별 칩(다이) 단위로 분리하고, 기판에 고정·배선한 뒤 외부 환경으로부터 보호하는 봉지재로 감싸 완제품 반도체로 만드는 후공정입니다. ' +
    '일반적으로 백그라인딩으로 웨이퍼 두께를 줄인 뒤, 다이싱 소로 낱개 칩으로 절단하고, 다이본더가 칩을 기판 위에 정밀 배치합니다. ' +
    '이어 와이어본더가 금/구리 와이어로 칩과 기판을 전기적으로 연결하거나, 고성능 제품은 플립칩 방식의 솔더 범프로 직접 접합합니다. HBM처럼 다이를 다단 적층하는 제품은 한미반도체의 열압착(TC) 듀얼헤드 본더가 가열-가압-냉각 사이클로 정밀 접합합니다. ' +
    '배선이 끝난 조립체는 EMC(에폭시 몰딩 컴파운드)로 감싸 습기와 충격으로부터 보호하고, 마지막으로 터널형 리플로우 오븐 라인에서 솔더볼 마운트·리플로우·레이저 마킹을 인라인으로 거쳐 FBGA와 같은 완제품 패키지 형태를 갖춥니다. ' +
    'Disco의 다이싱·그라인딩 장비, 한미반도체의 TC본더, TOWA의 몰드 프레스 등 전문 장비업체들의 기술이 이 전 과정을 뒷받침합니다.',
  keyPoints: [
    '백그라인딩 → 다이싱 → 다이 어태치/TC본딩 → EMC 몰딩 → 솔더볼 마운트/리플로우/마킹 순으로 진행',
    '블레이드 다이싱은 저비용이지만 소잉 라인 폭이 60~80μm로 다이 손실 발생, 스텔스 다이싱은 폭을 거의 0에 가깝게 줄여 다이 수율을 높임',
    '한미반도체 TC본더는 듀얼 헤드 구조로 두 스택을 동시/교대 처리해 생산성(UPH)을 2배로 확보 — HBM 8~16단 적층의 핵심 장비',
    'DAF(Die Attach Film)는 에폭시 대비 두께 균일도가 뛰어나 적층 메모리 등 첨단 패키지에서 선호',
    'EMC 몰딩은 습기·충격·오염으로부터 칩을 보호하며, 고핀수/플립칩 패키지는 몰딩 전 언더필 공정이 추가됨',
    '리플로우 오븐은 8~12개 히팅존을 통과시키며 예열→균열→피크리플로우→냉각 온도 프로파일로 솔더볼을 접합, 이후 레이저 마킹으로 제품 정보를 각인',
  ],
  hbmNote:
    'HBM은 TSV로 다이를 수직 관통 연결해 12~16단까지 적층한 뒤 MR-MUF(Mass Reflow-Molded Underfill) 공정으로 한 번에 몰딩하는 SK하이닉스의 핵심 후공정 기술을 사용합니다. ' +
    'HBM4 세대에서도 마이크로범프 방식을 유지하며 구리-구리 하이브리드 본딩 전환은 차세대로 유보되는 추세이나, 스택 높이·열저항 개선 효과 때문에 2026~2027년 하이브리드 본딩 장비 투자가 크게 늘어날 전망입니다.',
  steps: [
    { name: '백그라인딩 (Back-Grinding)', desc: '다이아몬드 지석 휠로 웨이퍼 뒷면을 연삭해 두께를 줄입니다. TSV 구조에서는 비아를 노출시키는 정밀 마무리(CMP/식각)까지 이어집니다.', camera: { pos: [-6.6, 4.2, 6.4], target: [-4.2, 1.5, 0.9] } },
    { name: '다이싱 (Dicing)', desc: '초고속 회전(15,000~60,000rpm)하는 다이아몬드 블레이드가 세라믹 척 테이블 위 웨이퍼를 격자형 소잉 라인을 따라 절단해 개별 다이로 분리합니다. 절삭수 노즐이 냉각과 칩 세정을 동시에 수행합니다.', camera: { pos: [-6.0, 3.6, 5.6], target: [-4.2, 1.4, 1.1] } },
    { name: '다이 어태치 (Die Attach)', desc: '한미반도체 TC본더의 헤드 A가 다이싱 테이프에서 다이를 픽업(진공 흡착)해 DAF/에폭시가 도포된 기판 위에 정밀 배치합니다.', camera: { pos: [-3.4, 3.8, 5.6], target: [-1.4, 1.5, 0.9] } },
    { name: '와이어 본딩 / TC 압착 본딩', desc: '표준 패키지는 캐필러리가 금/구리 와이어로 칩과 기판을 연결하고, HBM 등 적층 제품은 듀얼헤드의 헤드 B가 세라믹 히터 블록으로 가열·가압하는 열압착(Thermo-Compression) 방식으로 다이를 접합합니다.', camera: { pos: [0.2, 3.9, 5.8], target: [-1.0, 1.6, 1.0] } },
    { name: 'EMC 몰딩 (Molding)', desc: '가열된 상/하 금형이 형체결되고, 녹은 에폭시 몰딩 컴파운드가 트랜스퍼 플런저에 의해 런너를 통해 캐비티로 압송되어 다이와 와이어를 감쌉니다.', camera: { pos: [3.0, 4.0, 6.2], target: [1.0, 1.6, 0.9] } },
    { name: '솔더볼 마운트 · 리플로우 · 마킹', desc: '기판 뒷면에 솔더볼을 격자로 부착한 뒤 터널형 리플로우 오븐의 다중 히팅존(예열→균열→피크→냉각)을 메쉬 컨베이어로 통과시켜 접합하고, 출구에서 갈바노 스캐너로 레이저 마킹해 FBGA 완제품을 완성합니다.', camera: { pos: [6.6, 4.4, 7.2], target: [4.6, 1.8, 0.6] } },
  ],
  equipment: [
    { name: '다이싱 소 DAD3220', vendor: 'Disco', role: '다이아몬드 블레이드로 웨이퍼를 개별 다이로 절단. "자르다·깎다·닦다" 정밀가공 3대 기술을 핵심 역량으로 하는 세계적 리더.', spec: '블레이드 두께 20~100μm / 소잉 라인 폭 60~80μm, 회전수 15,000~60,000rpm' },
    { name: '백그라인더 DFG8540', vendor: 'Disco', role: '다이아몬드 지석 휠로 웨이퍼 뒷면을 연삭해 두께를 줄이고, TSV 구조에서는 비아 팁을 노출.', spec: 'Φ300mm 웨이퍼 완전자동 대응, 조연삭→정연삭→폴리싱 3단계' },
    { name: 'TC본더 (Thermo-Compression Bonder)', vendor: '한미반도체', role: 'HBM 등 다이 적층용 열압착 본더. 듀얼 헤드 구조로 두 스택을 동시/교대 처리해 생산성을 2배로 확보. 세라믹 히터 블록으로 가열-가압-냉각 사이클을 정밀 반복.', spec: 'HBM 다이본딩 시장 점유율 70% 이상, 헤드당 독립 Z축 가압 컬럼' },
    { name: '와이어본더 iConn Apollo', vendor: 'K&S (Kulicke & Soffa)', role: '금/구리 와이어로 칩 패드와 기판 리드를 볼본딩(EFO)·웨지본딩 방식으로 연결.', spec: '와이어 직경 15~50μm, 초당 다수 와이어 본딩' },
    { name: '몰드 프레스 YSP', vendor: 'TOWA', role: 'EMC(에폭시 몰딩 컴파운드) 태블릿을 가열·가압해 트랜스퍼 몰딩 방식으로 봉지.', spec: '성형 온도 150~180°C, 유압 실린더 형체결' },
    { name: '리플로우 오븐 & 솔더볼 마운터', vendor: '패키징 인라인 설비', role: '플럭스 도포 → 솔더볼 마운트 → 8~12존 리플로우 → 레이저 마킹을 메쉬 컨베이어로 연속 처리.', spec: '터널 길이 3~6m, N2 저산소 분위기, 공면성 관리 ≤100μm' },
  ],
  parameters: [
    { name: '소잉 라인 폭 (Street Width)', typical: '블레이드 60~80μm / 스텔스 <10μm', monitor: '현미경 폭 측정, 웨이퍼당 다이 수 계산' },
    { name: 'TC본딩 가압/온도 프로파일', typical: '가열 수백°C, 가압 로드셀 제어, 사이클 수 초', monitor: '본딩 후 전단강도(shear) 테스트, X-ray 정렬 확인' },
    { name: '와이어 풀 강도 (Pull Strength)', typical: '와이어 직경별 규격 대비 ≥ 최소 관리치', monitor: '와이어 풀 테스트, 볼 전단(shear) 테스트' },
    { name: '몰드 컴파운드 보이드율', typical: '관리기준 <1% (목표 0%)', monitor: 'X-ray 검사, C-SAM(음향현미경)' },
    { name: '솔더볼 공면성 (Coplanarity)', typical: '≤ 100μm (볼피치에 따라 상이)', monitor: '3D 코플래너리티 스캐너' },
    { name: '백그라인딩 두께 균일도', typical: '완성 두께 ±5μm 이내 (TTV)', monitor: '접촉식/비접촉 두께게이지' },
  ],
  defects: [
    { name: '다이 크랙 (Die Crack)', signature: '최종 테스트에서 개방(open) 불량 급증, C-SAM/X-ray에서 다이 내부 크랙 라인 관찰', cause: '다이싱 기계적 응력, 박형 다이 핸들링 중 휨, 다이어태치 접착층 불균일에 의한 국소 응력', action: '스텔스 다이싱 등 저응력 공정 도입, DAF 균일 도포, 박형 다이 캐리어/스티프너 적용' },
    { name: 'TC본딩 정렬/보이드 불량', signature: 'X-ray에서 범프 정렬 오차 또는 접합계면 보이드 관찰, 열저항 상승', cause: '가열-가압 프로파일 편차, 상/하부 스테이지 예열 불균일, 비전 정렬 오차', action: '헤드별 로드셀·온도 정기 캘리브레이션, 상하 히터 균일도 점검, 비전 정렬 알고리즘 재보정' },
    { name: '와이어 본딩 불량 (Wire Sweep/힐크랙)', signature: '와이어 풀 테스트/볼 전단 테스트 강도 미달, 몰딩 후 X-ray에서 와이어가 밀려 휘어진 형상(wire sweep) 관찰', cause: '본딩 파라미터(force/power/time) 불일치, 몰드 컴파운드 유동 압력 불균형, 본드패드 오염', action: '본딩 파라미터 정기 캘리브레이션, 몰드 게이트/벤트 설계 최적화, 본드패드 플라즈마 클린' },
    { name: '몰드 컴파운드 보이드 (Mold Void)', signature: 'X-ray/C-SAM에서 몰드 내부 기포 관찰, 와이어 밀집 영역·코너부에 집중', cause: '압축성형 시 불균형한 몰드 유동, EMC 흡습·아웃개싱, 경화 프로파일 부적절', action: '몰드 주입 속도/압력 최적화, 진공 몰딩, EMC 사전 베이크아웃 및 MSL 관리' },
    { name: '솔더볼 Non-wet / 보이드', signature: '리플로우 후 X-ray/초음파 검사에서 볼 미접합 또는 내부 기포 관찰', cause: '플럭스 도포 불균일, 패드 산화막 잔류, 리플로우 온도 프로파일 부적절', action: '플럭스 도포량/균일도 관리, 패드 세정 강화, 리플로우 프로파일(피크온도·냉각속도) 재설정' },
  ],
};

export function build3D(ctx) {
  const group = new THREE.Group();

  function show(...o) { o.forEach(x => { x.visible = true; }); }
  function hide(...o) { o.forEach(x => { x.visible = false; }); }

  const DICE_X = -4.2, BOND_X = -1.4, MOLD_X = 1.0, REFLOW_X = 3.9, REFLOW_LEN = 2.6, FINAL_X = 6.2;

  /* ================= 1. 다이싱 소 (Disco 스타일) — 세라믹 척 + 스핀들 블레이드 ================= */
  const dicer = new THREE.Group();
  dicer.position.set(DICE_X, 0, 0);

  const dicerCab = makeCabinet({ w: 1.3, h: 1.9, d: 1.0, color: 0xeef1f6 });
  dicerCab.position.z = -0.55;
  pick(dicerCab, '다이싱 소 (Disco DAD3220) 제어부', '다이아몬드 블레이드로 웨이퍼를 개별 다이로 절단하는 장비의 제어 캐비닛. Disco는 자르다·깎다·닦다 정밀가공 기술의 세계적 리더입니다.');
  dicer.add(dicerCab);

  const dicerScreen = makeScreenPanel({ w: 0.5, h: 0.32, accent: '#f87171' });
  dicerScreen.position.set(0, 1.55, -0.04);
  pick(dicerScreen, '공정 모니터 (SPC)', '절삭 속도, 스핀들 부하, 소잉 라인 폭 등을 실시간으로 표시하는 공정 감시 화면입니다.');
  dicerCab.add(dicerScreen);

  // 세라믹 척 테이블 (다공성 세라믹, 흰색~아이보리, 진공 흡착) — makeESC 재활용
  const chuck = makeESC({ r: 0.62, y: 0.82 });
  chuck.position.set(0, 0, 0.85);
  pick(chuck, '세라믹 척 테이블 (Chuck Table)', '다공성 세라믹(흰색~아이보리) 원판으로, 진공 흡착으로 웨이퍼를 고정합니다. 자체 회전축 위에서 독립적으로 회전하며 X-Y-θ 스테이지 위에서 절단선을 따라 이동합니다.');
  dicer.add(chuck);
  pick(chuck.userData.focusRing, '진공 흡착 링', '척 테이블 가장자리의 흡착 홈. 웨이퍼 뒷면 전체를 균일하게 진공 흡착해 절삭 중 미세한 들뜸을 방지합니다.');
  const diceTopY = chuck.userData.topY; // 척 표면 y (로컬)

  // 웨이퍼 링 프레임 (스테인리스) + 청색 다이싱 테이프
  const frameRing = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.045, 12, 48), MAT.steel(0x9aa4b5));
  frameRing.rotation.x = Math.PI / 2;
  frameRing.position.set(0, diceTopY + 0.01, 0.85);
  pick(frameRing, '웨이퍼 링 프레임 (스테인리스)', '다이싱 테이프를 팽팽하게 고정하는 스테인리스 금속 링(외경 약 200~250mm)입니다. 다이싱 후에도 다이들이 테이프 위에 정렬된 채 유지되도록 지지합니다.');
  dicer.add(shadow(frameRing));

  const tapeMembrane = new THREE.Mesh(new THREE.CircleGeometry(0.78, 48),
    new THREE.MeshStandardMaterial({ color: 0x2f6fb0, transparent: true, opacity: 0.6, side: THREE.DoubleSide }));
  tapeMembrane.rotation.x = -Math.PI / 2;
  tapeMembrane.position.set(0, diceTopY + 0.005, 0.85);
  pick(tapeMembrane, '청색 다이싱 테이프 (Blue Tape)', '점착성 청색 필름으로, 웨이퍼를 절단하는 동안과 이후 다이 픽업 전까지 다이들의 상대 위치를 유지시켜 줍니다.');
  dicer.add(tapeMembrane);

  const diceWafer = makeWafer(0.6, { tint: '#9aa4c2', dieGrid: 8 });
  diceWafer.position.set(0, diceTopY + 0.02, 0.85);
  pick(diceWafer, '웨이퍼 (다이싱 대상)', '백그라인딩으로 얇아진 웨이퍼가 다이싱 테이프에 부착되어 개별 다이로 절단됩니다.');
  dicer.add(diceWafer);

  // 절단 격자선 (다이싱 진행 표시)
  const cutLines = new THREE.Group();
  for (let i = -3; i <= 3; i++) {
    if (i === 0) continue;
    const off = i * 0.17;
    const lx = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.006, 0.012), MAT.dark(0x11151f));
    lx.position.set(0, diceTopY + 0.03, 0.85 + off);
    cutLines.add(lx);
    const lz = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.006, 1.4), MAT.dark(0x11151f));
    lz.position.set(off, diceTopY + 0.03, 0.85);
    cutLines.add(lz);
  }
  cutLines.visible = false;
  dicer.add(cutLines);

  // 블레이드 스핀들 (수평축, 초고속 회전) — makeSpindle
  const bladeSpindle = makeSpindle({ wheelR: 0.4, wheelT: 0.022, len: 0.5, color: 0x2b2e36 });
  bladeSpindle.position.set(0.15, diceTopY + 0.72, 0.85);
  pick(bladeSpindle, '다이아몬드 블레이드 스핀들', '지름 약 50~58mm, 두께 20~100μm의 극도로 얇은 다이아몬드 블레이드가 수평축 위에서 15,000~60,000rpm으로 회전하며 웨이퍼를 기계적으로 절삭합니다. 블레이드 두께만큼 소잉 라인(street) 폭 손실이 발생해 다이 수에 영향을 줍니다.');
  dicer.add(bladeSpindle);
  // Z축 승강 컬럼
  const liftColumn = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.9, 0.09), MAT.steel(0x828da3));
  liftColumn.position.set(0.5, diceTopY + 1.15, 0.85);
  dicer.add(shadow(liftColumn));

  // 절삭수 노즐 2개 (블레이드 양옆) + 급수 호스
  const nozzleSupply = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.16), MAT.steel(0x9aa4b5));
  nozzleSupply.position.set(-0.55, diceTopY + 1.3, 0.4);
  dicer.add(shadow(nozzleSupply));
  const nozzleGroup = new THREE.Group();
  [-0.09, 0.09].forEach((dz, idx) => {
    const hose = makeHose([[-0.55, diceTopY + 1.25, 0.4], [-0.2, diceTopY + 0.95, 0.6], [0.13, diceTopY + 0.78, 0.85 + dz]], { radius: 0.02, color: 0x4a566e });
    nozzleGroup.add(hose);
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.02, 0.06, 10), MAT.steel(0x828da3));
    nozzle.position.set(0.14, diceTopY + 0.76, 0.85 + dz);
    if (idx === 0) pick(nozzle, '절삭수(Cutting Water) 노즐', '블레이드 양옆에 대칭 배치된 스테인리스 노즐로 DI워터를 분사해 냉각·칩 비산 방지·절삭칩 세정을 동시에 수행합니다.');
    nozzleGroup.add(shadow(nozzle));
  });
  dicer.add(nozzleGroup);
  const cutWaterSpray = makeParticleStream({ count: 40, area: 0.05, yTop: diceTopY + 0.74, yBottom: diceTopY + 0.02, color: 0xaed4ff, size: 0.014 });
  cutWaterSpray.position.set(0.14, 0, 0.85);
  dicer.add(cutWaterSpray);

  // 비전 얼라인먼트 카메라
  const visionCam1 = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.09, 12), MAT.dark(0x14161c));
  visionCam1.position.set(0.15, diceTopY + 0.95, 0.6);
  pick(visionCam1, '비전 얼라인먼트 카메라', '블레이드 상부에 위치한 소형 CCD 카메라 모듈로, 절단선(스트리트) 위치를 인식해 정밀 절단을 돕습니다.');
  dicer.add(shadow(visionCam1));

  // 백그라인딩 휠 (별도 위치, 스텝0에서만 노출)
  const grindWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32), MAT.dark(0x55565c));
  grindWheel.position.set(0, diceTopY + 1.55, 0.85);
  pick(grindWheel, '백그라인딩 휠 (조연삭/정연삭)', '다이아몬드 지석 휠이 웨이퍼 뒷면을 연삭해 두께를 얇게 만듭니다. 조연삭 휠(굵은 입자)로 큰 두께를 줄인 뒤 정연삭 휠(미세 입자)로 마무리하며, TSV 구조에서는 비아를 노출시키는 정밀 마무리까지 수행합니다.');
  dicer.add(shadow(grindWheel));
  const grindDust = makeParticleStream({ count: 40, area: 0.28, yTop: diceTopY + 1.5, yBottom: diceTopY + 0.9, color: 0xcfd6e4, size: 0.016 });
  grindDust.position.set(0, 0, 0.85);
  dicer.add(grindDust);

  const towerD = makeSignalTower();
  towerD.position.set(-0.95, diceTopY + 1.3, 0.2);
  dicer.add(towerD);
  const dicerLabel = makeLabel('백그라인딩 · 다이싱', { color: '#f87171', size: 0.4 });
  dicerLabel.position.set(0, diceTopY + 2.05, 0);
  dicer.add(dicerLabel);
  group.add(dicer);

  /* ================= 2. TC본더 (한미반도체 듀얼헤드) ================= */
  const bonder = new THREE.Group();
  bonder.position.set(BOND_X, 0, 0);

  const bonderCab = makeCabinet({ w: 1.1, h: 2.0, d: 0.9, color: 0xeef1f6 });
  bonderCab.position.set(0, 0, -0.55);
  pick(bonderCab, 'TC본더 프레임 (한미반도체)', 'HBM 등 다이 적층용 열압착(Thermo-Compression) 본더의 제어 캐비닛. 진동 저감을 위해 화강암/폴리머 콘크리트 베이스를 사용하는 대형 정밀 셀입니다.');
  bonder.add(bonderCab);

  const substrate1 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.06, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x2e7d4f, metalness: 0.2, roughness: 0.6 }));
  substrate1.position.set(0, 1.0, 0.85);
  pick(substrate1, '기판 스테이지 (인터포저/서브스트레이트)', '하부 스테이지에도 별도 히터가 내장되어 예열되며, 라미네이트 기판 또는 인터포저가 벡류 트레이 형태로 안착됩니다. FBGA 패키지의 뼈대입니다.');
  bonder.add(shadow(substrate1));

  const dieOnSub = makeDie({ w: 0.5, d: 0.4, h: 0.05, color: 0x474f66 });
  dieOnSub.position.set(-0.45, 1.06, 0.85);
  dieOnSub.visible = false;
  bonder.add(dieOnSub);

  // 듀얼 헤드: 독립 Z축 가압 컬럼 2조 (좌우 배치)
  function makeTcHead(dx) {
    const h = new THREE.Group();
    h.position.set(dx, 0, 0.85);
    const column = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.15, 0.12), MAT.steel(0x6b7488));
    column.position.y = 2.0;
    h.add(shadow(column));
    const carriage = new THREE.Group();
    carriage.position.y = 1.55;
    const heater = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.24), MAT.dark(0x232733));
    carriage.add(shadow(heater));
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.05, 16), MAT.steel(0x9aa4b5));
    tip.position.y = -0.095;
    carriage.add(shadow(tip));
    h.add(carriage);
    h.userData.carriage = carriage;
    h.userData.heater = heater;
    return h;
  }
  const headA = makeTcHead(-0.45);
  pick(headA.userData.heater, 'TC본더 헤드 A (가압 컬럼)', '독립 Z축 가압 컬럼과 세라믹 히터 블록을 갖춘 본드 헤드입니다. 다이싱 테이프에서 픽업한 다이를 기판 위에 정밀 배치(Pick & Place)합니다.');
  bonder.add(headA);
  const headB = makeTcHead(0.45);
  pick(headB.userData.heater, 'TC본더 헤드 B (열압착 헤드)', '두 번째 가압 컬럼으로, 세라믹 히터 블록이 다이를 수백°C로 가열하며 로드셀로 정밀 가압합니다. 듀얼 헤드 구조 덕분에 두 스택을 동시/교대로 처리해 생산성(UPH)을 2배로 확보합니다.');
  bonder.add(headB);

  const visionCam2 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.08, 12), MAT.dark(0x14161c));
  visionCam2.rotation.z = Math.PI / 2;
  visionCam2.position.set(0, 1.7, 0.5);
  pick(visionCam2, '정렬 비전 시스템', '다이와 기판의 범프 정렬을 수 μm 정밀도로 확인하는 상/하 동시 비전 카메라입니다.');
  bonder.add(shadow(visionCam2));

  // 와이어 본딩 서브 리그 (표준 패키지용, 헤드B 옆 공간에 배치)
  const wireArches = [];
  const wireAnchors = [
    { from: [-0.05, 1.14, 1.32], to: [-0.2, 1.06, 1.5] },
    { from: [0.15, 1.14, 1.32], to: [0.3, 1.06, 1.5] },
  ];
  const wbDie = makeDie({ w: 0.4, d: 0.32, h: 0.05, color: 0x474f66 });
  wbDie.position.set(0.05, 1.1, 1.32);
  wbDie.visible = false;
  bonder.add(wbDie);
  const substrateWb = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.05, 0.7),
    new THREE.MeshStandardMaterial({ color: 0x2e7d4f, metalness: 0.2, roughness: 0.6 }));
  substrateWb.position.set(0.05, 1.03, 1.32);
  substrateWb.visible = false;
  bonder.add(substrateWb);
  wireAnchors.forEach((a, idx) => {
    const from = new THREE.Vector3(...a.from);
    const to = new THREE.Vector3(...a.to);
    const mid = from.clone().lerp(to, 0.5).add(new THREE.Vector3(0, 0.2, 0));
    const curve = new THREE.CatmullRomCurve3([from, mid, to]);
    const geo = new THREE.TubeGeometry(curve, 24, 0.011, 8, false);
    const wire = new THREE.Mesh(geo, MAT.steel(0xe8c04a));
    wire.visible = false;
    if (idx === 0) pick(wire, '금 와이어 (Ball Bond)', '표준 FBGA 패키지는 와이어 끝을 전기 스파크(EFO)로 녹여 볼을 만든 뒤 칩 패드에 접합하고, 반대쪽은 웨지본딩으로 기판 리드에 연결합니다. 와이어 직경은 15~50μm입니다.');
    wireArches.push(wire);
    bonder.add(wire);
  });
  const capillaryArm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.4, 0.08), MAT.steel());
  capillaryArm.position.set(0.05, 1.85, 1.15);
  bonder.add(capillaryArm);
  const capillary = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.16, 16),
    new THREE.MeshStandardMaterial({ color: 0xf3ecd9, metalness: 0, roughness: 0.3, transparent: true, opacity: 0.85 }));
  capillary.position.set(0.05, 1.5, 1.15);
  pick(capillary, '캐필러리 (알루미나 세라믹)', '초소형 원뿔형 세라믹(알루미나, 흰색~아이보리 반투명) 툴로, 중앙 미세 구멍으로 와이어를 안내하며 초음파 진동과 압력으로 패드에 접합시킵니다.');
  bonder.add(capillary);
  const efoSpark = new THREE.Mesh(new THREE.SphereGeometry(0.025, 12, 12), MAT.glow(0xfff2a8, 3.0));
  efoSpark.position.set(0.05, 1.4, 1.15);
  efoSpark.visible = false;
  bonder.add(efoSpark);

  const towerBd = makeSignalTower();
  towerBd.position.set(-0.85, 2.15, 0.4);
  bonder.add(towerBd);
  const bonderLabel = makeLabel('다이 어태치 · TC/와이어 본딩', { color: '#f87171', size: 0.36 });
  bonder.add(bonderLabel);
  bonderLabel.position.set(0, 3.05, 0);
  group.add(bonder);

  /* ================= 3. 몰딩 프레스 (TOWA 스타일) ================= */
  const mold = new THREE.Group();
  mold.position.set(MOLD_X, 0, 0);

  // 4주식 유압 프레스 프레임
  const pressFrame = new THREE.Group();
  [[-0.62, -0.55], [0.62, -0.55], [-0.62, 0.55], [0.62, 0.55]].forEach(([px, pz]) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.2, 0.1), MAT.dark(0x2a2e38));
    post.position.set(px, 1.1, pz);
    pressFrame.add(shadow(post));
  });
  const topBeam = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.16, 1.3), MAT.dark(0x2a2e38));
  topBeam.position.set(0, 2.18, 0);
  pressFrame.add(shadow(topBeam));
  const hydCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.55, 20), MAT.steel(0x828da3));
  hydCylinder.position.set(0, 2.5, 0);
  pick(hydCylinder, '유압 실린더', '상형을 하강시켜 형체결(Clamping)하는 대형 유압 실린더입니다. 프레스 프레임은 두꺼운 강철(짙은 회색/검정 도장)로 제작되어 고압 성형 하중을 견딥니다.');
  pressFrame.add(shadow(hydCylinder));
  pick(pressFrame, '유압 프레스 프레임 (4주식)', 'EMC 봉지를 위한 트랜스퍼 몰딩 프레스의 지지 구조물. 4개의 포스트가 상형과 하형을 정렬된 상태로 유지하며 유압 실린더의 고압 하중을 지지합니다.');
  mold.add(pressFrame);

  const substrate3 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.06, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x2e7d4f, metalness: 0.2, roughness: 0.6 }));
  substrate3.position.set(0, 1.05, 0.85);
  mold.add(shadow(substrate3));

  const moldDie = makeDie({ w: 0.5, d: 0.4, h: 0.05, color: 0x474f66 });
  moldDie.position.set(0, 1.11, 0.85);
  mold.add(moldDie);

  const emcBlock = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.001, 0.75),
    new THREE.MeshStandardMaterial({ color: 0x241a12, metalness: 0.1, roughness: 0.7 }));
  emcBlock.position.set(0, 1.09, 0.85);
  pick(emcBlock, 'EMC 몰드 컴파운드 (성형 중)', '녹은 에폭시 수지(짙은 갈색~검정)가 트랜스퍼 플런저에 의해 런너를 통해 캐비티로 압송되어 다이와 와이어를 완전히 감쌉니다. 외부 충격, 습기, 오염으로부터 칩을 보호합니다.');
  mold.add(emcBlock);

  const upperPlate = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.14, 1.1), MAT.dark(0x3a3f4a));
  upperPlate.position.set(0, 2.0, 0.85);
  pick(upperPlate, '상부 금형 (Upper Mold)', '공구강(다크그레이) 재질의 금형으로 카트리지 히터가 내장되어 150~180°C로 가열됩니다. 유압 실린더에 의해 하강해 하형과 형체결됩니다.');
  mold.add(shadow(upperPlate));
  const lowerPlate = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.14, 1.1), MAT.dark(0x3a3f4a));
  lowerPlate.position.set(0, 0.95, 0.85);
  pick(lowerPlate, '하부 금형 (Lower Mold)', '칩+기판이 들어갈 캐비티(오목한 홈)가 다수 배열된 하형입니다. 성형 완료 후 이젝터 핀이 제품을 금형에서 분리합니다.');
  mold.add(shadow(lowerPlate));

  // 트랜스퍼 포트 + EMC 태블릿 + 플런저
  const transferPot = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.18, 20), MAT.dark(0x1f232b));
  transferPot.position.set(-0.75, 0.98, 0.85);
  mold.add(shadow(transferPot));
  const plunger = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.3, 16), MAT.steel(0xc3c9d4));
  plunger.position.set(-0.75, 0.85, 0.85);
  pick(plunger, '트랜스퍼 플런저', '포트 내부에서 수직으로 상승하는 스테인리스 피스톤입니다. 유압으로 밀어올려 녹은 EMC를 런너를 통해 각 캐비티로 압송합니다.');
  mold.add(shadow(plunger));
  const emcTablets = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const tab = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.06, 16),
      new THREE.MeshStandardMaterial({ color: 0x2b1d14, metalness: 0.05, roughness: 0.75 }));
    tab.position.set(-0.75, 1.35 + i * 0.07, 0.85);
    emcTablets.add(shadow(tab));
  }
  pick(emcTablets, 'EMC 태블릿 (몰드 컴파운드 원료)', '고형 에폭시 몰딩 컴파운드 알갱이/정제(짙은 갈색~검정). 포트에 투입되면 금형 열에 의해 녹아 점성 액체로 변합니다.');
  mold.add(emcTablets);

  const towerM = makeSignalTower();
  towerM.position.set(-0.95, 2.3, 0.4);
  mold.add(towerM);
  const moldLabel = makeLabel('EMC 몰딩 (Molding)', { color: '#f87171', size: 0.4 });
  moldLabel.position.set(0, 3.1, 0);
  mold.add(moldLabel);
  group.add(mold);

  /* ================= 4. 리플로우 오븐 (터널형) + 볼마운트/마킹 인라인 ================= */
  const reflow = new THREE.Group();
  reflow.position.set(REFLOW_X, 0, 0);
  const OVEN_Y = 1.0; // 컨베이어(바닥) 높이

  // 터널 하우징: 바닥+뒷벽+지붕만 (앞면/양끝 개방 → 내부 노출)
  const tunnelFloor = new THREE.Mesh(new THREE.BoxGeometry(REFLOW_LEN, 0.06, 0.9), MAT.paint(0xe6e9ef));
  tunnelFloor.position.set(0, OVEN_Y, 0);
  pick(tunnelFloor, '리플로우 오븐 (터널형 연속가열로)', '길이 3~6m의 터널형 하우징(라이트그레이~화이트 판금 외장) 내부를 메쉬 컨베이어가 관통합니다. 앞면이 개방되어 있어 내부 히팅존과 컨베이어 흐름을 볼 수 있습니다.');
  reflow.add(shadow(tunnelFloor));
  const tunnelBack = new THREE.Mesh(new THREE.BoxGeometry(REFLOW_LEN, 0.75, 0.06), MAT.paint(0xdde3ec));
  tunnelBack.position.set(0, OVEN_Y + 0.42, -0.44);
  reflow.add(shadow(tunnelBack));
  const tunnelRoof = new THREE.Mesh(new THREE.BoxGeometry(REFLOW_LEN, 0.05, 0.9), MAT.paint(0xdde3ec));
  tunnelRoof.position.set(0, OVEN_Y + 0.8, 0);
  reflow.add(shadow(tunnelRoof));

  // 메쉬 컨베이어 (스테인리스 와이어 메쉬)
  const conveyor = new THREE.Mesh(new THREE.BoxGeometry(REFLOW_LEN + 1.2, 0.02, 0.5),
    new THREE.MeshStandardMaterial({ color: 0xb9c2d4, metalness: 0.8, roughness: 0.5, wireframe: true }));
  conveyor.position.set(0, OVEN_Y + 0.04, 0);
  pick(conveyor, '메쉬 컨베이어 벨트', '스테인리스 와이어 메쉬(은색) 벨트가 입구부터 출구까지 일정 속도로 기판/패키지 스트립을 이송합니다.');
  reflow.add(conveyor);

  // 다중 히팅 존 (예열→균열→피크→냉각 색 그라데이션 발광)
  const ZONE_N = 8;
  const zoneStops = [0x2a63c9, 0x2a63c9, 0xe0b23a, 0xe0b23a, 0xe4462a, 0xe0b23a, 0x2a63c9, 0x2a63c9];
  const zonePanels = [];
  for (let i = 0; i < ZONE_N; i++) {
    const zx = -REFLOW_LEN / 2 + (i + 0.5) * (REFLOW_LEN / ZONE_N);
    const panel = new THREE.Mesh(new THREE.BoxGeometry(REFLOW_LEN / ZONE_N - 0.03, 0.05, 0.75),
      MAT.glow(zoneStops[i], 1.1));
    panel.position.set(zx, OVEN_Y + 0.74, 0);
    if (i === 2) pick(panel, '히팅 존 (예열/균열/피크/냉각)', '터널 내부는 길이 방향으로 8~12개 존으로 나뉘며 각 존 상하에 독립 히터 패널이 배치됩니다. 예열→균열→피크 리플로우(가장 뜨거움)→냉각 순으로 온도가 파랑→노랑→빨강→파랑으로 변화합니다.');
    zonePanels.push(panel);
    reflow.add(panel);
  }

  // 냉각존 방열핀 (출구, makeTurboPump 재활용)
  const coolFin = makeTurboPump({ r: 0.16, h: 0.4 });
  coolFin.rotation.z = Math.PI / 2;
  coolFin.position.set(REFLOW_LEN / 2 - 0.2, OVEN_Y + 0.55, -0.3);
  pick(coolFin, '냉각존 열교환기 (방열핀)', '출구 쪽에 배치된 방열핀(은색 알루미늄) 열교환기로 급속 냉각을 수행해 솔더 접합부를 안정적으로 응고시킵니다.');
  reflow.add(coolFin);

  // N2 분위기 공급 시스템 (makeGasBox 재활용, 축소)
  const n2Box = makeGasBox({ w: 0.6, h: 0.55, lines: 3 });
  n2Box.scale.setScalar(0.85);
  n2Box.position.set(-REFLOW_LEN / 2 + 0.15, OVEN_Y + 0.82, -0.3);
  pick(n2Box, 'N2 분위기 공급 시스템', '터널 상부의 질소(N2) 공급 배관과 산소농도 센서로 오븐 내부를 저산소 분위기로 유지해 솔더 산화를 방지합니다.');
  reflow.add(n2Box);

  const reflowScreen = makeScreenPanel({ w: 0.55, h: 0.34, accent: '#e0b23a' });
  reflowScreen.rotation.y = Math.PI;
  reflowScreen.position.set(REFLOW_LEN / 2 + 0.05, OVEN_Y + 0.5, -0.3);
  pick(reflowScreen, '온도 프로파일 모니터', '존별 실측 온도 프로파일을 표시해 피크 온도·냉각 속도가 규격 내에 있는지 확인합니다.');
  reflow.add(reflowScreen);

  // 솔더볼 마운트 헤드 (입구 앞, 인라인)
  const mountX = -REFLOW_LEN / 2 - 0.85;
  const fluxPlate = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.42), MAT.steel(0xc3c9d4));
  fluxPlate.position.set(mountX, OVEN_Y - 0.03, 0);
  pick(fluxPlate, '플럭스 트랜스퍼 플레이트', '얕은 평판에 얇게 편 플럭스(반투명 점성액)를 기판에 살짝 눌러 볼 패드에만 묻도록 도포합니다.');
  reflow.add(shadow(fluxPlate));
  const ballHead = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.1, 0.36), MAT.steel(0xaab3c4));
  ballHead.position.set(mountX, OVEN_Y + 0.5, 0);
  pick(ballHead, '솔더볼 마운트 헤드', '기판의 볼 패드 배열과 동일한 패턴의 진공 흡착홀이 뚫린 헤드 플레이트입니다. 볼 서플라이 호퍼에서 공급된 솔더볼(지름 0.2~0.6mm)을 정렬 흡착해 기판 위에 동시에 내려놓습니다.');
  reflow.add(shadow(ballHead));
  const ballHopper = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.2, 16),
    new THREE.MeshPhysicalMaterial({ color: 0xdfe6ee, transparent: true, opacity: 0.5, roughness: 0.2 }));
  ballHopper.position.set(mountX + 0.25, OVEN_Y + 0.65, 0);
  reflow.add(ballHopper);

  // 레이저 마킹 헤드 (출구 뒤, 인라인)
  const markX = REFLOW_LEN / 2 + 0.9;
  const scannerHead = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.28), MAT.dark(0x1c1f27));
  scannerHead.position.set(markX, OVEN_Y + 0.55, 0);
  pick(scannerHead, '갈바노 스캐너 헤드 (레이저 마킹)', 'X·Y 2축 회전 미러가 직교 배치되어 레이저를 편향시키는 검정 하우징입니다. F-세타 렌즈로 마킹면 전체에서 초점을 보정해 패키지 표면에 제품 정보를 각인합니다.');
  reflow.add(shadow(scannerHead));
  const markBeam = makeBeam([markX, OVEN_Y + 0.45, 0], [markX, OVEN_Y + 0.04, 0], { color: 0xff5a2a, radius: 0.01, opacity: 0.9 });
  markBeam.visible = false;
  reflow.add(markBeam);

  // 컨베이어를 흘러가는 패키지 토큰들
  const FLOW_START = mountX - 0.4, FLOW_END = markX + 0.5;
  const packages = [];
  for (let i = 0; i < 5; i++) {
    const pkg = new THREE.Group();
    const sub = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.03, 0.28),
      new THREE.MeshStandardMaterial({ color: 0x2e7d4f, metalness: 0.2, roughness: 0.6 }));
    pkg.add(sub);
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.09, 0.24), MAT.dark(0x241a12));
    body.position.y = 0.06;
    body.material.emissive = new THREE.Color(0xff5a2a);
    body.material.emissiveIntensity = 0;
    pkg.add(body);
    const balls = new THREE.Group();
    for (let bx = -1; bx <= 1; bx++) {
      for (let bz = -1; bz <= 1; bz++) {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), MAT.steel(0xc3c9d4));
        b.position.set(bx * 0.09, -0.02, bz * 0.07);
        balls.add(b);
      }
    }
    balls.visible = false;
    pkg.add(balls);
    pkg.userData.balls = balls;
    pkg.userData.phase = i / 5;
    pkg.position.set(FLOW_START, OVEN_Y + 0.06, 0);
    if (i === 0) pick(pkg, '이송 중인 패키지', '솔더볼 마운트 → 리플로우(다중 히팅존) → 레이저 마킹을 거쳐 완제품이 되는 패키지 스트립입니다.');
    packages.push(pkg);
    reflow.add(pkg);
  }

  const towerR = makeSignalTower();
  towerR.position.set(-REFLOW_LEN / 2 - 0.1, OVEN_Y + 1.3, 0.55);
  reflow.add(towerR);
  const reflowLabel = makeLabel('볼마운트 · 리플로우 · 마킹', { color: '#f87171', size: 0.36 });
  reflowLabel.position.set(0, OVEN_Y + 1.55, 0);
  reflow.add(reflowLabel);
  group.add(reflow);

  /* ================= 5. 완성 FBGA 패키지 확대 전시 ================= */
  const display = new THREE.Group();
  display.position.set(FINAL_X, 0, 0);

  const displayPedestal = makePedestal({ r: 0.4, y: 0.9 });
  display.add(displayPedestal);

  const finalPackage = new THREE.Group();
  const finalSub = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.08, 0.7),
    new THREE.MeshStandardMaterial({ color: 0x2e7d4f, metalness: 0.2, roughness: 0.6 }));
  finalPackage.add(finalSub);
  const finalMold = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.24, 0.62), MAT.dark(0x241a12));
  finalMold.position.y = 0.16;
  finalPackage.add(finalMold);
  const finalBalls = new THREE.Group();
  for (let i = -3; i <= 3; i++) {
    for (let j = -2; j <= 2; j++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 10), MAT.steel(0xc3c9d4));
      b.position.set(i * 0.1, -0.045, j * 0.09);
      finalBalls.add(b);
    }
  }
  finalPackage.add(finalBalls);
  const finalLabel = makeLabel('FBGA', { color: '#f87171', size: 0.34 });
  finalLabel.position.set(0, 0.48, 0);
  finalPackage.add(finalLabel);
  pick(finalPackage, '완성된 FBGA 패키지', '백그라인딩부터 솔더볼 마운트·리플로우·마킹까지 모든 후공정을 거쳐 완성된 최종 메모리 패키지입니다. 미세피치 솔더볼 배열이 특징이며, 확대 전시되어 있습니다.');
  finalPackage.position.set(0, 1.35, 0);
  finalPackage.visible = false;
  display.add(shadow(finalPackage));

  const finalBeam = makeBeam([0, 2.6, 0], [0, 1.4, 0], { color: 0xffe08a, radius: 0.02, opacity: 0.0 });
  display.add(finalBeam);

  group.add(display);

  /* ================= 단계 연출 ================= */
  const EMC_TARGET = 90;
  let grindOn = true, bladeOn = false;
  let dieAttachOn = false, tcBondOn = false, wireBondOn = false;
  let moldState = 0;
  let lineRunning = false, markingOn = false, finalShown = false, stepTimer = 0;

  const stepFx = [
    () => { // 0: 백그라인딩
      grindOn = true; bladeOn = false;
      show(grindWheel, grindDust); hide(cutLines);
      towerD.userData.setState('run');
      towerBd.userData.setState('warn'); towerM.userData.setState('warn'); towerR.userData.setState('warn');
    },
    () => { // 1: 다이싱
      grindOn = false; bladeOn = true;
      hide(grindWheel, grindDust); show(cutLines);
      towerD.userData.setState('run');
      towerBd.userData.setState('warn'); towerM.userData.setState('warn'); towerR.userData.setState('warn');
    },
    () => { // 2: 다이 어태치
      dieAttachOn = true; tcBondOn = false; wireBondOn = false;
      dieOnSub.visible = true;
      wireArches.forEach(w => { w.visible = false; }); wbDie.visible = false; substrateWb.visible = false;
      moldState = 0; emcBlock.scale.y = 1; emcBlock.position.y = 1.09;
      towerD.userData.setState('warn'); towerBd.userData.setState('run');
      towerM.userData.setState('warn'); towerR.userData.setState('warn');
    },
    () => { // 3: 와이어 본딩 / TC 압착 본딩
      dieAttachOn = false; tcBondOn = true; wireBondOn = true;
      wbDie.visible = true; substrateWb.visible = true;
      wireArches.forEach(w => { w.visible = false; });
      towerD.userData.setState('warn'); towerBd.userData.setState('run');
      towerM.userData.setState('warn'); towerR.userData.setState('warn');
    },
    () => { // 4: EMC 몰딩
      wireArches.forEach(w => { w.visible = true; });
      moldState = 1; emcBlock.scale.y = 1; emcBlock.position.y = 1.09;
      towerD.userData.setState('warn'); towerBd.userData.setState('warn');
      towerM.userData.setState('run'); towerR.userData.setState('warn');
    },
    () => { // 5: 솔더볼 마운트 · 리플로우 · 마킹
      lineRunning = true; markingOn = true; finalShown = false; stepTimer = 0;
      finalPackage.visible = false;
      wireArches.forEach(w => { w.visible = true; });
      moldState = 2; emcBlock.scale.y = EMC_TARGET; emcBlock.position.y = 1.09 + EMC_TARGET * 0.0005;
      towerD.userData.setState('warn'); towerBd.userData.setState('warn');
      towerM.userData.setState('warn'); towerR.userData.setState('run');
    },
  ];

  stepFx[0]();

  return {
    group,
    setStep(i) { stepFx[Math.min(i, stepFx.length - 1)]?.(); },
    tick(t, dt) {
      // 다이싱 소
      if (grindOn) grindWheel.rotation.y += 3.0 * dt;
      bladeSpindle.userData.wheel.rotation.x += (bladeOn ? 55 : 3) * dt;
      diceWafer.rotation.y += 0.12 * dt;
      grindDust.userData.tick(dt);
      if (bladeOn) cutWaterSpray.userData.tick(dt);

      // TC본더: 헤드 A(다이 어태치)·헤드 B(TC 압착) 교대 가압
      const phaseA = Math.sin(t * 1.6) * 0.5 + 0.5;
      headA.userData.carriage.position.y = 1.55 - (dieAttachOn ? phaseA * 0.42 : 0.05);
      dieOnSub.visible = dieAttachOn;
      if (dieOnSub.visible) dieOnSub.position.y = 1.06;
      const phaseB = Math.sin(t * 1.6 + Math.PI) * 0.5 + 0.5;
      headB.userData.carriage.position.y = 1.55 - (tcBondOn ? phaseB * 0.42 : 0.05);

      // 와이어 본딩: 캐필러리가 위아래로 움직이며 EFO 스파크 발생
      if (wireBondOn) {
        capillary.position.y = 1.5 + Math.sin(t * 6) * 0.03;
        efoSpark.visible = Math.sin(t * 6) > 0.8;
        efoSpark.material.emissiveIntensity = 2 + Math.sin(t * 20) * 1.5;
      } else {
        efoSpark.visible = false;
      }

      // 몰딩 프레스: 위아래로 개폐, EMC는 성형 단계에서만 서서히 차오름
      const pressPhase = Math.sin(t * 0.8) * 0.5 + 0.5;
      upperPlate.position.y = 2.0 - pressPhase * 0.75;
      hydCylinder.scale.y = 1 - pressPhase * 0.25;
      if (moldState === 1 && emcBlock.scale.y < EMC_TARGET) {
        emcBlock.scale.y = Math.min(EMC_TARGET, emcBlock.scale.y + dt * 40);
        emcBlock.position.y = 1.09 + emcBlock.scale.y * 0.0005;
      }

      // 리플로우 오븐: 히팅존 맥동 발광 + 컨베이어 위 패키지 흐름
      zonePanels.forEach((p, i) => {
        p.material.emissiveIntensity = 0.9 + Math.sin(t * 2 + i * 0.6) * 0.35;
      });
      const flowSpeed = lineRunning ? 0.55 : 0.12;
      packages.forEach(pkg => {
        pkg.position.x += flowSpeed * dt;
        if (pkg.position.x > FLOW_END) pkg.position.x = FLOW_START;
        pkg.userData.balls.visible = pkg.position.x > mountX + 0.3;
        const inPeak = Math.abs(pkg.position.x - 0) < REFLOW_LEN * 0.14;
        pkg.children[1].material.emissiveIntensity = inPeak ? 0.6 : 0;
      });
      if (markingOn) {
        stepTimer += dt;
        const nearMark = packages.some(p => Math.abs(p.position.x - markX) < 0.3);
        markBeam.visible = nearMark;
        markBeam.material.opacity = 0.5 + Math.sin(t * 12) * 0.35;
        if (!finalShown && stepTimer > 3.5) { finalPackage.visible = true; finalShown = true; }
      } else {
        markBeam.visible = false;
      }
      if (finalPackage.visible) {
        finalPackage.rotation.y += 0.5 * dt;
        finalBeam.material.opacity = 0.35 + Math.sin(t * 3) * 0.15;
      } else {
        finalBeam.material.opacity = 0;
      }
    },
  };
}
