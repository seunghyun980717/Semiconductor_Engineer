import puppeteer from 'puppeteer-core';
import path from 'path';
const OUT = process.argv[2];
const PAGES = [
  { name: 'lt-home', url: '/index.html' },
  { name: 'lt-equipment', url: '/equipment.html' },
  { name: 'lt-spotfire', url: '/spotfire.html?proc=etch' },
  { name: 'lt-proc', url: '/process.html?id=etch' },
  { name: 'lt-hbm', url: '/hbm.html' },
];
const b = await puppeteer.launch({
  executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  headless: 'new', args: ['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader'],
  defaultViewport: { width: 1440, height: 900 },
});
let bad = 0;
for (const p of PAGES) {
  const pg = await b.newPage();
  const errors = [];
  pg.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
  pg.on('pageerror', e => errors.push('PAGEERROR: ' + String(e).slice(0, 200)));
  try {
    await pg.goto('http://localhost:8765' + p.url, { waitUntil: 'domcontentloaded', timeout: 40000 });
    await new Promise(r => setTimeout(r, p.name === 'lt-equipment' ? 6000 : 4000));
    await pg.screenshot({ path: path.join(OUT, p.name + '.png') });
    const fe = errors.filter(e => !e.includes('favicon'));
    console.log(fe.length ? '❌ ' + p.name + ' ' + fe[0] : '✅ ' + p.name);
    if (fe.length) bad++;
  } catch (e) { console.log('❌', p.name, e.message.slice(0, 100)); bad++; }
  await pg.close();
}
await b.close();
console.log(bad ? 'ISSUES ' + bad : 'ALL CLEAN');
