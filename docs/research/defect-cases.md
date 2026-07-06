# 반도체 공정별 실제 불량/이상 사례 리서치

> 조사일: 2026-07-06
> 목적: 반도체 제조 8대 공정(산화, 포토, 식각, 증착, 이온주입, CMP, 금속배선, TSV/HBM) + EDS/패키징 단계에서 실무 발생하는 대표 불량 유형을 데이터 시그니처(SPC 차트 패턴/빈맵 패턴) - 근본원인 - 조치방법 관점에서 정리

---

## 1. 산화(Oxidation) 공정

### 1.1 산화막 두께 불균일 (Thickness Non-Uniformity)

**데이터 시그니처**
- 두께 측정(엘립소미터) 맵에서 **웨이퍼 중심 대비 edge가 더 두꺼운(또는 얇은) 방사형(radial) 패턴**으로 나타남
- SPC 차트에서는 웨이퍼 평균 두께(mean)는 관리 상한/하한 이내지만, **Range(max-min) 또는 within-wafer uniformity(%) 지표가 서서히 상승하는 추세(trend)** 를 보임 → 노(furnace) 열화의 전조
- 로트별 두께 트렌드 차트에서 특정 furnace tube/slot 위치에서만 반복적으로 편차가 큰 경우 tube 위치 종속성 발견

**근본 원인**
- 노(furnace) 내 온도 프로파일 불균일 — 특히 horizontal/vertical furnace에서 wafer edge와 center 간 온도차로 인해 edge의 산화 반응속도가 center보다 빨라짐 (두 지점 간 최대 수 Å 차이 보고)
- 가스(O2/H2O) flow 분포 불균일, 보트(boat) slot 간 gas depletion 효과 (앞쪽 slot에서 가스 소모되어 뒤쪽 slot 산화속도 저하)
- 히터 열화, 온도 센서(thermocouple) drift, 석영관(quartz tube) 오염/크랙
- SiC 등 신소재 웨이퍼의 경우 표면 위치별 산소 확산 거동 차이로 비대칭 불균일 발생

**조치 방법**
- Furnace 온도 프로파일 재보정(ramp/soak 프로파일 튜닝), zone별 온도 오프셋 조정
- Gas injector 위치/유량 재설계, dummy wafer를 이용한 gas depletion 보상(load 앞/뒤 slot에 dummy 배치)
- 정기적인 tube cleaning 및 thermocouple 교정 주기 단축
- SPC상 uniformity 지표에 대해 별도 관리한계 설정, EWMA/CUSUM 차트로 서서히 진행되는 drift 조기 탐지
- Rapid Thermal Oxidation(RTO) 적용 시에는 lamp 개별 zone power 캘리브레이션 강화

---

## 2. 포토(Photo/Litho) 공정

### 2.1 CD(Critical Dimension) Variation

**데이터 시그니처**
- CD-SEM 측정 데이터에서 **Bossung curve**(CD vs Focus, dose를 파라미터로 한 곡선군)가 정상 대비 좌우 비대칭이거나 최적 focus 지점이 이동(shift)됨
- 웨이퍼 맵에서 CD가 필드(field) 단위로 반복되는 패턴(across-field), 혹은 웨이퍼 edge에서 CD가 systematic하게 커지거나 작아지는 radial 패턴
- SPC 관리도에서 CD mean은 안정적이나 표준편차(σ)만 증가 → 노광 장비 반복성(repeatability) 저하 신호

**근본 원인**
- Focus/Dose 이상: 스캐너 leveling 오차, lens heating에 의한 열적 드리프트, 웨이퍼 워프(warpage)로 인한 국소 defocus
- 레티클(mask) CD 오차, PR(감광액) 두께 불균일에 의한 반사방지 조건 변화
- 트랙(track) 장비의 PEB(Post Exposure Bake) 온도 불균일

**조치 방법**
- Focus-Exposure Matrix(FEM) 실험을 통한 최적 focus/dose 재설정, Bossung curve 기반 depth-of-focus(DoF) 최대화 지점 확인
- 스캐너 leveling/알고리즘 재보정, lens 열 보정(APC: Advanced Process Control) 적용
- Mask CD 보정용 픽셀 단위 투과율 보정(광학 근접 보정, OPC와 별개로 mask 자체 투과도 보정)
- PEB hotplate 온도 zone 캘리브레이션

### 2.2 Overlay Misalignment (정렬 불량)

**데이터 시그니처**
- Overlay 계측 데이터에서 벡터맵(vector map)이 특정 방향으로 일관되게 치우친 translation/rotation/magnification 성분 검출
- 웨이퍼 stage 축(X/Y) 방향으로 계통적 편차, 혹은 필드 내에서 랜덤하지 않고 규칙적인 성분(고차항, high-order overlay error) 존재

**근본 원인**
- 웨이퍼 스테이지 초기화 실패, 미케니컬 shift
- 렌즈 이미징 왜곡(optical distortion), lens heating에 의한 열팽창
- 척(chuck) 표면의 미세 오염 입자, 웨이퍼 warpage의 pitch가 pin chuck 흡착 패턴과 안 맞아 보정 불가
- 이전 레이어와의 층간 정렬 기준(align mark) 손상/변형

**조치 방법**
- 정기적 스테이지 미케니컬 정밀도 유지보수, laser 경로/interferometer 청결 관리
- 척 청소 주기 단축, level-sense 시스템으로 노광 전 웨이퍼 topography 정밀 매핑
- 고차 보정(HOA: Higher Order Alignment) 알고리즘 적용, 레이어별 align mark 설계 개선
- Overlay APC 피드포워드/피드백 루프 구축 (이전 레이어 overlay 결과를 다음 노광 보정값에 반영)

### 2.3 PR(포토레지스트) 결함 — Scum/Footing/Bridge

**데이터 시그니처**
- 광학/SEM 결함 검사에서 패턴 사이 잔막(스컴, scum)이 라인 사이를 미세하게 잇는 **micro-bridge** 결함으로 관찰
- 패턴 하단부가 넓어지는 footing 형상이 CD-SEM 단면(cross-section)에서 확인됨
- 결함맵에서 특정 die 좌표에 반복 발생(레티클 결함) 또는 랜덤 분포(현상 공정 이상)로 구분

**근본 원인**
- 노광 후 화학증폭형 레지스트(CAR)의 산(acid) 확산 부족으로 노광부가 완전히 분해되지 않아 스컴 잔류
- 현상(develop) 공정의 PEB 온도/시간 부족, 노광 dose 부족(under-dose)
- 하드마스크 계면에서의 스컴 잔류로 인해 패턴 전사(pattern transfer) 불량 유발

**조치 방법**
- PEB 온도/시간 최적화로 acid diffusion 충분히 진행, dose 상향 조정
- 현상액 농도/현상 시간/현상 방식(puddle/spray) 최적화
- 레티클 정기 클리닝 및 결함 검사, 하드마스크 식각 전 디스컴(descum) 플라즈마 처리 추가

---

## 3. 식각(Etch) 공정

### 3.1 Under-etch / Over-etch

**데이터 시그니처**
- 계측 데이터(막 잔존 두께, CD)에서 목표 대비 편차가 발생: under-etch는 잔막 두께(residual thickness)가 규격 상한 초과, over-etch는 하부막 손실 또는 CD 과소
- SPC 관리도에서 etch rate가 시간에 따라 서서히 감소(chamber drift) — 이는 chamber 내벽 polymer 축적에 따른 특성 변화
- End Point Detection(EPD) 신호의 트리거 시점이 로트/웨이퍼별로 지연되거나 앞당겨짐

**근본 원인**
- 플라즈마 파워, 가스 유량/압력 drift, chamber 벽 컨디셔닝 상태 변화(직전 레시피의 잔류 영향 — 다음 로트로 완전히 sweep되지 않고 수 회 가동 후에야 안정화)
- RF 매칭 네트워크 노후화, 전극/샤워헤드 마모
- 웨이퍼 내 pattern density 차이에 의한 micro-loading effect (밀집 패턴 vs 저밀도 영역 간 etch rate 차이)

**조치 방법**
- Chamber seasoning(더미 웨이퍼 처리) 절차 표준화, PM(Preventive Maintenance) 후 안정화 run 수 확보
- EPD 알고리즘에 다중 파장 모니터링 적용, over-etch time(over-etch %) 최적화
- RF 매칭/전극 정기 교체, 레시피 별 CD bias 보정계수 적용

### 3.2 프로파일(Profile) 이상 — Bowing, Tapering, Undercut

**데이터 시그니처**
- SEM 단면 이미지에서 측벽이 볼록하게 튀어나오는 bowing, 상부가 넓고 하부가 좁은 taper, 마스크 아래로 파고드는 undercut 관찰
- CD-SEM top/bottom CD 비율(profile angle)이 스펙 이탈

**근본 원인**
- 이온-중성입자 충돌(sheath 내)로 인해 이온 일부가 측벽에 경사 입사 → 측벽 lateral etch 발생 (bowing)
- Passivation(polymer) 부족 시 undercut 발생, 과도한 passivation 시 마스크 형상 그대로 전사되지 않고 taper 발생
- 종횡비(aspect ratio) 증가에 따른 RIE lag(aspect-ratio dependent etching)

**조치 방법**
- 가스 조성(passivation gas 비율) 최적화, 펄스 플라즈마(pulsed plasma)로 sheath 이온 에너지 분포 제어
- 압력/바이어스 파워 조정으로 이온 지향성(directionality) 개선
- Cryogenic etch 또는 ALE(Atomic Layer Etching) 적용으로 고종횡비 구조의 profile control 강화

### 3.3 플라즈마 데미지(Plasma Induced Damage, PID)

**데이터 시그니처**
- 게이트 산화막 신뢰성 테스트(TDDB, Vt shift)에서 특정 antenna ratio(폴리/메탈 면적 대 게이트 면적 비)가 큰 셀에서 게이트 누설전류 증가, Vt 이동
- EDS 단계에서 특정 회로 패턴(큰 metal antenna를 가진 net에 연결된 트랜지스터)에서만 실패율 상승 — 랜덤 결함이 아닌 설계 의존적 systematic 실패

**근본 원인**
- Antenna Effect: 식각/증착 등 플라즈마 공정 중 floating 상태의 도전체(폴리/메탈)가 안테나처럼 전하를 모아 게이트 산화막으로 방전되며 손상 유발
- 게이트 면적 대비 안테나 면적 비율이 클수록 손상 심화(reverse antenna effect: 게이트 면적이 작을 때 더 취약)
- Electron shading effect: 고종횡비 구조에서 이온/전자 궤적 차이로 국소 charging 발생

**조치 방법**
- 설계 단계에서 Antenna Rule(최대 antenna ratio 제한) 적용, 안테나 다이오드(protection diode) 삽입
- 레이아웃 시 점퍼(jumper) 배선으로 안테나 면적을 여러 레이어에 분산
- 공정 측면에서 플라즈마 균일성 개선, RF 주파수/펄싱으로 charging 저감

### 3.4 Chamber 오염에 의한 파티클(Particle)

**데이터 시그니처**
- 파티클 검사 장비(SP 계열)에서 웨이퍼 edge에 국소적으로 집중된 파티클 클러스터, 혹은 특정 챔버/포켓 사용 이력과 상관된 파티클 카운트 급증
- 로트 진행 순서에 따라 파티클 수가 점증하다가 PM 직후 급감하는 saw-tooth 패턴(챔버 벽 polymer 축적 → PM으로 리셋)

**근본 원인**
- RF 플라즈마 on/off 전환 시(intermittent discharge) 파티클이 웨이퍼의 양전위 표면에 끌려 부착 — 연속 방전 대비 파티클 수 증가
- Chamber 내벽/샤워헤드에 축적된 polymer residue가 박리되어 파티클화
- 챔버 코팅재(Y2O3 등) 플라즈마 침식(erosion)에 의한 파티클 생성, 이전 공정의 오염이 다음 로트까지 완전히 제거되지 않음(carry-over)

**조치 방법**
- Wet clean 및 dry clean(플라즈마 클린) 주기 최적화, PM 주기 단축
- Chamber 내벽 코팅재 개선(내식성 높은 세라믹 코팅), 정기 코팅 재도포
- 플라즈마 점화/소등 시퀀스 최적화로 intermittent discharge 최소화
- 챔버별 파티클 트렌드 SPC 관리 및 사용시간 기반 예방정비(PdM) 도입

---

## 4. 증착(Deposition: CVD/PVD/ALD) 공정

### 4.1 두께/Step Coverage 불량

**데이터 시그니처**
- 두께 맵에서 필드 내 위치별(트렌치 상부 vs 하부) 두께 편차가 큼 — 특히 고종횡비 구조에서 상부/하부 두께비(step coverage %)가 스펙 미달
- SPC 차트에서 챔버별 증착률(deposition rate)이 시간에 따라 drift, 웨이퍼간 두께 산포 증가

**근본 원인**
- PVD: 시선(line-of-sight) 특성상 트렌치 하부보다 상단부에 우선 증착되어 결과적으로 하부는 얇고 상단은 두꺼운 비대칭 증착
- CVD: 표면온도 의존적 반응속도 — 챔버가 이상적인 하부 커버리지 온도보다 높게 유지되면 대부분 반응이 트렌치 상단에서 발생
- 구조의 형상(재진입형 re-entrant gap), aspect ratio가 클수록 보이드(void) 발생 위험 증가

**조치 방법**
- ALD 또는 고순응성(conformal) CVD/PECVD 공정으로 대체, 반응가스 유입 각도 최적화(82~62도 범위 등)
- PVD의 경우 collimator, IMP(Ionized Metal Plasma), 웨이퍼 바이어스 적용으로 지향성 개선
- 리플로우(reflow) 어닐 공정 추가로 상부 오버행(overhang) 제거 후 재유동

### 4.2 보이드(Void) 결함

**데이터 시그니처**
- X-ray/SAM(Scanning Acoustic Microscopy) 또는 단면 SEM에서 트렌치/비아 내부에 공극(void) 관찰
- 전기적 테스트에서 저항 산포 증가 또는 개방(open) 불량으로 나타남

**근본 원인**
- Step coverage 불균일로 인해 상단부가 먼저 막히면서(pinch-off) 하부 gas 이동 통로가 차단되어 내부에 미충전 공간(void) 형성
- 재진입형(re-entrant) 프로파일에서 특히 발생 심화

**조치 방법**
- Bottom-up fill 화학(예: 구리 전해도금의 superfill additive)로 하부부터 우선 충전
- 저온/고압 리플로우 공정, 갭필(gap-fill) 특화 CVD(HDP-CVD 등) 적용
- 식각 프로파일 자체를 top이 넓은 tapered 형태로 사전 설계하여 pinch-off 방지

---

## 5. 이온주입(Ion Implantation) 공정

### 5.1 Dose 불균일

**데이터 시그니처**
- Sheet resistance(Rs) 맵에서 웨이퍼 내 특정 방향(스캔 방향 또는 회전축 방향)으로 계통적 구배(gradient) 패턴
- Rs 4-point probe 측정의 색상 콘투어 맵(color contour map)에서 빔 형상(beam profile)을 반영한 줄무늬 또는 방사형 패턴
- SPC에서 로트 평균 Rs는 정상이나 웨이퍼 내 uniformity(%)만 이상 상승

**근본 원인**
- 빔의 공간적 분포(beam profile) 불균일 및 스캔 속도/횟수 불일치로 특정 영역에 dose가 과다/과소 주입
- 웨이퍼 회전/스캔 기구의 기계적 편차, 빔 전류 drift
- 웨이퍼 이면(backside) 파티클에 의한 척킹 불량 → 국소적 빔 입사각/온도 편차로 활성화율 차이

**조치 방법**
- 빔 프로파일 정기 모니터링(패러데이 컵 어레이) 및 스캔 알고리즘(멀티패스 스캔) 최적화로 dose uniformity 확보
- 웨이퍼 이면 파티클 검사 강화, 프리클린(pre-clean) 공정 추가
- Rs 풀웨이퍼 맵을 이용한 implanter별/축별 캘리브레이션, IITS(Ion Implant Test Site) 기반 정기 uniformity 검증

---

## 6. CMP(화학기계연마) 공정

### 6.1 Dishing / Erosion

**데이터 시그니처**
- 프로파일 계측(단차 측정)에서 넓은 구리 패턴 영역이 오목하게 파인 형상(dishing), 밀집 패턴 영역에서 산화막까지 함께 깎여 전체 단차가 낮아지는 형상(erosion)
- 패턴 밀도(density)별 두께 맵을 그리면 저밀도(넓은 패드) 영역에서 dishing 깊이가 크고, 고밀도 영역에서 erosion이 크게 나타나는 상관관계 확인

**근본 원인**
- 연마 시 소재 간 제거율(removal rate) 차이 — 구리(연질)가 산화막(경질)보다 빨리 깎임
- 패턴 밀도 불균일에 따른 패드 압력 분산 차이(넓은 영역일수록 패드가 눌려 들어가 과연마)
- 오버폴리싱(over-polishing) 시간 과다

**조치 방법**
- Dummy fill 패턴 삽입으로 레이아웃 전체의 패턴밀도 균일화
- 연마 압력 프로파일/슬러리 선택비(selectivity) 최적화, 2-step CMP(bulk removal + buff) 적용
- 종말점 검출(EPD) 정밀화로 오버폴리싱 시간 최소화

### 6.2 스크래치(Scratch)

**데이터 시그니처**
- 결함 검사에서 웨이퍼 전면에 랜덤하게 분포한 긴 직선형 스크래치(슬러리 기인) 또는 패드 회전 방향을 따라 호(arc)/방사형 패턴으로 나타나는 스크래치(패드 기인)로 구분됨

**근본 원인**
- 슬러리 기인: 슬러리 내 과대입자(oversized/agglomerated particle), 특히 슬러리 베이스와 H2O2 첨가제가 만나는 POU(Point-of-Use) 믹싱 매니폴드에서 응집 발생
- 패드 기인: 컨디셔너(conditioner) 마모 부스러기, 패드 shedding(패드 재질 박리)

**조치 방법**
- 슬러리 필터링 강화(POU 필터 교체 주기 단축), 믹싱 매니폴드 정기 세정
- 패드 컨디셔너 정기 교체, 패드 수명 관리(사용 웨이퍼 수 기준 교체)
- 결함맵 상 스크래치 방향성 분석으로 슬러리성/패드성 근본원인 신속 구분

---

## 7. 금속배선(Interconnect/Metal) 공정

### 7.1 Electromigration (EM)

**데이터 시그니처**
- 신뢰성 시험(EM stress test)에서 저항이 시간에 따라 서서히 증가하다가 급격히 상승하는 저항-시간 곡선, 특정 net/via에서 조기 실패(early/weak mode) 발생
- Failure 분포가 로그정규(log-normal) 분포를 따르며, TTF(Time-to-Failure) 산포 확대

**근본 원인**
- 전류밀도 증가에 따라 구리 원자가 전자풍(electron wind)에 밀려 이동, cathode 측 via 하부에 slit-void 형성(early failure mode) 또는 라인 전체를 가로지르는 void 성장(late failure mode)
- 결정립계(grain boundary) grooving 모델에 따른 보이드 형성, 표면 불순물이 보이드 형태에 영향
- Via 직하부 보이드가 가장 심각한 신뢰성 리스크로 보고됨

**조치 방법**
- 배선 설계 시 전류밀도 규정(EM rule) 준수, 폭이 넓은 배선/redundant via 적용
- Cu 합금화(도핑) 또는 캡핑막(capping layer, 예: CoWP) 적용으로 표면 확산 경로 차단
- 어닐링 공정으로 결정립 성장 촉진(grain 경계 감소)하여 확산 경로 최소화

### 7.2 Via 불량(Void, Open/High Resistance)

**데이터 시그니처**
- 전기 테스트에서 via chain 저항 산포 증가 또는 open 불량, EDS 빈맵에서 특정 다이/특정 위치에 반복되는 open 실패
- X-section SEM/FIB 분석에서 via 내부 void, 계면 delamination 관찰

**근본 원인**
- 배리어/시드층 step coverage 불량으로 via 하부 충전 불완전 → void
- CMP 후 계면 오염, 어닐 부족으로 인한 응력/보이드 잔류
- 듀얼다마신(dual damascene) 공정에서 트렌치-비아 계면의 시드층 단절(seed layer discontinuity)

**조치 방법**
- 배리어/시드 증착 스텝커버리지 개선(ALD 배리어 도입), 전해도금 bottom-up 충전 화학 최적화
- CMP 후 계면 세정 강화, 저온/장시간 어닐로 응력 완화 및 그레인 성장
- Via chain 테스트 구조를 이용한 인라인 모니터링으로 조기 검출

---

## 8. TSV / HBM (3D 적층 패키지) 공정

### 8.1 TSV Cu Fill Void

**데이터 시그니처**
- SAM/X-ray 검사에서 TSV 내부에 보이드(바닥부, 심라인(seamline), 상부 등 위치별로 다양하게 관찰)
- 전기 테스트에서 TSV 체인 저항 상승/개방

**근본 원인**
- 전해도금 시 top-down fill(상단부터 채워짐)이 발생하면 내부에 보이드가 갇힘 — bottom-up superfill 화학(억제제/촉진제 첨가제 조합)이 부적절할 때 발생
- 도금 후 어닐(약 400도, N2 분위기) 부족 시 Cu 결정립 성장 및 압축응력 이완이 불충분하여 보이드/웨이퍼 휨 잔존

**조치 방법**
- Bottom-up superfill 첨가제 레시피 최적화(억제제-가속제 균형), 전류 파형(펄스/역펄스 도금) 제어
- 도금 후 어닐 조건 최적화로 그레인 성장 촉진 및 응력 이완, 웨이퍼 bow 저감
- SAM 인라인 검사로 TSV 보이드 조기 검출 및 로트 격리

### 8.2 범프 Non-wet (Bump Non-wetting)

**데이터 시그니처**
- 접합 후 X-ray/초음파 검사에서 특정 위치(주로 패키지 중앙부)에 범프 미접합(non-wet) 클러스터 관찰
- 패키지 warpage 측정(shadow moire 등)에서 리플로우 온도 프로파일 구간별 휨량이 큰 패키지에서 non-wet 집중 발생

**근본 원인**
- 유기 기판과 실리콘 다이 간 CTE(열팽창계수) 미스매치로 인한 고온 휨(warpage) 발생 — warpage가 충분히 제어되지 않으면 중앙부 범프가 기판과 접촉하지 못해 non-wet 발생
- 저CTE 기판 미사용, 리플로우 프로파일(피크온도, 냉각속도) 부적절

**조치 방법**
- 저CTE 기판 소재 채택, 코어리스(coreless) 설계 등으로 강성/CTE 매칭 개선
- 리플로우 프로파일 최적화(warpage가 최소가 되는 온도 구간에서 접합되도록 profile 튜닝)
- 인라인 warpage 측정(고온 in-situ shadow moire)으로 온도별 휨 거동 사전 파악 후 공정 반영

### 8.3 적층 Warpage

**데이터 시그니처**
- 웨이퍼/패키지 휨 측정 장비에서 상온 대비 고온에서 휨량이 급격히 증가하는 온도-휨 곡선(bow vs temperature) 이상
- 적층 수(다이 개수) 증가에 따라 warpage가 누적적으로 커지는 경향

**근본 원인**
- 각 층(실리콘 다이, TSV 구리, 몰드/언더필, 기판) 간 CTE 미스매치가 누적
- 얇아진 다이(박막화)로 인한 강성 저하로 warpage에 더 취약

**조치 방법**
- 층별 소재 CTE 매칭 설계, 대칭 적층 구조로 응력 상쇄
- 임시 캐리어(temporary carrier)를 활용한 박형 다이 핸들링 공정 최적화
- 몰드/언더필 경화 프로파일 조정으로 잔류응력 최소화

### 8.4 언더필(Underfill) Void

**데이터 시그니처**
- SAM 검사에서 언더필 내부에 기포형 보이드 관찰, 특히 범프 주변 또는 코너부에 집중
- 열충격 신뢰성 시험 후 보이드 주변에서 크랙 진전 관찰

**근본 원인**
- 경화(cure) 2단계(약 170도) 및 고온 리플로우(약 260도) 과정에서 수분/휘발성분이 기화되며 보이드/크랙 형성
- 언더필 도포 전 수분 흡습, 소재 오염, 아웃개싱(outgassing) 문제, 경화 프로파일 부적절

**조치 방법**
- 언더필 도포 전 베이크(bake-out)로 수분 완전 제거, 보관/취급 시 방습 관리 철저
- 경화 프로파일 재설계(단계적 승온으로 휘발분 서서히 배출되도록)
- 저점도/저휘발성 언더필 소재로 대체, 캐필러리 언더필 대신 몰디드 언더필(MUF) 검토

---

## 9. EDS(전기적 다이 소팅) 빈맵(Bin Map) 패턴 분석

웨이퍼 빈맵(Wafer Bin Map)은 EDS/CP(Circuit Probe) 테스트 결과를 웨이퍼 좌표에 시각화한 것으로, 패턴 형태 자체가 공정 이상의 지문(fingerprint) 역할을 한다. 대표적으로 **center, donut, edge-ring(ring), edge-loc, loc(local cluster), scratch, random(무작위)** 의 7대 클래스로 분류된다.

### 9.1 Edge Fail 패턴
- **형태**: 웨이퍼 최외곽 링(edge) 부분에 실패 다이가 집중
- **근본원인**: edge exclusion 부족, 노광/코팅 시 edge bead 잔류, CMP/식각 공정에서 edge 효과(에지 전계 집중, 슬러리/가스 flow edge effect), 이온주입 시 edge 빔 프로파일 저하, 웨이퍼 핸들링에 의한 edge chipping
- **조치**: Edge bead removal(EBR) 공정 강화, 각 공정 edge 레시피(edge compensation) 최적화, 웨이퍼 캐리어/척 edge 접촉부 점검

### 9.2 Center Fail 패턴
- **형태**: 웨이퍼 중심부에 실패가 집중
- **근본원인**: 박막 증착 단계 이상(가스/액체 flow, pressure 이상이 center 영역에서 발생), 스핀코팅 시 액체 분사 노즐 위치 편향, CMP 패드 압력 프로파일이 center에서 과도/부족
- **조치**: 증착 챔버 가스 injector/샤워헤드 대칭성 점검, 스핀코터 노즐 정렬 재조정, CMP 리테이너링/캐리어 압력 프로파일 재조정

### 9.3 Ring(Edge-Ring) 패턴
- **형태**: 웨이퍼 edge에서 일정 반경 안쪽으로 도넛형 고리(ring) 형태 실패
- **근본원인**: 식각 공정 이상(예: edge 근처 플라즈마 밀도 불균일)에 의한 ring 형상 결함, 레이어 간 정렬(overlay)이 저장/이송 중 틀어져 발생하는 layer-to-layer misalignment
- **조치**: 식각 챔버 edge ring(consumable part) 마모 점검 및 교체, 챔버 내 플라즈마 균일성 튜닝, 웨이퍼 저장/이송 트레이의 정렬 정밀도 점검

### 9.4 Donut 패턴
- **형태**: Ring과 유사하나 중심부까지 포함하는 원형/도넛형 실패 분포
- **근본원인**: 식각 공정이 불균일하게 수행되어 회로 패턴 일부가 잘려나가는 uniformity 저하
- **조치**: 식각 균일성(uniformity) 재확보를 위한 레시피/챔버 컨디셔닝, EPD 다중 포인트 모니터링

### 9.5 Loc(국소 클러스터) / Edge-Loc 패턴
- **형태**: 웨이퍼 특정 국소 영역(모서리 근처 포함)에 뭉쳐진 실패 클러스터
- **근본원인**: 파티클(이물)에 의한 국소 결함 — 챔버 내 특정 위치의 이물 낙하, 특정 슬롯/포켓 오염
- **조치**: 파티클 소스 트레이스백(챔버/로봇암/카세트 파티클 모니터링), 해당 슬롯/포켓 청소 및 사용 이력 추적

### 9.6 Scratch(스크래치 라인) 패턴
- **형태**: 웨이퍼 표면을 가로지르는 직선 또는 곡선형 실패 라인
- **근본원인**: 웨이퍼 이송 로봇의 핸드오프(hand-off) 오류로 인한 물리적 충격/긁힘, CMP 슬러리/패드 스크래치가 전기적 실패로 이어진 경우
- **조치**: 로봇 핸드오프 티칭(teaching) 재조정 및 정기 점검, 이송 트레이/카세트 슬롯 청결 관리, CMP 스크래치 근본원인(6.2절)과 연계 조치

### 9.7 Random(무작위) 패턴
- **형태**: 특정 공간적 상관관계 없이 무작위로 분포된 실패
- **근본원인**: 통계적으로 낮은 확률의 결함(코스믹 레이, 랜덤 파티클, 회로 설계 마진 부족 등)이 산발적으로 발생 — 공정 이상이라기보다 baseline defect density에 해당
- **조치**: 별도의 systematic 조치보다는 전체 defect density 관리(파티클 총량 저감), 설계 마진 재검토

> **활용 포인트**: 딥러닝 기반 빈맵 분류(CNN, mixed-type pattern 인식 등)가 최근 자동화되어, 여러 패턴이 혼재된 mixed-type defect(예: edge-ring + scratch 동시 발생)까지 인식하는 연구가 진행 중이며, 이는 복합 근본원인(예: 식각 이상 + 이송 스크래치가 동시 발생)의 신속한 분리 진단에 활용됨

---

## 10. 패키징(Packaging) 공정

### 10.1 다이 크랙(Die Crack)

**데이터 시그니처**
- 최종 테스트/신뢰성 시험에서 갑작스러운 개방(open) 불량 또는 누설전류 급증, X-ray/음향현미경(C-SAM)에서 다이 내부 크랙 라인 관찰
- 특정 로트/특정 다이 두께 조건에서 집중 발생하는 상관관계

**근본 원인**
- 다이싱(dicing) 공정에서의 기계적 응력, 박형 다이(thin die) 핸들링 중 휨 응력
- 몰딩/큐어 공정 중 열응력, 다이어태치(die attach) 접착층 불균일에 의한 국소 응력 집중
- 패키지 레벨에서 열사이클링에 의한 응력 축적으로 잠재 크랙이 전파

**조치 방법**
- 다이싱 블레이드/레이저 다이싱 조건 최적화(스텔스 다이싱 등 저응력 공정 도입)
- 다이어태치 필름(DAF) 균일 도포 및 보이드 최소화
- 박형 다이 핸들링용 캐리어/스티프너(stiffener) 적용, C-SAM 인라인 검사로 조기 크랙 검출

### 10.2 와이어 본딩 불량

**데이터 시그니처**
- 와이어 풀 테스트(wire pull test)/볼 전단 테스트(ball shear test)에서 접합강도 미달, 히트크랙(heel crack) 위치에서 파단
- 몰딩 후 X-ray에서 와이어 스윕(wire sweep, 와이어가 몰드 컴파운드 유동에 밀려 휘어짐) 관찰, 인접 와이어 간 단락(short) 발생

**근본 원인**
- 힐 크랙: 와이어가 본드-루프 전환부에서 루핑 스트레스나 열사이클 응력을 받아 발생
- 와이어 스윕: 몰드 컴파운드 주입 시 유동 압력이 균형을 이루지 못해 와이어가 밀림
- 본드패드 오염, 본딩 파라미터(force/power/time) 불일치, 리드포스트 몰드 접착 불량으로 인한 박리(delamination) 확산 시 스티치본드 파손

**조치 방법**
- 본딩 파라미터(초음파 파워/본드력/시간/온도) 최적화 및 정기 캘리브레이션
- 몰드 컴파운드 유동 시뮬레이션 기반 게이트/벤트 설계 최적화로 유동 불균형 저감
- 본드패드 표면처리(플라즈마 클린) 강화, 저루프(low-loop) 본딩 프로파일 적용으로 힐크랙 저감

### 10.3 몰드 컴파운드 보이드(Mold Void)

**데이터 시그니처**
- X-ray/C-SAM 검사에서 몰드 내부 기포(공극) 관찰, 주로 와이어 밀집 영역이나 코너부에 집중
- 열충격 시험 후 보이드 주변에서 몰드-다이 또는 몰드-리드프레임 계면 박리(delamination) 진전 관찰

**근본 원인**
- 압축성형(compression molding) 시 불균형한 몰드 유동으로 인해 미충전 영역 발생
- 몰드 컴파운드의 아웃개싱, 성형 전 흡습(moisture), 경화 프로파일 부적절
- 공극이 열방출 경로를 막아 국소 핫스팟(hot spot) 유발, 장기적으로 신뢰성 저하

**조치 방법**
- 몰드 프로파일(주입 속도/압력/온도) 최적화, 진공 몰딩(vacuum molding)으로 기체 배출 개선
- 몰드 컴파운드 사전 베이크아웃으로 흡습 제거, MSL(Moisture Sensitivity Level) 관리 철저
- C-SAM 인라인 검사를 통한 보이드 검출 및 게이트/벤트 위치 재설계

---

## 11. 요약 — 공정별 데이터 시그니처 ↔ 근본원인 매핑 표

| 공정 | 대표 불량 | 데이터 시그니처 | 근본 원인(대표) | 조치(대표) |
|---|---|---|---|---|
| 산화 | 두께 불균일 | 두께맵 radial 패턴, uniformity% 서서히 상승 | furnace 온도/가스 불균일 | 온도 프로파일 재보정, gas depletion 보상 |
| 포토 | CD variation | Bossung curve 비대칭, σ 증가 | focus/dose drift, lens heating | FEM 최적화, APC 보정 |
| 포토 | Overlay misalign | 벡터맵 계통적 편차 | 스테이지/렌즈 왜곡, 척 오염 | 스테이지 정비, HOA 보정 |
| 포토 | PR 결함(scum/footing) | micro-bridge, footing 단면 | acid diffusion 부족, dose 부족 | PEB/dose 최적화, descum |
| 식각 | under/over-etch | 잔막두께 이탈, etch rate drift | chamber 오염/drift | seasoning, EPD 고도화 |
| 식각 | profile 이상 | bowing/taper/undercut | ion sheath 각도, passivation 불균형 | gas 조성/펄스 플라즈마 |
| 식각 | plasma damage | antenna ratio별 Vt shift | floating conductor 전하 축적 | antenna rule, 보호 다이오드 |
| 식각 | chamber 파티클 | edge 클러스터, saw-tooth 트렌드 | polymer residue, discharge on/off | PM 주기 단축, 코팅재 개선 |
| 증착 | step coverage 불량 | 상/하부 두께비 이탈 | line-of-sight, 표면온도 의존성 | ALD 전환, collimation |
| 증착 | void | SAM 내부 공극 | pinch-off, re-entrant 형상 | bottom-up fill, gapfill CVD |
| 이온주입 | dose 불균일 | Rs맵 계통적 구배 | beam profile/scan 불일치 | 빔 모니터링, 스캔 최적화 |
| CMP | dishing/erosion | 패턴밀도별 단차 상관관계 | 소재 제거율 차이, 압력분산 | dummy fill, 2-step CMP |
| CMP | scratch | 랜덤/호형 스크래치 | 슬러리 응집/패드 마모 | 필터 강화, 컨디셔너 교체 |
| 금속배선 | EM | R-t 곡선 급상승, log-normal TTF | cathode void 성장 | EM rule, capping layer |
| 금속배선 | via 불량 | via chain R 산포/open | 배리어 step coverage 불량 | ALD 배리어, 어닐 최적화 |
| TSV/HBM | Cu fill void | SAM 내부 void | top-down fill | bottom-up superfill |
| TSV/HBM | bump non-wet | 중앙부 non-wet 클러스터 | CTE mismatch warpage | 저CTE 기판, reflow 최적화 |
| TSV/HBM | underfill void | SAM 기포, 코너 집중 | 수분/휘발분 outgassing | bake-out, cure profile 재설계 |
| EDS | edge/center/ring/donut/loc/scratch | 빈맵 공간패턴 | 공정별 상이(본문 9절 참조) | 패턴별 상이(본문 9절 참조) |
| 패키징 | 다이크랙 | C-SAM 크랙라인, 개방불량 | 다이싱/핸들링 응력 | 스텔스 다이싱, DAF 최적화 |
| 패키징 | 와이어본딩 불량 | pull test 미달, wire sweep | 본딩 파라미터, 몰드유동 불균형 | 파라미터 캘리브레이션, 게이트 설계 |
| 패키징 | 몰드 보이드 | X-ray 기포, 계면 박리 | 몰드유동 미충전, 흡습 | 진공몰딩, MSL 관리 |

---

## 참고 자료 (Sources)

- [Deep Dive on Quality Control Methods During Wafer Manufacturing – Wafer World](https://www.waferworld.com/post/deep-dive-on-quality-control-methods-during-wafer-manufacturing)
- [Methods for improving within-wafer uniformity of gate oxide (USPTO)](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/6780788)
- [Common Lithography Defects and How to Fix Them – Eureka Patsnap](https://eureka.patsnap.com/article/common-lithography-defects-and-how-to-fix-them)
- [Lithography Tools: Advanced Misalignment Troubleshooting – Applied Physics USA](https://appliedphysicsusa.com/blogs/lithography-tools-misalignment-troubleshooting/)
- [Review of overlay error and controlling methods in alignment system for advanced lithography – ResearchGate](https://www.researchgate.net/publication/366326351_Review_of_overlay_error_and_controlling_methods_in_alignment_system_for_advanced_lithography)
- [Defect Challenges Grow At The Wafer Edge – SemiEngineering](https://semiengineering.com/defect-challenges-grow-at-the-wafer-edge/)
- [Bossung Curves; an old technique with a new twist – TEA Systems](http://www.teasystems.com/News/BossungFocus_6152_109.pdf)
- [Resist scumming leading to microbridge defects – ResearchGate](https://www.researchgate.net/figure/a-Resist-scumming-that-lead-to-microbridge-defects-and-b-missing-resist-lines-that_fig1_326739791)
- [Prevention of photoresist scumming (USPTO)](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/8129093)
- [Semiconductor: Protecting Dry-Etch Chamber Parts Against Aggressive Plasma – Saint-Gobain](https://www.coatingsolutions.saint-gobain.com/blogs/semiconductor-protecting-dry-etch-chamber-parts-against-aggressive-plasma)
- [Factor Design for the Oxide Etching Process to Reduce Edge Particle Contamination – MDPI](https://www.mdpi.com/2076-3417/12/11/5684)
- [Contamination Particles and Plasma Etching Behavior of Y2O3/YF3 Coatings – MDPI](https://www.mdpi.com/2079-6412/9/2/102)
- [Plasma induced charging damage on thin gate oxide – IEEE Xplore](https://ieeexplore.ieee.org/document/820983)
- [What Is The Antenna Effect in VLSI? – ChipEdge](https://chipedge.com/resources/what-is-the-antenna-effect-in-vlsi/)
- [Impact of gate area on plasma charging damage: reverse antenna effect – ResearchGate](https://www.researchgate.net/publication/3997573_Impact_of_gate_area_on_plasma_charging_damage_The_reverse_antenna_effect)
- [Power dependence of gate oxide damage from electron shading effect – ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0040609098003782)
- [Wafer Deposition: CVD, PVD, ALD & Electroplating – SemiconductorX](https://semiconductorx.com/mfg-front-end-deposition.html)
- [Methods of chemical vapor deposition of tungsten films on patterned wafer substrates (USPTO)](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/5434110)
- [Uniformity mapping in ion implantation – Gale Academic OneFile](https://link.gale.com/apps/doc/A11759823/AONE?u=googlescholar&sid=AONE&xid=eeb9178c)
- [The history of uniformity mapping in ion implantation – ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/0168583X9196169L)
- [CMP Process Defects: Causes, Types & Solutions – JEES](https://jeez-semicon.com/blog/CMP-Process-Defects-Causes-Types-Solutions/)
- [CMP Defect Types, Root Causes & Yield Improvement – JEES](https://jeez-semicon.com/blog/CMP-Defect-Types-Root-Causes-Yield-Improvement/)
- [What Are Dishing and Erosion in CMP Processes? – Ponda Grinding](https://www.pondax.com/technique-edge/2025/10/what-are-dishing-and-erosion-in-cmp-processes/)
- [What is Dishing and Erosion in the CMP Process – VETEK](https://www.veteksemicon.com/news/what-is-dishing-and-erosion-in-the-cmp-process.html)
- [Grain morphology effects on void formation and EM-induced failure in Cu interconnects – Strathclyde](https://pureportal.strath.ac.uk/en/publications/grain-morphology-effects-on-void-formation-and-electromigration-i)
- [Dominant electromigration failures in copper/low-k interconnects – Silicon Semiconductor](https://siliconsemiconductor.net/article/68785/%3CSTRONG%3EDominant_electromigration_failures_in_copper_low-k_interconnects%3C_STRONG%3E)
- [A compact model for early electromigration failures of Cu dual-damascene interconnects – PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC3178013/)
- [High warpage induced non-wet bump failure – ResearchGate](https://www.researchgate.net/figure/High-warpage-induced-non-wet-bump-failure-in-the-center-of-package-due-to-CTE-mismatch_fig5_283474517)
- [Troubleshooting Underfill Void Elimination – Semiconductor Digest](https://sst.semiconductor-digest.com/2005/09/troubleshooting-underfill-void-elimination/)
- [HBM Leads The Way To Defect-Free Bumps – SemiEngineering](https://semiengineering.com/hbm-leads-the-way-to-defect-free-bumps/)
- [Thermal and rheological investigation of void and crack formation in underfill – ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S3050471625000316)
- [TSV Fabrication – DRIE, Void-Free Cu Fill, 3D-IC – Nanosystems JP](https://www.nanosystemsjp.co.jp/tsv.html)
- [An ensemble-based deep semi-supervised learning for classification of Wafer Bin Maps – ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0360835222006040)
- [Wafer map defect pattern detection based on improved attention mechanism – ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0957417423010461)
- [Mixed-Type Wafer Failure Pattern Recognition – CUHK](https://www.cse.cuhk.edu.hk/~byu/papers/C154-ASPDAC2023-Mixwafer.pdf)
- [Wafer map failure pattern classification using CNN – Nature Scientific Reports](https://www.nature.com/articles/s41598-023-34147-2)
- [Wafer map failure pattern recognition (WMFPR) – GlobalSino](https://www.globalsino.com/ICs/page4271.html)
- [Clustering the Dominant Defective Patterns in Semiconductor Wafer Maps – ResearchGate](https://www.researchgate.net/publication/320723964_Clustering_the_Dominant_Defective_Patterns_in_Semiconductor_Wafer_Maps)
- [Common Mistakes During Silicon Wafer Processing – Wafer World](https://www.waferworld.com/post/common-mistakes-during-silicon-wafer-processing)
- [3 Failure Mechanism of Semiconductor Devices (PDF)](https://inderjitsingh87.weebly.com/uploads/2/1/1/4/21144104/failure_mechanisms.pdf)
- [Die Attach and Wire Bonding Failures in Sensor Production Lines – INCURE](https://incurelab.com/wp/die-attach-and-wire-bonding-failures-in-sensor-production-lines)
- [Wire Bonding Failure Analysis: Intermetallics, Corrosion, & Fatigue – FS PCBA](https://www.fs-pcba.com/wire-bonding-failure-analysis/)
- [Wire Bonding Process in Semiconductor Packaging – Viasion](https://www.viasion.com/blog/wire-bonding-process-in-semiconductor-packaging/)
- [Failure Modes in Wire bonded and Flip Chip Packages – Electronics.org](https://www.electronics.org/system/files/technical_resource/E2&S09_03.pdf)
