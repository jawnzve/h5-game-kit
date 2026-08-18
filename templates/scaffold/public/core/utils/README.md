# HTTP / 埋点 / 工具

| 文件 | 说明 |
|------|------|
| `http-config.js` | 按 hostname 选 apiBase / signKey |
| `track-log.js` | 埋点；EventTime 优先 `ServerTimeSync.now()` |
| `server-time-sync.js` | 服务器时间 |
| `game-sync.js` | sync 调度壳（通用时机） |
| `throttle-utils.js` | 防抖 |
| `../vendor/` | MD5、base64（**已移除** zepto / 旧 `http-request.js`） |

业务 REST：**`src/services/game-api.ts`**（`fetch` + body `token`|`userId` + `_sign`）。

TS：`src/lib/game-sync.ts`、`app-lifecycle.ts`、`server-time.ts`；`src/services/track.ts`（埋点薄封装，待接入）。
