// 헤드리스 Edge로 전 페이지 실구동 검증: 콘솔 오류 수집 + 스크린샷
import puppeteer from 'puppeteer-core';
import path from 'path';

const OUT = process.argv[2]; // 스크린샷 저장 폴더
const BASE = 'http://localhost:8765';
const PAGES = [
  { name: 'home', url: '/index.html', extraWait: 2500 },
  { name: 'proc-wafer', url: '/process.html?id=wafer' },
  { name: 'proc-oxidation', url: '/process.html?id=oxidation' },
  { name: 'proc-photo', url: '/process.html?id=photo' },
  { name: 'proc-etch', url: '/process.html?id=etch' },
  { name: 'proc-deposition', url: '/process.html?id=deposition' },
  { name: 'proc-metal', url: '/process.html?id=metal' },
  { name: 'proc-eds', url: '/process.html?id=eds' },
  { name: 'proc-packaging', url: '/process.html?id=packaging' },
  { name: 'hbm', url: '/hbm.html', extraWait: 2500 },
  { name: 'spotfire', url: '/spotfire.html' },
  { name: 'spotfire-hbm', url: '/spotfire.html?proc=hbm' },
];

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  headless: 'new',
  args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--window-size=1440,900'],
  defaultViewport: { width: 1440, height: 900 },
});

let totalErrors = 0;
for (const p of PAGES) {
  const page = await browser.newPage();
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text().slice(0, 300)); });
  page.on('pageerror', err => errors.push('PAGEERROR: ' + String(err).slice(0, 300)));
  try {
    await page.goto(BASE + p.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await new Promise(r => setTimeout(r, (p.extraWait || 1800) + 2500));
    const hasCanvas = await page.evaluate(() => !!document.querySelector('canvas'));
    if (!p.url.includes('spotfire') || hasCanvas) { /* 3D 페이지는 캔버스 필수 */ }
    if (!hasCanvas && !p.url.includes('spotfire')) errors.push('PAGEERROR: WebGL 캔버스 없음');
    await page.screenshot({ path: path.join(OUT, p.name + '.png') });
    const filtered = errors.filter(e => !e.includes('favicon'));
    if (filtered.length) {
      console.log('❌', p.name, '오류 ' + filtered.length + '건:');
      filtered.slice(0, 5).forEach(e => console.log('   ', e));
      totalErrors += filtered.length;
    } else {
      console.log('✅', p.name, 'clean');
    }
  } catch (e) {
    console.log('❌', p.name, '로드 실패:', e.message.slice(0, 200));
    totalErrors++;
  }
  await page.close();
}
await browser.close();
console.log(totalErrors === 0 ? '=== 전 페이지 콘솔 클린 ===' : '=== 총 ' + totalErrors + '건 오류 ===');
