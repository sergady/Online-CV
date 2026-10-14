import { chromium } from '@playwright/test';
import { serveBuild } from './static-server.mjs';
const server = await serveBuild();
let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage();
  for (const lang of ['en', 'es', 'fr']) {
    const path = `/Online-CV/${lang === 'en' ? '' : `${lang}/`}`;
    await page.goto(server.url + path, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({
      path: `dist/cv-${lang}.pdf`,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
    });
    console.log(`Generated cv-${lang}.pdf`);
  }
} finally {
  if (browser) await browser.close();
  await server.close();
}
