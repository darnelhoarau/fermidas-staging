import { expect, test } from '@playwright/test';

test('homepage Get Started button goes to digital access', async ({ page }) => {
  await page.goto('/');

  const getStarted = page.getByRole('link', { name: 'Get Started' }).first();

  await expect(getStarted).toHaveAttribute(
    'href',
    '/digital/auth/signin?callbackUrl=%2Fdigital'
  );

  await getStarted.click();

  await expect(page).toHaveURL(/\/digital\/auth\/signin/);
});
