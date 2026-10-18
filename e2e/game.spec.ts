import { test, expect, type Page } from '@playwright/test';
import { freshGame } from '../src/game/rules';
import type { GameState } from '../src/game/types';
const key = 'CapacitorStorage.pocket-town-v2';
async function ready(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#home-screen')).toBeVisible();
  await expect(page.locator('#game-screen')).toBeHidden();
}
async function play(page: Page): Promise<void> {
  await page.locator('#play').click();
  await expect(page.locator('#game-screen')).toBeVisible();
  await expect(page.locator('#home-screen')).toBeHidden();
}
async function home(page: Page): Promise<void> {
  await page.locator('#go-home').click();
  await expect(page.locator('#home-screen')).toBeVisible();
}
async function saved(page: Page): Promise<GameState> {
  return page.evaluate(
    (storageKey) => JSON.parse(localStorage.getItem(storageKey)!),
    key,
  ) as Promise<GameState>;
}
async function noHorizontalOverflow(page: Page): Promise<void> {
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
}
test('home, puzzle, purchase and reload form a complete loop', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await ready(page);
  await expect(page.getByRole('gridcell')).toHaveCount(0);
  await noHorizontalOverflow(page);
  await page.screenshot({ path: info.outputPath('home-screen.png'), fullPage: true });
  await play(page);
  await expect(page.locator('#puzzle-title')).toBeFocused();
  await expect(page.getByRole('gridcell')).toHaveCount(64);
  await expect(page.getByRole('button', { name: 'Build bakery' })).toHaveCount(0);
  await page.getByRole('gridcell', { name: 'Row 8, column 7, empty', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Undo', exact: true })).toBeEnabled();
  await expect(page.locator('#score')).toHaveText('120');
  await page.screenshot({ path: info.outputPath('game-screen.png'), fullPage: true });
  const tools = await page.locator('.puzzle-actions').boundingBox();
  expect(tools).not.toBeNull();
  expect(tools!.y + tools!.height).toBeLessThanOrEqual((page.viewportSize()?.height ?? 0) + 1);
  await noHorizontalOverflow(page);
  await home(page);
  await expect(page.locator('#home-title')).toBeFocused();
  await expect(page.locator('#bricks')).toHaveText('3');
  await expect(page.locator('#play')).toContainText('Continue puzzle');
  await page.getByRole('button', { name: 'Build bakery' }).click();
  await expect(page.locator('#building-count')).toHaveText('2 / 7 places');
  await expect(page.locator('#bricks')).toHaveText('0');
  await expect(page.locator('#undo')).toBeDisabled();
  await expect.poll(async () => (await saved(page)).built).toEqual(['bakery']);
  await page.screenshot({ path: info.outputPath('home-built.png'), fullPage: true });
  await page.reload();
  await expect(page.locator('#home-screen')).toBeVisible();
  await expect(page.locator('#building-count')).toHaveText('2 / 7 places');
  await play(page);
  await expect(page.locator('#score')).toHaveText('120');
  await page.locator('#pause-game').click();
  await page.getByRole('button', { name: 'New puzzle', exact: true }).click();
  await page.locator('#confirm-restart').click();
  await expect(page.locator('#score')).toHaveText('0');
  await expect(page.locator('#best')).toHaveText('120');
  await home(page);
  await expect(page.locator('#building-count')).toHaveText('2 / 7 places');
  await expect(page.locator('#reward-container')).toBeHidden();
  expect(errors).toEqual([]);
});
test('leaving and returning preserves the board and undo; browser Back and Forward work', async ({
  page,
}) => {
  await ready(page);
  await play(page);
  await page.locator('[data-row="7"][data-col="6"]').click();
  await expect(page.locator('#undo')).toBeEnabled();
  await expect.poll(async () => (await saved(page)).score).toBe(120);
  const snapshot = await saved(page);
  await page.locator('#pause-game').click();
  await page.goBack();
  await expect(page.locator('#home-screen')).toBeVisible();
  await expect(page.locator('#pause-dialog')).not.toBeVisible();
  expect(await saved(page)).toEqual(snapshot);
  await page.goForward();
  await expect(page.locator('#game-screen')).toBeVisible();
  await expect(page.locator('#score')).toHaveText('120');
  await expect(page.locator('#undo')).toBeEnabled();
  await page.locator('#undo').click();
  await expect(page.locator('#score')).toHaveText('0');
  await home(page);
  await expect(page.locator('#bricks')).toHaveText('0');
  await play(page);
  await expect(page.locator('#score')).toHaveText('0');
});
test('rotation, hints, pause, sound and help remain accessible', async ({ page }) => {
  await ready(page);
  await play(page);
  await page.getByRole('button', { name: 'Rotate', exact: true }).click();
  await page.getByRole('button', { name: 'Hint', exact: true }).click();
  await expect(page.locator('#move-hint')).toContainText('Try row');
  await expect(page.locator('.hint-cell')).toHaveCount(2);
  await page.locator('#pause-game').click();
  await expect(page.getByRole('dialog', { name: 'A little breather.' })).toBeVisible();
  await page.locator('#sound-game').click();
  await expect(page.locator('#sound-game')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#game-help').click();
  await expect(page.getByRole('dialog', { name: 'How to play' })).toBeVisible();
  await page.locator('#lets-play').click();
  await expect(page.locator('#help-dialog')).not.toBeVisible();
  await expect(page.locator('#pause-dialog')).toBeVisible();
  await page.locator('#resume-game').click();
  await expect(page.locator('#pause-dialog')).not.toBeVisible();
  await home(page);
  await expect(page.locator('#sound')).toHaveAttribute('aria-pressed', 'true');
});
test('canceling a restart preserves the current puzzle', async ({ page }) => {
  await ready(page);
  await play(page);
  await page.locator('[data-row="7"][data-col="6"]').click();
  await expect(page.locator('#undo')).toBeEnabled();
  await page.locator('#pause-game').click();
  await page.locator('#restart').click();
  await page.locator('#cancel-restart').click();
  await expect(page.locator('#score')).toHaveText('120');
  await expect(page.locator('#undo')).toBeEnabled();
  await expect(page.locator('#game-screen')).toBeVisible();
});
test('corrupted primary data recovers from backup on the home screen', async ({ page }) => {
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
test('full board can return home without silently resetting and start another puzzle', async ({
  page,
}) => {
  const state = freshGame();
  state.board = state.board.map((row) => row.map(() => 'mint'));
  state.tutorial = false;
  await page.addInitScript(
    ({ storageKey, snapshot }) => localStorage.setItem(storageKey, JSON.stringify(snapshot)),
    { storageKey: key, snapshot: state },
  );
  await ready(page);
  await expect(page.locator('#play')).toContainText('View last puzzle');
  await play(page);
  await expect(page.locator('#game-over')).toBeVisible();
  await page.locator('#game-over-home').click();
  await expect(page.locator('#home-screen')).toBeVisible();
  await play(page);
  await expect(page.locator('#game-over')).toBeVisible();
  await page.locator('#restart-overlay').click();
  await expect(page.locator('#game-over')).toBeHidden();
});
test('compact portrait and landscape keep the puzzle tools on screen', async ({ page }, info) => {
  test.skip(info.project.name !== 'small-phone', 'The dedicated compact viewport check.');
  for (const size of [
    { width: 320, height: 568 },
    { width: 740, height: 360 },
  ]) {
    await page.setViewportSize(size);
    await ready(page);
    await play(page);
    await noHorizontalOverflow(page);
    const tools = await page.locator('.puzzle-actions').boundingBox();
    expect(tools!.y + tools!.height).toBeLessThanOrEqual(size.height + 1);
    await page.screenshot({
      path: info.outputPath(`puzzle-${size.width}x${size.height}.png`),
      fullPage: true,
    });
  }
});
test('mouse dragging places a piece at the visible preview', async ({ page }, info) => {
  test.skip(
    info.project.name !== 'desktop',
    'Desktop pointer coordinates; phone tap flow is covered separately.',
  );
  await ready(page);
  await play(page);
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
