// EDS(Electrical Die Sorting) 공정 모듈 — 프로버 + ATE 테스터 + 로더(FOUP)
// export 계약: camera, content, build3D(ctx) -> { group, setStep(i), tick(t,dt) }
import * as THREE from 'three';
import {
  MAT, pick, shadow, makeWafer, makeCabinet, makeLoadPort, makeRobotArm,
  makeBeam, makeLabel, makeSignalTower, makePipe,
} from '../lib/equip-kit.js';

export const camera = { pos: [8, 6, 11], target: [0, 1.3, 0] };

export const content = {
  overview:
    'EDS(Electrical Die Sorting, 전기적 다이 소팅)는 전공정(FAB)이 끝난 웨이퍼를 패키징하기 전, 웨이퍼에 새겨진 각각의 다이(칩)를 전기적으로 검사해 양품과 불량품을 선별하는 웨이퍼 레벨 테스트 공정입니다. ' +
    '프로버(Prober)가 웨이퍼를 척(chuck)에 진공으로 고정하고 다이 단위로 스텝 이동(인덱싱)시키면, 프로브 카드에 부착된 수백~수천 개의 미세 니들(핀)이 다이의 본딩 패드에 접촉해 전기 신호를 주고받고, ' +
    'ATE(자동시험장비) 테스터가 이 신호를 해석해 양/불량을 판정합니다. DRAM과 같은 메모리는 셀 배열에 예비(redundancy) 회로를 두므로, 결함이 발견된 셀은 레이저로 퓨즈를 절단해 예비 셀로 대체하는 ' +
    '리페어(Repair)를 통해 상당수를 구제할 수 있습니다. 모든 판정 결과는 다이 좌표별로 Wafer Bin Map(빈맵)이라는 디지털 맵에 기록되어 과거의 물리적 잉킹(Inking)을 대체하며, 이후 패키징 공정에서 ' +
    '양품 다이만 골라 쓰는 기준이 됩니다. EDS는 불량 다이에 조립 비용을 낭비하지 않도록 사전에 걸러내는 단계로, 반도체 수율(yield)을 관리하는 핵심 지표 역할을 합니다.',
  keyPoints: [
    'EDS는 ET Test/WBI(웨이퍼 번인) → Hot/Cold Test → Repair/Final Test → Inking(현재는 전자 데이터 처리) 순의 4단계로 진행됩니다',
    '프로브 카드는 캔틸레버·버티컬·MEMS(멤브레인) 타입으로 나뉘며, 미세 피치·고핀수 디바이스일수록 버티컬/MEMS 방식이 유리합니다',
    '메모리는 중복(redundancy) 설계 덕분에 레이저 퓨즈 리페어로 불량 셀을 예비 셀로 치환해 수율을 크게 끌어올릴 수 있습니다',
    'Wafer Bin Map의 공간적 실패 패턴(edge, center, ring, donut, loc, scratch, random)은 그 자체로 공정 이상을 진단하는 지문(fingerprint) 역할을 합니다',
    '프로버(TEL/SEMES)와 테스터(Advantest)는 서로 다른 장비이며, 광학 정렬로 얼라인 후 접촉해 신호를 주고받는 구조로 연동됩니다',
    '다이 단위 스텝 인덱싱 속도와 병렬 테스트(멀티 DUT) 수가 EDS 테스트 처리량(throughput)을 좌우합니다',
  ],
  hbmNote:
    'HBM/DRAM은 셀 배열이 방대하기 때문에 EDS 초반 단계인 웨이퍼 번인(WBI)과 레이저 퓨즈 리페어가 로직 반도체보다 훨씬 광범위하게 활용되어 수율을 끌어올립니다. ' +
    'HBM은 다이를 TSV로 적층하기 전, 개별 다이 단계에서 EDS를 통과한 양품(Known Good Die)만 선별해야 적층 후 하나의 불량 다이가 전체 스택을 폐기시키는 손실을 막을 수 있어 이 공정의 중요성이 더욱 큽니다.',
  steps: [
    { name: '웨이퍼 로딩', desc: 'OHT로 도착한 FOUP에서 이송 로봇이 웨이퍼를 꺼내 프로버의 웨이퍼 척 위에 로딩합니다.', camera: { pos: [-3.2, 4, 5.5], target: [-4.5, 1.0, 0.6] } },
    { name: '얼라인 (광학 정렬)', desc: '광학 패턴 인식(optics)으로 웨이퍼 노치와 다이 좌표를 인식해 프로브 카드와 정확히 정렬되도록 척을 미세 이동시킵니다.', camera: { pos: [1.4, 3.6, 4.5], target: [-0.3, 1.1, 0] } },
    { name: '프로브 콘택', desc: '얼라인이 끝나면 척이 상승해 프로브 카드의 니들 끝을 다이 본딩 패드에 접촉시킵니다. 접촉 순간 미세 스파크와 함께 회로가 통전됩니다.', camera: { pos: [0.9, 2.4, 2.6], target: [-0.3, 0.95, 0] } },
    { name: '전기 테스트 (다이 스텝 인덱싱)', desc: '척이 다이 하나씩 스텝 이동(인덱싱)하며 각 다이의 전기적 특성을 검사합니다. 결과는 실시간으로 Wafer Bin Map에 기록됩니다.', camera: { pos: [2.4, 5, 6.5], target: [-0.3, 1.2, 0] } },
    { name: '리페어 (레이저 퓨즈 컷팅)', desc: '리던던시 분석(RA)으로 찾은 불량 셀 주소에 레이저 빔을 쏘아 폴리실리콘 퓨즈를 절단, 예비(spare) 셀로 배선을 전환합니다.', camera: { pos: [-1.2, 3, 3.4], target: [-0.1, 1.0, 0.2] } },
    { name: '빈맵 생성 & 판정', desc: '전수 검사와 리페어가 끝난 웨이퍼의 최종 결과가 Bin Map으로 완성되어 테스터 화면에 표시되고, 패키징 공정으로 데이터가 전달됩니다.', camera: { pos: [6.2, 4.2, 5], target: [3.6, 1.9, -0.3] } },
  ],
  equipment: [
    { name: '웨이퍼 프로버 Precio XL', vendor: 'Tokyo Electron (TEL)', role: '300mm 웨이퍼를 자동 로딩·정렬·다이 단위 인덱싱하며 프로브 카드와 접촉시키는 완전자동 프로빙 플랫폼.', spec: '고생산성 인덱싱 / 접촉 성능·클린니스 개선' },
    { name: '차세대 프로버 SEMPRO PRIME', vendor: 'SEMES (세메스)', role: '삼성전자 계열 국내 최대 후공정 장비사의 웨이퍼 전기특성 검사 프로버.', spec: 'iF·레드닷 디자인 어워드 수상' },
    { name: 'ATE 테스터 V93000 HSM', vendor: 'Advantest', role: '프로브 카드를 통해 전달된 신호를 해석해 다이별 양/불량과 spec 등급을 판정하는 고성능 메모리 테스트 플랫폼.', spec: 'DDR/LPDDR/GDDR 등 고성능 DRAM 대응 확장 아키텍처' },
    { name: '프로브 카드 (버티컬/MEMS 타입)', vendor: 'FormFactor 등', role: '수백~수천 개의 미세 니들(텅스텐/BeCu)로 다이 패드에 물리적으로 접촉해 테스터와 웨이퍼 사이 신호를 중계하는 핵심 소모품.', spec: '미세피치·멀티 DUT 대응' },
    { name: '레이저 리페어 시스템', vendor: 'ESI (Electro Scientific Industries)', role: 'EDS 결과의 defect map을 받아 불량 셀의 폴리실리콘 퓨즈를 레이저로 절단하고 예비 셀로 전환하는 웨이퍼 레벨 리페어 장비.', spec: '전기 퓨즈 대비 처리속도·비용 효율 우수' },
  ],
  parameters: [
    { name: '콘택 저항 (Contact Resistance)', typical: '수십 mΩ~수 Ω 이내', monitor: '프로브 카드 콘택 테스트, 니들 청소/교체 주기 관리' },
    { name: '오버드라이브 (Overdrive)', typical: '패드 손상 없이 안정 접촉되는 수십 μm 범위', monitor: '프로버 Z축 힘·변위 센서, 니들 마모도 점검' },
    { name: '테스트 온도 (Hot/Cold)', typical: '고온/저온 각 스펙 마진 (예: -20~+85°C 대)', monitor: '척 온도 챔버 센서, 온도별 Bin 분리 결과' },
    { name: 'Bin1 수율 (Yield)', typical: '공정/디바이스별 관리 목표치 대비 추적', monitor: 'Wafer Bin Map 집계, SPC 수율 트렌드 차트' },
    { name: '리페어 성공률 (Repair Yield)', typical: '리페어 대상 중 대부분 정상 복구 목표', monitor: 'Repair 전/후 Bin 비교, Final Test 재검증' },
  ],
  defects: [
    { name: 'Edge Fail 패턴', signature: 'Wafer Bin Map에서 웨이퍼 최외곽 링(edge)에 실패 다이가 집중되어 나타남', cause: 'edge exclusion 부족, 코팅/노광 시 edge bead 잔류, 이온주입 edge 빔 프로파일 저하, 웨이퍼 핸들링 중 edge chipping', action: 'Edge Bead Removal(EBR) 강화, 각 공정 edge 보정 레시피 최적화, 캐리어·척 edge 접촉부 점검' },
    { name: 'Center Fail 패턴', signature: 'Bin Map에서 웨이퍼 중심부에 실패가 집중', cause: '증착 단계 가스/액체 flow가 중심에서 이상, 스핀코팅 노즐 위치 편향, CMP 압력 프로파일이 center에서 과도/부족', action: '샤워헤드 대칭성 점검, 스핀코터 노즐 재정렬, CMP 압력 프로파일 재조정' },
    { name: 'Ring(Edge-Ring) 패턴', signature: '웨이퍼 edge에서 일정 반경 안쪽에 도넛형 고리 실패가 나타남', cause: '식각 챔버 edge 근처 플라즈마 밀도 불균일, 저장/이송 중 레이어 간 정렬(overlay) 틀어짐', action: 'Edge ring 소모품 마모 점검·교체, 플라즈마 균일성 튜닝, 이송 트레이 정렬 정밀도 점검' },
    { name: 'Loc(국소 클러스터)/Scratch 패턴', signature: 'Bin Map에서 특정 국소 영역에 실패가 뭉치거나(loc), 웨이퍼를 가로지르는 직선형 실패 라인(scratch)이 나타남', cause: '챔버 내 특정 위치의 파티클(이물) 낙하, 웨이퍼 이송 로봇 핸드오프 오류로 인한 물리적 긁힘', action: '파티클 소스 트레이스백 및 해당 슬롯 청소, 로봇 핸드오프 티칭 재조정' },
    { name: 'Random(무작위) 패턴', signature: '공간적 상관관계 없이 Bin Map 전역에 무작위로 흩어진 실패', cause: '통계적으로 낮은 확률의 결함(랜덤 파티클, 설계 마진 부족 등) — 특정 공정 이상이라기보다 baseline defect density', action: '개별 원인 추적보다 전체 파티클 총량 관리 및 설계 마진 재검토' },
  ],
};

export function build3D(ctx) {
  const group = new THREE.Group();
  const gridN = 5;
  const spacing = 0.16;
  const offsets = [];
  for (let i = 0; i < gridN; i++) offsets.push((i - (gridN - 1) / 2) * spacing);

  // 다이별 결과 사전 계산 — 웨이퍼 edge 쪽에 실패가 몰리는 edge-fail 성향으로 생성(교육적 재현)
  const dies = [];
  const cx = (gridN - 1) / 2;
  for (let r = 0; r < gridN; r++) {
    for (let c = 0; c < gridN; c++) {
      const dist = Math.sqrt((r - cx) * (r - cx) + (c - cx) * (c - cx)) / (Math.sqrt(2) * cx);
      const failProb = 0.08 + (dist > 0.7 ? 0.4 : 0);
      const isFail = Math.random() < failProb;
      const repairable = isFail && Math.random() < 0.55;
      dies.push({ r, c, x: offsets[c], z: offsets[r], result: isFail ? 'fail' : 'pass', repairable, state: 'untested' });
    }
  }
  const testOrder = dies.map((_, i) => i);
  const repairTargets = () => dies.map((d, i) => ({ d, i })).filter(o => o.d.result === 'fail' && o.d.repairable && o.d.state !== 'repaired');

  /* ================= 빈맵 캔버스 ================= */
  const binCanvas = document.createElement('canvas');
  binCanvas.width = binCanvas.height = 260;
  const binCtx2d = binCanvas.getContext('2d');
  const binTex = new THREE.CanvasTexture(binCanvas);
  binTex.colorSpace = THREE.SRGBColorSpace;
  function drawBinMap() {
    binCtx2d.fillStyle = '#11151f';
    binCtx2d.fillRect(0, 0, 260, 260);
    const cell = 260 / gridN;
    for (const d of dies) {
      let col = '#3a4356';
      if (d.state === 'pass') col = '#3ddc84';
      else if (d.state === 'fail') col = '#ff4d6d';
      else if (d.state === 'repaired') col = '#22d3ee';
      binCtx2d.fillStyle = col;
      const x = d.c * cell, y = d.r * cell;
      binCtx2d.fillRect(x + 2, y + 2, cell - 4, cell - 4);
    }
    binTex.needsUpdate = true;
  }
  drawBinMap();

  /* ================= 로더 (좌측: FOUP + 이송 로봇) ================= */
  const loader = new THREE.Group();
  loader.position.set(-5.3, 0, 0.8);

  const loadPort = makeLoadPort();
  pick(loadPort, '로드포트 & FOUP', '25장 웨이퍼가 담긴 FOUP이 OHT(천장 반송)로 도착해 거치되는 곳. 여기서 웨이퍼가 한 장씩 반출됩니다.');
  loader.add(loadPort);

  const robot = makeRobotArm({ reach: 1.3 });
  robot.position.set(1.4, 0, -0.5);
  pick(robot, '웨이퍼 이송 로봇', 'FOUP에서 웨이퍼를 꺼내 프로버의 웨이퍼 척으로 반송합니다.');
  loader.add(robot);

  const carriedWafer = makeWafer(0.32, { tint: '#7c6cff', thickness: 0.02, dieGrid: 8 });
  carriedWafer.position.set(0, 0.02, 0);
  robot.userData.endEffector.add(carriedWafer);

  group.add(loader);

  /* ================= 프로버 (중앙) ================= */
  const prober = new THREE.Group();
  prober.position.set(-0.3, 0, 0);

  const proberBody = makeCabinet({ w: 2.6, h: 0.5, d: 2.6, color: 0xd8dee8, screen: false });
  pick(proberBody, '프로버 본체 (TEL Precio XL)', '웨이퍼를 자동 로딩·정렬·다이 단위 인덱싱하며 프로브 카드와 접촉시키는 프로빙 플랫폼.');
  prober.add(proberBody);

  const stageBase = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.14, 1.5), MAT.steel(0x6b7488));
  stageBase.position.set(0, 0.55, 0);
  prober.add(shadow(stageBase));

  // 척+웨이퍼: 인덱싱/얼라인/콘택에 따라 위치가 변하는 스테이지
  const chuckStage = new THREE.Group();
  const chuck = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.66, 0.14, 40), MAT.dark(0x39415a));
  chuck.position.y = 0.72;
  pick(chuck, '웨이퍼 척 (Wafer Chuck)', '진공으로 웨이퍼를 고정하고 X/Y/Z 방향으로 정밀 이동하며 다이 단위로 스텝 인덱싱하는 스테이지.');
  chuckStage.add(shadow(chuck));
  const mainWafer = makeWafer(0.55, { tint: '#8877ff', dieGrid: gridN * 2 });
  mainWafer.position.y = 0.81;
  pick(mainWafer, '테스트 대상 웨이퍼', 'EDS 검사를 받는 웨이퍼. 다이 하나하나가 프로브 카드 아래로 순서대로 지나갑니다.');
  chuckStage.add(mainWafer);
  prober.add(chuckStage);

  // 프로브 카드(고정) + 니들 + 테스트헤드
  const probeAssembly = new THREE.Group();
  const cardPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.05, 32), MAT.dark(0x2a3244));
  cardPlate.position.y = 1.0;
  pick(cardPlate, 'PCB 프로브 카드', '테스터 신호를 웨이퍼까지 전달하는 인터페이스 기판. 수백~수천 개의 미세 니들이 부착됩니다.');
  probeAssembly.add(shadow(cardPlate));

  const needles = new THREE.Group();
  const needleMat = MAT.gold();
  const needleRings = [ { n: 14, rr: 0.42 }, { n: 10, rr: 0.24 } ];
  for (const ring of needleRings) {
    for (let i = 0; i < ring.n; i++) {
      const a = (i / ring.n) * Math.PI * 2;
      const nx = Math.cos(a) * ring.rr, nz = Math.sin(a) * ring.rr;
      const needle = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.003, 0.13, 6), needleMat);
      needle.position.set(nx, 0.935, nz);
      needles.add(needle);
    }
  }
  pick(needles, '프로브 니들 (텅스텐/BeCu)', '다이의 본딩 패드에 물리적으로 접촉해 테스터와 웨이퍼 사이 전기 신호를 중계하는 미세 핀. 재질은 텅스텐·베릴륨코퍼 등.');
  probeAssembly.add(needles);

  const headColumn = makePipe([[0, 1.02, 0], [0, 1.3, 0]], { radius: 0.1, color: 0x828da3 });
  probeAssembly.add(headColumn);
  const testHead = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.9), MAT.paint(0xc0c9d8));
  testHead.position.y = 1.55;
  pick(testHead, 'Advantest 테스트 헤드', '테스터 본체(ATE)와 프로브 카드 사이의 전자 인터페이스. 프로브 카드에서 받은 신호를 테스터로 전달합니다.');
  probeAssembly.add(shadow(testHead));

  prober.add(probeAssembly);

  // 콘택 스파크
  const spark = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.01, 24), MAT.glow(0x22d3ee, 0));
  spark.position.set(0, 0.865, 0);
  prober.add(spark);

  // 레이저 리페어 헤드
  const laserHead = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.22, 20), MAT.dark(0x4a2030));
  laserHead.position.set(0, 1.35, 0.55);
  pick(laserHead, '레이저 리페어 헤드 (ESI)', 'EDS에서 찾은 불량 셀 주소의 폴리실리콘 퓨즈를 레이저 펄스로 절단해 예비(spare) 회로로 전환합니다.');
  prober.add(shadow(laserHead));
  const laserBeam = makeBeam([0, 1.24, 0.55], [0, 0.86, 0.2], { color: 0xff3b3b, radius: 0.018 });
  prober.add(laserBeam);
  const laserSpark = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.01, 16), MAT.glow(0xff3b3b, 0));
  laserSpark.position.set(0, 0.87, 0.2);
  prober.add(laserSpark);

  const towerP = makeSignalTower();
  towerP.position.set(1.5, 0.5, 1.2);
  prober.add(towerP);
  const proberLabel = makeLabel('프로버 (TEL Precio XL)', { color: '#22d3ee', size: 0.4 });
  proberLabel.position.set(0, 2.3, 0);
  prober.add(proberLabel);

  group.add(prober);

  /* ================= 테스터 캐비닛 (우측) ================= */
  const tester = new THREE.Group();
  tester.position.set(3.6, 0, -0.3);

  const testerBody = makeCabinet({ w: 2.2, h: 2.7, d: 1.6, color: 0xcfd6e3, screen: true });
  pick(testerBody, 'ATE 테스터 캐비닛 (Advantest V93000 HSM)', '프로브 카드가 전달한 전기 신호를 해석해 다이별 양/불량과 등급을 판정하는 고성능 메모리 테스트 시스템 본체.');
  tester.add(testerBody);

  // 파형 화면 (보조 스크린)
  const waveScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.4), MAT.glow(0x58a6ff, 0.7));
  waveScreen.position.set(0, 2.15, 0.81);
  tester.add(waveScreen);

  // 빈맵 화면
  const binScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.0),
    new THREE.MeshBasicMaterial({ map: binTex, toneMapped: false }));
  binScreen.position.set(0, 1.15, 0.81);
  pick(binScreen, 'Wafer Bin Map 디스플레이', '다이 좌표별 양/불량(Bin) 판정 결과를 실시간으로 시각화. 실패 패턴(edge/center/ring/loc/random)이 공정 이상 진단의 단서가 됩니다.');
  tester.add(binScreen);

  const towerT = makeSignalTower();
  towerT.position.set(1.4, 2.7, 0.9);
  tester.add(towerT);
  const testerLabel = makeLabel('테스터 (Advantest V93000)', { color: '#58a6ff', size: 0.4 });
  testerLabel.position.set(0, 3.2, 0);
  tester.add(testerLabel);

  group.add(tester);

  // 캐비닛 간 케이블 연결
  group.add(makePipe([[-0.3, 1.6, 0], [1.6, 2.2, -0.2], [3.6, 2.15, -0.3]], { radius: 0.045, color: 0x6b7488 }));

  /* ================= 단계 연출 상태 ================= */
  const LIFT = 0.055;
  let liftTarget = 0;
  let posTargetX = 0, posTargetZ = 0;
  let jitter = false;
  let testActive = false;
  let repairActive = false;
  let sparkOn = false;
  let testPtr = 0, testTimer = 0;
  let repairPtr = 0, repairTimer = 0;

  function resetBinStates() {
    dies.forEach(d => { d.state = 'untested'; });
    drawBinMap();
  }
  function finalizeBinMap() {
    dies.forEach(d => {
      if (d.result === 'pass') d.state = 'pass';
      else d.state = (d.repairable) ? 'repaired' : 'fail';
    });
    drawBinMap();
  }

  const stepFx = [
    () => { // 0: 웨이퍼 로딩
      liftTarget = 0; posTargetX = 0; posTargetZ = 0; jitter = false;
      testActive = false; repairActive = false; sparkOn = false;
      laserBeam.visible = false; laserSpark.material.emissiveIntensity = 0;
      carriedWafer.visible = true;
      resetBinStates();
    },
    () => { // 1: 얼라인
      liftTarget = 0; jitter = true;
      testActive = false; repairActive = false; sparkOn = false;
      laserBeam.visible = false;
      carriedWafer.visible = false;
    },
    () => { // 2: 프로브 콘택
      jitter = false; posTargetX = 0; posTargetZ = 0; liftTarget = LIFT;
      testActive = false; repairActive = false; sparkOn = true;
      laserBeam.visible = false;
    },
    () => { // 3: 전기 테스트 (다이 스텝 인덱싱)
      jitter = false; liftTarget = LIFT; sparkOn = true;
      testActive = true; repairActive = false;
      testPtr = 0; testTimer = 0;
      laserBeam.visible = false;
    },
    () => { // 4: 리페어
      testActive = false; liftTarget = 0; sparkOn = false;
      repairActive = true; repairPtr = 0; repairTimer = 0;
      laserBeam.visible = true;
    },
    () => { // 5: 빈맵 생성
      testActive = false; repairActive = false; sparkOn = false;
      liftTarget = 0; posTargetX = 0; posTargetZ = 0;
      laserBeam.visible = false; laserSpark.material.emissiveIntensity = 0;
      finalizeBinMap();
    },
  ];

  stepFx[0]();

  return {
    group,
    setStep(i) { stepFx[Math.min(i, stepFx.length - 1)]?.(); },
    tick(t, dt) {
      // 스테이지 얼라인 지터
      const jx = jitter ? Math.sin(t * 9) * 0.02 : 0;
      const jz = jitter ? Math.cos(t * 7) * 0.02 : 0;

      // 테스트 인덱싱: 다이 순서대로 이동하며 콘택 판정
      if (testActive) {
        testTimer += dt;
        if (testTimer > 0.45 && testPtr < testOrder.length) {
          const idx = testOrder[testPtr];
          const d = dies[idx];
          d.state = d.result === 'pass' ? 'pass' : 'fail';
          drawBinMap();
          testPtr++;
          testTimer = 0;
        }
        const cur = dies[testOrder[Math.min(testPtr, testOrder.length - 1)]];
        posTargetX = cur.x; posTargetZ = cur.z;
      }

      // 리페어: 리페어 가능한 불량 다이를 순서대로 방문
      if (repairActive) {
        const targets = repairTargets();
        if (targets.length > 0) {
          repairTimer += dt;
          const cur = targets[Math.min(repairPtr, targets.length - 1)];
          posTargetX = cur.d.x; posTargetZ = cur.d.z;
          if (repairTimer > 0.7) {
            cur.d.state = 'repaired';
            drawBinMap();
            repairTimer = 0;
            repairPtr = Math.min(repairPtr + 1, Math.max(targets.length - 1, 0));
          }
        }
      }

      // 스테이지 위치/높이 스무딩
      chuckStage.position.x += ((posTargetX + jx) - chuckStage.position.x) * Math.min(1, dt * 6);
      chuckStage.position.z += ((posTargetZ + jz) - chuckStage.position.z) * Math.min(1, dt * 6);
      chuckStage.position.y += (liftTarget - chuckStage.position.y) * Math.min(1, dt * 5);

      // 콘택 스파크 발광
      if (sparkOn) {
        spark.material.emissiveIntensity = 1.4 + Math.sin(t * 24) * 1.2 + (Math.random() * 0.5);
      } else {
        spark.material.emissiveIntensity *= 0.85;
      }

      // 레이저 스파크 & 빔 펄스
      if (repairActive && laserBeam.visible) {
        laserBeam.material.opacity = 0.6 + Math.sin(t * 20) * 0.3;
        laserSpark.material.emissiveIntensity = 2.0 + Math.sin(t * 30) * 1.5;
      } else {
        laserSpark.material.emissiveIntensity *= 0.85;
      }

      // 상태등, 화면 플리커, 로봇팔, 웨이퍼 회전 등 상시 연출
      waveScreen.material.emissiveIntensity = 0.5 + Math.sin(t * 5) * 0.35;
      towerP.userData.setState(testActive ? 'run' : (repairActive ? 'warn' : 'run'));
      towerT.userData.setState('run');
      mainWafer.rotation.y += 0.02 * dt;
      robot.userData.setPose(Math.sin(t * 0.6) * 0.7 - 0.4, Math.sin(t * 0.8) * 0.4 + 0.3, Math.cos(t * 0.7) * 0.5);
    },
  };
}
