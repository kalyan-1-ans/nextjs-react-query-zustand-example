import { expect, test, type Locator, type Page } from '@playwright/test';

async function drag(page: Page, source: Locator, target: Locator) {
  await source.scrollIntoViewIfNeeded();
  const from = await source.boundingBox();
  const to = await target.boundingBox();
  if (!from || !to) throw new Error('Drag targets must be visible');
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(from.x + from.width / 2 + 12, from.y + from.height / 2, { steps: 3 });
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 20 });
  await page.mouse.up();
}

test('drags a card by its summary into an empty column and persists the change', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/login');
  await page.getByRole('button', { name: 'Log In', exact: true }).click();
  await expect(page).toHaveURL('/dashboard');
  await page.goto('/project/1/active');
  const done = page.getByRole('heading', { name: /^Done/ }).locator('..');
  await expect(done).toBeVisible();
  const summary = 'Implement authentication module';
  await drag(page, page.getByRole('button', { name: summary, exact: true }), done);
  await expect(done.getByRole('button', { name: summary, exact: true })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.reload();
  await expect(done.getByRole('button', { name: summary, exact: true })).toBeVisible();
});

test('drags the card body onto another card, reorders the column, and keeps click-to-edit', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/login');
  await page.getByRole('button', { name: 'Log In', exact: true }).click();
  await expect(page).toHaveURL('/dashboard');
  await page.goto('/project/1/active');
  const done = page.getByRole('heading', { name: /^Done/ }).locator('..');
  await expect(done).toBeVisible();
  const summary = 'Implement authentication module';
  const otherSummary = 'Develop user profile page';
  await drag(page, page.getByRole('article', { name: /^HO1001:/ }), done);
  await expect(done.getByRole('button', { name: summary, exact: true })).toBeVisible();
  await drag(
    page,
    page.getByRole('article', { name: /^HO1028:/ }),
    done.getByRole('article').first(),
  );
  await expect(done.getByRole('article').first()).toContainText(otherSummary);
  await drag(
    page,
    done.getByRole('button', { name: otherSummary, exact: true }),
    done.getByRole('article').last(),
  );
  await expect(done.getByRole('article').last()).toContainText(otherSummary);
  await page.reload();
  await expect(done.getByRole('article').last()).toContainText(otherSummary);
  await done.getByRole('button', { name: otherSummary, exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Update Issue' })).toBeVisible();
});

test('supports keyboard dragging and cancelling a drag', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Log In', exact: true }).click();
  await expect(page).toHaveURL('/dashboard');
  await page.goto('/project/1/active');
  const todo = page.getByRole('heading', { name: /^To Do/ }).locator('..');
  const progress = page.getByRole('heading', { name: /^In Progress/ }).locator('..');
  await expect(todo).toBeVisible();
  const handle = page.getByRole('button', { name: 'Drag issue HO1001', exact: true });
  await handle.focus();
  await page.keyboard.press('Space');
  await expect(handle).toHaveAttribute('aria-pressed', 'true');
  await expect(todo).toHaveClass(/bg-blue-100/);
  await page.keyboard.press('ArrowRight');
  await expect(progress).toHaveClass(/bg-blue-100/);
  await page.keyboard.press('Escape');
  await expect(handle).not.toHaveAttribute('aria-pressed', 'true');
  await expect(todo.getByRole('article', { name: /^HO1001:/ })).toBeVisible();
  await handle.focus();
  await page.keyboard.press('Space');
  await expect(handle).toHaveAttribute('aria-pressed', 'true');
  await expect(todo).toHaveClass(/bg-blue-100/);
  await page.keyboard.press('ArrowRight');
  await expect(progress).toHaveClass(/bg-blue-100/);
  await page.keyboard.press('Space');
  await expect(progress.getByRole('article', { name: /^HO1001:/ })).toBeVisible();
  await page.reload();
  await expect(progress.getByRole('article', { name: /^HO1001:/ })).toBeVisible();
});
