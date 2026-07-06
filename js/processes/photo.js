// 포토리소그래피 공정 모듈 — 트랙(코터/디벨로퍼) + EUV 스캐너
// ★ 이 파일은 다른 공정 모듈의 표준 예시입니다. 동일한 export 계약을 따르세요:
//   export const camera = { pos, target }
//   export const content = { overview, keyPoints, hbmNote, steps[], equipment[], parameters[], defects[] }
//   export function build3D(ctx) → { group, setStep(i), tick(t, dt) }
import * as THREE from 'three';
import {
  MAT, pick, shadow, makeWafer, makeBareWafer, makeCabinet, makeChamber,
  makePedestal, makePipe, makeBeam, makeLabel, makeSignalTower,
  makeParticleStream, makeLoadPort, makeRobotArm,
} from '../lib/equip-kit.js';

export const camera = { pos: [9, 6, 11], target: [0.5, 1.4, 0] };

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
    { name: '소프트 베이크', desc: '핫플레이트(90~110°C)에서 PR 용매를 증발시켜 막을 안정화합니다.', camera: { pos: [-5.5, 4.5, 5], target: [-3.5, 1.3, -1] } },
    { name: 'EUV 노광', desc: '13.5nm 극자외선이 레티클 패턴을 4:1로 축소 투영합니다. 스테이지가 나노미터 정밀도로 이동하며 다이별 스캔 노광합니다.', camera: { pos: [7, 5, 8], target: [3.2, 1.8, 0] } },
    { name: 'PEB (노광 후 베이크)', desc: '화학증폭형 PR의 산 확산 반응을 진행시켜 잠상(latent image)을 형성합니다. 온도 균일도가 CD에 직결됩니다.', camera: { pos: [-5.5, 4.5, 5], target: [-3.5, 1.3, -1] } },
    { name: '현상 (Develop)', desc: 'TMAH 현상액을 분사해 노광된 PR을 용해·제거하면 회로 패턴이 드러납니다.', camera: { pos: [-6, 4, 6], target: [-3.5, 1.3, 0] } },
    { name: 'CD/Overlay 계측', desc: 'CD-SEM으로 선폭을, 오버레이 계측기로 층간 정렬 오차를 측정해 Spotfire SPC 차트로 모니터링합니다.', camera: { pos: [2, 6, 10], target: [0.5, 1.2, 0] } },
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

  /* ================= 트랙 (좌측) ================= */
  const track = new THREE.Group();
  track.position.set(-3.5, 0, 0);

  const trackBody = makeCabinet({ w: 3.2, h: 2.4, d: 2.2, color: 0xe8edf5 });
  pick(trackBody, '트랙 (TEL 코터/디벨로퍼)', 'PR 도포·베이크·현상을 담당. 스캐너와 인라인으로 연결되어 웨이퍼가 자동 순환합니다.');
  track.add(trackBody);

  // 스핀 코터 유닛 (전면 개방 컷어웨이)
  const coaterCup = new THREE.Mesh(
    new THREE.CylinderGeometry(0.72, 0.6, 0.5, 40, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x39415a, metalness: 0.4, roughness: 0.6, side: THREE.DoubleSide }));
  coaterCup.position.set(0, 1.3, 1.35);
  pick(coaterCup, '스핀 코터 컵', '웨이퍼를 최대 4000rpm으로 회전시키며 PR을 도포. 컵이 비산되는 PR을 회수합니다.');
  track.add(shadow(coaterCup));

  const spinWafer = makeBareWafer(0.55, 0.03);
  spinWafer.position.set(0, 1.35, 1.35);
  track.add(spinWafer);

  // PR 분사 노즐 + PR 방울 줄기
  const nozzleArm = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.08), MAT.steel());
  nozzleArm.position.set(0.35, 1.85, 1.35);
  track.add(nozzleArm);
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.02, 0.22), MAT.dark(0x2a3244));
  nozzle.position.set(0, 1.74, 1.35);
  pick(nozzle, 'PR 분사 노즐', '감광액을 웨이퍼 중심에 정량 토출합니다. 막힘·기포는 코팅 결함의 주원인.');
  track.add(nozzle);
  const prStream = makeBeam([0, 1.65, 1.35], [0, 1.37, 1.35], { color: 0xffd166, radius: 0.015, opacity: 0.95 });
  track.add(prStream);
  const prFilm = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.012, 48), MAT.glow(0xffd166, 0.5));
  prFilm.position.set(0, 1.372, 1.35);
  track.add(prFilm);

  // 핫플레이트 (베이크 유닛)
  const hotplate = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.12, 40), MAT.dark(0x4a3038));
  hotplate.position.set(-1.0, 1.3, -0.55);
  pick(hotplate, '핫플레이트 (베이크 유닛)', '소프트베이크(90~110°C)·PEB(화학증폭 반응)를 수행. 온도 균일도 ±0.3°C가 CD 균일도에 직결됩니다.');
  track.add(shadow(hotplate));
  const heatGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.61, 0.61, 0.02, 40),
    new THREE.MeshBasicMaterial({ color: 0xff6a3a, transparent: true, opacity: 0.0, toneMapped: false }));
  heatGlow.position.set(-1.0, 1.37, -0.55);
  track.add(heatGlow);

  // 현상 유닛
  const devCup = coaterCup.clone();
  devCup.material = new THREE.MeshStandardMaterial({ color: 0x2f4a5a, metalness: 0.4, roughness: 0.6, side: THREE.DoubleSide });
  devCup.position.set(1.05, 1.3, -0.55);
  pick(devCup, '현상(Develop) 유닛', 'TMAH 현상액을 분사해 노광된 PR을 용해. 현상 후 패턴이 드러납니다.');
  track.add(devCup);
  const devSpray = makeParticleStream({ count: 60, area: 0.3, yTop: 1.8, yBottom: 1.35, color: 0x58d6ff, size: 0.02 });
  devSpray.position.set(1.05, 0, -0.55);
  track.add(devSpray);

  const towerT = makeSignalTower();
  towerT.position.set(-1.45, 2.4, 1.0);
  track.add(towerT);
  const trackLabel = makeLabel('트랙 (코터/디벨로퍼)', { color: '#ffd166', size: 0.42 });
  trackLabel.position.set(0, 3.1, 0);
  track.add(trackLabel);
  group.add(track);

  /* ================= EUV 스캐너 (우측) ================= */
  const scanner = new THREE.Group();
  scanner.position.set(3.2, 0, 0);

  const scanBody = makeCabinet({ w: 4.2, h: 2.9, d: 3.0, color: 0xd6ddea, screen: false });
  pick(scanBody, 'EUV 스캐너 본체 (ASML NXE)', '13.5nm 극자외선 노광기. 내부는 진공이며 반사식 미러 광학계를 사용합니다. 대당 약 2억 달러.');
  scanner.add(scanBody);

  // 광원 모듈 (Sn 플라즈마)
  const source = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 24), MAT.steel(0x828da3));
  source.position.set(-1.5, 0.9, 0);
  pick(source, 'EUV 광원 (Sn 플라즈마)', '주석 액적에 CO₂ 레이저를 쏘아 플라즈마를 만들고 13.5nm EUV를 발생시킵니다.');
  scanner.add(shadow(source));
  const sourceCore = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), MAT.glow(0xbb99ff, 3.0));
  sourceCore.position.copy(source.position);
  scanner.add(sourceCore);

  // 레티클 스테이지 (상단)
  const reticle = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.06, 0.62), MAT.glass(0x99ccff, 0.6));
  reticle.position.set(0.3, 2.55, 0);
  pick(reticle, '레티클 (포토마스크)', '회로 패턴 원본. EUV용은 반사식 마스크이며 패턴이 4:1로 축소되어 웨이퍼에 전사됩니다.');
  scanner.add(reticle);
  const reticleFrame = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.12, 0.8), MAT.dark());
  reticleFrame.position.set(0.3, 2.62, 0);
  scanner.add(shadow(reticleFrame));

  // 투영 광학계 (미러 컬럼)
  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.62, 1.35, 32), MAT.steel(0x9aa8c0));
  column.position.set(0.3, 1.75, 0);
  pick(column, '투영 광학계 (POB)', 'Zeiss 초정밀 다층막 미러 6매가 레티클 상을 4:1 축소해 웨이퍼에 결상합니다. 미러 면정밀도는 원자 수준.');
  scanner.add(shadow(column));

  // 웨이퍼 스테이지
  const stageBase = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.18, 1.5), MAT.steel(0x6b7488));
  stageBase.position.set(0.3, 0.55, 0);
  scanner.add(shadow(stageBase));
  const stage = new THREE.Group();
  const chuck = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.66, 0.14, 40), MAT.dark(0x39415a));
  chuck.position.y = 0.72;
  pick(chuck, '웨이퍼 스테이지 (척)', '자기부상 스테이지가 나노미터 정밀도로 웨이퍼를 이동시키며 다이별 스캔 노광. 척 오염은 overlay 불량의 주범.');
  stage.add(shadow(chuck));
  const scanWafer = makeWafer(0.55, { tint: '#8877ff' });
  scanWafer.position.y = 0.81;
  stage.add(scanWafer);
  stage.position.set(0.3, 0, 0);
  scanner.add(stage);

  // 광 경로 빔
  const beamSrc = makeBeam([-1.5, 0.9, 0], [0.3, 2.5, 0], { color: 0xbb99ff, radius: 0.028 });
  const beamDown = makeBeam([0.3, 2.5, 0], [0.3, 0.9, 0], { color: 0xbb99ff, radius: 0.045 });
  const exposeSpot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.015, 24), MAT.glow(0xddccff, 3.5));
  exposeSpot.position.set(0.3, 0.83, 0);
  scanner.add(beamSrc, beamDown, exposeSpot);

  const towerS = makeSignalTower();
  towerS.position.set(1.9, 2.9, 1.3);
  scanner.add(towerS);
  const scanLabel = makeLabel('EUV 스캐너', { color: '#bb99ff', size: 0.42 });
  scanLabel.position.set(0.3, 3.6, 0);
  scanner.add(scanLabel);
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
      show(prStream, prFilm); hide(beamSrc, beamDown, exposeSpot, devSpray);
      heatGlow.material.opacity = 0; spinFast = true;
    },
    () => { // 1: 소프트베이크
      hide(prStream, beamSrc, beamDown, exposeSpot, devSpray); show(prFilm);
      heatGlow.material.opacity = 0.55; spinFast = false;
    },
    () => { // 2: 노광
      show(beamSrc, beamDown, exposeSpot); hide(prStream, devSpray);
      heatGlow.material.opacity = 0; spinFast = false; scanning = true;
    },
    () => { // 3: PEB
      hide(beamSrc, beamDown, exposeSpot, prStream, devSpray);
      heatGlow.material.opacity = 0.75; scanning = false;
    },
    () => { // 4: 현상
      show(devSpray); hide(beamSrc, beamDown, exposeSpot, prStream);
      heatGlow.material.opacity = 0;
    },
    () => { // 5: 계측
      hide(beamSrc, beamDown, exposeSpot, prStream, devSpray);
      heatGlow.material.opacity = 0;
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
      scanWafer.rotation.y += 0.05 * dt;
      sourceCore.material.emissiveIntensity = 2.4 + Math.sin(t * 8) * 0.8;
      if (scanning) stage.position.x = 0.3 + Math.sin(t * 1.2) * 0.28;
      devSpray.userData.tick(dt);
      robot.userData.setPose(Math.sin(t * 0.5) * 0.9, Math.sin(t * 0.7) * 0.5, Math.cos(t * 0.6) * 0.6);
    },
  };
}
