// Tes browser sungguhan (dijalankan di GitHub Actions dengan dependensi asli).
// Memastikan peta tetap bisa digulir saat panel topik terbuka, dan pembaca materi bisa digulir.
import { chromium, webkit, devices } from 'playwright';

const URL = process.env.E2E_URL ?? 'http://localhost:4173/waypoint/?demo';
const hasil = [];
const cek = (nama, ok, detail) => { hasil.push({ nama, ok, detail }); console.log(`${ok ? 'LULUS' : 'GAGAL'}  ${nama}  ${detail}`); };

async function desktop(browserType, label) {
  const b = await browserType.launch();
  const p = await (await b.newContext({ viewport: { width: 1366, height: 860 } })).newPage();
  await p.goto(URL);
  await p.waitForSelector('[data-topic="python"]');
  await p.click('[data-topic="python"]');
  await p.waitForSelector('.sheet .sheet-title');
  await p.waitForTimeout(900);

  // 1. Peta di belakang panel bisa digulir dengan roda mouse.
  const y0 = await p.evaluate(() => scrollY);
  await p.mouse.move(250, 500);
  await p.mouse.wheel(0, 600);
  await p.waitForTimeout(600);
  const y1 = await p.evaluate(() => scrollY);
  cek(`${label}: peta bisa digulir saat panel terbuka`, y1 > y0, `scrollY ${y0} -> ${y1}`);

  // 1b. Topik lain di peta bisa diklik saat panel terbuka (panel non-modal).
  await p.evaluate(() => scrollTo(0, 0));
  await p.waitForTimeout(300);
  await p.click('[data-topic="git-github"]', { timeout: 5000 }).catch(() => {});
  await p.waitForTimeout(800);
  const judul = await p.locator('.sheet .sheet-title').textContent().catch(() => '');
  cek(`${label}: topik lain bisa diklik saat panel terbuka`, judul === 'Git & GitHub', `judul panel: ${judul}`);
  await p.click('[data-topic="python"]', { timeout: 5000 }).catch(() => {});
  await p.waitForTimeout(800);

  // 2. Pembaca materi bisa digulir dengan roda mouse.
  await p.click('.book-card');
  await p.click('.r-cover .r-btn.primary');
  await p.waitForTimeout(600);
  await p.mouse.move(683, 500);
  await p.mouse.wheel(0, 700);
  await p.waitForTimeout(600);
  const r = await p.evaluate(() => document.querySelector('.r-scroll')?.scrollTop ?? -1);
  cek(`${label}: pembaca bisa digulir`, r > 0, `scrollTop ${r}`);

  // 3. Menutup pembaca mengembalikan panel.
  await p.click('.r-back');
  await p.waitForTimeout(800);
  const panel = await p.locator('.sheet .sheet-title').count();
  cek(`${label}: panel kembali setelah pembaca ditutup`, panel === 1, `panel ${panel}`);
  await b.close();
}

async function ponselSentuh() {
  // Sentuhan sungguhan lewat CDP (hanya Chromium yang mendukung).
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 13'] });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  const usap = async (x, y0, y1) => {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0 }] });
    for (let i = 1; i <= 12; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y0 + (y1 - y0) * i / 12 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  };
  await p.goto(URL);
  await p.waitForSelector('[data-topic="python"]');
  await p.click('[data-topic="python"]');
  await p.waitForSelector('.sheet .sheet-title');
  await p.waitForTimeout(900);
  await p.click('.book-card');
  await p.click('.r-cover .r-btn.primary');
  await p.waitForTimeout(600);
  await usap(200, 550, 150);
  await p.waitForTimeout(600);
  const r = await p.evaluate(() => document.querySelector('.r-scroll')?.scrollTop ?? -1);
  cek('ponsel (sentuh): pembaca bisa digulir', r > 0, `scrollTop ${r}`);
  await b.close();
}

await desktop(chromium, 'chromium');
await desktop(webkit, 'webkit');
await ponselSentuh();
const gagal = hasil.filter(h => !h.ok).length;
console.log(`\n${hasil.length - gagal} lulus, ${gagal} gagal`);
process.exit(gagal ? 1 : 0);
