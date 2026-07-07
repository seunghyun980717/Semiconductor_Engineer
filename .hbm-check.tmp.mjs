import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({
  executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  headless: 'new', args: ['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader'],
  defaultViewport: { width: 1440, height: 900 },
});
const pg = await b.newPage();
const errors = [];
pg.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 150)); });
pg.on('pageerror', e => errors.push('PAGEERROR: ' + String(e).slice(0, 150)));
await pg.goto('http://localhost:8765/hbm.html', { waitUntil: 'domcontentloaded', timeout: 60000 });
await new Promise(r => setTimeout(r, 5000));
await pg.screenshot({ path: process.argv[2] });
console.log(errors.filter(e => !e.includes('favicon')).length ? '오류: ' + errors[0] : 'hbm ✅ clean');
await b.close();
