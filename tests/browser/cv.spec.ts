import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const versions = [
  { lang: 'en', path: '/Online-CV/', download: 'Download CV' },
  { lang: 'es', path: '/Online-CV/es/', download: 'Descargar CV' },
  { lang: 'fr', path: '/Online-CV/fr/', download: 'Télécharger le CV' },
];
for (const version of versions) {
  test(`${version.lang}: direct loading, accessibility and matching PDF`, async ({
    page,
    request,
  }) => {
    await page.goto(version.path);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', version.lang);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Sergio García Díaz',
    );
    await expect(
      page.getByRole('link', { name: version.download }),
    ).toHaveAttribute('href', `/Online-CV/cv-${version.lang}.pdf`);
    const pdf = await request.get(`/Online-CV/cv-${version.lang}.pdf`);
    expect(pdf.ok()).toBeTruthy();
    expect((await pdf.body()).subarray(0, 5).toString()).toBe('%PDF-');
    const accessibility = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(accessibility.violations).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBeTruthy();
  });
}
test('Language navigation works with JavaScript disabled ', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/Online-CV/');
  await page.getByRole('link', { name: 'Français', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await context.close();
});
