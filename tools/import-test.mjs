// 모든 공정 모듈을 실제 import하여 계약 구조를 런타임 검증
// (build3D는 DOM 캔버스가 필요하므로 콘텐츠/시그니처만 검증)
import { pathToFileURL } from 'url';
import path from 'path';

const ROOT = process.argv[2];
const IDS = ['wafer', 'oxidation', 'photo', 'etch', 'deposition', 'metal', 'eds', 'packaging'];

// makeLabel/makeWafer 등이 모듈 톱레벨에서 호출될 경우 대비한 최소 DOM 스텁
globalThis.document = {
  createElement: () => ({
    getContext: () => new Proxy({}, { get: () => () => ({ width: 10 }) }),
    width: 0, height: 0,
  }),
};
globalThis.window = { devicePixelRatio: 1 };

let bad = 0;
const need = (cond, id, msg) => { if (!cond) { console.log('FAIL', id, msg); bad++; } };

for (const id of IDS) {
  const url = pathToFileURL(path.join(ROOT, 'js', 'processes', id + '.js')).href;
  try {
    const m = await import(url);
    need(Array.isArray(m.camera?.pos) && m.camera.pos.length === 3, id, 'camera.pos');
    const c = m.content;
    need(typeof c?.overview === 'string' && c.overview.length > 100, id, 'overview');
    need(Array.isArray(c?.steps) && c.steps.length >= 4, id, 'steps>=4');
    need(c?.steps?.every(s => s.name && s.desc), id, 'step name/desc');
    need(Array.isArray(c?.equipment) && c.equipment.length >= 3 && c.equipment.every(e => e.name && e.role), id, 'equipment');
    need(Array.isArray(c?.parameters) && c.parameters.length >= 4 && c.parameters.every(p => p.name && p.typical && p.monitor), id, 'parameters');
    need(Array.isArray(c?.defects) && c.defects.length >= 4 && c.defects.every(d => d.name && d.signature && d.cause && d.action), id, 'defects');
    need(typeof m.build3D === 'function', id, 'build3D fn');
    console.log('OK', id, '- steps:' + c.steps.length, 'equip:' + c.equipment.length, 'params:' + c.parameters.length, 'defects:' + c.defects.length);
  } catch (e) {
    console.log('IMPORT-ERROR', id, e.message);
    bad++;
  }
}

// cases.js 구조 검증
const cu = pathToFileURL(path.join(ROOT, 'js', 'spotfire', 'cases.js')).href;
const { CASES } = await import(cu);
const dg = await import(pathToFileURL(path.join(ROOT, 'js', 'spotfire', 'datagen.js')).href);
for (const [proc, list] of Object.entries(CASES)) {
  need(dg.PROC_DATA_DEFS[proc], proc, 'unknown proc in CASES');
  for (const cse of list) {
    need(cse.id && cse.title && cse.story && cse.resolution, proc, 'case fields ' + cse.id);
    need(cse.anomaly?.type, proc, 'anomaly.type ' + cse.id);
    const keys = new Set(dg.PROC_DATA_DEFS[proc].params.map(p => p.key));
    need(!cse.anomaly.param || keys.has(cse.anomaly.param), proc, 'bad param ' + cse.id + ':' + cse.anomaly.param);
    need(Array.isArray(cse.questions) && cse.questions.length >= 2, proc, 'questions ' + cse.id);
    for (const q of cse.questions) {
      need(q.opts?.length >= 3 && Number.isInteger(q.answer) && q.answer < q.opts.length && q.expl, proc, 'question shape in ' + cse.id);
    }
    // 이상 주입이 실제로 SPC 신호를 만드는지
    const ds = dg.generate(proc, { seed: 11, anomaly: cse.anomaly });
    const pkey = cse.anomaly.param || dg.PROC_DATA_DEFS[proc].params[0].key;
    const vals = ds.wafers.map(w => w.values[pkey]);
    const def = dg.PROC_DATA_DEFS[proc].params.find(p => p.key === pkey);
    const st = dg.spcStats(vals, def);
    const viol = dg.weRules(vals, st.mean, st.sigma);
    if (viol.length < 3) console.log('WEAK-SIGNAL', proc, cse.id, 'violations=' + viol.length, '(mag 상향 필요할 수 있음)');
  }
  console.log('OK cases:', proc, list.length + '개');
}
console.log(bad === 0 ? 'ALL RUNTIME CHECKS PASSED' : 'PROBLEMS: ' + bad);
