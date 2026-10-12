/**
 * Playwright reporter helper: write tests/e2e/last-run.json for AI.
 * Require from game.spec afterEach or custom fixture.
 */
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'last-run.json');

function createLogCollector(page) {
  const log = {
    startedAt: new Date().toISOString(),
    console: [],
    pageErrors: [],
    failedRequests: [],
    gameLog: null,
  };

  page.on('console', (msg) => {
    log.console.push({ type: msg.type(), text: msg.text() });
  });

  page.on('pageerror', (err) => {
    log.pageErrors.push({ message: err.message, stack: err.stack });
  });

  page.on('requestfailed', (req) => {
    log.failedRequests.push({
      url: req.url(),
      failure: req.failure()?.errorText,
    });
  });

  return {
    async flush(testInfo) {
      try {
        log.gameLog = await page.evaluate(() => window.__gameLog || null);
      } catch (_) {
        log.gameLog = null;
      }
      log.finishedAt = new Date().toISOString();
      log.testTitle = testInfo.title;
      log.status = testInfo.status;
      log.errors = (testInfo.errors || []).map((e) => String(e.message || e));

      fs.mkdirSync(path.dirname(OUT), { recursive: true });
      try {
        fs.writeFileSync(OUT, JSON.stringify(log, null, 2), 'utf8');
      } catch {
        /* Windows 下 last-run.json 偶发被占用，不把已通过的用例判失败 */
      }
    },
  };
}

module.exports = { createLogCollector, OUT_PATH: OUT };
