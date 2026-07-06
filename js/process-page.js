// 공정 상세 페이지 — ?id=<공정키> 로 모듈을 동적 로드해 3D + 콘텐츠 렌더
import { PROCESSES, getProcess, renderNav } from './data/processes-index.js';
import { initScene } from './lib/three-core.js';

const params = new URLSearchParams(location.search);
const id = params.get('id') || 'wafer';
const proc = getProcess(id);

renderNav(id);
document.title = `${proc.title} — 메모리 반도체 공정 아카데미`;
document.documentElement.style.setProperty('--pc', proc.color);

// ---- 공정 스트립 ----
const strip = document.getElementById('proc-strip');
strip.innerHTML = PROCESSES.map(p =>
  `<a href="process.html?id=${p.id}" class="${p.id === id ? 'active' : ''}" style="--pc:${p.color}">${p.num}. ${p.title}</a>`
).join('') + `<a href="hbm.html" style="--pc:#ff5a2a">★ HBM 심화</a>`;

// ---- HUD ----
document.getElementById('hud-title').innerHTML =
  `${proc.title}<small>${proc.en}</small>`;
document.querySelector('#hud-chip .dot').style.background = proc.color;

// ---- 모듈 로드 ----
const veil = document.getElementById('veil');
let mod, rig3d, ctx;

try {
  mod = await import(`./processes/${id}.js`);
} catch (e) {
  veil.innerHTML = `<span style="color:var(--bad)">모듈 로드 실패: ${e.message}</span>`;
  throw e;
}
const { content } = mod;

// ---- 3D 초기화 ----
ctx = initScene(document.getElementById('viewport'), {
  cameraPos: mod.camera?.pos || [7, 5, 9],
  target: mod.camera?.target || [0, 1.2, 0],
});
rig3d = mod.build3D(ctx);
ctx.scene.add(rig3d.group);
ctx.setPickRoot(rig3d.group);
if (rig3d.tick) ctx.onTick(rig3d.tick);
veil.classList.add('hide');

// ---- 부품 툴팁 ----
const tip = document.getElementById('part-tip');
const vpWrap = document.querySelector('.viewport-wrap');
ctx.onHover((hit, e) => {
  if (!hit) { tip.style.display = 'none'; return; }
  const { name, desc } = hit.userData.pick;
  tip.innerHTML = `<b>${name}</b><span>${desc}</span>`;
  tip.style.display = 'block';
  const r = vpWrap.getBoundingClientRect();
  const x = Math.min(e.clientX - r.left + 14, r.width - 270);
  const y = Math.min(e.clientY - r.top + 14, r.height - 90);
  tip.style.left = x + 'px';
  tip.style.top = y + 'px';
});
ctx.onClick(hit => {
  if (!hit) return;
  const { name, desc } = hit.userData.pick;
  document.getElementById('hud-chip-text').textContent = `${name} — ${desc}`;
});

// ---- 스텝 플레이어 ----
const steps = content.steps || [];
let stepIdx = 0, playing = false, playTimer = null;
const spTitle = document.getElementById('sp-title');
const spDesc = document.getElementById('sp-desc');
const dots = document.getElementById('step-dots');

function renderStep() {
  const s = steps[stepIdx];
  if (!s) return;
  spTitle.textContent = `STEP ${stepIdx + 1}/${steps.length} · ${s.name}`;
  spDesc.textContent = s.desc;
  dots.innerHTML = steps.map((_, i) =>
    `<i class="${i < stepIdx ? 'done' : i === stepIdx ? 'on' : ''}" data-i="${i}"></i>`
  ).join('');
  rig3d.setStep?.(stepIdx);
  if (s.camera) ctx.flyTo(s.camera.pos, s.camera.target || [0, 1.2, 0]);
  // 단계 탭이 열려있으면 강조 동기화
  document.querySelectorAll('.step-row').forEach((el, i) =>
    el.style.borderColor = i === stepIdx ? proc.color : 'var(--border)');
}
dots.addEventListener('click', e => {
  const i = e.target.dataset?.i;
  if (i !== undefined) { stepIdx = +i; renderStep(); }
});
document.getElementById('sp-prev').onclick = () => { stepIdx = Math.max(0, stepIdx - 1); renderStep(); };
document.getElementById('sp-next').onclick = () => { stepIdx = Math.min(steps.length - 1, stepIdx + 1); renderStep(); };
const playBtn = document.getElementById('sp-play');
playBtn.onclick = () => {
  playing = !playing;
  playBtn.textContent = playing ? '⏸' : '▶';
  clearInterval(playTimer);
  if (playing) playTimer = setInterval(() => {
    stepIdx = (stepIdx + 1) % steps.length;
    renderStep();
  }, 4000);
};
renderStep();

// ---- 정보 탭 ----
const tabBody = document.getElementById('tab-body');
const renderers = {
  overview() {
    return `<h4>공정 개요</h4><p>${content.overview}</p>
      ${(content.keyPoints || []).length ? `<h4>핵심 포인트</h4><ul>${content.keyPoints.map(k => `<li>${k}</li>`).join('')}</ul>` : ''}
      ${content.hbmNote ? `<h4>🔶 HBM/DRAM 관점</h4><p>${content.hbmNote}</p>` : ''}`;
  },
  steps() {
    return `<h4>공정 진행 단계 <span style="font-size:11px;color:var(--dim)">(클릭하면 3D가 해당 단계로 이동)</span></h4>` +
      steps.map((s, i) => `
        <div class="equip-item step-row" data-step="${i}" style="cursor:pointer">
          <b style="color:${proc.color}">STEP ${i + 1}. ${s.name}</b>
          <p>${s.desc}</p>
        </div>`).join('');
  },
  equipment() {
    return `<h4>주요 장비</h4>` + content.equipment.map(eq => `
      <div class="equip-item">
        <b>${eq.name}</b><span class="vendor">${eq.vendor || ''}</span>
        <p>${eq.role}</p>
        ${eq.spec ? `<p style="color:var(--dim);font-size:12px">📋 ${eq.spec}</p>` : ''}
      </div>`).join('');
  },
  parameters() {
    return `<h4>핵심 공정 파라미터</h4>
      <table class="spec-table">
        <tr><th>파라미터</th><th>대표값</th><th>모니터링</th></tr>
        ${content.parameters.map(p => `<tr><td>${p.name}</td><td>${p.typical}</td><td>${p.monitor}</td></tr>`).join('')}
      </table>
      <p style="font-size:12px;color:var(--dim)">💡 이 파라미터들은 <a href="spotfire.html?proc=${id}" style="color:${proc.color};font-weight:700">Spotfire 분석실</a>에서 실제 계측 데이터로 모니터링해볼 수 있습니다.</p>`;
  },
  defects() {
    return `<h4>대표 불량 & 트러블슈팅</h4>` + content.defects.map(d => `
      <div class="defect-item">
        <b>⚠ ${d.name}</b>
        <div class="row"><span class="k">데이터 시그니처</span><span class="v">${d.signature}</span></div>
        <div class="row"><span class="k">근본 원인</span><span class="v">${d.cause}</span></div>
        <div class="row"><span class="k">조치</span><span class="v">${d.action}</span></div>
      </div>`).join('') +
      `<p style="margin-top:14px"><a class="btn small" href="spotfire.html?proc=${id}">📊 Spotfire에서 이 공정 이상 사례 실습하기</a></p>`;
  },
};
function showTab(key) {
  document.querySelectorAll('#tabs button').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === key));
  tabBody.innerHTML = renderers[key]();
  if (key === 'steps') {
    tabBody.querySelectorAll('.step-row').forEach(el =>
      el.addEventListener('click', () => { stepIdx = +el.dataset.step; renderStep(); }));
  }
}
document.getElementById('tabs').addEventListener('click', e => {
  if (e.target.dataset?.tab) showTab(e.target.dataset.tab);
});
showTab('overview');
