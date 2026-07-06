// 산화 공정 모듈 — 수직형 확산로(석영 튜브 + 3존 히터 재킷 + 보트 엘리베이터) + 가스 패널 + 로드/계측 스테이션
// export 계약: camera / content / build3D(ctx) → { group, setStep(i), tick(t,dt) }
import * as THREE from 'three';
import {
  MAT, pick, shadow, makeBareWafer, makeCabinet, makePipe, makeHose, makeBeam,
  makeLabel, makeSignalTower, makeParticleStream, makeLoadPort, makeRobotArm,
  makeGasBox, makeWaferBoat, makeOpenChamber, makeScreenPanel,
} from '../lib/equip-kit.js';

export const camera = { pos: [7.4, 4.4, 8.4], target: [0, 2.0, 0] };

export const content = {
  overview:
    '산화 공정은 웨이퍼 표면의 실리콘을 산소 또는 수증기와 반응시켜 이산화규소(SiO2) 절연막을 성장시키는 공정입니다. ' +
    'Si + O2(또는 H2O) -> SiO2 반응으로 진행되며, 반응이 진행될수록 실리콘 자체가 소모되며 막이 자라나는 특성(Deal-Grove 모델)을 갖습니다. ' +
    '생성된 SiO2는 화학적으로 안정하고 절연성이 우수해 트랜지스터 게이트 절연막, 소자 간 절연(STI), 후속 공정의 마스킹/보호막으로 폭넓게 활용됩니다. ' +
    '산화로는 수십~수백 장의 웨이퍼를 석영 보트(boat)에 적재해 배치(batch) 방식으로 동시에 처리하며, 보트 양 끝에는 반응속도 편차를 보정하는 더미 웨이퍼를 배치합니다. ' +
    '반응 가스에 따라 건식(O2), 습식(H2O), 라디칼(ISSG) 산화로 구분되며 각각 막질·성장속도·용도가 다릅니다.',
  keyPoints: [
    'Si + O2/H2O -> SiO2 반응(Deal-Grove 모델), 결정방향(<100>/<110>)에 따라 성장속도가 다름',
    '건식 산화: 치밀하고 균일한 막질로 신뢰성이 중요한 게이트 산화막에 사용, 성장속도는 느림',
    '습식 산화: H2+O2 연소로 만든 고온 수증기를 공급, 성장속도가 빠르나 막 치밀도가 낮아 STI/필드 산화막에 사용',
    'ISSG(라디칼 산화): 결정방향에 무관하게 균일 성장하며 핀펫/트렌치 등 3차원 구조에서 우수한 컨포멀리티 제공',
    '수직로는 상부의 석영 튜브를 3~5존 히터가 원통형으로 감싸고, 하부 보트 엘리베이터가 웨이퍼 보트를 튜브 안으로 밀어올려 배치 로딩하는 세로로 긴 타워형 구조',
    '배치로(furnace)는 보트에 웨이퍼 수십~수백 장을 동시 로딩하고, 더미 웨이퍼로 보트 앞/뒤 gas depletion 편차를 보정',
    'WIW(웨이퍼 내) 두께 균일도와 계면 트랩밀도(Dit)가 게이트 산화막 신뢰성의 핵심 관리지표',
  ],
  hbmNote:
    'DRAM에서 산화 공정은 셀 트랜지스터·주변회로 트랜지스터의 게이트 절연막과 STI(Shallow Trench Isolation) 라이너 산화에 핵심적으로 쓰입니다. ' +
    '미세화가 진행될수록 순수 열산화막보다 ALD 기반 고유전율(High-k, HfO2/ZrO2) 유전막과 얇은 SiO2 계면층을 조합하는 방식이 중요해지고 있습니다. ' +
    'SK하이닉스의 1a/1b nm급 DRAM에서도 게이트 산화막 두께·균일도 관리가 트랜지스터 특성과 리프레시 성능에 직결되는 핵심 공정입니다.',
  steps: [
    { name: '웨이퍼 로딩 (보트 이동)', desc: '보트 엘리베이터가 하강한 상태에서 로봇 암이 FOUP의 웨이퍼를 꺼내 석영 보트에 슬롯별로 적재합니다. 보트 양 끝에는 반응속도 편차를 보정하는 더미 웨이퍼를 배치합니다.', camera: { pos: [3.2, 3.0, 4.8], target: [0.8, 1.1, 0] } },
    { name: '승온 (Ramp-up)', desc: '엘리베이터가 보트를 상승시켜 튜브 안으로 완전히 삽입하고 도어 캡이 닫히면, 3존 히터가 목표 온도(800~1150°C)까지 웨이퍼를 서서히 가열합니다.', camera: { pos: [2.2, 3.4, 4.2], target: [0, 2.0, 0] } },
    { name: '건식 산화 (Dry Oxidation)', desc: '고순도 O2 가스가 상단 인젝터를 통해 튜브 내로 공급되어 Si + O2 -> SiO2 반응으로 치밀하고 얇은 산화막이 성장합니다. 주로 게이트 산화막에 사용됩니다.', camera: { pos: [3.4, 3.4, 3.2], target: [0, 2.5, 0] } },
    { name: '습식 산화 (Wet Oxidation)', desc: 'H2와 O2를 연소시켜 만든 고온 수증기(H2O)를 공급, Si + 2H2O -> SiO2 + 2H2 반응으로 더 빠르게 두꺼운 산화막을 성장시킵니다.', camera: { pos: [-3.4, 3.4, 3.2], target: [0, 2.5, 0] } },
    { name: '냉각 & 언로딩', desc: '히터 파워를 서서히 낮춰 냉각한 뒤 도어 캡을 열고 엘리베이터가 보트를 하강시켜 인출합니다. 급격한 램프다운은 웨이퍼 휨·크랙을 유발할 수 있어 냉각 속도를 관리합니다.', camera: { pos: [3.2, 2.8, 4.8], target: [0.5, 1.1, 0] } },
    { name: '두께 계측 (Ellipsometry)', desc: '엘립소미터로 산화막 두께와 굴절률을 측정해 웨이퍼 내 균일도(WIW uniformity)를 SPC 관리도로 모니터링합니다.', camera: { pos: [3.6, 2.6, -3.2], target: [2.3, 1.2, -2.4] } },
  ],
  equipment: [
    { name: '수직형 확산로 (Vertical Diffusion Furnace)', vendor: 'Tokyo Electron (Alpha-8 시리즈)', role: '보트 엘리베이터가 석영 웨이퍼 보트를 수직 석영 튜브 안으로 들어올려 배치 로딩하고, 3~5존 히터로 건식/습식 산화막을 성장시키는 배치(batch) 열처리로.', spec: '보트당 수십~수백 장 동시 처리 / 800~1150°C' },
    { name: 'RTP/RTO 장비', vendor: 'Applied Materials (Centura RTP, Radiance/Vantage 시리즈)', role: '램프 가열로 웨이퍼 1장을 초단시간(수십초) 고온 스파이크 처리하는 매엽식 급속 열산화 장비.', spec: '~1000~1100°C 스파이크, 초단시간 램프업' },
    { name: 'ISSG 라디칼 산화 챔버', vendor: 'Applied Materials (Centura ISSG)', role: 'O2/H2를 고온에서 직접 반응시켜 반응성 산소 라디칼을 생성, 3차원 구조에서도 균일한 컨포멀 산화막을 형성.', spec: '결정방향 무관 균일 성장' },
    { name: '석영 튜브 & 웨이퍼 보트', vendor: '석영 소모품(Quartz Consumable)', role: '고순도 석영관이 반응 챔버 역할을 하며, 보트가 웨이퍼를 일정 간격으로 지지·이송. 오염/크랙 시 두께 불균일의 원인.', spec: '튜브 지름 20~30cm x 길이 1.2~1.5m, 정기 세정 및 교체 관리' },
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
    { name: '두께 불균일 (Thickness Non-Uniformity)', signature: '두께맵에서 중심 대비 edge가 더 두껍거나 얇은 방사형(radial) 패턴, SPC의 uniformity(%) 지표가 서서히 상승하는 추세(furnace 열화 전조)', cause: '노(furnace) 내 존(zone)별 온도 프로파일 불균일, 보트 앞/뒤 슬롯 간 gas depletion, 히터 열화·열전대 드리프트, 석영관 오염/크랙', action: 'furnace 존별 온도 프로파일 재보정, 더미 웨이퍼 배치 최적화로 gas depletion 보상, 정기 튜브 세정 및 열전대 교정 주기 단축' },
    { name: '계면 트랩밀도(Dit) 상승 / 게이트 신뢰성 저하', signature: '절연파괴전압(TDDB) 시험에서 특정 로트의 breakdown voltage 저하, 계면 트랩밀도 측정치 상승', cause: '산화 전 웨이퍼 세정 불충분, 산화 분위기 내 불순물 혼입, 계면 결함 형성', action: '산화 전 RCA 세정 강화, 가스 순도/배관 누설 점검, H2/N2 어닐로 계면 트랩 저감' },
    { name: '파티클/핀홀 결함', signature: '파티클 검사기에서 웨이퍼 국소 위치에 결함 클러스터, 산화막 핀홀 위치에서 절연파괴가 조기 발생', cause: '석영 튜브/보트 표면 오염, 웨이퍼 이면 파티클, 로딩 시 로봇 핸드오프 접촉/스크래치', action: '튜브·보트 정기 세정 및 파티클 모니터링, 로딩 로봇 핸드오프 티칭 재조정, 웨이퍼 프리클린 강화' },
    { name: '웨이퍼 워피지/크랙 (열충격)', signature: '급격한 램프업/램프다운 구간 직후 웨이퍼 휨(warpage) 이상 또는 파손 발생률 증가', cause: '과도하게 빠른 승온·냉각 속도(엘리베이터 급속 삽입/인출 포함), 보트 슬롯 접촉부 국소 응력 집중', action: '단계적 램프 프로파일(soak/ramp) 최적화, 엘리베이터 승강 속도 프로파일 조정, 보트 슬롯 정렬 및 접촉 상태 점검' },
  ],
};

export function build3D(ctx) {
  const group = new THREE.Group();

  /* ================= 치수 상수 (수직 타워 구조) ================= */
  const BASE_H = 1.4;             // 하부 베이스/엘리베이터 존 높이
  const TUBE_BOTTOM = BASE_H;     // 튜브 하단(개구부) y
  const TUBE_TOP = 3.4;           // 튜브 상단(막힘) y — 장비 전체 높이 3.4
  const ZONE_H = (TUBE_TOP - TUBE_BOTTOM) / 3; // 히터 3존 각 높이
  const tubeR = 0.42;             // 석영 튜브 반지름
  const heaterR = 0.64;           // 히터 재킷 반지름 (튜브의 약 1.5배)
  const BOAT_DOWN = 0.05;         // 보트 하강(로딩) 위치
  const BOAT_UP = TUBE_BOTTOM;    // 보트 상승(튜브 완전 삽입) 위치

  /* ================= 하부 베이스 & 보트 엘리베이터 ================= */
  const backPanel = new THREE.Mesh(new THREE.BoxGeometry(1.55, BASE_H, 0.12), MAT.paint(0xe4e9f2));
  backPanel.position.set(0, BASE_H / 2, -0.78);
  pick(backPanel, '장비 베이스 하우징', '보트 엘리베이터 구동부와 제어 배선을 감싸는 하부 캐비닛입니다. 장비 전체는 세로로 긴 타워형(높이 2.5~3.5m)이 특징입니다.');
  group.add(shadow(backPanel));

  const basePlate = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.07, 1.6), MAT.steel(0x828da3));
  basePlate.position.set(0, 0.035, -0.05);
  group.add(shadow(basePlate));

  const flange = new THREE.Mesh(new THREE.CylinderGeometry(heaterR * 1.08, heaterR * 1.15, 0.1, 40), MAT.steel(0x828da3));
  flange.position.set(0, TUBE_BOTTOM, 0);
  pick(flange, '튜브 마운트 플랜지', '히터·튜브 어셈블리를 베이스 위에 고정하는 스테인리스 플랜지로, 튜브 하단 개구부와 보트 엘리베이터가 정확히 정렬되는 기준면입니다.');
  group.add(shadow(flange));

  // 엘리베이터 가이드 레일 (좌우)
  const railGeo = new THREE.BoxGeometry(0.07, BASE_H + 0.25, 0.07);
  const railL = new THREE.Mesh(railGeo, MAT.steel(0x9aa4b5));
  railL.position.set(-0.5, (BASE_H + 0.25) / 2, -0.6);
  const railR = railL.clone();
  railR.position.x = 0.5;
  pick(railL, '보트 엘리베이터 가이드 레일', '볼스크류/벨트 구동 방식의 수직 리니어 액추에이터 레일로, 보트 캐리지를 상하로 이동시켜 튜브 안팎으로 삽입/인출합니다. 스트로크는 수십cm~1m급입니다.');
  group.add(shadow(railL), shadow(railR));

  const motorBox = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.3, 20), MAT.dark(0x2e3648));
  motorBox.rotation.z = Math.PI / 2;
  motorBox.position.set(0, 0.22, -0.7);
  pick(motorBox, '엘리베이터 구동 모터', '볼스크류를 회전시켜 보트 캐리지를 정밀한 속도로 승강시키는 서보 모터입니다. 급속 승강은 웨이퍼 열충격(워피지/크랙)을 유발할 수 있어 속도 프로파일이 관리됩니다.');
  group.add(shadow(motorBox));

  /* ================= 보트 캐리지 (승강 그룹) ================= */
  const carriage = new THREE.Group();
  carriage.position.set(0, BOAT_DOWN, 0);

  const cap = new THREE.Mesh(new THREE.CylinderGeometry(tubeR * 1.18, tubeR * 1.25, 0.12, 32),
    new THREE.MeshStandardMaterial({ color: 0xe7e2d4, metalness: 0.1, roughness: 0.5 }));
  cap.position.y = -0.07;
  pick(cap, '튜브 도어 캡 (Door Cap)', '엘리베이터가 상승하면 이 석영/세라믹 캡이 튜브 하단 개구부를 막아 반응 챔버를 밀폐시킵니다.');
  carriage.add(cap);

  const boat = makeWaferBoat({ slots: 18, waferR: 0.3, gap: 0.078 });
  pick(boat, '석영 웨이퍼 보트 (Wafer Boat)', '웨이퍼 최대 150매를 일정 간격(슬롯 피치)으로 세워 꽂는 빗살형 지지대입니다. 재질은 석영(반투명) 또는 SiC(짙은 검정)이며, 튜브 하부에서 엘리베이터에 실려 삽입됩니다.');
  carriage.add(boat);

  const boatWafers = boat.userData.wafers;
  const dummySet = new Set([0, 1, boatWafers.length - 2, boatWafers.length - 1]);
  boatWafers.forEach((w, i) => { if (dummySet.has(i)) w.material = MAT.dark(0x4a5568); });
  pick(boatWafers[0], '더미 웨이퍼 (Dummy Wafer)', '보트 양 끝단에 배치되어 gas depletion에 의한 반응속도 편차를 흡수·보정하는 역할을 합니다.');
  const productIdx = Math.floor(boatWafers.length / 2);
  pick(boatWafers[productIdx], '제품 웨이퍼', '실제 산화막이 성장되는 제품 웨이퍼입니다. 보트 중앙부일수록 gas depletion 영향이 적어 상대적으로 균일합니다.');

  // 산화막 성장 오버레이 (웨이퍼마다 얇은 반투명 원판)
  const oxideOverlays = boatWafers.map((w) => {
    const ox = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.022, 40), MAT.glass(0x9be7cf, 0.0));
    ox.position.copy(w.position);
    boat.add(ox);
    return ox;
  });

  group.add(carriage);

  /* ================= 석영 튜브 + 가스 인젝터 ================= */
  const tube = new THREE.Mesh(
    new THREE.CylinderGeometry(tubeR, tubeR, TUBE_TOP - TUBE_BOTTOM, 40, 1, true),
    MAT.glass(0xbfe8ff, 0.22));
  tube.position.set(0, (TUBE_TOP + TUBE_BOTTOM) / 2, 0);
  pick(tube, '석영 튜브 (Quartz Tube)', '반응이 일어나는 고순도 석영관입니다. 지름 20~30cm, 길이 1.2~1.5m급이며 옅은 청록빛 투명체입니다. 상단은 막혀 있고 하단으로 보트가 삽입됩니다.');
  group.add(tube);

  const tubeCap = new THREE.Mesh(new THREE.CylinderGeometry(tubeR, tubeR, 0.06, 40), MAT.glass(0xbfe8ff, 0.4));
  tubeCap.position.set(0, TUBE_TOP, 0);
  group.add(tubeCap);

  const injector = new THREE.Mesh(
    new THREE.CylinderGeometry(0.024, 0.024, (TUBE_TOP - TUBE_BOTTOM) * 0.7, 12),
    MAT.glass(0xeaffff, 0.55));
  injector.position.set(tubeR * 0.4, TUBE_TOP - (TUBE_TOP - TUBE_BOTTOM) * 0.7 / 2 - 0.05, tubeR * 0.35);
  pick(injector, '가스 인젝터 (Gas Injector)', '튜브 상단에서 O2/N2/H2 등 공정가스를 내부로 길게 주입하는 지름 1~2cm급 얇은 석영관입니다.');
  group.add(injector);

  /* ================= 3존 히터 재킷 (makeOpenChamber 절개 재사용) ================= */
  const zoneNames = ['상단 존 (Zone 1, 트림 히터)', '중앙 존 (Zone 2, 메인 히터)', '하단 존 (Zone 3, 트림 히터)'];
  const heaterZones = [];
  for (let i = 0; i < 3; i++) {
    const zy = TUBE_BOTTOM + ZONE_H * (i + 0.5);
    const jacket = makeOpenChamber({ r: heaterR, h: ZONE_H * 0.94, y: zy, color: 0xaeb6c4, opening: Math.PI * 0.62 });
    pick(jacket, zoneNames[i], '석영 튜브를 감싸는 히터 슬리브입니다. 내부 나선형 발열선(니크롬계 합금)을 세라믹 단열재와 스테인리스 금속 외피가 감싸고 있으며, 3~5존으로 나눠 구간별 독립 온도제어합니다. 중앙 존이 메인 히터, 상/하단 존은 온도 균일도 보정용 트림 히터입니다.');
    group.add(jacket);
    const coilRings = [];
    for (let r2 = 0; r2 < 3; r2++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(heaterR * 0.74, 0.03, 8, 28), MAT.glow(0xff6a3a, 0.05));
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, zy - ZONE_H * 0.3 + r2 * (ZONE_H * 0.3), 0);
      coilRings.push(ring);
      group.add(ring);
    }
    heaterZones.push({ coilRings, target: 0 });
  }

  /* ================= 가스 패널 (좌측) ================= */
  const gasPanel = makeGasBox({ w: 1.0, h: 1.6, lines: 3 });
  gasPanel.position.set(-3.7, 0, 0);
  pick(gasPanel, '가스 패널 (O2/H2O 공급 유닛)', 'MFC(질량유량제어기)로 O2, H2 가스 유량을 정밀 제어해 건식/습식/ISSG 산화 조건을 형성합니다.');
  group.add(gasPanel);

  const valveO2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.14, 16), MAT.steel(0x58a6ff));
  valveO2.position.set(-3.85, 1.75, 0.3);
  pick(valveO2, 'O2 공급 밸브', '건식 산화용 고순도 산소 가스 공급량을 제어하는 밸브입니다.');
  group.add(valveO2);
  const valveH2O = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.14, 16), MAT.steel(0xffb703));
  valveH2O.position.set(-3.55, 1.75, 0.3);
  pick(valveH2O, 'H2O(수증기) 공급 밸브', 'H2와 O2를 연소시켜 만든 고온 수증기의 공급량을 제어하는 밸브입니다.');
  group.add(valveH2O);

  const screen = makeScreenPanel({ w: 0.62, h: 0.4 });
  screen.position.set(-3.7, 2.05, 0.19);
  group.add(screen);
  const screenLed = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 10), MAT.glow(0x30d158, 1.6));
  screenLed.position.set(-3.42, 2.25, 0.2);
  group.add(screenLed);

  const o2Line = makeHose([[-3.85, 1.75, 0.37], [-3.85, 3.55, 0.7], [-1.2, 3.75, 0.55], [tubeR * 0.4 + 0.05, TUBE_TOP - 0.06, tubeR * 0.35 + 0.05]], { radius: 0.045, color: 0x3a4256 });
  group.add(o2Line);
  const h2oLine = makeHose([[-3.55, 1.75, 0.37], [-3.55, 3.4, 0.9], [-0.8, 3.55, 0.75], [tubeR * 0.2, TUBE_TOP - 0.06, tubeR * 0.6]], { radius: 0.045, color: 0x39415a });
  group.add(h2oLine);

  const exhaustPipe = makePipe([[0, TUBE_BOTTOM - 0.15, tubeR + 0.1], [-1.6, 0.7, 0.3], [-3.4, 0.55, 0.1]], { radius: 0.055, color: 0x6b7488 });
  pick(exhaustPipe, '배기 매니폴드', '튜브 하단에서 반응 후 배기 가스를 스크러버 쪽으로 배출하는 배관입니다.');
  group.add(exhaustPipe);

  /* ================= 튜브 내부 가스 흐름 입자 (수직 흐름) ================= */
  const o2Stream = makeParticleStream({ count: 100, area: tubeR * 0.55, yTop: TUBE_TOP - 0.15, yBottom: TUBE_BOTTOM + 0.15, color: 0x58a6ff, size: 0.02 });
  group.add(o2Stream);
  const h2oStream = makeParticleStream({ count: 100, area: tubeR * 0.55, yTop: TUBE_TOP - 0.15, yBottom: TUBE_BOTTOM + 0.15, color: 0xf1f5ff, size: 0.024 });
  group.add(h2oStream);

  const furnaceLabel = makeLabel('수직형 확산로 (TEL Alpha-8)', { color: '#6ee7b7', size: 0.38 });
  furnaceLabel.position.set(0, TUBE_TOP + 0.35, 0);
  group.add(furnaceLabel);

  const tower = makeSignalTower();
  tower.position.set(0.95, BASE_H, 0.78);
  group.add(tower);

  /* ================= 로드 포트 & 로봇 (우측) ================= */
  const loadPort = makeLoadPort();
  loadPort.position.set(3.3, 0, 0.9);
  pick(loadPort, '로드 포트 & FOUP', '25장 웨이퍼가 담긴 FOUP이 거치되는 곳. 로봇이 이곳에서 웨이퍼를 꺼내 보트에 적재합니다.');
  group.add(loadPort);

  const robot = makeRobotArm({ reach: 1.6 });
  robot.position.set(1.7, 0, 0.55);
  pick(robot, '웨이퍼 이송 로봇', 'FOUP에서 웨이퍼를 꺼내 하강한 보트의 슬롯에 정확히 적재·회수하는 이송 로봇입니다.');
  group.add(robot);

  /* ================= 계측 스테이션 (후방) ================= */
  const metroStand = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 1.0, 20), MAT.steel(0x6b7488));
  metroStand.position.set(2.3, 0.5, -2.4);
  group.add(shadow(metroStand));
  const metroChuck = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.08, 40), MAT.dark(0x39415a));
  metroChuck.position.set(2.3, 1.04, -2.4);
  pick(metroChuck, '계측 스테이지', '냉각·언로딩된 웨이퍼를 올려 산화막 두께를 측정하는 스테이지입니다.');
  group.add(shadow(metroChuck));
  const metroWafer = makeBareWafer(0.42, 0.02);
  metroWafer.position.set(2.3, 1.1, -2.4);
  group.add(metroWafer);
  const metroOxide = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.03, 40), MAT.glass(0x9be7cf, 0.4));
  metroOxide.position.set(2.3, 1.12, -2.4);
  group.add(metroOxide);
  const ellipHead = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.3, 16), MAT.steel(0x9aa4b5));
  ellipHead.rotation.z = Math.PI * 0.72;
  ellipHead.position.set(1.75, 1.75, -2.4);
  pick(ellipHead, '엘립소미터 (KLA)', '편광된 빛의 반사 특성을 분석해 산화막 두께와 굴절률을 비접촉으로 측정합니다.');
  group.add(ellipHead);
  const ellipBeam = makeBeam([1.82, 1.65, -2.4], [2.3, 1.13, -2.4], { color: 0xddccff, radius: 0.02, opacity: 0.85 });
  group.add(ellipBeam);
  const metroLabel = makeLabel('두께 계측 (Ellipsometer)', { color: '#ddccff', size: 0.3 });
  metroLabel.position.set(2.3, 2.2, -2.4);
  group.add(metroLabel);

  /* ================= 단계 연출 ================= */
  let targetBoatY = BOAT_DOWN;
  let targetHeater = 0.05;
  let targetOxide = 0;
  let gasMode = 'none'; // 'none' | 'o2' | 'h2o'

  function show(...o) { o.forEach(x => x.visible = true); }
  function hide(...o) { o.forEach(x => x.visible = false); }

  const stepFx = [
    () => { // 0: 웨이퍼 로딩
      targetBoatY = BOAT_DOWN; targetHeater = 0.05; targetOxide = 0;
      gasMode = 'none'; hide(o2Stream, h2oStream);
    },
    () => { // 1: 승온
      targetBoatY = BOAT_UP; targetHeater = 0.55;
      gasMode = 'none'; hide(o2Stream, h2oStream);
    },
    () => { // 2: 건식 산화
      targetBoatY = BOAT_UP; targetHeater = 1.0; targetOxide = 0.55;
      gasMode = 'o2'; show(o2Stream); hide(h2oStream);
    },
    () => { // 3: 습식 산화
      targetBoatY = BOAT_UP; targetHeater = 1.0; targetOxide = 1.0;
      gasMode = 'h2o'; show(h2oStream); hide(o2Stream);
    },
    () => { // 4: 냉각 & 언로딩
      targetBoatY = BOAT_DOWN; targetHeater = 0.08;
      gasMode = 'none'; hide(o2Stream, h2oStream);
    },
    () => { // 5: 두께 계측
      targetBoatY = BOAT_DOWN; targetHeater = 0.05;
      gasMode = 'none'; hide(o2Stream, h2oStream);
    },
  ];
  stepFx[0]();

  let oxideProgress = 0;

  return {
    group,
    setStep(i) { stepFx[Math.min(i, stepFx.length - 1)]?.(); },
    tick(t, dt) {
      // 보트 엘리베이터 승강
      carriage.position.y += (targetBoatY - carriage.position.y) * Math.min(1, dt * 1.1);

      // 3존 히터 코일 발광
      heaterZones.forEach((zone, zi) => {
        const zoneMul = zi === 1 ? 1.0 : 0.82; // 중앙 존이 메인, 상/하단은 트림
        zone.coilRings.forEach((ring, ri) => {
          const base = ring.material.emissiveIntensity;
          const goal = targetHeater * zoneMul * (2.3 + Math.sin(t * 6 + zi + ri) * 0.3);
          const next = base + (goal - base) * Math.min(1, dt * 1.2);
          ring.material.emissiveIntensity = next;
          const hot = next > 1.2 ? 0xff8a4a : 0xff6a3a;
          ring.material.color.setHex(hot);
          ring.material.emissive.setHex(hot);
        });
      });

      // 산화막 성장(오버레이 opacity) 진행
      oxideProgress += (targetOxide - oxideProgress) * Math.min(1, dt * 0.6);
      oxideOverlays.forEach((ox, i) => {
        ox.material.opacity = dummySet.has(i) ? oxideProgress * 0.25 : oxideProgress * 0.55;
      });
      metroOxide.material.opacity = 0.35 + Math.sin(t * 2) * 0.05;

      // 가스 입자 흐름
      if (o2Stream.visible) o2Stream.userData.tick(dt);
      if (h2oStream.visible) h2oStream.userData.tick(dt);

      // 밸브 회전 (가스 흐르는 동안)
      if (gasMode === 'o2') valveO2.rotation.y += dt * 3;
      if (gasMode === 'h2o') valveH2O.rotation.y += dt * 3;

      // 스크린 상태 LED 점멸
      screenLed.material.emissiveIntensity = 1.0 + Math.sin(t * 5) * 0.8;

      // 신호탑 상태
      tower.userData.setState(targetHeater > 0.9 ? 'run' : targetHeater > 0.3 ? 'warn' : 'alarm');

      // 로봇 암 & 계측 웨이퍼
      robot.userData.setPose(Math.sin(t * 0.5) * 0.7, Math.sin(t * 0.7) * 0.5, Math.cos(t * 0.6) * 0.5);
      metroWafer.rotation.y += dt * 0.3;
    },
  };
}
