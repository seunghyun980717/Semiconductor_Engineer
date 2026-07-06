// 증착(CVD/ALD/PVD) & 이온주입 공정 모듈 — CVD 챔버 + 이온주입기 2대 구성
// export 계약(photo.js와 동일):
//   export const camera = { pos, target }
//   export const content = { overview, keyPoints, hbmNote, steps[], equipment[], parameters[], defects[] }
//   export function build3D(ctx) → { group, setStep(i), tick(t, dt) }
import * as THREE from 'three';
import {
  MAT, pick, shadow, makeWafer, makeCabinet,
  makeShowerhead, makeBeam, makeLabel, makeSignalTower,
  makeParticleStream, makeLoadPort, makeRobotArm,
  makeOpenChamber, makeESC, makeGasBox, makeHose, makePipe, makeScreenPanel,
} from '../lib/equip-kit.js';

export const camera = { pos: [10, 6.5, 12], target: [0, 1.2, 0] };

export const content = {
  overview:
    '증착(Deposition)은 웨이퍼 표면에 절연막·금속막 등 새로운 박막을 쌓는 공정으로, CVD(화학기상증착)·PVD(물리기상증착)·ALD(원자층증착) 세 가지 방식이 목적에 따라 선택적으로 쓰입니다. ' +
    'CVD는 기체 전구체가 화학반응해 빠르게 막을 형성하고, PVD는 타겟에서 튕겨 나온 금속 원자를 응축시켜 고순도 배선막을 만들며, ALD는 전구체 흡착·반응을 원자층 단위로 반복해 가장 균일하고 컨포멀한 막을 얻습니다. ' +
    '이온주입(Ion Implantation)은 붕소(B)·인(P)·비소(As) 등 도펀트 이온을 고전압으로 가속해 웨이퍼 내부에 주입, 소스/드레인과 웰(well)의 전도형과 저항을 결정하는 공정입니다. ' +
    '두 공정은 순서상 이어지는 경우가 많아 한 모듈로 함께 다룹니다 — 절연막/하드마스크를 증착한 뒤 이온주입으로 불순물을 넣고, 마지막으로 활성화 어닐링을 거칩니다. ' +
    '미세화가 진행될수록 고종횡비 구조 내부까지 균일하게 채우는 스텝 커버리지와, 도펀트를 정확한 깊이·농도로 넣는 도즈 제어가 수율을 좌우하는 핵심 관리 지표가 됩니다.',
  keyPoints: [
    'CVD: 화학반응 기반, 증착 속도 빠르고 스텝 커버리지 양호 — 하드마스크·절연막(STI/IMD)에 주로 사용',
    'PVD(스퍼터링): 타겟 원자를 물리적으로 방출해 응축 — 고순도 금속 배선·배리어/시드층에 사용, 단차 피복은 상대적으로 낮음',
    'ALD: 전구체 흡착(self-limiting) → 퍼지 → 반응가스 → 퍼지 사이클 반복, 원자층 단위 두께 제어와 최고 수준의 컨포멀리티 제공',
    '이온주입: 이온원 → 질량분석기(원하는 이온만 선별) → 가속관(고전압 가속) → 웨이퍼 주입 순서로 진행',
    '채널링(Channeling) 방지를 위해 웨이퍼를 7~8° 기울여(tilt) 주입 — 단결정 격자 틈으로 이온이 과도하게 깊이 들어가는 현상을 억제',
    '이온주입 후에는 반드시 활성화 어닐링(RTA)으로 결정 손상을 복구하고 도펀트를 격자 자리에 치환시켜 전기적으로 활성화',
  ],
  hbmNote:
    'DRAM 셀 커패시터는 실린더형 3차원 구조 내부에 ZrO2/HfO2 같은 고유전율(high-k) 유전막을 ALD로 원자층 단위 균일 증착해야 충분한 정전용량을 확보할 수 있습니다. ' +
    '이온주입은 셀·주변회로 트랜지스터의 소스/드레인과 웰을 형성하며, 미세화가 진행될수록 얕은 접합 깊이와 저저항을 동시에 만족시켜야 하는 난제가 커지고 있습니다.',
  steps: [
    { name: 'CVD 로딩', desc: '로드포트의 FOUP에서 웨이퍼를 꺼내 CVD 챔버 페데스탈(척) 위에 안착시킵니다. 챔버는 이후 진공/공정압으로 전환됩니다.', camera: { pos: [-6, 4.5, 7], target: [-3.5, 1.1, 0] } },
    { name: '가스 주입 / 증착', desc: '샤워헤드에서 전구체·반응가스가 균일하게 분사되며 화학반응으로 박막이 형성되기 시작합니다. 보라색 입자 흐름이 가스 유입을 표현합니다.', camera: { pos: [-5, 4, 5.5], target: [-3.5, 1.3, 0] } },
    { name: '막 형성', desc: '웨이퍼 표면에 절연막/하드마스크가 점점 두껍게 쌓입니다. 웨이퍼 위 발광 박막의 두께가 증가하는 것으로 표현하며, 스텝 커버리지(상/하부 두께비)가 핵심 관리 지표입니다.', camera: { pos: [-3.5, 3.5, 4], target: [-3.5, 1.2, 0] } },
    { name: '이온주입기로 이동', desc: '이송 로봇이 증착이 끝난 웨이퍼를 CVD 챔버에서 꺼내 이온주입기 스테이지로 옮깁니다.', camera: { pos: [0, 4.5, 8], target: [0, 1.3, 0] } },
    { name: '이온빔 주입', desc: '이온원에서 생성된 도펀트 이온이 질량분석기로 선별되고 가속관에서 가속되어 빔으로 웨이퍼에 주입됩니다. 채널링을 막기 위해 웨이퍼가 7° 기울어져 있습니다.', camera: { pos: [6.5, 4, 7], target: [3.5, 1.2, 0] } },
    { name: '계측', desc: '시트저항(4-point probe)과 SIMS로 도펀트 깊이·농도 분포를, 두께 측정기로 박막 균일도를 측정해 SPC로 관리합니다.', camera: { pos: [3.5, 5.5, 9], target: [3.2, 1.2, 0] } },
  ],
  equipment: [
    { name: 'PECVD Producer', vendor: 'Applied Materials', role: '플라즈마 보조 화학기상증착으로 절연막·하드마스크를 형성. 빠른 증착 속도와 양호한 스텝 커버리지가 장점.', spec: '멀티 챔버 모듈형 플랫폼' },
    { name: 'ALD Pulsar / Eagle XP8', vendor: 'ASM International', role: '원자층 단위로 전구체·반응가스를 교차 주입해 하이-k 유전막을 최고 컨포멀리티로 증착. DRAM 커패시터 필수 장비.', spec: '두께 제어 단위 옹스트롬(Å)급' },
    { name: 'PVD Endura', vendor: 'Applied Materials', role: '스퍼터링으로 금속 배리어/시드층을 고순도 증착. 다마신 공정의 구리 도금 전 단계.', spec: '모듈형 멀티 챔버, Ta/TaN·Cu 시드 지원' },
    { name: '이온주입기 Purion', vendor: 'Axcelis Technologies', role: '이온원-질량분석기-가속관으로 구성되어 붕소·인·비소 등 도펀트 이온을 정밀한 도즈·에너지로 웨이퍼에 주입.', spec: '에너지 범위 2keV~1MeV, medium/high-current/high-energy 전 라인업' },
    { name: 'RTP 활성화 어닐 장비', vendor: 'Applied Materials Centura RTP', role: '이온주입 후 결정 손상을 복구하고 도펀트를 전기적으로 활성화하는 급속 열처리(RTA/스파이크 어닐) 수행.', spec: '초 단위 급속 승온, 열예산 최소화' },
  ],
  parameters: [
    { name: '박막 두께 / 균일도', typical: '웨이퍼 내(WIW) 편차 0.1nm 미만(첨단 노드 금속 게이트 기준)', monitor: '분광타원계(ellipsometry), 반사율계, 49포인트 맵' },
    { name: '스텝 커버리지', typical: '1에 근접할수록 이상적(트렌치 상/하부 두께비)', monitor: '단면 SEM/TEM' },
    { name: '증착 온도', typical: 'ALD 200~350°C, CVD는 공정별 상온~800°C 이상', monitor: '챔버 열전대, FDC(Fault Detection & Classification)' },
    { name: '도즈(Dose)', typical: '10¹¹~10¹⁶ ions/cm² (용도별 상이)', monitor: '패러데이 컵, 빔 전류 적산' },
    { name: '에너지(가속전압)', typical: '수 keV(초박막 접합) ~ 수백 keV·MeV급(딥 웰)', monitor: '가속관 전압 모니터링' },
    { name: '틸트각', typical: '통상 7° (채널링 억제)', monitor: '스테이지 각도 센서, IITS 정기 검증' },
  ],
  defects: [
    { name: 'Step Coverage 불량', signature: '두께 맵에서 트렌치 상부 대비 하부 두께비가 스펙 미달, 필드 내 위치별 편차 큼', cause: 'PVD의 시선(line-of-sight) 특성, CVD 표면온도 조건이 상단 반응에 치우침, 고종횡비/재진입형 구조', action: 'ALD 전환 또는 고순응성 CVD 적용, PVD collimator/IMP·웨이퍼 바이어스로 지향성 개선, 리플로우 어닐 추가' },
    { name: 'Void(보이드) 결함', signature: 'X-ray/SAM 또는 단면 SEM에서 트렌치·비아 내부 공극 관찰, 저항 산포 증가·개방 불량', cause: '상단부가 먼저 막히는 핀치오프(pinch-off)로 하부 미충전, 재진입형 프로파일에서 심화', action: 'bottom-up fill 화학 최적화, HDP-CVD 등 갭필 특화 공정, 식각 프로파일을 top이 넓은 tapered 형태로 사전 설계' },
    { name: 'Dose 불균일', signature: '시트저항(Rs) 맵에서 스캔/회전축 방향의 계통적 구배, 로트 평균은 정상이나 웨이퍼 내 uniformity(%)만 상승', cause: '빔 프로파일 불균일, 스캔 속도/횟수 불일치, 웨이퍼 회전·척 기계적 편차, 이면 파티클에 의한 척킹 불량', action: '패러데이 컵 어레이로 빔 프로파일 정기 모니터링, 멀티패스 스캔 최적화, 이면 파티클 프리클린 강화' },
    { name: '채널링에 의한 접합 깊이 이상', signature: 'SIMS 깊이 프로파일에서 예상보다 깊은 테일(tail), 접합 깊이(junction depth) 산포 확대', cause: '웨이퍼 틸트각 미준수 또는 틸트 기구 정밀도 저하로 이온이 단결정 격자 틈을 따라 과도하게 깊이 침투', action: '틸트각(7~8°) 정기 캘리브레이션, 웨이퍼 orientation flat 정렬 점검, IITS 기반 주기적 uniformity 검증' },
  ],
};

export function build3D(ctx) {
  const group = new THREE.Group();
  const PURPLE = 0xa78bfa;

  /* ================= CVD 챔버 (좌측, 개방형 절개) ================= */
  const cvd = new THREE.Group();
  cvd.position.set(-3.5, 0, 0);
  group.add(cvd);

  const cvdChamber = makeOpenChamber({ r: 1.0, h: 1.3, y: 1.1, color: 0xc3c9d8 });
  pick(cvdChamber, '증착 챔버 (CVD Chamber, 절개도)', '지름 40~60cm급 회색 알루미늄 원통 챔버. 전면이 절개되어 내부의 샤워헤드-갭(플레넘)-웨이퍼-서셉터 평행평판 구조가 그대로 보입니다.');
  cvd.add(cvdChamber);

  // 서셉터 — makeESC를 그라파이트(무광 검정) 변형으로 재구성
  const susceptor = makeESC({ r: 0.5, y: 0.91 });
  susceptor.children[1].material.color.set(0x18181c);
  susceptor.children[1].material.roughness = 0.85;
  susceptor.children[1].material.metalness = 0.02;
  susceptor.children[2].material.color.set(0x101012);
  susceptor.children[2].material.roughness = 0.9;
  susceptor.children[2].material.metalness = 0.02;
  susceptor.userData.focusRing.visible = false; // 식각 전용 부품이므로 CVD 서셉터에서는 제거
  pick(susceptor, '서셉터 (Susceptor)', '지름 30~35cm, 두께 2~5cm의 그라파이트(흑연) 원판. 내부에 저항 히터가 매립되어 표면온도로 CVD 반응 속도 분포를 좌우하며, 지지축(스템)을 통해 회전(수십 rpm)합니다.');
  cvd.add(susceptor);

  const cvdShower = makeShowerhead({ r: 0.58, y: 1.55 });
  pick(cvdShower, '샤워헤드 (가스 분배판)', '지름 32~38cm의 짙은 회색 알루미늄/니켈도금 원판. 서셉터와 5~30mm의 좁은 갭을 두고 마주보며 전구체·반응가스를 웨이퍼 전면에 균일 분사합니다. 노즐 대칭성이 무너지면 중심/edge 두께 편차의 원인이 됩니다.');
  cvd.add(cvdShower);

  const cvdParticles = makeParticleStream({ count: 110, area: 0.5, yTop: 1.5, yBottom: 0.95, color: PURPLE, size: 0.025 });
  cvd.add(cvdParticles);

  // 리모트 플라즈마 소스(RPS) — 챔버 상단 외부, 세라믹관+구리코일
  const rps = new THREE.Group();
  rps.position.set(0, 2.07, 0);
  const rpsTube = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.4, 24), MAT.paint(0xf1ede2));
  rps.add(shadow(rpsTube));
  const rpsGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.32, 16),
    new THREE.MeshBasicMaterial({ color: 0x8fd3ff, transparent: true, opacity: 0.5, toneMapped: false }));
  rps.add(rpsGlow);
  for (let i = 0; i < 4; i++) {
    const coil = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.028, 8, 24), MAT.copper());
    coil.rotation.x = Math.PI / 2;
    coil.position.y = -0.15 + i * 0.1;
    rps.add(coil);
  }
  const rpsCapTop = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.06, 24), MAT.steel(0x828da3));
  rpsCapTop.position.y = 0.23;
  const rpsCapBot = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 24), MAT.steel(0x828da3));
  rpsCapBot.position.y = -0.225;
  rps.add(rpsCapTop, rpsCapBot);
  pick(rps, '리모트 플라즈마 소스 (RPS)', '지름 10~15cm×길이 20~30cm의 유닛. 흰 세라믹 튜브를 구리색 유도결합(ICP) 코일이 감싸 가스를 플라즈마화한 뒤, 라디칼(반응성 활성종)만 샤워헤드로 흘려보내 챔버 내부에는 직접 플라즈마를 발생시키지 않습니다(웨이퍼 손상 최소화).');
  cvd.add(rps);

  // 가스박스 (MFC 패널)
  const gasBox = makeGasBox({ w: 0.85, h: 1.35, lines: 4 });
  gasBox.position.set(-1.85, 0, 1.05);
  gasBox.rotation.y = -0.35;
  pick(gasBox, '가스박스 (MFC 패널)', '전구체/캐리어가스별 질량유량계(MFC)가 줄지어 배관에 연결된 패널. 유량 정밀도가 막 조성·두께 재현성을 결정합니다.');
  cvd.add(gasBox);

  // 전구체 앰플/버블러 랙 — 유리병 + 히터 재킷 + 배관
  const ampouleRack = new THREE.Group();
  ampouleRack.position.set(-1.55, 0, 0.15);
  const rackBase = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.06, 0.4), MAT.steel(0x7f8ba3));
  rackBase.position.y = 0.03;
  ampouleRack.add(shadow(rackBase));
  for (let i = 0; i < 3; i++) {
    const xx = -0.28 + i * 0.28;
    const jacket = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.32, 20), MAT.paint(0xd7dee8));
    jacket.position.set(xx, 0.22, 0);
    ampouleRack.add(shadow(jacket));
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.08, 16), MAT.glass(0xd4a017, 0.55));
    neck.position.set(xx, 0.42, 0);
    ampouleRack.add(neck);
  }
  pick(ampouleRack, '전구체 앰플/버블러', '스테인리스 원통 용기(지름 10~15cm, 높이 20~40cm)에 액체/고체 전구체가 담겨 히터 재킷으로 온도가 유지되며, 캐리어 가스(Ar, N2)로 버블링시켜 증기를 챔버까지 운반합니다.');
  cvd.add(ampouleRack);
  // 히터 재킷 배관 (heat-traced line) — 단열재로 감싼 주름 호스로 샤워헤드까지 연결
  const precursorLine = makeHose(
    [[-1.55, 0.42, 0.15], [-1.1, 1.3, 0.35], [-0.3, 1.85, 0.1], [0, 1.87, 0]],
    { radius: 0.045, color: 0xdfe4ec }
  );
  cvd.add(precursorLine);
  cvd.add(makePipe([[-1.85, 0.9, 1.05], [-1.55, 0.5, 0.4]], { radius: 0.03 }));

  const cvdCabinet = makeCabinet({ w: 1.3, h: 2.3, d: 1.1, color: 0xe8edf5 });
  cvdCabinet.position.set(-1.9, 0, -1.15);
  pick(cvdCabinet, 'CVD 제어 캐비닛', '가스 시퀀스·RF/히터 파워·압력 제어 로직이 담긴 랙. 레시피(공정 조건 조합)를 저장·실행합니다.');
  cvd.add(cvdCabinet);

  const cvdTower = makeSignalTower();
  cvdTower.position.set(1.35, 0, 1.1);
  cvd.add(cvdTower);

  // 공정 모니터 (SPC 스크린)
  const monitorStand = new THREE.Group();
  monitorStand.position.set(1.5, 0, -1.0);
  monitorStand.rotation.y = 0.5;
  const monitorPole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.3, 12), MAT.dark(0x1a2030));
  monitorPole.position.y = 0.65;
  monitorStand.add(monitorPole);
  const monitorScreen = makeScreenPanel({ w: 0.6, h: 0.38, accent: '#a78bfa' });
  monitorScreen.position.y = 1.35;
  pick(monitorScreen, '공정 모니터 (SPC)', '박막 두께·균일도 추이를 실시간 SPC(통계적 공정관리) 차트로 표시. 관리한계 이탈 시 경보를 발생시킵니다.');
  monitorStand.add(monitorScreen);
  cvd.add(monitorStand);

  const cvdLabel = makeLabel('CVD 챔버 (증착)', { color: '#a78bfa', size: 0.42 });
  cvdLabel.position.set(0, 3.1, 0);
  cvd.add(cvdLabel);

  /* ================= 이온주입기 (우측, L자형 빔라인) ================= */
  const imp = new THREE.Group();
  imp.position.set(3.2, 0, 0);
  group.add(imp);

  const BEAM_Y = 1.3;

  // 이온원 — 절연 애자(세라믹 기둥) 위 터미널에 위치
  const insulatorStand = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.5, 16), MAT.paint(0xf1ede2));
  insulatorStand.position.set(-2.6, 1.05, 1.6);
  pick(insulatorStand, '절연 애자 (터미널 지지대)', '빔라인 전체에서 가장 높은 전위(수십~수백 kV)가 걸리는 이온원 터미널을 접지로부터 절연하는 흰색 세라믹 기둥입니다.');
  imp.add(shadow(insulatorStand));

  const ionSource = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 24), MAT.steel(0x828da3));
  ionSource.position.set(-2.6, BEAM_Y, 1.6);
  pick(ionSource, '이온원 (Ion Source)', '지름 10~20cm급 소형 챔버. BF3·PH3·AsH3 등 소스가스를 아크방전으로 이온화해 붕소(B)·인(P)·비소(As) 도펀트 양이온을 생성합니다. 두꺼운 스테인리스 외벽 내부에 텅스텐 필라멘트가 있습니다.');
  imp.add(shadow(ionSource));
  const ionSourceGlow = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), MAT.glow(0xd8b4fe, 2.6));
  ionSourceGlow.position.copy(ionSource.position);
  imp.add(ionSourceGlow);

  // 질량분석 마그넷 — C/H자형 철심 + 구리 코일, 빔이 90도 꺾이는 지점
  const massAnalyzer = new THREE.Group();
  massAnalyzer.position.set(-2.6, BEAM_Y, 0);
  const magTop = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.3, 1.15), MAT.dark(0x22283a));
  magTop.position.y = 0.32;
  const magBot = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.3, 1.15), MAT.dark(0x22283a));
  magBot.position.y = -0.32;
  massAnalyzer.add(shadow(magTop), shadow(magBot));
  const postA = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.9, 16), MAT.steel(0x6b7488));
  postA.position.set(0, 0, 0.55);
  const postB = postA.clone();
  postB.position.set(0, 0, -0.55);
  massAnalyzer.add(shadow(postA), shadow(postB));
  const coilA = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.05, 10, 28), MAT.copper());
  coilA.rotation.x = Math.PI / 2;
  coilA.position.set(0, 0, 0.55);
  const coilB = coilA.clone();
  coilB.position.set(0, 0, -0.55);
  massAnalyzer.add(coilA, coilB);
  pick(massAnalyzer, '질량분석 마그넷 (Mass Analyzing Magnet)', '가로세로 1~1.5m급의 육중한 전자석 — 장비 내 최대 부피/중량 단일 부품. 짙은 회색 철심(요크) 사이 구리색 코일이 자기장을 만들어, 그 갭을 통과하는 이온빔을 질량별로 부채꼴로 휘게 하여 원하는 질량의 이온만 선별 통과시킵니다. 여기서 빔 진행 방향이 약 90도 꺾입니다.');
  imp.add(massAnalyzer);

  // 가속관 — 세라믹 애자 링 + 금속 전극 링 반복 적층
  const accelTube = new THREE.Group();
  accelTube.position.set(0, BEAM_Y, 0);
  const ACCEL_X0 = -2.15, ACCEL_N = 9, ACCEL_STEP = 0.15;
  for (let i = 0; i < ACCEL_N; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.045, 12, 28),
      i % 2 === 0 ? MAT.paint(0xf1ede2) : MAT.steel(0x9aa4b5));
    ring.rotation.y = Math.PI / 2;
    ring.position.x = ACCEL_X0 + i * ACCEL_STEP;
    accelTube.add(ring);
  }
  pick(accelTube, '가속관 (Acceleration Column)', '세라믹 애자 디스크(흰색)와 금속 전극 링(은색)이 줄무늬처럼 교대로 적층된 원통(지름 20~40cm, 길이 1~2m). 전극 사이 고전압 구배로 이온을 목표 에너지까지 가속하며, 에너지가 클수록 더 깊이 주입됩니다.');
  imp.add(accelTube);

  // 스캐닝 시스템 — 빔을 편향시키는 정전 플레이트 한 쌍
  const scanSystem = new THREE.Group();
  scanSystem.position.set(-0.75, BEAM_Y, 0);
  const plateTop = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.34), MAT.steel(0xb9c2d4));
  plateTop.position.y = 0.2;
  const plateBot = plateTop.clone();
  plateBot.position.y = -0.2;
  scanSystem.add(shadow(plateTop), shadow(plateBot));
  pick(scanSystem, '스캐닝 시스템', '마주보는 은색 금속판 한 쌍이 빔을 좌우/상하로 편향시켜 웨이퍼 전면을 고르게 훑고, 이후 평행화 렌즈로 균일한 평행빔이 되도록 보정합니다.');
  imp.add(scanSystem);

  // 엔드스테이션 — 개방형 챔버 + 세라믹 플래튼(틸트 척)
  const impChamber = makeOpenChamber({ r: 0.7, h: 1.0, y: 0.95, color: 0xc3c9d8 });
  impChamber.position.set(0.3, 0, 0);
  pick(impChamber, '엔드스테이션 (End Station)', '지름 50~80cm급 회색 알루미늄/스테인리스 챔버. 빔라인의 최종 목적지로, 절개된 전면을 통해 내부의 웨이퍼 플래튼과 회전/병진 구동부가 보입니다.');
  imp.add(impChamber);

  const platen = makeESC({ r: 0.42, y: 0.78 });
  platen.position.set(0.3, 0, 0);
  pick(platen, '웨이퍼 플래튼 (7° 틸트 척)', '세라믹/금속 재질의 정전척(platen). 웨이퍼를 7~8° 기울여 고정해, 단결정 격자를 따라 이온이 과도하게 깊이 침투하는 채널링(channeling)을 억제합니다. 회전·병진 구동부로 웨이퍼 전면을 스캔합니다.');
  imp.add(platen);

  // 빔 경로 — 이온원→마그넷(z축, 90도 꺾임 전) → 마그넷→엔드스테이션(x축, 꺾인 후) → 웨이퍼로 하강
  const beamZ = makeBeam([-2.6, BEAM_Y, 1.45], [-2.6, BEAM_Y, 0.05], { color: 0xd8b4fe, radius: 0.05, opacity: 0.85 });
  const beamX = makeBeam([-2.6, BEAM_Y, 0], [-0.35, BEAM_Y, 0], { color: 0xd8b4fe, radius: 0.05, opacity: 0.85 });
  const beamDown = makeBeam([-0.35, BEAM_Y, 0], [0.3, 0.99, 0], { color: 0xd8b4fe, radius: 0.06, opacity: 0.85 });
  imp.add(beamZ, beamX, beamDown);
  const implantSpot = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.015, 24), MAT.glow(0xe9d5ff, 3.2));
  implantSpot.position.set(0.3, 1.0, 0);
  imp.add(implantSpot);

  const impCabinet = makeCabinet({ w: 1.2, h: 2.2, d: 1.0, color: 0xe8edf5 });
  impCabinet.position.set(1.7, 0, -1.0);
  pick(impCabinet, '이온주입기 제어 캐비닛', '빔 전류·에너지·도즈·스캔 시퀀스를 제어하는 랙. 고전압 인터록도 이곳에서 관리됩니다.');
  imp.add(impCabinet);

  const impTower = makeSignalTower();
  impTower.position.set(-2.9, 0, -1.2);
  imp.add(impTower);

  const impLabel = makeLabel('이온주입기 (Axcelis Purion) — L자형 빔라인', { color: '#d8b4fe', size: 0.4 });
  impLabel.position.set(-0.3, 3.0, 0);
  imp.add(impLabel);

  // 계측 프로브 (4-point probe / SIMS 표현)
  const probeArm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.9), MAT.dark(0x1a2030));
  probeArm.position.set(0.3, 1.5, -0.7);
  imp.add(probeArm);
  const probeTip = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.22, 12), MAT.gold());
  probeTip.rotation.x = Math.PI;
  probeTip.position.set(0.3, 1.15, -0.7);
  pick(probeTip, '계측 프로브 (4-Point Probe / SIMS)', '시트저항과 도펀트 깊이 프로파일을 측정해 도즈·접합깊이 이상을 조기 검출합니다.');
  imp.add(probeTip);

  /* ================= 로드포트 & 이송 로봇 ================= */
  const loadPort = makeLoadPort();
  loadPort.position.set(-6.2, 0, 1.4);
  pick(loadPort, '로드포트 & FOUP', '25장 웨이퍼가 담긴 FOUP이 거치되는 곳. 여기서 첫 웨이퍼가 CVD 챔버로 이송됩니다.');
  group.add(loadPort);

  const robot = makeRobotArm({ reach: 1.6 });
  robot.position.set(-0.15, 0, 0.4);
  pick(robot, '웨이퍼 이송 로봇', 'CVD 챔버와 이온주입기 사이에서 웨이퍼를 반송합니다. 핸드오프 오차는 스크래치성 결함의 원인이 됩니다.');
  group.add(robot);

  /* ================= 웨이퍼 (챔버 간 이동하는 단일 개체) ================= */
  const wafer = makeWafer(0.5, { tint: '#a78bfa' });
  group.add(wafer);

  const film = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.47, 0.02, 48), MAT.glow(0xc4b5fd, 0.4));
  film.position.set(0, 0.028, 0);
  wafer.add(film);

  const TILT = THREE.MathUtils.degToRad(7);
  const CVD_POS = new THREE.Vector3(-3.5, 1.025, 0);
  const IMP_POS = new THREE.Vector3(3.5, 1.005, 0);

  function show(...o) { o.forEach(x => { x.visible = true; }); }
  function hide(...o) { o.forEach(x => { x.visible = false; }); }

  let filmGrowth = 0; // 0~1
  let currentStep = 0;
  let carrying = false;

  const stepFx = [
    () => { // 0: CVD 로딩
      group.attach(wafer);
      wafer.position.copy(CVD_POS); wafer.rotation.set(0, 0, 0);
      hide(cvdParticles, beamZ, beamX, beamDown, implantSpot, probeTip);
      film.visible = false; filmGrowth = 0; film.scale.y = 0.05;
      carrying = false; robot.userData.setPose(0, 0, 0);
    },
    () => { // 1: 가스 주입 / 증착
      group.attach(wafer);
      wafer.position.copy(CVD_POS); wafer.rotation.set(0, 0, 0);
      show(cvdParticles); hide(beamZ, beamX, beamDown, implantSpot, probeTip);
      film.visible = true; film.scale.y = 0.15;
      carrying = false;
    },
    () => { // 2: 막 형성
      group.attach(wafer);
      wafer.position.copy(CVD_POS); wafer.rotation.set(0, 0, 0);
      show(cvdParticles, film); hide(beamZ, beamX, beamDown, implantSpot, probeTip);
      carrying = false;
    },
    () => { // 3: 이온주입기로 이동
      hide(cvdParticles, beamZ, beamX, beamDown, implantSpot, probeTip);
      film.visible = true;
      robot.userData.endEffector.attach(wafer);
      wafer.position.set(0, 0.12, 0); wafer.rotation.set(0, 0, 0);
      carrying = true;
    },
    () => { // 4: 이온빔 주입
      group.attach(wafer);
      wafer.position.copy(IMP_POS); wafer.rotation.set(0, 0, TILT);
      show(beamZ, beamX, beamDown, implantSpot, film); hide(cvdParticles, probeTip);
      carrying = false;
    },
    () => { // 5: 계측
      group.attach(wafer);
      wafer.position.copy(IMP_POS); wafer.rotation.set(0, 0, TILT);
      hide(cvdParticles, beamZ, beamX, beamDown, implantSpot); show(film, probeTip);
      carrying = false;
    },
  ];

  stepFx[0]();

  return {
    group,
    setStep(i) {
      currentStep = Math.min(i, stepFx.length - 1);
      stepFx[currentStep]?.();
    },
    tick(t, dt) {
      wafer.rotation.y += 0.4 * dt;
      susceptor.rotation.y += 0.6 * dt; // 서셉터 회전(수십 rpm 표현)
      cvdParticles.userData.tick(dt);
      ionSourceGlow.material.emissiveIntensity = 2.2 + Math.sin(t * 9) * 0.7;
      rpsGlow.material.opacity = 0.3 + Math.sin(t * 7) * 0.18;
      if (currentStep === 4 || currentStep === 5) {
        // 마그넷 통전 시 은은한 열/자기장 표현
        massAnalyzer.rotation.y = Math.sin(t * 3) * 0.003;
      }
      if (currentStep === 4) {
        implantSpot.material.emissiveIntensity = 2.6 + Math.sin(t * 14) * 1.0;
        beamZ.material.opacity = 0.6 + Math.sin(t * 10) * 0.2;
        beamX.material.opacity = 0.65 + Math.sin(t * 10 + 0.6) * 0.2;
      }
      if (currentStep === 2 && filmGrowth < 1) {
        filmGrowth = Math.min(1, filmGrowth + dt * 0.3);
        film.scale.y = 0.15 + filmGrowth * 2.6;
        film.material.emissiveIntensity = 0.4 + filmGrowth * 1.2;
      }
      if (carrying) {
        const swing = Math.sin(t * 1.4) * 0.9;
        robot.userData.setPose(swing * 0.55 + 0.55, Math.sin(t * 1.8) * 0.35, Math.cos(t * 1.6) * 0.3);
      } else {
        robot.userData.setPose(Math.sin(t * 0.35) * 0.15, Math.sin(t * 0.5) * 0.15, Math.cos(t * 0.45) * 0.15);
      }
    },
  };
}
