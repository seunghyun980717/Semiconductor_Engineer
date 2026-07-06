// 모바일 뷰포트(iPhone 14 크기)로 배포 사이트 검증
import puppeteer from 'puppeteer-core';
import path from 'path';
const OUT = process.argv[2];
const BASE = 'https://seunghyun980717.github.io/Semiconductor_Engineer';
const PAGES = [
  { name: 'm-home', url: '/' },
  { name: 'm-proc', url: '/process.html?id=photo' },
  { name: 'm-hbm', url: '/hbm.html' },
  { name: 'm-spotfire', url: '/spotfire.html' },
];
const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  headless: 'new',
  args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});
let bad = 0;
for (const p of PAGES) {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');
  const errors = [];
  page.on('pageerror', e => errors.push(String(e).slice(0, 200)));
  try {
    await page.goto(BASE + p.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await new Promise(r => setTimeout(r, 4000));
    // 가로 스크롤 발생 여부 (모바일 레이아웃 깨짐 신호)
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    await page.screenshot({ path: path.join(OUT, p.name + '.png') });
    console.log((errors.length || overflow > 2 ? '⚠️' : '✅'), p.name,
      'hOverflow:' + overflow + 'px', errors.length ? '오류: ' + errors[0] : '');
    if (errors.length) bad++;
  } catch (e) { console.log('❌', p.name, e.message.slice(0, 120)); bad++; }
  await page.close();
}
await browser.close();
console.log(bad === 0 ? 'MOBILE OK' : 'ISSUES: ' + bad);
