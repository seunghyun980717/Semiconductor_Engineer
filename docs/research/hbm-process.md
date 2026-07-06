# SK하이닉스 HBM(High Bandwidth Memory) 제조 공정 심층 리서치

> 작성일: 2026-07-06
> 범위: HBM 구조, TSV 공정, 웨이퍼 박막화, 마이크로 범프, MR-MUF/Advanced MR-MUF, 세대별(HBM3/3E/4) 차이, 하이브리드 본딩 전망, 2.5D 패키징(인터포저·CoWoS), 사용 장비

---

## 1. HBM 개요와 기본 구조

HBM은 여러 개의 D램 다이를 수직으로 적층하고, 다이를 관통하는 **TSV(실리콘관통전극, Through-Silicon Via)**로 전기적으로 연결한 뒤, 실리콘 인터포저를 통해 GPU/AI 가속기 로직 다이와 나란히(2.5D) 결합하는 고대역폭 메모리다. 기존 GDDR 대비 핀당 대역폭은 낮지만 수천 개의 I/O를 병렬로 연결해 압도적인 대역폭을 확보하는 것이 핵심 아이디어다.

### 1.1 적층 구조: Base Die + Core Die

- **Base die(베이스 다이, 로직 다이)**: 스택의 최하단에 위치하며 TSV를 통해 올라오는 신호를 GPU/호스트와 인터페이스하는 컨트롤 로직, TSV 리페어(수리) 회로, DFT(테스트) 회로, ESD 보호회로 등을 담당한다. HBM3까지는 SK하이닉스 자체 공정으로 제작했으나, **HBM4부터는 TSMC 등 파운드리의 로직 공정(12나노~3나노급)을 도입**하는 방향으로 전환되고 있다(아래 4장 참조).
- **Core die(코어 다이, D램 다이)**: 실제 데이터를 저장하는 D램 셀 어레이가 형성된 다이로, 여러 장(8/12/16장)이 base die 위에 TSV로 수직 적층된다.
- 최상단 다이를 제외한 모든 다이에는 TSV가 뚫려 있어 신호·전원·접지가 스택 전체를 관통해 전달되고, 최상단 다이는 관통할 필요가 없어 TSV가 없거나 더미로 남는 경우가 많다.

### 1.2 I/O 구성: 1024 → 2048

- HBM3/HBM3E는 스택당 **1024비트** 인터페이스(8개 채널 × 128비트 등)를 사용한다.
- **HBM4부터 인터페이스가 2배인 2048비트**로 확장된다. 이는 베이스 다이와 인터포저 상의 범프·배선 밀도를 크게 높여야 함을 의미하며, 베이스 다이에 로직 파운드리 미세공정이 필요해진 핵심 배경 중 하나다.
- I/O 폭 확대와 함께 핀당 데이터 전송 속도도 세대별로 상승(HBM3E 9.2~12.4Gbps → HBM4 12.8Gbps 이상, 삼성은 13Gbps 시연)하여 스택당 대역폭이 크게 늘어난다.

---

## 2. TSV(실리콘관통전극) 공정

TSV는 D램 코어 다이를 수직으로 전기적으로 연결하는 HBM의 핵심 기술이다. 대표 공정 흐름은 다음과 같다.

1. **비아 식각(Via Etch)**: 웨이퍼 표면(또는 회로 형성 후 이면)에 딥 실리콘 에칭(DSE, Bosch 공정 등)으로 수 마이크로미터 직경, 수십 마이크로미터 깊이의 고종횡비(High Aspect Ratio) 홀을 뚫는다. 이 공정에는 램리서치(Lam Research)의 **Syndion**과 같은 딥 실리콘 에처가 대표적으로 쓰인다.
2. **절연 라이너(Insulating Liner) 형성**: 식각된 비아 내벽에 실리콘 산화막(SiO2)이나 질화막(SiN) 등 절연막을 컨포멀하게 증착해 실리콘 기판과 구리 배선을 전기적으로 절연시킨다.
3. **배리어(Barrier) / 시드(Seed) 층 형성**: 절연 라이너 위에 Ti, TiN, TiW, Ta, TaN, W, WN 등 배리어 금속을 얇게 증착해 구리의 실리콘 확산을 막고, 이어서 Cu, Ru, Ni, Au 등으로 이루어진 시드층을 형성해 이후 전기도금의 기초를 만든다.
4. **구리 충전(Cu Fill, 전기도금)**: 시드층을 전극 삼아 전기도금(ECP, Electro-Chemical Plating)으로 비아 내부를 구리로 완전히 채운다. 이 공정 역시 램리서치의 **SABRE 3D** 등 TSV 전용 도금 장비가 활용된다.
5. **CMP(화학적 기계적 연마)**: 비아를 채우고 남은 상부 잉여 구리·배리어·라이너층을 화학적 기계적 연마로 평탄화해 절연층 표면이 노출될 때까지 연마, TSV 구조를 완성한다.
6. 이후 웨이퍼 박막화(3장), 이면 범프 형성, 다이싱, 칩 적층(5장) 순으로 이어진다.

국내 보도에 따르면 **램리서치가 삼성전자·SK하이닉스에 HBM용 TSV 식각·도금 장비를 사실상 독점 공급**하고 있는 것으로 알려져 있다.

### Via-Middle 공정 흐름 참고

전형적인 via-middle 방식에서는 (1) 웨이퍼 전면에 비아를 형성 → (2) 전면에 솔더 범프 형성 → (3) 캐리어 웨이퍼(임시 지지 웨이퍼) 부착 → (4) 백그라인딩으로 이면 박막화 → (5) 이면에 범프 형성 → (6) 다이싱 → (7) 칩 적층의 순서로 진행된다.

---

## 3. 웨이퍼 박막화 (Backgrinding)

- HBM은 다이를 여러 장 쌓아야 하므로 스택 전체 두께를 규격(통상 720~775µm 패키지 높이 등) 이내로 맞추기 위해 각 다이를 극도로 얇게 갈아내야 한다.
- 일반적으로 **웨이퍼를 30~50µm 수준까지 박막화**하며, 적층 수가 늘어날수록(12단→16단) 목표 두께는 더 얇아진다. 업계 자료에 따르면 **16단 적층의 경우 20~60µm 범위**에서 극도의 균일도(두께 편차 관리)가 요구된다.
- 박막화 과정에서는 웨이퍼가 매우 얇아져 휘거나 깨지기 쉬우므로, TSV 및 범프가 형성된 면을 보호하기 위해 임시 캐리어 웨이퍼(Carrier Wafer)를 접착제로 부착한 뒤 이면을 그라인딩하고, 이후 캐리어를 탈부착(디본딩)하는 Temporary Bonding/Debonding(TB/DB) 공정이 함께 적용된다.
- 이 공정의 대표 장비사가 일본 **DISCO(디스코)** 이며, 웨이퍼 그라인더·그라인딩 휠·다이싱 쏘·레이저 쏘·표면 평탄화 장비 시장에서 세계적 선두 지위를 갖고 있다. DISCO는 생성형 AI발 HBM·첨단 패키징 수요 확대로 지속적 설비투자 수혜를 받고 있으며, 레이저 쏘 누적 출하량이 2026년 2월 기준 4,000대를 돌파하는 등 최근 출하 속도가 가팔라졌다. 이 밖에 ASMPT, Tokyo Seimitsu(Accretech) 등도 웨이퍼 박막화·다이싱 장비 시장의 주요 플레이어다.

---

## 4. 마이크로 범프 형성

- TSV로 관통된 각 다이의 상·하면에는 다이 간 전기적 접속을 위한 **마이크로 범프(µ-bump)**가 형성된다. 범프는 통상 Sn-Ag 계열 솔더 캡을 씌운 Cu 필러(pillar) 형태로, 스퍼터링/도금 공정을 통해 웨이퍼 레벨에서 형성한다.
- 적층 수와 I/O 수가 늘어날수록(1024→2048비트) 범프 피치는 더 좁아져야 하며, 이는 미세 정렬 정밀도와 접합 신뢰성에 대한 요구를 높인다.
- 마이크로 범프가 형성된 다이는 이후 5장의 칩 적층 본딩 공정(TC 본딩 또는 MR-MUF)에 투입된다. 참고로 하이브리드 본딩으로 전환되면 이 마이크로 범프 자체가 사라지고 Cu-Cu 패드 직접 접합 방식으로 바뀐다(6장).

---

## 5. 칩 적층 본딩: TC 본딩 vs SK하이닉스 MR-MUF

HBM 코어 다이를 쌓아 올리는 본딩 방식은 크게 두 가지로 나뉜다.

### 5.1 TC-NCF (Thermal Compression - Non-Conductive Film) 본딩

- 칩과 칩 사이에 **NCF(비전도성 필름)**를 미리 부착한 뒤, 열과 압력(Thermal Compression)을 가해 한 장씩(또는 소수 장씩) 순차 접합하는 방식.
- NCF 필름이 접착제이자 절연(유전체) 역할을 겸한다.
- 삼성전자는 HBM에서 이 NCF 계열 방식을 유지해 온 것으로 알려져 있다.
- 단점: 적층 수가 늘어날수록 다이 1장씩 압착하는 공정 횟수가 늘어 생산성이 떨어지고, 필름의 두께 불균일·휨(warpage)·보이드(공극) 문제가 발생하기 쉽다.

### 5.2 SK하이닉스 MR-MUF (Mass Reflow - Molded Underfill)

- SK하이닉스가 독자적으로 개발·적용해 온 방식으로, **칩을 먼저 모두 적층(범프 간 솔더로 가접합)한 뒤, 한 번에 매스 리플로우(Mass Reflow)로 솔더를 용융 접합**하고, 이어서 칩 사이 빈 공간에 **액체 형태의 몰딩언더필(MUF, EMC 계열 소재)을 모세관 현상으로 주입**해 굳히는(경화) 공정이다.
- 방열 성능이 개선된 에폭시 몰딩 컴파운드(EMC)를 다이 사이 접착 겸 보호재로 사용하며, 액체 상태로 주입되므로 칩 사이 미세한 갭과 굴곡까지 채워 갭필(Gap-fill) 특성이 우수하고, 굳는 과정에서 다이들이 자기 정렬(self-align)되는 효과도 있다.
- TC-NCF 방식 대비 휨(warpage) 및 손상 문제를 개선했다는 것이 SK하이닉스 측 설명이며, 적층 전체를 한 번에 접합·충전하므로 다이 수가 늘어나도 공정 스텝이 상대적으로 덜 늘어나 생산성과 방열 측면에서 강점을 갖는다고 알려져 있다.
- SK하이닉스는 HBM 경쟁력의 핵심 축으로 이 MR-MUF 공정을 사실상 독점적으로 사용해 온 것으로 평가받는다(삼성은 NCF 계열 유지).

### 5.3 Advanced MR-MUF (12단 이상 대응)

- SK하이닉스는 8단 제품(HBM3, HBM3E 8-Hi)에는 기존 MR-MUF를, **12단 제품(HBM3E 12-Hi, HBM4 12-Hi)에는 한 단계 발전된 "Advanced MR-MUF"**를 적용해 양산 중이다.
- Advanced MR-MUF는 소재·공정 최적화를 통해 적층 수가 늘어난 만큼 커진 휨(warpage) 응력과 방열 부담을 개선하고 적층 구조의 안정성을 높인 버전으로 소개된다. SK하이닉스는 HBM4E(12단)에도 Advanced MR-MUF 공정 최적화를 지속해 안정성을 더 높였다고 밝힌 바 있다.
- SK하이닉스는 **16단 HBM(HBM4 16-Hi)에도 검증이 완료된 Advanced MR-MUF를 유지·적용할 계획**이라고 밝혔으며("16단 HBM4도 MR-MUF 유지할 것"), 플럭스리스(fluxless) 본딩이나 하이브리드 본딩으로의 조기 전환보다는 생산 효율성이 검증된 Advanced MR-MUF로 16단까지 대응하겠다는 입장을 보여왔다.

---

## 6. HBM3 / HBM3E / HBM4 세대별 차이

| 구분 | HBM3 | HBM3E | HBM4 (HBM4E) |
|---|---|---|---|
| 인터페이스(I/O) | 1024비트 | 1024비트 | **2048비트** (2배 확장) |
| 스택당 대역폭 | 약 819GB/s | 약 1.15~1.33TB/s | 2.0TB/s 이상, 고급형 3.3TB/s급 목표 |
| 핀 속도 | - | 9.2~12.4Gbps | 12.8Gbps 이상(삼성 13Gbps 시연) |
| 최대 적층 | 8단(8-Hi) | 8단 → 12단(12-Hi), 24GB→36GB | 12단/16단(12-Hi/16-Hi), 16단시 스택당 최대 64GB급(32Gb 다이 기준) |
| 본딩 공정 | MR-MUF | MR-MUF(8단) / Advanced MR-MUF(12단) | Advanced MR-MUF(12단), 16단도 Advanced MR-MUF 적용 방침 |
| 베이스 다이 | SK하이닉스 자체 공정 | SK하이닉스 자체 공정 | **TSMC 등 로직 파운드리 미세공정 도입**(12nm급, 일부 3nm 검토) |
| 코어 다이 공정 | - | - | 1c(10나노급 5세대) D램 공정 등 |
| 전력효율 | - | - | 코어 전압 1.1V→**1.05V**, 이전 세대 대비 최대 60% 효율 개선 목표 |

### 6.1 HBM4의 핵심 변화 — 로직 파운드리 베이스 다이

- SK하이닉스는 HBM3E까지는 자체(메모리) 공정으로 베이스 다이를 제작했으나, **HBM4부터는 TSMC의 로직 공정을 도입**하기로 하고 공식 파트너십을 발표했다("SK hynix Partners With TSMC to Strengthen HBM Technological Leadership").
- 배경은 2048비트로 늘어난 I/O와 고속 인터페이스, TSV 리페어·PHY·컨트롤러 로직 등을 좁은 면적에 구현하려면 메모리 공정보다 로직 파운드리의 미세공정(트랜지스터 밀도·저전력 특성)이 유리하기 때문이다.
- 보도에 따르면 엔비디아向 HBM4에는 **10나노급 5세대(1b) D램 코어 다이 + TSMC 12나노(N12)급 로직 다이** 조합이 사용되는 것으로 알려져 있으며, 범용 HBM4/HBM4E도 TSMC와 협력한 12나노 공정을 활용하는 것으로 전해진다. 이후 HBM4E 세대에서는 **TSMC 3나노(N3) 공정 채택**도 검토 중이라는 보도가 있다(삼성 대비 격차 확보 목적, 다만 로직 다이 제조 원가 부담도 함께 언급됨).
- 이는 HBM 산업 구조에 중요한 변화로, 기존에는 메모리 3사(SK하이닉스·삼성·마이크론)가 베이스 다이까지 자체 제작했지만, HBM4부터는 메모리사와 로직 파운드리(TSMC 등)의 협업이 필수적인 구조로 바뀌고 있음을 의미한다.

### 6.2 발열 대응 — iHBM

- SK하이닉스는 2026년 5월경 발열을 잡는 신기술 **iHBM**을 공개했다. AI 시스템에서 고적층·고대역폭화에 따라 커지는 발열 문제에 대응해 메모리 솔루션 차원에서 열 관리 효율을 높이는 기술로, 차세대 HBM 제품에 적용될 예정이다.

---

## 7. 하이브리드 본딩(Hybrid Bonding) 전망

- **하이브리드 본딩**은 범프나 필러 없이 Cu 패드를 웨이퍼(다이) 간에 직접 접합하는 **Cu-Cu 직접 접합(no-bump copper-copper)** 기술로, 패키징 기술의 궁극적 진화 단계로 꼽힌다. 접속 피치를 10µm 이하로 줄일 수 있어 다이 간 간격과 전체 스택 높이를 크게 낮추고, 대역폭과 전력 효율을 동시에 높일 잠재력이 있다.
- 현재 업계에서는 **16단 이상, 특히 HBM4E(7세대) 혹은 그 이후 세대**에서 하이브리드 본딩이 처음 도입될 가능성이 거론되지만, 기술적 난제(수율, 정렬 정밀도, 접합 강도, 열관리)로 인해 당초 예상보다 도입 시점이 지연되고 있다.
- **삼성전자**: HBM4E(7세대)부터 부분적으로 하이브리드 본딩 도입을 검토 중이며, TC 본딩 대비 열저항이 20% 이상 개선되고 16단 이상 적층을 지원한다고 밝힌 바 있다.
- **SK하이닉스**: 내부적으로 기술 완성도를 높이고 있으며, 하이브리드 본딩 HBM의 수율이 2년 전보다 개선되었다고 밝혔다. 다만 공식적으로는 **20단 D램 적층 시점부터 하이브리드 본딩을 적용**하겠다는 방침을 밝혀, Advanced MR-MUF로 16단까지는 대응하고 그 이후(20단급)에 하이브리드 본딩으로 전환하는 로드맵을 시사하고 있다.
- 업계에서는 **HBM5가 주류가 되는 2029~2030년경**을 하이브리드 본딩 양산 전환의 실질적 변곡점으로 보는 시각이 많다. 최근에는 두께 절감·방열 개선 등 하이브리드 본딩의 핵심 이점에 대한 시급성이 다소 줄었다는 평가도 있으나, HBM의 I/O 수가 더 늘어나면 다시 하이브리드 본딩 도입 필요성이 커질 것이라는 전망도 함께 나온다.
- 장비 측면에서는 네덜란드 **베시(BESI)** 등 하이브리드 본딩 장비사가 삼성전자·SK하이닉스向 장비 검증을 진행 중이며, 한미반도체도 2026년 내 2세대 하이브리드 본더 공개를 예고하는 등 TC본더 업체들도 하이브리드 본딩을 다음 승부수로 준비하고 있다.

---

## 8. 2.5D 패키징 — 실리콘 인터포저와 TSMC CoWoS

- 완성된 HBM 스택은 그 자체로 끝나지 않고, GPU/가속기 로직 다이와 함께 **실리콘 인터포저(Silicon Interposer)** 위에 나란히 배치되는 **2.5D 패키징**을 통해 하나의 모듈로 통합된다. 인터포저는 미세 배선층을 가진 수동 실리콘 기판으로, 그 위의 로직 다이와 HBM 스택 사이를 초고밀도로 연결하는 통신 계층(Silicon Bridge) 역할을 하며, 인터포저와 다이들은 다시 패키지 기판(substrate)에 실장되어 PCB와 연결되는 I/O를 제공한다.
- 이 2.5D 패키징 공정을 사실상 주도하는 것이 **TSMC의 CoWoS(Chip-on-Wafer-on-Substrate)** 기술이다. CoWoS는 로직 다이와 HBM 스택 등 다수의 능동 실리콘 다이를 하나의 수동 실리콘 인터포저 위에 집적하는 대표적 2.5D 패키징 플랫폼으로, 엔비디아 등 AI 가속기 대부분이 이 CoWoS를 통해 HBM과 결합된다.
- **SK하이닉스-TSMC 협력**: 양사는 SK하이닉스의 HBM과 TSMC의 CoWoS(특히 CoWoS-2세대) 기술 통합을 최적화하기 위한 협력에 합의했으며, 공동 고객사(예: 엔비디아 등)의 요구에 대응하기 위해 HBM·2.5D 패키징 R&D 전반에서 긴밀한 파트너십을 유지하고 있다. TSMC의 CoWoS 로드맵은 **CoWoS-L**로 진화하며 2026년 AI 부품向으로 최대 12개 HBM3E/HBM4 스택 탑재를 지원하고, 이후 더 큰 규모의 A16 세대 버전이 2027년경 계획되어 있다.
- **공급망 리스크와 대안 모색**: 그러나 생성형 AI발 수요 폭증으로 TSMC CoWoS 캐파가 심각한 공급 병목을 겪으면서, SK하이닉스는 **인텔의 EMIB(Embedded Multi-die Interconnect Bridge) 기반 2.5D 패키징**을 자사 HBM에 적용하는 R&D를 진행 중인 것으로 보도되었다. 이는 TSMC 의존도를 낮추고 공급망을 다변화하려는 움직임으로 해석된다.
- SK하이닉스는 나아가 HBM을 실리콘 인터포저와 함께 패키징하고 파트너사 다이와 통합해 AI 서버/슈퍼컴퓨팅向 열 최적화 2.5D 모듈로 완성하는 신규 공장(미국 최초의 HBM 2.5D 패키징 공장, 약 39억 달러 투자)을 건설할 계획도 밝힌 바 있어, 후공정(TSV~적층~2.5D 패키징)을 통합한 "HBM 전진기지" 전략(청주 등 국내 19조원 투자 포함)을 강화하고 있다.

---

## 9. 사용 장비 요약

| 공정 단계 | 대표 장비/장비사 | 비고 |
|---|---|---|
| TSV 딥실리콘 식각 | 램리서치(Lam Research) **Syndion** | 고종횡비 비아·트렌치 식각 전용 |
| TSV 구리 도금(충전) | 램리서치 **SABRE 3D** | 전기도금(ECP) 기반 Cu 필 |
| CMP(평탄화) | (다수 CMP 장비사) | 잉여 Cu/배리어/라이너 연마 |
| 웨이퍼 박막화(백그라인딩) | **DISCO(디스코)**, Tokyo Seimitsu(Accretech), ASMPT 등 | HBM 다이 두께 30~50µm(16단은 20~60µm)까지 연마, 디스코가 그라인더·그라인딩휠·다이싱쏘·레이저쏘 시장 선두 |
| 임시 접합/탈접합(TB/DB) | 관련 본더/디본더 장비사 | 캐리어 웨이퍼 부착 후 그라인딩, 이후 디본딩 |
| 칩 적층 TC본딩/MR-MUF | **한미반도체** TC본더(열압착 본더) | 글로벌 HBM용 TC본더 시장 점유율 71.2%(작년 3분기 기준)로 1위, SK하이닉스에 96억원 규모 추가 발주 등. 한화세미텍도 SK하이닉스向 TC본더 공급을 확대 중이며 경쟁 구도 형성. 한미반도체는 고적층 대응 "와이드 TC본더" 및 차세대 하이브리드 본더(2세대)도 준비 중 |
| 하이브리드 본딩 | 네덜란드 **BESI**, 한미반도체(2세대 하이브리드 본더 개발) 등 | 삼성전자 적용 검토·검증 진행 |
| 2.5D 패키징(인터포저 결합) | **TSMC CoWoS**(CoWoS-2/CoWoS-L 등), 인텔 EMIB(검토 중) | SK하이닉스-TSMC 협력 공식화, TSMC 공급 병목에 따른 EMIB 대안 모색 |

---

## 10. 요약 정리

1. HBM은 base die(로직) 위에 core die(D램)를 TSV로 수직 적층한 뒤 실리콘 인터포저를 통해 로직 칩과 2.5D로 결합하는 구조다.
2. TSV 공정은 딥실리콘 식각 → 절연 라이너 → 배리어/시드층 → 구리 전기도금 충전 → CMP 순으로 진행되며 램리서치 장비가 핵심적으로 쓰인다.
3. 다이는 30~50µm(16단은 20~60µm)까지 박막화(백그라인딩)되며 DISCO가 관련 장비 시장을 주도한다.
4. SK하이닉스는 TC-NCF 대신 자체 MR-MUF(적층 후 매스리플로우+몰딩언더필 주입) 공정을 써왔고, 12단부터는 Advanced MR-MUF로 고도화했으며 16단에도 이를 유지할 계획이다. 삼성은 NCF 계열 TC본딩을 유지해왔다.
5. HBM3E는 1024비트 I/O·최대 12단, HBM4는 2048비트로 I/O가 2배 확장되고 12/16단 적층, 스택당 대역폭이 2TB/s 이상으로 뛴다.
6. HBM4부터는 베이스 다이 제작에 TSMC 등 로직 파운드리의 미세공정(12nm급, 향후 3nm 검토)이 도입되어 메모리사-파운드리 협업 구조로 산업이 재편되고 있다.
7. 하이브리드 본딩(범프 없는 Cu-Cu 직접 접합)은 16단 이후 또는 20단급에서 본격 도입될 전망이며, 업계는 HBM5 시대(2029~2030년경)를 실질적 양산 전환점으로 보고 있다.
8. HBM은 TSMC CoWoS 등 2.5D 패키징(실리콘 인터포저)을 통해 로직 다이와 결합되며, SK하이닉스는 TSMC와 공식 협력하는 한편 CoWoS 공급 병목에 대비해 인텔 EMIB 등 대안도 검토하고 있다.
9. 장비 측면에서는 램리서치(TSV 식각/도금), DISCO(웨이퍼 박막화), 한미반도체(TC본더, 시장점유율 1위)가 각 공정 단계의 핵심 장비 공급사로 자리잡고 있으며, 하이브리드 본딩 시대를 대비해 BESI·한미반도체 등이 차세대 본더를 준비 중이다.

---

## 참고 출처

- [SK하이닉스, "16단 HBM4도 MR-MUF 유지할 것" - ZDNet Korea](https://zdnet.co.kr/view/?no=20240425102847)
- [SK하이닉스, 청주에 19조원 쏟는다…후공정 통합 'HBM 전진 기지' - 이코노믹리뷰](https://www.econovill.com/news/articleView.html?idxno=738315)
- [SK하이닉스, HBM4E 2026년 양산 계획 - 국가나노기술정책센터](https://www.nnpc.re.kr/bbs/board.php?bo_table=04_02_01_02_01&wr_id=20391&page=26)
- [SK하이닉스, HBM 발열 잡은 신기술 'iHBM' 공개 - 디일렉](https://www.thelec.kr/news/articleView.html?idxno=57139)
- [SK하이닉스, 계획 앞당겨 HBM4E 12단 샘플 공급...32Gb 1c D램 적용 - 디일렉](https://www.thelec.kr/news/articleView.html?idxno=58283)
- [MR-MUF 기술이란? SK하이닉스 HBM 경쟁력을 만든 핵심 패키징 기술 - 모두의 소식](https://unips.co.kr/mr-muf-%EA%B8%B0%EC%88%A0%EC%9D%B4%EB%9E%80-sk%ED%95%98%EC%9D%B4%EB%8B%89%EC%8A%A4-hbm-%EA%B2%BD%EC%9F%81%EB%A0%A5%EC%9D%84-%EB%A7%8C%EB%93%A0-%ED%95%B5%EC%8B%AC-%ED%8C%A8%ED%82%A4%EC%A7%95-%EA%B8%B0/)
- [SK하이닉스, 발열 잡는 메모리 솔루션 'iHBM' 기술 공개 - SK hynix Newsroom](https://news.skhynix.co.kr/ihbm-solution/)
- [SK hynix Partners With TSMC to Strengthen HBM Leadership](https://news.skhynix.com/sk-hynix-partners-with-tsmc-to-strengthen-hbm-technological-leadership/)
- [SK hynix Partners with TSMC to Strengthen HBM Technological Leadership - Chiplet Marketplace](https://chiplet-marketplace.com/insights/news/sk-hynix-tsmc-partnership-hbm)
- [SK hynix Reportedly Weighs TSMC 3nm for HBM4E Logic Dies - TrendForce](https://www.trendforce.com/news/2026/03/20/news-sk-hynix-reportedly-weighs-tsmc-3nm-for-hbm4e-logic-dies-to-gain-edge-over-samsung/)
- [SK Hynix's HBM4 to Use TSMC's 3nm Base Die - TrendForce](https://www.trendforce.com/news/2024/12/04/news-sk-hynixs-hbm4-to-use-tsmcs-3nm-base-die/)
- [TSMC Showcases Custom C-HBM4E, N3P Logic Dies - TechPowerUp](https://www.techpowerup.com/343529/tsmc-showcases-custom-c-hbm4e-n3p-logic-dies-target-double-efficiency)
- [Deep Dive on HBM - Nomad Semi](https://www.nomadsemi.com/p/deep-dive-on-hbm)
- [램리서치, 삼성·SK에 HBM용 TSV 장비 독점 공급 - 디일렉](https://www.thelec.kr/news/articleView.html?idxno=24420)
- [HBM4 시대의 보이지 않는 병목… '특수 폴리시드 웨이퍼' 공급망 비상 - ICN매거진](https://icnweb.kr/2026/79720/hbm4-%EC%8B%9C%EB%8C%80%EC%9D%98-%EB%B3%B4%EC%9D%B4%EC%A7%80-%EC%95%8A%EB%8A%94-%EB%B3%91%EB%AA%A9-%ED%8A%B9%EC%88%98-%ED%8F%B4%EB%A6%AC%EC%8B%9C%EB%93%9C-%EC%9B%A8%EC%9D%B4%ED%8D%BC/)
- [반도체 후공정 8편 - 웨이퍼 레벨 패키지 공정 - SK hynix Newsroom](https://news.skhynix.co.kr/seominsuk-column-wafer-level-package-2/)
- [SK하이닉스, 한미반도체·한화세미텍에 HBM용 TC 본더 추가 발주 - 디일렉](https://www.thelec.kr/news/articleView.html?idxno=50886)
- [SK하이닉스, 한미반도체 TC본더 추가 발주…HBM4 생산 확대 속도 - EBN](https://www.ebn.co.kr/news/articleView.html?idxno=1711632)
- [한미반도체, HBM '고적층 벽' 넘는다…와이드 TC 본더 공개 - Daum](https://v.daum.net/v/Pcvm7EV7lS)
- [[한미반도체] SK-마이크론 HBM TC 본더 장비 납품…삼성은? - 딜사이트](https://dealsite.co.kr/articles/123773)
- [한미반도체, '2026 세미콘 동남아'서 최신 TC본더 기술 선봬 - 주간한국](https://weekly.hankooki.com/news/articleView.html?idxno=7162698)
- [한미반도체, 2세대 하이브리드 본더 연내 공개 - 뉴데일리](https://biz.newdaily.co.kr/site/data/html/2026/04/09/2026040900108.html)
- [한미반도체 "국내외 HBM4 본더 장비도 전량 수주 자신" - ZDNet Korea](https://zdnet.co.kr/view/?no=20250730154252)
- [DISCO Corporation, The World Leader In Semiconductor Capital Equipment - SemiAnalysis](https://newsletter.semianalysis.com/p/disco-corporation-the-world-leader)
- [2026 News - DISCO Corporation](https://www.disco.co.jp/eg/news/corp/20260302.html)
- [삼성·SK, HBM향 하이브리드 본딩 도입 시점 두고 고심 - ZDNet Korea](https://zdnet.co.kr/view/?no=20260706105015)
- [SK하이닉스 "하이브리드 본딩 HBM, 2년 전보다 수율 개선" - 디일렉](https://www.thelec.kr/news/articleView.html?idxno=55762)
- [HBM '하이브리드 본딩' 전환 가속…삼성·SK하닉·장비사 동시 베팅 - 뉴스핌](https://www.newspim.com/news/view/20260504001058)
- [네덜란드 베시, 삼성전자 하이브리드 본딩 적용 여부 조만간 나온다 - 디일렉](https://www.thelec.kr/news/articleView.html?idxno=56024)
- [SK하이닉스, '하이브리드 본딩' 승부수…차세대 HBM4·5 주도권 굳힌다 - 굿모닝경제](https://www.goodkyung.com/news/articleView.html?idxno=285493)
- ["하이브리드 본딩, HBM4E 이후 도입 전망...더 빨라져야" - 디일렉](https://www.thelec.kr/news/articleView.html?idxno=43517)
- ['기술적 한계 봉착'…"삼성·SK, HBM 20단서 하이브리드 본딩 필수" - EBN](https://www.ebn.co.kr/news/articleView.html?idxno=1687791)
- [CoWoS and HBM Supply Chain - SemiAnalysis](https://newsletter.semianalysis.com/p/ai-capacity-constraints-cowos-and)
- [SK hynix Reportedly Tests Intel EMIB 2.5D Packaging With HBM Amid TSMC CoWoS Tightness - TrendForce](https://www.trendforce.com/news/2026/05/11/news-sk-hynix-reportedly-tests-intel-emib-2-5d-packaging-with-hbm-amid-tsmc-cowos-tightness/)
- [SK hynix to build first U.S. packaging plant for HBM - Tom's Hardware](https://www.tomshardware.com/tech-industry/sk-hynix-to-build-first-us-2-5d-packaging-plant-for-hbm)
- [HBM (High Bandwidth Memory) Supply Chain - SemiconductorX](https://semiconductorx.com/chip-type-hbm.html)
- [HBM3E vs HBM4: Complete Comparison - AIChipLink](https://aichiplink.com/blog/HBM3E-vs-HBM4-Complete-Comparison-of-Next-Generation-High-Bandwidth-Memory_1053)
- [HBM4 vs HBM3 vs HBM3E: Architecture, Performance, and Real-World Deployment - Nevsemi Electronics](https://www.nevsemi.com/blog/hbm4-vs-hbm3-vs-hbm3e-architecture-performance-and-real-world-deployment)
- [HBM3e and HBM4: IC design guide - Siemens](https://blogs.sw.siemens.com/semiconductor-packaging/2026/04/24/hbm3e-hbm4-ic-design-guide/)
- [HBM3e vs HBM4: 2026 Specs, Performance & Supply Guide - Kynix](https://www.kynix.com/Blog/hbm3e-vs-hbm4-2026-specs-performance--supply-guide.html)
- [HBM evolution: from HBM3 to HBM4 and the AI memory war - Introl](https://introl.com/blog/hbm-evolution-hbm3-hbm3e-hbm4-memory-ai-gpu-2025)
- [SK하이닉스, "16단 HBM에도 '어드밴스드 MR-MUF' 적용 가능성 확인" - ZDNet Korea](https://zdnet.co.kr/view/?no=20240903132912)
- [SK하이닉스, 하이브리드 본딩 방식의 12단 HBM 검증 완료 - 테크 소식](https://zod.kr/news/8022268)
- [SK하이닉스, MR-MUF 독점…삼성 'NCF' 유지 - 딜사이트](https://dealsite.co.kr/articles/119413)
- [SK하이닉스, HBM4 플럭스리스 '시기상조'…MR-MUF 지속 - 딜사이트](https://dealsite.co.kr/articles/154849)
- [HBM 적층경쟁...삼성·SK "12단까지는 TC·MR본딩,이후 하이브리드본딩 적용" - 디일렉](https://www.thelec.kr/news/articleView.html?idxno=22984)
