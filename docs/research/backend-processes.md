# 반도체 후공정(Back-End Process) 종합 리서치

> 조사일: 2026-07-06
> 범위: EDS 테스트 → 패키징 → 최종 패키지 테스트. DRAM/메모리 특화 내용 및 실사용 장비(TEL, SEMES, Advantest, Disco 등) 포함.

---

## 0. 전체 흐름 개관

반도체 제조는 크게 **전공정(Front-End, FEOL/BEOL)**과 **후공정(Back-End)**으로 나뉜다. 전공정이 웨이퍼 위에 회로를 "만드는" 단계(웨이퍼 제조 → 산화 → 포토 → 식각 → 증착/이온주입 → 금속배선)라면, 후공정은 완성된 회로를 **검사하고 제품화하는** 단계다. 후공정은 다시 세 덩어리로 나뉜다.

1. **EDS(Electrical Die Sorting, 웨이퍼 테스트)** – 웨이퍼 상태에서 다이 단위로 전기적 양/불량을 선별
2. **패키징(Assembly/Packaging)** – 다이를 자르고, 기판에 붙이고, 배선하고, 몰딩해 완제품 외형을 만드는 조립 공정
3. **최종 패키지 테스트(Final Test)** – 패키징이 끝난 완제품 상태에서 전기적·기능적 특성을 최종 검증(번인, 속도 분류 등)

이 순서는 "웨이퍼 제조 → 산화 → 포토 → 식각 → 증착·이온주입 → 금속배선 → EDS → 패키징 → 파이널 테스트"로 요약된다. EDS는 패키징 이전 단계의 효율을 높이기 위한 사전 선별이고, 파이널 테스트는 조립까지 끝난 완제품의 최종 검증이라는 점에서 역할이 다르다.

---

## 1. EDS 테스트 (Electrical Die Sorting, 웨이퍼 레벨 테스트)

### 1.1 목적

EDS는 FAB 공정과 패키징 공정 사이에 수행되는, 웨이퍼 상태에서 개개의 다이(회로)를 대상으로 하는 최초의 전기적 시험이다. 목적은 크게 네 가지다.

- 웨이퍼 상태 반도체 칩의 양품/불량품 선별
- 불량 칩 중 수선(repair) 가능한 칩을 양품으로 복구
- FAB 공정이나 설계 단계에서 발견된 문제점 수정
- 불량 칩을 미리 걸러내 이후 패키징·테스트 공정의 효율 향상 (불량 다이에 조립 비용을 낭비하지 않기 위함)

EDS는 웨이퍼 위에 새겨진 개별 회로들의 전기적 동작을 검사해 양품/불량품을 가려내는 시험으로, 반도체 수율(yield, 웨이퍼당 최대 칩 수 대비 양품 칩의 비율)을 관리하는 핵심 지표 역할을 한다.

### 1.2 EDS 공정 4단계 (삼성전자 기준)

1. **ET Test / WBI(Wafer Burn-In)** – 개별 소자의 기본 전기적 특성 검사 및 잠재적 결함(潜在불량) 발견
2. **Hot/Cold Test** – 고온·저온 등 상이한 온도 조건에서 칩이 정상 동작하는지 판정 (온도별 마진 확인)
3. **Repair / Final Test** – 수선 가능한 칩을 복구(리페어)하고 재검증
4. **Inking** – 불량품 표시. 과거에는 물리적으로 잉크 점을 찍었으나, 현재는 전자적 데이터(wafer bin map) 기반 처리로 대체되는 추세

### 1.3 프로브 카드(Probe Card)

프로브 카드는 EDS의 핵심 소모성 부품으로, 카드에 부착된 수많은 미세 핀(니들/범프)이 웨이퍼 위 다이의 본딩 패드(혹은 범프)에 물리적으로 접촉해 전기 신호를 주고받는 인터페이스다. 이 신호를 테스터가 해석해 불량 칩을 선별한다.

**주요 프로브 카드 종류:**
- **캔틸레버(Cantilever) 타입** – 전통적인 니들 방식. 니들 끝이 휘어진 형태로 패드에 접촉하며 저비용·저핀수 응용에 적합
- **버티컬(Vertical) 프로브 타입** – 니들이 수직으로 배열되어 미세 피치·고핀수 디바이스에 유리
- **MEMS/멤브레인 타입** – 미세가공 기술로 제작한 범프형 접촉자를 사용, 초미세 피치와 대량 병렬 테스트(멀티 DUT)에 적합
- **논컨택트(Non-contact) 프로브** – SiP(System in Package), SCSP(Stacked Chip-Scale Package) 등 여러 다이가 결합된 패키지 테스트를 위한 진보된 방식

프로브 니들 소재로는 텅스텐, 베릴륨코퍼(BeCu), 팔라듐 합금 등이 사용되며, 재질 선택은 접촉 저항, 내마모성, 탄성 등을 좌우한다.

### 1.4 프로버(Prober) 장비

**웨이퍼 프로버**는 프로브 카드를 장착하고 웨이퍼를 자동으로 이송·정렬·접촉시키는 장비로, ATE(자동 시험 장비) 테스터와 함께 EDS 시스템을 구성한다.

- 웨이퍼를 진공으로 고정하는 **웨이퍼 척(wafer chuck)** 위에 웨이퍼를 안착
- **광학 패턴 인식(optics)**으로 웨이퍼와 프로브 카드의 정확한 정렬(얼라인) 보장
- 웨이퍼를 자동으로 로딩/언로딩하며 다이 단위로 스테핑(indexing)하여 순차 테스트
- 온도 챔버가 내장된 경우 Hot/Cold 테스트도 지원

**주요 프로버 장비 제조사 및 모델:**

- **Tokyo Electron(TEL)**
  - **Precio™ 시리즈** – 완전 자동 웨이퍼 프로빙 플랫폼. **Precio octo™**(8인치용, 초고속 인덱싱·고속 웨이퍼 교환으로 테스트 비용 절감)와 **Precio XL**(300mm 웨이퍼용 최신 모델, 고생산성·접촉 성능·클린니스 개선) 등이 있다.
  - **Cellcia™ 시리즈** – 300mm 웨이퍼를 멀티 테스트 셀(multi test cell) 구조로 동시에 검사하는 차세대 프로빙 시스템
  - 구형 모델로 **P-8, P-8XL** 시리즈가 있으며 중고 장비 시장에서도 여전히 거래됨
- **SEMES(세메스, 삼성전자 계열)**
  - 삼성전자의 연결 종속회사로 연간 3조원 규모의 반도체/디스플레이 장비를 생산하는 국내 최대 장비업체
  - 차세대 프로버 **SEMPRO PRIME**을 개발 – 반도체 패턴 웨이퍼의 전기적 특성 검사에 사용되며 iF/레드닷 디자인 어워드 등을 수상
  - 후공정 제품군으로 **BONDER, PROBER, TEST HANDLER** 라인업을 보유

이 외에도 Advantest 그룹의 프로버(구 신에츠/도쿄세이미츠 계열 포함) 등이 시장에 존재한다.

### 1.5 Wafer Bin Map (WBM)

Wafer Bin Map은 EDS 테스트가 끝난 각 웨이퍼에 부착되는 **디지털 맵**으로, 웨이퍼 위 모든 다이의 위치(좌표)별 테스트 결과를 빈(bin) 번호로 기록한다.

- 각 다이는 특정 실패 모드나 양/불량 등급에 따라 서로 다른 "빈(bin)" 번호로 분류된다 (예: Bin1=양품, Bin2 이상=특정 실패 유형별 불량)
- 과거에는 불량 다이 위에 물리적으로 잉크 방울을 찍어 표시(Inking)했으나, 현재는 이 정보가 전자 데이터 형태(맵 파일)로 어셈블리(패키징) 공장에 전달되어, 조립 시 양품 다이만 선택적으로 사용하도록 한다
- Wafer Bin Map은 수율 분석, 공정 결함의 웨이퍼 내 공간적 분포(edge fail, center fail, cluster 등) 파악, 설비/공정 이상 진단에도 활용된다

### 1.6 Repair 공정 (Redundancy Repair, Laser Repair)

메모리(DRAM/SRAM)는 동일한 기능의 셀이 수백만~수십억 개 반복 배열된 구조이기 때문에, **중복(redundancy) 설계**를 통한 결함 복구가 매우 효과적이다.

- **원리**: 칩 설계 시 예비(spare) 행/열 블록을 추가로 넣어두고, EDS 테스트로 정확한 결함 위치(주소)를 찾아내면 이 정보를 이용해 결함이 있는 행/열을 예비 회로로 교체 매핑한다. 이 과정을 **Redundancy Analysis(RA)**라 한다
- **퓨즈(Fuse) 방식**:
  - **전기 퓨즈(electrical fuse)**: 폴리실리콘 저항체를 이용, 전기적으로 끊는 방식
  - **레이저 퓨즈(laser fuse)**: 레이저 빔으로 폴리실리콘/폴리사이드 링크를 절단하는 방식. 전기 퓨즈 대비 처리 속도가 훨씬 빠르고 비용 효율적이어서 **웨이퍼 레벨 리페어의 주력 방식**으로 사용된다
- **공정 흐름**: EDS 테스트에서 결함 다이/주소의 defect map을 생성 → 이 맵을 레이저 리페어 장비로 전송 → 레이저 펄스를 쏘아 불량 셀에 연결된 퓨즈를 절단, 예비 셀로 배선을 전환 → 리페어 후 재검증(Final Test)으로 복구 성공 여부 확인
- 리페어가 불가능하거나 예비 자원이 소진된 다이는 최종적으로 불량 처리되어 폐기된다

---

## 2. 패키징(Packaging/Assembly) 공정

EDS를 통과한(혹은 리페어된) 웨이퍼는 패키징 공정을 거쳐 개별 칩을 외부 환경으로부터 보호하고 전기적으로 연결 가능한 완제품 형태로 만든다. 일반적인 순서는 **백그라인딩 → 다이싱 → 다이 어태치 → (와이어본딩 또는 플립칩) → 몰딩 → 마킹 → (솔더볼 마운트)** 순이다.

### 2.1 백그라인딩(Back-Grinding, 웨이퍼 박막화)

- **목적**: 웨이퍼 뒷면을 연삭(grinding)해 두께를 얇게 만드는 공정. 완제품 패키지의 두께를 줄이고(특히 모바일/스택 패키지), TSV(Through-Silicon Via) 구조에서는 실리콘 관통 비아를 뒷면에서 노출시키기 위해 필수적이다
- **공정**: 다이아몬드 지석을 이용한 조질(coarse) 그라인딩으로 대부분의 실리콘을 제거한 뒤, **CMP(화학기계연마)**나 플라즈마 식각으로 정밀 마무리를 한다. Backgrinding은 고제거율의 거친 단계이고, 이어지는 reveal etch/CMP는 TSV 팁 근처까지 정밀하게 다가가는 단계로 역할이 나뉜다
- CMP는 그라인딩으로 생긴 표면 손상(격자 변형, 구조적 결함)을 1~5마이크론 두께로 추가 제거하며 TSV를 손상 없이 노출시킨다
- **DBG(Dicing Before Grinding)**: 웨이퍼를 완전히 자르기 전에 표면에서 일부만 절단(하프컷)한 뒤 뒷면을 그라인딩하여, 그라인딩이 진행되며 하프컷 라인과 만나 자연스럽게 다이로 분리되는 방식. Disco의 **DFL7361** 레이저 장비를 이용한 **SDBG(Stealth Dicing Before Grinding)** 공정은 이미 세계 여러 메모리 제조사에서 채택하고 있다
- 초박형 웨이퍼는 깨지기 쉬우므로 그라인딩 중 **임시 접착 테이프/캐리어**로 지지하는 기술이 병행된다

### 2.2 다이싱(Dicing) – Blade / Laser / Stealth 비교

다이싱은 웨이퍼를 개별 칩(다이)으로 분리하는 공정이다. EDS Test의 Inking(또는 데이터 맵) 처리를 거친 웨이퍼를 절단기로 잘라 낱개 칩으로 분리한다.

| 방식 | 원리 | 특징 |
|---|---|---|
| **블레이드 다이싱(Blade Dicing)** | 다이아몬드 입자가 박힌 회전 블레이드로 웨이퍼를 기계적으로 절삭 | 가장 보편적/저비용. 블레이드 두께가 수십 μm이어서 소잉 라인(street) 폭이 60~80μm 이상 필요 → 그만큼 다이 수 손실. 얇은 웨이퍼나 low-k 소재에서는 칩핑/크랙 위험 |
| **레이저 다이싱(Laser Dicing, Ablation)** | 레이저 에너지를 한 점에 집중시켜 순간적으로 승화·기화(ablation)시켜 절단 | Low-k 필름을 쓰는 고속 로직 회로, 화합물 반도체(GaAs), 사파이어(고휘도 LED) 등에서 블레이드 대비 생산성 우수. Disco의 **DFL7161** 등이 화합물 반도체 풀컷용으로 최적화됨 |
| **스텔스 다이싱(Stealth Dicing™)** | 레이저를 웨이퍼 내부에 포커싱해 표면을 손상시키지 않고 내부에 개질층(modified layer)을 형성한 뒤, 테이프 익스팬더로 잡아당겨(expand) 다이를 분리 | 표면 손상 최소화, 소잉 라인 폭을 거의 0에 가깝게 줄여 다이 수율 극대화. 주로 MEMS, 초소형 다이, **메모리 제조사들의 SDBG(Stealth Dicing Before Grinding)** 공정에 널리 채택 |

블레이드 방식의 소잉 라인 폭이 60~80μm인 데 비해, 레이저는 폭을 거의 0에 가깝게 만들 수 있어 웨이퍼당 다이 수를 늘릴 수 있다는 것이 핵심 차이다. Disco는 이 외에도 **플라즈마 다이싱**(에칭 기반, KLA 등도 언급)도 극소형 다이/특수 공정에 활용되고 있다.

**Disco 대표 장비 모델**: 다이싱 소(dicing saw) **DAD 시리즈**(DAD320, DAD3220 등), 패키지 다이싱용 **DFD6080/DFD6340**(최대 400×400mm 처리), 웨이퍼 그라인더 **DFG8540/DFG8561**(Φ300mm 웨이퍼 대응 완전자동 그라인더), 레이저 소 **DFL7161, DFL7361** 등이 실제 산업 현장에서 사용된다. DISCO는 "**切る・削る・磨く**(자르다·깎다·닦다)" 3대 정밀가공 기술을 핵심 역량으로 하는 다이싱·그라인딩·폴리싱 장비의 세계적 리더다.

### 2.3 다이 어태치(Die Attach) / 다이 본딩(Die Bonding)

다이싱된 개별 칩을 리드프레임(Lead Frame) 또는 PCB(패키지 기판) 위에 접착·고정하는 공정. 전기적 연결(그라운드/전원)과 방열, 기계적 고정을 담당한다.

- **재료**:
  - **에폭시(epoxy) 접착제** – 액상 소재로 사용이 쉬워 널리 쓰이나, 경화 시 워피지(warpage, 휨) 발생 문제가 있음. 도포 후 150~250℃로 리플로우/경화
  - **DAF(Die Attach Film)** – 필름 형태의 접착제로 두께를 매우 얇고 균일하게 조절 가능해 최신 첨단 패키지(적층 메모리 등)에서 선호. 비용은 에폭시보다 높음
  - 이외 금(Au), 은(Ag), 니켈 합금, 솔더, 페이스트 등 특수 용도 소재도 사용
- **공정 단계**: ① 다이 본더(die bonder) 장비가 다이싱 테이프에서 칩을 픽업(이젝터 핀으로 살짝 들어올린 뒤 진공 흡착) → ② 기판 위에 정밀 배치(Pick & Place) → ③ 온도 제어된 터널을 통과시켜 접착제 리플로우/경화

### 2.4 와이어 본딩(Wire Bonding) vs 플립칩(Flip Chip)

칩과 기판(또는 리드프레임) 사이의 전기적 연결 방식은 크게 두 가지로 나뉜다.

**와이어 본딩(Wire Bonding)**
- 가는 금속 와이어(금, 구리, 은, 알루미늄 등)로 칩 표면의 본딩 패드와 기판/리드프레임의 리드를 하나씩 연결
- **볼 본딩(Ball Bonding)**: 와이어 끝을 전기 스파크(EFO, Electronic Flame-Off)로 녹여 볼을 형성한 뒤 패드에 접합. 주로 금(Au) 와이어, 20μm 이하 세경선에 사용(볼-웨지 공정)
- **웨지 본딩(Wedge Bonding)**: 와이어를 패드에 접촉시킨 뒤 초음파 에너지를 가해 접합. 주로 알루미늄 와이어에 사용
- **와이어 소재 트렌드**: 금(Au)이 전통적 소재였으나, 원가 절감을 위해 **구리(Cu) 와이어**가 널리 대체 채택되는 추세. 구리는 더 얇은 직경에서도 금과 동등한 성능을 내면서 원가가 낮음. 은(Ag) 합금 와이어도 전기·열전도성이 우수해 사용
- 공정: 다이 어태치 → 와이어 본딩 → 3차 광학검사(optical inspection) 순으로 진행

**플립칩(Flip Chip)**
- 칩을 뒤집어(flip) 활성면(회로면)을 기판과 마주보게 하여, 칩 표면의 **솔더 범프(solder bump)**로 기판과 직접 전기적/기계적 접합
- 공정: 다이 배치 → 리플로우(reflow) → 3차 광학검사 순
- 저핀수 패키지는 오버몰드만으로 신뢰성 시험을 통과하지만, 고핀수 플립칩은 리플로우 후 **언더필(Underfill) 에폭시**를 다이-기판 사이에 주입·경화해야 함 – 열팽창계수(CTE) 차이로 인한 기계적 응력을 완화하기 위함

**비교 요약**

| 항목 | 와이어 본딩 | 플립칩 |
|---|---|---|
| I/O 수 | 상대적으로 제한적 (패드가 칩 주변부에 배치되어야 함) | 훨씬 많은 I/O 채널 지원 (에어리어 어레이 배치) |
| 신호 경로 | 상대적으로 김 | 짧음(직접 접합) → 우수한 전기적 성능 |
| 열 성능 | 상대적으로 열등 | 칩-기판 직접 접촉으로 우수 |
| 패키지 크기 | 본딩 패드 공간 필요로 상대적으로 큼 | 고밀도·소형화에 유리 |
| 적용 | 범용 메모리(FBGA 등), 저가/범용 로직 | 고성능 로직, 고I/O 패키지, 첨단 패키지 |

### 2.5 몰딩(Molding, EMC)

와이어 본딩(혹은 플립칩)까지 끝난 칩을 외부 충격, 습기, 오염으로부터 보호하기 위해 **EMC(Epoxy Molding Compound)** 수지로 감싸는 공정.

- EMC(수지 화합물)에 고온을 가해 젤 상태로 만든 뒤, 원하는 패키지 형태의 금형(몰드)에 주입해 성형(오버몰드)
- 저핀수 패키지는 몰딩만으로 신뢰성을 확보하고, 고핀수/플립칩 패키지는 몰딩 전에 언더필 공정이 추가됨

### 2.6 마킹(Marking)

최종 패키지 표면에 레이저(또는 잉크젯)로 제품 식별 정보를 각인하는 공정. 일반적으로 **IC의 명칭(모델명), 제조일자(로트 트레이서빌리티), 제품 특성/스펙 코드, 제조 국가, 일련번호(시리얼)** 등이 인쇄된다.

### 2.7 솔더볼 마운트(Solder Ball Mount, Ball Attach)

BGA(Ball Grid Array) 계열 패키지에서 기판 뒷면(또는 밑면)의 패드 위에 솔더볼(주석-납 또는 무연 합금 솔더 스피어)을 부착하는 공정.

- **공정 순서**: ① 기판 세정 및 패드에 **플럭스(flux)** 도포(핀 트랜스퍼/디핑 트레이 방식 다수) → ② 픽업&플레이스 헤드 또는 고정 지그(fixturing device)로 솔더볼을 플럭스 위에 정렬 배치 → ③ 리플로우 오븐에서 솔더 합금의 융점까지 가열, 볼이 패드에 젖어(wetting) 접합
- 플럭스는 산화막 제거 및 젖음성(wettability) 향상, 보이드(void) 최소화를 위해 필수적이며, 최근에는 **플럭스리스(flux-free) 볼 마운트** 공정도 연구·적용되고 있음
- 이 솔더볼은 이후 PCB(메인보드)에 패키지를 표면실장(SMT)할 때 전기적 접점이자 기계적 고정점이 된다

---

## 3. 최종 패키지 테스트 (Final Test)

패키징이 완료된 완제품은 실제 사용 환경과 유사한 조건에서 전기적·기능적 특성을 최종 검증받는다.

### 3.1 번인 테스트(Burn-In Test)

- **목적**: 제품 수명 주기를 나타내는 **배스터브 곡선(bathtub curve)**에서, 초기 불량(Infant Mortality Failure) 구간의 잠재 불량품을 출하 전에 걸러내는 것이 핵심 목적. 초기 불량은 제조 공정의 미세한 결함으로 인해 초반에 높은 실패율을 보이다가 시간이 지나며 낮아지는 특성을 가짐
- **방법**: 실제 사용 조건보다 **높은 전압**과 **높은 온도**를 인가해 잠재적 신뢰성 결함(latent defect)의 발현을 가속화하는 전기적 스트레스 시험. 짧은 시간 내에 초기 불량을 스크리닝하기 위해 열화를 가속(accelerated aging)시키는 원리
- 번인은 통상 로트(lot) 내 **전수(100%) 검사**로 적용되는, 품질보증의 핵심 스크리닝 단계
- 메모리 소자는 특히 **웨이퍼 레벨 번인(WBI, Wafer Burn-In)**을 EDS 초기 단계에서 수행하기도 하고(1.2절 참고), 패키지 레벨에서도 별도의 번인 챔버/보드에 다수의 패키지를 장착해 장시간(수 시간~수십 시간) 고온·고전압 스트레스를 가하는 방식으로 진행된다
- **Advantest B6700 계열**(B6700L/B6700S 등)은 NAND 플래시·DRAM 등 메모리 전용 차세대 번인 테스터로, 병렬 테스트 용량을 높여 테스트 비용을 낮추는 데 초점을 둔다

### 3.2 속도 분류 (Speed Binning / Speed Sorting)

- **정의**: 최종 테스트 단계에서 스위칭 속도(동작 주파수) 성능을 기준으로 소자를 등급별로 분류(bin)하는 작업. 동일 설계·동일 공정이라도 공정 편차(process variation)로 인해 개별 칩의 실제 동작 가능 주파수가 다르기 때문에 발생
- **적용**: DRAM, ASIC, 마이크로프로세서 등에 폭넓게 적용. DRAM의 경우 DDR4-3200, DDR5-4800/5600/6400 등 등급별 스피드빈이 대표적 예
- **절차**: 동작 주파수를 스텝별로 높여가며 정상 동작 여부를 판정 → 통과한 최고 주파수 구간에 따라 제품을 다른 스피드 등급(빈)으로 분류하거나, 최저 스펙에도 미달하면 폐기(discard)
- 일부 경우 웨이퍼 레벨(EDS)에서도 예비 속도 측정을 하여 공정 상의 온칩 변동(on-chip variation)을 모니터링하고 완제품 특성을 사전에 예측하기도 함
- 빈(bin) 결과는 마킹 정보(모델명 뒤 스피드 등급 코드)에도 반영되어 최종 제품 라벨링에 사용

### 3.3 최종 테스트용 대표 ATE 장비 – Advantest

- **T5503 시리즈(T5503HS/T5503HS2)** – 대용량·비용 효율적 메모리 테스터. **T5503HS**는 DDR4-SDRAM 등을 최대 512개 디바이스까지 병렬 테스트 가능, 최대 4.5Gbps 속도 지원. 후속 모델 **T5503HS2**는 최대 9Gbps 속도, ±45피코초의 타이밍 정확도로 **LPDDR5, DDR5**급 첨단 메모리를 지원
- **V93000 HSM(High Speed Memory) 시리즈** – Advantest의 범용 SoC 테스트 플랫폼 V93000의 아키텍처(핀별 타이밍 구조)를 확장해 DDR3/DDR4, XDR, GDDR 등 고성능 DRAM 테스트에 특화한 라인업. 미래 DRAM 세대에도 대응 가능한 확장성을 목표로 설계
- **B6700 계열(B6700L/B6700S)** – 번인 전용 테스터로 NAND/DRAM 등 메모리 수요 증가에 대응해 병렬 처리 용량을 높인 차세대 모델

---

## 4. DRAM 패키지 유형 및 메모리 특화 후공정

### 4.1 패키지 유형의 진화

DRAM 패키지는 초기 리드프레임 기반의 **TSOP(Thin Small Outline Package)**에서, 더 얇고 작은 칩스케일 패키지인 **FBGA(Fine-pitch Ball Grid Array)**와 **WLP(Wafer-Level Package)**로 진화해왔다.

**FBGA(Fine-pitch Ball Grid Array)**
- 라미네이트 기판(substrate) 기반의 칩스케일 패키지로, 플라스틱 오버몰드 봉지재와 미세피치 솔더볼 배열 단자를 특징으로 한다
- 소형·고핀수·미세 피치(볼 간격)가 특징이며, 공간이 제약된 모바일·휴대형 컴퓨팅 기기용 메모리에 광범위하게 사용된다
- 파생형으로 초박형의 **TFBGA(Thin-profile FBGA)** 등이 있음
- 볼 피치가 미세할수록, 조립·테스트 시 얼라인 오차가 미치는 영향이 커져 접촉불량으로 인한 오판정(false reject) 위험이 커진다는 과제가 있다

### 4.2 멀티 다이 적층 패키지 (DDP/QDP/ODP 등)

DRAM 패키지는 내부에 포함된 동일 다이의 개수에 따라 명명된다: **SDP(단일 다이, 1개), DDP(Dual-Die Package, 2개), 3DP(3개), QDP(Quad-Die Package, 4개)**, 그리고 최대 16개 다이까지 쌓은 **HDP(16-die package)**까지 존재한다.

주요 스태킹(적층) 기술:
- **RDL(Re-Distribution Layer)** – 다이 가장자리의 패드를 다이 중앙으로 재배선
- **F2F DDP(Face-to-Face)** – 다이 2개를 마주보게 하여 1개의 본드와이어와 1개의 RDL로 연결
- **DCA(Direct Chip Attach)** – 와이어본딩 없이 직접 칩을 연결
- **TSV(Through-Silicon Via)** – 다이를 관통하는 비아로 다이 간을 수직 연결. **Hybrid Memory Cube(HMC)** 등에 사용되며, 맨 아래 다이가 전기적 버퍼(로직 다이) 역할을 하는 구조로 최대 8~16단 적층이 가능. 이런 구조를 **3DS(3D-Stacked) DRAM**이라 부른다

### 4.3 HBM(High Bandwidth Memory) 최신 패키징 동향 (2025~2026)

- **TSV**: 지름 10~20μm의 미세 비아로 다이 간 수직 전기연결을 구성, HBM 특유의 고밀도 수직 스태킹을 가능케 하는 핵심 기술
- **하이브리드 본딩(Hybrid Bonding)**: 기존의 마이크로범프(microbump) 대신 **구리-구리(Cu-Cu) 직접 접합**으로 다이를 접합하는 차세대 기술. 열저항을 22~47% 감소시키고 스택 높이를 15% 이상 줄일 수 있음. 전력효율·신호무결성 향상, 칩 밀도·적층 능력 증대 등의 장점이 있으며 HBM/3D NAND向 하이브리드 본딩 장비 발주가 2026~2027년에 걸쳐 크게 늘어날 것으로 업계는 전망
- **HBM4 로드맵**: SK하이닉스는 2026년 16단 적층 HBM4 양산을 목표로 하고 있고, 삼성전자도 2025년 16단 적층 HBM4 샘플 제작, 2026년 양산을 계획. 다만 HBM4 세대에서는 하이브리드 본딩을 전면 도입하기보다 **마이크로범프 방식을 유지**하며 하이브리드 본딩 전환을 다음 세대로 유보하는 흐름도 관측된다(공정 성숙도·수율·비용 이슈)
- HBM 수요는 2025년 전년 대비 130% 성장했고, 2026년에도 약 70% 추가 성장이 전망되어 후공정(TSV 형성, 적층 본딩, 테스트) 투자가 급증하는 영역이다

### 4.4 메모리 특화 후공정 포인트 요약

- 메모리(DRAM/NAND)는 셀 어레이 구조상 **중복 리페어(redundancy repair)**가 매우 효과적이어서, EDS 단계의 레이저 퓨즈 리페어가 로직 반도체보다 훨씬 광범위하게 활용된다 (§1.6)
- **웨이퍼 번인(WBI)**을 EDS 초반에 수행해 조립 이전에 초기 불량 다이를 걸러내는 것이 로직 대비 흔하다
- 적층형 메모리(DDP/QDP/HBM)는 다이 간 정렬(TSV 얼라인, Cu-Cu 본딩 정밀도)이 후공정 수율을 좌우하는 새로운 변수로 대두
- Disco의 **SDBG(Stealth Dicing Before Grinding, DFL7361 등 사용)** 공정은 특히 메모리 제조사들 사이에서 널리 채택되어 얇은 다이를 손상 없이 대량 생산하는 데 기여

---

## 5. 공정별 핵심 장비 요약표

| 공정 단계 | 대표 장비/브랜드 | 비고 |
|---|---|---|
| EDS 프로버 | Tokyo Electron(TEL) Precio™/Precio XL/Cellcia™, SEMES SEMPRO PRIME | 웨이퍼 자동 로딩·정렬·접촉 |
| EDS 테스터(ATE) | Advantest V93000 HSM, T5503HS/HS2 | DRAM/DDR/LPDDR 웨이퍼 테스트 |
| 프로브 카드 | 캔틸레버/버티컬/MEMS 타입 (Heraeus 니들 소재 등) | 프로버에 장착되는 소모품 |
| 백그라인딩 | Disco DFG8540/DFG8561 등 | TSV 노출, 웨이퍼 박막화 |
| 다이싱(블레이드) | Disco DAD320/DAD3220, DFD6080/DFD6340 | 표준 다이싱 |
| 다이싱(레이저/스텔스) | Disco DFL7161(화합물반도체), DFL7361(SDBG, 메모리향) | 저손상·고수율 다이싱 |
| 다이 어태치/본딩 | 다이본더(Pick & Place), DAF/에폭시 소재 | SK하이닉스 등 자체 공정 문서 참고 |
| 와이어본딩 | K&S, Shinkawa 등 와이어본더(볼/웨지) | Au/Cu/Ag 와이어 |
| 최종 테스트(번인) | Advantest B6700L/B6700S | NAND/DRAM 번인 전용 |
| 최종 테스트(속도분류) | Advantest V93000/T5503 계열 + 테스트 핸들러 | SEMES TEST HANDLER 등 |

---

## 참고 출처(Sources)

- 삼성반도체 뉴스룸, [반도체 8대 공정 8탄: EDS 공정](https://news.samsungsemiconductor.com/kr/%EB%B0%98%EB%8F%84%EC%B2%B4-8%EB%8C%80-%EA%B3%B5%EC%A0%95-8%ED%83%84-%EC%99%84%EB%B2%BD%ED%95%9C-%EB%B0%98%EB%8F%84%EC%B2%B4%EB%A1%9C-%ED%83%9C%EC%96%B4%EB%82%98%EA%B8%B0-%EC%9C%84%ED%95%9C/)
- 삼성반도체 뉴스룸, [반도체 8대 공정 9탄: 패키징(Packaging) 공정](https://news.samsungsemiconductor.com/kr/%EB%B0%98%EB%8F%84%EC%B2%B4-8%EB%8C%80-%EA%B3%B5%EC%A0%95-9%ED%83%84-%EC%99%B8%EB%B6%80%ED%99%98%EA%B2%BD%EC%9C%BC%EB%A1%9C%EB%B6%80%ED%84%B0-%EB%B0%98%EB%8F%84%EC%B2%B4%EB%A5%BC-%EB%B3%B4%ED%98%B8-2/)
- AnySilicon, [Ultimate Guide to Wafer Sort](https://anysilicon.com/ultimate-guide-wafer-sort/)
- SLKOR Medium, [Electrical Die Sorting (EDS) process](https://slkor.medium.com/the-eighth-major-semiconductor-process-viii-electrical-die-sorting-eds-process-b1500b3a213c)
- Tokyo Electron, [Test Precio™ Series](https://www.tel.com/product/precio.html), [Test Cellcia™ Series](https://www.tel.com/product/cellcia.html)
- SEMES 공식/뉴스: [semes.com](https://www.semes.com/), 전자신문 관련 보도
- DISCO Corporation, [Laser Dicing Solutions](https://www.discousa.com/eg/solution/library/laser_dicing.html), [Dicing Before Grinding](https://technology.discousa.com/method/dicing-before-grinding/), DISCO 장비 카탈로그(dicing-grinding.discousa.com)
- SemiAnalysis, [DISCO Corporation, The World Leader In Semiconductor Capital Equipment](https://newsletter.semianalysis.com/p/disco-corporation-the-world-leader)
- SK hynix Newsroom, [Die Bonding, Process for Placing a Chip on a Package Substrate](https://news.skhynix.com/die-bonding-process-for-placing-a-chip-on-a-package-substrate/)
- Advantest, [T5503HS2](https://www.advantest.com/en/products/semiconductor-test-system/memory/t5503hs2/), [V93000 High Speed Memory](https://www3.advantest.com/en_DE/products/ic-test-systems/v93000-high-speed-memory), [B6700 번인 테스터 발표 뉴스](https://www.advantest.com/en/news/2018/20181010.html)
- eesemi.com, [FBGA - Fine-Pitch Ball Grid Array](https://www.eesemi.com/fbga.htm); JCET, [FBGA Highlights](https://www.jcetglobal.com/uploads/FBGA_22Dec2021.pdf)
- Springer Nature, [A Statistical Wafer Scale Error and Redundancy Analysis Simulator](https://link.springer.com/chapter/10.1007/978-3-030-53273-4_7)
- ResearchGate, [Challenges and Future Directions of Laser Fuse Processing in Memory Repair](https://www.researchgate.net/publication/252219773_Challenges_and_Future_Directions_of_Laser_Fuse_Processing_in_Memory_Repair)
- ResearchGate, [DIMM-in-a-PACKAGE Memory Device Technology for Mobile Applications](https://www.researchgate.net/publication/264017113_DIMM-in-a-PACKAGE_Memory_Device_Technology_for_Mobile_Applications) (DDP/QDP 스태킹 기술)
- PatSnap, [HBM technology landscape 2026](https://www.patsnap.com/resources/blog/articles/hbm-technology-landscape-2026-market-and-ai-demand/); SemiEngineering, [HBM4 Sticks With Microbumps, Postponing Hybrid Bonding](https://semiengineering.com/hbm4-sticks-with-microbumps-postponing-hybrid-bonding/)
- KES Systems, [Semiconductor 101: The Bathtub Curve](https://www.kessystemsinc.com/resources/semiconductor-101-the-bathtub-curve/), [An Introduction to Semiconductor Burn-In](https://www.kessystemsinc.com/resources/an-introduction-to-semiconductor-burn-in/)
- Chemicool, [Definition of speed binning](https://www.chemicool.com/definition/speed_binning.html)
- ScienceDirect / ResearchGate, TSV 웨이퍼 박막화 및 CMP 관련 논문(Wafer Backside Thinning, TSV Reveal)
- Wire bonding 관련: [Wikipedia - Wire bonding](https://en.wikipedia.org/wiki/Wire_bonding), Bond Pulse, TANAKA 관련 자료
- BGA 볼 어태치: Indium Corporation, Inventec Performance Chemicals 관련 자료
- 윈스펙 커뮤니티, [반도체 공정 종류: 전공정·후공정 차이 정리](https://winspec.co.kr/community/lecture/131946915)
