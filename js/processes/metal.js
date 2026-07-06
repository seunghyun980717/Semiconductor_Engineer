// 금속 배선 공정 모듈 — PVD 스퍼터 챔버 + Cu 전기도금조(ECP) + 어닐 퍼니스 + CMP 폴리셔
// export 계약: camera, content, build3D(ctx) → { group, setStep(i), tick(t, dt) }
import * as THREE from 'three';
import {
  MAT, pick, shadow, makeWafer, makeChamber, makePedestal, makePlasmaGlow,
  makeBeam, makeLabel, makeSignalTower, makeParticleStream, makeCabinet,
  makeLoadPort, makeRobotArm,
} from '../lib/equip-kit.js';

export const camera = { pos: [10, 7, 13], target: [0.6, 1.3, 0] };

export const content = {
  overview:
    '금속 배선(Metallization)은 웨이퍼 위에 만들어진 수억 개의 트랜지스터와 커패시터를 전기적으로 연결해 실제 회로로 완성하는, 전공정의 마지막 단계입니다. ' +
    '과거 주류였던 알루미늄 배선은 PVD 증착 후 식각으로 패턴을 새겼지만, 구리는 식각 부산물의 기화점이 1,000°C를 넘어 건식 식각이 사실상 불가능합니다. ' +
    '이를 해결하기 위해 절연막에 먼저 트렌치/비아를 파낸 뒤 그 홈에 구리를 채우는 다마신(Damascene) 공정이 표준으로 자리잡았습니다. ' +
    'PVD로 배리어(Ta/TaN)와 구리 시드층을 얇게 증착한 후, 전기도금(ECP)으로 트렌치를 구리로 완전히 채우고, 어닐링으로 결정립을 키운 뒤 CMP로 여분의 구리를 평탄화합니다. ' +
    '비아(층간 연결)와 배선(층내 연결)을 한 번에 형성하는 듀얼 다마신이 현재 구리 배선의 표준 공법입니다. ' +
    '이 공정에서 형성된 저저항 배선의 품질은 소자 성능(RC 지연)과 신뢰성(일렉트로마이그레이션)을 직접 좌우합니다.',
  keyPoints: [
    '구리는 건식 식각이 불가능해 "증착 후 식각" 대신 "먼저 파고 채우는" 다마신(Damascene) 공정으로 패터닝',
    '듀얼 다마신: 비아(via)와 배선(line)을 한 번의 구리 충진 + CMP로 동시 형성해 공정 단계 절감',
    'PVD 배리어/시드 → ECP 전기도금(bottom-up superfill) → 어닐(그레인 성장) → CMP 평탄화 순서',
    '배선 재료는 Al → Cu(현 주류) → Co/Ru(첨단 노드 국소 배선)로 진화, 저저항·EM 저항성 확보가 목적',
    'CMP는 2단계(벌크 제거 + 버프)로 진행하며 디싱(dishing)·이로전(erosion)을 관리하는 것이 핵심',
    '배선 내 전류밀도 증가에 따른 구리 원자 이동(일렉트로마이그레이션)이 신뢰성의 최대 변수',
  ],
  hbmNote:
    'HBM(고대역폭메모리)의 TSV(관통전극) 공정은 다이를 관통하는 비아를 구리로 전기도금 충진하고 CMP로 평탄화하는, 금속 배선 기술이 3D 적층 패키징과 결합된 대표 사례입니다. ' +
    'TSV Cu 충진은 top-down 충전 시 내부에 보이드가 갇히기 쉬워, 억제제·촉진제를 조합한 bottom-up superfill 화학과 도금 후 약 400°C 질소 분위기 어닐이 SK하이닉스 HBM 수율의 핵심 관리 포인트입니다.',
  steps: [
    { name: '배리어/시드 스퍼터링 (PVD)', desc: 'Ar 플라즈마로 Ta/TaN 배리어와 Cu 시드층을 트렌치·비아 표면에 얇게 스퍼터링합니다. 배리어는 구리의 절연막 확산을 막고, 시드층은 후속 도금의 출발면이 됩니다.', camera: { pos: [-6.5, 4.5, 7], target: [-4.2, 1.4, 0] } },
    { name: '구리 전기도금 (ECP)', desc: '웨이퍼를 황산구리 전해액에 담그고 전류를 흘려 트렌치/비아 내부를 구리로 완전히 채웁니다(bottom-up superfill). 도금은 실제 필요량보다 두껍게 오버플레이팅합니다.', camera: { pos: [-2.5, 4, 6], target: [-1, 1.1, 0] } },
    { name: '어닐링 (Anneal)', desc: '약 400°C 질소 분위기에서 열처리해 도금 직후 미세한 구리 결정립을 성장시키고 응력을 이완시킵니다. 그레인이 클수록 일렉트로마이그레이션 저항성이 좋아집니다.', camera: { pos: [0.5, 4, 6], target: [1.8, 1.5, 0] } },
    { name: 'CMP 1차 (Cu 벌크 제거)', desc: '회전 플래튼과 슬러리로 트렌치 위에 남은 과잉 구리를 빠르게 연마 제거합니다. 구리는 연질이라 제거 속도가 빠른 반면 디싱(dishing) 위험이 있습니다.', camera: { pos: [6.5, 4.5, 8], target: [4.6, 1.1, 0] } },
    { name: 'CMP 2차 (배리어 제거·평탄화)', desc: '배리어(Ta/TaN)와 잔여 구리를 선택비가 다른 슬러리로 정밀 연마해 웨이퍼 표면을 원자 단위로 평탄화합니다. 오버폴리싱은 이로전(erosion)을 유발하므로 종말점 검출이 중요합니다.', camera: { pos: [7, 3.5, 6.5], target: [4.6, 1.0, 0] } },
    { name: '두께/저항 계측', desc: '4-point probe로 시트저항을, 프로파일로미터로 디싱/이로전 단차를 측정해 SPC로 관리합니다. 배선 품질은 곧 소자 성능과 신뢰성으로 직결됩니다.', camera: { pos: [8, 5, 9], target: [4.6, 1.3, 0] } },
  ],
  equipment: [
    { name: 'PVD 스퍼터 (Endura)', vendor: 'Applied Materials', role: 'Ar 플라즈마로 타겟 원자를 웨이퍼에 증착. Ta/TaN 배리어와 Cu 시드층을 형성하는 모듈형 플랫폼.', spec: '배리어/시드 두께 수 nm급 초박막' },
    { name: 'Cu 전기도금기 (Sabre 3D)', vendor: 'Lam Research (구 Novellus)', role: '황산구리 전해액에서 전류로 구리 이온을 환원시켜 트렌치·비아를 bottom-up superfill 방식으로 충진.', spec: '억제제/촉진제 첨가제로 보이드 없는 갭필 구현' },
    { name: 'CMP 폴리셔 (Mirra / Reflexion)', vendor: 'Applied Materials', role: '회전 플래튼+슬러리로 과잉 구리·배리어를 화학기계적으로 연마 평탄화. CMP 시장 점유율 60~70%.', spec: '2-step(bulk removal + buff) 레시피' },
    { name: 'CMP 폴리셔 (F-REX 시리즈)', vendor: 'Ebara', role: '금속/절연막 CMP 전용 폴리셔. 국내 다수 팹에서 CMP 시장 점유율 20~30%를 차지.', spec: '슬러리 선택비 정밀 제어' },
    { name: '시트저항/프로파일 계측기', vendor: 'KLA / 4-point probe 계열', role: '배선 두께·시트저항과 CMP 후 디싱/이로전 단차를 인라인 계측해 SPC로 모니터링.', spec: '저항 재현성 서브-%, 단차 측정 nm급' },
  ],
  parameters: [
    { name: '배리어/시드 두께', typical: '수 nm 이하 초박막', monitor: 'XRF, TEM 단면 분석' },
    { name: 'Cu 비저항', typical: '벌크 약 1.7 μΩ·cm (배선 폭 감소 시 사이즈 효과로 유효저항 증가)', monitor: '4-point probe 시트저항' },
    { name: '어닐 온도/분위기', typical: '약 400°C, N₂ 분위기', monitor: '퍼니스 열전대, 웨이퍼 bow 측정' },
    { name: 'CMP WIWNU', typical: '목표 2% 수준 (대구경 웨이퍼 기준)', monitor: '두께 맵, SPC 관리도' },
    { name: 'Dishing/Erosion', typical: '패턴밀도별 관리 스펙 이내', monitor: '프로파일로미터, AFM' },
  ],
  defects: [
    { name: 'Dishing / Erosion', signature: '프로파일 계측에서 넓은 Cu 패드 영역이 오목하게 파이거나(dishing), 고밀도 패턴 영역에서 산화막까지 깎여 단차가 낮아짐(erosion)', cause: 'Cu(연질)와 절연막(경질) 간 제거율 차이, 패턴밀도 불균일에 따른 패드 압력 분산, 오버폴리싱 과다', action: '더미필 패턴 삽입, 2-step CMP 및 슬러리 선택비 최적화, EPD 정밀화로 오버폴리싱 최소화' },
    { name: '스크래치 (Scratch)', signature: '결함 검사에서 랜덤 직선형(슬러리 기인) 또는 패드 회전 방향의 호형(패드 기인) 스크래치', cause: '슬러리 내 과대입자·응집, 패드 컨디셔너 마모 부스러기, 패드 재질 박리', action: 'POU 슬러리 필터 교체 주기 단축, 믹싱 매니폴드 세정, 컨디셔너 정기 교체' },
    { name: '일렉트로마이그레이션 (EM)', signature: 'EM 가속시험에서 저항이 서서히 증가하다 급상승, TTF(수명) 분포가 로그정규로 산포 확대, 특정 net/via에서 조기 실패', cause: '전류밀도 증가로 전자풍이 구리 원자를 밀어 cathode측 via 하부에 slit-void 형성', action: 'EM 설계룰 준수 및 redundant via 적용, 캡핑막(CoWP) 도입, 어닐로 그레인 성장시켜 확산경로 축소' },
    { name: 'Via 불량 (Void/Open)', signature: '전기 테스트에서 via chain 저항 산포 증가·open, X-section에서 via 내부 void·계면 delamination', cause: '배리어/시드 스텝커버리지 불량으로 하부 충전 불완전, CMP 후 계면 오염, 어닐 부족', action: 'ALD 배리어 도입으로 스텝커버리지 개선, 전해도금 화학 최적화, via chain 인라인 모니터링' },
  ],
};

export function build3D(ctx) {
  const group = new THREE.Group();

  const PVD_X = -4.4, ECP_X = -1.0, ANN_X = 1.8, CMP_X = 4.8;

  /* ================= ① PVD 스퍼터 챔버 ================= */
  const pvd = new THREE.Group();
  pvd.position.set(PVD_X, 0, 0);

  const pvdChamber = makeChamber({ r: 0.95, h: 1.3, y: 1.05, color: 0xb9c2d4 });
  pick(pvdChamber, 'PVD 스퍼터 챔버', 'Ar 플라즈마로 타겟 원자를 웨이퍼 위에 물리적으로 증착. Ta/TaN 배리어와 Cu 시드층 형성에 사용됩니다.');
  pvd.add(pvdChamber);

  const targetDisk = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.12, 40), MAT.copper());
  targetDisk.position.set(0, 1.78, 0);
  pick(targetDisk, '구리 스퍼터 타겟', '고순도 금속 원판. 여기서 튕겨나간 원자가 웨이퍼 표면에 응축되어 박막을 형성합니다.');
  pvd.add(shadow(targetDisk));

  const arPlasma = makePlasmaGlow({ r: 0.5, h: 0.55, color: 0x66ccff });
  arPlasma.position.set(0, 1.35, 0);
  pvd.add(arPlasma);

  const pvdPedestal = makePedestal({ r: 0.5, y: 0.65 });
  pvd.add(pvdPedestal);

  const pvdTower = makeSignalTower();
  pvdTower.position.set(-1.2, 0, 0.9);
  pvd.add(pvdTower);
  const pvdLabel = makeLabel('PVD 스퍼터 (배리어/시드)', { color: '#fb923c', size: 0.4 });
  pvdLabel.position.set(0, 2.6, 0);
  pvd.add(pvdLabel);
  group.add(pvd);

  /* ================= ② Cu 전기도금조 (ECP) ================= */
  const ecp = new THREE.Group();
  ecp.position.set(ECP_X, 0, 0);

  const tankWall = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.2, 1.5), MAT.glass(0x8fd3ff, 0.22));
  tankWall.position.set(0, 0.9, 0);
  pick(tankWall, '구리 전기도금조 (ECP Bath)', '황산구리 전해액 수조. 전류를 흘려 구리 이온을 환원시켜 트렌치·비아 내부를 아래에서부터 채웁니다(bottom-up superfill).');
  ecp.add(tankWall);

  const liquid = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.85, 1.35),
    new THREE.MeshStandardMaterial({ color: 0xb8712f, transparent: true, opacity: 0.55, metalness: 0.2, roughness: 0.3 }));
  liquid.position.set(0, 0.62, 0);
  ecp.add(liquid);

  const anode = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, 0.9), MAT.copper());
  anode.position.set(-0.65, 0.95, 0);
  pick(anode, '구리 애노드', '전기도금의 (+) 전극. 전해액 속 구리를 지속적으로 공급하며 웨이퍼(캐소드)로 구리 이온이 이동해 석출됩니다.');
  ecp.add(shadow(anode));

  const holderArm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.9, 0.1), MAT.steel(0x6b7488));
  holderArm.position.set(0.55, 1.55, 0);
  ecp.add(holderArm);

  // 상승하는 기포(전기분해 부산물) 표현 — 커스텀 파티클
  const bubbleCount = 50;
  const bubbleGeo = new THREE.BufferGeometry();
  const bubblePos = new Float32Array(bubbleCount * 3);
  const bubbleSpeed = new Float32Array(bubbleCount);
  for (let i = 0; i < bubbleCount; i++) {
    bubblePos[i * 3] = (Math.random() - 0.5) * 1.3;
    bubblePos[i * 3 + 1] = 0.2 + Math.random() * 0.9;
    bubblePos[i * 3 + 2] = (Math.random() - 0.5) * 1.1;
    bubbleSpeed[i] = 0.15 + Math.random() * 0.25;
  }
  bubbleGeo.setAttribute('position', new THREE.BufferAttribute(bubblePos, 3));
  const bubbles = new THREE.Points(bubbleGeo, new THREE.PointsMaterial({ color: 0xbfe8ff, size: 0.02, transparent: true, opacity: 0.85, toneMapped: false }));
  ecp.add(bubbles);

  const ecpTower = makeSignalTower();
  ecpTower.position.set(1.3, 0, 1.0);
  ecp.add(ecpTower);
  const ecpLabel = makeLabel('Cu 전기도금조 (ECP)', { color: '#fb923c', size: 0.4 });
  ecpLabel.position.set(0, 2.15, 0);
  ecp.add(ecpLabel);
  group.add(ecp);

  /* ================= ③ 어닐 퍼니스 ================= */
  const ann = new THREE.Group();
  ann.position.set(ANN_X, 0, 0);

  const annCabinet = makeCabinet({ w: 1.1, h: 1.6, d: 1.0, color: 0xdfe4ee });
  ann.add(annCabinet);

  const annPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.12, 40), MAT.dark(0x4a3038));
  annPlate.position.set(0, 1.75, 0);
  pick(annPlate, '어닐 퍼니스 (핫플레이트)', '약 400°C 질소 분위기에서 도금 직후 미세했던 구리 결정립을 성장시켜 EM 저항성과 저저항 특성을 확보합니다.');
  ann.add(shadow(annPlate));

  const annGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.02, 40),
    new THREE.MeshBasicMaterial({ color: 0xff6a3a, transparent: true, opacity: 0, toneMapped: false }));
  annGlow.position.set(0, 1.82, 0);
  ann.add(annGlow);

  const annLabel = makeLabel('어닐 (400°C, N₂)', { color: '#fb923c', size: 0.4 });
  annLabel.position.set(0, 2.6, 0);
  ann.add(annLabel);
  group.add(ann);

  /* ================= ④ CMP 폴리셔 ================= */
  const cmp = new THREE.Group();
  cmp.position.set(CMP_X, 0, 0);

  const platenBase = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.15, 0.35, 48), MAT.steel(0x828da3));
  platenBase.position.set(0, 0.6, 0);
  cmp.add(shadow(platenBase));

  const platen = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.08, 48), MAT.plastic(0x394a5a));
  platen.position.set(0, 0.82, 0);
  pick(platen, 'CMP 회전 플래튼 & 연마 패드', '연마 패드가 부착된 회전 원판. 슬러리와 함께 웨이퍼를 눌러 화학·기계적으로 평탄화합니다.');
  cmp.add(shadow(platen));

  const headArm = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.12, 0.16), MAT.steel());
  headArm.position.set(0.1, 1.9, 0);
  cmp.add(headArm);

  const headColumn = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.0, 16), MAT.steel());
  headColumn.position.set(0.7, 1.45, 0);
  cmp.add(headColumn);

  const polishHead = new THREE.Group();
  polishHead.position.set(0.7, 1.0, 0);
  const headDisk = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.14, 40), MAT.steel(0x6b7488));
  pick(headDisk, 'CMP 폴리싱 헤드', '웨이퍼를 진공 흡착해 플래튼에 압력을 가하며 회전시키는 헤드. 압력 프로파일이 디싱/이로전을 좌우합니다.');
  polishHead.add(shadow(headDisk));
  cmp.add(polishHead);

  const slurryNozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.025, 0.22), MAT.dark(0x2a3244));
  slurryNozzle.position.set(-0.55, 1.35, 0.35);
  pick(slurryNozzle, '슬러리 분사 노즐', '연마 입자+화학성분이 섞인 슬러리를 플래튼에 공급. 슬러리 응집/오염은 스크래치 불량의 주요 원인입니다.');
  cmp.add(slurryNozzle);
  const slurryStream = makeParticleStream({ count: 45, area: 0.05, yTop: 1.25, yBottom: 0.88, color: 0xd98a4a, size: 0.02 });
  slurryStream.position.set(-0.55, 0, 0.35);
  cmp.add(slurryStream);

  const probeGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.3, 12), MAT.glow(0x22d3ee, 0));
  probeGlow.position.set(0.7, 1.4, 0);
  cmp.add(probeGlow);

  const cmpTower = makeSignalTower();
  cmpTower.position.set(-1.35, 0, 1.0);
  cmp.add(cmpTower);
  const cmpLabel = makeLabel('CMP 폴리셔', { color: '#fb923c', size: 0.4 });
  cmpLabel.position.set(0, 2.7, 0);
  cmp.add(cmpLabel);
  group.add(cmp);

  /* ================= 로드포트 & 이송 로봇 (좌측) ================= */
  const loadPort = makeLoadPort();
  loadPort.position.set(-7.3, 0, 1.0);
  pick(loadPort, '로드포트 & FOUP', '웨이퍼가 담긴 FOUP이 거치되는 곳. 여기서 웨이퍼가 각 스테이션으로 반송됩니다.');
  group.add(loadPort);

  const robot = makeRobotArm();
  robot.position.set(-6.2, 0, 0);
  pick(robot, '웨이퍼 이송 로봇', 'FOUP과 각 스테이션(PVD/도금/어닐/CMP) 사이를 오가며 웨이퍼를 반송합니다.');
  group.add(robot);

  /* ================= 공용 웨이퍼 (스테이션 간 이동) ================= */
  const wafer = makeWafer(0.5, { tint: '#d98a4a' });
  pick(wafer, '웨이퍼 (다마신 진행 중)', '트렌치·비아가 새겨진 웨이퍼. PVD→도금→어닐→CMP 순서로 각 스테이션을 거치며 배선이 완성됩니다.');
  group.add(wafer);

  // 스테이션별 목표 좌표 (group 로컬 좌표계)
  const POS = {
    pvd: new THREE.Vector3(PVD_X, 1.28, 0),
    ecpAbove: new THREE.Vector3(ECP_X, 1.55, 0),
    ecpIn: new THREE.Vector3(ECP_X, 0.65, 0),
    ann: new THREE.Vector3(ANN_X, 1.88, 0),
    cmp: new THREE.Vector3(CMP_X, 0.93, 0),
    cmpUp: new THREE.Vector3(CMP_X, 1.6, 0),
  };
  const waferTarget = POS.pvd.clone();
  wafer.position.copy(waferTarget);

  /* ================= 단계 연출 ================= */
  function show(...o) { o.forEach(x => x.visible = true); }
  function hide(...o) { o.forEach(x => x.visible = false); }

  let plasmaOn = true, targetSpin = 0.6;
  let platenSpeed = 0, headSpeed = 0, headDown = false;
  let slurryTint = 0xd98a4a;

  const stepFx = [
    () => { // 0: 배리어/시드 스퍼터링
      plasmaOn = true; targetSpin = 1.4;
      annGlow.material.opacity = 0; probeGlow.material.emissiveIntensity = 0;
      platenSpeed = 0; headSpeed = 0; headDown = false;
      hide(slurryStream); hide(bubbles);
      waferTarget.copy(POS.pvd);
    },
    () => { // 1: 구리 전기도금
      plasmaOn = false; targetSpin = 0.2;
      show(bubbles); hide(slurryStream);
      waferTarget.copy(POS.ecpIn);
    },
    () => { // 2: 어닐링
      hide(bubbles); hide(slurryStream);
      annGlow.material.opacity = 0.7;
      waferTarget.copy(POS.ann);
    },
    () => { // 3: CMP 1차 (Cu 벌크 제거)
      annGlow.material.opacity = 0;
      show(slurryStream); slurryTint = 0xd98a4a; slurryStream.material.color.set(slurryTint);
      platenSpeed = 5.5; headSpeed = -3.2; headDown = true;
      waferTarget.copy(POS.cmp);
    },
    () => { // 4: CMP 2차 (배리어 제거·평탄화)
      slurryTint = 0xdfe6ee; slurryStream.material.color.set(slurryTint);
      platenSpeed = 2.6; headSpeed = -1.6; headDown = true;
      waferTarget.copy(POS.cmp);
    },
    () => { // 5: 두께/저항 계측
      hide(slurryStream);
      platenSpeed = 0; headSpeed = 0; headDown = false;
      probeGlow.material.emissiveIntensity = 2.5;
      waferTarget.copy(POS.cmpUp);
    },
  ];
  stepFx[0]();

  return {
    group,
    setStep(i) { stepFx[Math.min(i, stepFx.length - 1)]?.(); },
    tick(t, dt) {
      // PVD
      targetDisk.rotation.y += targetSpin * dt;
      arPlasma.visible = plasmaOn;
      if (plasmaOn) arPlasma.userData.pulse(t);

      // ECP 기포 상승
      const bp = bubbleGeo.attributes.position.array;
      for (let i = 0; i < bubbleCount; i++) {
        bp[i * 3 + 1] += bubbleSpeed[i] * dt;
        if (bp[i * 3 + 1] > 1.05) {
          bp[i * 3 + 1] = 0.2;
          bp[i * 3] = (Math.random() - 0.5) * 1.3;
          bp[i * 3 + 2] = (Math.random() - 0.5) * 1.1;
        }
      }
      bubbleGeo.attributes.position.needsUpdate = true;

      // 어닐 글로우 미세 pulse
      if (annGlow.material.opacity > 0.01) {
        annGlow.material.opacity = 0.55 + Math.sin(t * 4) * 0.15;
      }

      // CMP 회전
      platen.rotation.y += platenSpeed * dt;
      polishHead.rotation.y += headSpeed * dt;
      const targetHeadY = headDown ? 0.95 : 1.15;
      polishHead.position.y += (targetHeadY - polishHead.position.y) * Math.min(1, dt * 4);
      if (slurryStream.visible) slurryStream.userData.tick(dt);

      // 웨이퍼 이동 (스무스 추종) + 자체 회전
      wafer.position.lerp(waferTarget, Math.min(1, dt * 2.2));
      wafer.rotation.y += 0.4 * dt;

      // 이송 로봇 아이들 모션
      robot.userData.setPose(Math.sin(t * 0.4) * 0.8, Math.sin(t * 0.6) * 0.5, Math.cos(t * 0.5) * 0.5);
    },
  };
}
