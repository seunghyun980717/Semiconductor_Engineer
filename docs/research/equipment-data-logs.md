# 반도체 팹 설비 데이터 로그 — 실무 심층 리서치

> 대상: FAB 설비(Fab Equipment)가 생성·전송·저장하는 모든 종류의 "데이터 로그" — 통신 프로토콜(SECS/GEM), 상태/가동률 표준(E10/E40/E90/E116), FDC 트레이스, 알람, 레시피 스텝 로그, EES/APC 피드백까지 실무 관점에서 정리.

---

## 0. 전체 그림 — 설비 데이터가 흐르는 경로

```
[설비 컨트롤러 PLC/센서]
   │  (1~10Hz 폴링)
   ▼
[Equipment Controller / EES Host Adapter]  ── SECS/GEM (SEMI E5/E30) ──▶ [MES / Host]
   │                                                                        │
   ├─ FDC Client (트레이스 수집·요약) ──────────────────────────▶ [FDC 서버, APC/R2R 서버]
   ├─ 알람 매니저 (ALCD/ALID) ───────────────────────────────────▶ [알람 모니터링/디스패치]
   ├─ E90 Substrate Tracking (로트/웨이퍼 위치) ──────────────────▶ [MES]
   ├─ E40 Process Job (레시피 실행 상태) ─────────────────────────▶ [MES/Scheduler]
   └─ E10 상태 전이 (PRD/SBY/ENG/SDT/UDT) ────────────────────────▶ [OEE/가동률 대시보드]
```

설비 하나에서 나오는 로그는 성격이 전혀 다른 5~6개 스트림이 동시에 존재한다: **(1) 이벤트/상태 로그(SECS/GEM)**, **(2) 상태 코드 전이 로그(E10)**, **(3) 잡/웨이퍼 트래킹 로그(E40/E90)**, **(4) 고빈도 센서 트레이스(FDC)**, **(5) 알람 로그**, **(6) 레시피 스텝 로그**. 이들은 공통 키(TOOL_ID, LOT_ID, WAFER_ID, RECIPE_ID, STEP_ID, 타임스탬프)로 조인되어야 의미가 생긴다.

---

## 1. SECS/GEM (SEMI E5 / E30) — 설비-호스트 통신의 기본 언어

### 1.1 계층 구조

| 계층 | 표준 | 역할 |
|---|---|---|
| 물리/전송 | SEMI E37 (HSMS) 또는 과거 E4 (SECS-I, RS-232) | TCP/IP 기반 메시지 전달 |
| 메시지 문법 | **SEMI E5 (SECS-II)** | Stream/Function 구조, 데이터 아이템 포맷(리스트/ASCII/정수/불리언 등) |
| 애플리케이션 동작 규약 | **SEMI E30 (GEM)** | 상태모델, 이벤트 리포트, 알람 처리, 원격 커맨드, 데이터 수집 프레임워크를 "표준 동작"으로 규정 |
| 300mm 확장 | SEMI E39/E40/E87/E90/E94/E116 등 (GEM300) | 캐리어/잡/기판/성능 추적 |

SECS-II 메시지는 `SxFy` 형식(Stream x, Function y)으로 이름 붙는다. 홀수 F는 요청(Primary), 짝수 F는 응답(Reply)이다. 데이터는 List(L), ASCII(A), Binary(B), Boolean(BOOLEAN), 정수(I1/I2/I4/I8), 실수(F4/F8) 등의 **아이템 포맷 코드 + 길이 바이트**로 인코딩된 바이너리 구조를 가진다.

### 1.2 GEM 이벤트 리포트 — S6F11 (가장 핵심적인 실시간 이벤트 메시지)

**동작 원리**: 호스트가 사전에 `CEID(Collection Event ID)`에 `RPTID(Report ID)`를 연결(Define/Link, S2F33/S2F35)하고, `RPTID`에 어떤 `SVID/ECID/VID`(상태변수/장비상수/데이터변수)를 포함할지 정의해둔다. 설비에서 해당 이벤트(예: 공정 종료, 캐리어 도착, 레시피 시작)가 발생하면, 폴링이 아니라 **설비가 자발적으로(unsolicited)** S6F11을 보낸다.

**S6F11 메시지 구조 (SML 표기)**

```
S6F11 W
<L
  <U4 DATAID>          -- 메시지 상관관계 식별자 (예: 20250706001)
  <U4 CEID>            -- Collection Event ID (예: 1001 = "PROCESS_END")
  <L                     -- Report 리스트 (하나 이상의 RPTID)
    <L
      <U4 RPTID>        -- 1001 (등록된 리포트 ID)
      <L                -- 해당 RPTID에 정의된 SVID 값들 순서대로
        <A "TOOL01">        -- SVID 1: EquipmentID
        <A "PM_A">          -- SVID 2: ChamberID
        <A "LOT20250706-07">-- SVID 3: CarrierID/LotID
        <A "WFR12">         -- SVID 4: SubstrateID
        <A "RCP_ETCH_HARD_MASK_V3">  -- SVID 5: PPID(RecipeID)
        <U2 15>             -- SVID 6: StepNumber
        <F4 45.2>           -- SVID 7: 실측 온도
      >
    >
  >
>
.
```

호스트는 이를 받고 `S6F12 <B 0x0>` (Acknowledge, 0=accepted)로 응답한다.

**실제 필드 해석 예시 (파싱 후 테이블화)**

| DATAID | CEID | CEID 의미 | TOOL_ID | CHAMBER | LOT_ID | WAFER_ID | RECIPE | STEP | TIMESTAMP |
|---|---|---|---|---|---|---|---|---|---|
| 20250706001 | 1001 | PROCESS_START | ETCH-07 | PM_A | LOT20250706-07 | WFR12 | RCP_ETCH_HM_V3 | 1 | 2026-07-06T09:12:03.114Z |
| 20250706002 | 1050 | STEP_CHANGE | ETCH-07 | PM_A | LOT20250706-07 | WFR12 | RCP_ETCH_HM_V3 | 2 | 2026-07-06T09:12:18.402Z |
| 20250706003 | 1002 | PROCESS_END | ETCH-07 | PM_A | LOT20250706-07 | WFR12 | RCP_ETCH_HM_V3 | 24 | 2026-07-06T09:15:47.881Z |
| 20250706004 | 1100 | CARRIER_ARRIVED | ETCH-07 | LP1 | LOT20250706-08 | — | — | — | 2026-07-06T09:16:02.203Z |

이 CEID 기반 이벤트 로그가 MES/FDC/EES 시스템의 **1차 원천(source of truth) 타임라인**이 된다. 실무에서 CEID는 설비사마다 번호 체계가 다르며(예: AMAT 1000번대=프로세스, 2000번대=핸들러, 3000번대=알람), 설비 SDS(Software Design Spec) 문서에서 CEID/SVID 매핑표를 받아 파싱기를 만든다.

### 1.3 알람 리포트 — S5F1

```
S5F1 W
<L
  <B  0x81>          -- ALCD: bit8=1(SET) + 카테고리 1(Personal Safety)
  <U4 5023>          -- ALID
  <A  "Chamber A Door Interlock Open">  -- ALTX
>
```

- **ALCD (Alarm Code, 1바이트)**: 최상위 비트 = SET(1)/CLEAR(0), 하위 비트 = 카테고리
  - 1=Personal Safety, 2=Equipment Safety, 3=Parameter Control Warning, 4=Parameter Control Error, 5=Irrecoverable Error, 6=Equipment Status Warning, 7=Attention Flags, 8=Data Integrity
- 호스트는 `S5F2 <B 0>`로 즉시 ACK. 알람 리스트 조회는 `S5F5`(요청)/`S5F6`(리스트 응답), 알람 활성화/비활성화는 `S5F3`.

### 1.4 원격 커맨드 / 레시피 다운로드 — S2F41, S7F3

- `S2F41` (Host Command Send): 호스트가 `START`, `STOP`, `PP-SELECT`(레시피 선택) 등의 커맨드와 파라미터를 전송 → 설비 `S2F42`로 `HCACK`(수락/거부 코드) 응답
- `S7F3` (Process Program Send): 호스트→설비로 레시피 본문 업로드, `S7F6`으로 설비→호스트 레시피 조회

---

## 2. SEMI E10 — 설비 상태 분류와 가동률(RAM/Utilization)

### 2.1 6대 상태 (Mutually Exclusive Basic States)

| 상태 코드 | 이름 | 의미 | 세부 코드 예 |
|---|---|---|---|
| **PRD** | Productive | 실제 제품 생산 중 | 1000~1999 |
| **SBY** | Standby | 가동 가능하나 작업(로트/오퍼레이터) 대기 중 | 2100 |
| **ENG** | Engineering | 엔지니어링 런(테스트/실험), PM 후 검증 웨이퍼 | 3000~3999 |
| **SDT** | Scheduled Downtime | 계획된 정비/PM, 계획된 자재 교체 | 4100~4900 |
| **UDT** | Unscheduled Downtime | 고장/미계획 정지 (설비 자체 원인) | 5000번대 |
| **NST** | Non-Scheduled Time | 가동할 계획 자체가 없는 시간(퇴근/공휴일/생산계획 없음) | — |

### 2.2 상태 전이 로그 형태

```
TIMESTAMP,TOOL_ID,FROM_STATE,TO_STATE,STATE_CODE,REASON_CODE,REASON_TEXT
2026-07-06T00:00:00Z,ETCH-07,SDT,PRD,1000,,LotStart
2026-07-06T03:42:10Z,ETCH-07,PRD,UDT,5010,ALM5023,"Chamber A Door Interlock Open"
2026-07-06T04:15:33Z,ETCH-07,UDT,SBY,2100,,RepairComplete_WaitingLot
2026-07-06T04:20:01Z,ETCH-07,SBY,PRD,1000,,LotStart
2026-07-06T08:00:00Z,ETCH-07,PRD,SDT,4300,PM-WEEKLY,"Scheduled PM - Weekly Clean"
2026-07-06T10:30:00Z,ETCH-07,SDT,ENG,3100,QUAL-RUN,"Post-PM Qualification Wafer"
```

이 상태 전이 로그는 보통 **E10 상태변수(SVID)의 변경을 S6F11 이벤트로 받아** 호스트/MES 쪽에서 구간(duration)으로 환산해 저장한다 (즉 E10 자체는 "상태 정의 표준"이고, 실제 전이 이벤트는 SECS/GEM으로 실려온다).

### 2.3 가동률 / OEE 계산 (SEMI E79와 연동)

기본 공식:

```
Total Time = PRD + SBY + ENG + SDT + UDT + NST

Uptime            = PRD + SBY + ENG              (가동 가능 시간)
Downtime          = SDT + UDT
Scheduled Time     = Total Time − NST             (가동 예정 시간)

Availability (가동률) = Uptime / Scheduled Time
                     = (PRD+SBY+ENG) / (PRD+SBY+ENG+SDT+UDT)
```

SEMI E79 OEE(Overall Equipment Efficiency, 반도체 정의는 일반 제조업 OEE와 계산식이 다름에 유의):

```
OEE = Operational Efficiency × Rate Efficiency × Quality Efficiency

Operational Efficiency (E79) = Productive Time / Total Time
Rate Efficiency               = (실제 처리량 × 이론 사이클타임) / Productive Time
Quality Efficiency             = 양품 수량 / 총 처리 수량
```

**예시 계산 (1일 = 1440분, ETCH-07)**

| 상태 | 시간(분) |
|---|---|
| PRD | 1080 |
| SBY | 120 |
| ENG | 60 |
| SDT | 100 |
| UDT | 50 |
| NST | 30 |

```
Total = 1440, Scheduled = 1440-30 = 1410
Availability = (1080+120+60)/(1080+120+60+100+50) = 1260/1410 = 89.4%
Operational Efficiency(E79) = 1080/1410 = 76.6%
```

---

## 3. SEMI E40 (Process Job) / E90 (Substrate Tracking) / E116 (EPT)

### 3.1 E40 — Process Job 상태모델

Process Job(PJ)은 "이 레시피로, 이 웨이퍼(들)을, 이 순서로 처리하라"는 실행 단위다.

**PJ 상태 전이**: `QUEUED → SETTING_UP → WAITING_FOR_START → PROCESSING → (PAUSING→PAUSED→...) → PROCESS_COMPLETE`, 이상 시 `ABORTING/STOPPING` 경로

```
TIMESTAMP,TOOL_ID,PJID,STATE,RECIPE,LOT_ID,WAFER_COUNT
2026-07-06T09:10:00Z,ETCH-07,PJ-000512,QUEUED,RCP_ETCH_HM_V3,LOT20250706-07,25
2026-07-06T09:11:20Z,ETCH-07,PJ-000512,SETTING_UP,RCP_ETCH_HM_V3,LOT20250706-07,25
2026-07-06T09:12:03Z,ETCH-07,PJ-000512,PROCESSING,RCP_ETCH_HM_V3,LOT20250706-07,25
2026-07-06T09:15:47Z,ETCH-07,PJ-000512,PROCESS_COMPLETE,RCP_ETCH_HM_V3,LOT20250706-07,25
```

### 3.2 E90 — Substrate(기판/웨이퍼) 상태모델

개별 웨이퍼 단위 추적. 상태: `NoState → NeedsProcessing → InProcess → ProcessingComplete` (예외: `Rejected`, `Lost`, `Aborted`, `Stopped` 등)

```
TIMESTAMP,SUBSTRATE_ID(WAFER_ID),LOT_ID,SLOT,SUBSTRATE_STATE,LOCATION,ACQUIRED_STATUS
2026-07-06T09:12:03Z,WFR12,LOT20250706-07,12,InProcess,PM_A,Normal
2026-07-06T09:15:47Z,WFR12,LOT20250706-07,12,ProcessingComplete,PM_A,Normal
2026-07-06T09:16:10Z,WFR12,LOT20250706-07,12,ProcessingComplete,OUT_CASSETTE,Normal
```

E87(Carrier Management)과 결합되어 캐리어(FOUP) 도착→슬롯맵 확인→웨이퍼 언로드/로드까지의 전체 자재 흐름 로그를 구성한다.

### 3.3 E116 — Equipment Performance Tracking (EPT)

호스트/오퍼레이터 개입 없이 설비 스스로 **Busy / Idle / Blocked** 상태를 추적해 E10/E79 계산의 원천 데이터를 제공. 특히 로봇, 로드포트, 챔버 등 **서브모듈 단위**로 세분화한다는 게 핵심.

```
TIMESTAMP,TOOL_ID,MODULE,MODULE_TYPE,EPT_STATE,DURATION_SEC
2026-07-06T09:10:00Z,ETCH-07,ROBOT1,TRANSFER_ROBOT,IDLE,80
2026-07-06T09:11:20Z,ETCH-07,ROBOT1,TRANSFER_ROBOT,BUSY,15
2026-07-06T09:11:35Z,ETCH-07,PM_A,PROCESS_MODULE,BUSY,224
2026-07-06T09:15:19Z,ETCH-07,PM_A,PROCESS_MODULE,BLOCKED,12
2026-07-06T09:15:31Z,ETCH-07,PM_A,PROCESS_MODULE,IDLE,45
```

이 모듈별 Busy/Idle/Blocked 로그를 집계하면 챔버별 병목(어느 챔버가 로봇 대기로 Idle이 긴지, 어느 챔버가 Blocked/에러로 손실이 큰지)을 툴 전체 E10 상태 없이도 세밀하게 진단할 수 있다.

---

## 4. FDC(Fault Detection & Classification) 트레이스 데이터

### 4.1 센서 및 샘플링

- 최신 식각/증착 장비 1대(챔버 1개 기준)에서 **수십~150개 이상의 센서 트레이스**가 동시에 수집됨 (RF Forward/Reflected Power, Vpp, DC Bias, 챔버 압력, 가스 유량 MFC1~N, ESC 온도, He 백프레셔, 매칭 네트워크 위치(C1/C2), OES 파장 강도 등)
- 샘플링 주기: **1~10Hz** (일부 RF/광학 센서는 초당 수백 샘플까지도 가능하나 FDC 트레이스로 저장 시 통상 1~10Hz로 다운샘플링)
- 트레이스는 **레시피 스텝 단위로 세그먼트화**되어 저장 (스텝 경계 = SECS 이벤트로 마킹)

### 4.2 Raw 트레이스 로그 예시

```
TIMESTAMP,TOOL_ID,CHAMBER,LOT_ID,WAFER_ID,RECIPE,STEP,PARAM,VALUE,UNIT
2026-07-06T09:13:01.000Z,ETCH-07,PM_A,LOT20250706-07,WFR12,RCP_ETCH_HM_V3,3,RF_FWD_PWR,598.2,W
2026-07-06T09:13:01.000Z,ETCH-07,PM_A,LOT20250706-07,WFR12,RCP_ETCH_HM_V3,3,RF_REFL_PWR,3.1,W
2026-07-06T09:13:01.000Z,ETCH-07,PM_A,LOT20250706-07,WFR12,RCP_ETCH_HM_V3,3,CHAMBER_PRESSURE,42.7,mTorr
2026-07-06T09:13:01.000Z,ETCH-07,PM_A,LOT20250706-07,WFR12,RCP_ETCH_HM_V3,3,GAS_CF4_FLOW,85.3,sccm
2026-07-06T09:13:01.000Z,ETCH-07,PM_A,LOT20250706-07,WFR12,RCP_ETCH_HM_V3,3,GAS_O2_FLOW,12.1,sccm
2026-07-06T09:13:01.000Z,ETCH-07,PM_A,LOT20250706-07,WFR12,RCP_ETCH_HM_V3,3,ESC_TEMP,60.4,degC
2026-07-06T09:13:01.100Z,ETCH-07,PM_A,LOT20250706-07,WFR12,RCP_ETCH_HM_V3,3,RF_FWD_PWR,601.5,W
2026-07-06T09:13:01.100Z,ETCH-07,PM_A,LOT20250706-07,WFR12,RCP_ETCH_HM_V3,3,RF_REFL_PWR,2.9,W
```

(위는 10Hz = 100ms 간격, 실제로는 "wide" 포맷으로 저장하는 경우가 더 흔함 — 아래 참고)

**Wide 포맷 (실무에서 더 흔한 저장 방식, 파라미터가 컬럼)**

| TIMESTAMP | TOOL_ID | CHAMBER | LOT_ID | WAFER_ID | RECIPE | STEP | RF_FWD_PWR | RF_REFL_PWR | PRESSURE_mTorr | CF4_FLOW | O2_FLOW | ESC_TEMP |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 09:13:01.0 | ETCH-07 | PM_A | LOT20250706-07 | WFR12 | RCP_ETCH_HM_V3 | 3 | 598.2 | 3.1 | 42.7 | 85.3 | 12.1 | 60.4 |
| 09:13:01.1 | ETCH-07 | PM_A | LOT20250706-07 | WFR12 | RCP_ETCH_HM_V3 | 3 | 601.5 | 2.9 | 42.8 | 85.1 | 12.0 | 60.4 |
| 09:13:01.2 | ETCH-07 | PM_A | LOT20250706-07 | WFR12 | RCP_ETCH_HM_V3 | 3 | 599.8 | 3.0 | 42.6 | 85.4 | 12.2 | 60.5 |

### 4.3 Summary Indicator 추출 (윈도우/스텝 기반)

FDC의 핵심은 초당 수백~수천 개씩 쌓이는 raw 트레이스를 그대로 SPC에 넣지 않고, **스텝(또는 스텝 내 사용자 정의 윈도우) 단위로 통계량(Summary Indicator/Key Number)을 축약**해 관리도에 태우는 것.

일반적인 인디케이터 함수: `MEAN, MAX, MIN, STD/SIGMA, SLOPE(선형회귀 기울기), RANGE, AREA(적분), TIME_TO_STABLE, INTEGRAL, COUNT(임계값 초과 횟수)`

```
LOT_ID,WAFER_ID,RECIPE,STEP,PARAM,WINDOW_START_S,WINDOW_END_S,INDICATOR,VALUE,SPC_LSL,SPC_TARGET,SPC_USL,SPC_STATUS
LOT20250706-07,WFR12,RCP_ETCH_HM_V3,3,RF_FWD_PWR,0.0,15.0,MEAN,599.4,580,600,620,IN_CONTROL
LOT20250706-07,WFR12,RCP_ETCH_HM_V3,3,RF_FWD_PWR,0.0,15.0,MAX,604.1,,,630,IN_CONTROL
LOT20250706-07,WFR12,RCP_ETCH_HM_V3,3,CHAMBER_PRESSURE,0.0,15.0,MEAN,42.65,40,42,45,IN_CONTROL
LOT20250706-07,WFR12,RCP_ETCH_HM_V3,3,CHAMBER_PRESSURE,0.0,15.0,SLOPE,0.012,-0.05,0,0.05,IN_CONTROL
LOT20250706-07,WFR12,RCP_ETCH_HM_V3,5,ESC_TEMP,0.0,60.0,MEAN,61.8,58,60,62,WARNING
LOT20250706-07,WFR12,RCP_ETCH_HM_V3,5,ESC_TEMP,0.0,60.0,AREA,3708.0,,,,IN_CONTROL
LOT20250706-07,WFR13,RCP_ETCH_HM_V3,5,ESC_TEMP,0.0,60.0,MEAN,63.1,58,60,62,ALARM_OOC
```

- `WINDOW_START_S/END_S`: 스텝 시작 기준 상대 초 (윈도우를 스텝 전체가 아니라 스텝 내 특정 구간으로 더 잘게 나누는 경우도 흔함 — 예: 플라즈마 점화 후 5초는 제외하고 안정구간만 MEAN 계산)
- 이렇게 만들어진 Indicator 값에 **SPC 관리한계(UCL/LCL, USL/LSL)**를 적용해 Out-of-Control(OOC) 시 자동으로 알람/홀드를 트리거하는 것이 FDC의 실제 동작.
- 최근 트렌드(Full-trace/Golden-trace 비교, DTW 기반 유사도, AI/ML 기반 다변량 이상탐지)는 요약통계량만으로는 놓치는 트레이스 형상 이상을 잡기 위해 raw curve 자체를 기준파형과 비교하는 방식도 병행.

---

## 5. 알람 체계

### 5.1 등급 구조 (실무 3단 분류)

| 등급 | 설비 동작 | 예시 |
|---|---|---|
| **Warning** | 공정 지속, 경고만 표시/기록 | 소모품 수명 임박, 파라미터 경계값 근접 |
| **Alarm** | 공정 중단 또는 해당 로트/웨이퍼 처리 보류, 오퍼레이터 조치 필요 | RF 매칭 실패, MFC 유량 이탈, 챔버 압력 이탈 |
| **Interlock** | 즉시 하드웨어 차단(가스/RF/도어 등), 안전 관련 최우선 | 도어 인터록 오픈 중 RF 인가 시도, 배기 압력 이상 |

SECS-II ALCD 바이트로는 위 3단이 아니라 8개 카테고리(Personal Safety/Equipment Safety/Parameter Warning/Parameter Error/Irrecoverable Error/Status Warning/Attention/Data Integrity)로 세분화되며, 실무 알람 매니저는 이를 Warning/Alarm/Interlock 3단으로 재매핑해서 오퍼레이터 UI에 표시하는 경우가 많다.

### 5.2 알람 로그 포맷 예시

```
TIMESTAMP,TOOL_ID,CHAMBER,ALID,ALCD_CATEGORY,SEVERITY,SET_CLEAR,ALARM_TEXT,LOT_ID,WAFER_ID,RECIPE,STEP
2026-07-06T09:14:02.331Z,ETCH-07,PM_A,5023,2,INTERLOCK,SET,"Chamber Door Interlock Open",LOT20250706-07,WFR12,RCP_ETCH_HM_V3,18
2026-07-06T09:14:02.331Z,ETCH-07,PM_A,5023,2,INTERLOCK,SET,"RF Generator Auto-Shutdown",LOT20250706-07,WFR12,RCP_ETCH_HM_V3,18
2026-07-06T09:14:11.045Z,ETCH-07,PM_A,5023,2,INTERLOCK,CLEAR,"Chamber Door Interlock Open",LOT20250706-07,WFR12,RCP_ETCH_HM_V3,18
2026-07-06T09:20:44.812Z,ETCH-07,PM_A,3210,3,WARNING,SET,"MFC2 O2 Flow Deviation >5%",LOT20250706-08,WFR03,RCP_ETCH_HM_V3,5
2026-07-06T10:02:19.500Z,ETCH-07,PM_A,4105,4,ALARM,SET,"RF Match Network Fail to Tune",LOT20250706-09,WFR01,RCP_ETCH_HM_V3,3
```

### 5.3 Nuisance Alarm(과다/무의미 알람) 문제

- **정의**: 실제 조치가 필요 없거나 자동 복구되는데도 반복 발생해 오퍼레이터가 무시하게 되는 알람. ISA-18.2(알람 관리 표준, 프로세스 산업 전반에서 참조)에서도 "설계 불량 알람"의 대표 유형으로 다룸.
- **반도체 FAB에서 흔한 원인**:
  1. SPC 한계값(UCL/LCL)을 지나치게 타이트하게 설정 → 정상 공정 변동에도 알람 (Type-I error 과다)
  2. 순간적 스파이크(예: 플라즈마 점화 순간 RF Reflected Power 튐)를 그대로 알람 조건에 매핑 — Debounce/필터링 없음
  3. 하나의 근본 원인이 여러 인터록을 연쇄적으로 트리거 (Alarm Flood, 위 로그 예시의 5023 두 줄처럼 동시에 여러 알람 발생)
  4. 알람 On/Off 자동 재설정 없이 계속 재발생(Chattering) — 짧은 시간에 SET/CLEAR 반복
- **대응**: 알람 우선순위/등급 재분류, Rate-of-occurrence 기준 상위 알람 자동 억제(Suppression), Root-cause 알람과 연쇄(Consequential) 알람 그룹핑, SPC 관리한계 재계산(Cpk 기반), 알람 발생률 KPI(예: 시간당 알람 수, 오퍼레이터 응답률) 모니터링.

**Nuisance Alarm 분석용 집계 로그 예시**

| ALID | ALARM_TEXT | 발생건수(24h) | 평균 지속(sec) | 자동복구율 | 로트 영향 여부 |
|---|---|---|---|---|---|
| 3210 | MFC2 O2 Flow Deviation >5% | 142 | 1.2 | 98% | 없음(Warning) |
| 5023 | Chamber Door Interlock Open | 3 | 8.7 | 100% | 있음(공정 중단) |
| 4105 | RF Match Network Fail to Tune | 27 | 4.5 | 62% | 있음(재시도 후 진행) |

142건/24h처럼 빈발하지만 영향이 없는 3210번이 대표적 nuisance alarm 후보 — 한계값 재설정 또는 등급 하향 검토 대상.

---

## 6. 레시피 스텝 로그 (Setpoint vs Actual)

레시피는 스텝(Step)의 순서 리스트이며, 각 스텝은 지속시간과 다수의 파라미터 셋포인트를 가진다. 설비는 스텝 진입/종료 시점에 **셋포인트(목표값)와 실측값(실제 도달값, 통상 스텝 종료 시점 또는 스텝 평균)**을 함께 기록한다.

```
LOT_ID,WAFER_ID,RECIPE,STEP,STEP_NAME,STEP_TIME_S,PARAM,SETPOINT,ACTUAL,UNIT,DEVIATION_PCT,IN_SPEC
LOT20250706-07,WFR12,RCP_ETCH_HM_V3,1,Pump_Down,10,CHAMBER_PRESSURE,5.0,5.2,mTorr,4.0,Y
LOT20250706-07,WFR12,RCP_ETCH_HM_V3,2,Gas_Stabilize,5,GAS_CF4_FLOW,80.0,80.3,sccm,0.4,Y
LOT20250706-07,WFR12,RCP_ETCH_HM_V3,3,Main_Etch,15,RF_FWD_PWR,600.0,599.4,W,-0.1,Y
LOT20250706-07,WFR12,RCP_ETCH_HM_V3,3,Main_Etch,15,CHAMBER_PRESSURE,42.0,42.65,mTorr,1.5,Y
LOT20250706-07,WFR12,RCP_ETCH_HM_V3,4,Over_Etch,8,RF_FWD_PWR,450.0,448.9,W,-0.2,Y
LOT20250706-07,WFR12,RCP_ETCH_HM_V3,5,ESC_Dechuck,3,ESC_TEMP,60.0,63.1,degC,5.2,N
LOT20250706-07,WFR12,RCP_ETCH_HM_V3,24,Chamber_Purge,20,N2_FLOW,200.0,198.7,sccm,-0.7,Y
```

- `DEVIATION_PCT = (ACTUAL-SETPOINT)/SETPOINT × 100`
- `IN_SPEC`: 스텝별 개별 파라미터 허용오차(엔지니어링 스펙, SPC 스펙과 별개로 존재하는 경우가 많음) 기준 판정
- 이 로그가 **Golden Recipe(기준 레시피) 대비 드리프트 분석**, **R2R 피드백 트리거**, **설비 간 매칭(Chamber Matching)** 분석의 기초자료가 된다.

---

## 7. EES(Equipment Engineering System)와 APC/R2R 피드백 루프

### 7.1 EES의 역할

EES는 설비로부터 나오는 원시 데이터(SECS 이벤트, FDC 트레이스, 알람, 레시피 로그)를 **수집·정규화·저장**하고, 이를 APC/FDC/수율분석/OEE 등 상위 애플리케이션에 **표준 스키마로 제공**하는 미들웨어 계층. GEM300 표준(E40/E87/E90/E94/E116/E120/E125/E132/E164 등)을 구현하는 실제 소프트웨어가 이 EES(또는 Equipment SW Platform)에 해당하는 경우가 많다.

### 7.2 APC / R2R (Run-to-Run) 피드백 루프 흐름

```
[웨이퍼 N 처리]
   → FDC 트레이스/레시피 로그 수집 (EES)
   → 계측기(Metrology) 측정값 수집 (막두께/CD/오버레이 등, In-line or Off-line)
        │
        ▼
   [R2R 컨트롤러 (EWMA/Kalman 등 알고리즘)]
        │  예측오차 계산 = 목표값 - 실측값
        ▼
   [레시피 파라미터 보정값 계산] (예: 다음 웨이퍼 에치 시간 +0.3s)
        │
        ▼
[웨이퍼 N+1 레시피 셋포인트 자동 조정] → 설비로 S7F3(레시피 변경)/S2F41(파라미터 오버라이드) 전송
```

- **Feedback control**: 같은 챔버에서 방금 처리한 웨이퍼의 계측 결과로 다음 웨이퍼 셋포인트 보정 (Wafer-to-Wafer, W2W)
- **Feedforward control**: 이전 공정 단계(예: 포토)의 측정값을 다음 공정(예: 에치)의 초기 셋포인트에 반영
- **FDC와의 연계**: FDC가 산출한 Summary Indicator(예: Main_Etch 스텝의 RF_FWD_PWR MEAN 드리프트)를 R2R 입력으로 사용하는 **Virtual Metrology(VM)** 방식도 확산 중 — 실측 계측 없이 트레이스 기반 예측값으로 R2R 보정

**R2R 피드백 로그 예시**

```
TIMESTAMP,LOT_ID,WAFER_ID,CHAMBER,RECIPE,METRIC,TARGET,MEASURED,ERROR,CONTROLLER,ADJUSTED_PARAM,OLD_SETPOINT,NEW_SETPOINT,APPLIED_TO
2026-07-06T09:30:00Z,LOT20250706-07,WFR12,PM_A,RCP_ETCH_HM_V3,ETCH_DEPTH_NM,1200,1194.2,-5.8,EWMA(lambda=0.3),MAIN_ETCH_TIME_S,15.0,15.3,WFR13(next)
2026-07-06T09:46:00Z,LOT20250706-07,WFR13,PM_A,RCP_ETCH_HM_V3,ETCH_DEPTH_NM,1200,1201.1,1.1,EWMA(lambda=0.3),MAIN_ETCH_TIME_S,15.3,15.28,WFR14(next)
```

이 루프가 챔버별 소모품 마모(예: 챔버 사용시간 증가에 따른 에치레이트 감소)를 자동 보정해 로트 간 균일성을 유지하는 핵심 메커니즘.

---

## 8. 종합 실전 로그 스키마 예시

실무 데이터 파이프라인(EES → Data Lake/DW)에서 여러 로그를 조인할 때 사용하는 공통 컬럼 구조:

```
TIMESTAMP        (ISO8601, UTC, ms 정밀도)
TOOL_ID          (설비 고유 ID, 예: ETCH-07)
CHAMBER          (챔버/모듈 ID, 예: PM_A)
LOT_ID           (로트/캐리어 ID)
WAFER_ID         (웨이퍼/슬롯 ID)
RECIPE           (PPID, 레시피 이름/버전)
STEP             (스텝 번호)
PARAM            (파라미터명)
VALUE            (측정/설정값)
UNIT             (단위)
SOURCE           (SECS_EVENT | FDC_TRACE | ALARM | RECIPE_LOG | E10_STATE | R2R)
```

**통합 로그 샘플 (여러 소스가 하나의 타임라인에 인터리브된 형태)**

| TIMESTAMP | TOOL_ID | CHAMBER | LOT_ID | WAFER_ID | RECIPE | STEP | PARAM | VALUE | UNIT | SOURCE |
|---|---|---|---|---|---|---|---|---|---|---|
| 09:12:03.114 | ETCH-07 | PM_A | LOT20250706-07 | WFR12 | RCP_ETCH_HM_V3 | 1 | CEID | 1001(PROCESS_START) | — | SECS_EVENT |
| 09:13:01.000 | ETCH-07 | PM_A | LOT20250706-07 | WFR12 | RCP_ETCH_HM_V3 | 3 | RF_FWD_PWR | 598.2 | W | FDC_TRACE |
| 09:14:02.331 | ETCH-07 | PM_A | LOT20250706-07 | WFR12 | RCP_ETCH_HM_V3 | 18 | ALID_5023 | SET | — | ALARM |
| 09:15:00.000 | ETCH-07 | PM_A | LOT20250706-07 | WFR12 | RCP_ETCH_HM_V3 | 5 | ESC_TEMP | 63.1(SP:60.0) | degC | RECIPE_LOG |
| 09:15:47.881 | ETCH-07 | PM_A | LOT20250706-07 | WFR12 | RCP_ETCH_HM_V3 | 24 | CEID | 1002(PROCESS_END) | — | SECS_EVENT |
| 09:16:00.000 | ETCH-07 | PM_A | — | — | — | — | E10_STATE | PRD→SBY | — | E10_STATE |
| 09:30:00.000 | ETCH-07 | PM_A | LOT20250706-07 | WFR12 | RCP_ETCH_HM_V3 | — | MAIN_ETCH_TIME_S | 15.0→15.3 | s | R2R |

---

## 9. 참고 자료 (WebSearch 출처)

- [Your Complete Guide to SEMI SECS/GEM Standards and Integration](https://www.einnosys.com/complete-guide-semi-secs-gem-standards-integration/)
- [What is SECS/GEM? A Beginner's Guide to the Protocol](https://www.inspheretechnology.com/introduction-to-secs-gem/)
- [SECS/GEM Lessons and Concepts (ErgoTech TechWiki)](https://secsandgem.com/wiki/doku.php?id=secs_gem_lessons_and_concepts)
- [A Guide to Understanding GEM - SECS - HSMS](http://www.edgeintegration.com/downloads/Guide_to_understanding_SECS.pdf)
- [SECS-II Message Types (hume.com)](http://www.hume.com/secs/msgs.html)
- [SECS Message Language (SML) - PEER Group](https://www.peergroup.com/resources/secs-message-language/)
- [SECS/GEM Series: Alarms - PDF Solutions](https://www.pdf.com/secs-gem-series-alarms/)
- [ALCD (ErgoTech VIB/TransSECS Scripting API)](https://ergotech.com/docs/api/com/ergotech/secs/ALCD.html)
- [E01000 - SEMI E10 - Specification for RAM and Utilization](https://store-us.semi.org/products/e01000-semi-e10-specification-for-definition-and-measurement-of-equipment-reliability-availability-and-maintainability-ram-and-utilization)
- [SEMI E10: Equipment RAM and Utilization - PEER Group](https://www.peergroup.com/definition-of-standard/semi-e10/)
- [E10 Unmasked – Part 1 (SYSTEMA)](https://www.systema.com/blog/e10-unmasked)
- [E11600 - SEMI E116 - Specification for Equipment Performance Tracking](https://store-us.semi.org/products/e11600-semi-e116-specification-for-equipment-performance-tracking)
- [SEMI E116: Equipment Performance Tracking (EPT) - PEER Group](https://www.peergroup.com/definition-of-standard/semi-e116/)
- [SEMI E90 - Specification for Substrate Tracking](https://store-us.semi.org/products/e09000-semi-e90-specification-for-substrate-tracking)
- [Process Job (E40) - SECS/GEM Interface Manual](https://secs-docs.gathertech.com.tw/gem300/24-process-job-state/)
- [SEMI E157 - Module Process Tracking - Cimetrix](https://www.cimetrix.com/semi-e157-standard)
- [Analysis-Ready FDC in the Age of AI and Big-Data Semiconductor Manufacturing - PDF Solutions](https://www.pdf.com/analysis-ready-fdc-in-the-age-of-ai-and-big-data-semiconductor-manufacturing/)
- [New Frontiers In Fault Detection And Classification - SemiEngineering](https://semiengineering.com/new-frontiers-in-fault-detection-and-classification/)
- [Automatic window generation for process trace (USPTO)](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/11687439)
- [Advanced Process Control (APC) in Semiconductor Manufacturing](https://orbitskyline.com/blog/advanced-process-control-apc-reducing-variability-in-semiconductor-manufacturing/)
- [Run-to-Run Control in Semiconductor Manufacturing - Springer](https://link.springer.com/rwe/10.1007/978-1-4471-5102-9_255-1)
- [Traceability and Lot Tracking in Semiconductor - NexaStack](https://www.nexastack.ai/use-cases/traceability-lot-tracking-semiconductor)
- [Substrate processing apparatus, history information recording method (USPTO)](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/7266418)

> 주의: 위 로그 예시(타임스탬프, 값, ALID 코드 등)는 실무 관행과 표준 구조를 반영해 재구성한 **예시 데이터**이며, 특정 설비사/팹의 실제 원본 로그를 그대로 인용한 것은 아니다. 실제 CEID/SVID/ALID 매핑은 설비사별 SDS(Software Design Spec) 문서를 반드시 확인해야 한다.
