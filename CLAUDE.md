# CLAUDE.md — 메모리 반도체 공정 아카데미

SK하이닉스 HBM·메모리 반도체 공정을 3D로 학습하고 Spotfire 스타일 데이터 분석을
실습하는 **교육용 정적 웹사이트**. 빌드 도구 없음, 순수 ES 모듈.

## 실행 & 배포 워크플로우

```bash
# 1) 로컬에서 수정 결과 확인 (ES 모듈이라 file:// 불가, 서버 필수)
python3 -m http.server 8000        # → http://localhost:8000

# 2) 검증 (아래 "검증" 섹션)

# 3) 배포 = push (GitHub Pages가 master 루트를 자동 서빙, 반영까지 1~2분)
git add -A && git commit -m "..." && git push
```

- **배포 주소**: https://seunghyun980717.github.io/Semiconductor_Engineer/
- Three.js는 CDN이 아니라 `vendor/`에 로컬 번들 (오프라인 동작). 버전 올릴 때는
  `npm i three@<ver>` 후 `node_modules/three/build/three.module.js`와 필요한
  `examples/jsm/*`을 `vendor/`로 복사.

## 아키텍처 (핵심 계약)

| 파일 | 역할 |
|---|---|
| `js/data/processes-index.js` | 8대 공정 레지스트리(id/색상/제목) — 내비·색상의 **단일 소스** |
| `js/lib/three-core.js` | 씬 부트스트랩: 조명+환경맵(RoomEnvironment), OrbitControls, 피킹, flyTo |
| `js/lib/equip-kit.js` | 장비 3D 부품 키트. `pick(obj, 이름, 설명)`으로 마우스 인터랙션 태깅 |
| `js/processes/<id>.js` | 공정 모듈. **표준 예시: `photo.js`**, 사양서: `docs/MODULE_SPEC.md` |
| `js/spotfire/datagen.js` | Lot(8)→Wafer(25)→Site(13) 데이터 생성, 이상 주입, SPC(WE rules), FDC 센서 |
| `js/spotfire/charts.js` | 캔버스 차트 (관리도/빈맵/사이트맵/박스플롯/히스토그램/FDC) |
| `js/spotfire/cases.js` | 케이스 뱅크. `anomaly.param`은 반드시 `PROC_DATA_DEFS[proc].params[].key` |

공정 모듈 export 계약 (전 모듈 동일):
```js
export const camera = { pos:[x,y,z], target:[x,y,z] };
export const content = { overview, keyPoints, hbmNote, steps[], equipment[], parameters[], defects[] };
export function build3D(ctx) { return { group, setStep(i), tick(t, dt) }; }
```

새 공정 추가 시: ① `processes-index.js`에 등록 ② `js/processes/<id>.js` 작성(photo.js 모방)
③ `datagen.js`에 `PROC_DATA_DEFS`·`FDC_DEFS` 추가 ④ `cases.js`에 케이스 2개 추가.

## 검증 (수정 후 반드시)

```bash
node --check js/수정한파일.js                  # 문법
node tools/check-modules.cjs "$(pwd)"          # import 경로·모듈 계약·케이스 param 정합성
node tools/import-test.mjs "$(pwd)"            # 모듈 실제 import + 콘텐츠 구조 + 이상신호 강도
node tools/browser-test.mjs ./.screenshots     # 헤드리스 Edge로 전 페이지 콘솔오류+스크린샷
node tools/mobile-test.mjs ./.screenshots      # 모바일(390px) 뷰포트: 가로 오버플로·오류
```

- 브라우저 테스트는 `npm i`(three, puppeteer-core 설치) 후 **프로젝트 루트에서** 실행
  (node_modules 해석 때문. 스크립트를 다른 곳에 복사해 실행하면 모듈을 못 찾음).
- 헤드리스는 Windows Edge(`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`)
  사용 — Chromium 다운로드 불필요. `browser-test.mjs`는 로컬 서버(8765) 필요,
  `mobile-test.mjs`는 배포 URL을 직접 침.
- 이 저장소는 Windows에서 `\\wsl.localhost\Ubuntu\...` UNC 경로로 접근됨.
  git 오류 "dubious ownership" 발생 시 safe.directory 등록 필요 (이미 등록됨).

## 코드 규칙

- 콘텐츠·UI 텍스트는 한국어, 전문용어는 병기 — 예: 식각(Etch)
- 공정 모듈 안에서는 `three`와 `../lib/equip-kit.js`만 import (다른 경로 금지)
- 데이터는 전부 가상(교육용). 사실 관계는 `docs/research/*.md` 리서치 문서 기반으로 작성
- 이상 주입 타입: shift/drift/spike/highvar/cyclic/edge/lot, 빈맵 패턴(eds·hbm 전용):
  edge/center/ring/scratch/bottom/random
- SPC 관리한계는 앞 30% 구간을 기준선으로 산출 → 이상이 뒤쪽에 주입되어야 감지가 보임
  (케이스의 `at`은 0.45 이상 권장)
