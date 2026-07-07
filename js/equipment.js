// 설비 분석실 (Machine Engineering) — E10 타임라인 + 이벤트 로그 + OCAP 트러블슈팅 + 계측 카탈로그
import { renderNav, PROCESSES, getProcess } from './data/processes-index.js';
import { TOOLS, ALARM_CODES, E10_STATES, genE10Timeline, availability, genShiftLog, alarmPareto, OCAP_CASES } from './spotfire/eqlog.js';
import { FDC_DEFS, fdcTrace, generate } from './spotfire/datagen.js';
import { traceChart, pareto } from './spotfire/charts.js';
import { METROLOGY } from './data/metrology.js';

renderNav('equipment');

const state = {
  mode: 'log',            // 'log' | 'metro'
  toolId: new URLSearchParams(location.search).get('tool') || 'ETC-03',
  seed: 42,
  activeCase: null,
  quizDone: 0,
  resolved: false,
  logRows: [],
  streamed: 0,            // 스트리밍된 행 수
  streamTimer: null,
};

/* ---------------- 사이드바 ---------------- */
function renderSidebar() {
  const tool = TOOLS.find(t => t.id === state.toolId);
  document.getElementById('eq-tools').innerHTML = TOOLS.map(t => {
    const proc = getProcess(t.proc);
    return `<button class="sf-proc-btn ${t.id === state.toolId ? 'active' : ''}" data-tool="${t.id}" style="--pc:${proc.color}">
      <span class="dot" style="background:${proc.color}"></span>
      <span style="min-width:0"><b style="font-family:var(--mono);font-size:11.5px">${t.id}</b><br>
      <span style="font-size:11.5px;color:var(--dim)">${t.name}</span></span>
    </button>`;
  }).join('');

  document.getElementById('eq-cases').innerHTML = OCAP_CASES.map(c => `
    <button class="sf-proc-btn ${state.activeCase?.id === c.id ? 'active' : ''}" data-case="${c.id}" style="--pc:var(--warn)">
      <span class="dot" style="background:var(--warn)"></span>
      <span style="font-size:12px">${c.title}<br><span style="font-family:var(--mono);font-size:10.5px;color:var(--dim)">${c.toolId}</span></span>
    </button>`).join('');
}
document.getElementById('eq-tools').addEventListener('click', e => {
  const id = e.target.closest('[data-tool]')?.dataset.tool;
  if (!id) return;
  state.toolId = id; state.activeCase = null; state.resolved = false;
  regen(); renderSidebar();
});
document.getElementById('eq-cases').addEventListener('click', e => {
  const id = e.target.closest('[data-case]')?.dataset.case;
  if (!id) return;
  const c = OCAP_CASES.find(x => x.id === id);
  state.activeCase = c; state.quizDone = 0; state.resolved = false;
  state.toolId = c.toolId;
  regen(); renderSidebar();
});

/* ---------------- 모드 전환 ---------------- */
document.getElementById('mode-log').addEventListener('click', () => setMode('log'));
document.getElementById('mode-metro').addEventListener('click', () => setMode('metro'));
function setMode(m) {
  state.mode = m;
  document.getElementById('side-log').style.display = m === 'log' ? '' : 'none';
  document.getElementById('side-metro').style.display = m === 'metro' ? '' : 'none';
  document.getElementById('mode-log').classList.toggle('primary', m === 'log');
  document.getElementById('mode-metro').classList.toggle('primary', m === 'metro');
  document.getElementById('eq-regen').style.display = m === 'log' ? '' : 'none';
  m === 'log' ? regen(false) : renderMetro();
}

/* ---------------- 로그 대시보드 ---------------- */
function regen(newSeed = true) {
  if (newSeed) state.seed = Math.floor(Math.random() * 100000);
  const tool = TOOLS.find(t => t.id === state.toolId);
  const scenario = state.activeCase && !state.resolved ? state.activeCase.scenario : null;
  state.logRows = genShiftLog(tool, { seed: state.seed, scenario });
  state.streamed = 0;
  renderLogDash();
}

function renderLogDash() {
  const tool = TOOLS.find(t => t.id === state.toolId);
  const proc = getProcess(tool.proc);
  const scenarioOn = state.activeCase && !state.resolved;
  const e10 = genE10Timeline(state.seed, { scenario: scenarioOn });
  const avail = availability(e10);
  const par = alarmPareto(state.logRows);
  const warns = state.logRows.filter(r => r.type === 'WARN').length;
  const alarms = state.logRows.filter(r => r.type === 'ALARM' || r.type === 'INTERLOCK').length;
  const sensors = FDC_DEFS[tool.proc] || [];

  document.documentElement.style.setProperty('--pc', proc.color);
  document.getElementById('eq-title').innerHTML =
    `<span style="font-family:var(--mono)">${tool.id}</span> ${tool.name}
     <span style="color:var(--dim);font-size:12px;font-weight:400">설비 데이터 로그 · SECS/GEM 이벤트${scenarioOn ? ' — 🎓 OCAP 진행 중' : ''}</span>`;
  document.getElementById('eq-reset').style.display =
    state.activeCase && state.quizDone >= state.activeCase.questions.length && !state.resolved ? '' : 'none';

  const dash = document.getElementById('eq-dash');
  dash.innerHTML = `
    ${state.activeCase ? casePanelHTML() : ''}
    <div class="kpi-row">
      <div class="kpi"><div class="k-label">가동률 (Availability)</div>
        <div class="k-value ${avail >= 90 ? 'ok' : avail >= 80 ? 'warn' : 'bad'}">${avail.toFixed(1)}%</div>
        <div class="k-sub">SEMI E10 · UP시간/24h</div></div>
      <div class="kpi"><div class="k-label">경고 (Warning)</div>
        <div class="k-value ${warns > 8 ? 'warn' : ''}">${warns}건</div><div class="k-sub">금일 교대 누적</div></div>
      <div class="kpi"><div class="k-label">알람·인터락</div>
        <div class="k-value ${alarms ? 'bad' : 'ok'}">${alarms}건</div><div class="k-sub">설비 정지 유발</div></div>
      <div class="kpi"><div class="k-label">처리 웨이퍼</div>
        <div class="k-value">${state.logRows.filter(r => r.text.includes('WAFER_END')).length * 8 + 76}</div>
        <div class="k-sub">4 LOT × 25매</div></div>
    </div>

    <div class="sf-viz span12" style="min-height:auto">
      <div class="viz-head"><b>🕐 SEMI E10 설비 상태 타임라인 (24h)</b>
        <span class="viz-info">00:00 → 24:00 · UDT(빨강)가 비계획 정지</span></div>
      <div class="e10-bar" id="e10-bar"></div>
      <div class="e10-legend">${Object.entries(E10_STATES).map(([k, v]) =>
        `<span><i class="sw" style="background:${v.color}"></i>${k} ${v.name}</span>`).join('')}</div>
    </div>

    <div class="sf-viz span7" style="min-height:420px">
      <div class="viz-head"><b>📟 설비 이벤트 로그 (SECS/GEM)</b>
        <span class="viz-info">TOOL=${tool.id} CH=${tool.chamber} · 실시간 스트리밍</span></div>
      <div class="log-viewer" id="log-viewer"></div>
    </div>

    <div style="grid-column: span 5; display:flex; flex-direction:column; gap:13px; min-width:0">
      <div class="sf-viz" style="min-height:200px">
        <div class="viz-head"><b>📊 알람 파레토</b><span class="viz-info">코드별 발생 횟수</span></div>
        <canvas id="cv-pareto"></canvas>
      </div>
      <div class="sf-viz" style="min-height:200px">
        <div class="viz-head"><b>📉 핵심 센서 트레이스</b>
          <select id="eq-sensor" style="background:var(--panel);color:var(--text);border:1px solid var(--border);border-radius:8px;padding:3px 8px;font-size:11.5px;font-family:inherit">
            ${sensors.map((s, i) => `<option value="${i}">${s.name}</option>`).join('')}
          </select></div>
        <canvas id="cv-eq-trace"></canvas>
        <p style="font-size:11px;color:var(--dim);margin-top:6px">
          💡 이 설비의 계측 결과 데이터는 <a href="spotfire.html?proc=${tool.proc}" style="color:${proc.color};font-weight:700">Spotfire 분석실 → ${proc.title}</a>에서 SPC로 확인합니다.
        </p>
      </div>
    </div>`;

  // E10 바
  document.getElementById('e10-bar').innerHTML = e10.map(s =>
    `<i style="width:${(s.dur / 1440 * 100).toFixed(2)}%;background:${E10_STATES[s.state].color}"
        title="${s.state} ${E10_STATES[s.state].name} · ${Math.floor(s.start / 60)}:${String(s.start % 60).padStart(2, '0')}부터 ${s.dur}분"></i>`).join('');

  // 센서 트레이스 (시나리오 진행도 반영: 마지막 웨이퍼 기준)
  const drawTrace = () => {
    const si = +document.getElementById('eq-sensor').value || 0;
    const sensor = sensors[si];
    if (!sensor) return;
    const ds = generate(tool.proc, {
      seed: state.seed,
      anomaly: scenarioOn ? { param: null, type: 'drift', at: 0.3, mag: 3 } : null,
    });
    traceChart(document.getElementById('cv-eq-trace'), fdcTrace(ds, 180, sensor), { sensor, color: proc.color });
  };
  requestAnimationFrame(() => {
    pareto(document.getElementById('cv-pareto'), par);
    drawTrace();
    streamLog();
  });
  document.getElementById('eq-sensor').addEventListener('change', drawTrace);
  bindCasePanel();
}

/* ---------------- 로그 스트리밍 연출 ---------------- */
function streamLog() {
  clearInterval(state.streamTimer);
  const viewer = document.getElementById('log-viewer');
  if (!viewer) return;
  viewer.innerHTML = '';
  state.streamed = 0;
  const cls = { EVENT: 'lg-evt', STEP: 'lg-dim', TRACE: 'lg-dim', WARN: 'lg-warn', ALARM: 'lg-alarm', INTERLOCK: 'lg-alarm', STATE: 'lg-state' };
  const batch = 6;
  state.streamTimer = setInterval(() => {
    for (let i = 0; i < batch && state.streamed < state.logRows.length; i++) {
      const r = state.logRows[state.streamed++];
      const div = document.createElement('div');
      div.className = 'lg-row' + (r.hl ? ' hl' : '');
      div.innerHTML = `<span class="lg-ts">${r.time}</span> <span class="lg-tool">[${r.type.padEnd(9)}]</span> <span class="${cls[r.type] || ''}">${escapeHtml(r.text)}</span>`;
      viewer.appendChild(div);
    }
    viewer.scrollTop = viewer.scrollHeight;
    if (state.streamed >= state.logRows.length) clearInterval(state.streamTimer);
  }, 120);
}
function escapeHtml(s) { return s.replace(/</g, '&lt;'); }

/* ---------------- OCAP 케이스 패널 ---------------- */
function casePanelHTML() {
  const c = state.activeCase;
  if (state.resolved) {
    return `<div class="case-panel" style="border-color:var(--ok)">
      <h3 style="color:var(--ok)">✅ 조치 완료 — ${c.title}</h3>
      <p class="story">${c.resolution}</p>
      <p class="story" style="color:var(--ok)">새 교대 로그에서 경고 빈도와 알람이 사라졌는지, 가동률이 회복됐는지 확인하세요.</p>
    </div>`;
  }
  const q = c.questions[state.quizDone];
  return `<div class="case-panel">
    <h3>🎓 OCAP: ${c.title}</h3>
    <p class="story">${c.story}</p>
    ${q ? `<div class="quiz-q">
      <div class="q">Q${state.quizDone + 1}/${c.questions.length}. ${q.q}</div>
      <div class="quiz-opts">${q.opts.map((o, i) =>
        `<button class="quiz-opt" data-qopt="${i}">${String.fromCharCode(65 + i)}. ${o}</button>`).join('')}</div>
      <div class="quiz-expl" id="quiz-expl"></div>
    </div>` : ''}
    <div style="font-size:12px;color:var(--dim)">
      ${c.questions.map((_, i) => i < state.quizDone ? '✅' : '⬜').join(' ')}
      ${state.quizDone >= c.questions.length ? ' — 진단 완료! 상단 <b style="color:var(--ok)">조치 완료</b> 버튼으로 정비 후 로그를 재수집하세요.' : ''}
    </div>
    <div style="font-size:12px;color:var(--info);margin-top:8px">
      📟 힌트: 로그 뷰어에서 <b>붉게 강조된 행</b>(경고·알람·상태 전이)과 TRACE의 SP↔ACT 편차(⚠ DEV)를 시간순으로 따라가세요.
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
        expl.innerHTML = `<b style="color:var(--ok)">정답!</b> ${q.expl}<br><button class="btn small primary" id="quiz-next" style="margin-top:8px">다음 →</button>`;
        document.getElementById('quiz-next').addEventListener('click', () => { state.quizDone++; renderLogDash(); });
      } else {
        btn.classList.add('wrong');
        expl.className = 'quiz-expl show';
        expl.style.borderLeftColor = 'var(--bad)';
        expl.innerHTML = `<b style="color:var(--bad)">오답.</b> 로그를 다시 관찰해보세요. ${q.hint || ''}`;
      }
    });
  });
}

document.getElementById('eq-regen').addEventListener('click', () => regen(true));
document.getElementById('eq-reset').addEventListener('click', () => { state.resolved = true; regen(true); });

/* ---------------- 계측 장비 카탈로그 ---------------- */
function renderMetro() {
  clearInterval(state.streamTimer);
  document.getElementById('eq-title').innerHTML =
    `🔬 계측(Metrology) 장비 카탈로그 <span style="color:var(--dim);font-size:12px;font-weight:400">공정 결과를 데이터로 바꾸는 장비들 — Spotfire 분석의 원천</span>`;
  document.getElementById('eq-reset').style.display = 'none';
  const dash = document.getElementById('eq-dash');
  dash.innerHTML = `<div class="sf-viz span12" style="min-height:auto;background:linear-gradient(160deg, rgba(0,113,227,.06), var(--panel) 50%)">
      <div class="viz-head"><b>📐 계측 데이터의 흐름</b></div>
      <p style="font-size:13px;color:var(--muted);margin:0">
        공정 장비가 웨이퍼를 가공하면 → <b>계측 장비가 결과를 측정</b>(CD, 두께, 오버레이, 결함 등)
        → 측정값이 MES/EES로 전송 → <b>Spotfire SPC 차트</b>로 이상 감지 → 이상 시 <b>설비 FDC 로그</b>와 대조해 원인 설비 특정(OCAP).
        Machine Engineer는 이 전체 루프에서 "설비 쪽 원인"을 책임집니다.
      </p>
    </div>` +
    METROLOGY.map(m => `
    <div class="sf-viz span6" style="min-height:auto">
      <div class="metro-card" style="border:none;box-shadow:none;padding:4px;margin:0">
        <b>${m.name}</b><span class="vendor">${m.vendor}</span>
        <p><b style="color:var(--text)">원리:</b> ${m.principle}</p>
        <p><b style="color:var(--text)">측정 항목:</b> ${m.measures}</p>
        <p><b style="color:var(--text)">사용 시점:</b> ${m.when}</p>
        ${m.spec ? `<p style="color:var(--dim)">📋 ${m.spec}</p>` : ''}
        <p class="m-links">↳ 데이터 연결: ${m.links.map(l =>
          `<a href="spotfire.html?proc=${l.proc}" style="color:var(--info);font-weight:600">${l.label}</a>`).join(' · ')}
          · 샘플링: ${m.sampling}</p>
      </div>
    </div>`).join('');
}

/* ---------------- 초기화 ---------------- */
renderSidebar();
setMode('log');
