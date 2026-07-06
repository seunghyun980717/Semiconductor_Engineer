// Spotfire 분석실 — 공정 계측 대시보드 + 이상 사례 학습
import { PROCESSES, HBM, renderNav } from '../data/processes-index.js';
import { PROC_DATA_DEFS, FDC_DEFS, SITES, generate, spcStats, weRules, fmt, fdcTrace } from './datagen.js';
import { controlChart, chartHitTest, siteMap, binMap, boxPlot, histogram, fdcTrend, traceChart } from './charts.js';
import { CASES } from './cases.js';

renderNav('spotfire');

const ALL_PROCS = [...PROCESSES, HBM];
const state = {
  procId: new URLSearchParams(location.search).get('proc') || 'photo',
  paramKey: null,
  seed: 42,
  dataset: null,
  selected: -1,
  activeCase: null,
  quizDone: 0,
  resolved: false,
  fdcKey: null,
};
if (!PROC_DATA_DEFS[state.procId]) state.procId = 'photo';

/* ---------------- 사이드바 ---------------- */
function renderSidebar() {
  document.getElementById('sf-procs').innerHTML = ALL_PROCS.map(p => `
    <button class="sf-proc-btn ${p.id === state.procId ? 'active' : ''}" data-proc="${p.id}" style="--pc:${p.color}">
      <span class="dot" style="background:${p.color}"></span>${p.num ? p.num + '. ' : '★ '}${p.title}
    </button>`).join('');

  const cases = CASES[state.procId] || [];
  document.getElementById('sf-cases').innerHTML = cases.length
    ? cases.map(c => `
      <button class="sf-proc-btn ${state.activeCase?.id === c.id ? 'active' : ''}" data-case="${c.id}" style="--pc:var(--warn)">
        <span class="dot" style="background:var(--warn)"></span>${c.title}
      </button>`).join('')
    : '<p style="font-size:12px;color:var(--dim)">이 공정의 케이스 준비 중</p>';
}
document.getElementById('sf-procs').addEventListener('click', e => {
  const id = e.target.closest('[data-proc]')?.dataset.proc;
  if (!id) return;
  state.procId = id; state.activeCase = null; state.resolved = false;
  state.paramKey = null; state.selected = -1;
  regen(); renderSidebar();
});
document.getElementById('sf-cases').addEventListener('click', e => {
  const id = e.target.closest('[data-case]')?.dataset.case;
  if (!id) return;
  const c = (CASES[state.procId] || []).find(x => x.id === id);
  startCase(c);
});

/* ---------------- 데이터 & 대시보드 ---------------- */
function regen(newSeed = true) {
  if (newSeed) state.seed = Math.floor(Math.random() * 100000);
  const anomaly = state.activeCase && !state.resolved ? state.activeCase.anomaly : null;
  state.dataset = generate(state.procId, { seed: state.seed, anomaly });
  const def = PROC_DATA_DEFS[state.procId];
  if (!state.paramKey || !def.params.find(p => p.key === state.paramKey)) {
    state.paramKey = (state.activeCase?.anomaly.param) || def.params[0].key;
  }
  renderToolbar(); renderDash();
}

function renderToolbar() {
  const proc = ALL_PROCS.find(p => p.id === state.procId);
  const def = PROC_DATA_DEFS[state.procId];
  document.documentElement.style.setProperty('--pc', proc.color);
  document.getElementById('sf-title').innerHTML =
    `${proc.num ? proc.num + '. ' : '★ '}${proc.title} <span style="color:var(--dim);font-size:12px;font-weight:400">계측 데이터 대시보드${state.activeCase && !state.resolved ? ' — 🎓 케이스 진행 중' : ''}</span>`;
  const sel = document.getElementById('sf-param');
  sel.innerHTML = def.params.map(p =>
    `<option value="${p.key}" ${p.key === state.paramKey ? 'selected' : ''}>${p.name} (${p.unit})</option>`).join('');
  document.getElementById('sf-reset').style.display =
    state.activeCase && state.quizDone >= state.activeCase.questions.length && !state.resolved ? '' : 'none';
}

document.getElementById('sf-param').addEventListener('change', e => {
  state.paramKey = e.target.value; renderDash();
});
document.getElementById('sf-regen').addEventListener('click', () => regen(true));
document.getElementById('sf-reset').addEventListener('click', () => {
  state.resolved = true;
  regen(true);
});

function renderDash() {
  const ds = state.dataset;
  const def = ds.def.params.find(p => p.key === state.paramKey);
  const values = ds.wafers.map(w => w.values[state.paramKey]);
  const stats = spcStats(values, def);
  const violations = weRules(values, stats.mean, stats.sigma);
  const oocCount = violations.filter(v => v.rule === 1).length;
  const cpkClass = stats.cpk >= 1.33 ? 'ok' : stats.cpk >= 1.0 ? 'warn' : 'bad';
  if (state.selected < 0 || state.selected >= ds.wafers.length) {
    state.selected = violations[0]?.idx ?? Math.floor(ds.wafers.length / 2);
  }
  const selW = ds.wafers[state.selected];
  const proc = ALL_PROCS.find(p => p.id === state.procId);

  const dash = document.getElementById('sf-dash');
  dash.innerHTML = `
    ${state.activeCase ? casePanelHTML() : ''}
    <div class="kpi-row">
      <div class="kpi"><div class="k-label">평균 (전체)</div><div class="k-value">${fmt(stats.allMean, def)}</div><div class="k-sub">${def.unit} · 타깃 ${fmt(def.target, def)}</div></div>
      <div class="kpi"><div class="k-label">표준편차 σ</div><div class="k-value">${fmt(stats.allSigma, def)}</div><div class="k-sub">기준선 σ ${fmt(stats.sigma, def)}</div></div>
      <div class="kpi"><div class="k-label">공정능력 Cpk</div><div class="k-value ${cpkClass}">${stats.cpk?.toFixed(2) ?? '—'}</div><div class="k-sub">${stats.cpk >= 1.33 ? '우수 (≥1.33)' : stats.cpk >= 1.0 ? '주의 (1.0~1.33)' : '개선 필요 (<1.0)'}</div></div>
      <div class="kpi"><div class="k-label">관리한계 이탈</div><div class="k-value ${oocCount ? 'bad' : 'ok'}">${oocCount}건</div><div class="k-sub">±3σ (Rule 1)</div></div>
      <div class="kpi"><div class="k-label">Rule 위반 (전체)</div><div class="k-value ${violations.length ? 'warn' : 'ok'}">${violations.length}건</div><div class="k-sub">Western Electric 1~4</div></div>
    </div>
    <div class="sf-viz span8">
      <div class="viz-head"><b>📈 SPC 관리도 (X-chart)</b><span class="viz-info">${def.name} · ${ds.wafers.length}매 · 클릭=웨이퍼 선택</span></div>
      <canvas id="cv-control"></canvas>
    </div>
    <div class="sf-viz span4">
      <div class="viz-head"><b>📊 분포 히스토그램</b><span class="viz-info">LSL ${fmt(def.lsl, def)} / USL ${fmt(def.usl, def)}</span></div>
      <canvas id="cv-hist"></canvas>
    </div>
    <div class="sf-viz span6">
      <div class="viz-head"><b>📦 로트별 박스플롯</b><span class="viz-info">${ds.lots}개 로트 · 선택 로트 강조</span></div>
      <canvas id="cv-box"></canvas>
    </div>
    <div class="sf-viz span6">
      <div class="viz-head"><b>${ds.def.hasBinMap ? '🗺️ 웨이퍼 빈맵 (Pass/Fail)' : '🗺️ 웨이퍼 사이트 맵'}</b>
        <span class="viz-info" id="wafer-info">${selW.lot} #${String(selW.waferNo).padStart(2, '0')}</span></div>
      <canvas id="cv-wafer"></canvas>
    </div>
    <div class="sf-viz span6">
      <div class="viz-head"><b>📡 FDC 장비 센서 트렌드</b>
        <select id="fdc-sensor" style="background:var(--panel2);color:var(--text);border:1px solid var(--border);border-radius:6px;padding:3px 8px;font-size:11.5px;font-family:inherit"></select>
        <span class="viz-info">run별 평균 · 클릭=웨이퍼 선택</span></div>
      <canvas id="cv-fdc-trend"></canvas>
    </div>
    <div class="sf-viz span6">
      <div class="viz-head"><b>📉 선택 웨이퍼 공정 트레이스</b>
        <span class="viz-info">${selW.lot} #${String(selW.waferNo).padStart(2, '0')} · 공정 중 실시간 파형</span></div>
      <canvas id="cv-fdc-trace"></canvas>
    </div>
    <div class="sf-viz span12" style="min-height:auto">
      <div class="viz-head"><b>⚠ Rule 위반 로그</b><span class="viz-info">클릭하면 해당 웨이퍼 선택</span></div>
      <div id="viol-log" style="display:flex;flex-wrap:wrap;gap:6px;padding:4px 0">
        ${violations.length ? violations.slice(0, 40).map(v => {
          const w = ds.wafers[v.idx];
          return `<button class="quiz-opt" style="padding:4px 10px;font-size:11.5px" data-vidx="${v.idx}">
            <span class="badge rule">R${v.rule}</span> ${w.lot} #${w.waferNo} · ${fmt(values[v.idx], def)}${def.unit}</button>`;
        }).join('') : '<span style="font-size:12.5px;color:var(--ok)">✅ 위반 없음 — 공정이 안정 상태입니다</span>'}
      </div>
    </div>`;

  // 차트 렌더
  const lotBounds = [];
  for (let i = 0; i < ds.lots; i++) lotBounds.push({ start: i * ds.wafersPerLot, end: (i + 1) * ds.wafersPerLot - 1 });
  const cvC = document.getElementById('cv-control');
  const draw = () => {
    controlChart(cvC, { values, stats, def, violations, selected: state.selected, color: proc.color, lotBounds });
    histogram(document.getElementById('cv-hist'), values, { def, stats });
    const groups = [];
    for (let i = 0; i < ds.lots; i++) {
      const lw = ds.wafers.slice(i * ds.wafersPerLot, (i + 1) * ds.wafersPerLot);
      groups.push({ label: lw[0].lot, values: lw.map(w => w.values[state.paramKey]), highlight: i === selW.lotIdx });
    }
    boxPlot(document.getElementById('cv-box'), groups, { def, stats });
    const cvW = document.getElementById('cv-wafer');
    if (ds.def.hasBinMap) binMap(cvW, selW.binMap, { pattern: selW.flags.binPattern });
    else siteMap(cvW, SITES, selW.sites[state.paramKey], { def });
    // FDC
    const sensors = FDC_DEFS[state.procId] || [];
    const sensor = sensors.find(s => s.key === state.fdcKey) || sensors[0];
    if (sensor) {
      fdcTrend(document.getElementById('cv-fdc-trend'),
        ds.wafers.map(w => w.fdc[sensor.key]),
        { sensor, selected: state.selected, lotBounds });
      traceChart(document.getElementById('cv-fdc-trace'),
        fdcTrace(ds, state.selected, sensor), { sensor });
    }
  };
  requestAnimationFrame(draw);

  // FDC 센서 선택
  const sensors = FDC_DEFS[state.procId] || [];
  const fdcSel = document.getElementById('fdc-sensor');
  if (!state.fdcKey || !sensors.find(s => s.key === state.fdcKey)) state.fdcKey = sensors[0]?.key;
  fdcSel.innerHTML = sensors.map(s =>
    `<option value="${s.key}" ${s.key === state.fdcKey ? 'selected' : ''}>${s.name} (${s.unit})</option>`).join('');
  fdcSel.addEventListener('change', e => { state.fdcKey = e.target.value; renderDash(); });
  const cvFdc = document.getElementById('cv-fdc-trend');
  cvFdc.addEventListener('click', e => {
    const i = chartHitTest(cvFdc, e);
    if (i >= 0) { state.selected = i; renderDash(); }
  });

  cvC.addEventListener('click', e => {
    const i = chartHitTest(cvC, e);
    if (i >= 0) { state.selected = i; renderDash(); }
  });
  document.getElementById('viol-log').addEventListener('click', e => {
    const i = e.target.closest('[data-vidx]')?.dataset.vidx;
    if (i !== undefined) { state.selected = +i; renderDash(); }
  });
  bindCasePanel();
}

/* ---------------- 케이스 학습 ---------------- */
function startCase(c) {
  state.activeCase = c;
  state.quizDone = 0;
  state.resolved = false;
  state.paramKey = c.anomaly.param || PROC_DATA_DEFS[state.procId].params[0].key;
  state.selected = -1;
  regen(true);
  renderSidebar();
}

function casePanelHTML() {
  const c = state.activeCase;
  if (state.resolved) {
    return `<div class="case-panel" style="border-color:var(--ok)">
      <h3 style="color:var(--ok)">✅ 조치 완료 — ${c.title}</h3>
      <p class="story">${c.resolution}</p>
      <p class="story" style="color:var(--ok)">새로 수집된 데이터가 관리 상태로 돌아왔는지 위 관리도에서 확인하세요.
        Rule 위반이 사라지고 Cpk가 회복되었다면 조치가 유효한 것입니다.</p>
    </div>`;
  }
  const qIdx = state.quizDone;
  const q = c.questions[qIdx];
  return `<div class="case-panel">
    <h3>🎓 케이스: ${c.title}</h3>
    <p class="story">${c.story}</p>
    ${q ? `
      <div class="quiz-q">
        <div class="q">Q${qIdx + 1}/${c.questions.length}. ${q.q}</div>
        <div class="quiz-opts">${q.opts.map((o, i) =>
          `<button class="quiz-opt" data-qopt="${i}">${String.fromCharCode(65 + i)}. ${o}</button>`).join('')}</div>
        <div class="quiz-expl" id="quiz-expl"></div>
      </div>` : ''}
    <div style="font-size:12px;color:var(--dim)">
      ${c.questions.map((_, i) => i < state.quizDone ? '✅' : '⬜').join(' ')}
      ${state.quizDone >= c.questions.length ? ' — 모든 진단 완료! 상단 <b style="color:var(--ok)">조치 완료</b> 버튼을 눌러 데이터를 재수집하세요.' : ''}
    </div>
    <div style="font-size:12px;color:var(--info);margin-top:8px">
      📡 힌트: 아래 <b>FDC 장비 센서 트렌드</b>에서 계측 이상과 같은 시점에 움직인 센서를 찾아보세요 —
      결과(계측)와 원인(장비 상태)의 상관이 근본원인 분석의 출발점입니다.
    </div>
  </div>`;
}

function bindCasePanel() {
  const c = state.activeCase;
  if (!c || state.resolved) return;
  const q = c.questions[state.quizDone];
  if (!q) return;
  document.querySelectorAll('[data-qopt]').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = +btn.dataset.qopt;
      const expl = document.getElementById('quiz-expl');
      if (i === q.answer) {
        btn.classList.add('correct');
        expl.className = 'quiz-expl show';
        expl.style.borderLeftColor = 'var(--ok)';
        expl.innerHTML = `<b style="color:var(--ok)">정답!</b> ${q.expl}<br><button class="btn small primary" id="quiz-next" style="margin-top:8px">다음 →</button>`;
        document.getElementById('quiz-next').addEventListener('click', () => {
          state.quizDone++;
          renderToolbar(); renderDash();
        });
      } else {
        btn.classList.add('wrong');
        expl.className = 'quiz-expl show';
        expl.style.borderLeftColor = 'var(--bad)';
        expl.innerHTML = `<b style="color:var(--bad)">오답.</b> 데이터를 다시 관찰해보세요. ${q.hint || ''}`;
      }
    });
  });
}

/* ---------------- 초기화 ---------------- */
renderSidebar();
regen(false);
window.addEventListener('resize', () => renderDash());
