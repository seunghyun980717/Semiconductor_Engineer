// 웨이퍼 제조 공정 모듈 — CZ 단결정 성장로 + 와이어 소 + 랩핑/식각 + CMP 폴리셔 + 검사
// export 계약: camera, content, build3D(ctx) → { group, setStep(i), tick(t, dt) }
import * as THREE from 'three';
import {
  MAT, pick, shadow, makeBareWafer, makeOpenChamber, makePedestal, makeBeam,
  makeLabel, makeSignalTower, makeParticleStream, makeRobotArm, makeLoadPort,
  makeGasBox, makeTurboPump, makeHose, makeScreenPanel, makeWaferBoat,
} from '../lib/equip-kit.js';

export const camera = { pos: [11, 6.5, 13], target: [0, 1.6, 0] };

export const content = {
  overview:
    '웨이퍼 제조는 반도체 8대 공정의 가장 앞단으로, 초고순도(11N) 실리콘으로부터 단결정 잉곳을 성장시키고 이를 얇게 절단·연마해 거울면 웨이퍼를 만드는 과정입니다. ' +
    '석영 도가니에 담긴 다결정 실리콘을 실리콘 융점(1,414~1,420°C) 이상으로 완전히 용융시킨 뒤, 씨드(seed) 결정을 담가 서서히 회전·인상(pulling)시키며 초크랄스키(Czochralski, CZ)법으로 단결정 잉곳을 키웁니다. ' +
    '성장된 원통형 잉곳은 다이아몬드 와이어 쏘로 얇게 슬라이싱되고, 랩핑/그라인딩과 습식 식각으로 표면 손상층을 제거한 뒤, 화학기계연마(CMP)로 원자 단위 평탄도의 거울면을 완성합니다. ' +
    '이 단계는 팹 자체가 아니라 SK실트론·신에츠화학·SUMCO 같은 전문 웨이퍼 제조사에서 수행되며, 팹은 완성된 베어 웨이퍼(bare wafer)를 구매해 전공정을 시작합니다. ' +
    '상업용 실리콘의 85% 이상이 CZ법으로 생산되며, 도펀트(B, P 등) 첨가로 저항률과 전도형(n형/p형)을 결정합니다.',
  keyPoints: [
    'CZ법(Czochralski)이 상업용 실리콘 웨이퍼의 85% 이상을 생산하는 표준 결정성장 방식',
    '도가니와 씨드는 서로 반대 방향으로 회전시켜 용융액의 온도·불순물 분포를 균일화',
    '잉곳 직경은 인상속도(pull rate)와 온도구배로 정밀 제어되며 300mm가 현재 주력 규격',
    '슬라이싱 → 랩핑/그라인딩 → 습식 식각 → CMP 폴리싱 순서로 표면 손상을 단계적으로 제거',
    'TTV, 나노토포그래피, COP(Crystal Originated Particle), 표면 파티클이 웨이퍼 품질의 핵심 지표',
    'V/G비(성장속도/온도구배) 정밀 제어로 결함 없는(defect-free) 영역을 확보하는 결함공학이 핵심',
  ],
  hbmNote:
    'DRAM은 로직 대비 완화된 웨이퍼 스펙을 쓰기도 했지만, 1a/1b nm급 초미세 DRAM에서는 CMP 평탄도와 나노토포그래피 요구가 로직 수준에 근접하고 있습니다. ' +
    '특히 HBM용 웨이퍼는 TSV(관통전극) 공정과 극박 웨이퍼 그라인딩·핸들링을 위한 특수 폴리시드 웨이퍼(specialty polished wafer) 수요가 급증하며 최근 공급망 병목으로 지목되고 있습니다.',
  steps: [
    { name: '잉곳 성장·인상 (CZ)', desc: '석영 도가니의 다결정 실리콘을 흑연 히터로 완전히 용융시킨 뒤 씨드를 담가 회전·인상시키며 단결정 잉곳을 키웁니다.', camera: { pos: [-8.5, 4.5, 7], target: [-5.5, 1.8, 0] } },
    { name: '슬라이싱 (와이어 소)', desc: '다이아몬드 와이어가 고속으로 왕복하며 원통형 잉곳을 얇은 개별 웨이퍼로 절단합니다.', camera: { pos: [-4.5, 4, 6], target: [-2.6, 1.3, 0] } },
    { name: '랩핑/그라인딩', desc: '양면 그라인더로 슬라이싱 시 생긴 톱 자국(saw mark)과 표면 손상층을 제거하고 두께 균일도를 확보합니다.', camera: { pos: [-1, 4, 6], target: [0.4, 1.3, 0] } },
    { name: '습식 식각', desc: '산/알칼리 용액에 웨이퍼를 담가 랩핑 시 생긴 미세 손상층(subsurface damage)을 화학적으로 제거합니다.', camera: { pos: [-1, 4, 6], target: [0.4, 1.1, 0] } },
    { name: 'CMP 폴리싱', desc: '회전하는 연마 패드와 슬러리로 웨이퍼 표면을 원자 단위로 평탄화해 거울면을 완성합니다.', camera: { pos: [2.5, 4, 6.5], target: [3.2, 1.3, 0] } },
    { name: '세정/검사', desc: '표면 파티클·두께·저항률을 검사하고 세정한 뒤 FOUP에 담아 팹으로 출하합니다.', camera: { pos: [6.5, 4.5, 7], target: [6.0, 1.4, 0] } },
  ],
  equipment: [
    { name: 'CZ 풀러 (초크랄스키 성장로)', vendor: 'SK실트론 / 신에츠화학(Shin-Etsu)', role: '초고순도 폴리실리콘을 용융시켜 씨드로부터 단결정 잉곳을 회전·인상 성장시킵니다.', spec: '잉곳 직경 300mm / 인상속도 0.3~1.0mm/min' },
    { name: '다이아몬드 와이어 쏘 (Wire Saw)', vendor: 'Meyer Burger / Applied Materials', role: '원통형 잉곳을 다이아몬드 와이어로 동시에 얇게 절단해 개별 웨이퍼를 만듭니다.', spec: '와이어 고속 왕복 / 두께 편차 최소화' },
    { name: '양면 그라인더 (Double-Side Grinder)', vendor: 'Okamoto / DISCO', role: '슬라이싱 직후 톱 자국과 손상층을 제거하고 두께 균일도·에지 라운딩을 수행합니다.', spec: 'TTV 서브 μm 목표' },
    { name: 'CMP 폴리셔 (Single/Double-side Polisher)', vendor: 'Okamoto / Ebara / Applied Materials', role: '화학기계연마로 웨이퍼 표면을 원자 단위까지 평탄화하는 최종 미러 폴리싱 장비입니다.', spec: '표면 거칠기(Ra) 0.1nm 이하' },
    { name: '표면 검사기 (Surfscan/Candela)', vendor: 'KLA', role: '레이저로 웨이퍼 표면을 스캔해 나노미터급 파티클·결함·나노토포그래피를 검출합니다.', spec: '나노미터급 결함 검출 감도' },
  ],
  parameters: [
    { name: '잉곳 성장 온도', typical: '1,414~1,420°C 부근 (구배 ±0.1°C 수준 관리)', monitor: '열전대 + SCADA 온도 로그' },
    { name: '인상 속도 (Pull rate)', typical: '0.3~1.0 mm/min (직경·결함 목표에 따라 상이)', monitor: '풀러 인코더, 직경 센서 피드백' },
    { name: '웨이퍼 두께 / TTV', typical: '300mm 기준 약 775±25 μm, TTV 서브 μm', monitor: '정전용량식 두께 게이지, SFQR 맵' },
    { name: '표면 거칠기 (Ra)', typical: 'CMP 폴리싱 후 0.1nm 이하', monitor: 'AFM, 헤이즈(haze) 측정기' },
    { name: '저항률 (Resistivity)', typical: '도펀트 농도에 따라 수 mΩ·cm ~ 수십 Ω·cm', monitor: '4-point probe' },
  ],
  defects: [
    { name: 'COP (Crystal Originated Particle)', signature: '표면 파티클 검사기(KLA Candela)에서 특정 성장 조건 하 국소 밀도 급증, 웨이퍼 맵상 랜덤 분포', cause: 'V/G비(성장속도/온도구배) 제어 실패로 공공형(vacancy) 미세결함 응집', action: '인상속도·냉각 프로파일 재조정, MCZ(자기장 인가 CZ) 적용 검토' },
    { name: '슬립 전위 (Slip Dislocation)', signature: 'X선 토포그래피/적외선 투과검사에서 선형 결함 라인, 열충격 직후 급증', cause: '급격한 온도 구배, 웨이퍼 보트 지지부의 열응력', action: '냉각 램프 완화, 보트 정렬 및 접촉부 점검' },
    { name: 'TTV/Warp(휨) 초과', signature: '두께 게이지 맵에서 웨이퍼 전체적 휨 또는 국부 두께 편차 확대', cause: '와이어 소 장력 불균일, 랩핑 압력 프로파일 편차', action: '와이어 장력 캘리브레이션, 그라인더 압력 프로파일 재조정' },
    { name: '톱 자국(Saw Mark) / 스크래치', signature: '표면 검사에서 방사형 또는 직선형 스크래치 패턴 반복 관찰', cause: '와이어 마모, 슬러리 오염, 웨이퍼 핸들링 접촉', action: '와이어 교체 주기 단축, 캐리어·트레이 청결 관리' },
    { name: '나노토포그래피 불량', signature: '나노토포그래피 맵에서 국소 굴곡(SFQR) 이탈 구간 발생', cause: 'CMP 패드 압력 불균일, 리테이너링 마모', action: '패드 컨디셔너 정기 교체, 2-step CMP(bulk removal + buff) 최적화' },
  ],
};

export function build3D(ctx) {
  const group = new THREE.Group();

  /* ================= ① CZ 단결정 성장로 (좌측, 세로로 긴 절개 구조) ================= */
  const furnace = new THREE.Group();
  furnace.position.set(-5.5, 0, 0);

  const MELT_Y = 0.85, MECH_Y = 3.3, INGOT_MAX = 2.0;
  const FURN_R = 0.95, FURN_H = 3.05, FURN_Y = 1.62;

  // 절개된 챔버 — 아르곤 분위기 속 내부(도가니·히터·잉곳) 전체 노출
  const chamber = makeOpenChamber({ r: FURN_R, h: FURN_H, y: FURN_Y, color: 0xcfd6e4, opening: Math.PI * 0.6 });
  pick(chamber, 'CZ 성장로 챔버 (절개)', '아르곤 등 불활성 가스로 채운 밀폐 챔버 내부에서 실리콘 단결정을 성장시켜 산소 오염을 막습니다. 세로로 긴 구조로 인상되는 잉곳의 전체 길이를 수용합니다.');
  furnace.add(chamber);

  // 흑연 서셉터 — 도가니를 받쳐 지지하는 컵 형태 (도가니와 함께 회전)
  const crucibleGroup = new THREE.Group();
  const susceptor = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.5, 0.32, 32),
    MAT.dark(0x161a20));
  susceptor.position.y = MELT_Y - 0.44;
  pick(susceptor, '흑연 서셉터 (Graphite Susceptor)', '석영 도가니를 감싸 지지하는 그라파이트(흑연) 지지대입니다. 리서치 공통 모델링 원칙상 그라파이트 부품은 무광 검정으로 표현하며, 도가니와 함께 회전합니다.');
  crucibleGroup.add(shadow(susceptor));

  const crucible = new THREE.Mesh(
    new THREE.CylinderGeometry(0.62, 0.4, 0.55, 32, 1, true),
    MAT.glass(0xfff2d9, 0.4));
  crucible.position.y = MELT_Y - 0.25;
  pick(crucible, '석영 도가니 (Quartz Crucible)', '고순도 다결정 실리콘을 담아 융점(1,414~1,420°C) 이상으로 완전히 용융시키는 용기입니다. 씨드와 반대 방향으로 회전해 용융액의 온도·불순물 분포를 균일화합니다.');
  crucibleGroup.add(crucible);
  const meltDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.05, 32), MAT.glow(0xff8a3c, 3.2));
  meltDisc.position.y = MELT_Y;
  pick(meltDisc, '용융 실리콘 (Melt)', '실리콘 융점 이상으로 가열된 액체 실리콘 표면. 여기에 씨드를 담가 결정을 성장시킵니다.');
  crucibleGroup.add(meltDisc);
  furnace.add(crucibleGroup);

  // 흑연 히터 코일 — 도가니를 감싸는 다단 발열 링(주황 발광), 회전하지 않음
  const heaterCoil = new THREE.Group();
  const heaterRings = [];
  const HEATER_N = 6;
  for (let i = 0; i < HEATER_N; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.06, 12, 32),
      new THREE.MeshStandardMaterial({ color: 0x2a2422, emissive: 0xff3300, emissiveIntensity: 0.3, metalness: 0.3, roughness: 0.7 }));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = MELT_Y - 0.55 + i * 0.18;
    heaterRings.push(ring);
    heaterCoil.add(shadow(ring));
  }
  pick(heaterCoil, '흑연 히터 코일 (Graphite Heater)', '도가니를 감싸는 다단 흑연 발열 코일로 실리콘 융점 이상까지 가열합니다. 온도 구배를 ±0.1°C 수준으로 정밀 관리해야 결함(슬립 전위 등)을 줄일 수 있습니다.');
  furnace.add(heaterCoil);

  // 인상 메커니즘 (풀러 상단 모터 하우징)
  const pullMech = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.4, 0.7), MAT.steel(0x828da3));
  pullMech.position.y = MECH_Y + 0.2;
  pick(pullMech, '인상 메커니즘 (CZ Puller)', '씨드를 정밀 회전·인상시키는 구동부입니다. 인상속도(0.3~1.0mm/min)와 회전으로 잉곳 직경과 결함 밀도를 제어합니다.');
  furnace.add(shadow(pullMech));

  // 인상 케이블 + 시드척 + 씨드 + 잉곳(가변 길이, 반대 방향 회전)
  const ingotGroup = new THREE.Group();
  const cableMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1, 12), MAT.steel(0xc4cbd8));
  pick(cableMesh, '인상 케이블 (Pulling Cable)', '시드척을 매달아 일정 속도로 끌어올리는 케이블입니다. 인상속도(0.3~1.0mm/min)가 잉곳 직경과 V/G비를 결정하는 핵심 변수입니다.');
  ingotGroup.add(cableMesh);
  const seedChuck = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.09, 16), MAT.steel(0x6b7488));
  pick(seedChuck, '시드척 (Seed Chuck)', '씨드 결정을 물어 고정하고 케이블과 함께 회전·인상시키는 척입니다. 도가니와 반대 방향으로 회전해 용융액 대류를 제어합니다.');
  ingotGroup.add(shadow(seedChuck));
  const seedMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.12, 16), MAT.dark(0x39415a));
  pick(seedMesh, '씨드 (Seed Crystal)', '원하는 결정 방향을 가진 종자 결정. 용융액에 담근 뒤 서서히 인상하며 그 결정 구조를 그대로 이어받아 잉곳이 자랍니다.');
  ingotGroup.add(seedMesh);
  const ingotMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1, 32), MAT.silicon());
  pick(ingotMesh, '성장 중인 실리콘 잉곳', '씨드로부터 이어져 자라나는 단결정 실리콘 원기둥. 300mm 웨이퍼용은 직경 약 300mm, 길이 1~2m 이상으로 성장시킵니다.');
  ingotGroup.add(shadow(ingotMesh));
  furnace.add(ingotGroup);

  function updateIngot(len) {
    const l = Math.max(len, 0.02);
    ingotMesh.visible = len > 0.02;
    ingotMesh.scale.y = l;
    ingotMesh.position.y = MELT_Y + l / 2;
    const seedY = MELT_Y + l + 0.06;
    seedMesh.position.y = seedY;
    seedChuck.position.y = seedY + 0.1;
    const cableLen = Math.max(MECH_Y - (seedY + 0.14), 0.05);
    cableMesh.scale.y = cableLen;
    cableMesh.position.y = seedY + 0.14 + cableLen / 2;
  }
  updateIngot(0);

  // 아르곤 가스박스 — 챔버 내부를 불활성 분위기로 유지하는 공급 계통
  const argonBox = makeGasBox({ w: 0.55, h: 1.1, lines: 2 });
  argonBox.scale.setScalar(0.8);
  argonBox.position.set(-1.5, 0, -0.5);
  pick(argonBox, '아르곤 가스박스 (Ar Supply)', '챔버 내부를 아르곤 등 불활성 가스 분위기로 유지해 용융 실리콘의 산소·불순물 오염을 막는 가스 공급 계통입니다.');
  furnace.add(argonBox);

  // 진공 배기 터보펌프 — 성장 전 챔버 퍼지/진공 배기
  const furnacePump = makeTurboPump({ r: 0.26, h: 0.46 });
  furnacePump.rotation.z = Math.PI / 2;
  furnacePump.position.set(1.35, 0.35, -0.3);
  pick(furnacePump, '진공 배기 터보펌프', '성장 시작 전 챔버를 진공 배기하고 아르곤으로 재충전(퍼지)하는 데 쓰이는 터보 분자 펌프입니다.');
  furnace.add(furnacePump);
  furnace.add(makeHose([[FURN_R, 0.35, -0.3], [1.0, 0.35, -0.3], [1.35, 0.35, -0.3]], { radius: 0.05, color: 0x4a5268 }));

  // SCADA 온도 제어 스크린
  const furnaceScreen = makeScreenPanel({ w: 0.6, h: 0.4, accent: '#ff8a3c' });
  furnaceScreen.position.set(-1.5, 2.15, 0.05);
  furnaceScreen.rotation.y = Math.PI * 0.12;
  pick(furnaceScreen, '온도 제어 스크린 (SCADA)', '열전대로 측정한 도가니 온도를 SCADA로 로깅하며 ±0.1°C 수준으로 구배를 관리하는 공정 모니터입니다.');
  furnace.add(furnaceScreen);

  const furnaceTower = makeSignalTower();
  furnaceTower.position.set(1.3, 0, 0.85);
  furnace.add(furnaceTower);

  const furnaceLabel = makeLabel('CZ 단결정 성장로', { color: '#8ab4ff', size: 0.42 });
  furnaceLabel.position.set(0, MECH_Y + 0.55, 0);
  furnace.add(furnaceLabel);
  group.add(furnace);

  /* ================= ② 와이어 소 (슬라이싱) ================= */
  const saw = new THREE.Group();
  saw.position.set(-2.6, 0, 0);

  const sawBed = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.18, 1.3), MAT.steel(0x828da3));
  sawBed.position.y = 0.7;
  pick(sawBed, '와이어 쏘 베드', '잉곳을 고정하고 다이아몬드 와이어로 얇게 절단하는 절삭대입니다. 두께 편차와 톱 자국 최소화가 핵심 관리 항목입니다.');
  saw.add(shadow(sawBed));

  const rollerL = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 1.3, 24), MAT.steel(0x6b7488));
  rollerL.rotation.x = Math.PI / 2;
  rollerL.position.set(-1.05, 1.25, 0);
  const rollerR = rollerL.clone();
  rollerR.position.set(1.05, 1.25, 0);
  saw.add(shadow(rollerL), shadow(rollerR));

  // 다이아몬드 와이어 웹 (평행 와이어 다발)
  const wireWeb = new THREE.Group();
  const wireStrands = [];
  for (let i = 0; i < 10; i++) {
    const z = -0.55 + (i / 9) * 1.1;
    const w = makeBeam([-1.05, 1.25, z], [1.05, 1.25, z], { color: 0xdfe6f0, radius: 0.008, opacity: 0.85 });
    wireStrands.push(w);
    wireWeb.add(w);
  }
  pick(wireWeb, '다이아몬드 와이어 (Diamond Wire)', '수백 가닥의 와이어가 고속으로 왕복하며 잉곳을 동시에 수백 장의 웨이퍼로 절단합니다. 와이어 장력 편차는 두께 산포(TTV)의 주원인입니다.');
  saw.add(wireWeb);

  const ingotOnSaw = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2.1, 32), MAT.silicon());
  ingotOnSaw.rotation.z = Math.PI / 2;
  ingotOnSaw.position.set(0, 2.0, 0);
  pick(ingotOnSaw, '절단 대상 잉곳', '성장로에서 옮겨진 잉곳이 와이어 웹을 통과하며 얇은 웨이퍼들로 잘려나갑니다.');
  saw.add(shadow(ingotOnSaw));

  // 와이어 격자 — 잉곳 둘레를 감싸는 다이아몬드 와이어 그물(와이어 소의 절삭면을 시각화)
  const wireMeshNet = new THREE.Mesh(
    new THREE.CylinderGeometry(0.56, 0.56, 2.05, 28, 10, true),
    new THREE.MeshBasicMaterial({ color: 0xcfe6ff, wireframe: true, transparent: true, opacity: 0.55, toneMapped: false }));
  wireMeshNet.rotation.z = Math.PI / 2;
  wireMeshNet.position.set(0, 2.0, 0);
  pick(wireMeshNet, '와이어 격자 (잉곳을 감는 와이어)', '다이아몬드 와이어가 잉곳 둘레를 그물처럼 감싸며 고속 왕복해 수백 장의 웨이퍼를 동시에 절단합니다. 와이어 장력 편차는 두께 산포(TTV)의 주원인입니다.');
  saw.add(wireMeshNet);

  // 냉각/슬러리 공급 호스
  saw.add(makeHose([[-1.4, 1.9, 0.75], [-0.6, 1.55, 0.65], [0, 1.35, 0.6]], { radius: 0.045, color: 0x39415a }));

  // 석영 웨이퍼 보트 — 슬라이스된 웨이퍼를 담아 다음 공정으로 이송하는 지그
  const sliceBoat = makeWaferBoat({ slots: 9, waferR: 0.42, gap: 0.05 });
  sliceBoat.position.set(1.65, 0.78, 0);
  pick(sliceBoat, '석영 웨이퍼 보트 (Quartz Boat)', '와이어 쏘를 통과해 낱장으로 분리된 웨이퍼를 석영 지그에 세워 담아 다음 공정(랩핑)으로 이송합니다. 이후 랩핑·식각·폴리싱을 거쳐 거울면이 됩니다.');
  saw.add(sliceBoat);
  const sliceWafers = sliceBoat.userData.wafers;
  const SLICE_N = sliceWafers.length;
  sliceWafers.forEach(w => { w.visible = false; });

  const sawLabel = makeLabel('와이어 소 (슬라이싱)', { color: '#8ab4ff', size: 0.38 });
  sawLabel.position.set(0, 3.0, 0);
  saw.add(sawLabel);
  group.add(saw);

  /* ================= ③ 양면 그라인더(회전 플래튼) + 습식 식각 (표면처리) ================= */
  const prep = new THREE.Group();
  prep.position.set(0.4, 0, 0);

  const prepPedestal = makePedestal({ r: 0.5, y: 0.75 });
  prep.add(prepPedestal);

  // 상부 플래튼(휠) — 웨이퍼 위에서 아래로 눌러 회전
  const grindWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.14, 40), MAT.dark(0x39415a));
  grindWheel.position.set(-0.9, 2.05, 0);
  pick(grindWheel, '상부 그라인더 플래튼 (Double-Side Grinder)', '웨이퍼 위쪽에서 회전하며 압력을 가하는 연마 원반입니다. 슬라이싱 직후 표면의 톱 자국과 손상층을 제거하고 두께 균일도·에지 라운딩을 수행합니다.');
  prep.add(shadow(grindWheel));

  // 하부 플래튼 — 웨이퍼를 사이에 두고 반대 방향으로 회전 (양면 동시 연마)
  const grindWheelBottom = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.14, 40), MAT.steel(0x9aa4b5));
  grindWheelBottom.position.set(-0.9, 1.35, 0);
  pick(grindWheelBottom, '하부 그라인더 플래튼', '상부 플래튼과 웨이퍼를 사이에 두고 마주보며 반대 방향으로 회전해, 웨이퍼 양면을 동시에 연마하는 은색 스테인리스 원반입니다.');
  prep.add(shadow(grindWheelBottom));

  const etchTank = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.55, 1.0), MAT.steel(0x6b7488));
  etchTank.position.set(0.9, 0.42, 0);
  pick(etchTank, '습식 식각조 (Wet Etch Bath)', '산/알칼리 용액에 웨이퍼를 담가 랩핑 시 생긴 표면 미세 손상층(subsurface damage)을 화학적으로 제거합니다.');
  prep.add(shadow(etchTank));
  const etchLiquid = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.06, 32),
    new THREE.MeshStandardMaterial({ color: 0x2fd0c0, transparent: true, opacity: 0.65, metalness: 0.1, roughness: 0.2 }));
  etchLiquid.position.set(0.9, 0.66, 0);
  prep.add(etchLiquid);

  const waferPrep = makeBareWafer(0.42, 0.03);
  waferPrep.position.set(-0.9, 1.7, 0);
  pick(waferPrep, '표면처리 중인 웨이퍼', '상·하부 플래튼 사이에 끼워져 그라인딩과 습식 식각을 거치며 표면 손상층이 순차적으로 제거되는 웨이퍼입니다.');
  prep.add(waferPrep);

  const prepLabel = makeLabel('랩핑/그라인딩 · 습식 식각', { color: '#8ab4ff', size: 0.36 });
  prepLabel.position.set(0, 3.0, 0);
  prep.add(prepLabel);
  group.add(prep);

  /* ================= ④ CMP 폴리셔 ================= */
  const polisher = new THREE.Group();
  polisher.position.set(3.2, 0, 0);

  const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.12, 48), MAT.dark(0x33261a));
  pad.position.y = 0.9;
  pick(pad, 'CMP 폴리싱 패드', '회전하는 연마 패드와 슬러리로 웨이퍼 표면을 원자 단위로 평탄화합니다. 최종 표면 거칠기 Ra 0.1nm 이하를 목표로 합니다.');
  polisher.add(shadow(pad));

  const carrierHead = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.22, 32), MAT.steel(0x828da3));
  carrierHead.position.set(0, 1.85, 0);
  pick(carrierHead, '웨이퍼 캐리어 헤드 (Polishing Head)', '웨이퍼를 진공 척으로 고정해 회전시키며 일정 압력으로 연마 패드에 밀착시키는 헤드입니다. 내부에는 웨이퍼 반경별 압력을 독립 제어하는 다중 압력존(멤브레인)이 있습니다.');
  polisher.add(shadow(carrierHead));
  const retainerRing = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.035, 10, 40), MAT.dark(0x1c2028));
  retainerRing.rotation.x = Math.PI / 2;
  retainerRing.position.set(0, -0.1, 0);
  pick(retainerRing, '리테이너 링 (Retainer Ring)', '캐리어 헤드 가장자리를 감싸 웨이퍼가 미끄러져 나가지 않게 잡아주는 고리입니다. 재질은 PPS 등 엔지니어링 플라스틱이나 세라믹, 색상은 짙은 회색~검정입니다.');
  carrierHead.add(retainerRing);
  const waferOnPad = makeBareWafer(0.42, 0.03);
  waferOnPad.position.set(0, 1.72, 0);
  polisher.add(waferOnPad);

  const slurryArm = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.06), MAT.paint(0xe8ecf4));
  slurryArm.position.set(0.7, 1.55, 0);
  pick(slurryArm, '슬러리 암 (Slurry Arm)', '실리카/세리아 입자가 섞인 유백색 연마 슬러리를 패드 표면으로 적하하는 가늘고 긴 노즐 암입니다.');
  polisher.add(slurryArm);
  const slurryNozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.02, 0.3), MAT.dark(0x2a3244));
  slurryNozzle.position.set(0.75, 1.55, 0.4);
  pick(slurryNozzle, '슬러리 노즐', '연마 슬러리를 패드에 공급해 화학적 연마 반응을 돕습니다. 슬러리 선택비가 표면 결함(dishing/scratch)을 좌우합니다.');
  polisher.add(slurryNozzle);
  const slurryStream = makeParticleStream({ count: 40, area: 0.05, yTop: 1.5, yBottom: 1.0, color: 0xbfe8ff, size: 0.02 });
  slurryStream.position.set(0.6, 0, 0.3);
  polisher.add(slurryStream);

  // 패드 컨디셔너 — 다이아몬드 그릿 디스크가 패드 표면을 긁어 연마력을 재생
  const conditionerArm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.03, 0.05), MAT.steel(0x828da3));
  conditionerArm.position.set(-0.6, 1.55, 0.55);
  polisher.add(conditionerArm);
  const conditionerDisk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.03, 24),
    new THREE.MeshStandardMaterial({ color: 0xb9c2d4, metalness: 0.6, roughness: 0.85 }));
  conditionerDisk.position.set(-0.8, 1.48, 0.55);
  pick(conditionerDisk, '패드 컨디셔너 (Pad Conditioner)', '다이아몬드 입자가 박힌 은회색 디스크로, 연마 중 패드 표면을 긁어(scouring) 연마력을 재생시킵니다.');
  polisher.add(conditionerArm, shadow(conditionerDisk));
  polisher.userData.conditionerDisk = conditionerDisk;
  polisher.userData.conditionerArm = conditionerArm;

  const polisherLabel = makeLabel('CMP 폴리셔', { color: '#8ab4ff', size: 0.4 });
  polisherLabel.position.set(0, 2.8, 0);
  polisher.add(polisherLabel);
  group.add(polisher);

  /* ================= ⑤ 검사 / 세정 ================= */
  const inspect = new THREE.Group();
  inspect.position.set(6.0, 0, 0);

  const inspStage = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.15, 40), MAT.steel(0x828da3));
  inspStage.position.y = 0.85;
  pick(inspStage, '표면 검사 스테이지', '폴리싱이 완료된 거울면 웨이퍼를 올려놓고 표면 파티클·두께·저항률을 최종 검사하는 스테이지입니다.');
  inspect.add(shadow(inspStage));

  const inspWafer = makeBareWafer(0.42, 0.03);
  inspWafer.position.set(0, 0.945, 0);
  pick(inspWafer, '검사 대상 웨이퍼', '폴리싱이 완료된 거울면 웨이퍼. TTV, 나노토포그래피, 표면 파티클 카운트를 최종 검사합니다.');
  inspect.add(inspWafer);

  const scannerArm = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 0.06), MAT.steel());
  scannerArm.position.set(0, 1.7, 0);
  inspect.add(scannerArm);
  const scannerHead = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.16), MAT.dark(0x2a3244));
  scannerHead.position.set(0, 1.55, 0);
  pick(scannerHead, '표면 파티클 검사기 (KLA Surfscan/Candela 유사)', '레이저로 웨이퍼 표면을 스캔해 나노미터급 파티클과 결함, 나노토포그래피를 검출합니다.');
  inspect.add(scannerHead);
  const scanBeam = makeBeam([0, 1.47, 0], [0, 0.95, 0], { color: 0xff5a2a, radius: 0.012, opacity: 0.9 });
  inspect.add(scanBeam);

  const towerI = makeSignalTower();
  towerI.position.set(0.95, 0, 0.7);
  inspect.add(towerI);

  const inspectScreen = makeScreenPanel({ w: 0.6, h: 0.4, accent: '#30d158' });
  inspectScreen.position.set(-0.95, 1.75, 0.15);
  inspectScreen.rotation.y = -Math.PI * 0.15;
  pick(inspectScreen, '검사 결과 스크린', '표면 파티클 카운트·TTV·저항률 검사 결과를 실시간으로 표시하는 공정 모니터입니다.');
  inspect.add(inspectScreen);

  const inspectLabel = makeLabel('세정/검사', { color: '#8ab4ff', size: 0.4 });
  inspectLabel.position.set(0, 2.6, 0);
  inspect.add(inspectLabel);
  group.add(inspect);

  // 출하용 로드포트 + 이송 로봇
  const loadPort = makeLoadPort();
  loadPort.position.set(8.0, 0, 0.9);
  pick(loadPort, '출하 로드포트 & FOUP', '완성된 베어 웨이퍼가 FOUP에 담겨 팹으로 출하 대기하는 곳입니다.');
  group.add(loadPort);

  const robot = makeRobotArm();
  robot.position.set(4.8, 0, -1.3);
  pick(robot, '웨이퍼 이송 로봇', '폴리싱, 검사, 출하 스테이션 사이로 웨이퍼를 반송합니다.');
  group.add(robot);

  /* ================= 단계별 상태 변수 ================= */
  let ingotLen = 0;
  let growing = false;
  let sawing = false;
  let grindingActive = false;
  let etchingActive = false;
  let polishingActive = false;
  let inspectingActive = false;
  let heaterTarget = 0.3;
  let sliceRevealCount = 0;
  let sliceRevealTimer = 0;
  const SAW_TOP_Y = 2.0, SAW_BED_Y = 1.35;

  function resetSlices(showAll) {
    sliceRevealCount = showAll ? SLICE_N : 0;
    sliceRevealTimer = 0;
    sliceWafers.forEach((w, i) => { w.visible = i < sliceRevealCount; });
  }

  const stepFx = [
    () => { // 0: 잉곳 성장·인상
      growing = true; sawing = false; grindingActive = false; etchingActive = false;
      polishingActive = false; inspectingActive = false; heaterTarget = 1.0;
      ingotOnSaw.visible = false;
      resetSlices(false);
    },
    () => { // 1: 슬라이싱 (와이어 소)
      growing = false; sawing = true; grindingActive = false; etchingActive = false;
      polishingActive = false; inspectingActive = false; heaterTarget = 0.3;
      ingotOnSaw.visible = true;
      ingotOnSaw.position.y = SAW_TOP_Y;
      resetSlices(false);
    },
    () => { // 2: 랩핑/그라인딩
      sawing = false; grindingActive = true; etchingActive = false; polishingActive = false; inspectingActive = false;
      ingotOnSaw.visible = false;
      resetSlices(true);
      waferPrep.visible = true;
      waferPrep.userData.target = new THREE.Vector3(-0.9, 1.7, 0);
    },
    () => { // 3: 습식 식각
      grindingActive = false; etchingActive = true; polishingActive = false; inspectingActive = false;
      waferPrep.userData.target = new THREE.Vector3(0.9, 0.66, 0);
    },
    () => { // 4: CMP 폴리싱
      etchingActive = false; polishingActive = true; inspectingActive = false;
      waferOnPad.visible = true;
    },
    () => { // 5: 세정/검사
      polishingActive = false; inspectingActive = true;
    },
  ];
  waferPrep.userData.target = new THREE.Vector3(-0.9, 1.7, 0);
  stepFx[0]();

  return {
    group,
    setStep(i) { stepFx[Math.min(i, stepFx.length - 1)]?.(); },
    tick(t, dt) {
      // 도가니/잉곳 반대 방향 회전
      crucibleGroup.rotation.y -= 0.3 * dt;
      ingotGroup.rotation.y += 0.5 * dt;

      // 잉곳 성장 (인상)
      if (growing) {
        ingotLen = Math.min(ingotLen + 0.22 * dt, INGOT_MAX);
      }
      updateIngot(ingotLen);

      // 히터 코일 발광 lerp (다단 링 전체)
      const cur = heaterRings[0].material.emissiveIntensity;
      const next = cur + (heaterTarget - cur) * Math.min(1, dt * 2);
      heaterRings.forEach(r => { r.material.emissiveIntensity = next; });
      meltDisc.material.emissiveIntensity = 2.4 + next * 1.2 + Math.sin(t * 5) * 0.3;
      furnaceTower.userData.setState(growing ? 'run' : 'warn');

      // 와이어 소 진행
      wireStrands.forEach((w, i) => { w.material.opacity = sawing ? 0.55 + 0.35 * Math.sin(t * 40 + i) : 0.85; });
      wireMeshNet.visible = ingotOnSaw.visible;
      wireMeshNet.material.opacity = sawing ? 0.4 + 0.25 * Math.sin(t * 30) : 0.55;
      if (sawing) {
        ingotOnSaw.position.y = Math.max(ingotOnSaw.position.y - 0.15 * dt, SAW_BED_Y);
        wireMeshNet.position.y = ingotOnSaw.position.y;
        sliceRevealTimer += dt;
        if (sliceRevealTimer > 0.45 && sliceRevealCount < SLICE_N) {
          sliceRevealTimer = 0;
          sliceWafers[sliceRevealCount].visible = true;
          sliceRevealCount++;
        }
      }

      // 양면 그라인더 — 상/하 플래튼 반대 방향 회전
      grindWheel.rotation.y += (grindingActive ? 10 : 1.2) * dt;
      grindWheelBottom.rotation.y -= (grindingActive ? 8 : 1.0) * dt;

      // 식각조 액면 wobble
      etchLiquid.position.y = 0.66 + (etchingActive ? Math.sin(t * 3) * 0.01 : 0);
      etchLiquid.material.opacity = etchingActive ? 0.75 + Math.sin(t * 4) * 0.1 : 0.5;

      // 표면처리 웨이퍼 이동
      if (waferPrep.userData.target) waferPrep.position.lerp(waferPrep.userData.target, Math.min(1, dt * 2));
      waferPrep.rotation.y += 1.5 * dt;

      // CMP 폴리셔
      pad.rotation.y += (polishingActive ? 4 : 0.6) * dt;
      carrierHead.rotation.y -= (polishingActive ? 3 : 0.4) * dt;
      const targetHeadY = polishingActive ? 1.7 : 1.85;
      carrierHead.position.y += (targetHeadY - carrierHead.position.y) * Math.min(1, dt * 2);
      waferOnPad.position.y = carrierHead.position.y - 0.13;
      waferOnPad.rotation.y += 2 * dt;
      slurryStream.visible = polishingActive;
      if (polishingActive) slurryStream.userData.tick(dt);
      slurryArm.position.z = Math.sin(t * 0.8) * 0.3;
      slurryNozzle.position.z = 0.4 + Math.sin(t * 0.8) * 0.15;
      const condSwing = Math.sin(t * 1.2) * 0.25;
      polisher.userData.conditionerArm.rotation.y = condSwing * 0.4;
      polisher.userData.conditionerDisk.position.x = -0.8 - condSwing * 0.2;
      polisher.userData.conditionerDisk.rotation.y += (polishingActive ? 6 : 0.8) * dt;

      // 검사 스캐너 스윕
      inspWafer.rotation.y += 0.4 * dt;
      if (inspectingActive) {
        scannerHead.position.x = Math.sin(t * 1.5) * 0.35;
        scannerArm.position.x = scannerHead.position.x;
        scanBeam.position.x = scannerHead.position.x;
        scanBeam.visible = true;
      } else {
        scanBeam.visible = false;
      }
      towerI.userData.setState(inspectingActive ? 'run' : 'warn');

      // 이송 로봇 앰비언트 모션
      robot.userData.setPose(Math.sin(t * 0.4) * 0.8, Math.sin(t * 0.6) * 0.5, Math.cos(t * 0.5) * 0.6);
    },
  };
}
