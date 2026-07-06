// 금속 배선 공정 모듈 — PVD 스퍼터 챔버(절개) + Cu 전기도금조(ECP) + 어닐 퍼니스 + CMP 폴리셔(2스테이션+세정)
// export 계약: camera, content, build3D(ctx) → { group, setStep(i), tick(t, dt) }
import * as THREE from 'three';
import {
  MAT, pick, shadow, makeWafer, makePlasmaGlow, makeLabel, makeSignalTower,
  makeParticleStream, makeCabinet, makeLoadPort, makeRobotArm,
  makeOpenChamber, makeESC, makeTurboPump, makeGasBox, makeRFMatch,
  makeScreenPanel, makeHose,
} from '../lib/equip-kit.js';

export const camera = { pos: [11, 7.5, 14], target: [0.6, 1.3, 0.3] };

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
    { name: 'CMP 1차 (Cu 벌크 제거)', desc: '회전 플래튼과 슬러리로 트렌치 위에 남은 과잉 구리를 빠르게 연마 제거합니다. 구리는 연질이라 제거 속도가 빠른 반면 디싱(dishing) 위험이 있습니다.', camera: { pos: [6.5, 4.5, 8], target: [4.6, 1.1, -0.6] } },
    { name: 'CMP 2차 (배리어 제거·평탄화)', desc: '배리어(Ta/TaN)와 잔여 구리를 선택비가 다른 슬러리로 정밀 연마해 웨이퍼 표면을 원자 단위로 평탄화합니다. 오버폴리싱은 이로전(erosion)을 유발하므로 종말점 검출이 중요합니다.', camera: { pos: [7, 3.5, 6.5], target: [4.6, 1.0, 0.9] } },
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

  /* ================= ① PVD 스퍼터 챔버 (절개) ================= */
  const pvd = new THREE.Group();
  pvd.position.set(PVD_X, 0, 0);

  const pvdChamber = makeOpenChamber({ r: 0.95, h: 1.3, y: 1.05, color: 0xb9c2d4, opening: Math.PI * 0.6 });
  pick(pvdChamber, 'PVD 스퍼터 챔버 (절개)', 'Ar 플라즈마로 타겟 원자를 웨이퍼 위에 물리적으로 증착하는 진공 챔버. 전면을 절개해 내부의 타겟-플라즈마-웨이퍼 스택이 드러나 보이도록 했습니다.');
  pvd.add(pvdChamber);

  const targetDisk = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.12, 40), MAT.copper());
  targetDisk.position.set(0, 1.78, 0);
  pick(targetDisk, '구리 스퍼터 타겟', '고순도 금속 원판(구리색). Ar 이온이 충돌해 튕겨나간 원자가 웨이퍼 표면에 응축되어 Ta/TaN 배리어·Cu 시드층 박막을 형성합니다.');
  pvd.add(shadow(targetDisk));

  const arPlasma = makePlasmaGlow({ r: 0.5, h: 0.55, color: 0x66ccff });
  arPlasma.position.set(0, 1.35, 0);
  pick(arPlasma, 'Ar 플라즈마', '아르곤 가스가 이온화된 발광 영역. 이온이 타겟에 충돌해 금속 원자를 튕겨내는 물리적 스퍼터링이 여기서 일어납니다.');
  pvd.add(arPlasma);

  const pvdEsc = makeESC({ r: 0.5, y: 0.62 });
  pick(pvdEsc, '웨이퍼 척 (ESC) + 포커스 링', '세라믹 표면의 정전척이 웨이퍼를 고정합니다. 가장자리 포커스 링(석영/실리콘)은 증착 균일도를 보조합니다.');
  pvd.add(pvdEsc);

  const pvdTurbo = makeTurboPump({ r: 0.26, h: 0.5 });
  pvdTurbo.position.set(0.9, 0.25, 0);
  pick(pvdTurbo, '터보 분자 펌프', '챔버를 고진공(수 mTorr 이하)까지 배기해 스퍼터링에 필요한 평균자유행로를 확보합니다.');
  pvd.add(pvdTurbo);

  const pvdGasBox = makeGasBox({ w: 0.75, h: 1.15, lines: 2 });
  pvdGasBox.position.set(-1.6, 0, -0.55);
  pvdGasBox.rotation.y = Math.PI * 0.15;
  pick(pvdGasBox, 'Ar 가스박스 (MFC)', '고순도 아르곤 가스를 정밀 유량 제어(MFC)로 챔버에 공급합니다.');
  pvd.add(pvdGasBox);

  const pvdRF = makeRFMatch({ w: 0.42 });
  pvdRF.position.set(1.15, 0, -0.8);
  pick(pvdRF, 'RF/DC 매칭 박스', '전원과 챔버 임피던스를 정합시켜 반사파를 최소화하고 플라즈마를 안정적으로 유지합니다.');
  pvd.add(pvdRF);

  const pvdHose = makeHose([[-1.25, 0.95, -0.5], [-0.6, 1.2, -0.2], [-0.05, 1.55, 0]], { radius: 0.045 });
  pvd.add(pvdHose);

  // 스퍼터 입자 스트림(타겟→웨이퍼)
  const sputterStream = makeParticleStream({ count: 90, area: 0.42, yTop: 1.68, yBottom: 0.68, color: 0xd98a4a, size: 0.02 });
  pvd.add(sputterStream);

  const pvdTower = makeSignalTower();
  pvdTower.position.set(-1.2, 0, 1.1);
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
  pick(tankWall, '구리 전기도금조 (ECP Bath)', '황산구리 전해액 수조(유리 벽 안쪽). 전류를 흘려 구리 이온을 환원시켜 트렌치·비아 내부를 아래에서부터 채웁니다(bottom-up superfill).');
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
  pick(holderArm, '웨이퍼 홀더 (캐소드)', '웨이퍼를 전해액 속에 담그는 (-) 전극. 전류가 흐르면 이 위의 웨이퍼 표면(Cu 시드층)에 구리 이온이 환원·석출됩니다.');
  ecp.add(holderArm);

  const circPump = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.3, 0.26), MAT.steel(0x828da3));
  circPump.position.set(1.15, 0.15, -0.9);
  pick(circPump, '전해액 순환 펌프', '슬러리·첨가제(억제제/촉진제) 농도를 균일하게 유지하기 위해 전해액을 지속적으로 여과·순환시킵니다.');
  ecp.add(shadow(circPump));
  const circHose = makeHose([[0.85, 0.55, 0], [1.0, 0.3, -0.5], [1.15, 0.3, -0.9], [0.9, 0.9, -0.9], [0.3, 1.0, -0.4]], { radius: 0.035 });
  ecp.add(circHose);

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
  pick(annCabinet, '어닐 캐비닛 (온도 컨트롤러)', '약 400°C, 질소(N₂) 분위기 열처리 프로파일을 제어하는 캐비닛. 온도/시간 레시피에 따라 구리 결정립 성장 정도가 달라집니다.');
  ann.add(annCabinet);

  const annPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.12, 40), MAT.dark(0x4a3038));
  annPlate.position.set(0, 1.75, 0);
  pick(annPlate, '어닐 퍼니스 (핫플레이트)', '약 400°C 질소 분위기에서 도금 직후 미세했던 구리 결정립을 성장시켜 EM 저항성과 저저항 특성을 확보합니다.');
  ann.add(shadow(annPlate));

  const annGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.02, 40),
    new THREE.MeshBasicMaterial({ color: 0xff6a3a, transparent: true, opacity: 0, toneMapped: false }));
  annGlow.position.set(0, 1.82, 0);
  ann.add(annGlow);

  const annN2Hose = makeHose([[0.55, 1.55, 0.25], [0.9, 1.8, 0.15], [0.55, 1.95, -0.05]], { radius: 0.035, color: 0xdfe4ee });
  ann.add(annN2Hose);

  const annLabel = makeLabel('어닐 (400°C, N₂)', { color: '#fb923c', size: 0.4 });
  annLabel.position.set(0, 2.6, 0);
  ann.add(annLabel);
  group.add(ann);

  /* ================= ④ CMP 폴리셔 (2스테이션: 벌크+버프) + 세정 ================= */
  const cmp = new THREE.Group();
  cmp.position.set(CMP_X, 0, 0);

  const cmpFrame = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 3.0), MAT.paint(0xcfd6e2));
  cmpFrame.position.set(0, 0.22, 0.35);
  cmp.add(shadow(cmpFrame));

  // 공용 CMP 스테이션 팩토리 (플래튼+패드 / 폴리싱헤드+리테이너링 / 슬러리암 / 다이아몬드 컨디셔너)
  function makeCmpStation({ zOff, tag, padColor, slurryColor, headDesc }) {
    const st = new THREE.Group();
    st.position.set(0, 0, zOff);

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.05, 0.3, 48), MAT.steel(0x828da3));
    base.position.y = 0.55;
    st.add(shadow(base));

    const platen = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.82, 0.08, 48), MAT.steel(0xaab3c4));
    platen.position.y = 0.74;
    st.add(shadow(platen));

    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 0.025, 48), MAT.plastic(padColor));
    pad.position.y = 0.055; // platen 로컬 기준 (platen이 곧 pad의 부모)
    pick(pad, tag + ' 회전 플래튼 + 연마 패드', '지름 50~100cm급 은색 스테인리스 플래튼(30~200rpm 회전) 위에 발포 폴리우레탄 연마 패드가 부착됩니다. 패드 표면의 미세 그루브가 슬러리를 분산시킵니다.');
    platen.add(shadow(pad));
    for (let i = 1; i <= 3; i++) {
      const groove = new THREE.Mesh(new THREE.TorusGeometry(0.78 * i / 3.6, 0.006, 6, 48), MAT.dark(0xb9ac8e));
      groove.rotation.x = Math.PI / 2;
      groove.position.y = 0.02;
      pad.add(groove);
    }

    const headColumn = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.9, 16), MAT.steel());
    headColumn.position.set(0, 1.65, 0);
    st.add(shadow(headColumn));

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.15, 0);
    const headDisk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.14, 40), MAT.steel(0x6b7488));
    pick(headDisk, tag + ' 폴리싱 헤드 (Carrier Head)', headDesc);
    headGroup.add(shadow(headDisk));
    const retainer = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.035, 10, 40), MAT.dark(0x22262e));
    retainer.rotation.x = Math.PI / 2;
    retainer.position.y = -0.03;
    headGroup.add(retainer);
    st.add(headGroup);

    // 슬러리 암
    const slurryArm = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.05), MAT.plastic(0xeef2f7));
    slurryArm.position.set(-0.55, 1.02, 0.5);
    slurryArm.rotation.y = Math.PI * 0.22;
    pick(slurryArm, tag + ' 슬러리 암', '실리카/세리아 연마입자가 섞인 유백색 슬러리를 패드 표면에 공급하는 노즐 암. 재질은 불소수지 튜브+금속 지지대입니다.');
    st.add(slurryArm);
    const slurryNozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.022, 0.16), MAT.dark(0x2a3244));
    slurryNozzle.position.set(-0.82, 0.92, 0.68);
    st.add(slurryNozzle);
    const slurryStream = makeParticleStream({ count: 40, area: 0.04, yTop: 0.85, yBottom: 0.79, color: slurryColor, size: 0.018 });
    slurryStream.position.set(-0.82, 0, 0.68);
    st.add(slurryStream);

    // 패드 컨디셔너 (다이아몬드 그릿 디스크, 스윙 암으로 상공을 왕복)
    const condPivot = new THREE.Group();
    condPivot.position.set(0, 0.9, 0);
    const condArmBar = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.04, 0.04), MAT.steel(0x9aa4b5));
    condArmBar.position.set(0.34, 0, 0);
    pick(condArmBar, tag + ' 패드 컨디셔너', '다이아몬드 그릿이 촘촘히 박힌 은회색 디스크가 연마 중 패드 표면을 긁어(scouring) 연마력을 재생시킵니다. 별도 스윙 암으로 패드 위를 왕복합니다.');
    condPivot.add(condArmBar);
    const condDisk = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.035, 28),
      new THREE.MeshStandardMaterial({ color: 0xb8bec9, metalness: 0.5, roughness: 0.6 }));
    condDisk.position.set(0.68, -0.05, 0);
    condPivot.add(shadow(condDisk));
    st.add(condPivot);

    st.userData = { platen, headGroup, condPivot, condDisk, slurryStream, spinSpeed: 0.4, active: false, phase: Math.random() * 10 };
    return st;
  }

  const stationBulk = makeCmpStation({
    zOff: -1.0, tag: 'CMP-1(벌크)', padColor: 0xd7c9a8, slurryColor: 0xd98a4a,
    headDesc: '과잉 구리를 빠르게 제거하는 1차 벌크 연마 헤드. 구리는 연질이라 제거속도가 빠른 반면 디싱(dishing) 위험이 있어 압력존 제어가 중요합니다.',
  });
  const stationBuff = makeCmpStation({
    zOff: 1.0, tag: 'CMP-2(버프)', padColor: 0xc9c2b0, slurryColor: 0xdfe6ee,
    headDesc: '배리어(Ta/TaN)와 잔여 구리를 선택비가 다른 슬러리로 정밀 연마하는 2차 헤드. 오버폴리싱은 이로전(erosion)을 유발하므로 종말점 검출이 중요합니다.',
  });
  cmp.add(stationBulk, stationBuff);

  // 세정 스테이션 (폴리싱 구역 반대편, PVA 브러시 + DIW 린스)
  const cleanGrp = new THREE.Group();
  cleanGrp.position.set(-1.7, 0, 2.2);
  const cleanHousing = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.0, 1.0), MAT.paint(0xf2ede0));
  cleanHousing.position.y = 0.5;
  pick(cleanHousing, '세정 스테이션 (Cleaning Module)', '연마 후 웨이퍼 표면의 슬러리 잔여물을 위아래 PVA 스펀지 브러시+초순수(DIW) 린스+건조로 제거하는 모듈. 폴리싱 구역 반대편에 배치되고, 로봇이 웨이퍼를 이송해옵니다.');
  cleanGrp.add(shadow(cleanHousing));
  const brushTop = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.7, 20), MAT.plastic(0xe8d9a0));
  brushTop.rotation.z = Math.PI / 2;
  brushTop.position.set(0, 0.82, 0);
  cleanGrp.add(shadow(brushTop));
  const brushBot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.7, 20), MAT.plastic(0xe8d9a0));
  brushBot.rotation.z = Math.PI / 2;
  brushBot.position.set(0, 0.55, 0);
  cleanGrp.add(shadow(brushBot));
  const rinseNozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.15, 10), MAT.steel(0x9aa4b5));
  rinseNozzle.position.set(0, 1.1, 0.32);
  cleanGrp.add(rinseNozzle);
  const rinseStream = makeParticleStream({ count: 28, area: 0.03, yTop: 1.0, yBottom: 0.7, color: 0xaad4ff, size: 0.016 });
  rinseStream.position.set(0, 0, 0.32);
  cleanGrp.add(rinseStream);
  cmp.add(cleanGrp);

  // SPC 모니터 스크린 (두께/저항/디싱 관리도)
  const spcStand = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.55, 10), MAT.steel(0x6b7488));
  spcStand.position.set(1.15, 0.78, 2.15);
  cmp.add(shadow(spcStand));
  const spcScreen = makeScreenPanel({ w: 0.6, h: 0.4, accent: '#22d3ee' });
  spcScreen.position.set(1.15, 1.72, 2.15);
  spcScreen.rotation.y = -Math.PI * 0.18;
  pick(spcScreen, 'SPC 모니터 (두께/저항)', '4-point probe 시트저항과 프로파일로미터 디싱/이로전 데이터를 실시간 SPC 관리도로 표시합니다. 배선 품질은 곧 소자 성능·신뢰성으로 직결됩니다.');
  cmp.add(spcScreen);

  const probeGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.3, 12), MAT.glow(0x22d3ee, 0));
  probeGlow.position.set(0, 1.95, 0);
  cmp.add(probeGlow);

  const cmpTower = makeSignalTower();
  cmpTower.position.set(-1.55, 0, -1.3);
  cmp.add(cmpTower);
  const cmpLabel = makeLabel('CMP 폴리셔 (벌크+버프)', { color: '#fb923c', size: 0.4 });
  cmpLabel.position.set(0, 2.75, 0);
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
    pvd: new THREE.Vector3(PVD_X, 1.05, 0),
    ecpAbove: new THREE.Vector3(ECP_X, 1.55, 0),
    ecpIn: new THREE.Vector3(ECP_X, 0.65, 0),
    ann: new THREE.Vector3(ANN_X, 1.88, 0),
    cmpBulk: new THREE.Vector3(CMP_X, 0.95, -1.0),
    cmpBuff: new THREE.Vector3(CMP_X, 0.95, 1.0),
    cmpUp: new THREE.Vector3(CMP_X, 1.75, 0),
  };
  const waferTarget = POS.pvd.clone();
  wafer.position.copy(waferTarget);

  /* ================= 단계 연출 ================= */
  function show(...o) { o.forEach(x => x.visible = true); }
  function hide(...o) { o.forEach(x => x.visible = false); }

  let plasmaOn = true, targetSpin = 0.6;

  const stepFx = [
    () => { // 0: 배리어/시드 스퍼터링
      plasmaOn = true; targetSpin = 1.4;
      show(sputterStream); hide(bubbles);
      annGlow.material.opacity = 0; probeGlow.material.emissiveIntensity = 0;
      stationBulk.userData.active = false; stationBuff.userData.active = false;
      waferTarget.copy(POS.pvd);
    },
    () => { // 1: 구리 전기도금
      plasmaOn = false; targetSpin = 0.2;
      hide(sputterStream); show(bubbles);
      waferTarget.copy(POS.ecpIn);
    },
    () => { // 2: 어닐링
      hide(bubbles);
      annGlow.material.opacity = 0.7;
      waferTarget.copy(POS.ann);
    },
    () => { // 3: CMP 1차 (Cu 벌크 제거)
      annGlow.material.opacity = 0;
      stationBulk.userData.active = true; stationBuff.userData.active = false;
      waferTarget.copy(POS.cmpBulk);
    },
    () => { // 4: CMP 2차 (배리어 제거·평탄화)
      stationBulk.userData.active = false; stationBuff.userData.active = true;
      waferTarget.copy(POS.cmpBuff);
    },
    () => { // 5: 두께/저항 계측
      stationBulk.userData.active = false; stationBuff.userData.active = false;
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
      if (sputterStream.visible) sputterStream.userData.tick(dt);
      pvdRF.userData.led.material.emissiveIntensity = plasmaOn ? 2 : 0.35;

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

      // CMP 두 스테이션 (플래튼 회전 + 헤드 승강/역회전 + 컨디셔너 스윙 + 슬러리)
      [stationBulk, stationBuff].forEach((st) => {
        const u = st.userData;
        const targetSpeed = u.active ? 5.2 : 0.4;
        u.spinSpeed += (targetSpeed - u.spinSpeed) * Math.min(1, dt * 2.5);
        u.platen.rotation.y += u.spinSpeed * dt;
        u.headGroup.rotation.y -= u.spinSpeed * 0.55 * dt;
        const targetHeadY = u.active ? 0.95 : 1.15;
        u.headGroup.position.y += (targetHeadY - u.headGroup.position.y) * Math.min(1, dt * 4);
        u.condPivot.rotation.y = Math.sin(t * 0.8 + u.phase) * 0.85;
        u.condDisk.rotation.y += 9 * dt;
        u.slurryStream.visible = u.active;
        if (u.active) u.slurryStream.userData.tick(dt);
      });
      rinseStream.userData.tick(dt);
      brushTop.rotateY(3.2 * dt);
      brushBot.rotateY(-3.2 * dt);

      // 웨이퍼 이동 (스무스 추종) + 자체 회전
      wafer.position.lerp(waferTarget, Math.min(1, dt * 2.2));
      wafer.rotation.y += 0.4 * dt;

      // 이송 로봇 아이들 모션
      robot.userData.setPose(Math.sin(t * 0.4) * 0.8, Math.sin(t * 0.6) * 0.5, Math.cos(t * 0.5) * 0.5);
    },
  };
}
