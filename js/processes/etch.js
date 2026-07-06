// 식각 공정 모듈 — 플라즈마 식각기(RIE/ICP) + RF 제너레이터 + 가스박스 + 진공펌프
// export 계약: camera, content, build3D(ctx) → { group, setStep(i), tick(t,dt) }
import * as THREE from 'three';
import {
  MAT, pick, shadow, makeWafer, makeBareWafer, makeCabinet, makeChamber,
  makeShowerhead, makePipe, makeBeam, makePlasmaGlow, makeLabel,
  makeSignalTower, makeParticleStream, makeLoadPort, makeRobotArm,
  makeOpenChamber, makeESC, makeTurboPump, makeGasBox, makeRFMatch,
  makeScreenPanel, makeHose,
} from '../lib/equip-kit.js';

export const camera = { pos: [9.5, 7.5, 9.5], target: [0.3, 1.3, -0.2] };

export const content = {
  overview:
    '현대 식각 장비는 단일 챔버가 아니라 중앙의 육각형 트랜스퍼 챔버를 중심으로 3~6개의 프로세스 챔버가 방사형으로 결합된 클러스터 툴(Cluster Tool) 형태입니다. ' +
    '트랜스퍼 챔버 내부의 듀얼 블레이드형 로봇이 로드락을 거쳐 들어온 웨이퍼를 각 프로세스 챔버로 나누어 전달하며, 실제 식각 반응은 각 프로세스 챔버 내부(샤워헤드-플라즈마-웨이퍼-정전척 수직 스택)에서 일어납니다. ' +
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
    { name: '웨이퍼 로딩', desc: '대기 로봇이 FOUP에서 웨이퍼를 꺼내 로드락에 넣고, 트랜스퍼 챔버의 듀얼 블레이드 로봇이 이를 받아 프로세스 챔버 내부 정전척(ESC) 위에 정렬해 올려놓습니다.', camera: { pos: [6.5, 5.5, 8.5], target: [2.3, 1.3, 1.6] } },
    { name: '진공 배기', desc: '슬릿밸브를 닫고 터보 분자펌프로 챔버 내부를 수~수백 mTorr 수준까지 배기해 공정 압력을 형성합니다.', camera: { pos: [3.5, 4.5, 7], target: [0.2, 1.2, 2.2] } },
    { name: '플라즈마 점화', desc: 'RF 제너레이터가 매칭 네트워크를 거쳐 소스 파워를 인가해 가스를 이온화, 챔버 내부에 핑크빛 플라즈마가 점화됩니다.', camera: { pos: [4, 4, 6.5], target: [0.2, 1.4, 2.2] } },
    { name: '메인 식각 (EPD 모니터링)', desc: '이온이 수직 가속되어 노출된 막을 식각합니다. EPD가 플라즈마 발광 스펙트럼 변화를 실시간 추적해 종료 시점을 판단합니다.', camera: { pos: [3, 3.6, 5.8], target: [0.2, 1.3, 2.2] } },
    { name: '오버에치', desc: '잔막을 완전히 제거하기 위해 짧게 추가 식각(오버에치)을 진행합니다. 과도하면 하부막 손상, 부족하면 잔막(스컴)이 남습니다.', camera: { pos: [3, 3.6, 5.8], target: [0.2, 1.3, 2.2] } },
    { name: '언로딩 & 챔버 클린', desc: '플라즈마를 끄고 챔버를 퍼지한 뒤 트랜스퍼 로봇이 웨이퍼를 회수해 로드락과 대기 로봇을 거쳐 FOUP으로 되돌립니다. 챔버 벽의 폴리머 잔류물은 파티클 원인이 되어 주기적 클린이 필요합니다.', camera: { pos: [6.5, 5.5, 8.5], target: [2.3, 1.3, 1.6] } },
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

  // 극좌표 헬퍼: deg(0=+x, 90=+z), r → [x,0,z]
  const polar = (deg, r) => {
    const a = deg * Math.PI / 180;
    return [Math.cos(a) * r, 0, Math.sin(a) * r];
  };

  const HEX_R = 1.5;                 // 트랜스퍼 챔버 반경 (지름 1~1.5m급)
  const CH_R = 1.0, CH_H = 1.5, CH_Y = 1.25; // 프로세스 챔버 치수 (기존 단일챔버 스케일 유지)
  const PETAL_R = 2.7;               // 트랜스퍼 챔버 중심 → 프로세스 챔버 중심 거리
  const LL_R = 2.3;                  // 트랜스퍼 챔버 중심 → 로드락 중심 거리

  const openPos = polar(90, PETAL_R);   // 절개 챔버 (정면)
  const ch2Pos = polar(150, PETAL_R);   // 폴리실리콘/도전체 식각 챔버
  const ch3Pos = polar(210, PETAL_R);   // 유전체 식각 챔버
  const llPos = polar(30, LL_R);        // 로드락
  const spokeDeg = 30, ux = Math.cos(spokeDeg * Math.PI / 180), uz = Math.sin(spokeDeg * Math.PI / 180);
  const atmRobotPos = [ux * 3.35, 0, uz * 3.35];
  const efemPos = [ux * 4.35, 0, uz * 4.35];
  const loadportPos = [ux * 5.5, 0, uz * 5.5];
  const gasBoxPos = polar(270, 4.3);
  const rfGenPos = [-1.9, 0, -3.3];
  const rfMatchPos = [openPos[0] + 1.7, 0, openPos[2] - 0.35];

  /* ================= 중앙 육각 트랜스퍼 챔버 + 로봇 ================= */
  const transfer = new THREE.Group();
  const HEX_H = 0.55, HEX_Y = 0.32;
  const hexShell = new THREE.Mesh(
    new THREE.CylinderGeometry(HEX_R, HEX_R, HEX_H, 6, 1, true),
    new THREE.MeshPhysicalMaterial({ color: 0x8a94a8, metalness: 0.7, roughness: 0.35, transmission: 0.15, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
  );
  hexShell.position.y = HEX_Y;
  pick(hexShell, '트랜스퍼 챔버 (Transfer Chamber)', '지름 1~1.5m급 육각형 진공 챔버로 클러스터 툴의 중심입니다. 벽을 반투명하게 절개해 내부의 듀얼 블레이드 이송 로봇이 보이도록 했습니다.');
  transfer.add(shadow(hexShell));
  const hexFloor = new THREE.Mesh(new THREE.CylinderGeometry(HEX_R * 0.97, HEX_R * 0.97, 0.08, 6), MAT.dark(0x232a38));
  hexFloor.position.y = HEX_Y - HEX_H / 2 + 0.04;
  transfer.add(hexFloor);
  const hexRim = new THREE.Mesh(new THREE.CylinderGeometry(HEX_R * 1.04, HEX_R * 1.04, 0.06, 6), MAT.steel(0x6b7488));
  hexRim.position.y = HEX_Y + HEX_H / 2;
  transfer.add(hexRim);

  const transferRobot = makeRobotArm({ reach: 1.75 });
  pick(transferRobot, '트랜스퍼 로봇 (듀얼 블레이드형)', '트랜스퍼 챔버 내부에서 회전하며 로드락과 각 프로세스 챔버 사이에 웨이퍼를 방사형으로 전달하는 다관절 로봇입니다.');
  transfer.add(transferRobot);
  // 듀얼 블레이드 표현: 엔드이펙터에 보조 포크 하나 추가
  const dualFork = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.018, 0.22), MAT.dark(0x39415a));
  dualFork.position.set(0, 0.05, 0);
  transferRobot.userData.endEffector.add(dualFork);
  const transferRobotWafer = makeBareWafer(0.42, 0.025);
  transferRobotWafer.position.y = 0.03;
  transferRobot.userData.endEffector.add(transferRobotWafer);

  group.add(transfer);

  // 허브 ↔ 각 챔버 연결부 (짧은 스테인리스 목)
  function connector(deg, outerR, innerCR, y) {
    const a = deg * Math.PI / 180;
    const p1 = [Math.cos(a) * (HEX_R - 0.05), y, Math.sin(a) * (HEX_R - 0.05)];
    const p2 = [Math.cos(a) * (outerR - innerCR + 0.15), y, Math.sin(a) * (outerR - innerCR + 0.15)];
    return makePipe([p1, p2], { radius: 0.34, color: 0x828da3 });
  }
  group.add(connector(90, PETAL_R, CH_R, CH_Y));
  group.add(connector(150, PETAL_R, CH_R, CH_Y));
  group.add(connector(210, PETAL_R, CH_R, CH_Y));
  group.add(connector(30, LL_R, 0.42, 0.9));

  /* ================= 프로세스 챔버 A: 절개(cutaway) — 내부 스택 공개 ================= */
  const cham = new THREE.Group();
  cham.position.set(openPos[0], 0, openPos[2]);

  const chamber = makeOpenChamber({ r: CH_R, h: CH_H, y: CH_Y, color: 0xb9c2d4, opening: Math.PI * 0.55 });
  pick(chamber, '프로세스 챔버 (절개)', '양극산화 알루미늄 원통형 진공용기(지름 40~60cm급)를 절개해 내부의 샤워헤드-플라즈마-웨이퍼-정전척 수직 스택을 그대로 보여줍니다.');
  cham.add(chamber);

  // 정전척(ESC) + 포커스 링 — 세라믹 상판 + 알루미늄 베이스
  const esc = makeESC({ r: 0.5, y: 0.88 });
  pick(esc, '정전척 (ESC, Electrostatic Chuck)', '흰색~회색 세라믹(알루미나/AlN) 상판 안에 정전 흡착 전극과 히터/냉각채널이 매립된 하부 전극입니다. 웨이퍼를 정전기력으로 고정하고 RF 바이어스를 인가해 이온을 수직 가속시킵니다.');
  pick(esc.userData.focusRing, '포커스 링 (Focus Ring)', '웨이퍼 가장자리를 감싸는 실리콘/석영 소모품 링. 웨이퍼와 거의 같은 높이로 배치해 에지 영역의 플라즈마 균일도를 보정하며, 마모되면 도넛형 빈맵 불량의 원인이 됩니다.');
  cham.add(esc);

  const chamberWafer = makeWafer(0.5, { tint: '#f9a8d4' });
  chamberWafer.position.set(0, esc.userData.topY + 0.02, 0);
  cham.add(chamberWafer);

  const showerhead = makeShowerhead({ r: 0.62, y: 1.78 });
  pick(showerhead, '상부 전극 (샤워헤드)', '실리콘/SiC 또는 양극산화 알루미늄 재질의 원판(지름 30~35cm급)에 미세 가스 분사 홀 수백~수천 개가 뚫려 있어 반응 가스를 균일 분사하는 동시에 상부 전극 역할을 겸합니다.');
  cham.add(showerhead);

  const plasma = makePlasmaGlow({ r: 0.58, h: 0.55, color: 0xf472b6 });
  plasma.position.set(0, 1.32, 0);
  cham.add(plasma);

  const byproduct = makeParticleStream({ count: 70, area: 0.45, yTop: 0.95, yBottom: 0.35, color: 0xffd7ea, size: 0.02 });
  cham.add(byproduct);

  const chamLabel = makeLabel('프로세스 챔버 (절개)', { color: '#f472b6', size: 0.4 });
  chamLabel.position.set(0, 2.75, 0);
  cham.add(chamLabel);

  const towerC = makeSignalTower();
  towerC.position.set(1.35, 2.16, -0.9);
  cham.add(towerC);

  group.add(cham);

  /* ================= RF 매칭 네트워크(챔버 옆) + RF 제너레이터(원격) ================= */
  const rfMatch = makeRFMatch({ w: 0.55 });
  rfMatch.position.set(rfMatchPos[0], 0, rfMatchPos[2]);
  pick(rfMatch, 'RF 매칭 네트워크', '챔버 바로 옆에 붙은 금속 박스로, 가변 커패시터/인덕터로 임피던스를 정합해 RF 발생기의 전력을 플라즈마에 최대로 전달합니다.');
  group.add(rfMatch);

  const rfCab = makeCabinet({ w: 1.2, h: 2.0, d: 1.0, color: 0xdde3ec });
  rfCab.position.set(rfGenPos[0], 0, rfGenPos[2]);
  pick(rfCab, 'RF 제너레이터', '13.56MHz 등 고주파 전력을 발생시켜 매칭 네트워크를 거쳐 상/하부 전극에 인가, 가스를 이온화해 플라즈마를 유지합니다. 매칭 네트워크보다 챔버에서 먼 곳에 배치됩니다.');
  group.add(rfCab);
  const rfLabel = makeLabel('RF 제너레이터', { color: '#58a6ff', size: 0.3 });
  rfLabel.position.set(rfGenPos[0], 2.35, rfGenPos[2]);
  group.add(rfLabel);

  const rfBeam = makeBeam([rfGenPos[0], 1.9, rfGenPos[2]], [rfMatchPos[0], 0.3, rfMatchPos[2]], { color: 0xff6fb0, radius: 0.025, opacity: 0.75 });
  group.add(rfBeam);
  const rfFeed = makePipe([[rfMatchPos[0], 0.3, rfMatchPos[2]], [openPos[0] + 0.55, 0.8, openPos[2] - 0.15]], { radius: 0.04, color: 0xb08a3a });
  group.add(rfFeed);

  /* ================= 터보 분자펌프 (절개 챔버 바로 아래) ================= */
  const turbo = makeTurboPump({ r: 0.3, h: 0.55 });
  turbo.position.set(openPos[0], 0.5, openPos[2]);
  pick(turbo, '터보 분자펌프 (TMP)', '챔버 바로 아래 일직선으로 결합된 금속 원통. 초당 수만 rpm으로 회전하는 다단 터빈 블레이드가 기체 분자를 밀어내 챔버를 수~수백 mTorr급 고진공으로 배기합니다.');
  group.add(turbo);
  const turboRotor = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.05, 24), MAT.dark(0x39415a));
  turboRotor.position.set(openPos[0], 0.78, openPos[2]);
  group.add(turboRotor);

  const vacPipe = makePipe([[openPos[0], 0.78, openPos[2]], [openPos[0], 0.72, openPos[2]]], { radius: 0.06 });
  pick(vacPipe, '배기 연결부', '챔버 바닥 배기구와 터보펌프를 게이트밸브로 직결하는 배관입니다.');
  group.add(vacPipe);
  const roughLine = makeHose([[openPos[0] + 0.05, 0.28, openPos[2]], [openPos[0] + 0.5, 0.16, openPos[2] + 0.6], [openPos[0] + 1.0, 0.12, openPos[2] + 1.0]], { radius: 0.055 });
  pick(roughLine, '러핑(백킹) 배기 호스', '터보펌프 후단의 저진공 가스를 대기압까지 낮춰주는 드라이 러핑펌프로 보내는 주름 배기 호스입니다.');
  group.add(roughLine);

  /* ================= 가스박스 (후면) + 가스 배관 ================= */
  const gasBox = makeGasBox({ w: 1.3, h: 1.7, lines: 4 });
  gasBox.position.set(gasBoxPos[0], 0, gasBoxPos[2]);
  pick(gasBox, '가스박스 (MFC 랙)', 'Cl2·HBr·CF4·C4F8·O2·Ar 등 반응/첨가 가스를 질량유량제어기(MFC)로 정밀 배합해 각 프로세스 챔버로 공급하는 스테인리스 배관+밸브 패널입니다.');
  group.add(gasBox);
  const gasLabel = makeLabel('가스박스', { color: '#a78bfa', size: 0.32 });
  gasLabel.position.set(gasBoxPos[0], 2.15, gasBoxPos[2] + 0.5);
  group.add(gasLabel);

  const gasPipeOpen = makePipe([[gasBoxPos[0], 1.9, gasBoxPos[2] + 0.4], [0, 2.5, 0], [openPos[0], 2.05, openPos[2] - 0.3]], { radius: 0.05 });
  group.add(gasPipeOpen);
  const gasPipe2 = makePipe([[gasBoxPos[0] - 0.3, 1.6, gasBoxPos[2] + 0.4], [ch2Pos[0] - 0.6, 1.9, ch2Pos[2] - 0.6], [ch2Pos[0], 1.85, ch2Pos[2]]], { radius: 0.045 });
  group.add(gasPipe2);
  const gasPipe3 = makePipe([[gasBoxPos[0] + 0.3, 1.6, gasBoxPos[2] + 0.4], [ch3Pos[0] + 0.6, 1.6, ch3Pos[2] - 0.6], [ch3Pos[0], 1.6, ch3Pos[2]]], { radius: 0.045 });
  group.add(gasPipe3);

  /* ================= 프로세스 챔버 B: 도전체(Polysilicon/Gate) 식각 ================= */
  const chamber2 = makeChamber({ r: CH_R, h: CH_H, y: CH_Y, color: 0x6b7280 });
  chamber2.position.set(ch2Pos[0], 0, ch2Pos[2]);
  pick(chamber2, '프로세스 챔버 B (도전체 식각)', 'Lam Kiyo 시리즈처럼 TCP(유도결합) 대칭 챔버로 폴리실리콘/게이트 등 도전체를 식각합니다. 플라즈마 펄싱으로 프로파일을 제어합니다.');
  group.add(chamber2);
  const ch2Label = makeLabel('도전체 식각', { color: '#9ad1ff', size: 0.3 });
  ch2Label.position.set(ch2Pos[0], 2.35, ch2Pos[2]);
  group.add(ch2Label);

  /* ================= 프로세스 챔버 C: 유전체(SiO2/SiN) 식각 ================= */
  const chamber3 = makeChamber({ r: CH_R, h: CH_H, y: CH_Y, color: 0x828da3 });
  chamber3.position.set(ch3Pos[0], 0, ch3Pos[2]);
  pick(chamber3, '프로세스 챔버 C (유전체 식각)', 'Lam Flex / TEL Telius 시리즈처럼 소용량 confined 플라즈마와 RF 펄싱으로 SiO2/SiN 등 유전체 및 HARC(고종횡비 컨택) 식각을 담당합니다.');
  group.add(chamber3);
  const ch3Label = makeLabel('유전체 식각', { color: '#c4b5fd', size: 0.3 });
  ch3Label.position.set(ch3Pos[0], 2.35, ch3Pos[2]);
  group.add(ch3Label);

  /* ================= 로드락 (듀얼) ================= */
  const loadLock = new THREE.Group();
  loadLock.position.set(llPos[0], 0, llPos[2]);
  const llA = makeChamber({ r: 0.42, h: 0.7, y: 0.9, color: 0xc3cad8 });
  llA.position.x = 0.46;
  pick(llA, '로드락 A (Load Lock)', '대기압과 진공을 오가는 관문. 게이트밸브 두 개 사이에 낀 작은 챔버로, 대기 로봇이 넣은 웨이퍼를 빠르게 배기해 트랜스퍼 챔버 진공을 깨지 않고 전달합니다.');
  loadLock.add(llA);
  const llB = makeChamber({ r: 0.42, h: 0.7, y: 0.9, color: 0xc3cad8 });
  llB.position.x = -0.46;
  pick(llB, '로드락 B (Load Lock)', '듀얼 로드락 구성으로 하나는 반입, 하나는 반출을 전담해 웨이퍼 처리량(throughput)을 높입니다.');
  loadLock.add(llB);
  group.add(loadLock);
  const llLabel = makeLabel('로드락', { color: '#6ee7b7', size: 0.3 });
  llLabel.position.set(llPos[0], 2.0, llPos[2]);
  group.add(llLabel);

  /* ================= EFEM 캐비닛 + 대기 로봇 + 로드포트/FOUP ================= */
  const efem = makeCabinet({ w: 1.3, h: 1.9, d: 1.1, color: 0xeef1f6 });
  efem.position.set(efemPos[0], 0, efemPos[2]);
  pick(efem, 'EFEM (Equipment Front End Module)', '로드락 앞쪽, 대기압 상태에서 웨이퍼를 반송하는 모듈입니다. FOUP 로드포트와 대기 로봇을 감싸는 하우징 역할을 합니다.');
  group.add(efem);
  const efemScreen = makeScreenPanel({ w: 0.6, h: 0.4, accent: '#30d158' });
  efemScreen.position.set(efemPos[0], 1.55, efemPos[2] + 0.56);
  group.add(efemScreen);

  const atmRobot = makeRobotArm({ reach: 1.1 });
  atmRobot.position.set(atmRobotPos[0], 0, atmRobotPos[2]);
  pick(atmRobot, '대기 이송 로봇', 'EFEM 내부, 대기압 상태에서 FOUP과 로드락 사이를 오가며 웨이퍼를 반송합니다. 핸드오프 오류는 스크래치성 EDS 불량의 원인이 되기도 합니다.');
  group.add(atmRobot);
  const atmRobotWafer = makeBareWafer(0.42, 0.025);
  atmRobotWafer.position.y = 0.03;
  atmRobot.userData.endEffector.add(atmRobotWafer);

  const loadPort = makeLoadPort();
  loadPort.position.set(loadportPos[0], 0, loadportPos[2]);
  pick(loadPort, '로드포트 & FOUP', '식각 전/후 웨이퍼가 담긴 FOUP이 거치되는 곳. 대기와 진공 사이를 오가는 웨이퍼의 관문입니다.');
  group.add(loadPort);

  /* ================= EPD 모니터 패널 (절개 챔버 옆) ================= */
  const epdCanvas = document.createElement('canvas');
  epdCanvas.width = 256; epdCanvas.height = 128;
  const epdCtx = epdCanvas.getContext('2d');
  const epdTex = new THREE.CanvasTexture(epdCanvas);
  const epdPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(0.9, 0.5),
    new THREE.MeshBasicMaterial({ map: epdTex, toneMapped: false })
  );
  epdPanel.position.set(openPos[0] - 1.15, 1.7, openPos[2] + 0.55);
  epdPanel.rotation.y = 0.6;
  pick(epdPanel, 'EPD (종말점 검출) 모니터', '플라즈마의 광 발광 스펙트럼 강도를 실시간으로 추적해 목표막이 다 제거되는 순간(종말점)을 감지합니다.');
  group.add(epdPanel);
  const epdHistory = new Array(64).fill(0.5);

  /* ================= 단계 연출 ================= */
  function show(...o) { o.forEach(x => x.visible = true); }
  function hide(...o) { o.forEach(x => x.visible = false); }

  let plasmaOn = false, mainEtch = false, overEtch = false, transferBusy = false, atmBusy = false;

  const stepFx = [
    () => { // 0: 웨이퍼 로딩
      show(transferRobotWafer, atmRobotWafer); hide(chamberWafer, plasma, byproduct);
      plasmaOn = false; mainEtch = false; overEtch = false; transferBusy = true; atmBusy = true;
      towerC.userData.setState('warn');
    },
    () => { // 1: 진공 배기
      hide(transferRobotWafer, atmRobotWafer, plasma, byproduct); show(chamberWafer);
      plasmaOn = false; mainEtch = false; overEtch = false; transferBusy = false; atmBusy = false;
      towerC.userData.setState('warn');
    },
    () => { // 2: 플라즈마 점화
      hide(transferRobotWafer, atmRobotWafer, byproduct); show(chamberWafer, plasma);
      plasmaOn = true; mainEtch = false; overEtch = false;
      towerC.userData.setState('run');
    },
    () => { // 3: 메인 식각 (EPD)
      hide(transferRobotWafer, atmRobotWafer); show(chamberWafer, plasma, byproduct);
      plasmaOn = true; mainEtch = true; overEtch = false;
      towerC.userData.setState('run');
    },
    () => { // 4: 오버에치
      hide(transferRobotWafer, atmRobotWafer); show(chamberWafer, plasma, byproduct);
      plasmaOn = true; mainEtch = false; overEtch = true;
      towerC.userData.setState('run');
    },
    () => { // 5: 언로딩 & 클린
      hide(chamberWafer, plasma, byproduct); show(transferRobotWafer, atmRobotWafer);
      plasmaOn = false; mainEtch = false; overEtch = false; transferBusy = true; atmBusy = true;
      towerC.userData.setState('warn');
    },
  ];
  stepFx[0]();

  return {
    group,
    setStep(i) { stepFx[Math.min(i, stepFx.length - 1)]?.(); },
    tick(t, dt) {
      chamberWafer.rotation.y += 0.15 * dt;
      transferRobotWafer.rotation.y += 0.4 * dt;
      turboRotor.rotation.y += 14 * dt;

      if (plasmaOn) {
        plasma.userData.pulse(t);
        const intensity = mainEtch ? 1.4 : (overEtch ? 0.7 : 1.0);
        plasma.material.opacity = (0.25 + Math.sin(t * 6) * 0.1) * intensity;
        plasma.children[0].material.opacity = (0.18 + Math.sin(t * 6 + 1) * 0.06) * intensity;
      }
      if (mainEtch || overEtch) byproduct.userData.tick(dt * (overEtch ? 0.5 : 1));

      rfBeam.material.opacity = plasmaOn ? 0.55 + Math.sin(t * 10) * 0.25 : 0.05;
      rfMatch.userData.led.material.emissiveIntensity = plasmaOn ? 1.6 + Math.sin(t * 8) * 0.8 : 0.3;

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

      if (transferBusy) {
        transferRobot.userData.setPose(Math.sin(t * 0.6) * 0.9 + 0.55, Math.sin(t * 0.8) * 0.4 + 0.3, Math.cos(t * 0.7) * 0.4);
      } else {
        transferRobot.userData.setPose(Math.sin(t * 0.3) * 0.15, Math.sin(t * 0.4) * 0.1, Math.cos(t * 0.35) * 0.1);
      }
      if (atmBusy) {
        atmRobot.userData.setPose(Math.sin(t * 0.7 + 1) * 0.4 + 0.2, Math.sin(t * 0.9) * 0.35 + 0.25, Math.cos(t * 0.8) * 0.35);
      } else {
        atmRobot.userData.setPose(Math.sin(t * 0.25) * 0.12, Math.sin(t * 0.3) * 0.08, Math.cos(t * 0.28) * 0.08);
      }
    },
  };
}
