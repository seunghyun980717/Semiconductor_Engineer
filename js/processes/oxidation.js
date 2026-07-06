// 산화 공정 모듈 — 수평 확산로(석영 튜브 + 웨이퍼 보트 + 히터 코일) + 가스 패널 + 로드 스테이션
// export 계약: camera / content / build3D(ctx) → { group, setStep(i), tick(t,dt) }
import * as THREE from 'three';
import {
  MAT, pick, shadow, makeBareWafer, makeCabinet, makePipe, makeBeam,
  makeLabel, makeSignalTower, makeParticleStream, makeLoadPort, makeRobotArm,
} from '../lib/equip-kit.js';

export const camera = { pos: [8.5, 5.5, 10], target: [0, 1.5, 0] };

export const content = {
  overview:
    '산화 공정은 웨이퍼 표면의 실리콘을 산소 또는 수증기와 반응시켜 이산화규소(SiO2) 절연막을 성장시키는 공정입니다. ' +
    'Si + O2(또는 H2O) -> SiO2 반응으로 진행되며, 반응이 진행될수록 실리콘 자체가 소모되며 막이 자라나는 특성(Deal-Grove 모델)을 갖습니다. ' +
    '생성된 SiO2는 화학적으로 안정하고 절연성이 우수해 트랜지스터 게이트 절연막, 소자 간 절연(STI), 후속 공정의 마스킹/보호막으로 폭넓게 활용됩니다. ' +
    '산화로는 수십 장의 웨이퍼를 석영 보트(boat)에 적재해 배치(batch) 방식으로 동시에 처리하며, 보트 양 끝에는 반응속도 편차를 보정하는 더미 웨이퍼를 배치합니다. ' +
    '반응 가스에 따라 건식(O2), 습식(H2O), 라디칼(ISSG) 산화로 구분되며 각각 막질·성장속도·용도가 다릅니다.',
  keyPoints: [
    'Si + O2/H2O -> SiO2 반응(Deal-Grove 모델), 결정방향(<100>/<110>)에 따라 성장속도가 다름',
    '건식 산화: 치밀하고 균일한 막질로 신뢰성이 중요한 게이트 산화막에 사용, 성장속도는 느림',
    '습식 산화: H2+O2 연소로 만든 고온 수증기를 공급, 성장속도가 빠르나 막 치밀도가 낮아 STI/필드 산화막에 사용',
    'ISSG(라디칼 산화): 결정방향에 무관하게 균일 성장하며 핀펫/트렌치 등 3차원 구조에서 우수한 컨포멀리티 제공',
    '배치로(furnace)는 보트에 웨이퍼 수십 장을 동시 로딩하고, 더미 웨이퍼로 보트 앞/뒤 gas depletion 편차를 보정',
    'WIW(웨이퍼 내) 두께 균일도와 계면 트랩밀도(Dit)가 게이트 산화막 신뢰성의 핵심 관리지표',
  ],
  hbmNote:
    'DRAM에서 산화 공정은 셀 트랜지스터·주변회로 트랜지스터의 게이트 절연막과 STI(Shallow Trench Isolation) 라이너 산화에 핵심적으로 쓰입니다. ' +
    '미세화가 진행될수록 순수 열산화막보다 ALD 기반 고유전율(High-k, HfO2/ZrO2) 유전막과 얇은 SiO2 계면층을 조합하는 방식이 중요해지고 있습니다. ' +
    'SK하이닉스의 1a/1b nm급 DRAM에서도 게이트 산화막 두께·균일도 관리가 트랜지스터 특성과 리프레시 성능에 직결되는 핵심 공정입니다.',
  steps: [
    { name: '웨이퍼 로딩 (보트 이동)', desc: '로봇 암이 FOUP에서 웨이퍼를 꺼내 석영 보트에 슬롯별로 적재합니다. 보트 양 끝에는 반응속도 편차를 보정하는 더미 웨이퍼를 배치합니다.', camera: { pos: [-6.5, 4, 7], target: [-4, 1.5, 0] } },
    { name: '승온 (Ramp-up)', desc: '보트가 튜브 안으로 완전히 삽입되고 도어가 닫히면, 히터 코일이 목표 온도(800~1150°C)까지 웨이퍼를 서서히 가열합니다.', camera: { pos: [1.5, 4, 8], target: [0, 1.6, 0] } },
    { name: '건식 산화 (Dry Oxidation)', desc: '고순도 O2 가스가 튜브 내로 공급되어 Si + O2 -> SiO2 반응으로 치밀하고 얇은 산화막이 성장합니다. 주로 게이트 산화막에 사용됩니다.', camera: { pos: [4, 3.2, 6.5], target: [1, 1.5, 0] } },
    { name: '습식 산화 (Wet Oxidation)', desc: 'H2와 O2를 연소시켜 만든 고온 수증기(H2O)를 공급, Si + 2H2O -> SiO2 + 2H2 반응으로 더 빠르게 두꺼운 산화막을 성장시킵니다.', camera: { pos: [4, 3.2, -6.5], target: [1, 1.5, 0] } },
    { name: '냉각 & 언로딩', desc: '히터 파워를 서서히 낮춰 냉각한 뒤 도어를 열고 보트를 인출합니다. 급격한 램프다운은 웨이퍼 휨·크랙을 유발할 수 있어 냉각 속도를 관리합니다.', camera: { pos: [-5, 4.2, 6.5], target: [-2.5, 1.5, 0] } },
    { name: '두께 계측 (Ellipsometry)', desc: '엘립소미터로 산화막 두께와 굴절률을 측정해 웨이퍼 내 균일도(WIW uniformity)를 SPC 관리도로 모니터링합니다.', camera: { pos: [-3.5, 3.6, 5.5], target: [-3.2, 1.4, 0] } },
  ],
  equipment: [
    { name: '횡형 확산로 (Horizontal Diffusion Furnace)', vendor: 'Tokyo Electron (Alpha-8 시리즈)', role: '웨이퍼 보트를 석영 튜브에 배치 로딩해 건식/습식 산화막을 성장시키는 배치(batch) 열처리로.', spec: '보트당 수십 장 동시 처리 / 800~1150°C' },
    { name: 'RTP/RTO 장비', vendor: 'Applied Materials (Centura RTP, Radiance/Vantage 시리즈)', role: '램프 가열로 웨이퍼 1장을 초단시간(수십초) 고온 스파이크 처리하는 매엽식 급속 열산화 장비.', spec: '~1000~1100°C 스파이크, 초단시간 램프업' },
    { name: 'ISSG 라디칼 산화 챔버', vendor: 'Applied Materials (Centura ISSG)', role: 'O2/H2를 고온에서 직접 반응시켜 반응성 산소 라디칼을 생성, 3차원 구조에서도 균일한 컨포멀 산화막을 형성.', spec: '결정방향 무관 균일 성장' },
    { name: '석영 튜브 & 웨이퍼 보트', vendor: '석영 소모품(Quartz Consumable)', role: '고순도 석영관이 반응 챔버 역할을 하며, 보트가 웨이퍼를 일정 간격으로 지지·이송. 오염/크랙 시 두께 불균일의 원인.', spec: '정기 세정 및 교체 관리' },
    { name: '엘립소미터 (Ellipsometer)', vendor: 'KLA', role: '편광된 빛의 반사 특성 변화를 분석해 산화막 두께와 굴절률(막질 치밀도)을 비접촉으로 측정.', spec: '웨이퍼 내 49포인트 맵 측정' },
  ],
  parameters: [
    { name: '공정 온도', typical: '건식 800~1150°C / 습식 900~1150°C (RTO는 초단시간 ~1000~1100°C 스파이크)', monitor: '열전대(Thermocouple), FDC 실시간 추세' },
    { name: '공정 압력', typical: '상압(~1atm) 또는 감압(수십~수백 Torr, 균일도 향상 목적)', monitor: '챔버 압력계, 레시피 로그' },
    { name: '가스 유량비 (O2/H2)', typical: '습식/ISSG 공정에서 정밀 제어되는 SCCM 설정값', monitor: 'MFC (Mass Flow Controller)' },
    { name: '목표 산화막 두께', typical: '게이트 산화막(첨단 로직) 1~수 nm급 / STI·필드 산화막 수백 nm급', monitor: '엘립소미터, 웨이퍼 내 49포인트 맵' },
    { name: 'WIW 두께 균일도', typical: '목표 대비 ±수% 이내 관리', monitor: 'SPC X-bar/R 관리도, EWMA 추세 감시' },
  ],
  defects: [
    { name: '두께 불균일 (Thickness Non-Uniformity)', signature: '두께맵에서 중심 대비 edge가 더 두껍거나 얇은 방사형(radial) 패턴, SPC의 uniformity(%) 지표가 서서히 상승하는 추세(furnace 열화 전조)', cause: '노(furnace) 내 온도 프로파일 불균일, 보트 앞/뒤 슬롯 간 gas depletion, 히터 열화·열전대 드리프트, 석영관 오염/크랙', action: 'furnace 온도 프로파일 재보정, 더미 웨이퍼 배치 최적화로 gas depletion 보상, 정기 튜브 세정 및 열전대 교정 주기 단축' },
    { name: '계면 트랩밀도(Dit) 상승 / 게이트 신뢰성 저하', signature: '절연파괴전압(TDDB) 시험에서 특정 로트의 breakdown voltage 저하, 계면 트랩밀도 측정치 상승', cause: '산화 전 웨이퍼 세정 불충분, 산화 분위기 내 불순물 혼입, 계면 결함 형성', action: '산화 전 RCA 세정 강화, 가스 순도/배관 누설 점검, H2/N2 어닐로 계면 트랩 저감' },
    { name: '파티클/핀홀 결함', signature: '파티클 검사기에서 웨이퍼 국소 위치에 결함 클러스터, 산화막 핀홀 위치에서 절연파괴가 조기 발생', cause: '석영 튜브/보트 표면 오염, 웨이퍼 이면 파티클, 로딩 시 로봇 핸드오프 접촉/스크래치', action: '튜브·보트 정기 세정 및 파티클 모니터링, 로딩 로봇 핸드오프 티칭 재조정, 웨이퍼 프리클린 강화' },
    { name: '웨이퍼 워피지/크랙 (열충격)', signature: '급격한 램프업/램프다운 구간 직후 웨이퍼 휨(warpage) 이상 또는 파손 발생률 증가', cause: '과도하게 빠른 승온·냉각 속도, 보트 슬롯 접촉부 국소 응력 집중', action: '단계적 램프 프로파일(soak/ramp) 최적화, 보트 슬롯 정렬 및 접촉 상태 점검' },
  ],
};

export function build3D(ctx) {
  const group = new THREE.Group();
  const PROCESS_COLOR = 0x6ee7b7;

  /* ================= 수평 확산로 (중앙) ================= */
  const furnace = new THREE.Group();
  furnace.position.set(0, 0, 0);

  const tubeR = 0.62, tubeLen = 5.0;
  const cabinetBody = new THREE.Mesh(new THREE.BoxGeometry(tubeLen + 1.0, 2.6, 1.9), MAT.paint(0xe4e9f2));
  cabinetBody.position.set(0, 1.3, -1.15);
  pick(cabinetBody, '확산로 본체 (TEL Alpha-8 시리즈)', '웨이퍼 보트를 석영 튜브에 배치 로딩해 건식/습식 산화막을 성장시키는 배치식 횡형 확산로입니다.');
  furnace.add(shadow(cabinetBody));

  // 석영 튜브 (내부가 보이도록 glass 재질, 튜브축 = X)
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(tubeR, tubeR, tubeLen, 40, 1, true), MAT.glass(0xbfe8ff, 0.22));
  tube.rotation.z = Math.PI / 2;
  tube.position.set(0, 1.5, 0);
  pick(tube, '석영 튜브 (Quartz Tube)', '반응 챔버 역할을 하는 고순도 석영관. 오염/크랙은 두께 불균일과 파티클 결함의 주원인입니다.');
  furnace.add(tube);

  // 히터 코일 (튜브를 감싸는 발광 링 6개)
  const heaterRings = [];
  for (let i = 0; i < 6; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(tubeR + 0.13, 0.045, 10, 28), MAT.glow(0xff6a3a, 0.05));
    ring.rotation.y = Math.PI / 2;
    ring.position.set(-2.1 + i * 0.84, 1.5, 0);
    heaterRings.push(ring);
    furnace.add(ring);
  }
  pick(heaterRings[2], '히터 코일 (저항 발열체)', '튜브를 감싸는 발열체로 목표 온도(800~1150°C)까지 웨이퍼를 가열합니다. 온도 균일도가 산화막 두께 균일도에 직결됩니다.');

  // 튜브 양 끝단 도어 (로드 도어 / 배기 도어)
  const doorGeo = new THREE.CylinderGeometry(tubeR * 1.12, tubeR * 1.12, 0.14, 32);
  const loadDoor = new THREE.Mesh(doorGeo, MAT.steel(0x828da3));
  loadDoor.rotation.z = Math.PI / 2;
  loadDoor.position.set(-2.5, 1.5, 0);
  pick(loadDoor, '로드 도어', '웨이퍼 보트가 튜브 안으로 삽입될 때 열리고, 산화 반응 중에는 밀폐를 위해 닫힙니다.');
  furnace.add(shadow(loadDoor));
  const exhaustDoor = new THREE.Mesh(doorGeo.clone(), MAT.steel(0x828da3));
  exhaustDoor.rotation.z = Math.PI / 2;
  exhaustDoor.position.set(2.5, 1.5, 0);
  furnace.add(shadow(exhaustDoor));

  const towerF = makeSignalTower();
  towerF.position.set(-2.2, 2.7, 1.05);
  furnace.add(towerF);
  const furnaceLabel = makeLabel('횡형 확산로 (TEL Alpha-8)', { color: '#6ee7b7', size: 0.4 });
  furnaceLabel.position.set(0, 3.3, 0);
  furnace.add(furnaceLabel);
  group.add(furnace);

  /* ================= 웨이퍼 보트 (튜브 내부/외부 이동) ================= */
  const boat = new THREE.Group();
  boat.position.set(-4.0, 1.5, 0); // 초기: 로드 스테이션 쪽 (튜브 밖)
  const rail = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.06, 0.12), MAT.dark(0x39415a));
  boat.add(rail);
  const slotCount = 7; // 더미 2 + 제품 웨이퍼 5
  const waferSlots = [];
  for (let i = 0; i < slotCount; i++) {
    const isDummy = i === 0 || i === slotCount - 1;
    const w = makeBareWafer(0.42, 0.02);
    w.rotation.z = Math.PI / 2; // 디스크가 튜브축(X)에 수직으로 서도록
    w.position.set(-1.05 + i * 0.35, 0.5, 0);
    if (isDummy) w.material = MAT.dark(0x4a5568);
    boat.add(w);
    // 성장하는 SiO2 막 표현용 오버레이(반투명, opacity로 진행도 표시)
    const oxide = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.024, 40), MAT.glass(0x9be7cf, 0.0));
    oxide.rotation.z = Math.PI / 2;
    oxide.position.copy(w.position);
    boat.add(oxide);
    waferSlots.push({ wafer: w, oxide, dummy: isDummy });
  }
  pick(waferSlots[3].wafer, '제품 웨이퍼', '실제 산화막이 성장되는 제품 웨이퍼입니다. 보트 중앙부일수록 gas depletion 영향이 적어 상대적으로 균일합니다.');
  pick(waferSlots[0].wafer, '더미 웨이퍼 (Dummy Wafer)', '보트 양 끝단에 배치되어 gas depletion에 의한 반응속도 편차를 흡수·보정하는 역할을 합니다.');
  const boatFrame = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.05, 1.0), MAT.dark(0x2a3244));
  boatFrame.position.set(0, 0.05, 0);
  boat.add(boatFrame);
  pick(boatFrame, '석영 웨이퍼 보트 (Boat)', '수십 장의 웨이퍼를 일정 간격으로 지지하며 튜브 안팎으로 이송하는 석영 캐리어입니다.');
  group.add(boat);

  /* ================= 가스 패널 (우측) ================= */
  const gasPanel = new THREE.Group();
  gasPanel.position.set(5.3, 0, 0);
  const panelCabinet = makeCabinet({ w: 1.6, h: 2.2, d: 1.2, color: 0xd6ddea });
  pick(panelCabinet, '가스 패널 (O2/H2O 공급 유닛)', 'MFC(질량유량제어기)로 O2, H2 가스 유량을 정밀 제어해 건식/습식/ISSG 산화 조건을 형성합니다.');
  gasPanel.add(panelCabinet);

  const valveO2 = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.16, 16), MAT.steel(0x58a6ff));
  valveO2.position.set(-0.35, 1.7, 0.62);
  pick(valveO2, 'O2 공급 밸브', '건식 산화용 고순도 산소 가스 공급량을 제어하는 밸브입니다.');
  gasPanel.add(valveO2);
  const valveH2O = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.16, 16), MAT.steel(0xffb703));
  valveH2O.position.set(0.35, 1.7, 0.62);
  pick(valveH2O, 'H2O(수증기) 공급 밸브', 'H2와 O2를 연소시켜 만든 고온 수증기의 공급량을 제어하는 밸브입니다.');
  gasPanel.add(valveH2O);

  const pipeO2 = makePipe([[-0.35, 1.7, 0.62], [-0.35, 2.2, -1.2], [2.55, 2.2, 0], [2.55, 1.5, 0]], { radius: 0.05, color: 0x58a6ff });
  const pipeH2O = makePipe([[0.35, 1.7, 0.62], [0.35, 2.35, -1.2], [2.7, 2.35, 0.3], [2.55, 1.55, 0.15]], { radius: 0.05, color: 0xffb703 });
  gasPanel.add(pipeO2, pipeH2O);
  group.add(gasPanel);

  // 튜브 내부 가스 흐름 입자 (X축 방향 흐름으로 회전시켜 배치)
  const o2Stream = makeParticleStream({ count: 90, area: 0.4, yTop: 2.2, yBottom: -2.2, color: 0x58a6ff, size: 0.02 });
  o2Stream.rotation.z = Math.PI / 2;
  o2Stream.position.set(0, 1.5, 0);
  furnace.add(o2Stream);
  const h2oStream = makeParticleStream({ count: 90, area: 0.4, yTop: 2.2, yBottom: -2.2, color: 0xf1f5ff, size: 0.024 });
  h2oStream.rotation.z = Math.PI / 2;
  h2oStream.position.set(0, 1.5, 0);
  furnace.add(h2oStream);

  /* ================= 로드 스테이션 (좌측) ================= */
  const loadStation = new THREE.Group();
  loadStation.position.set(-6.2, 0, 1.1);
  const loadPort = makeLoadPort();
  pick(loadPort, '로드 포트 & FOUP', '25장 웨이퍼가 담긴 FOUP이 거치되는 곳. 로봇이 이곳에서 웨이퍼를 꺼내 보트에 적재합니다.');
  loadStation.add(loadPort);
  group.add(loadStation);

  const robot = makeRobotArm({ reach: 1.3 });
  robot.position.set(-4.9, 0, 0.4);
  pick(robot, '웨이퍼 이송 로봇', 'FOUP에서 웨이퍼를 꺼내 보트 슬롯에 정확히 적재·회수하는 이송 로봇입니다.');
  group.add(robot);

  /* ================= 계측 스테이션 (좌측 전방) ================= */
  const metroStand = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 1.0, 20), MAT.steel(0x6b7488));
  metroStand.position.set(-3.2, 0.5, -1.3);
  group.add(shadow(metroStand));
  const metroChuck = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.08, 40), MAT.dark(0x39415a));
  metroChuck.position.set(-3.2, 1.04, -1.3);
  pick(metroChuck, '계측 스테이지', '냉각·언로딩된 웨이퍼를 올려 산화막 두께를 측정하는 스테이지입니다.');
  group.add(shadow(metroChuck));
  const metroWafer = makeBareWafer(0.42, 0.02);
  metroWafer.position.set(-3.2, 1.1, -1.3);
  group.add(metroWafer);
  const metroOxide = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.03, 40), MAT.glass(0x9be7cf, 0.4));
  metroOxide.position.set(-3.2, 1.12, -1.3);
  group.add(metroOxide);
  const ellipHead = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.3, 16), MAT.steel(0x9aa4b5));
  ellipHead.rotation.z = Math.PI * 0.72;
  ellipHead.position.set(-3.75, 1.75, -1.3);
  pick(ellipHead, '엘립소미터 (KLA)', '편광된 빛의 반사 특성을 분석해 산화막 두께와 굴절률을 비접촉으로 측정합니다.');
  group.add(ellipHead);
  const ellipBeam = makeBeam([-3.68, 1.65, -1.3], [-3.2, 1.13, -1.3], { color: 0xddccff, radius: 0.02, opacity: 0.85 });
  group.add(ellipBeam);
  const metroLabel = makeLabel('두께 계측 (Ellipsometer)', { color: '#ddccff', size: 0.32 });
  metroLabel.position.set(-3.2, 2.2, -1.3);
  group.add(metroLabel);

  /* ================= 단계 연출 ================= */
  const LOAD_X = -4.0, INSERT_X = 0.0;
  let targetBoatX = LOAD_X;
  let targetHeater = 0.05;   // 히터 발광 목표치
  let targetDoorOpen = 1;    // 1=열림, 0=닫힘
  let oxideProgress = 0;     // 0~1, 산화막 성장 진행도(오버레이 opacity)
  let targetOxide = 0;

  function show(...o) { o.forEach(x => x.visible = true); }
  function hide(...o) { o.forEach(x => x.visible = false); }

  const stepFx = [
    () => { // 0: 웨이퍼 로딩
      targetBoatX = LOAD_X; targetDoorOpen = 1; targetHeater = 0.05;
      hide(o2Stream, h2oStream); targetOxide = 0;
    },
    () => { // 1: 승온
      targetBoatX = INSERT_X; targetDoorOpen = 0; targetHeater = 0.55;
      hide(o2Stream, h2oStream);
    },
    () => { // 2: 건식 산화
      targetBoatX = INSERT_X; targetDoorOpen = 0; targetHeater = 1.0;
      show(o2Stream); hide(h2oStream); targetOxide = 0.55;
    },
    () => { // 3: 습식 산화
      targetBoatX = INSERT_X; targetDoorOpen = 0; targetHeater = 1.0;
      show(h2oStream); hide(o2Stream); targetOxide = 1.0;
    },
    () => { // 4: 냉각 & 언로딩
      targetBoatX = LOAD_X; targetDoorOpen = 1; targetHeater = 0.08;
      hide(o2Stream, h2oStream);
    },
    () => { // 5: 두께 계측
      targetBoatX = LOAD_X; targetDoorOpen = 1; targetHeater = 0.05;
      hide(o2Stream, h2oStream);
    },
  ];
  stepFx[0]();

  return {
    group,
    setStep(i) { stepFx[Math.min(i, stepFx.length - 1)]?.(); },
    tick(t, dt) {
      // 보트 슬라이드 이동
      boat.position.x += (targetBoatX - boat.position.x) * Math.min(1, dt * 1.5);

      // 도어 개폐 (튜브축 방향으로 슬라이드)
      const doorOpenAmt = (loadDoor.userData._open ?? 1);
      const nextOpen = doorOpenAmt + (targetDoorOpen - doorOpenAmt) * Math.min(1, dt * 2.0);
      loadDoor.userData._open = nextOpen;
      loadDoor.position.x = -2.5 - nextOpen * 0.9;
      exhaustDoor.position.x = 2.5 + nextOpen * 0.9;

      // 히터 코일 발광 강도
      heaterRings.forEach((ring, i) => {
        const base = ring.material.emissiveIntensity;
        const next = base + (targetHeater * (2.4 + Math.sin(t * 6 + i) * 0.3) - base) * Math.min(1, dt * 1.2);
        ring.material.emissiveIntensity = next;
        ring.material.color.setHex(next > 1.2 ? 0xff8a4a : 0xff6a3a);
        ring.material.emissive.setHex(next > 1.2 ? 0xff8a4a : 0xff6a3a);
      });

      // 산화막 성장(오버레이 opacity) 진행
      oxideProgress += (targetOxide - oxideProgress) * Math.min(1, dt * 0.6);
      waferSlots.forEach(s => {
        s.oxide.material.opacity = s.dummy ? oxideProgress * 0.25 : oxideProgress * 0.55;
        s.wafer.rotation.x += dt * 0.15;
      });
      metroOxide.material.opacity = 0.35 + Math.sin(t * 2) * 0.05;

      // 가스 입자 흐름
      if (o2Stream.visible) o2Stream.userData.tick(dt);
      if (h2oStream.visible) h2oStream.userData.tick(dt);

      // 밸브 회전 (가스 흐르는 동안)
      if (o2Stream.visible) valveO2.rotation.y += dt * 3;
      if (h2oStream.visible) valveH2O.rotation.y += dt * 3;

      // 로봇 암 & 신호탑
      robot.userData.setPose(Math.sin(t * 0.5) * 0.7, Math.sin(t * 0.7) * 0.5, Math.cos(t * 0.6) * 0.5);
      metroWafer.rotation.y += dt * 0.3;
    },
  };
}
