# 반도체 8대 공정 – 전공정(Front-End Process) 심층 리서치

> 작성일: 2026-07-06
> 범위: 웨이퍼 제조 → 산화 → 포토리소그래피 → 식각 → 증착/이온주입 → 금속배선(전공정 6단계)
> 관점: 일반 로직/파운드리 공정 + SK하이닉스 DRAM(1a/1b nm) 특화 관점 포함

---

## 목차
1. [웨이퍼 제조 (잉곳 성장·슬라이싱·폴리싱)](#1-웨이퍼-제조)
2. [산화 (Oxidation)](#2-산화-oxidation)
3. [포토리소그래피 (Photolithography)](#3-포토리소그래피-photolithography)
4. [식각 (Etching)](#4-식각-etching)
5. [증착(CVD/PVD/ALD)과 이온주입](#5-증착cvdpvdald과-이온주입)
6. [금속배선 (스퍼터링·다마신·CMP)](#6-금속배선-metallization)
7. [DRAM(SK하이닉스 1a/1b nm) 공정 관점 종합](#7-dram-sk하이닉스-1a1b-nm-공정-관점-종합)
8. [참고 출처](#8-참고-출처)

---

## 1. 웨이퍼 제조

웨이퍼 제조는 반도체 8대 공정 중 가장 앞단에 위치하며, 크게 **잉곳(Ingot) 성장 → 슬라이싱(Slicing) → 랩핑/그라인딩 → 식각 → 폴리싱(Polishing) → 세정/검사**의 순서로 진행된다. 이 단계는 팹(Fab) 자체보다는 SK실트론, 신에츠화학(Shin-Etsu), SUMCO, 글로벌웨이퍼스(GlobalWafers), 실트로닉(Siltronic) 같은 전문 웨이퍼 제조사에서 수행되며, 팹은 이렇게 만들어진 베어 웨이퍼(bare wafer)를 구매해 전공정을 시작한다.

### 1.1 원리

- **잉곳 성장(Crystal Growth)**: 초고순도(11N, 99.999999999%) 다결정 실리콘(polysilicon)을 석영 도가니(quartz crucible)에 장입하고 흑연 히터로 약 1,420°C(실리콘 융점) 이상으로 가열해 완전히 용융시킨다. 여기에 원하는 결정 방향을 가진 씨드(seed) 결정을 담근 후, 씨드를 서서히 회전·인상(pulling)시키면서 단결정 실리콘 잉곳을 성장시킨다. 이 방법이 **초크랄스키(Czochralski, CZ)법**이며 상업용 실리콘의 85% 이상이 이 방식으로 생산된다. 도펀트(B, P 등)를 용융액에 첨가해 저항률(resistivity)과 전도형(n형/p형)을 결정한다.
  - 도가니 회전 방향과 반대로 씨드를 회전시켜 용융액의 온도·불순물 분포를 균일화한다.
  - 잉곳의 직경 제어는 인상 속도(pulling rate)와 온도 구배로 정밀 제어한다(300mm 웨이퍼용 잉곳은 직경 약 300mm, 길이는 1~2m 이상).
  - 고순도가 요구되는 첨단 로직/메모리용은 무결함(defect-free) 영역 확보를 위해 V/G비(성장속도/온도구배)를 정밀 제어하는 **결함공학(defect engineering)**이 핵심이다.
- **슬라이싱(Slicing)**: 성장된 원통형 잉곳을 다이아몬드 와이어 톱(wire saw, 또는 과거의 ID saw)으로 얇게 절단해 개별 웨이퍼로 만든다. 절단 시 웨이퍼 두께 편차, 휨(bow/warp), 톱 자국(saw mark)을 최소화하는 것이 핵심이다.
- **랩핑(Lapping)/그라인딩(Grinding)**: 슬라이싱 직후 표면의 톱 자국과 손상층을 제거하고 두께 균일도를 확보한다. 이후 에지 프로파일링(edge rounding)으로 웨이퍼 가장자리를 매끄럽게 다듬어 후속 공정 중 파티클 발생과 깨짐을 방지한다.
- **에칭(Etching, 웨이퍼 단계)**: 산 또는 알칼리 습식 식각으로 랩핑 시 생긴 표면 미세 손상층(subsurface damage)을 제거한다.
- **폴리싱(Polishing)**: 화학기계연마(CMP와 유사한 원리)로 웨이퍼 표면을 원자 단위로 평탄화한다. 1차 폴리싱(stock removal)과 2차 미러 폴리싱(mirror/final polishing)으로 나뉘며, 최종적으로 나노미터 이하의 표면 거칠기(surface roughness, Ra < 0.1nm 수준)를 달성한다.
- **에피택셜(Epitaxial) 성장(옵션)**: 첨단 로직/일부 메모리용 웨이퍼는 폴리싱된 베어 웨이퍼 위에 CVD 방식으로 균일한 단결정 실리콘 박막(epi layer)을 추가 성장시켜 결함 밀도를 낮추고 특성을 제어한다.

### 1.2 사용 장비 (제조사·장비명)

| 공정 단계 | 대표 장비/기술 | 주요 업체 |
|---|---|---|
| 잉곳 성장 | CZ 풀러(Puller), MCZ(자기장 인가 CZ, Magnetic CZ) | SK실트론, 신에츠화학, SUMCO, GlobalWafers, Siltronic |
| 슬라이싱 | 다이아몬드 와이어 쏘(Wire Saw) | Meyer Burger(옛 NTC), Applied Materials(전신 ADE 계열) |
| 랩핑/그라인딩 | 양면 그라인더(Double-Side Grinder) | Okamoto, DISCO |
| 습식 식각 | 배치/스핀 에처(산/알칼리조) | 자체 라인(웨이퍼 업체 내재화) |
| 폴리싱 | CMP형 폴리셔(Single/Double-side Polisher) | Okamoto, Ebara, Applied Materials |
| 에피택셜 | Epi 리액터(CVD 챔버) | Applied Materials(Centura Epi), ASM International(Epsilon 시리즈) |
| 검사/계측 | 표면 파티클/결함 검사기, 두께·저항률 측정기 | KLA(Candela, Surfscan), Fischer, Bruker |

### 1.3 핵심 공정 파라미터

- **잉곳 성장 온도**: 실리콘 융점(1,414~1,420°C) 부근, 도가니 내 용융액 온도 구배 정밀 제어(±0.1°C 수준)
- **인상 속도(Pull rate)**: 0.3~1.0 mm/min 수준(직경·결함제어 목표에 따라 상이)
- **웨이퍼 직경**: 200mm, 300mm(주력), 차세대 450mm 논의(현재 상용화 안 됨)
- **두께**: 300mm 웨이퍼 기준 약 775±25 μm(SEMI 표준)
- **TTV(Total Thickness Variation)**: 서브 μm 수준 관리
- **표면 거칠기(Ra)**: 폴리싱 후 0.1nm 이하
- **저항률(Resistivity)**: 도펀트 농도에 따라 수 mΩ·cm ~ 수십 Ω·cm
- **산소/탄소 농도**: 격자산소(Oi), 탄소(Cs) 함량이 소자 신뢰성·게터링(gettering) 특성에 영향

### 1.4 주요 측정 지표

- TTV, 국부 두께 편차(SFQR, LTV)
- 나노토포그래피(Nanotopography)
- 표면 파티클 카운트(surface particle count, 나노미터급 결함 검출)
- 저항률/도펀트 농도 분포
- 결정 결함(COP: Crystal Originated Particle, 슬립 전위 등)
- Bow/Warp(휨)

### 1.5 DRAM 관점

DRAM은 로직 대비 상대적으로 완화된 웨이퍼 스펙을 쓰는 경우도 있었으나, 1a/1b nm급 초미세 DRAM에서는 CMP 평탄도와 나노토포그래피 요구가 로직 수준에 근접하고 있다. 특히 HBM(고대역폭메모리)용 웨이퍼는 TSV(관통전극) 공정과 극박 웨이퍼 그라인딩·핸들링을 위해 특수 폴리시드 웨이퍼(specialty polished wafer) 수요가 급증하고 있으며, 이는 최근 공급망 병목으로 지목되고 있다.

---

## 2. 산화 (Oxidation)

### 2.1 원리

산화 공정은 웨이퍼(실리콘) 표면을 산소 또는 수증기와 반응시켜 이산화규소(SiO₂) 박막을 성장시키는 공정이다. 기본 반응은 "Si + O₂(또는 H₂O) → SiO₂"이며, 생성된 SiO₂는 화학적으로 안정하고 절연성이 우수해 (1) 트랜지스터 게이트 절연막, (2) 소자 간 절연(STI 라이너 등), (3) 후속 공정에서의 마스킹/보호막으로 활용된다. 실리콘 자체를 소모하며 성장하기 때문에(Deal-Grove 모델), 결정 방향(<100>, <110>)에 따라 성장 속도가 다르다.

**세 가지 방식**
- **건식 산화(Dry Oxidation)**: 고순도 O₂ 가스를 고온(약 800~1,200°C)에서 직접 공급. 반응 부산물이 없고 치밀하고 균일한 막질을 얻을 수 있어 **게이트 산화막**처럼 신뢰성이 중요한 박막에 사용. 성장 속도는 느림.
- **습식 산화(Wet Oxidation)**: H₂와 O₂를 연소시켜 생성한 고온 수증기(H₂O)를 공급. 반응식은 Si + 2H₂O → SiO₂ + 2H₂. 성장 속도가 빠르지만 막의 치밀도·균일성이 건식 대비 낮아 STI, 필드 산화막 등 두꺼운 막이 필요한 영역에 주로 사용.
- **라디칼 산화(Radical/ISSG, In-Situ Steam Generation)**: O₂와 H₂를 고온에서 직접 반응시켜 반응성이 높은 산소 라디칼을 생성, 결정 방향에 무관하게 균일한 두께의 고품질 막을 형성. 3차원 구조(핀펫, 트렌치 등)에서도 우수한 컨포멀리티를 제공하며 질화규소 표면에도 반응 가능.

산화로는 배치(batch) 방식으로 웨이퍼 수십 장을 동시에 로딩해 처리하며, 웨이퍼 보트(boat) 양 끝단의 반응속도 편차를 보정하기 위해 더미 웨이퍼(dummy wafer)를 배치한다.

### 2.2 사용 장비

- **횡형/종형 확산로(Horizontal/Vertical Furnace, Batch Furnace)**: Tokyo Electron(TEL) - Alpha-8 시리즈, Thermalis; Kokusai Electric(구 히타치 국제전기) - 종형 확산로 다수; ASM International - A400/A412 시리즈(수직형 배치로)
- **RTO(Rapid Thermal Oxidation, 단파장 매엽식)**: Applied Materials - Centura RTP(Radiance/Vantage 시리즈), Mattson Technology, ASM International - Levitor
- **ISSG(라디칼 산화) 챔버**: Applied Materials Centura ISSG

### 2.3 핵심 공정 파라미터

- **온도**: 건식 800~1,150°C, 습식 900~1,150°C, RTO는 초단시간(수십초) 고온(~1,000~1,100°C) 스파이크
- **압력**: 상압(atmospheric, ~1atm) 또는 감압(수십~수백 Torr, 균일도 향상 목적)
- **가스 유량비(O₂:H₂ 등)**: 습식/라디칼 산화 시 정밀 제어 필요
- **목표 두께**: 게이트 산화막(첨단 로직) 1~수 nm급, STI/필드 산화막 수백 nm급
- **성장 시간**: 목표 두께·온도에 따라 수 분~수십 분

### 2.4 주요 측정 지표

- 산화막 두께 및 웨이퍼 내 균일도(WIW uniformity)
- 굴절률(Refractive Index, ellipsometry로 막질/치밀도 간접 평가)
- 계면 상태 밀도(Interface trap density, Dit) — 게이트 산화막 신뢰성 지표
- 절연파괴전압(Breakdown Voltage), 누설전류(Leakage current)
- 파티클/결함 카운트

### 2.5 DRAM 관점

DRAM에서 산화 공정은 트랜지스터(셀 트랜지스터·주변회로 트랜지스터) 게이트 산화막 형성뿐 아니라, STI(Shallow Trench Isolation) 라이너 산화, 열산화 기반 계면 처리 등에 활용된다. 미세화가 진행될수록 순수 열산화막보다 ALD/CVD 기반 고유전율(high-k) 유전막과의 조합(계면층으로서 얇은 SiO₂ 유지)이 중요해지고 있다.

---

## 3. 포토리소그래피 (Photolithography)

### 3.1 원리

포토 공정은 포토마스크(레티클)에 그려진 회로 패턴을 빛(광원)을 통해 웨이퍼 위 감광액(포토레지스트, PR)에 전사하는 공정으로, 반도체 미세 패턴 형성의 핵심이다. 크게 **PR 도포 → 노광(Exposure) → PEB(노광 후 베이크) → 현상(Develop)**의 순서로 진행된다.

- **PR 도포(Coating)**: 웨이퍼를 고속 회전(스핀 코팅)시키며 액체 포토레지스트를 도포해 균일한 박막을 형성한다. 노광 파장의 반사를 억제하는 BARC(Bottom Anti-Reflective Coating)를 PR 하부에, 필요시 top coat(EUV 레지스트의 아웃개싱 방지 등)를 상부에 추가하는 다층 구조가 일반적이다. PR은 빛을 받은 부분이 제거되는 포지티브(Positive)형과, 빛을 받지 않은 부분이 제거되는 네거티브(Negative)형으로 구분된다.
- **노광(Exposure)**: 스캐너/스테퍼 장비가 포토마스크 패턴을 웨이퍼 위에 축소 투영(통상 4:1)해 PR을 감광시킨다.
  - **ArF 액침(ArF Immersion, 193nm)**: 불화아르곤(ArF) 엑시머 레이저(193nm) 사용. 렌즈와 웨이퍼 사이를 순수(water)로 채워 굴절률을 높임으로써 개구수(NA)를 1.0 이상으로 확장, 해상도를 개선(액침 리소그래피). 최신 ArFi 스캐너는 NA 1.35까지 구현(ASML TWINSCAN NXT:2050i/2100i).
  - **EUV(Extreme Ultraviolet, 13.5nm)**: 파장을 193nm 대비 약 1/14로 줄여 훨씬 미세한 패턴 형성이 가능. 진공 환경에서 반사굴절 광학계(다층 반사경)를 사용하며, 주석(Sn) 플라즈마로 EUV광을 생성한다. Low-NA EUV(NA 0.33)에 이어 **High-NA EUV(NA 0.55)**가 최신 세대로, 해상도(resolution) 8nm 수준, 기존 NXE 대비 선폭 1.7배 미세화, 집적도 2.9배 향상을 구현.
  - **해상도 공식**: d = k1·λ/NA (λ: 파장, NA: 개구수, k1: 공정상수). 파장을 줄이거나 NA를 높이면 해상도가 향상된다.
- **PEB(Post Exposure Bake)**: 웨이퍼를 가열해 노광으로 발생한 화학반응(화학증폭형 레지스트, CAR의 산 확산 반응)을 촉진·완결시킨다.
- **현상(Develop)**: 현상액(TMAH 등)을 도포해 노광부(포지티브형 기준)를 선택적으로 용해·제거하고, 이후 린스(순수 세정)로 마무리한다.

### 3.2 사용 장비

| 공정 | 장비/제품군 | 제조사 |
|---|---|---|
| 노광(EUV) | TWINSCAN NXE 시리즈(Low-NA), TWINSCAN EXE:5000/5200B(High-NA, NA 0.55) | ASML(네덜란드, 사실상 독점 공급) |
| 노광(ArF 액침) | TWINSCAN NXT:1980i/2000i/2050i/2100i(NA 1.35, ~295 wph) | ASML |
| 노광(ArF Dry/KrF) | TWINSCAN XT 시리즈 등 구세대 | ASML, Nikon, Canon |
| 트랙(Coater/Developer) | CLEAN TRACK LITHIUS Pro/Pro-i, ACT8/ACT12, NS300, Mark8 | Tokyo Electron(TEL, 코터/디벨로퍼 시장 90%+ 점유) |
| 감광액(레지스트) | EUV/ArF CAR 레지스트 | JSR, 도쿄오카공업(TOK), 신에츠화학, 스미토모화학(일본 4社가 EUV 레지스트 95%+ 점유), 국내 동진쎄미켐(EUV 레지스트 개발) |
| 오버레이/CD 계측 | Archer 시리즈(오버레이), VeritySEM(CD-SEM), SpectraShape(OCD) | KLA, Applied Materials |

### 3.3 핵심 공정 파라미터

- **파장(λ)**: ArF 193nm, EUV 13.5nm
- **개구수(NA)**: ArF 액침 최대 1.35, Low-NA EUV 0.33, High-NA EUV 0.55
- **처리량(Throughput)**: 최신 ArF 스캐너 약 295 wph(wafers per hour), EUV는 상대적으로 낮음
- **CD(Critical Dimension, 임계치수)**: 노드에 따라 수 nm~수십 nm 수준으로 정밀 관리
- **오버레이(Overlay)**: 최첨단 공정에서 3nm 이하(3σ) 수준까지 요구되며, 이는 미세공정 수율의 주요 결정 요인
- **PR 두께**: EUV 레지스트는 10~20nm급 초박막, ArF 레지스트는 이보다 두꺼움
- **장비 가격**: 최신 스캐너 대당 1,000억 원 이상(설비투자 중 리소 비중이 산화 공정 대비 약 12배)

### 3.4 주요 측정 지표

- **CD(선폭) 균일도**: CD-SEM(예: KLA/AMAT VeritySEM)으로 측정
- **Overlay(정렬 오차)**: 전 레이어 정렬마크 대비 현재 레이어의 위치 어긋남을 이미지 기반 계측기(KLA Archer)로 측정
- **PR 프로파일(측벽 각도, footing/notching 여부)**: SEM 단면 분석
- **결함(defect) 검사**: 패턴 결함, 이물(particle) 검사
- **포커스/도즈(Focus-Exposure) 마진**: FEM(Focus Exposure Matrix)을 통한 공정 윈도우 확보

### 3.5 DRAM 관점 (SK하이닉스 1a/1b nm)

- SK하이닉스는 2021년 세계 최초로 EUV를 적용한 **4세대 10나노급(1a) DRAM**을 양산했다(LPDDR4 모바일 D램, 8Gb). 1a는 이전 세대(1z) 대비 웨이퍼 1장당 생산량이 약 25% 증가했고, LPDDR4 최고 속도(4266Mbps)를 구현하면서 전력 소비를 약 20% 절감했다.
- 경쟁사(마이크론)는 5세대(1b)에 이르러서야 EUV를 도입한 반면, SK하이닉스는 더 이른 세대부터 EUV를 선제 도입해 미세화 리더십을 확보했다.
- SK하이닉스는 이천 M16 팹에 메모리 업계 최초로 **High-NA EUV 장비(ASML TWINSCAN EXE:5200B)**를 반입, 2025년 양산 라인에 투입을 추진 중이다. 이 장비는 기존 EUV 대비 40% 향상된 광학계(NA 0.55)로 1.7배 정밀한 회로 형성과 2.9배 높은 집적도를 목표로 하며, 대당 소비전력이 약 1.4MW에 달할 만큼 대형 설비다.
- DRAM 셀 구조 관점에서 현재 주력은 **6F2 셀(워드라인 방향 3F × 비트라인 방향 2F)**이며, 차세대 초미세화를 위한 **4F2 셀(2F×2F)** 구조가 논의되고 있다. 4F2로 전환 시 셀 면적을 이론상 33% 축소할 수 있어 EUV/High-NA EUV 기반 정밀 패터닝이 필수적이다.
- 미세화로 인한 오버레이 마진 축소는 DRAM 커패시터·비트라인·워드라인 등 다층 정렬 정확도에 직접적 영향을 미치므로, 계측(오버레이/CD) 투자와 광학계 성능이 곧 수율 경쟁력으로 직결된다.

---

## 4. 식각 (Etching)

### 4.1 원리

식각은 포토 공정으로 형성된 PR 패턴을 마스크 삼아, 그 아래의 박막(산화막, 질화막, 폴리실리콘, 금속 등)을 선택적으로 제거해 실제 회로 구조를 만드는 공정이다.

**핵심 특성**
- **선택비(Selectivity)**: 제거 대상 물질만 선택적으로 깎아내는 능력. 완전한 선택은 불가능하며 PR도 일부 소모(마스크 손실)된다.
- **방향성**: 등방성(Isotropic, 모든 방향으로 동일하게 진행) vs 비등방성(Anisotropic, 수직 방향 위주로 진행). 미세 패턴 구현에는 비등방성이 필수.
- **식각 속도(Etch Rate)**: 속도와 정밀도(선택비·프로파일 제어)는 트레이드오프 관계.
- **균일도**: 챔버 내 가스 흐름·플라즈마 밀도 편차로 인한 웨이퍼 위치별/로트 간 편차 관리가 중요.

**습식 식각(Wet Etch)**: 액체 화학약품에 웨이퍼를 담가(또는 스핀 분사) 식각. 속도가 빠르고 특정 물질에 대한 선택비가 높지만, 근본적으로 등방성이라 미세 패턴(수십 nm급) 형성에는 부적합해 세정·전면 식각·특정 후공정에 국한 사용.

**건식 식각(Dry/Plasma Etch)**: 반응성 가스를 플라즈마 상태로 여기시켜 화학적/물리적으로 식각. 현대 미세 공정의 표준.
- **화학적 식각(Chemical)**: 반응성 라디칼이 대상 물질과 화학반응 → 휘발성 부산물 생성·제거. 선택비가 높지만 등방성 경향.
- **물리적 식각(Physical, 스퍼터링)**: 고에너지 이온이 물리적으로 표면 원자를 때려 제거. 비등방성이지만 선택비가 낮음.
- **RIE(Reactive Ion Etching, 반응성 이온 식각)**: 화학적 방식과 물리적 방식을 결합한 현대 식각의 핵심 원리. 혼합 가스를 플라즈마화하고, 전기장으로 양이온을 수직 가속시켜 표면에 충돌(물리적으로 결합 약화) → 라디칼이 약화된 부위를 화학적으로 신속히 식각. 이를 통해 **높은 선택비 + 비등방성**을 동시에 달성.

**식각 가스 선택 예시**
- 실리콘(Si) 제거: 불소(F) 계열 가스. 부산물 SiF₄의 기화점이 -90.3°C로 매우 낮아 신속히 휘발.
- 이산화규소(SiO₂) 제거: 탄소-불소(CF, C4F8 등) 복합 가스. Si-O 결합이 강해 더 높은 반응 에너지 필요, 탄소의 발열반응 활용.
- 금속(구리 등) 제거: 염소(Cl)/불소 계열이 필요하나, 구리 부산물의 기화점이 1,000°C 이상으로 매우 높아 건식 식각이 사실상 불가능 → **다마신(Damascene) 공정**이 대안으로 개발됨.
- 첨가 가스(O₂, N₂, H₂, Ar, Ne 등)로 선택비·프로파일·측벽 보호(passivation) 특성을 조절.

### 4.2 사용 장비

| 구분 | 장비/플랫폼 | 제조사 |
|---|---|---|
| 유전체(Dielectric) 식각 | Flex 시리즈(소용량 confined 플라즈마, RF 펄싱) | Lam Research |
| 도전체(Conductor, 폴리실리콘/게이트) 식각 | Kiyo 시리즈(TCP 대칭 챔버, 플라즈마 펄싱) | Lam Research |
| 금속(Metal) 식각 | Versys Metal L/M/N 시리즈(BEOL 패터닝, CD·프로파일·선택비 제어) | Lam Research |
| 극저온(Cryogenic) 식각 | Lam Cryo 3.0 (NAND 채널홀 식각, CD 변동 <0.1%) | Lam Research |
| 산화막 식각(HARC 등) | Telius SCCM Jin 등 | Tokyo Electron(TEL) |
| ICP(유도결합플라즈마) 식각기 | 다양한 라인업(핀/나노시트 보호를 위한 이온에너지·밀도 독립제어) | Lam Research, TEL, AMAT |
| 인공지능 기반 실시간 공정제어 | Sense.i 플랫폼(ML 기반 바이어스 실시간 보정, 컨택홀 수율 약 3%p 개선) | Lam Research |

### 4.3 핵심 공정 파라미터

- **압력**: 수 mTorr ~ 수백 mTorr(챔버·공정별 상이)
- **RF 파워/바이어스**: 소스 파워(플라즈마 밀도 제어)와 바이어스 파워(이온 에너지 제어) 분리 제어(ICP 방식)
- **가스 조합 및 유량**: CF4, C4F8, Cl2, HBr, O2, Ar, Ne 등
- **온도**: 상온~극저온(cryo, 영하 수십~백 도)까지 다양 — 극저온 식각은 채널홀 등 초고종횡비(HAR) 구조에서 측벽 보호막 특성 개선에 사용
- **종횡비(Aspect Ratio)**: DRAM 홀 식각에서 약 50:1 수준까지 요구
- **CD 변동**: 첨단 식각 공정에서 0.1% 이내 관리 목표

### 4.4 주요 측정 지표

- CD(임계치수) 및 CD 균일도(웨이퍼 내/웨이퍼 간)
- 프로파일 각도(수직도), 보잉(bowing) 여부 — 상부-하부 CD 차이
- 종횡비 및 상/하부 지름 일관성(특히 DRAM 커패시터 홀, NAND 채널홀)
- 선택비(마스크 대비 대상막의 식각 속도 비)
- 잔류물(residue), 표면 손상(damage) 검사

### 4.5 DRAM 관점 (HARC 식각)

DRAM의 셀 커패시터는 제한된 셀 면적에서 최대한 큰 정전용량을 확보하기 위해 실린더형(cylindrical) 등 3차원 구조로 매우 깊고 좁은 홀을 뚫는 **HARC(High Aspect Ratio Contact) 식각**을 필요로 한다. 종횡비가 약 50:1에 달하는 초고종횡비 홀에서 수직 프로파일과 상하부 CD 일관성을 확보하는 것이 핵심 과제이며, 상부 측벽이 침식되는 보잉(bowed) 프로파일이 대표적 난제다. Lam Research의 극저온 식각(Cryo 3.0) 기술은 원래 NAND 채널홀 식각을 위해 개발되었으나 DRAM의 초고종횡비 구조 식각에도 응용되는 추세이며, CD 변동을 0.1% 이내로 관리하는 것이 목표다. SK하이닉스를 포함한 DRAM 제조사들은 미세화가 진행될수록 셀 높이가 높아지고 종횡비가 커지는 추세에 대응하기 위해 식각 장비사와 긴밀히 공정을 공동 개발하고 있다.

---

## 5. 증착(CVD/PVD/ALD)과 이온주입

### 5.1 증착(Deposition) 원리

증착은 웨이퍼 표면에 새로운 박막을 추가하는 공정으로, 소자 간 절연막(STI, IMD), 금속 배선, 게이트 유전막 등 다양한 목적의 박막을 형성한다. 미세화가 진행되며 열산화만으로 구현 불가능한 다양한 재료·구조의 박막 요구가 커지면서 증착 공정의 중요성이 급격히 증가했다.

| 방식 | 원리 | 장점 | 단점 | 주 용도 |
|---|---|---|---|---|
| **CVD(Chemical Vapor Deposition)** | 기체 반응물(전구체+반응가스)이 웨이퍼 표면/기상에서 화학반응해 고체 박막 생성 | 증착 속도 빠름, 스텝 커버리지 양호 | 불순물 혼입 가능성 | 하드마스크, 절연막(STI/IMD), 폴리실리콘 |
| **PVD(Physical Vapor Deposition, 스퍼터링/증발)** | 타겟(target)에 이온을 충돌시켜 물리적으로 원자를 방출, 웨이퍼 표면에 응축 | 높은 순도, 순수 금속/합금 증착 용이 | 단차 피복(step coverage) 낮음 | 금속 배선, 배리어/시드층 |
| **ALD(Atomic Layer Deposition)** | 전구체 흡착(self-limiting) → 퍼지 → 반응가스 주입·반응 → 퍼지의 사이클을 반복해 원자층 단위로 증착 | 탁월한 균일도·스텝 커버리지(컨포멀리티), 원자 단위 두께 제어 | 처리 속도 느림 | 고종횡비 구조(DRAM 커패시터), 하이-k 게이트 유전막, 배리어층 |

**핵심 트레이드오프**
- 압력: 낮을수록 입자의 평균자유행로가 길어져 직진성(지향성)이 향상, 높을수록 증착 속도 증가
- 온도: 높을수록 막질 순도·치밀도 향상되지만, 하부 금속층 열화(합금화, 전위 이동) 위험 증가
- 재료 선택 시 열팽창계수(CTE) 불일치(예: Al은 SiO₂ 대비 CTE가 약 40배↑) 및 일렉트로마이그레이션(EM, 금속 배선 내 전자 충돌에 의한 원자 이동) 문제 고려 필요 → 배선 재료가 알루미늄에서 구리, 나아가 코발트·루테늄 등으로 진화하는 배경.

### 5.2 이온주입(Ion Implantation) 원리

이온주입은 붕소(B), 인(P), 비소(As) 등 도펀트 이온을 고전압으로 가속시켜 웨이퍼 내부에 정밀하게 주입, 특정 영역(소스/드레인, 웰(well) 등)의 전도형과 저항을 제어하는 공정이다.

- **공정 순서**: 이온원에서 양이온 생성 → 질량분석기로 원하는 이온 종만 선별(질량 분리) → 가속관에서 고전압으로 가속(빔 형성) → 웨이퍼에 주입 → 활성화 어닐링(Activation Annealing)
- **도즈(Dose)**: 빔 전류 크기로 제어, 단위면적당 주입 이온 개수를 결정(예: 소스/드레인 형성 시 약 10¹⁹ /cm³ 수준의 불순물 농도, 이는 실리콘 원자 농도 10²²/cm³의 약 1/1000)
- **에너지(Energy)**: 가속 전압으로 제어, 이온이 실리콘 내부로 침투하는 깊이(투사 비정, projected range)를 결정
- **채널링(Channeling)**: 단결정 실리콘의 규칙적인 원자 배열 틈새를 따라 이온이 예상보다 훨씬 깊이 침투하는 현상. 도핑 균일도를 해치므로, 웨이퍼를 7~8° 정도 기울여(tilt) 주입함으로써 채널링을 억제한다.
- **활성화 어닐링(Activation Annealing)**: 이온주입으로 손상된 실리콘 결정 구조를 열처리로 복구하고, 주입된 도펀트 원자가 실리콘 격자 자리에 치환되어 전기적으로 활성화(캐리어로 기능)되도록 하는 후속 열공정. RTA(Rapid Thermal Annealing), 스파이크 어닐, 밀리초/레이저 어닐(초첨단 공정에서 열예산 최소화 목적) 등이 사용된다.

### 5.3 사용 장비

**CVD**
- Applied Materials: Producer 시리즈(PECVD), Centura(CENTURA HDP-CVD, CENTURA ULTIMA HDP-CVD 등)
- ASM International: Epsilon(에피), Intrepid(배치 LPCVD)

**PVD**
- Applied Materials: Endura 플랫폼(구리 배선/Co막/W플러그 등 모듈형 지원), Endura iFILL Al CVD/PVD

**ALD**
- ASM International: Pulsar(하이-k 게이트 유전막 ALD의 업계 표준 벤치마크 장비), Eagle XP8(PEALD, 고생산성 300mm), Synergis, EmerALD, A412(300mm 배치 수직로)
- Applied Materials: Centura iSprint W ALD/CVD

**이온주입기**
- Axcelis Technologies: Purion 플랫폼(Purion M/H/XE 등, medium/high-current/high-energy 전 라인업 커버, 2keV~1MeV 에너지 범위)
- Applied Materials: 이온주입 4개 라인업 — 고전류(high-current, 저에너지·고도즈), 중전류(medium-current), 고에너지(high-energy, 최대 MeV급 딥 임플란트), 플라즈마 도핑(plasma doping, 초고도즈용)

### 5.4 핵심 공정 파라미터

**증착**
- 온도: 공정별 상온~800°C 이상까지 다양(ALD는 통상 200~350°C 저온 공정이 강점)
- 압력: mTorr~수백 Torr
- 스텝 커버리지: 1에 가까울수록 이상적(상단/하단 두께 비)
- 두께 균일도: 첨단 노드 금속 게이트 증착에서 편차 0.1nm 미만 요구 사례 존재(AMAT Endura, 3nm 노드 기준)
- 갭필(Gap-fill) 능력: 보이드(void) 없는 충진 여부

**이온주입**
- 도즈: 10¹¹~10¹⁶ ions/cm² 범위(용도별 상이, 매우 높은 도즈는 plasma doping 영역)
- 에너지: 저에너지 수 keV(초박막 접합) ~ 고에너지 수백 keV~MeV(딥 웰 형성)
- 틸트각: 통상 7°(채널링 억제)
- 빔전류: 중전류 10μA~2mA, 고전류 최대 약 30mA

### 5.5 주요 측정 지표

- 박막 두께 및 웨이퍼 내/웨이퍼 간 균일도(분광타원계, ellipsometry / 반사율계)
- 스텝 커버리지, 갭필 단면 SEM/TEM 분석
- 막 응력(Stress), 굴절률, 조성(XPS, RBS 등)
- 이온주입: 시트저항(Sheet Resistance, 4-point probe), SIMS(Secondary Ion Mass Spectrometry)를 통한 도펀트 깊이 프로파일, 도즈 균일도

### 5.6 DRAM 관점

DRAM 셀 커패시터는 제한된 面적에서 최대 정전용량을 확보해야 하므로, 유전막으로 고유전율(high-k) 물질(ZrO2, HfO2 등)을 **ALD**로 초고종횡비 실린더 구조 내부에 원자층 단위로 균일하게 증착하는 것이 핵심 기술이다. ALD는 컨포멀리티가 가장 우수한 증착 방식이기 때문에 DRAM 커패시터, 로직의 하이-k 게이트 유전막 형성에 필수적으로 쓰인다. 이온주입 공정은 DRAM의 셀 트랜지스터 및 주변회로(peri) 트랜지스터의 소스/드레인, 웰 형성에 사용되며, 미세화가 진행될수록 접합 깊이(junction depth)를 얕게 유지하면서도 저저항을 확보해야 하는 난제가 커지고 있다.

---

## 6. 금속배선 (Metallization)

### 6.1 원리

금속배선은 웨이퍼 위에 만들어진 수십억 개의 트랜지스터·커패시터 등 개별 소자를 전기적으로 연결해 실제 회로로 완성시키는 공정으로, 전공정의 마지막 단계(이후 후공정으로 이어짐)에 해당한다. "소자에 생명을 불어넣는" 단계로 비유된다.

**주요 단계**
1. **컨택(Contact) 형성**: 트랜지스터 소스/드레인/게이트와 최하단 금속배선을 연결하는 컨택 플러그를 형성. 텅스텐(W)은 우수한 갭필(gap-fill) 특성 때문에 컨택 플러그 재료로 널리 사용되며, 계면 저항을 낮추기 위해 티타늄(Ti), 코발트(Co), 탄탈륨(Ta) 등 배리어 메탈을 함께 증착한다.
2. **금속 배선(라인/비아) 형성**:
   - **알루미늄(Al) 배선(과거 주류)**: PVD로 Al을 전면 증착한 후 포토+식각으로 배선 패턴을 형성(Subtractive/식각 공정 순서 - 증착 후 식각).
   - **구리(Cu) 배선(현재 주류)**: 구리는 알루미늄 대비 저저항·고신뢰성이지만 건식 식각 부산물의 기화점이 매우 높아(1,000°C 이상) 기존 방식으로 패터닝이 불가능하다. 이를 해결하기 위해 **다마신(Damascene) 공정**이 개발되었다 — 유전체(층간절연막)를 먼저 증착하고, 포토+식각으로 배선이 들어갈 트렌치/비아를 먼저 파낸 뒤, 그 홈에 구리를 채우고(전기도금, ECP: Electrochemical Plating), 불필요한 부분을 CMP로 제거·평탄화하는 순서로 진행된다.
   - **듀얼 다마신(Dual Damascene)**: 비아(via, 층간 연결)와 배선(line, 층내 연결) 패턴을 한 번의 구리 충진과 CMP로 동시에 형성해 공정 단계를 줄이는 방식으로, 현재 구리 배선의 표준 공법이다.
3. **스퍼터링(Sputtering, PVD)**: 다마신 공정에서 구리를 전기도금하기 전, 트렌치/비아 표면에 구리가 잘 부착되도록 얇은 구리 시드층(seed layer)과, 구리가 절연막으로 확산하는 것을 막는 배리어층(Ta/TaN 등)을 PVD로 증착한다. 스퍼터링만으로 트렌치 내부를 채우면 단차 피복이 불량해 공동(void)이 생기기 쉬워, 시드층 형성 후 전기도금으로 갭필을 완성하는 방식이 표준이다.
4. **CMP(Chemical Mechanical Planarization, 화학기계연마)**: 웨이퍼 표면에 회전하는 연마 패드와 슬러리(연마입자+화학성분)를 접촉시켜 화학적 연화와 기계적 연마를 동시에 진행, 과잉 증착된 구리·텅스텐 등 금속 및 절연막을 평탄화한다. 절연막(oxide) 평탄화에는 실리카(SiO2)나 세리아(CeO2) 슬러리를, 금속(Cu, Al, W) 평탄화에는 금속용 슬러리(산화제로 표면을 연화시킨 뒤 실리카 입자로 기계적 연마)를 사용한다. 다층 배선 구조에서 각 층마다 증착→CMP를 반복하며 회로를 쌓아 올린다.

### 6.2 사용 장비

| 공정 | 장비/플랫폼 | 제조사 |
|---|---|---|
| PVD(배리어/시드) | Endura 플랫폼(Cu 배리어/시드, Co, Ru 등) | Applied Materials |
| 전기도금(ECP) | Raider, Sabre 3D(구리 전기도금) | Applied Materials, (역사적으로 Novellus의 Sabre 계열, 現 Lam Research 산하) |
| CMP | Mirra, Reflexion(Cu/W/Oxide CMP) | Applied Materials(CMP 시장 점유율 60~70%) |
| CMP | F-REX 시리즈 | Ebara(에바라, CMP 시장 점유율 20~30%) |
| CMP(국내) | 각종 CMP 장비·슬러리 | 케이씨텍(KCTech) |
| CVD(배리어/캡핑막) | Producer, Endura 계열 | Applied Materials |

### 6.3 핵심 공정 파라미터

- **배선 재료 진화**: Al → Cu(현재 주류) → Co/Ru(첨단 노드 국소 배선, 저저항·EM 저항성 개선 목적)
- **비저항(Resistivity)**: Cu 약 1.7μΩ·cm(벌크), 미세화로 배선 폭이 줄면 표면산란·입계산란으로 유효 비저항 급격히 증가(사이즈 효과)
- **일렉트로마이그레이션(EM) 내성**: 배선 내 전류밀도 증가에 따른 금속원자 이동 → 단선/신뢰성 저하 방지가 핵심 설계 지표
- **CMP 균일도(WIWNU, Within-Wafer Non-Uniformity)**: 대구경 웨이퍼에서 2% 수준까지 저감이 업계 목표로 언급됨(예: 인텔 사례)
- **슬러리 선택비**: 금속(Cu/W) vs 배리어(Ta/TaN) vs 절연막 간 연마 속도 비 정밀 제어 필요(디싱(dishing), 이로전(erosion) 방지)
- **시드층/배리어 두께**: 수 nm 이하 초박막(첨단 노드일수록 배선 단면적에서 배리어가 차지하는 비중이 커져 실질 구리 단면 감소 → 저항 증가 문제 심화)

### 6.4 주요 측정 지표

- 배선 두께/저항(4-point probe, 시트저항)
- CMP 후 디싱/이로전(dishing/erosion) — 프로파일로미터, AFM
- 표면 결함/스크래치(광학/전자현미경 검사)
- 갭필 단면 보이드(void) 검사(TEM/FIB 단면 분석)
- 전기적 신뢰성 시험: EM 수명시험(가속수명평가), TDDB(시간종속절연파괴)

### 6.5 DRAM 관점

DRAM의 금속배선은 워드라인(WL), 비트라인(BL) 및 다층 배선(peri 회로 배선), 그리고 셀-주변회로 간 연결에 걸쳐 폭넓게 사용된다. 특히 미세화가 진행될수록 워드라인/비트라인의 저항 증가는 신호 지연(RC delay) 및 리프레시 특성에 직접 영향을 미치므로, 저저항 금속(텅스텐, 몰리브덴 등 신소재 검토 포함)과 CMP 평탄도 관리가 수율·성능에 중요하다. 또한 HBM(고대역폭 메모리)의 TSV(Through-Silicon Via) 공정은 다이 관통 비아를 구리로 충진(전기도금)하고 CMP로 평탄화하는 공정으로, DRAM 금속배선 기술이 3D 적층 패키징과 결합되는 대표적 사례다.

---

## 7. DRAM(SK하이닉스 1a/1b nm) 공정 관점 종합

- **미세화 로드맵**: SK하이닉스는 1x → 1y → 1z → **1a(4세대)** → **1b(5세대)** 순으로 10나노급 DRAM 공정을 발전시켜 왔다. 1a는 2021년 업계 최초로 EUV 노광을 도입해 양산한 세대이며, 1z 대비 웨이퍼당 생산량이 약 25% 늘고 소비전력은 약 20% 감소했다. 마이크론 등 경쟁사는 1b 세대에 이르러서야 EUV를 도입해, SK하이닉스가 EUV 활용에서 한 세대 이상 앞선 것으로 평가된다.
- **EUV/High-NA EUV 도입 확대**: SK하이닉스는 이천 M16 팹에 메모리 업계 최초로 ASML의 High-NA EUV 장비 **TWINSCAN EXE:5200B**(NA 0.55)를 반입했다. 기존 Low-NA EUV(NA 0.33) 대비 40% 향상된 광학 성능으로 1.7배 미세한 회로와 2.9배 높은 집적도 구현을 목표로 하며, 장비 1대의 소비전력이 약 1.4MW에 이를 정도로 대형·고가 설비다. 이는 1c 이후 세대 및 향후 노드 확장에서 오버레이/CD 관리를 강화하는 핵심 수단이 된다.
- **셀 구조 미세화**: 현재 주력 구조는 6F2 셀(워드라인 3F × 비트라인 2F)이며, 궁극적인 미세화 목표인 4F2 셀(2F×2F) 전환이 검토되고 있다. 4F2 구조는 셀 면적을 이론상 33% 줄일 수 있어, 이를 구현하려면 초정밀 노광(High-NA EUV)과 초고종횡비 식각·증착 기술이 동시에 뒷받침돼야 한다.
- **커패시터(HARC) 공정 난제**: DRAM 셀 커패시터는 제한된 면적에서 정전용량을 확보하기 위해 실린더형 3차원 구조로 제작되며, 종횡비가 약 50:1에 달하는 홀을 식각해야 한다. 상부-하부 CD 일관성(보잉 방지)과 수직 프로파일 확보가 핵심 과제이며, 극저온 식각(Cryogenic Etch) 등 첨단 식각 기술이 적용 확대되는 추세다. 이후 ALD로 고유전율(High-k, ZrO2/HfO2 계열) 유전막을 홀 내부에 원자층 단위로 균일 증착해 커패시턴스를 극대화한다.
- **웨이퍼/후공정 연계(HBM)**: SK하이닉스의 HBM(고대역폭메모리) 사업 확대에 따라 DRAM 다이의 TSV(관통전극) 형성, 극박 웨이퍼 그라인딩, 특수 폴리시드 웨이퍼 수요가 급증하며, 이는 전공정(웨이퍼 제조·금속배선의 구리 충진/CMP)과 후공정(적층·본딩)이 긴밀히 연결되는 대표적 사례로 부상하고 있다.
- **계측/수율 관리**: 미세화가 진행될수록 오버레이(현재 최선단에서 3nm 이하 3σ 목표) 및 CD 균일도가 수율을 좌우하는 결정적 요인이 되어, KLA의 오버레이/CD 계측기, AMAT의 CD-SEM/OCD 계측기에 대한 투자가 지속적으로 확대되고 있다.

---

## 8. 참고 출처

- [반도체 전공정 2편] 반도체 공정 개괄과 산화 — SK hynix Newsroom: https://news.skhynix.co.kr/jeonginseong-column-oxidation/
- [반도체 전공정 3편] 반도체 패턴을 만드는 포토 공정 — SK hynix Newsroom: https://news.skhynix.co.kr/jeonginseong-column-photo/
- [반도체 전공정 4편] 그려진 패턴을 파내는 '식각 공정' — SK hynix Newsroom: https://news.skhynix.co.kr/jeonginseong-column-etching/
- [반도체 전공정 5편] 미세화를 위한 핵심 '증착 공정' — SK hynix Newsroom: https://news.skhynix.co.kr/jeonginseong-column-deposition/
- [반도체 전공정 6편 완결편] 금속배선 — SK hynix Newsroom: https://news.skhynix.co.kr/jeonginseong-column-metallization/
- [반도체 탐구 영역] 이온주입(Ion Implantation) 편 — SK hynix Newsroom: https://news.skhynix.co.kr/ion-implantation/
- [반도체 특강] 이온-임플란테이션 방식을 이용한 소스와 드레인 단자 만들기 — SK hynix Newsroom: https://news.skhynix.co.kr/ion-implantation-method/
- SK하이닉스, EUV 활용 10나노급 4세대 D램 본격 양산 — SK hynix Newsroom: https://news.skhynix.co.kr/presscenter/10nm-class-4th-generation-dram-utilizing-euv
- SK하이닉스, 메모리 업계 최초로 양산용 'High NA EUV' 도입 — SK hynix Newsroom: https://news.skhynix.co.kr/high-na-euv-introduce/
- SK하이닉스, 메모리 업계 최초 '양날의 검' 하이 NA EUV 도입…대당 소비 전력 1.4MW — 전기신문: https://www.electimes.com/news/articleView.html?idxno=359525
- SK하이닉스, 양산용 하이 NA EUV 투입...1.7배 정밀 회로 구현 가능 — 한국경제: https://www.hankyung.com/article/202509039478i
- ASML TWINSCAN NXT:2050i / EXE:5200B 제품 페이지: https://www.asml.com/en/products/duv-lithography-systems/twinscan-nxt2050i , https://www.asml.com/en/products/euv-lithography-systems/twinscan-exe-5200b
- ASML High-NA EUV roadmap — PatSnap: https://www.patsnap.com/resources/blog/articles/asml-high-na-euv-lithography-sub-2nm-logic-patterning/
- Lam Research Kiyo/Flex/Versys 제품 페이지: https://www.lamresearch.com/product/kiyo-product-family/ , https://www.lamresearch.com/products/our-processes/etch/
- 램리서치 극저온 식각 장비 'Lam Cryo 3.0' 출시 — 디일렉: https://www.thelec.kr/news/articleView.html?idxno=29443
- TEL Clean Track ACT8 / LITHIUS 제품 페이지: https://www.tel.com/product/act.html , https://www.tel.com/product/lithius.html
- ASM International Pulsar/Eagle XP8 ALD 제품 페이지: https://www.asm.com/our-technology-products/ald
- Ion implantation in silicon technology — Axcelis: https://www.axcelis.com/wp-content/uploads/2019/02/Ion_Implantation_in_Silicon_Technology.pdf
- Applied Materials Metrology and Inspection / CD-SEM: https://www.appliedmaterials.com/us/en/product-library/veritysem-10-cd-metrology.html
- KLA 계측 제품(Archer 오버레이 계측): https://www.kla.com/ko/products/chip-manufacturing/metrology
- 한국에바라정밀기계 CMP 장비(F-REX): https://ebara.co.kr/sub/product/equipment/equipment/cmp.asp
- AMAT/Ebara CMP 장비, 슬러리 관련 — 서울경제: https://www.sedaily.com/article/13500662
- 다마신 구리 배선 방식 — SK hynix Newsroom: https://news.skhynix.co.kr/damascene-process/
- Challenges in high-aspect ratio contact (HARC) etching for DRAM capacitor formation — SPIE: https://www.spiedigitallibrary.org/conference-proceedings-of-spie/9428/1/Challenges-in-high-aspect-ratio-contact-HARC-etching-for-DRAM/10.1117/12.2087765.short
- HBM4 시대의 보이지 않는 병목… '특수 폴리시드 웨이퍼' 공급망 비상 — 아이씨엔매거진: https://icnweb.kr/2026/79720/
- 2025년 세계 10대 실리콘 웨이퍼 공급업체(SK실트론/신에츠/SUMCO 등) — Ruyuan: https://www.ruyuanem.com/blog/top-10-silicon-wafer-suppliers-in-the-world-2129762.html
- 일본의 반도체 제조용 EUV 포토레지스트 시장 동향 — KOTRA: https://dream.kotra.or.kr/kotranews/cms/news/actionKotraBoardDetail.do?SITE_NO=3&MENU_ID=80&bbsSn=242&pNttSn=227637&CONTENTS_NO=2
