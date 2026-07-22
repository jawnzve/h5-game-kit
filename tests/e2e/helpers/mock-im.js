/**
 * Playwright helper: inject IM into H5 e2e handler.
 * Requires app-index.html?e2e=1 and window.__testIMHandler
 */
async function injectIM(page, fixtureObjectOrString) {
  const payload =
    typeof fixtureObjectOrString === 'string'
      ? fixtureObjectOrString
      : JSON.stringify(fixtureObjectOrString);

  await page.waitForFunction(() => typeof window.__testIMHandler === 'function', null, {
    timeout: 15_000,
  });

  await page.evaluate((json) => {
    window.__testIMHandler(json);
  }, payload);
}

module.exports = { injectIM };
