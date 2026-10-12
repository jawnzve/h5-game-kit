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
    inApp = true,
    /**
     * Loong 1.7.10 新桥（身份 / RTC 音频 / 麦克风）：
     * - 'none'（默认）：不注入，等价于旧 plugin
     * - 'silent'：注入但永不回调 —— 真实的低版本 App 配新 plugin，走前端超时判定
     * - 'loong1710'：正常应答
     */
    newBridge = 'none',
    roomRole = 'member',
    /** queryMicState 是否成功（模拟非席位用户失败） */
    micSeated = true,
    micEnabled = true,
  } = options;

  await page.addInitScript(
    ({ userId, token, roomId, roomCode, roomName, inApp, newBridge, roomRole, micSeated, micEnabled }) => {
      window.__e2eMock = { userId, token, roomId, roomCode, roomName };

      const bridge = window.hybirdapp || {};
      window.hybirdapp = bridge;

      bridge.inApp = () => inApp;

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

      bridge.finish = () => {
        window.__e2eFinishCalled = true;
        return Promise.resolve({ errno: 0 });
      };

      window.__e2eGetUserId = () => window.__e2eMock.userId;

      if (newBridge !== 'none') {
        /** 走桥的音频调用流水，供断言「高版本不再用 H5 播放」 */
        window.__e2eRtcAudio = [];
        window.__e2eMicState = { enabled: micEnabled ? 1 : 0, voiceMode: 0 };

        /* 低版本 App 收到未知 api 不回调：Promise 永不 settle */
        const silent = () => new Promise(() => {});
        const isSilent = newBridge === 'silent';

        const ok = (data) => Promise.resolve({ errno: 0, data });
        const fail = (error) => Promise.reject({ errno: 1, error });

        bridge.queryRoleInRoom = (rid, roomType) =>
          isSilent ? silent() : ok({ roomId: String(rid), roomType, role: roomRole });

        bridge.playRtcAudio = (rid, roomType, musicId, url, loop, publish, volume) => {
          if (isSilent) return silent();
          window.__e2eRtcAudio.push({ op: 'play', musicId, url, loop, publish, volume });
          return ok({ roomId: String(rid), roomType, musicId });
        };

        bridge.finishRtcAudio = (rid, roomType, musicId) => {
          if (isSilent) return silent();
          window.__e2eRtcAudio.push({ op: 'finish', musicId });
          return ok({ roomId: String(rid), roomType, musicId });
        };

        bridge.setRtcAudioVolume = (rid, roomType, musicId, volume) => {
          if (isSilent) return silent();
          window.__e2eRtcAudio.push({ op: 'volume', musicId, volume });
          return ok({ roomId: String(rid), roomType, musicId });
        };

        bridge.queryMicState = (rid, roomType) => {
          if (isSilent) return silent();
          if (!micSeated) return fail('not seated');
          return ok({ roomId: String(rid), roomType, ...window.__e2eMicState });
        };

        bridge.switchMicState = (rid, roomType, enabled, voiceMode) => {
          if (isSilent) return silent();
          if (!micSeated) return fail('not seated');
          window.__e2eMicState = { enabled, voiceMode: voiceMode || 0 };
          return ok({ roomId: String(rid), roomType, ...window.__e2eMicState });
        };
      }
    },
    { userId, token, roomId, roomCode, roomName, inApp, newBridge, roomRole, micSeated, micEnabled }
  );
}

module.exports = { setupMockBridge };
