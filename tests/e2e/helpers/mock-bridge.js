/**
 * Playwright helper: mock App bridge (token, room, userId).
 * API 对齐 hybirdapp-plugin.js（Promise 风格）。
 */
async function setupMockBridge(page, options = {}) {
  const {
    userId = 10001,
    token = 'e2e-test-token',
    roomId = 102119,
    roomCode = 80056521,
    roomName = 'e2e-room',
  } = options;

  await page.addInitScript(
    ({ userId, token, roomId, roomCode, roomName }) => {
      window.__e2eMock = { userId, token, roomId, roomCode, roomName };

      const bridge = window.hybirdapp || {};
      window.hybirdapp = bridge;

      bridge.inApp = bridge.inApp || (() => false);

      bridge.getToken = () =>
        Promise.resolve({
          errno: 0,
          data: { token: window.__e2eMock.token },
        });

      bridge.voiceRoomInfo = () =>
        Promise.resolve({
          errno: 0,
          data: {
            roomId: window.__e2eMock.roomId,
            roomCode: window.__e2eMock.roomCode,
            name: window.__e2eMock.roomName,
          },
        });

      bridge.im = (back) => {
        if (typeof back !== 'function') return;
        window.__e2eImCallback = back;
        window.im = (data) => {
          if (window.__testIMHandler) {
            window.__testIMHandler(typeof data === 'string' ? data : JSON.stringify(data));
          }
          back(data);
        };
      };

      bridge.onAIGameDevice = (back) => {
        if (typeof back !== 'function') return;
        window.onAIGameDevice = (data) => back(data);
      };

      const noop = () => {};
      bridge.willEnterForeground = (back) => {
        window.willEnterForeground = typeof back === 'function' ? back : noop;
      };
      bridge.didEnterBackground = (back) => {
        window.didEnterBackground = typeof back === 'function' ? back : noop;
      };
      bridge.willResume = (back) => {
        window.willResume = typeof back === 'function' ? back : noop;
      };
      bridge.willPause = (back) => {
        window.willPause = typeof back === 'function' ? back : noop;
      };

      bridge.finish = bridge.finish || (() => Promise.resolve({ errno: 0 }));

      window.__e2eGetUserId = () => window.__e2eMock.userId;
    },
    { userId, token, roomId, roomCode, roomName }
  );
}

module.exports = { setupMockBridge };
