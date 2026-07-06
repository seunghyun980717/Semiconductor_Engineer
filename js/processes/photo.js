// 포토리소그래피 공정 모듈 — 트랙(코터/디벨로퍼) + EUV 스캐너
// ★ 이 파일은 다른 공정 모듈의 표준 예시입니다. 동일한 export 계약을 따르세요:
//   export const camera = { pos, target }
//   export const content = { overview, keyPoints, hbmNote, steps[], equipment[], parameters[], defects[] }
//   export function build3D(ctx) → { group, setStep(i), tick(t, dt) }
import * as THREE from 'three';
import {
  MAT, pick, shadow, makeWafer, makeBareWafer, makeCabinet,
  makePipe, makeBeam, makeLabel, makeSignalTower,
  makeParticleStream, makeLoadPort, makeRobotArm,
  makeOpenChamber, makeESC, makeScreenPanel, makeHose, makeTurboPump,
} from '../lib/equip-kit.js';

export const camera = { pos: [10, 7, 13], target: [0, 2.0, 0] };

export const content = {
  overview:
    '포토리소그래피는 설계된 회로 패턴을 빛으로 웨이퍼에 전사하는 공정으로, 반도체 미세화의 한계를 결정하는 가장 핵심적인 공정입니다. ' +
    '감광액(PR, Photoresist)을 웨이퍼에 균일하게 도포한 뒤, 노광 장비(스캐너)가 레티클(마스크)의 패턴을 축소 투영하여 PR을 감광시키고, ' +
    '현상액으로 감광된 부분을 선택적으로 제거해 패턴을 완성합니다. DRAM 1a/1b nm급 공정에서는 EUV(극자외선, 13.5nm) 노광이 도입되어 ' +
    '멀티 패터닝 스텝을 줄이고 수율을 개선하고 있습니다.',
  keyPoints: [
    '해상도 R = k1·λ/NA — 파장(λ)이 짧을수록, 개구수(NA)가 클수록 미세 패턴 구현 가능',
    'ArF 이머전(193nm, 물 매질) → EUV(13.5nm)로 진화하며 멀티 패터닝 부담 감소',
    '트랙(코터/디벨로퍼)과 스캐너는 인라인으로 연결되어 웨이퍼가 자동 순환',
    'CD(Critical Dimension)와 Overlay(층간 정렬)가 포토 공정의 2대 관리 지표',
    'PR 도포 → 소프트베이크 → 노광 → PEB → 현상 → 검사 순으로 진행',
  ],
  hbmNote:
    'HBM용 DRAM 코어 다이는 SK하이닉스 1b nm급 공정으로 제작되며 EUV 레이어가 적용됩니다. ' +
    'TSV 공정에서도 비아 위치를 정의하는 포토 스텝이 필수적이며, 두꺼운 PR을 사용하는 점이 전공정 포토와 다릅니다.',
  steps: [
    { name: 'HMDS 처리 & PR 도포', desc: '접착 촉진제(HMDS) 처리 후 웨이퍼를 고속 회전시키며 감광액을 스핀 코팅합니다 (두께 균일도 ±1% 관리).', camera: { pos: [-5.5, 4, 6], target: [-3.5, 1.3, 0] } },
    { name: '소프트 베이크', desc: '핫플레이트(90~110°C)에서 PR 용매를 증발시켜 막을 안정화합니다.', camera: { pos: [-6.2, 4.3, 5.2], target: [-4.5, 1.5, -0.6] } },
    { name: 'EUV 노광', desc: '13.5nm 극자외선이 레티클 패턴을 4:1로 축소 투영합니다. 스테이지가 나노미터 정밀도로 이동하며 다이별 스캔 노광합니다.', camera: { pos: [9, 6.2, 10], target: [3.5, 2.1, 0] } },
    { name: 'PEB (노광 후 베이크)', desc: '화학증폭형 PR의 산 확산 반응을 진행시켜 잠상(latent image)을 형성합니다. 온도 균일도가 CD에 직결됩니다.', camera: { pos: [-6.2, 4.6, 5.2], target: [-4.5, 1.9, -0.6] } },
    { name: '현상 (Develop)', desc: 'TMAH 현상액을 분사해 노광된 PR을 용해·제거하면 회로 패턴이 드러납니다.', camera: { pos: [-4.2, 4, 5], target: [-2.45, 1.4, -0.6] } },
    { name: 'CD/Overlay 계측', desc: 'CD-SEM으로 선폭을, 오버레이 계측기로 층간 정렬 오차를 측정해 Spotfire SPC 차트로 모니터링합니다.', camera: { pos: [2, 7, 11], target: [0, 2.0, 0] } },
  ],
  equipment: [
    { name: 'EUV 스캐너 NXE:3800E', vendor: 'ASML', role: '13.5nm 극자외선으로 레티클 패턴을 웨이퍼에 축소 투영 노광. 주석(Sn) 플라즈마 광원과 반사식 광학계 사용.', spec: 'NA 0.33 / 처리량 ~220 WPH / 대당 약 2억 달러' },
    { name: 'ArF 이머전 스캐너 NXT:2100i', vendor: 'ASML', role: '193nm 레이저 + 물 매질로 NA 1.35 구현. 비-EUV 레이어의 주력 노광기.', spec: 'Overlay ≤1.4nm / 처리량 ~300 WPH' },
    { name: '트랙 (코터/디벨로퍼)', vendor: 'TEL (LITHIUS Pro Z)', role: 'PR 도포·베이크·현상을 일괄 처리하며 스캐너와 인라인 연결. 스핀 코터, 핫플레이트, 현상 유닛으로 구성.', spec: '스캐너와 1:1 매칭 / 코팅 균일도 ±1%' },
    { name: 'CD-SEM', vendor: 'Hitachi High-Tech', role: '전자빔으로 현상 후 패턴 선폭(CD)을 나노미터 단위 측정.', spec: '측정 재현성 <0.5nm' },
    { name: '오버레이 계측기', vendor: 'KLA (Archer)', role: '현재 층과 이전 층의 정렬 오차(overlay)를 측정해 스캐너에 피드백.', spec: '측정 정밀도 <0.1nm' },
  ],
  parameters: [
    { name: 'CD (선폭)', typical: '타깃 ±10% 이내 (예: 16nm ±1.6nm)', monitor: 'CD-SEM, SPC X-bar 관리도' },
    { name: 'Overlay', typical: '≤ 2~3nm (3σ)', monitor: '오버레이 계측기, 벡터맵' },
    { name: 'PR 두께', typical: '수십~수백 nm ±1%', monitor: '엘립소미터, 웨이퍼 내 49포인트' },
    { name: 'Focus / Dose', typical: '포커스 ±30nm / 도즈 ±0.5%', monitor: '스캐너 자체 센서 + FEM 웨이퍼' },
    { name: '베이크 온도', typical: '90~130°C ±0.3°C', monitor: '핫플레이트 열전대, FDC' },
  ],
  defects: [
    { name: 'CD Variation (선폭 산포)', signature: 'CD SPC 차트에서 UCL/LCL 이탈 또는 Western Electric Rule 위반. 웨이퍼 맵상 중심-가장자리 구배.', cause: '도즈/포커스 드리프트, PR 두께 불균일, 베이크 온도 산포', action: '스캐너 도즈 캘리브레이션, 핫플레이트 온도 매핑, 트랙 노즐 점검' },
    { name: 'Overlay 정렬 불량', signature: '오버레이 벡터맵에서 회전/확대 성분 증가, 특정 샷 영역 집중 오차', cause: '웨이퍼 척 오염, 스캐너 스테이지 드리프트, 이전 층 웨이퍼 변형(warpage)', action: '척 세정, 정렬 마크 재측정, APC 보정 모델 업데이트' },
    { name: 'PR 코팅 결함 (스트리에이션/핀홀)', signature: '결함 검사기에서 방사형 줄무늬 패턴, 국부 원형 결함 다발', cause: 'PR 토출량 이상, 노즐 막힘, 스핀 속도 이상, PR 내 기포', action: '노즐 교체·퍼지, PR 필터 교체, 스핀 레시피 점검' },
    { name: 'Hot Spot / 패턴 브리지', signature: '특정 다이 위치에서 반복적 EDS 불량, SEM에서 패턴 붙음 확인', cause: '포커스 국부 이상(웨이퍼 뒷면 파티클), 레티클 결함, OPC 미흡', action: '웨이퍼 배면 세정, 레티클 검사, OPC 모델 보정' },
    { name: 'Scum / 현상 잔사', signature: '현상 후 검사에서 패턴 바닥 잔여물, 후속 식각 불량 유발', cause: '현상액 온도/농도 이상, 노광 부족, PEB 온도 미달', action: '현상 레시피 최적화, 도즈 상향, PEB 온도 재설정' },
  ],
};

export function build3D(ctx) {
  const group = new THREE.Group();

  /* =====================================================================
     트랙 (좌측) — 코터/디벨로퍼 + 3단 핫플레이트 스택 + 중앙 반송 로봇 레일
     ===================================================================== */
  const track = new THREE.Group();
  track.position.set(-3.5, 0, 0);

  const trackBody = makeCabinet({ w: 3.2, h: 2.4, d: 2.2, color: 0xe8edf5, screen: false });
  pick(trackBody, '트랙 (TEL 코터/디벨로퍼)', '옆으로 긴 다중 모듈 타워형 장비(가로 5~10m급). 내부는 프로세스 모듈이 수직으로 층층이 쌓인 스택 구조이며, 스캐너와 인라인으로 연결되어 웨이퍼가 자동 순환합니다.');
  track.add(trackBody);

  const trackScreen = makeScreenPanel({ w: 0.62, h: 0.4 });
  trackScreen.position.set(0, 1.95, 1.11);
  pick(trackScreen, '트랙 상태 모니터', 'CD/Overlay SPC 관리도를 실시간 표시하는 공정 모니터. UCL/LCL 이탈이나 Western Electric Rule 위반 시 경보를 표시합니다.');
  track.add(trackScreen);

  // ---- 코터 컵 (스핀 코팅 유닛, 전면 개방 컷어웨이) ----
  const coaterCup = new THREE.Mesh(
    new THREE.CylinderGeometry(0.72, 0.6, 0.5, 40, 1, true),
    new THREE.MeshStandardMaterial({ color: 0xeef1f6, metalness: 0.15, roughness: 0.55, side: THREE.DoubleSide }));
  coaterCup.position.set(0, 1.3, 1.35);
  pick(coaterCup, '코터 컵 (Coater Cup)', '웨이퍼를 진공척으로 고정하고 수백~수천 rpm으로 회전시키며 중앙에서 PR을 적하하는 원통형 컵. 내벽은 PVDF(불소수지) 유백색 재질로 비산된 PR을 회수합니다. 지름 40~50cm급.');
  track.add(shadow(coaterCup));

  const spinWafer = makeBareWafer(0.55, 0.03);
  spinWafer.position.set(0, 1.35, 1.35);
  track.add(spinWafer);

  const nozzleArm = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.08), MAT.steel());
  nozzleArm.position.set(0.35, 1.85, 1.35);
  track.add(nozzleArm);
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.02, 0.22), MAT.dark(0x2a3244));
  nozzle.position.set(0, 1.74, 1.35);
  pick(nozzle, 'PR 분사 노즐', '감광액을 웨이퍼 중심에 정량 토출합니다. 노즐 막힘·토출량 이상·PR 내 기포는 스트리에이션/핀홀 결함의 주원인.');
  track.add(nozzle);
  const prStream = makeBeam([0, 1.65, 1.35], [0, 1.37, 1.35], { color: 0xffd166, radius: 0.015, opacity: 0.95 });
  track.add(prStream);
  const prFilm = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.012, 48), MAT.glow(0xffd166, 0.5));
  prFilm.position.set(0, 1.372, 1.35);
  track.add(prFilm);

  // ---- 핫플레이트 3단 수직 스택 (칠플레이트-핫플레이트-핫플레이트) ----
  const bakeStack = new THREE.Group();
  bakeStack.position.set(-1.0, 0, -0.55);
  track.add(bakeStack);
  for (const dx of [-0.46, 0.46]) {
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.25, 12), MAT.steel(0x828da3));
    rail.position.set(dx, 1.42, 0);
    bakeStack.add(rail);
  }
  const chillPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.07, 40), MAT.steel(0xd7dbe3));
  chillPlate.position.set(0, 0.95, 0);
  pick(chillPlate, '칠 플레이트 (Chill Plate)', '냉각수 채널이 내장된 알루미늄 원판(상온~23°C 정밀 제어). 베이크 직후 웨이퍼를 급속 냉각시켜 후속 공정 온도 이력을 균일화합니다.');
  bakeStack.add(shadow(chillPlate));

  const hotplateSB = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.07, 40), MAT.dark(0x4a3038));
  hotplateSB.position.set(0, 1.4, 0);
  pick(hotplateSB, '핫플레이트 (소프트베이크)', '90~110°C로 PR 용매를 증발시켜 막을 안정화합니다. 표면은 검정 세라믹/알루마이트 코팅 알루미늄, 지름은 웨이퍼보다 약간 큰 32~35cm급. 온도 균일도 ±0.3°C가 CD 균일도에 직결.');
  bakeStack.add(shadow(hotplateSB));
  const sbWafer = makeBareWafer(0.38, 0.02);
  sbWafer.position.set(0, 1.44, 0);
  bakeStack.add(sbWafer);
  const heatGlowSB = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.02, 40),
    new THREE.MeshBasicMaterial({ color: 0xff6a3a, transparent: true, opacity: 0.0, toneMapped: false }));
  heatGlowSB.position.set(0, 1.47, 0);
  bakeStack.add(heatGlowSB);

  const hotplatePEB = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.07, 40), MAT.dark(0x3a2e40));
  hotplatePEB.position.set(0, 1.85, 0);
  pick(hotplatePEB, '핫플레이트 (PEB 전용)', '노광 후 베이크(Post Exposure Bake) 전용 플레이트. 화학증폭형 PR의 산 확산 반응을 진행시켜 잠상을 형성합니다. 트랙 내 수직 스택 중 상단에 배치되어 노광 직후 웨이퍼를 바로 받습니다.');
  bakeStack.add(shadow(hotplatePEB));
  const pebWafer = makeBareWafer(0.38, 0.02);
  pebWafer.position.set(0, 1.89, 0);
  bakeStack.add(pebWafer);
  const heatGlowPEB = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.02, 40),
    new THREE.MeshBasicMaterial({ color: 0xff6a3a, transparent: true, opacity: 0.0, toneMapped: false }));
  heatGlowPEB.position.set(0, 1.92, 0);
  bakeStack.add(heatGlowPEB);

  // ---- 현상 유닛 ----
  const devCup = coaterCup.clone();
  devCup.material = new THREE.MeshStandardMaterial({ color: 0x2f4a5a, metalness: 0.4, roughness: 0.6, side: THREE.DoubleSide });
  devCup.position.set(1.05, 1.3, -0.55);
  pick(devCup, '현상(Develop) 유닛', 'TMAH 현상액을 분사해 노광된 PR을 용해. 현상액 온도/농도 이상은 Scum(현상 잔사) 결함을 유발합니다. 현상 후 회로 패턴이 드러납니다.');
  track.add(devCup);
  const devSpray = makeParticleStream({ count: 60, area: 0.3, yTop: 1.8, yBottom: 1.35, color: 0x58d6ff, size: 0.02 });
  devSpray.position.set(1.05, 0, -0.55);
  track.add(devSpray);

  // ---- 중앙 반송 로봇 레일 ----
  const rail = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.05, 0.16), MAT.steel(0x7f8ba3));
  rail.position.set(0, 0.03, 0.15);
  pick(rail, '중앙 반송 로봇 레일', '트랙 내부를 세로로 이등분하면 한쪽엔 코터/핫플레이트/디벨로퍼 모듈 스택이 벌집처럼 늘어서 있고, 중앙 복도를 반송 로봇이 앞뒤로 주행(rail 이동)하며 각 모듈 앞에서 정지해 웨이퍼를 주고받습니다.');
  track.add(rail);
  const trackRobot = makeRobotArm({ reach: 0.85 });
  trackRobot.position.set(0, 0, 0.15);
  pick(trackRobot, '중앙 반송 로봇 (Central Transfer Robot)', '두 개의 웨이퍼 엔드이펙터(포크형 블레이드)로 인덱서-코터-핫플레이트-디벨로퍼-노광기 인터페이스 사이를 오가는 다관절 로봇. 몸체는 짙은 회색 도장, 블레이드는 세라믹/스테인리스 은색.');
  track.add(trackRobot);

  const towerT = makeSignalTower();
  towerT.position.set(-1.45, 2.4, 1.0);
  track.add(towerT);
  const trackLabel = makeLabel('트랙 (코터/디벨로퍼)', { color: '#ffd166', size: 0.42 });
  trackLabel.position.set(0, 3.1, 0);
  track.add(trackLabel);
  group.add(track);

  /* =====================================================================
     EUV 스캐너 (우측) — 리서치의 수직 적층 구조로 재구성
     광원모듈 → 일루미네이터(4매 미러) → 레티클 스테이지 → 투영광학계(6매 미러
     경통) → 화강암 베이스 위 듀얼 웨이퍼 스테이지
     ===================================================================== */
  const scanner = new THREE.Group();
  scanner.position.set(3.2, 0, 0);

  const AX = 0.3; // 광축(주축) x위치 — 전 모듈이 이 축을 따라 수직 정렬
  const SLOT_EXPO = AX;        // 노광 위치 (투영광학계 바로 아래)
  const SLOT_META = AX + 1.15; // 계측 위치 (별도 계측 스테이션 아래)

  // ---- 장비 프레임(골조) — 실제로는 흰색 도장 하우징이 전체를 감싸지만
  //      내부 관찰을 위해 골조만 표현 ----
  const frameGroup = new THREE.Group();
  const FX1 = AX - 1.05, FX2 = SLOT_META + 0.55, FZ = 0.85, FYTOP = 4.25;
  for (const fx of [FX1, FX2]) {
    for (const fz of [-FZ, FZ]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, FYTOP - 0.3, 10), MAT.steel(0x8a94a8));
      post.position.set(fx, 0.3 + (FYTOP - 0.3) / 2, fz);
      frameGroup.add(post);
    }
  }
  const topBraceA = new THREE.Mesh(new THREE.BoxGeometry(FX2 - FX1, 0.04, 0.04), MAT.steel(0x8a94a8));
  topBraceA.position.set((FX1 + FX2) / 2, FYTOP, FZ);
  const topBraceB = topBraceA.clone(); topBraceB.position.z = -FZ;
  frameGroup.add(topBraceA, topBraceB);
  pick(frameGroup, '장비 프레임 (하우징 골조)', 'ASML TWINSCAN 계열은 스쿨버스 한 대 크기(길이 10m+, 높이 3m+, 무게 약 180~200톤)의 흰색/아이보리 도장 철판 하우징 안에 광학계 전체가 수직으로 쌓여 있습니다. 내부 관찰을 위해 골조만 표현.');
  scanner.add(frameGroup);

  // ---- 화강암 베이스 + 듀얼 웨이퍼 스테이지 ----
  const graniteBase = new THREE.Mesh(new THREE.BoxGeometry(SLOT_META - AX + 1.9, 0.3, 1.7),
    new THREE.MeshStandardMaterial({ color: 0x16171c, metalness: 0.1, roughness: 0.85 }));
  graniteBase.position.set((SLOT_EXPO + SLOT_META) / 2, 0.15, 0);
  pick(graniteBase, '화강암 정반 (Black Granite Base)', '두 개의 웨이퍼 스테이지가 이 위에서 독립적으로 이동하는 검은 반점무늬 화강암 정반. 장비 최하단부에서 진동을 흡수하는 무진동 지지대 역할을 합니다.');
  scanner.add(shadow(graniteBase));

  function makeStage(x, tag) {
    const st = makeESC({ r: 0.42, y: 0.42 });
    st.children[2].material = new THREE.MeshStandardMaterial({ color: 0x3a4258, metalness: 0.3, roughness: 0.5 }); // 어두운 합금 상판
    st.children[3].visible = false; // 포커스링은 식각 전용 — 리소 스테이지엔 불필요
    st.position.set(x, 0.3, 0);
    st.userData.tag = tag;
    return st;
  }
  const stageExpo = makeStage(SLOT_EXPO, 'expo');
  pick(stageExpo, '웨이퍼 스테이지 (노광측)', '자기부상(magnetic levitation) 리니어모터로 나노미터 정밀도 이동하는 웨이퍼 척. 투영광학계 바로 아래에서 노광이 진행되는 동안, 반대편 스테이지는 계측 위치에서 정렬을 수행합니다(TWINSCAN 듀얼 스테이지).');
  scanner.add(stageExpo);
  const waferExpo = makeWafer(0.4, { tint: '#8877ff' });
  waferExpo.position.set(0, 0.155, 0);
  stageExpo.add(waferExpo);

  const stageMeta = makeStage(SLOT_META, 'meta');
  pick(stageMeta, '웨이퍼 스테이지 (계측측)', '노광 직전 웨이퍼의 정렬 마크와 표면 높이맵(레벨링)을 측정하는 계측 스테이션 아래의 스테이지. 측정이 끝나면 노광 위치로 스왑되어 두 스테이지가 교대로 처리량을 극대화합니다.');
  scanner.add(stageMeta);
  const waferMeta = makeBareWafer(0.4, 0.035);
  waferMeta.position.set(0, 0.155, 0);
  stageMeta.add(waferMeta);

  const metroSensor = new THREE.Group();
  const sensorArm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.1), MAT.steel(0x9aa4b5));
  sensorArm.position.set(0, 1.0, 0);
  const sensorHead = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.14, 16), MAT.dark(0x1a2030));
  sensorHead.position.set(0, 0.72, 0);
  metroSensor.add(sensorArm, sensorHead);
  metroSensor.position.set(SLOT_META, 0, 0);
  pick(metroSensor, '웨이퍼 정렬/높이맵 센서', '계측 스테이션에서 웨이퍼 표면의 높이맵과 정렬 마크 위치를 사전 측정해 스캐너에 포커스/오버레이 보정값을 제공합니다.');
  scanner.add(metroSensor);
  const scanBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.5, 8),
    new THREE.MeshBasicMaterial({ color: 0x58d6ff, transparent: true, opacity: 0.8, toneMapped: false }));
  scanBeam.position.set(SLOT_META, 0.42, 0);
  scanner.add(scanBeam);

  // ---- 투영광학계 (수직 경통, 6매 미러 지그재그 힌트) ----
  const column = makeOpenChamber({ r: 0.5, h: 1.6, y: 1.8, color: 0x9aa8c0, opening: Math.PI * 0.55 });
  column.position.x = AX;
  pick(column, '투영 광학계 경통 (Projection Optics Barrel)', '6매의 비구면 반사 미러(M1~M6)가 하나의 원통형 경통 안에 지그재그로 배치되어 레티클 상을 4:1로 축소 결상합니다. 모듈 높이 약 1.5m, 무게 3.5~12톤, 스테인리스/인바 재질의 은회색 원통 외피.');
  scanner.add(column);

  const mirrorGroup = new THREE.Group();
  const mirrorMat = new THREE.MeshStandardMaterial({ color: 0xd7e6ff, metalness: 0.92, roughness: 0.12 });
  for (let i = 0; i < 6; i++) {
    const my = 1.12 + i * 0.24;
    const mx = AX + (i % 2 === 0 ? 0.16 : -0.16);
    const mirror = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.03, 28), mirrorMat);
    mirror.rotation.z = (i % 2 === 0 ? 1 : -1) * 0.32;
    mirror.position.set(mx, my, 0);
    mirrorGroup.add(mirror);
  }
  pick(mirrorGroup, '다층막 미러 M1~M6', 'ULE(초저열팽창유리) 기판에 Mo/Si 다층막을 코팅한 비구면 미러 6매. 빛이 경통 안에서 여러 번 지그재그로 왕복 반사되며 레티클 패턴을 4:1 축소 결상합니다. 부품 수 3만5천개 이상의 초정밀 광학 모듈.');
  scanner.add(mirrorGroup);

  // ---- 레티클 스테이지 + 레티클 핸들러 ----
  const reticle = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.06, 0.62), MAT.glass(0x99ccff, 0.6));
  reticle.position.set(AX, 2.75, 0);
  pick(reticle, '레티클 (반사형 포토마스크)', '152×152mm 석영판 뒷면에 Mo/Si 다층막과 흡수층 패턴을 새긴 반사형 마스크. 자기부상/공기베어링 스테이지 위에서 수 m/s급 초고속 왕복 스캔 운동을 합니다.');
  scanner.add(reticle);
  const reticleFrame = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.12, 0.8), MAT.dark());
  reticleFrame.position.set(AX, 2.82, 0);
  scanner.add(shadow(reticleFrame));

  const reticleHandler = makeRobotArm({ reach: 0.55 });
  reticleHandler.scale.setScalar(0.55);
  reticleHandler.position.set(AX + 0.95, 2.55, 0.55);
  pick(reticleHandler, '레티클 핸들러 (Reticle Handler)', '레티클 라이브러리(포드)에서 레티클을 꺼내 스테이지에 로딩/언로딩하는 로봇 암. 진공 인터락 도어를 통해 외부 레티클 포드와 연결됩니다.');
  scanner.add(reticleHandler);

  // ---- 일루미네이터 (4매 미러 조명계) ----
  const illuminator = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.55, 0.95), MAT.glass(0xbfe0ff, 0.22));
  illuminator.position.set(AX, 3.175, 0);
  pick(illuminator, '일루미네이터 (Illuminator)', '컬렉터에서 온 EUV 빛을 4매의 미러로 균일화(homogenize)하고 원하는 조사각도(NA)로 성형해 레티클 면에 조사하는 조명광학계. 광원 직후, 레티클 스테이지 바로 위에 위치.');
  scanner.add(illuminator);
  const illumMirrors = new THREE.Group();
  const illumMat = new THREE.MeshStandardMaterial({ color: 0xd0c8ff, metalness: 0.9, roughness: 0.15 });
  for (let i = 0; i < 4; i++) {
    const iy = 2.98 + i * 0.13;
    const ix = AX + (i % 2 === 0 ? 0.1 : -0.1);
    const im = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.025, 20), illumMat);
    im.rotation.z = (i % 2 === 0 ? 1 : -1) * 0.4;
    im.position.set(ix, iy, 0);
    illumMirrors.add(im);
  }
  scanner.add(illumMirrors);

  // ---- 광원 모듈 (Sn 플라즈마 광원 챔버) ----
  const source = makeOpenChamber({ r: 0.42, h: 0.65, y: 3.85, color: 0xb9c2d4, opening: Math.PI * 0.6 });
  source.position.x = AX;
  pick(source, 'EUV 광원 챔버 (Light Source Module)', '주석(Sn) 액적과 CO2 레이저가 만나 13.5nm EUV를 발생시키는 진공 서브챔버. 광원-일루미네이터-레티클-투영광학계-웨이퍼까지 빛이 지나는 전체 경로가 EUV를 흡수하는 공기를 배제한 고진공/저압 환경입니다.');
  scanner.add(source);

  const dropletNozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.12, 12), MAT.steel(0x828da3));
  dropletNozzle.position.set(AX, 4.13, 0);
  pick(dropletNozzle, '주석 액적 발생기 (Droplet Generator)', '지름 20~30μm의 초미세 용융 주석 액적을 초당 5만 개(50kHz) 속도로 분사하는 노즐. 손가락 크기의 작은 금속 부품이지만 낙하 경로 확보를 위한 소형 진공 서브챔버를 필요로 합니다.');
  scanner.add(dropletNozzle);
  const dropletStream = makeParticleStream({ count: 30, area: 0.015, yTop: 4.08, yBottom: 3.85, color: 0xffbb66, size: 0.012 });
  dropletStream.position.set(AX, 0, 0);
  scanner.add(dropletStream);

  const plasmaFocus = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), MAT.glow(0xbb99ff, 3.0));
  plasmaFocus.position.set(AX, 3.82, 0);
  pick(plasmaFocus, '플라즈마 발생 지점', '액적과 레이저가 충돌하는 지점에서 전자온도 30~50eV의 고온 주석 플라즈마가 생성되며 13.5nm EUV가 방출됩니다. 광원 챔버의 1차 초점.');
  scanner.add(plasmaFocus);

  const collectorMirror = new THREE.Mesh(
    new THREE.SphereGeometry(0.36, 28, 18, 0, Math.PI * 2, Math.PI * 0.32, Math.PI * 0.5),
    new THREE.MeshStandardMaterial({ color: 0xaeb4e2, metalness: 0.9, roughness: 0.18, side: THREE.DoubleSide }));
  collectorMirror.position.set(AX, 3.62, -0.05);
  collectorMirror.rotation.x = Math.PI;
  pick(collectorMirror, '컬렉터 미러 (Collector Mirror)', '플라즈마 발생점을 감싸는 타원체 오목 미러(지름 0.6~1m급, Mo/Si 다층막 약 50겹 코팅). 반사광을 모아 중간초점(IF)으로 집속해 일루미네이터로 전달합니다. 수소가스가 표면을 스치며 주석 증기 오염을 제거.');
  scanner.add(collectorMirror);

  const laserCabinet = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 1.5), MAT.paint(0xd6ddea));
  laserCabinet.position.set(AX - 1.15, 3.7, 0.9);
  pick(laserCabinet, 'CO2 레이저 캐비닛 (Pre-pulse + Main pulse)', '장비 옆에 배치된 대형 산업용 레이저 발생기. 예비pulse로 액적을 팬케이크 모양으로 펴고, 본pulse로 플라즈마화하는 2단계 펄스를 초당 5만 회 액적에 조사합니다.');
  scanner.add(shadow(laserCabinet));
  const laserBeam = makeBeam([AX - 1.15, 3.7, 0.55], [AX, 3.82, 0], { color: 0xff5533, radius: 0.018, opacity: 0.9 });
  scanner.add(laserBeam);

  // ---- 진공 시스템 ----
  const turboPump = makeTurboPump({ r: 0.2, h: 0.36 });
  turboPump.position.set(FX2 - 0.15, 0.18, 0);
  pick(turboPump, '진공 배기 터보 분자 펌프', '13.5nm EUV는 공기 중 산소·질소에 강하게 흡수되므로, 광원부터 웨이퍼 스테이지까지 광 경로 전체를 고진공/저압으로 유지해야 합니다. 이를 위한 배기 펌프.');
  scanner.add(shadow(turboPump));
  const vacHose = makeHose([[FX2 - 0.15, 0.36, 0], [FX2 - 0.15, 0.9, 0.3], [AX + 0.5, 1.1, 0.3], [AX + 0.5, 1.0, 0]], { radius: 0.035, color: 0x5c6478 });
  scanner.add(vacHose);

  // ---- 스캐너 제어 스크린 & 상태등 ----
  const scanScreen = makeScreenPanel({ w: 0.6, h: 0.38, accent: '#bb99ff' });
  scanScreen.position.set(FX1 + 0.02, 1.3, 0.6);
  scanScreen.rotation.y = Math.PI * 0.15;
  pick(scanScreen, '스캐너 상태 모니터', '포커스/도즈/스테이지 위치 등 노광 파라미터를 실시간 표시. Focus ±30nm, Dose ±0.5% 범위를 벗어나면 경보를 표시합니다.');
  scanner.add(scanScreen);

  const towerS = makeSignalTower();
  towerS.position.set(FX2 + 0.35, 0, 1.0);
  scanner.add(towerS);
  const scanLabel = makeLabel('EUV 스캐너 (TWINSCAN 구조)', { color: '#bb99ff', size: 0.4 });
  scanLabel.position.set(AX + 0.2, 4.55, 0);
  scanner.add(scanLabel);

  // ---- EUV 빔 경로 (광원 → 일루미네이터 → 레티클 → 경통 → 웨이퍼) ----
  const beamUpper = makeBeam([AX, 3.78, 0], [AX, 2.85, 0], { color: 0xbb99ff, radius: 0.035 });
  const beamLower = makeBeam([AX, 2.7, 0], [AX, 0.78, 0], { color: 0xbb99ff, radius: 0.045 });
  const exposeSpot = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.012, 24), MAT.glow(0xddccff, 3.5));
  exposeSpot.position.set(AX, 0.79, 0);
  scanner.add(beamUpper, beamLower, exposeSpot);

  group.add(scanner);

  /* ================= 연결부 & 주변 ================= */
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 1.0), MAT.paint(0xc0c9d8));
  bridge.position.set(-0.4, 1.25, 0);
  pick(bridge, '인라인 인터페이스', '트랙과 스캐너를 연결하는 웨이퍼 전달 통로. 로봇이 웨이퍼를 주고받습니다.');
  group.add(shadow(bridge));

  const loadPort = makeLoadPort();
  loadPort.position.set(-5.9, 0, 1.2);
  pick(loadPort, '로드포트 & FOUP', '25장 웨이퍼가 담긴 FOUP이 OHT(천장 반송)로 도착해 거치되는 곳.');
  group.add(loadPort);

  const robot = makeRobotArm();
  robot.position.set(-5.0, 0, 0);
  pick(robot, '웨이퍼 이송 로봇', 'FOUP에서 웨이퍼를 꺼내 트랙 각 유닛으로 반송합니다.');
  group.add(robot);

  group.add(makePipe([[-3.5, 2.6, -1.1], [-3.5, 3.4, -1.1], [3.2, 3.4, -1.5], [3.2, 2.95, -1.5]], { radius: 0.06 }));

  /* ================= 단계 연출 ================= */
  const stepFx = [
    () => { // 0: PR 도포
      show(prStream, prFilm); hide(beamUpper, beamLower, exposeSpot, devSpray, laserBeam);
      heatGlowSB.material.opacity = 0; heatGlowPEB.material.opacity = 0; spinFast = true;
    },
    () => { // 1: 소프트베이크
      hide(prStream, beamUpper, beamLower, exposeSpot, devSpray, laserBeam); show(prFilm);
      heatGlowSB.material.opacity = 0.6; heatGlowPEB.material.opacity = 0; spinFast = false;
    },
    () => { // 2: 노광
      show(beamUpper, beamLower, exposeSpot, laserBeam); hide(prStream, devSpray);
      heatGlowSB.material.opacity = 0; heatGlowPEB.material.opacity = 0; spinFast = false; scanning = true;
    },
    () => { // 3: PEB
      hide(beamUpper, beamLower, exposeSpot, prStream, devSpray, laserBeam);
      heatGlowSB.material.opacity = 0; heatGlowPEB.material.opacity = 0.75; scanning = false;
    },
    () => { // 4: 현상
      show(devSpray); hide(beamUpper, beamLower, exposeSpot, prStream, laserBeam);
      heatGlowSB.material.opacity = 0; heatGlowPEB.material.opacity = 0;
    },
    () => { // 5: 계측
      hide(beamUpper, beamLower, exposeSpot, prStream, devSpray, laserBeam);
      heatGlowSB.material.opacity = 0; heatGlowPEB.material.opacity = 0;
    },
  ];
  function show(...o) { o.forEach(x => x.visible = true); }
  function hide(...o) { o.forEach(x => x.visible = false); }

  let spinFast = true, scanning = false;
  stepFx[0]();

  return {
    group,
    setStep(i) { stepFx[Math.min(i, stepFx.length - 1)]?.(); },
    tick(t, dt) {
      spinWafer.rotation.y += (spinFast ? 14 : 0.4) * dt;
      prFilm.rotation.y = spinWafer.rotation.y;
      waferExpo.rotation.y += 0.05 * dt;
      plasmaFocus.material.emissiveIntensity = 2.4 + Math.sin(t * 8) * 0.8;
      if (scanning) stageExpo.position.z = Math.sin(t * 1.2) * 0.22;

      // 듀얼 웨이퍼 스테이지 스왑 애니메이션
      const swap = (Math.sin(t * 0.18) + 1) / 2;
      stageExpo.position.x = THREE.MathUtils.lerp(SLOT_EXPO, SLOT_META, swap);
      stageMeta.position.x = THREE.MathUtils.lerp(SLOT_META, SLOT_EXPO, swap);
      scanBeam.position.x = stageMeta.position.x;
      metroSensor.position.x = stageMeta.position.x;

      devSpray.userData.tick(dt);
      dropletStream.userData.tick(dt);
      robot.userData.setPose(Math.sin(t * 0.5) * 0.9, Math.sin(t * 0.7) * 0.5, Math.cos(t * 0.6) * 0.6);

      // 중앙 반송 로봇 레일 이동
      const railCyc = t * 0.3;
      trackRobot.position.x = Math.sin(railCyc) * 1.3;
      const side = Math.sin(railCyc * 2) > 0 ? 1 : -1;
      trackRobot.userData.setPose(side * (Math.PI / 2), Math.sin(railCyc * 3) * 0.4 + 0.3, Math.cos(railCyc * 3) * 0.3);

      reticleHandler.userData.setPose(Math.sin(t * 0.9) * 0.3, Math.sin(t * 1.1) * 0.3, Math.cos(t * 1.1) * 0.2);
    },
  };
}
