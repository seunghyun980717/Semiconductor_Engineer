const fs = require('fs');
const path = require('path');
const ROOT = process.argv[2];

const kit = fs.readFileSync(path.join(ROOT, 'js/lib/equip-kit.js'), 'utf8');
const kitExports = new Set([...kit.matchAll(/export (?:const|function) (\w+)/g)].map(m => m[1]));
console.log('equip-kit exports (' + kitExports.size + '):', [...kitExports].join(', '));

let bad = 0;
const procDir = path.join(ROOT, 'js/processes');
for (const f of fs.readdirSync(procDir)) {
  const src = fs.readFileSync(path.join(procDir, f), 'utf8');
  const imports = [...src.matchAll(/import\s+(?:\*\s+as\s+\w+|\{([^}]+)\})\s+from\s+'([^']+)'/g)];
  for (const im of imports) {
    const p = im[2];
    if (p !== 'three' && p !== '../lib/equip-kit.js') { console.log('BAD-PATH', f, p); bad++; }
    if (p === '../lib/equip-kit.js' && im[1]) {
      for (const name of im[1].split(',').map(s => s.trim().split(/\s+as\s+/)[0]).filter(Boolean)) {
        if (!kitExports.has(name)) { console.log('MISSING-FN', f, name); bad++; }
      }
    }
  }
  for (const req of ['export const camera', 'export const content', 'export function build3D']) {
    if (!src.includes(req)) { console.log('MISSING-EXPORT', f, req); bad++; }
  }
  // setStep/tick 반환 확인 (간이)
  if (!/setStep\s*\(/.test(src)) { console.log('NO-SETSTEP', f); bad++; }
  if (!/tick\s*\(/.test(src)) { console.log('NO-TICK', f); bad++; }
}

// cases.js: param key가 datagen 정의와 일치하는지
const dg = fs.readFileSync(path.join(ROOT, 'js/spotfire/datagen.js'), 'utf8');
const paramsByProc = {};
const procBlocks = [...dg.matchAll(/(\w+):\s*\{\s*params:\s*\[([\s\S]*?)\]\s*,?\s*(?:hasBinMap: true,?\s*)?\}/g)];
for (const b of procBlocks) {
  paramsByProc[b[1]] = new Set([...b[2].matchAll(/key:\s*'(\w+)'/g)].map(m => m[1]));
}
console.log('datagen procs:', Object.keys(paramsByProc).join(', '));

const cs = fs.readFileSync(path.join(ROOT, 'js/spotfire/cases.js'), 'utf8');
// 공정 블록별로 대략 파싱: "  procId: [" 형태
const caseProcs = [...cs.matchAll(/^  (\w+): \[/gm)].map(m => m[1]);
console.log('cases procs:', caseProcs.join(', '));
// 각 anomaly param 검사 (공정 블록 구간 나눠서)
const lines = cs.split('\n');
let curProc = null;
lines.forEach((ln, i) => {
  const pm = ln.match(/^  (\w+): \[/);
  if (pm) curProc = pm[1];
  const am = ln.match(/anomaly:\s*\{[^}]*param:\s*'(\w+)'/);
  if (am && curProc && paramsByProc[curProc] && !paramsByProc[curProc].has(am[1])) {
    console.log('BAD-PARAM', curProc, 'line', i + 1, am[1]); bad++;
  }
  const bp = ln.match(/binPattern:\s*'(\w+)'/);
  if (bp && curProc && !['eds', 'hbm'].includes(curProc)) {
    console.log('BAD-BINPATTERN', curProc, 'line', i + 1); bad++;
  }
});

console.log(bad === 0 ? 'ALL CHECKS PASSED' : 'PROBLEMS: ' + bad);
