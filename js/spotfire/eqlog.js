// 설비 데이터 로그 시뮬레이터 — Machine Engineering 실습용
// SEMI E10 상태 타임라인 + SECS/GEM 스타일 이벤트/알람 로그 + OCAP 시나리오 주입
import { mulberry32, FDC_DEFS } from './datagen.js';

/* ---------------- 팹 설비 마스터 ---------------- */
export const TOOLS = [
  { id: 'CZP-01', name: 'CZ 단결정 성장로', proc: 'wafer', chamber: 'PULL1' },
  { id: 'OXF-02', name: '수직 산화로', proc: 'oxidation', chamber: 'TUBE1' },
  { id: 'PHO-07', name: 'EUV 스캐너', proc: 'photo', chamber: 'EXPO' },
  { id: 'ETC-03', name: '플라즈마 식각기', proc: 'etch', chamber: 'CH-B' },
  { id: 'CVD-05', name: 'PECVD 증착기', proc: 'deposition', chamber: 'CH-A' },
  { id: 'CMP-02', name: 'CMP 폴리셔', proc: 'metal', chamber: 'PLT1' },
  { id: 'PRB-11', name: 'EDS 프로버', proc: 'eds', chamber: 'STG1' },
  { id: 'TCB-04', name: 'TC 본더 (HBM)', proc: 'packaging', chamber: 'HD1' },
];

/* ---------------- 알람 코드 테이블 (공정별) ---------------- */
// sev: W=Warning, A=Alarm(장비 정지), I=Interlock(강제 차단)
export const ALARM_CODES = {
  etch: [
    { code: 'AL-3021', sev: 'W', text: 'He backside flow deviation > 5%' },
    { code: 'AL-3022', sev: 'A', text: 'He backside flow out of range — wafer chucking 불량 의심' },
    { code: 'AL-3105', sev: 'W', text: 'RF reflected power rising' },
    { code: 'AL-3106', sev: 'A', text: 'RF reflected power limit exceed — matching 불량' },
    { code: 'IL-3900', sev: 'I', text: 'INTERLOCK: chamber pressure abnormal — gate valve closed' },
    { code: 'AL-3411', sev: 'W', text: 'EPD signal noise high' },
  ],
  deposition: [
    { code: 'AL-5210', sev: 'W', text: 'Susceptor heater zone-2 temp deviation' },
    { code: 'AL-5211', sev: 'A', text: 'Heater zone-2 under-temp — 증착 속도 저하 의심' },
    { code: 'AL-5334', sev: 'W', text: 'Precursor ampoule level low (<15%)' },
    { code: 'IL-5900', sev: 'I', text: 'INTERLOCK: remote plasma ignition fail' },
  ],
  photo: [
    { code: 'AL-1120', sev: 'W', text: 'Dose sensor drift detected' },
    { code: 'AL-1121', sev: 'A', text: 'Dose out of control band' },
    { code: 'AL-1233', sev: 'W', text: 'Wafer stage temp deviation 0.05K' },
    { code: 'IL-1900', sev: 'I', text: 'INTERLOCK: reticle handler vacuum loss' },
  ],
  oxidation: [
    { code: 'AL-2110', sev: 'W', text: 'Zone-3 heater ramp rate low' },
    { code: 'AL-2111', sev: 'A', text: 'Tube temp uniformity out of spec' },
    { code: 'AL-2245', sev: 'W', text: 'O2 MFC actual-setpoint gap > 2%' },
  ],
  metal: [
    { code: 'AL-6310', sev: 'W', text: 'Slurry flow fluctuation' },
    { code: 'AL-6311', sev: 'A', text: 'Slurry supply pressure drop — 필터 막힘 의심' },
    { code: 'AL-6520', sev: 'W', text: 'Pad conditioner disk wear > 80%' },
  ],
  eds: [
    { code: 'AL-7110', sev: 'W', text: 'Probe contact resistance rising' },
    { code: 'AL-7111', sev: 'A', text: 'Continuity fail rate high — needle 오염 의심' },
    { code: 'AL-7230', sev: 'W', text: 'Chuck temp settling slow' },
  ],
  packaging: [
    { code: 'AL-8410', sev: 'W', text: 'Bond force actual-setpoint deviation' },
    { code: 'AL-8411', sev: 'A', text: 'Bond head planarity out of spec' },
    { code: 'AL-8620', sev: 'W', text: 'Reflow zone-5 temp deviation' },
  ],
  wafer: [
    { code: 'AL-0110', sev: 'W', text: 'Melt temp fluctuation > 1.5K' },
    { code: 'AL-0221', sev: 'A', text: 'Pull speed servo deviation — 잉곳 직경 변동 의심' },
  ],
};

/* ---------------- SEMI E10 상태 타임라인 (24h) ---------------- */
// 반환: [{state, start(분), dur(분)}], 상태: PRD/SBY/ENG/SDT/UDT
export const E10_STATES = {
  PRD: { name: 'Productive (생산)', color: '#34a853' },
  SBY: { name: 'Standby (대기)', color: '#9ec9f5' },
  ENG: { name: 'Engineering (엔지니어링)', color: '#7856d6' },
  SDT: { name: 'Scheduled Down (계획 정비)', color: '#f2b824' },
  UDT: { name: 'Unscheduled Down (비계획 정지)', color: '#e5484d' },
};
export function genE10Timeline(seed = 1, { scenario = null } = {}) {
  const rng = mulberry32(seed * 977 + 13);
  const segs = [];
  let t = 0;
  const push = (state, dur) => { segs.push({ state, start: t, dur }); t += dur; };
  while (t < 1440) {
    const r = rng();
    if (scenario && t >= 860 && !segs.some(s => s.state === 'UDT' && s.scenario)) {
      // 시나리오: 야간 알람으로 비계획 정지 발생
      const udt = { state: 'UDT', start: t, dur: 90 + Math.floor(rng() * 60), scenario: true };
      segs.push(udt); t += udt.dur;
      continue;
    }
    if (r < 0.62) push('PRD', 80 + Math.floor(rng() * 140));
    else if (r < 0.8) push('SBY', 15 + Math.floor(rng() * 40));
    else if (r < 0.88) push('ENG', 20 + Math.floor(rng() * 40));
    else if (r < 0.96) push('SDT', 30 + Math.floor(rng() * 60));
    else push('UDT', 20 + Math.floor(rng() * 50));
  }
  segs[segs.length - 1].dur -= (t - 1440);
  return segs;
}
export function availability(segs) {
  const up = segs.filter(s => ['PRD', 'SBY', 'ENG'].includes(s.state)).reduce((a, s) => a + s.dur, 0);
  return 100 * up / 1440;
}

/* ---------------- 이벤트/알람 로그 생성 ----------------
   실제 SECS/GEM 이벤트 리포트를 모사한 행 구조:
   { time, type: 'EVENT'|'STEP'|'TRACE'|'WARN'|'ALARM'|'INTERLOCK'|'STATE', text, hl }
   scenario: OCAP 케이스가 주입하는 이상 (drift 계열)             */
export function genShiftLog(tool, { seed = 1, scenario = null, lots = 4 } = {}) {
  const rng = mulberry32(seed * 4241 + tool.id.length * 7);
  const sensors = FDC_DEFS[tool.proc] || [];
  const alarms = ALARM_CODES[tool.proc] || [];
  const rows = [];
  let sec = 6 * 3600 + Math.floor(rng() * 300); // 06:00 교대 시작
  const ts = () => {
    const h = Math.floor(sec / 3600) % 24, m = Math.floor(sec % 3600 / 60), s = sec % 60;
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  };
  const add = (type, text, hl = false) => rows.push({ time: ts(), type, text, hl });
  const fmtV = v => Math.abs(v) >= 100 ? v.toFixed(1) : v.toFixed(2);

  add('STATE', `E10 STATE CHANGE  SBY → PRD  (operator: OP1042)`);
  const totalWafers = lots * 25;
  let wIdx = 0;

  for (let li = 0; li < lots; li++) {
    const lotId = `LOT-25${String(40 + seed % 50)}${String.fromCharCode(65 + li)}`;
    const recipe = `${tool.proc.toUpperCase()}_MAIN_R${(seed % 4) + 2}.0`;
    sec += 30 + Math.floor(rng() * 60);
    add('EVENT', `S6F11 LOT_START      ${lotId}  RECIPE=${recipe}  QTY=25`);

    for (let w = 1; w <= 25; w++) {
      wIdx++;
      const prog = wIdx / totalWafers; // 0~1 (시나리오 진행도)
      sec += 45 + Math.floor(rng() * 40);
      // 대표 웨이퍼만 상세 로그 (1, 13, 25번), 나머지는 생략 표기
      const verbose = w === 1 || w === 13 || w === 25;
      if (verbose) {
        add('EVENT', `WAFER_START  ${lotId} W${String(w).padStart(2, '0')}  ${tool.chamber}`);
        sensors.forEach((s0, si) => {
          let actual = s0.base + (rng() - 0.5) * s0.noise * 2;
          let flag = '';
          const affected = scenario && (scenario.sensorKey ? s0.key === scenario.sensorKey : s0.linked);
          if (affected) {
            const dev = scenario.driftOf(prog) * Math.max(Math.abs(s0.base) * 0.02, s0.noise * 2.5);
            actual += dev;
            const devPct = Math.abs(dev) / (Math.abs(s0.base) || 1) * 100;
            if (devPct > 1.2 || Math.abs(dev) > s0.noise * 2.2) flag = '  ⚠ DEV';
          }
          add('TRACE', `  STEP${si + 2} ${s0.key.toUpperCase().padEnd(16)} SP=${fmtV(s0.base)} ${s0.unit.padEnd(7)} ACT=${fmtV(actual)}${flag}`, !!flag);
        });
        add('EVENT', `WAFER_END    ${lotId} W${String(w).padStart(2, '0')}  result=OK  t=${(42 + rng() * 8).toFixed(1)}s`);
      }
      // 시나리오 경고/알람 에스컬레이션
      if (scenario) {
        const p = scenario.warnP(prog);
        if (rng() < p) {
          const warn = alarms.find(a => a.code === scenario.warnCode);
          if (warn) add('WARN', `${warn.code} [W] ${warn.text}  (${lotId} W${String(w).padStart(2, '0')})`, true);
        }
      } else if (rng() < 0.012) {
        const w0 = alarms.filter(a => a.sev === 'W')[Math.floor(rng() * Math.max(alarms.filter(a => a.sev === 'W').length, 1))];
        if (w0) add('WARN', `${w0.code} [W] ${w0.text}  (nuisance)`, false);
      }
    }
    sec += 40;
    add('EVENT', `S6F11 LOT_END        ${lotId}  yield_est=OK  wafers=25`);

    // 시나리오: 마지막 로트 후 본알람 + 인터락 + UDT 전환
    if (scenario && li === lots - 2) {
      sec += 120;
      const alarm = alarms.find(a => a.code === scenario.alarmCode);
      const il = alarms.find(a => a.sev === 'I');
      if (alarm) add('ALARM', `${alarm.code} [A] ${alarm.text}  → EQUIPMENT PAUSED`, true);
      if (il && scenario.interlock) add('INTERLOCK', `${il.code} [I] ${il.text}`, true);
      add('STATE', `E10 STATE CHANGE  PRD → UDT  (alarm: ${alarm ? alarm.code : '-'})`, true);
      add('EVENT', `OCAP TRIGGERED — Machine Engineer 호출  (SMS→ME 당직)`, true);
      sec += 300;
    }
  }
  add('STATE', `SHIFT SUMMARY  wafers=${totalWafers}  warns=${rows.filter(r => r.type === 'WARN').length}  alarms=${rows.filter(r => r.type === 'ALARM').length}`);
  return rows;
}

/* ---------------- 알람 파레토 집계 ---------------- */
export function alarmPareto(rows) {
  const cnt = {};
  rows.forEach(r => {
    if (r.type === 'WARN' || r.type === 'ALARM' || r.type === 'INTERLOCK') {
      const code = r.text.split(' ')[0];
      cnt[code] = (cnt[code] || 0) + 1;
    }
  });
  return Object.entries(cnt).map(([code, n]) => ({ code, n })).sort((a, b) => b.n - a.n);
}

/* ---------------- OCAP 시나리오 (예시 2건 — 팀이 확장) ----------------
   driftOf(prog): 교란 크기(σ 배수), warnP(prog): 경고 발생 확률   */
export const OCAP_CASES = [
  {
    id: 'ocap-etch-he',
    toolId: 'ETC-03',
    title: 'He 백사이드 유량 이탈 → 척킹 불량',
    story:
      '야간 교대 중 ETC-03 식각기에서 He backside flow 경고가 잦아지더니 결국 본알람과 함께 설비가 UDT로 전환되었습니다. ' +
      '당직 Machine Engineer로서 이벤트 로그와 트레이스를 분석해 원인을 특정하고 조치하세요. ' +
      '(He 백사이드: 웨이퍼-정전척 사이 열전달 매체. 유량 이탈 = 척킹/실링 문제 신호)',
    scenario: {
      warnCode: 'AL-3021', alarmCode: 'AL-3022', interlock: true, sensorKey: 'he_flow',
      driftOf: p => p < 0.3 ? 0 : (p - 0.3) * 3.2,
      warnP: p => p < 0.3 ? 0.005 : (p - 0.3) * 0.35,
    },
    questions: [
      {
        q: '로그에서 관찰되는 에스컬레이션 패턴은?',
        opts: [
          '아무 전조 없이 인터락이 단발 발생',
          'W(경고) 빈도가 점차 증가 → A(본알람) → 인터락 → UDT 전환',
          '알람과 무관하게 레시피 스텝 시간만 늘어남',
          'E10 상태가 PRD와 SBY만 반복',
        ],
        answer: 1,
        expl: '전형적인 점진 열화 패턴입니다. TRACE의 HE_FLOW ACT값이 SP에서 서서히 벌어지고(⚠ DEV), 경고 빈도가 증가하다 임계에서 본알람·인터락으로 이어졌습니다. "경고 빈도의 추세"가 예지보전의 핵심 신호입니다.',
        hint: '경고(WARN) 행들의 시간 간격이 어떻게 변하는지, TRACE의 ACT-SP 편차가 어떻게 변하는지 보세요.',
      },
      {
        q: 'He backside flow가 서서히 증가(누설)하는 근본 원인으로 가장 유력한 것은?',
        opts: [
          'RF 제너레이터 출력 저하',
          '정전척(ESC) 표면 마모 또는 웨이퍼 이면 실링 불량으로 He 누설 증가',
          '터보펌프 회전수 저하',
          '가스박스 MFC 캘리브레이션은 문제와 무관',
        ],
        answer: 1,
        expl: 'He는 웨이퍼와 ESC 사이 밀폐 공간에 채워집니다. 유지 유량이 점차 늘어난다는 것은 그 공간이 새고 있다는 뜻 — ESC 표면 마모, 파티클로 인한 실링 불량이 대표 원인입니다. 방치하면 웨이퍼 온도 제어 실패로 CD/식각률 불량이 발생합니다.',
        hint: 'He가 어디와 어디 사이를 채우는 가스인지 생각해보세요.',
      },
      {
        q: 'OCAP에 따른 올바른 조치 순서는?',
        opts: [
          '알람 리셋 후 즉시 생산 재개하며 관찰',
          '설비 Hold 유지 → 챔버 오픈 ESC 표면 점검/세정(필요시 교체) → 시험 웨이퍼로 He 유량·온도 검증 → PRD 복귀 → 해당 기간 로트 계측 확인',
          '레시피의 He 유량 상한을 올려 알람을 없앤다',
          'FDC 알람 기준을 완화한다',
        ],
        answer: 1,
        expl: '알람 리셋·기준 완화는 신호를 숨길 뿐입니다. 표준 OCAP: 원인 부품 정비 → 시험 웨이퍼 검증 → 복귀 → 영향 로트 소급 확인. 이 과정과 판단 근거를 정비 이력(CMMS)에 기록해 재발 시 참조합니다.',
      },
    ],
    resolution:
      'ESC 표면에서 실링 립 마모를 확인하고 ESC를 교체했습니다. 시험 웨이퍼에서 He 유량·웨이퍼 온도가 기준선으로 복귀했고, ' +
      '경고 빈도 추세 감지 시 조기 알림하는 FDC 규칙(3시간 내 W 5회)이 신설되었습니다. UDT 2.1시간, 영향 로트 2건은 계측 결과 이상 없음으로 판정.',
  },
  {
    id: 'ocap-cvd-heater',
    toolId: 'CVD-05',
    title: '서셉터 히터 존 열화 → 증착 두께 저하',
    story:
      'CVD-05의 히터 zone-2 온도 편차 경고가 며칠에 걸쳐 서서히 늘었습니다. Spotfire 막두께 SPC에도 하락 추세가 보이기 시작했습니다. ' +
      '설비 로그와 계측 데이터를 연결해 원인을 진단하세요.',
    scenario: {
      warnCode: 'AL-5210', alarmCode: 'AL-5211', interlock: false, sensorKey: 'heater_temp',
      driftOf: p => -p * 2.6,
      warnP: p => p * 0.22,
    },
    questions: [
      {
        q: '히터 존 온도 저하가 막두께에 영향을 주는 이유는?',
        opts: [
          '온도가 낮으면 증착 화학반응 속도가 느려져 같은 시간에 얇게 쌓임',
          '온도는 두께와 무관하고 응력에만 영향',
          '온도가 낮으면 오히려 두께가 증가',
          '히터는 웨이퍼 반송에만 관여',
        ],
        answer: 0,
        expl: 'CVD는 열에너지로 전구체 반응을 구동합니다(아레니우스 법칙). 존 온도 저하 → 국부 반응속도 저하 → 해당 구역 막두께 감소·균일도 악화. 설비 센서(원인)와 계측 SPC(결과)가 같은 방향으로 움직이는지 확인하는 것이 진단 핵심입니다.',
        hint: '증착 반응이 무엇으로 구동되는지 생각해보세요.',
      },
      {
        q: '이 케이스에서 Machine Engineer의 가장 올바른 분석 절차는?',
        opts: [
          '계측 SPC만 보고 레시피 시간을 늘린다',
          '설비 FDC 트레이스(zone-2 온도)와 계측 막두께 SPC를 같은 시간축으로 겹쳐 상관을 확인 → 히터 엘리먼트/열전대 점검 → PM 계획',
          '두께가 스펙 안이면 아무 조치도 하지 않는다',
          '챔버를 즉시 분해한다',
        ],
        answer: 1,
        expl: '원인(설비 센서)-결과(계측값)의 시간 상관 확인이 첫 단계입니다. 상관이 확인되면 히터 엘리먼트 저항 측정·열전대 캘리브레이션으로 원인 부품을 특정하고, 스펙 이탈 전에 계획 정비로 교체합니다. 레시피 시간 보정(APC)은 임시 대응일 뿐 근본 조치가 아닙니다.',
      },
    ],
    resolution:
      'zone-2 히터 엘리먼트 저항이 규격 대비 12% 상승(열화)한 것을 확인, 계획 정비에서 교체했습니다. ' +
      '교체 후 존별 온도 편차와 막두께 균일도가 기준선으로 복귀했으며, 히터 저항 트렌드가 예지보전(PdM) 모니터링 항목에 추가되었습니다.',
  },
  {
    id: 'ocap-pho-dose',
    toolId: 'PHO-07',
    title: '노광 도즈 센서 드리프트 → CD 산포 확대',
    story:
      'PHO-07 EUV 스캐너에서 도즈(Dose) 센서 경고(AL-1120)가 최근 며칠간 빈도가 높아지고 있었고, Spotfire의 CD SPC 관리도에도 산포가 서서히 커지는 추세가 보이기 시작했습니다. ' +
      '야간 교대 중 결국 도즈 값이 관리 밴드를 벗어나는 본알람(AL-1121)이 발생해 노광 공정이 홀드되었습니다. ' +
      '당직 Machine Engineer로서 FDC 트레이스와 CD 계측 트렌드를 같은 시간축에 겹쳐 근본원인을 특정하고, 8D 절차에 따라 임시 봉쇄와 영구 대책을 구분해 조치하세요.',
    scenario: {
      warnCode: 'AL-1120', alarmCode: 'AL-1121', interlock: false, sensorKey: 'dose',
      driftOf: p => p < 0.35 ? 0 : (p - 0.35) * 3.0,
      warnP: p => p < 0.35 ? 0.004 : (p - 0.35) * 0.32,
    },
    questions: [
      {
        q: '로그와 CD 계측 트렌드를 함께 볼 때 가장 타당한 해석은?',
        opts: [
          '도즈 경고와 CD 산포 확대는 우연히 동시에 발생한 무관한 현상이다',
          '도즈 센서 ACT값이 SP에서 점차 벗어나는 추세와 동시에 CD 산포가 커지고 있어, 두 신호가 같은 근본원인을 가리킨다',
          'CD 산포는 레티클 핸들러 문제이며 도즈와는 관련이 없다',
          '경고 빈도는 랜덤 노이즈이므로 무시해도 된다',
        ],
        answer: 1,
        expl: '설비 FDC 신호(원인 후보)와 계측 SPC(결과)가 같은 방향·같은 시간대로 움직이는지 확인하는 것이 RCA의 출발점입니다. 도즈 드리프트가 노광량 편차를 만들고, 이는 곧 현상 후 CD 변화로 이어지므로 두 신호의 상관을 먼저 검증해야 합니다.',
        hint: 'TRACE의 DOSE ACT-SP 편차 추세와 CD SPC 관리도의 산포 확대 시점을 나란히 놓고 비교해보세요.',
      },
      {
        q: '5-Why로 근본원인을 파고들 때 가장 그럴듯한 경로는?',
        opts: [
          '도즈 알람 발생 → 왜? 도즈 센서 실측값이 점차 벌어짐 → 왜? 도즈 센서(포토다이오드) 감도가 사용시간에 따라 열화 → 왜? 센서 재교정(캘리브레이션) 주기가 실제 열화 속도보다 길게 설정됨 → 근본원인: 캘리브레이션 주기 미조정',
          '도즈 알람 발생 → 왜? 오퍼레이터 실수 → 근본원인: 교육 부족',
          '도즈 알람 발생 → 왜? 웨이퍼 이송 로봇 오류 → 근본원인: 로봇 모터 마모',
          '도즈 알람 발생 → 왜? 레시피 이름 오타 → 근본원인: MES 입력 오류',
        ],
        answer: 0,
        expl: '5-Why는 표면 증상에서 구조적 원인까지 반복 질문으로 파고드는 기법입니다. 도즈 센서 자체의 열화(감도 저하)가 실제 원인인 경우, 단순 알람 리셋이나 재교정 1회로는 재발을 막지 못하며 근본원인은 "캘리브레이션 주기 설계"에 있는 경우가 많습니다.',
        hint: '도즈 센서가 무엇을 측정하는 부품이고, 그 부품이 시간이 지나며 왜 열화되는지 생각해보세요.',
      },
      {
        q: '이 케이스의 올바른 OCAP/8D 조치 순서는?',
        opts: [
          '알람을 리셋하고 관리한계를 완화해 알람만 없앤다',
          '(봉쇄) 해당 로트 Hold 및 도즈 알람 기준 유지 → (원인 규명) 센서 감도 점검·재교정 → (대책) 센서 교체 또는 캘리브레이션 주기 단축 → 시험 웨이퍼로 도즈·CD 재검증 → 정상 복귀 후 영향 로트 CD 재계측 → 캘리브레이션 주기를 PdM 항목으로 등록',
          '레티클을 무조건 교체한다',
          '도즈 센서를 무시하고 CD 계측만으로 공정을 운영한다',
        ],
        answer: 1,
        expl: '8D의 D3(임시 봉쇄)와 D5~D7(영구 대책·재발방지)을 구분하는 것이 핵심입니다. 봉쇄는 로트 Hold, 영구 대책은 센서 교체/재교정 주기 조정이며, 이 조정 근거(열화 속도 데이터)를 예지보전(PdM) 모니터링 항목으로 등록해 다음 열화를 사전에 감지하도록 합니다.',
      },
    ],
    resolution:
      '도즈 센서(포토다이오드) 감도를 기준 광원으로 재교정한 결과 규격 대비 편차가 확인되어 센서 모듈을 교체했습니다. ' +
      '시험 웨이퍼에서 도즈·CD가 기준선으로 복귀했고, 영향 구간 로트는 CD 재계측에서 스펙 내 판정되었습니다. ' +
      '도즈 센서 감도 트렌드를 PdM 모니터링 항목에 추가하고 캘리브레이션 주기를 기존 대비 30% 단축했습니다.',
  },
  {
    id: 'ocap-cmp-slurry',
    toolId: 'CMP-02',
    title: '슬러리 필터 막힘 → 유량 변동성 증가',
    story:
      "CMP-02 폴리셔에서 슬러리 유량 변동(Fluctuation) 경고(AL-6310)가 점차 잦아지고 있었습니다. " +
      '트레이스를 보면 평균값 자체보다 유량의 흔들림(진폭)이 커지는 패턴이 뚜렷했고, 결국 슬러리 공급 압력 저하 본알람(AL-6311)과 함께 설비가 멈췄습니다. ' +
      "당직 Machine Engineer로서 이 '평균 이동'이 아닌 '변동성 증가' 패턴이 무엇을 의미하는지 진단하고 Commonality 관점도 함께 점검하세요.",
    scenario: {
      warnCode: 'AL-6310', alarmCode: 'AL-6311', interlock: false, sensorKey: 'slurry_flow',
      driftOf: p => p < 0.25 ? 0 : Math.sin(p * 45) * (p - 0.25) * 2.5,
      warnP: p => p < 0.25 ? 0.006 : (p - 0.25) * 0.4,
    },
    questions: [
      {
        q: '트레이스에서 관찰되는 이상 패턴의 성격은?',
        opts: [
          '평균값이 한쪽으로 꾸준히 이동하는 전형적 drift',
          '평균은 SP 근처를 유지하지만 진동 폭(변동성)이 점점 커지는 highvar(산포 증가) 패턴',
          '값이 계단형으로 한 번에 튀는 shift',
          '레시피 시작 시점에만 나타나는 단발 spike',
        ],
        answer: 1,
        expl: '이 케이스는 평균 이동(drift/shift)이 아니라 산포 자체가 커지는 highvar 패턴입니다. 필터가 부분적으로 막히면 슬러리가 순간적으로 통과했다 걸렸다를 반복하며 유량이 진동하듯 흔들리는데, 이는 관리도에서 Rule 2(2σ 밖 연속 신호)나 표준편차 관리도(R chart/S chart) 이탈로 먼저 드러나는 경우가 많습니다.',
        hint: 'TRACE의 SLURRY_FLOW ACT값이 SP를 중심으로 어떻게 흔들리는지, 편차의 방향이 일정한지 살펴보세요.',
      },
      {
        q: '슬러리 유량이 변동(흔들림)하는 근본원인으로 가장 유력한 것은?',
        opts: [
          'CMP 헤드 압력 센서 노이즈',
          '슬러리 라인 인라인 필터가 부분적으로 막혀 유로 저항이 불균일해지고, 그 결과 공급 펌프가 압력을 보상하는 과정에서 유량이 진동함',
          '패드 컨디셔너 디스크의 정상 마모',
          '연마 대상 웨이퍼 재질 차이',
        ],
        answer: 1,
        expl: '필터가 부분 폐색되면 유로 저항이 시간에 따라 불규칙하게 변하고, 공급 펌프/레귤레이터가 이를 보상하려 하면서 유량이 흔들리는 highvar 패턴이 나타납니다. 방치하면 완전 폐색(공급압 급락)으로 진행해 본알람·정지에 이릅니다.',
        hint: '필터가 막히기 시작할 때 유체 흐름이 일정하게 줄어드는지, 아니면 불규칙하게 변하는지 생각해보세요.',
      },
      {
        q: '이 알람이 CMP-02 한 대만의 문제인지, 다른 설비에도 잠재하는지 확인하려면?',
        opts: [
          'CMP-02만 보고 종결한다',
          '동일 슬러리 공급 라인/필터 로트를 사용하는 다른 CMP 설비들의 슬러리 유량 FDC 트렌드와 필터 교체 이력을 함께 조회하는 Commonality Analysis로 동일 소모품 로트발 이슈인지 확인한다',
          '레시피를 변경해 임시로 회피한다',
          '오퍼레이터 교육을 강화한다',
        ],
        answer: 1,
        expl: 'Commonality Analysis는 불량/이상이 특정 설비 고유 문제인지, 공통 소모품(필터 로트, 슬러리 batch)이나 공통 배관 계통 문제인지 구분하는 데 쓰입니다. 같은 필터 로트를 쓰는 다른 CMP 설비에서도 유사 징후가 보이면 필터 자재 자체(수평 전개 대상)를 의심해야 합니다.',
        hint: '이 필터가 다른 설비와 공유하는 자재(소모품 로트)인지 확인하는 절차를 떠올려보세요.',
      },
    ],
    resolution:
      '슬러리 인라인 필터를 분해 점검한 결과 부분 폐색이 확인되어 필터를 교체하고 라인을 퍼지했습니다. ' +
      '시험 웨이퍼에서 슬러리 유량 변동폭이 기준선(σ)으로 복귀했으며, Commonality Analysis 결과 동일 필터 로트를 사용한 인접 CMP 설비 1대에서도 유사 변동 조짐이 확인되어 선제적으로 필터를 교체했습니다. ' +
      '필터 차압(differential pressure) 트렌드를 PdM 모니터링 항목으로 신설했습니다.',
  },
  {
    id: 'ocap-prb-contact',
    toolId: 'PRB-11',
    title: '프로브 니들 오염 → 접촉저항 상승',
    story:
      'PRB-11 EDS 프로버에서 프로브 접촉저항(Contact Resistance) 경고(AL-7110)가 서서히 늘어나며 Continuity Fail 비율도 함께 상승하기 시작했습니다. ' +
      '결국 연속성 불량률이 기준을 넘는 본알람(AL-7111)이 발생해 프로버가 정지되었습니다. ' +
      '당직 Machine Engineer로서 EDS 수율 데이터와 설비 FDC 신호를 연결해 니들(Needle) 오염 여부를 진단하고 표준 OCAP에 따라 조치하세요.',
    scenario: {
      warnCode: 'AL-7110', alarmCode: 'AL-7111', interlock: false, sensorKey: 'contact_r',
      driftOf: p => p < 0.3 ? 0 : (p - 0.3) * 2.8,
      warnP: p => p < 0.3 ? 0.005 : (p - 0.3) * 0.3,
    },
    questions: [
      {
        q: '접촉저항 상승과 EDS 수율 하락의 관계로 가장 타당한 설명은?',
        opts: [
          '접촉저항은 수율과 무관한 참고 지표일 뿐이다',
          '니들-패드 접촉저항이 커지면 실제 소자 특성과 무관하게 오접촉으로 인한 거짓 불량(false fail)이 늘어 계측 수율이 실제보다 낮게 나타날 수 있다',
          '접촉저항이 커지면 오히려 수율이 개선된다',
          '접촉저항은 챔버 압력에만 영향을 준다',
        ],
        answer: 1,
        expl: 'EDS(전기적 다이 소팅)에서 프로브 니들이 오염되면 패드와의 전기적 접촉이 불안정해져 정상 소자도 불량(오접촉 fail)으로 판정될 수 있습니다. 이런 경우 계측 결과(수율 저하)만 보고 공정 이상으로 오판하지 않도록, 설비 FDC(접촉저항)와 계측 수율을 함께 봐야 합니다.',
        hint: '니들이 웨이퍼 패드와 전기적으로 접촉하는 방식을 생각해보고, 접촉이 불안정해지면 측정값에 어떤 영향을 주는지 떠올려보세요.',
      },
      {
        q: '접촉저항이 점진적으로 상승하는 근본원인으로 가장 유력한 것은?',
        opts: [
          '척 온도 센서 캘리브레이션 오차',
          '프로브 니들 표면에 웨이퍼 패드의 산화막/이물이 누적 부착되어 오버드라이브를 걸어도 안정적인 금속 접촉이 이루어지지 않음',
          'RF 제너레이터 노후화',
          '레시피 스텝 순서 오류',
        ],
        answer: 1,
        expl: '반복 접촉 과정에서 니들 팁에 패드 산화물이나 파티클이 누적되면(니들 오염) 접촉저항이 서서히 증가합니다. 이는 전형적인 소모품 열화 패턴으로, 니들 클리닝이나 교체 주기를 정하는 예지보전(PdM)의 대표 관리 대상입니다.',
        hint: '니들이 반복적으로 웨이퍼에 닿는 과정에서 팁 표면에 무엇이 쌓일 수 있는지 생각해보세요.',
      },
      {
        q: 'Machine Engineer의 올바른 조치 순서는?',
        opts: [
          '접촉저항 알람 기준을 완화해 계속 가동한다',
          '해당 로트 Hold → 니들 클리닝(또는 카드 교체) 수행 → 시험(더미) 웨이퍼로 접촉저항·Continuity 재검증 → 정상 복귀 후 영향 로트 재테스트 → 니들 사용횟수(터치다운 카운트) 기반 PdM 교체 기준 재수립',
          '척 온도를 낮춰 임시로 회피한다',
          '수율 데이터를 무시하고 접촉저항만 본다',
        ],
        answer: 1,
        expl: '표준 OCAP 절차대로 원인(니들 오염) 부품을 정비한 뒤 시험 웨이퍼로 검증하고 복귀해야 합니다. 특히 니들처럼 사용횟수에 비례해 열화되는 소모품은 절대시간이 아닌 터치다운 카운트 기반 PdM 기준을 세우는 것이 재발방지에 효과적입니다.',
      },
    ],
    resolution:
      '프로브 카드를 분리해 니들 팁을 현미경으로 확인한 결과 산화물 오염이 심하여 클리닝(니들 클린 시트)을 수행했습니다. ' +
      '시험 웨이퍼에서 접촉저항과 Continuity Fail율이 기준선으로 복귀했고, 영향 로트는 재테스트에서 정상 판정되었습니다. ' +
      '이후 니들 클리닝 주기를 절대시간이 아닌 누적 터치다운 카운트 기준으로 전환하는 PdM 규칙이 신설되었습니다.',
  },
  {
    id: 'ocap-tcb-bondforce',
    toolId: 'TCB-04',
    title: '본드 헤드 평탄도 이상 → 하중 편차',
    story:
      'TCB-04 TC 본더(HBM용)에서 본드 하중(Bond Force) 편차 경고(AL-8410)가 점차 늘고 있었고, 패키지 휨(Warpage)과 솔더볼 전단강도 계측에도 산포 확대가 나타나기 시작했습니다. ' +
      '결국 본드 헤드 평탄도가 스펙을 벗어나는 본알람(AL-8411)이 발생해 본딩 공정이 홀드되었습니다. ' +
      '당직 Machine Engineer로서 HBM 적층 공정의 특성상 이 하중 편차가 어떤 품질 리스크로 이어지는지 진단하고 OCAP에 따라 조치하세요.',
    scenario: {
      warnCode: 'AL-8410', alarmCode: 'AL-8411', interlock: false, sensorKey: 'bond_force',
      driftOf: p => -p * 2.4,
      warnP: p => p * 0.25,
    },
    questions: [
      {
        q: '본드 헤드 하중이 점차 낮아지는(편차 증가) 추세가 HBM 패키지 품질에 미치는 영향은?',
        opts: [
          '하중과 무관하게 항상 동일한 접합 품질이 보장된다',
          '하중이 목표보다 낮아지거나 불균일해지면 다이 간 접합이 불완전해져 마이크로범프 접합불량, TSV 접촉저항 상승, 휨(Warpage) 증가로 이어질 수 있다',
          '하중이 낮으면 오히려 휨이 감소한다',
          '본드 헤드 하중은 MUF(언더필) 점도에만 영향을 준다',
        ],
        answer: 1,
        expl: 'TC 본딩은 정밀한 압착 하중과 온도로 다이를 적층 접합합니다. 헤드 평탄도가 틀어지면 다이 전면에 하중이 고르게 전달되지 못해 부분적으로 접합이 약해지고, 이는 마이크로범프 접합불량이나 TSV 접촉저항 상승, 패키지 휨 증가로 나타나는 대표적 원인-결과 연쇄입니다. HBM은 다층 적층 구조라 이런 편차가 누적되면 스택 전체 수율에 영향을 줍니다.',
        hint: 'TC 본딩에서 하중이 다이 접합 품질에 어떻게 기여하는지, 그리고 HBM이 여러 층을 쌓는 구조임을 함께 생각해보세요.',
      },
      {
        q: '본드 헤드 하중이 점진적으로 낮아지는 근본원인을 Fishbone(6M)으로 분석할 때 가장 유력한 축과 원인은?',
        opts: [
          'Man(작업자) 축 — 오퍼레이터의 레시피 선택 실수',
          'Machine(설비) 축 — 본드 헤드 평탄도 저하 또는 가압 액추에이터(로드셀/스프링) 마모로 인해 목표 하중 대비 실제 전달 하중이 줄어듦',
          'Environment(환경) 축 — 클린룸 습도 변화',
          'Measurement(계측) 축 — 계측기 캘리브레이션 오차',
        ],
        answer: 1,
        expl: 'Fishbone(6M: Man/Machine/Material/Method/Measurement/Environment)으로 원인 후보를 구조화하면, 이 케이스는 설비(Machine) 축의 본드 헤드 하드웨어(평탄도, 액추에이터/로드셀) 열화가 가장 유력합니다. 다른 축(작업자, 환경, 계측)도 배제하기 위해 점검하되, FDC 트레이스가 설비 신호이므로 Machine 축부터 검증하는 것이 효율적입니다.',
        hint: '어떤 부품이 실제로 하중을 다이에 전달하는 역할을 하는지 떠올려보세요.',
      },
      {
        q: '이 케이스의 올바른 OCAP 조치와 재발방지 연계는?',
        opts: [
          '레시피의 목표 하중값을 낮춰 알람을 회피한다',
          '설비 Hold → 본드 헤드 평탄도 측정 및 액추에이터/로드셀 점검·교정(필요시 교체) → 시험(더미) 다이로 하중 균일도·접합 품질 재검증 → 정상 복귀 후 영향 로트 전단강도·휨 재계측 → 헤드 평탄도·로드셀 드리프트를 PdM 정기 점검 항목으로 등록',
          '휨 계측을 생략하고 전단강도만 확인한다',
          'MUF 점도를 조정해 하중 문제를 상쇄한다',
        ],
        answer: 1,
        expl: '표준 OCAP은 원인 하드웨어(본드 헤드)를 정비·교정한 뒤 시험 다이로 검증하고, 영향 받은 로트를 소급 계측해 확인하는 순서를 따릅니다. 로드셀/액추에이터처럼 서서히 열화되는 부품은 정기 교정 주기를 PdM 항목으로 등록해 다음 편차를 조기에 잡아내는 것이 재발방지의 핵심입니다.',
      },
    ],
    resolution:
      '본드 헤드를 정밀 평탄도 게이지로 측정한 결과 규격 대비 기울어짐이 확인되어 헤드 어셈블리와 로드셀을 교정·교체했습니다. ' +
      '시험 다이 본딩에서 하중 균일도와 접합 품질이 기준선으로 복귀했고, 영향 받은 로트는 전단강도·휨 재계측에서 스펙 내로 판정되었습니다. ' +
      '본드 헤드 평탄도와 로드셀 출력 드리프트를 분기별 PdM 점검 항목으로 신규 등록했습니다.',
  },
];
