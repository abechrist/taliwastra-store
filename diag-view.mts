import { chromium } from 'playwright-core';

async function inspect(width: number, height: number) {
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width, height } });
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));

  await page.goto('https://taliwastra-store.vercel.app/id', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => {
    await fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: 'b1c2d3e4-0001-4000-8000-000000000001', quantity: 2 }) });
  });
  await page.goto('https://taliwastra-store.vercel.app/id/cart', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const info = await page.evaluate(() => {
    const out: any = {};
    out.viewport = window.innerWidth;
    out.hScroll = document.documentElement.scrollWidth > document.documentElement.clientWidth;
    const grid = document.querySelector('main .grid');
    if (grid) out.cols = Array.from(grid.children).map((c) => Math.round(c.getBoundingClientRect().width));
    // Find the summary box = the one containing "Ringkasan Pesanan"
    const h3 = Array.from(document.querySelectorAll('h3')).find((h) => h.textContent?.includes('Ringkasan'));
    const summary = h3?.closest('.linen-card');
    if (summary) {
      out.summaryRect = { w: Math.round(summary.getBoundingClientRect().width), h: Math.round(summary.getBoundingClientRect().height) };
      out.summaryStyles = Array.from(summary.querySelectorAll('*')).filter((el) => {
        const s = getComputedStyle(el);
        const t = (el as HTMLElement).innerText;
        return s.display !== 'none' && t && t.trim().length > 0;
      }).slice(0, 20).map((el) => {
        const s = getComputedStyle(el);
        return { cls: (el as HTMLElement).className, text: (el as HTMLElement).innerText.trim().replace(/\s+/g, ' ').slice(0, 35), color: s.color, bg: s.backgroundColor, fontSize: s.fontSize };
      });
    }
    return out;
  });
  console.log(`\n===== VIEWPORT ${width}x${height} =====`);
  console.log(JSON.stringify(info, null, 2));
  console.log('CONSOLE ERRORS:', JSON.stringify(errors));
  await browser.close();
}

async function main() {
  await inspect(1366, 768);
  await inspect(390, 844);
}

main().catch((e) => { console.error('FAILED:', e); process.exit(1); });