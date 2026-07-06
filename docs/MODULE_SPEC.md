# 공정 모듈 제작 사양서 (빌드 팀용)

각 공정 모듈은 `js/processes/<id>.js` 하나의 ES 모듈 파일이다.
**표준 예시: `js/processes/photo.js` — 반드시 먼저 읽고 동일한 구조/품질로 작성할 것.**

## Export 계약 (필수)

```js
export const camera = { pos: [x,y,z], target: [x,y,z] };  // 초기 카메라
export const content = {
  overview: '공정 설명 문단 (4~6문장, 한국어)',
  keyPoints: ['핵심 포인트 4~6개'],
  hbmNote: 'HBM/DRAM 관점에서 이 공정이 갖는 의미 (2~3문장)',
  steps: [   // 4~7단계. 각 단계는 3D 연출과 1:1 대응
    { name: '단계명', desc: '설명 (1~2문장)', camera: { pos: [..], target: [..] } }, // camera는 선택
  ],
  equipment: [ // 3~5개. 실제 제조사/장비명 사용
    { name: '장비명', vendor: '제조사', role: '역할 설명', spec: '핵심 스펙 (선택)' },
  ],
  parameters: [ // 4~6개
    { name: '파라미터', typical: '대표값/관리범위', monitor: '측정 방법·관리도구' },
  ],
  defects: [ // 4~5개. docs/research/defect-cases.md 내용 활용
    { name: '불량명', signature: '데이터에서 어떻게 보이는가', cause: '근본 원인', action: '조치' },
  ],
};
export function build3D(ctx) {
  // ctx: { THREE, scene, camera, renderer, controls, onTick, flyTo, ... } — 보통 THREE만 쓰면 됨
  const group = new THREE.Group();
  // ... 장비 구성 ...
  return {
    group,                 // 필수
    setStep(i) { ... },    // 필수: content.steps[i]에 맞는 시각 상태로 전환
    tick(t, dt) { ... },   // 필수: 연속 애니메이션 (회전/발광/입자)
  };
}
```

## 3D 제작 규칙

1. **부품 키트 사용**: `../lib/equip-kit.js` 의 프리미티브를 최대한 활용
   - `MAT.steel/paint/dark/plastic/glass/glow/silicon/copper/gold` — 재질
   - `makeWafer / makeBareWafer / makeFoup / makeCabinet / makeChamber / makePedestal / makeShowerhead`
   - `makePipe(points) / makeBeam(from,to) / makePlasmaGlow / makeParticleStream / makeRobotArm`
   - `makeLabel(text,{color,size})` — 3D 라벨, `makeSignalTower()` — 상태등, `makeLoadPort()`
   - `pick(obj, '이름', '설명')` — **마우스 오버/클릭 정보 대상 지정 (장비 주요부 5~8곳에 필수 적용)**
   - `shadow(obj)` — 그림자 활성화
2. **스케일**: 바닥 y=0, 장비 높이 2~3, 전체 폭 6~10 내외 (photo.js 참고)
3. **단계 연출**: `setStep(i)`에서 빔/입자/발광의 visible 토글 + 웨이퍼 위치 이동으로 공정 진행을 표현
4. **애니메이션**: tick에서 웨이퍼 회전, 플라즈마 pulse(`obj.userData.pulse(t)`), 입자(`obj.userData.tick(dt)`), 로봇 포즈(`robot.userData.setPose(...)`) 등 항상 살아있는 연출
5. **색**: 공정 대표색은 `js/data/processes-index.js` 의 color 값과 어울리게
6. import 경로: `import * as THREE from 'three'` / `from '../lib/equip-kit.js'`

## 콘텐츠 규칙

- 모든 텍스트 한국어, 전문용어는 병기 (예: 식각(Etch))
- `docs/research/` 의 해당 리서치 문서를 읽고 사실 기반으로 작성
- HTML 이스케이프 불필요한 특수문자 자제, 문자열에 백틱/`${}` 금지 (일반 따옴표 문자열 사용)

## Spotfire 케이스 규칙 (cases.js 확장 시)

`js/spotfire/cases.js` 형식 준수. anomaly.param 은 `js/spotfire/datagen.js` 의
`PROC_DATA_DEFS[procId].params[].key` 중 하나여야 한다. binPattern 은 eds/hbm 전용.
질문은 2~3개, 오답에도 hint 제공, 해설은 "왜"를 가르치는 교육적 문장으로.
