// 팹 계측 데이터 시뮬레이터 — Lot → Wafer → Site 계층 구조 + 이상 주입 + SPC 통계
// 실제 공정 데이터처럼 lot간 산포, wafer간 산포, wafer내(radial) 산포를 모두 모사한다.

/* ---------------- 시드 기반 난수 ---------------- */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gauss(rng) { // Box-Muller
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/* ---------------- 공정별 계측 파라미터 정의 ---------------- */
export const PROC_DATA_DEFS = {
  wafer: {
    params: [
      { key: 'ttv', name: 'TTV (두께 편차)', unit: 'µm', target: 1.0, sigma: 0.12, lsl: 0.4, usl: 1.6, digits: 2 },
      { key: 'resistivity', name: '비저항', unit: 'Ω·cm', target: 10.0, sigma: 0.5, lsl: 8.0, usl: 12.0, digits: 2 },
      { key: 'flatness', name: 'SFQR 평탄도', unit: 'nm', target: 30, sigma: 3.5, lsl: 18, usl: 42, digits: 1 },
    ],
  },
  oxidation: {
    params: [
      { key: 'ox_thk', name: '산화막 두께', unit: 'Å', target: 100, sigma: 1.2, lsl: 95, usl: 105, digits: 1 },
      { key: 'uniformity', name: '웨이퍼 내 균일도', unit: '%', target: 1.0, sigma: 0.15, lsl: 0.4, usl: 1.6, digits: 2 },
      { key: 'temp', name: '공정 온도', unit: '°C', target: 950, sigma: 0.8, lsl: 946, usl: 954, digits: 1 },
    ],
  },
  photo: {
    params: [
      { key: 'cd', name: 'CD (선폭)', unit: 'nm', target: 16.0, sigma: 0.32, lsl: 14.6, usl: 17.4, digits: 2 },
      { key: 'overlay', name: 'Overlay', unit: 'nm', target: 0, sigma: 0.7, lsl: -2.4, usl: 2.4, digits: 2 },
      { key: 'pr_thk', name: 'PR 두께', unit: 'nm', target: 85.0, sigma: 0.8, lsl: 81, usl: 89, digits: 1 },
    ],
  },
  etch: {
    params: [
      { key: 'etch_rate', name: '식각 속도', unit: 'Å/min', target: 3200, sigma: 45, lsl: 3000, usl: 3400, digits: 0 },
      { key: 'cd_bias', name: 'CD Bias (식각 후-전)', unit: 'nm', target: 1.5, sigma: 0.28, lsl: 0.3, usl: 2.7, digits: 2 },
      { key: 'depth', name: '식각 깊이', unit: 'nm', target: 250, sigma: 3.0, lsl: 238, usl: 262, digits: 1 },
    ],
  },
  deposition: {
    params: [
      { key: 'film_thk', name: '박막 두께', unit: 'Å', target: 500, sigma: 6, lsl: 475, usl: 525, digits: 1 },
      { key: 'stress', name: '막 응력', unit: 'MPa', target: -150, sigma: 12, lsl: -200, usl: -100, digits: 0 },
      { key: 'particle', name: '파티클 수 (>0.1µm)', unit: '개', target: 8, sigma: 3, lsl: 0, usl: 25, digits: 0, positive: true },
    ],
  },
  metal: {
    params: [
      { key: 'rs', name: '시트 저항', unit: 'Ω/sq', target: 0.08, sigma: 0.0025, lsl: 0.07, usl: 0.09, digits: 4 },
      { key: 'cmp_thk', name: 'CMP 후 잔막', unit: 'Å', target: 3000, sigma: 40, lsl: 2820, usl: 3180, digits: 0 },
      { key: 'via_res', name: '비아 저항', unit: 'Ω', target: 2.0, sigma: 0.15, lsl: 1.4, usl: 2.6, digits: 2 },
    ],
  },
  eds: {
    params: [
      { key: 'yield', name: '웨이퍼 수율', unit: '%', target: 96.5, sigma: 1.1, lsl: 92, usl: 100, digits: 1, isYield: true },
      { key: 'vth', name: 'Vth (문턱전압)', unit: 'mV', target: 450, sigma: 8, lsl: 415, usl: 485, digits: 0 },
      { key: 'idsat', name: 'Idsat', unit: 'µA/µm', target: 620, sigma: 14, lsl: 560, usl: 680, digits: 0 },
    ],
    hasBinMap: true,
  },
  packaging: {
    params: [
      { key: 'warpage', name: '패키지 휨', unit: 'µm', target: 45, sigma: 5, lsl: 20, usl: 70, digits: 1 },
      { key: 'shear', name: '솔더볼 전단강도', unit: 'gf', target: 850, sigma: 35, lsl: 700, usl: 1000, digits: 0 },
      { key: 'void', name: '몰드 보이드율', unit: '%', target: 0.5, sigma: 0.18, lsl: 0, usl: 1.2, digits: 2, positive: true },
    ],
  },
  hbm: {
    params: [
      { key: 'tsv_res', name: 'TSV 저항', unit: 'mΩ', target: 25, sigma: 1.5, lsl: 18, usl: 32, digits: 1 },
      { key: 'bump_h', name: '마이크로범프 높이', unit: 'µm', target: 18.0, sigma: 0.4, lsl: 16.2, usl: 19.8, digits: 2 },
      { key: 'stack_warp', name: '적층 후 휨', unit: 'µm', target: 35, sigma: 4, lsl: 12, usl: 58, digits: 1 },
    ],
    hasBinMap: true,
  },
};

/* ---------------- FDC 장비 센서 정의 (공정별) ----------------
   linked:true 센서는 이상 케이스 발생 시 계측 이상과 상관된 변동을 보인다.
   → 계측 데이터(결과)와 FDC 센서(원인)를 연결해 근본원인을 찾는 훈련용 */
export const FDC_DEFS = {
  wafer: [
    { key: 'pull_speed', name: '잉곳 인상 속도', unit: 'mm/min', base: 1.2, noise: 0.02, linked: true },
    { key: 'melt_temp', name: '용융 실리콘 온도', unit: '°C', base: 1420, noise: 1.5 },
    { key: 'crucible_rot', name: '도가니 회전수', unit: 'rpm', base: 8, noise: 0.15 },
  ],
  oxidation: [
    { key: 'furnace_temp', name: '노 중심부 온도', unit: '°C', base: 950, noise: 0.6, linked: true },
    { key: 'o2_flow', name: 'O₂ 유량', unit: 'slm', base: 5.0, noise: 0.08 },
    { key: 'ramp_rate', name: '승온 속도', unit: '°C/min', base: 10, noise: 0.2 },
  ],
  photo: [
    { key: 'dose', name: '노광 도즈', unit: 'mJ/cm²', base: 30.0, noise: 0.15, linked: true },
    { key: 'hotplate_temp', name: '핫플레이트 온도', unit: '°C', base: 110, noise: 0.25 },
    { key: 'focus', name: '포커스 오프셋', unit: 'nm', base: 0, noise: 4 },
  ],
  etch: [
    { key: 'rf_power', name: 'RF 소스 파워', unit: 'W', base: 1500, noise: 8, linked: true },
    { key: 'pressure', name: '챔버 압력', unit: 'mTorr', base: 15, noise: 0.25 },
    { key: 'he_flow', name: 'He 백사이드 유량', unit: 'sccm', base: 8, noise: 0.2 },
  ],
  deposition: [
    { key: 'heater_temp', name: '히터(서셉터) 온도', unit: '°C', base: 400, noise: 1.2, linked: true },
    { key: 'precursor_flow', name: '전구체 가스 유량', unit: 'sccm', base: 120, noise: 1.5 },
    { key: 'chamber_p', name: '챔버 압력', unit: 'Torr', base: 3.0, noise: 0.05 },
  ],
  metal: [
    { key: 'plating_i', name: '도금 전류밀도', unit: 'mA/cm²', base: 20, noise: 0.3, linked: true },
    { key: 'slurry_flow', name: 'CMP 슬러리 유량', unit: 'ml/min', base: 200, noise: 3 },
    { key: 'head_p', name: 'CMP 헤드 압력', unit: 'psi', base: 3.5, noise: 0.06 },
  ],
  eds: [
    { key: 'chuck_temp', name: '웨이퍼 척 온도', unit: '°C', base: 85, noise: 0.3, linked: true },
    { key: 'contact_r', name: '프로브 접촉 저항', unit: 'Ω', base: 1.2, noise: 0.05 },
    { key: 'overdrive', name: '프로브 오버드라이브', unit: 'µm', base: 75, noise: 1 },
  ],
  packaging: [
    { key: 'bond_force', name: '다이본딩 하중', unit: 'N', base: 50, noise: 0.8, linked: true },
    { key: 'reflow_peak', name: '리플로우 피크 온도', unit: '°C', base: 245, noise: 1.0 },
    { key: 'mold_p', name: '몰딩 프레스 압력', unit: 'MPa', base: 8.0, noise: 0.12 },
  ],
  hbm: [
    { key: 'tc_force', name: 'TC본더 압착 하중', unit: 'N', base: 35, noise: 0.5, linked: true },
    { key: 'reflow_peak', name: '매스 리플로우 피크', unit: '°C', base: 250, noise: 1.2 },
    { key: 'muf_visc', name: 'MUF 점도 지표', unit: 'cP', base: 120, noise: 2 },
  ],
};

/* ---------------- 사이트 좌표 (13-site 표준 배치) ---------------- */
export const SITES = (() => {
  const s = [{ x: 0, y: 0 }];
  for (let ring = 1; ring <= 2; ring++) {
    const n = ring === 1 ? 4 : 8;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (ring === 2 ? Math.PI / 8 : 0);
      s.push({ x: Math.cos(a) * ring * 0.45, y: Math.sin(a) * ring * 0.45 });
    }
  }
  return s; // 13개, 반지름 0~0.9 (정규화)
})();

/* ---------------- 데이터셋 생성 ----------------
   anomaly: { param, type, at(0~1 구간 시작), mag(σ 배수), ... }
   type: 'shift' 평균 이동 | 'drift' 점진 드리프트 | 'spike' 단발 이상 |
         'highvar' 산포 증가 | 'cyclic' 주기 변동 | 'edge' 웨이퍼 가장자리 |
         'lot' 특정 로트 전체 이상
---------------------------------------------------- */
export function generate(procId, { seed = 42, anomaly = null, lots = 8, wafersPerLot = 25 } = {}) {
  const def = PROC_DATA_DEFS[procId];
  const rng = mulberry32(seed);
  const total = lots * wafersPerLot;
  const startIdx = anomaly ? Math.floor(total * (anomaly.at ?? 0.6)) : -1;
  const badLot = anomaly?.type === 'lot' ? (anomaly.lot ?? lots - 2) : -1;

  const dataset = { procId, def, lots, wafersPerLot, seed, anomaly, wafers: [] };

  for (let li = 0; li < lots; li++) {
    const lotId = `LOT-${String(2400 + seed % 100).padStart(4, '0')}${String.fromCharCode(65 + li)}`;
    const lotOffsets = {};
    def.params.forEach(p => { lotOffsets[p.key] = gauss(rng) * p.sigma * 0.15; });

    for (let wi = 0; wi < wafersPerLot; wi++) {
      const idx = li * wafersPerLot + wi;
      const wafer = { idx, lot: lotId, lotIdx: li, waferNo: wi + 1, values: {}, sites: {}, flags: {} };

      for (const p of def.params) {
        let v = p.target + lotOffsets[p.key] + gauss(rng) * p.sigma;
        const isTarget = anomaly && (anomaly.param === p.key || !anomaly.param && p === def.params[0]);

        if (isTarget) {
          const mag = (anomaly.mag ?? 2.5) * p.sigma;
          switch (anomaly.type) {
            case 'shift': if (idx >= startIdx) v += mag; break;
            case 'drift': if (idx >= startIdx) v += mag * (idx - startIdx) / (total - startIdx); break;
            case 'spike': if (idx === startIdx || idx === startIdx + 7) v += mag * 1.8; break;
            case 'highvar': if (idx >= startIdx) v += gauss(rng) * mag; break;
            case 'cyclic': if (idx >= startIdx) v += Math.sin((idx - startIdx) * 0.8) * mag * 0.8; break;
            case 'lot': if (li === badLot) v += mag; break;
          }
        }
        if (p.positive) v = Math.max(0, v);
        if (p.isYield) v = Math.min(100, v);
        wafer.values[p.key] = v;

        // 사이트 데이터 (wafer내 산포: radial 성분 + 랜덤)
        let radialCoef = gauss(rng) * p.sigma * 0.3;
        if (isTarget && anomaly.type === 'edge' && idx >= startIdx) radialCoef += (anomaly.mag ?? 2.5) * p.sigma;
        wafer.sites[p.key] = SITES.map(s => {
          const r = Math.hypot(s.x, s.y);
          return v + radialCoef * r * r + gauss(rng) * p.sigma * 0.35;
        });
      }

      // FDC 장비 센서 (웨이퍼 run별 요약값) — linked 센서는 이상과 상관
      let eff = 0;
      if (anomaly) {
        switch (anomaly.type) {
          case 'shift': case 'edge': eff = idx >= startIdx ? 1 : 0; break;
          case 'drift': eff = idx >= startIdx ? (idx - startIdx) / (total - startIdx) : 0; break;
          case 'spike': eff = (idx === startIdx || idx === startIdx + 7) ? 1.6 : 0; break;
          case 'highvar': eff = idx >= startIdx ? Math.abs(gauss(rng)) * 0.8 : 0; break;
          case 'cyclic': eff = idx >= startIdx ? (Math.sin((idx - startIdx) * 0.8) + 1) / 2 : 0; break;
          case 'lot': eff = li === badLot ? 1 : 0; break;
        }
      }
      wafer.fdc = {};
      for (const s of (FDC_DEFS[procId] || [])) {
        const scale = Math.max(Math.abs(s.base) * 0.02, s.noise * 2.5);
        const disturb = s.linked ? eff * scale * ((anomaly?.mag ?? 2.5) / 2.5) : 0;
        wafer.fdc[s.key] = s.base + gauss(rng) * s.noise + disturb;
      }

      // 빈맵 (EDS/HBM)
      if (def.hasBinMap) {
        let pattern = 'none';
        if (anomaly?.binPattern && idx >= startIdx) pattern = anomaly.binPattern;
        else if (rng() < 0.06) pattern = ['random', 'edge'][Math.floor(rng() * 2)];
        wafer.binMap = makeBinMap(rng, pattern, anomaly?.mag ?? 2.5);
        wafer.flags.binPattern = pattern;
        // 수율 파라미터가 있으면 빈맵과 동기화
        const yp = def.params.find(p => p.isYield);
        if (yp) {
          const flat = wafer.binMap.flat().filter(v2 => v2 >= 0);
          wafer.values[yp.key] = 100 * flat.filter(v2 => v2 === 1).length / flat.length;
        }
      }
      dataset.wafers.push(wafer);
    }
  }
  return dataset;
}

/* ---------------- 빈맵 생성 (15×15 원형) ---------------- */
export function makeBinMap(rng, pattern = 'none', severity = 2.5) {
  const N = 15, c = (N - 1) / 2;
  const grid = [];
  const sev = Math.min(severity / 2.5, 2);
  for (let y = 0; y < N; y++) {
    const row = [];
    for (let x = 0; x < N; x++) {
      const r = Math.hypot(x - c, y - c) / c;
      if (r > 1.0) { row.push(-1); continue; }
      let failP = 0.015; // 기본 랜덤 불량
      switch (pattern) {
        case 'edge': if (r > 0.78) failP += 0.55 * sev; break;
        case 'center': if (r < 0.3) failP += 0.6 * sev; break;
        case 'ring': if (r > 0.45 && r < 0.65) failP += 0.5 * sev; break;
        case 'scratch': { // 대각선 스크래치
          const d = Math.abs((y - c) - 0.7 * (x - c)) / Math.sqrt(1.49);
          if (d < 0.9) failP += 0.75 * sev;
          break;
        }
        case 'bottom': if (y > N * 0.7) failP += 0.5 * sev; break;
        case 'random': failP += 0.10 * sev; break;
      }
      row.push(rng() < failP ? 0 : 1);
    }
    grid.push(row);
  }
  return grid;
}

/* ---------------- SPC 통계 ---------------- */
// 기준선(앞 30%)으로 관리한계 산출 — 이상 주입 이후 구간이 한계를 벗어나게 보이도록
export function spcStats(values, def) {
  const n = Math.max(20, Math.floor(values.length * 0.3));
  const base = values.slice(0, n);
  const mean = base.reduce((a, b) => a + b, 0) / base.length;
  const sigma = Math.sqrt(base.reduce((a, b) => a + (b - mean) ** 2, 0) / (base.length - 1));
  const ucl = mean + 3 * sigma, lcl = mean - 3 * sigma;

  const allMean = values.reduce((a, b) => a + b, 0) / values.length;
  const allSigma = Math.sqrt(values.reduce((a, b) => a + (b - allMean) ** 2, 0) / (values.length - 1));
  let cpk = null;
  if (def && def.usl !== undefined && def.lsl !== undefined) {
    cpk = Math.min((def.usl - allMean) / (3 * allSigma), (allMean - def.lsl) / (3 * allSigma));
  }
  return { mean, sigma, ucl, lcl, allMean, allSigma, cpk };
}

// Western Electric Rules — 반환: [{idx, rule, desc}]
export function weRules(values, mean, sigma) {
  const v = [];
  const z = values.map(x => (x - mean) / (sigma || 1e-9));
  for (let i = 0; i < z.length; i++) {
    // Rule 1: 3σ 밖 1점
    if (Math.abs(z[i]) > 3) v.push({ idx: i, rule: 1, desc: 'Rule 1: 관리한계(±3σ) 이탈' });
    // Rule 2: 연속 3점 중 2점이 같은 방향 2σ 밖
    if (i >= 2) {
      const w = z.slice(i - 2, i + 1);
      if (w.filter(x => x > 2).length >= 2 || w.filter(x => x < -2).length >= 2)
        v.push({ idx: i, rule: 2, desc: 'Rule 2: 3점 중 2점이 2σ 초과 (동일 방향)' });
    }
    // Rule 3: 연속 5점 중 4점이 같은 방향 1σ 밖
    if (i >= 4) {
      const w = z.slice(i - 4, i + 1);
      if (w.filter(x => x > 1).length >= 4 || w.filter(x => x < -1).length >= 4)
        v.push({ idx: i, rule: 3, desc: 'Rule 3: 5점 중 4점이 1σ 초과 (동일 방향)' });
    }
    // Rule 4: 연속 8점이 중심선 한쪽
    if (i >= 7) {
      const w = z.slice(i - 7, i + 1);
      if (w.every(x => x > 0) || w.every(x => x < 0))
        v.push({ idx: i, rule: 4, desc: 'Rule 4: 연속 8점이 중심선 한쪽에 위치' });
    }
  }
  // 같은 idx는 최저 rule 하나만
  const seen = new Map();
  for (const x of v) if (!seen.has(x.idx) || seen.get(x.idx).rule > x.rule) seen.set(x.idx, x);
  return [...seen.values()].sort((a, b) => a.idx - b.idx);
}

export function fmt(v, def) {
  return v.toFixed(def?.digits ?? 2);
}

/* ---------------- FDC 트레이스 (공정 중 실시간 센서 파형) ----------------
   램프업 → 정상 구간 → 램프다운 형태. 정상 구간 레벨은 해당 웨이퍼의
   fdc 요약값이므로 이상 케이스의 교란이 그대로 반영된다. */
export function fdcTrace(dataset, waferIdx, sensor, points = 80) {
  const rng = mulberry32((dataset.seed * 7919 + waferIdx * 131 + sensor.key.length * 17) >>> 0);
  const level = dataset.wafers[waferIdx].fdc[sensor.key];
  const idle = sensor.base === 0 ? -sensor.noise * 6 : sensor.base * 0.12;
  const pts = [];
  for (let i = 0; i < points; i++) {
    let v;
    if (i < 8) v = idle + (level - idle) * (i / 8);                 // 램프업
    else if (i < points - 10) v = level + gauss(rng) * sensor.noise * 0.55; // 정상 공정
    else v = level + (idle - level) * ((i - (points - 10)) / 10);   // 램프다운
    pts.push(v);
  }
  return pts;
}
