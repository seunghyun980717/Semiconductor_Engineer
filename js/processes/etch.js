// 식각 공정 모듈 — 플라즈마 식각기(RIE/ICP) + RF 제너레이터 + 가스박스 + 진공펌프
// export 계약: camera, content, build3D(ctx) → { group, setStep(i), tick(t,dt) }
import * as THREE from 'three';
import {
  MAT, pick, shadow, makeWafer, makeBareWafer, makeCabinet, makeChamber,
  makePedestal, makeShowerhead, makePipe, makeBeam, makePlasmaGlow, makeLabel,
  makeSignalTower, makeParticleStream, makeLoadPort, makeRobotArm,
} from '../lib/equip-kit.js';

export const camera = { pos: [8.5, 6, 10], target: [0.5, 1.4, 0] };

export const content = {
  overview:
    '식각(Etch)은 포토 공정으로 형성된 감광액(PR) 패턴을 마스크 삼아 그 아래의 산화막·질화막·폴리실리콘·금속막을 선택적으로 제거해 실제 회로 구조를 새기는 공정입니다. ' +
    '현대 미세 공정은 반응성 가스를 플라즈마 상태로 여기시키는 건식 식각(Dry/Plasma Etch)을 표준으로 사용하며, 특히 전기장으로 이온을 수직 가속시켜 화학적 반응과 물리적 충돌을 동시에 활용하는 ' +
    'RIE(Reactive Ion Etching)가 핵심 원리입니다. 이를 통해 높은 선택비(Selectivity)와 비등방성(Anisotropic) 프로파일을 동시에 확보할 수 있습니다. ' +
    'DRAM 커패시터처럼 종횡비 50:1에 달하는 초고종횡비 홀을 뚫는 HARC(High Aspect Ratio Contact) 식각에서는 극저온(Cryogenic) 공정까지 동원해 수직 프로파일을 지킵니다. ' +
    '공정이 끝나는 시점을 판단하는 EPD(End Point Detection, 종말점 검출)는 플라즈마의 광 발광 스펙트럼 변화를 실시간 모니터링해 정확한 식각 종료 시점을 알려줍니다.',
  keyPoints: [
    '선택비(Selectivity): 마스크·하부막은 보존하고 목표막만 제거하는 능력, 완전한 선택은 불가능해 PR도 일부 소모됨',
    '비등방성(Anisotropic) 식각: 이온을 수직 가속해 측벽을 보호하며 아래로만 파고드는 방향성 확보 (미세 패턴의 필수조건)',
    'RIE = 화학적 라디칼 식각 + 물리적 이온 스퍼터링의 결합 — 높은 선택비와 수직 프로파일을 동시에 달성',
    '가스 선택이 핵심: Si는 불소(F)계, SiO2는 탄소-불소(CF/C4F8)계, 첨가가스(O2/Ar/HBr)로 측벽 보호막(passivation) 조절',
    'EPD(종말점 검출)로 플라즈마 발광 스펙트럼 변화를 감지해 오버에치 시간을 정밀 관리',
    'DRAM 커패시터 HARC 식각은 종횡비 약 50:1 — 상하부 CD 일관성(보잉 방지)이 최대 난제',
  ],
  hbmNote:
    'HBM/DRAM 셀 커패시터는 제한된 면적에서 최대 정전용량을 얻기 위해 실린더형 3차원 홀을 종횡비 50:1 수준까지 깊게 뚫는 HARC 식각을 요구합니다. ' +
    '상부 측벽이 파이는 보잉(bowing) 프로파일이 대표적 난제이며, Lam Research의 극저온 식각(Cryo 3.0) 기술이 채널홀 식각에서 이 구조로 확장 적용되는 추세입니다. ' +
    'TSV(관통전극) 형성 역시 식각 공정으로 깊은 비아 홀을 뚫는 단계에서 시작되어, HBM 적층 기술의 출발점이 됩니다.',
  steps: [
    { name: '웨이퍼 로딩', desc: '이송 로봇이 FOUP에서 웨이퍼를 꺼내 챔버 내부 하부 전극(페데스탈) 위에 정렬해 올려놓습니다.', camera: { pos: [-3, 4.5, 7], target: [-4.5, 1.2, 0] } },
    { name: '진공 배기', desc: '챔버 도어를 닫고 터보 펌프로 내부를 수~수백 mTorr 수준까지 배기해 공정 압력을 형성합니다.', camera: { pos: [3, 4.5, 6], target: [0.8, 1.3, -1.5] } },
    { name: '플라즈마 점화', desc: 'RF 제너레이터가 소스 파워를 인가해 가스를 이온화, 챔버 내부에 핑크빛 플라즈마가 점화됩니다.', camera: { pos: [4, 4, 6], target: [0.8, 1.5, 0] } },
    { name: '메인 식각 (EPD 모니터링)', desc: '이온이 수직 가속되어 노출된 막을 식각합니다. EPD가 플라즈마 발광 스펙트럼 변화를 실시간 추적해 종료 시점을 판단합니다.', camera: { pos: [2.5, 3.5, 5], target: [0.8, 1.3, 0] } },
    { name: '오버에치', desc: '잔막을 완전히 제거하기 위해 짧게 추가 식각(오버에치)을 진행합니다. 과도하면 하부막 손상, 부족하면 잔막(스컴)이 남습니다.', camera: { pos: [2.5, 3.5, 5], target: [0.8, 1.3, 0] } },
    { name: '언로딩 & 챔버 클린', desc: '플라즈마를 끄고 챔버를 퍼지한 뒤 로봇이 웨이퍼를 회수합니다. 챔버 벽의 폴리머 잔류물은 파티클 원인이 되어 주기적 클린이 필요합니다.', camera: { pos: [-3, 4.5, 7], target: [-4.5, 1.2, 0] } },
  ],
  equipment: [
    { name: 'Kiyo 시리즈', vendor: 'Lam Research', role: 'TCP(유도결합) 대칭 챔버로 폴리실리콘/게이트 등 도전체(conductor)를 식각. 플라즈마 펄싱으로 프로파일 제어.', spec: '소스/바이어스 파워 독립 제어' },
    { name: 'Flex 시리즈', vendor: 'Lam Research', role: '소용량 confined 플라즈마와 RF 펄싱으로 유전체(SiO2/SiN 등) 식각을 담당.', spec: 'CD 균일도 관리 특화' },
    { name: 'Telius SCCM', vendor: 'Tokyo Electron(TEL)', role: '산화막 식각 및 HARC(고종횡비 컨택) 식각을 위한 챔버 플랫폼.', spec: '고종횡비 프로파일 제어' },
    { name: 'Lam Cryo 3.0', vendor: 'Lam Research', role: '영하 수십~백 도 극저온에서 측벽 보호막 특성을 개선해 NAND 채널홀·DRAM HARC 식각의 CD 변동을 최소화.', spec: 'CD 변동 <0.1%' },
    { name: 'Sense.i 플랫폼', vendor: 'Lam Research', role: 'AI 기반 실시간 바이어스 보정으로 컨택홀 식각 수율을 개선하는 차세대 공정제어 시스템.', spec: '컨택홀 수율 약 +3%p' },
  ],
  parameters: [
    { name: 'RF 소스 파워', typical: '수백~수천 W (챔버·레시피별 상이)', monitor: 'RF 매칭 네트워크 반사파, OES(광발광분광)' },
    { name: 'RF 바이어스 파워', typical: '수십~수백 W (이온 에너지 제어)', monitor: 'DC 바이어스 전압 모니터' },
    { name: '챔버 압력', typical: '수 mTorr ~ 수백 mTorr', monitor: '캐패시턴스 마노미터, MFC 연동' },
    { name: '가스 유량/조성', typical: 'CF4, C4F8, Cl2, HBr, O2, Ar 등 sccm 단위 배합', monitor: 'MFC(질량유량제어기) 실시간 로깅' },
    { name: '척 온도(극저온 포함)', typical: '상온 ~ 영하 수십~백 도(Cryo)', monitor: '정전척 온도센서, 칠러 피드백' },
    { name: 'CD/종횡비 변동', typical: 'HARC 기준 종횡비 ~50:1, 변동 0.1% 이내 목표', monitor: 'SEM 단면, 다중파장 EPD' },
  ],
  defects: [
    { name: 'Under-etch / Over-etch', signature: '잔막 두께 또는 CD가 목표 대비 이탈, SPC 차트에서 etch rate가 시간에 따라 서서히 감소하는 chamber drift 패턴, EPD 트리거 시점이 로트별로 지연/앞당겨짐', cause: 'RF 파워·가스 유량/압력 drift, 챔버 내벽 폴리머 축적에 따른 특성 변화, RF 매칭 네트워크·전극 노후화, micro-loading effect', action: '챔버 시즈닝(더미 웨이퍼) 표준화, PM 후 안정화 run 확보, 다중파장 EPD 적용, 전극/매칭 정기 교체' },
    { name: '프로파일 이상 (Bowing/Taper/Undercut)', signature: 'SEM 단면에서 측벽이 볼록(bowing)하거나 상부가 넓은 taper, 마스크 아래로 파고드는 undercut 관찰, top/bottom CD 비율 스펙 이탈', cause: '이온-중성입자 충돌로 측벽에 경사 입사(sheath 효과), passivation 가스 부족/과다, 고종횡비에 따른 RIE lag', action: 'passivation 가스 조성 최적화, 펄스 플라즈마로 이온 에너지 분포 제어, Cryo/ALE(원자층 식각) 적용' },
    { name: 'Plasma Induced Damage (안테나 효과)', signature: '게이트 산화막 TDDB/Vt 시험에서 antenna ratio가 큰 셀에 국한된 누설전류 증가, EDS에서 특정 회로 패턴(net)에만 반복되는 systematic 실패', cause: '플라즈마 중 floating 도전체가 안테나처럼 전하를 모아 게이트 산화막으로 방전, 고종횡비 구조의 electron shading effect', action: '설계 단계 Antenna Rule 적용, 보호 다이오드 삽입, 레이아웃 점퍼 배선 분산, 플라즈마 균일성/RF 펄싱 개선' },
    { name: 'Chamber 파티클 오염', signature: '파티클 검사에서 웨이퍼 edge 국소 클러스터, 로트 진행에 따라 파티클이 점증하다 PM 직후 급감하는 saw-tooth 트렌드', cause: 'RF on/off 전환 시 폴리머 잔류물 박리, 챔버 코팅재(Y2O3 등) 플라즈마 침식, 이전 로트 오염의 carry-over', action: 'Wet/Dry 클린 주기 최적화, 내식성 세라믹 코팅 재도포, 점화/소등 시퀀스 최적화, 챔버별 파티클 SPC 관리' },
    { name: 'Donut / Ring 빈맵 패턴', signature: 'EDS 웨이퍼 빈맵에서 edge 안쪽 도넛형 또는 고리형 실패 분포', cause: '식각 챔버 edge ring(소모품) 마모로 인한 edge 근처 플라즈마 밀도 불균일, 챔버 내 가스 흐름 비대칭', action: 'edge ring 마모 점검·교체 주기 관리, 플라즈마 균일성 튜닝, EPD 다중 포인트 모니터링' },
  ],
};

export function build3D(ctx) {
  const group = new THREE.Group();

  /* ================= 플라즈마 식각 챔버 (중앙) ================= */
  const cham = new THREE.Group();
  cham.position.set(0.8, 0, 0);

  const chamber = makeChamber({ r: 1.0, h: 1.5, y: 1.25, color: 0xb9c2d4 });
  pick(chamber, '플라즈마 식각 챔버', '내부를 진공으로 만들고 반응성 가스를 플라즈마화해 웨이퍼 표면막을 선택적으로 제거하는 핵심 반응 공간입니다.');
  cham.add(chamber);

  // 하부 전극 (페데스탈 겸 정전척)
  const pedestal = makePedestal({ r: 0.56, y: 0.82 });
  pick(pedestal, '하부 전극 (정전척, ESC)', '웨이퍼를 정전기력으로 고정하고 RF 바이어스를 인가해 이온을 수직으로 가속시키는 하부 전극입니다. 온도까지 정밀 제어합니다.');
  cham.add(pedestal);

  // 웨이퍼 (챔버 내부, 페데스탈 위)
  const chamberWafer = makeWafer(0.5, { tint: '#f9a8d4' });
  chamberWafer.position.set(0, pedestal.userData.topY + 0.02, 0);
  cham.add(chamberWafer);

  // 상부 전극 (샤워헤드)
  const showerhead = makeShowerhead({ r: 0.62, y: 1.78 });
  pick(showerhead, '상부 전극 (샤워헤드)', '반응 가스를 챔버 내부로 균일하게 분사하는 동시에 상부 전극 역할을 겸해 플라즈마를 형성합니다.');
  cham.add(showerhead);

  // 플라즈마 글로우 (핑크)
  const plasma = makePlasmaGlow({ r: 0.58, h: 0.55, color: 0xf472b6 });
  plasma.position.set(0, 1.32, 0);
  cham.add(plasma);

  // 식각 부산물 파티클 (챔버 하부 → 배기 방향)
  const byproduct = makeParticleStream({ count: 70, area: 0.45, yTop: 0.95, yBottom: 0.35, color: 0xffd7ea, size: 0.02 });
  byproduct.position.set(0, 0, 0);
  cham.add(byproduct);

  const chamLabel = makeLabel('플라즈마 식각기', { color: '#f472b6', size: 0.42 });
  chamLabel.position.set(0, 2.75, 0);
  cham.add(chamLabel);

  const towerC = makeSignalTower();
  towerC.position.set(1.5, 2.16, 1.1);
  cham.add(towerC);

  group.add(cham);

  /* ================= RF 제너레이터 캐비닛 (좌측) ================= */
  const rfCab = makeCabinet({ w: 1.3, h: 2.0, d: 1.1, color: 0xdde3ec });
  rfCab.position.set(-2.4, 0, -0.3);
  pick(rfCab, 'RF 제너레이터', '13.56MHz 등 고주파 전력을 발생시켜 매칭 네트워크를 거쳐 상/하부 전극에 인가, 가스를 이온화해 플라즈마를 유지합니다.');
  group.add(rfCab);

  const rfLabel = makeLabel('RF 제너레이터', { color: '#58a6ff', size: 0.34 });
  rfLabel.position.set(-2.4, 2.35, -0.3);
  group.add(rfLabel);

  // RF 전력 전달 빔 (RF 캐비닛 → 상부 전극)
  const rfBeam = makeBeam([-2.4, 1.9, -0.3], [0.8, 1.85, 0], { color: 0xff6fb0, radius: 0.025, opacity: 0.75 });
  group.add(rfBeam);

  /* ================= 가스박스 (우측 후방) ================= */
  const gasBox = new THREE.Group();
  gasBox.position.set(3.6, 0, -1.2);
  const gasCab = makeCabinet({ w: 1.1, h: 1.8, d: 1.0, color: 0xc8cfdc, screen: false });
  pick(gasCab, '가스박스 (MFC 랙)', 'CF4·C4F8·Cl2·HBr·O2·Ar 등 반응/첨가 가스를 질량유량제어기(MFC)로 정밀 배합해 챔버로 공급합니다.');
  gasBox.add(gasCab);
  for (let i = 0; i < 4; i++) {
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 1.1, 20), MAT.steel([0x9aa4b5, 0xc9915a, 0x6ba86b, 0x9aa4b5][i]));
    cyl.position.set(-0.5 + i * 0.32, 0.6, 0.85);
    gasBox.add(shadow(cyl));
  }
  const gasLabel = makeLabel('가스박스', { color: '#a78bfa', size: 0.34 });
  gasLabel.position.set(0, 2.15, 0.4);
  gasBox.add(gasLabel);
  group.add(gasBox);

  const gasPipe = makePipe([[3.6, 1.9, -0.6], [2.6, 2.3, -0.6], [1.3, 2.3, -0.2], [0.8, 2.05, 0]], { radius: 0.045 });
  group.add(gasPipe);

  /* ================= 진공펌프 배관 (챔버 후방 하부) ================= */
  const pumpGroup = new THREE.Group();
  pumpGroup.position.set(0.9, 0, -2.3);
  const pumpBody = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.9, 24), MAT.steel(0x7c8598));
  pumpBody.position.y = 0.45;
  pick(pumpBody, '터보 분자펌프', '챔버 내부를 수~수백 mTorr 수준의 고진공으로 배기하는 핵심 배기 장치입니다. 로터가 고속 회전하며 기체 분자를 밀어냅니다.');
  pumpGroup.add(shadow(pumpBody));
  const rotor = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.06, 24), MAT.dark(0x39415a));
  rotor.position.y = 0.85;
  pumpGroup.add(rotor);
  const pumpLabel = makeLabel('터보 펌프', { color: '#6ee7b7', size: 0.3 });
  pumpLabel.position.set(0, 1.25, 0);
  pumpGroup.add(pumpLabel);
  group.add(pumpGroup);

  const vacPipe = makePipe([[0.8, 0.33, 0], [0.8, 0.2, -1.1], [0.9, 0.9, -2.0], [0.9, 0.9, -2.3]], { radius: 0.06 });
  pick(vacPipe, '배기 배관', '챔버에서 발생한 반응 부산물 가스를 터보펌프로 이송해 외부로 배출합니다.');
  group.add(vacPipe);

  /* ================= EPD 모니터 패널 (챔버 옆) ================= */
  const epdCanvas = document.createElement('canvas');
  epdCanvas.width = 256; epdCanvas.height = 128;
  const epdCtx = epdCanvas.getContext('2d');
  const epdTex = new THREE.CanvasTexture(epdCanvas);
  const epdPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(0.9, 0.5),
    new THREE.MeshBasicMaterial({ map: epdTex, toneMapped: false })
  );
  epdPanel.position.set(1.95, 1.7, 0.55);
  epdPanel.rotation.y = -0.5;
  pick(epdPanel, 'EPD (종말점 검출) 모니터', '플라즈마의 광 발광 스펙트럼 강도를 실시간으로 추적해 목표막이 다 제거되는 순간(종말점)을 감지합니다.');
  group.add(epdPanel);
  const epdHistory = new Array(64).fill(0.5);

  /* ================= 로드포트 & 이송 로봇 (좌측) ================= */
  const loadPort = makeLoadPort();
  loadPort.position.set(-5.8, 0, 1.1);
  pick(loadPort, '로드포트 & FOUP', '식각 전/후 웨이퍼가 담긴 FOUP이 거치되는 곳. 대기와 진공 사이를 오가는 웨이퍼의 관문입니다.');
  group.add(loadPort);

  const robot = makeRobotArm({ reach: 1.3 });
  robot.position.set(-4.6, 0, 0);
  pick(robot, '웨이퍼 이송 로봇', 'FOUP과 챔버 사이에서 웨이퍼를 반송합니다. 핸드오프 오류는 스크래치성 EDS 불량의 원인이 되기도 합니다.');
  group.add(robot);

  const robotWafer = makeBareWafer(0.42, 0.025);
  robot.userData.endEffector.add(robotWafer);
  robotWafer.position.y = 0.03;

  /* ================= 단계 연출 ================= */
  function show(...o) { o.forEach(x => x.visible = true); }
  function hide(...o) { o.forEach(x => x.visible = false); }

  let plasmaOn = false, mainEtch = false, overEtch = false, robotBusy = false;

  const stepFx = [
    () => { // 0: 웨이퍼 로딩
      show(robotWafer); hide(chamberWafer, plasma, byproduct);
      plasmaOn = false; mainEtch = false; overEtch = false; robotBusy = true;
      towerC.userData.setState('warn');
    },
    () => { // 1: 진공 배기
      hide(robotWafer, plasma, byproduct); show(chamberWafer);
      plasmaOn = false; mainEtch = false; overEtch = false; robotBusy = false;
      towerC.userData.setState('warn');
    },
    () => { // 2: 플라즈마 점화
      hide(robotWafer, byproduct); show(chamberWafer, plasma);
      plasmaOn = true; mainEtch = false; overEtch = false;
      towerC.userData.setState('run');
    },
    () => { // 3: 메인 식각 (EPD)
      hide(robotWafer); show(chamberWafer, plasma, byproduct);
      plasmaOn = true; mainEtch = true; overEtch = false;
      towerC.userData.setState('run');
    },
    () => { // 4: 오버에치
      hide(robotWafer); show(chamberWafer, plasma, byproduct);
      plasmaOn = true; mainEtch = false; overEtch = true;
      towerC.userData.setState('run');
    },
    () => { // 5: 언로딩 & 클린
      hide(chamberWafer, plasma, byproduct); show(robotWafer);
      plasmaOn = false; mainEtch = false; overEtch = false; robotBusy = true;
      towerC.userData.setState('warn');
    },
  ];
  stepFx[0]();

  return {
    group,
    setStep(i) { stepFx[Math.min(i, stepFx.length - 1)]?.(); },
    tick(t, dt) {
      chamberWafer.rotation.y += 0.15 * dt;
      rotor.rotation.y += 12 * dt;

      if (plasmaOn) {
        plasma.userData.pulse(t);
        const intensity = mainEtch ? 1.4 : (overEtch ? 0.7 : 1.0);
        plasma.material.opacity = (0.25 + Math.sin(t * 6) * 0.1) * intensity;
        plasma.children[0].material.opacity = (0.18 + Math.sin(t * 6 + 1) * 0.06) * intensity;
      }
      if (mainEtch || overEtch) byproduct.userData.tick(dt * (overEtch ? 0.5 : 1));

      rfBeam.material.opacity = plasmaOn ? 0.55 + Math.sin(t * 10) * 0.25 : 0.05;

      // EPD 그래프: 플라즈마 발광 강도를 스크롤 라인그래프로 표시
      let sample = 0.5;
      if (plasmaOn) {
        sample = mainEtch
          ? 0.5 + Math.sin(t * 3) * 0.08 - Math.min(0.35, (t % 20) * 0.01)
          : (overEtch ? 0.15 + Math.sin(t * 5) * 0.03 : 0.6 + Math.sin(t * 2) * 0.05);
      }
      epdHistory.push(Math.max(0.05, Math.min(0.95, sample)));
      epdHistory.shift();
      epdCtx.fillStyle = '#0b0e14';
      epdCtx.fillRect(0, 0, 256, 128);
      epdCtx.strokeStyle = '#f472b6';
      epdCtx.lineWidth = 2;
      epdCtx.beginPath();
      epdHistory.forEach((v, i) => {
        const x = (i / (epdHistory.length - 1)) * 256;
        const y = 128 - v * 128;
        if (i === 0) epdCtx.moveTo(x, y); else epdCtx.lineTo(x, y);
      });
      epdCtx.stroke();
      epdCtx.strokeStyle = 'rgba(244,114,182,.3)';
      epdCtx.strokeRect(1, 1, 254, 126);
      epdTex.needsUpdate = true;

      if (robotBusy) {
        robot.userData.setPose(Math.sin(t * 0.6) * 0.5 + 0.35, Math.sin(t * 0.8) * 0.4 + 0.3, Math.cos(t * 0.7) * 0.4);
      } else {
        robot.userData.setPose(Math.sin(t * 0.3) * 0.15, Math.sin(t * 0.4) * 0.1, Math.cos(t * 0.35) * 0.1);
      }
    },
  };
}
