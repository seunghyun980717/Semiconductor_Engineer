# TIBCO Spotfire의 반도체 제조 데이터 분석 활용

> 작성일: 2026-07-06
> 조사 방법: WebSearch/WebFetch 기반 공개 자료 조사 (TIBCO/Spotfire 공식 문서·블로그, Spotfire Community, PDF Solutions/Exensio, 위키피디아, 국내 교육기관 및 취업 커뮤니티 등)

---

## 1. 개요: Spotfire와 반도체 팹

TIBCO Spotfire(현재는 독립 브랜드 "Spotfire")는 방대한 다차원 제조 데이터를 대화형으로 시각화·분석하는 **비주얼 데이터 분석(Visual Data Science) 플랫폼**이다. 반도체 산업에서는 팹(Fab)·테스트·패키징 공정에서 발생하는 계측(metrology), 검사(inspection), 장비 센서(FDC), 전기적 테스트(E-test), MES 데이터를 하나의 대시보드에서 통합 분석하는 용도로 널리 쓰인다.

- Spotfire 공식 반도체 솔루션 페이지에 따르면, 주요 활용 영역은 다음과 같다.
  - **수율/품질(Yield & Quality)**: wafer-level spatial pattern, defect inspection 결과, inline metrology 측정값, 전기적 테스트 데이터를 상관분석하여 수율 손실의 근본 원인(root cause)을 규명
  - **공정 안정성 모니터링**: 대화형 통계 분석, 공간(spatial) 시각화, 시계열 탐색을 통해 공정 변동을 조기에 감지하고, 장비(tool)·챔버(chamber)·레시피(recipe) 간 비교 분석 지원
  - **통합 데이터 분석**: Renesas 등의 사례처럼 fab, test, assembly 데이터를 실시간으로 통합하여 대화형 분석과 신속한 의사결정 지원
- PDF Solutions(현재 Exensio 플랫폼 운영사)는 2009년 TIBCO Spotfire와 전략적 제휴를 맺고 "dataPOWER VSF(Visual Interactive Yield Management)"를 출시했으며, 이후 **전 세계 100개 이상의 반도체 기업이 Spotfire 기반 역량을 포함한 Exensio Analytics Platform**을 사용 중인 것으로 알려져 있다. TriQuint(현 Qorvo)는 5년 이상 Spotfire를 설계, 제조 테스트, 웨이퍼 팹, 생산 지표 분석에 활용한 사례를 발표했다.
- 현대적 활용에서는 제조 센서 데이터를 대규모로 처리하여, 최대 수백만 개의 예측 변수(공정 파라미터)와 제품 품질 지표 간의 연관성을 찾아내는 "디지털 트윈" 방식의 수율 분석(Wide Data 분석)도 지원한다.

### 1.1 수율 분석(Yield Analysis)
- 반도체 양산 공정에서 수율 저하가 발생하면 특정 공정/장비/조건에서 공통 원인이 존재하는 경우가 많다. Spotfire는 **ANOVA(분산분석)** 등을 활용해 수율 열화에 영향을 미치는 주요 인자를 추출하고, 공정 데이터 내 공통 패턴을 탐색하는 기능을 제공한다.
- 웨이퍼 테스트(E-test) 데이터를 스트리밍 방식으로 분석하여, 어떤 센서·파라미터가 테스트 실패(fail)와 가장 높은 상관관계를 갖는지 식별하는 기능도 갖추고 있다(연관성 강도 측정).

### 1.2 SPC(통계적 공정관리)
- Spotfire는 대량의 파라미터를 모니터링하고 규칙 위반 시 자동 경고(alert)를 생성하는 "손쉽게 구성 가능한 품질관리 솔루션"을 제공한다.
- 공식 SPC 데모("Statistical Process Control Monitoring Demo")는 "다양한 파라미터를 SPC 기법으로 모니터링·분석하여 품질을 보장하고, 이상을 탐지하며, 공정 효율을 유지"하는 것을 목표로 한다. 추세 식별, 조기 대응, 공정 최적화가 핵심 기능으로 소개된다.
- APC(Advanced Process Control)라는 상위 개념 안에 **Run-to-Run 제어, FDC, SPC, 가상계측(Virtual Metrology)**이 포함되며, SPC는 위반이 발생한 뒤 반응(reactive)하는 방식인 반면 R2R은 사전에 공정 출력을 목표값으로 능동적으로 구동(proactive)한다는 차이가 있다.

### 1.3 FDC(Fault Detection and Classification)
- FDC는 장비 센서 데이터를 이용해 웨이퍼별 결함 여부를 사전에 예측하는 모델로, 고수율 유지와 비용 절감에 핵심적이다. FDC를 통해 장비 상태를 모니터링하고 결함의 잠재 원인을 조사할 수 있다.
- 장비(tool) 레벨 FDC 운영의 이점: 장비 레벨 결함으로 인한 스크랩 감소, 진단 능력 향상을 통한 다운타임 감소, 부품 마모 모니터링을 통한 예방정비 일정 최적화(비계획 정비 감소).
- 기법으로는 SPC 차트, **PCA(주성분분석)**, **PLS(부분최소제곱)** 등이 활용되며, 최근에는 실시간 모니터링·데이터 수집과 머신러닝을 결합한 방식이 일반적이다.
- Spotfire Community에는 "Sputter Deposition Advanced Process Control"과 같이 박막 증착 공정에서 APC를 구현한 사례가 게시되어 있다(상세 본문은 인증 필요로 접근 제한).

### 1.4 계측 데이터 분석(Metrology)
- Spotfire는 inline metrology 측정값, defect inspection 결과, 전기적 테스트 데이터를 상관분석하여 공정-결함 간 관계를 규명한다.
- 최근(2025~2026) Spotfire 블로그에서는 웨이퍼 단위로 수백만 개의 다이(die) 레벨 측정값을 분석해 "공정이 정확히 어디서 실패했는지", "어떤 장비가 드리프트(drift) 중인지", "왜 수율이 정체되는지"를 밝혀내는 zone-based(radial/angular 영역 분할) 분석 기능을 강조하고 있다("Generate Wafer Zone Analysis" Action Mod).

---

## 2. 주요 시각화 유형

Spotfire는 반도체 공정 데이터의 특성(다차원, 계층 구조, 공간적 패턴)에 맞춰 다양한 시각화 유형을 제공한다.

| 시각화 유형 | 용도 |
|---|---|
| **Control Chart(관리도)** | SPC 도구 중 "가장 오래되고 널리 사용되는" 시각화로, 시간 순서에 따른 공정 파라미터 추이와 관리한계(UCL/LCL)를 표시 |
| **Wafer Bin Map / Wafer Map** | 웨이퍼 상의 각 다이(die) 위치에 테스트 결과(양품/불량 bin) 또는 계측값을 실제 웨이퍼 배치와 동일하게 매핑하여 시각화. 색상·모양·크기로 실패 유형 구분, edge-ring 결함·center 결함·scratch 패턴 등 공간적 시그니처를 즉시 식별 가능 |
| **Box Plot** | 파라미터 분포의 사분위수, 중앙값, 이상치를 요약. Spotfire의 박스플롯은 각 박스에 대한 히스토그램도 함께 표시 가능 |
| **Scatter Plot** | 두 파라미터 간 상관관계 분석(예: 공정 변수 vs 수율). Chromosome map, Gantt chart, swim lane, ternary plot 등 다양한 변형의 기반이 되는 유연한 시각화 |
| **Histogram** | 파라미터 값의 분포/도수 확인, 공정능력 분석의 기초 자료 |
| **Trellis(격자) 시각화** | 선택한 컬럼/계층의 카테고리별로 화면을 여러 패널로 분할하여 배치(batch), 장비(tool), 공정(process) 등 그룹 간 유사점·차이점을 한눈에 비교. 예: X축은 배치 번호, Trellis 축은 장비/공정으로 분할 |
| **Map Chart(웨이퍼맵 기반)** | 마커가 실제 칩(다이) 위치를 나타내며, 웨이퍼 실물과 동일한 배치로 표시. "Create Wafer Map" Action Mod로 클릭 몇 번만으로 생성 가능 |
| **산점도 변형(Beeswarm, Violin Plot)** | 커뮤니티 확장 기능(Mod)을 통해 분포 형태를 더 세밀하게 표현 |

- 드릴다운 분석: 수백 개 웨이퍼의 개요(overview)에서 개별 레이어/로트 레벨까지 단계적으로 파고드는 분석이 가능하다.
- 결과는 공정 데이터, 수율 분석, SPC 차트와 자유롭게 결합(연동)할 수 있다.

---

## 3. SPC 기법 상세

### 3.1 관리도(Control Chart) 기본 구조
- 관리도는 공정의 중심선(CL, Center Line)과 관리상한(UCL, Upper Control Limit)/관리하한(LCL, Lower Control Limit)을 설정하고, 시계열로 측정값을 타점하여 공정이 통계적으로 관리 상태(in-control)인지 판단하는 도구다.
- **X-bar/R 관리도**: 부분군(subgroup)의 평균(X-bar)과 범위(Range, R)를 각각 별도 차트로 관리한다. X-bar 차트는 부분군 평균의 중심 경향을, R 차트는 부분군 내부의 변동(산포)을 모니터링한다. 일반적으로 8단계 절차(부분군 구성 → 평균/범위 계산 → 관리한계 산출 → 타점 → 이상 판정 등)로 구축한다.
- UCL/LCL은 통상 중심선 ± 3표준편차(3σ) 범위로 설정되며, 관리도를 3개 구간(Zone A: 2~3σ, Zone B: 1~2σ, Zone C: 0~1σ)으로 나누어 이상 판정 규칙에 활용한다.

### 3.2 Western Electric Rules
1956년 Western Electric Company의 품질관리 핸드북에서 코드화된 규칙으로, 관리도 상의 비무작위적(non-random) 패턴을 감지하기 위한 4가지 규칙이다.

| 규칙 | 조건 |
|---|---|
| Rule 1 | 임의의 점 1개가 중심선으로부터 3σ(Zone A 바깥)를 벗어남 |
| Rule 2 | 연속된 3개 점 중 2개가 같은 방향으로 2σ(Zone A 이상)를 벗어남 |
| Rule 3 | 연속된 5개 점 중 4개가 같은 방향으로 1σ(Zone B 이상)를 벗어남 |
| Rule 4 | 연속된 8개 점이 모두 중심선 한쪽(Zone C 이상)에 위치 |

### 3.3 Nelson Rules (8가지)
Lloyd S. Nelson이 1984년 Journal of Quality Technology에 발표한 확장 규칙으로, Western Electric의 4개 규칙(Rule 1~4에 해당)에 4개를 추가해 총 8개 규칙으로 구성된다.

1. 점 1개가 중심선에서 3σ를 벗어남(급격한 이상)
2. 연속 9개 점이 중심선의 같은 쪽에 위치(장기적 편향 존재)
3. 연속 6개 점이 뚜렷한 증가/감소 추세를 보임(트렌드 존재)
4. 연속 14개(이상) 점이 교대로 증감을 반복(과도한 진동/오실레이션)
5. 연속 3개 점 중 2~3개가 같은 방향으로 2σ를 초과
6. 연속 5개 점 중 4~5개가 같은 방향으로 1σ를 초과
7. 연속 15개 점이 모두 1σ 이내에 위치(과소 산포, 층화 의심)
8. 연속 8개 점이 1σ 이내에 하나도 없이 양방향에 분포(이봉분포, 2개 이상 요인 혼재 가능성)

- 모든 규칙을 동시에 활성화하면 공정능력이 높은(Cp/Cpk, Pp/Ppk가 높은) 경우에도 오탐(false alarm)이 크게 늘어날 수 있어, 실무에서는 규칙을 선별 적용하는 경우가 많다.

### 3.4 공정능력지수(Cpk/Ppk)
- **Cpk** = min[(USL − μ)/3σ_within, (μ − LSL)/3σ_within] — 단기(short-term), **부분군 내(within-subgroup) 표준편차**를 사용하여 통제된 조건에서의 변동을 반영
- **Ppk** = min[(USL − μ)/3s_overall, (μ − LSL)/3s_overall] — 장기(long-term), **전체(overall) 표준편차**를 사용하여 배치 간 변동, 드리프트, 시프트 등 모든 변동 원인을 포함
- 실무적으로 동일 데이터셋에서 Cpk가 Ppk보다 크거나 같은 경우가 일반적이며(Ppk ≤ Cpk), 두 지수를 병행 관리하기 위해 단기(부분군 내)와 장기(전체) 표준편차를 동시에 유지하는 것이 권장된다.
- Cpk/Ppk는 공정이 규격(USL/LSL) 대비 얼마나 안정적으로 운영되는지를 정량화하는 지표로, SPC 대시보드에서 관리도와 함께 병행 표시되는 것이 일반적이다.

---

## 4. 반도체 계측 데이터 구조 (Lot/Wafer/Site 계층)

Spotfire는 반도체 제조 데이터 특유의 계층적(hierarchical) 구조를 다루도록 설계되어 있다.

- **계층 구조 예시**: 각 행(row)은 특정 로트(lot)에 속한 하나의 웨이퍼를 나타내며, 이 웨이퍼는 6개 센서(sensor)로부터 각각 15개 파라미터에 대한 테스트 측정값을 수집한다. 파라미터 예시로는 전압(voltage), 전류(current), 프로브 패드 두께(probe pad thickness), 저항(resistance) 등이 있다.
- 일반적인 반도체 계측/테스트 데이터의 계층 구조는 다음과 같이 요약할 수 있다.
  - **Lot(로트)** → **Wafer(웨이퍼)** → **Site/Die(측정 지점 또는 다이)** → **Parameter(측정 파라미터)**
  - 각 웨이퍼는 다시 다수의 다이(die) 또는 계측 site로 구성되며, 각 site/die에서 여러 전기적·물리적 파라미터가 측정된다.
- **필터링/쿼리**: 대용량 데이터 소스에서 로트, 웨이퍼, 장비(tool), 시간 범위별로 필터링하는 것이 일반적인 요구사항이며, Spotfire는 파라미터화된 데이터 접근(prompting) 기능으로 중첩 메뉴나 복잡한 쿼리 로직 없이도 특정 웨이퍼 런, 로트, 측정 지점을 검색·필터링할 수 있도록 지원한다.
- **웨이퍼 단위 대용량 데이터**: 최근 자료에 따르면 웨이퍼 1장당 수백만 개의 다이 레벨 측정값이 생성될 수 있으며, 이를 radial(동심원)·angular(각도) 방향의 zone으로 분할하여 공간적 패턴(공정 이슈, 수율 손실 연관성)을 분석하는 기능(Wafer Zone Analysis)이 제공된다.
- PDF Solutions의 Exensio 플랫폼은 FDC, Test, Assembly, Packaging 등 50개 이상의 서로 다른 데이터 포맷을 지원하며, 이를 클라우드/온프레미스의 고성능 시맨틱 모델로 통합하여 대화형 분석 및 머신러닝에 즉시 활용할 수 있도록 조화(harmonize)시킨다.

---

## 5. Spotfire 대시보드 UI 구성

### 5.1 필터 패널(Filter Panel)
- 대시보드 상단/측면에 위치한 필터 패널을 통해 로트, 웨이퍼, 장비, 시간 범위, 파라미터 등 다양한 축으로 데이터를 좁혀볼 수 있다.
- 드롭다운 필터 등 다양한 필터 UI 구성 방식이 지원된다.

### 5.2 마킹(Marking)
- 마킹은 분석(analysis) 내 데이터 테이블에서 "표시된 행(marked rows)"을 식별하는 기능으로, 하나의 시각화에서 마킹한 항목이 다른 시각화에도 동시에 반영되어(cross-visualization highlighting) 여러 차트 간 연관 탐색이 가능하다.
- **마킹 상호작용 방식**:
  - Ctrl+클릭/드래그: 기존 마킹에 항목 추가
  - Alt+드래그(올가미, lasso marking): 직사각형으로 감쌀 수 없는 불규칙 분포 항목을 자유형으로 선택
- **Filter to Marked Rows**: 마킹된 항목만 남기고 나머지를 필터링하는 기능으로, 마킹 → 우클릭 → "Marked Rows > Filter To"로 실행하며, 이 과정에서 "Filtered to at..." 컬럼이 새로 생성된다. IronPython 스크립팅을 통해 마킹에 따라 필터 패널을 자동으로 업데이트하는 것도 가능하다.

### 5.3 드릴다운(Drill-down)
- 대시보드는 전체 개요(overview) 레벨(예: 수백 개 웨이퍼)에서 시작해, 마킹/클릭 인터랙션을 통해 개별 레이어, 로트, 웨이퍼, 다이 레벨까지 단계적으로 파고드는 드릴다운 분석을 지원한다.
- 여러 시각화(관리도, 웨이퍼맵, 산점도, 트렐리스)를 하나의 대시보드에 배치하고 마킹으로 연동함으로써, 예컨대 "관리도에서 이상 시점을 마킹 → 해당 시점의 웨이퍼맵과 산점도가 자동으로 필터링되어 원인 파라미터 확인"과 같은 근본원인 분석 워크플로우가 가능하다.

---

## 6. 국내(SK하이닉스/삼성전자) 반도체 기업의 Spotfire 활용 사례

- **SK하이닉스**: 채용/직무 관련 커뮤니티(코멘토 등) 자료에 따르면, SK하이닉스의 **양산기술(제조/공정) 직무에서 데이터 분석 시 Spotfire를 주요 도구로 활용**하고 있는 것으로 확인된다. 또한 SK하이닉스 뉴스룸에 소개된 사내 "지식블로그" 구축 사례에서는, 사내 데이터 분석 담당(DT) 조직이 **JMP, Spotfire, SmartTAS(자체 시스템), Python 등을 SK하이닉스에서 가장 많이 쓰는 데이터 분석 툴**로 선정해 지식 공유 콘텐츠를 구성했다고 밝히고 있다.
- **채용 시장/교육 동향**: 2026년 2월 전자신문 보도에 따르면, 고용노동부 주관 반도체 국비지원교육(KDC) 과정 중 'Spotfire' 활용 과정이 모집 개시 30여 분 만에 정원이 마감되는 등 이례적인 인기를 보였으며, "실시간 데이터 분석 및 수율 관리" 역량에 대한 취업 시장의 수요가 급증하고 있다고 분석된다. 이는 반도체 공정/양산기술 직무에서 Spotfire 활용 능력이 사실상 필수 역량으로 자리잡고 있음을 시사한다.
- **삼성전자**: 검색을 통해 삼성전자가 사내에서 구체적으로 Spotfire를 사용한다는 1차 공식 자료(사보, 공식 발표 등)는 확인되지 않았다. 다만 여러 국내 취업/교육 자료(코멘토, 링커리어 등)에서 "삼성전자, SK하이닉스 등 첨단 팹 현장에서 수율을 분석할 때 가장 널리 쓰이는 데이터 시각화 도구"로 Spotfire가 언급되고 있어, 업계 전반(특히 공정/양산기술·수율 엔지니어 직무)에서 실무 표준 툴 중 하나로 통용되고 있는 것으로 파악된다. 정확한 사내 도입 범위는 공개 자료로는 검증이 제한적이다.
- **민간 교육 과정**: P&D 솔루션(피앤디솔루션)의 "Spotfire를 활용한 반도체 공정/결함 상관관계 분석" 등 국내 교육 과정에서는 다음 내용을 다룬다.
  - 반도체 생산 현황 진단
  - Wafer Defect Map 패턴 분석 및 **K-means 군집화**를 이용한 불량 유형 분류
  - **ANOVA**를 활용한 수율 열화 주요 인자 추출 및 공정 데이터 내 공통 패턴 탐색
  - 수율과 공정 파라미터 간 연관성 분석
  - 교육 수강생에게 3개월 Spotfire 라이선스를 제공하는 등, 반도체 엔지니어를 대상으로 한 실무 중심 커리큘럼이 다수 운영되고 있다.
- 종합하면, 국내 반도체 업계에서 Spotfire는 (1) 재직자 실무 도구, (2) 취업 준비생 대상 국비/민간 교육 과정의 핵심 과목, (3) 채용 시 우대 역량으로 삼중으로 자리잡고 있다.

---

## 7. 종합 정리

| 구분 | 핵심 내용 |
|---|---|
| 활용 목적 | 수율 분석, SPC, FDC/APC, 계측 데이터 상관분석, 근본원인 분석(RCA) |
| 데이터 구조 | Lot → Wafer → Site/Die → Parameter의 계층형 구조, 웨이퍼당 수백만 다이 레벨 측정 가능 |
| 주요 시각화 | Control Chart, Wafer Bin Map, Box Plot, Scatter Plot, Histogram, Trellis |
| SPC 핵심 기법 | X-bar/R 관리도, UCL/LCL(±3σ), Western Electric 4대 규칙, Nelson 8대 규칙, Cpk(단기)/Ppk(장기) |
| UI 상호작용 | 필터 패널(로트/웨이퍼/장비/시간), 마킹(cross-viz 연동, lasso, filter-to-marked), 드릴다운(개요→로트→웨이퍼→다이) |
| 생태계 | PDF Solutions/Exensio(Spotfire 기반 Yield Management), StatSoft Europe(Action Mod: Wafer Map, Wafer Zone Analysis) |
| 국내 사례 | SK하이닉스 양산기술 직무 실무 도구, 국비지원(KDC)·민간(P&D솔루션 등) 교육 핵심 과목, 삼성전자 등 업계 전반 활용 추정(1차 공식 자료 미확인) |

---

## 참고 출처 (Sources)

- [PDF Solutions(r) and TIBCO Spotfire(r) Strategic Alliance](https://www.globenewswire.com/news-release/2009/06/30/399939/7239/en/PDF-Solutions-r-and-TIBCO-Spotfire-r-Strategic-Alliance-Unveils-dataPOWER-r-VSF-for-Visual-Interactive-Yield-Management.html)
- [Data Analysis for Yield Improvement using TIBCO's Spotfire Data Analysis Software (Semantic Scholar)](https://www.semanticscholar.org/paper/Data-Analysis-for-Yield-Improvement-using-TIBCO's-Choo-Saeger/57a2fd08fec29cb93e86b0a25d9a7feae9fcd52f)
- [Yield Improvement Through Data Analysis using TIBCO Spotfire (TriQuint, SlideShare)](https://www.slideshare.net/TIBCOSpotfire/tri-quint-presentation-demo)
- [Digital Twins for Yield (Wide Data) Manufacturing - Spotfire Community](https://community.spotfire.com/articles/spotfire-data-science-team-studio/digital-twins-yield-wide-data-manufacturing-using-data-function-tibcor-data-science-team/)
- [TIBCO and PDF Solutions Extend Partnership](https://www.pdf.com/resources/tibco-and-pdf-solutions-extend-partnership-to-deliver-advanced-analytics-and-visualizations-to-customers/)
- [Statistical Process Control Monitoring Demo - Spotfire](https://www.spotfire.com/demos/statistical-process-control-monitoring-demo)
- [Spotfire | Statistical Process Control (SPC): Quality in Manufacturing](https://www.spotfire.com/glossary/what-is-statistical-process-control)
- [Manufacturing Solutions - Spotfire Community](https://community.spotfire.com/articles/spotfire/manufacturing-solutions/)
- [Advanced Process Control (APC) in Semiconductor Manufacturing - OrbitSkyline](https://orbitskyline.com/blog/advanced-process-control-apc-reducing-variability-in-semiconductor-manufacturing/)
- [Sputter Deposition Advanced Process Control - Spotfire Community](https://community.spotfire.com/articles/spotfire/sputter-deposition-advanced-process-control-r3552/)
- [Fault Detection & Classification (FDC) - eInnoSys](https://www.einnosys.com/fault-detection-classification-fdc/)
- [From data to decisions: Unveiling wafer-level insights with zone-based analysis in Spotfire Data Science](https://www.spotfire.com/blog/2025/09/18/from-data-to-decisions-unveiling-wafer-level-insights-with-zone-based-analysis-in-spotfire-data-science/)
- [Your wafer tells you exactly where the process failed - Spotfire Blog](https://www.spotfire.com/blog/2026/02/24/your-wafer-tells-you-exactly-where-the-process-failed/)
- [Interactive Wafer Analysis with a Spotfire ActionMod - StatSoft Europe](https://www.statsoft.de/en/interactive-wafer-analysis/)
- [Wafermap Pattern Recognition - Spotfire Community](https://community.spotfire.com/articles/spotfire/wafermap-pattern-recognition/)
- [Spotfire for Semiconductors: Real-time Visual Data Science](https://www.spotfire.com/solutions/semiconductors)
- [From data chaos to clarity: How Spotfire harmonizes semiconductor data](https://www.spotfire.com/blog/2025/03/18/from-data-chaos-to-clarity-how-spotfire-harmonizes-semiconductor-data-for-actionable-insights/)
- [Western Electric rules - Wikipedia](https://en.wikipedia.org/wiki/Western_Electric_rules)
- [Nelson rules - Wikipedia](https://en.wikipedia.org/wiki/Nelson_rules)
- [Nelson Rules | Nelson Control Chart Rules - QI Macros](https://www.qimacros.com/control-chart/nelson-rules/)
- [Nelson Rules (and Western Electric Rules) for Control Charts - Quality Gurus](https://www.qualitygurus.com/nelson-rules-and-western-electric-rules-for-control-charts/)
- [Process Capability Statistics: Cpk vs. Ppk - Minitab Blog](https://blog.minitab.com/en/blog/process-capability-statistics-cpk-vs-ppk)
- [Ppk vs Cpk: Understand Process Capability with Clear Formulas and Examples](https://amrepinspect.com/blog/ppk-vs-cpk)
- [Cp Cpk Formulas vs Pp Ppk Formulas - QI Macros](https://www.qimacros.com/process-capability-analysis/cp-cpk-formula/)
- [Trellis Visualizations - TIBCO Docs](https://docs.tibco.com/pub/spotfire/6.5.3/doc/html/vis/vis_trellis_visualizations.htm)
- [How to Use the Box Plot - TIBCO Docs](https://docs.tibco.com/pub/spotfire/6.5.1/doc/html/box/box_how_to_use_the_box_plot.htm)
- [Marking in Visualizations - TIBCO Docs](https://docs.tibco.com/pub/spotfire/6.5.0/doc/html/vis/vis_marking_in_visualizations.htm)
- [How to perform "Filter To Marked Rows" using IronPython - Spotfire Community](https://community.spotfire.com/articles/spotfire/how-to-perform-filter-to-marked-rows-in-spotfire-using-ironpython-scripting/)
- [Drop down filters in TIBCO Spotfire - Dolphin Consulting](https://www.dolphinconsulting.cz/blog/2-ways-how-to-create-drop-down-filters-in-tibco-spotfire-r/)
- [PDF Solutions | Semiconductor Manufacturing Advanced Analytics](https://www.pdf.com/)
- [sk하이닉스 spotfire - 코멘토](https://comento.kr/job-questions/sk%ED%95%98%EC%9D%B4%EB%8B%89%EC%8A%A4/%EB%AA%A8%EB%93%A0%EC%A7%81%EB%AC%B4/sk%ED%95%98%EC%9D%B4%EB%8B%89%EC%8A%A4_spotfire-520669)
- [sk하이닉스 양산기술 spotfire활용 - 코멘토](https://comento.kr/job-questions/sk%ED%95%98%EC%9D%B4%EB%8B%89%EC%8A%A4/%EC%83%9D%EC%82%B0%EA%B8%B0%EC%88%A0/sk%ED%95%98%EC%9D%B4%EB%8B%89%EC%8A%A4_%EC%96%91%EC%82%B0%EA%B8%B0%EC%88%A0_spotfire%ED%99%9C%EC%9A%A9-621822)
- [“업무 현황과 지식을 공유하고...” 지식블로그 - SK hynix Newsroom](https://news.skhynix.co.kr/skhynix-knowledge-blog/)
- [반도체 취업 '성공 방정식' 변경…이론 대신 '데이터·공정실무' - 전자신문](https://www.etnews.com/20260223000263)
- [Spotfire를 활용한 반도체 공정/결함 상관관계 분석 - 내일도 렛유인](https://naeildo-letuinedu.com/Lecture/lecView?no=145)
- [반도체부터 임상까지, 산업별 Spotfire 실전 분석 교육 오픈 - 피앤디솔루션](https://pndsolution.com/blog/?bmode=view&idx=170506547)
