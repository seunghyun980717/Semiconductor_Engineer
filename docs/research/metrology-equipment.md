# 반도체 계측(Metrology) 장비 리서치

> 목적: 반도체 공정 학습 웹서비스의 계측 데이터 모듈(Spotfire 연동 포함) 설계 근거 자료. 각 계측 장비별 (1) 측정 원리 (2) 제조사/모델 (3) 핵심 스펙 (4) 출력 데이터의 형태(파라미터/단위/샘플링) (5) 어느 공정 뒤에 투입되는지를 정리하고, 마지막에 inline vs offline, 샘플링 전략, MES 데이터 흐름을 다룬다.

---

## 0. 전체 개요 — 계측(Metrology) vs 검사(Inspection)

반도체 팹에서 "계측(Metrology)"과 "검사(Inspection)"는 구분되는 개념이다.

- **계측(Metrology)**: CD, 막두께, 오버레이, 면저항 등 **연속값(continuous value)** 을 정량적으로 측정. 샘플링된 소수의 포인트/웨이퍼만 측정하고 SPC 관리도(control chart)에 올려 공정 drift를 감시. 예: CD-SEM, OCD, 오버레이 계측기, 엘립소미터, 4-point probe, XRF/XRR, 웨이퍼 형상 측정기.
- **검사(Inspection)**: 파티클, 스크래치, 패턴 결함 등 **이산적 결함(defect)의 존재/위치/개수**를 웨이퍼 전면(또는 다이 전수)에서 탐색. 예: 파티클 검사기(Surfscan, 29xx), 패턴 결함 검사기, e-beam 결함 검사기, SAT/X-ray(패키징).

두 영역 모두 넓은 의미의 "계측·검사(Metrology & Inspection, M&I)"로 묶여 팹의 수율 관리(Yield Management) 시스템에 데이터를 공급한다. 아래 (1)~(8)은 계측(1~4,6,7)과 검사(5,8)를 함께 다룬다.

---

## 1. CD-SEM (Critical Dimension SEM) — 전자빔 선폭 측정

### 측정 원리
- 전자총에서 나온 1차 전자빔(가속전압 낮게, 통상 **300 V~1 kV급 저가속** — 시료 대전/데미지를 줄이기 위함)을 전자렌즈로 수 nm급으로 좁혀 패턴 표면을 래스터 스캔.
- 전자빔이 패턴 에지(모서리)에 닿으면 **에지 효과(edge effect)** 로 2차전자(Secondary Electron, SE) 방출량이 급격히 증가 → 검출기가 SE 강도를 픽셀별로 기록해 **라인 프로파일(선강도 파형)** 생성.
- 이 SE 강도 파형에서 임계값(threshold) 알고리즘으로 에지 위치를 판정하고, 두 에지 사이의 픽셀 수 × 픽셀 당 실제 거리(calibration)로 선폭(CD)을 환산.
- 비접촉·비파괴 방식이며 광학 회절한계가 없어 nm급 해상도를 가지지만, **탑다운(top-down) 2차원 이미지**이므로 패턴의 3차원 단면 형상(측벽 각도, 라운딩)은 직접 알 수 없음 — 이 부분은 OCD/단면 SEM(파괴적)으로 보완.

### 제조사/모델
| 제조사 | 모델 | 비고 |
|---|---|---|
| Hitachi High-Tech | CG6300, CG5000(구형), CS4800(최신) | CG6300은 CG5000 풀체인지, 7nm 로직/10nm 양산 타깃. CS4800은 3D NAND/DRAM 심부 홀·트렌치 하부 측정 특화 |
| Applied Materials | Verity SEM 시리즈 | - |
| KLA | (구 eDR-7xxx 계열, e-beam 리뷰 겸용) | - |

### 핵심 스펙 (Hitachi CG6300 기준)
- 가속전압: 저에너지 모드(대전 억제)
- 측정 재현성(repeatability): 약 **1% 3σ**(측정 선폭 대비) — 예: 20nm 선폭이면 3σ ≈ 0.2nm 수준
- 스캔 속도: 전세대 대비 2배 향상 → 대전에 의한 화질 열화 감소, 엣지 콘트라스트 향상
- 웨이퍼 처리량(throughput): 스테이지 신설계로 WPH(Wafers Per Hour) 약 20% 향상
- 측정 대상: 라인/스페이스 CD, 홀/비아 직경, 3D NAND/DRAM 심부 트렌치·홀 **바닥부 CD**(deep trench/hole bottom CD), via-in-trench BEOL 구조

### 출력 데이터 형태
- **파라미터**: Top CD, Middle CD, Bottom CD(단위: nm), Line Edge Roughness(LER, nm 3σ), Line Width Roughness(LWR, nm 3σ), 홀 직경(Diameter, nm), 홀 진원도(circularity, %)
- **좌표**: 다이 내 특정 좌표(x,y, die 단위) × 웨이퍼 내 특정 사이트(site ID) × 웨이퍼 ID × 로트 ID 로 계층화된 다차원 테이블
- **샘플링**: 웨이퍼 1매당 통상 5~20개 site, 로트당 1~2매(모니터 웨이퍼) — 개발단계에서는 훨씬 조밀(수십~수백 지점)
- **부가 이미지**: 측정된 SEM 이미지 자체(그레이스케일 TIFF/PNG)도 함께 저장되어 리뷰 가능

### 공정 위치
주로 **포토(리소그래피) 노광·현상 직후(ADI, After Develop Inspection)** 와 **식각 직후(AEI, After Etch Inspection)** 두 지점에서 각각 측정하여 "리소 CD"와 "에치 바이어스(etch bias = AEI CD − ADI CD)"를 함께 관리. 즉 CD-SEM은 리소 트랙 라인에 인라인으로 연결되거나, 식각 장비 후단 스탠드얼론으로 배치.

---

## 2. OCD / Scatterometry — 광학적 패턴 프로파일 측정

### 측정 원리
- 웨이퍼 표면에 주기적으로 반복되는 미세 격자 패턴(회절격자, grating)에 넓은 대역의 편광된 빛(자외선~적외선)을 특정 입사각으로 조사.
- 패턴에서 반사·회절된 빛의 **스펙트럼 파형(반사율 R(λ) 또는 편광 상태 변화 Ψ, Δ)** 을 분광기로 측정.
- 이 스펙트럼은 패턴의 3차원 단면 형상(선폭, 높이, 측벽각도, 라운딩, 언더컷 등)에 따라 고유하게 달라지므로, **RCWA(Rigorous Coupled-Wave Analysis) 등 전자기 시뮬레이션으로 만든 라이브러리(library)** 또는 회귀 모델과 실측 스펙트럼을 매칭(regression/library matching)하여 형상 파라미터를 역산.
- 스폿 크기가 수십~수백 μm이므로 실제 제품 패턴이 아닌 **전용 OCD 타겟(스크라이브 라인 내 반복 격자)** 을 측정하는 경우가 많음.
- 비접촉·비파괴, 서브초(sub-second) 측정 — CD-SEM과 달리 **3차원 프로파일 전체**(top/middle/bottom CD, height, sidewall angle, sidewall roughness 등)를 한 번에 도출 가능한 것이 강점.

### 제조사/모델
| 제조사 | 모델 계열 |
|---|---|
| Nova (Nova Measuring Instruments, 현 Nova Ltd.) | Nova 시리즈 스캐터로메트리, Nova Prism(신형 OCD 플랫폼) |
| Onto Innovation | Iris, Atlas 시리즈(분광 엘립소미터 기반 OCD) |
| KLA | SpectraShape 시리즈 |

### 핵심 스펙
- 측정 기법: 분광반사법(SR, Spectral Reflectometry), 분광엘립소메트리(SE, Spectral Ellipsometry), Full Mueller matrix, dome scatterometry 등 조합
- 파장 대역: 자외선(~190nm)~근적외선(~2000nm대)까지 폭넓은 브로드밴드
- 스폿 크기: 통상 30~50μm급(전용 타겟 필요), 최신 세대는 더 축소
- 측정 시간: 서브초(sub-second)/타겟당
- 정밀도: sub-nm급 CD 정확도(모델 품질에 의존)

### 출력 데이터 형태
- **파라미터**: Top CD/Bottom CD/Middle CD(nm), Height(nm), Sidewall Angle(SWA, °), CD 균일성(CDU), 필름 두께(다층 스택인 경우 층별 두께 nm) — 하나의 측정에서 **모델 파라미터 벡터**(수개~수십개 항목)가 동시에 출력됨
- **원시 데이터**: 파장별 반사율/편광 스펙트럼(raw spectrum) — 라이브러리 매칭 잔차(goodness of fit, GOF)도 함께 기록되어 모델 신뢰도 판단에 사용
- **샘플링**: 웨이퍼당 스크라이브라인 내 OCD 타겟 수개~수십개 사이트, 로트당 1~2매(CD-SEM과 유사하거나 더 조밀 — 비파괴·고속이므로 CD-SEM보다 많은 지점을 커버 가능)

### 공정 위치
CD-SEM과 유사하게 **리소 현상 후(ADI)**, **식각 후(AEI)**, 그리고 **박막 증착 직후**(스택 두께 확인) 등 다목적으로 사용. 특히 3D NAND처럼 CD-SEM으로 접근 불가능한 심부 구조(고종횡비 채널홀 등)의 단면 프로파일을 비파괴로 추정하는 데 강점이 있어 FEOL 게이트 패터닝, STI, 3D NAND 채널홀 공정 등에 폭넓게 적용.

---

## 3. 오버레이 계측기 — 이미지 기반(IBO) vs 회절 기반(DBO)

오버레이(Overlay)란 현재 층의 패턴이 바로 아래(이전) 층 패턴과 얼마나 정렬되어 있는지를 나타내는 정합 오차(registration error)이며, X/Y 방향 벡터(nm)로 표현된다.

### 3-1. 이미지 기반 오버레이 (IBO, Image-Based Overlay) — KLA Archer
- **원리**: 스크라이브 라인에 상하 두 층에 각각 새겨진 박스형/바 형태 타겟(예: box-in-box)을 광학 현미경(밝은 필드)으로 촬영하고, 이미지 처리로 각 타겟의 중심 좌표를 계산 → 상/하 층 타겟 중심 간 벡터 차이 = 오버레이 오차(ΔX, ΔY).
- **모델**: Archer 200/300/500/800, irArcher 007(적외선 파장 대역 — 불투명 하드마스크/opaque 층 투과용)
- **스펙**: Archer 500은 전세대(Archer 300) 대비 정밀도(precision) 및 TMU(Total Measurement Uncertainty) 향상, MAM(Move-Acquire-Measure) 타임 단축으로 웨이퍼당 더 많은 지점 측정 가능. Archer 800은 파장 튜너블(wavelength-tunable) 광학계로 층별 최적 파장 선택, EUV 다중패터닝 레이어의 까다로운 오버레이(멀티레이어 타겟에서 여러 층간 조합을 하나의 이미지에서 동시 추출)까지 대응.
- **장점/한계**: 타겟이 비교적 크고(수십 μm) 직관적으로 이미지를 확인할 수 있어 타겟 비대칭(target asymmetry) 진단이 쉬움. 다만 광학 회절한계와 이미지 대비(contrast)에 성능이 좌우되어 초미세 패턴/저대비 스택에서는 신호 품질 저하 가능.

### 3-2. 회절 기반 오버레이 (DBO, Diffraction-Based Overlay) — ASML YieldStar
- **원리**: 상하 두 층에 격자(grating) 형태로 새겨진 타겟에 빛을 조사하고, **±1차 회절광의 세기 비대칭(intensity asymmetry)** 을 측정. 두 층이 완벽히 정렬되어 있으면 +1차와 -1차 회절광 세기가 같지만, 오버레이 오차가 있으면 비대칭이 발생 — 이 비대칭량을 오버레이 오차로 환산(스캐터로메트리와 유사한 원리를 오버레이에 적용).
- **모델**: ASML YieldStar 시리즈(YieldStar 500, YieldStar 1375F 등), μDBO(마이크로 DBO) 타겟은 4×4~5×5 μm급까지 축소 가능 — IBO 대비 타겟을 훨씬 작게 만들 수 있어 스크라이브 라인 면적을 절약.
- **스펙**: 14nm 이하 첨단 노드 타깃, 고속 측정으로 조밀 샘플링 가능 → Overlay Optimizer(APC 피드백) 및 패턴 충실도 제어(pattern fidelity control)와 연동.
- **장점/한계**: 타겟이 작고 측정 속도가 빨라 조밀 샘플링에 유리하며 리소 스캐너와 동일 회사(ASML) 제품이라 스캐너 피드백 루프 통합이 긴밀. 다만 회절 기반 신호 해석은 공정 유도 비대칭(process-induced asymmetry, 예: CMP로 인한 타겟 비대칭)에 민감해 별도 보정 알고리즘 필요.

### 출력 데이터 형태 (공통)
- **파라미터**: dX, dY(오버레이 오차, nm 단위) — 웨이퍼 좌표계 기준 각 사이트별 벡터
- **모델 피팅 결과**: 웨이퍼 전체 오버레이 분포를 6-파라미터/10-파라미터 등 다항식 모델(translation, rotation, scaling, higher-order 등)로 피팅한 계수 — 스캐너 보정값(overlay correction recipe)으로 역전송
- **샘플링**: 웨이퍼당 수십~수백 사이트(오버레이는 웨이퍼 내 위치별 편차가 크므로 CD보다 조밀하게 샘플링하는 경향), 로트당 1~수매

### 공정 위치
**리소그래피 노광·현상 직후(ADI)**. 오버레이가 스펙을 벗어나면 해당 로트는 **리워크(rework, 포토레지스트를 벗기고 재노광)** 대상이 되므로, 식각 전에 반드시 확인해야 하는 게이팅(gating) 계측 — 즉 In-line이지만 사실상 "식각 진행 여부를 결정하는 관문" 역할.

---

## 4. 엘립소미터 / 막두께 측정 — 편광 분석

### 측정 원리
- 편광된 빛(주로 선형 편광)을 시료 표면에 특정 입사각(보통 Brewster각 부근, 65~75° 등)으로 조사하고, 반사된 빛의 **편광 상태 변화**를 측정.
- 반사 전후 편광 상태 변화는 두 파라미터 **Ψ(진폭비, amplitude ratio)와 Δ(위상차, phase difference)** 로 표현되며, 이는 박막의 두께·굴절률(n)·소광계수(k)에 의해 결정됨.
- 여러 파장에서 Ψ, Δ를 측정하는 **분광 엘립소메트리(SE, Spectroscopic Ellipsometry)** 로 다층 박막 스택도 모델 피팅을 통해 각 층의 두께·조성을 동시에 역산 가능.
- 비접촉·비파괴, Å(옹스트롬) 단위의 초박막 감도.

### 제조사/모델
| 제조사 | 모델 | 비고 |
|---|---|---|
| KLA | Aleris 시리즈(8330, 8360, 8500 등), ASET F5x | Broadband SE(BBSE) 광학계 채택, 파장 하한을 190nm→150nm까지 확장해 조성 감도 향상 |
| Onto Innovation | Optical CD/필름 계측기(분광 엘립소메트리 기반) | OCD와 필름 두께 계측을 동일 플랫폼에서 결합하는 경우도 많음 |

### 핵심 스펙 (KLA Aleris 8360 기준 예시)
- 산화막 두께 300Å~1μm: 정확도 ±1%
- 125Å 미만 초박막: 정확도 ±1.5Å, 정밀도(precision) ≤0.3Å
- BBSE 정확도: <125Å 필름 ±1.5Å, 125~300Å ±1.0Å, 300Å~1.0μm ±0.3%
- 처리량: 기존 분석 기법 대비 3배 이상 향상, 비진공(non-vacuum) 광학 구조로 신뢰성 확보

### 출력 데이터 형태
- **파라미터**: 층별 두께(Thickness, Å 또는 nm), 굴절률 n(λ), 소광계수 k(λ), 필름 균일성(Uniformity, % 1σ), 조성비(예: SiON의 N 함량, %) — 다층 스택이면 층 수만큼의 두께값이 하나의 레코드에 배열로 출력
- **웨이퍼 맵**: 웨이퍼 내 수십~수백 포인트를 측정해 두께 분포를 컬러 등고선 맵(uniformity map)으로 시각화
- **샘플링**: 웨이퍼당 9~49포인트(맵핑용) 또는 목적에 따라 5점 요약(중심/상하좌우), 로트당 1~2매

### 공정 위치
**박막 증착(CVD/PVD/ALD) 직후**, **CMP(연마) 직후**(잔여 막두께 확인), **산화/질화 공정 직후**. 사실상 대부분의 필름 형성/제거 공정 뒤에 범용으로 삽입되는 가장 기본적인 인라인 계측.

---

## 5. 파티클 / 결함 검사기 — 웨이퍼 표면 결함 맵

### 5-1. Unpatterned 웨이퍼 검사 — KLA Surfscan (SP7 등)
- **원리**: 레이저(주로 266nm 심자외선 DUV)를 웨이퍼 표면에 조사하고, 파티클/스크래치/피트 등 결함에서 발생하는 **산란광(scattered light)** 을 다크필드(dark-field) 방식으로 검출. 결함이 없으면 정반사 성분만 남고 산란광이 거의 없으므로, 산란광 신호의 크기와 패턴으로 결함 유무·종류·대략적 크기를 판정.
- **모델**: Surfscan SP7, SP7XP(신형)
- **스펙**: SP7XP 감도 12.5nm(구형 SP2 계열은 19nm), 저노이즈 CCD 센서 탑재, sub-10nm 파티클 검출 가능. 베어(bare) 웨이퍼 및 각종 매끄러운/거친 필름 표면 모두 대응. 5nm 로직/첨단 메모리 노드용 웨이퍼·장비·소재 품질관리(QC)에 사용.
- **용도**: 웨이퍼 제조사의 베어 웨이퍼 품질 관리, 팹 내 공정 장비의 파티클 오염 모니터링(장비 챔버 청정도 확인용 모니터 웨이퍼)

### 5-2. Patterned 웨이퍼 검사 — KLA 29xx 시리즈(Broadband Plasma)
- **원리**: 레이저 펌핑 플라즈마 광원(PowerBroadband)에서 나오는 넓은 대역(자외선~가시광)의 빛을 패턴이 있는 웨이퍼에 조사하고, 다이-대-다이(die-to-die) 또는 셀-대-셀(cell-to-cell) 비교 알고리즘으로 정상 패턴과 다른 부분(결함)을 검출. 브로드밴드 광원은 다양한 재질/단차의 패턴에서 결함 대비를 높여줌.
- **모델**: 29xx 시리즈(2900 → 296x로 세대 발전), 관련 라인업으로 Puma(전자빔/e-beam 기반), eS800(레이저 스캐닝) 등
- **스펙**: 10nm급 결함 검출 가능(설계/공정 조직적 결함 발견에 특히 강점), 2세대 PowerBroadband 광원으로 전세대(2830) 대비 약 2배 광량 → 초기 공정층(ADI) 및 후공정(BEOL) 층에서 관심 결함(DOI, Defect of Interest) 포착률 향상. ADI 결함 커버리지가 AEI 수준에 근접.
- **용도**: R&D 단계 설계/공정 조직적 결함(systematic defect) 발굴, 양산 단계 크리티컬 레이어의 결함 급변(excursion) 조기 포착 — 업계 표준 "워크호스(workhorse)" 검사 장비로 10년 이상 세대 교체를 거듭.

### 출력 데이터 형태 (공통)
- **파라미터**: 결함 좌표(X, Y — 웨이퍼 좌표계 및 다이 내 좌표), 결함 크기(등가 원 지름 ESD, nm 또는 μm), 결함 클래스(particle/scratch/pit/COP/pattern defect 등 자동 분류 코드), 결함 개수(Adder — 이전 층 대비 신규 발생 결함 수)
- **결함 맵(Wafer Defect Map)**: 웨이퍼 전면 좌표에 결함 위치를 점으로 표시한 산점도(scatter map) — 랜덤 분포/링(ring) 패턴/스크래치 라인/클러스터 등 공간 시그니처(spatial signature)로 근본원인(장비/공정) 추정
- **샘플링**: 파티클/패턴결함 검사는 원칙적으로 **웨이퍼 전면 스캔(풀 웨이퍼)** 이 기본이며, 로트 내에서는 몇 매만 검사(모니터 웨이퍼 방식) — CD/오버레이처럼 "웨이퍼 내 포인트 샘플링"이 아니라 "로트 내 웨이퍼 샘플링"이 주된 전략
- **후속 리뷰**: 검출된 결함 좌표는 SEM 리뷰 장비(e.g. KLA eDR, Applied REVIEW)로 자동 전달(defect map file)되어 고배율 이미지 재확인 및 최종 분류(ADC, Automatic Defect Classification) 수행

### 공정 위치
- Surfscan(unpatterned): 베어 웨이퍼 입고 검사, 세정/CMP/증착 등 각 공정 장비의 **챔버 파티클 모니터링용 모니터 웨이퍼**(제품 웨이퍼 아닌 더미 웨이퍼를 주기적으로 흘려 장비 상태 확인)
- 29xx(patterned): 리소 현상 후(ADI), 식각 후(AEI), CMP 후 등 **거의 모든 크리티컬 레이어 공정 직후**에 삽입되어 결함 급변 여부를 감시

---

## 6. 4-Point Probe (면저항) / XRF·XRR (막 조성)

### 6-1. 4-Point Probe — 면저항(Sheet Resistance) 측정
- **원리**: 일렬로 배치된 4개의 탐침(probe) 중 바깥쪽 2개로 정전류(I)를 흘리고 안쪽 2개로 전압(V)을 측정하는 **4단자(four-terminal sensing)** 방식. 탐침-시료 간 접촉저항이 전압 측정 경로에 실리지 않으므로 순수한 시료 저항만 측정 가능.
- 얇은 박막(두께 t가 탐침 간격보다 훨씬 작은 경우) 근사식을 적용하면 **면저항 Rs = (V/I) × (π/ln2) ≈ 4.532 × (V/I)** [단위: Ω/□ (옴 퍼 스퀘어)] 로 환산 — 면저항은 두께에 무관한 "정사각형당 저항" 개념이라 박막 두께와 별도로 비교 가능.
- 탐침 간격이 클수록 더 깊은 영역까지 측정(두꺼운 시료용), 간격이 작을수록 박막/미세패턴에 적합.
- 표준: SEMI MF84 (In-line 4점 탐침을 이용한 실리콘 웨이퍼 저항률 측정법)

### 6-2. XRF (X-ray Fluorescence) — 막 조성/두께
- **원리**: X선을 시료에 조사하면 원자가 여기(excitation)되어 각 원소 고유의 **형광 X선(characteristic X-ray)** 을 재방출. 이 형광 X선의 에너지로 원소 종류를, 강도로 함유량(농도)·두께를 정량화.
- 100nm 이하 얇은 유전체/금속막의 두께 및 조성(예: 합금막의 성분비) 측정에 사용, 비파괴.

### 6-3. XRR (X-ray Reflectometry) — 다층막 두께/밀도/거칠기
- **원리**: X선을 매우 낮은 입사각(grazing incidence)으로 조사하고 반사 X선의 각도별 간섭 패턴(진동 프린지)을 분석. 프린지 주기는 막두께에, 프린지의 감쇠 정도는 계면/표면 거칠기에, 임계각(critical angle)은 막 밀도에 대응.
- 단일/다층 박막의 **두께·밀도·거칠기**를 비파괴로 동시에 도출 — 광학 엘립소메트리가 어려운 금속막이나 초박막에서도 적용 가능.
- HRXRD(고분해능 X선 회절)와 결합하면 에피택셜(epitaxial) 층의 조성·격자 변형(strain)도 추가로 분석 가능.

### 출력 데이터 형태
- **4-Point Probe**: 면저항 Rs(Ω/□), 웨이퍼 맵(중심-エッジ 균일성 %), 로트/웨이퍼/포인트별 시계열
- **XRF**: 원소별 함량(atomic % 또는 wt%), 막두께(Å/nm)
- **XRR**: 층별 두께(Å), 밀도(g/cm³), 계면 거칠기(Å RMS)
- **샘플링**: 4-Point Probe는 웨이퍼당 5~49점(그리드 패턴)이 일반적이며 통상 로트당 1~2매; XRF/XRR은 오프라인 분석 성격이 강해 로트당 1매, 웨이퍼당 소수 지점(1~5점)에 그치는 경우가 많음

### 공정 위치
- 4-Point Probe: **이온주입 후 활성화 어닐(RTA) 직후**(도판트 활성화 확인), **금속 배선/실리사이드 형성 후**(배선 저항 확인)
- XRF: **금속 증착 후**(박막 두께/조성), **이온주입 후**(도즈량 간접 확인용으로도 활용되는 경우 있음)
- XRR: **박막 증착 후**(특히 게이트 스택, 배리어/시드층 등 다층 금속/유전체 스택의 두께 검증), R&D 단계 공정개발에서 주로 활용되고 양산 라인에서는 정기 모니터링 성격

---

## 7. 웨이퍼 형상 측정 — KLA WaferSight (Bow/Warp/TTV)

### 측정 원리
- 웨이퍼를 **비접촉으로 지지(에지 3점 그립 또는 유사 방식)** 한 상태에서, 정전용량 센서 또는 간섭계(interferometry) 방식의 센서 쌍이 웨이퍼의 **앞면과 뒷면을 동시에 스캔**하여 각 지점의 표면 높이(고도)를 측정.
- 앞면/뒷면 높이 데이터로부터 다음을 계산:
  - **TTV(Total Thickness Variation)**: 웨이퍼 내 최대 두께 − 최소 두께
  - **Bow**: 웨이퍼를 지지대 없이 뒀을 때 중심축을 기준으로 한 대칭적 휨량(구형 성분)
  - **Warp**: 웨이퍼 표면 전체의 비대칭적 뒤틀림량(고차 성분 포함, 최고점-최저점 편차)
  - 이 외 **나노토포그래피(nanotopography)**, **에지 롤오프(Edge Roll-Off)**, **면내변위(In-plane Displacement)**, **응력 유발 국소곡률(stress-induced local curvature)** 등도 동일 플랫폼에서 산출
- 패턴이 있는 웨이퍼(patterned wafer)에서도 측정 가능하도록 확장된 모델(PWG5 등)은 층 적층에 따른 웨이퍼 뒤틀림(특히 3D NAND 다층 스택, 웨이퍼 본딩 공정)을 감시하는 데 사용.

### 제조사/모델
- KLA WaferSight 플랫폼, 최신 patterned 웨이퍼 대응 모델 PWG5(Patterned Wafer Geometry 5세대)

### 핵심 스펙
- Warp 측정 다이나믹 레인지: 최대 약 1000μm까지 대응(업계 최고 수준으로 소개됨) — 3D NAND처럼 다층 적층으로 인해 웨이퍼가 크게 휘는 경우까지 커버
- 적용 대상: ≥96단 3D NAND, ≤1x nm 로직/DRAM 노드
- 단일 측정으로 warp/bow, 두께 및 평탄도 변이, 전후면 나노토포그래피, 에지 롤오프까지 동시 산출

### 출력 데이터 형태
- **파라미터**: Bow(μm), Warp(μm), TTV(μm), 국소 두께 편차(Site Flatness, μm), 나노토포그래피(nm, 특정 공간주파수 대역), 에지 롤오프(μm, 에지 근접 수mm 구간)
- **맵 형태**: 웨이퍼 전면을 격자로 샘플링한 3D 높이 맵(지형도, topography map) — 등고선/컬러맵으로 표현
- **샘플링**: 웨이퍼 전면(수천~수만 포인트의 조밀 그리드)을 스캔하는 것이 원칙이나, 로트 내에서는 소수 매(1~2매)만 측정하는 모니터링 방식

### 공정 위치
- **베어 웨이퍼 입고 검사**(웨이퍼 제조사 출하 품질), **에피택시(Epi) 성장 후**, **CMP 후**(응력에 의한 웨이퍼 휨), **웨이퍼 본딩/적층 공정 후**(3D NAND, 웨이퍼-투-웨이퍼 하이브리드 본딩) — 후속 리소 공정의 초점심도(DOF)·오버레이 정합에 직접 영향을 주므로 리소 전 단계에서 웨이퍼 형상이 스펙 안에 있는지 게이팅 계측으로 활용되기도 함.

---

## 8. SAT / X-ray — 패키징·HBM용 보이드/범프 검사

### 8-1. SAT (Scanning Acoustic Tomography, 초음파 주사 현미경)
- **원리**: 고주파 초음파(수십~수백 MHz)를 트랜스듀서에서 발생시켜 시료(패키지) 내부로 투과·반사시키고, 반사파의 도달시간(time-of-flight)과 강도를 분석. 서로 다른 재질의 경계면(interface)에서 음향 임피던스 차이에 따라 반사가 일어나며, 특히 **공극(air gap, void, delamination)** 에서는 음파가 거의 전량 반사되어 매우 강한 신호를 냄 — 육안/광학/X-ray로는 보기 힘든 **계면 박리(delamination)** 검출에 특히 강함.
- 초음파를 깊이별로 스캔(C-scan/B-scan)하면 패키지 내부의 층별 단면 이미지를 재구성 가능.
- 비파괴, 다만 매질(물 등 커플런트)을 통한 접촉/침지식 스캔이 필요해 X-ray보다 스캔 속도는 느린 편.

### 8-2. X-ray 검사 (2D/3D CT)
- **원리**: X선을 패키지에 투과시켜 재질별 X선 흡수량 차이(밀도·원자번호에 비례)로 내부 구조를 투과 이미지화. 범프(솔더볼)·와이어본드·비아(TSV) 등 금속 구조물은 X선을 많이 흡수해 밝게(또는 어둡게, 표현방식에 따라) 나타나며, 그 안의 **보이드(void)** 는 흡수가 적어 대비(contrast)로 검출.
- 2D 투과 촬영뿐 아니라 여러 각도에서 촬영한 이미지를 재구성하는 **3D CT(Computed Tomography)** 방식은 범프/TSV 내부의 미세 보이드, 언더필(underfill) 충전 불량, 마이크로범프 접합 불량 등을 입체적으로 검출.
- HBM(High Bandwidth Memory)처럼 다이를 TSV로 다층 적층한 패키지는 내부 범프 수가 수천~수만 개에 달해, 고해상도·고속 3D X-ray CT 시스템이 범프 단위 결함(보이드, 접합 불량, 브릿지) 검출에 사용됨. 국내 장비사(예: 테크밸리 등)가 삼성전자·SK하이닉스에 HBM용 X-ray/CT 검사장비를 공급하는 사례가 보고됨.

### 8-3. SAT vs X-ray 비교
| 구분 | SAT(초음파) | X-ray |
|---|---|---|
| 강점 | 계면 박리(delamination), 공극(voids), 크랙 검출에 최강 — 실리콘 웨이퍼 내부 박리처럼 X-ray로 잡기 힘든 결함도 검출 | 금속 범프/배선의 형상, 브릿지, 미세 보이드의 위치·부피 정량화에 강함 |
| 한계 | 커플런트(물) 필요, 스캔 속도 상대적으로 느림, 고주파일수록 침투깊이 감소 | 저밀도 재질 간 미세한 박리는 대비가 약해 검출 어려움 |
| 용도 | 패키지 레벨 배치(batch) 신뢰성 검사(습기/열충격 시험 후 등), 웨이퍼 본딩 계면 검사 | HBM/2.5D·3D 패키지의 범프·TSV 내부 결함 인라인/오프라인 검사 |

### 출력 데이터 형태
- **SAT**: C-scan 단면 이미지(그레이스케일, 반사강도 맵), 결함(박리/보이드) 면적(mm² 또는 %), 결함 위치 좌표
- **X-ray/CT**: 2D 투과 이미지 또는 3D 복원 볼륨 데이터, 범프별 보이드 체적(%), 범프 좌표별 양/불량 판정(pass/fail), 범프 높이/공유(coplanarity) 편차(μm)
- **샘플링**: 패키징 공정은 웨이퍼 단위보다 **패키지(스트립/유닛) 단위 샘플링**이 일반적 — 신뢰성 시험(온습도 스트레스) 후 배치 샘플 검사, 또는 HBM처럼 전수 검사(100% inspection)에 가깝게 강화되는 추세

### 공정 위치
**웨이퍼 본딩(TSV 접합) 후**, **범프/솔더 리플로우 후**, **몰딩(EMC 봉지) 후**, **신뢰성 시험(온도사이클, 습도) 후** — 즉 전공정(FEOL/BEOL)이 아닌 **후공정(패키징/OSAT)** 단계 전용 계측·검사.

---

## 9. Inline 계측 vs Offline 분석

| 구분 | Inline 계측 | Offline 분석 |
|---|---|---|
| 위치 | 공정 장비 바로 옆/후단에 통합되거나 반송 라인상에 배치되어 로봇이 자동으로 웨이퍼를 반입 | 별도 분석실(Lab)로 웨이퍼를 이동시켜 사람이 개입해 측정 |
| 속도/처리량 | 빠름(초~분 단위), 팹 자동반송시스템(AMHS/OHT)과 연동되어 로트 흐름을 막지 않도록 설계 | 느림(수십분~시간), 파괴적 분석(단면 SEM, TEM 등)을 포함하는 경우 많음 |
| 대표 장비 | CD-SEM, OCD, 오버레이 계측기, 엘립소미터, 4-Point Probe(인라인형), 파티클 검사기 | 단면 SEM/TEM(파괴적 단면 관찰), SIMS(2차이온질량분석, 도판트 프로파일), XPS(표면 조성분석), 일부 XRF/XRR |
| 목적 | 실시간/준실시간 SPC 관리도 업데이트, R2R(Run-to-Run) 제어 피드백, 이상 발생 시 즉각 로트 홀드(hold) | 근본원인 분석(root cause analysis), 신모델 검증, 인라인 계측값의 정확도 교정(reference/golden data 제공) |
| 데이터 신뢰성 | 비파괴 간접 측정(모델 기반)이라 절대값 오차 가능 — 주기적으로 offline 파괴분석과 상관(correlation) 검증 필요 | 직접 관찰이라 "참값(ground truth)"에 가까움 — 하지만 표본 파괴되고 시간이 오래 걸려 전수/고빈도 적용 불가 |

CD-SEM·OCD·오버레이·엘립소미터·파티클 검사기는 대부분 **인라인(공정 장비와 같은 반송 루프에 통합, 또는 스탠드얼론이지만 매 로트 자동 흐름)** 이며, 단면 TEM/SIMS/XPS 등 파괴적·정밀 분석은 **오프라인(별도 랩, 특정 이슈 발생 시 또는 정기 캘리브레이션 시에만 샘플 채취)** 으로 운영된다.

---

## 10. 계측 샘플링 전략

계측 자원(장비 대수, 처리시간)은 유한하므로 "무엇을, 얼마나 자주, 어디를" 측정할지가 팹 운영의 핵심 트레이드오프다.

### 10-1. 샘플링 계층 구조
계측 샘플링은 통상 4단계 계층으로 정의된다.
1. **로트(Lot) 레벨**: 전체 로트(통상 25매/로트) 중 몇 개 로트를 측정할지 — 매 로트(100%) / 격 로트(every other lot) / 스킵 로트(skip-lot, 예: 5로트당 1로트)
2. **웨이퍼(Wafer) 레벨**: 선택된 로트 내에서 몇 매의 웨이퍼를 측정할지 — 통상 **1~2매**(모니터 웨이퍼, 대표성 있는 위치의 웨이퍼를 선정: 카세트 상/중/하단 등), CD/오버레이 등 크리티컬 공정은 **로트당 6매 내외**까지 늘리기도 함
3. **다이(Die) 레벨**: 선택된 웨이퍼 내에서 몇 개의 다이(또는 필드)를 측정할지 — 통상 **5~20개 다이**
4. **포인트(Point) 레벨**: 다이(또는 필드) 내에서 몇 개의 세부 지점을 측정할지 — 다이 하나당 **10~100개 포인트**(주로 스크라이브 라인 내 계측 전용 타겟)

예를 들어 오버레이는 웨이퍼 내 위치별 편차가 커서 조밀 샘플링(웨이퍼당 수십~수백 사이트)이 필요한 반면, 안정된 박막 두께는 웨이퍼당 9~49점 정도로도 충분한 경우가 많다.

### 10-2. 검사(Inspection)의 샘플링은 다르다
파티클/패턴 결함 검사는 "웨이퍼 내 포인트 샘플링"이 아니라 **웨이퍼 전면 100% 스캔이 기본**이고, 대신 **로트 내에서 검사할 웨이퍼 매수를 줄이는 방식**(예: 로트당 1~2매만 전수 스캔)으로 처리량을 관리한다.

### 10-3. 정적 샘플링 vs 동적 샘플링(Dynamic Sampling)
- **정적 샘플링(static sampling)**: 오프라인에서 한 번 최적화된 고정 샘플링 계획을 양산 내내 그대로 적용 — 단순하고 예측 가능하나 공정 변화에 둔감.
- **동적 샘플링(dynamic sampling)**: 최근 계측 결과(공정 안정성, SPC 관리도 이탈 이력)에 따라 실시간으로 샘플링 밀도를 조절 — 예: 공정이 안정적이면 샘플링을 줄이고(스킵 로트 비율 확대), 이상 징후 감지 시 자동으로 전수/조밀 측정으로 전환(rule-based sampling). 최신 오버레이 제어에서는 이런 동적 샘플링이 표준으로 자리잡는 추세.
- 목적함수는 대개 "계측 장비 가동률(처리량) 최소 소모"와 "공정 이상 조기 탐지(정보 획득량 극대화)"의 균형점을 찾는 최적화 문제로 다뤄진다.

---

## 11. 계측 데이터 → MES 흐름

### 11-1. 통신 프로토콜 계층
반도체 장비-호스트 간 통신은 업계 표준 **SECS/GEM**(SEMI Equipment Communications Standard / Generic Equipment Model)을 기반으로 한다.
- 계측 장비는 GEM 인터페이스를 통해 **CEID(Collection Event ID, 이벤트 발생 시점)**, **SVID(Status Variable ID, 실시간 상태값)**, **ECID(Equipment Constant ID, 장비 설정값)** 등을 표준화된 메시지로 MES에 보고.
- 계측값 자체는 통상 **PP(Process Program)/데이터 리포트 이벤트**에 담겨 전송되며, MES는 이를 로트ID·웨이퍼ID·공정단계(Process Step)·레시피명·타임스탬프와 매핑해 저장.

### 11-2. 전형적 데이터 흐름
1. **계측 장비**가 웨이퍼를 측정 → 원시 계측값(예: CD, 오버레이 dX/dY, 두께) + 웨이퍼맵 + 메타데이터(로트ID, 슬롯번호, 레시피, 타임스탬프) 생성
2. **EDA(Equipment Data Acquisition)/SECS-GEM 드라이버**가 장비 내부 데이터를 표준 이벤트로 변환해 상위 시스템에 전송
3. **MES**가 이 데이터를 로트 이력(genealogy)에 결합 — 하나의 웨이퍼가 거치는 1,000~1,500개 공정단계 전체에 걸쳐 계측값들이 축적되어 웨이퍼 단위 완전한 이력 추적(traceability) 가능
4. **SPC 시스템**이 계측값을 실시간 관리도(control chart, X-bar/R, EWMA 등)에 반영 — UCL/LCL(관리상한/하한) 이탈 시 알람 발생, 필요시 로트 자동 홀드
5. **APC(Advanced Process Control)/R2R(Run-to-Run) 시스템**이 계측값을 다음 로트(또는 동일 웨이퍼의 다음 공정)의 레시피 파라미터 보정에 피드백 — 예: 오버레이 오차 → 스캐너 보정값(scanner correction recipe) 업데이트, 막두께 편차 → 다음 로트 증착 시간 보정
6. **가상계측(Virtual Metrology, VM)**: 계측 데이터와 공정 장비 센서 데이터(FDC, Fault Detection & Classification 트레이스)를 머신러닝으로 상관분석해, 실측 없이도 예측값을 추정 — 계측 리소스가 부족한 웨이퍼/로트에 대한 보완 수단으로 활용
7. **수율관리시스템(YMS)/데이터레이크**로 장기 축적되어 상관분석(예: 계측값과 최종 테스트 수율의 상관), 통계적 근본원인분석(root cause), 나아가 팹 전체 공정능력지수(Cp/Cpk) 산출에 활용

### 11-3. 요약 파이프라인
```
계측 장비(CD-SEM/OCD/오버레이/엘립소미터/파티클검사기 등)
   → SECS/GEM(CEID/SVID/ECID) → EDA
   → MES(로트/웨이퍼 이력 결합, genealogy)
   → SPC(관리도, UCL/LCL 알람) ─┬→ APC/R2R(레시피 보정, 폐루프 제어)
                                 ├→ FDC/가상계측(VM) 상관분석
                                 └→ YMS/데이터레이크(수율 상관, Cp/Cpk, 장기 트렌드)
```

---

## 참고 자료 (Sources)

- [Hitachi High-Tech: CD-SEM 개요](https://www.hitachi-hightech.com/global/en/knowledge/semiconductor/room/manufacturing/cd-sem.html)
- [Hitachi High-Tech: CG6300 제품 페이지](https://hitachi-hightech.com/global/en/products/semiconductor-manufacturing/cd-sem/metrology-solution/semi-cg6300.html)
- [Hitachi High-Tech: CG6300 발표 보도자료](https://www.hitachi-hightech.com/file/global/pdf/about/news/2015/nr20150714.pdf)
- [Hitachi High-Tech: CS4800 제품 페이지](https://www.hitachi-hightech.com/us/en/products/semiconductor-manufacturing/cd-sem/metrology-solution/semi-cs4800.html)
- [Nanowerk: CD-SEM 용어 설명](https://www.nanowerk.com/nanotechnology-glossary/critical-dimension-scanning-electron-microscopy-CD-SEM.php)
- [Nova: Optical Scatterometry](https://www.novami.com/nova-technology/optical-scatterometry/)
- [Onto Innovation: OCD with Spectroscopic Ellipsometry](https://ontoinnovation.com/resources/optical-critical-dimension-metrology-with-spectroscopic-ellipsometry/)
- [Onto Innovation: OCD for Semiconductor Manufacturing](https://ontoinnovation.com/resources/optical-critical-dimension-metrology-for-semiconductor-manufacturing/)
- [KLA IR: Archer 500 보도자료](https://ir.kla.com/news-events/press-releases/detail/204/kla-tencor-announces-new-archer-500-overlay-metrology)
- [KLA: Archer 800 제품 브로셔](https://www.kla.com/wp-content/uploads/Archer_800_Rev1.4_May_16_2025_DIGITAL.pdf)
- [KLA: irArcher 007 브로셔](https://www.kla.com/documents/products/brochures/irArcher_Brochure.pdf)
- [ASML: YieldStar 1375F](https://www.asml.com/en/products/metrology-and-inspection-systems/yieldstar-1375f)
- [ASML: YieldStar 500](https://www.asml.com/en/products/metrology-and-inspection-systems/yieldstar-500)
- [ASML: Measuring accuracy - Lithography principles](https://www.asml.com/en/technology/lithography-principles/measuring-accuracy)
- [SPIE: ASML YieldStar μDBO 타겟 성능](https://www.spiedigitallibrary.org/conference-proceedings-of-spie/8681/86811F/Performance-of-ASML-YieldStar-%C2%B5DBO-overlay-targets-for-advanced-lithography/10.1117/12.2011406.short)
- [KLA IR: Aleris 8500 보도자료](https://ir.kla.com/news-events/press-releases/detail/351/kla-tencors-new-aleris-8500-film-metrology-system-is)
- [KLA: Thin-Film Thickness Measurement 제품군](https://www.kla.com/products/instruments/thin-film-reflectometers)
- [KLA: Surfscan SP7XP 혁신 페이지](https://www.kla.com/advance/innovation/surfscan-sp7xp-detecting-defects-drives-pristine-processes)
- [KLA IR: 2900 시리즈/Puma/eS800 보도자료](https://ir.kla.com/news-events/press-releases/detail/222/kla-tencor-announces-new-flagship-wafer-inspection-solution)
- [KLA: Defect Inspection & Review 제품군](https://www.kla.com/products/chip-manufacturing/defect-inspection-review)
- [Four-Point-Probes.com](https://four-point-probes.com/)
- [Tektronix: 4200A-SCS 저항률 측정 애플리케이션 노트](https://www.tek.com/en/documents/application-note/resistivity-measurements-semiconductor-materials-using-4200a-scs-parameter)
- [Rigaku: Coatings and thin films (XRR)](https://rigaku.com/resources/techniques/coatings-and-thin-films)
- [Bruker: Film Thickness Determination](https://www.bruker.com/en/applications/academia-materials-science/thin-films-and-coatings/film-thickness-determination.html)
- [Semiconductor Today: k-Space XRF 박막 계측 툴](https://www.semiconductor-today.com/news_items/2023/jan/kspace-170123.shtml)
- [KLA: PWG5 혁신 페이지](https://www.kla.com/advance/innovation/pwg5-the-complete-wafer-geometry-system-for-ic-fabs)
- [KLA: PWG5 제품 브로셔](https://www.kla.com/documents/products/brochures/KLA-PWG5-Product-Brochure.pdf)
- [PTC: Scanning Acoustic Tomography 설명](https://www.ptc-stress.com/What-Is-Scanning-Acoustic-Tomography-id40164765.html)
- [Infinita Lab: SAT vs SAM 비교](https://infinitalab.com/blog/acoustic-micro-imaging-sam-sat/)
- [The Elec: 테크밸리 HBM 검사장비 삼성/SK하이닉스 공급](https://www.thelec.net/news/articleView.html?idxno=6518)
- [SemiEngineering: X-ray Inspection in the Semiconductor Industry](https://semiengineering.com/x-ray-inspection-in-the-semiconductor-industry/)
- [SemiEngineering: Inspecting Unpatterned Wafers](https://semiengineering.com/inspecting-unpatterned-wafers/)
- [ITRS 2.0 2015 Edition: Metrology](https://www.semiconductors.org/wp-content/uploads/2018/06/2_2015-ITRS-2.0-Metrology.pdf)
- [SemiEngineering: How Overlay Keeps Pace With EUV Patterning](https://semiengineering.com/how-overlay-keeps-pace-with-euv-patterning/)
- [SPIE: Overlay control improvements through dynamic sampling](https://www.spiedigitallibrary.org/conference-proceedings-of-spie/12955/1295527/Overlay-control-improvements-through-dynamic-sampling/10.1117/12.3009830.short)
- [einnosys: MES SECS/GEM Integration](https://www.einnosys.com/mes-secs-gem-integration-semiconductor-fabs/)
- [cimetrix: High-Level Overview of Equipment Communication](https://www.cimetrix.com/blog/high-level-overview-of-equipment-communication-during-semiconductor-fabrication)
- [MST-SG: SECS/GEM Protocol Complete Guide](https://mst-sg.com/the-complete-guide-to-secs-gem-protocol-for-semiconductor-equipment/)
