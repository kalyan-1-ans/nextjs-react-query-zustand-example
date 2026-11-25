import { expect, test, type Page } from '@playwright/test';
async function login(page: Page) {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Log In', exact: true }).click();
  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByRole('heading', { name: 'Welcome, John!' })).toBeVisible();
}
test('authentication, issue CRUD, sprint creation and refresh persistence', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/project/1');
  await expect(page).toHaveURL('/login');
  await login(page);
  await page.getByText('HorizonSync', { exact: true }).click();
  await expect(page).toHaveURL('/project/1');
  await page.getByRole('button', { name: 'Create Issue', exact: true }).click();
  let dialog = page.getByRole('dialog');
  await dialog.getByLabel('Summary', { exact: true }).fill('Browser test issue');
  await dialog.getByLabel('Assignee', { exact: true }).selectOption('1');
  await dialog.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(dialog).toBeHidden();
  await page.getByRole('button', { name: 'Browser test issue', exact: true }).click();
  dialog = page.getByRole('dialog');
  await dialog.getByLabel('Summary', { exact: true }).fill('Edited browser issue');
  await dialog.getByLabel('Sprint', { exact: true }).selectOption('2');
  await dialog.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(dialog).toBeHidden();
  await page.getByRole('button', { name: 'Active Sprint', exact: true }).click();
  await expect(page).toHaveURL('/project/1/active');
  await page.getByRole('button', { name: 'Edited browser issue', exact: true }).click();
  dialog = page.getByRole('dialog');
  await dialog.getByLabel('Status', { exact: true }).selectOption('DONE');
  await dialog.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('heading', { name: 'Done' })).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Edited browser issue', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Edited browser issue', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Edited browser issue', exact: true })).toHaveCount(
    0,
  );
  await page.getByRole('button', { name: 'Complete Sprint', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Sprint cannot be completed!' })).toBeVisible();
  await page.getByRole('button', { name: 'Ok, Got it' }).click();
  await page.getByRole('button', { name: 'Issues', exact: true }).click();
  await page.getByRole('button', { name: 'Create Sprint', exact: true }).click();
  dialog = page.getByRole('dialog');
  await dialog.getByLabel('Name', { exact: true }).fill('Browser sprint');
  await dialog.getByLabel('Goals', { exact: true }).fill('Verify sprint creation');
  await dialog.getByLabel('Start date').fill('2026-11-01');
  await dialog.getByLabel('End date').fill('2026-11-15');
  await dialog.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('heading', { name: 'Browser sprint', exact: true })).toBeVisible();
  await page.screenshot({ path: '/tmp/sprint-board-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Open profile menu' }).click();
  await page.getByRole('menuitem', { name: 'Profile', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Your name' })).toHaveValue('John Doe');
  await page.getByRole('textbox', { name: 'Your name' }).fill('John Updated');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByText('John Updated', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Open profile menu' }).click();
  await page.getByRole('menuitem', { name: 'Logout', exact: true }).click();
  await expect(page).toHaveURL('/login');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Log In', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});
test('shows invalid login errors', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Password', { exact: true }).fill('invalid-password');
  await page.getByRole('button', { name: 'Log In', exact: true }).click();
  await expect(page.getByText('Invalid email or password', { exact: true }).first()).toBeVisible();
  await expect(page).toHaveURL('/login');
});

test('mobile layouts keep primary controls usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
  await page.getByText('HorizonSync', { exact: true }).click();
  await page.getByRole('button', { name: 'Create Issue', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByLabel('Summary', { exact: true })).toBeVisible();
  await expect(dialog).toHaveJSProperty(
    'scrollWidth',
    await dialog.evaluate(element => element.clientWidth),
  );
  await page.screenshot({ path: '/tmp/sprint-board-mobile.png', fullPage: true });
});

test('board dragging, ordering, notifications and sprint lifecycle', async ({ page }) => {
  await login(page);
  await page.getByRole('button', { name: 'Notifications', exact: true }).click();
  const notification = page.getByRole('button', { name: 'HO1028 has been assigned to you.' });
  await notification.click();
  await expect(notification.locator('div.text-gray-500')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByText('HorizonSync', { exact: true }).click();
  await page.getByRole('button', { name: 'Start Sprint', exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'Sprint cannot be started!' })).toBeVisible();
  await page.getByRole('button', { name: 'Ok, Got it' }).click();

  const backlog = page.getByRole('heading', { name: 'Backlog', exact: true }).locator('../..');
  const first = backlog.getByRole('button', { name: 'Drag issue HO1022', exact: true });
  const third = backlog.getByRole('button', { name: 'Drag issue HO1041', exact: true });
  await first.scrollIntoViewIfNeeded();
  await third.scrollIntoViewIfNeeded();
  const from = await first.boundingBox();
  const to = await third.boundingBox();
  if (!from || !to) throw new Error('Missing backlog drag targets');
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 20 });
  await page.mouse.up();
  await expect(backlog.getByRole('row').first()).toContainText(
    'Update user profile page for mobile optimization',
  );
  await page.reload();
  await expect(backlog.getByRole('row').first()).toContainText(
    'Update user profile page for mobile optimization',
  );

  await page.getByRole('button', { name: 'Active Sprint', exact: true }).click();
  await expect(page).toHaveURL('/project/1/active');
  await expect(page.getByRole('heading', { name: /^Done/ })).toBeVisible();
  const handle = page.getByRole('button', { name: 'Drag issue HO1001', exact: true });
  const done = page.getByRole('heading', { name: /^Done/ }).locator('..');
  await handle.scrollIntoViewIfNeeded();
  const source = await handle.boundingBox();
  const destination = await done.boundingBox();
  if (!source || !destination) throw new Error('Missing board drag targets');
  await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
  await page.mouse.down();
  await page.mouse.move(destination.x + destination.width / 2, destination.y + 100, { steps: 20 });
  await page.mouse.up();
  await expect(
    done.getByRole('button', { name: 'Implement authentication module', exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    done.getByRole('button', { name: 'Implement authentication module', exact: true }),
  ).toBeVisible();
  for (const summary of ['Develop user profile page', 'Set up cloud storage integration']) {
    await page.getByRole('button', { name: summary, exact: true }).click();
    await page.getByRole('dialog').getByLabel('Status', { exact: true }).selectOption('DONE');
    await page.getByRole('dialog').getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
  }
  await page.getByRole('button', { name: 'Complete Sprint', exact: true }).click();
  await expect(page).toHaveURL('/project/1');
  await expect(page.getByRole('button', { name: 'Active Sprint', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Start Sprint', exact: true }).first().click();
  await expect(page.getByRole('button', { name: 'Active Sprint', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Active Sprint', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Hori-FY2025-3', exact: true })).toBeVisible();
});
