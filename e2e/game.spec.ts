import { test, expect, type Page } from '@playwright/test';
import { freshGame } from '../src/game/rules';
import type { GameState } from '../src/game/types';
const key = 'CapacitorStorage.pocket-town-v2';
async function ready(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-ready', 'true');
}
async function saved(page: Page): Promise<GameState> {
  return page.evaluate(
    (storageKey) => JSON.parse(localStorage.getItem(storageKey)!),
    key,
  ) as Promise<GameState>;
}
test('opening move, purchase, persistence and restart form a complete loop', async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await ready(page);
  await expect(page.getByRole('gridcell')).toHaveCount(64);
  await page.getByRole('gridcell', { name: 'Row 8, column 7, empty', exact: true }).click();
  await expect(page.locator('#bricks')).toHaveText('3');
  await page.getByRole('button', { name: 'Build bakery' }).click();
  await expect(page.locator('#building-count')).toHaveText('2 / 7 places');
  await expect(page.locator('#bricks')).toHaveText('0');
  await expect(page.getByRole('button', { name: 'Undo', exact: true })).toBeDisabled();
  await expect.poll(async () => (await saved(page)).built).toEqual(['bakery']);
  await page.reload();
  await expect(page.locator('#building-count')).toHaveText('2 / 7 places');
  await page.getByRole('button', { name: 'New puzzle', exact: true }).click();
  await page.locator('#confirm-restart').click();
  await expect(page.locator('#score')).toHaveText('0');
  await expect(page.locator('#best')).toHaveText('120');
  await expect(page.locator('#building-count')).toHaveText('2 / 7 places');
  await expect(page.locator('#reward-container')).toBeHidden();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  expect(overflow).toBe(false);
  expect(errors).toEqual([]);
  await page.screenshot({ path: info.outputPath('town-and-puzzle.png'), fullPage: true });
});
test('undo restores the opening, rotation and hints are usable, help closes', async ({ page }) => {
  await ready(page);
  await page.locator('[data-row="7"][data-col="6"]').click();
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(page.locator('#score')).toHaveText('0');
  await expect(page.locator('#bricks')).toHaveText('0');
  await page.getByRole('button', { name: 'Rotate', exact: true }).click();
  await page.getByRole('button', { name: 'Hint', exact: true }).click();
  await expect(page.locator('#move-hint')).toContainText('Try row');
  await expect(page.locator('.hint-cell')).toHaveCount(2);
  await page.locator('#help').click();
  await expect(page.getByRole('dialog', { name: 'How to play' })).toBeVisible();
  await page.locator('#lets-play').click();
  await expect(page.locator('#help-dialog')).not.toBeVisible();
});
test('corrupted primary data recovers from backup and announces the recovery', async ({ page }) => {
  const state = freshGame();
  state.built = ['bakery'];
  state.bricks = 4;
  await page.addInitScript(
    ({ storageKey, snapshot }) => {
      localStorage.setItem(storageKey, '{bad');
      localStorage.setItem(storageKey + '-backup', JSON.stringify(snapshot));
    },
    { storageKey: key, snapshot: state },
  );
  await ready(page);
  await expect(page.locator('#recovery-notice')).toContainText('backup');
  await expect(page.locator('#bricks')).toHaveText('4');
  await expect(page.locator('#building-count')).toHaveText('2 / 7 places');
});
test('full board shows game over and allows another puzzle', async ({ page }) => {
  const state = freshGame();
  state.board = state.board.map((row) => row.map(() => 'mint'));
  state.tutorial = false;
  await page.addInitScript(
    ({ storageKey, snapshot }) => localStorage.setItem(storageKey, JSON.stringify(snapshot)),
    { storageKey: key, snapshot: state },
  );
  await ready(page);
  await expect(page.locator('#game-over')).toBeVisible();
  await page.locator('#restart-overlay').click();
  await expect(page.locator('#game-over')).toBeHidden();
});
test('mouse dragging places a piece at the visible preview', async ({ page }, info) => {
  test.skip(
    info.project.name !== 'desktop',
    'Desktop pointer coordinates; phone tap flow is covered separately.',
  );
  await ready(page);
  const tray = await page.locator('[data-index="0"]').boundingBox();
  const first = await page.locator('[data-row="7"][data-col="6"]').boundingBox();
  const second = await page.locator('[data-row="7"][data-col="7"]').boundingBox();
  if (!tray || !first || !second) throw new Error('Missing drag target');
  await page.mouse.move(tray.x + tray.width / 2, tray.y + tray.height / 2);
  await page.mouse.down();
  await page.mouse.move((first.x + second.x + second.width) / 2, first.y + first.height / 2 + 16, {
    steps: 10,
  });
  await expect(page.locator('.preview')).toHaveCount(2);
  await page.mouse.up();
  await expect(page.locator('#score')).toHaveText('120');
});
