// Spotfire 스타일 캔버스 차트 렌더러 — 관리도/웨이퍼맵/빈맵/박스플롯/히스토그램
// 모든 차트는 다크 테마, HiDPI 대응, 마킹(선택) 연동을 지원한다.

const C = {
  bg: '#ffffff', grid: '#e8e8ed', axis: '#a1a1a6', text: '#6e6e73',
  line: '#0071e3', point: '#4a95e8', target: '#248a3d', limit: '#d70015',
  spec: '#b25e00', viol: '#d70015', sel: '#e8481f',
};
const FONT = '11px "Cascadia Code", Consolas, monospace';

function setup(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth || 300, h = canvas.clientHeight || 200;
  canvas.width = w * dpr; canvas.height = h * dpr;
  const g = canvas.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.fillStyle = C.bg; g.fillRect(0, 0, w, h);
  return { g, w, h };
}

/* ---------------- 관리도 (Control Chart) ---------------- */
// opts: {values, stats:{mean,ucl,lcl}, def:{target,usl,lsl,unit}, violations, selected, color, lotBounds}
export function controlChart(canvas, opts) {
  const { g, w, h } = setup(canvas);
  const { values, stats, def, violations = [], selected = -1, color = C.line, lotBounds = [] } = opts;
  const padL = 52, padR = 12, padT = 14, padB = 22;
  const pw = w - padL - padR, ph = h - padT - padB;

  const lines = [stats.ucl, stats.lcl, stats.mean];
  if (def?.usl !== undefined) lines.push(def.usl, def.lsl);
  let min = Math.min(...values, ...lines), max = Math.max(...values, ...lines);
  const pad = (max - min) * 0.08 || 1; min -= pad; max += pad;
  const X = i => padL + (i / Math.max(values.length - 1, 1)) * pw;
  const Y = v => padT + (1 - (v - min) / (max - min)) * ph;

  // 로트 경계 배경 밴드
  lotBounds.forEach((b, i) => {
    if (i % 2 === 0) return;
    g.fillStyle = 'rgba(0,0,0,.03)';
    g.fillRect(X(b.start), padT, X(b.end) - X(b.start), ph);
  });

  // 그리드
  g.strokeStyle = C.grid; g.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padT + (i / 4) * ph;
    g.beginPath(); g.moveTo(padL, y); g.lineTo(w - padR, y); g.stroke();
  }

  // 기준선들
  const refLine = (v, col, label, dash = []) => {
    g.strokeStyle = col; g.setLineDash(dash); g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(padL, Y(v)); g.lineTo(w - padR, Y(v)); g.stroke();
    g.setLineDash([]);
    g.fillStyle = col; g.font = FONT;
    g.fillText(label, 4, Y(v) + 3.5);
  };
  if (def?.usl !== undefined) { refLine(def.usl, C.spec, 'USL', [2, 3]); refLine(def.lsl, C.spec, 'LSL', [2, 3]); }
  refLine(stats.ucl, C.limit, 'UCL', [5, 4]);
  refLine(stats.lcl, C.limit, 'LCL', [5, 4]);
  refLine(stats.mean, C.target, 'CL');

  // 데이터 라인
  g.strokeStyle = color; g.lineWidth = 1.4; g.beginPath();
  values.forEach((v, i) => i === 0 ? g.moveTo(X(i), Y(v)) : g.lineTo(X(i), Y(v)));
  g.stroke();

  // 포인트 (위반=빨강, 선택=주황 링)
  const violSet = new Set(violations.map(v => v.idx));
  const ptR = values.length > 120 ? 2 : 3;
  values.forEach((v, i) => {
    g.beginPath();
    g.arc(X(i), Y(v), violSet.has(i) ? ptR + 1.5 : ptR, 0, Math.PI * 2);
    g.fillStyle = violSet.has(i) ? C.viol : color;
    g.fill();
    if (i === selected) {
      g.beginPath(); g.arc(X(i), Y(v), ptR + 4, 0, Math.PI * 2);
      g.strokeStyle = C.sel; g.lineWidth = 2; g.stroke();
    }
  });

  // 축 라벨
  g.fillStyle = C.text; g.font = FONT;
  g.fillText(fmtN(max - pad), padL - 46, padT + 8);
  g.fillText(fmtN(min + pad), padL - 46, padT + ph);
  g.fillText('웨이퍼 순서 →', w - 90, h - 6);

  // 히트 테스트 정보 저장
  canvas._hit = { X, Y, values, padL, pw };
}

// 관리도 클릭 → 웨이퍼 인덱스 (없으면 -1)
export function chartHitTest(canvas, e) {
  const hit = canvas._hit;
  if (!hit) return -1;
  const r = canvas.getBoundingClientRect();
  const x = e.clientX - r.left;
  const i = Math.round(((x - hit.padL) / hit.pw) * (hit.values.length - 1));
  return i >= 0 && i < hit.values.length ? i : -1;
}

/* ---------------- 웨이퍼 사이트 맵 (파라미터 컬러맵) ---------------- */
export function siteMap(canvas, sites, values, { def, title = '' } = {}) {
  const { g, w, h } = setup(canvas);
  const cx = w / 2, cy = h / 2 + 4, R = Math.min(w, h) / 2 - 22;

  // 웨이퍼 원판
  g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2);
  g.fillStyle = '#eef1f6'; g.fill();
  g.strokeStyle = C.axis; g.lineWidth = 1.5; g.stroke();
  // 노치
  g.beginPath(); g.arc(cx, cy + R, 5, 0, Math.PI * 2);
  g.fillStyle = '#d5dae2'; g.fill();

  const min = Math.min(...values), max = Math.max(...values);
  const span = max - min || 1;
  sites.forEach((s, i) => {
    const t = (values[i] - min) / span;
    g.beginPath();
    g.arc(cx + s.x * R, cy + s.y * R, Math.max(9, R * 0.13), 0, Math.PI * 2);
    g.fillStyle = heat(t); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.4)'; g.stroke();
    g.fillStyle = '#0b0e14'; g.font = 'bold 9px monospace'; g.textAlign = 'center';
    g.fillText(values[i].toFixed(def?.digits > 1 ? 1 : def?.digits ?? 1), cx + s.x * R, cy + s.y * R + 3);
  });
  g.textAlign = 'left';

  // 컬러 스케일
  for (let i = 0; i < 60; i++) {
    g.fillStyle = heat(i / 59);
    g.fillRect(w - 16, h - 20 - i * ((h - 40) / 60), 8, (h - 40) / 60 + 1);
  }
  g.fillStyle = C.text; g.font = FONT;
  g.fillText(fmtN(max), w - 44, 18);
  g.fillText(fmtN(min), w - 44, h - 8);
  if (title) { g.fillStyle = C.text; g.fillText(title, 8, 14); }
}

/* ---------------- 빈맵 (Pass/Fail) ---------------- */
export function binMap(canvas, grid, { pattern = '' } = {}) {
  const { g, w, h } = setup(canvas);
  const N = grid.length;
  const cell = Math.min(w - 20, h - 26) / N;
  const ox = (w - cell * N) / 2, oy = (h - cell * N) / 2 + 4;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const v = grid[y][x];
    if (v < 0) continue;
    g.fillStyle = v === 1 ? '#34a853' : '#e5484d';
    g.fillRect(ox + x * cell + 0.5, oy + y * cell + 0.5, cell - 1, cell - 1);
  }
  const flat = grid.flat().filter(v => v >= 0);
  const y = (100 * flat.filter(v => v === 1).length / flat.length).toFixed(1);
  g.fillStyle = C.text; g.font = FONT;
  g.fillText(`Yield ${y}%  ${pattern && pattern !== 'none' ? '· 패턴: ' + pattern : ''}`, 8, 14);
}

/* ---------------- 박스플롯 (로트별) ---------------- */
export function boxPlot(canvas, groups, { def, stats, color = C.line } = {}) {
  const { g, w, h } = setup(canvas);
  const padL = 52, padR = 10, padT = 12, padB = 30;
  const pw = w - padL - padR, ph = h - padT - padB;

  const all = groups.flatMap(gr => gr.values);
  let min = Math.min(...all), max = Math.max(...all);
  const pad = (max - min) * 0.1 || 1; min -= pad; max += pad;
  const Y = v => padT + (1 - (v - min) / (max - min)) * ph;
  const bw = pw / groups.length;

  g.strokeStyle = C.grid;
  for (let i = 0; i <= 4; i++) {
    const y = padT + (i / 4) * ph;
    g.beginPath(); g.moveTo(padL, y); g.lineTo(w - padR, y); g.stroke();
  }
  if (stats) {
    g.strokeStyle = C.target; g.setLineDash([4, 4]);
    g.beginPath(); g.moveTo(padL, Y(stats.mean)); g.lineTo(w - padR, Y(stats.mean)); g.stroke();
    g.setLineDash([]);
  }

  groups.forEach((gr, i) => {
    const v = [...gr.values].sort((a, b) => a - b);
    const q = p => v[Math.floor((v.length - 1) * p)];
    const [q1, q2, q3] = [q(0.25), q(0.5), q(0.75)];
    const iqr = q3 - q1;
    const lo = Math.max(v[0], q1 - 1.5 * iqr), hi = Math.min(v[v.length - 1], q3 + 1.5 * iqr);
    const x = padL + i * bw + bw / 2, bxw = Math.min(bw * 0.5, 26);

    g.strokeStyle = gr.highlight ? C.sel : C.axis; g.lineWidth = gr.highlight ? 2 : 1;
    g.beginPath(); g.moveTo(x, Y(lo)); g.lineTo(x, Y(q1)); g.moveTo(x, Y(q3)); g.lineTo(x, Y(hi)); g.stroke();
    g.fillStyle = gr.highlight ? 'rgba(232,72,31,.28)' : 'rgba(0,113,227,.16)';
    g.fillRect(x - bxw / 2, Y(q3), bxw, Y(q1) - Y(q3));
    g.strokeRect(x - bxw / 2, Y(q3), bxw, Y(q1) - Y(q3));
    g.strokeStyle = gr.highlight ? C.sel : color; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x - bxw / 2, Y(q2)); g.lineTo(x + bxw / 2, Y(q2)); g.stroke();
    // 아웃라이어
    g.fillStyle = C.viol;
    v.filter(x2 => x2 < lo || x2 > hi).forEach(x2 => {
      g.beginPath(); g.arc(x, Y(x2), 2, 0, Math.PI * 2); g.fill();
    });
    g.fillStyle = C.text; g.font = '10px monospace'; g.textAlign = 'center';
    g.fillText(gr.label.replace('LOT-', ''), x, h - 12);
  });
  g.textAlign = 'left';
  g.fillStyle = C.text; g.font = FONT;
  g.fillText(fmtN(max - pad), padL - 46, padT + 8);
  g.fillText(fmtN(min + pad), padL - 46, padT + ph);
}

/* ---------------- 히스토그램 ---------------- */
export function histogram(canvas, values, { def, stats, bins = 24, color = C.line } = {}) {
  const { g, w, h } = setup(canvas);
  const padL = 12, padR = 12, padT = 12, padB = 24;
  const pw = w - padL - padR, ph = h - padT - padB;

  let min = Math.min(...values), max = Math.max(...values);
  if (def?.lsl !== undefined) { min = Math.min(min, def.lsl); max = Math.max(max, def.usl); }
  const span = max - min || 1;
  min -= span * 0.05; max += span * 0.05;
  const counts = new Array(bins).fill(0);
  values.forEach(v => {
    const b = Math.min(bins - 1, Math.max(0, Math.floor(((v - min) / (max - min)) * bins)));
    counts[b]++;
  });
  const maxC = Math.max(...counts);
  const X = v => padL + ((v - min) / (max - min)) * pw;

  counts.forEach((c, i) => {
    const x0 = padL + (i / bins) * pw;
    g.fillStyle = 'rgba(0,113,227,.42)';
    g.fillRect(x0 + 1, padT + ph * (1 - c / maxC), pw / bins - 2, ph * (c / maxC));
  });

  const vline = (v, col, label) => {
    if (v === undefined) return;
    g.strokeStyle = col; g.setLineDash([4, 3]); g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(X(v), padT); g.lineTo(X(v), padT + ph); g.stroke();
    g.setLineDash([]);
    g.fillStyle = col; g.font = FONT; g.textAlign = 'center';
    g.fillText(label, X(v), padT + ph + 14);
    g.textAlign = 'left';
  };
  vline(def?.lsl, C.spec, 'LSL');
  vline(def?.usl, C.spec, 'USL');
  vline(def?.target, C.target, 'T');
  if (stats) vline(stats.allMean, '#4a95e8', 'x̄');
}

/* ---------------- FDC 트렌드 (웨이퍼별 센서 요약값) ---------------- */
// 정상 밴드(base±3σ)를 배경으로 깔고 벗어나는 구간을 강조. 클릭=웨이퍼 선택(chartHitTest 호환)
export function fdcTrend(canvas, values, { sensor, selected = -1, color = '#0e9db5', lotBounds = [] } = {}) {
  const { g, w, h } = setup(canvas);
  const padL = 52, padR = 12, padT = 14, padB = 22;
  const pw = w - padL - padR, ph = h - padT - padB;

  const bandLo = sensor.base - 3 * sensor.noise, bandHi = sensor.base + 3 * sensor.noise;
  let min = Math.min(...values, bandLo), max = Math.max(...values, bandHi);
  const pad = (max - min) * 0.12 || 1; min -= pad; max += pad;
  const X = i => padL + (i / Math.max(values.length - 1, 1)) * pw;
  const Y = v => padT + (1 - (v - min) / (max - min)) * ph;

  lotBounds.forEach((b, i) => {
    if (i % 2 === 0) return;
    g.fillStyle = 'rgba(0,0,0,.03)';
    g.fillRect(X(b.start), padT, X(b.end) - X(b.start), ph);
  });

  // 정상 운전 밴드
  g.fillStyle = 'rgba(36,138,61,.08)';
  g.fillRect(padL, Y(bandHi), pw, Y(bandLo) - Y(bandHi));
  g.strokeStyle = 'rgba(36,138,61,.45)'; g.setLineDash([3, 4]); g.lineWidth = 1;
  [bandHi, bandLo].forEach(v => { g.beginPath(); g.moveTo(padL, Y(v)); g.lineTo(w - padR, Y(v)); g.stroke(); });
  g.setLineDash([]);
  g.fillStyle = 'rgba(36,138,61,.9)'; g.font = FONT;
  g.fillText('정상밴드', 4, Y(bandHi) + 3.5);

  // 데이터
  g.strokeStyle = color; g.lineWidth = 1.3; g.beginPath();
  values.forEach((v, i) => i === 0 ? g.moveTo(X(i), Y(v)) : g.lineTo(X(i), Y(v)));
  g.stroke();
  const ptR = values.length > 120 ? 1.8 : 2.6;
  values.forEach((v, i) => {
    const out = v > bandHi || v < bandLo;
    g.beginPath(); g.arc(X(i), Y(v), out ? ptR + 1.4 : ptR, 0, Math.PI * 2);
    g.fillStyle = out ? C.viol : color; g.fill();
    if (i === selected) {
      g.beginPath(); g.arc(X(i), Y(v), ptR + 4, 0, Math.PI * 2);
      g.strokeStyle = C.sel; g.lineWidth = 2; g.stroke();
    }
  });

  g.fillStyle = C.text; g.font = FONT;
  g.fillText(fmtN(max - pad), padL - 46, padT + 8);
  g.fillText(fmtN(min + pad), padL - 46, padT + ph);
  g.fillText('웨이퍼 순서 →', w - 90, h - 6);
  canvas._hit = { X, Y, values, padL, pw };
}

/* ---------------- FDC 트레이스 (단일 run 실시간 파형) ---------------- */
export function traceChart(canvas, pts, { sensor, color = '#7856d6' } = {}) {
  const { g, w, h } = setup(canvas);
  const padL = 52, padR = 12, padT = 14, padB = 22;
  const pw = w - padL - padR, ph = h - padT - padB;

  const bandLo = sensor.base - 3 * sensor.noise, bandHi = sensor.base + 3 * sensor.noise;
  let min = Math.min(...pts, bandLo), max = Math.max(...pts, bandHi);
  const pad = (max - min) * 0.08 || 1; min -= pad; max += pad;
  const X = i => padL + (i / (pts.length - 1)) * pw;
  const Y = v => padT + (1 - (v - min) / (max - min)) * ph;

  // 정상 공정 구간 밴드
  g.fillStyle = 'rgba(36,138,61,.07)';
  g.fillRect(padL, Y(bandHi), pw, Y(bandLo) - Y(bandHi));
  g.strokeStyle = 'rgba(36,138,61,.4)'; g.setLineDash([3, 4]);
  [bandHi, bandLo].forEach(v => { g.beginPath(); g.moveTo(padL, Y(v)); g.lineTo(w - padR, Y(v)); g.stroke(); });
  g.setLineDash([]);

  // 공정 구간 표시 (램프업/정상/램프다운)
  const seg = (x0, x1, label) => {
    g.fillStyle = 'rgba(110,110,115,.75)'; g.font = '10px monospace'; g.textAlign = 'center';
    g.fillText(label, (X(x0) + X(x1)) / 2, padT + 10);
    g.textAlign = 'left';
  };
  seg(0, 8, '램프업'); seg(8, pts.length - 10, '공정 (steady)'); seg(pts.length - 10, pts.length - 1, '종료');
  g.strokeStyle = C.grid;
  [8, pts.length - 10].forEach(i => {
    g.beginPath(); g.moveTo(X(i), padT); g.lineTo(X(i), padT + ph); g.stroke();
  });

  // 파형
  g.strokeStyle = color; g.lineWidth = 1.6; g.beginPath();
  pts.forEach((v, i) => i === 0 ? g.moveTo(X(i), Y(v)) : g.lineTo(X(i), Y(v)));
  g.stroke();

  g.fillStyle = C.text; g.font = FONT;
  g.fillText(fmtN(max - pad), padL - 46, padT + 8);
  g.fillText(fmtN(min + pad), padL - 46, padT + ph);
  g.fillText('공정 시간 →', w - 84, h - 6);
}

/* ---------------- 알람 파레토 (수평 막대) ---------------- */
export function pareto(canvas, items, { color = '#e8481f' } = {}) {
  const { g, w, h } = setup(canvas);
  if (!items.length) {
    g.fillStyle = C.text; g.font = FONT;
    g.fillText('알람 없음 — 안정 가동 중', 12, 24);
    return;
  }
  const top = items.slice(0, 6);
  const maxN = top[0].n;
  const rowH = Math.min(34, (h - 16) / top.length);
  const padL = 76, padR = 34;
  top.forEach((it, i) => {
    const y = 10 + i * rowH;
    const bw = (w - padL - padR) * (it.n / maxN);
    g.fillStyle = C.text; g.font = FONT; g.textAlign = 'right';
    g.fillText(it.code, padL - 8, y + rowH / 2 + 3);
    g.textAlign = 'left';
    const isInterlock = it.code.startsWith('IL');
    g.fillStyle = isInterlock ? '#d70015' : (i === 0 ? color : 'rgba(232,72,31,.45)');
    g.beginPath(); g.roundRect(padL, y + rowH * 0.18, Math.max(bw, 3), rowH * 0.64, 5); g.fill();
    g.fillStyle = C.text;
    g.fillText(String(it.n), padL + Math.max(bw, 3) + 7, y + rowH / 2 + 3);
  });
}

/* ---------------- 유틸 ---------------- */
function heat(t) { // 파랑→초록→노랑→빨강
  const stops = [[43, 108, 226], [61, 220, 132], [255, 209, 102], [255, 77, 109]];
  const x = Math.max(0, Math.min(0.9999, t)) * (stops.length - 1);
  const i = Math.floor(x), f = x - i;
  const a = stops[i], b = stops[i + 1];
  return `rgb(${a.map((c, k) => Math.round(c + (b[k] - c) * f)).join(',')})`;
}
function fmtN(v) {
  const a = Math.abs(v);
  if (a >= 1000) return v.toFixed(0);
  if (a >= 10) return v.toFixed(1);
  if (a >= 0.1) return v.toFixed(2);
  return v.toFixed(4);
}
