# 메모리 반도체 공정 아카데미 — 웨이퍼에서 HBM까지

SK하이닉스 HBM·메모리 반도체 공정을 **인터랙티브 3D**로 학습하고,
**Spotfire 스타일 데이터 분석 실습**으로 공정 이상을 진단·해결하는 교육용 웹 서비스입니다.

## 실행 방법

빌드 과정 없이 정적 서버만 있으면 실행됩니다. (Three.js는 `vendor/`에 포함 — 오프라인에서도 동작)

```bash
# 방법 1: Python
python3 -m http.server 8000

# 방법 2: Node
npx serve .
```

브라우저에서 `http://localhost:8000` 접속.
(ES 모듈을 사용하므로 `file://`로 직접 열면 동작하지 않습니다 — 반드시 서버로 실행)

## 구성

| 페이지 | 내용 |
|---|---|
| `index.html` | 3D 공정 여정 오버뷰 — 8개 스테이션 + 중앙 HBM 스택 (클릭 내비게이션) |
| `process.html?id=<공정>` | 공정별 3D 설비 + 단계 애니메이션 + 원리/장비/파라미터/불량 학습 |
| `hbm.html` | HBM 심화 — TSV·적층·MR-MUF 인터랙티브 3D |
| `spotfire.html` | 계측 데이터 대시보드 (SPC 관리도·빈맵·박스플롯·FDC 장비 센서 트렌드/트레이스) + 이상 사례 퀴즈 학습 |

### 8대 공정
웨이퍼 제조 → 산화 → 포토 → 식각 → 증착·이온주입 → 금속배선 → EDS 테스트 → 패키징

## 디렉토리

```
css/style.css              디자인 시스템
js/data/processes-index.js 공정 레지스트리 (내비/색상 단일 소스)
js/lib/three-core.js       3D 씬 부트스트랩 (조명/컨트롤/피킹/카메라 애니메이션)
js/lib/equip-kit.js        장비 3D 부품 키트 (챔버/로봇/웨이퍼/입자 등)
js/processes/<id>.js       공정별 모듈 (3D 장비 + 학습 콘텐츠)
js/spotfire/datagen.js     팹 계측 데이터 시뮬레이터 (Lot/Wafer/Site + 이상 주입 + SPC + FDC 센서)
js/spotfire/charts.js      캔버스 차트 (관리도/웨이퍼맵/빈맵/박스플롯/히스토그램)
js/spotfire/cases.js       공정별 이상 사례 학습 케이스 뱅크 (18개)
vendor/                    Three.js 로컬 번들 (three.module.js + addons)
docs/research/             공정 기술 리서치 자료 (학습 참고 문서)
docs/MODULE_SPEC.md        공정 모듈 제작 사양서
```

> 모든 데이터는 실제 공정을 모사한 **가상 데이터**이며 교육 목적으로만 사용됩니다.
