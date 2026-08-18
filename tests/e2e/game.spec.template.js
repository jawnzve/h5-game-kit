// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');
const { setupMockBridge } = require('./helpers/mock-bridge');
const { injectIM } = require('./helpers/mock-im');
const { createLogCollector } = require('./helpers/capture-logs');

/** 替换为实际 gameId */
const GAME_ID = '{{gameId}}';

/** App 版入口（含功能逻辑）；E2E 不测 Preview 预览页 */
const APP_PATH = process.env.H5_APP_PATH || `/games/${GAME_ID}/app-index.html?e2e=1`;

/** fixture 真源：自研后端仓（默认同级 `h5-game-server`；可用 H5_SERVER_ROOT 覆盖） */
const SERVER_ROOT =
  process.env.H5_SERVER_ROOT || path.join(__dirname, '..', '..', '..', 'h5-game-server');
const FIXTURES = path.join(SERVER_ROOT, 'docs', 'games', GAME_ID, 'fixtures');

test.describe(`${GAME_ID} L2`, () => {
  test('S01-V1: 进页展示（示例 — 需替换 fixture 与断言）', async ({ page }, testInfo) => {
    const logs = createLogCollector(page);
    await setupMockBridge(page, { userId: 10001 });
    await page.goto(APP_PATH);

    // const fixture = require(path.join(FIXTURES, 'poison-selection.json'));
    // await injectIM(page, fixture);

    // await expect(page.getByTestId('stage-ready')).toBeVisible();
    test.skip(true, '替换 fixture、userId 与断言后删除 skip');

    await logs.flush(testInfo);
  });
});
