// 증착(CVD/ALD/PVD) & 이온주입 공정 모듈 — CVD 챔버 + 이온주입기 2대 구성
// export 계약(photo.js와 동일):
//   export const camera = { pos, target }
//   export const content = { overview, keyPoints, hbmNote, steps[], equipment[], parameters[], defects[] }
//   export function build3D(ctx) → { group, setStep(i), tick(t, dt) }
import * as THREE from 'three';
import {
  MAT, pick, shadow, makeWafer, makeCabinet, makeChamber,
  makePedestal, makeShowerhead, makeBeam, makeLabel, makeSignalTower,
  makeParticleStream, makeLoadPort, makeRobotArm,
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

  /* ================= CVD 챔버 (좌측) ================= */
  const cvd = new THREE.Group();
  cvd.position.set(-3.5, 0, 0);
  group.add(cvd);

  const cvdChamber = makeChamber({ r: 1.0, h: 1.3, y: 1.1, color: 0xc3c9d8 });
  pick(cvdChamber, '증착 챔버 (CVD Chamber)', 'CVD/PECVD 반응이 일어나는 진공 챔버. 가스 유량·압력·온도가 막질과 균일도를 결정합니다.');
  cvd.add(cvdChamber);

  const cvdShower = makeShowerhead({ r: 0.6, y: 1.62 });
  pick(cvdShower, '샤워헤드 (가스 분사판)', '전구체·반응가스를 웨이퍼 전면에 균일하게 분사. 노즐 대칭성이 무너지면 웨이퍼 중심/edge 두께 편차의 원인이 됩니다.');
  cvd.add(cvdShower);

  const cvdPedestal = makePedestal({ r: 0.5, y: 0.85 });
  pick(cvdPedestal, '웨이퍼 척 (페데스탈)', '웨이퍼를 고정하고 온도를 제어하는 히터 척. 표면온도가 CVD 반응 속도 분포를 좌우합니다.');
  cvd.add(cvdPedestal);

  const cvdParticles = makeParticleStream({ count: 110, area: 0.5, yTop: 1.55, yBottom: 1.04, color: PURPLE, size: 0.025 });
  cvdParticles.position.set(0, 0, 0);
  cvd.add(cvdParticles);

  const cvdCabinet = makeCabinet({ w: 1.3, h: 2.3, d: 1.1, color: 0xe8edf5 });
  cvdCabinet.position.set(-1.9, 0, -1.0);
  cvd.add(cvdCabinet);

  const cvdTower = makeSignalTower();
  cvdTower.position.set(1.35, 0, 1.1);
  cvd.add(cvdTower);

  const cvdLabel = makeLabel('CVD 챔버 (증착)', { color: '#a78bfa', size: 0.42 });
  cvdLabel.position.set(0, 3.1, 0);
  cvd.add(cvdLabel);

  /* ================= 이온주입기 (우측) ================= */
  const imp = new THREE.Group();
  imp.position.set(3.2, 0, 0);
  group.add(imp);

  const ionSource = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 24), MAT.steel(0x828da3));
  ionSource.position.set(-2.3, 1.3, 0);
  pick(ionSource, '이온원 (Ion Source)', '가스를 이온화해 붕소(B)·인(P)·비소(As) 등 도펀트 양이온을 생성합니다.');
  imp.add(shadow(ionSource));
  const ionSourceGlow = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), MAT.glow(0xd8b4fe, 2.6));
  ionSourceGlow.position.copy(ionSource.position);
  imp.add(ionSourceGlow);

  const massAnalyzer = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.55, 0.5), MAT.dark(0x39415a));
  massAnalyzer.position.set(-1.7, 1.3, 0);
  pick(massAnalyzer, '질량분석기 (Mass Analyzer)', '자기장으로 이온을 휘게 하여 원하는 질량의 도펀트 이온만 선별 통과시킵니다.');
  imp.add(shadow(massAnalyzer));

  const accelTube = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 1.35, 24), MAT.steel(0x9aa4b5));
  accelTube.rotation.z = Math.PI / 2;
  accelTube.position.set(-1.0, 1.3, 0);
  pick(accelTube, '가속관 (Accelerator Tube)', '고전압으로 이온을 가속시켜 원하는 에너지(투사 비정, 깊이)를 부여합니다. 에너지가 클수록 더 깊이 주입됩니다.');
  imp.add(shadow(accelTube));

  const impChamber = makeChamber({ r: 0.7, h: 1.0, y: 0.95, color: 0xc3c9d8 });
  impChamber.position.set(0.3, 0, 0);
  pick(impChamber, '이온주입 챔버 (End Station)', '가속된 이온빔이 최종적으로 웨이퍼에 도달하는 진공 챔버.');
  imp.add(impChamber);

  const impPedestal = makePedestal({ r: 0.42, y: 0.72 });
  impPedestal.position.set(0.3, 0, 0);
  pick(impPedestal, '웨이퍼 스테이지 (7° 틸트 척)', '웨이퍼를 7~8° 기울여 고정합니다. 단결정 격자를 따라 이온이 과도하게 깊이 침투하는 채널링(channeling)을 억제합니다.');
  imp.add(impPedestal);

  const beamHoriz = makeBeam([-2.15, 1.3, 0], [-0.35, 1.3, 0], { color: 0xd8b4fe, radius: 0.05, opacity: 0.85 });
  const beamDown = makeBeam([-0.35, 1.3, 0], [0.3, 0.99, 0], { color: 0xd8b4fe, radius: 0.06, opacity: 0.85 });
  imp.add(beamHoriz, beamDown);
  const implantSpot = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.015, 24), MAT.glow(0xe9d5ff, 3.2));
  implantSpot.position.set(0.3, 1.0, 0);
  imp.add(implantSpot);

  const impCabinet = makeCabinet({ w: 1.2, h: 2.2, d: 1.0, color: 0xe8edf5 });
  impCabinet.position.set(1.9, 0, -1.0);
  imp.add(impCabinet);

  const impTower = makeSignalTower();
  impTower.position.set(-2.9, 0, 1.0);
  imp.add(impTower);

  const impLabel = makeLabel('이온주입기 (Axcelis Purion)', { color: '#d8b4fe', size: 0.4 });
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
  loadPort.position.set(-6.4, 0, 1.4);
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
  const MID_POS = new THREE.Vector3(0, 2.4, 1.4);

  function show(...o) { o.forEach(x => { x.visible = true; }); }
  function hide(...o) { o.forEach(x => { x.visible = false; }); }

  let filmGrowth = 0; // 0~1
  let currentStep = 0;
  let carrying = false;

  const stepFx = [
    () => { // 0: CVD 로딩
      group.attach(wafer);
      wafer.position.copy(CVD_POS); wafer.rotation.set(0, 0, 0);
      hide(cvdParticles, beamHoriz, beamDown, implantSpot, probeTip);
      film.visible = false; filmGrowth = 0; film.scale.y = 0.05;
      carrying = false; robot.userData.setPose(0, 0, 0);
    },
    () => { // 1: 가스 주입 / 증착
      group.attach(wafer);
      wafer.position.copy(CVD_POS); wafer.rotation.set(0, 0, 0);
      show(cvdParticles); hide(beamHoriz, beamDown, implantSpot, probeTip);
      film.visible = true; film.scale.y = 0.15;
      carrying = false;
    },
    () => { // 2: 막 형성
      group.attach(wafer);
      wafer.position.copy(CVD_POS); wafer.rotation.set(0, 0, 0);
      show(cvdParticles, film); hide(beamHoriz, beamDown, implantSpot, probeTip);
      carrying = false;
    },
    () => { // 3: 이온주입기로 이동
      hide(cvdParticles, beamHoriz, beamDown, implantSpot, probeTip);
      film.visible = true;
      robot.userData.endEffector.attach(wafer);
      wafer.position.set(0, 0.12, 0); wafer.rotation.set(0, 0, 0);
      carrying = true;
    },
    () => { // 4: 이온빔 주입
      group.attach(wafer);
      wafer.position.copy(IMP_POS); wafer.rotation.set(0, 0, TILT);
      show(beamHoriz, beamDown, implantSpot, film); hide(cvdParticles, probeTip);
      carrying = false;
    },
    () => { // 5: 계측
      group.attach(wafer);
      wafer.position.copy(IMP_POS); wafer.rotation.set(0, 0, TILT);
      hide(cvdParticles, beamHoriz, beamDown, implantSpot); show(film, probeTip);
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
      cvdParticles.userData.tick(dt);
      ionSourceGlow.material.emissiveIntensity = 2.2 + Math.sin(t * 9) * 0.7;
      if (currentStep === 4) {
        implantSpot.material.emissiveIntensity = 2.6 + Math.sin(t * 14) * 1.0;
        beamHoriz.material.opacity = 0.65 + Math.sin(t * 10) * 0.2;
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
